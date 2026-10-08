/**
 * Whitelisting Fee Calculator — pure logic (tool-484).
 *
 * FORMULA J-WHITELIST (published, arithmetic only):
 *   percentage mode: monthlyFee = baseContentFee * (whitelistPctPerMonth / 100)
 *   flat mode:       monthlyFee = flatMonthlyMode   (user's own flat monthly fee)
 *   whitelistingFeeTotal = monthlyFee * whitelistMonths
 *   totalDealValue       = baseContentFee + whitelistingFeeTotal
 *
 * ASSUMPTIONS (honesty contract):
 * - whitelistPctPerMonth / flatMonthlyMode are YOUR pricing policy — never an
 *   "industry standard" or platform fact. There is no market-rate data here.
 * - Every result is labeled an ESTIMATE based on user assumptions.
 * - Money values round to the nearest cent (half-up).
 * - Zero imports, zero network, zero DOM, no Math.random. Deterministic:
 *   same inputs -> same outputs, always.
 */

/** Result keys returned in `values` (must match meta.ts `outputs`). */
export const OUTPUT_IDS = ["whitelistingFeeTotal", "monthlyFee", "totalDealValue"] as const;

/** Round to the nearest cent, half-up. */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function readNumber(
  values: Record<string, unknown>,
  id: string,
  label: string,
  opts: { required: boolean; min: number; max?: number },
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
  if (raw < opts.min) {
    throw new Error(`${label} must be ${opts.min} or more.`);
  }
  if (opts.max !== undefined && raw > opts.max) {
    throw new Error(`${label} must be ${opts.max} or less.`);
  }
  return raw;
}

export interface WhitelistingFeeResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Calculate a whitelisting (paid-usage / Spark Ads) fee from the user's own rates.
 *
 * @param values - baseContentFee (required, >= 0), whitelistMonths
 *   (required, >= 0), whitelistPctPerMonth (required in percentage mode, 0–100),
 *   flatMonthlyMode (optional, >= 0 — when provided it replaces the percentage).
 * @returns { ok: true, values } with whitelistingFeeTotal, monthlyFee,
 *   totalDealValue (all currency, estimates); or { ok: false, error }.
 */
export function runTool(values: Record<string, unknown>): WhitelistingFeeResult {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return { ok: false, error: "Input must be an object of field values." };
  }

  let baseContentFee: number;
  let whitelistMonths: number;
  let flatMonthlyMode: number | undefined;

  try {
    baseContentFee = readNumber(values, "baseContentFee", "Base content fee", {
      required: true,
      min: 0,
    }) as number;
    whitelistMonths = readNumber(values, "whitelistMonths", "Whitelisting months", {
      required: true,
      min: 0,
    }) as number;
    flatMonthlyMode = readNumber(values, "flatMonthlyMode", "Flat monthly fee", {
      required: false,
      min: 0,
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }

  let monthlyFee: number;
  if (flatMonthlyMode !== undefined) {
    monthlyFee = flatMonthlyMode;
  } else {
    let whitelistPctPerMonth: number;
    try {
      whitelistPctPerMonth = readNumber(
        values,
        "whitelistPctPerMonth",
        "Whitelisting percentage per month",
        { required: true, min: 0, max: 100 },
      ) as number;
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
    }
    monthlyFee = baseContentFee * (whitelistPctPerMonth / 100);
  }

  monthlyFee = roundToCents(monthlyFee);
  const whitelistingFeeTotal = roundToCents(monthlyFee * whitelistMonths);
  const totalDealValue = roundToCents(baseContentFee + whitelistingFeeTotal);

  return {
    ok: true,
    values: { whitelistingFeeTotal, monthlyFee, totalDealValue },
  };
}
