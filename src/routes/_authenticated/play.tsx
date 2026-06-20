import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { AppShell } from "@/components/AppShell";
import { StockfishEngine } from "@/lib/stockfish";
import { coachChat } from "@/lib/coach.functions";
import { supabase } from "@/integrations/supabase/client";
import { speak, stopSpeaking, type Lang } from "@/lib/voice";
import { toast } from "sonner";
import { GraduationCap, Volume2, VolumeX } from "lucide-react";

export const Route = createFileRoute("/_authenticated/play")({
  validateSearch: (search: Record<string, unknown>) => ({
    fen: typeof search.fen === "string" ? (search.fen as string) : undefined,
  }),
  component: PlayPage,
});

const LEVELS = [
  { label: "Beginner (400)", skill: 0, movetime: 200 },
  { label: "Casual (800)", skill: 3, movetime: 300 },
  { label: "Intermediate (1200)", skill: 8, movetime: 500 },
  { label: "Strong (1600)", skill: 14, movetime: 800 },
  { label: "Expert (2000)", skill: 20, movetime: 1200 },
];

type Phase = "idle" | "prompt" | "feedback";

function PlayPage() {
  const { fen: initialFen } = Route.useSearch();
  const [game] = useState(() => {
    const c = new Chess();
    if (initialFen) {
      try { c.load(initialFen); } catch { /* invalid fen, ignore */ }
    }
    return c;
  });
  const [fen, setFen] = useState(game.fen());
  const [level, setLevel] = useState(1);
  const [thinking, setThinking] = useState(false);
  const [status, setStatus] = useState("Your move (White)");
  const engineRef = useRef<StockfishEngine | null>(null);

  // Coaching state
  const chat = useServerFn(coachChat);
  const [training, setTraining] = useState(true);
  const [lang, setLang] = useState<Lang>("hinglish");
  const [voiceOut, setVoiceOut] = useState(true);
  const [phase, setPhase] = useState<Phase>("prompt");
  const [coachMsg, setCoachMsg] = useState<string>(
    "Training mode on hai! 🎓 Aap White ho. Pehle socho:\n\n- **Aap kya move soch rahe ho?**\n- **Opponent ki threat kya ho sakti hai** (abhi koi nahi, kyunki opening hai)?\n- **Pehle 3 moves ka plan** kya hai — center, development, king safety?\n\nApna pehla move chalo jab ready ho.",
  );
  const [coachLoading, setCoachLoading] = useState(false);
  const pendingEngine = useRef(false);

  useEffect(() => {
    const e = new StockfishEngine();
    engineRef.current = e;
    e.init().then(() => e.setSkillLevel(LEVELS[level].skill)).catch(() => toast.error("Engine failed to load"));
    return () => e.destroy();
  }, []);

  useEffect(() => { engineRef.current?.setSkillLevel(LEVELS[level].skill); }, [level]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("language").eq("id", data.user.id).maybeSingle();
      if (p?.language) setLang(p.language as Lang);
    });
  }, []);

  const checkStatus = () => {
    if (game.isCheckmate()) setStatus(game.turn() === "w" ? "Checkmate — Stockfish wins" : "Checkmate — you win! 🎉");
    else if (game.isDraw()) setStatus("Draw");
    else setStatus(game.turn() === "w" ? "Your move (White)" : "Stockfish thinking…");
  };

  const playEngine = async () => {
    if (game.isGameOver() || !engineRef.current) return;
    setThinking(true);
    try {
      const { bestmove } = await engineRef.current.bestMove(game.fen(), { movetime: LEVELS[level].movetime });
      if (bestmove && bestmove !== "(none)") {
        game.move({ from: bestmove.slice(0, 2), to: bestmove.slice(2, 4), promotion: bestmove[4] ?? "q" });
        setFen(game.fen());
      }
    } catch (e) { console.error(e); }
    setThinking(false);
    checkStatus();
    if (training && !game.isGameOver()) {
      // Prompt student to think about opponent's last move
      setPhase("prompt");
      setCoachMsg(
        `Stockfish ne **${game.history().slice(-1)[0]}** khela.\n\n- Iss move ki **threat** kya hai?\n- Konse **squares attack** mein hain?\n- Aapke **candidate moves** kya hain?\n\nReady ho toh apna move chalo.`,
      );
    }
  };

  const askCoachFeedback = async (sanMove: string, fenAfter: string) => {
    setCoachLoading(true);
    setPhase("feedback");
    setCoachMsg("Guru soch raha hai…");
    try {
      const res = await chat({
        data: {
          message: `I just played **${sanMove}** as White vs Stockfish (level: ${LEVELS[level].label}). In 3-4 short sentences: was this a good move? What was the key idea or what did I miss? End with one short guiding question for my next think. Be concise — we're mid-game.`,
          history: [],
          fen: fenAfter,
          lang,
        },
      });
      setCoachMsg(res.reply);
    } catch (e: any) {
      setCoachMsg("⚠️ " + (e?.message ?? "Coach unavailable. Continue playing."));
    } finally {
      setCoachLoading(false);
    }
  };

  const continueAfterFeedback = () => {
    setPhase("prompt");
    setCoachMsg("Stockfish ka move dekho aur sochna shuru karo…");
    if (pendingEngine.current) {
      pendingEngine.current = false;
      setTimeout(playEngine, 200);
    }
  };

  const onDrop = (source: string, target: string): boolean => {
    if (thinking || game.turn() !== "w" || game.isGameOver()) return false;
    if (training && phase === "feedback") {
      toast.info("Pehle Guru ka feedback padho, phir Continue dabao.");
      return false;
    }
    try {
      const m = game.move({ from: source, to: target, promotion: "q" });
      if (!m) return false;
      setFen(game.fen());
      checkStatus();
      if (training) {
        pendingEngine.current = true;
        askCoachFeedback(m.san, game.fen());
      } else {
        setTimeout(playEngine, 150);
      }
      return true;
    } catch { return false; }
  };

  const reset = () => {
    game.reset();
    setFen(game.fen());
    setStatus("Your move (White)");
    pendingEngine.current = false;
    if (training) {
      setPhase("prompt");
      setCoachMsg("Nayi game! 🎓 Aap White ho. Pehle socho — kaunsa **opening principle** follow karoge? Center, development, ya king safety?");
    }
  };

  const [size, setSize] = useState<number>(() => {
    if (typeof window === "undefined") return 360;
    return Math.min(560, window.innerWidth - 32);
  });
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const max = w >= 768 ? Math.min(560, w - 320 - 80) : w - 48;
      setSize(Math.max(260, Math.min(560, max)));
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

  return (
    <AppShell title="Play vs Stockfish">
      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        <div className="card-elevated rounded-xl p-4 flex items-center justify-center">
          <div style={{ width: size }}>
            <Chessboard
              position={fen}
              onPieceDrop={onDrop}
              boardWidth={size}
              customDarkSquareStyle={{ backgroundColor: "#3b2f24" }}
              customLightSquareStyle={{ backgroundColor: "#d9c9a9" }}
              customBoardStyle={{ borderRadius: 8, boxShadow: "0 10px 40px -20px rgba(0,0,0,0.7)" }}
            />
          </div>
        </div>
        <div className="space-y-4">
          {training && (
            <div className="card-elevated rounded-xl p-4 border border-primary/30">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary mb-2">
                <GraduationCap className="h-4 w-4" /> Guru
              </div>
              <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed [&>*]:my-1 min-h-[80px]">
                {coachLoading ? <span className="italic text-muted-foreground">Guru soch raha hai…</span> : <ReactMarkdown>{coachMsg}</ReactMarkdown>}
              </div>
              {phase === "feedback" && !coachLoading && (
                <button
                  onClick={continueAfterFeedback}
                  className="mt-3 w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
                >
                  Continue → Stockfish ka move
                </button>
              )}
            </div>
          )}

          <div className="card-elevated rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Status</div>
            <div className="font-display text-lg mt-1">{status}</div>
          </div>

          <div className="card-elevated rounded-xl p-4 space-y-3">
            <label className="flex items-center justify-between text-sm cursor-pointer">
              <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Training mode</span>
              <input
                type="checkbox"
                checked={training}
                onChange={(e) => {
                  setTraining(e.target.checked);
                  if (e.target.checked) { setPhase("prompt"); setCoachMsg("Training mode on. Apna move chalo jab ready ho."); }
                  else { setPhase("idle"); }
                }}
                className="h-4 w-4"
              />
            </label>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Difficulty</div>
              <select value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm">
                {LEVELS.map((l, i) => <option key={i} value={i}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Coach language</div>
              <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm">
                <option value="hinglish">Hinglish</option>
                <option value="hi">हिन्दी</option>
                <option value="en">English</option>
              </select>
            </div>
            <button onClick={() => { setVoiceOut((v) => !v); stopSpeaking(); }} className="w-full py-2 rounded-md border border-border flex items-center justify-center gap-2 text-sm">
              {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {voiceOut ? "Voice on" : "Voice off"}
            </button>
          </div>

          <button onClick={reset} className="w-full py-2.5 rounded-md border border-primary/40 hover:bg-secondary">New game</button>
          <button
            onClick={() => navigator.clipboard.writeText(game.pgn()).then(() => toast.success("PGN copied"))}
            className="w-full py-2 rounded-md text-sm border border-border hover:bg-secondary"
          >Copy PGN</button>
        </div>
      </div>
    </AppShell>
  );
}

function stripMd(s: string) {
  return s.replace(/[#*_`>\[\]()]/g, "").replace(/\s+/g, " ").trim();
}
