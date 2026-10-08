/**
 * Pinterest Niche Idea Generator — pure logic (tool-364). Zero imports,
 * zero network, zero DOM.
 *
 * WHAT THIS IS: deterministic matching against a curated niche-pattern
 * bank — 24 Pinterest-native niches (listed below), each with interest
 * keywords, an angle template, and a fit rationale. The user's interests
 * are tokenized and scored against each niche's keywords; the top 6
 * score, ties broken by bank order. No AI, no market data, no claim to
 * know which niches are profitable.
 *
 * HONESTY (spec edge cases):
 * - Vague interests (best score < 2 keyword hits) -> the tool still
 *   returns its best suggestions but adds a clarifier listing interest
 *   areas to pick from, so the user can refine.
 * - Non-visual niches (finance, coding, crypto, ...) get an honest
 *   handicap note: Pinterest rewards visual, searchable categories.
 *
 * Inputs: interests (string, required), audience (optional — one of
 *         US/UK/CA/AU; blank defaults to "US/UK/CA/AU" per user rule).
 * Deterministic: same inputs -> same outputs.
 */

export interface NichePattern {
  name: string;
  keywords: string[];
  angle: string;
  rationale: string;
}

/**
 * The niche-pattern bank.
 * SIZE: 24 niches. All are Pinterest-native (visual / searchable).
 * Nothing here is market data — these are pattern templates.
 */
export const NICHE_BANK: NichePattern[] = [
  { name: "Home Decor", keywords: ["home", "decor", "interior", "furniture", "cozy", "living room"],
    angle: "Room-by-room makeover guides with before/after pins and shoppable lists.",
    rationale: "One of Pinterest's largest search categories; every room refresh is pin-worthy." },
  { name: "DIY & Crafts", keywords: ["diy", "crafts", "handmade", "craft", "upcycle", "makers"],
    angle: "Step-by-step photo tutorials for weekend projects under $20.",
    rationale: "Tutorial content is Pinterest's native format — savers collect projects for later." },
  { name: "Recipes & Meal Prep", keywords: ["recipes", "cooking", "food", "meal", "baking", "kitchen", "dinner"],
    angle: "5-ingredient weeknight recipes with overhead process shots.",
    rationale: "Food is evergreen on Pinterest; recipe pins get saved and re-cooked for years." },
  { name: "Fashion & Outfits", keywords: ["fashion", "outfits", "style", "clothes", "wardrobe", "ootd"],
    angle: "Capsule-wardrobe outfit formulas by season and occasion.",
    rationale: "Outfit collages are among the most-saved pin formats on the platform." },
  { name: "Beauty & Skincare", keywords: ["beauty", "skincare", "makeup", "skin", "cosmetics"],
    angle: "Routine breakdowns: morning/night skincare by skin type.",
    rationale: "Highly visual before/after and routine content performs strongly in search." },
  { name: "Wedding Planning", keywords: ["wedding", "bride", "bridesmaid", "engaged", "bridal"],
    angle: "Inspiration boards per wedding style: budget breakdowns included.",
    rationale: "Pinterest is the default wedding-planning tool — planners save for months." },
  { name: "Gardening", keywords: ["garden", "plants", "gardening", "houseplants", "plant"],
    angle: "Month-by-month planting calendars and small-space garden ideas.",
    rationale: "Seasonal and evergreen at once; gardeners plan a full season ahead." },
  { name: "Fitness & Workouts", keywords: ["fitness", "workout", "exercise", "gym", "yoga", "running"],
    angle: "Printable 4-week workout plans with form-check illustrations.",
    rationale: "Plan-style pins get saved as personal programs — high save intent." },
  { name: "Travel", keywords: ["travel", "vacation", "trips", "itinerary", "wanderlust", "destinations"],
    angle: "3-day itineraries with map-style pins and budget tiers.",
    rationale: "Trip planners save itineraries months before booking — long pin lifespan." },
  { name: "Parenting", keywords: ["parenting", "kids", "baby", "toddler", "mom", "children"],
    angle: "Activity printables and milestone checklists for busy parents.",
    rationale: "Parents are heavy Pinterest searchers for activities, parties, and school help." },
  { name: "Organization & Decluttering", keywords: ["organization", "organizing", "declutter", "storage", "tidy", "minimalist"],
    angle: "Room-by-room declutter checklists with storage product roundups.",
    rationale: "Before/after organization pins are a proven high-save format." },
  { name: "Budget Living", keywords: ["budget", "frugal", "saving", "money saving", "thrifty", "cheap"],
    angle: "Monthly budget templates and no-spend challenge trackers.",
    rationale: "Printable money tools get saved and shared; pairs well with meal-prep content." },
  { name: "Photography", keywords: ["photography", "photos", "camera", "photo", "portrait"],
    angle: "Pose guides and editing presets with side-by-side examples.",
    rationale: "Visual learners save pose and preset guides for their next shoot." },
  { name: "Planners & Journaling", keywords: ["journal", "planner", "planning", "bullet journal", "stationery"],
    angle: "Printable weekly spreads and habit-tracker templates.",
    rationale: "Printables are a top-performing pin category with strong save intent." },
  { name: "Hair Styles", keywords: ["hair", "hairstyles", "haircut", "hairstyle", "braids"],
    angle: "Step-by-step hairstyle tutorials for short, medium, and long hair.",
    rationale: "Tutorial pins for hair get saved for salon visits and events." },
  { name: "Nail Art", keywords: ["nails", "nail art", "manicure", "nail"],
    angle: "Seasonal nail design galleries with DIY steps.",
    rationale: "Extremely visual, trend-driven, and heavily searched by season." },
  { name: "Tattoos", keywords: ["tattoo", "tattoos", "ink", "tattooed"],
    angle: "Curated tattoo idea galleries by placement and style.",
    rationale: "Idea galleries are pure save-bait — users collect for years before booking." },
  { name: "Quotes & Motivation", keywords: ["quotes", "motivation", "motivational", "inspiration", "mindset"],
    angle: "Designed quote cards grouped by theme (morning, work, fitness).",
    rationale: "Simple, endlessly repinnable, and cheap to produce at volume." },
  { name: "Party Planning", keywords: ["party", "birthday", "baby shower", "shower", "celebration"],
    angle: "Theme party kits: decor, menu, and timeline per theme.",
    rationale: "Event planners save everything — high planning intent months out." },
  { name: "Small Business & Etsy", keywords: ["etsy", "small business", "side hustle", "handmade business", "entrepreneur"],
    angle: "Product photography tips and shop-launch checklists for makers.",
    rationale: "Maker audiences overlap heavily with Pinterest's DIY and shopping users." },
  { name: "Home Buying & Real Estate", keywords: ["home buying", "real estate", "house hunting", "first home", "mortgage"],
    angle: "First-time buyer checklists and neighborhood guide pins.",
    rationale: "Weaker visually than decor, but buyers save checklists and inspo side by side." },
  { name: "Self-Care & Wellness", keywords: ["self care", "wellness", "mental health", "selfcare", "mindfulness"],
    angle: "Self-care routine cards: 10-minute resets and Sunday rituals.",
    rationale: "Routine and checklist formats fit Pinterest's save-for-later behavior." },
  { name: "Dogs & Pets", keywords: ["dogs", "pets", "cats", "puppy", "dog", "kitten"],
    angle: "Training tip cards and pet-care checklists with cute photography.",
    rationale: "Pet content is universally engaging; training guides add search value." },
  { name: "Holiday & Seasonal Decor", keywords: ["christmas", "halloween", "holiday", "seasonal", "easter", "thanksgiving"],
    angle: "Year-round seasonal calendar: decor and hosting per holiday.",
    rationale: "Seasonal planners start saving months early — the highest planning intent on Pinterest." },
];

/** Bank size, documented for the honesty contract. */
export const NICHE_BANK_SIZE = 24;

/** How many ideas are returned per run. */
export const IDEAS_RETURNED = 6;

/** Minimum keyword hits for interests to count as "specific" (edge case). */
export const MIN_HITS_FOR_SPECIFIC = 2;

/** Valid audience options; blank defaults to ALL_AUDIENCES. */
export const AUDIENCE_OPTIONS = ["US", "UK", "CA", "AU"];
export const ALL_AUDIENCES = "US/UK/CA/AU";

/** Hints that the user's interests are non-visual (honest handicap note). */
export const NON_VISUAL_HINTS = [
  "finance", "crypto", "stocks", "forex", "trading",
  "coding", "programming", "software", "devops", "api",
  "tax", "accounting", "insurance", "legal", "law",
  "b2b", "saas", "consulting", "recruiting",
];

/** Clarifier picks offered when interests are too vague. */
export const CLARIFIER_PICKS = [
  "home & decor", "food & recipes", "fashion & beauty",
  "DIY & crafts", "travel & outdoors", "parenting & family",
  "fitness & wellness", "weddings & events", "gardening & plants",
  "money & budgeting",
];

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3);
}

/** Score one niche: count of keyword phrases matched by interest tokens. */
function scoreNiche(niche: NichePattern, tokens: string[], raw: string): { score: number; hits: string[] } {
  const lowerRaw = " " + raw.toLowerCase() + " ";
  let score = 0;
  const hits: string[] = [];
  for (const kw of niche.keywords) {
    const phraseHit = lowerRaw.includes(kw);
    const tokenHit = kw.split(" ").every((part) => tokens.includes(part));
    if (phraseHit || tokenHit) {
      score += 1;
      hits.push(kw);
    }
  }
  return { score, hits };
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export interface NicheIdeaValues {
  ok: boolean;
  values?: {
    nicheIdeas: { columns: string[]; rows: string[][] };
    ideaCount: number;
    audienceUsed: string;
    guidance: string;
  };
  error?: string;
}

export function runTool(values: Record<string, unknown>): NicheIdeaValues {
  const interestsRaw = values["interests"];
  if (!isNonEmptyString(interestsRaw)) {
    return { ok: false, error: "Please describe your interests (e.g. home decor, baking, travel)." };
  }
  const interests = interestsRaw.trim();

  let audience = ALL_AUDIENCES;
  const audienceRaw = values["audience"];
  if (typeof audienceRaw === "string" && audienceRaw.trim().length > 0) {
    const a = audienceRaw.trim().toUpperCase();
    if (!AUDIENCE_OPTIONS.includes(a)) {
      return { ok: false, error: "Audience must be one of US, UK, CA, or AU (or leave blank)." };
    }
    audience = a;
  }

  const tokens = tokenize(interests);
  const scored = NICHE_BANK.map((niche, index) => ({
    niche,
    index,
    ...scoreNiche(niche, tokens, interests),
  }));
  scored.sort((a, b) => (b.score - a.score) || (a.index - b.index));

  const bestScore = scored[0].score;
  const vague = bestScore < MIN_HITS_FOR_SPECIFIC;

  // Vague edge case: return fewer, clearly-labeled exploratory picks.
  const picked = vague ? scored.slice(0, 3) : scored.slice(0, IDEAS_RETURNED);

  const rows = picked.map(({ niche, hits }) => [
    niche.name,
    niche.angle,
    `Matches your interest in "${hits.slice(0, 3).join('", "') || interests}". ${niche.rationale}`,
  ]);

  const lower = interests.toLowerCase();
  const nonVisual = NON_VISUAL_HINTS.some((hint) => lower.includes(hint));

  let guidance: string;
  if (vague) {
    guidance =
      "Your interests were too vague to match confidently, so these are exploratory picks. " +
      "Choose one area to get sharper ideas: " + CLARIFIER_PICKS.join(", ") + ".";
  } else if (nonVisual) {
    guidance =
      "Honest note: '" + interests + "' leans non-visual, which is a handicap on Pinterest — " +
      "the platform rewards visual, searchable categories. The ideas above are the closest " +
      "visual fits; expect slower traction than a naturally visual niche.";
  } else {
    guidance =
      `These ${rows.length} ideas are pattern templates matched to your interests for a ${audience} audience — ` +
      "not market data and not a profitability claim. Validate demand with Pinterest Trends and search volume before committing.";
  }

  return {
    ok: true,
    values: {
      nicheIdeas: { columns: ["Niche", "Angle", "Why it fits"], rows },
      ideaCount: rows.length,
      audienceUsed: audience,
      guidance,
    },
  };
}
