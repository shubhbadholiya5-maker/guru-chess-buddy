import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

function languageInstruction(lang: string): string {
  if (lang === "hi") return "Always reply in conversational Hindi (Devanagari script).";
  if (lang === "hinglish") return "Always reply in Hinglish — friendly Hindi mixed with English chess terms, written in Latin script.";
  return "Always reply in clear, friendly English.";
}

function systemPrompt(rating: number, lang: string): string {
  return `You are Guru, a Grandmaster-level chess coach for players rated up to 2000. The student is rated ~${rating}.

Coaching rules:
- Be warm, motivating, like a real human trainer.
- Use the Socratic method: ask leading questions BEFORE giving the answer.
- Never just dump engine moves. Always explain the IDEA and the PLAN.
- Teach checks, captures, and threats; candidate moves; calculation; visualization.
- Keep responses SHORT (3–6 short paragraphs max). Use markdown with bold for key concepts.
- When discussing a position, mention concrete squares and pieces in algebraic notation.
- End with one short question that nudges the student to think further.

${languageInstruction(lang)}`;
}

async function callAI(messages: Array<{ role: string; content: string }>): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages }),
  });
  if (res.status === 429) throw new Error("Rate limit — try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted on this workspace.");
  if (!res.ok) {
    const t = await res.text();
    console.error("AI error:", res.status, t);
    throw new Error("AI request failed");
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export const coachChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { message: string; history: Array<{ role: "user" | "assistant"; content: string }>; fen?: string; lang?: string }) =>
    z
      .object({
        message: z.string().min(1).max(4000),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) })).max(40),
        fen: z.string().max(120).optional(),
        lang: z.string().max(20).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("rating, language").eq("id", userId).maybeSingle();
    const rating = profile?.rating ?? 800;
    const lang = data.lang ?? profile?.language ?? "en";
    const sys = systemPrompt(rating, lang);
    const userMsg = data.fen ? `Current position (FEN): ${data.fen}\n\n${data.message}` : data.message;
    const messages = [
      { role: "system", content: sys },
      ...data.history.slice(-20),
      { role: "user", content: userMsg },
    ];
    const reply = await callAI(messages);
    // persist
    await supabase.from("coach_messages").insert([
      { user_id: userId, role: "user", content: data.message },
      { user_id: userId, role: "assistant", content: reply },
    ]);
    return { reply };
  });

export const analyzePgn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { pgn: string; lang?: string }) =>
    z.object({ pgn: z.string().min(10).max(20000), lang: z.string().max(20).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("rating, language").eq("id", userId).maybeSingle();
    const rating = profile?.rating ?? 800;
    const lang = data.lang ?? profile?.language ?? "en";
    const sys = systemPrompt(rating, lang) + `\n\nYou are now reviewing the student's full game. Provide:
1. **Opening** — name and one-line assessment.
2. **Critical moments** — 2–4 specific moves (with move numbers) where the game turned, explained as a coach.
3. **Tactical mistakes / blunders** — what was missed.
4. **Strategic themes** to study next.
5. **One concrete training drill** for the student.

Keep it under 350 words, use markdown headings.`;

    const reply = await callAI([
      { role: "system", content: sys },
      { role: "user", content: `Here is my game in PGN:\n\n${data.pgn}` },
    ]);

    // Heuristic counts
    const blunders = (reply.match(/blunder/gi) ?? []).length;
    const mistakes = (reply.match(/mistake/gi) ?? []).length;

    await supabase.from("game_analyses").insert({
      user_id: userId,
      pgn: data.pgn,
      summary: reply,
      blunders,
      mistakes,
    });

    return { summary: reply, blunders, mistakes };
  });
