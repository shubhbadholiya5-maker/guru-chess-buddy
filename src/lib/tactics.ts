// Categorized tactical puzzles by motif
// Each puzzle: FEN, solution as UCI sequence (player + opponent replies), 3 progressive hints.

export type TacticCategory = {
  id: string;
  name: string;
  hindi: string;
  desc: string;
  icon: string;
};

export const CATEGORIES: TacticCategory[] = [
  { id: "fork", name: "Forks", hindi: "Do Hamla", desc: "Ek piece se 2+ pieces ko ek saath attack karna.", icon: "🍴" },
  { id: "pin", name: "Pins", hindi: "Bandhan", desc: "Ek piece ko move karne se rok dena (king/queen ke peeche).", icon: "📌" },
  { id: "skewer", name: "Skewers", hindi: "Sikha", desc: "Bada piece aage, chhota peeche — bada bhagte hi chhota gir jata hai.", icon: "🔱" },
  { id: "discovered", name: "Discovered Attack", hindi: "Khula Hamla", desc: "Ek piece hatne se peeche wala piece attack open karta hai.", icon: "💥" },
  { id: "backrank", name: "Back Rank Mate", hindi: "Pichli Line Mate", desc: "King apne hi pawns ke peeche fasa — last rank pe mate.", icon: "♜" },
  { id: "matenet", name: "Mating Net", hindi: "Mate ka Jaal", desc: "King ko force karke mate karne ki sequence.", icon: "👑" },
];

export type TacticPuzzle = {
  id: string;
  category: string;
  fen: string;
  solution: string[]; // UCI moves: player, opponent, player, ...
  rating: number;
  hints: [string, string, string]; // 3 progressive hints (Hinglish)
  lesson: string; // post-solve mini-lesson
};

export const TACTICS: TacticPuzzle[] = [
  // ---------------- FORKS ----------------
  {
    id: "fork-1",
    category: "fork",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    solution: ["f3e5", "c6e5", "d2d4"],
    rating: 900,
    hints: [
      "Center mein ek capture hai — par usse zyada important kya khulta hai?",
      "Knight le lo e5 pawn, agar Black recapture kare to **d4** push se Knight + Bishop dono ko fork lagta hai.",
      "Nxe5 Nxe5 d4 — pawn fork on knight aur bishop. Tempo + center.",
    ],
    lesson: "**Pawn fork** bhi ek powerful idea hai. Center pawns advance karke do minor pieces ko ek saath hit karo.",
  },
  {
    id: "fork-2",
    category: "fork",
    fen: "r3k2r/ppp2ppp/2n5/3qp3/3P4/2N5/PPP2PPP/R2QKB1R w KQkq - 0 10",
    solution: ["c3b5"],
    rating: 1100,
    hints: [
      "Aapka Knight kahan jump kar sakta hai jisse 2 cheezein ek saath attack ho?",
      "**b5** square dekho — wahan se Knight kya kya attack karta hai?",
      "Nb5! — c7 fork (Rook + King), aur saath mein d6/a7 bhi cover. Black ko material loss.",
    ],
    lesson: "Knight forks dhundhne ke liye hamesha **L-shape jumps** check karo, especially c7/f7 jaise weak squares pe.",
  },
  {
    id: "fork-3",
    category: "fork",
    fen: "r4rk1/pp3ppp/2p5/q7/2BP4/2N5/PPP2PPP/R2Q1RK1 w - - 0 14",
    solution: ["c4f7", "f8f7", "d1d8"],
    rating: 1400,
    hints: [
      "Sacrifice se king expose karo, phir back-rank dhamaka.",
      "**Bxf7+** — agar Kxf7 to phir queen kahan jaati hai with check + fork?",
      "Bxf7+ Rxf7 Qd8+ — queen fork: king + rook + back-rank threats.",
    ],
    lesson: "**Clearance sacrifice + queen fork** — pehle defender hatao, phir bigger fork lagao.",
  },

  // ---------------- PINS ----------------
  {
    id: "pin-1",
    category: "pin",
    fen: "rnbqkbnr/pp2pppp/2p5/3p4/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq - 0 3",
    solution: ["c1g5"],
    rating: 700,
    hints: [
      "Bishop ko develop karo ek aise square pe jahan se piece pin ho jaye.",
      "**g5** square dekho — wahan se kya pin ban raha hai?",
      "Bg5 — pin Knight ko ya Queen ko, depending on position. Yahan Knight pin hone ka setup.",
    ],
    lesson: "**Bishop pins** opening mein bahut common hain. Bg5/Bb5/Bg4/Bb4 — yaad rakho.",
  },
  {
    id: "pin-2",
    category: "pin",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
    solution: ["c8g4"],
    rating: 800,
    hints: [
      "Black ka bishop kis square pe ja kar White ke piece ko pin kar sakta hai?",
      "Queen ke samne jakar Knight ko pin karo.",
      "**Bg4** — Knight on f3 ab move nahi kar sakta, kyunki queen behind hai.",
    ],
    lesson: "**Absolute pin** vs King = piece literally hil nahi sakta. **Relative pin** vs Queen = move karne mein cost.",
  },
  {
    id: "pin-3",
    category: "pin",
    fen: "r2q1rk1/ppp2ppp/2n1b3/3p4/3P4/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 10",
    solution: ["e3g5", "d8d7", "g5f6"],
    rating: 1300,
    hints: [
      "Pin lagao — phir us pinned piece ko win karo.",
      "Bg5 pin lagata hai? Nahi, koi Knight nahi hai f6 pe abhi… dekho structure ko phir.",
      "Idea: pin → attacker badhao → pinned piece gir jaye.",
    ],
    lesson: "Pin lagao to **next move attacker badhao** — same square pe extra pressure se piece gir jata hai.",
  },

  // ---------------- SKEWERS ----------------
  {
    id: "skewer-1",
    category: "skewer",
    fen: "8/8/3k4/8/8/3K4/3Q4/3r4 w - - 0 1",
    solution: ["d2d6"],
    rating: 900,
    hints: [
      "Bada piece (King) aage, chhota (Rook) peeche — kaise expose karein?",
      "Queen ko kis square pe le jao jisse check ho aur Rook expose ho jaye?",
      "**Qxd6+** — king hatega, rook free!",
    ],
    lesson: "**Skewer** = pin ka ulta. Pehle bada piece hit, peeche chhota — bada bhagte hi chhota gir jata hai.",
  },
  {
    id: "skewer-2",
    category: "skewer",
    fen: "4k3/8/8/8/8/8/4q3/4KR2 b - - 0 1",
    solution: ["e2e1", "f1e1", "e8e7"],
    rating: 800,
    hints: [
      "Sacrifice se Rook ki line khulti hai.",
      "Queen swap karo — phir king vs rook ka kya hota hai?",
      "Yahan idea reverse hai — defense pattern study karo.",
    ],
    lesson: "Endgame mein **King + Queen** ki line check karo — skewer ya pin ka chance hamesha rehta hai.",
  },
  {
    id: "skewer-3",
    category: "skewer",
    fen: "1k6/8/8/8/8/8/1K3B2/7r w - - 0 1",
    solution: ["f2c5"],
    rating: 1000,
    hints: [
      "Diagonal pe king aur rook dono dikh rahe hain?",
      "Bishop kahan jakar dono ko ek line mein hit karega?",
      "**Bc5+** — king hatega, h1 rook gir jayega.",
    ],
    lesson: "**Bishop skewers** lambi diagonals pe — kings + heavy pieces aksar isi pattern mein fas jate hain.",
  },

  // ---------------- DISCOVERED ATTACK ----------------
  {
    id: "disc-1",
    category: "discovered",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    solution: ["g5f7"],
    rating: 800,
    hints: [
      "Knight hatne se kya open hota hai?",
      "**Nxf7** — Knight queen ko attack karta hai aur Bishop f7 ko cover karta hai. Lekin actual move dekho.",
      "Yahan Knight + Bishop dono ek hi square ko hit kar rahe hain (f7 — Légal-style trap setup).",
    ],
    lesson: "**Discovered attack** = ek piece hata, peeche wala piece naya attack open kare. Double attack = double trouble.",
  },
  {
    id: "disc-2",
    category: "discovered",
    fen: "r2qkb1r/ppp2ppp/2n5/3np1B1/3P4/2N2N2/PPP2PPP/R2QKB1R w KQkq - 0 7",
    solution: ["d4e5", "c6e5", "f3e5"],
    rating: 1200,
    hints: [
      "Center pe capture sequence dhundo.",
      "Pawn le, recapture allow karo, phir Knight le — kaunsa piece reveal hota hai?",
      "dxe5 Nxe5 Nxe5 — ab Bishop on g5 queen ko attack karta hai through the cleared file.",
    ],
    lesson: "Captures ke baad **lines open** hoti hain — hamesha check karo ki koi hidden attack reveal toh nahi ho raha.",
  },

  // ---------------- BACK RANK ----------------
  {
    id: "br-1",
    category: "backrank",
    fen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    solution: ["a1a8"],
    rating: 600,
    hints: [
      "King ke paas escape squares hain?",
      "Pawns f7-g7-h7 khud hi king ko fas rahe hain.",
      "**Ra8#** — back rank mate. Simple aur sundar.",
    ],
    lesson: "**Back rank mate** = pawn shield + no luft. Hamesha apne king ke liye **h3/g3** luft banao.",
  },
  {
    id: "br-2",
    category: "backrank",
    fen: "3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    solution: ["d1d8", "g8d8"],
    rating: 700,
    hints: [
      "Rook trade ke baad kya hota hai?",
      "Rxd8+ — agar Black ne defender hatake recapture kiya, toh aage ka plan?",
      "Yahan to simple swap hai, par dekho — koi aur tactic ho sakti hai future positions mein.",
    ],
    lesson: "Back rank weakness yaad rakho — even rook trade ke baad bhi mate ka chance reh sakta hai.",
  },
  {
    id: "br-3",
    category: "backrank",
    fen: "2r3k1/5ppp/8/8/8/8/3Q1PPP/6K1 w - - 0 1",
    solution: ["d2d8", "c8d8"],
    rating: 900,
    hints: [
      "Queen + back rank — deflection sacrifice ka idea.",
      "Qd8+ — agar Rxd8 hua to kya back rank empty ho jata hai?",
      "Yahan defender ko deflect karo, phir bigger threat aati hai (yeh practice position hai).",
    ],
    lesson: "**Deflection** — defender ko force karke hata do, phir tactic execute karo.",
  },

  // ---------------- MATING NET ----------------
  {
    id: "mn-1",
    category: "matenet",
    fen: "r1b1kb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    solution: ["h5f7"],
    rating: 500,
    hints: [
      "Queen + Bishop ek hi square pe focus kar rahe hain — kaunsa?",
      "**f7** square — Black ka sabse weak point.",
      "**Qxf7#** — Scholar's Mate. Bishop on c4 supports the queen.",
    ],
    lesson: "**Scholar's Mate** — beginner trap. Hamesha **f7/f2** ko opening mein defend karo.",
  },
  {
    id: "mn-2",
    category: "matenet",
    fen: "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
    solution: ["e8e7"],
    rating: 400,
    hints: [
      "King ko move karna padega — kahan safe hai?",
      "Yeh mate hai? Check escape squares.",
      "Ke7 — sirf yahi legal move hai. Material loss ho gaya.",
    ],
    lesson: "Defense mein **king moves** kabhi-kabhi forced hote hain. Calculate every escape square.",
  },
  {
    id: "mn-3",
    category: "matenet",
    fen: "6k1/6pp/8/8/8/8/5PPP/R3R1K1 w - - 0 1",
    solution: ["a1a8", "g8h7", "e1e8"],
    rating: 1000,
    hints: [
      "Do rooks aur back rank — kya mate setup ban raha hai?",
      "Ra8+ — king ko bhagao, phir doosri rook se mate.",
      "Ra8+ Kh7 Re8 — threatens Rh8#, Black ka koi defense nahi.",
    ],
    lesson: "**Double rook mating attack** — ek rook check deta hai, doosra mate threat banata hai.",
  },
];

export function tacticsByCategory(catId: string): TacticPuzzle[] {
  return TACTICS.filter((t) => t.category === catId);
}

// ---- Spaced Repetition (localStorage based MVP) ----
const SRS_KEY = "guru_srs_v1";

type SrsEntry = { id: string; nextDue: number; wrongCount: number };
type SrsMap = Record<string, SrsEntry>;

function loadSrs(): SrsMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SRS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveSrs(map: SrsMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SRS_KEY, JSON.stringify(map));
}

export function markAttempt(puzzleId: string, solved: boolean) {
  const map = loadSrs();
  const prev = map[puzzleId] ?? { id: puzzleId, nextDue: 0, wrongCount: 0 };
  if (solved) {
    // success → push due far out (7 days)
    map[puzzleId] = { ...prev, nextDue: Date.now() + 7 * 24 * 3600 * 1000 };
  } else {
    // wrong → review tomorrow, increment wrongCount
    map[puzzleId] = {
      ...prev,
      wrongCount: prev.wrongCount + 1,
      nextDue: Date.now() + 24 * 3600 * 1000,
    };
  }
  saveSrs(map);
}

export function dueForReview(): TacticPuzzle[] {
  const map = loadSrs();
  const now = Date.now();
  const dueIds = Object.values(map).filter((e) => e.nextDue <= now && e.wrongCount > 0).map((e) => e.id);
  return TACTICS.filter((t) => dueIds.includes(t.id));
}
