/**
 * SEO Freelancer Pricing Calculator — pure logic (tool-076).
 *
 * HONESTY (non-negotiable):
 * - Every benchmark rate constant below is UNVERIFIED — no 2026 benchmark
 *   source was verified this round (spec: source "UNVERIFIED", needs_review).
 *   They exist only so the math has a shape; the UI must label results
 *   "unverified estimate / adjust to your market" and must never present
 *   invented ranges as researched.
 * - The constants are USER-SETTABLE: runTool accepts rateLowOverride /
 *   rateHighOverride, which replace the computed band entirely.
 * - Zero imports, zero network, zero DOM, no randomness. Pure arithmetic.
 * - Money rounds half-up to 2 decimals (USD).
 */

export type SeoServiceType = "audit" | "monthly_retainer" | "link_building";

export const SEO_SERVICE_TYPES: SeoServiceType[] = [
  "audit",
  "monthly_retainer",
  "link_building",
];

/**
 * UNVERIFIED placeholder bands. No 2026 benchmark source verified —
 * needs_review. The user can (and should) override them.
 */
export const UNVERIFIED_AUDIT_BASE: { low: number; high: number } = {
  low: 400,
  high: 1200,
};
/** UNVERIFIED per-site-page add-on for audits. */
export const UNVERIFIED_AUDIT_PER_PAGE: { low: number; high: number } = {
  low: 3,
  high: 9,
};
/** UNVERIFIED hourly band for monthly retainers. */
export const UNVERIFIED_RETAINER_HOURLY: { low: number; high: number } = {
  low: 50,
  high: 150,
};
/** UNVERIFIED hourly band for link building work. */
export const UNVERIFIED_LINK_BUILDING_HOURLY: { low: number; high: number } = {
  low: 40,
  high: 125,
};

export const CURRENCY = "USD";

/** Round half-up to 2 decimals. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

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

/**
 * Compute the suggested low/high range from the UNVERIFIED bands.
 * - audit: flat project fee = base + perPage * sitePages (project-based, not hourly).
 * - monthly_retainer / link_building: hoursPerMonth * unverified hourly band.
 */
export function computeRange(
  serviceType: SeoServiceType,
  sitePages: number,
  hoursPerMonth: number,
): { lowRate: number; highRate: number } {
  if (serviceType === "audit") {
    return {
      lowRate: roundMoney(UNVERIFIED_AUDIT_BASE.low + UNVERIFIED_AUDIT_PER_PAGE.low * sitePages),
      highRate: roundMoney(UNVERIFIED_AUDIT_BASE.high + UNVERIFIED_AUDIT_PER_PAGE.high * sitePages),
    };
  }
  const band =
    serviceType === "monthly_retainer"
      ? UNVERIFIED_RETAINER_HOURLY
      : UNVERIFIED_LINK_BUILDING_HOURLY;
  return {
    lowRate: roundMoney(band.low * hoursPerMonth),
    highRate: roundMoney(band.high * hoursPerMonth),
  };
}

export interface SeoPricingValues {
  lowRate: number;
  highRate: number;
  /** Explains which numbers drove the result (unverified defaults vs user override). */
  basis: string;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawType = values.serviceType;
  if (typeof rawType !== "string" || !(SEO_SERVICE_TYPES as string[]).includes(rawType)) {
    return fail("Choose a service type: audit, monthly retainer, or link building.");
  }
  const serviceType = rawType as SeoServiceType;

  const sitePages = toFiniteNumber(values.sitePages);
  if (sitePages === null || !Number.isInteger(sitePages) || sitePages <= 0) {
    return fail("Site pages must be a whole number greater than 0.");
  }

  const hoursPerMonth = toFiniteNumber(values.hoursPerMonth);
  if (hoursPerMonth === null || hoursPerMonth <= 0) {
    return fail("Hours per month must be a number greater than 0.");
  }

  // Optional user overrides replace the whole band (labels the result user-set).
  const hasLow = values.rateLowOverride !== undefined && values.rateLowOverride !== "" && values.rateLowOverride !== null;
  const hasHigh = values.rateHighOverride !== undefined && values.rateHighOverride !== "" && values.rateHighOverride !== null;
  if (hasLow !== hasHigh) {
    return fail("Provide both rate overrides (low and high), or neither.");
  }

  let lowRate: number;
  let highRate: number;
  let basis: string;

  if (hasLow && hasHigh) {
    const lowO = toFiniteNumber(values.rateLowOverride);
    const highO = toFiniteNumber(values.rateHighOverride);
    if (lowO === null || lowO <= 0 || highO === null || highO <= 0) {
      return fail("Rate overrides must be numbers greater than 0.");
    }
    if (highO < lowO) {
      return fail("The high override must be greater than or equal to the low override.");
    }
    lowRate = roundMoney(lowO);
    highRate = roundMoney(highO);
    basis =
      "Your custom rate band (user-set). No researched benchmark was used for this result.";
  } else {
    const range = computeRange(serviceType, sitePages, hoursPerMonth);
    lowRate = range.lowRate;
    highRate = range.highRate;
    basis =
      "UNVERIFIED estimate bands — no 2026 benchmark source was verified. " +
      "Adjust the rates to your market before quoting a client.";
  }

  const result: SeoPricingValues = { lowRate, highRate, basis };
  return { ok: true, values: result as unknown as Record<string, unknown> };
}
