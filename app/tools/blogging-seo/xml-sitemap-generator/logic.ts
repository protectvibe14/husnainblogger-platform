/**
 * XML Sitemap Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Builds a sitemap-protocol-compliant XML sitemap (sitemaps.org 0.9) from
 * the URL list the user types in. This is a FIXED XML TEMPLATE, not AI:
 * the tool parses one URL per line, validates each entry against the
 * protocol's rules, and emits the XML. Every URL in the output comes from
 * the user's own list — nothing is crawled, discovered, or invented.
 *
 * Input format (one entry per line, fields after the URL are optional,
 * separated by "|"):
 *   https://example.com/ | 2026-09-30 | daily | 1.0
 *   https://example.com/about
 *   /contact   (only valid when a base URL is given — it gets resolved)
 *
 * Template (sitemaps.org 0.9):
 *   <?xml version="1.0" encoding="UTF-8"?>
 *   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 *     <url><loc>...</loc><lastmod>...</lastmod><changefreq>...</changefreq><priority>...</priority></url>
 *   </urlset>
 *
 * Honesty notes:
 * - Protocol limit: one sitemap file supports at most 50,000 URLs. Lists
 *   longer than that fail with an error (splitting into multiple sitemaps
 *   and a sitemap index is left to the user) — the tool never silently
 *   truncates.
 * - Duplicate URLs are de-duplicated (first occurrence wins) and reported.
 * - Invalid lines (bad URL, bad date, bad changefreq, priority out of
 *   range, relative URL without a base URL) are skipped and reported in
 *   `errors` — the rest of the sitemap is still generated.
 * - lastmod must be a real calendar date in YYYY-MM-DD form; changefreq
 *   must be one of the 7 protocol values (always, hourly, daily, weekly,
 *   monthly, yearly, never); priority must be 0.0–1.0.
 * - Non-ASCII characters in URLs are percent-encoded with encodeURI.
 * - Correctness of the URLs themselves depends on the user's input — this
 *   tool validates syntax, not whether a page exists.
 * - Deterministic: same inputs always produce the same XML.
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MAX_URLS = 50000;
export const MIN_URLS = 1;

export const CHANGEFREQS = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
] as const;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PRIORITY_RE = /^(0(\.\d+)?|1(\.0+)?)$/;

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

/**
 * True for a real calendar date in YYYY-MM-DD form (no timezones involved).
 */
export function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
  );
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

/** Escape text placed inside an XML element. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBase(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

/**
 * Parse the textarea DSL into sitemap entries.
 * Returns entries plus per-line error notes for skipped lines.
 */
export function parseUrlList(
  urlsText: string,
  baseUrl: string
): { entries: SitemapEntry[]; errors: string[] } {
  const entries: SitemapEntry[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  let duplicates = 0;
  let lineNo = 0;

  for (const rawLine of urlsText.split(/\r?\n/)) {
    lineNo += 1;
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;

    const parts = line.split("|").map((p) => p.trim());
    let locRaw = parts[0] ?? "";
    const lastmod = parts[1] ?? "";
    const changefreqRaw = (parts[2] ?? "").toLowerCase();
    const priority = parts[3] ?? "";

    if (locRaw === "") {
      errors.push(`Line ${lineNo}: skipped — no URL found.`);
      continue;
    }

    // Resolve relative URLs against the base URL when one is given.
    if (!isAbsoluteHttpUrl(locRaw)) {
      if (baseUrl === "") {
        errors.push(
          `Line ${lineNo}: skipped — "${locRaw}" is not an absolute URL. Provide a base URL or use absolute URLs.`
        );
        continue;
      }
      const base = normalizeBase(baseUrl);
      locRaw = locRaw.startsWith("/") ? base + locRaw : base + "/" + locRaw;
      if (!isAbsoluteHttpUrl(locRaw)) {
        errors.push(`Line ${lineNo}: skipped — "${locRaw}" is not a valid URL after base resolution.`);
        continue;
      }
    }

    const loc = encodeURI(locRaw);

    if (lastmod !== "" && !isValidDate(lastmod)) {
      errors.push(`Line ${lineNo}: skipped — "${lastmod}" is not a valid YYYY-MM-DD date.`);
      continue;
    }
    if (changefreqRaw !== "" && !CHANGEFREQS.includes(changefreqRaw as (typeof CHANGEFREQS)[number])) {
      errors.push(
        `Line ${lineNo}: skipped — "${changefreqRaw}" is not a valid changefreq (use: always, hourly, daily, weekly, monthly, yearly, never).`
      );
      continue;
    }
    if (priority !== "" && !PRIORITY_RE.test(priority)) {
      errors.push(`Line ${lineNo}: skipped — priority "${priority}" must be between 0.0 and 1.0.`);
      continue;
    }

    if (seen.has(loc)) {
      duplicates += 1;
      continue;
    }
    seen.add(loc);

    const entry: SitemapEntry = { loc };
    if (lastmod !== "") entry.lastmod = lastmod;
    if (changefreqRaw !== "") entry.changefreq = changefreqRaw;
    if (priority !== "") entry.priority = priority;
    entries.push(entry);
  }

  if (duplicates > 0) {
    errors.unshift(
      `${duplicates} duplicate URL${duplicates === 1 ? "" : "s"} removed (first occurrence kept).`
    );
  }
  return { entries, errors };
}

/**
 * Render entries to a sitemaps.org 0.9 XML document. Pure — no validation.
 */
export function renderSitemapXml(entries: SitemapEntry[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const e of entries) {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(e.loc)}</loc>`);
    if (e.lastmod) lines.push(`    <lastmod>${e.lastmod}</lastmod>`);
    if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`);
    if (e.priority) lines.push(`    <priority>${e.priority}</priority>`);
    lines.push("  </url>");
  }
  lines.push("</urlset>");
  return lines.join("\n");
}

/**
 * Tool-logic slot. Values keys: urls (textarea DSL, required),
 * baseUrl? (absolute URL, resolves relative entries).
 * Returns values: { sitemapXml, urlCount, errors } (match meta.ts ids).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please enter your URL list first." };
  }

  const urlsText = str(values["urls"]);
  const baseUrl = str(values["baseUrl"]);

  if (urlsText.length === 0) {
    return { ok: false, error: "Please enter at least one URL." };
  }
  if (baseUrl !== "" && !isAbsoluteHttpUrl(baseUrl)) {
    return {
      ok: false,
      error: "Base URL must be an absolute URL starting with http:// or https://.",
    };
  }

  const { entries, errors } = parseUrlList(urlsText, baseUrl);

  if (entries.length === 0) {
    return {
      ok: false,
      error:
        "No valid URLs found. Use one absolute URL per line (e.g. https://example.com/page), optionally followed by | lastmod | changefreq | priority.",
    };
  }
  if (entries.length > MAX_URLS) {
    return {
      ok: false,
      error: `Your list has ${entries.length} valid URLs — one sitemap file supports at most ${MAX_URLS}. Split it into multiple sitemaps and list them in a sitemap index file.`,
    };
  }

  return {
    ok: true,
    values: {
      sitemapXml: renderSitemapXml(entries),
      urlCount: entries.length,
      errors,
    },
  };
}
