/**
 * Revision Pricing Calculator — pure logic (tool-461).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - Formula J-REVISION (from spec):
 *     extraRevisions  = max(0, requestedRevisions - includedRevisions)
 *     pct-of-fee mode: revisionFee = baseProjectFee * (revisionPct / 100) * extraRevisions
 *     flat mode:       revisionFee = flatPerRevision * extraRevisions
 *     newProjectTotal = baseProjectFee + revisionFee
 * - Rates are the user's own pricing policy — the tool does not recommend a
 *   rate (honesty note).
 * - revisionPct is a USER input, 0–100. A 0% pct in pct-of-fee mode makes
 *   extra revisions free; the tool flags this with a prompt note (spec edge).
 * - When requestedRevisions <= includedRevisions the fee is $0.
 * - All money values round to the nearest cent (half-up).
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

function requireNonNegativeInteger(name: string, value: unknown): number {
  const n = requireNonNegativeFinite(name, value);
  if (!Number.isInteger(n)) {
    throw new RangeError(`${name} must be a whole number.`);
  }
  return n;
}

export type PricingMode = "pct-of-fee" | "flat-per-revision";

/** Internal typed input. */
export interface RevisionPricingInput {
  baseProjectFee: number;
  includedRevisions: number;
  requestedRevisions: number;
  pricingMode: PricingMode;
  /** USER input, 0–100. Required in pct-of-fee mode. */
  revisionPct?: number;
  /** USER input, >= 0. Required in flat-per-revision mode. */
  flatPerRevision?: number;
}

/** Result of the calculation. */
export interface RevisionPricingResult {
  extraRevisionCount: number;
  revisionFee: number;
  newProjectTotal: number;
  /** Plain-English note about what was computed (flags 0% pct etc.). */
  note: string;
}

/**
 * Calculate the fee for extra revisions under the user's pricing policy.
 *
 * @throws {TypeError} for non-numeric / non-finite inputs or bad pricingMode.
 * @throws {RangeError} for negative inputs, non-integer revision counts, or
 *   revisionPct outside 0–100.
 */
export function calculateRevisionPricing(input: RevisionPricingInput): RevisionPricingResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }
  const baseFee = requireNonNegativeFinite("baseProjectFee", input.baseProjectFee);
  const included = requireNonNegativeInteger("includedRevisions", input.includedRevisions);
  const requested = requireNonNegativeInteger("requestedRevisions", input.requestedRevisions);
  const mode = input.pricingMode;
  if (mode !== "pct-of-fee" && mode !== "flat-per-revision") {
    throw new TypeError('pricingMode must be "pct-of-fee" or "flat-per-revision".');
  }

  const extraRevisionCount = Math.max(0, requested - included);

  let revisionFee = 0;
  let note: string;
  if (mode === "pct-of-fee") {
    const pct = requireNonNegativeFinite("revisionPct", input.revisionPct);
    if (pct > 100) {
      throw new RangeError("revisionPct must be between 0 and 100.");
    }
    revisionFee = roundToCents(baseFee * (pct / 100) * extraRevisionCount);
    if (extraRevisionCount === 0) {
      note = "Requested revisions are within the included rounds — no extra fee.";
    } else if (pct === 0) {
      note =
        "revisionPct is 0%: extra revisions are FREE under this policy. Double-check this is what you want before sending the quote.";
    } else {
      note = `Each of the ${extraRevisionCount} extra revision(s) costs ${pct}% of the project fee ($${roundToCents((baseFee * pct) / 100).toFixed(2)} each).`;
    }
  } else {
    const flat = requireNonNegativeFinite("flatPerRevision", input.flatPerRevision);
    revisionFee = roundToCents(flat * extraRevisionCount);
    note =
      extraRevisionCount === 0
        ? "Requested revisions are within the included rounds — no extra fee."
        : `Each of the ${extraRevisionCount} extra revision(s) costs a flat $${flat.toFixed(2)}.`;
  }

  const newProjectTotal = roundToCents(baseFee + revisionFee);

  return { extraRevisionCount, revisionFee, newProjectTotal, note };
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
    for (const key of ["baseProjectFee", "includedRevisions", "requestedRevisions", "pricingMode"] as const) {
      const v = values[key];
      if (v === undefined || v === null || v === "") {
        return { ok: false, error: `${key} is required.` };
      }
    }
    const mode = values["pricingMode"];
    if (mode !== "pct-of-fee" && mode !== "flat-per-revision") {
      return { ok: false, error: 'pricingMode must be "pct-of-fee" or "flat-per-revision".' };
    }

    const pctRaw = values["revisionPct"];
    const flatRaw = values["flatPerRevision"];
    if (mode === "pct-of-fee" && (pctRaw === undefined || pctRaw === null || pctRaw === "")) {
      return { ok: false, error: "revisionPct is required for the pct-of-fee mode." };
    }
    if (mode === "flat-per-revision" && (flatRaw === undefined || flatRaw === null || flatRaw === "")) {
      return { ok: false, error: "flatPerRevision is required for the flat-per-revision mode." };
    }

    const input: RevisionPricingInput = {
      baseProjectFee: requireNonNegativeFinite("baseProjectFee", values["baseProjectFee"]),
      includedRevisions: requireNonNegativeInteger("includedRevisions", values["includedRevisions"]),
      requestedRevisions: requireNonNegativeInteger("requestedRevisions", values["requestedRevisions"]),
      pricingMode: mode,
      revisionPct:
        pctRaw === undefined || pctRaw === null || pctRaw === ""
          ? undefined
          : requireNonNegativeFinite("revisionPct", pctRaw),
      flatPerRevision:
        flatRaw === undefined || flatRaw === null || flatRaw === ""
          ? undefined
          : requireNonNegativeFinite("flatPerRevision", flatRaw),
    };
    const pct = input.revisionPct;
    if (input.pricingMode === "pct-of-fee" && pct !== undefined && pct > 100) {
      return { ok: false, error: "revisionPct must be between 0 and 100." };
    }

    const r = calculateRevisionPricing(input);
    return {
      ok: true,
      values: {
        extraRevisionCount: r.extraRevisionCount,
        revisionFee: r.revisionFee,
        newProjectTotal: r.newProjectTotal,
        note: r.note,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
