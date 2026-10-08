/**
 * TikTok Green Screen Idea Generator — pure logic (tool-178).
 * Zero imports, zero network, zero DOM, zero randomness.
 *
 * WORDBANK ENGINE (fixed templates, fully client-side — NOT AI):
 *   - HOOK_BANK: 10 fixed hook templates referencing the user's niche and
 *     background asset.
 *   - ASSET_BANK: 8 fixed background-asset descriptions (2 per
 *     backgroundType: article, screenshot, map, chart).
 *   - BEAT_BANK: 6 fixed script-beat structures (hook, zoom, take, proof, CTA).
 *   - CONCEPT_TITLES: 5 fixed concept framings ("Debunk", "React", ...).
 *   Selection is DETERMINISTIC: a djb2 hash of (niche + "|" + backgroundType)
 *   picks the starting offsets; concepts cycle through the banks with no
 *   randomness — same inputs always produce the same 5 concepts.
 *   The tool generates text concepts only; it never edits video.
 *   The copyright note reminds users to use their own screenshots or
 *   licensed images for backgrounds (spec edge case).
 */

/** Fixed hook templates. Bank size: 10. */
export const HOOK_BANK: string[] = [
  "The {niche} headline everyone is misreading",
  "Stop scrolling — this {niche} {asset} changes everything",
  "POV: you finally understand {niche}",
  "Nobody is talking about this {niche} {asset}",
  "The {niche} mistake costing people money",
  "I asked {niche} creators and they all pointed at this",
  "Rating this viral {niche} claim — with receipts",
  "The {niche} number that shocked me",
  "Why {niche} changed this week, explained in 30 seconds",
  "I found the {niche} data nobody wants you to see",
];

/**
 * Fixed background-asset descriptions. Bank size: 8 (2 per backgroundType).
 * Every asset assumes the user supplies their own material.
 */
export const ASSET_BANK: Record<string, string[]> = {
  article: [
    "news article screenshot — circle the headline, highlight the key paragraph",
    "blog post screenshot — zoom on the quote everyone is arguing about",
  ],
  screenshot: [
    "your own screenshot of {niche} stats — circle the key number",
    "phone screenshot of {niche} results — blur names, highlight the outcome",
  ],
  map: [
    "annotated map graphic — arrows pointing at {niche} hotspots",
    "zoomed map screenshot — hand-drawn circles around the areas that matter",
  ],
  chart: [
    "bar chart comparing {niche} numbers — circle the peak bar",
    "line chart showing the {niche} trend — annotate the spike",
  ],
};

/** Fixed script-beat structures. Bank size: 6. */
export const BEAT_BANK: string[][] = [
  ["Hook (0–3s): read the circled part out loud", "Zoom into the highlighted section", "Give your take: agree or disagree and why", "CTA: follow for daily {niche} breakdowns"],
  ["Hook (0–3s): point at the most shocking part", "Explain what the background shows in one sentence", "Add the context the screenshot misses", "CTA: comment your take"],
  ["Hook (0–3s): ask the question the background answers", "Walk through the background left to right", "Drop one stat or example as proof", "CTA: save this for later"],
  ["Hook (0–3s): react honestly to what you see", "Pause on the part everyone skips", "Compare it to the common {niche} advice", "CTA: share with someone learning {niche}"],
  ["Hook (0–3s): state the myth, then reveal the background", "Break the background into 3 labeled parts", "Explain what each part means for {niche} beginners", "CTA: follow for part 2"],
  ["Hook (0–3s): show the before — then swipe the background", "Narrate the change the background proves", "Give one actionable {niche} tip from it", "CTA: try it and report back"],
];

/** Fixed concept framings. Bank size: 5. */
export const CONCEPT_TITLES: string[] = [
  "Debunk",
  "React",
  "Explain",
  "Compare",
  "Teach",
];

/** The four supported background types (spec validation). */
export const BACKGROUND_TYPES = ["article", "screenshot", "map", "chart"] as const;

export const IDEA_COUNT = 5;

export const COPYRIGHT_NOTE =
  "Use your own screenshots or licensed images as green-screen backgrounds — " +
  "don't screen-record copyrighted news sites, paywalled articles, or other creators' content.";

/** Deterministic djb2 hash — picks bank offsets, never Math.random. */
export function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function fill(template: string, niche: string, asset: string): string {
  return template.replaceAll("{niche}", niche).replaceAll("{asset}", asset);
}

export interface GreenScreenConcept {
  title: string;
  hook: string;
  background: string;
  beats: string[];
}

/** Builds 5 deterministic green-screen concepts for a niche + background type. */
export function generateConcepts(niche: string, backgroundType: string): GreenScreenConcept[] {
  const assets = ASSET_BANK[backgroundType];
  const seed = hashString(`${niche}|${backgroundType}`);
  const concepts: GreenScreenConcept[] = [];
  for (let i = 0; i < IDEA_COUNT; i++) {
    const asset = fill(assets[(seed + i) % assets.length], niche, "");
    const assetShort = backgroundType === "article" ? "article" : backgroundType;
    concepts.push({
      title: CONCEPT_TITLES[(seed + i) % CONCEPT_TITLES.length],
      hook: fill(HOOK_BANK[(seed + i * 3) % HOOK_BANK.length], niche, assetShort),
      background: asset,
      beats: BEAT_BANK[(seed + i * 2) % BEAT_BANK.length].map((b) => fill(b, niche, "")),
    });
  }
  return concepts;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const nicheRaw = values["niche"];
  const typeRaw = values["backgroundType"];
  if (typeof nicheRaw !== "string" || nicheRaw.trim().length === 0) {
    return {
      ok: false,
      error: "Please enter your niche first — the ideas are built around it.",
    };
  }
  if (
    typeof typeRaw !== "string" ||
    !(BACKGROUND_TYPES as readonly string[]).includes(typeRaw)
  ) {
    return {
      ok: false,
      error: `Please pick a background type: ${BACKGROUND_TYPES.join(", ")}.`,
    };
  }
  const niche = nicheRaw.trim();
  const concepts = generateConcepts(niche, typeRaw);
  const lines = concepts.map((c, i) => {
    const beats = c.beats.map((b, j) => `  ${j + 1}. ${b}`).join("\n");
    return `Concept ${i + 1} — ${c.title}\nHook: ${c.hook}\nBackground: ${c.background}\nScript beats:\n${beats}`;
  });
  return {
    ok: true,
    values: {
      concepts: lines,
      copyrightNote: COPYRIGHT_NOTE,
    },
  };
}
