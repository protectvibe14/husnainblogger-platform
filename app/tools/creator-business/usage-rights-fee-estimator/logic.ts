/**
 * Usage Rights Fee Estimator — pure logic (tool-455).
 *
 * ZERO imports, zero network, zero DOM, deterministic.
 *
 * HONESTY:
 * - NO factual licensing-rate tables are used. Every multiplier is a
 *   USER-ENTERED pricing assumption. The tool computes
 *   base x product-of-factors ONLY and labels every result an ESTIMATE.
 * - No industry-standard multipliers exist; the UI must not present any
 *   prefilled multiplier as "typical".
 *
 * FORMULA (J-USAGE-RIGHTS):
 * - usageFee = baseCreativeFee * durationMultiplier * territoryMultiplier
 *              * mediaChannelMultiplier
 * - exclusivityAddOn = baseCreativeFee * (exclusivityAddOnPct / 100)
 * - totalWithBase = baseCreativeFee + usageFee + exclusivityAddOn
 * - Money rounds to the nearest cent (half-up).
 *
 * EDGE CASE: any multiplier = 0 -> usage fee is $0 and a warning note is
 * returned (a zero multiplier is usually a data-entry mistake).
 */

export interface UsageRightsInput {
  /** Base creative fee for producing the work. >= 0. */
  baseCreativeFee: number;
  /** Usage duration in months (context for the breakdown). >= 0. */
  durationMonths: number;
  /** USER ASSUMPTION: multiplier for the duration. >= 0. */
  durationMultiplier: number;
  /** USER ASSUMPTION: multiplier for the territory. >= 0. */
  territoryMultiplier: number;
  /** USER ASSUMPTION: multiplier for the media channel. >= 0. */
  mediaChannelMultiplier: number;
  /** USER ASSUMPTION: exclusivity add-on as % of base. 0-100. Defaults to 0. */
  exclusivityAddOnPct?: number;
}

export interface UsageRightsResult {
  /** Estimated usage fee (base x product of factors), rounded to cents. */
  estimatedUsageFee: number;
  /** base + usage fee + exclusivity add-on, rounded to cents. */
  totalWithBase: number;
  /** Line-by-line explanation of the factors applied. */
  factorBreakdown: string[];
  /** Empty string when nothing to flag. */
  note: string;
}

export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function fail(name: string, problem: string): Error {
  return new Error(`${name}: ${problem}`);
}

function readNumber(name: string, value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw fail(name, "must be a number.");
  }
  if (!Number.isFinite(value)) {
    throw fail(name, "must be finite.");
  }
  return value;
}

function checkNonNegative(name: string, value: number): void {
  if (value < 0) throw fail(name, "must be >= 0.");
}

function fmt(n: number): string {
  return n.toFixed(2);
}

/**
 * Estimate a usage-rights fee from the user's base fee and factor assumptions.
 *
 * @throws {Error} for missing/invalid inputs (human-readable messages).
 */
export function estimateUsageRights(input: UsageRightsInput): UsageRightsResult {
  if (!input || typeof input !== "object") {
    throw new Error("Input must be an object.");
  }

  const base = readNumber("baseCreativeFee", input.baseCreativeFee);
  checkNonNegative("baseCreativeFee", base);

  const months = readNumber("durationMonths", input.durationMonths);
  checkNonNegative("durationMonths", months);

  const durationMult = readNumber("durationMultiplier", input.durationMultiplier);
  checkNonNegative("durationMultiplier", durationMult);

  const territoryMult = readNumber("territoryMultiplier", input.territoryMultiplier);
  checkNonNegative("territoryMultiplier", territoryMult);

  const mediaMult = readNumber("mediaChannelMultiplier", input.mediaChannelMultiplier);
  checkNonNegative("mediaChannelMultiplier", mediaMult);

  const exclPctRaw = input.exclusivityAddOnPct ?? 0;
  const exclusivityPct = readNumber("exclusivityAddOnPct", exclPctRaw);
  if (exclusivityPct < 0 || exclusivityPct > 100) {
    throw fail("exclusivityAddOnPct", "must be between 0 and 100.");
  }

  const combinedFactor = durationMult * territoryMult * mediaMult;
  const estimatedUsageFee = roundToCents(base * combinedFactor);
  const exclusivityAddOn = roundToCents(base * (exclusivityPct / 100));
  const totalWithBase = roundToCents(base + estimatedUsageFee + exclusivityAddOn);

  const factorBreakdown: string[] = [
    `Base creative fee: ${fmt(base)}`,
    `Duration factor: × ${durationMult} (${months} month${months === 1 ? "" : "s"})`,
    `Territory factor: × ${territoryMult}`,
    `Media channel factor: × ${mediaMult}`,
    `Combined factor: × ${durationMult} × ${territoryMult} × ${mediaMult} = × ${combinedFactor}`,
    `Estimated usage fee: ${fmt(base)} × ${combinedFactor} = ${fmt(estimatedUsageFee)}`,
    `Exclusivity add-on: ${exclusivityPct}% of base = ${fmt(exclusivityAddOn)}`,
    `Total with base: ${fmt(base)} + ${fmt(estimatedUsageFee)} + ${fmt(exclusivityAddOn)} = ${fmt(totalWithBase)}`,
  ];

  let note = "ESTIMATE: every factor is your own pricing assumption — no industry-standard rate tables were used.";
  const zeroFactors: string[] = [];
  if (durationMult === 0) zeroFactors.push("duration");
  if (territoryMult === 0) zeroFactors.push("territory");
  if (mediaMult === 0) zeroFactors.push("media channel");
  if (zeroFactors.length > 0) {
    note =
      `Warning: the ${zeroFactors.join(", ")} multiplier${zeroFactors.length === 1 ? " is" : "s are"} 0, ` +
      `so the estimated usage fee is 0. This is usually a data-entry mistake — check your factors. ` +
      `ESTIMATE: every factor is your own pricing assumption.`;
  }

  return {
    estimatedUsageFee,
    totalWithBase,
    factorBreakdown,
    note,
  };
}

/**
 * Tool-logic-slot adapter: validates flat UI values and runs estimateUsageRights.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    const result = estimateUsageRights({
      baseCreativeFee: values.baseCreativeFee as number,
      durationMonths: values.durationMonths as number,
      durationMultiplier: values.durationMultiplier as number,
      territoryMultiplier: values.territoryMultiplier as number,
      mediaChannelMultiplier: values.mediaChannelMultiplier as number,
      exclusivityAddOnPct: values.exclusivityAddOnPct as number | undefined,
    });
    return {
      ok: true,
      values: {
        estimatedUsageFee: result.estimatedUsageFee,
        totalWithBase: result.totalWithBase,
        factorBreakdown: result.factorBreakdown,
        note: result.note,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }
}
