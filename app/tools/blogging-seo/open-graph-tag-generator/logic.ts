/**
 * Open Graph Tag Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Builds ready-to-paste Open Graph <meta> tags (og:title, og:description,
 * og:url, og:image, og:type) from the values the user types in. This is a
 * FIXED TAG TEMPLATE, not AI: the tool only assembles the tag lines from a
 * fixed 5-tag template and escapes the attribute values. Nothing is written,
 * rewritten, or "improved" — the words are exactly what the user provided.
 *
 * Template (5 lines):
 *   <!-- Open Graph meta tags -->
 *   <meta property="og:title" content="..." />
 *   <meta property="og:description" content="..." />
 *   <meta property="og:url" content="..." />
 *   <meta property="og:image" content="..." />
 *   <meta property="og:type" content="..." />
 *
 * Honesty notes:
 * - Recommended lengths (title ~60 chars, description ~155) are surfaced as
 *   non-fatal warnings only; tags are still generated for longer values.
 * - The image-extension check is a heuristic (extension list: png, jpg, jpeg,
 *   gif, webp, avif, svg): a missing extension only triggers a warning.
 * - Valid markup is not a guarantee of how a platform renders the preview —
 *   platforms cache previews and have their own image-size requirements.
 * - Deterministic: same inputs always produce the same tag block.
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MAX_TITLE_CHARS = 200;
export const MAX_DESCRIPTION_CHARS = 300;
export const RECOMMENDED_TITLE_CHARS = 60;
export const RECOMMENDED_DESCRIPTION_CHARS = 155;

/** og:type values this tool supports (Open Graph protocol core types). */
export const OG_TYPES = ["website", "article"] as const;

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?(#.*)?$/i;

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
 * Tool-logic slot. Values keys: title, description, url, image,
 * type? ("website" | "article", default "website").
 * Returns values: { tagsHtml, warnings } (match meta.ts ids).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please enter your page details first." };
  }

  const title = str(values["title"]);
  const description = str(values["description"]);
  const url = str(values["url"]);
  const image = str(values["image"]);
  const typeRaw = str(values["type"]).toLowerCase();

  if (title.length === 0) {
    return { ok: false, error: "Please enter the og:title text." };
  }
  if (title.length > MAX_TITLE_CHARS) {
    return {
      ok: false,
      error: `Title is ${title.length} characters (max ${MAX_TITLE_CHARS}).`,
    };
  }
  if (description.length === 0) {
    return { ok: false, error: "Please enter the og:description text." };
  }
  if (description.length > MAX_DESCRIPTION_CHARS) {
    return {
      ok: false,
      error: `Description is ${description.length} characters (max ${MAX_DESCRIPTION_CHARS}).`,
    };
  }
  if (url.length === 0) {
    return { ok: false, error: "Please enter the page URL." };
  }
  if (!isAbsoluteHttpUrl(url)) {
    return {
      ok: false,
      error: "Page URL must be an absolute URL starting with http:// or https://.",
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

  const type: string = typeRaw === "" ? "website" : typeRaw;
  if (type !== "website" && type !== "article") {
    return {
      ok: false,
      error: `"${typeRaw}" is not a supported og:type. Use "website" or "article".`,
    };
  }

  const warnings: string[] = [];
  if (title.length > RECOMMENDED_TITLE_CHARS) {
    warnings.push(
      `Title is ${title.length} characters — platforms often truncate around ${RECOMMENDED_TITLE_CHARS}. Consider a shorter title.`
    );
  }
  if (description.length > RECOMMENDED_DESCRIPTION_CHARS) {
    warnings.push(
      `Description is ${description.length} characters — previews often truncate around ${RECOMMENDED_DESCRIPTION_CHARS}. Consider a shorter description.`
    );
  }
  if (!IMAGE_EXT_RE.test(image)) {
    warnings.push(
      "The image URL does not end in a common image extension (.png, .jpg, .gif, .webp, .avif, .svg). It may still work, but double-check the link."
    );
  }

  const tagsHtml = [
    "<!-- Open Graph meta tags — paste inside the <head> of your page -->",
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    `<meta property="og:image" content="${escapeAttr(image)}" />`,
    `<meta property="og:type" content="${type}" />`,
  ].join("\n");

  return { ok: true, values: { tagsHtml, warnings } };
}
