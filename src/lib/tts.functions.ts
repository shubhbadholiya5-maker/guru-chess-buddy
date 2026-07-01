import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TTS_URL = "https://ai.gateway.lovable.dev/v1/audio/speech";

/**
 * Server-side TTS wrapper around Lovable AI Gateway.
 * Returns base64-encoded mp3 for straightforward <audio> playback.
 */
export const speakText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { text: string; voice?: string; lang?: string }) =>
    z.object({
      text: z.string().min(1).max(4000),
      voice: z.string().max(30).optional(),
      lang: z.string().max(10).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const instructions = data.lang === "hi"
      ? "Speak in warm, natural Hindi like a friendly chess coach. Clear pronunciation, unhurried pace."
      : "Speak in a warm, encouraging Grandmaster-coach tone. Clear, unhurried, thoughtful.";

    const res = await fetch(TTS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: data.text,
        voice: data.voice ?? "alloy",
        response_format: "mp3",
        instructions,
      }),
    });

    if (res.status === 429) throw new Error("Rate limit — try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("TTS error", res.status, t);
      throw new Error("Voice synthesis failed");
    }

    const buf = new Uint8Array(await res.arrayBuffer());
    // Chunked base64 to avoid stack overflow on large buffers
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < buf.length; i += chunk) {
      binary += String.fromCharCode(...buf.subarray(i, i + chunk));
    }
    return { audioBase64: btoa(binary), mime: "audio/mpeg" };
  });
