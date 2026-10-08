/**
 * Upwork Fee Calculator — pure logic (tool-066).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - Upwork's freelancer service fee is VARIABLE per contract (0–15%).
 *   The fee rate is NEVER hardcoded as fixed: it is a user-entered input
 *   (serviceFeeRate) with a documented default of 10%.
 * - ILLUSTRATIVE tier table (estimate — Upwork's fee schedule changes;
 *   always verify the current schedule on Upwork's help pages). It is kept
 *   here only as a reference comment and is NOT used by the calculation:
 *     - 0%  — Upwork "Any Hire" / Bring Your Own Client contracts
 *     - 10% — most standard marketplace contracts (default estimate)
 *     - 15% — some Project Catalog / specialized contracts
 * - Connects are a PRE-SALE bidding cost (~$0.15/Connect, typically 6–16
 *   Connects per proposal). Connects cost is an optional separate line and
 *   is NOT subtracted from the payout; the note output explains this.
 * - All amounts are USD. No FX conversion is performed anywhere.
 * - Each fee line is rounded to the nearest cent (half-up) BEFORE summing.
 * - Results are ESTIMATES: Upwork can change its fee schedule at any time.
 */

export const UPWORK_MAX_FEE_RATE = 15;
export const UPWORK_DEFAULT_FEE_RATE = 10;
export const UPWORK_CONNECTS_UNIT_COST = 0.15;
/** Largest contract amount the calculator will attempt (sanity guard). */
export const MAX_CONTRACT_AMOUNT = 1e9;

/** Round to the nearest cent, half-up (positive values). */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

interface NumberResult {
  ok: boolean;
  value: number;
  error?: string;
}

function parseNumber(
  values: Record<string, unknown>,
  id: string,
  opts: { required: boolean; min: number; max: number; integer?: boolean; label: string },
): NumberResult {
  const raw = values[id];
  if (raw === undefined || raw === null || raw === "") {
    if (!opts.required) return { ok: true, value: NaN };
    return { ok: false, value: NaN, error: `Please enter ${opts.label}.` };
  }
  const n = typeof raw === "number" ? raw : Number(raw);
  if (typeof raw === "boolean" || Number.isNaN(n)) {
    return { ok: false, value: NaN, error: `${opts.label} must be a number.` };
  }
  if (!Number.isFinite(n)) {
    return { ok: false, value: NaN, error: `${opts.label} must be a finite number.` };
  }
  if (opts.integer && !Number.isInteger(n)) {
    return { ok: false, value: NaN, error: `${opts.label} must be a whole number.` };
  }
  if (n < opts.min) {
    return { ok: false, value: NaN, error: `${opts.label} must be at least ${opts.min}.` };
  }
  if (n > opts.max) {
    return { ok: false, value: NaN, error: `${opts.label} must be at most ${opts.max}.` };
  }
  return { ok: true, value: n };
}

/**
 * runTool adapter for the Upwork Fee Calculator.
 *
 * Inputs (values): contractAmount (required, >0), serviceFeeRate
 * (optional, 0–15, default 10 — user-editable estimate), connectsUsed
 * (optional whole number >=0 — Connects spent to win the work).
 *
 * Outputs: serviceFee (USD), netPayout (USD), connectsCost (USD, null when
 * connectsUsed was not entered), note (text — estimate labeling).
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input values were provided." };
  }

  const amount = parseNumber(values, "contractAmount", {
    required: true,
    min: 0.01,
    max: MAX_CONTRACT_AMOUNT,
    label: "Contract amount",
  });
  if (!amount.ok) return { ok: false, error: amount.error };

  const rate = parseNumber(values, "serviceFeeRate", {
    required: false,
    min: 0,
    max: UPWORK_MAX_FEE_RATE,
    label: "Service fee rate",
  });
  if (!rate.ok) return { ok: false, error: rate.error };
  const feeRate = Number.isNaN(rate.value) ? UPWORK_DEFAULT_FEE_RATE : rate.value;

  const connects = parseNumber(values, "connectsUsed", {
    required: false,
    min: 0,
    max: 100000,
    integer: true,
    label: "Connects used",
  });
  if (!connects.ok) return { ok: false, error: connects.error };
  const connectsUsed = Number.isNaN(connects.value) ? null : connects.value;

  const serviceFee = roundToCents(amount.value * (feeRate / 100));
  const netPayout = roundToCents(amount.value - serviceFee);
  const connectsCost =
    connectsUsed === null ? null : roundToCents(connectsUsed * UPWORK_CONNECTS_UNIT_COST);

  const note =
    `ESTIMATE — fee computed at ${feeRate}% (user-adjustable; Upwork's fee is ` +
    `variable per contract, 0–15%, and can change — verify the current schedule). ` +
    (connectsCost === null
      ? "No Connects entered: pre-sale bidding cost is not included."
      : `Connects cost (~$${UPWORK_CONNECTS_UNIT_COST}/Connect) is a pre-sale bidding cost and is NOT subtracted from the payout.`);

  return {
    ok: true,
    values: { serviceFee, netPayout, connectsCost, note },
  };
}
