/**
 * Project Timeline Estimator — pure logic (zero imports, zero network, zero DOM).
 *
 * Estimates a project end date from user-supplied task hour estimates.
 * The tool performs date arithmetic on YOUR estimates only — it knows
 * nothing about the project and makes no AI predictions.
 *
 * Formula J-PROJECT-TIMELINE (published in meta.ts content.methodology):
 *   totalHours       = sum(task.hoursEstimate)
 *   workDaysNeeded   = ceil(totalHours / workHoursPerDay)
 *   estimatedWorkDays = ceil(totalHours / workHoursPerDay + bufferDays)
 *   estimatedEndDate = startDate + estimatedWorkDays calendar days
 * Days are calendar days, not business days (weekends/holidays are NOT
 * skipped — stated in assumptions). All outputs are labeled as estimates
 * based on the user's own guesses.
 */

export interface TaskEstimate {
  name: string;
  hours: number;
}

export type ToolResult =
  | { ok: true; values: Record<string, unknown> }
  | { ok: false; error: string };

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Parse a numeric field that may arrive as a number or numeric string. */
function parseField(v: unknown): number | null {
  if (isFiniteNumber(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Parse the `tasks` input into validated task records.
 * Accepts either an array of { name, hours } records or a textarea string
 * with one task per line: "name, hours". Exported for tests.
 */
export function parseTasks(
  value: unknown,
): { ok: true; tasks: TaskEstimate[] } | { ok: false; error: string } {
  const records: Record<string, unknown>[] = [];
  if (Array.isArray(value)) {
    for (const r of value) records.push(r as Record<string, unknown>);
  } else {
    const text = clean(value);
    if (text.length === 0) {
      return { ok: false, error: "Add at least one task with its hour estimate." };
    }
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) {
      return { ok: false, error: "Add at least one task with its hour estimate." };
    }
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim());
      if (parts.length !== 2) {
        return {
          ok: false,
          error: `Task line ${i + 1}: use the format "task name, hours" (2 comma-separated values).`,
        };
      }
      records.push({ name: parts[0], hours: parts[1] === "" ? NaN : Number(parts[1]) });
    }
  }

  if (records.length === 0) {
    return { ok: false, error: "Add at least one task with its hour estimate." };
  }
  const tasks: TaskEstimate[] = [];
  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const label = Array.isArray(value) ? `Task ${i + 1}` : `Task line ${i + 1}`;
    if (!rec || typeof rec !== "object") {
      return { ok: false, error: `${label}: not a valid entry.` };
    }
    const name = clean(rec["name"]);
    if (name.length === 0) {
      return { ok: false, error: `${label}: task name is required.` };
    }
    const hours = parseField(rec["hours"]);
    if (hours === null || hours < 0) {
      return {
        ok: false,
        error: `${label} ("${name}"): hours must be a finite number, 0 or more.`,
      };
    }
    tasks.push({ name, hours });
  }
  return { ok: true, tasks };
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Validate a start date and return it as a UTC-midnight timestamp.
 * Exported for tests.
 */
export function parseStartDate(value: unknown): { ok: true; utcMs: number } | { ok: false; error: string } {
  const s = clean(value);
  if (s.length === 0) {
    return { ok: false, error: "Enter a start date." };
  }
  const m = DATE_RE.exec(s);
  if (!m) {
    return { ok: false, error: "Start date must be a valid date (YYYY-MM-DD)." };
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const utcMs = Date.UTC(y, mo - 1, d);
  const check = new Date(utcMs);
  if (
    check.getUTCFullYear() !== y ||
    check.getUTCMonth() !== mo - 1 ||
    check.getUTCDate() !== d
  ) {
    return { ok: false, error: "Start date must be a valid date (YYYY-MM-DD)." };
  }
  return { ok: true, utcMs };
}

function formatDate(utcMs: number): string {
  const d = new Date(utcMs);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/**
 * Tool logic slot (calculator). Called as runTool(values).
 * values: { tasks: string | TaskEstimate[], workHoursPerDay: number|string,
 *           startDate: string, bufferDays?: number|string }
 * Returns values.totalHours, values.estimatedWorkDays,
 * values.estimatedEndDate, values.taskBreakdown.
 */
export function runTool(values: Record<string, unknown>): ToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Enter your tasks, work hours per day, and a start date." };
  }

  const parsedTasks = parseTasks(values["tasks"]);
  if (!parsedTasks.ok) {
    return { ok: false, error: parsedTasks.error };
  }
  const tasks = parsedTasks.tasks;

  const workHoursPerDay = parseField(values["workHoursPerDay"]);
  if (workHoursPerDay === null || !isFiniteNumber(workHoursPerDay) || workHoursPerDay <= 0) {
    return { ok: false, error: "Work hours per day must be a finite number greater than 0." };
  }

  const parsedDate = parseStartDate(values["startDate"]);
  if (!parsedDate.ok) {
    return { ok: false, error: parsedDate.error };
  }

  const rawBuffer = values["bufferDays"];
  const bufferEmpty =
    rawBuffer === undefined ||
    rawBuffer === null ||
    (typeof rawBuffer === "string" && rawBuffer.trim() === "");
  let bufferDays = 0;
  if (!bufferEmpty) {
    const n = parseField(rawBuffer);
    if (n === null || n < 0) {
      return { ok: false, error: "Buffer days must be a finite number, 0 or more." };
    }
    bufferDays = n;
  }

  const totalHours = round2(tasks.reduce((sum, t) => sum + t.hours, 0));
  const estimatedWorkDays = Math.ceil(totalHours / workHoursPerDay + bufferDays);
  const endUtcMs = parsedDate.utcMs + estimatedWorkDays * 24 * 60 * 60 * 1000;
  const estimatedEndDate = formatDate(endUtcMs);

  const rows: string[][] = tasks.map((t) => {
    const share = totalHours > 0 ? `${round2((t.hours / totalHours) * 100)}%` : "—";
    return [t.name, `${t.hours} h`, share];
  });
  rows.push(["TOTAL", `${totalHours} h`, "100%"]);
  if (bufferDays === 0) {
    rows.push(["Note", "bufferDays = 0 — no buffer days added; consider adding 1–2", "—"]);
  }

  const taskBreakdown = {
    columns: ["Task", "Hours", "Share of total"],
    rows,
  };

  return {
    ok: true,
    values: { totalHours, estimatedWorkDays, estimatedEndDate, taskBreakdown },
  };
}
