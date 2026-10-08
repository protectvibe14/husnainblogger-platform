/**
 * Pinterest Hashtag Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Returns hashtag suggestions in this order: topic-derived tags first
 * (specific beats generic), then tags from a fixed curated bank. No AI, no
 * model output — and no live data: the tool cannot check real hashtag
 * popularity or volume, so the `note` output always labels the results as
 * curated suggestions, not live trend data.
 *
 * Fixed content banks (documented per the builder honesty contract):
 * - TOPIC suffixes: 4 fixed suffixes ("Ideas", "Tips", "Inspiration", "DIY")
 *   combined with the user's own topic words — the only "banked" part that
 *   touches the topic
 * - CURATED_TAGS: 48 hand-picked generic Pinterest hashtags
 * Total fixed strings: 4 + 48 = 52.
 *
 * Deterministic: curated tags are taken in rotation from
 * hash(topic) % 48 — same topic + count always yields the identical list.
 * No Math.random.
 *
 * Normalization: tags are camelCase with no spaces or special characters.
 */

export const MAX_TOPIC_LEN = 80;
export const MAX_COUNT = 20;
export const DEFAULT_COUNT = 10;
export const MAX_TAG_LEN = 35;

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** "small balcony garden" -> "smallBalconyGarden". */
function toTagBase(s: string): string {
  const words = s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "";
  return words[0] + words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

const TOPIC_SUFFIXES: string[] = ["Ideas", "Tips", "Inspiration", "DIY"];

/** 48 hand-picked generic Pinterest hashtags (alphabetical, fixed order). */
const CURATED_TAGS: string[] = [
  "#ArtInspiration", "#BeachVacation", "#BeautyTips", "#BirthdayParty", "#BucketList",
  "#BudgetDecor", "#BulletJournal", "#CatMom", "#ChristmasIdeas", "#CrochetPattern",
  "#DogLover", "#EasyRecipes", "#FallDecor", "#FashionInspo", "#FitnessMotivation",
  "#GardeningTips", "#HalloweenIdeas", "#HealthyLifestyle", "#HealthyRecipes", "#HolidayDecor",
  "#HomeDecor", "#HomeOrganization", "#IndoorPlants", "#InteriorDesign", "#KidsActivities",
  "#KnittingLove", "#MakeupIdeas", "#MealPrep", "#MorningRoutine", "#OrganizationHacks",
  "#OutfitIdeas", "#ParentingTips", "#PartyIdeas", "#PhotoIdeas", "#PhotographyTips",
  "#PlantLover", "#Recipes", "#SelfCare", "#SewingProjects", "#SkincareRoutine",
  "#SmallSpaceLiving", "#SpringDecor", "#StudyTips", "#ThriftFlip", "#TravelInspo",
  "#Wanderlust", "#WatercolorArt", "#WeddingIdeas",
];

/** Single broad words that signal a topic too generic for specific tags. */
const BROAD_WORDS: string[] = [
  "food", "art", "diy", "home", "fashion", "beauty", "travel", "wedding", "decor",
  "fitness", "recipes", "style", "crafts", "garden", "pets", "kids", "hair",
  "nails", "tattoos", "quotes",
];

function parseCount(raw: unknown): { count: number } | { error: string } {
  if (raw === undefined || raw === null || raw === "") return { count: DEFAULT_COUNT };
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { error: "Tag count must be a whole number between 1 and 20." };
  }
  if (n < 1 || n > MAX_COUNT) {
    return { error: `Tag count must be between 1 and ${MAX_COUNT}.` };
  }
  return { count: n };
}

export function runTool(values: Record<string, unknown>): RunResult {
  const topicRaw = values["topic"];
  const topic = typeof topicRaw === "string" ? topicRaw.trim().replace(/\s+/g, " ") : "";
  if (!topic) {
    return { ok: false, error: "Please enter a topic for your hashtags." };
  }
  if (topic.length > MAX_TOPIC_LEN) {
    return { ok: false, error: `Topic is too long (max ${MAX_TOPIC_LEN} characters).` };
  }

  const parsed = parseCount(values["count"]);
  if ("error" in parsed) {
    return { ok: false, error: parsed.error };
  }
  const { count } = parsed;

  const base = toTagBase(topic);
  if (!base) {
    return { ok: false, error: "Your topic needs at least one letter or number to build hashtags." };
  }

  const seen = new Set<string>();
  const hashtags: string[] = [];
  const add = (tag: string) => {
    if (hashtags.length >= count) return;
    if (tag.length > MAX_TAG_LEN + 1) return; // +1 for the leading #
    const key = tag.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    hashtags.push(tag);
  };

  // 1. Topic-derived tags first (specific > generic).
  add("#" + base);
  for (const suffix of TOPIC_SUFFIXES) add("#" + base + suffix);

  // 2. Curated bank in deterministic rotation.
  const start = hashStr(base) % CURATED_TAGS.length;
  for (let i = 0; i < CURATED_TAGS.length && hashtags.length < count; i++) {
    add(CURATED_TAGS[(start + i) % CURATED_TAGS.length]);
  }

  const noteParts: string[] = [
    "Curated suggestions, not live trend data — this tool cannot check real hashtag popularity or volume.",
    "Pinterest recommends a few relevant tags per pin (2–5); put the most specific ones first.",
  ];
  const isSingleWord = topic.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/).length === 1;
  if (isSingleWord && BROAD_WORDS.includes(topic.toLowerCase().replace(/[^a-z]/g, ""))) {
    noteParts.push(
      `“${topic}” is a very broad topic — you will get better reach by narrowing it, e.g. “${topic} for small apartments” or “easy ${topic} for beginners”.`,
    );
  }

  return {
    ok: true,
    values: {
      hashtags,
      note: noteParts.join(" "),
    },
  };
}
