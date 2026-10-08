/**
 * Story Quiz Generator — pure logic (tool-222), zero imports, zero network,
 * zero DOM, zero randomness.
 *
 * TEMPLATE BANK, NOT AI: assembles Instagram Story quiz ideas from a fixed,
 * hand-written bank of 8 quiz templates. Each template is a multiple-choice
 * question about the user's topic with 4 options, a marked correct answer,
 * and a one-line explanation. The tool returns the first `count` templates
 * in bank order (count 1–5, bank has 8, so nothing repeats) and inserts the
 * topic verbatim.
 *
 * HONESTY NOTE: the "correct" answers are common-sense defaults (consistency
 * beats intensity, start small, track progress…) — not verified facts about
 * the topic. They are meant as engagement prompts; the methodology and
 * assumptions state this plainly.
 *
 * Placeholders: {topic} = the user's topic, trimmed.
 *
 * Bank sizes: 8 quiz templates x 4 options each = 32 option strings.
 */

export interface StoryQuiz {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

/** Fixed quiz bank: 8 entries. correctIndex is 0-based into options. */
const QUIZ_BANK: StoryQuiz[] = [
  {
    question: "How often should you practice {topic} to see real progress?",
    options: ["Once a month", "Only when you feel motivated", "A little every day", "One big session a year"],
    correctIndex: 2,
    explanation: "Consistency beats intensity — short daily reps compound over time.",
  },
  {
    question: "What's the smartest way to start with {topic}?",
    options: ["Buy the most expensive gear first", "Learn the basics and start small", "Wait until you feel ready", "Copy whatever is trending"],
    correctIndex: 1,
    explanation: "Mastering the basics first keeps you from quitting early.",
  },
  {
    question: "You hit a plateau with {topic}. What should you do?",
    options: ["Quit and try something else", "Change one variable and keep going", "Do twice as much of the same thing", "Wait for motivation to return"],
    correctIndex: 1,
    explanation: "Plateaus break when you adjust one thing and stay consistent.",
  },
  {
    question: "Which habit helps most with {topic}?",
    options: ["Tracking your progress", "Talking about it online", "Waiting for inspiration", "Comparing yourself to experts"],
    correctIndex: 0,
    explanation: "What gets measured gets improved — tracking keeps you honest.",
  },
  {
    question: "What's the biggest beginner mistake with {topic}?",
    options: ["Starting too small", "Trying to be perfect from day one", "Asking for feedback", "Keeping things simple"],
    correctIndex: 1,
    explanation: "Perfectionism kills momentum — done beats perfect while learning.",
  },
  {
    question: "How do experts actually get good at {topic}?",
    options: ["Natural talent", "Years of deliberate practice", "Pure luck", "The right app"],
    correctIndex: 1,
    explanation: "Deliberate, repeated practice is the boring secret behind every expert.",
  },
  {
    question: "What's the best first goal for {topic}?",
    options: ["Go viral in week one", "A tiny goal you can't fail", "Beat everyone else", "Master everything at once"],
    correctIndex: 1,
    explanation: "Small wins build the streak; streaks build the skill.",
  },
  {
    question: "When should you share your {topic} progress?",
    options: ["Only when it's perfect", "Never — keep it secret", "Early and often", "After one full year"],
    correctIndex: 2,
    explanation: "Sharing early gets you feedback while you can still use it.",
  },
];

export const BANK_SIZES = {
  quizTemplates: QUIZ_BANK.length, // 8
  optionsPerQuiz: 4,
  minCount: 1,
  maxCount: 5,
};

export const ASSUMPTIONS: string[] = [
  "Quizzes are assembled from 8 hand-written templates, not AI generation.",
  "Correct answers are common-sense defaults (start small, stay consistent, track progress) — not verified facts about your topic. Review and adapt them before posting.",
  "The same topic and count always produce the same quizzes (templates are taken in bank order).",
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
 * Generate story quiz ideas. Errors: missing/empty topic; count (when
 * provided) not an integer in 1–5. Never throws.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const rawTopic = values["topic"];
  if (typeof rawTopic !== "string" || rawTopic.trim().length === 0) {
    return {
      ok: false,
      error: "Please enter a topic first — e.g. “email marketing”, “sourdough baking”.",
    };
  }
  const topic = rawTopic.trim();

  let count = 3; // default when not provided
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

  const quizzes = QUIZ_BANK.slice(0, count).map((q) => ({
    question: fill(q.question, topic),
    options: q.options.map((o) => fill(o, topic)) as [string, string, string, string],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  }));

  const table = {
    columns: ["Question", "Options (A–D)", "Correct answer", "Why"],
    rows: quizzes.map((q) => [
      q.question,
      q.options.map((o, i) => `${"ABCD"[i]}) ${o}`).join("  "),
      `${"ABCD"[q.correctIndex]}) ${q.options[q.correctIndex]}`,
      q.explanation,
    ]),
  };

  const copyAll = quizzes
    .map((q, i) => {
      const opts = q.options.map((o, j) => `   ${"ABCD"[j]}) ${o}`).join("\n");
      return `${i + 1}. ${q.question}\n${opts}\n   Correct: ${"ABCD"[q.correctIndex]} — ${q.explanation}`;
    })
    .join("\n\n");

  return {
    ok: true,
    values: {
      quizzes: table,
      copyAll,
      quizCount: count,
    },
  };
}
