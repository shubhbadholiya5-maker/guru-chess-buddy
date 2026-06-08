import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { AppShell } from "@/components/AppShell";
import { TRAPS, type Trap } from "@/lib/traps";
import { explainTrap } from "@/lib/coach.functions";
import { supabase } from "@/integrations/supabase/client";
import { speak, stopSpeaking, type Lang } from "@/lib/voice";
import { toast } from "sonner";
import { AlertTriangle, GraduationCap, Volume2, VolumeX, RotateCcw, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/traps")({
  component: TrapsPage,
});

function TrapsPage() {
  const [selected, setSelected] = useState<Trap | null>(null);
  return (
    <AppShell title="Traps Academy">
      {!selected ? (
        <TrapPicker onPick={setSelected} />
      ) : (
        <TrapRunner trap={selected} onExit={() => setSelected(null)} />
      )}
    </AppShell>
  );
}

function TrapPicker({ onPick }: { onPick: (t: Trap) => void }) {
  return (
    <div>
      <p className="text-muted-foreground mb-6 max-w-2xl">
        Famous opening traps seekho. Aap <strong>trap lagane wale</strong> ho — opponent ki moves automatic chalengi (woh trap mein gir raha hai). Aapko sahi punishing moves dhundhne hain.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TRAPS.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t)}
            className="card-elevated rounded-xl p-5 text-left hover:border-primary/50 border border-transparent transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-lg gold-gradient">{t.name}</span>
              <AlertTriangle className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-secondary">{t.opening}</span>
              <span className="px-2 py-0.5 rounded bg-secondary">{t.side === "white" ? "♔ White" : "♚ Black"}</span>
              <span className="px-2 py-0.5 rounded bg-secondary">{t.difficulty}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t.idea}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

type Phase = "waiting-user" | "explaining" | "auto-opponent" | "completed";

function TrapRunner({ trap, onExit }: { trap: Trap; onExit: () => void }) {
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [moveIdx, setMoveIdx] = useState(0);
  const [coachMsg, setCoachMsg] = useState<string>(
    `**${trap.name}** (${trap.opening}). Aap ${trap.side === "white" ? "White (trapper)" : "Black (trapper)"} ho.\n\n${trap.side === "white" ? "Pehla move aap chalo." : "Pehle White ka move auto chalega, phir aap."}`,
  );
  const [coachLoading, setCoachLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>(trap.side === "white" ? "waiting-user" : "auto-opponent");
  const [lang, setLang] = useState<Lang>("hinglish");
  const [voiceOut, setVoiceOut] = useState(true);
  const explainFn = useServerFn(explainTrap);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("language").eq("id", data.user.id).maybeSingle();
      if (p?.language) setLang(p.language as Lang);
    });
  }, []);

  // Board size
  const [size, setSize] = useState<number>(() => (typeof window === "undefined" ? 360 : Math.min(520, window.innerWidth - 48)));
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

  // Voice
  useEffect(() => {
    if (!voiceOut || coachLoading || !coachMsg) return;
    speak(stripMd(coachMsg), lang);
  }, [coachMsg, voiceOut, coachLoading, lang]);
  useEffect(() => () => stopSpeaking(), []);

  const userTurn = (idx: number) => {
    // White's moves are even indices (0,2,4...), Black's odd.
    if (trap.side === "white") return idx % 2 === 0;
    return idx % 2 === 1;
  };

  const askCoach = async (phaseArg: "midway" | "complete", lastSan: string) => {
    setCoachLoading(true);
    setCoachMsg("Guru soch raha hai…");
    try {
      const res = await explainFn({
        data: {
          trapName: trap.name,
          opening: trap.opening,
          userSide: trap.side,
          movesSoFar: game.history().join(" "),
          lastMoveSan: lastSan,
          movedBy: game.turn() === "w" ? "b" : "w", // who just moved
          fenAfter: game.fen(),
          phase: phaseArg,
          idea: trap.idea,
          lesson: trap.lesson,
          lang,
        },
      });
      setCoachMsg(res.reply);
    } catch (e: any) {
      setCoachMsg("⚠️ " + (e?.message ?? "Coach unavailable."));
    } finally {
      setCoachLoading(false);
    }
  };

  // Auto-play opponent move (the "victim") when it's their turn
  const autoOpponentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (phase !== "auto-opponent") return;
    if (moveIdx >= trap.moves.length) return;
    autoOpponentTimer.current = setTimeout(() => {
      const san = trap.moves[moveIdx];
      try {
        const m = game.move(san);
        if (!m) return;
        setFen(game.fen());
        const nextIdx = moveIdx + 1;
        setMoveIdx(nextIdx);
        if (nextIdx >= trap.moves.length) {
          setPhase("completed");
          askCoach("complete", san);
        } else {
          setPhase("waiting-user");
          setCoachMsg(`Opponent ne **${san}** khela. Ab aapka move — trap ka next step kya hai? Socho: **threats, checks, captures**.`);
        }
      } catch (e) {
        console.error("auto move failed", e);
      }
    }, 900);
    return () => {
      if (autoOpponentTimer.current) clearTimeout(autoOpponentTimer.current);
    };
  }, [phase, moveIdx]);

  const onDrop = (source: string, target: string): boolean => {
    if (phase !== "waiting-user") {
      toast.info("Wait — opponent ka turn / Guru padh raha hai.");
      return false;
    }
    const expectedSan = trap.moves[moveIdx];
    if (!expectedSan) return false;
    // Try the move
    let played;
    try {
      played = game.move({ from: source, to: target, promotion: "q" });
    } catch {
      return false;
    }
    if (!played) return false;

    // Check if it matches the trap line
    if (played.san !== expectedSan) {
      // Wrong move — undo and hint
      game.undo();
      setFen(game.fen());
      toast.error(`Hmm, trap line mein yeh move nahi hai. Sahi move dhundo!`);
      setCoachMsg(`**${played.san}** trap line ka part nahi hai. Socho — aap **${trap.name}** chala rahe ho. ${trap.idea}\n\nKaunsa move opponent ki commitment ko punish karta hai? Try again.`);
      return false;
    }

    // Correct
    setFen(game.fen());
    const nextIdx = moveIdx + 1;
    setMoveIdx(nextIdx);
    if (nextIdx >= trap.moves.length) {
      setPhase("completed");
      askCoach("complete", played.san);
    } else {
      // Opponent's turn next
      setPhase("auto-opponent");
      setCoachMsg(`✅ **${played.san}** — sahi! Ab dekho opponent kya karta hai…`);
    }
    return true;
  };

  const reset = () => {
    game.reset();
    setFen(game.fen());
    setMoveIdx(0);
    setPhase(trap.side === "white" ? "waiting-user" : "auto-opponent");
    setCoachMsg(`**${trap.name}** restart. Apna pehla move chalo!`);
  };

  const progress = Math.round((moveIdx / trap.moves.length) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <button onClick={onExit} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to traps
        </button>
        <div className="flex items-center gap-2">
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="px-2 py-1 rounded-md bg-input border border-border text-xs">
            <option value="hinglish">Hinglish</option>
            <option value="hi">हिन्दी</option>
            <option value="en">English</option>
          </select>
          <button onClick={() => { setVoiceOut((v) => !v); stopSpeaking(); }} className="p-2 rounded-md border border-border" title={voiceOut ? "Mute" : "Unmute"}>
            {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button onClick={reset} className="p-2 rounded-md border border-border" title="Restart">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{trap.name} — {trap.opening}</span>
          <span>{moveIdx} / {trap.moves.length} moves</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_340px] gap-6">
        <div className="card-elevated rounded-xl p-4 flex items-center justify-center">
          <div style={{ width: size }}>
            <Chessboard
              position={fen}
              onPieceDrop={onDrop}
              boardWidth={size}
              boardOrientation={trap.side}
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
            <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed [&>*]:my-1 min-h-[100px]">
              {coachLoading ? <span className="italic text-muted-foreground">Guru soch raha hai…</span> : <ReactMarkdown>{coachMsg}</ReactMarkdown>}
            </div>
            {phase === "completed" && (
              <button onClick={reset} className="mt-3 w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                Try again
              </button>
            )}
          </div>
          <div className="card-elevated rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Moves played</div>
            <div className="font-mono text-sm leading-relaxed break-words">
              {game.history().length === 0 ? <span className="text-muted-foreground italic">— still empty —</span> : game.history().join(" ")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function stripMd(s: string) {
  return s.replace(/[#*_`>\[\]()]/g, "").replace(/\s+/g, " ").trim();
}
