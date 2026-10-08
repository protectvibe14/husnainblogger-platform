/**
 * Hashtag Mix Builder — core logic (tool-202).
 *
 * 100% client-side. Pure TypeScript, zero imports, zero network, zero DOM,
 * no Math.random. Deterministic: same inputs -> same outputs.
 *
 * ## What this does
 * Builder template calls `runTool({ items })`, where each item is
 * `{ niche, postType, goal }`. For every item the engine builds a balanced
 * 5-hashtag mix (Instagram's current recommended hashtag limit is 5) picked
 * deterministically from bundled curated niche pools, then returns a
 * ready-to-copy `#tag` block.
 *
 * ## Bundled pools (documented sizes)
 * 8 niche pools x 24 tags each (4 tiers x 6 tags per tier) = 192 curated tags,
 * plus a 24-tag generic fallback pool (4 tiers x 6). Total bundled: 216 tags.
 * Pools are curated STARTER mixes — they contain NO live volume, reach, or
 * popularity data (no API). Copy in the UI says exactly that.
 *
 * ## Tier templates per goal (5 slots)
 *   reach:     [broad, broad, medium, medium, niche]
 *   community: [niche, niche, community, community, medium]
 *   branded:   [community, niche, medium, medium, broad]
 * Slot i takes pool[tier][(itemIndex + slotIndex + postTypeOffset) % 6].
 * postType offsets: feed=0, reel=2, carousel=4, story=1 (fixed, documented).
 *
 * @module hashtag-mix-builder/logic
 */

export type HashtagTier = "broad" | "medium" | "niche" | "community";
export type PostType = "feed" | "reel" | "carousel" | "story";
export type MixGoal = "reach" | "community" | "branded";

/** One builder row from the UI. */
export interface HashtagItem {
  niche: string;
  postType: string;
  goal: string;
}

export interface MixSlot {
  slot: number;
  tag: string;
  tier: HashtagTier;
}

export interface HashtagMix {
  itemIndex: number;
  niche: string;
  postType: PostType;
  goal: MixGoal;
  slots: MixSlot[];
  readyToCopy: string;
  genericFallback: boolean;
}

/* ------------------------------------------------------------------ */
/* Bundled curated tag pools. 8 niches x 4 tiers x 6 tags = 192 tags,   */
/* plus GENERIC_POOL (4 tiers x 6 = 24). Curated starter mixes only —   */
/* NO live volume/reach data. Tags written without the leading '#'.     */
/* ------------------------------------------------------------------ */

const POOLS: Record<string, Record<HashtagTier, string[]>> = {
  fitness: {
    broad: ["fitness", "gym", "workout", "fit", "health", "exercise"],
    medium: ["fitnessmotivation", "gymlife", "fitfam", "workoutmotivation", "personaltrainer", "strengthtraining"],
    niche: ["morningworkout", "homeworkouts", "strengthandconditioning", "fitmom", "functionalfitness", "weightlossjourney"],
    community: ["fitnesscommunity", "gymrats", "fitlife", "trainhard", "fitnessjourney", "healthyhabits"],
  },
  food: {
    broad: ["food", "foodie", "instafood", "foodporn", "yummy", "delicious"],
    medium: ["foodphotography", "homecooking", "foodblogger", "easyrecipes", "comfortfood", "foodlover"],
    niche: ["mealprep", "veganrecipes", "bakingfromscratch", "streetfood", "brunchgoals", "onepotmeals"],
    community: ["foodcommunity", "cookingathome", "recipeshare", "foodiesofinstagram", "eatingwell", "kitchendiaries"],
  },
  travel: {
    broad: ["travel", "wanderlust", "travelgram", "instatravel", "vacation", "travelphotography"],
    medium: ["travelblogger", "solotravel", "budgettravel", "traveltheworld", "exploremore", "passportready"],
    niche: ["roadtrip", "hiddengems", "backpacking", "digitalnomad", "traveltips", "weekendgetaway"],
    community: ["travelcommunity", "travelholic", "roamtheplanet", "traveladdict", "globetrotter", "wanderoften"],
  },
  beauty: {
    broad: ["beauty", "makeup", "skincare", "beautytips", "cosmetics", "glowup"],
    medium: ["makeuplover", "skincareroutine", "beautyblogger", "makeupartist", "cleanbeauty", "selfcare"],
    niche: ["acnejourney", "koreanskincare", "naturalmakeup", "antiaging", "oily skin", "lipcare"],
    community: ["beautycommunity", "makeupaddict", "skincarecommunity", "glowingskin", "beautyroutine", "selfcaresunday"],
  },
  fashion: {
    broad: ["fashion", "style", "ootd", "fashionblogger", "outfit", "streetstyle"],
    medium: ["fashionista", "styleinspo", "lookbook", "mensfashion", "vintagestyle", "capsulewardrobe"],
    niche: ["thriftedfashion", "slowfashion", "minimaliststyle", "plussizefashion", "sneakerhead", "workwear"],
    community: ["fashioncommunity", "styleblogger", "ootdfashion", "fashionlover", "dailyoutfit", "stylediaries"],
  },
  business: {
    broad: ["business", "entrepreneur", "startup", "marketing", "success", "smallbusiness"],
    medium: ["businesstips", "entrepreneurlife", "startuplife", "digitalmarketing", "leadership", "onlinebusiness"],
    niche: ["sidehustle", "solopreneur", "smallbizowner", "businessgrowth", "freelancelife", "startupgrind"],
    community: ["entrepreneurmindset", "businessowner", "bossbabe", "hustlehard", "businesscommunity", "mindsetmatters"],
  },
  pets: {
    broad: ["pets", "dogs", "cats", "dogsofinstagram", "catsofinstagram", "petsofinstagram"],
    medium: ["doglovers", "catlovers", "puppylove", "kitten", "petphotography", "animallovers"],
    niche: ["dogtraining", "adoptdontshop", "rescuedog", "goldenretriever", "catmom", "rawfeeding"],
    community: ["petcommunity", "dogmom", "catdad", "furfamily", "petparent", "pawsofinstagram"],
  },
  photography: {
    broad: ["photography", "photooftheday", "photographer", "instaphoto", "photoshoot", "naturephotography"],
    medium: ["photographylovers", "portraitphotography", "streetphotography", "landscapephotography", "canonphotography", "mobilephotography"],
    niche: ["goldenhour", "longexposure", "astrophotography", "macrophotography", "filmisnotdead", "moodygrams"],
    community: ["photographycommunity", "shuttersquad", "visualsoflife", "capturethemoment", "photosociety", "creativesofinstagram"],
  },
};

const GENERIC_POOL: Record<HashtagTier, string[]> = {
  broad: ["instagram", "instagood", "photooftheday", "love", "instadaily", "explore"],
  medium: ["contentcreator", "socialmedia", "creators", "growoninstagram", "engagement", "newpost"],
  niche: ["postoftheday", "dailypost", "contentoftheday", "creativelife", "postdaily", "feedgoals"],
  community: ["communityovercompetition", "creatorssupportingcreators", "instagramcommunity", "smallcreators", "supportcreators", "creatorsunite"],
};

/** Ordered niche ids, used for error suggestions and the UI. */
export const NICHE_IDS: string[] = Object.keys(POOLS);

const POST_TYPES: PostType[] = ["feed", "reel", "carousel", "story"];
const POST_TYPE_OFFSETS: Record<PostType, number> = { feed: 0, reel: 2, carousel: 4, story: 1 };
const GOALS: MixGoal[] = ["reach", "community", "branded"];

/** Max hashtags per Instagram post (platform limit, enforced on output). */
export const MAX_HASHTAGS = 5;

const GOAL_TIER_TEMPLATES: Record<MixGoal, HashtagTier[]> = {
  reach: ["broad", "broad", "medium", "medium", "niche"],
  community: ["niche", "niche", "community", "community", "medium"],
  branded: ["community", "niche", "medium", "medium", "broad"],
};

/**
 * Build one hashtag mix for a validated item. Deterministic rotation:
 * slot i -> tier template row i, tag index (itemIndex + i + offset) % 6.
 */
export function buildMix(item: HashtagItem, itemIndex: number): HashtagMix {
  const nicheKey = item.niche.trim().toLowerCase();
  const postType = item.postType.trim().toLowerCase() as PostType;
  const goal = (item.goal.trim() === "" ? "reach" : item.goal.trim().toLowerCase()) as MixGoal;

  const genericFallback = !Object.prototype.hasOwnProperty.call(POOLS, nicheKey);
  const pool = genericFallback ? GENERIC_POOL : POOLS[nicheKey];
  const tierTemplate = GOAL_TIER_TEMPLATES[goal];
  const offset = POST_TYPE_OFFSETS[postType];

  const slots: MixSlot[] = tierTemplate.map((tier, i) => {
    const tags = pool[tier];
    const tag = tags[(itemIndex + i + offset) % tags.length];
    return { slot: i + 1, tag, tier };
  });

  return {
    itemIndex,
    niche: genericFallback ? "general" : nicheKey,
    postType,
    goal,
    slots,
    readyToCopy: slots.map((s) => `#${s.tag}`).join(" "),
    genericFallback,
  };
}

function validateItem(item: unknown, index: number): HashtagItem {
  const n = index + 1;
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new Error(`Item ${n}: each row must have niche, postType, and goal.`);
  }
  const row = item as Record<string, unknown>;
  const niche = typeof row.niche === "string" ? row.niche.trim() : "";
  if (niche === "") throw new Error(`Item ${n}: niche is required (pick one of: ${NICHE_IDS.join(", ")}).`);
  const postType = typeof row.postType === "string" ? row.postType.trim().toLowerCase() : "";
  if (!(POST_TYPES as string[]).includes(postType)) {
    throw new Error(`Item ${n}: postType must be one of feed, reel, carousel, story.`);
  }
  const rawGoal = typeof row.goal === "string" ? row.goal.trim().toLowerCase() : "";
  if (rawGoal !== "" && !(GOALS as string[]).includes(rawGoal)) {
    throw new Error(`Item ${n}: goal must be one of reach, community, branded.`);
  }
  return { niche, postType, goal: rawGoal === "" ? "reach" : rawGoal };
}

/**
 * Contract entry point. Builder template calls `runTool({ items })`.
 * Output ids match meta.ts outputs: mix, readyToCopy, copyNote.
 */
export function runTool(args: { items: Record<string, unknown>[] }): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!args || !Array.isArray(args.items) || args.items.length === 0) {
    return { ok: false, error: "Add at least one row (niche + post type + goal) to build a mix." };
  }
  if (args.items.length > 20) {
    return { ok: false, error: "Too many rows — keep it to 20 or fewer." };
  }

  try {
    const mixes = args.items.map((raw, i) => buildMix(validateItem(raw, i), i));

    const mix = mixes.map((m) =>
      m.slots.map((s) => `Slot ${s.slot} [${s.tier}]: #${s.tag}`).join("\n"),
    );

    const readyToCopy = mixes
      .map((m) => (mixes.length > 1 ? `Row ${m.itemIndex + 1} (${m.niche}): ${m.readyToCopy}` : m.readyToCopy))
      .join("\n");

    const usedFallback = mixes.some((m) => m.genericFallback);
    const copyNote =
      `Curated starter mixes from bundled pools (no live hashtag volume or reach data — Instagram publishes none publicly). ` +
      `Mixes are capped at ${MAX_HASHTAGS} hashtags per post. ` +
      (usedFallback
        ? `Unknown niche — a general pool was used instead; pick a listed niche for tailored tags. `
        : "") +
      `Swap any tag that does not fit your audience, and verify reach inside Instagram Insights.`;

    return { ok: true, values: { mix, readyToCopy, copyNote } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
