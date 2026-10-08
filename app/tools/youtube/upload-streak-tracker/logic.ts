/**
 * Upload Streak Tracker — pure logic (tool-115).
 *
 * Computes upload-consistency stats from a manually logged list of upload
 * dates: current streak, longest streak, uploads-per-week rate, missed slots.
 *
 * ASSUMPTIONS (documented for honesty):
 * - Zero imports, no DOM, no network, no Date.now(), no Math.random.
 *   Deterministic: same inputs -> same outputs.
 * - Dates are compared as calendar days in UTC (date-only, timezone-safe):
 *   two uploads on the same YYYY-MM-DD count once; time-of-day is ignored.
 * - `today` is supplied by the caller (the UI layer passes the current date).
 *   When omitted it defaults to the latest logged upload date, so the
 *   analysis is "as of" the last upload. No future dates are allowed.
 * - Cadence "daily": streaks count consecutive upload DAYS. The current
 *   streak stays alive through today if the last upload was yesterday (you
 *   can still upload today); it breaks to 0 only when the last upload is
 *   older than yesterday.
 * - Cadence "weekly": streaks count consecutive ISO WEEKS (YYYY-Www) with at
 *   least one upload. Same anchor rule: alive through the current week if
 *   last upload was last week.
 * - weeklyRate = total uploads / span in 7-day windows, rounded to 2dp —
 *   an average, not a promise of future pace.
 * - Missed slots: scheduled slots (days/weeks) between the first upload and
 *   `today` with no logged upload. This is descriptive of the log, not a
 *   YouTube requirement — YouTube has no official "streak" rule.
 * - Manual date entry only; the UI layer owns localStorage persistence.
 * - MAX_DATES = 2000 per run (bounded).
 */

/** Max upload dates accepted per runTool call. */
export const MAX_DATES = 2000;

export type StreakCadence = "daily" | "weekly";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86400000;

export interface StreakStats {
  cadence: StreakCadence;
  currentStreak: number;
  longestStreak: number;
  totalUploads: number;
  weeklyRate: number;
  missedSlots: number;
  firstDate: string;
  analysisDate: string;
  duplicateCount: number;
}

/** Real-calendar ISO date check (rejects 2026-02-30 etc.). Returns UTC ms or null. */
export function parseDateUTC(s: string): number | null {
  if (typeof s !== "string" || !ISO_DATE.test(s)) return null;
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(5, 7));
  const d = Number(s.slice(8, 10));
  const t = Date.UTC(y, m - 1, d);
  const c = new Date(t);
  if (c.getUTCFullYear() !== y || c.getUTCMonth() !== m - 1 || c.getUTCDate() !== d) return null;
  return t;
}

/** Monotonic ISO-week index (weekYear * 53 + week) — safe across year boundaries. */
export function isoWeekIndex(dateStr: string): number {
  const ms = parseDateUTC(dateStr) as number;
  const t = new Date(ms);
  const day = (t.getUTCDay() + 6) % 7; // Mon=0
  t.setUTCDate(t.getUTCDate() - day + 3); // Thursday of this week
  const weekYear = t.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(weekYear, 0, 4));
  const fday = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fday + 3);
  const week = 1 + Math.round((t.getTime() - firstThursday.getTime()) / (7 * DAY_MS));
  return weekYear * 53 + week;
}

/** Count a run of consecutive integers ending at `anchor` (inclusive) within `set`. */
function runBackFrom(set: Set<number>, anchor: number): number {
  let n = 0;
  while (set.has(anchor - n)) n++;
  return n;
}

/** Longest run of consecutive integers in a sorted array. */
function longestRun(sorted: number[]): number {
  let best = 0;
  let cur = 0;
  let prev = Number.NaN;
  for (const v of sorted) {
    cur = v === prev + 1 ? cur + 1 : 1;
    if (cur > best) best = cur;
    prev = v;
  }
  return best;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Core date math. `dates` must be valid, deduped, sorted-ascending ISO dates;
 * `today` a valid ISO date >= the latest entry. Throws on bad input.
 */
export function analyzeStreak(
  dates: string[],
  opts: { today: string; cadence: StreakCadence },
): StreakStats {
  const todayMs = parseDateUTC(opts.today);
  if (todayMs === null) throw new Error(`Invalid analysis date: ${opts.today}`);
  const todayNum = todayMs / DAY_MS;

  const dayNums = [...new Set(dates.map((d) => (parseDateUTC(d) as number) / DAY_MS))].sort((a, b) => a - b);
  const totalUploads = dayNums.length;
  const latest = dayNums[dayNums.length - 1];
  if (latest > todayNum) throw new Error("Upload dates cannot be in the future relative to the analysis date.");

  const duplicateCount = dates.length - totalUploads;
  const firstDate = dates.reduce((a, b) => (a < b ? a : b));

  let currentStreak: number;
  let longestStreak: number;
  let missedSlots: number;

  if (opts.cadence === "daily") {
    const set = new Set(dayNums);
    const anchor = set.has(todayNum) ? todayNum : todayNum - 1;
    currentStreak = set.has(anchor) ? runBackFrom(set, anchor) : 0;
    longestStreak = longestRun(dayNums);
    const spanDays = todayNum - dayNums[0] + 1;
    missedSlots = spanDays - totalUploads;
  } else {
    const weeks = [...new Set(dayNums.map((n) => isoWeekIndex(new Date(n * DAY_MS).toISOString().slice(0, 10))))].sort(
      (a, b) => a - b,
    );
    const todayWeek = isoWeekIndex(opts.today);
    const wset = new Set(weeks);
    const anchor = wset.has(todayWeek) ? todayWeek : todayWeek - 1;
    currentStreak = wset.has(anchor) ? runBackFrom(wset, anchor) : 0;
    longestStreak = longestRun(weeks);
    const spanWeeks = todayWeek - weeks[0] + 1;
    missedSlots = spanWeeks - weeks.length;
  }

  const spanDays = todayNum - dayNums[0] + 1;
  const weeklyRate = round2(totalUploads / Math.max(spanDays / 7, 1 / 7));

  return {
    cadence: opts.cadence,
    currentStreak,
    longestStreak,
    totalUploads,
    weeklyRate,
    missedSlots,
    firstDate,
    analysisDate: opts.today,
    duplicateCount,
  };
}

export interface StreakResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Platform adapter: runTool({ dates, cadence?, today? }).
 * `dates` = manually logged ["YYYY-MM-DD", ...]; `today` optional
 * (defaults to the latest logged date). The UI layer owns persistence.
 */
export function runTool(values: Record<string, unknown>): StreakResult {
  if (!values || typeof values !== "object") return { ok: false, error: "No inputs were provided." };

  // TrackerTemplate log-mode passes { items: [{ date: "YYYY-MM-DD", ... }] }.
  // Accept it here so the same tested engine serves both call shapes.
  const rawItems = (values as { items?: unknown }).items;
  const valuesWithDates =
    (values as { dates?: unknown }).dates === undefined && Array.isArray(rawItems)
      ? {
          ...values,
          dates: rawItems.map((it) =>
            typeof it === "string" ? it : (it as { date?: unknown }).date,
          ),
        }
      : values;

  const rawDates = (valuesWithDates as { dates?: unknown }).dates;
  if (!Array.isArray(rawDates) || rawDates.length === 0) {
    return { ok: false, error: "Log at least one upload date (YYYY-MM-DD) before running." };
  }
  if (rawDates.length > MAX_DATES) return { ok: false, error: `Too many dates (max ${MAX_DATES}).` };

  const cadenceRaw = (values as { cadence?: unknown }).cadence;
  const cadence: StreakCadence = cadenceRaw === "weekly" ? "weekly" : "daily";
  if (typeof cadenceRaw === "string" && cadenceRaw !== "daily" && cadenceRaw !== "weekly") {
    return { ok: false, error: 'Cadence must be "daily" or "weekly".' };
  }

  const dates: string[] = [];
  for (let i = 0; i < rawDates.length; i++) {
    const d = rawDates[i];
    if (typeof d !== "string" || parseDateUTC(d) === null) {
      return { ok: false, error: `Date ${i + 1}: must be a valid calendar date (YYYY-MM-DD).` };
    }
    dates.push(d);
  }
  dates.sort();

  const todayRaw = (values as { today?: unknown }).today;
  const today = typeof todayRaw === "string" && todayRaw !== "" ? todayRaw : dates[dates.length - 1];
  if (parseDateUTC(today) === null) {
    return { ok: false, error: "Analysis date must be a valid calendar date (YYYY-MM-DD)." };
  }
  if (today < dates[dates.length - 1]) {
    return { ok: false, error: "Analysis date cannot be earlier than your latest logged upload." };
  }

  let stats: StreakStats;
  try {
    stats = analyzeStreak(dates, { today, cadence });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not analyze the dates." };
  }

  const unit = cadence === "daily" ? "day" : "week";
  const plural = (n: number) => (n === 1 ? unit : unit + "s");
  const summary =
    `${cadence === "daily" ? "Daily" : "Weekly"} cadence · current streak: ${stats.currentStreak} ${plural(stats.currentStreak)}` +
    ` · longest: ${stats.longestStreak} ${plural(stats.longestStreak)} · ${stats.weeklyRate} uploads/week` +
    ` · ${stats.missedSlots} missed ${stats.missedSlots === 1 ? (cadence === "daily" ? "day" : "week") : cadence === "daily" ? "days" : "weeks"}` +
    ` since ${stats.firstDate}.`;

  const guidance: string[] = [];
  if (stats.totalUploads === 1) {
    guidance.push("Only one upload logged — log more dates to see real streaks and rates.");
  }
  if (stats.currentStreak === 0) {
    guidance.push(
      `Your ${unit}ly streak is broken — the last logged upload is older than last ${unit}. Log a new upload to restart it.`,
    );
  }
  if (stats.duplicateCount > 0) {
    guidance.push(`${stats.duplicateCount} duplicate date${stats.duplicateCount === 1 ? " was" : "s were"} merged — one upload per day counts.`);
  }
  guidance.push("Dates are compared as calendar days (UTC); uploads on the same day count once regardless of time zone.");
  guidance.push(
    "Manual log only — these stats describe the dates you entered here. YouTube has no official upload-streak rule; consistency is a planning habit, not a platform requirement.",
  );

  return {
    ok: true,
    values: {
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      totalUploads: stats.totalUploads,
      weeklyRate: stats.weeklyRate,
      missedSlots: stats.missedSlots,
      summary,
      guidance,
    },
  };
}
