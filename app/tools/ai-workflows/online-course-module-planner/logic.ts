/**
 * Online Course Module Planner (tool-307) — pure logic.
 *
 * Honesty: this is GRID ARITHMETIC, not AI curriculum design. It arranges the
 * user's course topic into a standard module grid: each module gets a fixed
 * number of lesson slots (rotating through a fixed pattern) and lesson-name
 * TEMPLATES with placeholders the author must replace. No curriculum content
 * is invented.
 *
 * Fixed rules (documented):
 * - LESSONS_PER_MODULE_PATTERN: 3-slot rotation [4, 3, 5] lessons per module.
 * - LESSON_NAME_TEMPLATES: 3 templates, one assigned per module by rotation.
 * - Fractional lesson minutes are rounded UP (Math.ceil) — a 7.5-minute lesson
 *   becomes 8 minutes, never 7.
 * - Per-module estimate = lessons in module x rounded lesson minutes.
 *
 * Deterministic: same inputs -> same grid, always. Zero imports.
 */

export const MIN_MODULES = 2;
export const MAX_MODULES = 20;
export const MIN_LESSON_MINUTES = 1;
export const MAX_LESSON_MINUTES = 480;

/** Lessons-per-module rotation: 3 slots -> [4, 3, 5]. */
export const LESSONS_PER_MODULE_PATTERN: number[] = [4, 3, 5];

/** Lesson-name templates, one picked per module by rotation. */
export const LESSON_NAME_TEMPLATES: string[] = [
  "{topic}: Foundations, Part {k}",
  "Hands-On: {topic} in Action, Part {k}",
  "Walkthrough: {topic} Step by Step, Part {k}",
];

export interface GridTable {
  columns: string[];
  rows: string[][];
}

export interface ModulePlannerResult {
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

/** Parse a number: accepts numbers and numeric strings; rejects the rest. */
function parseNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * runTool({ courseTopic, moduleCount, lessonLengthMinutes })
 * -> { ok: true, values: { moduleGrid: GridTable, summary: string } }
 * -> { ok: false, error: '...' } on invalid/missing input.
 */
export function runTool(values: Record<string, unknown>): ModulePlannerResult {
  if (!isRecord(values)) {
    return { ok: false, error: "Provide your inputs as an object." };
  }

  const courseTopic = readString(values.courseTopic);
  if (courseTopic.length === 0) {
    return { ok: false, error: "Enter your course topic." };
  }

  const moduleCount = parseNumber(values.moduleCount);
  if (
    moduleCount === null ||
    !Number.isInteger(moduleCount) ||
    moduleCount < MIN_MODULES ||
    moduleCount > MAX_MODULES
  ) {
    return {
      ok: false,
      error: `Module count must be a whole number between ${MIN_MODULES} and ${MAX_MODULES}.`,
    };
  }

  const rawMinutes = parseNumber(values.lessonLengthMinutes);
  if (
    rawMinutes === null ||
    rawMinutes < MIN_LESSON_MINUTES ||
    rawMinutes > MAX_LESSON_MINUTES
  ) {
    return {
      ok: false,
      error: `Lesson length must be between ${MIN_LESSON_MINUTES} and ${MAX_LESSON_MINUTES} minutes.`,
    };
  }
  const lessonMinutes = Math.ceil(rawMinutes);

  const rows: string[][] = [];
  let totalLessons = 0;

  for (let m = 1; m <= moduleCount; m++) {
    const lessons = LESSONS_PER_MODULE_PATTERN[(m - 1) % LESSONS_PER_MODULE_PATTERN.length];
    const template = LESSON_NAME_TEMPLATES[(m - 1) % LESSON_NAME_TEMPLATES.length]
      .split("{topic}")
      .join(courseTopic)
      .split("{k}")
      .join(`1–${lessons}`);
    const moduleMinutes = lessons * lessonMinutes;
    totalLessons += lessons;
    rows.push([
      `Module ${m}`,
      `${template} (${lessons} lesson slots)`,
      String(lessons),
      `${moduleMinutes} min`,
    ]);
  }

  const totalMinutes = totalLessons * lessonMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const moduleGrid: GridTable = {
    columns: ["Module", "Lesson name template", "Lessons", "Est. duration"],
    rows,
  };

  const summary =
    `${courseTopic}: ${moduleCount} modules · ${totalLessons} lessons · ` +
    `≈${totalMinutes} min total (${hours}h ${mins}m). ` +
    "Lesson names are templates — write your own curriculum from them.";

  return { ok: true, values: { moduleGrid, summary } };
}
