// Live examples paired to lesson phases. Each entry is a self-contained
// mini demonstration (start FEN + SAN moves + per-move captions) that the
// Masterclass renders as an auto-playing board so students see, not just read.
import type { Phase } from "@/lib/masterclass";

export interface LiveExample {
  title: string;
  fen: string;
  moves: string[];
  captions: string[];
  intro: string;
}

export const LESSON_EXAMPLES: Record<Phase, LiveExample> = {
  opening: {
    title: "Italian Game — classical development",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    intro: "Watch how White fights for the centre, develops minor pieces, and castles safely — the four opening pillars.",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "O-O"],
    captions: [
      "e4 — stake a central pawn and open lines for the bishop and queen.",
      "…e5 — Black mirrors and contests the centre.",
      "Nf3 — knight before bishop, hitting e5 with tempo.",
      "…Nc6 — defends e5 and develops.",
      "Bc4 — bishop on its best diagonal, eyeing the f7 weak square.",
      "…Bc5 — symmetrical, both sides ready to castle.",
      "O-O — king safety before starting any plan. Opening principles complete.",
    ],
  },
  middlegame: {
    title: "Minority attack — Carlsbad pawn break",
    fen: "r1bq1rk1/pp2ppbp/2np1np1/8/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
    intro: "White plays on the queenside where Black has more pawns — the classic minority attack. Goal: create a weak c6 pawn.",
    moves: ["b4", "a6", "a4", "e6", "b5", "axb5", "axb5", "cxb5"],
    captions: [
      "b4 — the minority attack begins. Two white pawns will target three black ones.",
      "…a6 — Black tries to hold the queenside intact.",
      "a4 — supporting the b5 break.",
      "…e6 — routine developing move.",
      "b5! — the key break. Black must decide how to react.",
      "…axb5 — opens the a-file for White's rook.",
      "axb5 — now c6 is under real pressure.",
      "…cxb5 — but the c-file is open and the isolated b5 pawn is easy to blockade. White's plan succeeded: a permanent weakness on c6 / c7.",
    ],
  },
  endgame: {
    title: "Lucena position — the bridge",
    fen: "1K1k4/1P6/8/8/8/8/6r1/2R5 w - - 0 1",
    intro: "The most famous winning technique in R+P vs R endgames. Build a bridge with your rook to shepherd the pawn home.",
    moves: ["Rc4", "Rg1", "Ka7", "Ra1+", "Kb6", "Rb1+", "Kc6", "Rc1+", "Kb5"],
    captions: [
      "Rc4 — pre-building the bridge on the fourth rank.",
      "…Rg1 — Black attacks along the file.",
      "Ka7 — king steps out to shepherd the pawn.",
      "…Ra1+ — checks begin.",
      "Kb6 — king walks toward cover.",
      "…Rb1+ — the check chase.",
      "Kc6 — approaching the rook on c4.",
      "…Rc1+ — final check.",
      "Kb5 — and the bridge (Rc4) blocks the check next move: Rb4 wins. Pawn promotes.",
    ],
  },
};
