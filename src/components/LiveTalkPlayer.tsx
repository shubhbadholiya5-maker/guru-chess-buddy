import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useServerFn } from "@tanstack/react-start";
import { speakText } from "@/lib/tts.functions";
import { LIVE_TALK_EXAMPLES, type LiveTalkExample, type Lang } from "@/lib/live-talk-examples";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useAvatar } from "@/components/AvatarProvider";

const MOVE_DELAY_MS = 900;

export default function LiveTalkPlayer({ lang: initialLang = "en" }: { lang?: Lang }) {
  const tts = useServerFn(speakText);
  const { setSpeaking } = useAvatar();
  const [idx, setIdx] = useState(0);
  const [lang, setLang] = useState<Lang>(initialLang);
  const [playing, setPlaying] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1); // -1 = intro
  const [fen, setFen] = useState(LIVE_TALK_EXAMPLES[0].fen);
  const [caption, setCaption] = useState("");
  const abortRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const example: LiveTalkExample = LIVE_TALK_EXAMPLES[idx];

  useEffect(() => {
    resetTo(idx);
    return () => { abortRef.current = true; stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const stop = () => {
    abortRef.current = true;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlaying(false);
    setSpeaking(false);
  };

  const resetTo = (i: number) => {
    stop();
    setStepIdx(-1);
    setFen(LIVE_TALK_EXAMPLES[i].fen);
    setCaption("");
  };

  const narrate = async (text: string): Promise<void> => {
    if (!text) return;
    setCaption(text);
    setSpeaking(true);
    try {
      const { audioBase64, mime } = await tts({ data: { text, lang } });
      if (abortRef.current) return;
      const audio = new Audio(`data:${mime};base64,${audioBase64}`);
      audioRef.current = audio;
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
    } catch (e: any) {
      toast.error(e?.message ?? "Voice failed");
    } finally {
      setSpeaking(false);
    }
  };

  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const play = async () => {
    abortRef.current = false;
    setPlaying(true);
    // Intro
    if (stepIdx < 0) {
      await narrate(example.intro[lang]);
      if (abortRef.current) return;
    }
    const game = new Chess(example.fen);
    // replay up to current step
    for (let s = 0; s <= Math.max(stepIdx, -1); s++) {
      if (s >= 0) try { game.move(example.steps[s].san); } catch { /* ignore */ }
    }
    for (let s = Math.max(stepIdx + 1, 0); s < example.steps.length; s++) {
      if (abortRef.current) return;
      const step = example.steps[s];
      try { game.move(step.san); } catch { toast.error(`Illegal step: ${step.san}`); break; }
      setFen(game.fen());
      setStepIdx(s);
      await wait(MOVE_DELAY_MS);
      if (abortRef.current) return;
      await narrate(`${step.san}. ${step[lang]}`);
    }
    setPlaying(false);
  };

  const prev = () => { if (idx > 0) setIdx(idx - 1); };
  const next = () => { if (idx < LIVE_TALK_EXAMPLES.length - 1) setIdx(idx + 1); };

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
      <div className="card-elevated rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary/80">{example.theme}</div>
            <h2 className="font-display text-xl leading-tight">{example.title}</h2>
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-card/50 border border-border/60 text-xs">
            {(["en", "hi"] as Lang[]).map((l) => (
              <button key={l} onClick={() => { stop(); setLang(l); }}
                className={`px-2 py-1 rounded ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                {l === "en" ? "EN" : "हिं"}
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-[560px] mx-auto">
          <Chessboard position={fen} arePiecesDraggable={false} boardWidth={520} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={prev} disabled={idx === 0}
            className="h-9 px-3 rounded-md bg-card border border-border/60 text-sm flex items-center gap-1 disabled:opacity-40">
            <SkipBack className="h-4 w-4" /> Prev
          </button>
          {playing ? (
            <button onClick={stop} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm flex items-center gap-2">
              <Pause className="h-4 w-4" /> Stop
            </button>
          ) : (
            <button onClick={play} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm flex items-center gap-2">
              <Play className="h-4 w-4" /> {stepIdx < 0 ? "Play Live Talk" : "Resume"}
            </button>
          )}
          <button onClick={() => resetTo(idx)} className="h-9 px-3 rounded-md bg-card border border-border/60 text-sm">
            Restart
          </button>
          <button onClick={next} disabled={idx === LIVE_TALK_EXAMPLES.length - 1}
            className="h-9 px-3 rounded-md bg-card border border-border/60 text-sm flex items-center gap-1 disabled:opacity-40">
            Next <SkipForward className="h-4 w-4" />
          </button>
          <span className="ml-auto text-xs text-muted-foreground">
            {idx + 1} / {LIVE_TALK_EXAMPLES.length}
          </span>
        </div>
        {caption && (
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm flex gap-2">
            <Volume2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{caption}</span>
          </div>
        )}
      </div>

      <aside className="card-elevated rounded-2xl p-4">
        <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-3">Middlegame Library</h3>
        <ol className="space-y-1 max-h-[540px] overflow-auto pr-1">
          {LIVE_TALK_EXAMPLES.map((ex, i) => (
            <li key={ex.id}>
              <button onClick={() => setIdx(i)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${i === idx ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:bg-card/60"}`}>
                <div className="font-medium">{i + 1}. {ex.title}</div>
                <div className="text-[11px] opacity-70">{ex.theme}</div>
              </button>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
