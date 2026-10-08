/**
 * Twitter Card Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Builds ready-to-paste Twitter Card <meta> tags (twitter:card,
 * twitter:title, twitter:description, twitter:image, twitter:site) from the
 * values the user types in. This is a FIXED TAG TEMPLATE, not AI: the tool
 * only assembles the tag lines from a fixed 4-or-5-tag template and escapes
 * the attribute values. Nothing is written, rewritten, or "improved".
 *
 * Template (4 required lines + 1 optional):
 *   <!-- Twitter Card meta tags -->
 *   <meta name="twitter:card" content="summary|summary_large_image" />
 *   <meta name="twitter:title" content="..." />
 *   <meta name="twitter:description" content="..." />
 *   <meta name="twitter:image" content="..." />
 *   <meta name="twitter:site" content="@handle" />   (only when a handle is given)
 *
 * Honesty notes:
 * - Card type is limited to the two standard values; summary_large_image is
 *   the default because it shows the large image preview.
 * - A missing @site handle is a non-fatal warning (the tag is simply
 *   omitted); it is not required for cards to render.
 * - The image-extension check is a heuristic only; a missing extension is a
 *   warning, not an error.
 * - Valid markup is not a guarantee of how X renders the card — X caches
 *   previews and has its own image requirements.
 * - Deterministic: same inputs always produce the same tag block.
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MAX_TITLE_CHARS = 200;
export const MAX_DESCRIPTION_CHARS = 300;
export const RECOMMENDED_TITLE_CHARS = 70;
export const RECOMMENDED_DESCRIPTION_CHARS = 155;

/** twitter:card values this tool supports. */
export const CARD_TYPES = ["summary", "summary_large_image"] as const;

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?(#.*)?$/i;
const HANDLE_RE = /^@[A-Za-z0-9_]{1,15}$/;

/**
 * True for an absolute http(s) URL. Pure parse — no network, no DOM.
 * Uses the WHATWG URL global (available in Node and browsers).
 */
export function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Escape a value placed inside an HTML attribute (double-quoted). */
export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Tool-logic slot. Values keys: title, description, image,
 * card? ("summary" | "summary_large_image", default "summary_large_image"),
 * site? (e.g. "@husnainblogger").
 * Returns values: { tagsHtml, warnings } (match meta.ts ids).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please enter your page details first." };
  }

  const title = str(values["title"]);
  const description = str(values["description"]);
  const image = str(values["image"]);
  const cardRaw = str(values["card"]).toLowerCase();
  const site = str(values["site"]);

  if (title.length === 0) {
    return { ok: false, error: "Please enter the twitter:title text." };
  }
  if (title.length > MAX_TITLE_CHARS) {
    return {
      ok: false,
      error: `Title is ${title.length} characters (max ${MAX_TITLE_CHARS}).`,
    };
  }
  if (description.length === 0) {
    return { ok: false, error: "Please enter the twitter:description text." };
  }
  if (description.length > MAX_DESCRIPTION_CHARS) {
    return {
      ok: false,
      error: `Description is ${description.length} characters (max ${MAX_DESCRIPTION_CHARS}).`,
    };
  }
  if (image.length === 0) {
    return { ok: false, error: "Please enter the image URL." };
  }
  if (!isAbsoluteHttpUrl(image)) {
    return {
      ok: false,
      error: "Image URL must be an absolute URL starting with http:// or https://.",
    };
  }

  const card: string = cardRaw === "" ? "summary_large_image" : cardRaw;
  if (card !== "summary" && card !== "summary_large_image") {
    return {
      ok: false,
      error: `"${cardRaw}" is not a supported card type. Use "summary" or "summary_large_image".`,
    };
  }

  if (site !== "" && !HANDLE_RE.test(site)) {
    return {
      ok: false,
      error: `"${site}" is not a valid X handle. Use your handle starting with @, e.g. @husnainblogger.`,
    };
  }

  const warnings: string[] = [];
  if (title.length > RECOMMENDED_TITLE_CHARS) {
    warnings.push(
      `Title is ${title.length} characters — cards often truncate around ${RECOMMENDED_TITLE_CHARS}. Consider a shorter title.`
    );
  }
  if (description.length > RECOMMENDED_DESCRIPTION_CHARS) {
    warnings.push(
      `Description is ${description.length} characters — cards often truncate around ${RECOMMENDED_DESCRIPTION_CHARS}. Consider a shorter description.`
    );
  }
  if (!IMAGE_EXT_RE.test(image)) {
    warnings.push(
      "The image URL does not end in a common image extension (.png, .jpg, .gif, .webp, .avif, .svg). It may still work, but double-check the link."
    );
  }
  if (site === "") {
    warnings.push(
      "No @site handle given — the twitter:site tag was omitted. Add your handle if you want the card attributed to your account."
    );
  }

  const lines = [
    "<!-- Twitter Card meta tags — paste inside the <head> of your page -->",
    `<meta name="twitter:card" content="${card}" />`,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(image)}" />`,
  ];
  if (site !== "") {
    lines.push(`<meta name="twitter:site" content="${escapeAttr(site)}" />`);
  }

  return { ok: true, values: { tagsHtml: lines.join("\n"), warnings } };
}
