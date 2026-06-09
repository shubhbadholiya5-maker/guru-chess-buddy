// Cloud-scalable tactics fetching.
// The local TACTICS array (src/lib/tactics.ts) provides curated puzzles offline.
// This server fn fetches from the `tactic_puzzles` Supabase table in paginated batches of 10,
// supporting an architecture that scales to thousands of puzzles.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type CloudPuzzle = {
  id: string;
  fen: string;
  solution: string[]; // UCI moves
  rating: number;
  tier: "Beginner" | "Intermediate" | "Advanced";
  motif: string;
  hints: string[];
  lesson: string;
};

export const fetchTacticsPage = createServerFn({ method: "POST" })
  .inputValidator((input: { tier?: "Beginner" | "Intermediate" | "Advanced"; motif?: string; cursor?: number; limit?: number }) =>
    z.object({
      tier: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
      motif: z.string().max(40).optional(),
      cursor: z.number().int().min(0).optional(),
      limit: z.number().int().min(1).max(50).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const limit = data.limit ?? 10;
    const cursor = data.cursor ?? 0;

    let q = supabaseAdmin
      .from("tactic_puzzles")
      .select("id, fen, solution_uci, rating, tier, motif, hints, lesson")
      .order("rating", { ascending: true })
      .range(cursor, cursor + limit - 1);

    if (data.tier) q = q.eq("tier", data.tier);
    if (data.motif) q = q.eq("motif", data.motif);

    const { data: rows, error } = await q;
    if (error) {
      console.error("fetchTacticsPage error", error);
      return { puzzles: [] as CloudPuzzle[], nextCursor: null as number | null };
    }

    const puzzles: CloudPuzzle[] = (rows ?? []).map((r: any) => ({
      id: r.id,
      fen: r.fen,
      solution: r.solution_uci,
      rating: r.rating,
      tier: r.tier,
      motif: r.motif,
      hints: r.hints ?? [],
      lesson: r.lesson ?? "",
    }));

    const nextCursor = puzzles.length === limit ? cursor + limit : null;
    return { puzzles, nextCursor };
  });
