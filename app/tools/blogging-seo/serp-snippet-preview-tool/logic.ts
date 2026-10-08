/**
 * SERP Snippet Preview Tool — pure logic (zero imports, zero network, zero DOM).
 *
 * HONESTY CONTRACT (see spec honestyNote): this renders a STATIC mockup of a
 * Google search result — it is NOT live SERP data and does not query Google.
 * The pixel-width estimate approximates how Google renders titles (~600 px
 * cutoff) using a fixed per-character width table; it is an estimate, not a
 * guarantee of how Google will display or rewrite the title.
 *
 * Fixed content banks: none (no word banks — output is a markup template
 * filled with the user's own escaped inputs).
 * Fixed rules:
 *   - CHAR_WIDTHS: per-character pixel widths for 95 printable ASCII chars
 *     (approximation of Google SERP title font metrics).
 *   - Unknown BMP chars default to 10 px; emoji (incl. surrogate pairs and
 *     emoji ranges) count 24 px; variation selectors count 0 px.
 *   - TITLE_TRUNCATE_PX = 600: the widely published Google desktop title
 *     truncation cutoff (an estimate — Google varies by device/query).
 */

export const TITLE_MAX_CHARS = 200;
export const DESCRIPTION_MAX_CHARS = 500;
export const DATE_MAX_CHARS = 60;
/** Published Google desktop title truncation estimate, in pixels. */
export const TITLE_TRUNCATE_PX = 600;
export const BREADCRUMB_MAX_CHARS = 64;

/** Approximate per-character pixel widths (Google SERP title font). */
const CHAR_WIDTHS: Record<string, number> = {
  " ": 5, "!": 6, '"': 8, "#": 11, "$": 10, "%": 14, "&": 12, "'": 5,
  "(": 7, ")": 7, "*": 8, "+": 11, ",": 6, "-": 7, ".": 6, "/": 6,
  "0": 10, "1": 10, "2": 10, "3": 10, "4": 10, "5": 10, "6": 10, "7": 10,
  "8": 10, "9": 10, ":": 6, ";": 6, "<": 11, "=": 11, ">": 11, "?": 10,
  "@": 17, "A": 12, "B": 11, "C": 12, "D": 12, "E": 11, "F": 10, "G": 13,
  "H": 12, "I": 5, "J": 8, "K": 11, "L": 10, "M": 15, "N": 12, "O": 13,
  "P": 11, "Q": 13, "R": 12, "S": 11, "T": 11, "U": 12, "V": 11, "W": 15,
  "X": 11, "Y": 10, "Z": 10, "[": 6, "]": 6, "^": 10, "_": 10, "`": 7,
  "a": 10, "b": 10, "c": 9, "d": 10, "e": 10, "f": 6, "g": 10, "h": 10,
  "i": 4, "j": 5, "k": 9, "l": 4, "m": 15, "n": 10, "o": 10, "p": 10,
  "q": 10, "r": 7, "s": 9, "t": 6, "u": 10, "v": 9, "w": 14, "x": 9,
  "y": 9, "z": 9, "{": 8, "|": 6, "}": 8, "~": 11,
};
export const DEFAULT_CHAR_WIDTH = 10;
export const EMOJI_CHAR_WIDTH = 24;

const URL_RE = /^(https?:\/\/)([^/\s?#]+)([^\s]*)$/i;

function charWidth(ch: string): number {
  const w = CHAR_WIDTHS[ch];
  if (w !== undefined) return w;
  const code = ch.codePointAt(0) ?? 0;
  if (code >= 0xfe00 && code <= 0xfe0f) return 0; // variation selectors
  if (code > 0xffff) return EMOJI_CHAR_WIDTH; // surrogate-pair emoji
  if (
    (code >= 0x1f300 && code <= 0x1faff) ||
    (code >= 0x2600 && code <= 0x27bf) ||
    (code >= 0x2b00 && code <= 0x2bff) ||
    (code >= 0x2190 && code <= 0x21ff)
  ) {
    return EMOJI_CHAR_WIDTH;
  }
  return DEFAULT_CHAR_WIDTH;
}

/** Estimated rendered pixel width of a title string. */
export function estimateTitleWidthPx(title: string): number {
  let total = 0;
  for (const ch of title) total += charWidth(ch);
  return Math.round(total);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** "https://example.com/a/very/long/path" -> "example.com › a › very › long › path" */
function breadcrumbDisplay(url: string): { host: string; trail: string } {
  const m = URL_RE.exec(url.trim());
  const host = m ? m[2] : url.trim();
  const path = m ? m[3] : "";
  const segments = path.split(/[?#]/)[0].split("/").filter((s) => s.length > 0);
  let trail = [host, ...segments].join(" › ");
  if (trail.length > BREADCRUMB_MAX_CHARS) {
    // Keep the host and the last segment; middle-truncate (spec: very long URL).
    const last = segments.length > 0 ? segments[segments.length - 1] : "";
    const head = `${host} › … › `;
    const keep = Math.max(0, BREADCRUMB_MAX_CHARS - head.length - 1);
    trail = head + (last.length > keep ? last.slice(0, keep) + "…" : last);
    if (trail.length > BREADCRUMB_MAX_CHARS) trail = trail.slice(0, BREADCRUMB_MAX_CHARS - 1) + "…";
  }
  return { host, trail };
}

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

/**
 * Tool logic slot. values: { title, url, description?, date? }.
 * Returns { previewHtml, titleWidthPxEstimate, truncationWarning }.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please provide your inputs first." };
  }

  const titleRaw = asString(values["title"]);
  const title = titleRaw === null ? "" : titleRaw.trim();
  if (title.length === 0) {
    return { ok: false, error: "Enter a page title (1–200 characters)." };
  }
  if (title.length > TITLE_MAX_CHARS) {
    return {
      ok: false,
      error: `Page title must be ${TITLE_MAX_CHARS} characters or fewer (yours is ${title.length}).`,
    };
  }

  const urlRaw = asString(values["url"]);
  const url = urlRaw === null ? "" : urlRaw.trim();
  if (url.length === 0) {
    return { ok: false, error: "Enter the page URL." };
  }
  if (!URL_RE.test(url)) {
    return {
      ok: false,
      error: "Enter a valid URL starting with http:// or https://.",
    };
  }

  const descRaw = asString(values["description"]);
  const description = descRaw === null ? "" : descRaw.trim();
  if (description.length > DESCRIPTION_MAX_CHARS) {
    return {
      ok: false,
      error: `Meta description must be ${DESCRIPTION_MAX_CHARS} characters or fewer (yours is ${description.length}).`,
    };
  }

  const dateRaw = asString(values["date"]);
  const date = dateRaw === null ? "" : dateRaw.trim();
  if (date.length > DATE_MAX_CHARS) {
    return {
      ok: false,
      error: `Date must be ${DATE_MAX_CHARS} characters or fewer.`,
    };
  }

  const widthPx = estimateTitleWidthPx(title);
  const truncated = widthPx > TITLE_TRUNCATE_PX;

  const { host, trail } = breadcrumbDisplay(url);
  const faviconLetter = escapeHtml(host.charAt(0).toUpperCase() || "•");
  const descHtml =
    description.length > 0
      ? escapeHtml(description)
      : '<span style="color:#80868b;font-style:italic">[No meta description entered — Google will pick text from your page.]</span>';
  const dateHtml = date.length > 0 ? `<span style="color:#5f6368">${escapeHtml(date)}</span> — ` : "";

  const previewHtml =
    `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;line-height:1.4">` +
    `<div style="display:flex;align-items:center;gap:10px">` +
    `<div style="width:28px;height:28px;border-radius:50%;background:#e8eaed;color:#5f6368;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:bold;flex-shrink:0">${faviconLetter}</div>` +
    `<div style="min-width:0">` +
    `<div style="font-size:14px;color:#202124;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(host)}</div>` +
    `<div style="font-size:12px;color:#5f6368;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(trail)}</div>` +
    `</div></div>` +
    `<div style="font-size:20px;color:#1a0dab;margin:6px 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(title)}</div>` +
    `<div style="font-size:14px;color:#4d5156">${dateHtml}${descHtml}</div>` +
    `<div style="font-size:11px;color:#80868b;margin-top:8px">Static mockup — not live Google data. Widths are estimates.</div>` +
    `</div>`;

  const truncationWarning = truncated
    ? `Yes — the title is about ${widthPx} px wide, over the ~${TITLE_TRUNCATE_PX} px Google desktop cutoff, so it will likely be cut off with "…". Shorten it or move keywords earlier.`
    : `No — the title is about ${widthPx} px wide, within the ~${TITLE_TRUNCATE_PX} px Google desktop cutoff.`;

  return {
    ok: true,
    values: {
      previewHtml,
      titleWidthPxEstimate: widthPx,
      truncationWarning,
    },
  };
}
