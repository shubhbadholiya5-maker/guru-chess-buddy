import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { LESSONS, PHASES, BANDS, type Band, type Lang, type Lesson } from "@/lib/masterclass";
import { LESSON_EXAMPLES } from "@/lib/masterclass-examples";
import { MiniAutoBoard } from "@/components/MiniAutoBoard";
import { speakText } from "@/lib/tts.functions";
import { Volume2, Loader2, Square, Radio } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/masterclass")({
  component: MasterclassPage,
  head: () => ({
    meta: [
      { title: "Masterclass — Thinking Patterns | Chess Trainer" },
      { name: "description", content: "Structured lessons on how to think during Openings, Middlegames, and Endgames — tailored by rating, in English and Hindi, with voice narration." },
    ],
  }),
});

function MasterclassPage() {
  const [band, setBand] = useState<Band>("1500");
  const [lang, setLang] = useState<Lang>("en");

  const lessons = useMemo(() => {
    const forBand = LESSONS.filter(l => l.band === band);
    return PHASES.map(p => forBand.find(l => l.phase === p.id)).filter(Boolean) as Lesson[];
  }, [band]);

  return (
    <AppShell title="Masterclass — Thinking Patterns">
      <div className="flex flex-wrap items-start justify-between gap-4 -mt-2 mb-6">
        <p className="text-muted-foreground max-w-2xl">
          How a Grandmaster thinks through each phase of the game. Choose your rating band and language, then listen while you study the board.
        </p>
        <Link to="/live-talk"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 text-sm">
          <Radio className="h-4 w-4" /> Launch Live Talk
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex gap-1 p-1 rounded-lg bg-card/50 border border-border/60">
          {BANDS.map(b => (
            <button key={b.id}
              onClick={() => setBand(b.id)}
              className={`px-3 py-1.5 text-sm rounded-md transition ${band === b.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >{b.label} <span className="opacity-60 hidden sm:inline">· {b.range}</span></button>
          ))}
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-card/50 border border-border/60">
          {(["en","hi"] as Lang[]).map(l => (
            <button key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 text-sm rounded-md ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >{l === "en" ? "English" : "हिन्दी"}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {lessons.map(lesson => <LessonCard key={lesson.id} lesson={lesson} lang={lang} />)}
      </div>
    </AppShell>
  );
}

function LessonCard({ lesson, lang }: { lesson: Lesson; lang: Lang }) {
  const tts = useServerFn(speakText);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const play = async () => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }
    setLoading(true);
    try {
      const { audioBase64, mime } = await tts({ data: { text: lesson.script[lang], lang } });
      const audio = new Audio(`data:${mime};base64,${audioBase64}`);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.onerror = () => { setPlaying(false); toast.error("Playback failed"); };
      await audio.play();
      setPlaying(true);
    } catch (e: any) {
      toast.error(e?.message ?? "Voice failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="card-elevated rounded-2xl p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display text-lg leading-snug">{lesson.title[lang]}</h3>
        <button
          onClick={play}
          className="shrink-0 h-9 w-9 grid place-items-center rounded-full bg-primary/15 text-primary hover:bg-primary/25"
          aria-label="Play lesson audio"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : playing ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {lesson.bullets[lang].map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
          Live example · {LESSON_EXAMPLES[lesson.phase].title}
        </div>
        <MiniAutoBoard
          fen={LESSON_EXAMPLES[lesson.phase].fen}
          moves={LESSON_EXAMPLES[lesson.phase].moves}
          captions={LESSON_EXAMPLES[lesson.phase].captions}
          intro={LESSON_EXAMPLES[lesson.phase].intro}
          size={240}
          speedMs={1200}
          autoStart={false}
        />
      </div>
    </article>
  );
}
