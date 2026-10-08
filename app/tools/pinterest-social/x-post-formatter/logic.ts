/**
 * X Post Formatter — pure logic (tool-373). Zero imports, zero network,
 * zero DOM, no randomness.
 *
 * Pure deterministic text transforms:
 *   1. Line-break cleanup — trims trailing whitespace per line, collapses
 *      3+ consecutive blank lines into one blank line, strips leading and
 *      trailing blank lines.
 *   2. Whitespace normalization — tabs become spaces; runs of 2+ spaces
 *      become a single space.
 *   3. Budget meter — conservative X-style weighted count of the formatted
 *      text: URLs count 23 (documented t.co behavior), non-ASCII code
 *      points count 2, everything else counts 1, against a 280 budget.
 *      Over-budget text is FLAGGED (overBy), never silently cut.
 *   4. Bonus: a Unicode bold-style variant of the formatted text
 *      (mathematical alphanumeric symbols), which X renders as bold text.
 *
 * No platform endorsement is claimed; limits are the documented
 * conservative values, labeled as approximations in the UI copy.
 *
 * Deterministic: same input -> same outputs.
 */

export const POST_LIMIT = 280;
export const MAX_INPUT_CHARS = 10000;

export interface PostFormatterResult {
  ok: boolean;
  values?: {
    formattedText: string;
    boldText: string;
    weightedCount: number;
    remaining: number;
    overBy: number;
    changeNote: string;
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

/**
 * Apply the cleanup transforms. Returns the cleaned text plus a tally of
 * what changed, so the note can be specific and honest.
 */
export function cleanText(text: string): {
  cleaned: string;
  trailingSpaces: number;
  extraBlankLines: number;
  collapsedSpaces: number;
} {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");

  let trailingSpaces = 0;
  const trimmedLines = lines.map((line) => {
    const t = line.replace(/[ \t]+$/, "");
    if (t.length !== line.length) trailingSpaces++;
    return t.replace(/\t/g, " ");
  });

  let collapsedSpaces = 0;
  const spaced = trimmedLines.map((line) => {
    const before = line.length;
    const after = line.replace(/ {2,}/g, " ");
    collapsedSpaces += before - after.length;
    return after;
  });

  // Collapse 3+ consecutive blank lines into a single blank line.
  let extraBlankLines = 0;
  const collapsed: string[] = [];
  let blankRun = 0;
  for (const line of spaced) {
    if (line === "") {
      blankRun++;
      if (blankRun <= 1) collapsed.push(line);
      else extraBlankLines++;
    } else {
      blankRun = 0;
      collapsed.push(line);
    }
  }

  // Strip leading and trailing blank lines.
  let start = 0;
  while (start < collapsed.length && collapsed[start] === "") {
    start++;
    extraBlankLines++;
  }
  let end = collapsed.length;
  while (end > start && collapsed[end - 1] === "") {
    end--;
    extraBlankLines++;
  }

  return { cleaned: collapsed.slice(start, end).join("\n"), trailingSpaces, extraBlankLines, collapsedSpaces };
}

/**
 * Unicode "bold" styling via mathematical alphanumeric symbols.
 * A-Z -> U+1D400..U+1D419, a-z -> U+1D41A..U+1D433, 0-9 -> U+1D7CE..U+1D7D7.
 * Everything else passes through unchanged.
 */
export function toBoldUnicode(text: string): string {
  let out = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0) as number;
    if (cp >= 65 && cp <= 90) out += String.fromCodePoint(0x1d400 + (cp - 65));
    else if (cp >= 97 && cp <= 122) out += String.fromCodePoint(0x1d41a + (cp - 97));
    else if (cp >= 48 && cp <= 57) out += String.fromCodePoint(0x1d7ce + (cp - 48));
    else out += ch;
  }
  return out;
}

export function runTool(values: Record<string, unknown>): PostFormatterResult {
  const raw = values["text"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { ok: false, error: "Please paste the post text you want to format." };
  }
  if (raw.length > MAX_INPUT_CHARS) {
    return {
      ok: false,
      error: `Text is too long (${raw.length} characters). Keep it under ${MAX_INPUT_CHARS} characters.`,
    };
  }

  const { cleaned, trailingSpaces, extraBlankLines, collapsedSpaces } = cleanText(raw);

  const changes: string[] = [];
  if (trailingSpaces > 0) changes.push(`trimmed trailing spaces on ${trailingSpaces} line${trailingSpaces === 1 ? "" : "s"}`);
  if (collapsedSpaces > 0) changes.push(`collapsed ${collapsedSpaces} extra space${collapsedSpaces === 1 ? "" : "s"}`);
  if (extraBlankLines > 0) changes.push(`removed ${extraBlankLines} extra blank line${extraBlankLines === 1 ? "" : "s"}`);

  const changeNote =
    changes.length === 0
      ? "No changes needed — your text was already clean."
      : "Cleaned up: " + changes.join(", ") + ".";

  const weighted = weightedLength(cleaned);
  const remaining = weighted <= POST_LIMIT ? POST_LIMIT - weighted : 0;
  const overBy = weighted > POST_LIMIT ? weighted - POST_LIMIT : 0;

  return {
    ok: true,
    values: {
      formattedText: cleaned,
      boldText: toBoldUnicode(cleaned),
      weightedCount: weighted,
      remaining,
      overBy,
      changeNote,
    },
  };
}
