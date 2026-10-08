/**
 * Tag Relevance Scorer — pure logic.
 *
 * ASSUMPTIONS:
 * - No DOM, no network, no imports. Unicode-safe via Intl.Segmenter.
 * - SCORING RUBRIC (transparent heuristic — YouTube publishes no tag
 *   weighting, so this score measures observable best practices, NOT a
 *   prediction of ranking or CTR. Always label output "heuristic"):
 *
 *   Factor                          Max  How earned
 *   ──────────────────────────────  ───  ─────────────────────────────
 *   1. Keyword coverage              40   Share of the title's content
 *                                         keywords (stopwords removed) that
 *                                         appear as a substring in at least
 *                                         one tag. 40 * (covered / total).
 *   2. Exact-title tag               15   Full title (lowercased, trimmed)
 *                                         present as a tag: 15. Otherwise 0.
 *   3. Multi-word specificity        15   ≥2 tags of 2–4 words: 15.
 *                                         Exactly 1 such tag: 8.
 *   4. Long-tail presence            10   ≥1 tag of ≥4 words: 10.
 *   5. Budget discipline             10   Total tag-field chars ≤ 400: 10;
 *                                         401–500: 5. (Hard limit 500 —
 *                                         platform-rules/youtube.json
 *                                         tags.totalLimit.)
 *   6. No waste                      10   No duplicate tags (normalized
 *                                         lowercase trim): 5. No empty or
 *                                         single-character tags: 5.
 *
 *   Total: 100. Grades: Strong ≥80, Good ≥60, Needs work ≥40, Weak <40.
 * - Per-tag verdicts: "strong" (matches a title keyword or is the exact
 *   title), "ok" (relevant-looking: multi-word, non-duplicate), "weak"
 *   (single generic word not in the title), "wasted" (duplicate/empty).
 * - Matching is case-insensitive substring matching after lowercasing and
 *   trimming. No stemming, no semantic similarity — documented limitation.
 */

/** YouTube tags field hard limit (platform-rules/youtube.json -> tags.totalLimit). */
export const TAGS_HARD_LIMIT = 500;

/** Stopwords removed before keyword extraction. English-only — documented limitation. */
export const TAG_STOPWORDS: ReadonlySet<string> = new Set([
  "a","an","the","and","but","or","nor","for","so","yet","as","at","by",
  "from","in","into","of","off","on","onto","out","over","per","to","up",
  "upon","via","vs","v","with","without","is","are","was","were","be",
  "this","that","these","those","it","its","my","your","how","what","why",
  "when","where","do","does","did","can","will","get","best","new",
]);

export type TagVerdict = "strong" | "ok" | "weak" | "wasted";
export type ScoreGrade = "Strong" | "Good" | "Needs work" | "Weak";

function tokenize(text: string): string[] {
  const seg = new Intl.Segmenter("en", { granularity: "word" });
  return [...seg.segment(text.toLowerCase())]
    .filter((s) => s.isWordLike)
    .map((s) => s.segment)
    .filter((w) => /[\p{L}\p{N}]/u.test(w));
}

/** Title content keywords: lowercased tokens minus stopwords, deduped. */
export function extractKeywords(title: string): string[] {
  if (typeof title !== "string") throw new TypeError("extractKeywords expects a string");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of tokenize(title)) {
    if (!TAG_STOPWORDS.has(w) && !seen.has(w)) {
      seen.add(w);
      out.push(w);
    }
  }
  return out;
}

/** Parse a tags field: split on commas or newlines, trim, drop empties. */
export function parseTags(raw: string): string[] {
  if (typeof raw !== "string") throw new TypeError("parseTags expects a string");
  return raw.split(/[,\n]/).map((t) => t.trim()).filter((t) => t.length > 0);
}

export interface TagFactor {
  name: string;
  points: number;
  max: number;
  detail: string;
}

export interface TagVerdictEntry {
  tag: string;
  verdict: TagVerdict;
  reason: string;
}

export interface TagScore {
  /** 0-100 heuristic score. */
  score: number;
  grade: ScoreGrade;
  /** True when the tool makes no claim beyond the documented rubric. */
  heuristic: true;
  keywords: string[];
  keywordsCovered: string[];
  keywordsMissing: string[];
  factors: TagFactor[];
  perTag: TagVerdictEntry[];
  totalChars: number;
  budgetUsed: number;
  budgetRemaining: number;
  overBudget: boolean;
}

function gradeFor(score: number): ScoreGrade {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs work";
  return "Weak";
}

function wordCount(tag: string): number {
  return tokenize(tag).length;
}

/**
 * Score a tag list against a video title using the rubric in this file's
 * header JSDoc.
 * @throws {TypeError} on non-string inputs. @throws {Error} on empty title
 *   after trimming (no keywords to score against).
 */
export function scoreTags(title: string, tagsRaw: string): TagScore {
  if (typeof title !== "string" || typeof tagsRaw !== "string") {
    throw new TypeError("scoreTags expects two strings");
  }
  const cleanTitle = title.trim();
  if (cleanTitle === "") throw new Error("scoreTags requires a non-empty title");
  const keywords = extractKeywords(cleanTitle);
  if (keywords.length === 0) throw new Error("scoreTags: title contains no scorable keywords");

  const tags = parseTags(tagsRaw);
  const lowered = tags.map((t) => t.toLowerCase());
  const totalChars = tags.join(",").length;
  const overBudget = totalChars > TAGS_HARD_LIMIT;

  const factors: TagFactor[] = [];
  let score = 0;

  // 1. Keyword coverage (40)
  const covered = keywords.filter((kw) => lowered.some((t) => t.includes(kw)));
  const missing = keywords.filter((kw) => !lowered.some((t) => t.includes(kw)));
  const p1 = Math.round((40 * covered.length) / keywords.length);
  score += p1;
  factors.push({
    name: "Keyword coverage",
    points: p1,
    max: 40,
    detail: `${covered.length}/${keywords.length} title keywords appear in at least one tag.`,
  });

  // 2. Exact-title tag (15)
  const exact = lowered.includes(cleanTitle.toLowerCase());
  const p2 = exact ? 15 : 0;
  score += p2;
  factors.push({
    name: "Exact-title tag",
    points: p2,
    max: 15,
    detail: exact ? "Full title present as a tag." : "Full title not present as a tag.",
  });

  // 3. Multi-word specificity (15)
  const multi = tags.filter((t) => { const n = wordCount(t); return n >= 2 && n <= 4; }).length;
  const p3 = multi >= 2 ? 15 : multi === 1 ? 8 : 0;
  score += p3;
  factors.push({
    name: "Multi-word specificity",
    points: p3,
    max: 15,
    detail: `${multi} tag(s) of 2-4 words (specific phrases beat single words).`,
  });

  // 4. Long-tail presence (10)
  const longTail = tags.filter((t) => wordCount(t) >= 4).length;
  const p4 = longTail >= 1 ? 10 : 0;
  score += p4;
  factors.push({
    name: "Long-tail presence",
    points: p4,
    max: 10,
    detail: longTail >= 1 ? `${longTail} tag(s) of 4+ words.` : "No 4+ word tags.",
  });

  // 5. Budget discipline (10) — no tags means nothing to be disciplined about.
  const p5 = tags.length === 0 ? 0 : totalChars <= 400 ? 10 : totalChars <= TAGS_HARD_LIMIT ? 5 : 0;
  score += p5;
  factors.push({
    name: "Budget discipline",
    points: p5,
    max: 10,
    detail: `${totalChars}/${TAGS_HARD_LIMIT} chars used. ${overBudget ? "OVER the YouTube tags limit — extra tags will be dropped." : ""}`.trim(),
  });

  // 6. No waste (10)
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const t of lowered) {
    if (seen.has(t)) dups.add(t);
    seen.add(t);
  }
  const empties = tags.filter((t) => t.length <= 1).length;
  const p6 =
    tags.length === 0
      ? 0
      : (dups.size === 0 ? 5 : 0) + (empties === 0 ? 5 : 0);
  score += p6;
  factors.push({
    name: "No waste",
    points: p6,
    max: 10,
    detail: dups.size === 0 ? "No duplicate tags." : `Duplicates: ${[...dups].join(", ")}.`,
  });

  // Per-tag verdicts
  const dupSet = dups;
  const perTag: TagVerdictEntry[] = tags.map((tag) => {
    const lt = tag.toLowerCase();
    if (tag.length <= 1) return { tag, verdict: "wasted", reason: "Too short to be useful." };
    if (dupSet.has(lt)) return { tag, verdict: "wasted", reason: "Duplicate tag." };
    if (lt === cleanTitle.toLowerCase()) return { tag, verdict: "strong", reason: "Matches the full title." };
    if (keywords.some((kw) => lt.includes(kw))) {
      return { tag, verdict: "strong", reason: "Contains a title keyword." };
    }
    if (wordCount(tag) >= 2) return { tag, verdict: "ok", reason: "Multi-word, specific — no title keyword overlap." };
    return { tag, verdict: "weak", reason: "Single generic word with no title-keyword match." };
  });

  return {
    score,
    grade: gradeFor(score),
    heuristic: true,
    keywords,
    keywordsCovered: covered,
    keywordsMissing: missing,
    factors,
    perTag,
    totalChars,
    budgetUsed: totalChars,
    budgetRemaining: Math.max(0, TAGS_HARD_LIMIT - totalChars),
    overBudget,
  };
}

/**
 * Contract adapter for the tool template (batch-23).
 *
 * Spec validation (docs/batches/batch23-builder-B-spec.json, tool-134):
 *   - title non-empty
 *   - at least 1 tag            <- NOTE: spec edgeCase says "empty tags -> 0
 *                                with guidance", but the spec validation list
 *                                requires at least 1 tag; the adapter treats
 *                                an empty tag list as invalid input per the
 *                                validation list. scoreTags() itself still
 *                                returns 0 for empty input at engine level.
 *   - total tag chars <= 500 (YouTube hard limit)
 *
 * Output keys: score | grade | perTagVerdicts | budgetUsage |
 * missingKeywords | heuristicNote.
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const title = values["title"];
  const tags = values["tags"];

  if (typeof title !== "string" || title.trim() === "") {
    return { ok: false, error: "Enter your video title." };
  }
  if (typeof tags !== "string" || parseTags(tags).length === 0) {
    return { ok: false, error: "Add at least 1 tag (comma or line separated)." };
  }

  const tagList = parseTags(tags);
  const totalChars = tagList.join(",").length;
  if (totalChars > TAGS_HARD_LIMIT) {
    return {
      ok: false,
      error: `Your tags use ${totalChars} characters — YouTube's tags limit is ${TAGS_HARD_LIMIT}. Remove some tags and try again.`,
    };
  }

  let result: TagScore;
  try {
    result = scoreTags(title, tags);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not score these tags." };
  }

  return {
    ok: true,
    values: {
      score: result.score,
      grade: result.grade,
      perTagVerdicts: result.perTag.map(
        (e) => `${e.verdict.toUpperCase()} — ${e.tag} (${e.reason})`,
      ),
      budgetUsage: `${result.totalChars}/${TAGS_HARD_LIMIT} characters used, ${result.budgetRemaining} remaining`,
      missingKeywords: result.keywordsMissing,
      heuristicNote:
        "Heuristic only — YouTube publishes no tag weighting, so this scores observable best practices (keyword coverage, specificity, budget discipline), not ranking impact.",
    },
  };
}
