/**
 * Webinar Revenue Estimator — pure logic (tool-095).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Pure deterministic arithmetic.
 * - This is a SCENARIO PROJECTION on the user's own inputs, not a forecast.
 *   Show-up and offer-conversion rates are USER-ENTERED (or clearly labeled
 *   estimates); the tool carries no "verified 2026" benchmarks and invents
 *   none. The UI must say so.
 * - Funnel order: registrants -> attendees (show-up rate) -> buyers
 *   (offer conversion on ATTENDEES).
 * - Attendees and buyers are rounded to integers; revenue rounds half-up to
 *   2 decimals.
 */

export interface WebinarRevenueInput {
  /** Number of registrants. Integer > 0. */
  registrants: number;
  /** Show-up rate percent, 0-100 (USER-ENTERED, not a verified benchmark). */
  showUpRate: number;
  /** Attendee-to-buyer conversion percent, 0-100 (USER-ENTERED). */
  offerConversionRate: number;
  /** Offer price in USD. > 0. */
  offerPrice: number;
}

export interface WebinarRevenueResult {
  /** Projected attendees (integer). */
  attendees: number;
  /** Projected buyers (integer). */
  buyers: number;
  /** Estimated revenue: buyers * offer price (2 decimals). */
  estimatedRevenue: number;
  /** Funnel table { columns, rows } for the funnel-table template. */
  funnelSteps: { columns: string[]; rows: string[][] };
  /** Honesty label that must be shown with the result. */
  projectionLabel: string;
}

/** Label the UI must show alongside the estimate (honesty contract). */
export const PROJECTION_LABEL =
  "Scenario projection from YOUR inputs — show-up and conversion rates are user-entered estimates, not verified benchmarks. Not a forecast or guarantee.";

/** Round to 2 decimals, half-up (values here are non-negative). */
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
 * Estimate webinar revenue from the user's funnel inputs.
 *
 * @param values - registrants, showUpRate, offerConversionRate, offerPrice.
 * @returns { ok: true, values } or { ok: false, error } with a human message.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  let input: WebinarRevenueInput;
  try {
    const registrants = readNumber("registrants", values["registrants"]);
    const showUpRate = readPercent("showUpRate", values["showUpRate"]);
    const offerConversionRate = readPercent("offerConversionRate", values["offerConversionRate"]);
    const offerPrice = readNumber("offerPrice", values["offerPrice"]);

    if (!Number.isInteger(registrants) || registrants <= 0) {
      throw new RangeError(`registrants must be a positive integer (got ${registrants}).`);
    }
    if (offerPrice <= 0) {
      throw new RangeError(`offerPrice must be greater than 0 (got ${offerPrice}).`);
    }
    input = { registrants, showUpRate, offerConversionRate, offerPrice };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  const attendees = Math.round((input.registrants * input.showUpRate) / 100);
  const buyers = Math.round((attendees * input.offerConversionRate) / 100);
  const estimatedRevenue = round2(buyers * input.offerPrice);

  const money = (n: number): string => `$${n.toFixed(2)}`;
  const result: WebinarRevenueResult = {
    attendees,
    buyers,
    estimatedRevenue,
    funnelSteps: {
      columns: ["Funnel stage", "Value"],
      rows: [
        ["Registrants", String(input.registrants)],
        ["Attendees", String(attendees)],
        ["Buyers", String(buyers)],
        ["Estimated revenue", money(estimatedRevenue)],
      ],
    },
    projectionLabel: PROJECTION_LABEL,
  };
  return { ok: true, values: { ...result } };
}
