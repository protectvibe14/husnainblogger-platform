/**
 * Niche Profitability Scorer — pure logic (tool-118).
 *
 * HEURISTIC RUBRIC, NOT MARKET DATA: the score is computed from the
 * user's own estimates (CPM band self-selection, 1–5 self-ratings) through
 * a published weighted rubric. It cannot fetch real CPM or competition
 * data client-side. The output is labeled an "opinionated heuristic" and
 * the score is only as good as the user's inputs.
 *
 * Rubric (weights + criteria published here AND in content.methodology):
 *   CPM band estimate   35%  — user-selected band mapped to 15/45/70/95
 *   Audience buying intent 25% — rating 1–5 normalized to 0–100
 *   Competition         25%  — rating 1–5, INVERTED (lower competition = higher score)
 *   Production cost     15%  — rating 1–5, INVERTED (cheaper to produce = higher score)
 *
 * Score = round(0.35*cpm + 0.25*intent + 0.25*(100-competition) + 0.15*(100-cost))
 * Bands: 70–100 "High", 40–69 "Medium", 0–39 "Low".
 *
 * Zero imports. Fully deterministic.
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export type CpmBand = "under-5" | "5-15" | "15-30" | "over-30";

export const CPM_BANDS: CpmBand[] = ["under-5", "5-15", "15-30", "over-30"];

/** Fixed mapping from self-selected CPM band to rubric points. */
export const CPM_BAND_POINTS: Record<CpmBand, number> = {
  "under-5": 15,
  "5-15": 45,
  "15-30": 70,
  "over-30": 95,
};

export const CPM_BAND_LABELS: Record<CpmBand, string> = {
  "under-5": "Under $5",
  "5-15": "$5–$15",
  "15-30": "$15–$30",
  "over-30": "Over $30",
};

/** Rubric weights — must sum to 1. */
export const WEIGHTS = {
  cpm: 0.35,
  buyingIntent: 0.25,
  competition: 0.25,
  productionCost: 0.15,
} as const;

export const MIN_RATING = 1;
export const MAX_RATING = 5;

export const HIGH_BAND_MIN = 70;
export const MEDIUM_BAND_MIN = 40;

function isCpmBand(v: unknown): v is CpmBand {
  return (CPM_BANDS as string[]).includes(v as string);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isRating(v: unknown): v is number {
  return (
    typeof v === "number" &&
    Number.isInteger(v) &&
    v >= MIN_RATING &&
    v <= MAX_RATING
  );
}

/** Normalize a 1–5 rating to 0–100. */
export function normalizeRating(rating: number): number {
  return ((rating - MIN_RATING) / (MAX_RATING - MIN_RATING)) * 100;
}

export interface NicheScoreInputs {
  nicheName: string;
  cpmBand: CpmBand;
  competition: number;
  productionCost: number;
  buyingIntent: number;
}

export interface ScoreBreakdown {
  criterion: string;
  weight: number;
  points: number;
  contribution: number;
}

export interface NicheScoreResult {
  nicheName: string;
  score: number;
  band: "High" | "Medium" | "Low";
  breakdown: ScoreBreakdown[];
  /** Per-input explanations of how each input moved the score. */
  notes: string[];
  /** Always true — output is a heuristic, not market data. */
  heuristic: true;
}

export function scoreNiche(i: NicheScoreInputs): NicheScoreResult {
  const cpmPoints = CPM_BAND_POINTS[i.cpmBand];
  const intentPoints = normalizeRating(i.buyingIntent);
  const competitionPoints = 100 - normalizeRating(i.competition);
  const costPoints = 100 - normalizeRating(i.productionCost);

  const breakdown: ScoreBreakdown[] = [
    { criterion: "CPM band (your estimate)", weight: WEIGHTS.cpm, points: cpmPoints, contribution: WEIGHTS.cpm * cpmPoints },
    { criterion: "Audience buying intent", weight: WEIGHTS.buyingIntent, points: intentPoints, contribution: WEIGHTS.buyingIntent * intentPoints },
    { criterion: "Competition (inverted)", weight: WEIGHTS.competition, points: competitionPoints, contribution: WEIGHTS.competition * competitionPoints },
    { criterion: "Production cost (inverted)", weight: WEIGHTS.productionCost, points: costPoints, contribution: WEIGHTS.productionCost * costPoints },
  ];
  const score = Math.round(breakdown.reduce((sum, b) => sum + b.contribution, 0));
  const band: NicheScoreResult["band"] =
    score >= HIGH_BAND_MIN ? "High" : score >= MEDIUM_BAND_MIN ? "Medium" : "Low";

  const notes: string[] = [
    `CPM band ${CPM_BAND_LABELS[i.cpmBand]} (your estimate) contributes ${WEIGHTS.cpm * 100}% — advertiser-heavy niches pay more per 1,000 views.`,
    `Buying intent ${i.buyingIntent}/5 contributes ${WEIGHTS.buyingIntent * 100}% — niches whose viewers buy things monetize beyond ads.`,
    `Competition ${i.competition}/5 is inverted (${WEIGHTS.competition * 100}% weight) — crowded niches score lower because breaking in costs more effort.`,
    `Production cost ${i.productionCost}/5 is inverted (${WEIGHTS.productionCost * 100}% weight) — expensive formats need more revenue to break even.`,
  ];
  if (band === "Low") {
    notes.push("Low band does not mean 'do not start' — it means the niche is harder to monetize and needs a deliberate revenue plan (sponsorships, products, affiliates).");
  }

  return { nicheName: i.nicheName, score, band, breakdown, notes, heuristic: true };
}

/** Template entry point. values keys: nicheName, cpmBand, competition, productionCost, buyingIntent. */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const nicheName = values["nicheName"];
  if (!isNonEmptyString(nicheName)) {
    return { ok: false, error: "Enter your niche name first." };
  }
  if (nicheName.trim().length > 80) {
    return { ok: false, error: "Niche name must be 80 characters or fewer." };
  }
  const cpmBand = values["cpmBand"];
  if (!isCpmBand(cpmBand)) {
    return { ok: false, error: "Choose an estimated CPM band (under $5, $5–$15, $15–$30, or over $30)." };
  }
  const fields: Array<[string, string]> = [
    ["competition", "Competition"],
    ["productionCost", "Production cost"],
    ["buyingIntent", "Audience buying intent"],
  ];
  for (const [key, label] of fields) {
    if (!isRating(values[key])) {
      return { ok: false, error: `${label} must be a whole number from 1 to 5.` };
    }
  }
  const result = scoreNiche({
    nicheName: nicheName.trim(),
    cpmBand,
    competition: values["competition"] as number,
    productionCost: values["productionCost"] as number,
    buyingIntent: values["buyingIntent"] as number,
  });
  return {
    ok: true,
    values: {
      nicheName: result.nicheName,
      score: result.score,
      band: result.band,
      breakdown: result.breakdown,
      notes: result.notes,
      heuristic: result.heuristic,
    },
  };
}
