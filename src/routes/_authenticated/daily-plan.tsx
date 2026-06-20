import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { AppShell } from "@/components/AppShell";
import { getDailyPlan, type DailyPlan, type DailyTask } from "@/lib/daily-plan.functions";
import { fetchLichessPuzzle, type LichessPuzzle } from "@/lib/lichess.functions";
import { CheckCircle2, Circle, Sparkles, Loader2, ChevronRight, RotateCcw, Target, Crown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/daily-plan")({
  component: DailyPlanPage,
});

function DailyPlanPage() {
  const fetchPlan = useServerFn(getDailyPlan);
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchPlan({ data: undefined as never })
      .then(setPlan)
      .catch((e) => toast.error(e?.message ?? "Could not load plan"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell title="Daily Plan">
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Building today's plan…</div>
      </AppShell>
    );
  }
  if (!plan) {
    return <AppShell title="Daily Plan"><p className="text-muted-foreground">Plan unavailable.</p></AppShell>;
  }

  const doneCount = Object.values(completed).filter(Boolean).length;
  const progress = Math.round((doneCount / plan.tasks.length) * 100);

  return (
    <AppShell title="Today's Plan">
      <div className="space-y-6 max-w-4xl">
        {/* Header card */}
        <div className="card-elevated rounded-2xl p-6 border border-primary/30">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary"><Crown className="h-4 w-4" /> {plan.band} • Rating {plan.rating}</div>
              <h2 className="font-display text-2xl mt-2">{plan.goal}</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl"><strong className="text-foreground">Focus today:</strong> {plan.focus}</p>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Today's load</div>
              <div className="font-display text-3xl">{plan.totalMinutes}<span className="text-base text-muted-foreground"> min</span></div>
              <div className="text-xs text-primary mt-1">{doneCount}/{plan.tasks.length} done</div>
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          {plan.tasks.map((task, i) => (
            <TaskCard
              key={i}
              task={task}
              done={!!completed[i]}
              onToggle={() => setCompleted((c) => ({ ...c, [i]: !c[i] }))}
            />
          ))}
        </div>

        {doneCount === plan.tasks.length && (
          <div className="card-elevated rounded-xl p-6 text-center border border-primary/40">
            <Sparkles className="h-6 w-6 text-primary mx-auto" />
            <h3 className="font-display text-xl mt-2">Today complete!</h3>
            <p className="text-sm text-muted-foreground mt-1">Show up tomorrow — that's how 2000 happens.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function TaskCard({ task, done, onToggle }: { task: DailyTask; done: boolean; onToggle: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`card-elevated rounded-xl p-5 border ${done ? "border-primary/30 opacity-70" : "border-transparent"}`}>
      <div className="flex items-start gap-3">
        <button onClick={onToggle} className="mt-0.5 shrink-0" title={done ? "Mark undone" : "Mark done"}>
          {done ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className={`font-display text-lg ${done ? "line-through text-muted-foreground" : ""}`}>{task.title}</h3>
            <span className="text-xs text-muted-foreground shrink-0">{task.minutes} min</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {task.kind === "tactic" && task.theme && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium flex items-center gap-1"
              >
                <Target className="h-3 w-3" /> {expanded ? "Hide trainer" : "Solve here"}
              </button>
            )}
            {task.link && (
              <Link
                to={task.link.to as any}
                className="text-xs px-3 py-1.5 rounded-md border border-primary/40 hover:bg-secondary flex items-center gap-1"
              >
                {task.link.label} <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {expanded && task.kind === "tactic" && task.theme && (
            <div className="mt-4">
              <InlineTactic theme={task.theme} onSolved={() => { if (!done) onToggle(); }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InlineTactic({ theme, onSolved }: { theme: string; onSolved: () => void }) {
  const fetchPuzzle = useServerFn(fetchLichessPuzzle);
  const [puzzle, setPuzzle] = useState<LichessPuzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"ready" | "thinking" | "wrong" | "solved">("thinking");
  const [feedback, setFeedback] = useState<string>("");
  const wrongTries = useRef(0);

  const playerColor: "white" | "black" = useMemo(
    () => (puzzle ? (new Chess(puzzle.fen).turn() === "w" ? "black" : "white") : "white"),
    [puzzle?.id],
  );

  const loadPuzzle = async () => {
    setLoading(true);
    setFeedback("");
    setStep(0);
    wrongTries.current = 0;
    try {
      const p = await fetchPuzzle({ data: { theme } });
      const c = new Chess(p.fen);
      // Lichess puzzles' first solution move is the opponent's setup — auto-play it
      const setup = p.solutionUci[0];
      if (setup) {
        c.move({ from: setup.slice(0, 2), to: setup.slice(2, 4), promotion: setup[4] ?? "q" });
      }
      setPuzzle(p);
      setGame(c);
      setFen(c.fen());
      setStep(1);
      setPhase("thinking");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not load a puzzle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDrop = (from: string, to: string): boolean => {
    if (!puzzle || phase === "solved") return false;
    const expected = puzzle.solutionUci[step];
    if (!expected) return false;
    const uci = from + to;
    if (uci !== expected.slice(0, 4)) {
      wrongTries.current += 1;
      setPhase("wrong");
      setFeedback("❌ Not the strongest move. Look again — checks, captures, threats.");
      return false;
    }
    try {
      const m = game.move({ from, to, promotion: expected[4] ?? "q" });
      if (!m) return false;
    } catch { return false; }
    setFen(game.fen());
    const next = step + 1;
    setStep(next);
    if (next >= puzzle.solutionUci.length) {
      setPhase("solved");
      setFeedback("✅ Solved! Pattern locked in.");
      onSolved();
      return true;
    }
    // play opponent reply
    setFeedback("✓ Good. Opponent replies…");
    setTimeout(() => {
      const reply = puzzle.solutionUci[next];
      try { game.move({ from: reply.slice(0, 2), to: reply.slice(2, 4), promotion: reply[4] ?? "q" }); } catch {}
      setFen(game.fen());
      const after = next + 1;
      setStep(after);
      if (after >= puzzle.solutionUci.length) {
        setPhase("solved");
        setFeedback("✅ Solved! Pattern locked in.");
        onSolved();
      } else {
        setPhase("thinking");
        setFeedback("Continue the same idea — finish the combo.");
      }
    }, 450);
    return true;
  };

  if (loading || !puzzle) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading puzzle from Lichess…</div>;
  }

  return (
    <div className="grid sm:grid-cols-[300px_1fr] gap-4 bg-secondary/20 rounded-lg p-3 border border-border/60">
      <div>
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          boardOrientation={playerColor}
          boardWidth={300}
          customDarkSquareStyle={{ backgroundColor: "#3b2f24" }}
          customLightSquareStyle={{ backgroundColor: "#d9c9a9" }}
          customBoardStyle={{ borderRadius: 6 }}
        />
      </div>
      <div className="space-y-2 text-sm">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Lichess #{puzzle.id} • {puzzle.rating} • {playerColor === "white" ? "White to move" : "Black to move"}</div>
        <div className="min-h-[60px]">{feedback || "Find the strongest continuation."}</div>
        <div className="flex gap-2">
          <button onClick={loadPuzzle} className="text-xs px-3 py-1.5 rounded-md border border-primary/40 hover:bg-secondary flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /> New puzzle
          </button>
          <a href={puzzle.gameUrl} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-secondary">
            View on Lichess
          </a>
        </div>
      </div>
    </div>
  );
}
