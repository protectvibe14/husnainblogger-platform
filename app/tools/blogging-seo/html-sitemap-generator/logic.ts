/**
 * HTML Sitemap Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Renders a human-readable HTML sitemap (headings + linked lists, grouped
 * by optional sections) from the page list the user types in. This is a
 * FIXED MARKUP TEMPLATE, not AI: the tool parses a simple line format
 * (see below), validates it, and emits the HTML. Every page in the output
 * comes from the user's own list — nothing is crawled, discovered, or
 * invented.
 *
 * Input format (one page per line, "section" is optional):
 *   Home | https://example.com/
 *   Getting Started | https://example.com/start | Guides
 *   Pricing | /pricing | Company
 *
 * Template:
 *   <!-- HTML sitemap generated with the HusnainBlogger HTML Sitemap Generator -->
 *   <!-- <pageCount> pages, <skipped> skipped -->
 *   <h1><siteName> Sitemap</h1>
 *   <h2><section name></h2>
 *   <ul>
 *     <li><a href="<url>"><title></a></li>
 *   </ul>
 *
 * Honesty notes:
 * - URLs may be absolute (http/https) or root-relative (starting with "/").
 *   Other values are skipped, and skipped lines are reported in an HTML
 *   comment at the top of the output — nothing is silently dropped.
 * - Duplicate URLs are de-duplicated (first occurrence wins) and reported.
 * - Titles are required (1–200 chars); empty or over-long titles fail the
 *   line with a report, not the whole run.
 * - This generates the sitemap fragment only — paste it into your page
 *   template so it inherits your site's styling and navigation.
 * - Deterministic: same inputs always produce the same HTML.
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MAX_PAGES = 2000;
export const MAX_TITLE_CHARS = 200;
export const MAX_SITENAME_CHARS = 100;
export const DEFAULT_SECTION = "General";

export interface SitemapPage {
  title: string;
  url: string;
  section: string;
}

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

/** True for a usable sitemap link: absolute http(s) or root-relative. */
export function isLinkableUrl(value: string): boolean {
  if (isAbsoluteHttpUrl(value)) return true;
  return value.startsWith("/");
}

/** Escape text placed inside HTML (element content or attribute). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Make user text safe inside an HTML comment (no "--" sequences). */
export function escapeComment(value: string): string {
  return value.replace(/--/g, "—").replace(/[\r\n]+/g, " ").slice(0, 300);
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Parse the textarea DSL into pages.
 * Returns pages plus notes about skipped lines (embedded in the output).
 */
export function parsePageList(pagesText: string): {
  pages: SitemapPage[];
  notes: string[];
} {
  const pages: SitemapPage[] = [];
  const notes: string[] = [];
  const seen = new Set<string>();
  let duplicates = 0;
  let lineNo = 0;

  for (const rawLine of pagesText.split(/\r?\n/)) {
    lineNo += 1;
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;

    const parts = line.split("|").map((p) => p.trim());
    const title = parts[0] ?? "";
    const url = parts[1] ?? "";
    const sectionRaw = parts[2] ?? "";

    if (title === "") {
      notes.push(`Line ${lineNo}: skipped — no title before the "|".`);
      continue;
    }
    if (title.length > MAX_TITLE_CHARS) {
      notes.push(
        `Line ${lineNo}: skipped — title is ${title.length} characters (max ${MAX_TITLE_CHARS}).`
      );
      continue;
    }
    if (url === "") {
      notes.push(`Line ${lineNo}: skipped — no URL after the "|".`);
      continue;
    }
    if (!isLinkableUrl(url)) {
      notes.push(
        `Line ${lineNo}: skipped — "${url}" is not a valid link. Use an absolute URL (https://…) or a path starting with "/".`
      );
      continue;
    }
    const section = sectionRaw === "" ? DEFAULT_SECTION : sectionRaw;
    const key = encodeURI(url);
    if (seen.has(key)) {
      duplicates += 1;
      continue;
    }
    seen.add(key);
    pages.push({ title, url: encodeURI(url), section });
  }

  if (duplicates > 0) {
    notes.unshift(
      `${duplicates} duplicate URL${duplicates === 1 ? "" : "s"} removed (first occurrence kept).`
    );
  }
  return { pages, notes };
}

/**
 * Render pages to an HTML sitemap fragment. Pure — no validation.
 * Sections appear in first-seen order. If no page has a custom section,
 * pages render as a single list without section headings.
 */
export function renderSitemapHtml(
  pages: SitemapPage[],
  siteName: string,
  notes: string[]
): string {
  const lines: string[] = [];
  lines.push("<!-- HTML sitemap generated with the HusnainBlogger HTML Sitemap Generator -->");
  const skippedNote =
    notes.length === 0
      ? ""
      : ` Skipped ${notes.length}: ${notes.map(escapeComment).join(" | ")}`;
  lines.push(`<!-- ${pages.length} page${pages.length === 1 ? "" : "s"} listed.${skippedNote} -->`);

  const heading =
    siteName === "" ? "Sitemap" : `${escapeHtml(siteName)} Sitemap`;
  lines.push(`<h1>${heading}</h1>`);

  const order: string[] = [];
  const bySection = new Map<string, SitemapPage[]>();
  for (const p of pages) {
    if (!bySection.has(p.section)) {
      bySection.set(p.section, []);
      order.push(p.section);
    }
    bySection.get(p.section)!.push(p);
  }

  const hasCustomSections = order.some((s) => s !== DEFAULT_SECTION);
  for (const section of order) {
    const group = bySection.get(section)!;
    if (hasCustomSections) {
      lines.push(`<h2>${escapeHtml(section)}</h2>`);
    }
    lines.push("<ul>");
    for (const p of group) {
      lines.push(
        `  <li><a href="${escapeHtml(p.url)}">${escapeHtml(p.title)}</a></li>`
      );
    }
    lines.push("</ul>");
  }
  return lines.join("\n");
}

/**
 * Tool-logic slot. Values keys: pages (textarea DSL, required),
 * siteName? (max 100 chars, used in the <h1>).
 * Returns values: { sitemapHtml, pageCount } (match meta.ts ids).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please enter your page list first." };
  }

  const pagesText = str(values["pages"]);
  const siteName = str(values["siteName"]);

  if (pagesText.length === 0) {
    return { ok: false, error: "Please enter at least one page (title | URL per line)." };
  }
  if (siteName.length > MAX_SITENAME_CHARS) {
    return {
      ok: false,
      error: `Site name is ${siteName.length} characters (max ${MAX_SITENAME_CHARS}).`,
    };
  }

  const { pages, notes } = parsePageList(pagesText);
  if (pages.length === 0) {
    return {
      ok: false,
      error:
        "No valid pages found. Use one per line: title | URL | optional section (e.g. \"Pricing | /pricing | Company\").",
    };
  }
  if (pages.length > MAX_PAGES) {
    return {
      ok: false,
      error: `Your list has ${pages.length} pages — this tool supports at most ${MAX_PAGES} per HTML sitemap.`,
    };
  }

  return {
    ok: true,
    values: {
      sitemapHtml: renderSitemapHtml(pages, siteName, notes),
      pageCount: pages.length,
    },
  };
}
