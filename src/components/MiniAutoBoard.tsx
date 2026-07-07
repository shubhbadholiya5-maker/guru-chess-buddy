// Small auto-playing board used inside lessons/masterclass.
// Given a starting FEN + SAN move list, it advances a move every N ms.
import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Play, Pause, SkipBack } from "lucide-react";

export interface AutoBoardProps {
  fen: string;
  moves: string[];               // SAN moves from `fen`
  captions?: string[];           // optional per-move captions
  intro?: string;                // caption before first move
  size?: number;
  speedMs?: number;
  autoStart?: boolean;
}

export function MiniAutoBoard({
  fen, moves, captions, intro, size = 260, speedMs = 1100, autoStart = true,
}: AutoBoardProps) {
  const [ply, setPly] = useState(-1); // -1 = intro/initial
  const [playing, setPlaying] = useState(autoStart);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const positions = useMemo(() => {
    const arr: string[] = [fen];
    try {
      const g = new Chess(fen);
      for (const m of moves) {
        const ok = g.move(m);
        if (!ok) break;
        arr.push(g.fen());
      }
    } catch { /* invalid start */ }
    return arr;
  }, [fen, moves]);

  useEffect(() => {
    if (!playing) return;
    if (ply >= moves.length - 1) { setPlaying(false); return; }
    timerRef.current = setTimeout(() => setPly((p) => p + 1), speedMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, ply, moves.length, speedMs]);

  const reset = () => { setPly(-1); setPlaying(true); };
  const toggle = () => {
    if (ply >= moves.length - 1) { reset(); return; }
    setPlaying((v) => !v);
  };

  const currentFen = positions[Math.max(0, ply + 1)] ?? fen;
  const caption = ply < 0 ? intro : (captions?.[ply] ?? "");

  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-2.5 space-y-2">
      <div className="mx-auto" style={{ width: size }}>
        <Chessboard position={currentFen} boardWidth={size} arePiecesDraggable={false} />
      </div>
      <div className="flex items-center gap-2">
        <button onClick={toggle} className="h-8 w-8 grid place-items-center rounded-full bg-primary text-primary-foreground">
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button onClick={reset} className="h-8 w-8 grid place-items-center rounded-full bg-secondary" title="Restart">
          <SkipBack className="h-3.5 w-3.5" />
        </button>
        <div className="text-[11px] text-muted-foreground tabular-nums">
          {ply + 1}/{moves.length}
        </div>
        {ply >= 0 && (
          <div className="ml-auto text-[11px] font-mono bg-secondary/60 rounded px-1.5 py-0.5">
            {moves[ply]}
          </div>
        )}
      </div>
      {caption && (
        <p className="text-xs text-muted-foreground leading-snug">{caption}</p>
      )}
    </div>
  );
}
