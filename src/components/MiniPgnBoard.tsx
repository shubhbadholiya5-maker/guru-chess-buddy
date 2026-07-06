import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

/**
 * Inline mini-board that plays through a SAN move list or renders a FEN.
 * Used by the GM Coach chat renderer.
 */
export function MiniPgnBoard({ moves, fen, boardSize = 260 }: { moves?: string[]; fen?: string; boardSize?: number }) {
  const startFen = fen ?? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const cleanMoves = useMemo(
    () => (moves ?? []).map((m) => m.replace(/[+#!?]+$/g, "").trim()).filter(Boolean),
    [moves],
  );
  const [ply, setPly] = useState(0);

  useEffect(() => { setPly(0); }, [fen, cleanMoves.length]);

  const position = useMemo(() => {
    const g = new Chess(startFen);
    for (let i = 0; i < ply && i < cleanMoves.length; i++) {
      try { g.move(cleanMoves[i]); } catch { break; }
    }
    return g.fen();
  }, [startFen, cleanMoves, ply]);

  const hasMoves = cleanMoves.length > 0;

  return (
    <div className="my-3 rounded-xl border border-primary/30 bg-card/60 backdrop-blur p-3 max-w-[300px]">
      <Chessboard position={position} arePiecesDraggable={false} boardWidth={boardSize} />
      {hasMoves && (
        <>
          <div className="mt-2 flex items-center gap-1.5">
            <button
              onClick={() => setPly((p) => Math.max(0, p - 1))}
              disabled={ply === 0}
              className="h-7 w-7 grid place-items-center rounded-md bg-secondary disabled:opacity-40"
              aria-label="Previous move"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPly((p) => Math.min(cleanMoves.length, p + 1))}
              disabled={ply >= cleanMoves.length}
              className="h-7 flex-1 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40"
            >
              Next move ({ply}/{cleanMoves.length})
            </button>
            <button
              onClick={() => setPly(0)}
              className="h-7 w-7 grid place-items-center rounded-md bg-secondary"
              aria-label="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed font-mono">
            {cleanMoves.slice(0, ply).map((m, i) => (
              <span key={i}>
                {i % 2 === 0 && <span className="opacity-60">{Math.floor(i / 2) + 1}. </span>}
                <span className={i === ply - 1 ? "text-primary font-semibold" : ""}>{m}</span>{" "}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Parse a chat message and extract SAN move sequences + FEN blocks.
 * Returns segments of { kind: "text" | "moves" | "fen" } to render.
 */
export type ChatSegment =
  | { kind: "text"; text: string }
  | { kind: "moves"; moves: string[]; raw: string }
  | { kind: "fen"; fen: string };

// FEN: 8 rank fields separated by "/", then side/castle/ep/half/full — we match the piece placement + side + castling for safety.
const FEN_RE = /\b([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s+[wb]\s+[KQkq-]{1,4}\s+[a-h0-9-]+\s+\d+\s+\d+\b/g;

// Move number sequence like "1. e4 e5 2. Nf3 Nc6 3. Bb5"
const MOVE_SEQ_RE = /(?:\d+\.{1,3}\s*[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#!?]*(?:\s+(?:[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#!?]*|O-O(?:-O)?))?\s*){2,}/g;

export function parseChatContent(input: string): ChatSegment[] {
  const segments: ChatSegment[] = [];
  let remaining = input;

  // First extract FENs
  const fenMatches: { start: number; end: number; fen: string }[] = [];
  for (const m of input.matchAll(FEN_RE)) {
    if (m.index !== undefined) fenMatches.push({ start: m.index, end: m.index + m[0].length, fen: m[0] });
  }

  // Then extract move sequences (skipping ranges already claimed by FENs)
  const moveMatches: { start: number; end: number; moves: string[]; raw: string }[] = [];
  for (const m of input.matchAll(MOVE_SEQ_RE)) {
    if (m.index === undefined) continue;
    const inFen = fenMatches.some((f) => m.index! >= f.start && m.index! < f.end);
    if (inFen) continue;
    const raw = m[0];
    const moves = raw
      .split(/\s+/)
      .map((t) => t.replace(/^\d+\.{1,3}$/, ""))
      .filter(Boolean)
      .filter((t) => !/^\d+\.{1,3}/.test(t));
    if (moves.length >= 2) moveMatches.push({ start: m.index, end: m.index + raw.length, moves, raw });
  }

  const all = [
    ...fenMatches.map((f) => ({ kind: "fen" as const, start: f.start, end: f.end, fen: f.fen })),
    ...moveMatches.map((m) => ({ kind: "moves" as const, start: m.start, end: m.end, moves: m.moves, raw: m.raw })),
  ].sort((a, b) => a.start - b.start);

  let cursor = 0;
  for (const item of all) {
    if (item.start > cursor) segments.push({ kind: "text", text: input.slice(cursor, item.start) });
    if (item.kind === "fen") segments.push({ kind: "fen", fen: item.fen });
    else segments.push({ kind: "moves", moves: item.moves, raw: item.raw });
    cursor = item.end;
  }
  if (cursor < input.length) segments.push({ kind: "text", text: input.slice(cursor) });
  if (segments.length === 0) segments.push({ kind: "text", text: input });
  return segments;
  void remaining;
}
