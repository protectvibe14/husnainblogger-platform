/**
 * TikTok Transition Idea Bank — pure logic (tool-171). Zero imports,
 * zero network, zero DOM, zero randomness.
 *
 * WORD BANK ENGINE (static idea bank; does not edit video):
 *   - TRANSITION_BANK: 24 hand-written transition ideas, each with a
 *     how-to and a difficulty level.
 *   - Difficulty levels: "in-app" (filmable with the TikTok app alone)
 *     and "advanced" (labelled "Needs CapCut or manual editing").
 *   - Selection is deterministic: a djb2 hash of the (lowercased, trimmed)
 *     niche picks the starting offset, then ideas are taken in bank order,
 *     wrapping around the bank.
 *   - This tool NEVER claims to perform transitions in the TikTok app and
 *     NEVER claims AI: it is a static idea bank.
 */

export interface TransitionIdea {
  /** Short name, e.g. "Snap Change". */
  name: string;
  /** One-line filming instruction. */
  howTo: string;
  /** "in-app" = filmable in TikTok; "advanced" = needs an editor. */
  level: "in-app" | "advanced";
}

/**
 * 24-entry static transition bank. Advanced entries MUST be labelled
 * "Needs CapCut or manual editing" in the output — the tool must never
 * imply the TikTok app can do these on its own.
 */
export const TRANSITION_BANK: TransitionIdea[] = [
  { name: "Snap Change", howTo: "Snap your fingers on the beat to hide the cut between scenes.", level: "in-app" },
  { name: "Whip Pan", howTo: "Pan the camera sideways fast and cut on the motion blur.", level: "in-app" },
  { name: "Outfit Change", howTo: "Cover the lens with your palm, cut, swap outfit, pull the palm away.", level: "in-app" },
  { name: "Object Pass", howTo: "Pass an object across the lens to wipe into the next shot.", level: "in-app" },
  { name: "Jump Cut", howTo: "Cut mid-gesture to skip dead air and keep the pace snappy.", level: "in-app" },
  { name: "Finger Click Cut", howTo: "Click twice: cut on the first click, resume the scene on the second.", level: "in-app" },
  { name: "Hand Swipe", howTo: "Swipe your hand across the frame; cut as it covers the lens.", level: "in-app" },
  { name: "Hat Drop", howTo: "Drop a hat toward the lens and cut the moment it fills the frame.", level: "in-app" },
  { name: "Spin Turn", howTo: "Spin 360 degrees and cut mid-spin into the new scene.", level: "in-app" },
  { name: "Clap Transition", howTo: "Clap once on camera, cut on the clap, continue the action.", level: "in-app" },
  { name: "Zoom Punch-In", howTo: "Punch the camera toward the subject and cut at the closest frame.", level: "in-app" },
  { name: "Toss and Catch", howTo: "Toss the object up, cut, catch it in a different location.", level: "in-app" },
  { name: "Hair Flip", howTo: "Flip your hair toward the lens; cut as it covers the frame.", level: "in-app" },
  { name: "Head Turn", howTo: "Turn your head sharply away and cut into the turned position.", level: "in-app" },
  { name: "Step Through", howTo: "Step toward the camera until the frame goes dark, cut, step back elsewhere.", level: "in-app" },
  { name: "Blanket Drop", howTo: "Drop a blanket over the lens, cut, lift it in the new scene.", level: "in-app" },
  { name: "Before/After Wipe", howTo: "Film both versions, then wipe between them on a vertical line in the editor.", level: "advanced" },
  { name: "Glitch Cut", howTo: "Slice the clip into 3-frame chunks and offset them for a glitch effect.", level: "advanced" },
  { name: "Light Flicker", howTo: "Flick the room lights off and on; cut on the dark frames for a flash transition.", level: "advanced" },
  { name: "Door Open", howTo: "Film opening a 'door' frame toward the lens; mask the second scene behind it.", level: "advanced" },
  { name: "Mirror Reveal", howTo: "Turn the phone away from a mirror and mask-blend into the reflected scene.", level: "advanced" },
  { name: "Stop Motion Cut", howTo: "Shoot frame-by-frame stills and step through them for a stop-motion cut.", level: "advanced" },
  { name: "Speed Ramp", howTo: "Ramp the speed down to a freeze, then ramp up into the new clip.", level: "advanced" },
  { name: "Slide Split", howTo: "Split the frame into sliding panels that reveal the next scene underneath.", level: "advanced" },
];

/** Number of ideas in the static bank (documented for QA). */
export const BANK_SIZE = TRANSITION_BANK.length; // 24

/** Niche options offered by the select input. */
export const NICHE_OPTIONS: string[] = [
  "Fashion",
  "Beauty",
  "Fitness",
  "Food & Drink",
  "Travel",
  "Comedy",
  "Lifestyle",
  "Education",
  "Gaming",
  "Pets",
  "Music & Dance",
  "DIY & Crafts",
];

/** Minimum/maximum number of transition ideas per run. */
export const COUNT_MIN = 1;
export const COUNT_MAX = 20;

/** Output label applied to advanced transitions. */
export const ADVANCED_LABEL = "Needs CapCut or manual editing";

/** djb2 string hash — deterministic offset into the bank. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function formatIdea(idea: TransitionIdea): string {
  const suffix =
    idea.level === "advanced"
      ? ` — ${ADVANCED_LABEL} (not possible in the TikTok app alone).`
      : "";
  return `${idea.name}: ${idea.howTo}${suffix}`;
}

export interface TransitionBankResult {
  ok: boolean;
  values?: { ideas: string[]; copyAll: string };
  error?: string;
}

/**
 * Generate transition ideas for a niche. Same niche + count always
 * returns the same ideas.
 */
export function runTool(values: Record<string, unknown>): TransitionBankResult {
  const rawNiche = values["niche"];
  if (typeof rawNiche !== "string" || rawNiche.trim().length === 0) {
    return { ok: false, error: "Please choose a niche first." };
  }
  const niche = rawNiche.trim();
  if (!NICHE_OPTIONS.includes(niche)) {
    return { ok: false, error: "Please choose one of the listed niches." };
  }

  const rawCount = values["transitionCount"];
  if (typeof rawCount !== "number" || !Number.isFinite(rawCount)) {
    return { ok: false, error: "Please enter how many transition ideas you want (1–20)." };
  }
  if (!Number.isInteger(rawCount)) {
    return { ok: false, error: "The number of ideas must be a whole number between 1 and 20." };
  }
  if (rawCount < COUNT_MIN || rawCount > COUNT_MAX) {
    return { ok: false, error: `Please pick between ${COUNT_MIN} and ${COUNT_MAX} transition ideas.` };
  }

  const offset = hashString(niche.toLowerCase()) % BANK_SIZE;
  const ideas: string[] = [];
  for (let i = 0; i < rawCount; i++) {
    ideas.push(formatIdea(TRANSITION_BANK[(offset + i) % BANK_SIZE]));
  }

  return {
    ok: true,
    values: {
      ideas,
      copyAll: ideas.join("\n"),
    },
  };
}
