/**
 * X Pinned Tweet Idea Generator — pure logic (tool-379), zero imports,
 * zero network, zero DOM.
 *
 * TEMPLATE LIBRARY, NOT AI: 5 hand-written pinned-tweet drafts per brand
 * goal (offer / proof / announcement — 15 drafts total). Each draft is
 * CTA-led and self-contained (a pinned post is a first impression, so no
 * draft depends on a thread or prior context). Square-bracket placeholders
 * like [YOUR OFFER] mark exactly what the user must fill in — the tool
 * never invents their offer, results, or announcement details.
 * Selection is deterministic: the same goal always returns the same 5
 * drafts in the same order.
 *
 * Weighted budget enforced (data/platform-rules/x.json): URL = 23 chars,
 * emoji/CJK = 2 chars, everything else = 1 char (approximation — X's exact
 * segmenter is proprietary; documented limitation). Every draft is
 * verified at test time to fit the 280 weighted-char limit for free
 * accounts; buildDrafts throws if a template ever exceeds it.
 */

/** X post limit for free accounts (data/platform-rules/x.json). */
export const X_POST_LIMIT = 280;

export type BrandGoal = "offer" | "proof" | "announcement";

/** The three supported goals, in canonical order. */
export const BRAND_GOALS: BrandGoal[] = ["offer", "proof", "announcement"];

/** 5 hand-written, CTA-led, self-contained drafts per goal (15 total). */
const DRAFTS: Record<BrandGoal, string[]> = {
  offer: [
    "I help [YOUR AUDIENCE] get [OUTCOME] with [YOUR OFFER].\n\n✅ [BENEFIT 1]\n✅ [BENEFIT 2]\n\n👇 Start here:\n[YOUR LINK]",
    "Stop [PAIN POINT].\n\n[YOUR OFFER] helps you [OUTCOME] in [TIMEFRAME].\n\nDM me “START” or grab it here 👇\n[YOUR LINK]",
    "Everything you need to [OUTCOME]:\n\n→ [YOUR OFFER]\n\n[ONE-LINE PITCH]\n\n[SOCIAL PROOF] — join them 👇\n[YOUR LINK]",
    "👋 New here? I’m [YOUR NAME].\n\nI help [YOUR AUDIENCE] [OUTCOME] through [YOUR OFFER].\n\nMy best work lives here 👇\n[YOUR LINK]",
    "The fastest way to [OUTCOME]?\n\n[YOUR OFFER].\n\n[ONE-LINE PITCH]\n\nGet instant access 👇\n[YOUR LINK]",
  ],
  proof: [
    "Results > promises.\n\n📊 [RESULT 1]\n📊 [RESULT 2]\n📊 [RESULT 3]\n\nThis is what [YOUR OFFER] does.\n\nWant in? 👇\n[YOUR LINK]",
    "“[TESTIMONIAL QUOTE]”\n— [CUSTOMER NAME]\n\nWins like this land every week.\n\nSee how 👇\n[YOUR LINK]",
    "From [BEFORE] to [AFTER] in [TIMEFRAME].\n\nNo fluff. Just [YOUR METHOD].\n\nYour turn 👇\n[YOUR LINK]",
    "I’ve helped [NUMBER] [YOUR AUDIENCE] [OUTCOME].\n\nThe proof, in one thread 🧵👇\n\n[THREAD OR LINK]",
    "Don’t take my word for it:\n\n⭐ [REVIEW 1]\n⭐ [REVIEW 2]\n\n[YOUR OFFER] — try it 👇\n[YOUR LINK]",
  ],
  announcement: [
    "📢 Big news: [YOUR ANNOUNCEMENT]\n\nWhat it means for you:\n→ [POINT 1]\n→ [POINT 2]\n\nFollow along — more coming 👇",
    "It’s official: [YOUR ANNOUNCEMENT] 🚀\n\n[ONE SENTENCE OF CONTEXT]\n\nGet the details here 👇\n[YOUR LINK]",
    "Mark your calendar 📅\n\n[EVENT/LAUNCH NAME] — [DATE].\n\nWhat to expect:\n→ [POINT 1]\n→ [POINT 2]\n\nDon’t miss it 👇",
    "New chapter: [YOUR ANNOUNCEMENT]\n\nWhy I’m doing this:\n[ONE-LINE REASON]\n\nJoin me 👇\n[YOUR LINK]",
    "🚨 [YOUR ANNOUNCEMENT]\n\n[SPOTS/SEATS] available — first come, first served.\n\nClaim yours 👇\n[YOUR LINK]",
  ],
};

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

export function isBrandGoal(v: string): v is BrandGoal {
  return (BRAND_GOALS as string[]).includes(v);
}

/**
 * Return the 5 drafts for a goal, each verified within the 280
 * weighted-char budget.
 * @throws {TypeError} on non-string input. @throws {Error} on unknown goal
 *   or on a template exceeding the budget (fail-fast honesty guard).
 */
export function buildDrafts(goal: string): string[] {
  if (typeof goal !== "string") throw new TypeError("buildDrafts expects a string");
  if (!isBrandGoal(goal)) throw new Error(`buildDrafts: unknown goal "${goal}"`);
  const drafts = DRAFTS[goal].slice();
  for (const d of drafts) {
    const w = xWeightedLength(d);
    if (w > X_POST_LIMIT) {
      throw new Error(`buildDrafts: template exceeds ${X_POST_LIMIT} weighted chars (${w})`);
    }
  }
  return drafts;
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const raw = values["brandGoal"];
  if (typeof raw !== "string" || raw.trim() === "") {
    return { ok: false, error: "Please choose what your pinned post should do: offer, proof, or announcement." };
  }
  const goal = raw.trim();
  if (!isBrandGoal(goal)) {
    return { ok: false, error: "Goal must be one of: offer, proof, announcement." };
  }
  return {
    ok: true,
    values: { pinnedTweets: buildDrafts(goal) },
  };
}
