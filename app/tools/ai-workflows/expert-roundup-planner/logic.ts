/**
 * Expert Roundup Planner (tool-329) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is an OUTREACH PLANNER, not a research tool. It plans YOUR
 * outreach: generic interview-question templates, an empty outreach
 * tracker table (you fill in expert names and contacts), and a fixed
 * follow-up timeline. Expert names, quotes, and contacts are NEVER
 * fabricated by the tool — the tracker rows are numbered slots for you
 * to fill in yourself.
 *
 * Fixed banks (documented here):
 *   - QUESTION_BANK: 6 generic expert-roundup question templates,
 *     clearly labeled "generic — personalize these"
 *   - TIMELINE: 6 fixed milestones with day offsets (Day 0 send invites,
 *     Day 7 follow-up 1, Day 14 follow-up 2, Day 18 deadline, Day 21
 *     assemble draft, Day 24 publish)
 *   - TRACKER_COLUMNS: 7 fixed columns for the outreach tracker table
 *
 * Planner contract: runTool(values) -> { ok, values, error }.
 * values in  = { topic, expertCount, questionSet }
 *   - topic: roundup topic (required text)
 *   - expertCount: number of experts to contact, 3–30 (required)
 *   - questionSet: optional textarea; one custom question per line
 * values out = { questions, outreachTracker, timeline }
 *   - questions:       list — your custom questions first, then the 6
 *                      generic templates labeled for personalization
 *   - outreachTracker: table — one empty numbered row per expert slot
 *   - timeline:        list — fixed follow-up milestones
 * Output ids match meta.ts outputs.
 *
 * Edge cases from the spec: none.
 * Validation from the spec: expertCount 3–30.
 */

export interface TrackerTable {
  columns: string[];
  rows: string[][];
}

export interface RoundupValues {
  questions: string[];
  outreachTracker: TrackerTable;
  timeline: string[];
}

export interface RoundupResult {
  ok: boolean;
  values?: RoundupValues;
  error?: string;
}

export const MIN_EXPERTS = 3;
export const MAX_EXPERTS = 30;

/** 6 generic question templates — labeled for personalization in output. */
export const QUESTION_BANK: string[] = [
  "What is the single biggest mistake people make with this topic, and how can they avoid it?",
  "What is one tactic or strategy that has worked surprisingly well for you recently?",
  "If someone is just getting started, what should they focus on first?",
  "What tool, resource, or habit do you consider essential for success here?",
  "What do most people get wrong about this topic?",
  "Looking ahead, what trend or change should people prepare for?",
];

/** 6 fixed milestones, day offsets relative to invite day. */
const TIMELINE: { day: number; task: string }[] = [
  { day: 0, task: "Send invitations to all experts with your question list." },
  { day: 7, task: "Follow-up 1: politely nudge experts who have not replied." },
  { day: 14, task: "Follow-up 2: final reminder to non-responders." },
  { day: 18, task: "Contribution deadline — close the collection window." },
  { day: 21, task: "Assemble the draft: order quotes, add intros, link each expert." },
  { day: 24, task: "Publish the roundup and notify every contributor." },
];

const TRACKER_COLUMNS = [
  "#",
  "Expert name",
  "Contact (email / handle)",
  "Invite sent",
  "Follow-up 1",
  "Follow-up 2",
  "Response received",
];

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseExpertCount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function parseCustomQuestions(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Build the roundup plan. Deterministic: same inputs always produce the
 * same questions, tracker, and timeline.
 */
export function runTool(values: Record<string, unknown>): RoundupResult {
  const topic = clean(values?.topic);
  if (!topic) {
    return { ok: false, error: "Enter the roundup topic." };
  }

  const count = parseExpertCount(values?.expertCount);
  if (count === null) {
    return {
      ok: false,
      error: `Enter how many experts to contact (a number from ${MIN_EXPERTS} to ${MAX_EXPERTS}).`,
    };
  }
  if (!Number.isInteger(count) || count < MIN_EXPERTS || count > MAX_EXPERTS) {
    return {
      ok: false,
      error: `Expert count must be a whole number from ${MIN_EXPERTS} to ${MAX_EXPERTS} (you entered ${count}).`,
    };
  }

  const customQuestions = parseCustomQuestions(values?.questionSet);

  const questions: string[] = [];
  for (const q of customQuestions) {
    questions.push(q);
  }
  for (const q of QUESTION_BANK) {
    questions.push("[Generic template — personalize it] " + q);
  }

  const rows: string[][] = [];
  for (let i = 1; i <= count; i++) {
    rows.push([String(i), "", "", "", "", "", ""]);
  }

  const timeline = TIMELINE.map(
    (m) => `Day ${m.day}: ${m.task}`,
  );

  return {
    ok: true,
    values: {
      questions,
      outreachTracker: { columns: TRACKER_COLUMNS, rows },
      timeline,
    },
  };
}
