/**
 * Niche Clarity Quiz — pure logic.
 *
 * WHAT IT HONESTLY DOES:
 * A 5-question decision quiz (interests, skills, audience, format, goal).
 * Each answer is scored against a FIXED bank of 16 niche profiles using
 * FIXED weights (documented below). The top 3 profiles are returned as a
 * ranked list, the top profile's score becomes the "clarity score", and a
 * fixed set of validation steps is attached.
 *
 * It is a client-side weighted-scoring heuristic: guidance only. It does
 * NOT analyze the market, competition, or your account. It is NOT AI.
 *
 * FIXED DATA (documented):
 * - QUESTIONS: 5 questions with fixed choice lists (8 / 3 / 4 / 4 / 4 choices).
 * - NICHE_BANK: 16 niche profiles (2 per interest), each tagged with the
 *   choice indices it matches on questions 2-5.
 * - WEIGHTS: interest match = 40 pts; experience/audience/format/goal
 *   match = 15 pts each. Max score = 100.
 * - ANGLE_BANK: 3 positioning phrases keyed by the q2 (experience) choice.
 * - VALIDATION_STEPS: fixed bank of 5 steps (same for every run).
 *
 * Deterministic: same answers -> identical ranking, always.
 * Zero imports, zero DOM, zero network, zero Math.random.
 */

export interface QuizQuestion {
  id: string;
  label: string;
  choices: string[];
}

/** The 5 quiz questions. Bank size: 8 + 3 + 4 + 4 + 4 = 23 choices. */
export const QUESTIONS: ReadonlyArray<QuizQuestion> = [
  {
    id: "q1",
    label: "The topic you could talk about for an hour without notes",
    choices: [
      "Fitness and healthy living",
      "Money, business, and side hustles",
      "Fashion and beauty",
      "Food and cooking",
      "Travel and adventure",
      "Parenting and family",
      "Tech, AI, and gadgets",
      "Personal growth and mindset",
    ],
  },
  {
    id: "q2",
    label: "Your experience level in that topic",
    choices: [
      "I'm a professional or expert",
      "I'm learning and sharing the journey",
      "I'm a curious beginner",
    ],
  },
  {
    id: "q3",
    label: "Who you most want to help or entertain",
    choices: [
      "People like me",
      "Total beginners",
      "Busy people who want quick wins",
      "Ambitious people chasing bigger goals",
    ],
  },
  {
    id: "q4",
    label: "The format that fits your personality best",
    choices: [
      "Talking to camera",
      "Voiceover with visuals",
      "Designed slides or text posts",
      "Filming my everyday life",
    ],
  },
  {
    id: "q5",
    label: "What success looks like to you",
    choices: [
      "Growing a large following",
      "Deep engagement (comments, DMs)",
      "Earning money (sales, brand deals)",
      "Loving the process itself",
    ],
  },
];

/** Fixed scoring weights. Max total = 40 + 15 + 15 + 15 + 15 = 100. */
export const WEIGHT_INTEREST = 40;
export const WEIGHT_MATCH = 15;

export interface NicheProfile {
  /** Index into the q1 choices list. */
  interest: number;
  name: string;
  /** q2 choice indices this niche suits. */
  experience: ReadonlyArray<number>;
  /** q3 choice indices this niche suits. */
  audience: ReadonlyArray<number>;
  /** q4 choice indices this niche suits. */
  format: ReadonlyArray<number>;
  /** q5 choice index this niche suits best. */
  goal: number;
}

/**
 * Fixed bank of 16 niche profiles (2 per interest).
 * Tags are heuristic judgments, not data-derived.
 */
export const NICHE_BANK: ReadonlyArray<NicheProfile> = [
  { interest: 0, name: "Beginner-friendly home workouts", experience: [1, 2], audience: [1, 2], format: [0, 3], goal: 0 },
  { interest: 0, name: "Nutrition basics for real life", experience: [0, 1], audience: [0, 1], format: [1, 2], goal: 1 },
  { interest: 1, name: "Side hustle experiments", experience: [1, 2], audience: [0, 3], format: [0, 1], goal: 2 },
  { interest: 1, name: "Budgeting for beginners", experience: [0, 1], audience: [1, 2], format: [1, 2], goal: 1 },
  { interest: 2, name: "Everyday outfit styling", experience: [1, 2], audience: [0], format: [0, 3], goal: 0 },
  { interest: 2, name: "Skincare routines on a budget", experience: [0, 1], audience: [1, 2], format: [1, 3], goal: 1 },
  { interest: 3, name: "15-minute weeknight recipes", experience: [1, 2], audience: [1, 2], format: [1, 3], goal: 0 },
  { interest: 3, name: "Baking from scratch", experience: [0, 1], audience: [0], format: [1, 3], goal: 1 },
  { interest: 4, name: "Weekend travel guides", experience: [1, 2], audience: [0, 2], format: [1, 3], goal: 0 },
  { interest: 4, name: "Travel on a budget", experience: [1, 2], audience: [1], format: [1, 3], goal: 0 },
  { interest: 5, name: "Toddler parenting survival tips", experience: [1], audience: [0, 1], format: [0, 3], goal: 1 },
  { interest: 5, name: "Family meal planning", experience: [0, 1], audience: [0, 2], format: [2, 3], goal: 1 },
  { interest: 6, name: "AI tools for everyday life", experience: [1, 2], audience: [1, 2], format: [1, 2], goal: 0 },
  { interest: 6, name: "Honest gadget reviews", experience: [0, 1], audience: [0, 3], format: [0, 1], goal: 2 },
  { interest: 7, name: "Daily habits that stick", experience: [1, 2], audience: [0, 3], format: [0, 2], goal: 1 },
  { interest: 7, name: "Journaling for clarity", experience: [1], audience: [0], format: [2, 3], goal: 3 },
];

/** Positioning phrase per q2 experience choice. Bank size: 3. */
export const ANGLE_BANK: ReadonlyArray<string> = [
  "position yourself as the expert",
  "document the journey as you learn",
  "learn in public alongside your audience",
];

/**
 * Fixed validation steps shown after every quiz run.
 * Bank size: 5. Same for every run — they are generic, honest advice.
 */
export const VALIDATION_STEPS: ReadonlyArray<string> = [
  "Post 10 pieces of content in your top niche over the next 2 weeks and note which 2 earn the most saves.",
  "Search your niche topic on Instagram and read the top 20 comments — note the questions people keep asking.",
  "DM 5 people in your target audience and ask what content about this topic they wish existed.",
  "If one sub-topic clearly wins, narrow your niche around it for the next 10 posts.",
  "Re-run this quiz in 60 days — your answers will change as you learn what you enjoy making.",
];

export interface NicheScore {
  profile: NicheProfile;
  score: number;
}

/** Score one profile against answer indices. Exported for tests. */
export function scoreProfile(profile: NicheProfile, answers: number[]): number {
  let score = 0;
  if (profile.interest === answers[0]) score += WEIGHT_INTEREST;
  if (profile.experience.includes(answers[1])) score += WEIGHT_MATCH;
  if (profile.audience.includes(answers[2])) score += WEIGHT_MATCH;
  if (profile.format.includes(answers[3])) score += WEIGHT_MATCH;
  if (profile.goal === answers[4]) score += WEIGHT_MATCH;
  return score;
}

/** Read and validate the 5 answers as choice indices. */
function readAnswers(values: Record<string, unknown>): number[] | { error: string } {
  const answers: number[] = [];
  for (const question of QUESTIONS) {
    const raw = values[question.id];
    if (typeof raw !== "string" || raw.trim().length === 0) {
      return { error: `Please answer "${question.label}" before getting your result.` };
    }
    const index = question.choices.indexOf(raw.trim());
    if (index === -1) {
      return { error: `"${raw}" is not a valid answer for "${question.label}". Please choose one of the listed options.` };
    }
    answers.push(index);
  }
  return answers;
}

/** Rank all profiles for the given answers. Exported for tests. */
export function rankNiches(answers: number[]): NicheScore[] {
  return NICHE_BANK.map((profile) => ({ profile, score: scoreProfile(profile, answers) })).sort(
    (a, b) => b.score - a.score,
  );
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const answers = readAnswers(values);
  if (!Array.isArray(answers)) {
    return { ok: false, error: answers.error };
  }
  const ranked = rankNiches(answers);
  const top3 = ranked.slice(0, 3);
  const angle = ANGLE_BANK[answers[1]];
  const topNiches = top3.map(
    (r, i) => `${i + 1}. ${r.profile.name} — ${angle} (match score ${r.score}/100)`,
  );
  return {
    ok: true,
    values: {
      topNiches,
      clarityScore: top3[0].score,
      validationSteps: [...VALIDATION_STEPS],
    },
  };
}
