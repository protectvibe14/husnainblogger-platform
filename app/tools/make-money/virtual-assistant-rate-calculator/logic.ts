/**
 * Virtual Assistant Rate Calculator — pure logic (tool-077).
 *
 * HONESTY (non-negotiable):
 * - The rate table below is a SURVEY ESTIMATE by experience level and task
 *   complexity (overall span $15–$50/hr). It is NOT a verified 2026 market
 *   benchmark (spec: "needs_review before any 'verified' claim"). Every
 *   result is labeled an estimate and the table is USER-EDITABLE via
 *   hourlyLowOverride / hourlyHighOverride.
 * - Zero imports, zero network, zero DOM, no randomness. Pure arithmetic.
 * - Money rounds half-up to 2 decimals (USD).
 */

export type ExperienceLevel = "entry" | "intermediate" | "expert";
export type TaskComplexity = "basic" | "specialized";

export const EXPERIENCE_LEVELS: ExperienceLevel[] = ["entry", "intermediate", "expert"];
export const TASK_COMPLEXITIES: TaskComplexity[] = ["basic", "specialized"];

export interface RateBand {
  low: number;
  high: number;
}

/**
 * ESTIMATE table (survey estimates by level/region, labeled estimates,
 * user-editable). Overall span $15–$50/hr, matching the spec edge case.
 */
export const ESTIMATE_RATE_TABLE: Record<ExperienceLevel, Record<TaskComplexity, RateBand>> = {
  entry: { basic: { low: 15, high: 25 }, specialized: { low: 20, high: 30 } },
  intermediate: { basic: { low: 25, high: 35 }, specialized: { low: 30, high: 40 } },
  expert: { basic: { low: 35, high: 45 }, specialized: { low: 40, high: 50 } },
};

/** Round half-up to 2 decimals. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function fail(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export interface VaRateValues {
  hourlyLow: number;
  hourlyHigh: number;
  weeklyLow: number;
  weeklyHigh: number;
  /** Explains which numbers drove the result (estimates vs user overrides). */
  basis: string;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawLevel = values.experienceLevel;
  if (typeof rawLevel !== "string" || !(EXPERIENCE_LEVELS as string[]).includes(rawLevel)) {
    return fail("Choose an experience level: entry, intermediate, or expert.");
  }
  const experienceLevel = rawLevel as ExperienceLevel;

  const rawComplexity = values.tasksComplexity;
  if (typeof rawComplexity !== "string" || !(TASK_COMPLEXITIES as string[]).includes(rawComplexity)) {
    return fail("Choose a task complexity: basic or specialized.");
  }
  const tasksComplexity = rawComplexity as TaskComplexity;

  const hoursPerWeek = toFiniteNumber(values.hoursPerWeek);
  if (hoursPerWeek === null || hoursPerWeek <= 0) {
    return fail("Hours per week must be a number greater than 0.");
  }

  // Optional user overrides replace the whole hourly band.
  const hasLow =
    values.hourlyLowOverride !== undefined && values.hourlyLowOverride !== "" && values.hourlyLowOverride !== null;
  const hasHigh =
    values.hourlyHighOverride !== undefined && values.hourlyHighOverride !== "" && values.hourlyHighOverride !== null;
  if (hasLow !== hasHigh) {
    return fail("Provide both hourly overrides (low and high), or neither.");
  }

  let hourlyLow: number;
  let hourlyHigh: number;
  let basis: string;

  if (hasLow && hasHigh) {
    const lowO = toFiniteNumber(values.hourlyLowOverride);
    const highO = toFiniteNumber(values.hourlyHighOverride);
    if (lowO === null || lowO <= 0 || highO === null || highO <= 0) {
      return fail("Hourly overrides must be numbers greater than 0.");
    }
    if (highO < lowO) {
      return fail("The high hourly override must be greater than or equal to the low override.");
    }
    hourlyLow = roundMoney(lowO);
    hourlyHigh = roundMoney(highO);
    basis =
      "Your custom hourly band (user-set). No researched benchmark was used for this result.";
  } else {
    const band = ESTIMATE_RATE_TABLE[experienceLevel][tasksComplexity];
    hourlyLow = band.low;
    hourlyHigh = band.high;
    basis =
      "Survey estimates by level and task complexity ($15–$50/hr overall) — " +
      "not a verified 2026 market benchmark. Adjust to your region and market before quoting.";
  }

  const weeklyLow = roundMoney(hourlyLow * hoursPerWeek);
  const weeklyHigh = roundMoney(hourlyHigh * hoursPerWeek);

  const result: VaRateValues = { hourlyLow, hourlyHigh, weeklyLow, weeklyHigh, basis };
  return { ok: true, values: result as unknown as Record<string, unknown> };
}
