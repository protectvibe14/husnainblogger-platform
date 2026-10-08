/**
 * Chapter Title SEO Rewriter — pure logic (tool-110).
 *
 * FORMATTER tool: runTool(values) with { chapters, primaryKeyword? }.
 * Pure TypeScript, zero imports, zero network, zero DOM, zero Date.now().
 * Deterministic: same input -> same polished titles.
 *
 * ## What this does (and does NOT do)
 * Rule-based normalization ("polish") of YouTube chapter titles. Each
 * timestamped line is validated (mm:ss or hh:mm:ss, first chapter 0:00,
 * >= 3 chapters, >= 10s gaps), then every title passes through fixed,
 * documented formatting rules. There is NO AI and NO semantic rewriting —
 * the engine cannot understand or improve meaning, and every surfaced string
 * says "rule-based polish", never "SEO rewrite by AI". (The page keeps the
 * keyword-facing name; the tool itself is honestly labeled.)
 *
 * ## Rules (fixed, documented — applied in order)
 *   1. Trim and collapse internal whitespace.
 *   2. Strip trailing punctuation (.:;,-).
 *   3. Sentence-case: uppercase the first letter, leave the rest untouched.
 *   4. Keyword front-load (heuristic): if a primary keyword is given and the
 *      title contains it (case-insensitive) but does not start with it, the
 *      first occurrence is moved to the front as "Keyword: rest".
 *   5. Length cap (heuristic, 70 chars): titles longer than TITLE_LENGTH_CAP
 *      are cut at the last space at or before the cap and given a trailing
 *      "…" so the cut is visible; flagged in the per-title checks.
 *
 * ## Per-title checks
 * Each title gets a check line reporting: final length, whether the keyword
 * was front-loaded, and whether it was truncated.
 *
 * @module chapter-title-seo-rewriter/logic
 */

/** Heuristic length cap for chapter titles (documented heuristic, not a YouTube rule). */
export const TITLE_LENGTH_CAP = 70;
/** Minimum chapters for YouTube to render chapters. */
export const MIN_CHAPTERS = 3;
/** Minimum gap between chapter timestamps (seconds). */
export const MIN_CHAPTER_GAP_SECONDS = 10;

/** Honest label: rule-based polish, never an AI rewrite claim. */
export const HONESTY_NOTE =
  "Rule-based polish (not AI rewriting): titles were trimmed, sentence-cased, " +
  "keyword front-loaded, and capped at 70 characters by fixed rules. The engine " +
  "does not understand meaning and cannot rewrite for SEO.";

export interface ParsedChapter {
  lineNumber: number;
  timestamp: string;
  title: string;
  seconds: number;
}

/** Parse "mm:ss Title" or "hh:mm:ss Title". Returns null on invalid format. */
export function parseChapterLine(line: string, lineNumber: number): ParsedChapter | null {
  const m = line.match(/^\s*(?:(\d+):)?(\d{1,2}):(\d{2})\s+(.+?)\s*$/);
  if (!m) return null;
  const hours = m[1] !== undefined ? parseInt(m[1], 10) : 0;
  const minutes = parseInt(m[2], 10);
  const seconds = parseInt(m[3], 10);
  if (minutes > 59 || seconds > 59) return null;
  return {
    lineNumber,
    timestamp:
      (m[1] !== undefined ? `${m[1]}:` : "") +
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    title: m[4].trim(),
    seconds: hours * 3600 + minutes * 60 + seconds,
  };
}

export interface ChapterValidation {
  chapters: ParsedChapter[];
  errors: string[];
}

/**
 * Validate the full chapter list. Errors name the offending line number.
 * Rules: every non-blank line parses, first chapter at 0:00, >= MIN_CHAPTERS
 * chapters, gaps >= MIN_CHAPTER_GAP_SECONDS.
 */
export function validateChapters(raw: string): ChapterValidation {
  const errors: string[] = [];
  const chapters: ParsedChapter[] = [];
  const lines = raw.split("\n");
  lines.forEach((line, i) => {
    const n = i + 1;
    if (line.trim() === "") return;
    const p = parseChapterLine(line, n);
    if (!p) {
      errors.push(`Line ${n}: invalid timestamp format (use "mm:ss Title" or "hh:mm:ss Title").`);
    } else if (p.title === "") {
      errors.push(`Line ${n}: chapter title is empty.`);
    } else {
      chapters.push(p);
    }
  });
  if (errors.length > 0) return { chapters: [], errors };
  if (chapters.length === 0) {
    return { chapters: [], errors: ["No chapters found — enter at least 3 timestamped lines."] };
  }
  if (chapters[0].seconds !== 0) {
    errors.push(`Line ${chapters[0].lineNumber}: first chapter must start at 0:00.`);
  }
  if (chapters.length < MIN_CHAPTERS) {
    errors.push(`Need at least ${MIN_CHAPTERS} chapters (found ${chapters.length}).`);
  }
  for (let i = 1; i < chapters.length; i++) {
    const gap = chapters[i].seconds - chapters[i - 1].seconds;
    if (gap < MIN_CHAPTER_GAP_SECONDS) {
      errors.push(
        `Line ${chapters[i].lineNumber}: only ${gap}s after the previous chapter (minimum ${MIN_CHAPTER_GAP_SECONDS}s).`,
      );
    }
    if (gap < 0) {
      errors.push(`Line ${chapters[i].lineNumber}: timestamps must be in ascending order.`);
    }
  }
  return { chapters: errors.length > 0 ? [] : chapters, errors };
}

export interface PolishedTitle {
  lineNumber: number;
  timestamp: string;
  original: string;
  polished: string;
  keywordFrontLoaded: boolean;
  truncated: boolean;
  length: number;
}

/** Rule 1: trim + collapse whitespace. */
function cleanWhitespace(title: string): string {
  return title.trim().replace(/\s+/g, " ");
}

/** Rule 2: strip trailing punctuation. */
function stripTrailingPunctuation(title: string): string {
  return title.replace(/[.:;,\-]+$/, "").trim();
}

/** Rule 3: sentence-case the first letter. */
function sentenceCase(title: string): string {
  if (title === "") return title;
  return title.charAt(0).toUpperCase() + title.slice(1);
}

/**
 * Rule 4: keyword front-load (heuristic). If the title contains the keyword
 * (case-insensitive) but does not start with it, move the first occurrence
 * to the front as "Keyword: rest". Returns [title, frontLoaded].
 */
function frontLoadKeyword(title: string, keyword: string): [string, boolean] {
  const kw = keyword.trim().replace(/\s+/g, " ");
  if (kw === "") return [title, false];
  const lower = title.toLowerCase();
  const kwLower = kw.toLowerCase();
  if (lower.startsWith(kwLower)) return [title, false];
  const idx = lower.indexOf(kwLower);
  if (idx === -1) return [title, false];
  const rest = (title.slice(0, idx) + " " + title.slice(idx + kw.length)).replace(/\s+/g, " ").trim();
  const front = rest === "" ? kw : `${kw}: ${rest}`;
  return [front, true];
}

/** Rule 5: cap at TITLE_LENGTH_CAP chars, cutting at the last space, with "…". */
function capLength(title: string): [string, boolean] {
  if ([...title].length <= TITLE_LENGTH_CAP) return [title, false];
  const chars = [...title];
  let cut = TITLE_LENGTH_CAP;
  while (cut > 0 && chars[cut] !== " ") cut--;
  if (cut === 0) cut = TITLE_LENGTH_CAP - 1; // no space: hard cut
  const capped = chars.slice(0, cut).join("").trimEnd() + "…";
  return [capped, true];
}

/** Apply all five rules in order. */
export function polishTitle(title: string, primaryKeyword: string): Omit<PolishedTitle, "lineNumber" | "timestamp" | "original"> {
  let t = sentenceCase(stripTrailingPunctuation(cleanWhitespace(title)));
  const [front, keywordFrontLoaded] = frontLoadKeyword(t, primaryKeyword);
  t = front;
  const [capped, truncated] = capLength(t);
  t = capped;
  return { polished: t, keywordFrontLoaded, truncated, length: [...t].length };
}

/** One-line per-title check for the UI. */
export function formatCheck(p: PolishedTitle): string {
  const flags: string[] = [];
  if (p.keywordFrontLoaded) flags.push("keyword front-loaded");
  if (p.truncated) flags.push(`truncated to ${TITLE_LENGTH_CAP} chars`);
  const detail = flags.length > 0 ? ` — ${flags.join(", ")}` : " — OK";
  return `Line ${p.lineNumber}: ${p.length} chars${detail}`;
}

/**
 * Template entry point (formatter dispatch).
 * values: { chapters: string (textarea), primaryKeyword?: string }.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Paste your timestamped chapter list." };
  }
  const raw = String(values.chapters ?? "");
  if (raw.trim() === "") {
    return { ok: false, error: "Paste your timestamped chapter list (one per line, e.g. \"0:00 Intro\")." };
  }
  const { chapters, errors } = validateChapters(raw);
  if (errors.length > 0) {
    return { ok: false, error: errors[0] };
  }
  const keyword = String(values.primaryKeyword ?? "");
  const polished: PolishedTitle[] = chapters.map((c) => {
    const r = polishTitle(c.title, keyword);
    return { lineNumber: c.lineNumber, timestamp: c.timestamp, original: c.title, ...r };
  });
  return {
    ok: true,
    values: {
      titles: polished.map((p) => `${p.timestamp} ${p.polished}`),
      copyAll: polished.map((p) => `${p.timestamp} ${p.polished}`).join("\n"),
      checks: polished.map(formatCheck),
      honestyNote: HONESTY_NOTE,
      count: polished.length,
    },
  };
}
