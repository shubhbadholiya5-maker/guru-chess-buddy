// Middlegame Academy — curated study positions with Socratic prompts.
// Schema scales to 300+ positions across levels and themes.
export type MiddlegameLesson = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  theme: "Planning" | "Pawn Structures" | "Piece Activity" | "Prophylaxis" | "Attack" | "Defense";
  side: "white" | "black";
  fen: string;
  context: string;
  questions: string[];
  keyIdeas: string[];
};

export const MIDDLEGAME_LESSONS: MiddlegameLesson[] = [
  // ============ BEGINNER ============
  {
    id: "b1-develop-then-castle",
    title: "Plan #1: Finish development, then attack",
    level: "Beginner",
    theme: "Planning",
    side: "white",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
    context: "Italian Game type structure. Both sides developing.",
    questions: [
      "Kitne pieces develop ho chuke hain?",
      "King safety — castle pehle ya ek aur piece develop?",
      "Long-term plan — kingside attack ya central play?",
    ],
    keyIdeas: [
      "Finish minor piece development → castle → connect rooks → THEN start a plan.",
      "Premature attack with undeveloped pieces almost always backfires.",
      "Nc3 / O-O / Re1 are natural next moves.",
    ],
  },
  {
    id: "b2-weak-square-e5",
    title: "Identify weak squares (the e5 hole)",
    level: "Beginner",
    theme: "Pawn Structures",
    side: "white",
    fen: "r1bq1rk1/pp2bppp/2n1pn2/3p4/3P4/2NBPN2/PPQ2PPP/R1B2RK1 w - - 0 9",
    context: "QGD-type structure. Black has played …d5 and …e6.",
    questions: [
      "Konsa Black square permanently weak hai — c5, d5, ya e5?",
      "Konsa White piece us square pe ja sakta hai aur kabhi nahi hatega?",
      "3-move plan kya hai us square ko occupy karne ka?",
    ],
    keyIdeas: [
      "A weak square = a square that cannot be defended by a pawn.",
      "e5 is the outpost — knight on e5 is unkickable.",
      "Plan: Ne5, supported by f4 if needed.",
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
      "Black ka kaun sa bishop 'bad bishop' hai?",
      "Apne bishops ko kaise activate karenge?",
      "Konsa pawn break favor karega?",
    ],
    keyIdeas: [
      "Bishop on c8 is blocked by its own e6/d5 pawns — classic 'bad bishop'.",
      "Trade your good bishop for theirs ONLY when it leaves them with the bad one.",
      "e4 break frees your dark-squared bishop.",
    ],
  },
  {
    id: "b4-open-file-rook",
    title: "Rook on the open file",
    level: "Beginner",
    theme: "Piece Activity",
    side: "white",
    fen: "r2q1rk1/pp2bppp/2n1pn2/3p4/3P4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 9",
    context: "The c-file is half-open for White after exchanges.",
    questions: [
      "Konsa file open ya half-open hai?",
      "Konsi rook us file pe sabse pehle aani chahiye?",
      "Rook ke baad plan kya — penetrate to 7th rank?",
    ],
    keyIdeas: [
      "Rooks belong on open or half-open files.",
      "Rc1 is the natural move — doubles can follow.",
      "Goal: penetrate to the 7th rank where the rook is most active.",
    ],
  },
  {
    id: "b5-king-safety-pawns",
    title: "Don't push the pawns in front of your king",
    level: "Beginner",
    theme: "Defense",
    side: "white",
    fen: "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/3P1N2/PPP1QPPP/RNB2RK1 w - - 0 7",
    context: "King has just castled kingside. Beginner temptation: push g3/h3.",
    questions: [
      "Pawn shield (f2-g2-h2) ko move karne se kya hota hai?",
      "Kab acceptable hai luft ke liye h3 ya g3 push?",
      "Better plan kya — minor piece activity ya pawn moves?",
    ],
    keyIdeas: [
      "Pawn moves in front of your castled king create permanent weaknesses.",
      "Only push h3 (luft) when concretely needed — never g3 unless fianchettoing.",
      "Activate pieces instead of moving kingside pawns.",
    ],
  },
  {
    id: "b6-trade-when-cramped",
    title: "Trade when you're cramped",
    level: "Beginner",
    theme: "Planning",
    side: "black",
    fen: "r1bqkb1r/pp1n1ppp/2p1pn2/3pP3/2PP4/2N2N2/PP3PPP/R1BQKB1R b KQkq - 0 7",
    context: "Black is cramped vs White's central pawn chain.",
    questions: [
      "Kaunsa piece swap karne se aapko space milega?",
      "Konse pieces TRADE karne hain aur konse rakhne hain?",
      "Endgame plan banao kya hai?",
    ],
    keyIdeas: [
      "Cramped side benefits from trades — fewer pieces, more space per piece.",
      "Keep your good pieces (like the c8 bishop after …Bf5 or …Bd7-e8-h5), trade off the bad ones.",
      "Goal: simplify into an endgame where the spatial deficit doesn't matter.",
    ],
  },
  {
    id: "b7-attack-on-wing",
    title: "Attack on the wing where you have space",
    level: "Beginner",
    theme: "Attack",
    side: "white",
    fen: "r1bq1rk1/pp3ppp/2nbpn2/3p4/3P1B2/2N1PN2/PPQ2PPP/R3KB1R w KQ - 0 9",
    context: "White has kingside space; Black is solid in the centre.",
    questions: [
      "Konse wing pe aap zyada space rakhte hain?",
      "Attack waahan kaise launch karenge — Bd3 + h3 + g4 idea?",
      "Defender king ka safety kaise compromise karenge?",
    ],
    keyIdeas: [
      "Attack where you have more space.",
      "If centre is locked, wing attacks become decisive.",
      "Typical plan: open a file with a pawn break (g4-g5 here).",
    ],
  },

  // ============ INTERMEDIATE ============
  {
    id: "i1-minority-attack",
    title: "Minority Attack (QGD Exchange)",
    level: "Intermediate",
    theme: "Planning",
    side: "white",
    fen: "r1bq1rk1/pp3ppp/2nbpn2/3p4/3P4/2N1PN2/PPQ1BPPP/R1B2RK1 w - - 0 9",
    context: "Exchange QGD: Black pawns a7/b7/c6/d5, White b2/c2.",
    questions: [
      "Black ke queenside pawns target karne ka tareeka?",
      "Konsi pawn advance se c6 backward banega?",
      "Minor pieces kahan rakhne hain b-file ke liye?",
    ],
    keyIdeas: [
      "b4-b5 challenges c6 — creates a backward pawn or weak square.",
      "After bxc6, Black gets a weak c6 pawn or White gets the b-file.",
      "Rooks on b-file, knight to a4/c5.",
    ],
  },
  {
    id: "i2-iqp-attack",
    title: "Attacking the IQP — blockade and win",
    level: "Intermediate",
    theme: "Pawn Structures",
    side: "black",
    fen: "r1bq1rk1/pp3ppp/2n1pn2/8/2BP4/2N2N2/PP3PPP/R1BQ1RK1 b - - 0 9",
    context: "White has an isolated d4 pawn. Black wants to blockade and win it.",
    questions: [
      "IQP ke saamne kaun sa square blockade ke liye perfect hai?",
      "Kaun sa Black piece blockader banega?",
      "Endgame mein IQP ko target karne ka sequence?",
    ],
    keyIdeas: [
      "Square in front of IQP (d5) = permanent outpost.",
      "Knight is best blockader — controls squares without being attacked.",
      "Trade minors → convert d4 weakness in endgame.",
    ],
  },
  {
    id: "i3-iqp-attacker",
    title: "Playing WITH the IQP — attack first",
    level: "Intermediate",
    theme: "Attack",
    side: "white",
    fen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2N1BN2/PP3PPP/R2Q1RK1 w - - 0 11",
    context: "White accepts the IQP for piece activity and attacking chances.",
    questions: [
      "IQP holder ka plan kya hota hai — attack ya endgame?",
      "Konsa pawn break (d5) decisive ho sakta hai?",
      "Pieces ko kingside attack ke liye kaise reroute karenge?",
    ],
    keyIdeas: [
      "IQP gives you open lines, an outpost on e5, and attacking chances.",
      "Trade is BAD — every trade weakens your dynamic potential.",
      "Watch for the d5 break — it can crash open Black's structure.",
    ],
  },
  {
    id: "i4-piece-activity",
    title: "Activate your WORST piece first",
    level: "Intermediate",
    theme: "Piece Activity",
    side: "white",
    fen: "r2q1rk1/pp1bbppp/2n1pn2/3p4/2PP4/2N1PN2/PPQ1BPPP/R1B2RK1 w - - 0 10",
    context: "All pieces developed, but White's c1 bishop is passive.",
    questions: [
      "Sabse passive piece kaun sa hai?",
      "Use kaha activate karne ka plan — b3+Bb2, Bd2-c3, ya Bg5?",
      "Pawn move ke baad max diagonal kis ke liye?",
    ],
    keyIdeas: [
      "Makogonov's rule: improve your worst piece first.",
      "Bc1 is dead — Bd2 + Rac1 or b3 + Bb2 onto the long diagonal.",
      "All pieces working > one star + one dead piece.",
    ],
  },
  {
    id: "i5-prophylaxis-basic",
    title: "Prophylaxis: stop their plan first",
    level: "Intermediate",
    theme: "Prophylaxis",
    side: "white",
    fen: "r1bq1rk1/pp2bppp/2n1pn2/3p4/2PP4/2N1PN2/PPQ1BPPP/R1B2RK1 w - - 0 9",
    context: "Black wants …dxc4 and …b5 expanding queenside.",
    questions: [
      "Opponent ka next 2-3 moves ka plan kya hai?",
      "Konsa pawn ya piece move us plan ko stop karega?",
      "Prophylactic move ke baad apna plan kya?",
    ],
    keyIdeas: [
      "Prophylaxis = ask 'what does my opponent want?' first.",
      "a4 prevents …b5, b3 supports c4, Rd1 anticipates …dxc4.",
      "Karpov's style: small restricting moves, then squeeze.",
    ],
  },
  {
    id: "i6-carlsbad-structure",
    title: "Carlsbad structure — pick your plan",
    level: "Intermediate",
    theme: "Pawn Structures",
    side: "white",
    fen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2N1PN2/PPQ2PPP/R1B2RK1 w - - 0 9",
    context: "Classic Carlsbad pawn structure from QGD Exchange.",
    questions: [
      "Carlsbad mein White ke 3 typical plans kya hain?",
      "Minority attack (b4-b5) vs central e3-f3-e4 vs kingside attack — kaunsa choose?",
      "Black ke setup ke saath kaunsa best fit hai?",
    ],
    keyIdeas: [
      "Three plans: Minority Attack (b4-b5), Central break (e4), Kingside attack (Nf5).",
      "Choose based on Black's setup — minor piece placement decides.",
      "Karlsbad is the most-studied pawn structure for a reason.",
    ],
  },
  {
    id: "i7-outpost-knight",
    title: "Knight outpost on d5 / e5",
    level: "Intermediate",
    theme: "Piece Activity",
    side: "white",
    fen: "r1bq1rk1/pp3ppp/2n1pn2/3pN3/3P4/2N1P3/PPQ2PPP/R1B2RK1 w - - 0 9",
    context: "Knight on e5 supported by d4 pawn — classic outpost.",
    questions: [
      "Outpost knight ko trade karne dena hai ya nahi?",
      "Agar Black trade kare to recapture knight se ya pawn se?",
      "Knight ke peeche kaunse pieces line up karenge?",
    ],
    keyIdeas: [
      "Outpost = defended square the opponent can't attack with a pawn.",
      "Don't trade outpost knights cheaply — they're worth more than bishops here.",
      "Pile pieces behind the knight: Qe2 + Re1 + sometimes f4 for support.",
    ],
  },
  {
    id: "i8-defensive-thinking",
    title: "Defense: trade attackers, not defenders",
    level: "Intermediate",
    theme: "Defense",
    side: "black",
    fen: "r1bq1rk1/pp1nbppp/4pn2/2pp4/3P4/2NBPN2/PPQB1PPP/R4RK1 b - - 0 9",
    context: "Black is under positional pressure on the kingside.",
    questions: [
      "Defender mein konse pieces TRADE karna chahiye — attackers ya defenders?",
      "Apna sabse important defender konsa hai?",
      "Counter-play kahan launch ho sakta hai?",
    ],
    keyIdeas: [
      "Rule: trade attackers, keep defenders.",
      "Identify the opponent's most active piece — that's the one to trade.",
      "Defense + counter-play > pure defense.",
    ],
  },

  // ============ ADVANCED ============
  {
    id: "a1-color-complex",
    title: "Dominate a color complex",
    level: "Advanced",
    theme: "Pawn Structures",
    side: "white",
    fen: "r1bq1rk1/pp2bppp/2n1pn2/3pP3/3P4/2NB1N2/PPQ2PPP/R1B2RK1 w - - 0 9",
    context: "French-Advance structure. Pawns on e5/d4 vs e6/d5.",
    questions: [
      "Black ke dark squares kahan kamzor hain?",
      "Pieces dark-square attack ke liye kaise reroute?",
      "Bishop pair se dono diagonals kaise dominate?",
    ],
    keyIdeas: [
      "Black's dark-squared bishop is bad behind …e6/…d5 — exchange it if possible.",
      "Knight maneuver Nf3-h4-f3-d4-f5 or e2-g3-f5.",
      "Pile on f6/h6 dark squares, often with f4-f5 break.",
    ],
  },
  {
    id: "a2-positional-sacrifice",
    title: "Positional exchange sacrifice",
    level: "Advanced",
    theme: "Piece Activity",
    side: "black",
    fen: "r4rk1/1bqnbppp/p2ppn2/1p6/3NPP2/1BN1B3/PPP1Q1PP/2KR3R b - - 0 13",
    context: "Sicilian Najdorf — Black considers …Rxc3 sacrificing exchange for structure.",
    questions: [
      "…Rxc3 ke baad Black ko kya milta hai?",
      "Kya White ke ek piece ko 'permanently bad' bana sakte hain?",
      "5-6 moves baad evaluate kaise — material vs activity?",
    ],
    keyIdeas: [
      "Petrosian-style: …Rxc3 doubles White's c-pawns + gives Black a knight outpost.",
      "Exchange sac is sound when you get: structural damage + dominant minor + safe king.",
      "Long-term, bishop pair + weak c2/c3 compensate.",
    ],
  },
  {
    id: "a3-prophylactic-squeeze",
    title: "Karpovian prophylactic squeeze",
    level: "Advanced",
    theme: "Prophylaxis",
    side: "white",
    fen: "2rq1rk1/pb1nbppp/1p2pn2/3p4/2PP4/1PN1PN2/PB2BPPP/R2QR1K1 w - - 0 12",
    context: "Symmetrical-ish QGD. Looking for tiny improvements.",
    questions: [
      "Black ke har piece ka best square kya hai — kya pehle prevent?",
      "Rook a1 ya c1 — kaunsa file plan se match?",
      "Pawn structure mein minor concession se kya kya milta?",
    ],
    keyIdeas: [
      "List opponent's best squares: Nf6→e4, Bb7 wants …dxc4, Rc8 wants c-file open.",
      "Qb1, Rac1, h3 (avoiding …Ng4) = tiny restrictive improvements.",
      "Accumulate 5-6 such moves, then find the break.",
    ],
  },
  {
    id: "a4-pawn-break",
    title: "Choose the right pawn break (Closed Ruy)",
    level: "Advanced",
    theme: "Planning",
    side: "white",
    fen: "r1bq1rk1/2p1bppp/p1np1n2/1p2p3/3PP3/1BP2N1P/PP3PP1/RNBQR1K1 w - - 0 9",
    context: "Closed Ruy Lopez — choose d5, a4, or c4 break.",
    questions: [
      "Teen breaks (d5, a4, c4) — kaunsa Black ki strongest piece ko target?",
      "Konse break ke baad open files/diagonals milte hain?",
      "Timing — abhi karen ya prep moves chahiye?",
    ],
    keyIdeas: [
      "d5 closes centre → kingside attack with Nf1-g3-f5.",
      "a4 challenges queenside expansion.",
      "Right answer: d5 + slow kingside buildup.",
    ],
  },
  {
    id: "a5-triangulation-mg",
    title: "Mini-triangulation in middlegame",
    level: "Advanced",
    theme: "Prophylaxis",
    side: "white",
    fen: "r4rk1/pp2bppp/2n1pn2/3p4/2PP4/2N1PN2/PP2BPPP/R1B2RK1 w - - 0 12",
    context: "Subtle move-order: how do you 'pass' the move to opponent in middlegame?",
    questions: [
      "Konse 'waiting moves' khel ke aap opponent ko sochne pe majboor kar sakte hain?",
      "Iss position mein konsa quiet move best hai?",
      "Triangulation se kya milta hai?",
    ],
    keyIdeas: [
      "Waiting moves like Bd2 or Kh1 force the opponent to commit.",
      "Once opponent's plan is shown, you choose the right counter.",
      "Patience > forcing — at high level.",
    ],
  },
  {
    id: "a6-attacking-kingside",
    title: "Classical kingside attack with castled opposite",
    level: "Advanced",
    theme: "Attack",
    side: "white",
    fen: "r2q1rk1/pp2bppp/2nbpn2/3p4/3P4/2NBPN2/PPQ2PPP/2KR3R w - - 0 11",
    context: "Opposite-side castling — race begins.",
    questions: [
      "Pehla pawn-storm move kaunsa — g4 ya h4?",
      "Konse pieces ko sacrifice ke liye consider karenge?",
      "Defender ka counter-attack kahan tezi se aata hai?",
    ],
    keyIdeas: [
      "Push pawns NOT defended by king (h4-g4-g5).",
      "Open the h-file or g-file for the rook.",
      "Sacrifice on h7/h6 if it opens decisive lines — speed > material.",
    ],
  },
];

export function listLessons() { return MIDDLEGAME_LESSONS; }
export function getLesson(id: string) { return MIDDLEGAME_LESSONS.find((l) => l.id === id); }
