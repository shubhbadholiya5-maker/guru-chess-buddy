// Curated opening traps. User plays the "trapper" side; opponent moves are scripted (the victim falls in).
export type Trap = {
  id: string;
  name: string;
  opening: string;
  side: "white" | "black"; // side the user plays (the trapper)
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  moves: string[]; // full SAN sequence from start
  idea: string;   // one-line summary
  lesson: string; // what to remember / how to avoid as the victim
};

export const TRAPS: Trap[] = [
  {
    id: "scholars-mate",
    name: "Scholar's Mate",
    opening: "Italian / Open Game",
    side: "white",
    difficulty: "Beginner",
    moves: ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6", "Qxf7#"],
    idea: "Quick queen + bishop attack on f7, the weakest square in the opening.",
    lesson: "As Black, after 3.Qh5 defend f7 with **g6** or **Qe7/Qf6**, do NOT play …Nf6 blocking the queen's defender.",
  },
  {
    id: "legals-mate",
    name: "Légal's Mate",
    opening: "Italian / Philidor",
    side: "white",
    difficulty: "Intermediate",
    moves: ["e4", "e5", "Nf3", "d6", "Bc4", "Bg4", "Nc3", "g6", "Nxe5", "Bxd1", "Bxf7+", "Ke7", "Nd5#"],
    idea: "Queen sacrifice exploiting the pinned knight and weak f7 + king in centre.",
    lesson: "As Black, do not pin the f3-knight with …Bg4 when your king is still in the centre and f7 is undefended.",
  },
  {
    id: "fried-liver",
    name: "Fried Liver Attack",
    opening: "Italian (Two Knights)",
    side: "white",
    difficulty: "Intermediate",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "Nxf7", "Kxf7", "Qf3+", "Ke6", "Nc3"],
    idea: "Sacrifice on f7 drags the king to e6 with crushing attack.",
    lesson: "As Black, 5…Nxd5 is risky — prefer **5…Na5** (Polerio) to avoid the fried liver.",
  },
  {
    id: "noahs-ark",
    name: "Noah's Ark Trap",
    opening: "Ruy Lopez",
    side: "black",
    difficulty: "Intermediate",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "d6", "d4", "b5", "Bb3", "Nxd4", "Nxd4", "exd4", "Qxd4", "c5", "Qd5", "Be6", "Qc6+", "Bd7", "Qd5", "c4"],
    idea: "Pawns a6-b5-c4 trap the white light-squared bishop on b3.",
    lesson: "As White in the Ruy Lopez, watch the **a2-g8 diagonal** — c2-c3 first before letting Black play …c5-c4.",
  },
  {
    id: "elephant-trap",
    name: "Elephant Trap",
    opening: "Queen's Gambit Declined",
    side: "black",
    difficulty: "Intermediate",
    moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5", "Nbd7", "cxd5", "exd5", "Nxd5", "Nxd5", "Bxd8", "Bb4+", "Qd2", "Bxd2+", "Kxd2", "Kxd8"],
    idea: "After Nxd5 looks like Black loses the queen — but Bb4+ wins the bishop on d8 back with a piece up.",
    lesson: "As White, do not grab on d5 with the knight when Black has the …Bb4+ resource — develop calmly.",
  },
  {
    id: "lasker-trap",
    name: "Lasker Trap",
    opening: "Albin Counter-Gambit",
    side: "black",
    difficulty: "Advanced",
    moves: ["d4", "d5", "c4", "e5", "dxe5", "d4", "e3", "Bb4+", "Bd2", "dxe3", "Bxb4", "exf2+", "Ke2", "fxg1=N+"],
    idea: "Famous underpromotion to a knight winning material.",
    lesson: "As White vs Albin, do NOT play **4.e3?** — the standard line is 4.Nf3 to avoid this trap.",
  },
  {
    id: "englund-gambit",
    name: "Englund Gambit Trap",
    opening: "Englund Gambit",
    side: "black",
    difficulty: "Beginner",
    moves: ["d4", "e5", "dxe5", "Nc6", "Nf3", "Qe7", "Bf4", "Qb4+", "Bd2", "Qxb2", "Bc3", "Bb4", "Qd2", "Bxc3", "Qxc3", "Qc1#"],
    idea: "Queen raid down the b-file ends in a back-rank mate on c1.",
    lesson: "As White, after 4.Bf4? Qb4+ the b2-pawn and c1 become poisoned — play **4.Nc3** instead.",
  },
  {
    id: "monticelli-trap",
    name: "Monticelli Trap",
    opening: "Bogo-Indian",
    side: "white",
    difficulty: "Advanced",
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "Bb4+", "Bd2", "Bxd2+", "Qxd2", "b6", "g3", "Bb7", "Bg2", "O-O", "Nc3", "Ne4", "Qc2", "Nxc3", "Ng5"],
    idea: "Knight sortie wins the bishop on b7 via the long diagonal.",
    lesson: "As Black, after Nc3-Ne4 trades, beware of **Ng5** uncovering the g2-bishop on the long diagonal.",
  },
  {
    id: "magnus-smith",
    name: "Magnus Smith Trap",
    opening: "Sicilian Najdorf-ish",
    side: "white",
    difficulty: "Advanced",
    moves: ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "d6", "Bc4", "g6", "Nxc6", "bxc6", "e5", "Ng4", "Bxf7+", "Kxf7", "Ng5+", "Ke8", "Qxg4"],
    idea: "Bxf7+ followed by Ng5+ wins the knight on g4 with attack.",
    lesson: "As Black in Sicilian, do not play …g6 with the bishop still on c4 aiming at f7 unless your knight is safe.",
  },
  {
    id: "london-trap",
    name: "London System Trap",
    opening: "London System",
    side: "white",
    difficulty: "Beginner",
    moves: ["d4", "d5", "Bf4", "Nf6", "e3", "c5", "c3", "Qb6", "Qb3", "Qxb3", "axb3"],
    idea: "Simple queen trade that wrecks Black's structure if they grab b2.",
    lesson: "As Black vs London, do not play **…Qxb2?** — White's Qb3 + Bc7 ideas trap the queen on b2.",
  },
];

export function listTraps() { return TRAPS; }
export function getTrap(id: string) { return TRAPS.find((t) => t.id === id); }
