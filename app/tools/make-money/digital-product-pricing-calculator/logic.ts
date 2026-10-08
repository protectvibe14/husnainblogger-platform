/**
 * Digital Product Pricing Calculator — pure logic (tool-090).
 *
 * Pure TypeScript: zero imports, zero network, zero DOM, zero randomness.
 * Deterministic: identical inputs always produce identical outputs.
 *
 * FORMULA (spec data/formulas/formulas-B.json :: tool-090) — cost-plus
 * pricing that solves for the platform fee instead of naively adding it:
 *   suggested_price  = production_cost / ((1 - platform_fee_rate) * (1 - desired_margin / 100))
 *   profit_per_unit  = suggested_price * (1 - platform_fee_rate) - production_cost
 *   monthly_profit   = profit_per_unit * units_per_month
 *
 * Why this shape: a platform fee shrinks the effective margin, so the price
 * must be SOLVED as (cost + profit) / (1 - fee_rate), not computed as
 * cost + margin. This formula does that in one step.
 *
 * HONESTY (non-negotiable):
 * - Cost-plus pricing is a METHOD, not a market price. It guarantees your
 *   target margin arithmetically; it does not guarantee customers will pay
 *   that price. Market willingness, competition, and perceived value decide
 *   what actually sells.
 * - No external data: the platform fee rate is user-entered (different
 *   marketplaces charge different fees — enter yours).
 * - A 100% margin or 100% platform fee makes the price unsolvable
 *   (division by zero) — the tool rejects those inputs.
 * - USD only. No currency conversion, no taxes.
 *
 * Rounding: half-up to 2 decimals (USD) on every money output.
 */

export interface PricingInput {
  /** Cost to produce one unit in USD. Number >= 0. */
  productionCost: number;
  /** Desired profit margin, percent 0–100 (exclusive of 100). */
  desiredMargin: number;
  /** Platform/marketplace fee rate, percent >= 0 (exclusive of 100). User-entered. */
  platformFeeRate: number;
  /** Expected units sold per month. Integer > 0. */
  unitsPerMonth: number;
}

export interface PricingResult {
  /** Price that hits the target margin after the platform fee (USD). */
  suggestedPrice: number;
  /** Take-home per unit after fee minus cost (USD). */
  profitPerUnit: number;
  /** profitPerUnit * unitsPerMonth (USD). */
  monthlyProfit: number;
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
 * Core calculation. Throws {Error} with a human message on invalid input.
 */
export function calculatePricing(input: PricingInput): PricingResult {
  if (!input || typeof input !== "object") {
    throw new Error("Enter your product numbers to calculate a price.");
  }

  const productionCost = toNumber("Production cost", input.productionCost);
  if (productionCost < 0) {
    throw new Error("Production cost must be 0 or more USD.");
  }

  const desiredMargin = toNumber("Desired margin", input.desiredMargin);
  if (desiredMargin < 0 || desiredMargin > 100) {
    throw new Error("Desired margin must be between 0 and 100 percent.");
  }
  if (desiredMargin === 100) {
    throw new Error("A 100% margin makes the price unsolvable — use a margin below 100%.");
  }

  const platformFeeRate = toNumber("Platform fee rate", input.platformFeeRate);
  if (platformFeeRate < 0) {
    throw new Error("Platform fee rate must be 0 or more percent.");
  }
  if (platformFeeRate >= 100) {
    throw new Error(
      "Platform fee rate must be below 100% — at 100% no price can cover the fee.",
    );
  }

  const unitsPerMonth = toNumber("Units per month", input.unitsPerMonth);
  if (!Number.isInteger(unitsPerMonth) || unitsPerMonth <= 0) {
    throw new Error("Units per month must be a whole number greater than 0.");
  }

  const keepRate = (1 - platformFeeRate / 100) * (1 - desiredMargin / 100);
  const suggestedPrice = roundToCents(productionCost / keepRate);
  const profitPerUnit = roundToCents(suggestedPrice * (1 - platformFeeRate / 100) - productionCost);
  const monthlyProfit = roundToCents(profitPerUnit * unitsPerMonth);

  return { suggestedPrice, profitPerUnit, monthlyProfit };
}

/**
 * Contract adapter: runTool({ productionCost, desiredMargin, platformFeeRate,
 * unitsPerMonth }) -> { ok, values?, error? }. Never throws.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    if (!values || typeof values !== "object") {
      return { ok: false, error: "Enter your product numbers to calculate a price." };
    }
    const result = calculatePricing({
      productionCost: values.productionCost as number,
      desiredMargin: values.desiredMargin as number,
      platformFeeRate: values.platformFeeRate as number,
      unitsPerMonth: values.unitsPerMonth as number,
    });
    return {
      ok: true,
      values: {
        suggestedPrice: result.suggestedPrice,
        profitPerUnit: result.profitPerUnit,
        monthlyProfit: result.monthlyProfit,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }
}
