/**
 * Walk-Away Rate Calculator — pure logic (tool-460).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - Formula J-WALK-AWAY (from spec):
 *     floorRate    = monthlyBusinessCosts / billableHoursPerMonth
 *     walkAwayRate = floorRate * (1 + bufferPct / 100)
 * - bufferPct is a USER business assumption (how much margin you want above
 *   your cost floor), 0–100. The tool does not recommend a buffer value.
 * - currentRate is optional and only used for the gapVsCurrentRate comparison.
 * - All money values round to the nearest cent (half-up).
 * - This is math only: it says what rate covers YOUR costs plus YOUR chosen
 *   buffer — not what the market will pay (surfaced in notes[]).
 */

/** Round money to the nearest cent, half-up. */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function requireNonNegativeFinite(name: string, value: unknown): number {
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
export interface WalkAwayInput {
  monthlyBusinessCosts: number;
  /** Must be > 0. */
  billableHoursPerMonth: number;
  /** USER assumption, 0–100. */
  bufferPct: number;
  /** Optional: your current rate, for the gap comparison. */
  currentRate?: number;
}

/** Result of the calculation. */
export interface WalkAwayResult {
  /** Cost-covering floor rate ($/hr). */
  floorRate: number;
  /** Floor rate plus the buffer margin ($/hr). */
  walkAwayRate: number;
  /** walkAwayRate - currentRate; null when currentRate is not provided. */
  gapVsCurrentRate: number | null;
  /** Assumption/estimate notes surfaced to the UI. */
  notes: string[];
}

/**
 * Calculate the cost-covering floor rate and the walk-away rate.
 *
 * @throws {TypeError} for non-numeric / non-finite inputs.
 * @throws {RangeError} for negative inputs, billableHoursPerMonth <= 0, or
 *   bufferPct outside 0–100.
 */
export function calculateWalkAwayRate(input: WalkAwayInput): WalkAwayResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }
  const costs = requireNonNegativeFinite("monthlyBusinessCosts", input.monthlyBusinessCosts);
  const hours = requireNonNegativeFinite("billableHoursPerMonth", input.billableHoursPerMonth);
  const bufferPct = requireNonNegativeFinite("bufferPct", input.bufferPct);
  if (hours <= 0) {
    throw new RangeError("billableHoursPerMonth must be greater than 0.");
  }
  if (bufferPct > 100) {
    throw new RangeError("bufferPct must be between 0 and 100.");
  }

  let currentRate: number | undefined;
  if (input.currentRate !== undefined && input.currentRate !== null) {
    currentRate = requireNonNegativeFinite("currentRate", input.currentRate);
  }

  const floorRate = roundToCents(costs / hours);
  const walkAwayRate = roundToCents(floorRate * (1 + bufferPct / 100));
  const gapVsCurrentRate =
    currentRate === undefined ? null : roundToCents(walkAwayRate - currentRate);

  const notes: string[] = [];
  if (bufferPct === 0) {
    notes.push(
      "Buffer is 0%: your walk-away rate equals your cost floor — this is a survival rate with no margin for slow months.",
    );
  }
  if (costs === 0) {
    notes.push(
      "Monthly costs are $0: the floor is $0, which usually means costs are incomplete — double-check rent, tools, taxes, and insurance are included.",
    );
  }
  if (gapVsCurrentRate !== null) {
    if (gapVsCurrentRate > 0) {
      notes.push(
        `You would need to raise your rate by $${gapVsCurrentRate.toFixed(2)}/hr to reach your walk-away rate.`,
      );
    } else if (gapVsCurrentRate < 0) {
      notes.push(
        `Your current rate sits $${Math.abs(gapVsCurrentRate).toFixed(2)}/hr above your walk-away rate — you have headroom.`,
      );
    } else {
      notes.push("Your current rate exactly matches your walk-away rate.");
    }
  }
  notes.push(
    "Math only: this covers YOUR costs plus YOUR chosen buffer. The buffer percentage is your own business assumption, and the result says nothing about what the market will pay.",
  );

  return { floorRate, walkAwayRate, gapVsCurrentRate, notes };
}

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
    for (const key of ["monthlyBusinessCosts", "billableHoursPerMonth", "bufferPct"] as const) {
      const v = values[key];
      if (v === undefined || v === null || v === "") {
        return { ok: false, error: `${key} is required.` };
      }
    }
    const hours = requireNonNegativeFinite("billableHoursPerMonth", values["billableHoursPerMonth"]);
    const bufferPct = requireNonNegativeFinite("bufferPct", values["bufferPct"]);
    if (hours <= 0) {
      return { ok: false, error: "billableHoursPerMonth must be greater than 0." };
    }
    if (bufferPct > 100) {
      return { ok: false, error: "bufferPct must be between 0 and 100." };
    }
    const currentRaw = values["currentRate"];
    const input: WalkAwayInput = {
      monthlyBusinessCosts: requireNonNegativeFinite(
        "monthlyBusinessCosts",
        values["monthlyBusinessCosts"],
      ),
      billableHoursPerMonth: hours,
      bufferPct,
      currentRate:
        currentRaw === undefined || currentRaw === null || currentRaw === ""
          ? undefined
          : requireNonNegativeFinite("currentRate", currentRaw),
    };
    const r = calculateWalkAwayRate(input);
    return {
      ok: true,
      values: {
        floorRate: r.floorRate,
        walkAwayRate: r.walkAwayRate,
        gapVsCurrentRate: r.gapVsCurrentRate,
        notes: r.notes,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
