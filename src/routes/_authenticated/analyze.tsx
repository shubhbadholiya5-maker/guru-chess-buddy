import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { AppShell } from "@/components/AppShell";
import { DeepAnalysis } from "@/components/DeepAnalysis";
import { analyzePgn, analyzeBatchPgns } from "@/lib/coach.functions";
import { Radio } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/analyze")({
  component: AnalyzePage,
  head: () => ({
    meta: [
      { title: "Game Analysis — Chess Trainer" },
      { name: "description", content: "Paste your PGN and get a Grandmaster-style coach review: mistakes, recurring patterns, and a concrete action plan to improve." },
    ],
  }),
});

const SAMPLE = `[Event "Sample"]
[White "Me"]
[Black "Opponent"]
[Result "0-1"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. Nxf7 Kxf7 7. Qf3+ Ke6 8. Nc3 Nce7 9. d4 c6 10. Bg5 h6 11. Bxe7 Bxe7 12. O-O-O Rf8 13. Qe4 Bf5 14. Qxe5+ Bf6 15. Qxd5+ Qxd5 16. Nxd5 cxd5 17. Bxd5+ Kf7 0-1`;

function AnalyzePage() {
  const [mode, setMode] = useState<"single" | "batch">("single");

  return (
    <AppShell title="Game Analysis">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 p-1 rounded-lg bg-card/50 border border-border/60 w-fit">
          <button onClick={() => setMode("single")} className={`px-4 py-1.5 text-sm rounded-md ${mode === "single" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Single Game</button>
          <button onClick={() => setMode("batch")} className={`px-4 py-1.5 text-sm rounded-md ${mode === "batch" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Recurring Patterns (up to 20)</button>
        </div>
        <Link to="/live-talk"
          className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 text-sm">
          <Radio className="h-4 w-4" /> Live Talk Examples
        </Link>
      </div>

      {mode === "single" ? <SingleMode /> : <BatchMode />}
    </AppShell>
  );
}

function SingleMode() {
  const analyze = useServerFn(analyzePgn);
  const [pgn, setPgn] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string; blunders: number; mistakes: number } | null>(null);

  const run = async () => {
    if (pgn.trim().length < 10) { toast.error("Paste a PGN first"); return; }
    setLoading(true); setResult(null);
    try { setResult(await analyze({ data: { pgn } })); }
    catch (e: any) { toast.error(e?.message ?? "Analysis failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card-elevated rounded-2xl p-5 space-y-3">
        <div className="text-sm text-muted-foreground">Paste one PGN. Guru will review like a coach — not an engine dump.</div>
        <textarea value={pgn} onChange={(e) => setPgn(e.target.value)}
          placeholder="[Event ...] 1. e4 e5 ..."
          className="w-full h-72 p-3 rounded-md bg-input border border-border font-mono text-xs" />
        <div className="flex gap-2">
          <button onClick={() => setPgn(SAMPLE)} className="px-3 py-2 text-sm rounded-md border border-border">Load sample</button>
          <button onClick={run} disabled={loading} className="flex-1 py-2.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-60">
            {loading ? "Analyzing…" : "Analyze with Guru"}
          </button>
        </div>
      </div>

      <div className="card-elevated rounded-2xl p-5 min-h-72">
        {!result && !loading && <div className="text-muted-foreground text-sm">Your coach review will appear here.</div>}
        {loading && <div className="text-muted-foreground text-sm italic">Reviewing the game…</div>}
        {result && (
          <>
            <div className="flex gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-secondary text-xs">Blunders: {result.blunders}</div>
              <div className="px-3 py-1 rounded-full bg-secondary text-xs">Mistakes: {result.mistakes}</div>
            </div>
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{result.summary}</ReactMarkdown>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BatchMode() {
  const analyze = useServerFn(analyzeBatchPgns);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string; count: number } | null>(null);

  const splitPgns = (raw: string): string[] => {
    // split on [Event boundaries but keep them
    const parts = raw.split(/\n(?=\[Event )/g).map(s => s.trim()).filter(s => s.length > 20);
    return parts.length ? parts : (raw.trim().length > 20 ? [raw.trim()] : []);
  };

  const run = async () => {
    const pgns = splitPgns(text).slice(0, 20);
    if (!pgns.length) { toast.error("Paste one or more PGNs"); return; }
    setLoading(true); setResult(null);
    try { setResult(await analyze({ data: { pgns } })); }
    catch (e: any) { toast.error(e?.message ?? "Batch analysis failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card-elevated rounded-2xl p-5 space-y-3">
        <div className="text-sm text-muted-foreground">Paste multiple PGNs back-to-back. Guru will find the mistakes you keep making and give you a 7-day fix plan.</div>
        <textarea value={text} onChange={(e) => setText(e.target.value)}
          placeholder="[Event ...] ... 1-0&#10;&#10;[Event ...] ... 0-1"
          className="w-full h-72 p-3 rounded-md bg-input border border-border font-mono text-xs" />
        <button onClick={run} disabled={loading} className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-60">
          {loading ? "Reviewing all games…" : "Find recurring mistakes"}
        </button>
      </div>
      <div className="card-elevated rounded-2xl p-5 min-h-72">
        {!result && !loading && <div className="text-muted-foreground text-sm">Your recurring-pattern report will appear here.</div>}
        {loading && <div className="text-muted-foreground text-sm italic">Comparing games and building your 7-day plan…</div>}
        {result && (
          <>
            <div className="mb-4 text-xs text-muted-foreground">Reviewed {result.count} games</div>
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{result.summary}</ReactMarkdown>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
