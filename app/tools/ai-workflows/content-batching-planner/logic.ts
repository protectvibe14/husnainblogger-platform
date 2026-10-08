/**
 * Content Batching Planner — pure logic.
 *
 * WHAT IT HONESTLY DOES:
 * Schedules YOUR content batch into a task-by-task calendar grid. It does
 * NOT write or produce any content — it takes the number of pieces you plan
 * to batch, your batch day, and your platforms, then lays out every piece as
 * a fixed sequence of task blocks (outline → draft → edit → visuals →
 * captions/SEO → schedule/publish) with estimated times and a rotating
 * platform assignment. You bring the topics; the tool brings the schedule.
 *
 * FIXED WORD BANKS (documented):
 * - TASK_BANK: 6 tasks. Every piece gets all 6, in this exact order.
 * - DAYS_OF_WEEK: 7 days (Monday..Sunday), user selects one as batch day.
 * - BLOCK_MINUTES: 30 — each task block is a fixed 30-minute estimate.
 * - PLATFORM SLOTS: up to 6 user-supplied platform names, assigned to
 *   pieces by pure rotation: piece i -> platforms[i % platforms.length].
 * - Time math: block index b -> start time 9:00 AM + b * 30 min
 *   (pure arithmetic on block index, no dates beyond the chosen weekday).
 *
 * Deterministic: same (piecesPerBatch, batchDay, platforms) -> identical
 * grid, always. Zero imports, zero DOM, zero network, zero Math.random.
 */

/** Fixed production tasks every piece goes through, in order (size: 6). */
export const TASK_BANK: ReadonlyArray<string> = [
  "Outline the piece",
  "Draft the content",
  "Edit and polish",
  "Create or source visuals",
  "Write captions and SEO fields",
  "Schedule and publish",
];

/** Weekday options for the batch day (size: 7). */
export const DAYS_OF_WEEK: ReadonlyArray<string> = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/** Fixed estimate per task block, in minutes. */
export const BLOCK_MINUTES = 30;

/** Batch day starts at 9:00 AM (minutes after midnight = 540). */
export const DAY_START_MINUTES = 9 * 60;

export const MIN_PIECES = 1;
export const MAX_PIECES = 50;
export const MIN_PLATFORMS = 1;
export const MAX_PLATFORMS = 6;
export const MAX_PLATFORM_LENGTH = 40;
export const MAX_BATCH_DAY_LENGTH = 20;

export interface BatchCalendarGrid {
  columns: string[];
  rows: string[][];
}

interface ParsedInputs {
  pieces: number;
  batchDay: string;
  platforms: string[];
}

/** Coerce a value to an integer in [min, max], or undefined. */
function parseIntInRange(raw: unknown, min: number, max: number): number | undefined {
  let n: number | undefined;
  if (typeof raw === "number" && Number.isInteger(raw)) n = raw;
  else if (typeof raw === "string" && /^\d+$/.test(raw.trim())) n = Number(raw.trim());
  if (n === undefined || n < min || n > max) return undefined;
  return n;
}

/** Split a raw platforms value (string or string[]) into clean names. */
function parsePlatforms(raw: unknown): string[] | undefined {
  let tokens: string[];
  if (typeof raw === "string") {
    tokens = raw.split(/[,;\n]+/);
  } else if (Array.isArray(raw)) {
    if (!raw.every((t) => typeof t === "string")) return undefined;
    tokens = raw as string[];
  } else {
    return undefined;
  }
  const cleaned = tokens
    .map((t) => t.replace(/\s+/g, " ").trim())
    .filter((t) => t.length > 0);
  // Dedupe case-insensitively, keep first occurrence.
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const t of cleaned) {
    const key = t.toLowerCase();
    if (t.length > MAX_PLATFORM_LENGTH || seen.has(key)) continue;
    seen.add(key);
    unique.push(t);
  }
  if (unique.length < MIN_PLATFORMS || unique.length > MAX_PLATFORMS) return undefined;
  return unique;
}

/** Validate the three inputs; returns parsed values or an error message. */
function validate(values: Record<string, unknown>): { parsed: ParsedInputs } | { error: string } {
  const pieces = parseIntInRange(values["piecesPerBatch"], MIN_PIECES, MAX_PIECES);
  if (pieces === undefined) {
    return {
      error: `Pieces per batch must be a whole number from ${MIN_PIECES} to ${MAX_PIECES}.`,
    };
  }

  const rawDay = values["batchDay"];
  const batchDay =
    typeof rawDay === "string" && rawDay.length <= MAX_BATCH_DAY_LENGTH
      ? rawDay.trim()
      : undefined;
  if (!batchDay || DAYS_OF_WEEK.indexOf(batchDay) === -1) {
    return {
      error: `Please pick a batch day from: ${DAYS_OF_WEEK.join(", ")}.`,
    };
  }

  const platforms = parsePlatforms(values["platforms"]);
  if (!platforms) {
    return {
      error: `Please list ${MIN_PLATFORMS} to ${MAX_PLATFORMS} platforms (comma-separated, each up to ${MAX_PLATFORM_LENGTH} characters).`,
    };
  }

  return { parsed: { pieces, batchDay, platforms } };
}

/** Format minutes-after-midnight as "9:00 AM". */
function formatTime(totalMinutes: number): string {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const suffix = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = m < 10 ? "0" + m : "" + m;
  return `${h12}:${mm} ${suffix}`;
}

/** "Block 3" label plus its 30-minute window, e.g. "9:30 AM - 10:00 AM". */
function blockWindow(blockIndex: number): string {
  const start = DAY_START_MINUTES + blockIndex * BLOCK_MINUTES;
  const end = start + BLOCK_MINUTES;
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const checked = validate(values);
  if ("error" in checked) return { ok: false, error: checked.error };
  const { pieces, batchDay, platforms } = checked.parsed;

  const columns = ["Piece", "Task", "Batch day", "Time slot", "Est. time", "Platform"];
  const rows: string[][] = [];
  let block = 0;
  for (let piece = 1; piece <= pieces; piece++) {
    const platform = platforms[(piece - 1) % platforms.length];
    for (let t = 0; t < TASK_BANK.length; t++) {
      rows.push([
        `Piece ${piece}`,
        TASK_BANK[t],
        batchDay,
        blockWindow(block),
        `${BLOCK_MINUTES} min`,
        platform,
      ]);
      block++;
    }
  }

  const totalBlocks = pieces * TASK_BANK.length;
  const totalMinutes = totalBlocks * BLOCK_MINUTES;
  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;
  const totalLabel =
    totalHours > 0
      ? `${totalHours}h${remMinutes > 0 ? ` ${remMinutes}m` : ""}`
      : `${remMinutes}m`;

  const summary =
    `Batch day: ${batchDay}. ${pieces} ${pieces === 1 ? "piece" : "pieces"} x ` +
    `${TASK_BANK.length} tasks = ${totalBlocks} task blocks at ${BLOCK_MINUTES} minutes each ` +
    `(about ${totalLabel} of focused work). Pieces rotate across your platforms: ` +
    `${platforms.join(", ")}. This plan schedules the work — you still write each piece yourself.`;

  return {
    ok: true,
    values: {
      batchCalendar: { columns, rows } as BatchCalendarGrid,
      planSummary: summary,
    },
  };
}
