import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { AppShell } from "@/components/AppShell";
import { coachChat } from "@/lib/coach.functions";
import { speakText } from "@/lib/tts.functions";
import { supabase } from "@/integrations/supabase/client";
import { listen, stopSpeaking, type Lang } from "@/lib/voice";
import { MiniPgnBoard, parseChatContent } from "@/components/MiniPgnBoard";
import { Mic, Square, Volume2, VolumeX, Send, Crown, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/gm-coach")({
  head: () => ({ meta: [{ title: "GM Coach — Socratic AI Coach" }] }),
  component: GMCoachPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function GMCoachPage() {
  const chat = useServerFn(coachChat);
  const tts = useServerFn(speakText);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Lock in. Aap 2000 Elo ki taraf jaa rahe ho. Share a **FEN**, paste a PGN like `1. e4 e5 2. Nf3 Nc6 3. Bb5`, ya seedha puchho — kya seekhna hai aaj?" },
  ]);
  const [userId, setUserId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>("hinglish");
  const [voiceOut, setVoiceOut] = useState(true);
  const [listening, setListening] = useState(false);
  const recRef = useRef<ReturnType<typeof listen>>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      const { data: p } = await supabase.from("profiles").select("language").eq("id", data.user.id).maybeSingle();
      if (p?.language) setLang(p.language as Lang);
      const { data: hist } = await supabase
        .from("coach_messages")
        .select("role, content, created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: true })
        .limit(100);
      if (hist && hist.length > 0) {
        setMessages(hist.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
      }
    });
  }, []);

  const clearChat = async () => {
    if (!userId) return;
    if (!confirm("Clear the entire conversation? This cannot be undone.")) return;
    const { error } = await supabase.from("coach_messages").delete().eq("user_id", userId);
    if (error) { toast.error(error.message); return; }
    setMessages([{ role: "assistant", content: "Fresh start. What are we working on?" }]);
    toast.success("Chat cleared");
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const speakReply = async (text: string) => {
    if (!voiceOut) return;
    try {
      const clean = text.replace(/[#*_`>[\]()]/g, "").replace(/\s+/g, " ").slice(0, 1500).trim();
      if (!clean) return;
      const { audioBase64, mime } = await tts({ data: { text: clean, lang } });
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      const audio = new Audio(`data:${mime};base64,${audioBase64}`);
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch { /* silent — user can retry */ }
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const newMsgs: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await chat({ data: { message: text, history: messages.slice(-20), lang } });
      setMessages([...newMsgs, { role: "assistant", content: res.reply }]);
      speakReply(res.reply);
    } catch (e: any) {
      toast.error(e?.message ?? "GM Coach unavailable");
    } finally { setLoading(false); }
  };

  const toggleListen = () => {
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    if (audioRef.current) audioRef.current.pause();
    stopSpeaking();
    let finalText = "";
    setListening(true);
    recRef.current = listen({
      lang,
      onResult: (t, isFinal) => { setInput(t); if (isFinal) finalText = t; },
      onEnd: () => { setListening(false); if (finalText) send(finalText); },
      onError: (e) => { toast.error(e); setListening(false); },
    });
  };

  return (
    <AppShell title="Grandmaster Coach">
      <div className="grid lg:grid-cols-[1fr_260px] gap-6">
        <div className="card-elevated rounded-2xl flex flex-col h-[76vh]">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex gap-2 justify-start"}>
                {m.role === "assistant" && (
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 grid place-items-center">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-foreground"}`}>
                  {parseChatContent(m.content).map((seg, si) => {
                    if (seg.kind === "text") {
                      return (
                        <div key={si} className="prose prose-sm prose-invert max-w-none [&>*]:my-1">
                          <ReactMarkdown>{seg.text}</ReactMarkdown>
                        </div>
                      );
                    }
                    if (seg.kind === "fen") return <MiniPgnBoard key={si} fen={seg.fen} />;
                    return <MiniPgnBoard key={si} moves={seg.moves} />;
                  })}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-sm text-muted-foreground italic">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                GM is calculating…
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="border-t border-border/60 p-3 flex gap-2 items-end"
          >
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); if (!listening) toggleListen(); }}
              onMouseUp={() => { if (listening) toggleListen(); }}
              onTouchStart={(e) => { e.preventDefault(); if (!listening) toggleListen(); }}
              onTouchEnd={() => { if (listening) toggleListen(); }}
              className={`h-11 w-11 rounded-full grid place-items-center transition ${listening ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-secondary hover:bg-secondary/80"}`}
              title="Hold to speak"
              aria-label="Hold to speak"
            >
              {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask the GM anything — position, opening, tactic…"
              rows={1}
              className="flex-1 px-3 py-2.5 rounded-xl bg-input border border-border resize-none max-h-32"
            />
            <button disabled={loading || !input.trim()} className="h-11 w-11 rounded-full grid place-items-center bg-primary text-primary-foreground disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <div className="card-elevated rounded-2xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Language</div>
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="w-full px-3 py-2 rounded-md bg-input border border-border">
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>
          <button
            onClick={() => { setVoiceOut((v) => !v); if (audioRef.current) audioRef.current.pause(); }}
            className="w-full py-2.5 rounded-xl border border-border flex items-center justify-center gap-2 bg-card/50"
          >
            {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {voiceOut ? "Voice on" : "Voice off"}
          </button>
          <button
            onClick={clearChat}
            className="w-full py-2.5 rounded-xl border border-destructive/50 text-destructive flex items-center justify-center gap-2 hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" /> Clear chat history
          </button>
          <div className="card-elevated rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
            <div className="text-foreground font-semibold text-sm">Try:</div>
            <button onClick={() => send("Teach me the Italian Game main line with concrete moves.")} className="block w-full text-left hover:text-foreground">→ Teach me the Italian Game</button>
            <button onClick={() => send("Analyze this FEN: r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4")} className="block w-full text-left hover:text-foreground">→ Analyze a sample FEN</button>
            <button onClick={() => send("Mujhe 1500 se 2000 tak jaana hai. Aaj kya focus karun?")} className="block w-full text-left hover:text-foreground">→ 1500 → 2000 plan (Hinglish)</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
