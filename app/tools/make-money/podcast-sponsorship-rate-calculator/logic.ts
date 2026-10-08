/**
 * Podcast Sponsorship Rate Calculator — pure logic (tool-082).
 *
 * HONESTY: pure math. CPM benchmarks are 2026 estimates (host-read 30s
 * $18–$22 CPM, 60s $24–$26 CPM per the formula spec) — estimates, not
 * platform-published rates. Shows both sides of every rate: the low CPM
 * and the high CPM, so the range is explicit. Under 1,000 downloads per
 * episode the CPM math breaks down, so the tool switches to flat-fee
 * guidance ($300–$500/episode, labeled estimate).
 *
 * Zero imports, zero network, zero DOM. Fully deterministic:
 * same inputs -> identical outputs.
 */

export const CURRENCY = "USD";

export const AD_FORMATS = ["pre_roll_30", "mid_roll_60", "post_roll"] as const;
export type AdFormat = (typeof AD_FORMATS)[number];

/**
 * Host-read CPM benchmarks (USD), labeled estimates from the 2026
 * formula spec: 30s spots $18–$22 CPM, 60s spots $24–$26 CPM.
 * The mid-roll 60s slot is the premium placement; pre-roll 30s and
 * post-roll use the 30s benchmark band.
 */
export const CPM_BANDS: Record<AdFormat, { low: number; high: number; spotLabel: string }> = {
  pre_roll_30: { low: 18, high: 22, spotLabel: "pre-roll 30s" },
  mid_roll_60: { low: 24, high: 26, spotLabel: "mid-roll 60s" },
  post_roll: { low: 18, high: 22, spotLabel: "post-roll 30s" },
};

/**
 * Below this download count, CPM math breaks down; the tool returns
 * flat-fee guidance instead (labeled estimate).
 */
export const CPM_FLOOR_DOWNLOADS = 1000;

/** Flat-fee guidance per episode for small shows (labeled estimate, USD). */
export const FLAT_FEE_LOW = 300;
export const FLAT_FEE_HIGH = 500;

/** Largest count the calculator will attempt (sanity guard). */
export const MAX_COUNT = 1e12;

export interface PodcastRateInput {
  /** Downloads per episode. Must be a finite number > 0. */
  downloadsPerEpisode: number;
  /** Ad slot format. */
  adFormat: AdFormat;
  /** Episodes published per month. Must be a positive integer. */
  episodesPerMonth: number;
}

export interface PodcastRateResult {
  currency: string;
  /** Estimated rate per episode — low end, USD. */
  ratePerEpisodeLow: number;
  /** Estimated rate per episode — high end, USD. */
  ratePerEpisodeHigh: number;
  /** Estimated monthly value — low end, USD. */
  monthlyValueLow: number;
  /** Estimated monthly value — high end, USD. */
  monthlyValueHigh: number;
  /** True when the flat-fee fallback was used instead of CPM math. */
  flatFeeGuidance: boolean;
  /** Human summary incl. CPM band, estimate labels, honesty caveats. */
  note: string;
}

/** Round half-up to 2 decimals (USD cents). */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
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
 * Compute the podcast sponsorship rate range.
 *
 * Formula (from the spec):
 *   rate_per_episode = downloads_per_episode / 1000 × cpm
 *   monthly_value = rate_per_episode × episodes_per_month
 * If downloads_per_episode < 1000: flat-fee guidance $300–$500/episode
 *   replaces the CPM math entirely.
 *
 * @throws {TypeError} for non-numeric / non-finite inputs or a non-object input.
 * @throws {RangeError} for downloadsPerEpisode <= 0, or episodesPerMonth
 *   not a positive integer.
 */
export function calculatePodcastRate(input: PodcastRateInput): PodcastRateResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }

  assertPositiveFinite("downloadsPerEpisode", input.downloadsPerEpisode);

  if (!AD_FORMATS.includes(input.adFormat)) {
    throw new TypeError(
      `adFormat must be one of: ${AD_FORMATS.join(", ")}.`,
    );
  }

  const episodes = input.episodesPerMonth;
  assertPositiveFinite("episodesPerMonth", episodes);
  if (!Number.isInteger(episodes)) {
    throw new RangeError("episodesPerMonth must be a whole number.");
  }

  const band = CPM_BANDS[input.adFormat];

  let rateLow: number;
  let rateHigh: number;
  let flatFeeGuidance = false;

  if (input.downloadsPerEpisode < CPM_FLOOR_DOWNLOADS) {
    rateLow = FLAT_FEE_LOW;
    rateHigh = FLAT_FEE_HIGH;
    flatFeeGuidance = true;
  } else {
    const thousands = input.downloadsPerEpisode / 1000;
    rateLow = roundMoney(thousands * band.low);
    rateHigh = roundMoney(thousands * band.high);
  }

  const monthlyLow = roundMoney(rateLow * episodes);
  const monthlyHigh = roundMoney(rateHigh * episodes);

  const fmt = (n: number): string =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const note = flatFeeGuidance
    ? `Under 1,000 downloads per episode, CPM math breaks down: flat-fee guidance is $${FLAT_FEE_LOW}–$${FLAT_FEE_HIGH} USD per ${band.spotLabel} episode — a labeled estimate, not a market guarantee. ` +
      `Monthly value for ${episodes} episode(s): $${fmt(monthlyLow)}–$${fmt(monthlyHigh)} USD. ` +
      "Actual rates vary by niche, audience demographics, and negotiation."
    : `${band.spotLabel} host-read at $${band.low}–$${band.high} CPM (2026 estimate): ` +
      `$${fmt(rateLow)}–$${fmt(rateHigh)} USD per episode for ${input.downloadsPerEpisode.toLocaleString("en-US")} downloads. ` +
      `Monthly value for ${episodes} episode(s): $${fmt(monthlyLow)}–$${fmt(monthlyHigh)} USD. ` +
      "CPM benchmarks are estimates, not platform-published rates; actual rates vary by niche, audience demographics, and negotiation.";

  return {
    currency: CURRENCY,
    ratePerEpisodeLow: rateLow,
    ratePerEpisodeHigh: rateHigh,
    monthlyValueLow: monthlyLow,
    monthlyValueHigh: monthlyHigh,
    flatFeeGuidance,
    note,
  };
}

// ---------------------------------------------------------------------------
// runTool adapter — contract shape for the mountToolUI template
// ---------------------------------------------------------------------------

/**
 * Contract adapter: `runTool({ downloadsPerEpisode, adFormat, episodesPerMonth })`
 * -> { ok, values?, error? }. Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input received — enter your podcast stats first." };
  }

  const rawDownloads = values["downloadsPerEpisode"];
  const rawFormat = values["adFormat"];
  const rawEpisodes = values["episodesPerMonth"];

  if (typeof rawDownloads !== "number" || Number.isNaN(rawDownloads) || rawDownloads <= 0) {
    return { ok: false, error: "Enter downloads per episode greater than 0." };
  }
  if (rawFormat !== "pre_roll_30" && rawFormat !== "mid_roll_60" && rawFormat !== "post_roll") {
    return { ok: false, error: "Choose an ad format: pre-roll 30s, mid-roll 60s, or post-roll." };
  }
  if (
    typeof rawEpisodes !== "number" ||
    Number.isNaN(rawEpisodes) ||
    !Number.isInteger(rawEpisodes) ||
    rawEpisodes <= 0
  ) {
    return { ok: false, error: "Enter episodes per month as a whole number greater than 0." };
  }

  let result: PodcastRateResult;
  try {
    result = calculatePodcastRate({
      downloadsPerEpisode: rawDownloads,
      adFormat: rawFormat,
      episodesPerMonth: rawEpisodes,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not calculate the rate." };
  }

  return {
    ok: true,
    values: {
      ratePerEpisodeLow: result.ratePerEpisodeLow,
      ratePerEpisodeHigh: result.ratePerEpisodeHigh,
      monthlyValueLow: result.monthlyValueLow,
      monthlyValueHigh: result.monthlyValueHigh,
      currency: result.currency,
      flatFeeGuidance: result.flatFeeGuidance,
      note: result.note,
    },
  };
}
