/**
 * Amazon Affiliate Commission Estimator — pure logic (tool-096).
 *
 * Zero imports, zero network, zero DOM. Deterministic: same inputs → same
 * outputs. Rate multiplication over a bundled US Associates rate card.
 *
 * ## HONESTY CONTRACT (also surfaced in meta.ts assumptions + UI disclaimer)
 * 1. This tool does NOT fetch live data. The rate card below is a static copy
 *    of the US Amazon Associates commission schedule supplied in the build
 *    spec (source date 2026-10-01). Amazon changes commission rates
 *    periodically — the user MUST verify the CURRENT rate for their category
 *    on Amazon's own Associates rate page before relying on the result.
 * 2. US rate card only. Other Amazon marketplaces (UK, DE, IN, …) use
 *    different rates — this tool does not cover them.
 * 3. Output is an ESTIMATE of commission on referred sales, not a payout
 *    guarantee: returns, cancellations, and shipping-only fees are ignored.
 *
 * Formula (from spec):
 *   commission_rate      = US_rate_card(category)
 *   estimated_commission = monthly_sales * avg_order_value * commission_rate
 * Rounding: half-up to 2 decimals (USD). Math.round is half-up for the
 * positive values this tool produces.
 */

/** The 10 bundled US Associates rate-card entries (percent values). */
export const AMAZON_RATE_CARD: Record<string, number> = {
  "Games (20%)": 20,
  "Luxury Beauty (10%)": 10,
  "Music & Handmade (5%)": 5,
  "Books, Kitchen & Automotive (4.5%)": 4.5,
  "Devices & Fashion (4%)": 4,
  "All Other Categories (4%)": 4,
  "Home (3%)": 3,
  "PC Components (2.5%)": 2.5,
  "TVs & Digital Video Games (2%)": 2,
  "Grocery & Health/Personal Care (1%)": 1,
};

/** Category labels shown in the select control (order matches the spec). */
export const AMAZON_CATEGORIES: string[] = Object.keys(AMAZON_RATE_CARD);

export const RATE_CARD_MARKETPLACE = "US";
export const RATE_CARD_SOURCE_DATE = "2026-10-01";

/** Sanity caps to reject absurd-but-finite inputs. */
export const MAX_MONTHLY_SALES = 1e12;
export const MAX_ORDER_VALUE = 1e9;

export const DISCLAIMER_TEXT =
  "Estimate only, from the bundled US Amazon Associates rate card (spec source " +
  "date 2026-10-01). Amazon changes commission rates periodically and other " +
  "marketplaces use different rates — verify the CURRENT rate for your category " +
  "on Amazon's own Associates page before relying on this number. Returns, " +
  "cancellations, and fees are not modeled.";

export interface AmazonCommissionInput {
  /** One of AMAZON_CATEGORIES. Required. */
  category: string;
  /** Referred monthly sales. Must be a finite number > 0. */
  monthlySales: number;
  /** Average order value in USD. Must be a finite number > 0. */
  avgOrderValue: number;
}

export interface AmazonCommissionResult {
  /** Commission rate applied, in percent (e.g. 4.5). */
  commissionRate: number;
  /** estimated monthly commission in USD, rounded to 2 decimals. */
  estimatedCommission: number;
  /** Honesty disclaimer surfaced by the UI. */
  disclaimer: string;
}

/** Round half-up to 2 decimals (inputs to this tool are non-negative). */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function assertPositiveNumber(
  name: string,
  value: unknown,
  cap: number,
): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number.`);
  }
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
  if (value <= 0) {
    throw new RangeError(`${name} must be greater than 0.`);
  }
  if (value > cap) {
    throw new RangeError(`${name} is above the sanity cap (${cap}).`);
  }
}

/**
 * Estimate monthly Amazon affiliate commission for one product category.
 *
 * @param input - category, monthlySales, avgOrderValue.
 * @returns commissionRate (percent), estimatedCommission (USD), disclaimer.
 * @throws {TypeError} for non-object input, unknown category, or
 *   non-numeric inputs.
 * @throws {RangeError} for monthlySales/avgOrderValue <= 0 or above caps.
 */
export function calculateAmazonCommission(
  input: AmazonCommissionInput,
): AmazonCommissionResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }
  const rate = AMAZON_RATE_CARD[input.category];
  if (typeof rate !== "number") {
    throw new TypeError(
      `category must be one of: ${AMAZON_CATEGORIES.join("; ")}.`,
    );
  }
  assertPositiveNumber("monthlySales", input.monthlySales, MAX_MONTHLY_SALES);
  assertPositiveNumber("avgOrderValue", input.avgOrderValue, MAX_ORDER_VALUE);

  const estimatedCommission = round2(
    input.monthlySales * input.avgOrderValue * (rate / 100),
  );

  return {
    commissionRate: rate,
    estimatedCommission,
    disclaimer: DISCLAIMER_TEXT,
  };
}

// ---------------------------------------------------------------------------
// runTool adapter — contract shape for the mountToolUI / calculator template
// ---------------------------------------------------------------------------

/**
 * Contract adapter: `runTool({ category, monthlySales, avgOrderValue })` →
 * `{ ok, values?, error? }`. Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const v = values && typeof values === "object" ? values : {};
  try {
    const result = calculateAmazonCommission({
      category: v["category"] as string,
      monthlySales: v["monthlySales"] as number,
      avgOrderValue: v["avgOrderValue"] as number,
    });
    return {
      ok: true,
      values: {
        commissionRate: result.commissionRate,
        estimatedCommission: result.estimatedCommission,
        disclaimer: result.disclaimer,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid input.";
    return { ok: false, error: humanize(message) };
  }
}

function humanize(message: string): string {
  if (message.startsWith("category must be one of")) {
    return "Pick a product category from the list — the rate card needs a known category.";
  }
  if (message.startsWith("monthlySales must be greater than 0")) {
    return "Enter your referred monthly sales — a number greater than 0.";
  }
  if (message.startsWith("monthlySales must be a")) {
    return "Monthly sales must be a valid number.";
  }
  if (message.startsWith("avgOrderValue must be greater than 0")) {
    return "Enter your average order value in USD — a number greater than 0.";
  }
  if (message.startsWith("avgOrderValue must be a")) {
    return "Average order value must be a valid number.";
  }
  if (message.includes("sanity cap")) {
    return "That number looks unrealistically large — check it and try again.";
  }
  return message;
}
