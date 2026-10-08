/**
 * Pinterest Board Name Generator — pure logic (tool-351), zero imports,
 * zero network, zero DOM, zero randomness.
 *
 * TEMPLATE BANK, NOT AI: board names are assembled from a fixed bank of
 * hand-written name templates with the user's niche keyword inserted.
 * Nothing is written by AI; every name comes from the template bank.
 *
 * Bank sizes (documented so the UI can state them honestly):
 *   seo     — 12 templates (keyword-led, search-friendly phrasing)
 *   playful — 12 templates (casual, personality-driven)
 *   brand   — 12 templates (curated, studio-style)
 *   TOTAL   — 36 templates.
 *
 * Placeholders: {keyword} = the user's trimmed niche keyword.
 *
 * Honesty rules enforced here:
 * - Every name is capped at 100 characters (the Pinterest board-name limit
 *   per the spec). If a keyword + template would exceed 100 chars, the name
 *   is truncated at a word boundary to <=100 chars. Truncation never invents
 *   new words — it only cuts.
 * - A keyword longer than 100 chars is rejected: no template could keep the
 *   keyword-led name under the cap.
 * - Non-Latin keywords (e.g. Urdu, Arabic, CJK) pass through unchanged —
 *   the tool never transliterates or rewrites them.
 * - No duplicate names are returned in one batch (count <= 10 < bank size
 *   12, so batches never need to cycle a tone's bank).
 *
 * Deterministic: the same {nicheKeyword, tone, count} always returns the
 * same names in the same order (bank order, no shuffling).
 */

export type BoardNameTone = "seo" | "playful" | "brand";

/** Valid tones, in canonical order. */
export const BOARD_NAME_TONES: BoardNameTone[] = ["seo", "playful", "brand"];

/** Default tone when the caller omits it. */
export const DEFAULT_TONE: BoardNameTone = "seo";

/** Default and bounds for `count`. */
export const DEFAULT_COUNT = 5;
export const MIN_COUNT = 1;
export const MAX_COUNT = 10;

/** Hard board-name character cap enforced on every output name. */
export const MAX_NAME_LENGTH = 100;

/** Max keyword length: anything longer can never fit a keyword-led name. */
export const MAX_KEYWORD_LENGTH = 100;

/**
 * Name templates per tone — 12 each (36 total). {keyword} is replaced with
 * the user's trimmed niche keyword. Every template is written so that a
 * short keyword keeps the result well under 100 chars; long keywords are
 * truncated at generation time (never silently reworded).
 */
export const NAME_BANK: Record<BoardNameTone, string[]> = {
  seo: [
    "{keyword} Ideas",
    "{keyword} Inspiration",
    "Best {keyword} Ideas",
    "{keyword} Tips & Tricks",
    "{keyword} for Beginners",
    "Easy {keyword} Ideas",
    "{keyword} Inspiration Board",
    "Creative {keyword} Ideas",
    "{keyword} Guide & Inspiration",
    "Top {keyword} Ideas to Save",
    "{keyword} You Need to Try",
    "Ultimate {keyword} Ideas",
  ],
  playful: [
    "{keyword} Obsessed",
    "All Things {keyword}",
    "Living for {keyword}",
    "{keyword} Dreams",
    "My {keyword} Era",
    "Hello, {keyword}!",
    "{keyword} Lovers Unite",
    "Pure {keyword} Joy",
    "Can't Get Enough {keyword}",
    "{keyword} & Chill",
    "The {keyword} Club",
    "{keyword} Mood Board",
  ],
  brand: [
    "{keyword} Studio",
    "The {keyword} Edit",
    "Curated {keyword}",
    "{keyword} Atelier",
    "{keyword} Collective",
    "The {keyword} Journal",
    "{keyword} House",
    "Styled {keyword}",
    "The {keyword} Standard",
    "{keyword} Co.",
    "{keyword} Lookbook",
    "The Art of {keyword}",
  ],
};

/** Bank sizes, exported so the UI can state them honestly. */
export const BANK_SIZES = {
  perTone: NAME_BANK.seo.length,
  tones: BOARD_NAME_TONES.length,
  total:
    NAME_BANK.seo.length + NAME_BANK.playful.length + NAME_BANK.brand.length,
};

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isBoardNameTone(s: string): s is BoardNameTone {
  return (BOARD_NAME_TONES as string[]).includes(s);
}

/**
 * Parse `count`: missing/blank -> default 5; otherwise must be an integer
 * in [1, 10]. Returns null when invalid.
 */
function parseCount(raw: unknown): number | null {
  if (raw === undefined || raw === null) return DEFAULT_COUNT;
  const n =
    typeof raw === "string" && raw.trim() !== "" ? Number(raw.trim()) : raw;
  if (typeof n !== "number" || !Number.isInteger(n)) return null;
  if (n < MIN_COUNT || n > MAX_COUNT) return null;
  return n;
}

/**
 * Enforce the 100-char cap: slice to 100, then back off to the last word
 * boundary (when a clean one exists past the halfway point) so words are
 * never cut mid-word.
 */
function enforceCap(name: string): string {
  if (name.length <= MAX_NAME_LENGTH) return name;
  const cut = name.slice(0, MAX_NAME_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  const safe = lastSpace > MAX_NAME_LENGTH / 2 ? cut.slice(0, lastSpace) : cut;
  return safe.trimEnd();
}

/**
 * runTool({ nicheKeyword, tone?, count? }) -> { boardNameCandidates }.
 *
 * Errors (ok: false) for: missing/blank/non-string nicheKeyword; keyword
 * longer than 100 chars; unknown tone; invalid count.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return {
      ok: false,
      error: "Enter a niche keyword to generate board names (for example: small kitchen organization).",
    };
  }

  const rawKeyword = values["nicheKeyword"];
  if (typeof rawKeyword !== "string" || rawKeyword.trim().length === 0) {
    return {
      ok: false,
      error: "A niche keyword is required — tell the tool what your board is about (for example: fall outfits).",
    };
  }
  const keyword = rawKeyword.trim();
  if (keyword.length > MAX_KEYWORD_LENGTH) {
    return {
      ok: false,
      error: `That keyword is ${keyword.length} characters — keywords must be ${MAX_KEYWORD_LENGTH} characters or fewer so names stay under the 100-character board-name cap.`,
    };
  }

  const rawTone = values["tone"];
  let tone: BoardNameTone = DEFAULT_TONE;
  if (rawTone !== undefined && rawTone !== null && String(rawTone).trim() !== "") {
    if (typeof rawTone !== "string" || !isBoardNameTone(rawTone.trim())) {
      return {
        ok: false,
        error: `Unknown tone. Choose one of: ${BOARD_NAME_TONES.join(", ")}.`,
      };
    }
    tone = rawTone.trim() as BoardNameTone;
  }

  const count = parseCount(values["count"]);
  if (count === null) {
    return {
      ok: false,
      error: `Count must be a whole number between ${MIN_COUNT} and ${MAX_COUNT}.`,
    };
  }

  const bank = NAME_BANK[tone];
  const seen = new Set<string>();
  const boardNameCandidates: string[] = [];
  // Deterministic: bank order, no shuffling. count <= 10 < 12 per tone,
  // so a batch never repeats a template; the seen-set guards anyway.
  // Honest edge: with an extremely long keyword, 100-char truncation can
  // collapse several templates to the same name — then fewer than `count`
  // distinct names are returned rather than padded with duplicates.
  let i = 0;
  while (boardNameCandidates.length < count && i < bank.length * 2) {
    const template = bank[i % bank.length];
    i += 1;
    const name = enforceCap(template.replaceAll("{keyword}", keyword));
    if (name.length === 0 || seen.has(name)) continue;
    seen.add(name);
    boardNameCandidates.push(name);
  }

  return { ok: true, values: { boardNameCandidates } };
}
