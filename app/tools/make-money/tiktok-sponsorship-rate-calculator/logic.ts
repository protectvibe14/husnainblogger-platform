/**
 * TikTok Sponsorship Rate Calculator — pure logic (tool-080).
 *
 * HONESTY (non-negotiable):
 * - The creator-tier bands below are 2026 COMPILED ESTIMATES (survey
 *   estimates, nano $5–$25/video scaling to mega $5k–$25k+), NOT guaranteed
 *   rates and NOT verified platform data (spec: "needs_review before any
 *   'verified' claim"). Actual brand-deal prices vary widely by niche,
 *   engagement, audience quality, and region — every result carries a `basis`
 *   string saying so.
 * - The view-based floor uses an ESTIMATE CPM band ($2–$6 per 1,000 views).
 * - Zero imports, zero network, zero DOM, no randomness. Pure arithmetic.
 * - Rounding: nearest $5 below $500; nearest $100 at $500 and above.
 */

export interface FollowerTier {
  minFollowers: number;
  /** Exclusive upper bound; Infinity for the open top tier. */
  maxFollowers: number;
  low: number;
  high: number;
}

/**
 * ESTIMATE tier bands (USD per sponsored video).
 * 2026 compiled survey estimates — labeled estimates, not guaranteed rates,
 * not verified platform data.
 */
export const ESTIMATE_TIER_BANDS: FollowerTier[] = [
  { minFollowers: 1000, maxFollowers: 10000, low: 5, high: 25 },
  { minFollowers: 10000, maxFollowers: 100000, low: 25, high: 125 },
  { minFollowers: 100000, maxFollowers: 500000, low: 125, high: 1000 },
  { minFollowers: 500000, maxFollowers: 1000000, low: 1000, high: 5000 },
  { minFollowers: 1000000, maxFollowers: Infinity, low: 5000, high: 25000 },
];

/** ESTIMATE CPM band (USD per 1,000 average views) for the view-based floor. */
export const ESTIMATE_CPM_LOW = 2;
export const ESTIMATE_CPM_HIGH = 6;

function fail(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/** Find the tier for a follower count; below the first tier clamps to tier 0. */
export function findTier(followerCount: number): FollowerTier {
  for (const tier of ESTIMATE_TIER_BANDS) {
    if (followerCount < tier.maxFollowers) return tier;
  }
  return ESTIMATE_TIER_BANDS[ESTIMATE_TIER_BANDS.length - 1];
}

/**
 * Interpolate the band inside a capped tier (between this tier's floor and
 * the next tier's floor); the open top tier uses its floor values.
 */
export function bandRange(followerCount: number): { low: number; high: number } {
  const tier = findTier(followerCount);
  if (!Number.isFinite(tier.maxFollowers)) return { low: tier.low, high: tier.high };
  const idx = ESTIMATE_TIER_BANDS.indexOf(tier);
  const next = ESTIMATE_TIER_BANDS[Math.min(idx + 1, ESTIMATE_TIER_BANDS.length - 1)];
  const t = Math.min(Math.max((followerCount - tier.minFollowers) / (tier.maxFollowers - tier.minFollowers), 0), 1);
  return {
    low: tier.low + (next.low - tier.low) * t,
    high: tier.high + (next.high - tier.high) * t,
  };
}

/** View-based floor from average views and the estimate CPM band. */
export function viewBasedRange(avgViews: number): { low: number; high: number } {
  return {
    low: (avgViews / 1000) * ESTIMATE_CPM_LOW,
    high: (avgViews / 1000) * ESTIMATE_CPM_HIGH,
  };
}

/** Round: nearest $5 below $500; nearest $100 at $500 and above. */
export function roundTier(value: number): number {
  if (value < 500) return Math.round(value / 5) * 5;
  return Math.round(value / 100) * 100;
}

export interface TiktokRateValues {
  lowRate: number;
  highRate: number;
  /** Explains the estimate basis. */
  basis: string;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const followerCount = toFiniteNumber(values.followerCount);
  if (followerCount === null || followerCount <= 0) {
    return fail("Follower count must be a number greater than 0.");
  }

  const avgViews = toFiniteNumber(values.avgViews);
  if (avgViews === null || avgViews <= 0) {
    return fail("Average views per video must be a number greater than 0.");
  }

  const band = bandRange(followerCount);
  const viewBased = viewBasedRange(avgViews);

  // The suggested range never drops below the view-based floor.
  const lowRate = roundTier(Math.max(band.low, viewBased.low));
  const highRate = roundTier(Math.max(band.high, viewBased.high));

  const result: TiktokRateValues = {
    lowRate,
    highRate,
    basis:
      "Market estimate range — 2026 compiled estimate bands plus an estimate view-based floor. " +
      "Actual TikTok brand-deal prices vary by niche, engagement, audience quality, and region.",
  };
  return { ok: true, values: result as unknown as Record<string, unknown> };
}
