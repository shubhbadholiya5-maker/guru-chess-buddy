// Fresh middlegame "Live Talk" examples.
// Each example has a start FEN, a scripted move sequence (SAN), and an aligned
// per-move narration in English + Hinglish. The board auto-plays each move as
// the TTS narrates that line.

export type Lang = "en" | "hi";

export interface LiveTalkStep {
  san: string;                 // move to play from the current position
  en: string;                  // English narration for this move
  hi: string;                  // Hinglish narration for this move
}

export interface LiveTalkExample {
  id: string;
  title: string;
  theme: string;
  fen: string;                 // starting position (middlegame)
  intro: { en: string; hi: string };
  steps: LiveTalkStep[];
}

// All positions are legal middlegames reached from mainline theory.
// Kept short (4–8 half-moves) so a full auto-play + narration fits ~60s.
export const LIVE_TALK_EXAMPLES: LiveTalkExample[] = [
  {
    id: "greek-gift",
    title: "The Greek Gift — Bxh7+",
    theme: "Classical bishop sacrifice on h7",
    fen: "r1bq1rk1/pppn1ppp/4pn2/3p4/1b1P4/2NBPN2/PPPB1PPP/R2QK2R w KQ - 0 8",
    intro: {
      en: "White's light-square bishop is aimed at h7, the knight can jump to g5, and the queen has a clear path to h5. That's the Greek Gift recipe.",
      hi: "White ka bishop h7 par aim kar raha hai, knight g5 jump kar sakta hai, aur queen h5 tak clear hai. Yehi Greek Gift ka formula hai.",
    },
    steps: [
      { san: "Bxh7+", en: "Bxh7 check. The sacrifice opens the black king.", hi: "Bxh7 check. Sacrifice se black king khul jata hai." },
      { san: "Kxh7", en: "King takes — forced, otherwise White is just a pawn up.", hi: "King leta hai — forced, warna White ek pawn up rehta." },
      { san: "Ng5+", en: "Knight jumps to g5 with check, threatening Qh5 mate.", hi: "Knight g5 par check ke saath, Qh5 mate ki dhamki." },
      { san: "Kg8", en: "Best try. Now the queen joins.", hi: "Sabse best try. Ab queen aati hai." },
      { san: "Qh5", en: "Qh5, threatening Qh7 mate. Black has no clean defense.", hi: "Qh5, Qh7 mate ki dhamki. Black ke paas saaf defense nahi hai." },
    ],
  },
  {
    id: "isolated-outpost",
    title: "IQP — the e5 Outpost",
    theme: "Isolated queen pawn play",
    fen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 9",
    intro: {
      en: "White has an isolated d-pawn. It's weak long-term, but the e5 square is a permanent outpost. Route the knight there.",
      hi: "White ka d-pawn isolated hai. Long-term weak, lekin e5 ka square permanent outpost hai. Knight wahan lao.",
    },
    steps: [
      { san: "Ne5", en: "Knight lands on e5 — the outpost. Central, unchallengeable by pawns.", hi: "Knight e5 par — outpost. Central, koi pawn hila nahi sakta." },
      { san: "Nxe5", en: "Black trades the outpost knight — but now White recaptures with the pawn.", hi: "Black outpost knight trade karta hai — lekin ab White pawn se lega." },
      { san: "dxe5", en: "Now the d-pawn is gone, e5 controls f6 and d6, and White has a mobile e-pawn.", hi: "Ab d-pawn gaya, e5 f6 aur d6 control karta hai, aur e-pawn mobile hai." },
      { san: "Nd7", en: "Black tries to hit the e5 pawn.", hi: "Black e5 pawn ko target karta hai." },
      { san: "f4", en: "f4 supports the pawn and starts a kingside attack.", hi: "f4 pawn ko support karta hai aur kingside attack shuru." },
    ],
  },
  {
    id: "minority-attack",
    title: "Carlsbad — Minority Attack",
    theme: "Two pawns attacking three on the queenside",
    fen: "r2q1rk1/pp2bppp/2n1pn2/2ppP3/3P4/2PB1N2/PP3PPP/RNBQ1RK1 w - - 0 9",
    intro: {
      en: "Classic Carlsbad structure. White will push b4-b5 to create a weak c-pawn for Black.",
      hi: "Classic Carlsbad structure. White b4-b5 push karega taaki Black ka c-pawn weak ho jaye.",
    },
    steps: [
      { san: "b4", en: "b4, the first shot of the minority attack.", hi: "b4, minority attack ka pehla shot." },
      { san: "a6", en: "Black prevents b5 for a moment.", hi: "Black b5 ko ek pal rok deta hai." },
      { san: "a4", en: "White prepares b5 again.", hi: "White phir se b5 ki tayaari." },
      { san: "Bd6", en: "Black activates the bishop but the plan continues.", hi: "Black bishop activate karta hai, lekin plan chalta rehta hai." },
      { san: "b5", en: "b5. When pawns trade on b5 or c6, Black is left with a permanent weak c-pawn.", hi: "b5. Jab b5 ya c6 par pawns trade honge, Black ka c-pawn permanent weak ho jayega." },
    ],
  },
  {
    id: "kingside-pawn-storm",
    title: "King's Indian — Kingside Storm",
    theme: "f5-g5-g4 pawn avalanche",
    fen: "r1bq1rk1/pppn1pbp/3p1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQ1RK1 b - - 0 8",
    intro: {
      en: "King's Indian mainline. Black attacks the king with pawns while White plays on the queenside.",
      hi: "King's Indian mainline. Black pawns se king pe attack karta hai, White queenside khelta hai.",
    },
    steps: [
      { san: "Ne8", en: "Knight re-routes to prepare f5.", hi: "Knight re-route karta hai, f5 ki tayaari." },
      { san: "b4", en: "White gains queenside space.", hi: "White queenside par space leta hai." },
      { san: "f5", en: "The signature move. The storm begins.", hi: "Signature move. Toofan shuru." },
      { san: "c5", en: "White races on the other flank.", hi: "White doosri taraf race karta hai." },
      { san: "g5", en: "g5 next, then g4 — this pawn wave is Black's attack.", hi: "Phir g5, aur g4 — yeh pawn wave hi Black ka attack hai." },
    ],
  },
  {
    id: "hanging-pawns-break",
    title: "Hanging Pawns — the d5 Break",
    theme: "Dynamic central break",
    fen: "r1bq1rk1/1p3ppp/p1n1pn2/2pp4/3P4/P1N1PN2/1PQ1BPPP/R1B2RK1 w - - 0 10",
    intro: {
      en: "Hanging pawns on c5 and d5 for Black. White must decide: blockade or provoke a break.",
      hi: "Black ke c5-d5 par hanging pawns hain. White ko decide karna hai: blockade ya break provoke." ,
    },
    steps: [
      { san: "dxc5", en: "White exchanges to leave Black with an isolated d-pawn.", hi: "White exchange karta hai taaki Black ka d-pawn isolated ho." },
      { san: "Bxc5", en: "Black recaptures — active piece but weak pawn.", hi: "Black leta hai — active piece lekin weak pawn." },
      { san: "b4", en: "Kicks the bishop, gains space.", hi: "Bishop ko bhagata hai, space milta hai." },
      { san: "Be7", en: "Bishop retreats.", hi: "Bishop peeche jaata hai." },
      { san: "Nd4", en: "Knight blockades d5's stopper, targeting e6 and c6.", hi: "Knight blockade karta hai, e6 aur c6 ko target." },
    ],
  },
  {
    id: "fianchetto-diagonal",
    title: "Catalan — the Long Diagonal",
    theme: "Pressure down a1–h8",
    fen: "r1bq1rk1/pp1nppbp/2p2np1/3p4/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w - - 0 7",
    intro: {
      en: "Catalan bishop on g2 rakes the long diagonal. White's plan is Qc2 and Rd1, pressing Black's queenside.",
      hi: "Catalan bishop g2 par long diagonal rake karta hai. Plan hai Qc2 aur Rd1, Black ka queenside dabao.",
    },
    steps: [
      { san: "Qc2", en: "Queen joins the diagonal party.", hi: "Queen bhi diagonal ki party me shaamil." },
      { san: "b6", en: "Black plans Bb7 to challenge the diagonal.", hi: "Black Bb7 se diagonal challenge karega." },
      { san: "Rd1", en: "Rook eyes the d-file.", hi: "Rook d-file par nazar." },
      { san: "Bb7", en: "Bishops face off on the long diagonal.", hi: "Bishops long diagonal par aamne-saamne." },
      { san: "cxd5", en: "White cracks the center to open lines for the g2 bishop.", hi: "White center todta hai taaki g2 bishop ki lines khulen." },
    ],
  },
  {
    id: "french-space",
    title: "French Advance — Space Advantage",
    theme: "Cramping the enemy",
    fen: "r1bqkbnr/pp3ppp/2n1p3/2pp4/3PP3/2P2N2/PP3PPP/RNBQKB1R w KQkq - 0 6",
    intro: {
      en: "White has a big pawn wedge on e5-d4. The plan: pile up on d4, restrict Black, prepare a kingside attack.",
      hi: "White ka bada pawn wedge e5-d4 par. Plan: d4 ko strong karo, Black ko restrict karo, kingside attack ki tayaari.",
    },
    steps: [
      { san: "a3", en: "Preventing ...Bb4 pin and preparing b4.", hi: "...Bb4 pin rokta hai, b4 ki tayaari." },
      { san: "Qb6", en: "Black pressures d4.", hi: "Black d4 par pressure daalta hai." },
      { san: "Bd3", en: "Bishop develops aiming at h7.", hi: "Bishop develop hota hai, h7 pe aim." },
      { san: "cxd4", en: "Black releases tension.", hi: "Black tension release karta hai." },
      { san: "cxd4", en: "Now White has a mobile pawn chain and open c-file.", hi: "Ab White ke paas mobile pawn chain aur open c-file hai." },
    ],
  },
  {
    id: "sicilian-english-attack",
    title: "Sicilian — English Attack",
    theme: "Opposite-side castling race",
    fen: "r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQkq - 0 7",
    intro: {
      en: "English Attack setup. White will castle long and storm with g4-h4-h5. Whoever attacks faster wins.",
      hi: "English Attack setup. White long castle karega aur g4-h4-h5 storm chalayega. Jo pehle attack karega woh jeetega.",
    },
    steps: [
      { san: "O-O-O", en: "Long castling — commitment to the attack.", hi: "Long castling — attack pe pura commit." },
      { san: "Bd7", en: "Black develops toward queenside castling.", hi: "Black queenside castling ke liye develop." },
      { san: "g4", en: "The pawn storm begins.", hi: "Pawn storm shuru." },
      { san: "O-O", en: "Black castles short — race is on.", hi: "Black short castle — race lag gayi." },
      { san: "h4", en: "h4 next, then h5 to break open the king.", hi: "Ab h4, phir h5 se king kholna hai." },
    ],
  },
  {
    id: "petrosian-prophylaxis",
    title: "Petrosian's Prophylaxis",
    theme: "Stopping the plan before it starts",
    fen: "r1bq1rk1/pp2bppp/2np1n2/4p3/2P5/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
    intro: {
      en: "Black wants to play ...Nd4 and ...c6-d5. Petrosian would play a3 first — prophylaxis, stopping the plan a move early.",
      hi: "Black ...Nd4 aur ...c6-d5 khelna chahta hai. Petrosian pehle a3 khelega — prophylaxis, plan ko ek chaal pehle rokna.",
    },
    steps: [
      { san: "a3", en: "Quiet a3 — preventing ...Nb4 ideas and preparing b4.", hi: "Chup-chaap a3 — ...Nb4 ideas rok, b4 ki tayaari." },
      { san: "a5", en: "Black stops b4 in return.", hi: "Black bhi b4 rok deta hai." },
      { san: "Nd2", en: "Knight re-routes to c4 or e4.", hi: "Knight c4 ya e4 ke liye re-route." },
      { san: "Be6", en: "Black develops.", hi: "Black develop karta hai." },
      { san: "Nc4", en: "Knight lands on c4, pressuring e5 and d6.", hi: "Knight c4 par, e5 aur d6 par pressure." },
    ],
  },
  {
    id: "bishop-pair-open",
    title: "Two Bishops in the Open",
    theme: "Long-term positional edge",
    fen: "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 8",
    intro: {
      en: "White has the bishop pair. In open positions, two bishops dominate. Open the position and let them breathe.",
      hi: "White ke paas bishop pair hai. Open positions me do bishops chhaa jaate hain. Position kholo aur unhe saans lene do.",
    },
    steps: [
      { san: "e4", en: "e4 opens lines for both bishops.", hi: "e4 se dono bishops ki lines khulti hain." },
      { san: "dxe4", en: "Forced trade in the center.", hi: "Center me forced trade." },
      { san: "Nxe4", en: "Now bishops rake the board.", hi: "Ab bishops pura board rake karte hain." },
      { san: "Nxe4", en: "Black tries to trade pieces.", hi: "Black pieces trade karna chahta hai." },
      { san: "Bxe4", en: "Bishop pair intact, diagonals open, long-term winning edge.", hi: "Bishop pair intact, diagonals open, long-term winning edge." },
    ],
  },
  {
    id: "back-rank-buildup",
    title: "The Back-Rank Motif",
    theme: "Weak back rank exploitation",
    fen: "3r2k1/5ppp/p3p3/1p2P3/1P1q4/P1Q2N2/5PPP/3R2K1 w - - 0 1",
    intro: {
      en: "Black's back rank has only the king and one rook. White should force a queen trade or a rook penetration.",
      hi: "Black ka back rank sirf king aur ek rook ke saath hai. White ko queen trade force karni chahiye ya rook ghusana chahiye.",
    },
    steps: [
      { san: "Qxd4", en: "Queen trade — simplifies into a winning ending.", hi: "Queen trade — jeetne wala ending mil jata hai." },
      { san: "Rxd4", en: "Recapture forced.", hi: "Recapture forced." },
      { san: "Rxd4", en: "Now the rook is active and Black's back rank is still fragile.", hi: "Ab rook active hai aur Black ka back rank abhi bhi fragile." },
    ],
  },
];
