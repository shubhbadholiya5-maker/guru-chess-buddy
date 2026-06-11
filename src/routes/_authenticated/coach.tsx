import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { AppShell } from "@/components/AppShell";
import { coachChat } from "@/lib/coach.functions";
import { supabase } from "@/integrations/supabase/client";
import { speak, stopSpeaking, listen, type Lang } from "@/lib/voice";
import { Mic, Square, Volume2, VolumeX, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/coach")({
  component: CoachPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function CoachPage() {
  const chat = useServerFn(coachChat);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: pickOpener() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [voiceOut, setVoiceOut] = useState(true);
  const [listening, setListening] = useState(false);
  const recRef = useRef<ReturnType<typeof listen>>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("language").eq("id", data.user.id).maybeSingle();
      if (p?.language) setLang(p.language as Lang);
    });
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const newMsgs: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await chat({ data: { message: text, history: messages.slice(-20), lang } });
      setMessages([...newMsgs, { role: "assistant", content: res.reply }]);
      if (voiceOut) speak(stripMd(res.reply), lang);
    } catch (e: any) {
      toast.error(e?.message ?? "Coach is unavailable");
    } finally { setLoading(false); }
  };

  const toggleListen = () => {
    if (listening) { recRef.current?.stop(); setListening(false); return; }
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
    <AppShell title="AI Coach">
      <div className="grid md:grid-cols-[1fr_220px] gap-6">
        <div className="card-elevated rounded-xl flex flex-col h-[70vh]">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  <div className="prose prose-sm prose-invert max-w-none [&>*]:my-1">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && <div className="text-sm text-muted-foreground italic">Guru is thinking…</div>}
            <div ref={endRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-border p-3 flex gap-2">
            <button type="button" onClick={toggleListen} className={`p-2.5 rounded-md ${listening ? "bg-destructive text-destructive-foreground" : "bg-secondary"}`} title="Voice input">
              {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Guru anything…" className="flex-1 px-3 py-2 rounded-md bg-input border border-border" />
            <button disabled={loading} className="p-2.5 rounded-md bg-primary text-primary-foreground"><Send className="h-4 w-4" /></button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="card-elevated rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Language</div>
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="w-full px-3 py-2 rounded-md bg-input border border-border">
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>
          <button onClick={() => { setVoiceOut((v) => !v); stopSpeaking(); }} className="w-full py-2.5 rounded-md border border-border flex items-center justify-center gap-2">
            {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {voiceOut ? "Voice on" : "Voice off"}
          </button>
          <div className="card-elevated rounded-xl p-4 text-xs text-muted-foreground">
            <b className="text-foreground">Try asking:</b>
            <ul className="mt-2 space-y-1 list-disc pl-4">
              <li>Teach me the London System</li>
              <li>How do I find tactics?</li>
              <li>Why did I lose this position: …</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function stripMd(s: string) {
  return s.replace(/[#*_`>\[\]()]/g, "").replace(/\s+/g, " ").trim();
}
