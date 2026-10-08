/**
 * Pinterest Profile Name Generator — pure logic (tool-354), zero imports,
 * zero network, zero DOM, zero randomness.
 *
 * TEXT GENERATION + FORMAT RULES, NOT AI: display names are assembled from
 * 4 fixed name patterns; usernames are slugified from the brand/keyword
 * into Pinterest's username format. Nothing is written by AI.
 *
 * Bank sizes (documented so the UI can state them honestly):
 *   display-name patterns — 4 (pipe / dash / byline / plain)
 *   username patterns    — 4 (base / _pins / _keyword / the_)
 *
 * Honesty rules enforced here:
 * - Display names are hard-capped at 65 chars. When the brand is too long,
 *   KEYWORD-FIRST truncation applies: the keyword is always kept and the
 *   brand portion is shrunk at a word boundary; if the brand cannot fit
 *   even a few characters, the candidate falls back to a keyword-led name.
 * - Usernames are 3–30 chars, lowercase [a-z0-9_] only, no spaces/symbols —
 *   enforced by construction and re-validated before return.
 * - USERNAME AVAILABILITY IS EXPLICITLY OUT OF SCOPE: these are format-valid
 *   suggestions only. The UI must label them "availability must be checked
 *   on Pinterest" — this tool cannot check whether a name is taken.
 * - Non-Latin brands cannot form a valid [a-z0-9_] username, so a neutral
 *   fallback base ("pin_creator") is used for the username suggestions;
 *   display names keep the original script untouched.
 *
 * Deterministic: patterns are fixed and filled in order. Same inputs ->
 * same candidates.
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Hard display-name cap (chars). */
export const MAX_DISPLAY_LENGTH = 65;

/** Username length bounds. */
export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 30;

/** Username character rule. */
export const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

/** Max single keyword length (chars). */
export const MAX_KEYWORD_LENGTH = 40;

/** Neutral username base when the brand has no Latin characters to slugify. */
export const FALLBACK_USERNAME_BASE = "pin_creator";

/** Number of candidates per output list. */
export const CANDIDATE_COUNT = 4;

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
 * Slugify for usernames: lowercase, strip accents, map any run of
 * non [a-z0-9] to a single underscore, trim edge underscores.
 */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Keyword-first truncation: assemble `priority` (kept in full) +
 * `shrinkable` (cut at a word boundary to fit). If the shrinkable part
 * cannot keep even a few characters, return the priority part alone.
 */
function fitCandidate(priority: string, shrinkable: string, max: number): string {
  const full = priority + shrinkable;
  if (full.length <= max) return full;
  const shrunk = truncateWords(shrinkable, max - priority.length);
  if (shrunk.trim().length < 5) return priority.trimEnd();
  return (priority + shrunk).trimEnd();
}

/** Build the 4 display-name candidates (each <= 65 chars). */
function buildDisplayNames(brand: string, kw: string | null): string[] {
  const out: string[] = [];
  if (kw) {
    out.push(fitCandidate(`${kw} | `, brand, MAX_DISPLAY_LENGTH));
    out.push(fitCandidate(`${kw} Ideas — `, brand, MAX_DISPLAY_LENGTH));
    out.push(fitCandidate(`${kw} by `, brand, MAX_DISPLAY_LENGTH));
    out.push(fitCandidate(kw, "", MAX_DISPLAY_LENGTH));
  } else {
    // Differentiator first: keyword-first truncation keeps the label and
    // shrinks the brand, so long brands cannot collapse into duplicates.
    out.push(truncateWords(brand, MAX_DISPLAY_LENGTH));
    out.push(fitCandidate("Pins — ", brand, MAX_DISPLAY_LENGTH));
    out.push(fitCandidate("Inspiration: ", brand, MAX_DISPLAY_LENGTH));
    out.push(fitCandidate("Collection: ", brand, MAX_DISPLAY_LENGTH));
  }
  // Dedupe defensively (e.g. keyword equal to brand).
  const seen = new Set<string>();
  return out.filter((n) => {
    if (n.length === 0 || n.length > MAX_DISPLAY_LENGTH || seen.has(n)) return false;
    seen.add(n);
    return true;
  });
}

/** Build the 4 username suggestions (each matches USERNAME_PATTERN). */
function buildUsernames(brand: string, kw: string | null): string[] {
  let base = slugify(brand);
  if (base.length < MIN_USERNAME_LENGTH) base = FALLBACK_USERNAME_BASE;
  const kwSlug = kw ? slugify(kw) : "";
  const kwPart = kwSlug.length >= 2 ? kwSlug : "ideas";

  const raw: string[] = [
    base,
    `${base}_pins`,
    `${base}_${kwPart}`,
    `the_${base}`,
  ];

  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of raw) {
    const name = candidate.slice(0, MAX_USERNAME_LENGTH).replace(/_+$/, "");
    if (!USERNAME_PATTERN.test(name) || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  // Top up with numbered variants if dedupe/truncation collided.
  // (base is shortened first so the numeric suffix always survives the
  // 30-char slice — otherwise the loop could never terminate.)
  const shortBase = base.slice(0, MAX_USERNAME_LENGTH - 4);
  let n = 2;
  while (out.length < CANDIDATE_COUNT) {
    const name = `${shortBase}_${n}`;
    n += 1;
    if (!USERNAME_PATTERN.test(name) || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}

/**
 * runTool({ brandOrName, keywords? }) ->
 *   { displayNameCandidates, usernameSuggestions }.
 *
 * Errors (ok: false) for: missing/blank/non-string brandOrName;
 * invalid keywords.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return {
      ok: false,
      error: "Enter your brand or name to generate profile name ideas (for example: Maple & Co.).",
    };
  }

  const rawBrand = values["brandOrName"];
  if (typeof rawBrand !== "string" || rawBrand.trim().length === 0) {
    return {
      ok: false,
      error: "A brand or name is required — it is the base for every display name and username suggestion.",
    };
  }
  const brand = rawBrand.trim();

  const keywords = parseKeywords(values["keywords"]);
  if (keywords === null) {
    return {
      ok: false,
      error: "Keywords must be plain words or short phrases — enter them one per item (or comma-separated).",
    };
  }
  const kw = keywords.length > 0 ? keywords[0] : null;

  const displayNameCandidates = buildDisplayNames(brand, kw);
  const usernameSuggestions = buildUsernames(brand, kw);

  return { ok: true, values: { displayNameCandidates, usernameSuggestions } };
}
