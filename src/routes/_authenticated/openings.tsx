import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { AppShell } from "@/components/AppShell";
import { OPENINGS, type Opening } from "@/lib/openings";
import { explainOpeningMove } from "@/lib/coach.functions";
import { supabase } from "@/integrations/supabase/client";
import { speak, stopSpeaking, type Lang } from "@/lib/voice";
import { toast } from "sonner";
import { BookOpen, GraduationCap, Volume2, VolumeX, ChevronRight, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/openings")({
  component: OpeningsPage,
});

function OpeningsPage() {
  const [selected, setSelected] = useState<Opening | null>(null);

  return (
    <AppShell title="Opening Trainer">
      {!selected ? (
        <OpeningPicker onPick={setSelected} />
      ) : (
        <TrainerView opening={selected} onExit={() => setSelected(null)} />
      )}
    </AppShell>
  );
}

function OpeningPicker({ onPick }: { onPick: (o: Opening) => void }) {
  return (
    <div>
      <p className="text-muted-foreground mb-6 max-w-2xl">
        Ek opening choose karo. Guru har move ka <strong>reason</strong> Hinglish mein samjhayega aur next move ke baare mein
        sochne ke liye sawal puchega. Aap khud board pe move karoge — rote-learning nahi, samajh.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {OPENINGS.map((o) => (
          <button
            key={o.id}
            onClick={() => onPick(o)}
            className="card-elevated rounded-xl p-5 text-left hover:border-primary/50 border border-transparent transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-lg gold-gradient">{o.name}</span>
              <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span className="px-2 py-0.5 rounded bg-secondary">{o.side === "white" ? "♔ White" : "♚ Black"}</span>
              <span className="px-2 py-0.5 rounded bg-secondary">{o.level}</span>
              <span className="px-2 py-0.5 rounded bg-secondary">{o.moves.length} moves</span>
            </div>
            <p className="text-sm text-muted-foreground">{o.summary}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

type Phase = "waiting-user" | "explaining" | "auto-opponent";

function TrainerView({ opening, onExit }: { opening: Opening; onExit: () => void }) {
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [moveIdx, setMoveIdx] = useState(0); // next move index in opening.moves
  const [coachMsg, setCoachMsg] = useState<string>(
    `**${opening.name}** start karte hain! Aap ${opening.side === "white" ? "White" : "Black"} ho.\n\n${opening.side === "white" ? "Pehla move aap chalo — board pe drag karo." : "Pehle White ka move dekho, phir aap chaloge."}`,
  );
  const [coachLoading, setCoachLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>(opening.side === "white" ? "waiting-user" : "auto-opponent");
  const [lang, setLang] = useState<Lang>("hinglish");
  const [voiceOut, setVoiceOut] = useState(true);
  const [completed, setCompleted] = useState(false);
  const explain = useServerFn(explainOpeningMove);
  const boardOrientation = opening.side;

  // load language preference
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("language").eq("id", data.user.id).maybeSingle();
      if (p?.language) setLang(p.language as Lang);
    });
  }, []);

  const userSide: "w" | "b" = opening.side === "white" ? "w" : "b";

  // auto-play opponent move when it's their turn
  const autoOpponentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (phase !== "auto-opponent" || moveIdx >= opening.moves.length) return;
    const next = opening.moves[moveIdx];
    if (next.side === userSide) {
      setPhase("waiting-user");
      return;
    }
    autoOpponentTimer.current = setTimeout(() => {
      try {
        game.move(next.san);
        setFen(game.fen());
        setMoveIdx((i) => i + 1);
        askExplanation(next.san, moveIdx + 1, next.side, opening.moves.length === moveIdx + 1);
      } catch (e) {
        console.error("auto move failed", next.san, e);
      }
    }, 700);
    return () => {
      if (autoOpponentTimer.current) clearTimeout(autoOpponentTimer.current);
    };
  }, [phase, moveIdx]);

  const askExplanation = async (san: string, newIdx: number, movedBy: "w" | "b", isLast: boolean) => {
    setPhase("explaining");
    setCoachLoading(true);
    setCoachMsg("Guru soch raha hai…");
    try {
      const movesSoFar = game.history().join(" ");
      const res = await explain({
        data: {
          openingName: opening.name,
          side: opening.side,
          moveNumber: newIdx,
          moveSan: san,
          movedBy,
          movesSoFar,
          fenAfter: game.fen(),
          isLast,
          lang,
        },
      });
      setCoachMsg(res.reply);
    } catch (e: any) {
      const fallback = opening.moves[newIdx - 1]?.idea ?? "Move played.";
      setCoachMsg(`⚠️ ${e?.message ?? "Coach offline"}\n\n**Hint:** ${fallback}`);
    } finally {
      setCoachLoading(false);
      if (isLast) {
        setCompleted(true);
        setPhase("waiting-user");
      }
    }
  };

  const continueToNext = () => {
    if (completed) return;
    if (moveIdx >= opening.moves.length) {
      setCompleted(true);
      return;
    }
    const next = opening.moves[moveIdx];
    if (next.side === userSide) {
      setPhase("waiting-user");
      setCoachMsg(`Ab **aapka move** hai. Socho — kya idea ho sakta hai? Move ${Math.ceil((moveIdx + 1) / 2)}.`);
    } else {
      setPhase("auto-opponent");
      setCoachMsg("Opponent ka move aane do…");
    }
  };

  const onDrop = (source: string, target: string): boolean => {
    if (phase !== "waiting-user" || completed) {
      toast.info("Pehle Guru ka explanation padho aur Continue dabao.");
      return false;
    }
    if (moveIdx >= opening.moves.length) return false;
    const expected = opening.moves[moveIdx];
    if (expected.side !== userSide) return false;
    let move;
    try {
      move = game.move({ from: source, to: target, promotion: "q" });
    } catch {
      return false;
    }
    if (!move) return false;
    if (move.san !== expected.san) {
      // wrong move — undo
      game.undo();
      toast.error(`Book move nahi tha. Try: ${expected.san}`);
      setCoachMsg(`❌ **${move.san}** book line nahi hai is opening mein.\n\n**Hint:** ${expected.idea}\n\nDobara try karo — sahi move hai **${expected.san}**.`);
      return false;
    }
    setFen(game.fen());
    const newIdx = moveIdx + 1;
    setMoveIdx(newIdx);
    askExplanation(move.san, newIdx, move.color, newIdx === opening.moves.length);
    return true;
  };

  const reset = () => {
    if (autoOpponentTimer.current) clearTimeout(autoOpponentTimer.current);
    game.reset();
    setFen(game.fen());
    setMoveIdx(0);
    setCompleted(false);
    setCoachMsg(`**${opening.name}** restart. Aap ${opening.side === "white" ? "White" : "Black"} ho. ${opening.side === "white" ? "Pehla move chalo." : "White ka move dekho."}`);
    setPhase(opening.side === "white" ? "waiting-user" : "auto-opponent");
  };

  const showHint = () => {
    if (completed || moveIdx >= opening.moves.length) return;
    const m = opening.moves[moveIdx];
    toast.info(`Hint: ${m.san} — ${m.idea}`);
  };

  const [size, setSize] = useState<number>(() => {
    if (typeof window === "undefined") return 360;
    return Math.min(560, window.innerWidth - 32);
  });
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      // on md+ (>=768) leave room for 340px sidebar + gap + padding
      const max = w >= 768 ? Math.min(560, w - 340 - 80) : w - 48;
      setSize(Math.max(260, Math.min(560, max)));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Speak coach messages aloud when voice is on
  useEffect(() => {
    if (!voiceOut) return;
    if (coachLoading) return;
    if (!coachMsg) return;
    speak(stripMd(coachMsg), lang);
  }, [coachMsg, voiceOut, coachLoading, lang]);
  useEffect(() => () => stopSpeaking(), []);

  const progress = Math.round((moveIdx / opening.moves.length) * 100);
  const showContinue = phase === "explaining" && !coachLoading && !completed && moveIdx < opening.moves.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <button onClick={onExit} className="text-xs text-muted-foreground hover:text-foreground">← Saari openings</button>
          <h2 className="font-display text-2xl mt-1">{opening.name} <span className="text-sm text-muted-foreground">({opening.side === "white" ? "White" : "Black"})</span></h2>
        </div>
        <div className="flex items-center gap-2">
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="px-2 py-1.5 rounded-md bg-input border border-border text-xs">
            <option value="hinglish">Hinglish</option>
            <option value="hi">हिन्दी</option>
            <option value="en">English</option>
          </select>
          <button onClick={() => { setVoiceOut((v) => !v); stopSpeaking(); }} className="p-2 rounded-md border border-border" title="Toggle voice">
            {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button onClick={reset} className="p-2 rounded-md border border-border" title="Restart">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid md:grid-cols-[1fr_340px] gap-6">
        <div className="card-elevated rounded-xl p-4 flex items-center justify-center">
          <div style={{ width: size }}>
            <Chessboard
              position={fen}
              onPieceDrop={onDrop}
              boardWidth={size}
              boardOrientation={boardOrientation}
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
              {coachLoading ? <span className="italic text-muted-foreground">Guru soch raha hai…</span> : <ReactMarkdown>{coachMsg}</ReactMarkdown>}
            </div>
            {showContinue && (
              <button
                onClick={continueToNext}
                className="mt-3 w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            )}
            {completed && (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-muted-foreground">🎉 Opening complete! Middlegame plan upar likha hai.</div>
                <button onClick={reset} className="w-full py-2 rounded-md border border-primary/40 text-sm">Phir se practice karo</button>
              </div>
            )}
          </div>

          <div className="card-elevated rounded-xl p-4 space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Moves</div>
            <div className="font-mono text-sm leading-relaxed">
              {game.history().length === 0 ? (
                <span className="text-muted-foreground italic">Abhi koi move nahi.</span>
              ) : (
                game.history().map((m, i) => (
                  <span key={i} className="mr-2">
                    {i % 2 === 0 && <span className="text-muted-foreground">{Math.floor(i / 2) + 1}.</span>} {m}
                  </span>
                ))
              )}
            </div>
            {!completed && moveIdx < opening.moves.length && phase === "waiting-user" && opening.moves[moveIdx].side === userSide && (
              <button onClick={showHint} className="text-xs text-primary hover:underline">Need a hint?</button>
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
