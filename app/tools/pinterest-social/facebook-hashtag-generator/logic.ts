/**
 * Facebook Hashtag Generator — pure logic (tool-396), zero imports, zero
 * network, zero DOM.
 *
 * CURATED BANK, NOT AI: assembles ready-to-paste hashtags from a fixed
 * hand-curated tag pool bundled in this file. The tool has NO live data —
 * it cannot know which tags are trending or how much reach any tag gets.
 * A fixed honesty note (usageNote) is always returned: on Facebook,
 * hashtags carry low weight (1-3 max), and keywords/audience matter more.
 *
 * Bank layout:
 *   6 category pools x 10 tags = 60 category tags
 *   1 Facebook-flavored bonus pool x 8 tags
 *   68 tags total.
 *
 * Assembly: the user's topic is normalized into one topic tag, then the
 * detected category pool + the bonus pool fill up to `count` (1-5),
 * de-duplicated, in fixed bank order.
 *
 * Deterministic: same inputs -> same outputs, always.
 */

export const MIN_COUNT = 1;
export const MAX_COUNT = 5;
export const DEFAULT_COUNT = 3;
export const MAX_TOPIC_TAG_LENGTH = 30;

export const USAGE_NOTE =
  "Honest note: on Facebook hashtags carry low weight compared to the " +
  "post text, keywords, and audience. Use 1-3 max per post — hashtags are " +
  "a small helper, never the strategy.";

/** Topic categories, in canonical order. */
export const CATEGORIES = [
  "business",
  "fitness",
  "food",
  "travel",
  "beauty",
  "general",
] as const;

export type CategoryId = (typeof CATEGORIES)[number];

/** Category tag pools — 10 hand-picked generic tags each (60 total). */
const CATEGORY_POOLS: Record<CategoryId, string[]> = {
  business: ["smallbusiness","entrepreneur","shoplocal","supportsmallbusiness","businessowner","startup","businessgrowth","marketing","socialmediamarketing","onlinebusiness"],
  fitness: ["fitness","workout","gym","fitnessmotivation","healthylifestyle","personaltrainer","gymlife","exercise","health","wellness"],
  food: ["foodie","foodlover","recipes","foodblogger","homecooking","yummy","delicious","instafood","cooking","dessert"],
  travel: ["travel","wanderlust","travelgram","vacation","adventure","travelblogger","explore","getaway","tourism","holiday"],
  beauty: ["beauty","makeup","skincare","beautyblogger","glammakeup","beautytips","cosmetics","makeupartist","glowingskin","selfcare"],
  general: ["trending","viral","community","inspiration","tips","howto","diy","lifehacks","motivation","lifestyle"],
};

/** Facebook-flavored bonus tags — 8 tags, appended after the category pool. */
const FACEBOOK_BONUS_TAGS: string[] = [
  "facebookmarketing",
  "facebookbusiness",
  "facebookpage",
  "facebookads",
  "smallbusinessowner",
  "shopsmall",
  "digitalmarketing",
  "contentcreator",
];

export const BANK_SIZES = {
  categories: CATEGORIES.length,
  tagsPerCategory: CATEGORY_POOLS.business.length,
  categoryTagsTotal: CATEGORIES.length * CATEGORY_POOLS.business.length,
  bonusTagsTotal: FACEBOOK_BONUS_TAGS.length,
  total: CATEGORIES.length * CATEGORY_POOLS.business.length + FACEBOOK_BONUS_TAGS.length,
};

/** Keyword hints used to detect the topic's category. */
const CATEGORY_KEYWORDS: Record<Exclude<CategoryId, "general">, string[]> = {
  business: ["business","shop","store","brand","market","startup","ecommerce","agency","boutique","salon","coach","consult","realestate"],
  fitness: ["fitness","gym","workout","health","yoga","nutrition","wellness","training","sport","muscle"],
  food: ["food","recipe","cook","restaurant","cafe","baking","dessert","chef","eat","snack"],
  travel: ["travel","trip","vacation","tourism","hotel","adventure","destination","flight","beach","explore"],
  beauty: ["beauty","makeup","skincare","cosmetic","hair","glam","fashion","style","nail","fragrance"],
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Deterministic category detection: first category whose keywords appear in the topic. */
export function detectCategory(topic: string): CategoryId {
  const t = ` ${topic.toLowerCase().replace(/[^a-z0-9 ]/g, " ")} `;
  for (const cat of CATEGORIES) {
    if (cat === "general") continue;
    const keywords = CATEGORY_KEYWORDS[cat];
    for (const kw of keywords) {
      if (t.includes(` ${kw} `) || t.includes(` ${kw}s `)) return cat;
    }
  }
  return "general";
}

/** Build the combined pool: category tags first, then Facebook bonus tags. */
export function combinedPool(category: CategoryId): string[] {
  return [...CATEGORY_POOLS[category], ...FACEBOOK_BONUS_TAGS];
}

/**
 * Turn the raw topic into a hashtag body. Throws when nothing usable remains.
 */
export function topicTag(topic: string): string {
  const tag = normalize(topic);
  if (tag.length === 0) {
    throw new Error("Topic must contain letters or numbers so a hashtag can be formed.");
  }
  return tag.slice(0, MAX_TOPIC_TAG_LENGTH);
}

export interface GenerateHashtagsResult {
  hashtags: string[];
  category: CategoryId;
  usageNote: string;
}

/**
 * Generate `count` hashtags for a topic. Throws on invalid input.
 */
export function generateHashtags(topic: string, count: number = DEFAULT_COUNT): GenerateHashtagsResult {
  if (typeof topic !== "string" || topic.trim().length === 0) {
    throw new Error("Topic is required — describe what your post is about.");
  }
  if (typeof count !== "number" || !Number.isInteger(count)) {
    throw new Error(`Count must be a whole number from ${MIN_COUNT} to ${MAX_COUNT}.`);
  }
  if (count < MIN_COUNT || count > MAX_COUNT) {
    throw new Error(`Count must be from ${MIN_COUNT} to ${MAX_COUNT}.`);
  }

  const tag = topicTag(topic);
  const category = detectCategory(topic);
  const pool = combinedPool(category);

  const seen = new Set<string>([tag]);
  const hashtags = [`#${tag}`];
  for (const candidate of pool) {
    if (hashtags.length >= count) break;
    if (!seen.has(candidate)) {
      seen.add(candidate);
      hashtags.push(`#${candidate}`);
    }
  }
  return { hashtags, category, usageNote: USAGE_NOTE };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Platform entry point (generator). values: { topic, count? }.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  try {
    const topic = values["topic"];
    if (typeof topic !== "string" || topic.trim().length === 0) {
      return { ok: false, error: "Topic is required — describe what your post is about." };
    }

    const rawCount = values["count"];
    let count = DEFAULT_COUNT;
    if (rawCount !== undefined && rawCount !== null && rawCount !== "") {
      count = typeof rawCount === "number" ? rawCount : Number(rawCount);
    }

    const result = generateHashtags(topic, count);
    return {
      ok: true,
      values: {
        hashtags: result.hashtags,
        usageNote: result.usageNote,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
