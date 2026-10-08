/**
 * Patreon Earnings Estimator — pure logic (tool-086).
 *
 * Pure TypeScript: zero imports, zero network, zero DOM, zero randomness.
 * Deterministic: identical inputs always produce identical outputs.
 *
 * FORMULA (spec data/formulas/formulas-B.json :: tool-086):
 *   gross                 = patrons * avg_pledge
 *   platform_fee          = gross * plan_rate
 *   processing_fees       = patrons * per_pledge_fee(avg_pledge)
 *     per_pledge_fee(p)   = p > 3 ? p * 0.029 + 0.30 : p * 0.05 + 0.10
 *   estimated_net_monthly = gross - platform_fee - processing_fees
 *
 * PLAN RATES (platform fee applied to gross):
 *   "Standard 10% (new pages)" -> 0.10
 *   "Legacy Lite 5%"           -> 0.05
 *   "Legacy Pro 8%"            -> 0.08
 *   "Legacy Premium 12%"       -> 0.12
 *
 * HONESTY (non-negotiable):
 * - Platform fee schedules CHANGE. The rates above are the schedule captured
 *   in the spec (sourceDate 2026-10-01). Every fee-derived figure is an
 *   ESTIMATE — verify the current fee schedule on Patreon's pricing page
 *   before relying on these numbers.
 * - Processing fees are charged per individual pledge; applying the average
 *   pledge to every patron is an approximation (exact only when all pledges
 *   are equal).
 * - New pages pay a flat 10%; legacy tiers are preserved only for older
 *   pages. The tool trusts whichever plan the user selects.
 * - USD only. No currency conversion, no taxes, no payout/withdrawal fees.
 *
 * Rounding: half-up to 2 decimals (USD) on every money output.
 */

/** Plan option labels (match meta.ts select options exactly). */
export const PATREON_PLAN_OPTIONS: ReadonlyArray<{ label: string; rate: number }> = [
  { label: "Standard 10% (new pages)", rate: 0.1 },
  { label: "Legacy Lite 5%", rate: 0.05 },
  { label: "Legacy Pro 8%", rate: 0.08 },
  { label: "Legacy Premium 12%", rate: 0.12 },
];

/** Pledge threshold (USD) that selects the processing-fee tier. */
export const PROCESSING_THRESHOLD = 3;
/** Processing rate for pledges OVER $3: 2.9% + $0.30. */
export const PROCESSING_OVER_RATE = 0.029;
export const PROCESSING_OVER_FIXED = 0.3;
/** Processing rate for pledges AT OR UNDER $3: 5% + $0.10. */
export const PROCESSING_UNDER_RATE = 0.05;
export const PROCESSING_UNDER_FIXED = 0.1;

export interface PatreonEarningsInput {
  /** Paying patrons. Integer > 0. */
  patrons: number;
  /** Average pledge per patron in USD. Number > 0. */
  avgPledge: number;
  /** Plan option label, exactly as shown in the UI select. */
  planType: string;
}

export interface PatreonEarningsResult {
  /** patrons * avgPledge, rounded to cents. */
  grossEarnings: number;
  /** grossEarnings * plan rate, rounded to cents. */
  platformFee: number;
  /** patrons * per-pledge processing fee, rounded to cents. */
  processingFees: number;
  /** grossEarnings - platformFee - processingFees (from rounded lines). */
  estimatedNetMonthly: number;
}

/**
 * Round to the nearest cent, half-up. Math.round is half-up for positive
 * values; negative values round half away from zero (documented, acceptable —
 * money inputs here are never negative).
 */
export function roundToCents(value: number): number {
  // + 0 normalizes -0 to +0 so strict equality holds in tests.
  return Math.round(value * 100) / 100 + 0;
}

/** Per-pledge processing fee for a single pledge amount (USD). */
export function perPledgeProcessingFee(pledge: number): number {
  if (pledge > PROCESSING_THRESHOLD) {
    return pledge * PROCESSING_OVER_RATE + PROCESSING_OVER_FIXED;
  }
  return pledge * PROCESSING_UNDER_RATE + PROCESSING_UNDER_FIXED;
}

/**
 * Coerce a raw value to a finite number.
 * @throws {Error} with a human message when the value is missing/not numeric.
 */
function toNumber(label: string, value: unknown): number {
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (typeof value === "number" && Number.isFinite(value)) return value;
  throw new Error(`${label} must be a number.`);
}

/**
 * Core calculation. Throws {Error} with a human message on invalid input.
 */
export function calculatePatreonEarnings(input: PatreonEarningsInput): PatreonEarningsResult {
  if (!input || typeof input !== "object") {
    throw new Error("Enter your Patreon numbers to run the estimate.");
  }

  const patrons = toNumber("Number of paying patrons", input.patrons);
  if (!Number.isInteger(patrons) || patrons <= 0) {
    throw new Error("Number of paying patrons must be a whole number greater than 0.");
  }

  const avgPledge = toNumber("Average pledge", input.avgPledge);
  if (avgPledge <= 0) {
    throw new Error("Average pledge must be greater than 0 USD.");
  }

  const plan = PATREON_PLAN_OPTIONS.find((p) => p.label === input.planType);
  if (!plan) {
    throw new Error(
      `Choose a plan: ${PATREON_PLAN_OPTIONS.map((p) => p.label).join(", ")}.`,
    );
  }

  const grossEarnings = roundToCents(patrons * avgPledge);
  const platformFee = roundToCents(grossEarnings * plan.rate);
  const processingFees = roundToCents(patrons * perPledgeProcessingFee(avgPledge));
  const estimatedNetMonthly = roundToCents(grossEarnings - platformFee - processingFees);

  return { grossEarnings, platformFee, processingFees, estimatedNetMonthly };
}

/**
 * Contract adapter: runTool({ patrons, avgPledge, planType }) ->
 * { ok, values?, error? }. Never throws.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    if (!values || typeof values !== "object") {
      return { ok: false, error: "Enter your Patreon numbers to run the estimate." };
    }
    const result = calculatePatreonEarnings({
      patrons: values.patrons as number,
      avgPledge: values.avgPledge as number,
      planType: values.planType as string,
    });
    return {
      ok: true,
      values: {
        grossEarnings: result.grossEarnings,
        platformFee: result.platformFee,
        processingFees: result.processingFees,
        estimatedNetMonthly: result.estimatedNetMonthly,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }
}
