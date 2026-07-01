// Structured "Thinking Patterns" masterclass content
// Tailored by rating band, in English and Hindi.

export type Lang = "en" | "hi";
export type Phase = "opening" | "middlegame" | "endgame";
export type Band = "500" | "1000" | "1500" | "2000";

export interface Lesson {
  id: string;
  phase: Phase;
  band: Band;
  title: { en: string; hi: string };
  bullets: { en: string[]; hi: string[] };
  script: { en: string; hi: string }; // narration for TTS
}

export const BANDS: { id: Band; label: string; range: string }[] = [
  { id: "500", label: "Beginner", range: "0–800 Elo" },
  { id: "1000", label: "Novice", range: "800–1200 Elo" },
  { id: "1500", label: "Club", range: "1200–1700 Elo" },
  { id: "2000", label: "Advanced", range: "1700–2000 Elo" },
];

export const PHASES: { id: Phase; label: string }[] = [
  { id: "opening", label: "Opening" },
  { id: "middlegame", label: "Middlegame" },
  { id: "endgame", label: "Endgame" },
];

export const LESSONS: Lesson[] = [
  // OPENING
  {
    id: "op-500", phase: "opening", band: "500",
    title: { en: "How to think in the Opening (500 Elo)", hi: "शुरुआत में कैसे सोचें (500 Elo)" },
    bullets: {
      en: [
        "Control the center with a pawn (e4 or d4).",
        "Develop knights before bishops. Both knights out by move 4.",
        "Castle within the first 8 moves to protect your king.",
        "Do not move the same piece twice in the opening unless forced.",
        "After every opponent move, ask: 'What is he threatening?'",
      ],
      hi: [
        "एक pawn से center पर कब्ज़ा करो (e4 या d4).",
        "पहले knight निकालो, फिर bishop. Move 4 तक दोनों knight बाहर.",
        "पहले 8 चालों में castle करके king को safe करो.",
        "एक ही piece को बार-बार मत हिलाओ.",
        "हर opponent move के बाद पूछो: 'वो क्या धमकी दे रहा है?'",
      ],
    },
    script: {
      en: "In the opening, your only job is three things: center, develop, castle. Push a central pawn, get both knights out, get both bishops out, then castle. That's it. Do not chase pawns, do not move the queen early, do not move the same piece twice. After every move your opponent makes, pause and ask: what is threatened? If nothing is threatened, continue your plan.",
      hi: "शुरुआत में सिर्फ तीन काम करो: center, development, और castling. एक central pawn आगे बढ़ाओ, दोनों knight निकालो, दोनों bishop निकालो, फिर castle कर लो. बस. न queen जल्दी निकालो, न एक piece को बार-बार हिलाओ. हर opponent move के बाद रुको और पूछो — क्या धमकी है? अगर कोई नहीं, तो अपना plan जारी रखो.",
    },
  },
  {
    id: "op-1500", phase: "opening", band: "1500",
    title: { en: "How to think in the Opening (1500 Elo)", hi: "Opening में कैसे सोचें (1500 Elo)" },
    bullets: {
      en: [
        "Know 2 openings as White and 1 defense against e4 and d4 — 8–10 moves deep.",
        "Understand the pawn structure the opening produces, not just the moves.",
        "Identify the standard middlegame plan: minority attack, IQP play, kingside expansion.",
        "Recognize your worst piece and plan its improvement.",
        "Every move must serve one of: development, king safety, structure, or a concrete tactic.",
      ],
      hi: [
        "White से 2 openings, और e4/d4 के खिलाफ 1-1 defense — 8-10 चाल गहरा.",
        "Opening से बनने वाला pawn structure समझो, सिर्फ चाल नहीं.",
        "Middlegame का standard plan पहचानो: minority attack, IQP, kingside expansion.",
        "अपनी सबसे कमज़ोर piece पहचानो और उसे activate करने का plan बनाओ.",
        "हर चाल development, king safety, structure, या tactic — किसी एक के लिए हो.",
      ],
    },
    script: {
      en: "At the club level, opening theory matters less than opening understanding. Pick a small repertoire and stay with it for a year. For each line, learn the pawn structure it leads to, and the standard middlegame plan that comes out of that structure. If you play the Carlsbad structure, learn the minority attack. If you play an isolated queen pawn, learn to use the outpost on e5. Structure first, moves second.",
      hi: "Club level पर opening theory से ज़्यादा opening understanding matter करती है. एक छोटा repertoire चुनो और एक साल उसी पर टिको. हर line में सीखो कि कैसा pawn structure बनता है, और उस structure से कौन सा middlegame plan निकलता है. Carlsbad structure खेलते हो तो minority attack सीखो. IQP खेलते हो तो e5 outpost सीखो. पहले structure, बाद में moves.",
    },
  },
  // MIDDLEGAME
  {
    id: "mg-500", phase: "middlegame", band: "500",
    title: { en: "How to think in the Middlegame (500 Elo)", hi: "Middlegame में कैसे सोचें (500 Elo)" },
    bullets: {
      en: [
        "Before every move: Checks, Captures, Threats — for you and for opponent.",
        "Do not give up pieces for nothing. Count attackers and defenders on every square.",
        "Look for undefended pieces — yours and your opponent's.",
        "If you have no plan, improve your worst-placed piece.",
        "Trade when you are ahead in material; avoid trades when behind.",
      ],
      hi: [
        "हर चाल से पहले: Checks, Captures, Threats — अपनी और opponent की.",
        "Piece मुफ्त में मत दो. हर square पर attacker और defender गिनो.",
        "Undefended pieces ढूंढो — अपनी और opponent की.",
        "Plan न हो तो अपनी सबसे कमज़ोर piece को अच्छी square पर ले जाओ.",
        "Material में आगे हो तो trade करो, पीछे हो तो trade से बचो.",
      ],
    },
    script: {
      en: "In the middlegame, every single move follow the same three-step check. Step one: what are all the checks, captures, and threats my opponent has? Step two: what are all the checks, captures, and threats I have? Step three: is any piece — mine or his — hanging with no defender? Do this every move and your blunders will drop by half. When you have no attack, no threat, and no tactic, look at your worst piece and make it better.",
      hi: "Middlegame में हर एक चाल पर वही तीन-step check करो. पहला: opponent के सारे checks, captures, threats क्या हैं? दूसरा: मेरे सारे checks, captures, threats क्या हैं? तीसरा: कोई piece — मेरी या उसकी — बिना defender के तो नहीं? यह हर चाल करो और blunders आधे हो जाएंगे. जब attack नहीं, threat नहीं, tactic नहीं — तब अपनी सबसे कमज़ोर piece उठाओ और उसे better square पर रखो.",
    },
  },
  {
    id: "mg-1500", phase: "middlegame", band: "1500",
    title: { en: "How to think in the Middlegame (1500 Elo)", hi: "Middlegame में कैसे सोचें (1500 Elo)" },
    bullets: {
      en: [
        "Evaluate: material, king safety, pawn structure, piece activity, space.",
        "Find your imbalance — bishop pair, better structure, more space — and play toward it.",
        "Prophylaxis: ask 'what does he WANT to do?' and prevent it one move early.",
        "Weak squares are permanent; weak pawns can be defended. Occupy squares.",
        "Do not initiate an attack until your worst piece is in the game.",
      ],
      hi: [
        "Evaluate करो: material, king safety, pawn structure, piece activity, space.",
        "अपना imbalance पहचानो — bishop pair, better structure, ज़्यादा space — उसी के लिए खेलो.",
        "Prophylaxis: पूछो 'वो क्या करना चाहता है?' और एक चाल पहले रोक दो.",
        "Weak squares permanent होते हैं, weak pawns defend हो सकते हैं. Squares पर कब्ज़ा करो.",
        "जब तक तुम्हारी सबसे कमज़ोर piece game में नहीं, attack शुरू मत करो.",
      ],
    },
    script: {
      en: "Middlegame at this level is about imbalances and prophylaxis. Every position has an asymmetry — bishop pair, better structure, more space, safer king. Find yours and play to increase it. Before your move, ask what your opponent WANTS to do — his ideal plan — and stop it one move early. This is prophylaxis, and it is what separates 1500 from 1800. And never launch an attack while one of your pieces sits out of play. Bring everyone before you strike.",
      hi: "इस level पर middlegame imbalance और prophylaxis का game है. हर position में एक asymmetry होती है — bishop pair, better structure, ज़्यादा space, safer king. अपना imbalance पहचानो और उसे बढ़ाओ. चाल से पहले पूछो — opponent क्या करना चाहता है? — और एक चाल पहले रोक दो. यही prophylaxis है, यही 1500 और 1800 के बीच का फ़र्क है. और जब तक तुम्हारी हर piece game में नहीं, attack मत करो.",
    },
  },
  // ENDGAME
  {
    id: "eg-500", phase: "endgame", band: "500",
    title: { en: "How to think in the Endgame (500 Elo)", hi: "Endgame में कैसे सोचें (500 Elo)" },
    bullets: {
      en: [
        "King is a fighting piece — activate it immediately when queens come off.",
        "Passed pawns must be pushed. Stop opponent's passed pawns first.",
        "Rook belongs BEHIND passed pawns — yours or his.",
        "Learn Ladder mate, K+Q vs K, K+R vs K, K+P vs K opposition.",
        "Trade pieces (not pawns) when ahead in material.",
      ],
      hi: [
        "King fighting piece है — queens exchange होते ही उसे activate करो.",
        "Passed pawns push करो. Opponent के passed pawn पहले रोको.",
        "Rook हमेशा passed pawn के PEECHE — अपने भी और उसके भी.",
        "Ladder mate, K+Q vs K, K+R vs K, K+P vs K opposition सीखो.",
        "Material में आगे हो तो pieces trade करो, pawns नहीं.",
      ],
    },
    script: {
      en: "The moment queens come off, walk your king toward the center. This is the single biggest endgame mistake at your level — leaving the king on the back rank. Passed pawns must be pushed with support, and remember: rooks belong behind passed pawns, always. Learn just four endings cold: ladder mate with two rooks, king and queen versus king, king and rook versus king, and king and pawn versus king with opposition. These four will win you dozens of games.",
      hi: "जैसे ही queens off होती हैं, अपने king को center की तरफ लाओ. इस level की सबसे बड़ी endgame mistake यही है — king back rank पर छोड़ देना. Passed pawns support के साथ push करो, और याद रखो: rook हमेशा passed pawn के पीछे. सिर्फ चार endings रटो: दो rooks से ladder mate, K+Q vs K, K+R vs K, और K+P vs K opposition के साथ. यही चार दर्जनों games जिताएंगे.",
    },
  },
  {
    id: "eg-1500", phase: "endgame", band: "1500",
    title: { en: "How to think in the Endgame (1500 Elo)", hi: "Endgame में कैसे सोचें (1500 Elo)" },
    bullets: {
      en: [
        "Master Lucena and Philidor positions — rook endings are 60% of endgames.",
        "Learn opposition, distant opposition, triangulation, corresponding squares.",
        "Good bishop vs bad bishop — trade your bad, keep the good.",
        "Two weaknesses principle: create a second front to win.",
        "Do not hurry — improve the king one square at a time.",
      ],
      hi: [
        "Lucena और Philidor position master करो — rook endings 60% होते हैं.",
        "Opposition, distant opposition, triangulation, corresponding squares सीखो.",
        "Good bishop vs bad bishop — bad bishop trade करो, good रखो.",
        "Two weaknesses principle: जीतने के लिए दूसरा front बनाओ.",
        "जल्दी मत करो — king को एक square करके improve करो.",
      ],
    },
    script: {
      en: "At the club level, endgame technique wins rating points faster than any opening study. Rook endings are more than half of all endings, so Lucena and Philidor are non-negotiable. Beyond that, master the concept of two weaknesses — you cannot win a symmetrical endgame; you must create a second front and stretch the defender across the board. And the golden rule at every ending: do not hurry. Improve your king, improve your pieces, then convert.",
      hi: "Club level पर endgame technique से rating सबसे तेज़ी से बढ़ती है. Rook endings आधे से ज़्यादा होते हैं, इसलिए Lucena और Philidor optional नहीं. उसके बाद two weaknesses का concept — symmetrical ending कभी नहीं जीतता; दूसरा front बनाओ और defender को खींचो. हर ending का golden rule: जल्दी मत करो. पहले king improve, फिर pieces, फिर conversion.",
    },
  },
];

export function lessonsFor(band: Band): Lesson[] {
  // fallback to nearest band if exact missing
  const has = LESSONS.filter(l => l.band === band);
  if (has.length) return has;
  return LESSONS.filter(l => l.band === "500");
}
