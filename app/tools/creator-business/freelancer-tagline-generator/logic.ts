/**
 * Freelancer Tagline Generator (tool-493) — pure logic, zero imports, zero
 * network, zero DOM, no randomness.
 *
 * HONESTY: this is a PATTERN-BASED tagline assembler, not an AI copywriter.
 * Taglines are built by inserting your service keywords into fixed sentence
 * templates grouped by tone. There is no brand-conflict checking — a
 * generated tagline may already be in use by someone else, so verify before
 * adopting one.
 *
 * Word banks (all fixed, documented here):
 *   - TEMPLATES: 3 tones x 8 fixed sentence patterns = 24 templates.
 *     Each template has exactly one "{S}" slot filled with your keyword.
 *     professional (8): results-focused, formal phrasing.
 *     friendly (8): warm, approachable phrasing.
 *     bold (8): confident, edgy phrasing.
 *   - Keywords are capped at MAX_KEYWORDS (20); combination space per
 *     keyword is 8 taglines, 160 total across all tones.
 *
 * Generator contract: runTool(values) -> { ok, values, error }.
 * values in  = { serviceKeywords, tone, taglineCount? }
 * values out = { taglineIdeas }
 * Output ids match meta.ts outputs. Deterministic: same inputs -> same
 * taglines, in the same order, every time.
 */

export interface TaglineValues {
  /** Up to `taglineCount` unique tagline ideas, in fixed generation order. */
  taglineIdeas: string[];
}

export interface TaglineResult {
  ok: boolean;
  values?: TaglineValues;
  error?: string;
}

/** Tone options shown in the UI select; keys of TEMPLATES. */
export const TONES: string[] = ["professional", "friendly", "bold"];

/** Max service keywords read from the textarea; bounds total work. */
const MAX_KEYWORDS = 20;

/** Min/max taglines the tool will produce. */
const MIN_COUNT = 1;
const MAX_COUNT = 30;
const DEFAULT_COUNT = 10;

/**
 * 24 fixed sentence templates, 8 per tone. "{S}" is the service keyword slot.
 */
const TEMPLATES: Record<string, string[]> = {
  professional: [
    "{S} for businesses that demand results.",
    "Expert {S} — delivered on time, every time.",
    "Strategic {S} for growing brands.",
    "{S} without the guesswork.",
    "Precision {S} for serious businesses.",
    "Your partner for world-class {S}.",
    "{S} engineered for growth.",
    "Trusted {S} for ambitious teams.",
  ],
  friendly: [
    "Friendly {S} that actually gets you.",
    "{S} made simple and stress-free.",
    "I make {S} easy.",
    "Great {S}, zero headaches.",
    "Your go-to human for {S}.",
    "{S} with a personal touch.",
    "Let's make your {S} shine.",
    "Warm, honest {S} for good people.",
  ],
  bold: [
    "{S} that refuses to blend in.",
    "Bold {S}. Loud results.",
    "Stop settling for average {S}.",
    "{S} with teeth.",
    "We don't do boring {S}.",
    "Unapologetically great {S}.",
    "{S} that demands attention.",
    "Average is not in our {S} vocabulary.",
  ],
};

/** Split a textarea into a keyword list (commas, semicolons, newlines). */
function parseKeywords(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .slice(0, MAX_KEYWORDS);
}

function toCount(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return DEFAULT_COUNT;
  }
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n) || Math.floor(n) !== n) return null;
  return n;
}

/** Fill the {S} slot; keeps the keyword exactly as the user typed it. */
function fill(template: string, keyword: string): string {
  return template.split("{S}").join(keyword);
}

/**
 * Insert each keyword into each tone template in fixed order, remove
 * duplicates, and cap at `count`.
 */
export function runTool(values: Record<string, unknown>): TaglineResult {
  const source = values ?? {};

  const keywords = parseKeywords(source.serviceKeywords);
  if (keywords.length === 0) {
    return {
      ok: false,
      error:
        "Enter at least one service keyword (for example: logo design, copywriting).",
    };
  }

  const rawTone =
    typeof source.tone === "string" ? source.tone.trim().toLowerCase() : "";
  if (TONES.indexOf(rawTone) === -1) {
    return {
      ok: false,
      error: "Choose a tone: " + TONES.join(", ") + ".",
    };
  }

  const count = toCount(source.taglineCount);
  if (count === null || count < MIN_COUNT || count > MAX_COUNT) {
    return {
      ok: false,
      error:
        "Enter how many taglines you want as a whole number between " +
        MIN_COUNT +
        " and " +
        MAX_COUNT +
        ".",
    };
  }

  const templates = TEMPLATES[rawTone];
  const taglines: string[] = [];
  const seen: Record<string, boolean> = {};

  outer: for (const keyword of keywords) {
    for (const template of templates) {
      const tagline = fill(template, keyword);
      const key = tagline.toLowerCase();
      if (!seen[key]) {
        seen[key] = true;
        taglines.push(tagline);
        if (taglines.length >= count) break outer;
      }
    }
  }

  return {
    ok: true,
    values: { taglineIdeas: taglines },
  };
}
