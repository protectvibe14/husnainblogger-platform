/**
 * Blog-to-Newsletter Converter — pure logic (tool-421).
 *
 * HONESTY / ASSUMPTIONS (also surfaced in meta.ts):
 * - PASTED-TEXT ONLY. Client-side code cannot fetch arbitrary blog URLs
 *   (browsers block it via CORS), so URL input is REJECTED with a clear
 *   message telling the user to paste their post text instead. The tool
 *   never promises URL fetching.
 * - This is a DETERMINISTIC text-repackaging pipeline from FIXED templates
 *   (sizes documented below). It is NOT AI: it never rewrites your words —
 *   excerpts are verbatim slices of your pasted text.
 * - Section detection is heuristic (headings, short lines, numbered lines,
 *   all-caps lines); always check the output against your post.
 * - Lengths are measured in Unicode code points ([...s].length).
 * - Overlong inputs are truncated WITH a visible notice, never silently.
 *
 * TEMPLATE LIBRARY SIZES:
 * - SUBJECT_PATTERNS: 5 subject-line patterns
 * - INTRO_TEMPLATES: 5 tones x 1 intro template
 * - CTA_BLOCK: 1 fixed call-to-action template
 */

export const TONES = [
  "playful",
  "professional",
  "witty",
  "minimal",
  "bold",
] as const;
export type Tone = (typeof TONES)[number];

export const MAX_CONTENT_CHARS = 20000;
export const MAX_TITLE_CHARS = 120;
export const MAX_SECTIONS = 8;
export const MIN_WORDS = 30;
export const DEFAULT_EXCERPT_WORDS = 150;
export const MIN_EXCERPT_WORDS = 20;
export const MAX_EXCERPT_WORDS = 500;
export const MAX_SUBJECT_CHARS = 78;

/** 5 subject-line patterns; {title} is the post title. */
export const SUBJECT_PATTERNS: readonly string[] = [
  "{title}: the newsletter edition",
  "The short version: {title}",
  "{title} — in 3 minutes",
  "Don't miss: {title}",
  "{title}, minus the fluff",
];

/** 1 intro template per tone; {title} is the post title. */
export const INTRO_TEMPLATES: Record<Tone, string> = {
  playful:
    "Fresh from the blog: {title}. Here's the fun-size version — the best bits, none of the scrolling.",
  professional:
    "From the blog: {title}. Below is a concise briefing of the key points.",
  witty:
    "New on the blog: {title}. We read it so you don't have to (but you probably should).",
  minimal: "{title} — the essentials, below.",
  bold: "{title}. No fluff, no filler — just what matters.",
};

/** 1 fixed CTA block template. */
export const CTA_BLOCK = [
  "Read the full post: [PASTE YOUR POST URL]",
  "",
  "Enjoyed this? Hit reply and tell me what you'd add — I read every response.",
].join("\n");

export interface ConvertedSection {
  heading: string;
  excerpt: string;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** User-perceived character count (Unicode code points, not UTF-16 units). */
export function codePoints(s: string): number {
  return [...s].length;
}

/** Strip angle brackets so plain-text outputs never carry unescaped HTML. */
export function sanitizePlain(s: string): string {
  return s.replace(/[<>]/g, "");
}

function truncateCp(
  s: string,
  max: number,
): { text: string; truncated: boolean } {
  const cps = [...s];
  if (cps.length <= max) return { text: s, truncated: false };
  return { text: cps.slice(0, max).join(""), truncated: true };
}

/** Looks like a URL (with or without protocol) rather than pasted prose. */
export function looksLikeUrl(s: string): boolean {
  const t = s.trim();
  if (/^(https?:\/\/|www\.)/i.test(t)) return true;
  // bare domain with optional path, no whitespace: example.com/post
  return /^[^\s]+\.[a-z]{2,}(\/\S*)?$/i.test(t);
}

function words(s: string): string[] {
  return s.split(/\s+/).filter((w) => w.length > 0);
}

/**
 * Heuristic: is this block a heading? A heading is a single short line that
 * is a markdown header, ends with ":", is numbered, or is mostly uppercase.
 */
function isHeadingBlock(block: string): boolean {
  const lines = block.split("\n");
  if (lines.length !== 1) return false;
  const line = lines[0].trim();
  if (codePoints(line) === 0 || codePoints(line) > 90) return false;
  if (/^#{1,6}\s+/.test(line)) return true;
  if (/:$/.test(line)) return true;
  if (/^\d+[.)]\s+\S/.test(line)) return true;
  const letters = line.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 3 && letters === letters.toUpperCase()) return true;
  return false;
}

function cleanHeading(block: string): string {
  return block.replace(/^#{1,6}\s+/, "").replace(/:$/, "").trim();
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please paste your blog post text first." };
  }
  const notices: string[] = [];

  // --- blogContent (required, pasted text only) ---
  const rawContent = values["blogContent"];
  if (typeof rawContent !== "string" || rawContent.trim().length === 0) {
    return { ok: false, error: "Please paste your blog post text." };
  }
  const trimmed = rawContent.trim();
  if (looksLikeUrl(trimmed)) {
    return {
      ok: false,
      error:
        "This tool works with pasted text only — browsers block client-side fetching of arbitrary URLs (CORS). Please copy your blog post text and paste it into the box instead.",
    };
  }
  let content = sanitizePlain(trimmed);
  const contentTrunc = truncateCp(content, MAX_CONTENT_CHARS);
  if (contentTrunc.truncated) {
    notices.push(
      `Content was shortened to ${MAX_CONTENT_CHARS.toLocaleString("en-US")} characters; extra text was not used.`,
    );
  }
  content = contentTrunc.text;

  const totalWords = words(content).length;
  if (totalWords < MIN_WORDS) {
    return {
      ok: false,
      error: `Please paste at least ${MIN_WORDS} words of blog text (got ${totalWords}).`,
    };
  }

  // --- excerptWords (optional, default 150, clamped 20-500) ---
  let excerptWords = DEFAULT_EXCERPT_WORDS;
  const rawExcerpt = values["excerptWords"];
  if (rawExcerpt !== undefined && rawExcerpt !== null && rawExcerpt !== "") {
    if (typeof rawExcerpt !== "number" || !Number.isFinite(rawExcerpt)) {
      return { ok: false, error: "Excerpt words must be a number." };
    }
    excerptWords = Math.min(
      MAX_EXCERPT_WORDS,
      Math.max(MIN_EXCERPT_WORDS, Math.floor(rawExcerpt)),
    );
  }

  // --- tone (required enum) ---
  const rawTone = values["tone"];
  if (typeof rawTone !== "string" || !(TONES as readonly string[]).includes(rawTone)) {
    return { ok: false, error: `Please pick a tone: ${TONES.join(", ")}.` };
  }
  const tone = rawTone as Tone;

  // --- split into blocks, detect headings ---
  const rawBlocks = content.split(/\n\s*\n/).map((b) => b.trim()).filter((b) => b.length > 0);

  // Title: first heading-like line, else first non-empty line.
  let title = "";
  for (const b of rawBlocks) {
    const firstLine = b.split("\n")[0].trim();
    if (firstLine.length > 0) {
      title = cleanHeading(b.split("\n").length === 1 && isHeadingBlock(b) ? b : firstLine);
      break;
    }
  }
  const titleTrunc = truncateCp(title, MAX_TITLE_CHARS);
  title = titleTrunc.text;

  interface RawSection {
    heading: string;
    body: string;
  }
  const rawSections: RawSection[] = [];
  let current: RawSection | null = null;
  const pushCurrent = () => {
    if (current && current.body.trim().length > 0) rawSections.push(current);
    current = null;
  };

  for (const block of rawBlocks) {
    if (isHeadingBlock(block)) {
      pushCurrent();
      current = { heading: cleanHeading(block), body: "" };
    } else {
      if (!current) current = { heading: "Introduction", body: "" };
      current.body += (current.body ? "\n\n" : "") + block;
    }
  }
  pushCurrent();

  if (rawSections.length === 0) {
    return {
      ok: false,
      error: "Could not find enough text to convert — paste more of your post.",
    };
  }

  // Dedupe repeated headings deterministically ("X (continued)").
  const seen = new Map<string, number>();
  const sections: ConvertedSection[] = [];
  for (const rs of rawSections.slice(0, MAX_SECTIONS)) {
    const base = rs.heading || "Section";
    const n = (seen.get(base.toLowerCase()) ?? 0) + 1;
    seen.set(base.toLowerCase(), n);
    const heading = n === 1 ? base : `${base} (continued)`;
    const bodyWords = words(rs.body.replace(/\n+/g, " "));
    const excerpt =
      bodyWords.length > excerptWords
        ? bodyWords.slice(0, excerptWords).join(" ") + "…"
        : bodyWords.join(" ");
    sections.push({ heading, excerpt });
  }
  if (rawSections.length > MAX_SECTIONS) {
    notices.push(
      `Only the first ${MAX_SECTIONS} sections were converted; the rest were skipped.`,
    );
  }

  // --- assemble outputs from fixed templates ---
  const subjectTitle =
    codePoints(title) > MAX_SUBJECT_CHARS
      ? [...title].slice(0, MAX_SUBJECT_CHARS - 1).join("") + "…"
      : title;
  const subjectOptions = SUBJECT_PATTERNS.map((p) =>
    p.replaceAll("{title}", subjectTitle),
  );
  const introParagraph = INTRO_TEMPLATES[tone].replaceAll("{title}", title);

  return {
    ok: true,
    values: {
      subjectOptions,
      introParagraph,
      sections,
      ctaBlock: CTA_BLOCK,
      notices,
    },
  };
}
