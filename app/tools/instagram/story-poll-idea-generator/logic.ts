/**
 * Story Poll Idea Generator — pure logic (tool-221), zero imports, zero
 * network, zero DOM, zero randomness.
 *
 * TEMPLATE BANK, NOT AI: assembles Instagram Story poll ideas from a fixed,
 * hand-written bank of 12 poll templates. Each template pairs a poll
 * question with two answer options that fit that question. The tool takes
 * the first `count` templates in bank order (count 1–10, bank has 12, so
 * nothing repeats or cycles) and inserts the user's topic verbatim.
 *
 * Placeholders: {topic} = the user's topic, trimmed.
 *
 * Bank sizes: 12 question templates + 12 matched option pairs = 24 bank
 * entries total. Documented in BANK_SIZES and echoed in the result so the
 * UI can state them honestly.
 */

export interface StoryPoll {
  question: string;
  optionA: string;
  optionB: string;
}

/** Fixed poll bank: 12 entries, each = question + its matched option pair. */
const POLL_BANK: StoryPoll[] = [
  { question: "Have you ever tried {topic}?", optionA: "Yes, love it", optionB: "Not yet" },
  { question: "Is {topic} worth the hype?", optionA: "Totally worth it", optionB: "Overhyped" },
  { question: "How do you feel about {topic}?", optionA: "Obsessed", optionB: "Not for me" },
  { question: "When it comes to {topic}, which are you?", optionA: "Beginner", optionB: "Pro" },
  { question: "Do you think {topic} is overrated?", optionA: "Agree", optionB: "Disagree" },
  { question: "Is {topic} part of your daily routine?", optionA: "Every day", optionB: "Someday" },
  { question: "Have you recommended {topic} to a friend?", optionA: "Already did", optionB: "Not yet" },
  { question: "Would you pay for premium {topic}?", optionA: "Yes please", optionB: "Hard pass" },
  { question: "Is {topic} a priority for you this month?", optionA: "Top priority", optionB: "Not really" },
  { question: "Be honest: do you actually do {topic}?", optionA: "Guilty", optionB: "Working on it" },
  { question: "Team {topic}: which side are you on?", optionA: "Team A", optionB: "Team B" },
  { question: "How do you learn about {topic} best?", optionA: "Reels", optionB: "Carousels" },
];

export const BANK_SIZES = {
  pollTemplates: POLL_BANK.length, // 12
  minCount: 1,
  maxCount: 10,
};

export const ASSUMPTIONS: string[] = [
  "Polls are assembled from 12 hand-written templates, not AI generation — wording is fixed and the topic is inserted verbatim.",
  "The first `count` templates are returned in bank order, so the same topic and count always produce the same polls.",
  "Poll ideas are starting points — adapt the wording to your voice and audience before posting.",
];

function fill(template: string, topic: string): string {
  return template.replaceAll("{topic}", topic);
}

function toInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isInteger(n)) return n;
  }
  return null;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Generate story poll ideas. Errors: missing/empty topic; count (when
 * provided) not an integer in 1–10. Never throws.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const rawTopic = values["topic"];
  if (typeof rawTopic !== "string" || rawTopic.trim().length === 0) {
    return {
      ok: false,
      error: "Please enter a topic first — e.g. “morning routines”, “home workouts”.",
    };
  }
  const topic = rawTopic.trim();

  let count = 5; // default when not provided
  if (values["count"] !== undefined && values["count"] !== null && values["count"] !== "") {
    const parsed = toInteger(values["count"]);
    if (parsed === null || parsed < BANK_SIZES.minCount || parsed > BANK_SIZES.maxCount) {
      return {
        ok: false,
        error: `Count must be a whole number between ${BANK_SIZES.minCount} and ${BANK_SIZES.maxCount}.`,
      };
    }
    count = parsed;
  }

  const polls: StoryPoll[] = POLL_BANK.slice(0, count).map((p) => ({
    question: fill(p.question, topic),
    optionA: fill(p.optionA, topic),
    optionB: fill(p.optionB, topic),
  }));

  const table = {
    columns: ["Question", "Option A", "Option B"],
    rows: polls.map((p) => [p.question, p.optionA, p.optionB]),
  };

  const copyAll = polls
    .map((p, i) => `${i + 1}. ${p.question}\n   A) ${p.optionA}   B) ${p.optionB}`)
    .join("\n\n");

  return {
    ok: true,
    values: {
      polls: table,
      copyAll,
      pollCount: count,
    },
  };
}
