/**
 * TikTok Hook Analyzer — pure logic.
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports. Unicode-safe via Intl.Segmenter.
 * - SCORING RUBRIC (transparent heuristic — TikTok publishes no hook
 *   weighting, so this score measures observable best practices, NOT a
 *   prediction of views or retention. Always label output "heuristic"):
 *
 *   Factor                          Max  How earned
 *   ──────────────────────────────  ───  ─────────────────────────────
 *   1. Hook length                   25   ≤12 words (fits the first 3
 *                                         seconds): 25. 13–18: 15.
 *                                         Over 18: 5.
 *   2. Question hook                 15   Ends with "?" or opens with
 *                                         who/what/why/how/when/which:
 *                                         15. Otherwise 0.
 *   3. Contradiction /               15   Contains a pattern-interrupt word
 *      pattern-interrupt                  (but, stop, don't, never,
 *                                         nobody, actually, truth): 15.
 *   4. Curiosity gap                 15   Curiosity phrase (secret, you
 *                                         won't believe, what happens,
 *                                         nobody talks about): 15.
 *   5. No weak opener                20   Does NOT start with a weak opener
 *                                         ("hey guys", "hi guys", "so
 *                                         basically", "um", "welcome
 *                                         back"): 20. Starts with one: 0.
 *   6. Specificity                   10   Contains a digit or a concrete
 *                                         claim word (exact, exact steps,
 *                                         $): 10. Otherwise 0.
 *
 *   Total: 100. Grades: Excellent ≥80, Good ≥60, Needs work ≥40, Weak <40.
 * - A hook can earn multiple pattern factors at once. Matching is
 *   case-insensitive. English word lists — documented limitation.
 */

/** Weak openers that waste the first second (lowercased prefixes). */
export const WEAK_OPENERS: readonly string[] = [
  "hey guys", "hi guys", "hey everyone", "hi everyone", "so basically",
  "um ", "uh ", "so...", "welcome back", "hey there",
];

/** Pattern-interrupt / contradiction words. */
export const INTERRUPT_WORDS: readonly string[] = [
  "but ", "stop", "don't", "never", "nobody", "actually", "truth",
  "however", "wrong", "lie", "myth",
];

/** Curiosity-gap phrases. */
export const CURIOSITY_PHRASES: readonly string[] = [
  "secret", "you won't believe", "what happens", "nobody talks about",
  "nobody tells", "here's why", "the reason", "what if",
];

/** Question openers. */
const QUESTION_OPENERS = ["who", "what", "why", "how", "when", "which", "where", "is ", "are ", "do ", "does ", "can "];

export type HookGrade = "Excellent" | "Good" | "Needs work" | "Weak";

function wordList(text: string): string[] {
  const seg = new Intl.Segmenter("en", { granularity: "word" });
  return [...seg.segment(text.toLowerCase())]
    .filter((s) => s.isWordLike)
    .map((s) => s.segment)
    .filter((w) => /[\p{L}\p{N}]/u.test(w));
}

function gradeFor(score: number): HookGrade {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs work";
  return "Weak";
}

export interface HookFactor {
  name: string;
  points: number;
  max: number;
  detail: string;
}

export interface HookAnalysis {
  score: number;
  grade: HookGrade;
  heuristic: true;
  wordCount: number;
  patternsFound: string[];
  factors: HookFactor[];
  tips: string[];
}

/**
 * Analyze a TikTok hook against the rubric in this file's header JSDoc.
 * @throws {TypeError} on non-string input. @throws {Error} on empty hook.
 */
export function analyzeHook(hook: string): HookAnalysis {
  if (typeof hook !== "string") throw new TypeError("analyzeHook expects a string");
  const clean = hook.trim().replace(/\s+/g, " ");
  if (clean === "") throw new Error("analyzeHook requires a non-empty hook");

  const lower = clean.toLowerCase();
  const words = wordList(clean);
  const factors: HookFactor[] = [];
  const tips: string[] = [];
  const patterns: string[] = [];
  let score = 0;

  // 1. Hook length (25)
  const n = words.length;
  const p1 = n <= 12 ? 25 : n <= 18 ? 15 : 5;
  score += p1;
  factors.push({
    name: "Hook length",
    points: p1,
    max: 25,
    detail: `${n} words. The hook must land in the first ~3 seconds — 12 words or fewer is ideal.`,
  });
  if (n > 12) tips.push(`Trim to 12 words or fewer (${n} now) — long hooks lose viewers before the payoff.`);

  // 2. Question hook (15)
  const isQuestion = clean.endsWith("?") || QUESTION_OPENERS.some((q) => lower.startsWith(q));
  const p2 = isQuestion ? 15 : 0;
  score += p2;
  if (isQuestion) patterns.push("question");
  factors.push({
    name: "Question hook",
    points: p2,
    max: 15,
    detail: isQuestion ? "Opens with a question — questions demand an answer, so people keep watching." : "No question detected.",
  });

  // 3. Contradiction / pattern-interrupt (15)
  const hasInterrupt = INTERRUPT_WORDS.some((w) => lower.includes(w));
  const p3 = hasInterrupt ? 15 : 0;
  score += p3;
  if (hasInterrupt) patterns.push("pattern-interrupt");
  factors.push({
    name: "Pattern interrupt",
    points: p3,
    max: 15,
    detail: hasInterrupt ? "Challenges an assumption — pattern interrupts stop the scroll." : "No contradiction word detected.",
  });

  // 4. Curiosity gap (15)
  const hasCuriosity = CURIOSITY_PHRASES.some((p) => lower.includes(p));
  const p4 = hasCuriosity ? 15 : 0;
  score += p4;
  if (hasCuriosity) patterns.push("curiosity-gap");
  factors.push({
    name: "Curiosity gap",
    points: p4,
    max: 15,
    detail: hasCuriosity ? "Opens a curiosity gap — viewers stay to close it." : "No curiosity phrase detected.",
  });
  if (!isQuestion && !hasInterrupt && !hasCuriosity) {
    tips.push("Add one hook pattern: a question, a contradiction ('stop doing X'), or a curiosity gap ('the secret to…').");
  }

  // 5. No weak opener (20)
  const weak = WEAK_OPENERS.find((w) => lower.startsWith(w));
  const p5 = weak ? 0 : 20;
  score += p5;
  factors.push({
    name: "No weak opener",
    points: p5,
    max: 20,
    detail: weak ? `Starts with "${weak}" — a filler opener that wastes the first second.` : "Opens straight into the content — no filler.",
  });
  if (weak) tips.push(`Cut "${weak}" — start mid-action with the most interesting claim instead.`);

  // 6. Specificity (10)
  const hasDigit = /\d/.test(clean);
  const hasMoney = /[$€£]/.test(clean);
  const p6 = hasDigit || hasMoney ? 10 : 0;
  score += p6;
  factors.push({
    name: "Specificity",
    points: p6,
    max: 10,
    detail: hasDigit || hasMoney ? "Concrete numbers make the promise believable." : "No numbers — vague hooks underperform specific ones.",
  });
  if (!hasDigit && !hasMoney) tips.push("Add a number ('3 mistakes', 'in 7 days') — specific beats vague.");

  return {
    score,
    grade: gradeFor(score),
    heuristic: true,
    wordCount: n,
    patternsFound: patterns,
    factors,
    tips: tips.length > 0 ? tips : ["Strong hook — film 2–3 variants and keep the one with the best 3-second retention."],
  };
}

/**
 * Contract adapter for the AnalyzerTemplate runtime.
 * Output keys: score | grade | patternsFound | factorBreakdown | tips | heuristicNote.
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const hook = values["hook"];

  if (typeof hook !== "string" || hook.trim() === "") {
    return { ok: false, error: "Enter your opening hook (the first line viewers hear)." };
  }

  let result: HookAnalysis;
  try {
    result = analyzeHook(hook);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not analyze this hook." };
  }

  return {
    ok: true,
    values: {
      score: result.score,
      grade: result.grade,
      patternsFound:
        result.patternsFound.length > 0
          ? result.patternsFound.join(", ")
          : "None — no question, contradiction, or curiosity pattern detected.",
      factorBreakdown: result.factors.map((f) => `${f.name}: ${f.points}/${f.max} — ${f.detail}`),
      tips: result.tips,
      heuristicNote:
        "Heuristic only — TikTok publishes no hook weighting, so this scores observable best practices (brevity, hook patterns, no filler openers), not views or retention.",
    },
  };
}
