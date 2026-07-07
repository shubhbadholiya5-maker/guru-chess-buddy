// Live Lichess integrations: puzzles + opening explorer.
// Public endpoints — no auth, no API key.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type LichessPuzzle = {
  id: string;
  fen: string;            // FEN BEFORE the opponent's setup move
  solutionUci: string[];  // full UCI sequence; first move is opponent setup
  rating: number;
  themes: string[];
  initialPly: number;
  gameUrl: string;
};

// Pick a random puzzle within a rating band & optional theme.
// Lichess "next puzzle" endpoint: /api/puzzle/next?angle=<theme>&difficulty=<...>
export const fetchLichessPuzzle = createServerFn({ method: "POST" })
  .inputValidator((input: { theme?: string; minRating?: number; maxRating?: number }) =>
    z.object({
      theme: z.string().max(40).optional(),
      minRating: z.number().int().min(400).max(2800).optional(),
      maxRating: z.number().int().min(400).max(3000).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const theme = data.theme ?? "mix";
    // Lichess difficulty buckets: easiest|easier|normal|harder|hardest
    const min = data.minRating ?? 1200;
    const diff = min < 900 ? "easiest" : min < 1200 ? "easier" : min < 1500 ? "normal" : min < 1800 ? "harder" : "hardest";

    // Try a few times to land within band; retry on 429
    for (let attempt = 0; attempt < 6; attempt++) {
      const url = `https://lichess.org/api/puzzle/next?angle=${encodeURIComponent(theme)}&difficulty=${diff}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 1200 + attempt * 600));
        continue;
      }
      if (!res.ok) continue;
      const j: any = await res.json();
      const p = j?.puzzle;
      const game = j?.game;
      if (!p || !game) continue;
      const rating = Number(p.rating ?? 1200);
      if (data.minRating && rating < data.minRating - 100) continue;
      if (data.maxRating && rating > data.maxRating + 100) continue;

      // Reconstruct FEN at puzzle start by replaying game PGN up to initialPly.
      const { Chess } = await import("chess.js");
      const chess = new Chess();
      const moves: string[] = String(game.pgn ?? "").trim().split(/\s+/).filter(Boolean);
      const ply = Number(p.initialPly ?? 0);
      for (let i = 0; i <= ply && i < moves.length; i++) {
        try { chess.move(moves[i]); } catch { /* ignore */ }
      }
      return {
        id: String(p.id),
        fen: chess.fen(),
        solutionUci: Array.isArray(p.solution) ? p.solution.map(String) : [],
        rating,
        themes: Array.isArray(p.themes) ? p.themes.map(String) : [],
        initialPly: ply,
        gameUrl: `https://lichess.org/training/${p.id}`,
      } satisfies LichessPuzzle;
    }
    throw new Error("Could not fetch a puzzle right now. Try again.");
  });

export type ExplorerMove = {
  uci: string;
  san: string;
  white: number;
  draws: number;
  black: number;
  total: number;
  averageRating?: number;
};

export type ExplorerResult = {
  white: number;
  draws: number;
  black: number;
  total: number;
  moves: ExplorerMove[];
  opening?: { eco: string; name: string } | null;
};

// Lichess master DB opening explorer.
export const fetchOpeningExplorer = createServerFn({ method: "POST" })
  .inputValidator((input: { fen: string; db?: "masters" | "lichess" }) =>
    z.object({ fen: z.string().min(10).max(120), db: z.enum(["masters", "lichess"]).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const base = data.db === "lichess" ? "https://explorer.lichess.ovh/lichess" : "https://explorer.lichess.ovh/masters";
    const params = new URLSearchParams({ fen: data.fen, moves: "12", topGames: "0" });
    const empty: ExplorerResult = { white: 0, draws: 0, black: 0, total: 0, moves: [], opening: null };
    try {
      const res = await fetch(`${base}?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "SocraticAIChessCoach/1.0 (contact: support@lovable.app)",
        },
      });
      if (!res.ok) {
        console.warn(`[explorer] ${res.status} ${res.statusText}`);
        return empty;
      }
      const j: any = await res.json();
      const total = (j.white ?? 0) + (j.draws ?? 0) + (j.black ?? 0);
      const moves: ExplorerMove[] = (j.moves ?? []).map((m: any) => {
        const t = (m.white ?? 0) + (m.draws ?? 0) + (m.black ?? 0);
        return {
          uci: String(m.uci),
          san: String(m.san),
          white: m.white ?? 0,
          draws: m.draws ?? 0,
          black: m.black ?? 0,
          total: t,
          averageRating: m.averageRating,
        };
      });
      return {
        white: j.white ?? 0,
        draws: j.draws ?? 0,
        black: j.black ?? 0,
        total,
        moves,
        opening: j.opening ?? null,
      } satisfies ExplorerResult;
    } catch (e) {
      console.warn("[explorer] fetch failed", e);
      return empty;
    }
  });
