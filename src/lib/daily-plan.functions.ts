import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DailyTask = {
  kind: "tactic" | "opening" | "endgame" | "middlegame" | "play" | "review";
  title: string;
  description: string;
  // Hints for the UI
  theme?: string;       // tactic theme for Lichess (fork, pin, mateIn2, endgame, ...)
  minutes: number;
  link?: { to: string; label: string };
};

export type DailyPlan = {
  rating: number;
  band: string;
  goal: string;
  focus: string;
  tasks: DailyTask[];
  totalMinutes: number;
};

function bandFor(rating: number): { name: string; goal: string; focus: string } {
  if (rating < 800) return { name: "Beginner", goal: "Reach 1000 — stop hanging pieces, learn checkmates.", focus: "Board safety + basic mating patterns" };
  if (rating < 1200) return { name: "Novice", goal: "Reach 1200 — solid opening principles + 1-move tactics", focus: "Forks, pins, scholar's-mate defense, simple endgames" };
  if (rating < 1500) return { name: "Club Player", goal: "Reach 1500 — calculate 2 moves deep, finish endings", focus: "Discovered attacks, deflection, K+P endings, openings up to move 8" };
  if (rating < 1800) return { name: "Intermediate", goal: "Reach 1800 — middlegame plans + clean technique", focus: "Pawn structures (IQP, Carlsbad), prophylaxis, Lucena/Philidor" };
  if (rating < 2000) return { name: "Advanced", goal: "Reach 2000 — strategic mastery + deep calculation", focus: "Minority attack, weak color complexes, complex tactics, opening prep" };
  return { name: "Expert", goal: "Push past 2000 — refine repertoire + endgame depth", focus: "Theoretical endings, novelty prep, positional sacrifice" };
}

function pickRotatingThemes(rating: number, dayOfYear: number): string[] {
  // Rotate themes day-by-day so plan feels fresh
  const beginner = ["mateIn1", "fork", "hangingPiece", "pin", "skewer"];
  const club = ["fork", "pin", "skewer", "discoveredAttack", "deflection", "mateIn2", "intermezzo"];
  const adv = ["sacrifice", "attackingF2F7", "queensideAttack", "kingsideAttack", "endgame", "promotion", "zugzwang", "quietMove"];
  const pool = rating < 1200 ? beginner : rating < 1700 ? club : adv;
  // pick 2 distinct themes deterministically by day
  const a = pool[dayOfYear % pool.length];
  const b = pool[(dayOfYear * 3 + 1) % pool.length];
  return a === b ? [a] : [a, b];
}

function dayOfYear(d = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = (d.getTime() - start.getTime()) + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000);
  return Math.floor(diff / 86400000);
}

export const getDailyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DailyPlan> => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("rating, daily_minutes")
      .eq("id", userId)
      .maybeSingle();
    const rating = profile?.rating ?? 800;
    const minutesBudget = profile?.daily_minutes ?? 20;
    const band = bandFor(rating);
    const themes = pickRotatingThemes(rating, dayOfYear());

    const tasks: DailyTask[] = [];

    // 1. Warm-up tactic
    tasks.push({
      kind: "tactic",
      title: `Warm-up: ${themes[0]}`,
      description: `3 puzzles, ${themes[0]}. Pattern recognition is the engine of tactical strength.`,
      theme: themes[0],
      minutes: Math.max(5, Math.floor(minutesBudget * 0.25)),
    });

    // 2. Calculation tactic
    if (themes[1]) {
      tasks.push({
        kind: "tactic",
        title: `Calculation drill: ${themes[1]}`,
        description: `2 harder puzzles. Visualize 2–3 plies, only then move.`,
        theme: themes[1],
        minutes: Math.max(5, Math.floor(minutesBudget * 0.25)),
      });
    }

    // 3. Strategy / structure
    if (rating < 1200) {
      tasks.push({
        kind: "opening",
        title: "Opening principles",
        description: "Pick one opening you play with White. Walk through 6 moves and explain the idea behind each.",
        minutes: Math.max(5, Math.floor(minutesBudget * 0.2)),
        link: { to: "/openings", label: "Open Openings Trainer" },
      });
    } else if (rating < 1700) {
      tasks.push({
        kind: "middlegame",
        title: `Middlegame focus: ${band.focus.split(",")[0]}`,
        description: "One position from the Middlegame Academy. Form a plan before checking the answer.",
        minutes: Math.max(5, Math.floor(minutesBudget * 0.2)),
        link: { to: "/middlegame", label: "Open Middlegame Academy" },
      });
    } else {
      tasks.push({
        kind: "endgame",
        title: "Endgame technique",
        description: "Lucena / Philidor / minor-piece ending — pick one and convert it cleanly.",
        minutes: Math.max(5, Math.floor(minutesBudget * 0.2)),
        link: { to: "/endgame", label: "Open Endgame Academy" },
      });
    }

    // 4. Play one game vs engine
    tasks.push({
      kind: "play",
      title: "Play one engine game",
      description: rating < 1500 ? "Choose Casual (800) or Intermediate (1200). Focus on not blundering — slow down on every capture." : "Strong (1600) or Expert (2000). Build a plan after move 10; don't drift.",
      minutes: Math.max(5, Math.floor(minutesBudget * 0.3)),
      link: { to: "/play", label: "Open Play vs Engine" },
    });

    // 5. Review (optional if budget allows)
    if (minutesBudget >= 25) {
      tasks.push({
        kind: "review",
        title: "Game review",
        description: "Paste your last game's PGN. Guru will spot recurring weaknesses.",
        minutes: 10,
        link: { to: "/analyze", label: "Open Game Analyzer" },
      });
    }

    const totalMinutes = tasks.reduce((s, t) => s + t.minutes, 0);

    return {
      rating,
      band: band.name,
      goal: band.goal,
      focus: band.focus,
      tasks,
      totalMinutes,
    };
  });
