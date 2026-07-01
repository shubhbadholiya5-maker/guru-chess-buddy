import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, FileSearch, Flame, Target, Trophy, GraduationCap, Compass, Sparkles, CalendarCheck } from "lucide-react";

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
      <p className="text-muted-foreground -mt-2 mb-8">
        Goal: <span className="text-foreground">{profile.goal}</span> · {profile.daily_minutes} min/day
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat icon={Trophy} label="Rating" value={profile.rating} />
        <Stat icon={Target} label="Puzzles" value={`${stats.solved}/${stats.puzzles}`} />
        <Stat icon={FileSearch} label="Games analyzed" value={stats.games} />
        <Stat icon={Flame} label="Streak" value={`${profile.streak_days}d`} />
      </div>

      <h2 className="font-display text-2xl mb-4">Train today</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard to="/daily-plan" icon={CalendarCheck} title="Daily Plan" body="Your personalized 7-day roadmap to 2000." accent />
        <FeatureCard to="/coach" icon={MessageSquare} title="Socratic AI Coach" body="Chat with Guru — a 2700+ coach that asks before it tells." />
        <FeatureCard to="/academies" icon={GraduationCap} title="Academies" body="Openings, Middlegame, Endgame, Traps and Tactics — structured." />
        <FeatureCard to="/explorer" icon={Compass} title="Explorer" body="Search master games and openings via the live Lichess database." />
        <FeatureCard to="/analyze" icon={FileSearch} title="Game Analysis" body="Paste PGNs and get a coach review with a concrete fix plan." />
        <FeatureCard to="/masterclass" icon={Sparkles} title="Masterclass" body="Thinking patterns for each phase — English & Hindi, narrated." />
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="card-elevated rounded-2xl p-4">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
    </div>
  );
}

function FeatureCard({ to, icon: Icon, title, body, accent }: any) {
  return (
    <Link
      to={to}
      className={`card-elevated rounded-2xl p-6 group transition-all hover:border-primary/60 hover:-translate-y-0.5 ${accent ? "ring-1 ring-primary/40 bg-gradient-to-br from-primary/10 to-transparent" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 grid place-items-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="font-display text-xl group-hover:gold-gradient">{title}</div>
      </div>
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{body}</p>
    </Link>
  );
}
