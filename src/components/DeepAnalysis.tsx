// Client-side "deep analysis" that runs Stockfish per move and produces
// Chess.com / Aimchess-style stats:
//   Brilliant · Best · Great · Good · Inaccuracy · Mistake · Blunder
// plus phase buckets (Opening / Middlegame / Endgame) so users can see
// which phase they lose points in.
import { useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { StockfishEngine } from "@/lib/stockfish";
import { Loader2, PlayCircle, Trophy, AlertTriangle, XCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Tag = "brilliant" | "best" | "great" | "good" | "inaccuracy" | "mistake" | "blunder";
type Phase = "opening" | "middlegame" | "endgame";

interface MoveReport {
  ply: number;
  moveNo: number;
  side: "w" | "b";
  san: string;
  played: string;         // UCI
  best: string;           // UCI engine top
  evalBefore: number;     // cp from side-to-move perspective
  evalAfter: number;      // cp from side-to-move perspective (after their move)
  loss: number;           // cp
  tag: Tag;
  phase: Phase;
}

interface Report {
  moves: MoveReport[];
  totals: Record<Tag, number>;
  phaseLoss: Record<Phase, { count: number; totalLoss: number; misses: number }>;
  accuracy: { white: number; black: number };
}

const TAG_META: Record<Tag, { label: string; color: string; icon: React.ReactNode }> = {
  brilliant:  { label: "Brilliant",  color: "text-cyan-300",   icon: <Sparkles className="h-3.5 w-3.5" /> },
  best:       { label: "Best",       color: "text-emerald-300", icon: <Trophy className="h-3.5 w-3.5" /> },
  great:      { label: "Great",      color: "text-emerald-200", icon: <Trophy className="h-3.5 w-3.5" /> },
  good:       { label: "Good",       color: "text-foreground/80", icon: <PlayCircle className="h-3.5 w-3.5" /> },
  inaccuracy: { label: "Inaccuracy", color: "text-amber-300",  icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  mistake:    { label: "Mistake",    color: "text-orange-400", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  blunder:    { label: "Blunder",    color: "text-rose-400",   icon: <XCircle className="h-3.5 w-3.5" /> },
};

function categorize(loss: number, sacrifice: boolean): Tag {
  if (loss <= 0 && sacrifice) return "brilliant";
  if (loss <= 5) return "best";
  if (loss <= 20) return "great";
  if (loss <= 50) return "good";
  if (loss <= 100) return "inaccuracy";
  if (loss <= 250) return "mistake";
  return "blunder";
}

function pieceValue(p: string): number {
  const t = p.toLowerCase();
  return t === "q" ? 9 : t === "r" ? 5 : t === "b" || t === "n" ? 3 : t === "p" ? 1 : 0;
}

function accuracyFromLoss(losses: number[]): number {
  if (!losses.length) return 100;
  // Lichess-style accuracy curve
  const winPercent = (cp: number) => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
  const scores = losses.map((l) => {
    const before = winPercent(0);
    const after = winPercent(-l);
    const drop = before - after;
    return Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * drop) - 3.1669));
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function phaseFor(fullmove: number, pieceCount: number): Phase {
  if (fullmove <= 12) return "opening";
  if (pieceCount <= 12) return "endgame";
  return "middlegame";
}

export function DeepAnalysis({ pgn }: { pgn: string }) {
  const engineRef = useRef<StockfishEngine | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [depth, setDepth] = useState(12);

  const run = async () => {
    if (running) return;
    if (!pgn.trim()) { toast.error("Paste a PGN first."); return; }
    let chess: Chess;
    try {
      chess = new Chess();
      chess.loadPgn(pgn, { strict: false });
    } catch (e: any) {
      toast.error("Could not parse PGN."); return;
    }
    const history = chess.history({ verbose: true });
    if (!history.length) { toast.error("PGN has no moves."); return; }
    if (history.length > 200) { toast.error("Game too long — max 200 plies."); return; }

    setRunning(true); setReport(null); setProgress(0);
    if (!engineRef.current) engineRef.current = new StockfishEngine();
    const eng = engineRef.current;
    try { await eng.init(); } catch (e) { toast.error("Engine failed to load."); setRunning(false); return; }

    const replay = new Chess();
    const reports: MoveReport[] = [];
    try {
      for (let i = 0; i < history.length; i++) {
        const move = history[i];
        const fenBefore = replay.fen();
        const stmBefore = replay.turn(); // side to move BEFORE the move
        // Engine's best from side-to-move
        const bestLine = await eng.bestMove(fenBefore, { depth });
        const evalBefore = bestLine.mate != null
          ? (bestLine.mate > 0 ? 10000 : -10000)
          : (bestLine.evalCp ?? 0);

        // Apply the actually-played move
        replay.move(move.san);
        const fenAfter = replay.fen();
        // From opponent's POV now — flip sign to keep POV of stmBefore
        const afterLine = await eng.bestMove(fenAfter, { depth });
        const evalOppPov = afterLine.mate != null
          ? (afterLine.mate > 0 ? 10000 : -10000)
          : (afterLine.evalCp ?? 0);
        const evalAfter = -evalOppPov;

        const loss = Math.max(0, evalBefore - evalAfter);

        // Detect a sac — material given up but still evaluated best-ish
        const sacrifice = !!(move.captured && pieceValue(move.piece) > pieceValue(move.captured) + 1);
        const tag = categorize(loss, sacrifice);
        const pieceCount = fenAfter.split(" ")[0].replace(/[^a-zA-Z]/g, "").length;

        reports.push({
          ply: i + 1,
          moveNo: Math.ceil((i + 1) / 2),
          side: stmBefore,
          san: move.san,
          played: `${move.from}${move.to}${move.promotion ?? ""}`,
          best: bestLine.bestmove,
          evalBefore, evalAfter, loss, tag,
          phase: phaseFor(Math.ceil((i + 1) / 2), pieceCount),
        });
        setProgress(Math.round(((i + 1) / history.length) * 100));
      }
    } catch (e: any) {
      console.error("[deep-analysis]", e);
      toast.error("Analysis error — showing partial results.");
    }

    const totals: Record<Tag, number> = { brilliant: 0, best: 0, great: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0 };
    const phaseLoss: Record<Phase, { count: number; totalLoss: number; misses: number }> = {
      opening: { count: 0, totalLoss: 0, misses: 0 },
      middlegame: { count: 0, totalLoss: 0, misses: 0 },
      endgame: { count: 0, totalLoss: 0, misses: 0 },
    };
    const whiteLoss: number[] = [];
    const blackLoss: number[] = [];
    for (const r of reports) {
      totals[r.tag]++;
      const bucket = phaseLoss[r.phase];
      bucket.count++; bucket.totalLoss += r.loss;
      if (r.tag === "mistake" || r.tag === "blunder" || r.tag === "inaccuracy") bucket.misses++;
      (r.side === "w" ? whiteLoss : blackLoss).push(r.loss);
    }

    setReport({
      moves: reports, totals, phaseLoss,
      accuracy: {
        white: accuracyFromLoss(whiteLoss),
        black: accuracyFromLoss(blackLoss),
      },
    });
    setRunning(false);
  };

  const tacticalMisses = useMemo(() => {
    if (!report) return 0;
    return report.moves.filter((m) => m.phase !== "opening" && (m.tag === "mistake" || m.tag === "blunder")).length;
  }, [report]);

  return (
    <div className="card-elevated rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-lg">Deep engine review</h3>
          <p className="text-xs text-muted-foreground">Runs Stockfish locally in your browser — one pass per move.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Depth
            <select value={depth} onChange={(e) => setDepth(Number(e.target.value))}
              className="ml-1 bg-secondary rounded px-1.5 py-1 text-xs">
              <option value={10}>10 (fast)</option>
              <option value={12}>12</option>
              <option value={14}>14</option>
              <option value={16}>16 (slow)</option>
            </select>
          </label>
          <button onClick={run} disabled={running}
            className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm flex items-center gap-1.5 disabled:opacity-60">
            {running ? <><Loader2 className="h-4 w-4 animate-spin" /> {progress}%</> : <><PlayCircle className="h-4 w-4" /> Run deep analysis</>}
          </button>
        </div>
      </div>

      {running && (
        <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {report && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/60 p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">White accuracy</div>
              <div className="text-2xl font-display text-primary">{report.accuracy.white}%</div>
            </div>
            <div className="rounded-lg border border-border/60 p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Black accuracy</div>
              <div className="text-2xl font-display text-primary">{report.accuracy.black}%</div>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Move quality</div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {(Object.keys(TAG_META) as Tag[]).map((t) => (
                <div key={t} className="rounded-lg bg-secondary/60 border border-border/50 p-2 text-center">
                  <div className={`text-[10px] uppercase tracking-wider ${TAG_META[t].color} flex items-center justify-center gap-1`}>
                    {TAG_META[t].icon}{TAG_META[t].label}
                  </div>
                  <div className="text-xl font-display">{report.totals[t]}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Phase misses (Aimchess-style)</div>
            <div className="grid grid-cols-3 gap-2">
              {(["opening", "middlegame", "endgame"] as Phase[]).map((p) => {
                const b = report.phaseLoss[p];
                const avg = b.count ? Math.round(b.totalLoss / b.count) : 0;
                return (
                  <div key={p} className="rounded-lg bg-secondary/50 border border-border/50 p-3">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{p}</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <div className="text-xl font-display text-primary">{b.misses}</div>
                      <div className="text-[10px] text-muted-foreground">misses</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground">avg loss {avg}cp · {b.count} moves</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Tactical misses across middlegame + endgame: <span className="text-foreground font-semibold">{tacticalMisses}</span>
            </div>
          </div>

          <details className="rounded-lg border border-border/60">
            <summary className="cursor-pointer text-xs px-3 py-2 text-muted-foreground">Show move-by-move ({report.moves.length})</summary>
            <div className="max-h-80 overflow-y-auto text-xs divide-y divide-border/40">
              {report.moves.map((m) => (
                <div key={m.ply} className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center px-3 py-1.5">
                  <span className="text-muted-foreground tabular-nums w-10">
                    {m.moveNo}{m.side === "w" ? "." : "…"}
                  </span>
                  <span className="font-mono">{m.san}</span>
                  <span className={`text-[10px] flex items-center gap-1 ${TAG_META[m.tag].color}`}>
                    {TAG_META[m.tag].icon}{TAG_META[m.tag].label}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    -{m.loss}cp
                  </span>
                </div>
              ))}
            </div>
          </details>
        </>
      )}
    </div>
  );
}
