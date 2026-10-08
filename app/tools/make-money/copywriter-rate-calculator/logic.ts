/**
 * Copywriter Rate Calculator — pure logic (tool-070).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Plain arithmetic only.
 * - Engine is benchmark-lookup: experienceLevel + deliverable select over a
 *   FIXED benchmark table in this file. The table holds LOW/HIGH bands per
 *   level × deliverable.
 * - THE BENCHMARK TABLE IS CLASSIFICATION-LEVEL RESEARCH, labeled SURVEY
 *   ESTIMATES. It is NOT official market data, NOT verified platform data,
 *   and must never be presented as such. Rates vary widely by market, niche,
 *   portfolio, and negotiating power — these bands are starting-point
 *   estimates only (see note output and methodology in meta.ts).
 * - All figures are user-editable: optional customRateLow/customRateHigh
 *   override the table band for the selected level+deliverable.
 * - nichePremium multiplies the band: suggested = band * (1 + premium/100).
 * - perWordRate: for the per_word deliverable it is the low end of the
 *   suggested per-word band; for flat deliverables it is derived as
 *   suggestedLow / wordCount when wordCount is provided, otherwise null.
 * - Rounding: half-up to 2 decimals (USD).
 */

export const EXPERIENCE_LEVELS = [
  "beginner",
  "intermediate",
  "expert",
  "specialist",
] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const DELIVERABLES = ["per_word", "per_hour", "blog_post", "sales_page"] as const;
export type Deliverable = (typeof DELIVERABLES)[number];

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
  specialist: "Specialist",
};

export const DELIVERABLE_LABELS: Record<Deliverable, string> = {
  per_word: "Per word",
  per_hour: "Per hour",
  blog_post: "Per blog post",
  sales_page: "Per sales page",
};

/** Unit phrase appended to rate ranges in the note output. */
export const DELIVERABLE_UNITS: Record<Deliverable, string> = {
  per_word: "per word",
  per_hour: "per hour",
  blog_post: "per blog post (approx. 1,000 words)",
  sales_page: "per sales page",
};

/**
 * FIXED BENCHMARK TABLE — SURVEY ESTIMATES, NOT OFFICIAL RATES.
 * [low, high] in USD. Per-word bands run $0.10–$2.00+ by level; flat
 * deliverables are representative starting-point bands from
 * classification-level research. Never present as verified market data.
 */
export const BENCHMARK_TABLE: Record<Deliverable, Record<ExperienceLevel, [number, number]>> = {
  per_word: {
    beginner: [0.1, 0.15],
    intermediate: [0.15, 0.3],
    expert: [0.3, 0.75],
    specialist: [0.5, 2.0],
  },
  per_hour: {
    beginner: [25, 50],
    intermediate: [50, 100],
    expert: [100, 250],
    specialist: [150, 400],
  },
  blog_post: {
    beginner: [100, 250],
    intermediate: [250, 500],
    expert: [500, 1500],
    specialist: [1000, 3000],
  },
  sales_page: {
    beginner: [300, 800],
    intermediate: [800, 2000],
    expert: [2000, 7500],
    specialist: [5000, 15000],
  },
};

/** Largest value any single numeric input may take (sanity guard). */
export const MAX_INPUT_VALUE = 1e9;

/** Round to the nearest cent, half-up (positive values). */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

interface NumberResult {
  ok: boolean;
  value: number;
  error?: string;
}

function parseNumber(
  values: Record<string, unknown>,
  id: string,
  opts: { required: boolean; min: number; max: number; label: string },
): NumberResult {
  const raw = values[id];
  if (raw === undefined || raw === null || raw === "") {
    if (!opts.required) return { ok: true, value: NaN };
    return { ok: false, value: NaN, error: `Please enter ${opts.label}.` };
  }
  const n = typeof raw === "number" ? raw : Number(raw);
  if (typeof raw === "boolean" || Number.isNaN(n)) {
    return { ok: false, value: NaN, error: `${opts.label} must be a number.` };
  }
  if (!Number.isFinite(n)) {
    return { ok: false, value: NaN, error: `${opts.label} must be a finite number.` };
  }
  if (n < opts.min) {
    return { ok: false, value: NaN, error: `${opts.label} must be at least ${opts.min}.` };
  }
  if (n > opts.max) {
    return { ok: false, value: NaN, error: `${opts.label} must be at most ${opts.max}.` };
  }
  return { ok: true, value: n };
}

/**
 * runTool adapter for the Copywriter Rate Calculator.
 *
 * Inputs (values): experienceLevel (required enum), deliverable (required
 * enum), wordCount (required when deliverable is per_word; optional >0
 * otherwise — used for the per-word equivalent), nichePremium (optional
 * percent >=0, default 0 — e.g. a finance niche premium), customRateLow /
 * customRateHigh (optional pair, >0, high >= low — user-entered override of
 * the benchmark band).
 *
 * Outputs: rateRangeLow (USD), rateRangeHigh (USD), perWordRate (USD, or
 * null when it cannot be derived), note (text — estimate labeling).
 */
export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input values were provided." };
  }

  const levelRaw = values["experienceLevel"];
  if (typeof levelRaw !== "string" || !EXPERIENCE_LEVELS.includes(levelRaw as ExperienceLevel)) {
    return {
      ok: false,
      error: `Please select an experience level: ${EXPERIENCE_LABELS.beginner}, ${EXPERIENCE_LABELS.intermediate}, ${EXPERIENCE_LABELS.expert}, or ${EXPERIENCE_LABELS.specialist}.`,
    };
  }
  const level = levelRaw as ExperienceLevel;

  const deliverableRaw = values["deliverable"];
  if (typeof deliverableRaw !== "string" || !DELIVERABLES.includes(deliverableRaw as Deliverable)) {
    return {
      ok: false,
      error: "Please select a deliverable: per_word, per_hour, blog_post, or sales_page.",
    };
  }
  const deliverable = deliverableRaw as Deliverable;

  const wordCountRequired = deliverable === "per_word";
  const wordCount = parseNumber(values, "wordCount", {
    required: wordCountRequired,
    min: 1,
    max: MAX_INPUT_VALUE,
    label: "Word count",
  });
  if (!wordCount.ok) return { ok: false, error: wordCount.error };
  const words = Number.isNaN(wordCount.value) ? null : wordCount.value;

  const premium = parseNumber(values, "nichePremium", {
    required: false,
    min: 0,
    max: 1000,
    label: "Niche premium",
  });
  if (!premium.ok) return { ok: false, error: premium.error };
  const premiumPct = Number.isNaN(premium.value) ? 0 : premium.value;

  const customLow = parseNumber(values, "customRateLow", {
    required: false,
    min: 0.01,
    max: MAX_INPUT_VALUE,
    label: "Custom rate low",
  });
  if (!customLow.ok) return { ok: false, error: customLow.error };
  const customHigh = parseNumber(values, "customRateHigh", {
    required: false,
    min: 0.01,
    max: MAX_INPUT_VALUE,
    label: "Custom rate high",
  });
  if (!customHigh.ok) return { ok: false, error: customHigh.error };
  const hasCustomLow = !Number.isNaN(customLow.value);
  const hasCustomHigh = !Number.isNaN(customHigh.value);
  if (hasCustomLow !== hasCustomHigh) {
    return {
      ok: false,
      error: "Enter both a custom low and a custom high rate, or leave both blank to use the benchmark table.",
    };
  }
  if (hasCustomLow && customHigh.value < customLow.value) {
    return { ok: false, error: "Custom rate high must be at least the custom rate low." };
  }

  const usingCustom = hasCustomLow && hasCustomHigh;
  const [tableLow, tableHigh] = usingCustom
    ? [customLow.value, customHigh.value]
    : BENCHMARK_TABLE[deliverable][level];

  const multiplier = 1 + premiumPct / 100;
  const rateRangeLow = roundToCents(tableLow * multiplier);
  const rateRangeHigh = roundToCents(tableHigh * multiplier);

  let perWordRate: number | null = null;
  if (deliverable === "per_word") {
    perWordRate = rateRangeLow;
  } else if (words !== null) {
    perWordRate = roundToCents(rateRangeLow / words);
  }

  const bandSource = usingCustom
    ? "your custom rates"
    : `survey-estimate benchmarks for ${EXPERIENCE_LABELS[level]} ${DELIVERABLE_LABELS[deliverable].toLowerCase()}`;
  const note =
    `ESTIMATE — suggested range is based on ${bandSource} ` +
    `(${DELIVERABLE_UNITS[deliverable]}), adjusted by a ${premiumPct}% niche premium. ` +
    "Benchmarks are starting-point survey estimates, not official rates; actual market " +
    "rates vary by niche, portfolio, and negotiating power.";

  return {
    ok: true,
    values: { rateRangeLow, rateRangeHigh, perWordRate, note },
  };
}
