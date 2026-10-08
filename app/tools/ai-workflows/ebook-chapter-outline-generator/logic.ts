/**
 * Ebook Chapter Outline Generator (tool-306) — pure logic.
 *
 * Honesty: this is a TEMPLATE engine, not AI writing. User inputs are placed
 * into fixed chapter-title patterns; every chapter gets fill-in "beat slots"
 * (labels + prompts for the author), never written prose.
 *
 * Template patterns (documented):
 * - Chapter roles: 1 opening chapter + (N-2) body chapters + 1 closing
 *   chapter (3 distinct title patterns total).
 * - Body titles rotate through BODY_TITLE_PATTERNS (3 patterns).
 * - Every chapter carries exactly 3 beat slots chosen from BEAT_SLOTS:
 *   opening uses INTRO_BEATS, body uses BODY_BEATS, closing uses CLOSING_BEATS
 *   (9 beat-slot definitions total).
 * - Long titles are truncated to MAX_TITLE_CHARS (80) characters.
 *
 * Deterministic: same inputs -> same outline, always. Zero imports.
 */

export const MIN_CHAPTERS = 3;
export const MAX_CHAPTERS = 30;
export const MAX_TITLE_CHARS = 80;

const BODY_TITLE_PATTERNS: string[] = [
  "Chapter {n}: Core Concept {k} — {titleShort}",
  "Chapter {n}: Putting {titleShort} into Practice",
  "Chapter {n}: {titleShort} Lessons from the Field",
];

const INTRO_BEATS: string[] = [
  "Hook — why {reader} picked up this book",
  "Scope — what this book will (and will not) teach you",
  "Roadmap — how {reader} should move through the chapters",
];

const BODY_BEATS: string[] = [
  "Core idea — the one concept this chapter teaches",
  "Example — a concrete scenario your {reader} will recognize",
  "Action step — what {reader} should do before the next chapter",
];

const CLOSING_BEATS: string[] = [
  "Recap — the biggest takeaways of the whole book",
  "30-day checklist — the steps {reader} takes next (you fill these in)",
  "Resources — where {reader} goes from here",
];

export interface OutlineRunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Parse a chapter count: accepts numbers and numeric strings; rejects the rest. */
function parseChapterCount(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/** Truncate a title to MAX_TITLE_CHARS without cutting mid-word when possible. */
export function truncateTitle(title: string): string {
  const t = title.trim();
  if (t.length <= MAX_TITLE_CHARS) return t;
  const cut = t.slice(0, MAX_TITLE_CHARS - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const head = (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd();
  return head + "…";
}

function fill(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const k of Object.keys(vars)) {
    out = out.split("{" + k + "}").join(vars[k]);
  }
  return out;
}

/**
 * runTool({ workingTitle, chapterCount, targetReader? })
 * -> { ok: true, values: { outline: string[] } }
 * -> { ok: false, error: '...' } on invalid/missing input.
 */
export function runTool(values: Record<string, unknown>): OutlineRunResult {
  if (!isRecord(values)) {
    return { ok: false, error: "Provide your inputs as an object." };
  }

  const workingTitle = readString(values.workingTitle);
  if (workingTitle.length === 0) {
    return { ok: false, error: "Enter a working title for your ebook." };
  }

  const count = parseChapterCount(values.chapterCount);
  if (count === null || !Number.isInteger(count) || count < MIN_CHAPTERS || count > MAX_CHAPTERS) {
    return {
      ok: false,
      error: `Chapter count must be a whole number between ${MIN_CHAPTERS} and ${MAX_CHAPTERS}.`,
    };
  }

  const rawReader = readString(values.targetReader);
  const reader = rawReader.length > 0 ? rawReader : "your readers";

  const titleShort = truncateTitle(workingTitle);
  const vars = { title: workingTitle, titleShort, reader };
  const outline: string[] = [];

  // Opening chapter.
  outline.push(
    `Chapter 1: ${titleShort} — The Quick-Start Overview\n` +
      INTRO_BEATS.map((b) => `• Beat — ${fill(b, vars)}`).join("\n")
  );

  // Body chapters (2 .. N-1) rotate through the 3 body title patterns.
  for (let n = 2; n < count; n++) {
    const pattern = BODY_TITLE_PATTERNS[(n - 2) % BODY_TITLE_PATTERNS.length];
    const title = fill(pattern, { ...vars, n: String(n), k: String(n - 1) });
    outline.push(
      `${title}\n` + BODY_BEATS.map((b) => `• Beat — ${fill(b, vars)}`).join("\n")
    );
  }

  // Closing chapter.
  outline.push(
    `Chapter ${count}: Your ${titleShort} Action Plan — Next 30 Days\n` +
      CLOSING_BEATS.map((b) => `• Beat — ${fill(b, vars)}`).join("\n")
  );

  return { ok: true, values: { outline } };
}
