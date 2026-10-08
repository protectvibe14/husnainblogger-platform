/**
 * Click-to-Tweet Box Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Turns the user's text into a "click to tweet" share box: an HTML snippet
 * with a link to the X (Twitter) intent endpoint, plus the intent URL itself.
 *
 * Honesty contract:
 * - The tool only FORMATS the user's own text into a share link and box.
 *   Nothing is written by AI; the words in the output are always exactly the
 *   words the user typed.
 * - The intent URL is percent-encoded with encodeURIComponent, so unicode and
 *   emoji survive intact.
 * - All user content placed in the HTML is HTML-escaped — user input can never
 *   inject raw HTML, scripts, or attributes into the box.
 * - Styling is intentionally minimal and inline so the snippet works in any
 *   blog theme; the box uses prefixed class names (hb-tweetbox-*).
 * - Deterministic: same inputs → same outputs, always.
 *
 * Input shape for runTool values:
 * - tweetText: required string, 1–280 chars (counted in Unicode code points)
 * - via: optional string, must start with "@" when provided
 * - url: optional string, must be a valid http(s) URL when provided
 *
 * Validation bounds (documented per the batch contract):
 * - tweetText: 1–280 chars after trimming
 * - via: "@handle" format
 * - url: http:// or https:// URL
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MAX_TWEET_CHARS = 280;
export const INTENT_BASE = "https://twitter.com/intent/tweet";

/** Escape user text so it can never become markup in the output. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Count Unicode code points so emoji count as one character. */
export function charCount(text: string): number {
  return [...text].length;
}

/**
 * Validate the optional via handle. Returns the trimmed handle or an error.
 */
export function validateVia(raw: unknown): { handle: string | null; error?: string } {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return { handle: null };
  }
  const handle = String(raw).trim();
  if (!handle.startsWith("@")) {
    return { handle: null, error: 'The "via" handle must start with @, e.g. @yourhandle.' };
  }
  if (handle.length < 2) {
    return { handle: null, error: 'The "via" handle needs a name after @.' };
  }
  return { handle };
}

/**
 * Validate the optional share URL. Returns the trimmed URL or an error.
 */
export function validateUrl(raw: unknown): { url: string | null; error?: string } {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return { url: null };
  }
  const url = String(raw).trim();
  if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(url)) {
    return { url: null, error: "The share URL must be a valid URL starting with http:// or https://." };
  }
  return { url };
}

/**
 * Build the X intent URL from validated parts.
 * The via handle is sent without the leading @ (per intent endpoint convention).
 */
export function buildIntentUrl(
  tweetText: string,
  via: string | null,
  url: string | null
): string {
  let intent = `${INTENT_BASE}?text=${encodeURIComponent(tweetText)}`;
  if (via !== null) intent += `&via=${encodeURIComponent(via.slice(1))}`;
  if (url !== null) intent += `&url=${encodeURIComponent(url)}`;
  return intent;
}

/**
 * Core builder: assemble the box HTML from validated parts.
 * The href is the percent-encoded intent URL; visible text is escaped.
 */
export function buildTweetBox(
  tweetText: string,
  via: string | null,
  intentUrl: string
): string {
  const viaLine =
    via === null
      ? ""
      : `  <p class="hb-tweetbox-via" style="margin:8px 0 0;font-size:13px;color:#555;">via ${escapeHtml(via)}</p>\n`;

  return (
    `<div class="hb-tweetbox" style="border:1px solid #e2e2e2;border-left:4px solid #1d9bf0;border-radius:8px;padding:18px;margin:1.5em 0;background:#f8fcff;">\n` +
    `  <p class="hb-tweetbox-text" style="margin:0 0 12px;font-size:17px;line-height:1.6;">“${escapeHtml(tweetText)}”</p>\n` +
    `  <a class="hb-tweetbox-btn" href="${intentUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1d9bf0;color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px;">Click to Tweet</a>\n` +
    viaLine +
    `</div>`
  );
}

/**
 * Tool-logic slot: validate input, build the box + intent URL, return values.
 * Values keys: boxHtml, intentUrl (match meta.ts output ids).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Type the text you want readers to tweet first." };
  }

  const rawText = values["tweetText"];
  if (typeof rawText !== "string" || rawText.trim() === "") {
    return { ok: false, error: "Tweet text is required (1–280 characters)." };
  }
  const tweetText = rawText.trim();
  if (charCount(tweetText) > MAX_TWEET_CHARS) {
    return {
      ok: false,
      error: `Tweet text is ${charCount(tweetText)} characters — the limit is ${MAX_TWEET_CHARS}. Shorten it and try again.`,
    };
  }

  const viaResult = validateVia(values["via"]);
  if (viaResult.error) return { ok: false, error: viaResult.error };

  const urlResult = validateUrl(values["url"]);
  if (urlResult.error) return { ok: false, error: urlResult.error };

  const intentUrl = buildIntentUrl(tweetText, viaResult.handle, urlResult.url);
  const boxHtml = buildTweetBox(tweetText, viaResult.handle, intentUrl);
  return { ok: true, values: { boxHtml, intentUrl } };
}
