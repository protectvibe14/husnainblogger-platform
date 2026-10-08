/**
 * Posting Frequency Planner — pure logic.
 *
 * WHAT IT HONESTLY DOES:
 * Turns (postsPerWeek, selected formats, availableHours) into a weekly
 * posting plan using FIXED cadence rules. Posts are spread evenly across
 * Monday-Sunday, formats rotate in a fixed order (Reels -> Carousel ->
 * Stories), and each format gets a fixed task line from a task bank.
 *
 * It is a client-side rule engine. The per-post time figures are
 * ESTIMATES (documented below), not measured data. It cannot optimize to
 * your real Instagram analytics — it has no API access. It is NOT AI.
 *
 * FIXED DATA (documented):
 * - EFFORT_MINUTES: fixed effort estimates per post, in minutes.
 *   Reels = 90, Carousel = 60, Stories = 20. Estimates only.
 * - TASK_BANK: 3 fixed task lines, one per format.
 * - CONSISTENCY_TIPS: fixed bank of 6 tips; 4 are returned per run,
 *   chosen deterministically from postsPerWeek (rotation, not random).
 * - DAYS: Monday..Sunday; post days chosen by even spacing (deterministic).
 *
 * Deterministic: same inputs -> identical plan, always.
 * Zero imports, zero DOM, zero network, zero Math.random.
 */

export interface FormatSpec {
  /** Input id of the matching boolean checkbox in meta.ts. */
  inputId: string;
  label: string;
  effortMinutes: number;
  task: string;
}

/**
 * Fixed effort estimates per post (minutes) + fixed task lines.
 * EFFORT FIGURES ARE ESTIMATES — actual creation time varies by creator.
 * Bank size: 3 formats.
 */
export const FORMATS: ReadonlyArray<FormatSpec> = [
  { inputId: "formatReels", label: "Reel", effortMinutes: 90, task: "Film, edit, and caption 1 Reel" },
  { inputId: "formatCarousel", label: "Carousel", effortMinutes: 60, task: "Design and write 1 carousel" },
  { inputId: "formatStories", label: "Stories", effortMinutes: 20, task: "Record a set of 5-7 stories" },
];

export const DAY_NAMES: ReadonlyArray<string> = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const MIN_POSTS_PER_WEEK = 1;
export const MAX_POSTS_PER_WEEK = 14;
export const MAX_AVAILABLE_HOURS = 168; // hours in a week — hard sanity cap

/** Fixed consistency tips bank (size: 6). Deterministic rotation picks 4. */
export const CONSISTENCY_TIPS: ReadonlyArray<string> = [
  "Pick a cadence you can keep for 12 weeks — a slower plan you keep beats a fast plan you quit.",
  "Batch creation: film or design 2-3 posts in one session instead of starting from zero each day.",
  "Give every post a job (reach, saves, or DMs) so effort goes where it matters.",
  "Keep a simple backlog of 5-10 post ideas so a busy day never becomes a skipped day.",
  "Repurpose one strong post per week into another format instead of inventing everything twice.",
  "Review your saves-per-post monthly and make more of what earns saves, not just likes.",
];

export interface PlanRow {
  day: string;
  format: string;
  task: string;
}

/** Parse an integer within [min, max]; undefined when invalid. */
function parseIntInRange(raw: unknown, min: number, max: number): number | undefined {
  let n: number | undefined;
  if (typeof raw === "number" && Number.isFinite(raw)) n = raw;
  else if (typeof raw === "string" && /^\d+(\.\d+)?$/.test(raw.trim())) n = Number(raw.trim());
  if (n === undefined || !Number.isInteger(n) || n < min || n > max) return undefined;
  return n;
}

function parseHours(raw: unknown): number | undefined {
  let n: number | undefined;
  if (typeof raw === "number" && Number.isFinite(raw)) n = raw;
  else if (typeof raw === "string" && /^\d+(\.\d+)?$/.test(raw.trim())) n = Number(raw.trim());
  if (n === undefined || n <= 0 || n > MAX_AVAILABLE_HOURS) return undefined;
  return n;
}

/**
 * Build the weekly plan deterministically. Exported for tests.
 * Posts are spaced evenly across the 7 days; formats rotate in FORMATS order.
 */
export function buildPlan(postsPerWeek: number, formats: ReadonlyArray<FormatSpec>): {
  rows: PlanRow[];
  totalMinutes: number;
} {
  const rows: PlanRow[] = [];
  let totalMinutes = 0;
  for (let i = 0; i < postsPerWeek; i++) {
    const dayIndex = Math.round((i * 7) / postsPerWeek) % 7;
    const format = formats[i % formats.length];
    rows.push({ day: DAY_NAMES[dayIndex], format: format.label, task: format.task });
    totalMinutes += format.effortMinutes;
  }
  return { rows, totalMinutes };
}

/** Deterministic rotation through the tips bank starting at an offset. */
export function pickTips(postsPerWeek: number, count: number): string[] {
  const tips: string[] = [];
  const start = postsPerWeek % CONSISTENCY_TIPS.length;
  for (let i = 0; i < count; i++) {
    tips.push(CONSISTENCY_TIPS[(start + i) % CONSISTENCY_TIPS.length]);
  }
  return tips;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const postsPerWeek = parseIntInRange(values["postsPerWeek"], MIN_POSTS_PER_WEEK, MAX_POSTS_PER_WEEK);
  if (postsPerWeek === undefined) {
    return {
      ok: false,
      error: `Posts per week must be a whole number from ${MIN_POSTS_PER_WEEK} to ${MAX_POSTS_PER_WEEK}.`,
    };
  }

  const availableHours = parseHours(values["availableHours"]);
  if (availableHours === undefined) {
    return {
      ok: false,
      error: `Available hours must be a number greater than 0 (up to ${MAX_AVAILABLE_HOURS}).`,
    };
  }

  const selectedFormats = FORMATS.filter((f) => values[f.inputId] === true);
  if (selectedFormats.length === 0) {
    return {
      ok: false,
      error: "Select at least one format (Reels, Carousel, or Stories) to build your plan.",
    };
  }

  const { rows, totalMinutes } = buildPlan(postsPerWeek, selectedFormats);
  const availableMinutes = availableHours * 60;

  const workloadWarning =
    totalMinutes > availableMinutes
      ? `Workload warning: your plan needs about ${Math.round(totalMinutes / 60)}h per week but you only have ${availableHours}h available. Lower your posts per week or drop a heavy format.`
      : `Your plan fits your time: about ${Math.round(totalMinutes / 60)}h per week against your ${availableHours}h available.`;

  return {
    ok: true,
    values: {
      weeklyPlan: {
        columns: ["Day", "Format", "Task"],
        rows: rows.map((r) => [r.day, r.format, r.task]),
      },
      workloadWarning,
      consistencyTips: pickTips(postsPerWeek, 4),
    },
  };
}
