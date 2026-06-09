import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { AppShell } from "@/components/AppShell";
import { ENDGAMES, type EndgamePosition } from "@/lib/endgame";
import { explainEndgame } from "@/lib/coach.functions";
import { supabase } from "@/integrations/supabase/client";
import { speak, stopSpeaking, type Lang } from "@/lib/voice";
import { Castle, GraduationCap, Volume2, VolumeX, ChevronLeft, ChevronRight, Send, Mic, MicOff } from "lucide-react";
import { listen, type RecognitionHandle } from "@/lib/voice";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/endgame")({
  component: EndgamePage,
});

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

function EndgamePage() {
  const [selected, setSelected] = useState<EndgamePosition | null>(null);
  return (
    <AppShell title="Endgame Academy">
      {!selected ? <Picker onPick={setSelected} /> : <Study pos={selected} onExit={() => setSelected(null)} />}
    </AppShell>
  );
}

function Picker({ onPick }: { onPick: (p: EndgamePosition) => void }) {
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("Beginner");
  const filtered = useMemo(() => ENDGAMES.filter((p) => p.level === level), [level]);
  return (
    <div>
      <p className="text-muted-foreground mb-4 max-w-2xl">
        Endgame technique — basic mates, opposition, Lucena, Philidor, Vancura, triangulation. Khud socho, phir Guru aapki thinking par feedback dega.
      </p>
      <div className="flex gap-2 mb-6 flex-wrap">
        {LEVELS.map((lv) => (
          <button
            key={lv}
            onClick={() => setLevel(lv)}
            className={`px-3 py-1.5 rounded-md text-sm border ${level === lv ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
          >
            {lv}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => onPick(p)}
            className="card-elevated rounded-xl p-5 text-left hover:border-primary/50 border border-transparent transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-lg gold-gradient">{p.title}</span>
              <Castle className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-secondary">{p.theme}</span>
              <span className="px-2 py-0.5 rounded bg-secondary">{p.side === "white" ? "♔ White" : "♚ Black"}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{p.context}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Study({ pos, onExit }: { pos: EndgamePosition; onExit: () => void }) {
  const [qIdx, setQIdx] = useState(0);
  const [studentText, setStudentText] = useState("");
  const [coachMsg, setCoachMsg] = useState<string>(
    `**${pos.title}**\n\n${pos.context}\n\nPehle socho — ${pos.questions[0]}\n\nApna jawab niche likho ya mic dabao.`,
  );
  const [coachLoading, setCoachLoading] = useState(false);
  const [lang, setLang] = useState<Lang>("hinglish");
  const [voiceOut, setVoiceOut] = useState(true);
  const explain = useServerFn(explainEndgame);
  const [recording, setRecording] = useState(false);
  const [recHandle, setRecHandle] = useState<RecognitionHandle | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("language").eq("id", data.user.id).maybeSingle();
      if (p?.language) setLang(p.language as Lang);
    });
  }, []);

  const [size, setSize] = useState<number>(() => (typeof window === "undefined" ? 360 : Math.min(520, window.innerWidth - 48)));
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const max = w >= 768 ? Math.min(520, w - 360 - 80) : w - 48;
      setSize(Math.max(260, Math.min(520, max)));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!voiceOut || coachLoading || !coachMsg) return;
    speak(stripMd(coachMsg), lang);
  }, [coachMsg, voiceOut, coachLoading, lang]);
  useEffect(() => () => stopSpeaking(), []);

  const submitThought = async () => {
    const thought = studentText.trim() || "(no answer yet — please teach the technique from scratch using the Socratic method)";
    setCoachLoading(true);
    setCoachMsg("Guru soch raha hai…");
    try {
      const res = await explain({
        data: {
          title: pos.title,
          theme: pos.theme,
          level: pos.level,
          side: pos.side,
          fen: pos.fen,
          context: pos.context,
          keyIdeas: pos.keyIdeas,
          studentThought: `Question: "${pos.questions[qIdx]}"\nMy thinking: ${thought}`,
          lang,
        },
      });
      setCoachMsg(res.reply);
      setStudentText("");
    } catch (e: any) {
      setCoachMsg("⚠️ " + (e?.message ?? "Coach unavailable."));
    } finally {
      setCoachLoading(false);
    }
  };

  const nextQuestion = () => {
    const next = qIdx + 1;
    if (next >= pos.questions.length) {
      setCoachMsg(`✅ **Position complete!**\n\nKey takeaways:\n${pos.keyIdeas.map((k) => `- ${k}`).join("\n")}\n\nNext game mein yeh technique apply karne ki koshish karo.`);
      return;
    }
    setQIdx(next);
    setCoachMsg(`Next question — ${pos.questions[next]}\n\nSocho, phir jawab do.`);
  };

  const toggleRecord = () => {
    if (recording) { recHandle?.stop(); setRecording(false); return; }
    const h = listen({
      lang,
      onResult: (text, isFinal) => { setStudentText(text); if (isFinal) setRecording(false); },
      onEnd: () => setRecording(false),
      onError: (e) => { toast.error("Mic: " + e); setRecording(false); },
    });
    if (h) { setRecHandle(h); setRecording(true); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <button onClick={onExit} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to positions
        </button>
        <div className="flex items-center gap-2">
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="px-2 py-1 rounded-md bg-input border border-border text-xs">
            <option value="hinglish">Hinglish</option>
            <option value="hi">हिन्दी</option>
            <option value="en">English</option>
          </select>
          <button onClick={() => { setVoiceOut((v) => !v); stopSpeaking(); }} className="p-2 rounded-md border border-border" title={voiceOut ? "Mute" : "Unmute"}>
            {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{pos.title} — {pos.theme} ({pos.level})</span>
          <span>Q {Math.min(qIdx + 1, pos.questions.length)} / {pos.questions.length}</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${Math.round(((qIdx + 1) / pos.questions.length) * 100)}%` }} />
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_360px] gap-6">
        <div className="card-elevated rounded-xl p-4 flex items-center justify-center">
          <div style={{ width: size }}>
            <Chessboard
              position={pos.fen}
              boardWidth={size}
              boardOrientation={pos.side}
              arePiecesDraggable={false}
              customDarkSquareStyle={{ backgroundColor: "#3b2f24" }}
              customLightSquareStyle={{ backgroundColor: "#d9c9a9" }}
              customBoardStyle={{ borderRadius: 8, boxShadow: "0 10px 40px -20px rgba(0,0,0,0.7)" }}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="card-elevated rounded-xl p-4 border border-primary/30">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary mb-2">
              <GraduationCap className="h-4 w-4" /> Guru
            </div>
            <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed [&>*]:my-1 min-h-[120px]">
              {coachLoading ? <span className="italic text-muted-foreground">Guru soch raha hai…</span> : <ReactMarkdown>{coachMsg}</ReactMarkdown>}
            </div>
            {!coachLoading && (
              <button
                onClick={nextQuestion}
                className="mt-3 w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1"
              >
                {qIdx + 1 >= pos.questions.length ? "Summary" : "Next question"} <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="card-elevated rounded-xl p-4 space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Your thinking</div>
            <textarea
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              rows={4}
              placeholder="Apna plan, technique, key squares yaha likho…"
              className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={toggleRecord}
                className={`flex-1 py-2 rounded-md border text-sm flex items-center justify-center gap-1 ${recording ? "border-destructive text-destructive" : "border-border"}`}
              >
                {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {recording ? "Stop" : "Speak"}
              </button>
              <button
                onClick={submitThought}
                disabled={coachLoading}
                className="flex-1 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Send className="h-4 w-4" /> Ask Guru
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function stripMd(s: string) {
  return s.replace(/[#*_`>\[\]()]/g, "").replace(/\s+/g, " ").trim();
}
