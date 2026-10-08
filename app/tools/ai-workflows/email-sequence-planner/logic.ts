/**
 * Email Sequence Planner — pure logic (zero imports, zero network, zero DOM).
 *
 * Arranges the user's email sequence into a day-by-day send calendar.
 * NO email copy is written — subject lines are fixed template slots with
 * [bracket] placeholders the user fills in, and purposes are fixed slot
 * labels. The tool only does grid arithmetic + bank lookup.
 *
 * Fixed content banks (documented per the BATCH-1 honesty contract):
 * - 4 sequence goals: welcome | nurture | sales | re-engagement
 * - Per goal: 12 fixed "subject slot" template patterns and 12 fixed
 *   "purpose" slot labels (email #1..12). emailCount picks the first N.
 * Total bank: 4 goals x 24 slots = 96 fixed strings.
 *
 * Schedule math: email #i (1-based) is sent on day
 *   1 + round((i - 1) * daysBetween)
 * so daysBetween = 0 sends everything on day 1 and fractional values
 * are rounded to whole days (spec edge case).
 */

export const SEQUENCE_GOALS = [
  "welcome",
  "nurture",
  "sales",
  "re-engagement",
] as const;

export type SequenceGoal = (typeof SEQUENCE_GOALS)[number];

export const MIN_EMAILS = 2;
export const MAX_EMAILS = 12;
export const MIN_GAP = 0;
export const MAX_GAP = 14;
export const SLOTS_PER_GOAL = 12;

interface GoalSlots {
  subjects: string[];
  purposes: string[];
}

/** 96 fixed strings: subject template patterns + purpose labels. */
const SLOTS: Record<SequenceGoal, GoalSlots> = {
  welcome: {
    subjects: [
      "Welcome! Here's your [lead magnet name]",
      "How I got started with [topic]",
      "What to expect from this newsletter",
      "A quick win you can use today",
      "The #1 mistake new [audience] make",
      "[Name] got [result] — here's how",
      "Something I built for you",
      "Your questions, answered",
      "What nobody tells you about [topic]",
      "A special bonus inside",
      "Still deciding? Read this first",
      "Last chance: [offer name] closes soon",
    ],
    purposes: [
      "Deliver the promised lead magnet and say hello",
      "Share your story and why you started",
      "Set expectations for what subscribers will get",
      "Deliver a quick win from your best content",
      "Address the #1 beginner mistake in your niche",
      "Share a customer story or result",
      "Introduce your main offer softly",
      "Answer common questions about your offer",
      "Share behind-the-scenes or a personal lesson",
      "Offer a limited-time bonus or incentive",
      "Address final objections and FAQs",
      "Last call: close the welcome window",
    ],
  },
  nurture: {
    subjects: [
      "Start here: [resource name]",
      "[Concept] explained in 5 minutes",
      "My exact [topic] framework",
      "The myth about [topic] that's costing you",
      "How [name] went from [before] to [after]",
      "My 5 best posts on [topic]",
      "The advanced [topic] tactic nobody shares",
      "A mistake I made (so you don't)",
      "You asked, I answered",
      "7 tools I use every week",
      "Coming next week: [teaser]",
      "Quick question for you",
    ],
    purposes: [
      "Welcome and deliver a valuable free resource",
      "Teach one core concept of your niche",
      "Share your framework or method step by step",
      "Bust a common myth in your niche",
      "Share a case study with real numbers",
      "Curate your best content on one topic",
      "Teach an advanced tactic",
      "Share a personal story with a lesson",
      "Answer reader questions collected from replies",
      "Share a tool or resource roundup",
      "Preview what's coming next",
      "Invite replies and feedback",
    ],
  },
  sales: {
    subjects: [
      "Introducing [offer name]",
      "What [problem] is really costing you",
      "How [offer name] works",
      "[Result] in [timeframe]: [name]'s story",
      "Everything inside [offer name]",
      "“But what if [objection]?”",
      "Too busy? Read this",
      "From [before] to [after]",
      "Plus these bonuses (today only)",
      "My [day]-day guarantee",
      "Final questions, answered",
      "Doors close tonight",
    ],
    purposes: [
      "Announce the offer and the problem it solves",
      "Deepen the problem: the cost of staying stuck",
      "Present the solution and how it works",
      "Show proof: results and testimonials",
      "Detail what's inside the offer",
      "Address the top objection",
      "Address the second objection (time or money)",
      "Share a story of transformation",
      "Stack value: reveal the bonuses",
      "Guarantee and risk reversal",
      "Final FAQ round",
      "Cart close: last call",
    ],
  },
  "re-engagement": {
    subjects: [
      "We miss you, [name]",
      "My most popular post ever",
      "What do you want to read about?",
      "A fresh gift for you",
      "What changed while you were gone",
      "Still interested in [topic]?",
      "One tip, 2 minutes",
      "A comeback offer just for you",
      "See what the community achieved",
      "Stay or go? Your choice",
      "Update your preferences",
      "Goodbye (for now)",
    ],
    purposes: [
      "Say “we miss you” and remind them why they subscribed",
      "Share your single best piece of content",
      "Ask what topics they want more of",
      "Offer a fresh free resource",
      "Share what's new since they've been away",
      "Address why they might have gone quiet",
      "Share a quick win or tip",
      "Make a special comeback offer",
      "Share social proof or community wins",
      "Give a final choice: stay or go",
      "Confirm their preferences",
      "Farewell and an easy rejoin path",
    ],
  },
};

export const SCHEDULE_COLUMNS = ["Email #", "Send day", "Subject slot", "Purpose"] as const;

function isGoal(v: unknown): v is SequenceGoal {
  return typeof v === "string" && (SEQUENCE_GOALS as readonly string[]).includes(v);
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim().length > 0) {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Tool logic slot (planner). Returns a send-calendar grid:
 * values.schedule = { columns, rows } (table kind), values.summary = text.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please provide your inputs first." };
  }

  const goal = values["sequenceGoal"];
  if (!isGoal(goal)) {
    return {
      ok: false,
      error: `Choose a sequence goal: ${SEQUENCE_GOALS.join(", ")}.`,
    };
  }

  const countRaw = toNumber(values["emailCount"]);
  if (countRaw === null) {
    return { ok: false, error: "Enter how many emails are in the sequence." };
  }
  const emailCount = Math.round(countRaw);
  if (emailCount < MIN_EMAILS || emailCount > MAX_EMAILS) {
    return {
      ok: false,
      error: `Email count must be between ${MIN_EMAILS} and ${MAX_EMAILS}.`,
    };
  }

  const gapRaw = toNumber(values["daysBetween"]);
  if (gapRaw === null) {
    return { ok: false, error: "Enter the days between emails (0–14)." };
  }
  const daysBetween = Math.round(gapRaw); // spec edge case: fractional days rounded
  if (daysBetween < MIN_GAP || daysBetween > MAX_GAP) {
    return {
      ok: false,
      error: `Days between emails must be between ${MIN_GAP} and ${MAX_GAP}.`,
    };
  }

  const slots = SLOTS[goal];
  const rows: string[][] = [];
  for (let i = 1; i <= emailCount; i++) {
    const sendDay = 1 + Math.round((i - 1) * daysBetween);
    rows.push([
      String(i),
      `Day ${sendDay}`,
      slots.subjects[i - 1],
      slots.purposes[i - 1],
    ]);
  }

  const totalDays = 1 + (emailCount - 1) * daysBetween;
  const summary =
    `${emailCount}-email ${goal} sequence, ` +
    (daysBetween === 0
      ? "all sent on day 1."
      : `one email every ${daysBetween} day${daysBetween === 1 ? "" : "s"}, finishing on day ${totalDays}.`);

  return {
    ok: true,
    values: {
      schedule: { columns: [...SCHEDULE_COLUMNS], rows },
      summary,
    },
  };
}
