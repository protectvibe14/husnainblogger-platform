/**
 * Quiz Lead Magnet Idea Generator — pure logic (tool-428).
 *
 * ASSEMBLY, NOT AI: quiz concepts are assembled from FIXED banks bundled
 * below — no network, no model, no randomness. Selection is a deterministic
 * hash of the inputs, so identical inputs always produce identical output.
 * Copy says "templates", never "AI-generated".
 *
 * Bank sizes (documented for the honesty contract):
 * - QUIZ_TITLE_PATTERNS: 18 title patterns (placeholders: {niche}, {audience})
 * - SAMPLE_QUESTIONS: 18 sample questions (6 per quiz goal)
 * - RESULT_TYPES: 12 result-type patterns (placeholder: {niche})
 *
 * Honesty notes:
 * - This tool covers quiz-format lead magnets only. General lead-magnet
 *   ideation is tool 425, lead-magnet titles are tool 426, and post-specific
 *   content upgrades are tool 427.
 * - Sample questions are starters, not a full quiz script; real quizzes
 *   need their own logic and result pages before launch.
 *
 * Edge-case handling:
 * - Lengths measured in Unicode code points ([...s].length): emoji / CJK /
 *   RTL count as one character each.
 * - Over-long text inputs are TRUNCATED with a visible notice — never
 *   silently dropped.
 * - Output is plain text: user input is HTML-escaped so no markup renders.
 */

export const MAX_NICHE_CHARS = 80;
export const MAX_AUDIENCE_CHARS = 80;

/** Number of quiz ideas produced per run (fixed, documented). */
export const IDEAS_PER_RUN = 4;
/** Sample questions shown per quiz idea (fixed, documented). */
export const QUESTIONS_PER_IDEA = 3;
/** Result types shown per quiz idea (fixed, documented). */
export const RESULTS_PER_IDEA = 3;

/** 3 supported quiz goals. */
export const QUIZ_GOALS: readonly string[] = ["segment", "entertain", "qualify"];

/** Display labels for the quiz goals. */
export const QUIZ_GOAL_LABELS: Record<string, string> = {
  "segment": "Segment",
  "entertain": "Entertain",
  "qualify": "Qualify",
};

/** 18 quiz-title patterns. Placeholders: {niche}, {audience}. */
export const QUIZ_TITLE_PATTERNS: readonly string[] = [
  "What Type of {niche} Achiever Are You?",
  "The {audience} {niche} Quiz: Find Your Starting Point",
  "Which {niche} Strategy Fits You Best?",
  "Are You Making These {niche} Mistakes?",
  "The {niche} Personality Quiz for {audience}",
  "How {niche}-Ready Are You? Take the Quiz",
  "Discover Your {niche} Superpower",
  "The 2-Minute {niche} Assessment for {audience}",
  "What's Holding Back Your {niche} Results?",
  "Which {niche} Path Should You Take?",
  "The {audience} {niche} Scorecard Quiz",
  "Find Your {niche} Archetype",
  "How Well Do You Really Know {niche}?",
  "The {niche} Fit Quiz: Is It Right for You?",
  "What's Your {niche} Blind Spot?",
  "The Ultimate {niche} Challenge for {audience}",
  "Which {niche} Approach Matches Your Style?",
  "Rate Your {niche} Game in 60 Seconds",
];

/**
 * 18 fixed sample questions, 6 per quiz goal. Placeholder: {niche}.
 * These are starters — the user writes the full quiz script.
 */
export const SAMPLE_QUESTIONS: Record<string, readonly string[]> = {
  "segment": [
    "What's your biggest {niche} challenge right now?",
    "How long have you been working on {niche}?",
    "How much time can you spend on {niche} each week?",
    "What's your current {niche} budget?",
    "Have you tried {niche} before — what happened?",
    "What would {niche} success look like for you in 90 days?",
  ],
  "entertain": [
    "Pick the weekend activity that sounds most like you:",
    "Your friends describe you as…",
    "Choose a superpower:",
    "What's your ideal {niche} outcome?",
    "Pick the quote that motivates you most:",
    "If {niche} were a movie genre, you'd pick…",
  ],
  "qualify": [
    "How urgent is solving your {niche} problem?",
    "Who makes the final decision about {niche} in your world?",
    "What's your timeline for getting {niche} results?",
    "Have you budgeted for a {niche} solution?",
    "What happens if you don't fix your {niche} problem this year?",
    "How do you prefer to learn {niche}?",
  ],
};

/** 12 fixed result-type patterns. Placeholder: {niche}. */
export const RESULT_TYPES: readonly string[] = [
  "The Beginner: just getting started with {niche}",
  "The Dabbler: tried {niche}, needs a system",
  "The Doer: ready to go all-in on {niche}",
  "The Strategist: plans first, acts second",
  "The Sprinter: wants fast {niche} wins",
  "The Builder: plays the long {niche} game",
  "The Skeptic: needs proof before committing",
  "The Perfectionist: stuck polishing, not publishing",
  "The Outsourcer: wants {niche} done for them",
  "The DIYer: learns {niche} by doing",
  "The Researcher: reads everything, decides slowly",
  "The Action-Taker: implements {niche} the same day",
];

/** Table columns for the `quizzes` output. */
export const QUIZZES_COLUMNS: readonly string[] = [
  "#",
  "Quiz title",
  "Sample questions",
  "Result types",
  "Goal",
];

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers (all local — logic.ts has zero imports by contract)
// ---------------------------------------------------------------------------

/** djb2 hash, returned as an unsigned 32-bit int. Deterministic pick source. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/** Length in Unicode code points (emoji / CJK / RTL count as one each). */
function codePoints(s: string): number {
  return [...s].length;
}

/** Escape HTML so user input stays plain text in the output. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface TextRead {
  ok: true;
  value: string;
  notice?: string;
}

interface TextFail {
  ok: false;
  error: string;
}

function readText(
  values: Record<string, unknown>,
  id: string,
  label: string,
  maxChars: number,
): TextRead | TextFail {
  const raw = values[id];
  if (raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "")) {
    return { ok: false, error: `${label} is required — please fill it in.` };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: `${label} must be text.` };
  }
  const trimmed = raw.trim();
  if (trimmed === "") {
    return { ok: false, error: `${label} must not be empty.` };
  }
  let notice: string | undefined;
  let value = trimmed;
  if (codePoints(trimmed) > maxChars) {
    value = [...trimmed].slice(0, maxChars).join("");
    notice =
      `${label} was shortened from ${codePoints(trimmed)} to ${maxChars} characters.`;
  }
  return { ok: true, value: escapeHtml(value), notice };
}

/** Fill {token} placeholders from a map. */
function fill(template: string, map: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (m, key: string) =>
    Object.prototype.hasOwnProperty.call(map, key) ? map[key] : m,
  );
}

// ---------------------------------------------------------------------------
// runTool
// ---------------------------------------------------------------------------

/**
 * Generate quiz lead-magnet concepts from the fixed banks.
 *
 * Inputs (values): niche, audience (required text), quizGoal (required
 * select: segment | entertain | qualify).
 * Outputs (values): quizzes ({ columns: string[]; rows: string[][] }).
 */
export function runTool(values: Record<string, unknown>): RunResult {
  const niche = readText(values, "niche", "Niche", MAX_NICHE_CHARS);
  if (!niche.ok) return { ok: false, error: niche.error };
  const audience = readText(values, "audience", "Audience", MAX_AUDIENCE_CHARS);
  if (!audience.ok) return { ok: false, error: audience.error };

  const goalRaw = values["quizGoal"];
  if (goalRaw === undefined || goalRaw === null || goalRaw === "") {
    return { ok: false, error: "Quiz goal is required — pick segment, entertain, or qualify." };
  }
  if (typeof goalRaw !== "string" || !QUIZ_GOALS.includes(goalRaw)) {
    return {
      ok: false,
      error: `Quiz goal must be one of: ${QUIZ_GOALS.join(", ")}.`,
    };
  }
  const goal = goalRaw as string;

  const notices: string[] = [];
  if (niche.notice) notices.push(niche.notice);
  if (audience.notice) notices.push(audience.notice);

  const h = hashString([niche.value, audience.value, goal].join(" "));
  const questions = SAMPLE_QUESTIONS[goal];

  const rows: string[][] = [];
  for (let i = 0; i < IDEAS_PER_RUN; i++) {
    // Steps are coprime to their bank sizes (18/6/12), so picks within an
    // idea are always distinct.
    const title = fill(
      QUIZ_TITLE_PATTERNS[(h + 5 * i) % QUIZ_TITLE_PATTERNS.length],
      { niche: niche.value, audience: audience.value },
    );
    const qs: string[] = [];
    for (let q = 0; q < QUESTIONS_PER_IDEA; q++) {
      qs.push(`${q + 1}) ${fill(questions[(h + i + q) % questions.length], { niche: niche.value })}`);
    }
    const rts: string[] = [];
    for (let r = 0; r < RESULTS_PER_IDEA; r++) {
      rts.push(fill(RESULT_TYPES[(h + 7 * i + 5 * r) % RESULT_TYPES.length], { niche: niche.value }));
    }
    rows.push([
      String(i + 1),
      title,
      qs.join(" "),
      rts.join(" • "),
      QUIZ_GOAL_LABELS[goal],
    ]);
  }

  if (notices.length > 0) {
    rows.push(["", `Note: ${notices.join(" ")}`, "", "", ""]);
  }

  return {
    ok: true,
    values: { quizzes: { columns: [...QUIZZES_COLUMNS], rows } },
  };
}
