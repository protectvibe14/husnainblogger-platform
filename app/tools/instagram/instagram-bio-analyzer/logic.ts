/**
 * Instagram Bio Analyzer — pure logic.
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports. Unicode-safe via Intl.Segmenter.
 * - SCORING RUBRIC (transparent heuristic — Instagram publishes no bio
 *   weighting, so this score measures observable best practices, NOT a
 *   prediction of follows or reach. Always label output "heuristic"):
 *
 *   Factor                          Max  How earned
 *   ──────────────────────────────  ───  ─────────────────────────────
 *   1. Length discipline             20   ≤150 chars (Instagram's bio
 *                                         limit): 20. Over 150: 0 —
 *                                         the bio will be cut off.
 *   2. Call to action                20   Contains a CTA pattern (dm, link
 *                                         in bio, click, follow, shop,
 *                                         book, …): 20. Otherwise 0.
 *   3. Emoji usage                   15   1–5 emojis: 15. None: 5.
 *                                         Over 5 (cluttered): 5.
 *   4. Line breaks                   15   3+ lines (2+ breaks): 15.
 *                                         2 lines: 8. Single line: 0.
 *   5. Keyword clarity               20   Niche keyword (if given) present:
 *                                         20; missing: 0. No keyword given:
 *                                         10 neutral + guidance.
 *   6. Link signal                   10   Mentions a link/website/👇/link in
 *                                         bio: 10. Otherwise 0.
 *
 *   Total: 100. Grades: Excellent ≥80, Good ≥60, Needs work ≥40, Weak <40.
 * - Matching is case-insensitive substring matching. Emoji detection uses
 *   Unicode Extended_Pictographic. English CTA list — documented limitation.
 */

/** Instagram bio hard limit. */
export const BIO_LIMIT = 150;

/** CTA patterns (lowercased, matched as substrings). */
export const CTA_PATTERNS: readonly string[] = [
  "dm ", "dm me", "link in bio", "click", "follow", "shop", "book now",
  "sign up", "join", "download", "get started", "learn more", "contact",
  "email", "whatsapp", "tap the link", "link below",
];

/** Link/website mention patterns. */
const LINK_PATTERNS: readonly string[] = [
  "link in bio", "link below", "👇", "tap the link", "website", ".com",
  "linktr.ee", "beacons", "stan.store",
];

export type BioGrade = "Excellent" | "Good" | "Needs work" | "Weak";

const EMOJI_RE = /\p{Extended_Pictographic}/u;

function countEmojis(text: string): number {
  const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
  let n = 0;
  for (const s of seg.segment(text)) {
    if (EMOJI_RE.test(s.segment)) n++;
  }
  return n;
}

function gradeFor(score: number): BioGrade {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs work";
  return "Weak";
}

export interface BioFactor {
  name: string;
  points: number;
  max: number;
  detail: string;
}

export interface BioAnalysis {
  score: number;
  grade: BioGrade;
  heuristic: true;
  charCount: number;
  lineCount: number;
  emojiCount: number;
  factors: BioFactor[];
  tips: string[];
}

/**
 * Analyze an Instagram bio against the rubric in this file's header JSDoc.
 * @throws {TypeError} on non-string inputs. @throws {Error} on empty bio.
 */
export function analyzeBio(bio: string, keyword: string): BioAnalysis {
  if (typeof bio !== "string" || typeof keyword !== "string") {
    throw new TypeError("analyzeBio expects two strings");
  }
  const cleanBio = bio.trim();
  if (cleanBio === "") throw new Error("analyzeBio requires a non-empty bio");
  const cleanKeyword = keyword.trim().toLowerCase();

  const lower = cleanBio.toLowerCase();
  const factors: BioFactor[] = [];
  const tips: string[] = [];
  let score = 0;

  // 1. Length discipline (20)
  const len = [...cleanBio].length;
  const p1 = len <= BIO_LIMIT ? 20 : 0;
  score += p1;
  factors.push({
    name: "Length discipline",
    points: p1,
    max: 20,
    detail: `${len}/${BIO_LIMIT} characters. ${len > BIO_LIMIT ? "OVER the limit — Instagram will cut it off." : "Within the limit."}`,
  });
  if (len > BIO_LIMIT) tips.push(`Your bio is ${len - BIO_LIMIT} characters over Instagram's 150 limit — trim it or the end will be cut off.`);

  // 2. Call to action (20)
  const hasCta = CTA_PATTERNS.some((p) => lower.includes(p));
  const p2 = hasCta ? 20 : 0;
  score += p2;
  factors.push({
    name: "Call to action",
    points: p2,
    max: 20,
    detail: hasCta ? "A clear call to action is present." : "No call to action detected.",
  });
  if (!hasCta) tips.push("Add a call to action — 'DM me', 'link in bio', 'shop below' tells visitors what to do next.");

  // 3. Emoji usage (15)
  const emojis = countEmojis(cleanBio);
  const p3 = emojis >= 1 && emojis <= 5 ? 15 : 5;
  score += p3;
  factors.push({
    name: "Emoji usage",
    points: p3,
    max: 15,
    detail: `${emojis} emoji(s). 1–5 adds scannable structure.`,
  });
  if (emojis === 0) tips.push("Add 1–3 emojis as visual bullets — they make each line scannable at a glance.");
  if (emojis > 5) tips.push(`You use ${emojis} emojis — trim to 5 or fewer so the bio doesn't look cluttered.`);

  // 4. Line breaks (15)
  const lines = cleanBio.split("\n").filter((l) => l.trim().length > 0).length;
  const p4 = lines >= 3 ? 15 : lines === 2 ? 8 : 0;
  score += p4;
  factors.push({
    name: "Line breaks",
    points: p4,
    max: 15,
    detail: `${lines} line(s). One idea per line reads best on mobile.`,
  });
  if (lines < 3) tips.push("Break the bio into 3+ short lines — one idea per line (who you help / proof / CTA).");

  // 5. Keyword clarity (20)
  let p5 = 0;
  let kwDetail: string;
  if (cleanKeyword) {
    if (lower.includes(cleanKeyword)) {
      p5 = 20;
      kwDetail = "Your niche keyword is in the bio — visitors instantly know your topic.";
    } else {
      kwDetail = "Your niche keyword is missing from the bio.";
      tips.push(`Add your niche keyword ("${keyword.trim()}") so visitors and search know what you're about.`);
    }
  } else {
    p5 = 10;
    kwDetail = "No keyword given — 10 neutral points. Add your niche keyword above for a real check.";
    tips.push("Enter your niche keyword above — bios with a clear topic keyword convert better.");
  }
  score += p5;
  factors.push({ name: "Keyword clarity", points: p5, max: 20, detail: kwDetail });

  // 6. Link signal (10)
  const hasLink = LINK_PATTERNS.some((p) => lower.includes(p));
  const p6 = hasLink ? 10 : 0;
  score += p6;
  factors.push({
    name: "Link signal",
    points: p6,
    max: 10,
    detail: hasLink ? "Points visitors to your link." : "No link mention detected.",
  });
  if (!hasLink) tips.push("Mention your link ('link in bio 👇') so the CTA has somewhere to send people.");

  return {
    score,
    grade: gradeFor(score),
    heuristic: true,
    charCount: len,
    lineCount: lines,
    emojiCount: emojis,
    factors,
    tips: tips.length > 0 ? tips : ["Strong bio — keep testing the first line, it's what people read first."],
  };
}

/**
 * Contract adapter for the AnalyzerTemplate runtime.
 * Output keys: score | grade | factorBreakdown | tips | bioStats | heuristicNote.
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const bio = values["bio"];
  const keyword = values["keyword"];

  if (typeof bio !== "string" || bio.trim() === "") {
    return { ok: false, error: "Paste your Instagram bio." };
  }
  if (keyword !== undefined && typeof keyword !== "string") {
    return { ok: false, error: "Keyword must be text." };
  }

  let result: BioAnalysis;
  try {
    result = analyzeBio(bio, typeof keyword === "string" ? keyword : "");
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not analyze this bio." };
  }

  return {
    ok: true,
    values: {
      score: result.score,
      grade: result.grade,
      factorBreakdown: result.factors.map((f) => `${f.name}: ${f.points}/${f.max} — ${f.detail}`),
      tips: result.tips,
      bioStats: `${result.charCount}/${BIO_LIMIT} characters, ${result.lineCount} lines, ${result.emojiCount} emojis`,
      heuristicNote:
        "Heuristic only — Instagram publishes no bio weighting, so this scores observable best practices (length, CTA, structure, keyword clarity), not follower growth.",
    },
  };
}
