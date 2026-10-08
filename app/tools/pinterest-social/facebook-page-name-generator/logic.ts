/**
 * Facebook Page Name Generator — pure logic (tool-387). Zero imports, zero
 * network, zero DOM.
 *
 * TEMPLATE BANK, NOT AI: assembles page-name candidates from hand-written
 * name patterns, inserting the user's business type and keywords.
 *
 * Pattern banks:
 *   KEYWORD_PATTERNS  — 8 patterns that combine business type + keyword.
 *   NOTYPE_PATTERNS   — 8 patterns using only the business type (used when
 *                        no keywords are given).
 * Totals: 16 patterns. Nothing is written by AI.
 *
 * Facebook page-name limit: every candidate is kept <= 75 characters
 * (over-long candidates are dropped, never truncated mid-word).
 *
 * Honesty: name availability CANNOT be checked client-side — the output
 * carries a note saying so, and meta.ts repeats it.
 *
 * Validation: inputs claiming "official" / "verified" / "facebook" /
 * "meta" style status are rejected, because Facebook's naming rules ban
 * misleading official/verified claims.
 *
 * Deterministic: same inputs -> same outputs (pattern order = char-code
 * sum of inputs, modulo bank size).
 */

export const PAGE_NAME_LIMIT = 75;

/** Input bounds. */
export const MAX_BUSINESS_TYPE_LENGTH = 60;
export const MAX_KEYWORD_LENGTH = 30;
export const MAX_KEYWORDS = 5;

/** Misleading status claims rejected from name inputs. */
export const MISLEADING_CLAIMS: string[] = ["official", "verified", "facebook", "meta", "fb"];

const MISLEADING_RE = new RegExp(`\\b(${MISLEADING_CLAIMS.join("|")})\\b`, "i");

/** 8 patterns combining {type} + {kw}. */
export const KEYWORD_PATTERNS: string[] = [
  "{type} — {kw}",
  "{kw} {type}",
  "{type} | {kw}",
  "The {type} {kw}",
  "{type} Hub: {kw}",
  "{kw} & {type}",
  "{type} — {kw} Community",
  "Daily {type} | {kw}",
];

/** 8 patterns using only {type} (fallback when no keywords are given). */
export const NOTYPE_PATTERNS: string[] = [
  "{type}",
  "{type} Hub",
  "The {type}",
  "{type} Community",
  "Daily {type}",
  "{type} Tips",
  "{type} Central",
  "{type} HQ",
];

/** Number of name candidates returned per run. */
export const NAME_COUNT = 8;

export interface PageNameResultValues {
  ok: boolean;
  values?: {
    pageNames: string[];
    copyAll: string;
    availabilityNote: string;
  };
  error?: string;
}

function sumChars(s: string): number {
  let total = 0;
  for (let i = 0; i < s.length; i++) total += s.charCodeAt(i);
  return total;
}

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/** Split a raw keywords string on commas/newlines; clean and cap. */
export function parseKeywords(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .slice(0, MAX_KEYWORDS);
}

export function runTool(values: Record<string, unknown>): PageNameResultValues {
  const typeRaw = values["businessType"];
  if (typeof typeRaw !== "string" || typeRaw.trim().length === 0) {
    return { ok: false, error: "Please enter your business type (e.g. bakery, plumbing service)." };
  }
  const businessType = titleCase(typeRaw.trim());

  if (businessType.length > MAX_BUSINESS_TYPE_LENGTH) {
    return { ok: false, error: `Keep your business type under ${MAX_BUSINESS_TYPE_LENGTH} characters (yours is ${businessType.length}).` };
  }

  const keywords = parseKeywords(values["keywords"]);
  for (const kw of keywords) {
    if (kw.length > MAX_KEYWORD_LENGTH) {
      return { ok: false, error: `Keep each keyword under ${MAX_KEYWORD_LENGTH} characters ("${kw.slice(0, 24)}…" is too long).` };
    }
  }

  const allWords = `${businessType} ${keywords.join(" ")}`;
  const bad = allWords.match(MISLEADING_RE);
  if (bad) {
    return {
      ok: false,
      error: `Remove the word "${bad[0]}" — Facebook rejects page names with official/verified/platform claims. Use your real business name instead.`,
    };
  }

  const patterns = keywords.length > 0 ? KEYWORD_PATTERNS : NOTYPE_PATTERNS;
  const seed = sumChars(businessType + "|" + keywords.join("|"));
  const start = seed % patterns.length;

  const pageNames: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < patterns.length && pageNames.length < NAME_COUNT; i++) {
    const pattern = patterns[(start + i) % patterns.length];
    const kw = keywords.length > 0 ? titleCase(keywords[(seed + i) % keywords.length]) : "";
    const name = pattern.split("{type}").join(businessType).split("{kw}").join(kw);
    if (name.length === 0 || name.length > PAGE_NAME_LIMIT || seen.has(name)) continue;
    seen.add(name);
    pageNames.push(name);
  }

  if (pageNames.length === 0) {
    return { ok: false, error: "Could not build a name within Facebook's 75-character limit — shorten your business type or keywords and try again." };
  }

  return {
    ok: true,
    values: {
      pageNames,
      copyAll: pageNames.join("\n"),
      availabilityNote:
        "Availability cannot be checked by this tool: search each name on Facebook and check your local trademark database before creating the page. Facebook may also reject names that are too generic or misleading.",
    },
  };
}
