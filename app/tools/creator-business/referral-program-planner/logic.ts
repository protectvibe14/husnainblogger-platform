/**
 * Referral Program Planner (tool-491) — pure logic, zero imports, zero
 * network, zero DOM, no randomness.
 *
 * HONESTY: arithmetic only. Every number comes from the user's own inputs;
 * commission terms are the user's policy, not advice. The ROI is a labeled
 * estimate derived from the user's inputs — actual results depend on referral
 * quality, conversion rates, and payment terms, which this tool cannot know.
 *
 * Formulas (formulaRef J-REFERRAL):
 *   payoutPerReferral    = avgClientValue * (commissionPct / 100) + flatBounty
 *   quarterlyProgramCost = payoutPerReferral * expectedReferralsPerQuarter
 *   programROIEstimate   = human-readable estimate string (labeled estimate)
 *
 * Generator contract: runTool(values) -> { ok, values, error }.
 * values in  = { avgClientValue, commissionPct, flatBounty?, expectedReferralsPerQuarter }
 * values out = { payoutPerReferral, quarterlyProgramCost, programROIEstimate }
 * Output ids match meta.ts outputs. Deterministic: same inputs -> same outputs.
 */

export interface ReferralValues {
  /** Estimated payout owed for one successful referral (currency). */
  payoutPerReferral: number;
  /** Estimated total payout cost per quarter (currency). */
  quarterlyProgramCost: number;
  /** Human-readable, labeled estimate explaining the math and its limits. */
  programROIEstimate: string;
}

export interface ReferralResult {
  ok: boolean;
  values?: ReferralValues;
  error?: string;
}

/** Commission percentage is bounded 0-100 (also enforced by the UI). */
const PERCENT_MAX = 100;

/**
 * Accept a finite number from a number or numeric string. Returns null for
 * missing, empty, NaN, Infinity, or non-numeric input.
 */
function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function money(n: number): string {
  return (
    "$" +
    round2(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function pluralizeReferral(n: number): string {
  return n === 1 ? "referral" : "referrals";
}

/**
 * Build the labeled ROI estimate text. `cost` and `payout` are already
 * rounded; `revenue` is the estimated gross value of the referred clients.
 */
function buildEstimate(
  avgClientValue: number,
  commissionPct: number,
  flatBounty: number,
  referrals: number,
  payout: number,
  cost: number,
): string {
  const revenue = round2(avgClientValue * referrals);
  const commissionPart = round2((avgClientValue * commissionPct) / PERCENT_MAX);

  let text =
    "Based on your inputs, each referral pays out " +
    money(payout) +
    " (" +
    money(commissionPart) +
    " commission + " +
    money(flatBounty) +
    " flat bounty). " +
    "At " +
    referrals +
    " expected " +
    pluralizeReferral(referrals) +
    " per quarter, the program would cost about " +
    money(cost) +
    ". ";

  if (cost > 0) {
    const roi = revenue / cost;
    text +=
      "Estimated revenue from those referrals: " +
      money(revenue) +
      " (" +
      referrals +
      " x " +
      money(avgClientValue) +
      " avg client value) — roughly " +
      roi.toFixed(1) +
      "x return on program cost. ";
  } else {
    text +=
      "With zero program cost, a return ratio cannot be computed — estimated revenue from the referrals would be " +
      money(revenue) +
      ". ";
  }

  text +=
    "This is an estimate from the numbers you entered, not a guarantee. " +
    "Actual results depend on referral quality, conversion rates, and payment " +
    "terms. Commission terms are your own policy — this planner is not " +
    "business or legal advice.";
  return text;
}

/**
 * Validate one numeric input: must be finite, >= min, and (for percentages)
 * <= max. Returns the number, or an error string.
 */
function checkNumber(
  raw: unknown,
  label: string,
  min: number,
  max: number | null,
): number | string {
  const n = toFiniteNumber(raw);
  if (n === null) {
    return (
      "Enter " +
      label +
      " as a valid number (no blanks, letters, or infinity)."
    );
  }
  if (n < min) {
    return "Enter " + label + " as a number of " + min + " or more.";
  }
  if (max !== null && n > max) {
    return "Enter " + label + " as a number between " + min + " and " + max + ".";
  }
  return n;
}

/**
 * Plan referral-program payouts from the user's own numbers.
 * Deterministic: same inputs always produce the same outputs.
 */
export function runTool(values: Record<string, unknown>): ReferralResult {
  const source = values ?? {};

  const avgClientValue = checkNumber(
    source.avgClientValue,
    "your average client value",
    0,
    null,
  );
  if (typeof avgClientValue === "string") {
    return { ok: false, error: avgClientValue };
  }

  const commissionPct = checkNumber(
    source.commissionPct,
    "your commission percentage",
    0,
    PERCENT_MAX,
  );
  if (typeof commissionPct === "string") {
    return { ok: false, error: commissionPct };
  }

  const flatBountyRaw =
    source.flatBounty === undefined ||
    source.flatBounty === null ||
    source.flatBounty === ""
      ? 0
      : source.flatBounty;
  const flatBounty = checkNumber(
    flatBountyRaw,
    "your flat bounty per referral",
    0,
    null,
  );
  if (typeof flatBounty === "string") {
    return { ok: false, error: flatBounty };
  }

  const referrals = checkNumber(
    source.expectedReferralsPerQuarter,
    "your expected referrals per quarter",
    0,
    null,
  );
  if (typeof referrals === "string") {
    return { ok: false, error: referrals };
  }

  const payoutPerReferral = round2(
    (avgClientValue * commissionPct) / PERCENT_MAX + flatBounty,
  );
  const quarterlyProgramCost = round2(payoutPerReferral * referrals);
  const programROIEstimate = buildEstimate(
    avgClientValue,
    commissionPct,
    flatBounty,
    referrals,
    payoutPerReferral,
    quarterlyProgramCost,
  );

  return {
    ok: true,
    values: {
      payoutPerReferral,
      quarterlyProgramCost,
      programROIEstimate,
    },
  };
}
