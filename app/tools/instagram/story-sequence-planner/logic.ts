/**
 * Story Sequence Planner — pure logic (tool-225), zero imports, zero
 * network, zero DOM, zero randomness.
 *
 * FIXED SEQUENCE TEMPLATES, NOT AI: plans an ordered Instagram Story
 * sequence from 5 fixed goal playbooks (sell, launch, engage, educate,
 * announce). Each playbook is a hand-written list of story slots; every
 * slot carries a position, a recommended format, a fill-in draft text, and
 * a posting-timing suggestion.
 *
 * Slot-count rule (deterministic):
 *   - The first slot is always the hook and the last slot is always the CTA.
 *   - If storyCount <= playbook length: take the first (storyCount - 1)
 *     slots, then append the playbook's final CTA slot.
 *   - If storyCount > playbook length: use the whole playbook, then insert
 *     generic "engagement booster" slots before the final CTA.
 * Drafts ship with bracketed placeholders like [your offer] — i.e. empty
 * slots are allowed as placeholders for the user to fill in (spec edge
 * case).
 *
 * Timing suggestions are generic best-practice labels ("morning peak",
 * "1–2 hours after slot N", "evening wrap"), not personalized data.
 *
 * Bank sizes: 5 playbooks, 33 hand-written slots total (8+7+6+6+6), plus
 * 1 reusable booster slot.
 */

export type PlanGoal = "sell" | "launch" | "engage" | "educate" | "announce";

/** The five supported goals, in canonical order. */
export const PLAN_GOALS: PlanGoal[] = ["sell", "launch", "engage", "educate", "announce"];

export const GOAL_LABELS: Record<PlanGoal, string> = {
  sell: "Sell a product or offer",
  launch: "Launch something new",
  engage: "Boost engagement",
  educate: "Teach something",
  announce: "Announce news or an event",
};

export interface PlanSlot {
  /** 1-based position in the sequence. */
  position: number;
  format: string;
  draft: string;
  timing: string;
}

interface SlotTemplate {
  format: string;
  draft: string;
  timing: string;
}

const BOOSTER_SLOT: SlotTemplate = {
  format: "Poll sticker",
  draft: "Quick check-in: finding this useful? 👍 / 👎",
  timing: "1–2 hours after the previous slot.",
};

const PLAYBOOKS: Record<PlanGoal, SlotTemplate[]> = {
  sell: [
    { format: "Photo/video + text overlay", draft: "Hook: the #1 [topic] mistake costing you [result] 👀", timing: "Post during your morning peak — this opens the sequence." },
    { format: "Text slide", draft: "Most people struggle with [problem] because [reason].", timing: "1–2 hours after slot 1." },
    { format: "Selfie video", draft: "And it gets worse: [pain point] keeps costing you [money/time] every week.", timing: "1–2 hours after slot 2." },
    { format: "Screen recording / demo", draft: "Here's how [your offer] fixes it in [timeframe] 👇", timing: "1–2 hours after slot 3." },
    { format: "Screenshot / testimonial", draft: "Real result: [customer] got [outcome] in [timeframe].", timing: "1–2 hours after slot 4." },
    { format: "Question sticker", draft: "\"But what about [objection]?\" — answered 👇", timing: "1–2 hours after slot 5." },
    { format: "Text slide + link sticker", draft: "Today only: [offer] for [price]. Link below ⬇️", timing: "1–2 hours after slot 6." },
    { format: "Link sticker", draft: "Last call: [offer] ends [deadline]. Tap to grab it 🚨", timing: "1–2 hours after slot 7 — close of day." },
  ],
  launch: [
    { format: "Blurred photo / cryptic text", draft: "Something big is coming [date]… 👀", timing: "Morning — start the buzz." },
    { format: "Video reveal", draft: "It's here: [product name] is LIVE 🎉", timing: "1–2 hours after slot 1." },
    { format: "Text slides", draft: "3 reasons you'll love it: [benefit 1], [benefit 2], [benefit 3].", timing: "1–2 hours after slot 2." },
    { format: "Screen recording", draft: "How it works in 30 seconds 👇", timing: "1–2 hours after slot 3." },
    { format: "Question sticker", draft: "Ask me anything about [product] — answering all day.", timing: "1–2 hours after slot 4." },
    { format: "Testimonial screenshot", draft: "Early users are already saying: [quote].", timing: "1–2 hours after slot 5." },
    { format: "Link sticker", draft: "Get [product] here ⬇️ [bonus] ends tonight.", timing: "Evening — final push." },
  ],
  engage: [
    { format: "Text slide", draft: "Quick question for you 👇", timing: "Post during your morning peak." },
    { format: "Poll sticker", draft: "[This] or [that]?", timing: "1–2 hours after slot 1." },
    { format: "Quiz sticker", draft: "Guess the answer: [question] 🤔", timing: "1–2 hours after slot 2." },
    { format: "Emoji slider sticker", draft: "Rate this: [topic] 🔥 or 💤?", timing: "1–2 hours after slot 3." },
    { format: "Question sticker", draft: "AMA: ask me anything about [niche].", timing: "1–2 hours after slot 4." },
    { format: "Text slide", draft: "Thanks for playing! Follow for tomorrow's [series].", timing: "Evening wrap." },
  ],
  educate: [
    { format: "Bold text overlay", draft: "3 [topic] tips that actually work 👇", timing: "Post during your morning peak." },
    { format: "Text slide", draft: "Tip 1: [tip] — here's why it works.", timing: "1–2 hours after slot 1." },
    { format: "Text slide", draft: "Tip 2: [tip] — most people skip this.", timing: "1–2 hours after slot 2." },
    { format: "Text slide", draft: "Tip 3: [tip] — the advanced move.", timing: "1–2 hours after slot 3." },
    { format: "Text slide", draft: "Recap: [tip 1], [tip 2], [tip 3]. Save this 📌", timing: "1–2 hours after slot 4." },
    { format: "Text slide", draft: "Want the full guide? Comment \"[keyword]\" and I'll DM it.", timing: "Evening wrap." },
  ],
  announce: [
    { format: "Bold text overlay", draft: "Big news 👀", timing: "Post during your morning peak." },
    { format: "Text slide", draft: "Here's what's happening: [announcement details].", timing: "1–2 hours after slot 1." },
    { format: "Text slide", draft: "Mark your calendar: [date] 📅", timing: "1–2 hours after slot 2." },
    { format: "Countdown sticker", draft: "[Event name] — set your reminder ⏰", timing: "1–2 hours after slot 3." },
    { format: "Text slide", draft: "Reminder: [event] is [days] away. Don't miss it!", timing: "1–2 hours after slot 4." },
    { format: "Link sticker", draft: "All details + signup here ⬇️", timing: "Evening wrap." },
  ],
};

export const BANK_SIZES = {
  playbooks: PLAN_GOALS.length, // 5
  totalSlots: (Object.values(PLAYBOOKS) as SlotTemplate[][]).reduce((n, p) => n + p.length, 0), // 33
  minStories: 3,
  maxStories: 10,
};

export const TIMING_GUIDANCE =
  "Post slot 1 during your audience's morning peak, space the following slots 1–3 hours apart so each one gets views, and land the final CTA in the evening. Stories expire after 24 hours, so keep the whole arc inside one day.";

export const ASSUMPTIONS: string[] = [
  "Sequences come from 5 fixed goal playbooks (33 hand-written slots), not AI generation.",
  "Drafts ship with bracketed placeholders like [your offer] — fill them in with your own content before posting.",
  "Timing suggestions are generic best-practice labels, not personalized to your audience analytics.",
  "This planner does not publish anything to Instagram — it only produces the plan.",
];

function toInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isInteger(n)) return n;
  }
  return null;
}

function parseGoal(value: unknown): PlanGoal | null {
  if (typeof value !== "string") return null;
  const g = value.trim().toLowerCase();
  return (PLAN_GOALS as string[]).includes(g) ? (g as PlanGoal) : null;
}

function buildSlots(goal: PlanGoal, storyCount: number): SlotTemplate[] {
  const playbook = PLAYBOOKS[goal];
  if (storyCount <= playbook.length) {
    // Hook first, CTA last: take the first (storyCount - 1), then the CTA.
    return [...playbook.slice(0, storyCount - 1), playbook[playbook.length - 1]];
  }
  // Longer than the playbook: whole playbook + boosters before the CTA.
  const head = playbook.slice(0, playbook.length - 1);
  const cta = playbook[playbook.length - 1];
  const boosters: SlotTemplate[] = [];
  for (let i = 0; i < storyCount - playbook.length; i++) boosters.push(BOOSTER_SLOT);
  return [...head, ...boosters, cta];
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Plan a story sequence. Errors: missing/unknown goal; storyCount (when
 * provided) not an integer in 3–10. Never throws.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const goal = parseGoal(values["goal"]);
  if (goal === null) {
    return {
      ok: false,
      error: `Please pick a goal: ${PLAN_GOALS.map((g) => GOAL_LABELS[g]).join(", ")}.`,
    };
  }

  let storyCount = 5; // default when not provided
  if (values["storyCount"] !== undefined && values["storyCount"] !== null && values["storyCount"] !== "") {
    const parsed = toInteger(values["storyCount"]);
    if (parsed === null || parsed < BANK_SIZES.minStories || parsed > BANK_SIZES.maxStories) {
      return {
        ok: false,
        error: `Story count must be a whole number between ${BANK_SIZES.minStories} and ${BANK_SIZES.maxStories}.`,
      };
    }
    storyCount = parsed;
  }

  const templates = buildSlots(goal, storyCount);
  const slots: PlanSlot[] = templates.map((t, i) => ({
    position: i + 1,
    format: t.format,
    draft: t.draft,
    timing: t.timing,
  }));

  const table = {
    columns: ["#", "Format", "Draft text", "Post timing"],
    rows: slots.map((s) => [String(s.position), s.format, s.draft, s.timing]),
  };

  const copyAll = slots
    .map((s) => `Slot ${s.position} — ${s.format}\n${s.draft}\n(${s.timing})`)
    .join("\n\n");

  return {
    ok: true,
    values: {
      plan: table,
      timingSuggestion: TIMING_GUIDANCE,
      copyAll,
    },
  };
}
