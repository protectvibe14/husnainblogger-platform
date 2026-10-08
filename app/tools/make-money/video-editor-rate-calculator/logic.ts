/**
 * Video Editor Rate Calculator — pure logic (tool-071).
 *
 * Pure TypeScript: zero imports, zero DOM, zero network, fully deterministic
 * (same inputs → same outputs, always).
 *
 * ENGINE: benchmark lookup over a FIXED table in code (no AI, no network).
 *
 * FIXED BENCHMARK TABLE — 3 rows (experience level → hourly USD band):
 *   entry  → $15–$40 /hour
 *   mid    → $50–$100 /hour
 *   senior → $100–$250 /hour
 *
 * HONESTY: every band above is a survey/market ESTIMATE of typical freelance
 * asking rates — NOT an official union/guild rate and NOT current verified
 * market data. The tool returns the band plus rate × hours as a starting-point
 * estimate the user can adjust. `videoMinutes` is context only: it expresses
 * the project total as a per-finished-minute planning figure.
 *
 * Formula:  rate_range   = band(experience_level)
 *           project_total = rate × project_hours   (per band end)
 *           per_finished_minute = project_total / video_minutes
 * Rounding: half-up to 2 decimals (USD).
 */

/** Currency all amounts are expressed in. No FX conversion is performed. */
export const CURRENCY = "USD";

/** Experience levels accepted by the calculator. */
export const EXPERIENCE_LEVELS = ["entry", "mid", "senior"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

/** One hourly band from the fixed benchmark table (USD/hour, estimate). */
export interface RateBand {
  low: number;
  high: number;
}

/**
 * FIXED benchmark table: 3 rows mapping experience level → hourly USD band.
 * All figures are survey/market ESTIMATES — never official rates.
 */
export const HOURLY_RATE_BANDS: Record<ExperienceLevel, RateBand> = {
  entry: { low: 15, high: 40 },
  mid: { low: 50, high: 100 },
  senior: { low: 100, high: 250 },
};

/** Sanity caps guard against absurd inputs (not business rules). */
export const MAX_PROJECT_HOURS = 100000;
export const MAX_VIDEO_MINUTES = 100000;

export interface VideoEditorRateResult {
  ok: boolean;
  values?: {
    hourlyRateLow: number;
    hourlyRateHigh: number;
    projectTotalLow: number;
    projectTotalHigh: number;
    perFinishedMinuteNote: string;
  };
  error?: string;
}

/** Round to 2 decimals, half-up (Math.round is half-up for positive values). */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Format USD, trimming unnecessary decimals (e.g. 150 → "$150"). */
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

export function runTool(values: Record<string, unknown>): VideoEditorRateResult {
  const raw = values && typeof values === "object" ? values : {};

  const levelRaw = raw["experienceLevel"];
  const level =
    typeof levelRaw === "string" ? levelRaw.trim().toLowerCase() : "";

  if (
    !level ||
    !(EXPERIENCE_LEVELS as readonly string[]).includes(level)
  ) {
    return {
      ok: false,
      error:
        "Pick an experience level (Entry, Mid, or Senior) to get a rate range.",
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

  const minutes = toNumber(raw["videoMinutes"]);
  if (Number.isNaN(minutes) || !Number.isFinite(minutes)) {
    return {
      ok: false,
      error: "Enter the finished video length in minutes as a number.",
    };
  }
  if (minutes <= 0) {
    return {
      ok: false,
      error: "Video length must be greater than 0 minutes.",
    };
  }
  if (minutes > MAX_VIDEO_MINUTES) {
    return {
      ok: false,
      error: `Video length looks too high — keep it under ${MAX_VIDEO_MINUTES} minutes.`,
    };
  }

  const band = HOURLY_RATE_BANDS[level as ExperienceLevel];

  const hourlyRateLow = round2(band.low);
  const hourlyRateHigh = round2(band.high);
  const projectTotalLow = round2(band.low * hours);
  const projectTotalHigh = round2(band.high * hours);

  const perMinLow = fmtUsd(projectTotalLow / minutes);
  const perMinHigh = fmtUsd(projectTotalHigh / minutes);
  const perFinishedMinuteNote =
    `That is about ${perMinLow}–${perMinHigh} per finished minute for a ` +
    `${minutes}-minute video — a planning figure and an estimate, not a market quote.`;

  return {
    ok: true,
    values: {
      hourlyRateLow,
      hourlyRateHigh,
      projectTotalLow,
      projectTotalHigh,
      perFinishedMinuteNote,
    },
  };
}
