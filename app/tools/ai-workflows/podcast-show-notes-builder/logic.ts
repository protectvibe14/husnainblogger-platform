/**
 * Podcast Show Notes Builder (tool-311) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is a TEMPLATE FILLER, not a writer. It formats the user's
 * own episode details (title, guest, summary, links, chapters) into a fixed
 * show-notes template. It writes nothing about the episode itself: no
 * descriptions, no quotes, no invented content. Sections with no user data
 * (chapters, links) are omitted cleanly. Any blank detail stays blank —
 * the user fills it in.
 *
 * Builder contract: runTool({ items }) -> { ok, values, error }.
 * `values.lines` is a string[] (Markdown, one template line per entry) and
 * `values.html` is the same notes as an HTML string. Output ids match
 * meta.ts outputs ('lines', 'html').
 *
 * Item shape (one repeatable row in the UI):
 *   - episodeTitle (required, read from the FIRST item only)
 *   - guestName, episodeSummary (optional, read from the FIRST item only)
 *   - keyLinkLabel, keyLinkUrl (optional; each row may add one link)
 *   - chapterTimestamp, chapterTitle (optional; each row may add one chapter)
 *
 * The template never reorders the user's links or chapters.
 */

export interface ShowNotesItem {
  episodeTitle?: string;
  guestName?: string;
  episodeSummary?: string;
  keyLinkLabel?: string;
  keyLinkUrl?: string;
  chapterTimestamp?: string;
  chapterTitle?: string;
}

export interface ShowNotesValues {
  /** Markdown show notes, one template line per entry. */
  lines: string[];
  /** The same notes as an HTML string (escaped). */
  html: string;
}

export interface ShowNotesResult {
  ok: boolean;
  values?: ShowNotesValues;
  error?: string;
}

/** Hard cap so a runaway row count cannot blow up the page. */
export const MAX_ITEMS = 100;

const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface LinkEntry {
  label: string;
  url: string;
}

interface ChapterEntry {
  timestamp: string;
  title: string;
}

function buildMarkdown(
  title: string,
  guest: string,
  summary: string,
  chapters: ChapterEntry[],
  links: LinkEntry[],
): string[] {
  const lines: string[] = [];
  lines.push(`# ${title}`);
  if (guest) lines.push(`*Guest: ${guest}*`);
  if (summary) lines.push(summary);
  if (chapters.length > 0) {
    lines.push("## Chapters");
    for (const c of chapters) {
      lines.push(c.timestamp ? `- ${c.timestamp} — ${c.title}` : `- ${c.title}`);
    }
  }
  if (links.length > 0) {
    lines.push("## Links mentioned");
    for (const l of links) {
      lines.push(l.label !== l.url ? `- [${l.label}](${l.url})` : `- ${l.url}`);
    }
  }
  lines.push("## Enjoyed this episode?");
  lines.push("Subscribe to the show wherever you get your podcasts.");
  return lines;
}

function buildHtml(
  title: string,
  guest: string,
  summary: string,
  chapters: ChapterEntry[],
  links: LinkEntry[],
): string {
  const parts: string[] = [];
  parts.push(`<h1>${escapeHtml(title)}</h1>`);
  if (guest) parts.push(`<p><em>Guest: ${escapeHtml(guest)}</em></p>`);
  if (summary) parts.push(`<p>${escapeHtml(summary)}</p>`);
  if (chapters.length > 0) {
    parts.push("<h2>Chapters</h2>");
    parts.push("<ul>");
    for (const c of chapters) {
      parts.push(
        c.timestamp
          ? `<li>${escapeHtml(c.timestamp)} — ${escapeHtml(c.title)}</li>`
          : `<li>${escapeHtml(c.title)}</li>`,
      );
    }
    parts.push("</ul>");
  }
  if (links.length > 0) {
    parts.push("<h2>Links mentioned</h2>");
    parts.push("<ul>");
    for (const l of links) {
      const text = l.label !== l.url ? escapeHtml(l.label) : escapeHtml(l.url);
      parts.push(`<li><a href="${escapeHtml(l.url)}">${text}</a></li>`);
    }
    parts.push("</ul>");
  }
  parts.push("<h2>Enjoyed this episode?</h2>");
  parts.push("<p>Subscribe to the show wherever you get your podcasts.</p>");
  return parts.join("\n");
}

/**
 * Format the user's episode details into the fixed show-notes template.
 * Header fields (episodeTitle, guestName, episodeSummary) are read from the
 * first item only; every item may contribute one link and/or one chapter.
 */
export function runTool(args: { items: Record<string, unknown>[] }): ShowNotesResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Add at least one row with your episode details to build show notes." };
  }
  if (items.length > MAX_ITEMS) {
    return { ok: false, error: `Too many rows: the builder accepts at most ${MAX_ITEMS} rows.` };
  }

  const links: LinkEntry[] = [];
  const chapters: ChapterEntry[] = [];

  for (let i = 0; i < items.length; i++) {
    const row = items[i];
    const n = i + 1;
    if (typeof row !== "object" || row === null) {
      return { ok: false, error: `Item ${n}: each row must be a set of fields.` };
    }
    const item = row as ShowNotesItem;

    const url = clean(item.keyLinkUrl);
    if (url && !URL_PATTERN.test(url)) {
      return { ok: false, error: `Item ${n}: Link URL must start with http:// or https://.` };
    }
    if (url) {
      const label = clean(item.keyLinkLabel);
      links.push({ label: label || url, url });
    }
    const chapterTitle = clean(item.chapterTitle);
    if (chapterTitle) {
      chapters.push({ timestamp: clean(item.chapterTimestamp), title: chapterTitle });
    }
  }

  const first = items[0] as ShowNotesItem;
  const title = clean(first.episodeTitle);
  if (!title) {
    return { ok: false, error: "Item 1: Episode title is required." };
  }
  const guest = clean(first.guestName);
  const summary = clean(first.episodeSummary);

  const lines = buildMarkdown(title, guest, summary, chapters, links);
  const html = buildHtml(title, guest, summary, chapters, links);
  return { ok: true, values: { lines, html } };
}
