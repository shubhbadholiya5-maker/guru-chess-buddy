import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import ReactMarkdown from "react-markdown";
import { AppShell } from "@/components/AppShell";
import { CATEGORIES, TACTICS, tacticsByCategory, dueForReview, markAttempt, type TacticPuzzle } from "@/lib/tactics";
import { supabase } from "@/integrations/supabase/client";
import { speak, stopSpeaking, type Lang } from "@/lib/voice";
import { toast } from "sonner";
import { GraduationCap, Lightbulb, RotateCcw, ChevronRight, Volume2, VolumeX, Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tactics")({
  component: TacticsPage,
});

type View = { kind: "picker" } | { kind: "solve"; pool: TacticPuzzle[]; idx: number; title: string };

function TacticsPage() {
  const [view, setView] = useState<View>({ kind: "picker" });
  const due = useMemo(() => dueForReview(), [view]);

  return (
    <AppShell title="Tactics Trainer">
      {view.kind === "picker" ? (
        <Picker
          due={due}
          onPick={(catId) => {
            const pool = tacticsByCategory(catId);
            const cat = CATEGORIES.find((c) => c.id === catId)!;
            setView({ kind: "solve", pool, idx: 0, title: `${cat.icon} ${cat.name}` });
          }}
          onReview={() => {
            if (due.length === 0) {
              toast.info("Aaj koi review pending nahi! Naya category try karo.");
              return;
            }
            setView({ kind: "solve", pool: due, idx: 0, title: "🔁 Spaced Review" });
          }}
          onMixed={() => setView({ kind: "solve", pool: shuffle([...TACTICS]), idx: 0, title: "🎲 Mixed Set" })}
        />
      ) : (
        <Solver
          puzzle={view.pool[view.idx]}
          title={view.title}
          progress={`${view.idx + 1} / ${view.pool.length}`}
          onNext={() => {
            if (view.idx + 1 >= view.pool.length) {
              toast.success("Set complete! 🎉");
              setView({ kind: "picker" });
            } else {
              setView({ ...view, idx: view.idx + 1 });
            }
          }}
          onExit={() => setView({ kind: "picker" })}
        />
      )}
    </AppShell>
  );
}

function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Picker({
  due,
  onPick,
  onReview,
  onMixed,
}: {
  due: TacticPuzzle[];
  onPick: (id: string) => void;
  onReview: () => void;
  onMixed: () => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground max-w-2xl">
        Tactical motif choose karo. Har puzzle mein **3 levels ke hints** hain — pehle khud socho, fir agar phasoge to ek-ek hint kholo. Voice on
        rakho — Guru aapse sawal puchega like a real coach.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          onClick={onReview}
          className="card-elevated rounded-xl p-5 text-left border border-primary/40 hover:border-primary transition flex items-center gap-4"
        >
          <Sparkles className="h-7 w-7 text-primary shrink-0" />
          <div>
            <div className="font-display text-lg">Spaced Review</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {due.length > 0 ? `${due.length} puzzles aaj review ke liye due hain` : "Sab clear! Naya category try karo."}
            </div>
          </div>
        </button>
        <button onClick={onMixed} className="card-elevated rounded-xl p-5 text-left border border-transparent hover:border-primary/50 transition flex items-center gap-4">
          <span className="text-2xl">🎲</span>
          <div>
            <div className="font-display text-lg">Mixed Set</div>
            <div className="text-xs text-muted-foreground mt-0.5">Sabhi motifs ek saath — random order.</div>
          </div>
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((c) => {
          const count = tacticsByCategory(c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => onPick(c.id)}
              className="card-elevated rounded-xl p-5 text-left hover:border-primary/50 border border-transparent transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-lg gold-gradient">
                  {c.icon} {c.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-secondary">{count}</span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">{c.hindi}</div>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Phase = "thinking" | "wrong" | "hint" | "solved";

function Solver({
  puzzle,
  title,
  progress,
  onNext,
  onExit,
}: {
  puzzle: TacticPuzzle;
  title: string;
  progress: string;
  onNext: () => void;
  onExit: () => void;
}) {
  const gameRef = useRef(new Chess(puzzle.fen));
  const [fen, setFen] = useState(puzzle.fen);
  const [step, setStep] = useState(0);
  const [hintsShown, setHintsShown] = useState(0);
  const [phase, setPhase] = useState<Phase>("thinking");
  const [coachMsg, setCoachMsg] = useState<string>(
    `**${title}** — naya puzzle. Pehle socho:\n\n- **Checks, Captures, Threats** kya hain?\n- Konsa piece weak hai?\n- Aapka pehla move kya hoga aur kyun?\n\nReady ho to board pe move chalo.`,
  );
  const [voiceOut, setVoiceOut] = useState(true);
  const [lang, setLang] = useState<Lang>("hinglish");
  const [started] = useState(() => Date.now());
  const wrongTries = useRef(0);

  // reset on puzzle change
  useEffect(() => {
    gameRef.current = new Chess(puzzle.fen);
    setFen(puzzle.fen);
    setStep(0);
    setHintsShown(0);
    setPhase("thinking");
    wrongTries.current = 0;
    setCoachMsg(
      `**${title}** — naya puzzle. Pehle socho:\n\n- **Checks, Captures, Threats** kya hain?\n- Konsa piece weak hai?\n- Aapka pehla move kya hoga aur kyun?\n\nReady ho to board pe move chalo.`,
    );
  }, [puzzle.id]);

  // language pref
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("language").eq("id", data.user.id).maybeSingle();
      if (p?.language) setLang(p.language as Lang);
    });
  }, []);

  // mobile-responsive board sizing
  const [size, setSize] = useState<number>(() => {
    if (typeof window === "undefined") return 360;
    return Math.min(520, window.innerWidth - 32);
  });
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const max = w >= 768 ? Math.min(520, w - 340 - 80) : w - 48;
      setSize(Math.max(260, Math.min(520, max)));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // speak coach messages
  useEffect(() => {
    if (!voiceOut || !coachMsg) return;
    speak(stripMd(coachMsg), lang);
  }, [coachMsg, voiceOut, lang]);
  useEffect(() => () => stopSpeaking(), []);

  const playerColor = useMemo(() => (new Chess(puzzle.fen).turn() === "w" ? "white" : "black"), [puzzle.id]);
  const isPlayerTurn = step % 2 === 0;

  const playAlert = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 220;
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o.start();
      o.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const onDrop = (from: string, to: string): boolean => {
    if (phase === "solved" || !isPlayerTurn) return false;
    const game = gameRef.current;
    const expected = puzzle.solution[step];
    const uci = from + to;
    const expectedFromTo = expected.slice(0, 4);
    if (uci !== expectedFromTo) {
      // Socratic blunder guard — DON'T accept, just give feedback
      wrongTries.current += 1;
      playAlert();
      setPhase("wrong");
      const msg =
        wrongTries.current === 1
          ? `🤔 **Sure ho?** Yeh best move nahi lagta. Phir se socho:\n\n- Opponent ki **threat** kya hai is move ke baad?\n- Koi **forcing move** (check / capture / mate threat) miss to nahi kar rahe?\n\nDobara try karo.`
          : wrongTries.current === 2
          ? `Abhi bhi miss — koi baat nahi. **Hint** dekhna chaho? Niche "Show next hint" press karo, ya phir se socho.`
          : `Theek hai — ek hint khol dete hain. Niche se hint dekho.`;
      setCoachMsg(msg);
      return false;
    }
    // correct
    try {
      const m = game.move({ from, to, promotion: expected[4] ?? "q" });
      if (!m) return false;
    } catch {
      return false;
    }
    setFen(game.fen());
    const nextStep = step + 1;
    setStep(nextStep);
    if (nextStep >= puzzle.solution.length) {
      completeWin();
      return true;
    }
    // play opponent reply
    setCoachMsg(`✅ Sahi! Ab opponent ka reply dekho…`);
    setPhase("thinking");
    setTimeout(() => {
      const reply = puzzle.solution[nextStep];
      try {
        game.move({ from: reply.slice(0, 2), to: reply.slice(2, 4), promotion: reply[4] ?? "q" });
      } catch {}
      setFen(game.fen());
      const after = nextStep + 1;
      setStep(after);
      if (after >= puzzle.solution.length) {
        completeWin();
      } else {
        setCoachMsg(`Opponent ne reply de diya. Ab agla move socho — **same idea continue** karo.`);
      }
    }, 450);
    return true;
  };

  const completeWin = async () => {
    setPhase("solved");
    const tries = wrongTries.current;
    const hintsUsed = hintsShown;
    const star = tries === 0 && hintsUsed === 0 ? "⭐⭐⭐ Shandar! Bilkul clean solve." : hintsUsed === 0 ? "⭐⭐ Solve ho gaya — agli baar pehli try mein!" : "⭐ Solved with hints — concept yaad rakho.";
    setCoachMsg(`🎉 **Puzzle solved!**\n\n${star}\n\n**Lesson:** ${puzzle.lesson}`);
    markAttempt(puzzle.id, tries === 0);
    // persist
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      await supabase
        .from("puzzle_attempts")
        .insert({
          user_id: u.user.id,
          puzzle_id: puzzle.id,
          solved: true,
          hints_used: hintsUsed,
          time_seconds: Math.round((Date.now() - started) / 1000),
        })
        .then(() => {});
    }
  };

  const showHint = () => {
    if (hintsShown >= 3) return;
    const next = hintsShown + 1;
    setHintsShown(next);
    setPhase("hint");
    setCoachMsg(`💡 **Hint ${next}/3:** ${puzzle.hints[next - 1]}`);
  };

  const retry = () => {
    gameRef.current = new Chess(puzzle.fen);
    setFen(puzzle.fen);
    setStep(0);
    setPhase("thinking");
    setCoachMsg(`Reset. Phir se socho — **CCT** (Checks, Captures, Threats) check karo.`);
    wrongTries.current = 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <button onClick={onExit} className="text-xs text-muted-foreground hover:text-foreground">
            ← Tactics menu
          </button>
          <h2 className="font-display text-2xl mt-1">
            {title} <span className="text-sm text-muted-foreground ml-2">({progress} • ~{puzzle.rating})</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="px-2 py-1.5 rounded-md bg-input border border-border text-xs">
            <option value="hinglish">Hinglish</option>
            <option value="hi">हिन्दी</option>
            <option value="en">English</option>
          </select>
          <button
            onClick={() => {
              setVoiceOut((v) => !v);
              stopSpeaking();
            }}
            className="p-2 rounded-md border border-border"
            title="Toggle voice"
          >
            {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button onClick={retry} className="p-2 rounded-md border border-border" title="Restart puzzle">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_340px] gap-6">
        <div className="card-elevated rounded-xl p-4 flex items-center justify-center">
          <div style={{ width: size }}>
            <Chessboard
              position={fen}
              onPieceDrop={onDrop}
              boardOrientation={playerColor as any}
              boardWidth={size}
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
              <ReactMarkdown>{coachMsg}</ReactMarkdown>
            </div>
            {phase === "solved" && (
              <button
                onClick={onNext}
                className="mt-3 w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1"
              >
                Next puzzle <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="card-elevated rounded-xl p-4 space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Hints used: {hintsShown}/3</div>
            {puzzle.hints.slice(0, hintsShown).map((h, i) => (
              <div key={i} className="text-xs bg-secondary/60 rounded-md p-2 leading-relaxed">
                <b>{i + 1}.</b> {h}
              </div>
            ))}
            <button
              onClick={showHint}
              disabled={hintsShown >= 3 || phase === "solved"}
              className="w-full py-2 rounded-md border border-primary/40 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              <Lightbulb className="h-4 w-4" /> {hintsShown === 0 ? "Show hint 1" : hintsShown < 3 ? `Show hint ${hintsShown + 1}` : "All hints shown"}
            </button>
            {phase === "solved" && (
              <div className="text-xs text-primary flex items-center gap-1 pt-1">
                <Check className="h-3 w-3" /> Saved to your progress
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function stripMd(s: string) {
  return s.replace(/[#*_`>\[\]()]/g, "").replace(/\s+/g, " ").trim();
}
