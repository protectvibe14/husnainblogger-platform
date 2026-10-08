/**
 * Pinterest SEO Title Rewriter — pure logic (zero imports, zero network, zero DOM).
 *
 * Produces title rewrite variants by filling a FIXED bank of title patterns
 * with the user's keyword (front-loaded within the first 5 words) and the
 * core of their draft title. No AI, no model output, no ranking promises:
 * front-loading the keyword is a widely used Pinterest SEO convention, not a
 * guarantee of reach.
 *
 * Fixed pattern bank (documented per the builder honesty contract):
 * - 14 core patterns using {keyword} + {core} slots
 * - 4 coreless fallback patterns ({keyword} only) used when the draft is
 *   basically just the keyword
 * Total: 18 fixed patterns. Selection is deterministic — every pattern that
 * passes the filters is returned in fixed bank order. No Math.random.
 *
 * Validation enforced per output:
 * - every rewrite <= 100 characters (over-long patterns are dropped)
 * - keyword phrase's first word sits within the first 5 words
 * - every rewrite contains the keyword (no clickbait-only variants)
 */

export const MAX_TITLE_LEN = 200;
export const MAX_KEYWORD_LEN = 100;
export const MAX_REWRITE_LEN = 100;
export const KEYWORD_FRONT_WORDS = 5;

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function words(s: string): string[] {
  return s.split(/\s+/).filter(Boolean);
}

function titleCase(s: string): string {
  return words(s)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Strip one occurrence of the keyword from the draft to get the "core". */
function extractCore(draft: string, keyword: string): string {
  const lower = draft.toLowerCase();
  const kwLower = keyword.toLowerCase();
  const idx = lower.indexOf(kwLower);
  let core = idx >= 0 ? draft.slice(0, idx) + draft.slice(idx + keyword.length) : draft;
  core = core
    .replace(/^[\s:–—\-|,;]+/, "")
    .replace(/[\s:–—\-|,;]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return core;
}

/** 14 fixed patterns — keyword always starts within the first 5 words. */
const PATTERNS: string[] = [
  "{keyword}: {core}",
  "{keyword} — {core}",
  "{keyword} Ideas: {core}",
  "Best {keyword}: {core}",
  "Easy {keyword} — {core}",
  "How to Nail {keyword}: {core}",
  "{keyword} Tips and Tricks: {core}",
  "Ultimate {keyword} Guide: {core}",
  "{keyword} for Beginners: {core}",
  "Top {keyword} Ideas You'll Love: {core}",
  "{keyword} Step by Step: {core}",
  "Simple {keyword}: {core}",
  "{keyword} Inspiration: {core}",
  "New {keyword} Ideas for {core}",
];

/** 4 fixed fallbacks when the draft carries no usable core. */
const CORELESS_PATTERNS: string[] = [
  "{keyword}: Ideas You'll Love",
  "The Best {keyword} Ideas",
  "{keyword} Inspiration Board",
  "Easy {keyword} Tips",
];

function keywordFrontOk(rewrite: string, kwFirstWord: string): boolean {
  const ws = words(rewrite.toLowerCase());
  const idx = ws.indexOf(kwFirstWord);
  return idx >= 0 && idx < KEYWORD_FRONT_WORDS;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const draftRaw = values["draftTitle"];
  const kwRaw = values["primaryKeyword"];

  const draft = typeof draftRaw === "string" ? draftRaw.trim().replace(/\s+/g, " ") : "";
  if (!draft) {
    return { ok: false, error: "Please enter your draft pin title." };
  }
  if (draft.length > MAX_TITLE_LEN) {
    return { ok: false, error: `Draft title is too long (max ${MAX_TITLE_LEN} characters).` };
  }

  const keywordRaw = typeof kwRaw === "string" ? kwRaw.trim().replace(/\s+/g, " ") : "";
  if (!keywordRaw) {
    return { ok: false, error: "Please enter your primary keyword." };
  }
  if (keywordRaw.length > MAX_KEYWORD_LEN) {
    return { ok: false, error: `Keyword is too long (max ${MAX_KEYWORD_LEN} characters).` };
  }

  const keyword = titleCase(keywordRaw);
  const kwFirstWord = words(keyword.toLowerCase())[0];
  const core = extractCore(draft, keywordRaw);
  const coreLower = core.charAt(0).toLowerCase() + core.slice(1);

  const fill = (p: string): string =>
    p.split("{keyword}").join(keyword).split("{core}").join(coreLower || core);

  const seen = new Set<string>();
  const rewrites: string[] = [];
  const tryAdd = (text: string) => {
    const t = text.replace(/\s+/g, " ").trim();
    const key = t.toLowerCase();
    if (!t || seen.has(key)) return;
    if (t.length > MAX_REWRITE_LEN) return;
    if (!keywordFrontOk(t, kwFirstWord)) return;
    seen.add(key);
    rewrites.push(t);
  };

  if (core) {
    for (const p of PATTERNS) tryAdd(fill(p));
  } else {
    for (const p of CORELESS_PATTERNS) tryAdd(fill(p));
  }
  // Always also offer the coreless fallbacks so the list is never thin.
  for (const p of CORELESS_PATTERNS) tryAdd(fill(p));

  // Absolute fallback: a bare keyword alone always satisfies every rule
  // (keyword is validated <=100 chars), so the list is never empty.
  if (rewrites.length === 0) tryAdd(keyword);

  // "Already optimized" edge case: draft already front-loads the keyword.
  const lowerDraft = draft.toLowerCase();
  const kwIdx = lowerDraft.indexOf(keywordRaw.toLowerCase());
  let note = "";
  if (kwIdx >= 0) {
    const wordsBefore = words(lowerDraft.slice(0, kwIdx)).length;
    if (wordsBefore < KEYWORD_FRONT_WORDS && draft.length <= MAX_REWRITE_LEN) {
      note =
        "Your draft already looks optimized — it front-loads the keyword and fits the 100-character cap. The variants below are optional alternatives in case you want a fresh angle.";
    }
  }

  return {
    ok: true,
    values: {
      rewrites,
      note,
    },
  };
}
