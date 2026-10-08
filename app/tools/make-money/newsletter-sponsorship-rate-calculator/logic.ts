/**
 * Newsletter Sponsorship Rate Calculator — pure logic (tool-084).
 *
 * HONESTY: pure math. The CPM benchmarks (primary placement ~$150 CPM,
 * secondary placement ~$50 CPM) are 2026 ESTIMATES, not platform-published
 * rates — labeled as estimates everywhere they appear. Actual newsletter
 * ad prices vary by niche, list quality, audience geography, and
 * negotiation. Nothing here is a guarantee.
 *
 * Formula (from the spec):
 *   cpm = placement == 'primary' ? 150 : 50   (2026, labeled estimate)
 *   rate_per_issue = subscriber_count / 1000 × cpm
 *   effective_cpm = rate_per_issue / (subscriber_count × open_rate/100) × 1000
 *   (effective_cpm is n/a when open_rate is 0 — no opens, no per-open math)
 * Rounded half-up to 2 decimals (USD).
 *
 * Zero imports, zero network, zero DOM. Fully deterministic:
 * same inputs -> identical outputs.
 */

export const CURRENCY = "USD";

export const PLACEMENTS = ["primary", "secondary"] as const;
export type Placement = (typeof PLACEMENTS)[number];

/**
 * Placement CPM benchmarks (USD), labeled 2026 estimates from the
 * formula spec: primary placement ~$150 CPM, secondary ~$50 CPM.
 */
export const PLACEMENT_CPM: Record<Placement, { cpm: number; label: string }> = {
  primary: { cpm: 150, label: "Primary placement (top of email)" },
  secondary: { cpm: 50, label: "Secondary placement (below the fold)" },
};

/** Largest subscriber count the calculator will attempt (sanity guard). */
export const MAX_SUBSCRIBERS = 1e12;

export interface NewsletterRateInput {
  /** Newsletter subscriber count. Must be a finite number > 0. */
  subscriberCount: number;
  /** Average open rate, percent 0–100. */
  openRate: number;
  /** Ad placement tier. */
  placement: Placement;
}

export interface NewsletterRateResult {
  currency: string;
  /** Estimated rate per issue, USD. */
  ratePerIssue: number;
  /** Effective CPM across opened emails, USD — null when openRate is 0. */
  effectiveCpm: number | null;
  /** The CPM benchmark used, USD. */
  benchmarkCpm: number;
  /** Human summary incl. estimate labels and honesty caveats. */
  note: string;
}

/** Round half-up to 2 decimals (USD cents). */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function assertFiniteNumber(name: string, value: unknown): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number (got ${String(value)}).`);
  }
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

/**
 * Compute the newsletter sponsorship rate.
 *
 * @throws {TypeError} for non-numeric / non-finite inputs, an unknown
 *   placement, or a non-object input.
 * @throws {RangeError} for subscriberCount <= 0 or above the sanity cap,
 *   or openRate outside 0–100.
 */
export function calculateNewsletterRate(input: NewsletterRateInput): NewsletterRateResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }

  assertFiniteNumber("subscriberCount", input.subscriberCount);
  if (input.subscriberCount <= 0) {
    throw new RangeError("subscriberCount must be greater than 0.");
  }
  if (input.subscriberCount > MAX_SUBSCRIBERS) {
    throw new RangeError(`subscriberCount is unrealistically large (max ${MAX_SUBSCRIBERS}).`);
  }

  assertFiniteNumber("openRate", input.openRate);
  if (input.openRate < 0 || input.openRate > 100) {
    throw new RangeError("openRate must be between 0 and 100 (percent).");
  }

  if (!PLACEMENTS.includes(input.placement)) {
    throw new TypeError(`placement must be one of: ${PLACEMENTS.join(", ")}.`);
  }

  const cpm = PLACEMENT_CPM[input.placement].cpm;
  const ratePerIssue = roundMoney((input.subscriberCount / 1000) * cpm);

  // Effective CPM across opens; n/a when nothing is opened.
  const effectiveCpm =
    input.openRate === 0
      ? null
      : roundMoney(ratePerIssue / ((input.subscriberCount * input.openRate) / 100) * 1000);

  const fmtMoney = (n: number): string =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const note =
    `${PLACEMENT_CPM[input.placement].label} at $${cpm} CPM (2026 labeled estimate) × ` +
    `${input.subscriberCount.toLocaleString("en-US")} subscribers = $${fmtMoney(ratePerIssue)} USD per issue. ` +
    (effectiveCpm === null
      ? "Effective CPM is n/a — with a 0% open rate there are no opens to price against. "
      : `Effective CPM across opens: $${fmtMoney(effectiveCpm)} USD. `) +
    "CPM benchmarks are estimates, not platform-published rates. " +
    "Actual rates vary by niche, list quality, audience geography, and negotiation.";

  return {
    currency: CURRENCY,
    ratePerIssue,
    effectiveCpm,
    benchmarkCpm: cpm,
    note,
  };
}

// ---------------------------------------------------------------------------
// runTool adapter — contract shape for the mountToolUI template
// ---------------------------------------------------------------------------

/**
 * Contract adapter: `runTool({ subscriberCount, openRate, placement })`
 * -> { ok, values?, error? }. Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input received — enter your newsletter stats first." };
  }

  const rawSubs = values["subscriberCount"];
  const rawOpen = values["openRate"];
  const rawPlacement = values["placement"];

  if (typeof rawSubs !== "number" || Number.isNaN(rawSubs) || rawSubs <= 0) {
    return { ok: false, error: "Enter a subscriber count greater than 0." };
  }
  if (
    typeof rawOpen !== "number" ||
    Number.isNaN(rawOpen) ||
    rawOpen < 0 ||
    rawOpen > 100
  ) {
    return { ok: false, error: "Enter an open rate between 0 and 100 percent." };
  }
  if (rawPlacement !== "primary" && rawPlacement !== "secondary") {
    return { ok: false, error: "Choose a placement: primary or secondary." };
  }

  let result: NewsletterRateResult;
  try {
    result = calculateNewsletterRate({
      subscriberCount: rawSubs,
      openRate: rawOpen,
      placement: rawPlacement,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not calculate the rate." };
  }

  return {
    ok: true,
    values: {
      ratePerIssue: result.ratePerIssue,
      effectiveCpm:
        result.effectiveCpm === null
          ? "n/a (0% open rate — no opens to price against)"
          : result.effectiveCpm,
      benchmarkCpm: result.benchmarkCpm,
      currency: result.currency,
      note: result.note,
    },
  };
}
