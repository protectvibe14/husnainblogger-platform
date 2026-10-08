/**
 * CTA Text Generator — pure logic (tool-212), zero imports, zero network,
 * zero DOM.
 *
 * TEMPLATE BANK, NOT AI: call-to-action lines are assembled from a fixed
 * library of hand-written CTA formulas, one bank per engagement goal.
 *
 * Goals (fixed list, 6):
 *   comment — drive comments
 *   save    — drive saves
 *   share   — drive shares / sends
 *   dm      — drive DMs
 *   link    — drive link-in-bio / link clicks
 *   follow  — drive follows
 *
 * Template banks: 6 templates per goal = 36 total. Each template contains
 * exactly one {thing} slot, filled with "this <topic> post" when a topic is
 * given, or "this post" when it is not. Deterministic: the same
 * (goal, topic, count) always returns the same CTAs in the same order;
 * requests for more than 6 cycle the bank in order.
 */

export type CtaGoal = "comment" | "save" | "share" | "dm" | "link" | "follow";

/** The six supported goals, in canonical order. */
export const CTA_GOALS: CtaGoal[] = ["comment", "save", "share", "dm", "link", "follow"];

export const GOAL_LABELS: Record<CtaGoal, string> = {
  comment: "Comments",
  save: "Saves",
  share: "Shares",
  dm: "DMs",
  link: "Link clicks",
  follow: "Follows",
};

/** Count bounds for one run. */
export const MIN_COUNT = 1;
export const MAX_COUNT = 10;

/** CTA formulas per goal — 6 each (36 total). {thing} = "this <topic> post" or "this post". */
const CTA_BANK: Record<CtaGoal, string[]> = {
  comment: [
    "Drop a 🔥 in the comments if {thing} helped you.",
    "Which tip from {thing} are you trying first? Tell me below.",
    "Comment \"YES\" if you agree with {thing}.",
    "Got a question about {thing}? Ask me in the comments — I reply to all.",
    "Tag someone who needs to see {thing}.",
    "Be honest — did {thing} change how you see this? Comment below.",
  ],
  save: [
    "Save {thing} so you can come back to it later.",
    "Hit save on {thing} — future you will thank you.",
    "This one is worth saving: bookmark {thing} for later.",
    "Save {thing} and send it to your future self.",
    "Don't lose this — save {thing} before you scroll on.",
    "Your reminder to save {thing} for when you need it most.",
  ],
  share: [
    "Share {thing} with someone who needs this today.",
    "Know someone struggling with this? Send them {thing}.",
    "If {thing} helped you, share it to your story.",
    "One share of {thing} could make someone's day — pass it on.",
    "Send {thing} to the group chat. They'll thank you.",
    "Sharing {thing} takes 2 seconds and helps more than you know.",
  ],
  dm: [
    "DM me \"START\" and I'll walk you through {thing} personally.",
    "Want the full breakdown behind {thing}? DM me \"GUIDE\".",
    "DM me your biggest question about {thing} — I answer every message.",
    "Curious how {thing} applies to you? DM me and let's talk.",
    "Send me a DM with the word \"HELP\" and I'll send you the {thing} checklist.",
    "My DMs are open — message me about {thing} anytime.",
  ],
  link: [
    "Tap the link in my bio to go deeper on {thing}.",
    "The full guide behind {thing} is linked in my bio — grab it.",
    "Link in bio: everything I couldn't fit into {thing}.",
    "Want more on {thing}? The link in my bio has you covered.",
    "I put the resources from {thing} at the link in my bio.",
    "Start with {thing}, then tap the link in bio for the next step.",
  ],
  follow: [
    "Follow for more posts like {thing} every week.",
    "If {thing} was useful, follow — there's plenty more coming.",
    "Hit follow so you never miss a post like {thing}.",
    "Follow along for daily tips on the topics in {thing}.",
    "New here? {thing} is what I do — follow for more.",
    "Follow me and turn on notifications for more of {thing}.",
  ],
};

export const BANK_SIZES = {
  templatesPerGoal: CTA_BANK.comment.length,
  goals: CTA_GOALS.length,
  total:
    CTA_BANK.comment.length * CTA_GOALS.length,
};

export const ASSUMPTIONS: string[] = [
  "CTAs come from 36 hand-written formulas (6 per goal), not AI generation.",
  "Requests for more than 6 CTAs cycle the goal's bank in order.",
  "CTAs are starting points — adapt the wording to your voice before posting.",
];

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isCtaGoal(s: string): s is CtaGoal {
  return (CTA_GOALS as string[]).includes(s);
}

function parseCount(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === "") return 5; // default
  const n = typeof raw === "string" ? Number(raw.trim()) : raw;
  if (typeof n !== "number" || !Number.isInteger(n) || n < MIN_COUNT || n > MAX_COUNT) {
    return null;
  }
  return n;
}

/**
 * Fill the {thing} slot: "this <topic> post" when a topic is given,
 * otherwise "this post".
 */
function fillThing(template: string, topic: string): string {
  const thing = topic === "" ? "this post" : `this ${topic} post`;
  return template.replaceAll("{thing}", thing);
}

/**
 * Generate CTA lines. Returns { ok: false, error } for: missing/unknown
 * goal, non-integer count outside 1–10. Topic is optional.
 */
export function generateCtas(
  goal: string,
  topic: string | undefined,
  count: unknown
): { ctas: string[]; goal: CtaGoal; topic: string; count: number } {
  if (typeof goal !== "string" || !isCtaGoal(goal)) {
    throw new Error(
      `goal must be one of: ${CTA_GOALS.join(", ")}.`
    );
  }
  const cleanTopic = typeof topic === "string" ? topic.trim() : "";
  const n = parseCount(count);
  if (n === null) {
    throw new Error(`count must be a whole number between ${MIN_COUNT} and ${MAX_COUNT}.`);
  }
  const bank = CTA_BANK[goal];
  const ctas: string[] = [];
  for (let i = 0; i < n; i++) {
    ctas.push(fillThing(bank[i % bank.length], cleanTopic));
  }
  return { ctas, goal, topic: cleanTopic, count: n };
}

/**
 * Contract adapter for the mountToolUI generator template.
 * Values keys: ctas, copyAll, bankSizes (match meta.ts output ids).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please choose an engagement goal first." };
  }
  try {
    const result = generateCtas(
      values["goal"] as string,
      values["topic"] as string | undefined,
      values["count"]
    );
    return {
      ok: true,
      values: {
        ctas: result.ctas,
        copyAll: result.ctas.join("\n"),
        bankSizes: { ...BANK_SIZES },
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
