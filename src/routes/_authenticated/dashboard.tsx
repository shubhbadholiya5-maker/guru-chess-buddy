import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Swords, MessageSquare, Puzzle, FileSearch, Flame, Target, Trophy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ puzzles: 0, solved: 0, games: 0 });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      if (!p?.onboarded) { router.navigate({ to: "/onboarding", replace: true }); return; }
      setProfile(p);
      const [{ data: attempts }, { count: games }] = await Promise.all([
        supabase.from("puzzle_attempts").select("solved").eq("user_id", u.user.id),
        supabase.from("game_analyses").select("*", { count: "exact", head: true }).eq("user_id", u.user.id),
      ]);
      const solved = (attempts ?? []).filter((a: any) => a.solved).length;
      setStats({ puzzles: attempts?.length ?? 0, solved, games: games ?? 0 });
    })();
  }, [router]);

  if (!profile) return <AppShell><div className="text-muted-foreground">Loading…</div></AppShell>;

  return (
    <AppShell title={`Hello, ${profile.display_name ?? "player"}`}>
      <p className="text-muted-foreground -mt-2 mb-8">Goal: <span className="text-foreground">{profile.goal}</span> • {profile.daily_minutes} min/day</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat icon={Trophy} label="Rating" value={profile.rating} />
        <Stat icon={Target} label="Puzzles solved" value={`${stats.solved}/${stats.puzzles}`} />
        <Stat icon={FileSearch} label="Games analyzed" value={stats.games} />
        <Stat icon={Flame} label="Streak" value={`${profile.streak_days}d`} />
      </div>

      <h2 className="font-display text-2xl mb-4">Today's training plan</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Action to="/puzzles" icon={Puzzle} title="Solve today's tactic" body="Work through hints, train calculation." />
        <Action to="/coach" icon={MessageSquare} title="Lesson with Guru" body="Ask anything — openings, plans, mindset." />
        <Action to="/play" icon={Swords} title="Play a training game" body="Practice vs Stockfish at your level." />
        <Action to="/analyze" icon={FileSearch} title="Analyze a game" body="Paste a PGN and learn from your mistakes." />
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="card-elevated rounded-xl p-4">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
    </div>
  );
}
function Action({ to, icon: Icon, title, body }: any) {
  return (
    <Link to={to} className="card-elevated rounded-xl p-5 hover:border-primary/50 transition-all group">
      <Icon className="h-6 w-6 text-primary" />
      <div className="font-display text-xl mt-3 group-hover:gold-gradient">{title}</div>
      <p className="text-sm text-muted-foreground mt-1">{body}</p>
    </Link>
  );
}
