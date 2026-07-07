import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { fetchLichessPuzzle, fetchOpeningExplorer, type LichessPuzzle, type ExplorerResult } from "@/lib/lichess.functions";
import { speak, stopSpeaking, type Lang } from "@/lib/voice";
import { useAvatar } from "@/components/AvatarProvider";
import { toast } from "sonner";
import { Volume2, VolumeX, RotateCcw, ChevronRight, Sparkles, BookOpen, Target, Swords } from "lucide-react";

export const Route = createFileRoute("/_authenticated/explorer")({
  component: ExplorerPage,
});

type Mode = "puzzles" | "openings";

const DIFFICULTIES = [
  { label: "Beginner (600–1000)", min: 600, max: 1000 },
  { label: "Improver (1000–1300)", min: 1000, max: 1300 },
  { label: "Intermediate (1300–1600)", min: 1300, max: 1600 },
  { label: "Advanced (1600–2000)", min: 1600, max: 2000 },
  { label: "Expert (2000+)", min: 2000, max: 2600 },
];

const THEMES = [
  { id: "mix", label: "🎲 Mixed" },
  { id: "fork", label: "🍴 Fork" },
  { id: "pin", label: "📌 Pin" },
  { id: "skewer", label: "🗡️ Skewer" },
  { id: "discoveredAttack", label: "💥 Discovered" },
  { id: "doubleCheck", label: "‼️ Double Check" },
  { id: "mateIn1", label: "♛ Mate in 1" },
  { id: "mateIn2", label: "♛ Mate in 2" },
  { id: "mateIn3", label: "♛ Mate in 3" },
  { id: "middlegame", label: "🧠 Middlegame" },
  { id: "endgame", label: "🏰 Endgame" },
  { id: "advantage", label: "📈 Advantage" },
  { id: "crushing", label: "💣 Crushing" },
  { id: "queensideAttack", label: "⬅️ Queenside" },
  { id: "kingsideAttack", label: "➡️ Kingside" },
];

function ExplorerPage() {
  const [mode, setMode] = useState<Mode>("puzzles");
  const [lang, setLang] = useState<Lang>("hinglish");
  const [voiceOut, setVoiceOut] = useState(true);

  return (
    <AppShell title="Live Explorer">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => setMode("puzzles")} className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 ${mode === "puzzles" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
          <Target className="h-4 w-4" /> Lichess Puzzles
        </button>
        <button onClick={() => setMode("openings")} className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 ${mode === "openings" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
          <BookOpen className="h-4 w-4" /> Opening Explorer
        </button>
        <div className="ml-auto flex items-center gap-2">
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="bg-secondary text-foreground rounded-md px-2 py-1 text-xs">
            <option value="hinglish">Hinglish</option>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
          <button onClick={() => { setVoiceOut((v) => !v); if (voiceOut) stopSpeaking(); }} className="p-1.5 rounded-md bg-secondary text-muted-foreground hover:text-foreground" title="Toggle voice">
            {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mode === "puzzles" ? <PuzzlesPanel lang={lang} voiceOut={voiceOut} /> : <OpeningExplorerPanel lang={lang} voiceOut={voiceOut} />}
    </AppShell>
  );
}

/* ------------------------- Lichess Puzzles Panel ------------------------- */

function PuzzlesPanel({ lang, voiceOut }: { lang: Lang; voiceOut: boolean }) {
  const fetchPuzzle = useServerFn(fetchLichessPuzzle);
  const { hint } = useAvatar();
  const [diff, setDiff] = useState(2);
  const [theme, setTheme] = useState("mix");
  const [puzzle, setPuzzle] = useState<LichessPuzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useState<Chess | null>(null);
  const [step, setStep] = useState(0); // index into solutionUci consumed
  const [status, setStatus] = useState("");
  const [boardSize, setBoardSize] = useState(360);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [flash, setFlash] = useState<{ from?: string; to: string; kind: "good" | "bad" } | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const doFlash = (kind: "good" | "bad", to: string, from?: string) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlash({ kind, to, from });
    flashTimer.current = setTimeout(() => setFlash(null), 900);
  };

  useEffect(() => {
    const calc = () => {
      const w = containerRef.current?.clientWidth ?? 360;
      setBoardSize(Math.min(560, Math.max(280, w - 16)));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const loadNew = async () => {
    setLoading(true);
    stopSpeaking();
    try {
      const d = DIFFICULTIES[diff];
      const p = await fetchPuzzle({ data: { theme, minRating: d.min, maxRating: d.max } });
      const g = new Chess(p.fen);
      // Play opponent's first setup move automatically
      if (p.solutionUci.length > 0) {
        const m = p.solutionUci[0];
        g.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m.length > 4 ? m[4] : undefined });
      }
      setPuzzle(p);
      setGame(g);
      setStep(1);
      setOrientation(g.turn() === "w" ? "white" : "black");
      const opener = pickGreeting(lang);
      setStatus(`${opener} Rating **${p.rating}** • Find the best move for ${g.turn() === "w" ? "White" : "Black"}.`);
      if (voiceOut) speak(`${opener} Puzzle rating ${p.rating}. Find the best move for ${g.turn() === "w" ? "White" : "Black"}.`, lang);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not load puzzle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNew(); /* eslint-disable-next-line */ }, []);

  const wrongHint = (): string => {
    const pool = [
      "Wrong square! Look for **checks, captures, and threats** first.",
      "Not quite — kaunsa piece opponent ke king ke sabse paas hai?",
      "Try again. Search for a **forcing move** before a quiet one.",
      "Not the top line. Kis square par tumhare pieces converge kar rahe hain?",
      "Nope — think about undefended enemy pieces (LPDO: loose pieces drop off).",
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const tryMove = (from: string, to: string, promo?: string): boolean => {
    if (!puzzle || !game) return false;
    const expected = puzzle.solutionUci[step];
    if (!expected) return false;
    const expFrom = expected.slice(0, 2);
    const expTo = expected.slice(2, 4);
    const expPromo = expected.length > 4 ? expected[4] : undefined;
    if (from !== expFrom || to !== expTo || (expPromo && promo !== expPromo)) {
      doFlash("bad", to, from);
      setStatus("❌ Not the engine's top line. Think checks, captures, threats.");
      hint(wrongHint());
      if (voiceOut) speak("Not quite. Reconsider checks, captures, and threats.", lang);
      return false;
    }
    doFlash("good", to, from);
    const g = new Chess(game.fen());
    g.move({ from, to, promotion: promo });
    setGame(g);
    let nextStep = step + 1;
    // Auto-play opponent reply
    if (nextStep < puzzle.solutionUci.length) {
      const reply = puzzle.solutionUci[nextStep];
      g.move({ from: reply.slice(0, 2), to: reply.slice(2, 4), promotion: reply.length > 4 ? reply[4] : undefined });
      setGame(new Chess(g.fen()));
      nextStep++;
    }
    setStep(nextStep);
    if (nextStep >= puzzle.solutionUci.length) {
      setStatus("✅ **Solved!** Brilliant — that's grandmaster-level calculation.");
      hint("Solved! Move to the next puzzle.");
      if (voiceOut) speak("Solved. Brilliant calculation.", lang);
    } else {
      setStatus("✅ Correct! Keep going — find the next best move.");
      if (voiceOut) speak("Correct. Find the next move.", lang);
    }
    return true;
  };

  const squareStyles = useMemo(() => {
    if (!flash) return {};
    const color = flash.kind === "good"
      ? "rgba(34,197,94,0.55)"
      : "rgba(239,68,68,0.65)";
    const styles: Record<string, React.CSSProperties> = {
      [flash.to]: { background: color, boxShadow: `inset 0 0 0 3px ${color}` },
    };
    if (flash.from) styles[flash.from] = { background: "rgba(234,179,8,0.35)" };
    return styles;
  }, [flash]);

  const pgn = useMemo(() => {
    if (!puzzle || !game) return "";
    // Build PGN of moves PLAYED so far from the puzzle start position
    const replay = new Chess(puzzle.fen);
    for (let i = 0; i < step; i++) {
      const m = puzzle.solutionUci[i];
      replay.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m.length > 4 ? m[4] : undefined });
    }
    return replay.pgn();
  }, [puzzle, game, step]);

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-4">
      <div ref={containerRef} className="space-y-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <select value={diff} onChange={(e) => setDiff(Number(e.target.value))} className="bg-secondary rounded-md px-2 py-1.5">
            {DIFFICULTIES.map((d, i) => <option key={i} value={i}>{d.label}</option>)}
          </select>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="bg-secondary rounded-md px-2 py-1.5">
            {THEMES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <button onClick={loadNew} disabled={loading} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground flex items-center gap-1 disabled:opacity-50">
            <Sparkles className="h-3.5 w-3.5" /> {loading ? "Loading…" : "New Puzzle"}
          </button>
          {puzzle && (
            <button onClick={() => { const g = new Chess(puzzle.fen); if (puzzle.solutionUci[0]) { const m = puzzle.solutionUci[0]; g.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m.length > 4 ? m[4] : undefined }); } setGame(g); setStep(1); setStatus("Reset — try again."); }} className="px-3 py-1.5 rounded-md bg-secondary text-muted-foreground flex items-center gap-1">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          )}
        </div>

        <div className="rounded-xl overflow-hidden border border-border/60 bg-card/40 p-2 mx-auto" style={{ width: boardSize + 16 }}>
          {game && (
            <Chessboard
              position={game.fen()}
              boardWidth={boardSize}
              boardOrientation={orientation}
              onPieceDrop={(source: string, target: string) => tryMove(source, target, "q")}
            />
          )}
        </div>

        {puzzle && (
          <div className="text-xs text-muted-foreground space-y-1.5">
            <div className="font-mono bg-secondary/40 rounded px-2 py-1.5 break-all">
              <span className="text-foreground/80 font-semibold">PGN:</span> {pgn || "—"}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {puzzle.themes.slice(0, 6).map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-secondary text-[10px]">{t}</span>
              ))}
              <a href={puzzle.gameUrl} target="_blank" rel="noopener" className="text-primary underline text-[10px]">View on Lichess</a>
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-3">
        <div className="rounded-xl border border-border/60 bg-card/40 p-3 text-sm">
          <p className="text-muted-foreground whitespace-pre-wrap">{status || "Loading…"}</p>
        </div>
        {puzzle && (
          <Link to="/play" className="block w-full px-3 py-2 rounded-md bg-secondary text-foreground text-sm text-center flex items-center justify-center gap-2">
            <Swords className="h-4 w-4" /> Practice vs Engine
          </Link>
        )}
        <button onClick={loadNew} className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm flex items-center justify-center gap-2">
          <ChevronRight className="h-4 w-4" /> Next Puzzle
        </button>
      </aside>
    </div>
  );
}

/* ------------------------- Opening Explorer Panel ------------------------- */

function OpeningExplorerPanel({ lang, voiceOut }: { lang: Lang; voiceOut: boolean }) {
  const fetchExplorer = useServerFn(fetchOpeningExplorer);
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [data, setData] = useState<ExplorerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [db, setDb] = useState<"masters" | "lichess">("masters");
  const [boardSize, setBoardSize] = useState(360);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calc = () => setBoardSize(Math.min(560, Math.max(280, (containerRef.current?.clientWidth ?? 360) - 16)));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchExplorer({ data: { fen, db } })
      .then((r) => { if (alive) { setData(r); if (voiceOut && r.opening) speak(`${r.opening.name}`, lang); } })
      .catch((e) => toast.error(e?.message ?? "Explorer error"))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [fen, db]);

  const play = (uci: string) => {
    const g = new Chess(game.fen());
    g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.length > 4 ? uci[4] : undefined });
    setGame(g);
    setFen(g.fen());
  };

  const undo = () => {
    const g = new Chess(game.fen());
    g.undo();
    setGame(g);
    setFen(g.fen());
  };

  const reset = () => {
    const g = new Chess();
    setGame(g);
    setFen(g.fen());
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-4">
      <div ref={containerRef} className="space-y-3">
        <div className="flex flex-wrap gap-2 text-xs items-center">
          <select value={db} onChange={(e) => setDb(e.target.value as any)} className="bg-secondary rounded-md px-2 py-1.5">
            <option value="masters">Master DB (2200+)</option>
            <option value="lichess">Lichess DB (all players)</option>
          </select>
          <button onClick={undo} className="px-3 py-1.5 rounded-md bg-secondary text-muted-foreground">Undo</button>
          <button onClick={reset} className="px-3 py-1.5 rounded-md bg-secondary text-muted-foreground flex items-center gap-1">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          {data?.opening && <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[11px]">{data.opening.eco} • {data.opening.name}</span>}
        </div>

        <div className="rounded-xl overflow-hidden border border-border/60 bg-card/40 p-2 mx-auto" style={{ width: boardSize + 16 }}>
          <Chessboard
            position={fen}
            boardWidth={boardSize}
            onPieceDrop={(source: string, target: string) => {
              try {
                const g = new Chess(game.fen());
                g.move({ from: source, to: target, promotion: "q" });
                setGame(g);
                setFen(g.fen());
                return true;
              } catch { return false; }
            }}
          />
        </div>

        <div className="font-mono text-xs bg-secondary/40 rounded px-2 py-1.5 break-all">
          <span className="text-foreground/80 font-semibold">PGN:</span> {game.pgn() || "—"}
        </div>
      </div>

      <aside className="space-y-2">
        <div className="text-xs text-muted-foreground">
          {loading ? "Loading master games…" : data ? `${data.total.toLocaleString()} games` : "—"}
        </div>
        {data && data.total > 0 && (
          <div className="flex h-2 rounded-full overflow-hidden border border-border/60">
            <div className="bg-foreground" style={{ width: `${(data.white / data.total) * 100}%` }} />
            <div className="bg-muted" style={{ width: `${(data.draws / data.total) * 100}%` }} />
            <div className="bg-foreground/30" style={{ width: `${(data.black / data.total) * 100}%` }} />
          </div>
        )}
        <div className="space-y-1 max-h-[480px] overflow-y-auto">
          {data?.moves.map((m) => {
            const wp = m.total > 0 ? Math.round((m.white / m.total) * 100) : 0;
            const dp = m.total > 0 ? Math.round((m.draws / m.total) * 100) : 0;
            const bp = 100 - wp - dp;
            return (
              <button key={m.uci} onClick={() => play(m.uci)} className="w-full text-left px-3 py-2 rounded-md bg-secondary/60 hover:bg-secondary transition">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{m.san}</span>
                  <span className="text-xs text-muted-foreground">{m.total.toLocaleString()} {m.averageRating ? `· ${m.averageRating}` : ""}</span>
                </div>
                <div className="flex h-1.5 mt-1 rounded-full overflow-hidden">
                  <div className="bg-foreground" style={{ width: `${wp}%` }} title={`White ${wp}%`} />
                  <div className="bg-muted" style={{ width: `${dp}%` }} title={`Draws ${dp}%`} />
                  <div className="bg-foreground/30" style={{ width: `${bp}%` }} title={`Black ${bp}%`} />
                </div>
              </button>
            );
          })}
          {data && data.moves.length === 0 && <p className="text-xs text-muted-foreground">No master games from this position — you've reached an unexplored line.</p>}
        </div>
      </aside>
    </div>
  );
}

/* ------------------------- helpers ------------------------- */

function pickGreeting(lang: Lang): string {
  const en = [
    "Let's analyze this.",
    "Ready to crush this puzzle?",
    "Lock in — calculation time.",
    "Find the tactic.",
    "Sharp eyes — what do you see?",
    "Time to think like a GM.",
  ];
  const hi = [
    "Chalo isse solve karte hain.",
    "Tayyar ho? Calculation mode on.",
    "Position dekho, tactic dhoondho.",
    "Sharp raho — kya dikh raha hai?",
    "GM ki tarah socho.",
  ];
  const pool = lang === "en" ? en : hi;
  return pool[Math.floor(Math.random() * pool.length)];
}
