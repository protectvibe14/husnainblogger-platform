/**
 * Sponsored Post Rate Calculator — pure logic (tool-079).
 *
 * HONESTY (non-negotiable):
 * - The follower-tier bands below are MARKET ESTIMATES (survey benchmarks
 *   compiled at classification level), NOT guaranteed rates and NOT verified
 *   platform data (spec: "needs_review before any 'verified' claim"). Actual
 *   sponsored-post prices vary widely by niche, engagement, audience quality,
 *   and region — the result always carries a `basis` string saying so.
 * - The engagement benchmarks (per platform) and format multipliers
 *   (post 1.0, reel 1.4, video 1.6) are labeled estimates too: reels/video sit
 *   inside the estimated 1.3–1.6 premium band over static; stories are 40–60%
 *   cheaper (not modeled as a format here — the formula spec lists story as a
 *   labeled estimate, so it is documented, not priced).
 * - Zero imports, zero network, zero DOM, no randomness. Pure arithmetic.
 * - Rounding: nearest $5 below $1,000; nearest $50 at $1,000 and above.
 */

export type SponsoredPlatform = "instagram" | "tiktok" | "youtube";
export type ContentFormat = "post" | "reel" | "video";

export const SPONSORED_PLATFORMS: SponsoredPlatform[] = ["instagram", "tiktok", "youtube"];
export const CONTENT_FORMATS: ContentFormat[] = ["post", "reel", "video"];

export interface FollowerTier {
  minFollowers: number;
  /** Exclusive upper bound; Infinity for the open top tier. */
  maxFollowers: number;
  low: number;
  high: number;
}

/**
 * ESTIMATE tier bands per platform (USD per sponsored unit).
 * Survey benchmarks compiled at classification level — labeled estimates,
 * not guaranteed rates, not verified platform data.
 */
export const ESTIMATE_TIER_BANDS: Record<SponsoredPlatform, FollowerTier[]> = {
  instagram: [
    { minFollowers: 1000, maxFollowers: 10000, low: 25, high: 250 },
    { minFollowers: 10000, maxFollowers: 50000, low: 250, high: 1000 },
    { minFollowers: 50000, maxFollowers: 500000, low: 1000, high: 5000 },
    { minFollowers: 500000, maxFollowers: 1000000, low: 5000, high: 15000 },
    { minFollowers: 1000000, maxFollowers: Infinity, low: 15000, high: 75000 },
  ],
  tiktok: [
    { minFollowers: 1000, maxFollowers: 10000, low: 10, high: 150 },
    { minFollowers: 10000, maxFollowers: 50000, low: 150, high: 600 },
    { minFollowers: 50000, maxFollowers: 500000, low: 600, high: 3000 },
    { minFollowers: 500000, maxFollowers: 1000000, low: 3000, high: 10000 },
    { minFollowers: 1000000, maxFollowers: Infinity, low: 10000, high: 50000 },
  ],
  youtube: [
    { minFollowers: 1000, maxFollowers: 10000, low: 200, high: 1000 },
    { minFollowers: 10000, maxFollowers: 50000, low: 500, high: 2500 },
    { minFollowers: 50000, maxFollowers: 500000, low: 2500, high: 10000 },
    { minFollowers: 500000, maxFollowers: 1000000, low: 10000, high: 25000 },
    { minFollowers: 1000000, maxFollowers: Infinity, low: 25000, high: 100000 },
  ],
};

/** ESTIMATE format multipliers. Reels/video carry a premium over static posts. */
export const ESTIMATE_FORMAT_MULTIPLIERS: Record<ContentFormat, number> = {
  post: 1.0,
  reel: 1.4,
  video: 1.6,
};

/**
 * ESTIMATE engagement benchmarks (percent) per platform. The adjustment is
 * 1 + (engagementRate - benchmark) * 0.25, clamped to [0.5, 2.0].
 */
export const ESTIMATE_ENGAGEMENT_BENCHMARKS: Record<SponsoredPlatform, number> = {
  instagram: 2.0,
  tiktok: 4.0,
  youtube: 3.0,
};

export const ENGAGEMENT_ADJUSTMENT_FACTOR = 0.25;
export const ENGAGEMENT_ADJUSTMENT_MIN = 0.5;
export const ENGAGEMENT_ADJUSTMENT_MAX = 2.0;

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
export function findTier(platform: SponsoredPlatform, followerCount: number): FollowerTier {
  const tiers = ESTIMATE_TIER_BANDS[platform];
  for (const tier of tiers) {
    if (followerCount < tier.maxFollowers) return tier;
  }
  return tiers[tiers.length - 1];
}

/** Band endpoints interpolated between this tier's floor and the next tier's floor. */
function tierFloors(tier: FollowerTier, platform: SponsoredPlatform): { nextLow: number; nextHigh: number } {
  const tiers = ESTIMATE_TIER_BANDS[platform];
  const idx = tiers.indexOf(tier);
  const next = tiers[Math.min(idx + 1, tiers.length - 1)];
  return { nextLow: next.low, nextHigh: next.high };
}

export function baseRange(platform: SponsoredPlatform, followerCount: number): { low: number; high: number } {
  const tier = findTier(platform, followerCount);
  if (!Number.isFinite(tier.maxFollowers)) return { low: tier.low, high: tier.high };
  const t = Math.min(Math.max((followerCount - tier.minFollowers) / (tier.maxFollowers - tier.minFollowers), 0), 1);
  const { nextLow, nextHigh } = tierFloors(tier, platform);
  return {
    low: tier.low + (nextLow - tier.low) * t,
    high: tier.high + (nextHigh - tier.high) * t,
  };
}

export function engagementAdjustment(platform: SponsoredPlatform, engagementRatePct: number): number {
  const benchmark = ESTIMATE_ENGAGEMENT_BENCHMARKS[platform];
  const adj = 1 + (engagementRatePct - benchmark) * ENGAGEMENT_ADJUSTMENT_FACTOR;
  return Math.min(Math.max(adj, ENGAGEMENT_ADJUSTMENT_MIN), ENGAGEMENT_ADJUSTMENT_MAX);
}

/** Round: nearest $5 below $1,000; nearest $50 at $1,000 and above. */
export function roundTier(value: number): number {
  if (value < 1000) return Math.round(value / 5) * 5;
  return Math.round(value / 50) * 50;
}

export interface SponsoredRateValues {
  lowRate: number;
  highRate: number;
  /** USD per follower (midpoint / followerCount), rounded to 4 decimals. */
  perFollowerRate: number;
  /** Explains the estimate basis. */
  basis: string;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawPlatform = values.platform;
  if (typeof rawPlatform !== "string" || !(SPONSORED_PLATFORMS as string[]).includes(rawPlatform)) {
    return fail("Choose a platform: instagram, tiktok, or youtube.");
  }
  const platform = rawPlatform as SponsoredPlatform;

  const followerCount = toFiniteNumber(values.followerCount);
  if (followerCount === null || followerCount <= 0) {
    return fail("Follower count must be a number greater than 0.");
  }

  const engagementRate = toFiniteNumber(values.engagementRate);
  if (engagementRate === null || engagementRate <= 0) {
    return fail("Engagement rate must be a percent number greater than 0 (e.g. 3.5 for 3.5%).");
  }

  const rawFormat = values.contentFormat;
  if (typeof rawFormat !== "string" || !(CONTENT_FORMATS as string[]).includes(rawFormat)) {
    return fail("Choose a content format: post, reel, or video.");
  }
  const contentFormat = rawFormat as ContentFormat;

  const base = baseRange(platform, followerCount);
  const mult = ESTIMATE_FORMAT_MULTIPLIERS[contentFormat];
  const adj = engagementAdjustment(platform, engagementRate);

  const lowRate = roundTier(base.low * mult * adj);
  const highRate = roundTier(base.high * mult * adj);
  const perFollowerRate = Math.round(((lowRate + highRate) / 2 / followerCount) * 10000) / 10000;

  const result: SponsoredRateValues = {
    lowRate,
    highRate,
    perFollowerRate,
    basis:
      "Market estimate range — bands are survey estimates, not guaranteed rates. " +
      "Actual prices vary by niche, engagement, audience quality, and region.",
  };
  return { ok: true, values: result as unknown as Record<string, unknown> };
}
