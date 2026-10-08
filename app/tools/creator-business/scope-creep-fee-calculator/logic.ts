/**
 * Scope Creep Fee Calculator — pure logic (tool-485).
 *
 * FORMULA J-SCOPE-CREEP (published, arithmetic only):
 *   hourly mode:     scopeCreepFee = additionalHours * hourlyRate
 *   pct-of-fee mode: scopeCreepFee = originalFee * (creepPct / 100)
 *   revisedProjectTotal  = originalFee + scopeCreepFee
 *   creepAsPctOfOriginal = originalFee > 0
 *     ? (scopeCreepFee / originalFee) * 100
 *     : 0
 *
 * ASSUMPTIONS (honesty contract):
 * - hourlyRate / creepPct are YOUR pricing inputs — never "standard" rates.
 *   There is no market-rate data in this tool.
 * - Every result is labeled an ESTIMATE based on user inputs.
 * - Money values round to the nearest cent (half-up); the percentage output
 *   rounds to 2 decimals.
 * - Zero imports, zero network, zero DOM, no Math.random. Deterministic:
 *   same inputs -> same outputs, always.
 */

/** Result keys returned in `values` (must match meta.ts `outputs`). */
export const OUTPUT_IDS = ["scopeCreepFee", "revisedProjectTotal", "creepAsPctOfOriginal"] as const;

export const MODE_HOURLY = "hourly";
export const MODE_PCT_OF_FEE = "pct-of-fee";

/** Round to the nearest cent, half-up. */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Round a percentage to 2 decimals. */
export function roundToPercent(value: number): number {
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

export interface ScopeCreepFeeResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Calculate a scope-creep fee in hourly or percentage-of-fee mode.
 *
 * @param values - originalFee (required, >= 0), mode ("hourly" | "pct-of-fee",
 *   required); hourly mode also requires additionalHours (>= 0) and
 *   hourlyRate (>= 0); pct-of-fee mode also requires creepPct (0–100).
 * @returns { ok: true, values } with scopeCreepFee (currency),
 *   revisedProjectTotal (currency), creepAsPctOfOriginal (percent, estimate);
 *   or { ok: false, error } with a human-readable message.
 */
export function runTool(values: Record<string, unknown>): ScopeCreepFeeResult {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return { ok: false, error: "Input must be an object of field values." };
  }

  let originalFee: number;
  try {
    originalFee = readNumber(values, "originalFee", "Original project fee", {
      required: true,
      min: 0,
    }) as number;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }

  const modeRaw = values["mode"];
  if (isMissing(modeRaw)) {
    return { ok: false, error: "Pricing mode is required (hourly or pct-of-fee)." };
  }
  if (modeRaw !== MODE_HOURLY && modeRaw !== MODE_PCT_OF_FEE) {
    return {
      ok: false,
      error: `Pricing mode must be "${MODE_HOURLY}" or "${MODE_PCT_OF_FEE}".`,
    };
  }
  const mode = modeRaw as string;

  let scopeCreepFee: number;
  try {
    if (mode === MODE_HOURLY) {
      const additionalHours = readNumber(values, "additionalHours", "Additional hours", {
        required: true,
        min: 0,
      }) as number;
      const hourlyRate = readNumber(values, "hourlyRate", "Your hourly rate", {
        required: true,
        min: 0,
      }) as number;
      scopeCreepFee = additionalHours * hourlyRate;
    } else {
      const creepPct = readNumber(values, "creepPct", "Scope creep percentage", {
        required: true,
        min: 0,
        max: 100,
      }) as number;
      scopeCreepFee = originalFee * (creepPct / 100);
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }

  scopeCreepFee = roundToCents(scopeCreepFee);
  const revisedProjectTotal = roundToCents(originalFee + scopeCreepFee);
  const creepAsPctOfOriginal =
    originalFee > 0 ? roundToPercent((scopeCreepFee / originalFee) * 100) : 0;

  return {
    ok: true,
    values: { scopeCreepFee, revisedProjectTotal, creepAsPctOfOriginal },
  };
}
