/**
 * Voiceover Rate Calculator — pure logic (tool-075).
 *
 * Pure TypeScript: zero imports, zero DOM, zero network, fully deterministic
 * (same inputs → same outputs, always).
 *
 * ENGINE: benchmark lookup over FIXED tables in code (no AI, no network).
 *
 * FIXED TABLE — narration tiers by finished minutes (6 rows, USD/project):
 *   up to 2 min   → $350–$500
 *   up to 5 min   → $500–$750
 *   up to 10 min  → $700–$1,000
 *   up to 20 min  → $950–$1,400
 *   up to 40 min  → $1,250–$1,750
 *   over 40 min   → $1,500–$2,200
 *
 * FIXED TABLE — other project types (USD):
 *   elearning  → $300–$600 per finished hour  (fee = minutes/60 × band)
 *   audiobook  → $200–$400 per finished hour  (PFH; fee = minutes/60 × band)
 *   commercial → $350–$1,000 flat per project (non-broadcast estimate)
 *   ivr        → $100–$300 per finished minute (fee = minutes × band)
 *
 * HONESTY: every figure above is a GVAA-derived survey/market ESTIMATE of
 * typical freelance asking rates — NOT an official union/guild rate and NOT
 * current verified market data. Broadcast, buyout, and usage tiers are NOT
 * modeled (the note says so). wordCount is optional and is used only to
 * report the script's words-per-minute pace for context.
 *
 * Rounding: nearest $25 (avoids false precision).
 */

/** Currency all amounts are expressed in. No FX conversion is performed. */
export const CURRENCY = "USD";

/** Project types accepted by the calculator. */
export const PROJECT_TYPES = [
  "narration",
  "elearning",
  "commercial",
  "audiobook",
  "ivr",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

/** Human-readable labels for the project types. */
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  narration: "Narration (explainers, corporate, YouTube)",
  elearning: "E-learning modules",
  commercial: "Commercial / ad spot (non-broadcast)",
  audiobook: "Audiobook (per finished hour)",
  ivr: "IVR / phone system / voicemail",
};

/** One narration tier: minutes cap → flat USD/project band. */
export interface NarrationTier {
  /** Inclusive upper bound in finished minutes. */
  maxMinutes: number;
  low: number;
  high: number;
}

/**
 * FIXED narration benchmark table: 6 rows of finished-minute tiers.
 * Figures are GVAA-derived survey ESTIMATES — never official rates.
 */
export const NARRATION_TIERS: NarrationTier[] = [
  { maxMinutes: 2, low: 350, high: 500 },
  { maxMinutes: 5, low: 500, high: 750 },
  { maxMinutes: 10, low: 700, high: 1000 },
  { maxMinutes: 20, low: 950, high: 1400 },
  { maxMinutes: 40, low: 1250, high: 1750 },
  { maxMinutes: Number.POSITIVE_INFINITY, low: 1500, high: 2200 },
];

/** Per-finished-hour band for e-learning (survey estimate). */
export const ELEARNING_PER_HOUR = { low: 300, high: 600 };
/** Per-finished-hour band for audiobooks (PFH; survey estimate). */
export const AUDIOBOOK_PER_HOUR = { low: 200, high: 400 };
/** Flat per-project band for non-broadcast commercials (survey estimate). */
export const COMMERCIAL_FLAT = { low: 350, high: 1000 };
/** Per-finished-minute band for IVR (survey estimate). */
export const IVR_PER_MINUTE = { low: 100, high: 300 };

/** Words-per-minute used only for the optional pace note (not a rate input). */
export const TYPICAL_WPM = 150;

/** Sanity caps guard against absurd inputs (not business rules). */
export const MAX_MINUTES = 100000;
export const MAX_WORDS = 100000000;

export interface VoiceoverRateResult {
  ok: boolean;
  values?: {
    projectFeeLow: number;
    projectFeeHigh: number;
    pricingNote: string;
  };
  error?: string;
}

/** Round to the nearest $25 (avoids false precision). */
function round25(value: number): number {
  return Math.round(value / 25) * 25;
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

export function runTool(values: Record<string, unknown>): VoiceoverRateResult {
  const raw = values && typeof values === "object" ? values : {};

  const type = norm(raw["projectType"]);
  if (!type || !(PROJECT_TYPES as readonly string[]).includes(type)) {
    return {
      ok: false,
      error:
        "Pick a project type (narration, e-learning, commercial, audiobook, or IVR) to get a fee range.",
    };
  }

  const minutes = toNumber(raw["finishedMinutes"]);
  if (Number.isNaN(minutes) || !Number.isFinite(minutes)) {
    return {
      ok: false,
      error: "Enter the finished audio length in minutes as a number.",
    };
  }
  if (minutes <= 0) {
    return { ok: false, error: "Finished minutes must be greater than 0." };
  }
  if (minutes > MAX_MINUTES) {
    return { ok: false, error: `Finished minutes looks too high — keep it under ${MAX_MINUTES}.` };
  }

  // wordCount is optional; when provided it must be a positive number.
  const wordsRaw = raw["wordCount"];
  const wordsProvided =
    wordsRaw !== undefined && wordsRaw !== null && String(wordsRaw).trim() !== "";
  let words: number | null = null;
  if (wordsProvided) {
    words = toNumber(wordsRaw);
    if (Number.isNaN(words) || !Number.isFinite(words)) {
      return { ok: false, error: "Enter the script word count as a number." };
    }
    if (words <= 0) {
      return { ok: false, error: "Word count must be greater than 0." };
    }
    if (words > MAX_WORDS) {
      return { ok: false, error: `Word count looks too high — keep it under ${MAX_WORDS}.` };
    }
  }

  const pt = type as ProjectType;
  let low: number;
  let high: number;
  let basis: string;

  if (pt === "narration") {
    const tier = NARRATION_TIERS.find((t) => minutes <= t.maxMinutes)!;
    low = tier.low;
    high = tier.high;
    basis = `tiered flat fee for ~${minutes} finished ${minutes === 1 ? "minute" : "minutes"}`;
  } else if (pt === "elearning") {
    const hours = minutes / 60;
    low = hours * ELEARNING_PER_HOUR.low;
    high = hours * ELEARNING_PER_HOUR.high;
    basis = `$${ELEARNING_PER_HOUR.low}–$${ELEARNING_PER_HOUR.high} per finished hour (survey estimate)`;
  } else if (pt === "audiobook") {
    const hours = minutes / 60;
    low = hours * AUDIOBOOK_PER_HOUR.low;
    high = hours * AUDIOBOOK_PER_HOUR.high;
    basis = `$${AUDIOBOOK_PER_HOUR.low}–$${AUDIOBOOK_PER_HOUR.high} per finished hour (PFH, survey estimate)`;
  } else if (pt === "commercial") {
    low = COMMERCIAL_FLAT.low;
    high = COMMERCIAL_FLAT.high;
    basis =
      "flat per-project band (non-broadcast estimate; broadcast and buyout/usage tiers not modeled)";
  } else {
    low = minutes * IVR_PER_MINUTE.low;
    high = minutes * IVR_PER_MINUTE.high;
    basis = `$${IVR_PER_MINUTE.low}–$${IVR_PER_MINUTE.high} per finished minute (survey estimate)`;
  }

  const projectFeeLow = round25(low);
  const projectFeeHigh = round25(high);

  const parts: string[] = [];
  parts.push(
    `${PROJECT_TYPE_LABELS[pt]}: $${projectFeeLow.toLocaleString("en-US")}–$${projectFeeHigh.toLocaleString("en-US")} — ${basis}.`,
  );
  parts.push(
    "GVAA-derived survey estimate, not an official union/guild rate.",
  );
  if (words !== null) {
    const wpm = Math.round(words / minutes);
    parts.push(
      `Your ${words.toLocaleString("en-US")}-word script for ~${minutes} ${minutes === 1 ? "minute" : "minutes"} is about ${wpm} words/minute — a typical narration pace.`,
    );
  }

  return {
    ok: true,
    values: {
      projectFeeLow,
      projectFeeHigh,
      pricingNote: parts.join(" "),
    },
  };
}
