/**
 * Testimonial Showcase Page Builder (tool-487) — pure engine.
 * Zero imports, zero network, zero DOM, zero randomness.
 *
 * HONESTY: this is STATIC HTML ASSEMBLY from user-provided content. The
 * user pastes their own testimonials; the tool wraps them in a styled,
 * copy-paste page (and a smaller embed snippet). It verifies nothing — no
 * verification badge is added, because the testimonials are user-provided.
 * The user hosts the page themselves; this tool produces no hosting or URL.
 *
 * Builder shape per contract: runTool({ items }) where each item carries
 * the itemFields (pageTitle + brandColor are "fill once" globals taken
 * from the first row that sets them; quote/clientName/role/photoUrl are
 * per-testimonial rows).
 */

export interface TestimonialItem {
  pageTitle?: string;
  brandColor?: string;
  quote: string;
  clientName: string;
  role?: string;
  photoUrl?: string;
}

export interface BuilderResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MAX_ITEMS = 50;
export const MAX_QUOTE_LENGTH = 2000;
export const DEFAULT_PAGE_TITLE = "Client Testimonials";
export const DEFAULT_BRAND_COLOR = "#4F46E5";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\/[^\s]+$/i.test(value);
}

interface NormalizedTestimonial {
  quote: string;
  clientName: string;
  role: string;
  photoUrl: string;
}

function cardHtml(t: NormalizedTestimonial, index: number): string {
  const photo = t.photoUrl
    ? `<img src="${escapeHtml(t.photoUrl)}" alt="Photo of ${escapeHtml(t.clientName)}" class="hb-t-photo" loading="lazy" />`
    : `<div class="hb-t-photo hb-t-photo-fallback" aria-hidden="true">${escapeHtml(
        t.clientName.charAt(0).toUpperCase(),
      )}</div>`;
  const roleLine = t.role ? `<p class="hb-t-role">${escapeHtml(t.role)}</p>` : "";
  return [
    `<figure class="hb-t-card" id="testimonial-${index + 1}">`,
    `  <blockquote class="hb-t-quote">&ldquo;${escapeHtml(t.quote)}&rdquo;</blockquote>`,
    `  <figcaption class="hb-t-author">${photo}`,
    `    <div><p class="hb-t-name">${escapeHtml(t.clientName)}</p>${roleLine}</div>`,
    `  </figcaption>`,
    `</figure>`,
  ].join("\n");
}

function pageCss(): string {
  return [
    ":root { --hb-brand: " + "__BRAND__" + "; }",
    ".hb-testimonials { max-width: 1080px; margin: 0 auto; padding: 48px 20px; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; color: #1a1a2e; }",
    ".hb-t-title { text-align: center; font-size: 2rem; margin: 0 0 8px; }",
    ".hb-t-sub { text-align: center; color: #555; margin: 0 0 32px; }",
    ".hb-t-grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }",
    ".hb-t-card { margin: 0; padding: 24px; border: 1px solid #e5e5ef; border-radius: 14px; background: #fff; border-top: 4px solid var(--hb-brand); box-shadow: 0 2px 12px rgba(0,0,0,.05); }",
    ".hb-t-quote { margin: 0 0 18px; font-size: 1.02rem; line-height: 1.6; }",
    ".hb-t-author { display: flex; align-items: center; gap: 12px; }",
    ".hb-t-photo { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; flex: none; }",
    ".hb-t-photo-fallback { display: flex; align-items: center; justify-content: center; background: var(--hb-brand); color: #fff; font-size: 1.4rem; font-weight: 700; }",
    ".hb-t-name { margin: 0; font-weight: 700; }",
    ".hb-t-role { margin: 2px 0 0; color: #666; font-size: .9rem; }",
    ".hb-t-note { text-align: center; color: #888; font-size: .8rem; margin-top: 28px; }",
  ].join("\n");
}

function buildPageHtml(
  title: string,
  brandColor: string,
  items: NormalizedTestimonial[],
): string {
  const cards = items.map((t, i) => cardHtml(t, i)).join("\n\n");
  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `<title>${escapeHtml(title)} — Testimonials</title>`,
    "<style>",
    pageCss().split("__BRAND__").join(escapeHtml(brandColor)),
    "</style>",
    "</head>",
    "<body>",
    '<main class="hb-testimonials">',
    `  <h1 class="hb-t-title">${escapeHtml(title)}</h1>`,
    `  <p class="hb-t-sub">What clients say about working with me.</p>`,
    '  <div class="hb-t-grid">',
    cards
      .split("\n")
      .map((line) => "    " + line)
      .join("\n"),
    "  </div>",
    '  <p class="hb-t-note">Testimonials shown are provided by the page owner and are not independently verified.</p>',
    "</main>",
    "</body>",
    "</html>",
  ].join("\n");
}

function buildEmbedSnippet(
  brandColor: string,
  items: NormalizedTestimonial[],
): string {
  const cards = items.map((t, i) => cardHtml(t, i)).join("\n\n");
  return [
    "<!-- Testimonial showcase: paste this <section> where you want the testimonials to appear. -->",
    "<!-- Testimonials below are user-provided and carry no verification badge. -->",
    `<section class="hb-testimonials" style="--hb-brand: ${escapeHtml(brandColor)}; max-width: 1080px; margin: 0 auto; padding: 32px 16px; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;">`,
    '  <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">',
    cards
      .split("\n")
      .map((line) => "    " + line)
      .join("\n"),
    "  </div>",
    "</section>",
    "<!-- Tip: host the full showcase page and link to it from this section. -->",
  ].join("\n");
}

/**
 * Builder entry point. Input: { items: Array<{ pageTitle?, brandColor?,
 * quote (required), clientName (required), role?, photoUrl? }> }.
 * Output ids: showcasePageHTML, embedSnippet.
 */
export function runTool(args: { items: Record<string, unknown>[] }): BuilderResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Add at least one testimonial to build the showcase page." };
  }
  if (items.length > MAX_ITEMS) {
    return {
      ok: false,
      error: `Too many testimonials: the builder accepts at most ${MAX_ITEMS} per page.`,
    };
  }

  let pageTitle = "";
  let brandColor = "";
  const normalized: NormalizedTestimonial[] = [];

  for (let i = 0; i < items.length; i++) {
    const row = (items[i] ?? {}) as Partial<TestimonialItem>;
    const n = i + 1;

    if (!pageTitle) pageTitle = clean(row.pageTitle);
    if (!brandColor) brandColor = clean(row.brandColor);

    const quote = clean(row.quote);
    if (!quote) {
      return { ok: false, error: `Item ${n}: quote is required — paste the client's words.` };
    }
    if (quote.length > MAX_QUOTE_LENGTH) {
      return {
        ok: false,
        error: `Item ${n}: quote is too long (${quote.length} characters). Keep it under ${MAX_QUOTE_LENGTH} characters.`,
      };
    }
    const clientName = clean(row.clientName);
    if (!clientName) {
      return { ok: false, error: `Item ${n}: client name is required.` };
    }
    const photoUrl = clean(row.photoUrl);
    if (photoUrl && !isHttpUrl(photoUrl)) {
      return {
        ok: false,
        error: `Item ${n}: photo URL must start with http:// or https:// — you entered "${photoUrl}".`,
      };
    }

    normalized.push({ quote, clientName, role: clean(row.role), photoUrl });
  }

  if (pageTitle === "") pageTitle = DEFAULT_PAGE_TITLE;
  if (brandColor === "") brandColor = DEFAULT_BRAND_COLOR;
  if (!isHexColor(brandColor)) {
    return {
      ok: false,
      error: `Brand color must be a hex color like ${DEFAULT_BRAND_COLOR} — you entered "${brandColor}".`,
    };
  }

  return {
    ok: true,
    values: {
      showcasePageHTML: buildPageHtml(pageTitle, brandColor, normalized),
      embedSnippet: buildEmbedSnippet(brandColor, normalized),
    },
  };
}
