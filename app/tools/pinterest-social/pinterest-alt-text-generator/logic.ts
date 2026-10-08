/**
 * Pinterest Alt Text Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Builds accessibility-first alt text from the user's own image description,
 * optionally weaving their keyword in once, naturally. No AI, no model
 * output — every word beyond the user's inputs comes from a fixed template
 * bank, and no visual details are invented (templates only rephrase what the
 * user described).
 *
 * Fixed content banks (documented per the builder honesty contract):
 * - TEMPLATES: 8 sentence templates using {desc} (the description) and
 *   {keyword} slots; keyword-bearing templates use the keyword exactly once
 * Total fixed strings: 8.
 *
 * Deterministic: templateIndex = hash(description) % 8 — same description
 * + keyword always yields the identical alt text. No Math.random.
 *
 * Validation enforced per output:
 * - alt text <= 500 characters (longer descriptions are compressed with "…")
 * - no "image of" / "picture of" / "photo of" filler prefix (stripped from input)
 * - keyword woven at most once, never stuffed
 */

export const MAX_ALT_CHARS = 500;
export const MAX_KEYWORD_LEN = 80;

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Strip "image of / picture of / photo of" filler from the description start. */
function cleanDescription(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^(an?\s+)?(image|picture|photo)\s+of\s+/i, "")
    .replace(/[.。]+$/, "")
    .trim();
}

function sentenceCase(s: string): string {
  return s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function lowerFirst(s: string): string {
  return s.length > 0 ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

/** 8 fixed templates. {desc} = sentence-cased description, {d} = lowercased. */
const TEMPLATES: string[] = [
  "{desc}.",
  "{desc} — {keyword}.",
  "{desc}, with {keyword} details.",
  "A {d}.",
  "{desc}, styled as {keyword} inspiration.",
  "Detailed {d}.",
  "{desc} for {keyword} lovers.",
  "{desc} — save this {keyword} idea.",
];

export function runTool(values: Record<string, unknown>): RunResult {
  const descRaw = values["imageDescription"];
  const kwRaw = values["keyword"];

  const description = typeof descRaw === "string" ? cleanDescription(descRaw) : "";
  if (!description) {
    return {
      ok: false,
      error:
        "Please describe what you see in the image (a keyword alone is not enough) — e.g. “a rustic wooden tray with three lit candles”.",
    };
  }

  const keyword = typeof kwRaw === "string" ? kwRaw.trim().replace(/\s+/g, " ") : "";
  if (keyword.length > MAX_KEYWORD_LEN) {
    return { ok: false, error: `Keyword is too long (max ${MAX_KEYWORD_LEN} characters).` };
  }

  const h = hashStr(description.toLowerCase());
  let template = TEMPLATES[h % TEMPLATES.length];
  // Keyword-bearing templates need a keyword; otherwise fall back to plain ones.
  const needsKeyword = template.includes("{keyword}");
  if (needsKeyword && !keyword) {
    template = TEMPLATES[0]; // "{desc}."
  }
  // Avoid doubled articles: "A a cat." -> fall back to "{desc}.".
  if (template === "A {d}." && /^(a|an)\s/i.test(description)) {
    template = TEMPLATES[0];
  }

  let alt = template
    .split("{desc}")
    .join(sentenceCase(description))
    .split("{d}")
    .join(lowerFirst(description))
    .split("{keyword}")
    .join(keyword)
    .replace(/\s+/g, " ")
    .trim();

  // 500-char cap: compress the description side, keep the sentence intact.
  if (alt.length > MAX_ALT_CHARS) {
    const overflow = alt.length - MAX_ALT_CHARS + 1; // +1 for the "…"
    const cutDesc = description.slice(0, Math.max(0, description.length - overflow)).trim();
    alt = template
      .split("{desc}")
      .join(sentenceCase(cutDesc))
      .split("{d}")
      .join(lowerFirst(cutDesc))
      .split("{keyword}")
      .join(keyword)
      .replace(/\s+/g, " ")
      .trim();
    if (alt.length > MAX_ALT_CHARS) {
      alt = alt.slice(0, MAX_ALT_CHARS - 1).trimEnd() + "…";
    } else if (!/[.…]$/.test(alt)) {
      alt += "…";
    }
  }

  return {
    ok: true,
    values: {
      altText: alt,
    },
  };
}
