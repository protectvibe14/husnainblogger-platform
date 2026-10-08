/**
 * tool-218 — Location Tag Idea Generator (generator).
 *
 * HONESTY: Fully client-side curated ideas from FIXED pools — NOT a live
 * venue or location-tag search. It never queries Instagram or any map data.
 *
 * Word banks (documented sizes):
 *   VENUE_TYPES   — 24 fixed venue-type ideas
 *   TAG_STRATEGIES — 8 fixed tag-strategy notes
 *
 * Pure TypeScript: zero imports, no DOM, no network, no Math.random.
 * Deterministic: same inputs -> same outputs, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** 24 venue-type ideas. {niche} and {city} slots filled at runtime. */
const VENUE_TYPES: ReadonlyArray<string> = [
  "Local coffee shops{nicheTail} in {place}",
  "Co-working spaces in {place}",
  "Neighborhood brunch spots in {place}",
  "Farmers markets{nicheTail} in {place}",
  "Independent bookstores in {place}",
  "Boutique gyms and fitness studios in {place}",
  "Art galleries and pop-up exhibits in {place}",
  "Rooftop bars with city views in {place}",
  "Well-known parks and gardens in {place}",
  "Local bakeries{nicheTail} in {place}",
  "Thrift and vintage stores in {place}",
  "Yoga and wellness studios in {place}",
  "Popular food-truck rows in {place}",
  "Historic downtown streets in {place}",
  "Shopping districts in {place}",
  "Beach and waterfront spots in {place}",
  "Music venues and event halls in {place}",
  "Coworking-friendly cafes in {place}",
  "Landmark bridges and viewpoints in {place}",
  "Neighborhood flea markets in {place}",
  "Trendy dessert cafes in {place}",
  "Hotel lobbies and lounges in {place}",
  "Universities and campuses in {place}",
  "Famous restaurants locals recommend in {place}",
];

/** 8 fixed tag strategies appended to each idea. */
const TAG_STRATEGIES: ReadonlyArray<string> = [
  "Tag the venue itself when you post from there — check-ins from the place outperform generic city tags.",
  "Tag the neighborhood instead of the city for a less crowded location page.",
  "Tag a well-known nearby landmark to borrow traffic from its location page.",
  "Rotate between 2–3 locations so your posts spread across several location feeds.",
  "Use the exact business name as it appears on Instagram, not a nickname.",
  "Pair the location tag with niche hashtags to double up on discovery.",
  "Re-use your best-performing location on similar posts and compare reach.",
  "Avoid tagging places you have never been — mismatched geotags hurt trust.",
];

function parseCount(value: unknown): number | null {
  if (value === undefined || value === null || String(value).trim() === "") return 5;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isInteger(n) || n < 1 || n > 10) return null;
  return n;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const niche = String(values.niche ?? "").trim();
  if (niche === "") {
    return { ok: false, error: "Enter your niche (e.g. fitness, food, travel) to get location tag ideas." };
  }

  const count = parseCount(values.count);
  if (count === null) {
    return { ok: false, error: "Choose between 1 and 10 location ideas." };
  }

  const city = String(values.city ?? "").trim();
  const place = city === "" ? "your area" : city;
  const nicheTail = ` for ${niche.toLowerCase()}`;

  const locationIdeas: string[] = [];
  const seed = niche.length;
  for (let i = 0; i < count; i++) {
    const venueTemplate = VENUE_TYPES[(seed + i * 7) % VENUE_TYPES.length];
    const strategy = TAG_STRATEGIES[(seed + i * 3) % TAG_STRATEGIES.length];
    const venue = venueTemplate.split("{place}").join(place).split("{nicheTail}").join(nicheTail);
    locationIdeas.push(`${venue} — ${strategy}`);
  }

  return {
    ok: true,
    values: {
      locationIdeas,
      copyAll: locationIdeas.join("\n"),
      note: "Curated ideas from a fixed pool — not a live venue or location-tag search.",
    },
  };
}
