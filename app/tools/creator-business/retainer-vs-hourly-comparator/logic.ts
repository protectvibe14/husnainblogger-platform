/**
 * Retainer vs Hourly Comparator — pure logic (tool-458).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - Formula J-RETAINER-COMPARE (from spec):
 *     hourlyModelCost   = hourlyRate * estimatedHoursPerMonth
 *     retainerModelCost = retainerFee + max(0, estimatedHoursPerMonth - retainerIncludedHours) * overageHourlyRate
 *     cheaperOption     = the model with the lower monthly cost ("tie" when within half a cent)
 *     breakEvenHours    = the smallest H >= 0 where the two models cost the same, or null
 *                         when the cost lines never cross.
 * - overageHourlyRate is OPTIONAL: when blank it defaults to hourlyRate and a
 *   note says so (spec edge case).
 * - All money values round to the nearest cent (half-up); break-even hours
 *   round to 2 decimals.
 * - The comparison is arithmetic only. It says which model costs less for a
 *   given hour count — it is not business advice and ignores scope creep,
 *   admin time, payment risk, and taxes (surfaced in notes[]).
 */

/** Round money to the nearest cent, half-up. */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function requireNonNegativeNumber(name: string, value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number.`);
  }
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be finite (no Infinity).`);
  }
  if (value < 0) {
    throw new RangeError(`${name} must be >= 0.`);
  }
  return value;
}

/** Internal typed input. */
export interface RetainerCompareInput {
  hourlyRate: number;
  estimatedHoursPerMonth: number;
  retainerFee: number;
  retainerIncludedHours: number;
  /** Defaults to hourlyRate when omitted (surfaced in notes). */
  overageHourlyRate?: number;
}

export type CheaperOption = "hourly" | "retainer" | "tie";

/** Result of the comparison. */
export interface RetainerCompareResult {
  hourlyModelMonthlyCost: number;
  retainerModelMonthlyCost: number;
  /** Smallest H >= 0 where both models cost the same; null when they never cross. */
  breakEvenHours: number | null;
  cheaperOption: CheaperOption;
  /** Absolute monthly cost difference, in cents-rounded dollars. */
  savingsDifference: number;
  /** The overage rate actually used in the math. */
  overageRateUsed: number;
  /** Assumption/estimate notes surfaced to the UI. */
  notes: string[];
}

/**
 * Solve hourlyRate * H = retainerFee + max(0, H - included) * overage for the
 * smallest H >= 0. Returns null when the lines never cross (e.g. one model is
 * always cheaper, or a zero hourly rate meets a positive retainer fee).
 */
function solveBreakEven(
  hourlyRate: number,
  retainerFee: number,
  includedHours: number,
  overageRate: number,
): number | null {
  const EPS = 1e-9;
  if (hourlyRate <= EPS) {
    // Hourly model costs $0 for any H.
    return retainerFee <= EPS ? 0 : null;
  }
  // Crossing within the included-hours segment: hourlyRate * H = retainerFee.
  const h1 = retainerFee / hourlyRate;
  if (h1 <= includedHours + EPS) {
    return round2(h1);
  }
  // Crossing beyond included hours: hourlyRate * H = retainerFee + (H - included) * overage.
  const denom = hourlyRate - overageRate;
  if (Math.abs(denom) <= EPS) {
    return null; // Parallel lines beyond the kink — they never meet.
  }
  const h2 = (retainerFee - includedHours * overageRate) / denom;
  if (!Number.isFinite(h2) || h2 < includedHours - EPS) {
    return null;
  }
  return round2(h2);
}

/**
 * Compare the hourly and retainer cost models.
 *
 * @throws {TypeError} for non-numeric / non-finite inputs.
 * @throws {RangeError} for negative inputs.
 */
export function compareRetainerVsHourly(input: RetainerCompareInput): RetainerCompareResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }
  const hourlyRate = requireNonNegativeNumber("hourlyRate", input.hourlyRate);
  const hours = requireNonNegativeNumber("estimatedHoursPerMonth", input.estimatedHoursPerMonth);
  const retainerFee = requireNonNegativeNumber("retainerFee", input.retainerFee);
  const includedHours = requireNonNegativeNumber("retainerIncludedHours", input.retainerIncludedHours);

  let overageRateUsed = hourlyRate;
  const notes: string[] = [];
  if (input.overageHourlyRate === undefined || input.overageHourlyRate === null) {
    notes.push(
      `Overage rate was not provided, so it defaults to your hourly rate ($${hourlyRate.toFixed(2)}/hr).`,
    );
  } else {
    overageRateUsed = requireNonNegativeNumber("overageHourlyRate", input.overageHourlyRate);
  }

  const hourlyModelMonthlyCost = roundToCents(hourlyRate * hours);
  const overageHours = Math.max(0, hours - includedHours);
  const retainerModelMonthlyCost = roundToCents(retainerFee + overageHours * overageRateUsed);

  const diff = roundToCents(hourlyModelMonthlyCost - retainerModelMonthlyCost);
  const cheaperOption: CheaperOption =
    Math.abs(diff) < 0.005 ? "tie" : diff < 0 ? "hourly" : "retainer";
  const savingsDifference = Math.abs(diff);

  const breakEvenHours = solveBreakEven(hourlyRate, retainerFee, includedHours, overageRateUsed);

  if (hours < includedHours) {
    notes.push(
      "Your estimated hours fall inside the retainer's included hours, so no overage charge applies at this estimate.",
    );
  }
  notes.push(
    "Comparison is arithmetic only — it ignores scope creep, unpaid admin time, payment risk, and taxes. It is a cost comparison, not pricing advice.",
  );

  return {
    hourlyModelMonthlyCost,
    retainerModelMonthlyCost,
    breakEvenHours,
    cheaperOption,
    savingsDifference,
    overageRateUsed,
    notes,
  };
}

const REQUIRED_KEYS = [
  "hourlyRate",
  "estimatedHoursPerMonth",
  "retainerFee",
  "retainerIncludedHours",
] as const;

/**
 * runTool entry point (verifiedToolType: calculator).
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    if (!values || typeof values !== "object") {
      return { ok: false, error: "Input must be an object." };
    }
    for (const key of REQUIRED_KEYS) {
      const v = values[key];
      if (v === undefined || v === null || v === "") {
        return { ok: false, error: `${key} is required.` };
      }
    }
    const overageRaw = values["overageHourlyRate"];
    const input: RetainerCompareInput = {
      hourlyRate: requireNonNegativeNumber("hourlyRate", values["hourlyRate"]),
      estimatedHoursPerMonth: requireNonNegativeNumber(
        "estimatedHoursPerMonth",
        values["estimatedHoursPerMonth"],
      ),
      retainerFee: requireNonNegativeNumber("retainerFee", values["retainerFee"]),
      retainerIncludedHours: requireNonNegativeNumber(
        "retainerIncludedHours",
        values["retainerIncludedHours"],
      ),
      overageHourlyRate:
        overageRaw === undefined || overageRaw === null || overageRaw === ""
          ? undefined
          : requireNonNegativeNumber("overageHourlyRate", overageRaw),
    };
    const r = compareRetainerVsHourly(input);
    return {
      ok: true,
      values: {
        hourlyModelMonthlyCost: r.hourlyModelMonthlyCost,
        retainerModelMonthlyCost: r.retainerModelMonthlyCost,
        breakEvenHours: r.breakEvenHours,
        cheaperOption: r.cheaperOption,
        savingsDifference: r.savingsDifference,
        notes: r.notes,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
