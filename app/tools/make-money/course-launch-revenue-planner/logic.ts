/**
 * Course Launch Revenue Planner — pure logic (tool-092).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Pure deterministic arithmetic.
 * - This is a SCENARIO PROJECTION on the user's own inputs, not a forecast.
 *   All conversion benchmarks are USER-ENTERED; the tool invents no
 *   "typical" open/conversion/refund rates. The UI must label results as
 *   projections, not predictions or guarantees.
 * - Funnel order: list -> opened -> bought. The sales conversion rate is
 *   applied to OPENED emails (open-to-sale), per the spec formula.
 * - Buyers are rounded to an integer; money rounds half-up to 2 decimals.
 */

export interface LaunchPlannerInput {
  /** Email list size. Integer > 0. */
  emailListSize: number;
  /** Open rate percent, 0-100. */
  openRate: number;
  /** Open-to-sale conversion percent, 0-100 (USER-ENTERED, no invented benchmark). */
  salesConversionRate: number;
  /** Course price in USD. > 0. */
  coursePrice: number;
  /** Refund rate percent, 0-100. */
  refundRate: number;
}

export interface LaunchPlannerResult {
  /** Projected buyers (integer). */
  projectedBuyers: number;
  /** Gross revenue: buyers * price (2 decimals). */
  grossRevenue: number;
  /** Net revenue after refunds (2 decimals). */
  netRevenue: number;
  /** Funnel table { columns, rows } for the funnel-table template. */
  funnelSteps: { columns: string[]; rows: string[][] };
  /** Honesty label that must be shown with the result. */
  projectionLabel: string;
}

/** Label the UI must show alongside the projection (honesty contract). */
export const PROJECTION_LABEL =
  "Scenario projection from YOUR inputs — not a prediction or revenue guarantee.";

/** Round to 2 decimals, half-up (inputs here are non-negative). */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function readNumber(name: string, value: unknown): number {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof n !== "number" || Number.isNaN(n)) {
    throw new TypeError(`${name} must be a number (got ${String(value)}).`);
  }
  if (!Number.isFinite(n)) {
    throw new TypeError(`${name} must be finite (got ${String(value)}).`);
  }
  return n;
}

function readPercent(name: string, value: unknown): number {
  const n = readNumber(name, value);
  if (n < 0 || n > 100) {
    throw new RangeError(`${name} must be between 0 and 100 (got ${n}).`);
  }
  return n;
}

/**
 * Project launch revenue from the user's funnel inputs.
 *
 * @param values - emailListSize, openRate, salesConversionRate, coursePrice, refundRate.
 * @returns { ok: true, values } or { ok: false, error } with a human message.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  let input: LaunchPlannerInput;
  try {
    const emailListSize = readNumber("emailListSize", values["emailListSize"]);
    const openRate = readPercent("openRate", values["openRate"]);
    const salesConversionRate = readPercent("salesConversionRate", values["salesConversionRate"]);
    const coursePrice = readNumber("coursePrice", values["coursePrice"]);
    const refundRate = readPercent("refundRate", values["refundRate"]);

    if (!Number.isInteger(emailListSize) || emailListSize <= 0) {
      throw new RangeError(`emailListSize must be a positive integer (got ${emailListSize}).`);
    }
    if (coursePrice <= 0) {
      throw new RangeError(`coursePrice must be greater than 0 (got ${coursePrice}).`);
    }
    input = { emailListSize, openRate, salesConversionRate, coursePrice, refundRate };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  const opened = Math.round((input.emailListSize * input.openRate) / 100);
  const projectedBuyers = Math.round((opened * input.salesConversionRate) / 100);
  const grossRevenue = round2(projectedBuyers * input.coursePrice);
  const refunds = round2((grossRevenue * input.refundRate) / 100);
  const netRevenue = round2(grossRevenue - refunds);

  const money = (n: number): string => `$${n.toFixed(2)}`;
  const result: LaunchPlannerResult = {
    projectedBuyers,
    grossRevenue,
    netRevenue,
    funnelSteps: {
      columns: ["Funnel stage", "Value"],
      rows: [
        ["Email list size", String(input.emailListSize)],
        ["Opened emails", String(opened)],
        ["Projected buyers", String(projectedBuyers)],
        ["Gross revenue", money(grossRevenue)],
        ["Refunds", money(refunds)],
        ["Net revenue", money(netRevenue)],
      ],
    },
    projectionLabel: PROJECTION_LABEL,
  };
  return { ok: true, values: { ...result } };
}
