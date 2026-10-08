/**
 * Exclusivity Fee Calculator — pure logic (tool-483).
 *
 * FORMULA J-EXCLUSIVITY (published, arithmetic only):
 *   percentage mode: exclusivityFee = baseDealFee * (exclusivityPct / 100)
 *   flat mode:       exclusivityFee = flatFeeMode   (user's own flat fee)
 *   totalDealValue   = baseDealFee + exclusivityFee
 *   monthlyEquivalent = exclusivityMonths > 0
 *     ? exclusivityFee / exclusivityMonths
 *     : exclusivityFee            (0-month period: the fee is the single-period value)
 *
 * ASSUMPTIONS (honesty contract):
 * - exclusivityPct / flatFeeMode are YOUR pricing policy — never an "industry
 *   standard". There is no market-rate data in this tool.
 * - Every result is labeled an ESTIMATE based on user assumptions.
 * - Money values round to the nearest cent (half-up).
 * - Zero imports, zero network, zero DOM, no Math.random. Deterministic:
 *   same inputs -> same outputs, always.
 */

/** Result keys returned in `values` (must match meta.ts `outputs`). */
export const OUTPUT_IDS = ["exclusivityFee", "totalDealValue", "monthlyEquivalent"] as const;

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

export interface ExclusivityFeeResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Calculate an exclusivity fee from the user's own deal fee and rate.
 *
 * @param values - baseDealFee (required, >= 0), exclusivityMonths
 *   (required, >= 0), exclusivityPct (required in percentage mode, 0–100),
 *   flatFeeMode (optional, >= 0 — when provided it replaces the percentage).
 * @returns { ok: true, values } with exclusivityFee, totalDealValue,
 *   monthlyEquivalent (all currency, estimates); or { ok: false, error }.
 */
export function runTool(values: Record<string, unknown>): ExclusivityFeeResult {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return { ok: false, error: "Input must be an object of field values." };
  }

  let baseDealFee: number;
  let exclusivityMonths: number;
  let flatFeeMode: number | undefined;

  try {
    baseDealFee = readNumber(values, "baseDealFee", "Base deal fee", {
      required: true,
      min: 0,
    }) as number;
    exclusivityMonths = readNumber(values, "exclusivityMonths", "Exclusivity months", {
      required: true,
      min: 0,
    }) as number;
    flatFeeMode = readNumber(values, "flatFeeMode", "Flat exclusivity fee", {
      required: false,
      min: 0,
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }

  let exclusivityFee: number;
  if (flatFeeMode !== undefined) {
    exclusivityFee = flatFeeMode;
  } else {
    let exclusivityPct: number;
    try {
      exclusivityPct = readNumber(values, "exclusivityPct", "Exclusivity percentage", {
        required: true,
        min: 0,
        max: 100,
      }) as number;
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
    }
    exclusivityFee = baseDealFee * (exclusivityPct / 100);
  }

  exclusivityFee = roundToCents(exclusivityFee);
  const totalDealValue = roundToCents(baseDealFee + exclusivityFee);
  const monthlyEquivalent =
    exclusivityMonths > 0 ? roundToCents(exclusivityFee / exclusivityMonths) : exclusivityFee;

  return {
    ok: true,
    values: { exclusivityFee, totalDealValue, monthlyEquivalent },
  };
}
