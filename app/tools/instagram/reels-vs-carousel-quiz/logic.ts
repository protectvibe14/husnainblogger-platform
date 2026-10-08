/**
 * Reels vs Carousel Quiz — pure logic.
 *
 * WHAT IT HONESTLY DOES:
 * A 5-question decision quiz. Each answer carries FIXED weights toward
 * "reels" and toward "carousel" (documented below). The tool sums the
 * weights, converts them to percentages, and returns a format
 * recommendation plus templated reasoning and next steps.
 *
 * It is a client-side weighted-scoring heuristic. It does NOT predict
 * reach, engagement, or earnings — the recommendation is guidance, not a
 * performance guarantee. It is NOT AI-generated content.
 *
 * FIXED DATA (documented):
 * - QUESTIONS: 5 questions, each with 3-4 choices.
 * - WEIGHTS: every choice maps to { reels, carousel } points. Max total:
 *   reels = 14, carousel = 14 (both maximums documented in MAX_SCORE).
 * - REASON_LINES: per (question, winning side) one templated sentence.
 *   Bank size: 10 entries (5 questions x 2 sides).
 * - NEXT_STEPS: 3 fixed arrays (reels / carousel / both), 5 steps each.
 *
 * Deterministic: same answers -> identical recommendation, always.
 * Zero imports, zero DOM, zero network, zero Math.random.
 */

export interface QuizChoice {
  label: string;
  reels: number;
  carousel: number;
}

export interface QuizQuestion {
  id: string;
  label: string;
  choices: QuizChoice[];
}

/** Max achievable score for either side (sum of each question's max). */
export const MAX_SCORE = 14;

/** Recommendation threshold: one side must lead by this many percent points. */
export const LEAD_THRESHOLD_PCT = 15;

/**
 * The 5 quiz questions with fixed weights.
 * reels/carousel points per choice — heuristic only, not data-derived.
 */
export const QUESTIONS: ReadonlyArray<QuizQuestion> = [
  {
    id: "q1",
    label: "Your main goal right now",
    choices: [
      { label: "Grow new followers fast", reels: 3, carousel: 0 },
      { label: "Build deeper trust with my audience", reels: 1, carousel: 2 },
      { label: "Drive sales or signups", reels: 1, carousel: 2 },
      { label: "Get more saves and shares", reels: 0, carousel: 3 },
    ],
  },
  {
    id: "q2",
    label: "How do you feel about being on camera",
    choices: [
      { label: "I film myself happily", reels: 3, carousel: 0 },
      { label: "Only for short, casual clips", reels: 2, carousel: 1 },
      { label: "I prefer staying behind the camera", reels: 0, carousel: 3 },
    ],
  },
  {
    id: "q3",
    label: "Time you can spend creating one post",
    choices: [
      { label: "Under 15 minutes", reels: 2, carousel: 1 },
      { label: "15 to 30 minutes", reels: 2, carousel: 2 },
      { label: "30 to 60 minutes", reels: 1, carousel: 2 },
      { label: "Over an hour", reels: 1, carousel: 3 },
    ],
  },
  {
    id: "q4",
    label: "What do you enjoy making most",
    choices: [
      { label: "Talking-head or voiceover videos", reels: 3, carousel: 0 },
      { label: "Designed slides or graphics", reels: 0, carousel: 3 },
      { label: "A mix of both", reels: 2, carousel: 2 },
    ],
  },
  {
    id: "q5",
    label: "How often can you post each week",
    choices: [
      { label: "1 to 2 times", reels: 1, carousel: 2 },
      { label: "3 to 4 times", reels: 2, carousel: 2 },
      { label: "5 or more times", reels: 3, carousel: 1 },
    ],
  },
];

/**
 * Templated reasoning sentence per (question id, winning side).
 * Bank size: 10 (5 questions x 2 sides).
 */
export const REASON_LINES: Readonly<Record<string, { reels: string; carousel: string }>> = {
  q1: {
    reels: "Your goal of fast follower growth lines up with short video's reach potential.",
    carousel: "Your goal fits a format people save and revisit, which carousels do well.",
  },
  q2: {
    reels: "You are comfortable on camera, which removes the biggest hurdle for Reels.",
    carousel: "You prefer staying behind the camera, where carousels let design do the talking.",
  },
  q3: {
    reels: "Your per-post time budget suits quick short-form videos.",
    carousel: "Your per-post time budget suits crafted, high-detail carousels.",
  },
  q4: {
    reels: "You enjoy making videos, so you will actually stick with a Reels habit.",
    carousel: "You enjoy designing graphics, so carousels play to your strengths.",
  },
  q5: {
    reels: "Your posting rhythm supports the volume Reels reward.",
    carousel: "Your posting rhythm suits fewer, longer-lived posts like carousels.",
  },
};

/** Fixed next steps per recommendation. Bank size: 3 arrays x 5 steps. */
export const NEXT_STEPS: Readonly<Record<string, ReadonlyArray<string>>> = {
  reels: [
    "Post 3 Reels this week with a hook in the first 2 seconds of each.",
    "Test one trending audio and one original-audio Reel to compare reach.",
    "Add 3-5 relevant hashtags and a clear on-screen caption to every Reel.",
    "Reply to every comment in the first hour to boost early engagement signals.",
    "After 2 weeks, keep the 2 best-performing topics and drop the rest.",
  ],
  carousel: [
    "Design one 7-10 slide carousel with the payoff promised on slide 1.",
    "End every carousel with a save-worthy recap slide and a comment CTA.",
    "Keep text large and readable — most viewers swipe on phones.",
    "Repurpose one high-performing Reel into a carousel this week.",
    "After 2 weeks, keep the 2 best-performing topics and drop the rest.",
  ],
  both: [
    "Alternate Reels and carousels for 2 weeks and track saves vs reach per post.",
    "Use Reels for reach topics and carousels for save-worthy depth on the same theme.",
    "Give every post a hook in the first slide or first 2 seconds.",
    "Reply to every comment in the first hour to boost early engagement signals.",
    "After 2 weeks, double down on whichever format earned more saves per post.",
  ],
};

export type Recommendation = "reels" | "carousel" | "both";

export interface QuizResult {
  recommendation: Recommendation;
  reelsScore: number;
  carouselScore: number;
  reasoning: string[];
  nextSteps: string[];
}

/** Validate that every question is answered with a known choice label. */
function readAnswers(values: Record<string, unknown>): QuizChoice[] | { error: string } {
  const picked: QuizChoice[] = [];
  for (const question of QUESTIONS) {
    const raw = values[question.id];
    if (typeof raw !== "string" || raw.trim().length === 0) {
      return { error: `Please answer "${question.label}" before getting your result.` };
    }
    const choice = question.choices.find((c) => c.label === raw.trim());
    if (!choice) {
      return { error: `"${raw}" is not a valid answer for "${question.label}". Please choose one of the listed options.` };
    }
    picked.push(choice);
  }
  return picked;
}

function toPct(score: number): number {
  return Math.round((score / MAX_SCORE) * 100);
}

/** Score the picked choices into a full QuizResult. Exported for tests. */
export function scoreQuiz(picked: QuizChoice[]): QuizResult {
  const reelsScore = picked.reduce((sum, c) => sum + c.reels, 0);
  const carouselScore = picked.reduce((sum, c) => sum + c.carousel, 0);
  const reelsPct = toPct(reelsScore);
  const carouselPct = toPct(carouselScore);

  let recommendation: Recommendation = "both";
  if (reelsPct - carouselPct >= LEAD_THRESHOLD_PCT) recommendation = "reels";
  else if (carouselPct - reelsPct >= LEAD_THRESHOLD_PCT) recommendation = "carousel";

  // Reasoning: pick the 3 answers with the biggest margin toward the
  // winning side (or any side for "both"), keep question order.
  const ranked = QUESTIONS.map((q, i) => {
    const choice = picked[i];
    const margin =
      recommendation === "carousel"
        ? choice.carousel - choice.reels
        : recommendation === "reels"
          ? choice.reels - choice.carousel
          : Math.abs(choice.reels - choice.carousel);
    return { i, margin };
  })
    .sort((a, b) => b.margin - a.margin || a.i - b.i)
    .slice(0, 3)
    .sort((a, b) => a.i - b.i);

  const reasoning = ranked.map(({ i }) => {
    const q = QUESTIONS[i];
    const choice = picked[i];
    const side = recommendation === "both" ? (choice.reels >= choice.carousel ? "reels" : "carousel") : recommendation;
    return REASON_LINES[q.id][side];
  });

  return {
    recommendation,
    reelsScore: reelsPct,
    carouselScore: carouselPct,
    reasoning,
    nextSteps: [...NEXT_STEPS[recommendation]],
  };
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const picked = readAnswers(values);
  if (!Array.isArray(picked)) {
    return { ok: false, error: picked.error };
  }
  const result = scoreQuiz(picked);
  const label =
    result.recommendation === "reels"
      ? `Reels (${result.reelsScore} vs ${result.carouselScore} for carousels)`
      : result.recommendation === "carousel"
        ? `Carousels (${result.carouselScore} vs ${result.reelsScore} for Reels)`
        : `Both formats (Reels ${result.reelsScore}, carousels ${result.carouselScore})`;
  return {
    ok: true,
    values: {
      recommendation: label,
      reasoning: result.reasoning,
      nextSteps: result.nextSteps,
    },
  };
}
