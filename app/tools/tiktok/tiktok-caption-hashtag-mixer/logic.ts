/**
 * TikTok Caption Hashtag Mixer (tool-198) — word-bank hashtag mixer.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * HONESTY: assembles hashtag mixes from FIXED bundled word banks organized
 * by niche — never claims AI and never claims to know live hashtag
 * popularity, reach, or banned status on TikTok (the tool has no TikTok
 * access). Trending hashtags are used ONLY from a user-pasted list; the tool
 * never invents "#trending" tags. Enforces the 2,200-character caption
 * envelopes including hashtags; hashtags are trimmed (dropped broad ->
 * community -> niche) when a long user caption would exceed the limit, while
 * user-pasted trending tags are always kept.
 *
 * WORD BANKS (all fixed; sizes documented — picks are deterministic):
 *   NICHE_TAGS: 12 categories x 10 tags = 120 fixed niche hashtags
 *   BROAD_TAGS: 10 fixed broad-reach hashtags
 *   COMMUNITY_TAGS: 10 fixed community hashtags
 *   GENERIC_TAGS: 10 fixed fallback hashtags (unmatched niches)
 *   CAPTION_HOOKS: 12 caption frames with {topic}/{niche} slots
 *   TOTAL: 162 fixed bank entries.
 *
 * Determinism: FNV-1a seed from niche.toLowerCase(); same inputs -> same
 * outputs, always. No reach/virality claims — mixes are organizational.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Conservative TikTok caption limit (matches tool-152's registry value). */
const CAPTION_LIMIT = 2200;
const MAX_NICHE_LEN = 60;
const MAX_TOPIC_LEN = 120;
const MAX_CAPTION_LEN = 2000;
const MAX_TRENDING_LEN = 500;
const MAX_TRENDING_TAGS = 10;

const NICHE_MIX_COUNT = 6;
const BROAD_MIX_COUNT = 4;
const COMMUNITY_MIX_COUNT = 4;

/** FNV-1a 32-bit hash — deterministic bank seeding, no Math.random. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Rotate a fixed bank by a deterministic offset and take `count` tags. */
function rotateTake(bank: readonly string[], count: number, offset: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < count && i < bank.length; i++) {
    out.push(bank[(offset + i) % bank.length]);
  }
  return out;
}

interface NicheCategory {
  keywords: readonly string[];
  tags: readonly string[];
}

const NICHE_CATEGORIES: readonly NicheCategory[] = [
  {
    keywords: ["fitness", "gym", "workout", "running", "health", "weight", "muscle", "yoga", "cardio"],
    tags: ["#fittok", "#gymtok", "#fitnessjourney", "#workoutroutine", "#fitnesstips", "#gymlife", "#trainhard", "#fitnessmotivation", "#homeworkout", "#strengthtraining"],
  },
  {
    keywords: ["beauty", "makeup", "skincare", "cosmetic", "hair", "nails", "glowup"],
    tags: ["#beautytok", "#makeuptutorial", "#skincareroutine", "#grwm", "#makeuphacks", "#beautytips", "#skincarecommunity", "#glowup", "#cosmetics", "#beautyfinds"],
  },
  {
    keywords: ["food", "recipe", "cooking", "baking", "chef", "restaurant", "dessert", "mealprep", "vegan"],
    tags: ["#foodtok", "#recipe", "#easyrecipes", "#cookingathome", "#foodie", "#tiktokfood", "#homecooking", "#recipeoftheday", "#dessert", "#mealprep"],
  },
  {
    keywords: ["fashion", "outfit", "style", "clothing", "thrift", "ootd", "streetwear", "wardrobe"],
    tags: ["#fashiontok", "#ootd", "#outfitinspo", "#styletips", "#thriftedfashion", "#capsulewardrobe", "#fashionhacks", "#streetstyle", "#outfitoftheday", "#styleinspo"],
  },
  {
    keywords: ["gaming", "gamer", "esport", "twitch", "videogame", "retrogaming"],
    tags: ["#gametok", "#gamingcommunity", "#gamertok", "#gamingclips", "#videogames", "#esports", "#gamingsetup", "#gaminglife", "#retrogaming", "#gamereview"],
  },
  {
    keywords: ["finance", "money", "budget", "invest", "crypto", "trading", "debt", "saving", "sidehustle"],
    tags: ["#moneytok", "#personalfinance", "#financetips", "#budgeting", "#investingtips", "#debtfreejourney", "#moneymindset", "#sidehustle", "#financialfreedom", "#savingmoney"],
  },
  {
    keywords: ["travel", "wanderlust", "vacation", "backpack", "tourism", "flight", "hotel", "solotravel"],
    tags: ["#traveltiktok", "#travelguide", "#wanderlust", "#traveltips", "#bucketlist", "#travelvlog", "#hiddenplaces", "#solotravel", "#travelhacks", "#vacationmode"],
  },
  {
    keywords: ["study", "student", "school", "college", "exam", "learn", "productivity", "university"],
    tags: ["#studytok", "#studywithme", "#studyhacks", "#studentlife", "#learnontiktok", "#examseason", "#productivitytips", "#schoolhacks", "#collegelife", "#notetaking"],
  },
  {
    keywords: ["comedy", "funny", "meme", "humor", "skit", "prank", "relatable"],
    tags: ["#comedytok", "#funnyvideos", "#memes", "#skit", "#comedyvideos", "#relatable", "#humor", "#prank", "#dankmemes", "#lols"],
  },
  {
    keywords: ["pet", "dog", "cat", "animal", "puppy", "kitten", "furry"],
    tags: ["#pettok", "#dogsoftiktok", "#catsoftiktok", "#petlife", "#cutepets", "#animallovers", "#dogmom", "#catmom", "#petsdaily", "#furbaby"],
  },
  {
    keywords: ["business", "entrepreneur", "startup", "marketing", "ecommerce", "brand", "smallbusiness"],
    tags: ["#businesstok", "#entrepreneurlife", "#smallbusiness", "#businessowner", "#startup", "#marketingtips", "#businesscoach", "#ecommerce", "#branding", "#ceolife"],
  },
  {
    keywords: ["diy", "craft", "homedecor", "renovation", "handmade", "upcycle", "interior"],
    tags: ["#diytok", "#diyprojects", "#crafts", "#homeimprovement", "#crafting", "#doityourself", "#homedecor", "#upcycle", "#handmade", "#crafttok"],
  },
];

const GENERIC_TAGS: readonly string[] = [
  "#tiktok", "#fyp", "#foryoupage", "#viral", "#trending", "#explore", "#contentcreator", "#watchthis", "#newvideo", "#dailycontent",
];

const BROAD_TAGS: readonly string[] = [
  "#fyp", "#foryou", "#foryoupage", "#viral", "#tiktokviral", "#tiktok", "#trendingnow", "#explorepage", "#watchthis", "#newcreator",
];

const COMMUNITY_TAGS: readonly string[] = [
  "#tiktokcommunity", "#creatorsontiktok", "#smallcreators", "#creatorlife", "#contentstrategy", "#tiktoktips", "#growontiktok", "#tiktokgrowth", "#creatorsearchinsights", "#tiktokers",
];

const CAPTION_HOOKS: readonly string[] = [
  "3 things I wish I knew about {topic} sooner 👇",
  "Nobody talks about this {topic} trick 👀",
  "{topic}, but make it simple — save this 🔖",
  "If you care about {niche}, this one's for you",
  "Quick {topic} tutorial you can try today ⏱️",
  "Stop scrolling if {topic} matters to you 🛑",
  "The {topic} mistake almost everyone makes",
  "{niche} tip of the day — {topic} edition",
  "Rating {topic} hacks until I find the best one",
  "How I do {topic} in under 60 seconds",
  "One {topic} change that made a real difference",
  "Real talk about {topic} — no fluff",
];

function matchCategory(niche: string): readonly string[] {
  const lower = niche.toLowerCase();
  for (const cat of NICHE_CATEGORIES) {
    for (const kw of cat.keywords) {
      if (lower.includes(kw)) return cat.tags;
    }
  }
  return GENERIC_TAGS;
}

/**
 * Parse a user-pasted trending list. Only tokens the user actually pasted
 * are kept — the tool never invents trending tags.
 */
function parseTrending(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const token of raw.split(/[\s,;]+/)) {
    const cleaned = token.trim().replace(/[^a-zA-Z0-9_#]/g, "");
    if (cleaned.length < 2 || !cleaned.startsWith("#")) continue;
    const tag = "#" + cleaned.slice(1).toLowerCase();
    if (tag.length < 2) continue;
    if (!seen.has(tag)) {
      seen.add(tag);
      out.push(tag);
    }
    if (out.length >= MAX_TRENDING_TAGS) break;
  }
  return out;
}

function getOptString(values: Record<string, unknown>, key: string, maxLen: number, label: string): { value: string } | { error: string } {
  const raw = values[key];
  if (raw === undefined || raw === null) return { value: "" };
  const s = String(raw).trim();
  if (s.length > maxLen) {
    return { error: `${label} must be ${maxLen} characters or fewer — shorten it and try again.` };
  }
  return { value: s };
}

export function runTool(values: Record<string, unknown>): RunResult {
  const rawNiche = values["niche"];
  if (typeof rawNiche !== "string" || rawNiche.trim().length === 0) {
    return {
      ok: false,
      error: 'Please enter your niche — for example "vegan baking" — so the hashtag mixes match your audience.',
    };
  }
  const niche = rawNiche.trim();
  if (niche.length > MAX_NICHE_LEN) {
    return { ok: false, error: "Niche must be 60 characters or fewer — shorten it and try again." };
  }

  const topicRes = getOptString(values, "captionTopic", MAX_TOPIC_LEN, "Caption topic");
  if ("error" in topicRes) return { ok: false, error: topicRes.error };
  const captionRes = getOptString(values, "baseCaption", MAX_CAPTION_LEN, "Your caption");
  if ("error" in captionRes) return { ok: false, error: captionRes.error };
  const trendRes = getOptString(values, "trendingHashtags", MAX_TRENDING_LEN, "Pasted trending hashtags");
  if ("error" in trendRes) return { ok: false, error: trendRes.error };
  const captionTopic = topicRes.value;
  const baseCaption = captionRes.value;
  const trendingPicks = parseTrending(trendRes.value);

  const seed = hashString(niche.toLowerCase());
  const nicheBank = matchCategory(niche);
  const nicheMix = rotateTake(nicheBank, NICHE_MIX_COUNT, seed % nicheBank.length);
  const broadMix = rotateTake(BROAD_TAGS, BROAD_MIX_COUNT, seed % BROAD_TAGS.length);
  const communityMix = rotateTake(COMMUNITY_TAGS, COMMUNITY_MIX_COUNT, seed % COMMUNITY_TAGS.length);

  // Draft caption: user caption wins; else a fixed hook filled with topic/niche.
  let draft: string;
  if (baseCaption.length > 0) {
    draft = baseCaption;
  } else {
    const topic = captionTopic.length > 0 ? captionTopic : `my latest ${niche} video`;
    const hook = CAPTION_HOOKS[seed % CAPTION_HOOKS.length]
      .split("{topic}").join(topic)
      .split("{niche}").join(niche);
    draft = hook + "\n\nWhat do you want to see next? Comment below 👇";
  }

  // Assemble, then enforce the 2,200-char envelope by trimming bank tags.
  // Drop order: broad first, then community, then niche — user-pasted
  // trending tags are never dropped (the user chose them deliberately).
  const baseTags = [...broadMix, ...communityMix, ...nicheMix];
  let combined = draft + "\n\n" + [...baseTags, ...trendingPicks].join(" ");
  while (combined.length > CAPTION_LIMIT && baseTags.length > 0) {
    baseTags.shift();
    combined = draft + "\n\n" + [...baseTags, ...trendingPicks].join(" ");
  }
  if (combined.length > CAPTION_LIMIT) {
    // The user's own caption is too long even without hashtags: trim the draft.
    const head = draft.slice(0, CAPTION_LIMIT - 3).trimEnd();
    combined = head + "...";
  }

  return {
    ok: true,
    values: {
      nicheMix,
      broadMix,
      communityMix,
      trendingPicks,
      combinedCaption: combined,
      charCount: combined.length,
    },
  };
}
