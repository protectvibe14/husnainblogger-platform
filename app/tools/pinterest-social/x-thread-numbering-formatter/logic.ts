/**
 * X Thread Numbering Formatter — pure logic (tool-374). Zero imports, zero
 * network, zero DOM, no randomness.
 *
 * Deterministic numbering: takes a list of tweets (one per line), strips
 * any existing "1/N"-style markers first (so re-runs never double-number),
 * then applies fresh "1/N" (e.g. "1/8") or "(1/N)" (e.g. "(1/8)") markers
 * at the start or end of each tweet.
 *
 * After marker insertion every tweet is re-validated against the
 * conservative X-style weighted budget (280; URLs count 23, non-ASCII
 * code points count 2, everything else counts 1). A tweet that overflows
 * after numbering is FLAGGED for manual trimming — never auto-cut.
 *
 * Deterministic: same inputs -> same outputs.
 */

export const POST_LIMIT = 280;
export const MAX_TWEETS = 25;
export const MAX_INPUT_CHARS = 20000;

export type NumberingStyle = "1/8" | "(1/8)";
export const NUMBERING_STYLES: NumberingStyle[] = ["1/8", "(1/8)"];
export type MarkerPlacement = "end" | "start";
export const MARKER_PLACEMENTS: MarkerPlacement[] = ["end", "start"];

export interface NumberingFormatterResult {
  ok: boolean;
  values?: {
    numberedTweets: string[];
    flagged: string[];
    note: string;
  };
  error?: string;
}

const URL_RE = /https?:\/\/[^\s]+/g;

/** Conservative weighted character count: URLs -> 23, non-ASCII -> 2, else 1. */
export function weightedLength(text: string): number {
  const replaced = text.replace(URL_RE, "x".repeat(23));
  let n = 0;
  for (const ch of replaced) {
    n += (ch.codePointAt(0) as number) > 127 ? 2 : 1;
  }
  return n;
}

// Existing numbering markers we strip before re-numbering:
// leading/trailing "1/8", "(1/8)", "1 / 8", optional 🧵 or "•" decorations.
const LEADING_MARKER_RE = /^(?:🧵\s*)?\(?\d+\s*\/\s*\d+\)?[•\s]*/u;
const TRAILING_MARKER_RE = /[•\s]*\(?\d+\s*\/\s*\d+\)?(?:\s*🧵)?$/u;

/** Remove an existing 1/N-style marker from a tweet. Returns text + whether stripped. */
export function stripMarker(tweet: string): { text: string; stripped: boolean } {
  let t = tweet;
  let stripped = false;
  if (LEADING_MARKER_RE.test(t)) {
    t = t.replace(LEADING_MARKER_RE, "");
    stripped = true;
  }
  if (TRAILING_MARKER_RE.test(t)) {
    t = t.replace(TRAILING_MARKER_RE, "");
    stripped = true;
  }
  return { text: t.trim(), stripped };
}

function buildMarker(style: NumberingStyle, i: number, n: number): string {
  const core = `${i}/${n}`;
  return style === "(1/8)" ? `(${core})` : core;
}

/** Normalize the tweets input: string[] as-is, or a textarea string split per line. */
export function toTweetList(raw: unknown): { tweets: string[]; skippedBlanks: number } {
  const lines: string[] =
    typeof raw === "string" ? raw.replace(/\r\n?/g, "\n").split("\n") : Array.isArray(raw) ? raw.map(String) : [];
  const tweets: string[] = [];
  let skippedBlanks = 0;
  for (const line of lines) {
    const t = line.trim();
    if (t === "") skippedBlanks++;
    else tweets.push(t);
  }
  return { tweets, skippedBlanks };
}

export function runTool(values: Record<string, unknown>): NumberingFormatterResult {
  const raw = values["tweets"];
  if (raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "") || (Array.isArray(raw) && raw.length === 0)) {
    return { ok: false, error: "Please paste your tweets, one per line." };
  }
  const rawJoined = typeof raw === "string" ? raw : Array.isArray(raw) ? raw.join("\n") : "";
  if (rawJoined.length > MAX_INPUT_CHARS) {
    return {
      ok: false,
      error: `Input is too long (${rawJoined.length} characters). Keep it under ${MAX_INPUT_CHARS} characters.`,
    };
  }

  const { tweets, skippedBlanks } = toTweetList(raw);
  if (tweets.length === 0) {
    return { ok: false, error: "Please paste your tweets, one per line." };
  }
  if (tweets.length > MAX_TWEETS) {
    return {
      ok: false,
      error: `A thread can have at most ${MAX_TWEETS} numbered tweets — you pasted ${tweets.length}.`,
    };
  }

  // numberingStyle: optional select, default "1/8".
  let style: NumberingStyle = "1/8";
  const styleRaw = values["numberingStyle"];
  if (typeof styleRaw === "string" && styleRaw.trim() !== "") {
    const s = styleRaw.trim();
    if (s !== "1/8" && s !== "(1/8)") {
      return { ok: false, error: 'Numbering style must be "1/8" or "(1/8)".' };
    }
    style = s;
  }

  // placement: optional select, default "end".
  let placement: MarkerPlacement = "end";
  const placementRaw = values["placement"];
  if (typeof placementRaw === "string" && placementRaw.trim() !== "") {
    const p = placementRaw.trim().toLowerCase();
    if (p !== "end" && p !== "start") {
      return { ok: false, error: 'Placement must be "end" or "start".' };
    }
    placement = p;
  }

  const n = tweets.length;
  const numberedTweets: string[] = [];
  const flagged: string[] = [];
  let strippedCount = 0;

  for (let i = 0; i < n; i++) {
    const { text, stripped } = stripMarker(tweets[i]);
    if (stripped) strippedCount++;
    const marker = buildMarker(style, i + 1, n);
    const numbered = placement === "end" ? `${text} ${marker}` : `${marker} ${text}`;
    numberedTweets.push(numbered);
    if (weightedLength(numbered) > POST_LIMIT) {
      flagged.push(
        `Post ${i + 1} is ${weightedLength(numbered) - POST_LIMIT} weighted character${weightedLength(numbered) - POST_LIMIT === 1 ? "" : "s"} over the ${POST_LIMIT} budget after numbering — trim it manually.`,
      );
    }
  }

  const notes: string[] = [];
  notes.push(`Numbered ${n} tweet${n === 1 ? "" : "s"} as "${buildMarker(style, 1, n)}" … "${buildMarker(style, n, n)}" at the ${placement}.`);
  if (strippedCount > 0) {
    notes.push(`Removed old numbering from ${strippedCount} tweet${strippedCount === 1 ? "" : "s"} before re-numbering.`);
  }
  if (skippedBlanks > 0) {
    notes.push(`Skipped ${skippedBlanks} blank line${skippedBlanks === 1 ? "" : "s"}.`);
  }
  if (flagged.length > 0) {
    notes.push(`${flagged.length} tweet${flagged.length === 1 ? "" : "s"} overflow${flagged.length === 1 ? "s" : ""} the budget — flagged above, not cut.`);
  }

  return { ok: true, values: { numberedTweets, flagged, note: notes.join(" ") } };
}
