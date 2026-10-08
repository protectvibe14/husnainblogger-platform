/**
 * Social Media Manager Pricing Calculator — pure logic (tool-074).
 *
 * Pure TypeScript: zero imports, zero DOM, zero network, fully deterministic
 * (same inputs → same outputs, always).
 *
 * ENGINE: benchmark lookup over FIXED tables in code (no AI, no network).
 *
 * FIXED TABLE 1 — base monthly retainer band by package tier (3 rows, USD/month):
 *   basic    → $500–$1,200
 *   standard → $1,200–$2,500
 *   premium  → $2,500–$4,000
 *
 * FIXED TABLE 2 — service add-on factors (3 rows, multiplicative, estimates):
 *   community management → ×1.20
 *   paid ads management  → ×1.25
 *   monthly reporting    → ×1.10
 *
 * WORKLOAD RULE (fixed, transparent — not a market fact):
 *   workload_factor = 1 + 0.25 × (accounts − 1) + 0.05 × max(0, posts_per_week − 8)
 *   i.e. +25% per extra account, +5% per weekly post above a baseline of 8.
 *
 * HONESTY: every figure above is a survey/market ESTIMATE of typical freelance
 * retainers — NOT an official rate and NOT current verified market data. The
 * $500–$4,000 benchmark is a deliberately wide survey band; the tool says so.
 * Results are starting-point estimates the user can adjust.
 *
 * Formula:  retainer = base_band(package_tier) × workload_factor × service_factors
 * Rounding: nearest $50 (wide band — avoids false precision).
 */

/** Currency all amounts are expressed in. No FX conversion is performed. */
export const CURRENCY = "USD";

/** Package tiers accepted by the calculator. */
export const PACKAGE_TIERS = ["basic", "standard", "premium"] as const;
export type PackageTier = (typeof PACKAGE_TIERS)[number];

/** Human-readable labels for the package tiers. */
export const TIER_LABELS: Record<PackageTier, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
};

/**
 * FIXED benchmark table 1: 3 rows mapping package tier → base monthly
 * retainer band (USD/month). All figures are survey/market ESTIMATES.
 */
export const TIER_BASE_BANDS: Record<PackageTier, { low: number; high: number }> = {
  basic: { low: 500, high: 1200 },
  standard: { low: 1200, high: 2500 },
  premium: { low: 2500, high: 4000 },
};

/**
 * FIXED benchmark table 2: 3 rows mapping optional services → retainer
 * multiplier. Factors are survey-based ESTIMATES.
 */
export const SERVICE_FACTORS = {
  serviceCommunity: 1.2,
  serviceAds: 1.25,
  serviceReporting: 1.1,
} as const;
export type ServiceKey = keyof typeof SERVICE_FACTORS;

/** Human-readable labels for the service add-ons. */
export const SERVICE_LABELS: Record<ServiceKey, string> = {
  serviceCommunity: "community management +20%",
  serviceAds: "paid ads management +25%",
  serviceReporting: "monthly reporting +10%",
};

/** Baseline weekly posts included before the workload factor grows. */
export const BASELINE_POSTS_PER_WEEK = 8;
/** Extra-account workload weight (+25% per account beyond the first). */
export const ACCOUNT_WEIGHT = 0.25;
/** Extra-post workload weight (+5% per weekly post above baseline). */
export const POST_WEIGHT = 0.05;

/** Sanity caps guard against absurd inputs (not business rules). */
export const MAX_ACCOUNTS = 10000;
export const MAX_POSTS_PER_WEEK = 10000;

export interface SocialMediaManagerPricingResult {
  ok: boolean;
  values?: {
    monthlyRetainerLow: number;
    monthlyRetainerHigh: number;
    pricingBreakdown: string;
  };
  error?: string;
}

/** Round to the nearest $50 (wide band — avoids false precision). */
function round50(value: number): number {
  return Math.round(value / 50) * 50;
}

/** Format a factor with up to 2 decimals (e.g. 1.74, 1.2). */
function fmtFactor(value: number): string {
  const r = Math.round(value * 100) / 100;
  return String(r);
}

/**
 * Coerce a value to a number: accepts numbers and numeric strings,
 * returns NaN for anything else (handled as a validation error).
 */
function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (!Number.isNaN(n)) return n;
  }
  return Number.NaN;
}

/**
 * Coerce a value to a boolean: accepts booleans, "true"/"false" style
 * strings and 1/0; anything else (including missing) is false.
 */
function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "on";
  }
  if (typeof value === "number") return value !== 0;
  return false;
}

/** Normalize an enum-ish string: trim + lowercase, empty string when absent. */
function norm(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function runTool(
  values: Record<string, unknown>,
): SocialMediaManagerPricingResult {
  const raw = values && typeof values === "object" ? values : {};

  const tier = norm(raw["packageTier"]);
  if (!tier || !(PACKAGE_TIERS as readonly string[]).includes(tier)) {
    return {
      ok: false,
      error:
        "Pick a package tier (Basic, Standard, or Premium) to get a retainer range.",
    };
  }

  const accounts = toNumber(raw["accountsManaged"]);
  if (Number.isNaN(accounts) || !Number.isFinite(accounts)) {
    return { ok: false, error: "Enter the number of accounts as a whole number." };
  }
  if (!Number.isInteger(accounts) || accounts <= 0) {
    return {
      ok: false,
      error: "Accounts managed must be a whole number greater than 0.",
    };
  }
  if (accounts > MAX_ACCOUNTS) {
    return { ok: false, error: `Accounts managed looks too high — keep it under ${MAX_ACCOUNTS}.` };
  }

  const posts = toNumber(raw["postsPerWeek"]);
  if (Number.isNaN(posts) || !Number.isFinite(posts)) {
    return { ok: false, error: "Enter posts per week as a whole number." };
  }
  if (!Number.isInteger(posts) || posts <= 0) {
    return {
      ok: false,
      error: "Posts per week must be a whole number greater than 0.",
    };
  }
  if (posts > MAX_POSTS_PER_WEEK) {
    return { ok: false, error: `Posts per week looks too high — keep it under ${MAX_POSTS_PER_WEEK}.` };
  }

  const t = tier as PackageTier;
  const base = TIER_BASE_BANDS[t];

  const workloadFactor =
    1 +
    ACCOUNT_WEIGHT * (accounts - 1) +
    POST_WEIGHT * Math.max(0, posts - BASELINE_POSTS_PER_WEEK);

  const chosenServices = (Object.keys(SERVICE_FACTORS) as ServiceKey[]).filter(
    (key) => toBoolean(raw[key]),
  );
  const serviceFactor = chosenServices.reduce(
    (acc, key) => acc * SERVICE_FACTORS[key],
    1,
  );

  const totalFactor = workloadFactor * serviceFactor;
  const monthlyRetainerLow = round50(base.low * totalFactor);
  const monthlyRetainerHigh = round50(base.high * totalFactor);

  const parts: string[] = [];
  parts.push(
    `Base: ${TIER_LABELS[t]} package ($${base.low.toLocaleString("en-US")}–$${base.high.toLocaleString("en-US")}/mo survey estimate).`,
  );
  parts.push(
    `Workload ×${fmtFactor(workloadFactor)} (${accounts} ${accounts === 1 ? "account" : "accounts"}, ${posts} posts/week).`,
  );
  if (chosenServices.length > 0) {
    parts.push(
      `Services: ${chosenServices.map((k) => SERVICE_LABELS[k]).join(", ")} (estimate add-ons).`,
    );
  } else {
    parts.push("No extra services selected.");
  }
  parts.push("Wide survey band — adjust for niche and client size.");

  return {
    ok: true,
    values: {
      monthlyRetainerLow,
      monthlyRetainerHigh,
      pricingBreakdown: parts.join(" "),
    },
  };
}
