/**
 * Blog Giveaway Idea Generator — pure logic (tool-434).
 *
 * WHAT THIS IS (honesty, enforced):
 * - Pure client-side deterministic giveaway ideation from FIXED banks
 *   (see IDEA_TEMPLATES, PRIZE_BANKS, ENTRY_MECHANICS, DURATIONS).
 *   No AI, no network, no backend. Blog-channel giveaway ideation
 *   only — distinct from the Facebook-channel giveaway tool.
 * - Bank sizes: 12 idea-title templates; 3 budget tiers x 6 prize
 *   templates = 18 prize templates; 6 entry mechanics; 4 durations.
 * - The user's optional prizeBudget text is parsed for a dollar amount
 *   to pick a prize tier (under $25 / $25–100 / over $100); if no amount
 *   is found, the "unspecified" tier of generic-but-honest prizes is used.
 *   Nothing is invented as a fact — prizes are template ideas, not real
 *   products with real prices.
 * - Deterministic selection: a simple code-point hash of the niche +
 *   audience picks the starting offsets; the same inputs always produce
 *   the same idea list.
 *
 * Edge-case handling (shared validation rules):
 * - count is clamped to 1-10 (documented range); overlong inputs trimmed
 *   to MAX_INPUT_CHARS (code points) with a visible notice.
 * - Repeated-word guard on generated titles; user input sanitized to
 *   plain text before insertion.
 */

export const MAX_INPUT_CHARS = 200;
export const MIN_COUNT = 1;
export const MAX_COUNT = 10;

/** 12 fixed giveaway idea-title templates. Slot: {niche}. NOT AI-generated. */
export const IDEA_TEMPLATES: readonly string[] = [
  "The {niche} Starter Bundle Giveaway",
  "{niche} Reader's Choice: Win Your Wishlist Item",
  "The Ultimate {niche} Toolkit Giveaway",
  "{niche} Holiday Haul: One Winner Takes All",
  "Win a 1-on-1 {niche} Coaching Session",
  "The {niche} Book & Course Bundle Giveaway",
  "{niche} Challenge: Complete It, Win It",
  "Subscriber-Only {niche} Mystery Box Giveaway",
  "The {niche} Gear Upgrade Giveaway",
  "{niche} Anniversary Celebration Giveaway",
  "Win Free {niche} Resources for a Year",
  "The {niche} Community Vote Giveaway",
];

/** Prize budget tiers derived from the user's optional prizeBudget text. */
export type PrizeTier = "low" | "mid" | "high" | "unspecified";

/** 3 tiers x 6 = 18 fixed prize templates. Slot: {niche}. */
export const PRIZE_BANKS: Record<PrizeTier, readonly string[]> = {
  low: [
    "A curated {niche} e-book + checklist bundle (under $25 value)",
    "A 1-month premium {niche} tool subscription",
    "A $20 gift card for a {niche} supply store",
    "A printable {niche} planner pack",
    "A {niche} mini-course enrollment",
    "A branded {niche} starter swag pack",
  ],
  mid: [
    "A premium {niche} course bundle ($25–100 value)",
    "A 3-month premium {niche} tool subscription",
    "A $50–75 gift card for {niche} gear",
    "A signed {niche} book collection",
    "A 1-hour 1-on-1 {niche} coaching call",
    "A curated {niche} resource box",
  ],
  high: [
    "A flagship {niche} course + mentorship package (over $100 value)",
    "A full year of a premium {niche} tool subscription",
    "A $150+ {niche} equipment bundle",
    "A VIP {niche} event ticket",
    "A 3-session {niche} coaching package",
    "A complete {niche} home-studio setup",
  ],
  unspecified: [
    "A prize related to your {niche} niche (set a budget to get specific ideas)",
    "A digital {niche} resource bundle",
    "A {niche} book or course of the winner's choice",
    "A consultation or coaching session on {niche}",
    "Sponsored {niche} gear from a partner brand",
    "A {niche} gift card",
  ],
};

/** 6 fixed entry mechanics. */
export const ENTRY_MECHANICS: readonly string[] = [
  "Subscribe to the email list + confirm via double opt-in",
  "Comment on the giveaway post with your biggest {niche} question",
  "Share the giveaway post and tag a friend",
  "Complete a 3-question {niche} quiz to enter",
  "Refer a friend who also subscribes",
  "Leave a blog comment and follow on one social channel",
];

/** 4 fixed giveaway durations. */
export const DURATIONS: readonly string[] = [
  "7 days",
  "14 days",
  "3 days (flash giveaway)",
  "30 days",
];

export interface GiveawayIdea {
  title: string;
  prize: string;
  entryMechanic: string;
  duration: string;
}

export interface GiveawayResult {
  ideas: GiveawayIdea[];
  notice: string | null;
}

/** Detect accidental duplicated adjacent words/phrases in a generated line. */
export function hasRepeatedWords(text: string): boolean {
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  for (let i = 0; i + 1 < words.length; i++) {
    if (words[i] === words[i + 1]) return true;
  }
  return false;
}

function takeCodePoints(s: string, n: number): string {
  return [...s].slice(0, n).join("");
}

function trimInput(raw: unknown): [string, boolean] {
  const s = String(raw).trim();
  if ([...s].length > MAX_INPUT_CHARS) {
    return [takeCodePoints(s, MAX_INPUT_CHARS).trimEnd(), true];
  }
  return [s, false];
}

/** Strip HTML tags from user input so output stays plain text. */
export function sanitizePlain(raw: string): string {
  return raw.replace(/<[^>]*>/g, "").trim();
}

/**
 * Pick a prize tier from free-text budget input. Looks for the first
 * number in the text; amounts under 25 = low, 25-100 = mid, over 100 =
 * high; no number found = unspecified. Never invents a real price.
 */
export function parsePrizeTier(prizeBudget: string): PrizeTier {
  const match = prizeBudget.match(/\d+(?:\.\d+)?/);
  if (!match) return "unspecified";
  const amount = Number(match[0]);
  if (!Number.isFinite(amount)) return "unspecified";
  if (amount < 25) return "low";
  if (amount <= 100) return "mid";
  return "high";
}

/** Deterministic code-point hash used only to pick starting offsets. */
export function hashString(s: string): number {
  let h = 0;
  for (const ch of s) {
    h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  }
  return h;
}

export function generateGiveawayIdeas(
  blogNiche: string,
  audience: string,
  prizeBudget: string,
  count: number,
): GiveawayResult {
  if (typeof blogNiche !== "string" || blogNiche.trim().length === 0) {
    throw new RangeError("blogNiche must not be empty or whitespace-only.");
  }
  if (typeof audience !== "string" || audience.trim().length === 0) {
    throw new RangeError("audience must not be empty or whitespace-only.");
  }
  if (typeof prizeBudget !== "string") {
    throw new RangeError("prizeBudget must be a string (may be empty).");
  }
  if (typeof count !== "number" || !Number.isFinite(count)) {
    throw new RangeError("count must be a finite number.");
  }

  const [nicheVal, nicheTrim] = trimInput(blogNiche);
  const [audVal, audTrim] = trimInput(audience);
  const [budgetVal, budgetTrim] = trimInput(prizeBudget);
  const niche = sanitizePlain(nicheVal);
  const tier = parsePrizeTier(budgetVal);

  const n = Math.max(MIN_COUNT, Math.min(MAX_COUNT, Math.floor(count)));
  const seed = hashString(niche + "|" + sanitizePlain(audVal));

  const prizes = PRIZE_BANKS[tier];
  const ideas: GiveawayIdea[] = [];
  for (let i = 0; i < n; i++) {
    const title = IDEA_TEMPLATES[(seed + i) % IDEA_TEMPLATES.length].replaceAll(
      "{niche}",
      niche,
    );
    const prize = prizes[(seed + i * 2) % prizes.length].replaceAll("{niche}", niche);
    const entryMechanic = ENTRY_MECHANICS[(seed + i * 3) % ENTRY_MECHANICS.length].replaceAll(
      "{niche}",
      niche,
    );
    const duration = DURATIONS[(seed + i) % DURATIONS.length];
    if (hasRepeatedWords(title)) {
      // guard: fall back to the next template instead of shipping a dup
      const alt = IDEA_TEMPLATES[(seed + i + 1) % IDEA_TEMPLATES.length].replaceAll("{niche}", niche);
      ideas.push({ title: alt, prize, entryMechanic, duration });
    } else {
      ideas.push({ title, prize, entryMechanic, duration });
    }
  }

  const notice =
    nicheTrim || audTrim || budgetTrim
      ? "Note: an overlong input was trimmed to 200 characters. Nothing was dropped silently."
      : null;

  return { ideas, notice };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * mountToolUI contract: runTool(values) -> { ok, values?, error? }.
 * values in:  { blogNiche, audience, prizeBudget?, count }
 * values out: { ideas[] } where each idea = { title, prize, entryMechanic, duration }
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const { blogNiche, audience, prizeBudget, count } = values;

  if (typeof blogNiche !== "string" || blogNiche.trim().length === 0) {
    return { ok: false, error: "Please enter your blog niche (e.g. “home baking”)." };
  }
  if (typeof audience !== "string" || audience.trim().length === 0) {
    return { ok: false, error: "Please describe your audience (e.g. “new parents”)." };
  }
  if (prizeBudget !== undefined && typeof prizeBudget !== "string") {
    return { ok: false, error: "Prize budget must be text (e.g. “$50”)." };
  }
  if (typeof count !== "number" || !Number.isFinite(count)) {
    return { ok: false, error: "Please enter how many ideas you want (1–10)." };
  }

  let result: GiveawayResult;
  try {
    result = generateGiveawayIdeas(blogNiche, audience, prizeBudget ?? "", count);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not generate giveaway ideas.",
    };
  }

  return {
    ok: true,
    values: { ideas: result.ideas, notice: result.notice },
  };
}
