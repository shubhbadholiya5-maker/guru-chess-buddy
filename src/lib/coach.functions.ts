import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

function languageInstruction(lang: string): string {
  if (lang === "hi") return "Reply primarily in conversational Hindi (Devanagari), but you may sprinkle common English chess terms (fork, pin, tempo).";
  if (lang === "en") return "Reply in clear, friendly English.";
  // default & "hinglish"
  return "Reply in a natural Hinglish mix — Hindi + English chess terms, Latin script. Simple language, warm and conversational, like a coach sitting beside the student.";
}

function systemPrompt(rating: number, lang: string): string {
  return `You are Guru — a 2700+ Grandmaster chess coach with deep positional and tactical mastery (Carlsen / Kasparov / Polgar level intuition). The student is rated ~${rating} and aiming for 2000+.

PERSONA — GRANDMASTER COACH (warm + empathetic):
- Speak like a top GM sitting beside the student: confident, sharp, AND deeply caring. Encourage on every reply.
- The student is here to grow. Be patient, never condescending. Acknowledge effort before correction ("Good thinking on the pin idea — par ek aur tactic hai jo aur strong hai…").
- Show real chess depth: name concrete squares, files, diagonals, pawn breaks, weak color complexes, key tempi.
- Reference patterns (Greek gift, Lasker sacrifice, minority attack, Carlsbad structure, Lucena, Vancura) when they fit — explain in one line.
- Calculate concretely: candidate moves → forcing replies → 2–4 ply visualization → evaluation.

GREETINGS — DYNAMIC, NEVER ROBOTIC:
- NEVER use "Namaste", "Hello!", "Hi there!", "Greetings", or any canned opener.
- Open each reply by getting straight into the chess: "Interesting position —", "Okay, let's calculate —", "Sharp moment here —", "Look at the f7 square —", "This is critical —", "Ready? —", "Lock in —".
- Vary openers every turn. Sound like a real coach, not a chatbot.

SOCRATIC METHOD (default behavior):
- ASK before you tell. Make the student think first.
- At a new position pick 2–3: "What candidate moves do you see?" / "Opponent ki immediate threat kya hai?" / "Checks, captures, threats list karo." / "Aapka 2–3 move plan kya hai?"
- ONLY after the student answers (or explicitly asks for the answer) do you evaluate and reveal.
- If the student blunders: point out the danger CONCRETELY (which piece, which square, which tactic), explain WHY it loses, give the better idea, end with a takeaway rule.
- If the student plays well: praise the specific idea and reinforce the principle.

TEACHING DEPTH (progressive):
- Opening: principles + name + plan.
- Middlegame: pawn breaks, piece activity, weak squares, color complexes, prophylaxis.
- Endgame: opposition, key squares, Lucena/Philidor, K+P technique, fortresses, zugzwang.
- Tactics: forks, pins, skewers, discovered/double attacks, deflection, decoy, overloading, intermezzo, mating nets.

FORMAT:
- SHORT: 3–6 short paragraphs. **Bold** key squares/moves/terms.
- Algebraic notation (Nf3, exd5, Bxh7+, Rxe6).
- Almost always END with ONE question pushing deeper.

NEVER:
- Discourage the student.
- Say "just trust me" — always justify.
- Dump long engine lines without explaining the idea.
- Use stock greetings like "Namaste" or "Hello".
- Spoon-feed the answer on the first turn unless the student insists.

${languageInstruction(lang)}`;
}

async function callAI(messages: Array<{ role: string; content: string }>): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages }),
  });
  if (res.status === 429) throw new Error("Rate limit — try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted on this workspace.");
  if (!res.ok) {
    const t = await res.text();
    console.error("AI error:", res.status, t);
    throw new Error("AI request failed");
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export const coachChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { message: string; history: Array<{ role: "user" | "assistant"; content: string }>; fen?: string; lang?: string }) =>
    z
      .object({
        message: z.string().min(1).max(4000),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) })).max(40),
        fen: z.string().max(120).optional(),
        lang: z.string().max(20).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("rating, language").eq("id", userId).maybeSingle();
    const rating = profile?.rating ?? 800;
    const lang = data.lang ?? profile?.language ?? "en";
    const sys = systemPrompt(rating, lang);
    const userMsg = data.fen ? `Current position (FEN): ${data.fen}\n\n${data.message}` : data.message;
    const messages = [
      { role: "system", content: sys },
      ...data.history.slice(-20),
      { role: "user", content: userMsg },
    ];
    const reply = await callAI(messages);
    // persist
    await supabase.from("coach_messages").insert([
      { user_id: userId, role: "user", content: data.message },
      { user_id: userId, role: "assistant", content: reply },
    ]);
    return { reply };
  });

export const analyzePgn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { pgn: string; lang?: string }) =>
    z.object({ pgn: z.string().min(10).max(20000), lang: z.string().max(20).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("rating, language").eq("id", userId).maybeSingle();
    const rating = profile?.rating ?? 800;
    const lang = data.lang ?? profile?.language ?? "en";
    const sys = systemPrompt(rating, lang) + `\n\nYou are now reviewing the student's full game. Provide:
1. **Opening** — name and one-line assessment.
2. **Critical moments** — 2–4 specific moves (with move numbers) where the game turned, explained as a coach.
3. **Tactical mistakes / blunders** — what was missed.
4. **Strategic themes** to study next.
5. **One concrete training drill** for the student.

Keep it under 350 words, use markdown headings.`;

    const reply = await callAI([
      { role: "system", content: sys },
      { role: "user", content: `Here is my game in PGN:\n\n${data.pgn}` },
    ]);

    // Heuristic counts
    const blunders = (reply.match(/blunder/gi) ?? []).length;
    const mistakes = (reply.match(/mistake/gi) ?? []).length;

    await supabase.from("game_analyses").insert({
      user_id: userId,
      pgn: data.pgn,
      summary: reply,
      blunders,
      mistakes,
    });

    return { summary: reply, blunders, mistakes };
  });

export const explainOpeningMove = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    openingName: string;
    side: "white" | "black";
    moveNumber: number;
    moveSan: string;
    movedBy: "w" | "b";
    movesSoFar: string;
    fenAfter: string;
    isLast: boolean;
    lang?: string;
  }) =>
    z.object({
      openingName: z.string().min(1).max(100),
      side: z.enum(["white", "black"]),
      moveNumber: z.number().int().min(1).max(40),
      moveSan: z.string().min(1).max(10),
      movedBy: z.enum(["w", "b"]),
      movesSoFar: z.string().max(500),
      fenAfter: z.string().max(120),
      isLast: z.boolean(),
      lang: z.string().max(20).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("rating, language").eq("id", userId).maybeSingle();
    const rating = profile?.rating ?? 800;
    const lang = data.lang ?? profile?.language ?? "hinglish";

    const sys = systemPrompt(rating, lang) + `\n\nYou are now in OPENING TRAINER mode. The student is learning the **${data.openingName}** as ${data.side}. They just played the next book move.

For each move respond in this exact short structure (max 90 words):
1. **Move ka naam/idea** — ek line mein iska purpose (center, develop, king safety, pin, tempo, etc.).
2. **Kyun?** — 1-2 short sentences explaining the principle.
3. ${data.isLast ? "**Ab plan kya hai?** — agle 2-3 moves ka idea (kahan castle, kaunsa break, weak square)." : "**Next question** — ek thinking question pucho jisse student agle move ka idea khud soch sake."}

Use **bold** for moves and key squares. Algebraic notation. Keep it warm and conversational.`;

    const userMsg = `Opening: ${data.openingName} (${data.side})
Moves so far: ${data.movesSoFar}
Last move played (${data.movedBy === "w" ? "White" : "Black"}, move ${data.moveNumber}): **${data.moveSan}**
Position FEN: ${data.fenAfter}
${data.isLast ? "This is the final book move I'll cover — wrap up with the middlegame plan." : "Explain this move, then ask me to think about the next move."}`;

    const reply = await callAI([
      { role: "system", content: sys },
      { role: "user", content: userMsg },
    ]);

    return { reply };
  });

export const explainTrap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    trapName: string;
    opening: string;
    userSide: "white" | "black";
    movesSoFar: string;
    lastMoveSan: string;
    movedBy: "w" | "b";
    fenAfter: string;
    phase: "midway" | "complete";
    idea: string;
    lesson: string;
    lang?: string;
  }) =>
    z.object({
      trapName: z.string().min(1).max(100),
      opening: z.string().min(1).max(100),
      userSide: z.enum(["white", "black"]),
      movesSoFar: z.string().max(500),
      lastMoveSan: z.string().min(1).max(10),
      movedBy: z.enum(["w", "b"]),
      fenAfter: z.string().max(120),
      phase: z.enum(["midway", "complete"]),
      idea: z.string().max(300),
      lesson: z.string().max(500),
      lang: z.string().max(20).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("rating, language").eq("id", userId).maybeSingle();
    const rating = profile?.rating ?? 800;
    const lang = data.lang ?? profile?.language ?? "hinglish";

    const sys = systemPrompt(rating, lang) + `\n\nYou are now in TRAPS ACADEMY mode. The student is learning the **${data.trapName}** trap from the **${data.opening}**, playing as ${data.userSide} (the trapper).

Trap idea: ${data.idea}
Defensive lesson: ${data.lesson}

${data.phase === "complete"
      ? `The trap has been EXECUTED. Give a 3-part wrap-up (max 110 words):
1. **Trap sprung!** — congratulate + name the tactical motif (e.g. discovered attack, smothered mate, pin, queen trap).
2. **Why it worked** — the opponent's specific mistake and the geometry that punished it.
3. **How to avoid as the other side** — the defensive lesson, phrased as a rule.`
      : `Just played: **${data.lastMoveSan}** by ${data.movedBy === "w" ? "White" : "Black"}.
Briefly (max 70 words):
1. **Iss move ka role** in the trap setup (bait, lure, sacrifice, key tempo).
2. **Next thinking question** — what should the user/opponent be planning, and what trap-specific square/idea to watch.
Do NOT spoil the final blow.`}

Use **bold** for moves and squares. Algebraic notation. Warm coaching tone.`;

    const userMsg = `Trap: ${data.trapName} (user plays ${data.userSide})
Moves so far: ${data.movesSoFar}
Last move: ${data.lastMoveSan} by ${data.movedBy === "w" ? "White" : "Black"}
FEN: ${data.fenAfter}
Phase: ${data.phase}`;

    const reply = await callAI([
      { role: "system", content: sys },
      { role: "user", content: userMsg },
    ]);

    return { reply };
  });

export const explainMiddlegame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    lessonTitle: string;
    theme: string;
    level: string;
    side: "white" | "black";
    fen: string;
    context: string;
    keyIdeas: string[];
    studentThought: string;
    lang?: string;
  }) =>
    z.object({
      lessonTitle: z.string().min(1).max(120),
      theme: z.string().min(1).max(40),
      level: z.string().min(1).max(20),
      side: z.enum(["white", "black"]),
      fen: z.string().max(120),
      context: z.string().max(400),
      keyIdeas: z.array(z.string().max(300)).max(10),
      studentThought: z.string().max(2000),
      lang: z.string().max(20).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("rating, language").eq("id", userId).maybeSingle();
    const rating = profile?.rating ?? 800;
    const lang = data.lang ?? profile?.language ?? "hinglish";

    const sys = systemPrompt(rating, lang) + `\n\nYou are now in MIDDLEGAME ACADEMY mode. Lesson: **${data.lessonTitle}** (${data.level} / ${data.theme}). Studying from ${data.side}'s perspective.

Position context: ${data.context}
Key teaching ideas to weave in (do NOT just list them — teach them):
${data.keyIdeas.map((k, i) => `${i + 1}. ${k}`).join("\n")}

Coaching protocol (max 140 words total):
1. **Evaluate** the student's thinking briefly — what they saw correctly, what they missed.
2. **Teach** the core concept tied to this lesson's theme using the position concretely (name squares, files, diagonals, breaks).
3. **Plan** — give a clear 2-3 move plan or principle the student should remember here.
4. End with ONE follow-up question that pushes deeper thinking (next move, what if opponent responds X, etc.).

Use **bold** for squares/moves. Algebraic notation. Warm Grandmaster-coach tone.`;

    const userMsg = `Lesson: ${data.lessonTitle}
FEN: ${data.fen}
My thinking: ${data.studentThought}`;

    const reply = await callAI([
      { role: "system", content: sys },
      { role: "user", content: userMsg },
    ]);

    return { reply };
  });

export const explainEndgame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    title: string;
    theme: string;
    level: string;
    side: "white" | "black";
    fen: string;
    context: string;
    keyIdeas: string[];
    studentThought: string;
    lang?: string;
  }) =>
    z.object({
      title: z.string().min(1).max(120),
      theme: z.string().min(1).max(40),
      level: z.string().min(1).max(20),
      side: z.enum(["white", "black"]),
      fen: z.string().max(120),
      context: z.string().max(400),
      keyIdeas: z.array(z.string().max(300)).max(10),
      studentThought: z.string().max(2000),
      lang: z.string().max(20).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("rating, language").eq("id", userId).maybeSingle();
    const rating = profile?.rating ?? 800;
    const lang = data.lang ?? profile?.language ?? "hinglish";

    const sys = systemPrompt(rating, lang) + `\n\nYou are now in ENDGAME ACADEMY mode. Position: **${data.title}** (${data.level} / ${data.theme}). Studying from ${data.side}'s perspective.

Position context: ${data.context}
Key technical ideas to weave in (teach, don't list):
${data.keyIdeas.map((k, i) => `${i + 1}. ${k}`).join("\n")}

Coaching protocol (max 140 words total):
1. **Evaluate** the student's thinking — what's correct, what's missing.
2. **Teach** the core endgame TECHNIQUE concretely — name key squares, opposition, zugzwang, tempo counts.
3. **Plan** — give a precise 2-3 move sequence or principle to remember.
4. End with ONE follow-up question (next move, what if opponent plays X, etc.).

Use **bold** for squares/moves. Algebraic notation. Warm coach tone — endgames need patience, communicate that.`;

    const userMsg = `Endgame: ${data.title}
FEN: ${data.fen}
My thinking: ${data.studentThought}`;

    const reply = await callAI([
      { role: "system", content: sys },
      { role: "user", content: userMsg },
    ]);

    return { reply };
  });

