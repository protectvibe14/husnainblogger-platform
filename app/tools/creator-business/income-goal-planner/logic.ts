/**
 * Income Goal Planner (tool-496) — pure logic, zero imports.
 *
 * HONESTY: pure arithmetic on the user's own targets — the outputs are
 * plan math (division/multiplication), NOT market data and NOT an
 * earnings promise. Labels and meta.ts copy say exactly this.
 *
 * Formulas (formulaRef J-INCOME-GOAL):
 *   grossTarget            = annualIncomeGoal + annualExpenses
 *   requiredMonthlyRevenue = grossTarget / 12
 *   clientsNeededPerMonth  = requiredMonthlyRevenue / avgClientValue
 *   weeklyTarget           = grossTarget / workWeeksPerYear
 *   gapAnnual              = grossTarget - currentIncomeAnnual  (only when provided)
 *   gapMonthly             = gapAnnual / 12
 *
 * Rules:
 *   - annualIncomeGoal: required, finite number >= 0.
 *   - annualExpenses: optional, defaults 0, finite number >= 0.
 *   - avgClientValue: required, finite number > 0 (it is a divisor).
 *   - workWeeksPerYear: optional, defaults to 48 (about 4 weeks off);
 *     when provided must be a whole number from 1 to 52.
 *   - currentIncomeAnnual: optional; when provided, finite number >= 0,
 *     and gapVsCurrent is computed; otherwise it is a "enter current
 *     income" prompt line.
 *   - Numeric strings (e.g. "60000") are coerced; NaN/Infinity/empty
 *     strings are rejected with a human message.
 *   - Deterministic: same inputs → same outputs, always.
 */

export const DEFAULT_WORK_WEEKS = 48;
export const MAX_WEEKS = 52;

export interface PlannerValues {
  requiredMonthlyRevenue: number;
  clientsNeededPerMonth: number;
  weeklyTarget: number;
  gapVsCurrent: string;
}

export interface RunResult {
  ok: boolean;
  values?: PlannerValues;
  error?: string;
}

/** Coerce a value to a finite number; null when missing/invalid. */
function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const v = value.trim().replace(/[$,\s]/g, "");
    if (v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Round to 2 decimals (money). */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Round to 1 decimal (clients per month). */
export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** "$72,000.00" — manual comma grouping, locale-independent (deterministic). */
export function formatMoney(n: number): string {
  const fixed = n.toFixed(2);
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${grouped}.${dec}`;
}

function requiredMoney(value: unknown, label: string, opts?: { gtZero?: boolean }): {
  ok: boolean;
  n?: number;
  error?: string;
} {
  const n = toNumber(value);
  if (n === null || (opts?.gtZero ? n <= 0 : n < 0))
    return {
      ok: false,
      error: opts?.gtZero
        ? `${label} must be a number greater than 0.`
        : `${label} must be a number of 0 or more.`,
    };
  return { ok: true, n };
}

export function runTool(values: Record<string, unknown>): RunResult {
  if (!values || typeof values !== "object")
    return { ok: false, error: "No inputs were provided." };

  const goal = requiredMoney(values.annualIncomeGoal, "Annual income goal");
  if (!goal.ok || goal.n === undefined) return { ok: false, error: goal.error };

  let expenses = 0;
  if (values.annualExpenses !== undefined && values.annualExpenses !== null && values.annualExpenses !== "") {
    const e = requiredMoney(values.annualExpenses, "Annual expenses");
    if (!e.ok || e.n === undefined) return { ok: false, error: e.error };
    expenses = e.n;
  }

  const clientValue = requiredMoney(values.avgClientValue, "Average client value", { gtZero: true });
  if (!clientValue.ok || clientValue.n === undefined) return { ok: false, error: clientValue.error };

  let workWeeks = DEFAULT_WORK_WEEKS;
  if (values.workWeeksPerYear !== undefined && values.workWeeksPerYear !== null && values.workWeeksPerYear !== "") {
    const w = toNumber(values.workWeeksPerYear);
    if (w === null || !Number.isInteger(w) || w < 1 || w > MAX_WEEKS)
      return { ok: false, error: `Work weeks per year must be a whole number between 1 and ${MAX_WEEKS}.` };
    workWeeks = w;
  }

  let current: number | null = null;
  if (values.currentIncomeAnnual !== undefined && values.currentIncomeAnnual !== null && values.currentIncomeAnnual !== "") {
    const c = requiredMoney(values.currentIncomeAnnual, "Current annual income");
    if (!c.ok || c.n === undefined) return { ok: false, error: c.error };
    current = c.n;
  }

  const grossTarget = goal.n + expenses;
  const requiredMonthlyRevenue = round2(grossTarget / 12);
  const clientsNeededPerMonth = round1(requiredMonthlyRevenue / clientValue.n);
  const weeklyTarget = round2(grossTarget / workWeeks);

  let gapVsCurrent: string;
  if (current === null) {
    gapVsCurrent = "Enter your current annual income above to see the gap vs your goal.";
  } else {
    const gapAnnual = round2(grossTarget - current);
    if (gapAnnual <= 0) {
      gapVsCurrent =
        `You already hit it: your current income of ${formatMoney(current)} meets or beats ` +
        `your gross target of ${formatMoney(grossTarget)} (goal + expenses).`;
    } else {
      gapVsCurrent =
        `Gap: ${formatMoney(gapAnnual)} per year (${formatMoney(round2(gapAnnual / 12))} per month) ` +
        `between your current income and your gross target — based on your own targets, not market data.`;
    }
  }

  return {
    ok: true,
    values: { requiredMonthlyRevenue, clientsNeededPerMonth, weeklyTarget, gapVsCurrent },
  };
}
