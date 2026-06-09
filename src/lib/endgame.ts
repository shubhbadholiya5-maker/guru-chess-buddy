// Endgame Academy — categorized technical positions.
// Schema designed to scale to 200+ positions across levels.
export type EndgamePosition = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  theme: "Basic Mates" | "King & Pawn" | "Opposition" | "Rook Endings" | "Minor Piece" | "Advanced Technique";
  side: "white" | "black"; // side to move / study
  fen: string;
  context: string;
  questions: string[];
  keyIdeas: string[];
};

export const ENDGAMES: EndgamePosition[] = [
  // ============ BEGINNER ============
  {
    id: "kqk-mate",
    title: "King + Queen vs King — basic mate",
    level: "Beginner",
    theme: "Basic Mates",
    side: "white",
    fen: "4k3/8/8/8/8/8/8/3QK3 w - - 0 1",
    context: "Most fundamental mate. Use the queen to confine the king, the king to deliver mate.",
    questions: [
      "Queen ko kis distance pe rakhna chahiye — knight's-move away ya adjacent?",
      "Stalemate ka risk kab badh jata hai?",
      "Kingko centralize karna kab start karna hai?",
    ],
    keyIdeas: [
      "Queen a knight's-move away from the lone king — drives it to the edge without stalemate risk.",
      "Once the king is on the edge, bring YOUR king up to deliver mate.",
      "Always count escape squares before checking — avoid stalemate.",
    ],
  },
  {
    id: "krk-mate",
    title: "King + Rook vs King",
    level: "Beginner",
    theme: "Basic Mates",
    side: "white",
    fen: "4k3/8/8/8/8/8/8/3RK3 w - - 0 1",
    context: "Two-step technique: cut off the king with the rook, then walk the king up.",
    questions: [
      "Rook se king ko kaunse line mein cut karoge — file ya rank?",
      "Opposition kab use karna hai?",
      "Final mate kis edge pe deliver hoga?",
    ],
    keyIdeas: [
      "Rook builds a fence; YOUR king pushes the enemy king toward it.",
      "Use opposition (kings face-to-face) to push the enemy back step by step.",
      "Deliver mate with the rook along the edge while your king blocks escape.",
    ],
  },
  {
    id: "square-rule",
    title: "Square Rule (King catches the pawn)",
    level: "Beginner",
    theme: "King & Pawn",
    side: "black",
    fen: "8/8/8/8/3k4/8/4P3/4K3 b - - 0 1",
    context: "Can Black's king catch the passed e-pawn? Use the rule of the square.",
    questions: [
      "Pawn ke aage ek square draw karo — kya Black king us square mein enter kar sakta hai?",
      "Agar White's king pawn ko support kare to kya hota hai?",
      "Counting tempi — kaunsa side win karta hai?",
    ],
    keyIdeas: [
      "Square of the pawn = an imaginary square with the pawn at one corner and the promotion square diagonally opposite.",
      "If the defending king is inside (or can step into) the square on its move, it catches the pawn.",
      "Always count carefully — every tempo matters.",
    ],
  },
  {
    id: "kbnk-corner",
    title: "Mate idea: drive the king to the right corner",
    level: "Beginner",
    theme: "Basic Mates",
    side: "white",
    fen: "8/8/8/8/3K4/8/8/2N1B2k w - - 0 1",
    context: "King + Bishop + Knight mate — only the corner of the bishop's color allows mate.",
    questions: [
      "Bishop kaunsi color pe hai — light ya dark?",
      "Mate kis corner mein deliver karoge?",
      "King ko us corner tak kaise drive karoge?",
    ],
    keyIdeas: [
      "Mate is only possible in a corner of the BISHOP'S color.",
      "Use 'W maneuver' with the knight to escort the king from the wrong corner to the right one.",
      "Patience — this is a 30-50 move technical endgame, well within the 50-move rule.",
    ],
  },

  // ============ INTERMEDIATE ============
  {
    id: "opposition-direct",
    title: "Direct Opposition (K+P vs K)",
    level: "Intermediate",
    theme: "Opposition",
    side: "white",
    fen: "8/8/8/3k4/8/3K4/3P4/8 w - - 0 1",
    context: "Classic K+P vs K — White wants to promote, Black wants to draw via opposition.",
    questions: [
      "Opposition ka matlab kya hai — kings face-to-face with one square between?",
      "Whose move loses opposition?",
      "White ko pehle pawn push karna chahiye ya king pehle?",
    ],
    keyIdeas: [
      "Whoever has to MOVE in direct opposition loses ground.",
      "King first, pawn second — the king must lead the pawn to promote.",
      "If the defending king reaches the queening square in front of the pawn first, it's usually a draw.",
    ],
  },
  {
    id: "key-squares",
    title: "Key Squares for a passed pawn",
    level: "Intermediate",
    theme: "King & Pawn",
    side: "white",
    fen: "8/8/8/3k4/8/3P4/3K4/8 w - - 0 1",
    context: "For a non-rook pawn, the three squares two ranks ahead are 'key squares'.",
    questions: [
      "d3-pawn ke liye key squares konse hain (think two ranks ahead, 3 squares wide)?",
      "Agar aapka king kisi key square pe pohonch jaye, kya pawn promote ho jata hai?",
      "Defender ka best plan kya hai?",
    ],
    keyIdeas: [
      "Key squares for d3 pawn = c5, d5, e5.",
      "If your king reaches a key square, the pawn promotes regardless of who moves.",
      "Race for key squares — not the pawn — in K+P endings.",
    ],
  },
  {
    id: "rook-pawn-draw",
    title: "Rook-pawn draws even a piece up",
    level: "Intermediate",
    theme: "King & Pawn",
    side: "white",
    fen: "8/8/8/8/8/8/7P/k6K w - - 0 1",
    context: "Wrong-rook-pawn endings can be drawn even when the defender has no piece.",
    questions: [
      "Black king kahan jaye to draw secure kare?",
      "Rook pawn promotion square ka color kya hai?",
      "Wrong bishop + rook pawn = draw — kyun?",
    ],
    keyIdeas: [
      "If the defender's king reaches the corner of the promotion square, it's a stalemate fortress.",
      "Rook pawns + wrong-color bishop = automatic draw — a famous exception.",
      "Always check pawn type and corner color before evaluating winning chances.",
    ],
  },
  {
    id: "lucena-position",
    title: "Lucena Position (building a bridge)",
    level: "Intermediate",
    theme: "Rook Endings",
    side: "white",
    fen: "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1",
    context: "The single most important winning rook endgame technique.",
    questions: [
      "Aapka king kaise nikalega promotion square se?",
      "Bridge banane ke liye rook kahan rakhni hai (which rank)?",
      "Final winning move ka idea kya hai?",
    ],
    keyIdeas: [
      "Bring the rook to the 4th rank (Rc4) to build a 'bridge'.",
      "After the king walks out, the rook blocks any side-checks along the file.",
      "Memorize this — every rook ending is judged by whether you can reach Lucena.",
    ],
  },
  {
    id: "philidor-position",
    title: "Philidor Position (3rd rank defence)",
    level: "Intermediate",
    theme: "Rook Endings",
    side: "black",
    fen: "8/8/8/4k3/4P3/4K3/r7/4R3 b - - 0 1",
    context: "Defensive technique: keep your rook on the 3rd (or 6th from your side) rank until the pawn advances.",
    questions: [
      "Black rook ko kis rank pe rakhna hai — aur kyun?",
      "Pawn advance kab move karta hai aur usse pehle ya baad mein rook kahan jaye?",
      "Final draw setup kya hai?",
    ],
    keyIdeas: [
      "Defender's rook on the 3rd rank (6th for Black) prevents the enemy king from advancing.",
      "When the pawn pushes to your rank, drop the rook BEHIND the enemy king to give endless checks.",
      "Lucena and Philidor are mirror techniques — both must be memorized.",
    ],
  },
  {
    id: "two-bishops-mate",
    title: "Two Bishops Mate",
    level: "Intermediate",
    theme: "Basic Mates",
    side: "white",
    fen: "8/8/8/8/3K4/8/8/3kB1B1 w - - 0 1",
    context: "Bishop pair restricts a lone king to the corner; the friendly king delivers mate.",
    questions: [
      "Bishops ek doosre ko kis pattern mein support karte hain?",
      "King ko kis corner mein drive karna hai?",
      "Stalemate ka risk kab?",
    ],
    keyIdeas: [
      "Two bishops one square apart form an unbreakable wall.",
      "Slowly drive the king to any corner, then mate with the king + bishop combo.",
      "Watch stalemate — give 'escape moves' until the final mating sequence.",
    ],
  },

  // ============ ADVANCED ============
  {
    id: "vancura-position",
    title: "Vancura Position",
    level: "Advanced",
    theme: "Rook Endings",
    side: "black",
    fen: "8/8/8/8/8/k6P/8/4K2r b - - 0 1",
    context: "Defensive fortress vs rook-pawn — the rook attacks from the side, never from behind.",
    questions: [
      "Rook ko a-pawn ke peeche kyun nahi rakhte?",
      "Side checks pawn ko advance hone se kaise rokte hain?",
      "Defender king kahan jaye to fortress complete ho?",
    ],
    keyIdeas: [
      "Defender's rook attacks the pawn from the SIDE (along the rank), not from behind.",
      "Constant side-checks prevent White's king from supporting the pawn.",
      "Vancura draws an otherwise lost-looking R+P (rook pawn) ending.",
    ],
  },
  {
    id: "triangulation",
    title: "Triangulation — losing a tempo",
    level: "Advanced",
    theme: "Opposition",
    side: "white",
    fen: "8/8/3k4/3p4/3P4/3K4/8/8 w - - 0 1",
    context: "When you want your opponent to move but the position is symmetric — triangulate.",
    questions: [
      "Symmetric position mein who's to move loses — kaise?",
      "Triangulation route kya hai — 3 squares ka loop?",
      "Final winning idea kya banta hai?",
    ],
    keyIdeas: [
      "Triangulation = move your king on a triangular route to lose ONE tempo and pass the move to the opponent.",
      "Only works when YOU have triangulating squares and the opponent doesn't.",
      "Classic in K+P endings with reciprocal zugzwang.",
    ],
  },
  {
    id: "corresponding-squares",
    title: "Corresponding Squares",
    level: "Advanced",
    theme: "Advanced Technique",
    side: "white",
    fen: "8/8/p1p5/P1P1k3/4P3/4K3/8/8 w - - 0 1",
    context: "Mutual zugzwang in fixed pawn structures — every square for one king has a matching square for the other.",
    questions: [
      "Locked pawn structure mein kings ke corresponding squares kaise identify karte hain?",
      "Whoever moves first into the wrong correspondence loses — kyun?",
      "Yeh concept opposition ka generalisation hai — sahmat?",
    ],
    keyIdeas: [
      "Each square the attacking king can reach has a unique 'corresponding' square for the defender.",
      "If you can force the opponent off their corresponding square, you break through.",
      "Used in tough K+P endings with multiple pawn islands.",
    ],
  },
  {
    id: "opposite-color-bishops",
    title: "Opposite-coloured bishops — defensive fortress",
    level: "Advanced",
    theme: "Minor Piece",
    side: "black",
    fen: "8/8/3k4/p7/P1P5/2K5/8/3B2b1 b - - 0 1",
    context: "Even a 2-pawn deficit can be drawn with opposite-coloured bishops.",
    questions: [
      "Defender bishop kis color squares control karta hai?",
      "Attacker bishop ke pawns kahan rok sakte ho?",
      "Fortress ka setup kya hai?",
    ],
    keyIdeas: [
      "Place your king and bishop on squares the attacker's bishop can NEVER attack.",
      "The attacker's pieces never coordinate — pawns can't all promote.",
      "Even 2 extra pawns often = draw with opposite-coloured bishops.",
    ],
  },
  {
    id: "kbn-mate-w-maneuver",
    title: "K+B+N mate — the W-maneuver",
    level: "Advanced",
    theme: "Basic Mates",
    side: "white",
    fen: "8/8/8/8/3K4/8/8/2N1Bk2 w - - 0 1",
    context: "Hardest basic mate — drive the king from the wrong corner to the bishop's color corner.",
    questions: [
      "Bishop ki color kya hai aur mate kis corner mein possible hai?",
      "W-maneuver knight se kaise hota hai?",
      "50-move rule before mate complete ho jaye — kaise ensure karein?",
    ],
    keyIdeas: [
      "Use the knight to make a 'W' route, escorting the king from one corner to the other.",
      "Bishop creates the wall; king blocks; knight delivers mate.",
      "Practice this — it appears rarely but is devastating when missed.",
    ],
  },
  {
    id: "minority-attack-endgame",
    title: "Endgame after minority attack",
    level: "Advanced",
    theme: "Advanced Technique",
    side: "white",
    fen: "8/p4ppp/2p1k3/8/8/4K3/PP3PPP/8 w - - 0 1",
    context: "After a successful minority attack, the resulting endgame features a target on c6.",
    questions: [
      "c6 pawn kis tarah weak hai — backward, isolated, ya both?",
      "King ko kahan centralize karna chahiye?",
      "Rook ka ideal square c-file pe ya 7th rank pe?",
    ],
    keyIdeas: [
      "Backward c6 pawn on the half-open c-file is a long-term target.",
      "Centralize the king to e4-d4 first, then attack the weakness.",
      "Often you trade rooks on the c-file and win the pawn ending.",
    ],
  },
];

export function listEndgames() { return ENDGAMES; }
export function getEndgame(id: string) { return ENDGAMES.find((e) => e.id === id); }
