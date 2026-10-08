/**
 * Twitch Subscriber Revenue Calculator — pure logic (tool-089).
 *
 * Pure TypeScript: zero imports, zero network, zero DOM, zero randomness.
 * Deterministic: identical inputs always produce identical outputs.
 *
 * FORMULA (spec data/formulas/formulas-B.json :: tool-089):
 *   sub_revenue  = (tier1_subs * 4.99 + tier2_subs * 9.99 + tier3_subs * 24.99)
 *                  * split
 *   split        = base_50: 0.50 | plus_60: 0.60 | plus_70: 0.70
 *   bits_revenue = bits_cheered * 0.01
 *   total_monthly = sub_revenue + bits_revenue
 *
 * SPLIT OPTIONS (match meta.ts select options exactly):
 *   "Base 50/50 split"             -> 0.50
 *   "Plus Program 60/40 split"     -> 0.60
 *   "Plus Program 70/30 split"     -> 0.70
 *
 * HONESTY (non-negotiable):
 * - Twitch's revenue split and tier pricing CHANGE. The tier prices and
 *   splits above are the schedule captured in the spec
 *   (sourceDate 2026-10-01). Every figure is an ESTIMATE — verify the
 *   current split and pricing on Twitch's creator pages before relying on
 *   these numbers.
 * - Regional pricing means effective revenue per Tier-1 sub is ~$2.30, not
 *   exactly $2.50 at the 50/50 split — this is an estimate, labeled as such.
 * - Gift and Prime subs are treated with the same split (per spec edge case).
 * - Plus Program tiers are user-confirmed: the tool trusts the split the
 *   user selects (qualification thresholds are not checked).
 * - Bits are $0.01 each to the streamer (per spec).
 * - USD only. No currency conversion, no taxes.
 *
 * Rounding: half-up to 2 decimals (USD) on every money output.
 */

export const TWITCH_TIER_PRICES: ReadonlyArray<{ tier: string; price: number }> = [
  { tier: "Tier 1", price: 4.99 },
  { tier: "Tier 2", price: 9.99 },
  { tier: "Tier 3", price: 24.99 },
];

export const TWITCH_SPLIT_OPTIONS: ReadonlyArray<{ label: string; split: number }> = [
  { label: "Base 50/50 split", split: 0.5 },
  { label: "Plus Program 60/40 split", split: 0.6 },
  { label: "Plus Program 70/30 split", split: 0.7 },
];

/** Streamer revenue per bit cheered (USD). */
export const BITS_PER_CHEER_USD = 0.01;

export interface TwitchRevenueInput {
  /** Tier-1 subscribers. Integer >= 0. */
  tier1Subs: number;
  /** Tier-2 subscribers. Integer >= 0. */
  tier2Subs: number;
  /** Tier-3 subscribers. Integer >= 0. */
  tier3Subs: number;
  /** Split option label, exactly as shown in the UI select. */
  splitTier: string;
  /** Bits cheered this month. Integer >= 0. */
  bitsCheered: number;
}

export interface TwitchRevenueResult {
  /** (t1*4.99 + t2*9.99 + t3*24.99) * split, rounded to cents. */
  subRevenue: number;
  /** bitsCheered * 0.01, rounded to cents. */
  bitsRevenue: number;
  /** subRevenue + bitsRevenue (from rounded lines), rounded to cents. */
  totalMonthly: number;
}

/**
 * Round to the nearest cent, half-up. Math.round is half-up for positive
 * values; negative values round half away from zero (documented, acceptable —
 * inputs here are never negative).
 */
export function roundToCents(value: number): number {
  // + 0 normalizes -0 to +0 so strict equality holds in tests.
  return Math.round(value * 100) / 100 + 0;
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
 * Validate a subscriber/bit count: integer >= 0.
 * @throws {Error} with a human message on invalid input.
 */
function toCount(label: string, value: unknown): number {
  const n = toNumber(label, value);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`${label} must be a whole number of 0 or more.`);
  }
  return n;
}

/**
 * Core calculation. Throws {Error} with a human message on invalid input.
 */
export function calculateTwitchRevenue(input: TwitchRevenueInput): TwitchRevenueResult {
  if (!input || typeof input !== "object") {
    throw new Error("Enter your Twitch numbers to run the calculation.");
  }

  const tier1Subs = toCount("Tier-1 subscribers", input.tier1Subs);
  const tier2Subs = toCount("Tier-2 subscribers", input.tier2Subs);
  const tier3Subs = toCount("Tier-3 subscribers", input.tier3Subs);
  const bitsCheered = toCount("Bits cheered", input.bitsCheered);

  const splitOption = TWITCH_SPLIT_OPTIONS.find((s) => s.label === input.splitTier);
  if (!splitOption) {
    throw new Error(
      `Choose a revenue split: ${TWITCH_SPLIT_OPTIONS.map((s) => s.label).join(", ")}.`,
    );
  }

  const subRevenue = roundToCents(
    (tier1Subs * TWITCH_TIER_PRICES[0].price +
      tier2Subs * TWITCH_TIER_PRICES[1].price +
      tier3Subs * TWITCH_TIER_PRICES[2].price) *
      splitOption.split,
  );
  const bitsRevenue = roundToCents(bitsCheered * BITS_PER_CHEER_USD);
  const totalMonthly = roundToCents(subRevenue + bitsRevenue);

  return { subRevenue, bitsRevenue, totalMonthly };
}

/**
 * Contract adapter: runTool({ tier1Subs, tier2Subs, tier3Subs, splitTier,
 * bitsCheered }) -> { ok, values?, error? }. Never throws.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    if (!values || typeof values !== "object") {
      return { ok: false, error: "Enter your Twitch numbers to run the calculation." };
    }
    const result = calculateTwitchRevenue({
      tier1Subs: values.tier1Subs as number,
      tier2Subs: values.tier2Subs as number,
      tier3Subs: values.tier3Subs as number,
      splitTier: values.splitTier as string,
      bitsCheered: values.bitsCheered as number,
    });
    return {
      ok: true,
      values: {
        subRevenue: result.subRevenue,
        bitsRevenue: result.bitsRevenue,
        totalMonthly: result.totalMonthly,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }
}
