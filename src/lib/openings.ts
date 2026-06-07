// Curated openings for the Opening Trainer.
// Each move has a short coach note used as a fallback / hint;
// the AI provides the full Hinglish explanation at runtime.

export type OpeningMove = {
  san: string;
  side: "w" | "b";
  idea: string; // short coach hint (shown if AI fails)
};

export type Opening = {
  id: string;
  name: string;
  side: "white" | "black";
  level: "Beginner" | "Intermediate";
  summary: string;
  moves: OpeningMove[];
};

export const OPENINGS: Opening[] = [
  {
    id: "italian",
    name: "Italian Game",
    side: "white",
    level: "Beginner",
    summary: "Classical e4 opening — center, fast development, bishop on c4 eyes f7.",
    moves: [
      { san: "e4", side: "w", idea: "Center control + diagonals for Bishop & Queen kholo." },
      { san: "e5", side: "b", idea: "Black bhi center claim karta hai." },
      { san: "Nf3", side: "w", idea: "Knight develop + e5 pe attack." },
      { san: "Nc6", side: "b", idea: "e5 defend + knight develop." },
      { san: "Bc4", side: "w", idea: "Bishop f7 ke weak square pe aim — Italian ka signature." },
      { san: "Bc5", side: "b", idea: "Symmetric — Black bhi f2 pe pressure." },
      { san: "c3", side: "w", idea: "d4 break ki preparation, center banane ka plan." },
      { san: "Nf6", side: "b", idea: "Develop + e4 pe pressure." },
      { san: "d4", side: "w", idea: "Center break — strong central pawns." },
    ],
  },
  {
    id: "london",
    name: "London System",
    side: "white",
    level: "Beginner",
    summary: "Solid d4 system — Bf4, e3, Nf3, c3. Easy to learn, hard to crack.",
    moves: [
      { san: "d4", side: "w", idea: "Center claim with queen-side pawn." },
      { san: "d5", side: "b", idea: "Symmetric center." },
      { san: "Nf3", side: "w", idea: "Develop + control e5." },
      { san: "Nf6", side: "b", idea: "Mirror develop." },
      { san: "Bf4", side: "w", idea: "Bishop ko pawn chain ke bahar nikaalo — London ka soul." },
      { san: "e6", side: "b", idea: "Black apna bishop kholne ki tayyari." },
      { san: "e3", side: "w", idea: "Solid pawn chain, second bishop ke liye jagah." },
      { san: "Bd6", side: "b", idea: "Bishop swap challenge." },
      { san: "Bg3", side: "w", idea: "Bishop safe rakho, swap se bachao." },
    ],
  },
  {
    id: "ruy",
    name: "Ruy López (Spanish)",
    side: "white",
    level: "Intermediate",
    summary: "The 'Spanish Torture' — Bb5 pinning the c6 knight, deep strategic play.",
    moves: [
      { san: "e4", side: "w", idea: "King-pawn opening." },
      { san: "e5", side: "b", idea: "Classical reply." },
      { san: "Nf3", side: "w", idea: "Attack e5, develop." },
      { san: "Nc6", side: "b", idea: "Defend e5." },
      { san: "Bb5", side: "w", idea: "Pin on c6 knight — Ruy López." },
      { san: "a6", side: "b", idea: "Morphy Defense — bishop ko question karo." },
      { san: "Ba4", side: "w", idea: "Bishop retreat, pin maintain." },
      { san: "Nf6", side: "b", idea: "Develop + e4 attack." },
      { san: "O-O", side: "w", idea: "King safety pehle." },
    ],
  },
  {
    id: "caro",
    name: "Caro-Kann Defense",
    side: "black",
    level: "Beginner",
    summary: "Solid defense for Black against e4 — strong pawn structure, fewer weaknesses.",
    moves: [
      { san: "e4", side: "w", idea: "White center claim." },
      { san: "c6", side: "b", idea: "d5 ki preparation, French jaisa par bishop trap nahi." },
      { san: "d4", side: "w", idea: "Big center build." },
      { san: "d5", side: "b", idea: "Center pe challenge." },
      { san: "Nc3", side: "w", idea: "Develop + e4 defend." },
      { san: "dxe4", side: "b", idea: "Tension release, classical Caro." },
      { san: "Nxe4", side: "w", idea: "Recapture, central knight." },
      { san: "Bf5", side: "b", idea: "Bad bishop nikal liya — Caro ka main idea." },
    ],
  },
  {
    id: "sicilian",
    name: "Sicilian Defense (Najdorf-lite)",
    side: "black",
    level: "Intermediate",
    summary: "Sharpest reply to e4 — asymmetric pawn structure, counter-attacking chances.",
    moves: [
      { san: "e4", side: "w", idea: "White king-pawn." },
      { san: "c5", side: "b", idea: "Asymmetry — Sicilian. Center se ladne ke bajaye queenside push." },
      { san: "Nf3", side: "w", idea: "Develop." },
      { san: "d6", side: "b", idea: "e5 ke liye support, flexible setup." },
      { san: "d4", side: "w", idea: "Open Sicilian — center break." },
      { san: "cxd4", side: "b", idea: "Capture — Black ko semi-open c-file milti hai." },
      { san: "Nxd4", side: "w", idea: "Recapture with knight." },
      { san: "Nf6", side: "b", idea: "Develop + e4 attack." },
      { san: "Nc3", side: "w", idea: "Defend e4 + develop." },
      { san: "a6", side: "b", idea: "Najdorf — Nb5 prevent + b5 expansion ki tayyari." },
    ],
  },
];

export function getOpening(id: string): Opening | undefined {
  return OPENINGS.find((o) => o.id === id);
}
