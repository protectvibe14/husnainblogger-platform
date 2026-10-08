/**
 * B-Roll Shot List Generator (tool-276) — pure logic, zero imports, zero
 * network, zero DOM. Deterministic: same inputs always produce the same list.
 *
 * Honesty: this is NOT AI generation. Shots are assembled from curated,
 * hand-written shot banks — 4 video types x 24 shots each = 96 shot entries
 * total. The topic is inserted verbatim into the description templates; no
 * model personalizes anything. Durations and shoot-time notes are heuristic
 * estimates, labeled as estimates.
 *
 * Selection rule (deterministic): seed = sum of char codes of the
 * lower-cased topic; start index = seed % 24; shots are taken consecutively
 * from the bank, wrapping around. Same topic + videoType + count always
 * yields the same list.
 *
 * Shot bank sizes (documented per contract): tutorial 24, vlog 24, ad 24,
 * documentary 24. If shotCount > 24 the bank cycles and a warning is added.
 */

export interface BRollShot {
  description: string;
  angle: string;
  movement: string;
  duration: string;
}

export interface BRollResult {
  shots: BRollShot[];
  coverageChecklist: string[];
  warnings: string[];
}

type ShotCategory = "wide" | "detail" | "motion" | "people" | "pov";

interface BankEntry {
  d: string; // description template, "{t}" = topic slot
  a: string; // angle
  m: string; // movement
  dur: string; // heuristic duration, an estimate
  c: ShotCategory;
}

const CATEGORY_LABELS: Record<ShotCategory, string> = {
  wide: "Wide / establishing",
  detail: "Detail / macro",
  motion: "Motion / dynamic",
  people: "Hands / people",
  pov: "POV / screen",
};

const CATEGORY_ORDER: ShotCategory[] = ["wide", "detail", "motion", "people", "pov"];

// 24 curated entries per video type (96 total). "{t}" is replaced with the topic.
const BANKS: Record<string, BankEntry[]> = {
  tutorial: [
    { d: "Wide establishing shot of the {t} workspace, everything in place", a: "Eye level", m: "Static tripod", dur: "4-6 s", c: "wide" },
    { d: "Overhead flat-lay of every tool and material used for {t}", a: "Top-down", m: "Slow push-in", dur: "5 s", c: "wide" },
    { d: "Hands beginning the first step of {t}, mid-action", a: "45-degree angle", m: "Static tripod", dur: "4 s", c: "people" },
    { d: "Macro close-up of texture or detail central to {t}", a: "Close macro", m: "Rack focus", dur: "3-4 s", c: "detail" },
    { d: "Side profile of the process of {t} in motion", a: "Side profile", m: "Slider left to right", dur: "5 s", c: "motion" },
    { d: "Over-the-shoulder view as the {t} step is performed", a: "Over-the-shoulder", m: "Static tripod", dur: "4 s", c: "pov" },
    { d: "Close-up of a common mistake to avoid in {t}", a: "Close macro", m: "Static tripod", dur: "3 s", c: "detail" },
    { d: "Hands adjusting or fine-tuning part of {t}", a: "Three-quarter", m: "Slow push-in", dur: "4 s", c: "people" },
    { d: "Wide shot showing before-and-after of {t} side by side", a: "Eye level", m: "Static tripod", dur: "4 s", c: "wide" },
    { d: "Detail of tools lined up for the next {t} step", a: "Low angle", m: "Pan left to right", dur: "4 s", c: "detail" },
    { d: "Walking gimbal shot circling the {t} setup", a: "Eye level", m: "Gimbal orbit", dur: "5-6 s", c: "motion" },
    { d: "Point-of-view shot of doing {t} with your own hands", a: "Point-of-view", m: "Handheld", dur: "4 s", c: "pov" },
    { d: "Extreme close-up of the key moment in {t}", a: "Close macro", m: "Slow push-in", dur: "3 s", c: "detail" },
    { d: "Medium shot of the presenter demonstrating {t}", a: "Eye level", m: "Static tripod", dur: "4 s", c: "people" },
    { d: "Top-down timelapse-style sweep of {t} progressing", a: "Top-down", m: "Static tripod", dur: "4 s", c: "motion" },
    { d: "Detail shot of the finished {t} result, hero angle", a: "45-degree angle", m: "Slow pull-out", dur: "5 s", c: "detail" },
    { d: "Wide shot of the full {t} station from the doorway", a: "Eye level", m: "Static tripod", dur: "4 s", c: "wide" },
    { d: "Close-up of hands cleaning up after {t}", a: "Three-quarter", m: "Static tripod", dur: "3 s", c: "people" },
    { d: "Slow-motion detail of the most satisfying {t} moment", a: "Side profile", m: "Static tripod (slow-mo)", dur: "4 s", c: "motion" },
    { d: "Screen or notebook POV showing the {t} plan or checklist", a: "Point-of-view", m: "Tilt down", dur: "3 s", c: "pov" },
    { d: "Low-angle hero shot of the completed {t} project", a: "Low angle", m: "Slow push-in", dur: "5 s", c: "wide" },
    { d: "Insert shot: ingredient, part, or input going into {t}", a: "Close macro", m: "Static tripod", dur: "3 s", c: "detail" },
    { d: "Presenter hands gesturing over the {t} result, explaining", a: "Medium", m: "Static tripod", dur: "4 s", c: "people" },
    { d: "Final wide pull-back revealing the whole {t} scene", a: "Eye level", m: "Slow pull-out", dur: "5 s", c: "wide" },
  ],
  vlog: [
    { d: "Wide establishing shot of the location for today's {t} vlog", a: "Eye level", m: "Static tripod", dur: "4-5 s", c: "wide" },
    { d: "Walking shot of feet or street leading into the {t} scene", a: "Low angle", m: "Tracking forward", dur: "4 s", c: "motion" },
    { d: "Detail of coffee, food, or object that starts the {t} day", a: "Close macro", m: "Rack focus", dur: "3 s", c: "detail" },
    { d: "Over-the-shoulder of checking the phone or plan for {t}", a: "Over-the-shoulder", m: "Static handheld", dur: "3 s", c: "pov" },
    { d: "Wide shot of the room or street where {t} happens", a: "Eye level", m: "Slow pan", dur: "5 s", c: "wide" },
    { d: "Hands grabbing keys, bag, or gear for {t}", a: "Three-quarter", m: "Whip pan", dur: "3 s", c: "people" },
    { d: "Point-of-view walking into the {t} location", a: "Point-of-view", m: "Handheld walk", dur: "5 s", c: "pov" },
    { d: "Detail of signage, menu, or labels related to {t}", a: "Straight-on", m: "Slow push-in", dur: "3 s", c: "detail" },
    { d: "Candid medium shot of laughing or reacting during {t}", a: "Eye level", m: "Static handheld", dur: "4 s", c: "people" },
    { d: "Gimbal follow shot moving through the {t} environment", a: "Eye level", m: "Gimbal follow", dur: "6 s", c: "motion" },
    { d: "Close-up of hands interacting with something in {t}", a: "45-degree angle", m: "Static tripod", dur: "3 s", c: "detail" },
    { d: "Wide sunset or skyline shot to mark time in the {t} day", a: "Eye level", m: "Static tripod", dur: "5 s", c: "wide" },
    { d: "Top-down of the table spread during {t}", a: "Top-down", m: "Slow orbit", dur: "4 s", c: "motion" },
    { d: "Selfie-style POV talking while walking to {t}", a: "Point-of-view", m: "Handheld walk", dur: "4 s", c: "pov" },
    { d: "Detail of textures: fabric, food, or surfaces in {t}", a: "Close macro", m: "Slow pan", dur: "3 s", c: "detail" },
    { d: "Wide shot of friends or people around during {t}", a: "Eye level", m: "Static tripod", dur: "4 s", c: "people" },
    { d: "Low-angle shot looking up at the {t} location", a: "Low angle", m: "Tilt up", dur: "4 s", c: "wide" },
    { d: "Hands holding the camera POV entering a new {t} spot", a: "Point-of-view", m: "Handheld", dur: "3 s", c: "pov" },
    { d: "Slow-motion candid moment from the {t} day", a: "Side profile", m: "Static tripod (slow-mo)", dur: "4 s", c: "motion" },
    { d: "Close-up of a small meaningful object from {t}", a: "Close macro", m: "Rack focus", dur: "3 s", c: "detail" },
    { d: "Wide night or evening shot closing the {t} vlog", a: "Eye level", m: "Static tripod", dur: "5 s", c: "wide" },
    { d: "Overhead of packing up or winding down after {t}", a: "Top-down", m: "Static tripod", dur: "4 s", c: "people" },
    { d: "POV of the drive or walk home from {t}", a: "Point-of-view", m: "Handheld", dur: "4 s", c: "pov" },
    { d: "Final detail: lights, sky, or quiet moment after {t}", a: "Eye level", m: "Slow pull-out", dur: "5 s", c: "detail" },
  ],
  ad: [
    { d: "Hero wide shot of the product in a perfect {t} setting", a: "Eye level", m: "Slow push-in", dur: "4-5 s", c: "wide" },
    { d: "Macro of the product's best detail for {t}", a: "Close macro", m: "Rack focus", dur: "3 s", c: "detail" },
    { d: "Hands unboxing or revealing the {t} product", a: "Three-quarter", m: "Static tripod", dur: "4 s", c: "people" },
    { d: "Product rotating on a turntable for {t} showcase", a: "Eye level", m: "Gimbal orbit", dur: "5 s", c: "motion" },
    { d: "Lifestyle wide: product in real {t} use", a: "Eye level", m: "Static tripod", dur: "4 s", c: "wide" },
    { d: "Close-up of the product solving the {t} problem", a: "45-degree angle", m: "Slow push-in", dur: "4 s", c: "detail" },
    { d: "Over-the-shoulder of a customer using it for {t}", a: "Over-the-shoulder", m: "Static tripod", dur: "4 s", c: "pov" },
    { d: "Dynamic whip-pan transition into the {t} product", a: "Eye level", m: "Whip pan", dur: "2-3 s", c: "motion" },
    { d: "Detail of packaging or branding for {t}", a: "Straight-on", m: "Slow pan", dur: "3 s", c: "detail" },
    { d: "Happy customer close-up reacting to {t} results", a: "Medium", m: "Static tripod", dur: "3 s", c: "people" },
    { d: "Wide aspirational shot: the {t} lifestyle the product enables", a: "Eye level", m: "Crane up", dur: "5 s", c: "wide" },
    { d: "POV of tapping, clicking, or opening the {t} product", a: "Point-of-view", m: "Handheld", dur: "3 s", c: "pov" },
    { d: "Slow-motion splash, drop, or motion moment for {t}", a: "Side profile", m: "Static tripod (slow-mo)", dur: "4 s", c: "motion" },
    { d: "Split detail: before and after using the product for {t}", a: "Close macro", m: "Static tripod", dur: "4 s", c: "detail" },
    { d: "Hands holding the product up to camera for {t}", a: "Straight-on", m: "Slow push-in", dur: "3 s", c: "people" },
    { d: "Wide studio-style shot of the product for {t}", a: "Eye level", m: "Static tripod", dur: "4 s", c: "wide" },
    { d: "Tracking shot following the product in {t} action", a: "Side profile", m: "Tracking", dur: "5 s", c: "motion" },
    { d: "Extreme detail of materials or craftsmanship for {t}", a: "Close macro", m: "Slow pull-out", dur: "4 s", c: "detail" },
    { d: "POV scrolling the offer or landing page for {t}", a: "Point-of-view", m: "Tilt down", dur: "3 s", c: "pov" },
    { d: "Group lifestyle shot: people enjoying {t} together", a: "Eye level", m: "Static tripod", dur: "4 s", c: "people" },
    { d: "Low-angle power shot of the product for {t}", a: "Low angle", m: "Slow push-in", dur: "4 s", c: "wide" },
    { d: "Quick-cut montage beats of {t} in use (3 micro-shots)", a: "Mixed", m: "Whip pan", dur: "3 s", c: "motion" },
    { d: "Final hero: product centered with {t} context blurred behind", a: "Eye level", m: "Rack focus", dur: "4 s", c: "detail" },
    { d: "End-card wide: product, logo space, and {t} tagline framing", a: "Eye level", m: "Static tripod", dur: "4 s", c: "wide" },
  ],
  documentary: [
    { d: "Wide establishing shot of the {t} location at golden hour", a: "Eye level", m: "Static tripod", dur: "6 s", c: "wide" },
    { d: "Slow pan across the {t} environment, taking in context", a: "Eye level", m: "Slow pan", dur: "6 s", c: "wide" },
    { d: "Detail of an object that tells the {t} story", a: "Close macro", m: "Rack focus", dur: "4 s", c: "detail" },
    { d: "Hands of a subject working within the {t} story", a: "Three-quarter", m: "Static tripod", dur: "5 s", c: "people" },
    { d: "Archival-style still or document related to {t}", a: "Straight-on", m: "Slow push-in", dur: "4 s", c: "detail" },
    { d: "Wide shot of daily life continuing around {t}", a: "Eye level", m: "Static tripod", dur: "5 s", c: "wide" },
    { d: "Close-up of a subject's face listening during {t}", a: "Medium", m: "Static tripod", dur: "4 s", c: "people" },
    { d: "Tracking shot walking through the {t} location", a: "Eye level", m: "Tracking forward", dur: "6 s", c: "motion" },
    { d: "Detail of textures: walls, tools, or nature in {t}", a: "Close macro", m: "Slow pan", dur: "4 s", c: "detail" },
    { d: "Over-the-shoulder of a subject looking at {t} evidence", a: "Over-the-shoulder", m: "Static tripod", dur: "4 s", c: "pov" },
    { d: "Aerial-feel wide of the broader {t} landscape", a: "Bird's-eye", m: "Slow pull-out", dur: "6 s", c: "wide" },
    { d: "Silhouette or shadow shot evoking the {t} mood", a: "Side profile", m: "Static tripod", dur: "5 s", c: "motion" },
    { d: "Hands holding a photograph or artifact from {t}", a: "Close macro", m: "Static tripod", dur: "4 s", c: "detail" },
    { d: "Medium shot of an interview subject in their {t} space", a: "Eye level", m: "Static tripod", dur: "5 s", c: "people" },
    { d: "Time-lapse-feel static shot of {t} activity", a: "Eye level", m: "Static tripod", dur: "5 s", c: "motion" },
    { d: "POV of reading or examining {t} material", a: "Point-of-view", m: "Tilt down", dur: "4 s", c: "pov" },
    { d: "Wide shot of the {t} location in different light", a: "Eye level", m: "Slow pan", dur: "6 s", c: "wide" },
    { d: "Detail of small rituals or habits tied to {t}", a: "Close macro", m: "Static tripod", dur: "4 s", c: "detail" },
    { d: "People interacting naturally within the {t} story", a: "Eye level", m: "Static handheld", dur: "5 s", c: "people" },
    { d: "Slow push-in on the key {t} location", a: "Eye level", m: "Slow push-in", dur: "6 s", c: "motion" },
    { d: "Close-up of eyes or expression reacting to {t}", a: "Close macro", m: "Static tripod", dur: "4 s", c: "people" },
    { d: "Wide night shot of the {t} location, lights on", a: "Eye level", m: "Static tripod", dur: "6 s", c: "wide" },
    { d: "Final detail: a quiet object that closes the {t} story", a: "Close macro", m: "Slow pull-out", dur: "5 s", c: "detail" },
    { d: "Closing wide pull-back from the {t} world", a: "Eye level", m: "Slow pull-out", dur: "6 s", c: "wide" },
  ],
};

const GENERIC_WORDS = new Set([
  "video", "videos", "vlog", "vlogs", "content", "broll", "b-roll",
  "stuff", "thing", "things", "my video", "youtube video", "shorts",
  "reel", "reels", "footage", "clip", "clips", "project",
]);

const BANK_SIZE = 24;

function seedFromTopic(topic: string): number {
  let sum = 0;
  const lower = topic.toLowerCase();
  for (let i = 0; i < lower.length; i++) sum += lower.charCodeAt(i);
  return sum;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawTopic = values["topic"];
  const rawType = values["videoType"];
  const rawCount = values["shotCount"];

  const topic = typeof rawTopic === "string" ? rawTopic.trim() : "";
  if (!topic) {
    return { ok: false, error: "Please enter a topic — e.g. 'making sourdough bread'." };
  }

  const videoType = typeof rawType === "string" ? rawType.trim().toLowerCase() : "";
  const bank = BANKS[videoType];
  if (!bank) {
    return { ok: false, error: "Pick a video type: tutorial, vlog, ad, or documentary." };
  }

  let shotCount = 8; // default
  if (rawCount !== undefined && rawCount !== null && rawCount !== "") {
    const n = typeof rawCount === "number" ? rawCount : Number(rawCount);
    if (!Number.isFinite(n) || Math.floor(n) !== n) {
      return { ok: false, error: "Shot count must be a whole number between 3 and 30." };
    }
    shotCount = n;
  }
  if (shotCount < 3 || shotCount > 30) {
    return { ok: false, error: "Shot count must be between 3 and 30." };
  }

  const warnings: string[] = [];
  const topicLower = topic.toLowerCase();
  if (topic.length < 4 || GENERIC_WORDS.has(topicLower)) {
    warnings.push(
      "Your topic looks vague, so this list uses generic shots. Add specifics (e.g. 'pour-over coffee brewing') for a better-tailored list."
    );
  }
  if (shotCount > BANK_SIZE) {
    warnings.push(
      `This video type's curated bank holds ${BANK_SIZE} shots, so the list cycles from the top to reach ${shotCount}.`
    );
  }
  if (shotCount > 18) {
    warnings.push(
      `${shotCount} shots is a big shoot: one person typically needs 3-5 hours to film this many setups (estimate, not a guarantee).`
    );
  }

  const seed = seedFromTopic(topic);
  const start = seed % BANK_SIZE;
  const shots: BRollShot[] = [];
  const covered: Record<ShotCategory, number[]> = {
    wide: [], detail: [], motion: [], people: [], pov: [],
  };

  for (let i = 0; i < shotCount; i++) {
    const entry = bank[(start + i) % BANK_SIZE];
    shots.push({
      description: entry.d.split("{t}").join(topic),
      angle: entry.a,
      movement: entry.m,
      duration: entry.dur,
    });
    covered[entry.c].push(i + 1);
  }

  const coverageChecklist: string[] = [];
  for (const cat of CATEGORY_ORDER) {
    const idx = covered[cat];
    if (idx.length > 0) {
      coverageChecklist.push(
        `\u2713 ${CATEGORY_LABELS[cat]} coverage: ${idx.length} shot${idx.length === 1 ? "" : "s"} (#${idx.join(", #")})`
      );
    } else {
      coverageChecklist.push(
        `\u2717 ${CATEGORY_LABELS[cat]} coverage: none in this list — consider adding 1-2 for a complete edit.`
      );
    }
  }

  const result: BRollResult = { shots, coverageChecklist, warnings };
  return { ok: true, values: result as unknown as Record<string, unknown> };
}
