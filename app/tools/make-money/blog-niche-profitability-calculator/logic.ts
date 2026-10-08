/**
 * Blog Niche Profitability Calculator — pure logic (tool-100).
 *
 * Zero imports, zero network, zero DOM. Deterministic: same inputs → same
 * outputs. Composite HEURISTIC score — this is NOT a profit prediction and
 * NOT a researched metric.
 *
 * ## PUBLISHED SCORING RUBRIC (MA2-defined; mirrored in meta.ts methodology)
 * The score combines 4 factors with equal weights (0.25 each):
 *
 *   score = round( 100 * (wT*T + wC*(1-C) + wM*M + wR*R) / (wT+wC+wM+wR) )
 *         = round( 25 * (T + (1-C) + M + R) ), clamped to 0–100
 *
 *   T (traffic, 0–1)   = clamp(log10(monthly_search_volume) / 7, 0, 1)
 *                        Volume of 10,000,000+/mo → 1.0; volume of 1 → 0.
 *   C (competition)    = low → 0, medium → 0.5, high → 1.
 *                        Scored as (1 - C): low competition helps.
 *   M (monetization)   = selected_methods / 4
 *                        (display ads, affiliate, digital products, sponsored)
 *   R (RPM, 0–1)       = clamp(avg_rpm / 50, 0, 1)
 *                        $50+ RPM → 1.0. RPM is USER-entered and editable.
 *
 * Traffic-value estimate (labeled heuristic):
 *   estimated_monthly_potential =
 *     monthly_search_volume * CAPTURE_RATE * avg_rpm / 1000
 *   CAPTURE_RATE = 0.05 (5% of niche search volume captured as sessions —
 *   a rough, user-invisible-in-UI heuristic constant, disclosed here and in
 *   the methodology). Not a forecast of actual earnings.
 *
 * ## HONESTY CONTRACT (also surfaced in meta.ts assumptions + UI disclaimer)
 * 1. The score is a HEURISTIC for comparing niches, not a profit prediction
 *    and not a measurement of real profitability. It is labeled as such in
 *    the UI ("heuristic score — rough guide").
 * 2. Search volume, competition level, and RPM are USER JUDGMENTS / inputs.
 *    Garbage in → garbage out.
 * 3. The method breakdown splits the traffic-value estimate evenly across the
 *    selected methods — an illustrative split, not real per-channel data.
 */

export const COMPETITION_LEVELS = ["low", "medium", "high"] as const;
export type CompetitionLevel = (typeof COMPETITION_LEVELS)[number];

export const COMPETITION_VALUE: Record<CompetitionLevel, number> = {
  low: 0,
  medium: 0.5,
  high: 1,
};

/** Blog niches offered in the select control (label = value). */
export const NICHE_OPTIONS: string[] = [
  "Personal Finance",
  "Health & Fitness",
  "Food & Recipes",
  "Travel",
  "Technology",
  "Parenting & Family",
  "Fashion & Beauty",
  "Home & DIY",
  "Pets",
  "Business & Marketing",
  "Education & Learning",
  "Lifestyle",
  "Sports & Outdoors",
  "Gaming",
  "Other",
];

/** Monetization methods offered as boolean checkboxes. */
export const MONETIZATION_METHODS = [
  { id: "monetAds", label: "Display ads" },
  { id: "monetAffiliate", label: "Affiliate marketing" },
  { id: "monetProducts", label: "Digital products / courses" },
  { id: "monetSponsored", label: "Sponsored content" },
] as const;

/** Rubric weights (equal). Exported so tests can assert the documented rubric. */
export const WEIGHT_TRAFFIC = 0.25;
export const WEIGHT_COMPETITION = 0.25;
export const WEIGHT_MONETIZATION = 0.25;
export const WEIGHT_RPM = 0.25;

/** Heuristic capture rate used by the traffic-value estimate. */
export const CAPTURE_RATE = 0.05;
/** RPM normalization ceiling for the R factor. */
export const RPM_REFERENCE = 50;

export const DISCLAIMER_TEXT =
  "Heuristic score — a rough guide for comparing niches, NOT a profit " +
  "prediction. Search volume, competition, and RPM are your own judgments; " +
  "the monthly potential uses a fixed 5% capture heuristic and your RPM, " +
  "so treat it as a traffic-value estimate, not a forecast of earnings.";

export interface NicheProfitabilityInput {
  /** One of NICHE_OPTIONS. Required. */
  niche: string;
  /** Niche monthly search volume. Finite number > 0. */
  monthlySearchVolume: number;
  /** "low" | "medium" | "high". Required. */
  competitionLevel: string;
  /** Monetization method checkboxes (optional, default false). */
  monetAds?: boolean;
  monetAffiliate?: boolean;
  monetProducts?: boolean;
  monetSponsored?: boolean;
  /** Average RPM in USD. Finite number > 0. */
  avgRpm: number;
}

export interface NicheProfitabilityResult {
  /** Heuristic score, integer 0–100. */
  profitabilityScore: number;
  /** Traffic-value estimate in USD/mo, rounded to 2 decimals. */
  estimatedMonthlyPotential: number;
  /** Per-method illustrative split lines (or a no-methods note). */
  methodBreakdown: string[];
  /** Honesty disclaimer surfaced by the UI. */
  disclaimer: string;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Round half-up to 2 decimals (inputs to this tool are non-negative). */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function assertFiniteNumber(name: string, value: unknown): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number.`);
  }
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

function assertOptionalBoolean(name: string, value: unknown): void {
  if (value !== undefined && typeof value !== "boolean") {
    throw new TypeError(`${name} must be true or false.`);
  }
}

/**
 * Score a blog niche with the published heuristic rubric.
 *
 * @param input - niche, monthlySearchVolume, competitionLevel,
 *   monetization booleans, avgRpm.
 * @returns profitabilityScore (0–100 int), estimatedMonthlyPotential,
 *   methodBreakdown, disclaimer.
 * @throws {TypeError} for non-object input, unknown niche/competition, or
 *   non-numeric / non-boolean inputs.
 * @throws {RangeError} for monthlySearchVolume <= 0 or avgRpm <= 0.
 */
export function calculateNicheProfitability(
  input: NicheProfitabilityInput,
): NicheProfitabilityResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }
  if (!NICHE_OPTIONS.includes(input.niche)) {
    throw new TypeError(`niche must be one of: ${NICHE_OPTIONS.join("; ")}.`);
  }
  const competition = COMPETITION_VALUE[
    input.competitionLevel as CompetitionLevel
  ];
  if (typeof competition !== "number") {
    throw new TypeError(
      `competitionLevel must be one of: ${COMPETITION_LEVELS.join(", ")}.`,
    );
  }
  assertFiniteNumber("monthlySearchVolume", input.monthlySearchVolume);
  if (input.monthlySearchVolume <= 0) {
    throw new RangeError("monthlySearchVolume must be greater than 0.");
  }
  assertFiniteNumber("avgRpm", input.avgRpm);
  if (input.avgRpm <= 0) {
    throw new RangeError("avgRpm must be greater than 0.");
  }
  assertOptionalBoolean("monetAds", input.monetAds);
  assertOptionalBoolean("monetAffiliate", input.monetAffiliate);
  assertOptionalBoolean("monetProducts", input.monetProducts);
  assertOptionalBoolean("monetSponsored", input.monetSponsored);

  // --- Rubric factors (see header comment for the published rubric) ---
  const T = clamp01(Math.log10(input.monthlySearchVolume) / 7);
  const competitionTerm = 1 - competition;
  const selectedMethods = MONETIZATION_METHODS.filter(
    (m) => input[m.id] === true,
  );
  const M = selectedMethods.length / MONETIZATION_METHODS.length;
  const R = clamp01(input.avgRpm / RPM_REFERENCE);

  const weightSum =
    WEIGHT_TRAFFIC + WEIGHT_COMPETITION + WEIGHT_MONETIZATION + WEIGHT_RPM;
  const raw =
    (100 *
      (WEIGHT_TRAFFIC * T +
        WEIGHT_COMPETITION * competitionTerm +
        WEIGHT_MONETIZATION * M +
        WEIGHT_RPM * R)) /
    weightSum;
  const profitabilityScore = Math.min(100, Math.max(0, Math.round(raw)));

  const estimatedMonthlyPotential = round2(
    (input.monthlySearchVolume * CAPTURE_RATE * input.avgRpm) / 1000,
  );

  const methodBreakdown: string[] =
    selectedMethods.length === 0
      ? [
          "No monetization methods selected — the score treats monetization as 0. Select at least one method to see a breakdown.",
        ]
      : selectedMethods.map((m) => {
          const share = round2(estimatedMonthlyPotential / selectedMethods.length);
          const pct = Math.round((1 / selectedMethods.length) * 100);
          return `${m.label}: $${share.toFixed(2)}/mo (${pct}% of the estimate)`;
        });

  return {
    profitabilityScore,
    estimatedMonthlyPotential,
    methodBreakdown,
    disclaimer: DISCLAIMER_TEXT,
  };
}

// ---------------------------------------------------------------------------
// runTool adapter — contract shape for the mountToolUI / calculator template
// ---------------------------------------------------------------------------

/**
 * Contract adapter: `runTool({ niche, monthlySearchVolume, competitionLevel,
 * monetAds, monetAffiliate, monetProducts, monetSponsored, avgRpm })` →
 * `{ ok, values?, error? }`. Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const v = values && typeof values === "object" ? values : {};
  try {
    const result = calculateNicheProfitability({
      niche: v["niche"] as string,
      monthlySearchVolume: v["monthlySearchVolume"] as number,
      competitionLevel: v["competitionLevel"] as string,
      monetAds: v["monetAds"] as boolean | undefined,
      monetAffiliate: v["monetAffiliate"] as boolean | undefined,
      monetProducts: v["monetProducts"] as boolean | undefined,
      monetSponsored: v["monetSponsored"] as boolean | undefined,
      avgRpm: v["avgRpm"] as number,
    });
    return {
      ok: true,
      values: {
        profitabilityScore: result.profitabilityScore,
        estimatedMonthlyPotential: result.estimatedMonthlyPotential,
        methodBreakdown: result.methodBreakdown,
        disclaimer: result.disclaimer,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid input.";
    return { ok: false, error: humanize(message) };
  }
}

function humanize(message: string): string {
  if (message.startsWith("niche must be one of")) {
    return "Pick a blog niche from the list.";
  }
  if (message.startsWith("competitionLevel must be one of")) {
    return "Pick the competition level: low, medium, or high.";
  }
  if (message.startsWith("monthlySearchVolume must be greater than 0")) {
    return "Enter the niche's monthly search volume — a number greater than 0.";
  }
  if (message.startsWith("monthlySearchVolume")) {
    return "Monthly search volume must be a valid number.";
  }
  if (message.startsWith("avgRpm must be greater than 0")) {
    return "Enter your average RPM in USD — a number greater than 0.";
  }
  if (message.startsWith("avgRpm")) {
    return "Average RPM must be a valid number.";
  }
  if (message.endsWith("must be true or false.")) {
    return "A monetization checkbox has an invalid value.";
  }
  return message;
}
