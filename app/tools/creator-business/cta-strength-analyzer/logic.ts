/**
 * CTA Strength Analyzer — pure logic (Lane C, rule-based).
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports. Pure string analysis.
 * - SCORING RUBRIC (transparent heuristic — CTA effectiveness depends on
 *   audience, placement, and offer, which no text-only tool can see; this
 *   scores observable copy best practices from marketing guide consensus,
 *   NOT predicted conversion):
 *
 *   Factor                          Max  How earned
 *   ──────────────────────────────  ───  ─────────────────────────────
 *   1. Action verb                   25   Starts with (or contains) a strong
 *                                         action verb: get, start, download,
 *                                         try, join, buy, shop, subscribe,
 *                                         claim, discover, unlock, book,
 *                                         schedule, grab, launch, build,
 *                                         create, learn, watch, read, sign.
 *                                         Present: 25. Otherwise 0.
 *   2. Clarity (word count)          20   ≤8 words: 20 (scannable at a
 *                                         glance). 9–12: 12. 13+: 5.
 *   3. Urgency / scarcity            15   Contains urgency words (now,
 *                                         today, limited, hurry, ends,
 *                                         last chance, before, instant):
 *                                         15. Otherwise 0. (Urgency is a
 *                                         heuristic signal — false urgency
 *                                         hurts trust; the output says so.)
 *   4. Benefit mention               20   Contains a benefit word (free,
 *                                         save, discount, bonus, exclusive,
 *                                         premium, pro, instant, easy,
 *                                         guaranteed, new): 20. Otherwise 0.
 *   5. Weak-CTA penalty              20   Start at 20. −10 for each weak
 *                                         pattern, floor 0. Weak patterns:
 *                                         "click here", "submit", "learn
 *                                         more" (as the whole CTA),
 *                                         "read more", ending with "...",
 *                                         no verb at all.
 *
 *   Total: 100. Grades: Excellent ≥85, Good ≥70, Needs work ≥50, Poor <50.
 */

/** Strong action verbs (heuristic list — English). */
export const ACTION_VERBS: ReadonlyArray<string> = [
  "get", "start", "download", "try", "join", "buy", "shop",
  "subscribe", "claim", "discover", "unlock", "book", "schedule",
  "grab", "launch", "build", "create", "learn", "watch", "read",
  "sign", "register", "enroll", "upgrade", "compare",
];

/** Urgency/scarcity words (heuristic list). */
export const URGENCY_WORDS: ReadonlyArray<string> = [
  "now", "today", "limited", "hurry", "ends", "ending",
  "last chance", "before", "instant", "instantly", "don't miss",
];

/** Benefit words (heuristic list). */
export const BENEFIT_WORDS: ReadonlyArray<string> = [
  "free", "save", "discount", "bonus", "exclusive", "premium",
  "pro", "easy", "guaranteed", "new", "fast",
];

/** Weak CTA patterns: [regex, label]. */
export const WEAK_PATTERNS: ReadonlyArray<{ pattern: RegExp; label: string }> = [
  { pattern: /click here/i, label: '"click here" — says nothing about the outcome' },
  { pattern: /^submit$/i, label: '"submit" — the weakest form CTA' },
  { pattern: /^learn more$/i, label: '"learn more" alone — vague, no benefit' },
  { pattern: /^read more$/i, label: '"read more" alone — vague, no benefit' },
  { pattern: /\.\.\.\s*$/, label: "trailing ellipsis — looks unfinished" },
];

export type CtaGrade = "Excellent" | "Good" | "Needs work" | "Poor";

export interface CtaFactor {
  name: string;
  points: number;
  max: number;
  detail: string;
}

export interface CtaAnalysis {
  /** 0–100 heuristic score. */
  score: number;
  grade: CtaGrade;
  /** True when the tool makes no claim beyond the documented rubric. */
  heuristic: true;
  wordCount: number;
  actionVerb: string | null;
  urgencyWords: string[];
  benefitWords: string[];
  weakPatterns: string[];
  factors: CtaFactor[];
}

function gradeFor(score: number): CtaGrade {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs work";
  return "Poor";
}

function wordsOf(text: string): string[] {
  return text.toLowerCase().split(/[\s—–-]+/).filter((w) => w.length > 0);
}

/**
 * Analyze CTA copy using the rubric in this file's header JSDoc.
 * @throws {TypeError} on non-string input. @throws {Error} on empty CTA.
 */
export function analyzeCta(cta: string): CtaAnalysis {
  if (typeof cta !== "string") throw new TypeError("analyzeCta expects a string");
  const s = cta.trim();
  if (s === "") throw new Error("analyzeCta requires a non-empty CTA");

  const factors: CtaFactor[] = [];
  let score = 0;
  const words = wordsOf(s);
  const lower = s.toLowerCase();

  // 1. Action verb (25)
  const foundVerb = ACTION_VERBS.find((v) => words.includes(v)) ?? null;
  const p1 = foundVerb ? 25 : 0;
  score += p1;
  factors.push({
    name: "Action verb",
    points: p1,
    max: 25,
    detail: foundVerb
      ? `Starts with/contains the action verb "${foundVerb}" — tells the reader exactly what happens.`
      : "No strong action verb found — the reader can't tell what clicking does.",
  });

  // 2. Clarity / word count (20)
  const wc = words.length;
  let p2: number, d2: string;
  if (wc <= 8) { p2 = 20; d2 = `${wc} words — scannable at a glance.`; }
  else if (wc <= 12) { p2 = 12; d2 = `${wc} words — slightly long; trim to 8 or fewer.`; }
  else { p2 = 5; d2 = `${wc} words — too long for a CTA; split the explanation from the button.`; }
  score += p2;
  factors.push({ name: "Clarity", points: p2, max: 20, detail: d2 });

  // 3. Urgency (15)
  const urgencyWords = URGENCY_WORDS.filter((w) => lower.includes(w));
  const p3 = urgencyWords.length > 0 ? 15 : 0;
  score += p3;
  factors.push({
    name: "Urgency",
    points: p3,
    max: 15,
    detail: urgencyWords.length > 0
      ? `Urgency signals: ${urgencyWords.join(", ")} — use honestly; false urgency hurts trust.`
      : "No urgency signals — consider 'now' or 'today' if the offer is genuinely time-bound.",
  });

  // 4. Benefit (20)
  const benefitWords = BENEFIT_WORDS.filter((w) => words.includes(w));
  const p4 = benefitWords.length > 0 ? 20 : 0;
  score += p4;
  factors.push({
    name: "Benefit mention",
    points: p4,
    max: 20,
    detail: benefitWords.length > 0
      ? `Benefit signals: ${benefitWords.join(", ")} — the reader sees what's in it for them.`
      : "No benefit word found — add what the reader gets (free, save, bonus…).",
  });

  // 5. Weak-CTA penalty (20)
  const weakPatterns = WEAK_PATTERNS.filter((w) => w.pattern.test(s)).map((w) => w.label);
  // "no verb at all" check
  const hasAnyVerb = ACTION_VERBS.some((v) => words.includes(v));
  if (!hasAnyVerb && weakPatterns.length === 0) {
    weakPatterns.push("no action verb at all");
  }
  const p5 = Math.max(0, 20 - weakPatterns.length * 10);
  score += p5;
  factors.push({
    name: "No weak patterns",
    points: p5,
    max: 20,
    detail: weakPatterns.length === 0
      ? "No weak CTA patterns detected."
      : `Weak patterns: ${weakPatterns.join("; ")}.`,
  });

  return {
    score,
    grade: gradeFor(score),
    heuristic: true,
    wordCount: wc,
    actionVerb: foundVerb,
    urgencyWords,
    benefitWords,
    weakPatterns,
    factors,
  };
}

/**
 * Contract adapter for the tool template.
 * Output keys: score | grade | factorResults | summary | heuristicNote.
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const cta = values["cta"];

  if (typeof cta !== "string" || cta.trim() === "") {
    return { ok: false, error: "Enter your CTA text (e.g. the button label)." };
  }

  let result: CtaAnalysis;
  try {
    result = analyzeCta(cta);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not analyze this CTA." };
  }

  return {
    ok: true,
    values: {
      score: result.score,
      grade: result.grade,
      factorResults: result.factors.map(
        (f) => `${f.points === f.max ? "PASS" : f.points >= f.max / 2 ? "WARN" : "FAIL"} — ${f.name} (${f.points}/${f.max}): ${f.detail}`,
      ),
      summary: `${result.wordCount} words` +
        (result.actionVerb ? ` · verb: "${result.actionVerb}"` : " · no action verb") +
        (result.weakPatterns.length > 0 ? ` · weak: ${result.weakPatterns.length} pattern(s)` : " · no weak patterns"),
      heuristicNote:
        "Heuristic only — CTA effectiveness depends on audience, placement, and offer, which no text-only tool can see. This scores observable copy best practices (action verb, clarity, urgency, benefit, weak patterns).",
    },
  };
}
