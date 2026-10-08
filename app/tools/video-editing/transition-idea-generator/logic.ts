/**
 * logic.ts — Transition Idea Generator (tool-281)
 *
 * Pure, deterministic engine. ZERO imports.
 *
 * What this honestly is: a curated content bank of 30 video transitions,
 * each with hand-written CapCut how-to steps (human instructions, not AI).
 * The engine applies fixed matching rules over your two scene descriptions:
 *
 *   1. If both scenes describe the same thing (case-insensitive match),
 *      only the 5 "match-cut" family transitions are suggested (a match cut
 *      hides the cut by matching framing/motion across identical scenes).
 *   2. Energy filter: "calm" excludes punchy-only transitions (whip pan,
 *      glitch, hard zoom punch, spin whip, shake cut). "punchy" keeps the
 *      full bank but ranks punchy transitions first.
 *   3. Keyword boost: if a scene mentions motion/speed, indoor, outdoor,
 *      day, night, zoom, or object terms, transitions tagged with the same
 *      concept rank higher. This is fixed string matching, not AI.
 *
 * BANK SIZE: 30 transitions across 6 families
 *   match-cut (5), smooth (6), punchy (6), mask (4), creative (5), retro (4)
 *
 * Output is deterministic: same inputs always produce the same list.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

interface Transition {
  name: string;
  family: "match-cut" | "smooth" | "punchy" | "mask" | "creative" | "retro";
  energy: "calm" | "punchy" | "both";
  difficulty: "easy" | "medium" | "advanced";
  capcutHowTo: string;
  tags: string[];
}

const BANK: Transition[] = [
  // --- match-cut family (5) ---
  { name: "Hand Swipe Match Cut", family: "match-cut", energy: "both", difficulty: "easy",
    capcutHowTo: "End clip A swiping your hand across the lens; start clip B with your hand already across the lens, then swipe away. Trim both clips so the hand motion lines up on one frame and delete the gap between them.",
    tags: ["indoor", "outdoor", "motion"] },
  { name: "Object Match Cut", family: "match-cut", energy: "both", difficulty: "easy",
    capcutHowTo: "Frame the same object in the same screen position at the end of clip A and the start of clip B. Cut hard from A to B with no transition effect; add a 2-frame crossfade if the lighting differs.",
    tags: ["object", "indoor", "day"] },
  { name: "Spin Frame Match", family: "match-cut", energy: "punchy", difficulty: "medium",
    capcutHowTo: "Rotate your phone or body mid-scene at the end of clip A; start clip B mid-rotation. In CapCut use Effects > Video effects > Spin at low intensity over the cut frame to smooth the join.",
    tags: ["motion", "outdoor", "day"] },
  { name: "Snap Zoom Match Cut", family: "match-cut", energy: "punchy", difficulty: "medium",
    capcutHowTo: "Snap-zoom into a subject at the end of clip A; start clip B already zoomed in, then punch back out. Stack the two clips with zero gap; the matching zoom hides the cut.",
    tags: ["zoom", "motion", "outdoor"] },
  { name: "Clap Sync Cut", family: "match-cut", energy: "both", difficulty: "easy",
    capcutHowTo: "Clap once on camera at the end of clip A and once at the start of clip B. Line up the audio spikes on the timeline and cut exactly on the spike — the identical sound masks the visual cut.",
    tags: ["indoor", "day", "night"] },
  // --- smooth family (6) ---
  { name: "Soft Dissolve", family: "smooth", energy: "calm", difficulty: "easy",
    capcutHowTo: "Tap the transition icon between the clips in CapCut, choose Camera > Camera In set to 0.5-0.8 seconds, or use Basic > Dissolve at 0.4s. Works best between shots of similar brightness.",
    tags: ["indoor", "outdoor", "day"] },
  { name: "Dip to Black", family: "smooth", energy: "calm", difficulty: "easy",
    capcutHowTo: "Add a 0.3s Dip to Black transition between clips (Basic > Fade in CapCut). Use it only at scene or mood changes — overuse makes pacing feel slow.",
    tags: ["night", "indoor"] },
  { name: "Dip to White", family: "smooth", energy: "both", difficulty: "easy",
    capcutHowTo: "Select Basic > Fade to White at 0.2-0.3s. Ideal when moving from a dark scene to a bright one, or to fake a flash of light.",
    tags: ["day", "outdoor", "night"] },
  { name: "Soft Blur Crossfade", family: "smooth", energy: "calm", difficulty: "medium",
    capcutHowTo: "Overlay the last 0.5s of both clips; add the Blur effect at 60% to clip A's tail and animate it from 0 to 60. It mimics a dreamy rack-focus blend.",
    tags: ["indoor", "day", "night"] },
  { name: "Luma Fade", family: "smooth", energy: "both", difficulty: "medium",
    capcutHowTo: "Duplicate clip A's last 10 frames over clip B's first 10 frames; set blend mode to Screen and animate opacity 100 to 0. The bright areas of A bloom into B.",
    tags: ["day", "outdoor", "night"] },
  { name: "Slow Push In", family: "smooth", energy: "calm", difficulty: "easy",
    capcutHowTo: "Apply CapCut's Basic > Push transition at 0.6s or longer, or keyframe Scale from 100 to 110 across the cut. Keep movement slow and steady for a calm flow.",
    tags: ["outdoor", "indoor", "day"] },
  // --- punchy family (6) ---
  { name: "Whip Pan", family: "punchy", energy: "punchy", difficulty: "medium",
    capcutHowTo: "Whip your camera sideways at the end of clip A and start clip B mid-whip. In CapCut add Camera > Camera Out at 0.25s between them and align the blur direction.",
    tags: ["motion", "outdoor", "day"] },
  { name: "Zoom Punch", family: "punchy", energy: "punchy", difficulty: "easy",
    capcutHowTo: "In CapCut tap the transition icon, choose Camera > Zoom In at 0.2-0.3s. Place it on beat drops or punchline moments, never on slow talking-head footage.",
    tags: ["zoom", "motion"] },
  { name: "Glitch Cut", family: "punchy", energy: "punchy", difficulty: "medium",
    capcutHowTo: "Cut hard with no transition; add Effects > Party > Glitch for 0.2s straddling the cut, plus a quick RGB-split photo overlay if you want it dirtier.",
    tags: ["night", "motion", "object"] },
  { name: "Shake Cut", family: "punchy", energy: "punchy", difficulty: "easy",
    capcutHowTo: "Add the Shake transition (Camera category) at 0.25s between the clips. Use sparingly — once or twice per video — or it loses impact.",
    tags: ["motion", "outdoor"] },
  { name: "Flash Frame Spin", family: "punchy", energy: "punchy", difficulty: "advanced",
    capcutHowTo: "Export 3 white frames, place one frame at the cut point, and add a 0.15s Spin transition. The flash-plus-spin hides even large subject jumps.",
    tags: ["motion", "day", "night"] },
  { name: "Light Leak Swipe", family: "punchy", energy: "punchy", difficulty: "medium",
    capcutHowTo: "Overlay a light-leak stock clip on the cut, set blend mode to Screen, and animate its position across the frame in 0.3s. Best for sunny or golden-hour footage.",
    tags: ["day", "outdoor", "motion"] },
  // --- mask family (4) ---
  { name: "Mask Expand Reveal", family: "mask", energy: "both", difficulty: "advanced",
    capcutHowTo: "Freeze the last frame of clip A; draw a circle mask over your subject and keyframe the mask radius from 0 to full over 0.4s to reveal clip B inside it.",
    tags: ["indoor", "object", "day"] },
  { name: "Split Screen Slide", family: "mask", energy: "both", difficulty: "medium",
    capcutHowTo: "Stack both clips, mask each to half the frame, and keyframe the mask edge sliding across over 0.35s. Keep both halves level so horizons line up.",
    tags: ["indoor", "outdoor"] },
  { name: "Vertical Wipe Mask", family: "mask", energy: "both", difficulty: "medium",
    capcutHowTo: "Use a rectangle mask on clip B keyframed to wipe vertically across 0.3s. Add a 10px white stroke to the mask edge for a polished look.",
    tags: ["indoor", "outdoor", "day"] },
  { name: "Zoom-Through Mask", family: "mask", energy: "punchy", difficulty: "advanced",
    capcutHowTo: "Keyframe clip A's scale from 100 to 400 in 0.3s while fading in clip B behind it — it looks like you punch through the first scene into the second.",
    tags: ["zoom", "motion", "outdoor"] },
  // --- creative family (5) ---
  { name: "Speed Ramp Pass-Through", family: "creative", energy: "both", difficulty: "advanced",
    capcutHowTo: "Ramp clip A's speed to 400% in its last second so the subject rushes toward the camera, then cut to clip B continuing the motion at normal speed. Speed curve: slow, then spike.",
    tags: ["motion", "outdoor", "day"] },
  { name: "Frame Freeze Jump", family: "creative", energy: "both", difficulty: "medium",
    capcutHowTo: "Freeze the last frame of clip A for 0.4s (Style > Freeze), add a shutter SFX, then cut to clip B. Reads like a photo being snapped mid-scene.",
    tags: ["indoor", "object", "day"] },
  { name: "Overlay Pop", family: "creative", energy: "both", difficulty: "easy",
    capcutHowTo: "Drop a sticker, text, or emoji over the cut point and animate its scale from 0 to 100 in 0.2s with a pop. The viewer's eye follows the pop, not the cut.",
    tags: ["indoor", "day", "night"] },
  { name: "Letterbox Open", family: "creative", energy: "calm", difficulty: "medium",
    capcutHowTo: "Place black bars on clip A and keyframe them sliding off at the cut to reveal full-frame clip B. Do it once per video as a signature moment.",
    tags: ["night", "indoor"] },
  { name: "Morph Warp", family: "creative", energy: "both", difficulty: "advanced",
    capcutHowTo: "Align two similar shapes (door, window, face) in frame, cut hard between them, and add the Warp effect at 30% for 0.3s across the cut to melt one into the other.",
    tags: ["object", "indoor", "day"] },
  // --- retro family (4) ---
  { name: "VHS Rewind", family: "retro", energy: "punchy", difficulty: "medium",
    capcutHowTo: "Reverse the first 0.5s of clip B, stack it after clip A, and add Effects > Retro > VHS distortion plus tracking lines for a rewind-into-the-scene feel.",
    tags: ["night", "motion"] },
  { name: "Film Burn", family: "retro", energy: "both", difficulty: "easy",
    capcutHowTo: "Overlay a film-burn stock clip on the cut at Screen blend, 0.4s. Works with warm, nostalgic footage; skip it on clean corporate content.",
    tags: ["day", "outdoor", "night"] },
  { name: "Camera Flash Cut", family: "retro", energy: "both", difficulty: "easy",
    capcutHowTo: "Insert a single white frame at the cut and lower clip B's first 2 frames to 80% brightness — a cheap, honest version of a flash transition.",
    tags: ["indoor", "day", "night"] },
  { name: "Tape Stop", family: "retro", energy: "punchy", difficulty: "medium",
    capcutHowTo: "End clip A with a 0.3s slow-down to 0% speed (pitch drop if audio is on), freeze the last frame, then hard-cut to clip B. Reads like a cassette stopping.",
    tags: ["motion", "night"] },
];

const KEYWORD_MAP: Record<string, string[]> = {
  motion: ["run", "walk", "move", "spin", "jump", "drive", "fast", "dance", "sport", "bike", "action"],
  zoom: ["zoom", "close", "close-up", "detail"],
  indoor: ["room", "kitchen", "office", "studio", "inside", "desk", "store"],
  outdoor: ["street", "park", "beach", "city", "outside", "nature", "road"],
  day: ["morning", "afternoon", "day", "sun", "bright"],
  night: ["night", "evening", "dark", "neon", "party"],
  object: ["product", "box", "hand", "food", "unbox", "object", "phone"],
};

function toString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function sceneTags(scene: string): string[] {
  const lower = scene.toLowerCase();
  const found: string[] = [];
  for (const tag of Object.keys(KEYWORD_MAP)) {
    if (KEYWORD_MAP[tag].some((kw) => lower.includes(kw))) found.push(tag);
  }
  return found;
}

function scoreTransition(t: Transition, tags: string[], energy: string, matchCutOnly: boolean): number {
  let score = 10;
  if (matchCutOnly) {
    return t.family === "match-cut" ? score + 50 : -1;
  }
  if (energy === "calm") {
    if (t.energy === "punchy") return -1;
    if (t.energy === "calm") score += 5;
  } else {
    if (t.energy === "punchy") score += 10;
  }
  const tagHits = t.tags.filter((tag) => tags.includes(tag)).length;
  score += tagHits * 6;
  if (t.family === "match-cut") score += 2;
  return score;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const fromScene = toString(values.fromScene);
  const toScene = toString(values.toScene);
  const energy = toString(values.energy).toLowerCase();

  if (!fromScene) return { ok: false, error: "Enter the first scene (\"fromScene\") — a short description of the clip you are leaving." };
  if (!toScene) return { ok: false, error: "Enter the second scene (\"toScene\") — a short description of the clip you are entering." };
  if (energy !== "calm" && energy !== "punchy") {
    return { ok: false, error: "Energy must be \"calm\" or \"punchy\"." };
  }

  let count = 5;
  if (values.count !== undefined && values.count !== null && values.count !== "") {
    const n = Number(values.count);
    if (!Number.isInteger(n) || n < 1 || n > 10) {
      return { ok: false, error: "Count must be a whole number between 1 and 10." };
    }
    count = n;
  }

  const matchCutOnly = fromScene.toLowerCase() === toScene.toLowerCase();
  const tags = [...new Set([...sceneTags(fromScene), ...sceneTags(toScene)])];

  const scored = BANK.map((t) => ({ t, score: scoreTransition(t, tags, energy, matchCutOnly) }))
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score || (a.t.name < b.t.name ? -1 : a.t.name > b.t.name ? 1 : 0));

  const picked = scored.slice(0, count).map((s) => ({
    name: s.t.name,
    capcutHowTo: s.t.capcutHowTo,
    difficulty: s.t.difficulty,
  }));

  let matchReason: string;
  if (matchCutOnly) {
    matchReason =
      "Both scenes describe the same thing, so the suggestions are limited to the match-cut family: when the framing or motion matches across the cut, the edit becomes invisible. Any other transition would draw attention to a cut that did not need one.";
  } else if (energy === "calm") {
    matchReason =
      "Energy is set to calm, so high-impact transitions (whip pan, glitch, hard zoom punch, shake, flash spin) were excluded. The ranked picks are smooth or mask-style transitions, boosted where they match your scene keywords (motion, indoor, outdoor, day, night, zoom, object).";
  } else {
    matchReason =
      "Energy is set to punchy, so high-impact transitions were ranked first. Keyword matches in your scene descriptions (motion, indoor, outdoor, day, night, zoom, object) push the most fitting options higher; calmer options are kept lower as safe alternates.";
  }

  return { ok: true, values: { ideas: picked, matchReason } };
}

// Exported for tests only (not used by the UI template).
export const TRANSITION_BANK_SIZE = BANK.length;
