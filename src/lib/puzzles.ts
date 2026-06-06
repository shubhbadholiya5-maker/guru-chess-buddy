// Curated tactical puzzles (FEN, solution in UCI, themes)
export type Puzzle = {
  id: string;
  fen: string;
  solution: string[]; // sequence of UCI moves (player + responses)
  themes: string[];
  rating: number;
  hints: string[]; // progressive hints
};

export const PUZZLES: Puzzle[] = [
  {
    id: "p1",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    solution: ["h5f7"],
    themes: ["mate", "scholarsMate"],
    rating: 600,
    hints: [
      "Look at every check, capture, and threat.",
      "Your queen and bishop both target one weak square near the king.",
      "What is the weakest square in Black's position?",
      "Deliver mate with the queen supported by the bishop on c4.",
    ],
  },
  {
    id: "p2",
    fen: "r4rk1/1bq2ppp/p2p1n2/1pn1p3/4P3/1BN2N1P/PPPBQPP1/3R1RK1 w - - 0 14",
    solution: ["b3f7", "g8f7", "e2c4"],
    themes: ["doubleAttack", "pin"],
    rating: 1500,
    hints: [
      "Find a sacrifice that opens the king and wins a piece next move.",
      "The bishop on b3 looks at f7. After Bxf7+ what comes next?",
      "After Bxf7+ Kxf7, the queen swings out with a discovered attack on the knight.",
    ],
  },
  {
    id: "p3",
    fen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    solution: ["a1a8"],
    themes: ["backRank"],
    rating: 800,
    hints: [
      "Black's king has no escape squares.",
      "What is the back rank?",
      "Deliver back-rank mate with the rook.",
    ],
  },
  {
    id: "p4",
    fen: "r1b1k2r/ppppnppp/2n2q2/2b5/3NP3/2P1B3/PP3PPP/RN1QKB1R w KQkq - 0 7",
    solution: ["d4c6", "f6e6", "c6e7"],
    themes: ["fork"],
    rating: 1200,
    hints: [
      "There is a knight tactic.",
      "After Nxc6, what does Black have to do? Then a fork appears.",
    ],
  },
  {
    id: "p5",
    fen: "2r3k1/5ppp/p7/1p2P3/1P6/P5P1/5K1P/2R5 w - - 0 1",
    solution: ["c1c8", "g8h7", "e5e6"],
    themes: ["endgame", "passedPawn"],
    rating: 1700,
    hints: [
      "Trade rooks if it helps a passed pawn.",
      "After Rxc8+ Kh7, push the e-pawn — it is unstoppable.",
    ],
  },
];

export function pickDaily(): Puzzle {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return PUZZLES[day % PUZZLES.length];
}
