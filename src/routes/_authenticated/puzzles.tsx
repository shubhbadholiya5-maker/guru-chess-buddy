import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { AppShell } from "@/components/AppShell";
import { pickDaily, PUZZLES, type Puzzle } from "@/lib/puzzles";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, RotateCcw, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/puzzles")({
  component: PuzzlesPage,
});

function PuzzlesPage() {
  const [puzzle, setPuzzle] = useState<Puzzle>(() => pickDaily());
  const [game, setGame] = useState(() => new Chess(puzzle.fen));
  const [fen, setFen] = useState(puzzle.fen);
  const [step, setStep] = useState(0);
  const [hints, setHints] = useState(0);
  const [solved, setSolved] = useState(false);
  const [started] = useState(() => Date.now());

  useEffect(() => { reset(puzzle); }, [puzzle]);

  const reset = (p: Puzzle) => {
    const g = new Chess(p.fen);
    setGame(g); setFen(p.fen); setStep(0); setHints(0); setSolved(false);
  };

  const isPlayerTurn = step % 2 === 0;
  const playerColor = useMemo(() => (new Chess(puzzle.fen).turn() === "w" ? "white" : "black"), [puzzle]);

  const onDrop = (from: string, to: string): boolean => {
    if (solved || !isPlayerTurn) return false;
    const expected = puzzle.solution[step];
    const move = from + to;
    if (!expected.startsWith(move)) {
      toast.error("Not the best move — try again.");
      return false;
    }
    try {
      const m = game.move({ from, to, promotion: expected[4] ?? "q" });
      if (!m) return false;
      setFen(game.fen());
      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep >= puzzle.solution.length) { complete(true); return true; }
      // play opponent reply
      setTimeout(() => {
        const reply = puzzle.solution[nextStep];
        game.move({ from: reply.slice(0, 2), to: reply.slice(2, 4), promotion: reply[4] ?? "q" });
        setFen(game.fen());
        const after = nextStep + 1;
        setStep(after);
        if (after >= puzzle.solution.length) complete(true);
      }, 350);
      return true;
    } catch { return false; }
  };

  const complete = async (didSolve: boolean) => {
    setSolved(true);
    if (didSolve) toast.success("Solved! Great work.");
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      await supabase.from("puzzle_attempts").insert({
        user_id: u.user.id, puzzle_id: puzzle.id, solved: didSolve, hints_used: hints,
        time_seconds: Math.round((Date.now() - started) / 1000),
      });
    }
  };

  const showHint = () => {
    if (hints < puzzle.hints.length) setHints(hints + 1);
  };

  const next = () => {
    const idx = PUZZLES.findIndex((p) => p.id === puzzle.id);
    setPuzzle(PUZZLES[(idx + 1) % PUZZLES.length]);
  };

  const size = Math.min(520, typeof window !== "undefined" ? window.innerWidth - 60 : 400);

  return (
    <AppShell title="Daily Tactics">
      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        <div className="card-elevated rounded-xl p-4 flex items-center justify-center">
          <div style={{ width: size }}>
            <Chessboard
              position={fen}
              onPieceDrop={onDrop}
              boardOrientation={playerColor as any}
              boardWidth={size}
              customDarkSquareStyle={{ backgroundColor: "#3b2f24" }}
              customLightSquareStyle={{ backgroundColor: "#d9c9a9" }}
              customBoardStyle={{ borderRadius: 8 }}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="card-elevated rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Puzzle</div>
            <div className="font-display text-lg mt-1">#{puzzle.id} • {puzzle.rating}</div>
            <div className="mt-2 text-sm text-muted-foreground">Themes: {puzzle.themes.join(", ")}</div>
            <div className="mt-3 text-sm">It's <b className="text-primary">{playerColor}</b> to move. Find the best plan.</div>
          </div>

          <div className="card-elevated rounded-xl p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Hints used: {hints}/{puzzle.hints.length}</div>
            {puzzle.hints.slice(0, hints).map((h, i) => (
              <div key={i} className="text-sm bg-secondary/60 rounded-md p-2">{i + 1}. {h}</div>
            ))}
            <button onClick={showHint} disabled={hints >= puzzle.hints.length || solved} className="w-full py-2 rounded-md border border-primary/40 flex items-center justify-center gap-2 disabled:opacity-50">
              <Lightbulb className="h-4 w-4" /> Show next hint
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => reset(puzzle)} className="py-2 rounded-md border border-border flex items-center justify-center gap-2"><RotateCcw className="h-4 w-4" /> Retry</button>
            <button onClick={next} className="py-2 rounded-md bg-primary text-primary-foreground flex items-center justify-center gap-2">
              {solved ? <><Check className="h-4 w-4" /> Next</> : <>Skip <ChevronRight className="h-4 w-4" /></>}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
