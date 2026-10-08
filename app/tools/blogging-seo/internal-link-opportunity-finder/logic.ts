/**
 * Internal Link Opportunity Finder — pure logic (zero imports, zero network, zero DOM).
 *
 * Finds places in pasted article text where a target page's keyword appears as
 * plain text and could become an internal link. This is PHRASE MATCHING, not
 * AI: a case-insensitive, Unicode-safe substring search over the content you
 * paste. It cannot crawl a live site and it does not check SERPs, rankings,
 * or search volume.
 *
 * Matching rules (fixed, published):
 * - Each target page is checked against its keywords in listed order.
 * - First plain-text occurrence of each keyword wins (one opportunity per
 *   keyword per page); occurrences inside existing link markup (markdown
 *   [text](url) or <a href> tags) are skipped.
 * - A target page is skipped entirely when its URL is already linked in the
 *   content (as a link target or as a bare URL in the text).
 * - Keywords that already appear as anchor text of an existing link are
 *   skipped (that phrase is already "used up" as link text).
 *
 * Deterministic: same inputs always produce the same opportunities in the
 * same order (pages in input order, keywords in listed order).
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export interface TargetPage {
  url: string;
  keywords: string[];
}

export interface LinkOpportunity {
  keyword: string;
  targetUrl: string;
  context: string;
}

const MAX_CONTENT_CHARS = 500000;
const MAX_TARGET_PAGES = 200;
const MAX_OPPORTUNITIES = 500;
const CONTEXT_CHARS = 60;

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Absolute http(s) URLs, or site-relative paths like /blog/post/. */
function isValidTargetUrl(u: string): boolean {
  if (u.startsWith("/")) return u.length > 1;
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

interface LinkMarkup {
  /** Character span of the whole link markup in the content. */
  start: number;
  end: number;
  /** Visible anchor text (inner text with tags stripped). */
  anchorText: string;
  /** Link target (href / markdown URL). */
  target: string;
}

/** Find markdown links and <a> tags; returns markup spans + link targets. */
function extractLinks(content: string): { markups: LinkMarkup[]; targets: Set<string> } {
  const markups: LinkMarkup[] = [];
  const targets = new Set<string>();
  let m: RegExpExecArray | null;

  const md = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  while ((m = md.exec(content)) !== null) {
    const target = m[2].trim();
    markups.push({
      start: m.index,
      end: m.index + m[0].length,
      anchorText: m[1].replace(/<[^>]*>/g, ""),
      target,
    });
    if (target) targets.add(target);
  }

  const html = /<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a\s*>/gi;
  while ((m = html.exec(content)) !== null) {
    const target = (m[1] ?? m[2] ?? m[3] ?? "").trim();
    markups.push({
      start: m.index,
      end: m.index + m[0].length,
      anchorText: m[4].replace(/<[^>]*>/g, ""),
      target,
    });
    if (target) targets.add(target);
  }
  return { markups, targets };
}

function splitKeywords(raw: unknown): string[] {
  if (typeof raw === "string") {
    return raw
      .split(/[;,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  if (Array.isArray(raw)) {
    return raw
      .filter((k): k is string => typeof k === "string")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }
  return [];
}

/**
 * Normalize a textarea paste ("URL | keyword 1, keyword 2" per line) or a
 * structured array [{ url, keywords }] into validated target pages.
 */
function parseTargetPages(raw: unknown): { pages: TargetPage[]; error?: string } {
  let items: unknown[];
  if (typeof raw === "string") {
    items = raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const pipe = line.indexOf("|");
        if (pipe === -1) return { url: line, keywords: [] as string[] };
        return {
          url: line.slice(0, pipe).trim(),
          keywords: line
            .slice(pipe + 1)
            .split(/[;,]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
        };
      });
  } else if (Array.isArray(raw)) {
    items = raw;
  } else {
    return { pages: [], error: "Target pages must be a list of pages with keywords." };
  }

  if (items.length === 0) {
    return { pages: [], error: "Add at least one target page with keywords." };
  }
  if (items.length > MAX_TARGET_PAGES) {
    return {
      pages: [],
      error: `Too many target pages (${items.length}). The limit is ${MAX_TARGET_PAGES}.`,
    };
  }

  const pages: TargetPage[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i] as { url?: unknown; keywords?: unknown };
    const label = `Target page #${i + 1}`;
    if (!item || typeof item !== "object") {
      return { pages: [], error: `${label}: must be a page with a URL and keywords.` };
    }
    const url = clean(item.url);
    if (!url) return { pages: [], error: `${label}: URL is required.` };
    if (!isValidTargetUrl(url)) {
      return {
        pages: [],
        error: `${label}: "${url.slice(0, 80)}" is not a valid URL. Use an absolute http(s) URL or a site path like /blog/post/.`,
      };
    }
    const keywords = splitKeywords(item.keywords);
    if (keywords.length === 0) {
      return { pages: [], error: `${label}: add at least one keyword for ${url}.` };
    }
    pages.push({ url, keywords });
  }
  return { pages };
}

/** True when the page's URL already appears as a link (or bare URL) in the content. */
function isAlreadyLinked(url: string, targets: Set<string>, contentLower: string): boolean {
  if (targets.has(url)) return true;
  if (contentLower.includes(url.toLowerCase())) return true;
  if (!url.startsWith("/")) {
    try {
      const path = new URL(url).pathname;
      if (path && path !== "/" && contentLower.includes(path.toLowerCase())) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

/**
 * Find the first occurrence of the keyword that is NOT inside existing link
 * markup. Returns null when there is no usable occurrence.
 */
function findUsableOccurrence(
  contentLower: string,
  keyword: string,
  markups: LinkMarkup[],
): number | null {
  const kw = keyword.toLowerCase();
  let from = 0;
  while (true) {
    const idx = contentLower.indexOf(kw, from);
    if (idx === -1) return null;
    const insideLink = markups.some((lm) => idx >= lm.start && idx < lm.end);
    if (!insideLink) return idx;
    from = idx + kw.length;
  }
}

function snippet(content: string, index: number, kwLen: number): string {
  const start = Math.max(0, index - CONTEXT_CHARS);
  const end = Math.min(content.length, index + kwLen + CONTEXT_CHARS);
  let s = content.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) s = "…" + s;
  if (end < content.length) s = s + "…";
  return s;
}

/** Table payload the template renderer understands: { columns, rows }. */
function toTable(opportunities: LinkOpportunity[]): { columns: string[]; rows: string[][] } {
  return {
    columns: ["Keyword", "Target URL", "Context"],
    rows: opportunities.map((o) => [o.keyword, o.targetUrl, o.context]),
  };
}

export function runTool(values: Record<string, unknown>): ToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input provided." };
  }

  const content = clean(values["content"]);
  if (!content) {
    return { ok: false, error: "Paste your article content first — the content field is empty." };
  }
  if (content.length > MAX_CONTENT_CHARS) {
    return {
      ok: false,
      error: `Content is too long (${content.length.toLocaleString("en-US")} characters). The limit is ${MAX_CONTENT_CHARS.toLocaleString("en-US")} characters.`,
    };
  }

  const parsed = parseTargetPages(values["targetPages"]);
  if (parsed.error) return { ok: false, error: parsed.error };

  const contentLower = content.toLowerCase();
  const { markups, targets } = extractLinks(content);
  const usedAnchors = new Set(markups.map((lm) => lm.anchorText.toLowerCase()));

  const opportunities: LinkOpportunity[] = [];
  for (const page of parsed.pages) {
    if (isAlreadyLinked(page.url, targets, contentLower)) continue;
    const seenKeywords = new Set<string>();
    for (const keyword of page.keywords) {
      const key = keyword.toLowerCase();
      if (seenKeywords.has(key)) continue; // same keyword listed twice → one opportunity
      seenKeywords.add(key);
      if (usedAnchors.has(key)) continue; // already used as link text somewhere
      const idx = findUsableOccurrence(contentLower, keyword, markups);
      if (idx === null) continue;
      opportunities.push({
        keyword,
        targetUrl: page.url,
        context: snippet(content, idx, keyword.length),
      });
      if (opportunities.length >= MAX_OPPORTUNITIES) break;
    }
    if (opportunities.length >= MAX_OPPORTUNITIES) break;
  }

  return {
    ok: true,
    values: {
      opportunities: toTable(opportunities),
      count: opportunities.length,
    },
  };
}
