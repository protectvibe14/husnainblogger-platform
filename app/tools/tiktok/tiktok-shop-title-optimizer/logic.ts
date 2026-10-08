/**
 * TikTok Shop Title Optimizer — pure logic (tool-191).
 * Zero imports, zero network, zero DOM, fully deterministic.
 *
 * HONESTY: titles are rule-assembled from FIXED template patterns — no AI,
 * no TikTok search data, no "proven to convert" claims. The 255-character cap
 * is enforced per TikTok Shop's product-name limit. Keyword-stuffing guard:
 * any assembled title where a single keyword repeats more than 3 times is
 * rejected (MAX_REPEATS = 3) — a simple substring heuristic, documented below.
 * Bank sizes:
 *   - TITLE_PATTERNS: 8 (keyword-first permutations of product name + keywords)
 * Output: exactly TITLE_COUNT = 8 unique titles, each <= 255 chars.
 * Determinism: same inputs -> same outputs (keyword order preserved, patterns
 * cycled in fixed order, keywords rotated by title index).
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** TikTok Shop product-name character limit (platform rule). */
const TITLE_LIMIT = 255;
/** Max times one keyword may repeat inside a single title (stuffing guard). */
const MAX_REPEATS = 3;
/** Titles produced per run. */
const TITLE_COUNT = 8;
/** Max keywords consumed per run (extras are ignored, order preserved). */
const MAX_KEYWORDS = 12;
const MAX_NAME_LEN = 120;
const MAX_KEYWORD_LEN = 60;
const MAX_RAW_KEYWORDS_LEN = 2000;

type Pattern = (name: string, kws: string[]) => string;

/**
 * 8 fixed keyword-first patterns. Each handles short keyword lists
 * gracefully (falls back to fewer keywords instead of breaking).
 */
export const TITLE_PATTERNS: readonly Pattern[] = [
  (n, k) => `${k[0]} | ${n}`,
  (n, k) => `${k[0]} — ${n}`,
  (n, k) => `${k[0]} for ${n}`,
  (n, k) => `${n} — ${k[0]}`,
  (n, k) => `${n}: ${k[0]}`,
  (n, k) => (k.length > 1 ? `${k[0]} ${k[1]} ${n}` : `${k[0]} ${n}`),
  (n, k) => `${n} (${k[0]})`,
  (n, k) =>
    k.length > 2 ? `${k[0]}, ${k[1]} ${k[2]} — ${n}` : `${k[0]} edition — ${n}`,
];

/** FNV-1a 32-bit hash — deterministic seeding helper, no Math.random. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Trim to the 255-char Shop limit at a word boundary when possible. */
function enforceLimit(title: string): string {
  if (title.length <= TITLE_LIMIT) return title;
  const cut = title.slice(0, TITLE_LIMIT);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > TITLE_LIMIT - 20) return cut.slice(0, lastSpace).trimEnd();
  return cut.trimEnd();
}

/**
 * Stuffing guard: counts case-insensitive substring occurrences of each
 * keyword in the title. Heuristic — a keyword that is a substring of another
 * keyword (e.g. "bottle" inside "water bottle") counts toward both.
 */
function hasStuffing(title: string, keywords: string[]): boolean {
  const lowered = title.toLowerCase();
  for (const kw of keywords) {
    const k = kw.toLowerCase();
    if (k.length === 0) continue;
    const count = lowered.split(k).length - 1;
    if (count > MAX_REPEATS) return true;
  }
  return false;
}

/** Split raw keyword text on commas/newlines, trim, dedupe (case-insensitive). */
function parseKeywords(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[\n,]+/)) {
    const kw = part.trim().replace(/\s+/g, " ");
    if (kw.length === 0) continue;
    const key = kw.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(kw);
  }
  return out;
}

function err(error: string): RunResult {
  return { ok: false, error };
}

export function runTool(values: Record<string, unknown>): RunResult {
  const rawName = values["productName"];
  if (typeof rawName !== "string" || rawName.trim().length === 0) {
    return err(
      'Please enter your product name — for example "insulated gym water bottle" — so titles can be built around it.',
    );
  }
  const productName = rawName.trim().replace(/\s+/g, " ");
  if (productName.length > MAX_NAME_LEN) {
    return err(
      `Product name must be ${MAX_NAME_LEN} characters or fewer — shorten it and try again.`,
    );
  }

  const rawKw = values["keywords"];
  if (typeof rawKw !== "string" || rawKw.trim().length === 0) {
    return err(
      'Add at least one keyword — comma-separated or one per line, for example "insulated bottle, gym bottle, 1L flask".',
    );
  }
  if (rawKw.length > MAX_RAW_KEYWORDS_LEN) {
    return err(
      `Keyword text must be ${MAX_RAW_KEYWORDS_LEN} characters or fewer — trim the list and try again.`,
    );
  }
  const parsed = parseKeywords(rawKw);
  if (parsed.length === 0) {
    return err(
      "No usable keywords found — add at least one keyword, comma-separated or one per line.",
    );
  }
  for (const kw of parsed) {
    if (kw.length > MAX_KEYWORD_LEN) {
      return err(
        `Each keyword must be ${MAX_KEYWORD_LEN} characters or fewer — shorten "${kw.slice(0, 40)}…" and try again.`,
      );
    }
  }
  const keywords = parsed.slice(0, MAX_KEYWORDS);

  // Deterministic rotation seed so runs are stable but not trivially ordered.
  const seed = hashString((productName + "|" + keywords.join(",")).toLowerCase());

  const titles: string[] = [];
  let i = 0;
  let guard = 0;
  while (titles.length < TITLE_COUNT && guard < 64) {
    const rot = keywords.map((_, j) => keywords[(seed + i + j) % keywords.length]);
    const raw = TITLE_PATTERNS[i % TITLE_PATTERNS.length](productName, rot);
    const title = enforceLimit(raw);
    if (
      title.length <= TITLE_LIMIT &&
      !hasStuffing(title, keywords) &&
      !titles.includes(title)
    ) {
      titles.push(title);
    }
    i++;
    guard++;
  }

  const nonEnglish = /[^\x00-\x7F]/.test(productName + " " + keywords.join(" "));

  let checksNote =
    `Done — ${titles.length} keyword-first title variants, each within TikTok Shop's ` +
    `${TITLE_LIMIT}-character product-name limit. Stuffing guard passed: no keyword repeats ` +
    `more than ${MAX_REPEATS} times in any title. These are rule-based templates, not AI copy — ` +
    `they organize your keywords, they cannot promise rankings or sales.`;
  if (nonEnglish) {
    checksNote +=
      " Heads-up: your text contains non-English characters. TikTok Shop seller guidance " +
      "(as documented for WooCommerce's TikTok sales channel) recommends English-only product " +
      "names for US/UK listings — review any non-English words before publishing.";
  }

  return { ok: true, values: { optimizedTitles: titles, checksNote } };
}
