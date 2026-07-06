import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { coachChat } from "@/lib/coach.functions";
import { speakText } from "@/lib/tts.functions";
import { supabase } from "@/integrations/supabase/client";
import { listen, stopSpeaking, type Lang } from "@/lib/voice";
import { MiniPgnBoard, parseChatContent } from "@/components/MiniPgnBoard";
import { Bot, Mic, Send, Square, X, Maximize2, Volume2, VolumeX, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const OPENER: Msg = {
  role: "assistant",
  content: "Ready to sharpen? Paste a FEN, PGN moves, or ask anything about chess.",
};

export function GlobalChatWidget() {
  const chat = useServerFn(coachChat);
  const tts = useServerFn(speakText);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([OPENER]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>("hinglish");
  const [voiceOut, setVoiceOut] = useState(false);
  const [listening, setListening] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const recRef = useRef<ReturnType<typeof listen>>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Load history + language on first open
  useEffect(() => {
    if (!open || loaded) return;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setLoaded(true); return; }
      setUserId(u.user.id);
      const { data: p } = await supabase.from("profiles").select("language").eq("id", u.user.id).maybeSingle();
      if (p?.language) setLang(p.language as Lang);
      const { data: hist } = await supabase
        .from("coach_messages")
        .select("role, content, created_at")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: true })
        .limit(60);
      if (hist && hist.length > 0) {
        setMessages(hist.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
      }
      setLoaded(true);
    })();
  }, [open, loaded]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const speakReply = async (text: string) => {
    if (!voiceOut) return;
    try {
      const clean = text.replace(/[#*_`>[\]()]/g, "").replace(/\s+/g, " ").slice(0, 1200).trim();
      if (!clean) return;
      const { audioBase64, mime } = await tts({ data: { text: clean, lang } });
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(`data:${mime};base64,${audioBase64}`);
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch { /* silent */ }
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await chat({ data: { message: text, history: messages.slice(-20), lang } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
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

  const clearChat = async () => {
    if (!userId) return;
    if (!confirm("Clear the entire GM Coach conversation? This cannot be undone.")) return;
    const { error } = await supabase.from("coach_messages").delete().eq("user_id", userId);
    if (error) { toast.error(error.message); return; }
    setMessages([OPENER]);
    toast.success("Chat cleared");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open GM Coach chat"
        className="fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full grid place-items-center bg-gradient-to-br from-amber-400 to-yellow-600 shadow-[0_0_28px_6px_rgba(234,179,8,0.35)] hover:scale-105 transition"
      >
        <Bot className="h-6 w-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(92vw,400px)] h-[min(80vh,600px)] flex flex-col rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/60 bg-gradient-to-r from-amber-500/10 to-yellow-500/5">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 grid place-items-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-tight">GM Coach</div>
          <div className="text-[10px] text-muted-foreground">Elite AI · 2000 Elo path</div>
        </div>
        <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}
          className="text-[11px] bg-secondary rounded px-1.5 py-1 border border-border/60">
          <option value="en">EN</option>
          <option value="hi">हिं</option>
          <option value="hinglish">Hinglish</option>
        </select>
        <button onClick={() => { setVoiceOut((v) => !v); if (audioRef.current) audioRef.current.pause(); }}
          className="h-7 w-7 grid place-items-center rounded hover:bg-secondary" title="Toggle voice">
          {voiceOut ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        </button>
        <button onClick={clearChat} className="h-7 w-7 grid place-items-center rounded hover:bg-secondary" title="Clear chat">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <Link to="/gm-coach" className="h-7 w-7 grid place-items-center rounded hover:bg-secondary" title="Full screen">
          <Maximize2 className="h-3.5 w-3.5" />
        </Link>
        <button onClick={() => setOpen(false)} className="h-7 w-7 grid place-items-center rounded hover:bg-secondary" title="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[92%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/70"}`}>
              {parseChatContent(m.content).map((seg, si) => {
                if (seg.kind === "text") return (
                  <div key={si} className="prose prose-sm prose-invert max-w-none [&>*]:my-1 [&_p]:text-[13px]">
                    <ReactMarkdown>{seg.text}</ReactMarkdown>
                  </div>
                );
                if (seg.kind === "fen") return <MiniPgnBoard key={si} fen={seg.fen} boardSize={220} />;
                return <MiniPgnBoard key={si} moves={seg.moves} boardSize={220} />;
              })}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-muted-foreground italic">GM is thinking…</div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="border-t border-border/60 p-2 flex gap-1.5 items-end">
        <button type="button" onClick={toggleListen}
          className={`h-9 w-9 rounded-full grid place-items-center shrink-0 ${listening ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-secondary hover:bg-secondary/80"}`}
          title="Hold to speak">
          {listening ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
        </button>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Ask the GM…" rows={1}
          className="flex-1 px-2.5 py-2 rounded-lg bg-input border border-border resize-none text-sm max-h-24" />
        <button disabled={loading || !input.trim()}
          className="h-9 w-9 rounded-full grid place-items-center bg-primary text-primary-foreground disabled:opacity-40 shrink-0">
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
