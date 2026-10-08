/**
 * Shoot Day-Rate Planner — pure logic (tool-482).
 *
 * FORMULA J-DAY-RATE (published, arithmetic only):
 *   baseDayRate          = (annualIncomeTarget + annualExpenses) / shootDaysPerYear
 *   perShootCosts        = assistantCostsPerShoot + gearRentalPerShoot
 *   recommendedShootDayRate = baseDayRate + perShootCosts
 *
 * ASSUMPTIONS (honesty contract):
 * - Every input is USER-PROVIDED. There is no market-rate data here, so the
 *   result says what YOU need to charge to hit your own targets — not what
 *   clients will pay.
 * - Per-shoot costs (assistant, gear rental) are added on top of the base day
 *   rate, i.e. they are assumed to be billed to the client per shoot day.
 * - The capacity check assumes every planned shoot day gets booked and paid.
 * - Money values round to the nearest cent (half-up).
 * - Zero imports, zero network, zero DOM, no Math.random. Deterministic:
 *   same inputs -> same outputs, always.
 */

/** Result keys returned in `values` (must match meta.ts `outputs`). */
export const OUTPUT_IDS = [
  "recommendedShootDayRate",
  "perShootCostBreakdown",
  "annualCapacityCheck",
] as const;

/** Round to the nearest cent, half-up. */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Format a number as a plain USD string (no locale dependence). */
export function formatUSD(value: number): string {
  return "$" + value.toFixed(2);
}

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function readNumber(
  values: Record<string, unknown>,
  id: string,
  label: string,
  opts: { required: boolean; min: number; minExclusive?: boolean; max?: number },
): number | undefined {
  const raw = values[id];
  if (isMissing(raw)) {
    if (opts.required) {
      throw new Error(`${label} is required.`);
    }
    return undefined;
  }
  if (typeof raw !== "number") {
    throw new Error(`${label} must be a number.`);
  }
  if (Number.isNaN(raw)) {
    throw new Error(`${label} must be a number (got NaN).`);
  }
  if (!Number.isFinite(raw)) {
    throw new Error(`${label} must be a finite number.`);
  }
  const belowMin = opts.minExclusive ? raw <= opts.min : raw < opts.min;
  if (belowMin) {
    throw new Error(
      opts.minExclusive
        ? `${label} must be greater than ${opts.min}.`
        : `${label} must be ${opts.min} or more.`,
    );
  }
  if (opts.max !== undefined && raw > opts.max) {
    throw new Error(`${label} must be ${opts.max} or less.`);
  }
  return raw;
}

export interface ShootDayRateResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Plan a photography shoot day rate from the user's own targets and costs.
 *
 * @param values - annualIncomeTarget (required, > 0),
 *   shootDaysPerYear (required, > 0), annualExpenses (>= 0, default 0),
 *   assistantCostsPerShoot (>= 0, default 0), gearRentalPerShoot (>= 0, default 0).
 * @returns { ok: true, values } with recommendedShootDayRate (currency),
 *   perShootCostBreakdown (table), annualCapacityCheck (text);
 *   or { ok: false, error } with a human-readable message.
 */
export function runTool(values: Record<string, unknown>): ShootDayRateResult {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return { ok: false, error: "Input must be an object of field values." };
  }

  let annualIncomeTarget: number;
  let shootDaysPerYear: number;
  let annualExpenses = 0;
  let assistantCostsPerShoot = 0;
  let gearRentalPerShoot = 0;

  try {
    annualIncomeTarget = readNumber(values, "annualIncomeTarget", "Annual income target", {
      required: true,
      min: 0,
      minExclusive: true,
    }) as number;
    shootDaysPerYear = readNumber(values, "shootDaysPerYear", "Shoot days per year", {
      required: true,
      min: 0,
      minExclusive: true,
    }) as number;
    annualExpenses =
      readNumber(values, "annualExpenses", "Annual expenses", { required: false, min: 0 }) ?? 0;
    assistantCostsPerShoot =
      readNumber(values, "assistantCostsPerShoot", "Assistant costs per shoot", {
        required: false,
        min: 0,
      }) ?? 0;
    gearRentalPerShoot =
      readNumber(values, "gearRentalPerShoot", "Gear rental per shoot", {
        required: false,
        min: 0,
      }) ?? 0;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }

  const baseDayRate = (annualIncomeTarget + annualExpenses) / shootDaysPerYear;
  const perShootCosts = assistantCostsPerShoot + gearRentalPerShoot;
  const recommendedShootDayRate = roundToCents(baseDayRate + perShootCosts);
  const annualBookedRevenue = roundToCents(recommendedShootDayRate * shootDaysPerYear);
  const annualPerShootCosts = roundToCents(perShootCosts * shootDaysPerYear);

  const perShootCostBreakdown = {
    columns: ["Cost item", "Amount (USD)"],
    rows: [
      ["Day-rate share (income target + expenses, per shoot day)", formatUSD(roundToCents(baseDayRate))],
      ["Assistant costs per shoot", formatUSD(roundToCents(assistantCostsPerShoot))],
      ["Gear rental per shoot", formatUSD(roundToCents(gearRentalPerShoot))],
      ["Recommended shoot day rate (total)", formatUSD(recommendedShootDayRate)],
    ],
  };

  const annualCapacityCheck =
    `At ${formatUSD(recommendedShootDayRate)} per day across ${shootDaysPerYear} shoot days, ` +
    `your booked revenue would be ${formatUSD(annualBookedRevenue)} — covering your ` +
    `${formatUSD(roundToCents(annualIncomeTarget))} income target, ` +
    `${formatUSD(roundToCents(annualExpenses))} annual expenses, and ` +
    `${formatUSD(annualPerShootCosts)} of per-shoot costs (assistant + gear). ` +
    `This assumes every planned shoot day gets booked and paid. ` +
    `ESTIMATE from your own numbers, not market data.`;

  return {
    ok: true,
    values: {
      recommendedShootDayRate,
      perShootCostBreakdown,
      annualCapacityCheck,
    },
  };
}
