/**
 * Star Rating Box Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Turns a 0–5 rating (fractional supported) into a clean star-rating HTML box
 * snippet plus a matching CSS block. Fractional ratings render via a clipped
 * foreground star row — no half-star images or fonts needed.
 *
 * Honesty contract:
 * - The tool only FORMATS the rating, title, and review count the user
 *   provides. Nothing is written by AI; it does not verify or source the
 *   rating — the stars reflect the number you type.
 * - All user content is HTML-escaped — user input can never inject raw HTML,
 *   scripts, or attributes into the output.
 * - Styling is intentionally minimal and inline so the snippet works in any
 *   blog theme; the separate CSS block uses prefixed class names
 *   (hb-starrating-*) that are safe to customize or drop.
 * - Deterministic: same inputs → same outputs, always.
 *
 * Input shape for runTool values:
 * - rating: required number, 0–5 (fractional allowed)
 * - title: optional string, max 100 chars
 * - reviewCount: optional number >= 0 (integer)
 *
 * Validation bounds (documented per the batch contract):
 * - rating: required, 0–5 inclusive
 * - title: max 100 chars
 * - reviewCount: integer >= 0 when provided
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MIN_RATING = 0;
export const MAX_RATING = 5;
export const MAX_TITLE_CHARS = 100;

/** Escape user text so it can never become markup in the output. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Coerce a raw value to a finite number, or null when not numeric. */
export function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/** Foreground star-row width as a percentage (0–100), rounded to 1 decimal. */
export function starFillPercent(rating: number): number {
  const pct = (rating / MAX_RATING) * 100;
  return Math.round((pct + Number.EPSILON) * 10) / 10;
}

/** Display text for the rating, e.g. "4.5". */
export function formatRating(rating: number): string {
  return (Math.round((rating + Number.EPSILON) * 10) / 10).toFixed(1);
}

/**
 * Core builder: assemble the star-rating box HTML + CSS from validated parts.
 * All content is escaped here, so callers only need structural validation.
 */
export function buildStarRatingBox(
  rating: number,
  title: string | null,
  reviewCount: number | null
): { boxHtml: string; boxCss: string } {
  const pct = starFillPercent(rating);
  const ratingText = formatRating(rating);
  const reviewLine =
    reviewCount === null
      ? `${ratingText} out of ${MAX_RATING}`
      : `${ratingText} out of ${MAX_RATING} · ${reviewCount} review${reviewCount === 1 ? "" : "s"}`;

  const titleHtml =
    title === null
      ? ""
      : `  <h4 class="hb-starrating-title" style="margin:0 0 8px;font-size:18px;">${escapeHtml(title)}</h4>\n`;

  const boxHtml =
    `<div class="hb-starrating" style="border:1px solid #e2e2e2;border-radius:10px;padding:18px;margin:1.5em 0;">\n` +
    titleHtml +
    `  <div class="hb-starrating-stars" style="position:relative;display:inline-block;font-size:30px;line-height:1;letter-spacing:2px;" role="img" aria-label="Rated ${ratingText} out of ${MAX_RATING} stars">\n` +
    `    <span class="hb-starrating-bg" style="color:#d8d8d8;">★★★★★</span>\n` +
    `    <span class="hb-starrating-fill" style="position:absolute;left:0;top:0;width:${pct}%;overflow:hidden;white-space:nowrap;color:#f5a623;">★★★★★</span>\n` +
    `  </div>\n` +
    `  <p class="hb-starrating-meta" style="margin:8px 0 0;font-size:14px;color:#555;">${escapeHtml(reviewLine)}</p>\n` +
    `</div>`;

  const boxCss =
    `/* Star rating box styles — optional. The HTML above carries inline\n` +
    `   styles, so it works even without this CSS. Customize freely. */\n` +
    `.hb-starrating { border: 1px solid #e2e2e2; border-radius: 10px; padding: 18px; margin: 1.5em 0; }\n` +
    `.hb-starrating-title { margin: 0 0 8px; font-size: 18px; }\n` +
    `.hb-starrating-stars { position: relative; display: inline-block; font-size: 30px; line-height: 1; letter-spacing: 2px; }\n` +
    `.hb-starrating-bg { color: #d8d8d8; }\n` +
    `.hb-starrating-fill { position: absolute; left: 0; top: 0; overflow: hidden; white-space: nowrap; color: #f5a623; }\n` +
    `.hb-starrating-meta { margin: 8px 0 0; font-size: 14px; color: #555; }\n`;

  return { boxHtml, boxCss };
}

/**
 * Tool-logic slot: validate input, build the box, return run values.
 * Values keys: boxHtml, boxCss (match meta.ts output ids).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Enter your rating first." };
  }

  const rating = toNumber(values["rating"]);
  if (rating === null) {
    return { ok: false, error: "Rating is required — enter a number from 0 to 5." };
  }
  if (rating < MIN_RATING || rating > MAX_RATING) {
    return {
      ok: false,
      error: `Rating must be between ${MIN_RATING} and ${MAX_RATING}.`,
    };
  }

  let title: string | null = null;
  const rawTitle = values["title"];
  if (
    rawTitle !== undefined &&
    rawTitle !== null &&
    String(rawTitle).trim() !== ""
  ) {
    const t = String(rawTitle).trim();
    if (t.length > MAX_TITLE_CHARS) {
      return {
        ok: false,
        error: `Title is ${t.length} chars (max ${MAX_TITLE_CHARS}).`,
      };
    }
    title = t;
  }

  let reviewCount: number | null = null;
  const rawCount = values["reviewCount"];
  if (
    rawCount !== undefined &&
    rawCount !== null &&
    String(rawCount).trim() !== ""
  ) {
    const n = toNumber(rawCount);
    if (n === null || !Number.isInteger(n) || n < 0) {
      return { ok: false, error: "Review count must be a whole number of 0 or more." };
    }
    reviewCount = n;
  }

  const { boxHtml, boxCss } = buildStarRatingBox(rating, title, reviewCount);
  return { ok: true, values: { boxHtml, boxCss } };
}
