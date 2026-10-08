/**
 * Hashtag Strength Checker — pure logic (Lane C, rule-based).
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports. Unicode-safe hashtag extraction.
 * - SCORING RUBRIC (transparent heuristic — Instagram publishes no hashtag
 *   ranking formula, so this score measures observable best practices, NOT
 *   a prediction of reach or engagement. Always label output "heuristic"):
 *
 *   Factor                          Max  How earned
 *   ──────────────────────────────  ───  ─────────────────────────────
 *   1. Tag count                     25   5–15 tags: 25 (Instagram allows up
 *                                         to 30; creator best-practice
 *                                         guides cluster around 5–15).
 *                                         3–4 or 16–20: 15. 1–2 or 21–30:
 *                                         8. 0 or >30: 0.
 *   2. Tag length                    15   Share of tags with 3–24 characters
 *                                         (after the #). 15 * (good/total).
 *   3. Banned-risk patterns          25   Engagement-pod / bait tags
 *                                         (#likeforlike, #followforfollow,
 *                                         #like4like, #follow4follow, #l4l,
 *                                         #f4f, #instafollow, #followme …):
 *                                         0 risky tags: 25. Each risky tag
 *                                         −8, floor 0. These patterns are
 *                                         widely reported as restricted/
 *                                         low-quality; the list is a curated
 *                                         heuristic, not Instagram's real
 *                                         (unpublished) list.
 *   4. Broad/niche mix               20   Length-based heuristic: tags with
 *                                         ≤6 chars after # count as "broad"
 *                                         (short tags are usually the most
 *                                         competitive), 7–15 as "niche",
 *                                         16+ as "long-tail". ≥2 broad AND
 *                                         ≥2 niche/long-tail: 20. Only one
 *                                         side represented: 10. Single tag
 *                                         or no mix possible: 5.
 *   5. No duplicates                 15   No duplicates (case-insensitive):
 *                                         15. Each duplicate −5, floor 0.
 *
 *   Total: 100. Grades: Strong ≥80, Good ≥60, Needs work ≥40, Weak <40.
 * - Per-tag verdicts: "strong" (good length, not risky, not duplicate),
 *   "risky" (matches a banned-risk pattern), "weak" (too short/long or
 *   duplicate), "ok" (usable but unremarkable).
 */

/** Engagement-bait / pod patterns widely reported as restricted or low-quality. Curated heuristic list — not Instagram's real unpublished list. */
export const RISKY_PATTERNS: ReadonlyArray<{ pattern: RegExp; label: string }> = [
  { pattern: /^likeforlike(s)?$/i, label: "engagement pod bait" },
  { pattern: /^followforfollow(s)?$/i, label: "engagement pod bait" },
  { pattern: /^like4like$/i, label: "engagement pod bait" },
  { pattern: /^follow4follow$/i, label: "engagement pod bait" },
  { pattern: /^l4l$/i, label: "engagement pod bait" },
  { pattern: /^f4f$/i, label: "engagement pod bait" },
  { pattern: /^followme$/i, label: "follow-bait" },
  { pattern: /^followback$/i, label: "follow-bait" },
  { pattern: /^instafollow$/i, label: "follow-bait" },
  { pattern: /^likesforlikes$/i, label: "engagement pod bait" },
  { pattern: /^spamforspam$/i, label: "engagement pod bait" },
  { pattern: /^sfs$/i, label: "engagement pod bait" },
];

export const IDEAL_MIN_COUNT = 5;
export const IDEAL_MAX_COUNT = 15;
export const IG_MAX_TAGS = 30;

export type HashtagVerdict = "strong" | "ok" | "weak" | "risky";
export type StrengthGrade = "Strong" | "Good" | "Needs work" | "Weak";

export interface HashtagFactor {
  name: string;
  points: number;
  max: number;
  detail: string;
}

export interface HashtagVerdictEntry {
  tag: string;
  verdict: HashtagVerdict;
  reason: string;
}

export interface HashtagScore {
  /** 0–100 heuristic score. */
  score: number;
  grade: StrengthGrade;
  /** True when the tool makes no claim beyond the documented rubric. */
  heuristic: true;
  tagCount: number;
  broadCount: number;
  nicheCount: number;
  longTailCount: number;
  riskyTags: string[];
  duplicates: string[];
  factors: HashtagFactor[];
  perTag: HashtagVerdictEntry[];
}

/** Extract hashtags: `#` followed by letters (any script), numbers, underscores. */
export function parseHashtags(raw: string): string[] {
  if (typeof raw !== "string") throw new TypeError("parseHashtags expects a string");
  const out: string[] = [];
  const re = /#([\p{L}\p{N}_]+)/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    out.push(m[1]);
  }
  return out;
}

function gradeFor(score: number): StrengthGrade {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs work";
  return "Weak";
}

function isRisky(tag: string): string | null {
  for (const r of RISKY_PATTERNS) {
    if (r.pattern.test(tag)) return r.label;
  }
  return null;
}

/**
 * Score a hashtag set using the rubric in this file's header JSDoc.
 * @throws {TypeError} on non-string input. @throws {Error} when no hashtags found.
 */
export function scoreHashtags(raw: string): HashtagScore {
  if (typeof raw !== "string") throw new TypeError("scoreHashtags expects a string");
  const tags = parseHashtags(raw);
  if (tags.length === 0) throw new Error("scoreHashtags: no hashtags found — add tags like #travel #sunset");

  const factors: HashtagFactor[] = [];
  let score = 0;
  const n = tags.length;

  // 1. Tag count (25)
  let p1: number;
  let d1: string;
  if (n >= IDEAL_MIN_COUNT && n <= IDEAL_MAX_COUNT) {
    p1 = 25; d1 = `${n} tags — inside the 5–15 sweet spot.`;
  } else if ((n >= 3 && n <= 4) || (n >= 16 && n <= 20)) {
    p1 = 15; d1 = `${n} tags — slightly outside the 5–15 sweet spot.`;
  } else if ((n >= 1 && n <= 2) || (n >= 21 && n <= IG_MAX_TAGS)) {
    p1 = 8; d1 = `${n} tags — too few for discovery, or so many they dilute focus.`;
  } else {
    p1 = 0; d1 = `${n} tags — over Instagram's 30-tag limit; extras are ignored by the platform.`;
  }
  score += p1;
  factors.push({ name: "Tag count", points: p1, max: 25, detail: d1 });

  // 2. Tag length (15)
  const goodLen = tags.filter((t) => t.length >= 3 && t.length <= 24).length;
  const p2 = Math.round((15 * goodLen) / n);
  score += p2;
  factors.push({
    name: "Tag length",
    points: p2,
    max: 15,
    detail: `${goodLen}/${n} tags are 3–24 characters (readable, searchable length).`,
  });

  // 3. Banned-risk patterns (25)
  const riskyTags = tags.filter((t) => isRisky(t) !== null);
  const p3 = Math.max(0, 25 - riskyTags.length * 8);
  score += p3;
  factors.push({
    name: "Banned-risk patterns",
    points: p3,
    max: 25,
    detail: riskyTags.length === 0
      ? "No engagement-bait patterns detected."
      : `${riskyTags.length} risky tag(s): ${riskyTags.map((t) => "#" + t).join(", ")} — widely reported as restricted/low-quality.`,
  });

  // Length-based broad/niche split
  const broad = tags.filter((t) => t.length <= 6).length;
  const niche = tags.filter((t) => t.length >= 7 && t.length <= 15).length;
  const longTail = tags.filter((t) => t.length >= 16).length;

  // 4. Broad/niche mix (20)
  let p4: number;
  let d4: string;
  const hasBroad = broad >= 2;
  const hasSpecific = niche + longTail >= 2;
  if (hasBroad && hasSpecific) {
    p4 = 20; d4 = `Good mix: ${broad} broad + ${niche + longTail} niche/long-tail tags.`;
  } else if (hasBroad || hasSpecific) {
    p4 = 10; d4 = `One-sided: ${broad} broad, ${niche + longTail} niche/long-tail. Mix both for discovery + targeting.`;
  } else {
    p4 = 5; d4 = "Too few tags to judge the broad/niche mix.";
  }
  score += p4;
  factors.push({ name: "Broad/niche mix", points: p4, max: 20, detail: d4 });

  // 5. No duplicates (15)
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const t of tags.map((x) => x.toLowerCase())) {
    if (seen.has(t)) dups.add(t);
    seen.add(t);
  }
  const p5 = Math.max(0, 15 - dups.size * 5);
  score += p5;
  factors.push({
    name: "No duplicates",
    points: p5,
    max: 15,
    detail: dups.size === 0 ? "No duplicate tags." : `Duplicates: ${[...dups].map((t) => "#" + t).join(", ")}.`,
  });

  // Per-tag verdicts
  const dupSet = dups;
  const perTag: HashtagVerdictEntry[] = tags.map((tag) => {
    const risk = isRisky(tag);
    if (risk) return { tag: "#" + tag, verdict: "risky", reason: `Matches a ${risk} pattern.` };
    if (dupSet.has(tag.toLowerCase())) return { tag: "#" + tag, verdict: "weak", reason: "Duplicate tag." };
    if (tag.length < 3) return { tag: "#" + tag, verdict: "weak", reason: "Too short — likely over-competitive or a typo." };
    if (tag.length > 24) return { tag: "#" + tag, verdict: "weak", reason: "Very long — few people search this exact phrase." };
    if (tag.length >= 7) return { tag: "#" + tag, verdict: "strong", reason: "Good length — specific enough to target." };
    return { tag: "#" + tag, verdict: "ok", reason: "Short/broad tag — fine for reach, pair with niche tags." };
  });

  return {
    score,
    grade: gradeFor(score),
    heuristic: true,
    tagCount: n,
    broadCount: broad,
    nicheCount: niche,
    longTailCount: longTail,
    riskyTags: riskyTags.map((t) => "#" + t),
    duplicates: [...dups].map((t) => "#" + t),
    factors,
    perTag,
  };
}

/**
 * Contract adapter for the tool template.
 * Output keys: score | grade | perTagVerdicts | mixSummary | heuristicNote.
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const hashtags = values["hashtags"];

  if (typeof hashtags !== "string" || parseHashtags(hashtags).length === 0) {
    return { ok: false, error: "Add at least 1 hashtag (e.g. #travel #sunset #wanderlust)." };
  }

  let result: HashtagScore;
  try {
    result = scoreHashtags(hashtags);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not score these hashtags." };
  }

  return {
    ok: true,
    values: {
      score: result.score,
      grade: result.grade,
      perTagVerdicts: result.perTag.map(
        (e) => `${e.verdict.toUpperCase()} — ${e.tag} (${e.reason})`,
      ),
      mixSummary: `${result.tagCount} tags: ${result.broadCount} broad, ${result.nicheCount} niche, ${result.longTailCount} long-tail` +
        (result.riskyTags.length > 0 ? `, ${result.riskyTags.length} risky (${result.riskyTags.join(", ")})` : ", no risky patterns"),
      heuristicNote:
        "Heuristic only — Instagram publishes no hashtag ranking formula. This scores observable best practices (count, length, risk patterns, broad/niche mix, duplicates), not reach or engagement.",
    },
  };
}
