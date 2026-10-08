/**
 * Discovery Call Question Generator (tool-490) — pure engine.
 * Zero imports, zero network, zero DOM, zero randomness.
 *
 * HONESTY: this is a CURATED QUESTION BANK filtered by the user's
 * selections — no AI, no generation. Fixed questions are grouped into 5
 * categories; the call goal picks which groups are included. "{service}"
 * placeholders are replaced with the chosen service type (template fill,
 * not generation).
 *
 * QUESTION BANK: 29 fixed questions in 5 groups.
 *   rapport   — 5 questions (breaking the ice)
 *   needs     — 8 questions (what they want; 2 use the {service} fill)
 *   budget    — 6 questions (money and approval)
 *   timeline  — 5 questions (schedule and urgency)
 *   decision  — 5 questions (who decides, what happens next)
 *
 * CALL GOALS (fixed group subsets, deterministic order):
 *   qualify — "Is this client a fit?"      -> rapport + needs + budget            (19 questions)
 *   scope   — "What will the project take?" -> rapport + needs + timeline          (18 questions)
 *   close   — "Can we agree and start?"     -> rapport + needs + budget + timeline + decision (29 questions)
 */

export interface DiscoveryCallResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** 10 fixed service options for the serviceType select. */
export const SERVICE_TYPES: string[] = [
  "Web design",
  "Copywriting",
  "Video editing",
  "Social media management",
  "Brand & logo design",
  "SEO",
  "Email marketing",
  "Virtual assistance",
  "UGC creation",
  "Other / general freelancing",
];

export const CALL_GOALS = ["qualify", "scope", "close"] as const;
export type CallGoal = (typeof CALL_GOALS)[number];

const GOAL_LABELS: Record<CallGoal, string> = {
  qualify: "Is this client a fit?",
  scope: "What will the project take?",
  close: "Can we agree and start?",
};

export const GROUPS = ["rapport", "needs", "budget", "timeline", "decision"] as const;
export type QuestionGroup = (typeof GROUPS)[number];

const GROUP_LABELS: Record<QuestionGroup, string> = {
  rapport: "Rapport",
  needs: "Needs",
  budget: "Budget",
  timeline: "Timeline",
  decision: "Decision",
};

/** Fixed question bank: 29 questions. "{service}" is filled with the service type. */
export const QUESTION_BANK: Record<QuestionGroup, string[]> = {
  rapport: [
    "How did you hear about me?",
    "What made you reach out now, specifically?",
    "Tell me a little about your business and what you do day to day.",
    "What does a great result from this call look like for you?",
    "Have you worked with a freelancer before? How did that go?",
  ],
  needs: [
    "What is the main problem you want {service} to solve?",
    "What have you already tried to fix it — and what happened?",
    "What does success look like for this {service} project in 3 months?",
    "Who is this for — who is your target audience or customer?",
    "What would make this project a failure in your eyes?",
    "Are there examples of work you love that we could aim toward?",
    "What is out of scope — what should this project NOT include?",
    "How will you measure whether the work is working?",
  ],
  budget: [
    "Do you have a budget range in mind for this project?",
    "Have you paid for similar work before? What did it cost?",
    "Is this a one-time project or the start of ongoing work?",
    "Who approves the budget on your side?",
    "What payment schedule works for you — deposit plus milestones?",
    "If the ideal scope costs more than the budget, which matters more: scope or price?",
  ],
  timeline: [
    "Is there a deadline or launch date driving this project?",
    "What happens if the project slips past that date?",
    "How quickly can you provide feedback, assets, and approvals?",
    "Who on your side will be my day-to-day point of contact?",
    "Are there busy seasons or blackout dates I should plan around?",
  ],
  decision: [
    "Who else needs to approve this before we can start?",
    "What would stop you from saying yes today?",
    "If we are a fit, what are the exact next steps on your side?",
    "Is there anything about working with me that still feels risky?",
    "Shall we lock in a start date and a deposit to hold it?",
  ],
};

/** Fixed per-goal group subsets. */
const GOAL_GROUPS: Record<CallGoal, QuestionGroup[]> = {
  qualify: ["rapport", "needs", "budget"],
  scope: ["rapport", "needs", "timeline"],
  close: ["rapport", "needs", "budget", "timeline", "decision"],
};

export function questionCountFor(goal: CallGoal): number {
  return GOAL_GROUPS[goal].reduce((sum, g) => sum + QUESTION_BANK[g].length, 0);
}

/**
 * Generator entry point. Inputs: serviceType (select, required), callGoal
 * (select: qualify | scope | close, required).
 * Output ids: questions (list), questionCount (number).
 */
export function runTool(values: Record<string, unknown>): DiscoveryCallResult {
  const serviceType = typeof values["serviceType"] === "string" ? values["serviceType"].trim() : "";
  if (!serviceType) {
    return { ok: false, error: "Choose a service type to tailor the questions." };
  }
  if (!SERVICE_TYPES.includes(serviceType)) {
    return {
      ok: false,
      error: `Unknown service type "${serviceType}". Choose one of the listed options.`,
    };
  }

  const callGoalRaw = typeof values["callGoal"] === "string" ? values["callGoal"].trim() : "";
  if (!callGoalRaw) {
    return { ok: false, error: "Choose a call goal: qualify, scope, or close." };
  }
  if (!(CALL_GOALS as readonly string[]).includes(callGoalRaw)) {
    return {
      ok: false,
      error: `Unknown call goal "${callGoalRaw}". Choose one of: ${CALL_GOALS.join(", ")}.`,
    };
  }
  const callGoal = callGoalRaw as CallGoal;

  const serviceLower = serviceType.toLowerCase();
  const questions: string[] = [];
  for (const group of GOAL_GROUPS[callGoal]) {
    for (const q of QUESTION_BANK[group]) {
      questions.push(`[${GROUP_LABELS[group]}] ${q.split("{service}").join(serviceLower)}`);
    }
  }

  return {
    ok: true,
    values: {
      questions,
      questionCount: questions.length,
      goalLabel: GOAL_LABELS[callGoal],
    },
  };
}
