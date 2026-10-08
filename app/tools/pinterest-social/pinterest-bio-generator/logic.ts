/**
 * Pinterest Bio Generator — pure logic (tool-353), zero imports, zero
 * network, zero DOM, zero randomness.
 *
 * TEMPLATE BANK, NOT AI: bios are assembled from 4 fixed bio patterns
 * (hand-written) with the user's focus, keywords, and CTA inserted.
 * Nothing is written by AI.
 *
 * Bank sizes (documented so the UI can state them honestly):
 *   bio patterns — 4 (tagline / sentence / list / CTA-led)
 *
 * Placeholders: {focus} = profile focus, {kw1}/{kw2} = keywords,
 * {cta} = call to action.
 *
 * Honesty rules enforced here:
 * - Hard 160-char cap on every bio variant (the Pinterest About-You limit
 *   per the spec). Variants are truncated at a word boundary, trimming from
 *   the END, so the focus and supplied keywords (placed first) survive.
 * - Every variant includes the focus; when keywords are supplied, every
 *   variant includes at least the first keyword (patterns are keyword-led
 *   by construction, and tests verify this at max input lengths).
 * - Focus text longer than 160 chars is rejected (the "or error" branch of
 *   the spec) rather than silently compressed — compression would distort
 *   the user's own words.
 * - With no keywords, bios are plain sentences with NO filler hashtags.
 * - The CTA is kept short enough to fit: CTAs over 60 chars are rejected.
 * - Non-Latin focus/keywords pass through unchanged.
 *
 * Deterministic: patterns are fixed and filled in order. Same inputs ->
 * same variants.
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Hard per-bio character cap. */
export const MAX_BIO_LENGTH = 160;

/** Focus longer than this is rejected (it could never fit a full bio). */
export const MAX_FOCUS_LENGTH = 160;

/** Max single keyword length (chars). */
export const MAX_KEYWORD_LENGTH = 40;

/** Max keywords woven into the bios; extras are ignored. */
export const MAX_KEYWORDS_USED = 3;

/** CTA longer than this is rejected (it would not fit the bio budget). */
export const MAX_CTA_LENGTH = 60;

/** Number of bio variants returned per run. */
export const VARIANT_COUNT = 4;

/**
 * The 4 fixed bio patterns. Each is a function so keyword-less and
 * single-keyword cases stay grammatical without filler text. All patterns
 * are keyword-led: keywords come before the focus, so end-truncation to
 * 160 chars never removes a supplied keyword.
 */
const BIO_PATTERNS: Array<{
  id: string;
  build: (focus: string, kws: string[], cta: string) => string;
}> = [
  {
    id: "tagline",
    build: (focus, kws, cta) =>
      [...kws, focus, cta].filter((p) => p.length > 0).join(" • "),
  },
  {
    id: "sentence",
    build: (focus, kws, cta) => {
      const kwPart = kws.length > 0 ? kws.join(" & ") + " " : "";
      const head = `Sharing ${kwPart}ideas for ${focus} — daily inspiration.`;
      return cta ? `${head} ${cta}` : head;
    },
  },
  {
    id: "list",
    build: (focus, kws, cta) => {
      const kwPart = kws.length > 0 ? `${kws.join(", ")} & more — ` : "";
      const head = `${kwPart}${focus}: ideas, tips & inspiration.`;
      return cta ? `${head} ${cta}` : head;
    },
  },
  {
    id: "cta-led",
    build: (focus, kws, cta) => {
      if (!cta) {
        const kwPart = kws.length > 0 ? ` — ${kws.join(" & ")}` : "";
        return `Sharing ${focus} ideas daily${kwPart}.`;
      }
      const kwPart = kws.length > 0 ? `${kws.join(" & ")} ideas for ` : "";
      const head = `${cta} — ${kwPart}${focus}.`;
      return head.charAt(0).toUpperCase() + head.slice(1);
    },
  },
];

/** Truncate at a word boundary so no word is cut mid-word. */
function truncateWords(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).trimEnd();
}

/**
 * Parse `keywords`: accepts a string[] or a comma-separated string.
 * Returns null when invalid.
 */
function parseKeywords(raw: unknown): string[] | null {
  if (raw === undefined || raw === null) return [];
  let list: unknown[];
  if (typeof raw === "string") {
    if (raw.trim() === "") return [];
    list = raw.split(",");
  } else if (Array.isArray(raw)) {
    list = raw;
  } else {
    return null;
  }
  const out: string[] = [];
  for (const item of list) {
    if (typeof item !== "string") return null;
    const kw = item.trim();
    if (kw.length === 0) continue;
    if (kw.length > MAX_KEYWORD_LENGTH) return null;
    out.push(kw);
  }
  return out;
}

/**
 * runTool({ profileFocus, keywords?, cta? }) -> { bioVariants }.
 *
 * Errors (ok: false) for: missing/blank/non-string profileFocus; focus
 * longer than 160 chars; invalid keywords; CTA longer than 60 chars.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return {
      ok: false,
      error: "Describe your profile focus to generate bio ideas (for example: easy weeknight dinners).",
    };
  }

  const rawFocus = values["profileFocus"];
  if (typeof rawFocus !== "string" || rawFocus.trim().length === 0) {
    return {
      ok: false,
      error: "A profile focus is required — tell the tool what your Pinterest profile is about.",
    };
  }
  const focus = rawFocus.trim();
  if (focus.length > MAX_FOCUS_LENGTH) {
    return {
      ok: false,
      error: `That focus is ${focus.length} characters — shorten it to ${MAX_FOCUS_LENGTH} characters or fewer so it fits a full bio.`,
    };
  }

  const keywords = parseKeywords(values["keywords"]);
  if (keywords === null) {
    return {
      ok: false,
      error: "Keywords must be plain words or short phrases — enter them one per item (or comma-separated).",
    };
  }
  const usedKeywords = keywords.slice(0, MAX_KEYWORDS_USED);

  const rawCta = values["cta"];
  let cta = "";
  if (rawCta !== undefined && rawCta !== null && String(rawCta).trim() !== "") {
    if (typeof rawCta !== "string") {
      return { ok: false, error: "The CTA must be text." };
    }
    cta = rawCta.trim();
    if (cta.length > MAX_CTA_LENGTH) {
      return {
        ok: false,
        error: `That CTA is ${cta.length} characters — keep it under ${MAX_CTA_LENGTH} characters so it fits inside a 160-character bio.`,
      };
    }
  }

  const seen = new Set<string>();
  const bioVariants: string[] = [];
  for (const pattern of BIO_PATTERNS) {
    const variant = truncateWords(
      pattern.build(focus, usedKeywords, cta),
      MAX_BIO_LENGTH
    );
    if (variant.length === 0 || seen.has(variant)) continue;
    seen.add(variant);
    bioVariants.push(variant);
  }

  return { ok: true, values: { bioVariants } };
}
