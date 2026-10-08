/**
 * Email Subject Line Analyzer — pure logic (Lane C, rule-based).
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports. Pure string analysis.
 * - SCORING RUBRIC (transparent heuristic — no tool can predict open rates
 *   without your list's historical data, so this scores observable best
 *   practices from email-marketing guide consensus, NOT predicted opens):
 *
 *   Factor                          Max  How earned
 *   ──────────────────────────────  ───  ─────────────────────────────
 *   1. Length                        25   30–50 chars: 25 (widely cited
 *                                         sweet spot — fully visible on
 *                                         desktop and most mobile clients).
 *                                         20–29 or 51–65: 15. Otherwise: 5.
 *                                         Empty: 0 (runTool rejects empty).
 *   2. Spam triggers                 25   Start at 25. Each trigger −8,
 *                                         floor 0. Triggers: known spam
 *                                         words/phrases (free!, $$$, 100%
 *                                         free, act now, buy now, click
 *                                         here, congratulations, winner,
 *                                         cash bonus, double your, no cost,
 *                                         guarantee), ALL-CAPS subject
 *                                         (≥70% caps), 3+ exclamation
 *                                         marks, 2+ dollar signs.
 *                                         The word list is a curated
 *                                         heuristic from public spam-filter
 *                                         guides — NOT any provider's real
 *                                         filter rules (unpublished).
 *   3. Personalization               15   Contains a merge token like
 *                                         {{first_name}}, [Name], %NAME%,
 *                                         {name}: 15. Otherwise 0.
 *   4. Curiosity vs clarity          20   Question mark or curiosity gap
 *                                         words (how, why, secret, finally,
 *                                         revealed, truth about): 10.
 *                                         Clear benefit/topic words
 *                                         (guide, checklist, template,
 *                                         report, results, save): 10.
 *                                         Both present: 20.
 *   5. Readability                   15   4–10 words: 15. 1–3 or 11–14: 8.
 *                                         15+ words: 3. No 4+ word
 *                                         ALL-CAPS run and no emoji spam
 *                                         (≤2 emoji): included in the 15.
 *
 *   Total: 100. Grades: Excellent ≥85, Good ≥70, Needs work ≥50, Poor <50.
 * - Verdicts per factor: "pass" | "warn" | "fail".
 */

/** Spam-trigger phrases from public spam-filter guides (heuristic — not any provider's real rules). */
export const SPAM_PHRASES: ReadonlyArray<string> = [
  "free!",
  "$$$",
  "100% free",
  "act now",
  "buy now",
  "click here",
  "congratulations",
  "you've won",
  "you have won",
  "winner",
  "cash bonus",
  "double your",
  "no cost",
  "no fees",
  "guarantee",
  "guaranteed",
  "risk-free",
  "limited time",
  "urgent",
  "once in a lifetime",
  "amazing deal",
  "incredible deal",
  "prize",
  "lottery",
];

/** Curiosity-gap words (heuristic list). */
export const CURIOSITY_WORDS: ReadonlyArray<string> = [
  "how", "why", "secret", "secrets", "finally", "revealed",
  "truth", "mistake", "mistakes", "shocking", "surprising", "never",
];

/** Clarity/benefit words (heuristic list). */
export const CLARITY_WORDS: ReadonlyArray<string> = [
  "guide", "checklist", "template", "report", "results",
  "save", "free", "new", "update", "tips",
];

/** Merge-token patterns: {{name}}, [Name], %NAME%, {first_name}, etc. */
const TOKEN_PATTERNS: ReadonlyArray<RegExp> = [
  /\{\{\s*[a-z_][a-z0-9_]*\s*\}\}/i,
  /\[\s*[A-Za-z][A-Za-z ]{0,20}\s*\]/,
  /%[A-Z_]+%/,
  /\{\s*[a-z_][a-z0-9_]*\s*\}/i,
];

export type SubjectVerdict = "pass" | "warn" | "fail";
export type SubjectGrade = "Excellent" | "Good" | "Needs work" | "Poor";

export interface SubjectFactor {
  name: string;
  verdict: SubjectVerdict;
  points: number;
  max: number;
  detail: string;
}

export interface SubjectAnalysis {
  /** 0–100 heuristic score. */
  score: number;
  grade: SubjectGrade;
  /** True when the tool makes no claim beyond the documented rubric. */
  heuristic: true;
  charCount: number;
  wordCount: number;
  spamTriggers: string[];
  hasPersonalization: boolean;
  factors: SubjectFactor[];
}

function gradeFor(score: number): SubjectGrade {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs work";
  return "Poor";
}

function wordList(text: string): string[] {
  return text.toLowerCase().split(/[\s—–-]+/).filter((w) => w.length > 0);
}

function countEmoji(text: string): number {
  const m = text.match(/\p{Extended_Pictographic}/gu);
  return m ? m.length : 0;
}

/**
 * Analyze a subject line using the rubric in this file's header JSDoc.
 * @throws {TypeError} on non-string input. @throws {Error} on empty subject.
 */
export function analyzeSubject(subject: string): SubjectAnalysis {
  if (typeof subject !== "string") throw new TypeError("analyzeSubject expects a string");
  const s = subject.trim();
  if (s === "") throw new Error("analyzeSubject requires a non-empty subject line");

  const factors: SubjectFactor[] = [];
  let score = 0;
  const chars = s.length;
  const words = wordList(s);
  const lower = s.toLowerCase();

  // 1. Length (25)
  let p1: number, v1: SubjectVerdict, d1: string;
  if (chars >= 30 && chars <= 50) {
    p1 = 25; v1 = "pass"; d1 = `${chars} chars — inside the 30–50 sweet spot.`;
  } else if ((chars >= 20 && chars < 30) || (chars > 50 && chars <= 65)) {
    p1 = 15; v1 = "warn"; d1 = `${chars} chars — slightly outside 30–50; may truncate on mobile.`;
  } else {
    p1 = 5; v1 = "fail"; d1 = `${chars} chars — well outside 30–50; likely truncated or too short to inform.`;
  }
  score += p1;
  factors.push({ name: "Length", verdict: v1, points: p1, max: 25, detail: d1 });

  // 2. Spam triggers (25)
  const triggers: string[] = [];
  for (const phrase of SPAM_PHRASES) {
    if (lower.includes(phrase)) triggers.push(`"${phrase}"`);
  }
  const letters = s.replace(/[^A-Za-z]/g, "");
  const caps = s.replace(/[^A-Z]/g, "");
  if (letters.length > 0 && caps.length / letters.length >= 0.7) triggers.push("ALL CAPS");
  const bangs = (s.match(/!/g) ?? []).length;
  if (bangs >= 3) triggers.push(`${bangs} exclamation marks`);
  const dollars = (s.match(/\$/g) ?? []).length;
  if (dollars >= 2) triggers.push(`${dollars} dollar signs`);
  const p2 = Math.max(0, 25 - triggers.length * 8);
  score += p2;
  factors.push({
    name: "Spam triggers",
    verdict: triggers.length === 0 ? "pass" : triggers.length <= 1 ? "warn" : "fail",
    points: p2,
    max: 25,
    detail: triggers.length === 0
      ? "No common spam triggers detected."
      : `Triggers: ${triggers.join(", ")} — these patterns are associated with spam filters and low trust.`,
  });

  // 3. Personalization (15)
  const hasPersonalization = TOKEN_PATTERNS.some((re) => re.test(s));
  const p3 = hasPersonalization ? 15 : 0;
  score += p3;
  factors.push({
    name: "Personalization",
    verdict: hasPersonalization ? "pass" : "warn",
    points: p3,
    max: 15,
    detail: hasPersonalization
      ? "Contains a personalization token (e.g. {{first_name}})."
      : "No personalization token found — adding one (e.g. {{first_name}}) typically lifts opens.",
  });

  // 4. Curiosity vs clarity (20)
  const hasCuriosity = CURIOSITY_WORDS.some((w) => lower.split(/\W+/).includes(w)) || s.includes("?");
  const hasClarity = CLARITY_WORDS.some((w) => lower.split(/\W+/).includes(w));
  const p4 = (hasCuriosity ? 10 : 0) + (hasClarity ? 10 : 0);
  score += p4;
  factors.push({
    name: "Curiosity vs clarity",
    verdict: p4 === 20 ? "pass" : p4 === 10 ? "warn" : "fail",
    points: p4,
    max: 20,
    detail: `Curiosity signals: ${hasCuriosity ? "yes" : "no"} · Clarity/benefit signals: ${hasClarity ? "yes" : "no"}. Best subjects combine both.`,
  });

  // 5. Readability (15)
  const wc = words.length;
  let p5: number, v5: SubjectVerdict;
  if (wc >= 4 && wc <= 10) { p5 = 15; v5 = "pass"; }
  else if ((wc >= 1 && wc <= 3) || (wc >= 11 && wc <= 14)) { p5 = 8; v5 = "warn"; }
  else { p5 = 3; v5 = "fail"; }
  const emojiCount = countEmoji(s);
  const emojiNote = emojiCount > 2 ? ` ${emojiCount} emoji — more than 2 can look spammy.` : "";
  // emoji spam downgrades one step
  if (emojiCount > 2 && v5 === "pass") { v5 = "warn"; p5 = 10; }
  score += p5;
  factors.push({
    name: "Readability",
    verdict: v5,
    points: p5,
    max: 15,
    detail: `${wc} words${emojiNote}`.trim() + (wc >= 4 && wc <= 10 && emojiCount <= 2 ? " — easy to scan." : ""),
  });

  return {
    score,
    grade: gradeFor(score),
    heuristic: true,
    charCount: chars,
    wordCount: wc,
    spamTriggers: triggers,
    hasPersonalization,
    factors,
  };
}

/**
 * Contract adapter for the tool template.
 * Output keys: score | grade | factorResults | counts | heuristicNote.
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const subject = values["subject"];

  if (typeof subject !== "string" || subject.trim() === "") {
    return { ok: false, error: "Enter your email subject line." };
  }

  let result: SubjectAnalysis;
  try {
    result = analyzeSubject(subject);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not analyze this subject line." };
  }

  return {
    ok: true,
    values: {
      score: result.score,
      grade: result.grade,
      factorResults: result.factors.map(
        (f) => `${f.verdict.toUpperCase()} — ${f.name} (${f.points}/${f.max}): ${f.detail}`,
      ),
      counts: `${result.charCount} characters, ${result.wordCount} words` +
        (result.spamTriggers.length > 0 ? ` · spam triggers: ${result.spamTriggers.join(", ")}` : " · no spam triggers"),
      heuristicNote:
        "Heuristic only — no tool can predict open rates without your list's historical data. This scores observable best practices (length, spam patterns, personalization, curiosity/clarity, readability). Spam phrases are from public filter guides, not any provider's real rules.",
    },
  };
}
