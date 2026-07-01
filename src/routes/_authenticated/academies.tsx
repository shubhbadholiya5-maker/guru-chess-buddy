import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BookOpen, AlertTriangle, Brain, Castle, Target } from "lucide-react";

export const Route = createFileRoute("/_authenticated/academies")({
  component: AcademiesPage,
  head: () => ({
    meta: [
      { title: "Academies — Openings, Middlegame, Endgame | Chess Trainer" },
      { name: "description", content: "Structured chess academies covering openings, tactical traps, middlegame planning, endgame technique, and tactics — powered by live Lichess data." },
    ],
  }),
});

const ACADEMIES = [
  { to: "/openings", icon: BookOpen, title: "Openings Academy", body: "Master repertoires with move-by-move Socratic guidance." },
  { to: "/traps", icon: AlertTriangle, title: "Traps Academy", body: "Learn — and avoid — famous opening traps with full PGN." },
  { to: "/middlegame", icon: Brain, title: "Middlegame Academy", body: "Planning, pawn structures, piece activity across all levels." },
  { to: "/endgame", icon: Castle, title: "Endgame Academy", body: "Essential technique from K+P to complex rook endings." },
  { to: "/tactics", icon: Target, title: "Tactics Trainer", body: "Live Lichess puzzles filtered to your rating band." },
] as const;

function AcademiesPage() {
  return (
    <AppShell title="Academies">
      <p className="text-muted-foreground -mt-2 mb-8 max-w-2xl">Pick a discipline. Each academy blends structured lessons with live positions and a Socratic coach.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ACADEMIES.map(a => (
          <Link key={a.to} to={a.to} className="card-elevated rounded-2xl p-5 group hover:border-primary/50 transition">
            <a.icon className="h-7 w-7 text-primary" />
            <div className="font-display text-xl mt-3 group-hover:gold-gradient">{a.title}</div>
            <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
