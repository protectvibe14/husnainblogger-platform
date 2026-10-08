/**
 * Hook Score Checker (tool-280) — pure logic, zero imports, zero network,
 * zero DOM. Deterministic: same hook text always yields the same score.
 *
 * Honesty: this is a RULE-BASED checklist score, not a virality prediction.
 * It applies a published, transparent rubric to the hook text — no AI, no
 * watch-time data, no platform analytics. The UI must label the result a
 * checklist score, never a predicted view count.
 *
 * === PUBLISHED RUBRIC (criteria + weights, max 75) ===
 *  1. Length (25 pts): spoken hooks run ~150 words/minute, so ~3 seconds =
 *     ~7-8 words (heuristic speech-rate assumption, documented).
 *     7-10 words -> 25 | 5-6 or 11-14 words -> 15 | 3-4 or 15-20 -> 8 |
 *     otherwise -> 3.
 *  2. Specificity (20 pts): contains a digit, "$" or "%" -> 20; else
 *     contains a UNIT_WORDS bank word -> 12; else 0.
 *     UNIT_WORDS bank (16 entries): days, minutes, hours, seconds, dollars,
 *     steps, ways, mistakes, tips, secrets, rules, questions, reasons,
 *     ideas, lessons, habits.
 *  3. Question opener (15 pts): starts with a QUESTION_STARTERS bank word or
 *     ends with "?" -> 15; else 0.
 *     QUESTION_STARTERS bank (17 entries): what, why, how, when, where, who,
 *     which, can, could, should, do, does, is, are, have, will, did.
 *  4. Curiosity gap (15 pts): contains a CURIOSITY_WORDS bank word -> 15;
 *     else 0. CURIOSITY_WORDS bank (16 entries): secret, secrets, nobody,
 *     never, truth, actually, mistake, mistakes, stop, hidden, weird,
 *     shocking, banned, lie, lied, wrong.
 *  5. Vague-opener penalty (-20): starts with a VAGUE_OPENERS phrase -> -20.
 *     VAGUE_OPENERS (8 entries, transparent): "hey guys", "welcome back",
 *     "so today", "in this video", "um,", "okay so", "hi everyone",
 *     "welcome to".
 *  6. ALL-CAPS penalty (-5): more than half the words fully uppercase (and
 *     more than 2 words total) -> -5.
 *
 * Bands: 60-75 strong · 40-59 good · 20-39 needs work · 0-19 weak.
 *
 * Non-English edge case: if fewer than 60% of letters are ASCII, the
 * pattern banks (specificity, question, curiosity, vague-opener) are
 * skipped with a note — only length and caps checks run (max 30).
 */

export interface HookBreakdownRow {
  criterion: string;
  points: number;
  note: string;
}

export interface HookScoreResult {
  score: number;
  band: string;
  breakdown: HookBreakdownRow[];
  improvements: string[];
}

const UNIT_WORDS: string[] = [
  "days", "minutes", "hours", "seconds", "dollars", "steps", "ways",
  "mistakes", "tips", "secrets", "rules", "questions", "reasons",
  "ideas", "lessons", "habits",
];

const QUESTION_STARTERS: string[] = [
  "what", "why", "how", "when", "where", "who", "which", "can", "could",
  "should", "do", "does", "is", "are", "have", "will", "did",
];

const CURIOSITY_WORDS: string[] = [
  "secret", "secrets", "nobody", "never", "truth", "actually",
  "mistake", "mistakes", "stop", "hidden", "weird", "shocking",
  "banned", "lie", "lied", "wrong",
];

const VAGUE_OPENERS: string[] = [
  "hey guys", "welcome back", "so today", "in this video", "um,",
  "okay so", "hi everyone", "welcome to",
];

function wordsOf(text: string): string[] {
  return text.split(/\s+/).filter((w) => w.length > 0);
}

function firstWordLower(text: string): string {
  const w = wordsOf(text)[0] ?? "";
  return w.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
}

function containsBankWord(text: string, bank: string[]): boolean {
  const lower = ` ${text.toLowerCase()} `;
  return bank.some((w) => lower.includes(w));
}

function isNonEnglish(text: string): boolean {
  // Any Unicode letter counts; fewer than 3 letters -> treat as English-like.
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length < 3) return false;
  const ascii = letters.filter((c) => /[A-Za-z]/.test(c)).length;
  return ascii / letters.length < 0.6;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawHook = values["hookText"];
  const hook = typeof rawHook === "string" ? rawHook.trim() : "";
  if (hook.length < 3) {
    return { ok: false, error: "Enter your hook text — at least 3 characters." };
  }
  if (hook.length > 280) {
    return { ok: false, error: "Hooks over 280 characters are too long to score — trim it down first." };
  }

  const rawNiche = values["niche"];
  const niche = typeof rawNiche === "string" && rawNiche.trim() ? rawNiche.trim() : "";

  const nonEnglish = isNonEnglish(hook);
  const words = wordsOf(hook);
  const wordCount = words.length;
  const lower = hook.toLowerCase();

  const breakdown: HookBreakdownRow[] = [];
  const improvements: string[] = [];
  let score = 0;

  // 1. Length (25)
  let lengthPts: number;
  let lengthNote: string;
  if (wordCount >= 7 && wordCount <= 10) {
    lengthPts = 25;
    lengthNote = `${wordCount} words — ideal for a ~3s spoken hook (25 max).`;
  } else if ((wordCount >= 5 && wordCount <= 6) || (wordCount >= 11 && wordCount <= 14)) {
    lengthPts = 15;
    lengthNote = `${wordCount} words — aim for 7-10 (about 3 seconds of speech) (25 max).`;
    improvements.push("Trim or expand to 7-10 words — roughly 3 seconds of speech.");
  } else if ((wordCount >= 3 && wordCount <= 4) || (wordCount >= 15 && wordCount <= 20)) {
    lengthPts = 8;
    lengthNote = `${wordCount} words — too short to promise value or too long to hold (25 max).`;
    improvements.push("Aim for 7-10 words — roughly 3 seconds of speech.");
  } else {
    lengthPts = 3;
    lengthNote = `${wordCount} words — far outside the spoken-hook range (25 max).`;
    improvements.push("Aim for 7-10 words — roughly 3 seconds of speech.");
  }
  score += lengthPts;
  breakdown.push({ criterion: "Length", points: lengthPts, note: lengthNote });

  if (!nonEnglish) {
    // 2. Specificity (20)
    let specPts = 0;
    let specNote: string;
    if (/\d/.test(hook) || hook.includes("$") || hook.includes("%")) {
      specPts = 20;
      specNote = "Contains a number, $ or % — concrete payoff (20 max).";
    } else if (containsBankWord(lower, UNIT_WORDS)) {
      specPts = 12;
      specNote = "Uses a concrete unit word (days, steps, tips...) but no hard number (20 max).";
      improvements.push("Add a hard number, timeframe, or dollar figure to make the payoff concrete.");
    } else {
      specNote = "No number or concrete unit — the payoff feels vague (20 max).";
      improvements.push("Add a number, timeframe, or dollar figure to make the payoff concrete.");
    }
    score += specPts;
    breakdown.push({ criterion: "Specificity", points: specPts, note: specNote });

    // 3. Question opener (15)
    const startsQuestion = QUESTION_STARTERS.includes(firstWordLower(hook));
    const endsQuestion = hook.trimEnd().endsWith("?");
    let qPts = 0;
    let qNote: string;
    if (startsQuestion || endsQuestion) {
      qPts = 15;
      qNote = "Opens with a question or ends with '?' — pulls the viewer in (15 max).";
    } else {
      qNote = "No question opener — a question creates an open loop (15 max).";
      improvements.push("Open with a question or end the hook with '?' to pull the viewer in.");
    }
    score += qPts;
    breakdown.push({ criterion: "Question opener", points: qPts, note: qNote });

    // 4. Curiosity gap (15)
    let cPts = 0;
    let cNote: string;
    if (containsBankWord(lower, CURIOSITY_WORDS)) {
      cPts = 15;
      cNote = "Contains a curiosity-gap word — creates an information gap (15 max).";
    } else {
      cNote = "No curiosity-gap word detected (15 max).";
      improvements.push("Add one honest curiosity-gap word (e.g. 'secret', 'mistake', 'nobody') — not clickbait.");
    }
    score += cPts;
    breakdown.push({ criterion: "Curiosity gap", points: cPts, note: cNote });

    // 5. Vague-opener penalty (-20)
    const vague = VAGUE_OPENERS.find((op) => lower.startsWith(op));
    if (vague) {
      score -= 20;
      breakdown.push({
        criterion: "Vague-opener penalty",
        points: -20,
        note: `Starts with "${vague}" — a filler opener viewers skip (penalty).`,
      });
      improvements.push("Drop the filler opener — start with the payoff, not the greeting.");
    }
  } else {
    improvements.push("Pattern checks skipped — non-English hook detected; score uses length and formatting only.");
  }

  // 6. ALL-CAPS penalty (-5)
  const upperWords = words.filter((w) => /[A-Z]/.test(w) && w === w.toUpperCase()).length;
  if (words.length > 2 && upperWords / words.length > 0.5) {
    score -= 5;
    breakdown.push({
      criterion: "ALL-CAPS penalty",
      points: -5,
      note: "Mostly uppercase — reads as shouting (penalty).",
    });
    improvements.push("Avoid ALL CAPS — it reads as shouting.");
  }

  score = Math.min(75, Math.max(0, score));

  const band = score >= 60 ? "strong" : score >= 40 ? "good" : score >= 20 ? "needs work" : "weak";

  if (improvements.length === 0) {
    improvements.push("This hook passes the checklist — now test it against real retention data.");
  } else if (niche) {
    improvements.push(`Tailor the payoff to your ${niche} audience — specific beats generic.`);
  }

  const result: HookScoreResult = { score, band, breakdown, improvements };
  return { ok: true, values: result as unknown as Record<string, unknown> };
}
