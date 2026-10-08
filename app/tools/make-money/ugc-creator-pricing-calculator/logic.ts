/**
 * UGC Creator Pricing Calculator — pure logic (tool-083).
 *
 * HONESTY: pure math over benchmark data. The $500 base rate (UGC video
 * without posting) and the usage-rights multipliers are labeled ESTIMATES,
 * not verified platform rates — every number the user overrides is marked
 * as user-editable and the tool treats its own defaults as defaults only.
 * Results are guidance: actual UGC prices vary by niche, creator portfolio,
 * usage length, exclusivity, and negotiation.
 *
 * Formula (from the spec):
 *   base_per_video = ~$500 (no-posting UGC, labeled estimate)
 *   usage_multiplier = organic 1.0 / paid_ads 1.5–2.5 / whitelisting 2.0–3.0
 *   posting_addon = posting_required ? +25–50% : 0
 *   suggested_range = video_count × base_per_video × usage_multiplier × (1 + posting_addon)
 * Rounded to the nearest $25.
 *
 * Zero imports, zero network, zero DOM. Fully deterministic:
 * same inputs -> identical outputs.
 */

export const CURRENCY = "USD";

/** Base rate per UGC video without posting (USD, labeled estimate). */
export const BASE_PER_VIDEO = 500;

export const USAGE_RIGHTS = ["organic", "paid_ads", "whitelisting"] as const;
export type UsageRights = (typeof USAGE_RIGHTS)[number];

/**
 * Usage-rights multipliers (low–high), labeled estimates from the formula spec:
 * organic 1.0×, paid_ads 1.5–2.5×, whitelisting 2.0–3.0×.
 */
export const USAGE_MULTIPLIERS: Record<UsageRights, { low: number; high: number; label: string }> = {
  organic: { low: 1.0, high: 1.0, label: "Organic use only" },
  paid_ads: { low: 1.5, high: 2.5, label: "Paid ads usage" },
  whitelisting: { low: 2.0, high: 3.0, label: "Whitelisting (brand runs ads from your handle)" },
};

/**
 * Posting add-on (low–high): creators who must post to their own channels
 * charge +25–50% more (labeled estimate).
 */
export const POSTING_ADDON_LOW = 0.25;
export const POSTING_ADDON_HIGH = 0.5;

/** Largest video count the calculator will attempt (sanity guard). */
export const MAX_VIDEOS = 1e6;

export interface UgcPricingInput {
  /** Number of UGC videos. Must be a positive integer. */
  videoCount: number;
  /** Usage rights tier. */
  usageRights: UsageRights;
  /** Whether the creator must post the videos to their own channels. */
  postingRequired: boolean;
}

export interface UgcPricingResult {
  currency: string;
  /** Suggested total — low end, USD. */
  rateLow: number;
  /** Suggested total — high end, USD. */
  rateHigh: number;
  /** Per-video equivalent of the low end, USD. */
  perVideoLow: number;
  /** Per-video equivalent of the high end, USD. */
  perVideoHigh: number;
  /** Human summary incl. applied multipliers and honesty caveats. */
  note: string;
}

/** Round to the nearest $25 per the formula spec. */
export function roundUgcRate(value: number): number {
  return Math.round(value / 25) * 25;
}

/**
 * Compute the suggested UGC package price range.
 *
 * @throws {TypeError} for non-numeric / non-finite inputs, non-boolean
 *   postingRequired, or a non-object input.
 * @throws {RangeError} for videoCount not a positive integer.
 */
export function calculateUgcPrice(input: UgcPricingInput): UgcPricingResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }

  const videoCount = input.videoCount;
  if (typeof videoCount !== "number" || Number.isNaN(videoCount)) {
    throw new TypeError(`videoCount must be a number (got ${String(videoCount)}).`);
  }
  if (!Number.isFinite(videoCount)) {
    throw new TypeError("videoCount must be a finite number.");
  }
  if (!Number.isInteger(videoCount) || videoCount <= 0) {
    throw new RangeError("videoCount must be a whole number greater than 0.");
  }
  if (videoCount > MAX_VIDEOS) {
    throw new RangeError(`videoCount is unrealistically large (max ${MAX_VIDEOS}).`);
  }

  if (!USAGE_RIGHTS.includes(input.usageRights)) {
    throw new TypeError(
      `usageRights must be one of: ${USAGE_RIGHTS.join(", ")}.`,
    );
  }

  if (typeof input.postingRequired !== "boolean") {
    throw new TypeError("postingRequired must be a boolean.");
  }

  const mult = USAGE_MULTIPLIERS[input.usageRights];
  const addonLow = input.postingRequired ? POSTING_ADDON_LOW : 0;
  const addonHigh = input.postingRequired ? POSTING_ADDON_HIGH : 0;

  const rateLow = roundUgcRate(videoCount * BASE_PER_VIDEO * mult.low * (1 + addonLow));
  const rateHigh = roundUgcRate(videoCount * BASE_PER_VIDEO * mult.high * (1 + addonHigh));
  const perVideoLow = roundUgcRate(BASE_PER_VIDEO * mult.low * (1 + addonLow));
  const perVideoHigh = roundUgcRate(BASE_PER_VIDEO * mult.high * (1 + addonHigh));

  const fmt = (n: number): string => `$${n.toLocaleString("en-US")}`;
  const videoWord = videoCount === 1 ? "video" : "videos";

  const note =
    `${videoCount} UGC ${videoWord} × ${fmt(BASE_PER_VIDEO)} base (labeled estimate) × ` +
    `${mult.label.toLowerCase()} (${mult.low}–${mult.high}×, labeled estimate)` +
    (input.postingRequired
      ? ` × posting add-on (+${POSTING_ADDON_LOW * 100}–${POSTING_ADDON_HIGH * 100}%, labeled estimate)`
      : " (no posting required)") +
    ` = ${fmt(rateLow)}–${fmt(rateHigh)} USD total, about ${fmt(perVideoLow)}–${fmt(perVideoHigh)} per video. ` +
    "Estimates only — actual UGC prices vary by niche, creator portfolio, usage length, exclusivity, and negotiation.";

  return {
    currency: CURRENCY,
    rateLow,
    rateHigh,
    perVideoLow,
    perVideoHigh,
    note,
  };
}

// ---------------------------------------------------------------------------
// runTool adapter — contract shape for the mountToolUI template
// ---------------------------------------------------------------------------

/**
 * Contract adapter: `runTool({ videoCount, usageRights, postingRequired })`
 * -> { ok, values?, error? }. Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input received — describe your UGC package first." };
  }

  const rawCount = values["videoCount"];
  const rawUsage = values["usageRights"];
  const rawPosting = values["postingRequired"];

  if (
    typeof rawCount !== "number" ||
    Number.isNaN(rawCount) ||
    !Number.isInteger(rawCount) ||
    rawCount <= 0
  ) {
    return { ok: false, error: "Enter the number of videos as a whole number greater than 0." };
  }
  if (rawUsage !== "organic" && rawUsage !== "paid_ads" && rawUsage !== "whitelisting") {
    return { ok: false, error: "Choose usage rights: organic, paid ads, or whitelisting." };
  }
  if (typeof rawPosting !== "boolean") {
    return { ok: false, error: "Say whether you must post the videos to your own channels." };
  }

  let result: UgcPricingResult;
  try {
    result = calculateUgcPrice({
      videoCount: rawCount,
      usageRights: rawUsage,
      postingRequired: rawPosting,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not calculate the price." };
  }

  return {
    ok: true,
    values: {
      rateLow: result.rateLow,
      rateHigh: result.rateHigh,
      perVideoLow: result.perVideoLow,
      perVideoHigh: result.perVideoHigh,
      currency: result.currency,
      note: result.note,
    },
  };
}
