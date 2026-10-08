/**
 * CTA Prompt Library — pure logic (zero imports, zero network, zero DOM).
 *
 * A fixed bank of 60 human-written call-to-action lines: 4 goals
 * (click | subscribe | buy | share) x 5 tones
 * (direct | friendly | urgent | playful | professional) x 3 lines each.
 * Nothing is generated at runtime — runTool only filters the bank by the
 * user's goal + tone and returns the matching lines. Deterministic:
 * same inputs always return the same lines in the same order.
 *
 * Bank inventory (documented per the BATCH-1 honesty contract):
 * - click/direct (3), click/friendly (3), click/urgent (3),
 *   click/playful (3), click/professional (3)
 * - subscribe/direct (3), subscribe/friendly (3), subscribe/urgent (3),
 *   subscribe/playful (3), subscribe/professional (3)
 * - buy/direct (3), buy/friendly (3), buy/urgent (3),
 *   buy/playful (3), buy/professional (3)
 * - share/direct (3), share/friendly (3), share/urgent (3),
 *   share/playful (3), share/professional (3)
 * Total: 60 lines. Every line is non-empty plain text; no line contains
 * placeholders the user must fill.
 */

export const CTA_GOALS = ["click", "subscribe", "buy", "share"] as const;
export const CTA_TONES = [
  "direct",
  "friendly",
  "urgent",
  "playful",
  "professional",
] as const;

export type CtaGoal = (typeof CTA_GOALS)[number];
export type CtaTone = (typeof CTA_TONES)[number];

/** Fixed word bank: goal -> tone -> lines (3 lines per pair). */
const CTA_BANK: Record<CtaGoal, Record<CtaTone, string[]>> = {
  click: {
    direct: [
      "Click here to get started.",
      "Click below to see how it works.",
      "Tap the button to continue.",
    ],
    friendly: [
      "Give it a click — we'd love to show you around.",
      "Click below to explore at your own pace.",
      "Ready when you are — just click to begin.",
    ],
    urgent: [
      "Click now — access closes soon.",
      "Don't wait — click here before the timer runs out.",
      "Click today to lock in your spot.",
    ],
    playful: [
      "Click me. Go on, you know you want to.",
      "One tiny click, endless possibilities.",
      "Click the shiny button. It's calling your name.",
    ],
    professional: [
      "Click here to learn more about our solution.",
      "Click below to schedule a walkthrough.",
      "Click to download the full overview.",
    ],
  },
  subscribe: {
    direct: [
      "Subscribe to get every new post by email.",
      "Enter your email to subscribe.",
      "Join the list — subscribe here.",
    ],
    friendly: [
      "Come join us — subscribe and never miss a post.",
      "Subscribe and let's stay in touch.",
      "Pop your email in below to join the family.",
    ],
    urgent: [
      "Subscribe now — the next issue goes out Friday.",
      "Join today before this week's bonus drops.",
      "Don't miss out — subscribe while it's free.",
    ],
    playful: [
      "Feed the inbox monster — subscribe now.",
      "Join the cool-email club.",
      "Subscribe for emails you'll actually open.",
    ],
    professional: [
      "Subscribe for monthly industry insights.",
      "Join our newsletter for research-backed updates.",
      "Subscribe to receive our briefing every Tuesday.",
    ],
  },
  buy: {
    direct: ["Buy now.", "Add to cart.", "Complete your purchase."],
    friendly: [
      "Ready? Grab yours today.",
      "Add it to your cart — you'll love it.",
      "Go ahead and treat yourself.",
    ],
    urgent: [
      "Buy now — sale ends Sunday.",
      "Only a few left at this price — order today.",
      "Order now to get it before the holidays.",
    ],
    playful: [
      "Snag it before someone else does.",
      "Your cart misses you — check out now.",
      "Add to cart. Your future self says thanks.",
    ],
    professional: [
      "Purchase today to secure current pricing.",
      "Request a quote and buy with confidence.",
      "Add to cart for instant access to the full edition.",
    ],
  },
  share: {
    direct: [
      "Share this with a friend.",
      "Forward this to someone who needs it.",
      "Share this post on your feed.",
    ],
    friendly: [
      "Know someone who'd love this? Share it with them.",
      "Pass it on to a friend who'd appreciate it.",
      "Share the love — send this to your group.",
    ],
    urgent: [
      "Share this before the offer expires.",
      "Tell a friend today — they'll thank you later.",
      "Share now so nobody misses out.",
    ],
    playful: [
      "Spread the word like confetti.",
      "Share this and earn instant hero status.",
      "Tag a friend who needs to see this.",
    ],
    professional: [
      "Share this research with your team.",
      "Forward this briefing to your colleagues.",
      "Share this article with your network.",
    ],
  },
};

export const CTA_LINES_TOTAL = 60;
export const CTA_LINES_PER_PAIR = 3;

export interface CtaRunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isGoal(v: unknown): v is CtaGoal {
  return typeof v === "string" && (CTA_GOALS as readonly string[]).includes(v);
}

function isTone(v: unknown): v is CtaTone {
  return typeof v === "string" && (CTA_TONES as readonly string[]).includes(v);
}

/**
 * Return the fixed CTA lines for one goal + tone pair.
 * Thin internal helper; the template's tool-logic slot is runTool.
 */
export function getCtaLines(goal: CtaGoal, tone: CtaTone): string[] {
  return [...CTA_BANK[goal][tone]];
}

/**
 * Tool logic slot (generator). Filters the fixed bank by ctaGoal + tone.
 * Never generates new copy — the honest claim is "template bank", not AI.
 */
export function runTool(values: Record<string, unknown>): CtaRunResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please provide your inputs first." };
  }
  const goal = values["ctaGoal"];
  const tone = values["tone"];

  if (!isGoal(goal)) {
    return {
      ok: false,
      error: `Choose a CTA goal: ${CTA_GOALS.join(", ")}.`,
    };
  }
  if (!isTone(tone)) {
    return {
      ok: false,
      error: `Choose a tone: ${CTA_TONES.join(", ")}.`,
    };
  }

  const lines = getCtaLines(goal, tone);
  return { ok: true, values: { ctaLines: lines } };
}
