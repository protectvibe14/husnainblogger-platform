/**
 * Video Idea Validator — pure logic (tool-139).
 *
 * PUBLISHED TRANSPARENT RUBRIC SCORER. The rubric (criteria + weights)
 * lives in this comment AND in content.methodology of meta.ts.
 *
 * WHAT IT IS: a structured gut-check calculator. The user rates five
 * factors from 1 (weak) to 5 (strong); the tool converts the ratings into
 * a 0–100 score with fixed weights and band verdicts.
 *
 * WHAT IT IS NOT: it has no access to YouTube search volume, trend data,
 * competitor analytics, or any live signal. It CANNOT predict views,
 * CTR, or performance. Output is labeled "structured gut-check, not
 * validation" in the honesty note.
 *
 * RUBRIC (all weights sum to 100):
 *
 *   Criterion                    Weight  How points are earned
 *   ───────────────────────────  ──────  ──────────────────────────────
 *   1. Search demand (self-rated)   30   (rating - 1) / 4 * 30 — how much
 *                                        the user believes people are
 *                                        searching for this topic.
 *   2. Competition winnability      25   (rating - 1) / 4 * 25 — 1 means
 *                                        "saturated, giants dominate",
 *                                        5 means "wide open".
 *   3. Channel fit                  20   (rating - 1) / 4 * 20 — how well
 *                                        the idea matches the channel's
 *                                        niche and audience expectations.
 *   4. Packaging potential          15   (rating - 1) / 4 * 15 — can the
 *                                        idea support a strong title +
 *                                        thumbnail combo?
 *   5. Effort efficiency            10   (rating - 1) / 4 * 10 — 1 means
 *                                        "weeks of work", 5 means
 *                                        "film it this weekend".
 *
 * Score = sum of points, rounded to the nearest integer (0–100).
 *
 * VERDICT BANDS:
 *   75–100  GREENLIGHT — idea is worth making now.
 *   50–74   REFINE    — fix the weakest factor first.
 *   0–49    PARK      — park it; improve or pick another idea.
 *
 * Weakest factor: the criterion with the lowest earned share
 * (points / weight). Ties broken by rubric order.
 *
 * Deterministic: same ratings always give the same score.
 * Zero imports, zero DOM, zero network.
 */

export interface RubricCriterion {
  id: string;
  label: string;
  weight: number;
  /** Guidance for what a 1 and a 5 mean (shown in the UI). */
  lowMeans: string;
  highMeans: string;
}

export const RUBRIC: RubricCriterion[] = [
  {
    id: "demand",
    label: "Search demand",
    weight: 30,
    lowMeans: "1 = nobody is searching for this",
    highMeans: "5 = lots of people are searching for this",
  },
  {
    id: "competition",
    label: "Competition winnability",
    weight: 25,
    lowMeans: "1 = saturated, big channels dominate",
    highMeans: "5 = wide open, you can compete",
  },
  {
    id: "channelFit",
    label: "Channel fit",
    weight: 20,
    lowMeans: "1 = off-niche, audience would be confused",
    highMeans: "5 = perfect for this channel's audience",
  },
  {
    id: "packaging",
    label: "Packaging potential",
    weight: 15,
    lowMeans: "1 = hard to title or thumbnail",
    highMeans: "5 = strong title + thumbnail almost writes itself",
  },
  {
    id: "effort",
    label: "Effort efficiency",
    weight: 10,
    lowMeans: "1 = weeks of production work",
    highMeans: "5 = can film and edit this weekend",
  },
];

/** Total of all weights. Must equal 100 — asserted in the test suite. */
export const RUBRIC_TOTAL = RUBRIC.reduce((a, c) => a + c.weight, 0);

export type Verdict = "GREENLIGHT" | "REFINE" | "PARK";

export function verdictFor(score: number): Verdict {
  if (score >= 75) return "GREENLIGHT";
  if (score >= 50) return "REFINE";
  return "PARK";
}

export interface FactorScore {
  id: string;
  label: string;
  rating: number;
  points: number;
  max: number;
  /** points / max — used to find the weakest factor. */
  share: number;
}

export interface IdeaScore {
  ideaTitle: string;
  score: number;
  verdict: Verdict;
  verdictTip: string;
  factors: FactorScore[];
  weakestFactorId: string;
  weakestFactorLabel: string;
  weakestFactorAdvice: string;
  honestNote: string;
}

const VERDICT_TIPS: Record<Verdict, string> = {
  GREENLIGHT: "Your self-ratings say this idea is solid on every front. Film it.",
  REFINE: "The idea has legs but a weak spot. Strengthen the factor below before filming.",
  PARK: "Too many weak factors — park this idea or rework it until the weakest factor improves.",
};

const FACTOR_ADVICE: Record<string, string> = {
  demand: "Weakest: search demand. Check YouTube autocomplete and Google Trends for this topic before committing.",
  competition: "Weakest: competition. Find a narrower angle or a sub-niche the big channels are ignoring.",
  channelFit: "Weakest: channel fit. Either reshape the idea for your audience or save it for a different channel.",
  packaging: "Weakest: packaging potential. If you cannot write 3 strong titles and thumbnail texts, the idea will underperform.",
  effort: "Weakest: effort efficiency. Simplify the format (talking head, fewer locations, stock B-roll) so it actually ships.",
};

export const HONEST_NOTE =
  "Structured gut-check, not validation: this score comes from YOUR ratings, not from YouTube data. " +
  "It cannot predict views or performance. Use it to compare ideas and spot weak spots, not as a guarantee.";

/** Parse a 1–5 rating from the (possibly string) input value. */
export function parseRating(raw: unknown): number | null {
  const n =
    typeof raw === "string" && raw.trim() !== "" ? Number(raw.trim()) : raw;
  if (typeof n !== "number" || !Number.isInteger(n) || n < 1 || n > 5) {
    return null;
  }
  return n;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Compute the score from five validated 1–5 ratings (rubric from this
 * file's header comment).
 */
export function scoreIdea(
  ideaTitle: string,
  ratings: Record<string, number>,
): IdeaScore {
  const factors: FactorScore[] = RUBRIC.map((c) => {
    const rating = ratings[c.id] as number;
    const points = Math.round(((rating - 1) / 4) * c.weight);
    return {
      id: c.id,
      label: c.label,
      rating,
      points,
      max: c.weight,
      share: points / c.weight,
    };
  });
  const score = Math.min(100, Math.max(0, factors.reduce((a, f) => a + f.points, 0)));
  const verdict = verdictFor(score);
  let weakest = factors[0];
  for (const f of factors) {
    if (f.share < weakest.share) weakest = f;
  }
  return {
    ideaTitle,
    score,
    verdict,
    verdictTip: VERDICT_TIPS[verdict],
    factors,
    weakestFactorId: weakest.id,
    weakestFactorLabel: weakest.label,
    weakestFactorAdvice: FACTOR_ADVICE[weakest.id],
    honestNote: HONEST_NOTE,
  };
}

/**
 * runTool adapter (mountToolUI scorer template).
 * Validates { ideaTitle, demand, competition, channelFit, packaging, effort }
 * (each rating 1–5); returns { score, verdict, weakestFactor,
 * factorBreakdown, honestNote }. Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Describe your video idea and rate the five factors from 1 to 5." };
  }
  const ideaRaw = values["ideaTitle"];
  if (typeof ideaRaw !== "string" || ideaRaw.trim().length === 0) {
    return { ok: false, error: "Idea title is required — what video are you scoring?" };
  }
  if (ideaRaw.trim().length > 200) {
    return { ok: false, error: "Idea title is too long — keep it under 200 characters." };
  }
  const ratings: Record<string, number> = {};
  for (const c of RUBRIC) {
    const r = parseRating(values[c.id]);
    if (r === null) {
      return {
        ok: false,
        error: `"${c.label}" needs a whole-number rating from 1 to 5.`,
      };
    }
    ratings[c.id] = r;
  }
  const scored = scoreIdea(ideaRaw.trim(), ratings);
  const breakdown = scored.factors.map(
    (f) => `${f.label}: ${f.rating}/5 → ${f.points}/${f.max} pts`,
  );
  return {
    ok: true,
    values: {
      score: scored.score,
      verdict: scored.verdict,
      weakestFactor: `${scored.weakestFactorLabel} — ${scored.weakestFactorAdvice}`,
      factorBreakdown: breakdown,
      honestNote: scored.honestNote,
    },
  };
}
