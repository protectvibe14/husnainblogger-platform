/**
 * Graphic Designer Rate Calculator — pure logic (tool-072).
 *
 * Pure TypeScript: zero imports, zero DOM, zero network, fully deterministic
 * (same inputs → same outputs, always).
 *
 * ENGINE: benchmark lookup over FIXED tables in code (no AI, no network).
 *
 * FIXED TABLE 1 — base hourly band by experience level (3 rows, USD/hour):
 *   entry  → $30–$50
 *   mid    → $60–$95
 *   senior → $110–$150
 *
 * FIXED TABLE 2 — deliverable complexity factor (4 rows, multiplier on the band):
 *   logo   → 1.00 (single mark)
 *   brand  → 1.25 (logo + identity system)
 *   social → 0.85 (recurring social creatives)
 *   print  → 1.10 (print layout / collateral)
 *
 * HONESTY: every figure above is a survey/market ESTIMATE of typical freelance
 * asking rates — NOT an official union/guild rate and NOT current verified
 * market data. The tool returns the adjusted band plus rate × hours as a
 * starting-point estimate the user can adjust.
 *
 * Formula:  rate_range = base_band(experience_level) × factor(deliverable)
 *           project_total = rate × project_hours   (per band end)
 * Rounding: half-up to 2 decimals (USD).
 */

/** Currency all amounts are expressed in. No FX conversion is performed. */
export const CURRENCY = "USD";

/** Experience levels accepted by the calculator. */
export const EXPERIENCE_LEVELS = ["entry", "mid", "senior"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

/** Deliverable types accepted by the calculator. */
export const DELIVERABLES = ["logo", "brand", "social", "print"] as const;
export type Deliverable = (typeof DELIVERABLES)[number];

/** Human-readable labels for the deliverable options. */
export const DELIVERABLE_LABELS: Record<Deliverable, string> = {
  logo: "Logo design",
  brand: "Brand identity system",
  social: "Social media creatives",
  print: "Print / collateral design",
};

/**
 * FIXED benchmark table 1: 3 rows mapping experience level → base hourly
 * USD band. All figures are survey/market ESTIMATES — never official rates.
 */
export const BASE_HOURLY_BANDS: Record<ExperienceLevel, { low: number; high: number }> = {
  entry: { low: 30, high: 50 },
  mid: { low: 60, high: 95 },
  senior: { low: 110, high: 150 },
};

/**
 * FIXED benchmark table 2: 4 rows mapping deliverable → complexity factor
 * applied to the base band. Factors are survey-based ESTIMATES.
 */
export const DELIVERABLE_FACTORS: Record<Deliverable, number> = {
  logo: 1.0,
  brand: 1.25,
  social: 0.85,
  print: 1.1,
};

/** Sanity cap on project hours (guards against absurd inputs). */
export const MAX_PROJECT_HOURS = 100000;

export interface GraphicDesignerRateResult {
  ok: boolean;
  values?: {
    hourlyRateLow: number;
    hourlyRateHigh: number;
    projectTotalLow: number;
    projectTotalHigh: number;
    deliverableNote: string;
  };
  error?: string;
}

/** Round to 2 decimals, half-up (Math.round is half-up for positive values). */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Format USD, trimming unnecessary decimals (e.g. 60 → "$60"). */
function fmtUsd(value: number): string {
  const rounded = round2(value);
  return rounded % 1 === 0 ? `$${rounded}` : `$${rounded.toFixed(2)}`;
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

/** Normalize an enum-ish string: trim + lowercase, empty string when absent. */
function norm(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function runTool(values: Record<string, unknown>): GraphicDesignerRateResult {
  const raw = values && typeof values === "object" ? values : {};

  const level = norm(raw["experienceLevel"]);
  if (!level || !(EXPERIENCE_LEVELS as readonly string[]).includes(level)) {
    return {
      ok: false,
      error:
        "Pick an experience level (Entry, Mid, or Senior) to get a rate range.",
    };
  }

  const deliverable = norm(raw["deliverable"]);
  if (!deliverable || !(DELIVERABLES as readonly string[]).includes(deliverable)) {
    return {
      ok: false,
      error:
        "Pick a deliverable type (logo, brand, social, or print) to get a rate range.",
    };
  }

  const hours = toNumber(raw["projectHours"]);
  if (Number.isNaN(hours) || !Number.isFinite(hours)) {
    return {
      ok: false,
      error: "Enter your estimated project hours as a number.",
    };
  }
  if (hours <= 0) {
    return {
      ok: false,
      error: "Project hours must be greater than 0.",
    };
  }
  if (hours > MAX_PROJECT_HOURS) {
    return {
      ok: false,
      error: `Project hours look too high — keep it under ${MAX_PROJECT_HOURS}.`,
    };
  }

  const exp = level as ExperienceLevel;
  const del = deliverable as Deliverable;
  const base = BASE_HOURLY_BANDS[exp];
  const factor = DELIVERABLE_FACTORS[del];

  const hourlyRateLow = round2(base.low * factor);
  const hourlyRateHigh = round2(base.high * factor);
  const projectTotalLow = round2(hourlyRateLow * hours);
  const projectTotalHigh = round2(hourlyRateHigh * hours);

  const factorText =
    factor === 1
      ? "no complexity adjustment"
      : `a ×${factor} complexity factor`;
  const deliverableNote =
    `${DELIVERABLE_LABELS[del]} applies ${factorText} to the ${exp}-level band ` +
    `(${fmtUsd(base.low)}–${fmtUsd(base.high)}/hr estimate) — a survey-based adjustment, not a market quote.`;

  return {
    ok: true,
    values: {
      hourlyRateLow,
      hourlyRateHigh,
      projectTotalLow,
      projectTotalHigh,
      deliverableNote,
    },
  };
}
