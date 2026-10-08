/**
 * Email Funnel Mapper — pure logic (tool-435).
 *
 * WHAT THIS IS (honesty, enforced):
 * - Pure client-side deterministic PLANNER that produces a funnel DATA
 *   MODEL (stages, triggers, email purposes, day offsets). Visual
 *   rendering is the MA1 component's concern; this file defines the
 *   data contract only.
 * - Fixed data: 4 funnel goals (welcome|nurture|sales|winback), each
 *   with a FIXED 7-stage map of {stage, trigger, goal}. The tool takes
 *   the first `stageCount` stages. Each goal also has a fixed bank of
 *   email purposes; per-stage emails cycle through the bank in order.
 * - Day offsets are a fixed scheduling formula: stage i starts on day
 *   (i * STAGE_GAP_DAYS), emails within a stage are 2 days apart.
 *   These offsets are SUGGESTIONS (estimates), not proven-optimal
 *   send times — cadence depends on your audience and list health.
 * - No AI, no network, no backend. Same inputs → same funnel map.
 *
 * Edge-case handling (shared validation rules):
 * - stageCount clamped to 3-7, emailsPerStage clamped to 1-5 (documented
 *   ranges); non-finite numbers rejected with a human error.
 * - No free text beyond validation of enums, so no sanitization risk;
 *   goal enum is strictly validated.
 */

export type FunnelGoal = "welcome" | "nurture" | "sales" | "winback";

export const FUNNEL_GOALS: readonly FunnelGoal[] = [
  "welcome",
  "nurture",
  "sales",
  "winback",
];

/** Documented ranges. */
export const MIN_STAGES = 3;
export const MAX_STAGES = 7;
export const MIN_EMAILS_PER_STAGE = 1;
export const MAX_EMAILS_PER_STAGE = 5;

/**
 * Fixed scheduling formula: stage i starts on day (i * STAGE_GAP_DAYS);
 * emails inside one stage are EMAILS_GAP_DAYS apart. Labeled as an
 * estimate — adjust to your audience.
 */
export const STAGE_GAP_DAYS = 4;
export const EMAILS_GAP_DAYS = 2;

export interface StageSpec {
  stage: string;
  trigger: string;
  goal: string;
}

/**
 * Fixed 7-stage maps, one per goal. The tool takes the first
 * `stageCount` entries. Hand-defined, not AI-generated.
 */
export const STAGE_MAPS: Record<FunnelGoal, readonly StageSpec[]> = {
  welcome: [
    { stage: "Welcome", trigger: "New subscriber joins the list", goal: "Confirm subscription and set expectations" },
    { stage: "Introduction", trigger: "1 email after welcome", goal: "Introduce who you are and what you send" },
    { stage: "Best content", trigger: "Subscriber opens an email", goal: "Share your most popular posts and resources" },
    { stage: "Story", trigger: "No purchase yet", goal: "Build trust with your personal story" },
    { stage: "Quick win", trigger: "Subscriber clicks a link", goal: "Deliver one small, fast result" },
    { stage: "Social proof", trigger: "Subscriber stays engaged", goal: "Show testimonials and reader results" },
    { stage: "Soft offer", trigger: "End of welcome series", goal: "Introduce your main offer gently" },
  ],
  nurture: [
    { stage: "Value delivery", trigger: "Subscriber enters nurture segment", goal: "Send genuinely useful content" },
    { stage: "Education", trigger: "Opens value email", goal: "Teach one core concept deeply" },
    { stage: "Case study", trigger: "Clicks education email", goal: "Show a real before/after example" },
    { stage: "Objection handling", trigger: "Stays subscribed 2+ weeks", goal: "Answer the top 3 reader doubts" },
    { stage: "Community", trigger: "Replies or clicks", goal: "Invite into your community or comments" },
    { stage: "Authority", trigger: "Engages with community invite", goal: "Share data, research, or unique takes" },
    { stage: "Bridge", trigger: "Ready-to-buy signals", goal: "Transition toward a sales conversation" },
  ],
  sales: [
    { stage: "Problem agitation", trigger: "Subscriber enters sales segment", goal: "Name the painful problem clearly" },
    { stage: "Solution reveal", trigger: "Opens problem email", goal: "Present your offer as the solution" },
    { stage: "Offer details", trigger: "Clicks solution email", goal: "Explain exactly what they get" },
    { stage: "Testimonials", trigger: "Views offer page", goal: "Prove results with customer stories" },
    { stage: "Objections", trigger: "No purchase after 3 days", goal: "Handle price and risk objections" },
    { stage: "Urgency", trigger: "Cart or checkout started", goal: "Add an honest deadline or bonus" },
    { stage: "Last call", trigger: "Deadline approaching", goal: "Final reminder before the offer closes" },
  ],
  winback: [
    { stage: "We miss you", trigger: "No opens for 30 days", goal: "Acknowledge their absence warmly" },
    { stage: "What's new", trigger: "No response to first email", goal: "Show what changed since they left" },
    { stage: "Feedback ask", trigger: "Still inactive", goal: "Ask one simple question about why they left" },
    { stage: "Best-of recap", trigger: "No reply to feedback ask", goal: "Resurface your best recent content" },
    { stage: "Special offer", trigger: "Opens but doesn't click", goal: "Give a genuine reason to return" },
    { stage: "Preference check", trigger: "Still inactive", goal: "Offer fewer emails instead of none" },
    { stage: "Goodbye", trigger: "No engagement after full series", goal: "Clean removal with a kind goodbye" },
  ],
};

/** Fixed email-purpose banks, one per goal. NOT AI-generated. */
export const EMAIL_PURPOSES: Record<FunnelGoal, readonly string[]> = {
  welcome: [
    "Confirm the subscription and deliver the promised lead magnet",
    "Introduce yourself and set email expectations",
    "Share your 3 most-read posts",
    "Tell your origin story",
    "Deliver one quick win the reader can use today",
    "Share reader testimonials",
    "Make a soft, relevant offer",
  ],
  nurture: [
    "Send one genuinely useful tip",
    "Teach a core concept with an example",
    "Share a reader case study",
    "Answer the most common reader objection",
    "Invite a reply or comment",
    "Share an original insight or data point",
    "Offer a helpful resource roundup",
  ],
  sales: [
    "Describe the problem in the reader's own words",
    "Reveal your offer as the solution",
    "Break down exactly what's included",
    "Share 2-3 customer success stories",
    "Address the top price and risk objections",
    "Announce the deadline or expiring bonus honestly",
    "Send the final last-call reminder",
  ],
  winback: [
    "Say you noticed they've been away",
    "Highlight 3 things they missed",
    "Ask why they stopped opening (one question)",
    "Share your best content from the last month",
    "Offer a genuine incentive to return",
    "Let them choose a lower email frequency",
    "Say goodbye kindly and remove them",
  ],
};

export interface FunnelEmail {
  purpose: string;
  /** Suggested send day, counted from funnel start (day 0). An estimate. */
  dayOffset: number;
}

export interface FunnelStage {
  stage: string;
  trigger: string;
  emails: FunnelEmail[];
  goal: string;
}

export interface FunnelResult {
  funnelMap: FunnelStage[];
  summaryText: string;
}

function clampCount(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.floor(n)));
}

export function mapFunnel(
  funnelGoal: string,
  stageCount: number,
  emailsPerStage: number,
): FunnelResult {
  if (!FUNNEL_GOALS.includes(funnelGoal as FunnelGoal)) {
    throw new RangeError(`funnelGoal must be one of: ${FUNNEL_GOALS.join(", ")}.`);
  }
  if (typeof stageCount !== "number" || !Number.isFinite(stageCount)) {
    throw new RangeError("stageCount must be a finite number.");
  }
  if (typeof emailsPerStage !== "number" || !Number.isFinite(emailsPerStage)) {
    throw new RangeError("emailsPerStage must be a finite number.");
  }

  const goal = funnelGoal as FunnelGoal;
  const stages = clampCount(stageCount, MIN_STAGES, MAX_STAGES);
  const perStage = clampCount(emailsPerStage, MIN_EMAILS_PER_STAGE, MAX_EMAILS_PER_STAGE);

  const specs = STAGE_MAPS[goal];
  const purposes = EMAIL_PURPOSES[goal];

  const funnelMap: FunnelStage[] = [];
  for (let i = 0; i < stages; i++) {
    const spec = specs[i];
    const emails: FunnelEmail[] = [];
    for (let j = 0; j < perStage; j++) {
      emails.push({
        purpose: purposes[(i * perStage + j) % purposes.length],
        dayOffset: i * STAGE_GAP_DAYS + j * EMAILS_GAP_DAYS,
      });
    }
    funnelMap.push({ stage: spec.stage, trigger: spec.trigger, emails, goal: spec.goal });
  }

  const totalEmails = stages * perStage;
  const lastDay = (stages - 1) * STAGE_GAP_DAYS + (perStage - 1) * EMAILS_GAP_DAYS;
  const summaryText =
    `Your ${goal} funnel has ${stages} stages and ${totalEmails} emails ` +
    `over an estimated ${lastDay} days (day offsets are suggestions, not proven-optimal timing). ` +
    `Start: "${specs[0].stage}" (trigger: ${specs[0].trigger}). ` +
    `End: "${specs[stages - 1].stage}" (goal: ${specs[stages - 1].goal}).`;

  return { funnelMap, summaryText };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * mountToolUI contract: runTool(values) -> { ok, values?, error? }.
 * values in:  { funnelGoal, stageCount, emailsPerStage }
 * values out: { funnelMap[], summaryText }
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const { funnelGoal, stageCount, emailsPerStage } = values;

  if (typeof funnelGoal !== "string" || !FUNNEL_GOALS.includes(funnelGoal as FunnelGoal)) {
    return { ok: false, error: `Please choose a funnel goal: ${FUNNEL_GOALS.join(", ")}.` };
  }
  if (typeof stageCount !== "number" || !Number.isFinite(stageCount)) {
    return { ok: false, error: `Please enter the number of stages (${MIN_STAGES}–${MAX_STAGES}).` };
  }
  if (typeof emailsPerStage !== "number" || !Number.isFinite(emailsPerStage)) {
    return { ok: false, error: `Please enter emails per stage (${MIN_EMAILS_PER_STAGE}–${MAX_EMAILS_PER_STAGE}).` };
  }

  let result: FunnelResult;
  try {
    result = mapFunnel(funnelGoal, stageCount, emailsPerStage);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not map your email funnel.",
    };
  }

  return {
    ok: true,
    values: {
      funnelMap: result.funnelMap,
      summaryText: result.summaryText,
    },
  };
}
