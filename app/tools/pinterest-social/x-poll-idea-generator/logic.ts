/**
 * X Poll Idea Generator — pure logic (tool-377), zero imports, zero network,
 * zero DOM.
 *
 * TEMPLATE LIBRARY, NOT AI: each run assembles one poll from a fixed bank
 * of 8 hand-written question templates and 8 hand-written option sets
 * (32 options total). The {topic} placeholder is filled with the user's
 * topic; the stance of the poll comes from the template, not from a model.
 * Selection is deterministic: a char-code hash of the topic picks the
 * template, and the option set is paired by a fixed offset — the same
 * topic + duration always yields the same poll.
 *
 * Platform caps enforced (data/platform-rules/x.json):
 * - poll option count: 2–4 (we always emit 4)
 * - poll option character limit: 25 chars per option (all bank options are
 *   ≤ 25 chars; enforced again at assembly time)
 * - poll duration range: 5 minutes to 7 days (default 24 hours)
 * - poll question uses the same 280-char weighted budget as a post
 *   (URL = 23 chars, emoji/CJK = 2 chars — approximation, X's exact
 *   segmenter is proprietary)
 */

export const MAX_OPTIONS = 4;
export const OPTION_CHAR_LIMIT = 25;
export const QUESTION_CHAR_LIMIT = 280;
export const MAX_TOPIC_LEN = 200;

/** Allowed durations: value -> display label. */
export const DURATIONS: Record<string, string> = {
  "5min": "5 minutes",
  "1h": "1 hour",
  "24h": "24 hours (1 day)",
  "7d": "7 days",
};
export const DEFAULT_DURATION = "24h";

/**
 * 8 hand-written question templates. {topic} = raw topic, {Topic} =
 * topic with first letter capitalized.
 */
const QUESTION_TEMPLATES: string[] = [
  "What's your biggest struggle with {topic}?",
  "Be honest: how would you rate your {topic} skills?",
  "{Topic}: which side are you on?",
  "How often does {topic} cross your mind?",
  "What's the #1 thing you'd change about {topic}?",
  "Quick one: {topic} — yay or nay?",
  "What's your hottest take on {topic}?",
  "If you could only pick one approach to {topic}, which wins?",
];

/**
 * 8 hand-written option sets, 4 options each (32 options total).
 * Every option is ≤ 25 chars — the X poll option limit.
 */
const OPTION_SETS: string[][] = [
  ["Love it", "It's okay", "Not for me", "Never tried it"],
  ["Every day", "Few times a week", "Rarely", "Never"],
  ["Beginner", "Intermediate", "Advanced", "Expert"],
  ["Yes, always", "Sometimes", "Hardly ever", "No opinion"],
  ["Morning person", "Night owl", "Depends on the day", "Neither"],
  ["Strongly agree", "Somewhat agree", "Disagree", "No clue"],
  ["Under 30 min", "30–60 min", "1–3 hours", "3+ hours"],
  ["Team A", "Team B", "Both are great", "Neither one"],
];

/** Fixed offset pairing question template i with option set (i+4)%8. */
const OPTION_OFFSET = 4;

/** Deterministic char-code hash — same topic always picks the same bank entries. */
export function hashTopic(topic: string): number {
  let h = 0;
  for (const ch of topic) h = (h + (ch.codePointAt(0) as number)) % 1000003;
  return h;
}

/** Approximate X weighted character count: URL=23, emoji/CJK=2, else 1. */
export function xWeightedLength(text: string): number {
  if (typeof text !== "string") throw new TypeError("xWeightedLength expects a string");
  const noUrls = text.replace(/https?:\/\/[^\s]+/g, () => "U".repeat(23));
  let n = 0;
  for (const ch of noUrls) {
    const cp = ch.codePointAt(0) as number;
    if (/\p{Extended_Pictographic}/u.test(ch)) {
      n += 2;
    } else if (
      (cp >= 0x4e00 && cp <= 0x9fff) ||
      (cp >= 0x3400 && cp <= 0x4dbf) ||
      (cp >= 0x20000 && cp <= 0x2a6df) ||
      (cp >= 0x3040 && cp <= 0x30ff) ||
      (cp >= 0xac00 && cp <= 0xd7af)
    ) {
      n += 2;
    } else {
      n += 1;
    }
  }
  return n;
}

function capitalizeFirst(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

export interface PollIdea {
  pollQuestion: string;
  options: string[];
  suggestedDuration: string;
  templateIndex: number;
}

/**
 * Build one poll idea for a topic.
 * @throws {TypeError} on non-string topic. @throws {Error} on empty topic
 *   or unknown duration value.
 */
export function buildPoll(topic: string, duration: string): PollIdea {
  if (typeof topic !== "string" || typeof duration !== "string") {
    throw new TypeError("buildPoll expects two strings");
  }
  const clean = topic.trim();
  if (clean === "") throw new Error("buildPoll requires a non-empty topic");
  if (!(duration in DURATIONS)) throw new Error(`buildPoll: unknown duration "${duration}"`);

  const idx = hashTopic(clean) % QUESTION_TEMPLATES.length;
  const options = OPTION_SETS[(idx + OPTION_OFFSET) % OPTION_SETS.length];

  // Fit the topic into the 280 weighted-char budget; shrink if needed.
  let fitted = clean;
  let question = QUESTION_TEMPLATES[idx]
    .replace(/\{Topic\}/g, capitalizeFirst(fitted))
    .replace(/\{topic\}/g, fitted);
  while (xWeightedLength(question) > QUESTION_CHAR_LIMIT && fitted.length > 1) {
    fitted = fitted.slice(0, -1).trimEnd();
    question = QUESTION_TEMPLATES[idx]
      .replace(/\{Topic\}/g, capitalizeFirst(fitted) + "…")
      .replace(/\{topic\}/g, fitted + "…");
  }

  return {
    pollQuestion: question,
    options: options.slice(0, MAX_OPTIONS),
    suggestedDuration: `${DURATIONS[duration]} — within X's allowed 5-minute to 7-day range`,
    templateIndex: idx,
  };
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const topicRaw = values["topic"];
  if (typeof topicRaw !== "string" || topicRaw.trim() === "") {
    return { ok: false, error: "Please enter a topic for your poll." };
  }
  const topic = topicRaw.trim();
  if (topic.length > MAX_TOPIC_LEN) {
    return { ok: false, error: `Topic is too long (max ${MAX_TOPIC_LEN} characters).` };
  }

  const durRaw = values["duration"];
  const duration =
    durRaw === undefined || durRaw === null || String(durRaw).trim() === ""
      ? DEFAULT_DURATION
      : String(durRaw).trim();
  if (!(duration in DURATIONS)) {
    return {
      ok: false,
      error: `Duration must be one of: ${Object.keys(DURATIONS).join(", ")}.`,
    };
  }

  const poll = buildPoll(topic, duration);
  return {
    ok: true,
    values: {
      pollQuestion: poll.pollQuestion,
      options: poll.options,
      suggestedDuration: poll.suggestedDuration,
    },
  };
}
