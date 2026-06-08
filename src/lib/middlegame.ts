// Middlegame Academy — curated study positions with Socratic prompts.
export type MiddlegameLesson = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  theme: "Planning" | "Pawn Structures" | "Piece Activity" | "Prophylaxis";
  side: "white" | "black"; // whose plan we are studying
  fen: string;
  context: string;        // one-paragraph position description
  questions: string[];    // Socratic prompts in order
  keyIdeas: string[];     // bullet ideas the coach should teach
};

export const MIDDLEGAME_LESSONS: MiddlegameLesson[] = [
  // === BEGINNER ===
  {
    id: "b1-develop-then-castle",
    title: "Plan #1: Finish development, then attack",
    level: "Beginner",
    theme: "Planning",
    side: "white",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
    context: "Italian Game type structure. Both sides developing. White to move.",
    questions: [
      "Aapke kitne pieces develop ho chuke hain, kitne baaki?",
      "King safety — castle pehle karenge ya ek aur piece nikalenge?",
      "Long term plan kya hai — kingside attack ya central play?",
    ],
    keyIdeas: [
      "Rule: finish minor piece development → castle → connect rooks → THEN start a plan.",
      "Premature attack with undeveloped pieces almost always backfires.",
      "Here: Nc3 / O-O / Re1 are natural next moves.",
    ],
  },
  {
    id: "b2-weak-square-d5",
    title: "Identify weak squares (the d5 hole)",
    level: "Beginner",
    theme: "Pawn Structures",
    side: "white",
    fen: "r1bq1rk1/pp2bppp/2n1pn2/3p4/3P4/2NBPN2/PPQ2PPP/R1B2RK1 w - - 0 9",
    context: "QGD-type structure. Black has played …d5 and …e6.",
    questions: [
      "Kaunsa Black square permanently weak hai — c5, d5, ya e5?",
      "Konsa White piece us square pe ja sakta hai aur kabhi nahi hatega?",
      "Aapka 3-move plan kya hai us square ko occupy karne ka?",
    ],
    keyIdeas: [
      "A weak square = a square that cannot be defended by a pawn.",
      "Here e5 is the outpost — knight on e5 is unkickable.",
      "Plan: Ne5, supported by f4 if needed; then Nf3-e5 again if traded.",
    ],
  },
  {
    id: "b3-bad-bishop",
    title: "Good bishop vs Bad bishop",
    level: "Beginner",
    theme: "Piece Activity",
    side: "white",
    fen: "r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 8",
    context: "Black has light-squared pawns (d5, e6). The c8 bishop is restricted.",
    questions: [
      "Black ka kaun sa bishop 'bad bishop' hai aur kyun?",
      "Aap apne bishops ko kaise activate karoge — fianchetto, diagonal change, ya trade?",
      "Pawn breaks (c4, e4) — kaunsa structure ko aapke favor mein kholega?",
    ],
    keyIdeas: [
      "Bishop on c8 is blocked by its own e6/d5 pawns — classic 'bad bishop'.",
      "Trade your good bishop for theirs ONLY when it leaves them with the bad one.",
      "Plan: e4 break challenges the centre and frees your dark-squared bishop.",
    ],
  },

  // === INTERMEDIATE ===
  {
    id: "i1-minority-attack",
    title: "Minority Attack (QGD Exchange)",
    level: "Intermediate",
    theme: "Planning",
    side: "white",
    fen: "r1bq1rk1/pp3ppp/2nbpn2/3p4/3P4/2N1PN2/PPQ1BPPP/R1B2RK1 w - - 0 9",
    context: "Exchange QGD with Black pawns on a7/b7/c6/d5. White has b2/c2.",
    questions: [
      "Black ke queenside pawns ko target karne ka tareeka kya hai?",
      "Aap kaunsi pawn advance se Black ke c6 pawn ko backward banaoge?",
      "Minor pieces kaha rakhne se b-file maximum useful banegi?",
    ],
    keyIdeas: [
      "Minority attack: b4-b5 by White challenges Black's c6, creating a backward pawn or weak square.",
      "After bxc6, Black either gets a weak c6 pawn or a half-open b-file for White.",
      "Place rooks on the b-file, knight to a4/c5 to maximize pressure.",
    ],
  },
  {
    id: "i2-iqp-attack",
    title: "Attacking the Isolated Queen's Pawn (IQP)",
    level: "Intermediate",
    theme: "Pawn Structures",
    side: "black",
    fen: "r1bq1rk1/pp3ppp/2n1pn2/8/2BP4/2N2N2/PP3PPP/R1BQ1RK1 b - - 0 9",
    context: "White has an isolated d4 pawn. Black wants to blockade and win it.",
    questions: [
      "IQP ke saamne kaun sa square blockade ke liye perfect hai?",
      "Kaun sa Black piece blockader banega — knight ya bishop, aur kyun?",
      "Endgame mein IQP ko target karne ka sequence kya hai?",
    ],
    keyIdeas: [
      "The square in front of an IQP (here d5) is a permanent outpost for the opponent.",
      "Knight is the best blockader — it controls squares from its perch without being attacked.",
      "Trade minor pieces to neutralize White's attack, then convert d4 weakness in the endgame.",
    ],
  },
  {
    id: "i3-piece-activity",
    title: "Activate worst piece first",
    level: "Intermediate",
    theme: "Piece Activity",
    side: "white",
    fen: "r2q1rk1/pp1bbppp/2n1pn2/3p4/2PP4/2N1PN2/PPQ1BPPP/R1B2RK1 w - - 0 10",
    context: "All pieces are developed but White's c1 bishop is passive.",
    questions: [
      "Aapka sabse passive piece kaunsa hai?",
      "Use kaha activate karne ka plan hai — b2-fianchetto, Bd2-c3, ya Bg5-h4?",
      "Konsa pawn move ke baad woh bishop maximum diagonal cover karega?",
    ],
    keyIdeas: [
      "Principle (Makogonov): improve your worst piece first.",
      "Here Bc1 is dead — Bd2 + Rac1 or b3 + Bb2 onto the long diagonal are both strong.",
      "A position with all pieces working > a position with one star piece and one dead piece.",
    ],
  },
  {
    id: "i4-prophylaxis-basic",
    title: "Prophylaxis: stop their plan first",
    level: "Intermediate",
    theme: "Prophylaxis",
    side: "white",
    fen: "r1bq1rk1/pp2bppp/2n1pn2/3p4/2PP4/2N1PN2/PPQ1BPPP/R1B2RK1 w - - 0 9",
    context: "Black wants to play …dxc4 and …b5 expanding queenside.",
    questions: [
      "Opponent ka next 2-3 moves ka plan kya hai?",
      "Us plan ko stop karne ke liye kaunsa pawn move ya piece move sahi hai?",
      "Prophylactic move ke baad aapka own plan kya banega?",
    ],
    keyIdeas: [
      "Prophylaxis = ask 'what does my opponent want?' before deciding your move.",
      "a4 prevents …b5, b3 supports c4, Rd1 anticipates …dxc4 pressure on d-file.",
      "Karpov's style: small restricting moves, then squeeze.",
    ],
  },

  // === ADVANCED ===
  {
    id: "a1-color-complex",
    title: "Dominate a color complex",
    level: "Advanced",
    theme: "Pawn Structures",
    side: "white",
    fen: "r1bq1rk1/pp2bppp/2n1pn2/3pP3/3P4/2NB1N2/PPQ2PPP/R1B2RK1 w - - 0 9",
    context: "French-Advance type structure. Pawns on e5/d4 vs e6/d5.",
    questions: [
      "Black ke dark squares kaha kamzor hain (e5 line ke aas-paas)?",
      "Aap kaunse pieces dark-square attack ke liye reroute karoge?",
      "Bishop pair ka use kaise — dono diagonals dominate karna hai?",
    ],
    keyIdeas: [
      "Black's dark-squared bishop is bad behind …e6/…d5 pawns. Exchange it off if possible.",
      "Knight maneuver Nf3-h4-f3-d4-f5 or via e2-g3-f5 is thematic.",
      "Plan: pile pieces on f6/h6 dark squares, often with f4-f5 break.",
    ],
  },
  {
    id: "a2-positional-sacrifice",
    title: "Positional exchange sacrifice",
    level: "Advanced",
    theme: "Piece Activity",
    side: "black",
    fen: "r4rk1/1bqnbppp/p2ppn2/1p6/3NPP2/1BN1B3/PPP1Q1PP/2KR3R b - - 0 13",
    context: "Sicilian Najdorf style. Black considers …Rxc3 sacrificing exchange for structure.",
    questions: [
      "…Rxc3 ke baad Black ko kya milta hai — minor piece, structure damage, ya initiative?",
      "Kya aap White ke ek piece ko 'permanently bad' bana sakte ho is sacrifice se?",
      "Sacrifice ke 5-6 moves baad evaluate kaise karoge — material loss vs activity gain?",
    ],
    keyIdeas: [
      "Petrosian-style: …Rxc3 doubles White's c-pawns and gives Black a knight outpost on c4/d5.",
      "Exchange sac is sound when you get: structural damage + dominant minor piece + safe king.",
      "Long-term, Black's bishop pair + weak c2/c3 pawns compensate for the rook.",
    ],
  },
  {
    id: "a3-prophylactic-thinking",
    title: "Karpovian prophylactic squeeze",
    level: "Advanced",
    theme: "Prophylaxis",
    side: "white",
    fen: "2rq1rk1/pb1nbppp/1p2pn2/3p4/2PP4/1PN1PN2/PB2BPPP/R2QR1K1 w - - 0 12",
    context: "Symmetrical-ish QGD. Both sides developed. White looks for tiny improvements.",
    questions: [
      "Black ke har piece ka best square kya hai — kya aap usse pehle prevent kar sakte ho?",
      "Aapka rook a1 ya c1 — kaunsa file aapke long term plan se match karta hai?",
      "Pawn structure mein kaunsi minor concession se Black ko kuch nahi milega lekin aapko useful resource milega?",
    ],
    keyIdeas: [
      "List opponent's best squares: Nf6→e4, Bb7 needs …dxc4, Rc8 needs c-file open.",
      "Moves like Qb1, Rac1, h3 (avoiding …Ng4/…Bg4) are tiny restrictive improvements.",
      "Win this kind of position by accumulating 5-6 such moves, then finding the break.",
    ],
  },
  {
    id: "a4-pawn-break",
    title: "Choose the right pawn break",
    level: "Advanced",
    theme: "Planning",
    side: "white",
    fen: "r1bq1rk1/2p1bppp/p1np1n2/1p2p3/3PP3/1BP2N1P/PP3PP1/RNBQR1K1 w - - 0 9",
    context: "Closed Ruy Lopez structure. White must choose: d5, a4, or c4 break.",
    questions: [
      "Teen breaks (d5, a4, c4) mein se kaunsa Black ki strongest piece ko target karta hai?",
      "Kaunse break ke baad aapke pieces ke liye open files ya diagonals khulte hain?",
      "Timing — break abhi karen ya pehle ek-do preparatory moves chahiye?",
    ],
    keyIdeas: [
      "d5 closes the centre → kingside attack with Nf1-g3-f5 follows (Ruy main line).",
      "a4 challenges Black's queenside expansion; only good if Black can't comfortably reply …b4.",
      "c4 is rare here — gives up d4 square; usually wrong.",
      "Right answer is almost always d5 + slow kingside buildup.",
    ],
  },
];

export function listLessons() { return MIDDLEGAME_LESSONS; }
export function getLesson(id: string) { return MIDDLEGAME_LESSONS.find((l) => l.id === id); }
