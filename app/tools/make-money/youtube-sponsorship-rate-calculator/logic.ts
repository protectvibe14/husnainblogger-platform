/**
 * YouTube Sponsorship Rate Calculator — pure logic (tool-081).
 *
 * HONESTY: pure math over benchmark bands. The tier bands below are
 * 2026 compiled survey ESTIMATES, not verified platform data, and the
 * dedicated-vs-integration multiplier (0.3–0.5) is a labeled estimate.
 * Results are guidance only: actual rates vary by niche, engagement,
 * audience geography, and negotiation. Nothing here is a guarantee.
 *
 * Benchmark bands (USD per video, labeled estimates):
 * - nano  (<10k subs):       $20 – $200
 * - micro (10k – 99,999):    $200 – $1,000
 * - mid   (100k – 999,999):  $1,000 – $10,000
 * - macro (1M – 9,999,999):  $10,000 – $50,000
 * - mega  (10M+):            $50,000 – $300,000
 * (from the formula spec: nano $20–$200 scaling to mega $50k–$300k+;
 * intermediate tiers are log-interpolated estimates, labeled as such)
 *
 * Zero imports, zero network, zero DOM. Fully deterministic:
 * same inputs -> identical outputs.
 */

export const CURRENCY = "USD";

export interface CreatorTier {
  id: string;
  label: string;
  /** Inclusive lower subscriber bound for this tier. */
  minSubs: number;
  /** Exclusive upper subscriber bound for this tier (Infinity for mega). */
  maxSubs: number;
  bandLow: number;
  bandHigh: number;
}

/** 5 tiers, ordered smallest -> largest. */
export const CREATOR_TIERS: CreatorTier[] = [
  { id: "nano", label: "Nano (<10k subscribers)", minSubs: 0, maxSubs: 10000, bandLow: 20, bandHigh: 200 },
  { id: "micro", label: "Micro (10k–100k subscribers)", minSubs: 10000, maxSubs: 100000, bandLow: 200, bandHigh: 1000 },
  { id: "mid", label: "Mid-tier (100k–1M subscribers)", minSubs: 100000, maxSubs: 1000000, bandLow: 1000, bandHigh: 10000 },
  { id: "macro", label: "Macro (1M–10M subscribers)", minSubs: 1000000, maxSubs: 10000000, bandLow: 10000, bandHigh: 50000 },
  { id: "mega", label: "Mega (10M+ subscribers)", minSubs: 10000000, maxSubs: Number.POSITIVE_INFINITY, bandLow: 50000, bandHigh: 300000 },
];

export const INTEGRATION_TYPES = ["dedicated", "integration"] as const;
export type IntegrationType = (typeof INTEGRATION_TYPES)[number];

/**
 * Dedicated-video multiplier: a full sponsored video = the whole band.
 * Integration multiplier (a sponsored segment inside a normal video):
 * 0.3–0.5 of the band — LABELED ESTIMATE.
 */
export const INTEGRATION_MULTIPLIER_LOW = 0.3;
export const INTEGRATION_MULTIPLIER_HIGH = 0.5;

/** Largest audience count the calculator will attempt (sanity guard). */
export const MAX_COUNT = 1e12;

export interface YouTubeRateInput {
  /** Channel subscriber count. Must be a finite number > 0. */
  subscriberCount: number;
  /** Average views per video. Must be a finite number > 0. */
  avgViews: number;
  /** "dedicated" (full sponsored video) or "integration" (sponsored segment). */
  integrationType: IntegrationType;
}

export interface YouTubeRateResult {
  currency: string;
  /** Suggested low end of the rate range, USD per video. */
  rateLow: number;
  /** Suggested high end of the rate range, USD per video. */
  rateHigh: number;
  /** Tier label the range was read from, e.g. "Micro (10k–100k subscribers)". */
  tier: string;
  /** Which input drove the tier (subscribers or views). */
  tierDrivenBy: "subscribers" | "views";
  /** Human summary incl. estimate labels and honesty caveats. */
  note: string;
}

/**
 * Sponsorship rounding per the formula spec:
 * - values under $1,000: nearest $10
 * - values $1,000 and up: nearest $500
 */
export function roundSponsorship(value: number): number {
  if (value < 1000) return Math.round(value / 10) * 10;
  return Math.round(value / 500) * 500;
}

/** Tier index for an audience count. */
export function tierIndexFor(count: number): number {
  for (let i = CREATOR_TIERS.length - 1; i >= 0; i--) {
    if (count >= CREATOR_TIERS[i].minSubs) return i;
  }
  return 0;
}

function assertPositiveFinite(name: string, value: unknown): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number (got ${String(value)}).`);
  }
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
  if (value <= 0) {
    throw new RangeError(`${name} must be greater than 0.`);
  }
  if (value > MAX_COUNT) {
    throw new RangeError(`${name} is unrealistically large (max ${MAX_COUNT}).`);
  }
}

/**
 * Compute the suggested YouTube sponsorship rate range.
 *
 * Tier is chosen from subscribers AND average views: the higher of the two
 * tiers is used (a small channel with outsized views prices like its views),
 * noted in the result. Dedicated = full band; integration = band × 0.3–0.5.
 *
 * @throws {TypeError} for non-numeric / non-finite inputs or a non-object input.
 * @throws {RangeError} for subscriberCount/avgViews <= 0 or above the sanity cap.
 */
export function calculateYouTubeRate(input: YouTubeRateInput): YouTubeRateResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }

  assertPositiveFinite("subscriberCount", input.subscriberCount);
  assertPositiveFinite("avgViews", input.avgViews);

  const integrationType = input.integrationType;
  if (!INTEGRATION_TYPES.includes(integrationType)) {
    throw new TypeError(
      `integrationType must be one of: ${INTEGRATION_TYPES.join(", ")}.`,
    );
  }

  const subTier = tierIndexFor(input.subscriberCount);
  const viewTier = tierIndexFor(input.avgViews);
  // Use the higher tier: outsized views price like views, not subs.
  const tierIdx = Math.max(subTier, viewTier);
  const tier = CREATOR_TIERS[tierIdx];
  const tierDrivenBy = viewTier > subTier ? "views" : "subscribers";

  let multLow: number;
  let multHigh: number;
  let dealType: string;
  if (integrationType === "dedicated") {
    multLow = 1.0;
    multHigh = 1.0;
    dealType = "dedicated video";
  } else {
    multLow = INTEGRATION_MULTIPLIER_LOW;
    multHigh = INTEGRATION_MULTIPLIER_HIGH;
    dealType = "sponsored integration";
  }

  const rateLow = roundSponsorship(tier.bandLow * multLow);
  const rateHigh = roundSponsorship(tier.bandHigh * multHigh);

  const note =
    `${tier.label} estimate for a ${dealType}: $${rateLow.toLocaleString("en-US")}–$${rateHigh.toLocaleString("en-US")} USD per video. ` +
    (integrationType === "integration"
      ? "Integration multiplier 0.3–0.5 is a labeled estimate. "
      : "") +
    `Tier was read from your ${tierDrivenBy}. ` +
    "Rates are 2026 compiled benchmark ESTIMATES — not guarantees and not researched advertiser data. " +
    "Actual rates vary by niche, engagement, audience geography, and negotiation.";

  return {
    currency: CURRENCY,
    rateLow,
    rateHigh,
    tier: tier.label,
    tierDrivenBy,
    note,
  };
}

// ---------------------------------------------------------------------------
// runTool adapter — contract shape for the mountToolUI template
// ---------------------------------------------------------------------------

/**
 * Contract adapter: `runTool({ subscriberCount, avgViews, integrationType })`
 * -> { ok, values?, error? }. Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input received — enter your channel stats first." };
  }

  const rawSubs = values["subscriberCount"];
  const rawViews = values["avgViews"];
  const rawType = values["integrationType"];

  if (typeof rawSubs !== "number" || Number.isNaN(rawSubs) || rawSubs <= 0) {
    return { ok: false, error: "Enter a subscriber count greater than 0." };
  }
  if (typeof rawViews !== "number" || Number.isNaN(rawViews) || rawViews <= 0) {
    return { ok: false, error: "Enter an average view count greater than 0." };
  }
  if (rawType !== "dedicated" && rawType !== "integration") {
    return { ok: false, error: "Choose a deal type: dedicated video or sponsored integration." };
  }

  let result: YouTubeRateResult;
  try {
    result = calculateYouTubeRate({
      subscriberCount: rawSubs,
      avgViews: rawViews,
      integrationType: rawType,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not calculate the rate." };
  }

  return {
    ok: true,
    values: {
      rateLow: result.rateLow,
      rateHigh: result.rateHigh,
      currency: result.currency,
      tier: result.tier,
      tierDrivenBy: result.tierDrivenBy,
      note: result.note,
    },
  };
}
