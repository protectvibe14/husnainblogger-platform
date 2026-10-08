/**
 * Facebook CTA Text Generator — pure logic (tool-398), zero imports, zero
 * network, zero DOM.
 *
 * FIXED PHRASE BANK, NOT AI: returns in-post call-to-action phrases from a
 * hand-written bank keyed by the user's goal. 7 goal families x 6 phrases
 * = 42 phrases. Every phrase is verb-led and 60 chars or fewer.
 *
 * IMPORTANT (shown prominently via platformNote): Facebook Page CTA
 * BUTTONS are a fixed Facebook-controlled list (Call Now, Shop Now,
 * Learn More, Sign Up, ...). This tool writes IN-POST CTA text for
 * captions — it cannot change or extend the Page button list.
 *
 * Deterministic: same inputs -> same outputs, always.
 */

export const MAX_PHRASE_LENGTH = 60;
export const PHRASES_PER_FAMILY = 6;

export const PLATFORM_NOTE =
  "Heads-up: Facebook Page CTA buttons are a fixed Facebook list (Call Now, " +
  "Shop Now, Learn More, Sign Up, ...). This tool writes in-post CTA text " +
  "for your captions — it cannot add to or change the button on your Page.";

/** Goal families, in canonical order. "general" is the fallback. */
export const GOAL_FAMILIES = [
  "shop",
  "book",
  "learn",
  "join",
  "download",
  "contact",
  "general",
] as const;

export type GoalFamily = (typeof GOAL_FAMILIES)[number];

/** In-post CTA phrases per family — 6 each (42 total), all verb-led, <=60 chars. */
const PHRASE_BANK: Record<GoalFamily, string[]> = {
  shop: [
    "Shop the collection now",
    "Shop the sale before it ends",
    "Grab yours before it's gone",
    "Order today — ships fast",
    "Add to cart in one tap",
    "Tap to shop this week's deals",
  ],
  book: [
    "Book your free consult",
    "Book your spot today",
    "Schedule your call now",
    "Reserve your place today",
    "Call now to book",
    "Book in under 60 seconds",
  ],
  learn: [
    "Read the full guide",
    "Learn how it works",
    "Discover the details inside",
    "Watch the 2-minute demo",
    "Get the free guide",
    "See what's inside",
  ],
  join: [
    "Join free today",
    "Subscribe for weekly tips",
    "Join the community",
    "Sign up in seconds",
    "Follow for daily updates",
    "Get on the list now",
  ],
  download: [
    "Download it free",
    "Get the free checklist",
    "Download the app today",
    "Grab your free copy",
    "Get instant access",
    "Download in one tap",
  ],
  contact: [
    "Message us now",
    "Send us a message",
    "Chat with our team",
    "Talk to an expert today",
    "Ask us anything",
    "Get help today",
  ],
  general: [
    "Tap to get started",
    "Start today — it's easy",
    "Take the next step now",
    "Try it for yourself",
    "Take action today",
    "Claim your spot now",
  ],
};

export const BANK_SIZES = {
  families: GOAL_FAMILIES.length,
  phrasesPerFamily: PHRASE_BANK.shop.length,
  total: GOAL_FAMILIES.length * PHRASE_BANK.shop.length,
};

/** Keyword hints mapping the user's goal to a family. */
const FAMILY_KEYWORDS: Record<Exclude<GoalFamily, "general">, string[]> = {
  shop: ["shop", "buy", "order", "purchase", "cart", "store", "deal", "sale", "product"],
  book: ["book", "appointment", "call", "schedule", "reserve", "consult", "visit"],
  learn: ["learn", "read", "discover", "guide", "blog", "watch", "course", "tutorial", "demo"],
  join: ["join", "sign", "subscribe", "newsletter", "follow", "community", "member", "list"],
  download: ["download", "free", "app", "ebook", "checklist", "pdf", "get"],
  contact: ["contact", "message", "chat", "dm", "talk", "help", "ask", "support"],
};

/** Deterministic family detection: first family whose keywords appear in the goal. */
export function detectFamily(goal: string): GoalFamily {
  const g = ` ${goal.toLowerCase().replace(/[^a-z0-9 ]/g, " ")} `;
  for (const family of GOAL_FAMILIES) {
    if (family === "general") continue;
    for (const kw of FAMILY_KEYWORDS[family]) {
      if (g.includes(` ${kw} `) || g.includes(` ${kw}s `)) return family;
    }
  }
  return "general";
}

export interface GenerateCtaResult {
  phrases: string[];
  family: GoalFamily;
  platformNote: string;
}

/** Generate CTA phrases for a goal. Throws on invalid input. */
export function generateCtas(goal: string): GenerateCtaResult {
  if (typeof goal !== "string" || goal.trim().length === 0) {
    throw new Error("Goal is required — e.g. shop now, book a call, learn more.");
  }
  const family = detectFamily(goal);
  return {
    phrases: [...PHRASE_BANK[family]],
    family,
    platformNote: PLATFORM_NOTE,
  };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Platform entry point (generator). values: { goal }. */
export function runTool(values: Record<string, unknown>): RunToolResult {
  try {
    const goal = values["goal"];
    if (typeof goal !== "string" || goal.trim().length === 0) {
      return { ok: false, error: "Goal is required — e.g. shop now, book a call, learn more." };
    }
    const result = generateCtas(goal);
    return {
      ok: true,
      values: {
        ctaPhrases: result.phrases,
        platformNote: result.platformNote,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
