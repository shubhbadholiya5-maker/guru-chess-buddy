import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { AppShell } from "@/components/AppShell";
import { StockfishEngine } from "@/lib/stockfish";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/play")({
  component: PlayPage,
});

const LEVELS = [
  { label: "Beginner (400)", skill: 0, movetime: 200 },
  { label: "Casual (800)", skill: 3, movetime: 300 },
  { label: "Intermediate (1200)", skill: 8, movetime: 500 },
  { label: "Strong (1600)", skill: 14, movetime: 800 },
  { label: "Expert (2000)", skill: 20, movetime: 1200 },
];

function PlayPage() {
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [level, setLevel] = useState(1);
  const [thinking, setThinking] = useState(false);
  const [status, setStatus] = useState("Your move (White)");
  const engineRef = useRef<StockfishEngine | null>(null);

  useEffect(() => {
    const e = new StockfishEngine();
    engineRef.current = e;
    e.init().then(() => e.setSkillLevel(LEVELS[level].skill)).catch(() => toast.error("Engine failed to load"));
    return () => e.destroy();
  }, []);

  useEffect(() => { engineRef.current?.setSkillLevel(LEVELS[level].skill); }, [level]);

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
  };

  const onDrop = (source: string, target: string): boolean => {
    if (thinking || game.turn() !== "w" || game.isGameOver()) return false;
    try {
      const m = game.move({ from: source, to: target, promotion: "q" });
      if (!m) return false;
      setFen(game.fen());
      checkStatus();
      setTimeout(playEngine, 150);
      return true;
    } catch { return false; }
  };

  const reset = () => { game.reset(); setFen(game.fen()); setStatus("Your move (White)"); };

  const size = useMemo(() => Math.min(560, typeof window !== "undefined" ? window.innerWidth - 60 : 400), []);

  return (
    <AppShell title="Play vs Stockfish">
      <div className="grid md:grid-cols-[1fr_280px] gap-6">
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
          <div className="card-elevated rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Status</div>
            <div className="font-display text-lg mt-1">{status}</div>
          </div>
          <div className="card-elevated rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Difficulty</div>
            <select value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full px-3 py-2 rounded-md bg-input border border-border">
              {LEVELS.map((l, i) => <option key={i} value={i}>{l.label}</option>)}
            </select>
          </div>
          <button onClick={reset} className="w-full py-2.5 rounded-md border border-primary/40 hover:bg-secondary">New game</button>
          <div className="card-elevated rounded-xl p-4 text-sm text-muted-foreground">
            <b className="text-foreground">Tip:</b> after a game, copy your PGN from the board and analyze it in the <span className="text-primary">Analyze</span> tab to get coach-style feedback.
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(game.pgn()).then(() => toast.success("PGN copied"))}
            className="w-full py-2 rounded-md text-sm border border-border hover:bg-secondary"
          >Copy PGN</button>
        </div>
      </div>
    </AppShell>
  );
}
