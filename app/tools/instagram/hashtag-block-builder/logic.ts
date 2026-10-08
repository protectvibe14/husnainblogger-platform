/**
 * Hashtag Block Builder — pure logic (tool-243), zero imports, zero
 * network, zero DOM.
 *
 * TEMPLATE ENGINE, NOT AI: builds ready-to-paste hashtag blocks from
 * hand-curated tag pools bundled in this file. No live hashtag data,
 * no search volume, no popularity stats — the tool cannot know which
 * tags are trending. Every block is a deterministic slice of a pool.
 *
 * Bundled pools:
 *   16 niches x 24 tags = 384 niche tags
 *   4 post types x 8 tags = 32 post-type tags
 *   416 tags total.
 *
 * Block assembly: pool = deduped(postType tags + niche tags); the main
 * block is the first `blockSize` tags; alt block 1 starts at offset
 * `blockSize`; alt block 2 at offset `2 * blockSize` (cycling with
 * modulo so blocks are always full and never repeat a tag).
 *
 * Deterministic: same inputs -> same outputs, always.
 */

export const MIN_BLOCK_SIZE = 1;
export const MAX_BLOCK_SIZE = 5;
export const ALT_BLOCK_COUNT = 2;
export const MAX_ITEMS = 10;

/** The 16 niches with bundled tag pools, in canonical order. */
export const NICHES = [
  "fitness",
  "fashion",
  "food",
  "travel",
  "beauty",
  "photography",
  "pets",
  "business",
  "motivation",
  "parenting",
  "gaming",
  "realestate",
  "homedecor",
  "skincare",
  "wedding",
  "finance",
] as const;

export type NicheId = (typeof NICHES)[number];
export type PostTypeId = "reel" | "carousel" | "photo" | "story";

export const POST_TYPES: PostTypeId[] = ["reel", "carousel", "photo", "story"];

/** Niche tag pools — 24 hand-picked generic tags each (384 total). */
const NICHE_POOLS: Record<NicheId, string[]> = {
  fitness: ["fitness","gym","workout","fitfam","fitnessmotivation","gymlife","personaltrainer","healthylifestyle","exercise","muscle","strengthtraining","cardio","fit","gymmotivation","health","wellness","training","fitnessjourney","bodybuilding","fitlife","workoutmotivation","gymrat","getfit","active"],
  fashion: ["fashion","style","ootd","fashionblogger","instafashion","outfit","streetstyle","fashionista","styleinspo","lookbook","fashionweek","trendy","chic","fashionstyle","outfitinspo","fashionlover","styleblogger","fashiondaily","modafashion","fashiongram","styleoftheday","fashionaddict","clothing","newcollection"],
  food: ["food","foodie","foodporn","instafood","foodblogger","yummy","delicious","foodphotography","homecooking","recipe","foodlover","dinner","lunch","breakfast","dessert","foodstagram","cooking","eat","tasty","foodgasm","chef","homemade","healthyfood","comfortfood"],
  travel: ["travel","travelgram","wanderlust","instatravel","travelphotography","vacation","travelblogger","adventure","explore","traveltheworld","holiday","traveldiaries","passportready","traveler","roamtheplanet","traveladdict","beautifuldestinations","getaway","tourism","travelbug","seetheworld","travelling","travelholic","vacationmode"],
  beauty: ["beauty","makeup","beautyblogger","mua","makeupartist","skincare","cosmetics","beautytips","glam","makeupaddict","instabeauty","beautycommunity","makeupoftheday","lashes","lipstick","eyeshadow","glowingskin","makeuplover","beautyroutine","foundation","contour","highlighter","makeupjunkie","beautyguru"],
  photography: ["photography","photooftheday","photographer","instaphoto","photoshoot","portrait","landscape","canon","nikon","photo","streetphotography","naturephotography","portraitphotography","fotograf","photographerlife","visualsoflife","shutterbug","capture","igers","moodygrams","photoart","lensculture","snapshot","picture"],
  pets: ["pets","petsofinstagram","dog","cat","dogsofinstagram","catsofinstagram","puppy","kitten","doglover","catlover","petstagram","animals","instadog","instacat","doglife","pet","cutepet","furbaby","dogmom","catmom","petphotography","animalsofinstagram","pupper","meow"],
  business: ["business","entrepreneur","smallbusiness","startup","marketing","businessowner","success","entrepreneurship","money","hustle","businesswoman","businessman","branding","socialmediamarketing","onlinebusiness","businessmindset","ceo","leadership","sales","growth","ecommerce","businesslife","workfromhome","businesscoach"],
  motivation: ["motivation","motivationalquotes","inspiration","mindset","quotes","success","positivevibes","inspire","goals","dream","believe","motivational","selflove","positivity","growthmindset","ambition","nevergiveup","dreambig","motivationmonday","inspirationalquotes","lifelessons","keepgoing","manifest","goodvibes"],
  parenting: ["parenting","momlife","dadlife","parenthood","kids","motherhood","fatherhood","family","momblogger","parentingtips","toddlerlife","newmom","babygirl","babyboy","kidsactivities","momsofinstagram","dadsofinstagram","familyfirst","raisingkids","momlifeisthebestlife","parentlife","gentleparenting","momcommunity","familytime"],
  gaming: ["gaming","gamer","videogames","gamergirl","esports","playstation","xbox","pcgaming","nintendo","twitch","gamingcommunity","retrogaming","gamelife","ps5","fortnite","minecraft","gamememes","streamer","gamingsetup","indiegame","cosplay","gameon","mobilegaming","xboxseriesx"],
  realestate: ["realestate","realtor","realestateagent","property","homeforsale","luxuryhomes","househunting","investment","newhome","realestateinvesting","dreamhome","mortgage","listing","homesweethome","realestatelife","justlisted","openhouse","forsale","homebuyers","propertyinvestment","luxuryrealestate","realestateinvestor","house","home"],
  homedecor: ["homedecor","interior","interiordesign","home","homestyle","decoration","homedecoration","interiorstyling","decor","homeinspo","livingroomdecor","bedroomdecor","cozyhome","minimalist","boho","farmhousestyle","moderninterior","kitchendecor","walldecor","interiorinspo","homedesign","apartmenttherapy","decorinspo","diyhomedecor"],
  skincare: ["skincare","skincarecommunity","glowingskin","skincareaddict","skinfirst","selfcare","cleanbeauty","skincareroutine","serum","moisturizer","spf","exfoliate","retinol","hyaluronicacid","skincaretips","glassskin","niacinamide","dermatologist","naturalskincare","kbeauty","antiaging","acne","dry","sensitiveskin"],
  wedding: ["wedding","bride","weddingday","weddingphotography","weddinginspiration","weddingplanning","groom","bridetobe","weddingdress","weddingdecor","engagement","love","weddingideas","destinationwedding","weddingphotographer","justmarried","weddingseason","bridal","weddingvenue","weddingdetails","marriage","weddingflowers","happilyeverafter","sayingido"],
  finance: ["finance","money","investing","financialfreedom","personalfinance","wealth","budget","stockmarket","crypto","moneytips","financialplanning","debtfree","savingmoney","passiveincome","investor","financialliteracy","moneymindset","fintech","trading","retirement","moneymanagement","budgettips","frugal","buildwealth"],
};

/** Post-type bonus tags — 8 each (32 total), prepended to niche pools. */
const POST_TYPE_POOLS: Record<PostTypeId, string[]> = {
  reel: ["reels","reelsinstagram","reelitfeelit","reelsvideo","trendingreels","reelsviral","reelsdaily","exploremore"],
  carousel: ["carousel","carouseldesign","swipeleft","carouselpost","instacarousel","carouselcreator","carouselinspiration","swipe"],
  photo: ["photooftheday","instagood","picoftheday","photo","photoeveryday","instadaily","snapshot","picture"],
  story: ["instastory","stories","storytime","instastories","story","storyoftheday","dailystories","storymode"],
};

export const BANK_SIZES = {
  niches: NICHES.length,
  tagsPerNiche: NICHE_POOLS.fitness.length,
  nicheTagsTotal: NICHES.length * NICHE_POOLS.fitness.length,
  postTypeTagsTotal: POST_TYPES.length * POST_TYPE_POOLS.reel.length,
};

export interface HashtagItem {
  niche: string;
  postType: string;
  blockSize: unknown;
}

export interface BuiltBlock {
  itemIndex: number;
  niche: NicheId;
  postType: PostTypeId;
  blockSize: number;
  block: string;
  altBlocks: string[];
}

export interface BuildResult {
  blocks: BuiltBlock[];
  warnings: string[];
  /** Always true — reminds consumers these are curated pools, not live data. */
  isTemplateBased: true;
}

export const ASSUMPTIONS: string[] = [
  "Hashtags come from fixed bundled pools (384 niche tags + 32 post-type tags) — the tool has no live data on tag volume, reach, or what is trending.",
  "Blocks are intentionally small (1-5 tags) and well under Instagram's per-post tag cap; this tool does not look up or claim the platform's current limit.",
  "A block never guarantees reach — tag choice is a small factor compared to content quality and audience fit.",
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isNiche(s: string): s is NicheId {
  return (NICHES as readonly string[]).includes(s);
}

function isPostType(s: string): s is PostTypeId {
  return (POST_TYPES as readonly string[]).includes(s);
}

/** Deduped combined pool: post-type tags first, then niche tags. */
export function combinedPool(niche: NicheId, postType: PostTypeId): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of [...POST_TYPE_POOLS[postType], ...NICHE_POOLS[niche]]) {
    if (!seen.has(tag)) {
      seen.add(tag);
      out.push(tag);
    }
  }
  return out;
}

/**
 * Build blocks for a list of items. Throws on invalid input; blockSize
 * above the max is CLAMPED (with a warning) per spec edge case.
 */
export function buildBlocks(items: HashtagItem[]): BuildResult {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Add at least one item to build hashtag blocks.");
  }
  if (items.length > MAX_ITEMS) {
    throw new Error(`Too many items — the max is ${MAX_ITEMS} per run.`);
  }

  const warnings: string[] = [];
  const blocks: BuiltBlock[] = [];

  items.forEach((item, idx) => {
    const n = idx + 1;
    if (!item || typeof item !== "object") {
      throw new Error(`Item ${n}: invalid item — expected niche, postType and blockSize.`);
    }

    const nicheRaw = typeof item.niche === "string" ? item.niche.trim() : "";
    if (nicheRaw.length === 0) {
      throw new Error(`Item ${n}: niche is required.`);
    }
    const nicheNorm = normalize(nicheRaw);
    if (!isNiche(nicheNorm)) {
      throw new Error(
        `Item ${n}: niche "${nicheRaw}" is not in the bundled pool. Supported niches: ${NICHES.join(", ")}.`
      );
    }

    const postTypeRaw = typeof item.postType === "string" ? item.postType.trim() : "";
    if (postTypeRaw.length === 0) {
      throw new Error(`Item ${n}: postType is required.`);
    }
    const postTypeNorm = normalize(postTypeRaw);
    if (!isPostType(postTypeNorm)) {
      throw new Error(
        `Item ${n}: postType "${postTypeRaw}" is not supported. Valid post types: ${POST_TYPES.join(", ")}.`
      );
    }

    let size: number;
    const rawSize = item.blockSize;
    if (typeof rawSize === "number" && Number.isFinite(rawSize)) {
      size = rawSize;
    } else if (typeof rawSize === "string" && rawSize.trim() !== "") {
      size = Number(rawSize.trim());
    } else {
      throw new Error(`Item ${n}: blockSize is required (a whole number from ${MIN_BLOCK_SIZE} to ${MAX_BLOCK_SIZE}).`);
    }
    if (!Number.isInteger(size) || size < MIN_BLOCK_SIZE) {
      throw new Error(`Item ${n}: blockSize must be a whole number from ${MIN_BLOCK_SIZE} to ${MAX_BLOCK_SIZE}.`);
    }
    if (size > MAX_BLOCK_SIZE) {
      warnings.push(`Item ${n}: blockSize clamped to ${MAX_BLOCK_SIZE} (the max per block).`);
      size = MAX_BLOCK_SIZE;
    }

    const pool = combinedPool(nicheNorm, postTypeNorm);
    const take = (start: number): string[] => {
      const tags: string[] = [];
      for (let k = 0; k < size; k++) {
        tags.push(pool[(start + k) % pool.length]);
      }
      return tags;
    };
    const format = (tags: string[]): string => tags.map((t) => `#${t}`).join(" ");

    const altBlocks: string[] = [];
    for (let a = 1; a <= ALT_BLOCK_COUNT; a++) {
      altBlocks.push(format(take(a * size)));
    }

    blocks.push({
      itemIndex: n,
      niche: nicheNorm,
      postType: postTypeNorm,
      blockSize: size,
      block: format(take(0)),
      altBlocks,
    });
  });

  return { blocks, warnings, isTemplateBased: true };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Platform entry point (builder). args: { items: [{ niche, postType, blockSize }] }.
 * Returns { lines, alternates, warnings, count }.
 */
export function runTool(args: { items?: unknown[] }): RunToolResult {
  try {
    const result = buildBlocks((args.items ?? []) as unknown as HashtagItem[]);
    return {
      ok: true,
      values: {
        lines: result.blocks.map((b) => b.block),
        alternates: result.blocks.flatMap((b) =>
          b.altBlocks.map((alt, i) => `Item ${b.itemIndex} · alt ${i + 1}: ${alt}`)
        ),
        warnings: result.warnings,
        count: result.blocks.length,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
