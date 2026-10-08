/**
 * Rush Fee Calculator — pure logic (tool-454).
 *
 * ZERO imports, zero network, zero DOM, deterministic.
 *
 * HONESTY:
 * - Math only. The rush PERCENTAGE is the user's own pricing policy —
 *   no market-standard rush percentage exists and none is baked in.
 *
 * FORMULA (J-RUSH-FEE):
 * - rushFee  = baseProjectPrice * (rushPct / 100)
 * - rushTotal = baseProjectPrice + rushFee
 * - Money rounds to the nearest cent (half-up).
 *
 * BOUNDS:
 * - 0-100: accepted silently (the UI enforces 0-100 bounds).
 * - 100-200: accepted with a caution note (the user may price rush as
 *   doubling the base — legal, but flagged so typos get noticed).
 * - >200: rejected as a likely typo (analog of the spec's "confirm prompt").
 */

export interface RushFeeInput {
  /** Base project price. >= 0. */
  baseProjectPrice: number;
  /** USER ASSUMPTION: rush surcharge as % of base. 0-100 normally. */
  rushPct: number;
}

export interface RushFeeResult {
  /** Rush surcharge, rounded to cents. */
  rushFeeAmount: number;
  /** Base + rush surcharge, rounded to cents. */
  rushTotal: number;
  /** rushPct echoed back (rushFee / baseProjectPrice * 100). */
  rushFeeAsPctOfBase: number;
  /** Empty string when nothing to flag; caution when rushPct > 100. */
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

/**
 * Calculate a rush fee from the user's base price and rush percentage.
 *
 * @throws {Error} for missing/invalid inputs (human-readable messages).
 */
export function calculateRushFee(input: RushFeeInput): RushFeeResult {
  if (!input || typeof input !== "object") {
    throw new Error("Input must be an object.");
  }

  const base = readNumber("baseProjectPrice", input.baseProjectPrice);
  if (base < 0) throw fail("baseProjectPrice", "must be >= 0.");

  const pct = readNumber("rushPct", input.rushPct);
  if (pct < 0) throw fail("rushPct", "must be >= 0.");
  if (pct > 200) {
    throw fail(
      "rushPct",
      `of ${pct}% looks like a typo — please confirm the percentage and re-enter (max accepted: 200%).`,
    );
  }

  const rushFeeAmount = roundToCents(base * (pct / 100));
  const rushTotal = roundToCents(base + rushFeeAmount);

  let note = "";
  if (pct > 100) {
    note =
      `Note: a rush percent above 100% means the surcharge is larger than the base price. ` +
      `That is allowed if it matches your pricing policy — double-check it before quoting the client.`;
  }

  return {
    rushFeeAmount,
    rushTotal,
    rushFeeAsPctOfBase: pct,
    note,
  };
}

/**
 * Tool-logic-slot adapter: validates flat UI values and runs calculateRushFee.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    const result = calculateRushFee({
      baseProjectPrice: values.baseProjectPrice as number,
      rushPct: values.rushPct as number,
    });
    return {
      ok: true,
      values: {
        rushFeeAmount: result.rushFeeAmount,
        rushTotal: result.rushTotal,
        rushFeeAsPctOfBase: result.rushFeeAsPctOfBase,
        note: result.note,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }
}
