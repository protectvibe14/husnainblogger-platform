/**
 * X Thread Splitter — pure logic (tool-372). Zero imports, zero network,
 * zero DOM, no randomness.
 *
 * Deterministic text splitting: takes a long text and splits it into
 * posts of <= M weighted characters (default 280, configurable 50–280)
 * on sentence/word boundaries — never mid-word.
 *
 * Numbering: style "1/N" (e.g. "1/3") or "(1/N)" (e.g. "(1/3)") is
 * appended to each post; the marker's character budget is reserved BEFORE
 * splitting (reserveChars, default 8), then every chunk is re-validated
 * against the budget after the marker is added. Style "none" adds no marker.
 *
 * Conservative X-style weighted count: URLs count 23 (documented t.co
 * behavior); non-ASCII code points count 2 (CJK etc.); everything else 1.
 * Very long unbreakable tokens (URLs) are kept whole and counted as 23.
 *
 * Deterministic: same inputs -> same outputs.
 */

export const DEFAULT_MAX_CHARS = 280;
export const MIN_MAX_CHARS = 50;
export const MAX_MAX_CHARS = 280;
export const DEFAULT_RESERVE = 8;
export const MIN_RESERVE = 0;
export const MAX_RESERVE = 40;
export const MAX_INPUT_CHARS = 20000;

export type NumberingStyle = "1/N" | "(1/N)" | "none";
export const NUMBERING_STYLES: NumberingStyle[] = ["1/N", "(1/N)", "none"];

export interface ThreadSplitterResult {
  ok: boolean;
  values?: {
    tweets: string[];
    summary: string;
  };
  error?: string;
}

const URL_RE = /https?:\/\/[^\s]+/g;

/**
 * URL protection: URLs are replaced with a 23-ASCII-char placeholder
 * ("\u0000" + "U"*21 + "\u0000") BEFORE sentence/word splitting, so
 * sentence splitting on "." never breaks a URL. The placeholder counts
 * exactly 23 weighted chars — the same as a URL — so budget math stays
 * exact. Placeholders are restored after chunking.
 */
const URL_PLACEHOLDER = "\u0000" + "U".repeat(21) + "\u0000";
const URL_PLACEHOLDER_RE = /\u0000U{21}\u0000/g;

function protectUrls(text: string): { text: string; urls: string[] } {
  const urls: string[] = [];
  const protectedText = text.replace(URL_RE, (m) => {
    urls.push(m);
    return URL_PLACEHOLDER;
  });
  return { text: protectedText, urls };
}

function restoreUrls(text: string, urls: string[]): string {
  let i = 0;
  return text.replace(URL_PLACEHOLDER_RE, () => urls[i++] ?? "");
}

function isUrlPlaceholder(word: string): boolean {
  return word.length === 23 && word.charCodeAt(0) === 0 && word.charCodeAt(22) === 0;
}

/** Conservative weighted character count: URLs -> 23, non-ASCII -> 2, else 1. */
export function weightedLength(text: string): number {
  const replaced = text.replace(URL_RE, "x".repeat(23));
  let n = 0;
  for (const ch of replaced) {
    n += (ch.codePointAt(0) as number) > 127 ? 2 : 1;
  }
  return n;
}

/** Number of posts digits need room for: marker length grows with N. */
function markerFor(style: NumberingStyle, i: number, n: number): string {
  if (style === "none") return "";
  const core = `${i}/${n}`;
  return style === "(1/N)" ? `(${core})` : core;
}

/**
 * Split a single over-budget unit (word) into pieces of <= budget weighted
 * chars on code-point boundaries. Used for unbreakable tokens (e.g. long
 * URLs already counted as 23, so this fires mainly for pathological tokens
 * or dense CJK runs). Never mid-surrogate-pair.
 */
function hardSplit(token: string, budget: number): string[] {
  const pieces: string[] = [];
  let current = "";
  let currentW = 0;
  for (const ch of token) {
    const w = (ch.codePointAt(0) as number) > 127 ? 2 : 1;
    if (currentW + w > budget && current !== "") {
      pieces.push(current);
      current = "";
      currentW = 0;
    }
    current += ch;
    currentW += w;
  }
  if (current !== "") pieces.push(current);
  return pieces;
}

/** Split text into sentence units, keeping punctuation attached. */
export function sentences(text: string): string[] {
  const matches = text.match(/[^.!?…]+[.!?…]+["')\]]*\s*|[^.!?…]+$/g);
  if (!matches) return [text];
  return matches.map((s) => s.trim()).filter((s) => s.length > 0);
}

/**
 * Greedy pack units into chunks of <= budget weighted chars, breaking
 * sentences on word boundaries when needed. Never splits mid-word.
 */
function pack(units: string[], budget: number): string[] {
  const chunks: string[] = [];
  let current = "";
  let currentW = 0;

  const pushUnit = (unit: string): void => {
    const words = unit.split(/\s+/).filter(Boolean);
    for (const word of words) {
      const wordW = weightedLength(word);
      if (isUrlPlaceholder(word)) {
        // URLs are kept whole at 23 weighted chars, even if the budget is tighter.
        if (current !== "") {
          chunks.push(current);
          current = "";
          currentW = 0;
        }
        chunks.push(word);
        continue;
      }
      if (wordW > budget) {
        // Unbreakable-ish token: flush current, then hard-split the token.
        if (current !== "") {
          chunks.push(current);
          current = "";
          currentW = 0;
        }
        const pieces = hardSplit(word, budget);
        for (const p of pieces) chunks.push(p);
        continue;
      }
      const addW = (current === "" ? 0 : 1) + wordW;
      if (currentW + addW > budget) {
        chunks.push(current);
        current = word;
        currentW = wordW;
      } else {
        current = current === "" ? word : current + " " + word;
        currentW += addW;
      }
    }
  };

  for (const unit of units) {
    const unitW = weightedLength(unit);
    if (unitW <= budget) {
      const addW = (current === "" ? 0 : 1) + unitW;
      if (currentW + addW <= budget) {
        current = current === "" ? unit : current + " " + unit;
        currentW += addW;
        continue;
      }
      chunks.push(current);
      current = unit;
      currentW = unitW;
    } else {
      // Sentence too long: flush current, then pack its words.
      if (current !== "") {
        chunks.push(current);
        current = "";
        currentW = 0;
      }
      pushUnit(unit);
    }
  }
  if (current !== "") chunks.push(current);
  return chunks;
}

/**
 * Split text into chunks, iterating until the numbering marker length is
 * stable (a longer budget can mean fewer posts; a bigger N needs a longer
 * marker, which can mean more posts). Bounded to 4 iterations.
 */
function stableSplit(
  text: string,
  style: NumberingStyle,
  reserve: number,
  maxChars: number,
): { chunks: string[]; urls: string[] } {
  const { text: safe, urls } = protectUrls(text);
  const split = (t: string, budget: number): string[] => pack(sentences(t), Math.max(20, budget));
  let budget = maxChars - reserve - 1;
  let chunks: string[] = [];
  for (let iter = 0; iter < 4; iter++) {
    chunks = split(safe, budget);
    const n = chunks.length;
    const longestMarker = markerFor(style, n, n).length;
    const needed = style === "none" ? 0 : longestMarker + 1;
    if (needed <= budget - 20 || style === "none") break;
    budget = maxChars - Math.max(reserve, needed) - 1;
  }
  // Final pass with the exact marker budget.
  const n = chunks.length;
  const longestMarker = markerFor(style, n, n).length;
  const exactBudget = maxChars - (style === "none" ? 0 : longestMarker + 1);
  const finalChunks = split(safe, exactBudget);
  // If N changed again, accept and re-run once more to stay exact.
  if (finalChunks.length !== n) {
    const n2 = finalChunks.length;
    const m2 = markerFor(style, n2, n2).length;
    return { chunks: split(safe, maxChars - (style === "none" ? 0 : m2 + 1)), urls };
  }
  return { chunks: finalChunks, urls };
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function parseBoundedInt(
  v: unknown,
  def: number,
  min: number,
  max: number,
  label: string,
): { ok: true; value: number } | { ok: false; error: string } {
  if (v === undefined || v === null || String(v).trim() === "") return { ok: true, value: def };
  const n = Number(v);
  if (!Number.isInteger(n)) return { ok: false, error: `${label} must be a whole number.` };
  if (n < min || n > max) {
    return { ok: false, error: `${label} must be between ${min} and ${max}.` };
  }
  return { ok: true, value: n };
}

export function runTool(values: Record<string, unknown>): ThreadSplitterResult {
  const textRaw = values["longText"];
  if (!isNonEmptyString(textRaw)) {
    return { ok: false, error: "Please paste the text you want to split into posts." };
  }
  const text = textRaw.trim().replace(/\r\n?/g, "\n").replace(/\n{2,}/g, " ").replace(/\n/g, " ");
  if (text.length > MAX_INPUT_CHARS) {
    return {
      ok: false,
      error: `Text is too long (${text.length} characters). Keep it under ${MAX_INPUT_CHARS} characters.`,
    };
  }

  // numberingStyle: optional enum, default "1/N".
  let style: NumberingStyle = "1/N";
  const styleRaw = values["numberingStyle"];
  if (typeof styleRaw === "string" && styleRaw.trim() !== "") {
    const s = styleRaw.trim();
    if (s !== "1/N" && s !== "(1/N)" && s !== "none") {
      return { ok: false, error: 'Numbering style must be "1/N", "(1/N)" or "none".' };
    }
    style = s;
  }

  const reserve = parseBoundedInt(values["reserveChars"], DEFAULT_RESERVE, MIN_RESERVE, MAX_RESERVE, "Reserved characters");
  if (!reserve.ok) return { ok: false, error: reserve.error };
  const maxChars = parseBoundedInt(values["maxChars"], DEFAULT_MAX_CHARS, MIN_MAX_CHARS, MAX_MAX_CHARS, "Max characters per post");
  if (!maxChars.ok) return { ok: false, error: maxChars.error };

  const minBudget = maxChars.value - reserve.value - 1;
  if (minBudget < 20) {
    return {
      ok: false,
      error: `Reserved characters (${reserve.value}) leave too little room — increase the per-post limit or lower the reserve.`,
    };
  }

  const { chunks, urls } = stableSplit(text, style, reserve.value, maxChars.value);
  const n = chunks.length;

  // Attach markers and re-validate every chunk against the budget.
  const tweets: string[] = [];
  for (let i = 0; i < n; i++) {
    const restored = restoreUrls(chunks[i], urls);
    const marker = markerFor(style, i + 1, n);
    const tweet = marker === "" ? restored : `${restored} ${marker}`;
    if (weightedLength(tweet) > maxChars.value) {
      // Should not happen after stable splitting; report honestly instead of cutting.
      return {
        ok: false,
        error: `Internal error: post ${i + 1} exceeds the budget after numbering. Try a larger reserve or limit.`,
      };
    }
    tweets.push(tweet);
  }

  const cjkNote = /[^\x00-\x7F]/.test(text)
    ? " Non-ASCII characters (e.g. CJK) are counted as 2 characters each."
    : "";
  const styleNote =
    style === "none"
      ? "No numbering was added."
      : `Numbering style "${style}" is included in each post's budget.`;
  const summary =
    `Split into ${n} post${n === 1 ? "" : "s"} — each within ${maxChars.value} weighted characters (URLs counted as 23). ` +
    styleNote +
    cjkNote;

  return { ok: true, values: { tweets, summary } };
}
