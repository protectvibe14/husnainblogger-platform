/**
 * Description Template Builder — pure logic (tool-108).
 *
 * BUILDER tool: runTool({ items }) — one assembled description per item.
 * Pure TypeScript, zero imports, zero network, zero DOM, zero Date.now().
 * Deterministic: same items -> same descriptions.
 *
 * ## What this does (and does NOT do)
 * Pure text assembly. Each item (video topic, keywords, links, optional
 * affiliate links, optional chapters) is assembled into a ready-to-paste
 * YouTube description with fixed sections: hook + keywords line, chapters,
 * links, CTA, hashtags, and an FTC disclosure block when affiliate links are
 * present. It cannot publish anything to YouTube — you paste the result into
 * YouTube Studio yourself.
 *
 * ## Rules (from platform-rules, documented)
 *   - Total length must stay <= MAX_DESCRIPTION_CHARS (5000, YouTube's
 *     description limit); over-limit items are rejected with an error.
 *   - Hashtags: derived from keywords; if MORE than MAX_HASHTAGS (15) are
 *     listed, a warning is added because YouTube ignores ALL hashtags when a
 *     description has more than 15.
 *   - Chapters are included only when the chapter lines are valid: every
 *     line parses as mm:ss or hh:mm:ss + title, the first chapter starts at
 *     0:00, there are >= 3 chapters, and gaps are >= 10 seconds. Invalid
 *     chapters are omitted and reported in `warnings`.
 *   - Affiliate links present -> a fixed FTC disclosure paragraph is
 *     mandatory and always appended.
 *   - "Above the fold" preview = first FOLD_PREVIEW_CHARS (150) characters.
 *
 * @module description-template-builder/logic
 */

/** YouTube's real description length limit (characters). */
export const MAX_DESCRIPTION_CHARS = 5000;
/** Above that many hashtags YouTube ignores ALL of them (platform rule). */
export const MAX_HASHTAGS = 15;
/** Above-the-fold preview length (characters). */
export const FOLD_PREVIEW_CHARS = 150;
/** Minimum chapters for YouTube to render chapters. */
export const MIN_CHAPTERS = 3;
/** Minimum gap between chapter timestamps (seconds). */
export const MIN_CHAPTER_GAP_SECONDS = 10;

/** Fixed FTC disclosure block, appended whenever affiliate links are present. */
export const FTC_DISCLOSURE =
  "AFFILIATE DISCLOSURE: Some of the links above are affiliate links. " +
  "If you purchase through them, I may earn a commission at no extra cost to you. " +
  "Thank you for supporting the channel.";

export interface DescriptionItem {
  topic: string;
  keywords: string[];
  links: string[];
  affiliateLinks: string[];
  chapters: string[];
}

/** One parsed chapter line: raw timestamp text + title. */
export interface ParsedChapter {
  timestamp: string;
  title: string;
  seconds: number;
}

/** Parse "mm:ss Title" or "hh:mm:ss Title". Returns null on invalid format. */
export function parseChapterLine(line: string): ParsedChapter | null {
  const m = line.match(/^\s*(?:(\d+):)?(\d{1,2}):(\d{2})\s+(.+?)\s*$/);
  if (!m) return null;
  const hours = m[1] !== undefined ? parseInt(m[1], 10) : 0;
  const minutes = parseInt(m[2], 10);
  const seconds = parseInt(m[3], 10);
  if (minutes > 59 || seconds > 59) return null;
  return {
    timestamp: (m[1] !== undefined ? `${m[1]}:` : "") + `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    title: m[4].trim(),
    seconds: hours * 3600 + minutes * 60 + seconds,
  };
}

/**
 * Validate a chapter list. Returns parsed chapters plus human problems.
 * Rules: >= MIN_CHAPTERS chapters, first at 0:00, gaps >= MIN_CHAPTER_GAP_SECONDS.
 */
export function validateChapters(lines: string[]): { chapters: ParsedChapter[]; problems: string[] } {
  const problems: string[] = [];
  const chapters: ParsedChapter[] = [];
  lines.forEach((line, i) => {
    if (line.trim() === "") return;
    const p = parseChapterLine(line);
    if (!p) problems.push(`chapter line ${i + 1}: invalid format (use "mm:ss Title")`);
    else chapters.push(p);
  });
  if (chapters.length > 0 && chapters[0].seconds !== 0)
    problems.push("first chapter must start at 0:00");
  if (chapters.length > 0 && chapters.length < MIN_CHAPTERS)
    problems.push(`need at least ${MIN_CHAPTERS} chapters (found ${chapters.length})`);
  for (let i = 1; i < chapters.length; i++) {
    if (chapters[i].seconds - chapters[i - 1].seconds < MIN_CHAPTER_GAP_SECONDS)
      problems.push(`chapter line ${i + 1}: less than ${MIN_CHAPTER_GAP_SECONDS}s after the previous chapter`);
  }
  return { chapters, problems };
}

/** Split free text into trimmed, non-empty, de-duplicated tokens. */
export function splitList(value: unknown, separators: RegExp): string[] {
  if (value === undefined || value === null) return [];
  const parts = String(value).split(separators).map((s) => s.trim()).filter((s) => s.length > 0);
  const seen = new Set<string>();
  return parts.filter((p) => {
    const k = p.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function isValidUrl(s: string): boolean {
  return /^https?:\/\/\S+$/i.test(s);
}

/** Turn keywords into hashtag tokens: lowercase, letters/digits only, de-duped. */
export function keywordsToHashtags(keywords: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const kw of keywords) {
    const tag = kw.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (tag.length === 0 || seen.has(tag)) continue;
    seen.add(tag);
    out.push("#" + tag);
  }
  return out;
}

/** "Above the fold" preview: first FOLD_PREVIEW_CHARS characters. */
export function aboveFoldPreview(text: string): string {
  const chars = [...text];
  if (chars.length <= FOLD_PREVIEW_CHARS) return text;
  return chars.slice(0, FOLD_PREVIEW_CHARS).join("") + "…";
}

/** Assemble one description. Returns the text plus any warnings for this item. */
export function buildDescription(item: DescriptionItem): { text: string; warnings: string[] } {
  const warnings: string[] = [];
  const kwLine = item.keywords.length > 0 ? item.keywords.join(", ") : item.topic;

  const sections: string[] = [];
  sections.push(`${item.topic} — ${kwLine}`);
  sections.push("");
  sections.push(`In this video we cover ${item.topic.toLowerCase()} step by step: ${kwLine}.`);

  if (item.chapters.length > 0) {
    const { chapters, problems } = validateChapters(item.chapters);
    if (problems.length > 0) {
      warnings.push("chapters omitted: " + problems.join("; "));
    } else {
      sections.push("");
      sections.push("CHAPTERS");
      for (const c of chapters) sections.push(`${c.timestamp} ${c.title}`);
    }
  }

  if (item.links.length > 0) {
    sections.push("");
    sections.push("LINKS & RESOURCES");
    for (const l of item.links) sections.push(`- ${l}`);
  }
  if (item.affiliateLinks.length > 0) {
    sections.push("");
    sections.push(FTC_DISCLOSURE);
  }

  sections.push("");
  sections.push(
    `If this video helped you with ${item.topic.toLowerCase()}, hit subscribe and turn on notifications so you never miss an upload.`,
  );

  const hashtags = keywordsToHashtags(item.keywords);
  if (hashtags.length > MAX_HASHTAGS) {
    warnings.push(
      `you listed ${hashtags.length} hashtags — YouTube ignores ALL hashtags when a description has more than ${MAX_HASHTAGS}; trim to ${MAX_HASHTAGS} or fewer`,
    );
  }
  if (hashtags.length > 0) {
    sections.push("");
    sections.push(hashtags.join(" "));
  }

  return { text: sections.join("\n"), warnings };
}

/** Char count in code points (grapheme approximation). */
export function charCount(text: string): number {
  return [...text].length;
}

export interface BuiltDescription {
  text: string;
  aboveFold: string;
  chars: number;
  warnings: string[];
}

/**
 * Template entry point (builder dispatch).
 * args: { items: [{ topic, keywords, links, affiliateLinks, chapters }] }.
 * keywords/links/affiliateLinks/chapters accept comma- or newline-separated text.
 */
export function runTool(args: { items: Record<string, unknown>[] }): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Add at least one description item." };
  }
  const descriptions: string[] = [];
  const aboveFold: string[] = [];
  const charCounts: string[] = [];
  const warnings: string[] = [];

  for (let n = 0; n < items.length; n++) {
    const raw = items[n] ?? {};
    const label = `Item ${n + 1}`;
    const topic = String(raw.topic ?? "").trim();
    if (topic === "") return { ok: false, error: `${label}: topic is required.` };

    const item: DescriptionItem = {
      topic,
      keywords: splitList(raw.keywords, /[,\n]+/),
      links: splitList(raw.links, /[\n,]+/),
      affiliateLinks: splitList(raw.affiliateLinks, /[\n,]+/),
      // chapter lines are validated individually (order + duplicates matter)
      chapters: String(raw.chapters ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    };

    for (const l of [...item.links, ...item.affiliateLinks]) {
      if (!isValidUrl(l)) {
        return { ok: false, error: `${label}: link "${l}" is not a valid URL (must start with http:// or https://).` };
      }
    }

    const built = buildDescription(item);
    const chars = charCount(built.text);
    if (chars > MAX_DESCRIPTION_CHARS) {
      return {
        ok: false,
        error: `${label}: description is ${chars} characters — over YouTube's ${MAX_DESCRIPTION_CHARS}-character description limit. Shorten the topic, keywords, or links.`,
      };
    }
    descriptions.push(built.text);
    aboveFold.push(aboveFoldPreview(built.text));
    charCounts.push(`${label}: ${chars}/${MAX_DESCRIPTION_CHARS} characters`);
    for (const w of built.warnings) warnings.push(`${label}: ${w}`);
  }

  return {
    ok: true,
    values: { descriptions, aboveFold, charCounts, warnings, count: items.length },
  };
}
