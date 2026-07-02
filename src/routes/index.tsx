import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Bot, Puzzle, Swords, Mic, FileSearch } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Socratic AI Coach | Developed by Tech Student Shubh Badholiya" },
      { name: "description", content: "Socratic AI Coach: A futuristic Chess training platform with Stockfish 16.1 & GPT-4o logic, developed by Tech Student Shubh Badholiya." },
      { property: "og:title", content: "Socratic AI Coach" },
      { property: "og:description", content: "Futuristic AI chess training with Stockfish 16.1 & GPT-4o logic." },
    ],
  }),
  component: Landing,
});

function Feature({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <Icon className="h-6 w-6 text-primary" />
      <h3 className="mt-4 font-display text-xl">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden gemini-bg">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6 relative z-10">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary" />
          <span className="font-display text-xl gold-gradient">Socratic AI Coach</span>
        </div>
        <Link to="/auth" className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90">
          Sign in
        </Link>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-12 md:pt-20 pb-16 text-center relative z-10">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/80">A grandmaster in your pocket</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl leading-[1.05]">
          <span className="gold-gradient">Learn chess</span>
          <br />the way masters teach.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-muted-foreground text-lg">
          Powered by Stockfish 16.1 &amp; GPT-4o logic. Socratic coaching, daily tactics, full game analysis, and voice lessons in English, Hindi &amp; Hinglish — built for every player up to 2000.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/auth" className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90">
            Start free
          </Link>
          <Link to="/auth" className="px-6 py-3 rounded-md border border-primary/40 text-foreground hover:bg-secondary">
            Try the coach
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-4 relative z-10">
        <Feature icon={Bot} title="Socratic AI Coach" body="Guru asks the right questions before giving answers — exactly how a real human trainer teaches." />
        <Feature icon={Swords} title="Play Stockfish 16.1" body="Practice against a tunable engine from beginner to 2000 strength. Get coaching after every game." />
        <Feature icon={Puzzle} title="Daily Tactics" body="A new puzzle every day with progressive hints that teach calculation, not just answers." />
        <Feature icon={FileSearch} title="Game Analysis" body="Paste any PGN — get a human, story-driven review of your critical moments and themes to train." />
        <Feature icon={Mic} title="Voice Lessons" body="Speak to Guru and hear the lesson back. English, Hindi, and Hinglish supported." />
        <Feature icon={Crown} title="Up to 2000" body="Curriculum scales: openings, middlegame plans, endgame technique. Always tuned to your rating." />
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground relative z-10">
        © {new Date().getFullYear()} Socratic AI Coach · <span className="dev-credit font-semibold">Developed by Tech Student Shubh Badholiya</span>
      </footer>
    </div>
  );
}
