/**
 * TikTok Trend Adapter (tool-161) — pure logic, zero imports, zero network,
 * zero DOM.
 *
 * HONESTY CONTRACT (from spec honestyNote): this tool CANNOT read live
 * TikTok trend data. The user pastes a trend name/sound they found
 * themselves; the tool maps it onto their niche using FIXED word banks.
 * It NEVER invents a "trending now" list. If the input looks like a
 * question about what is currently trending ("what's trending now"),
 * the tool refuses and points to TikTok Discover / the TikTok Creative
 * Center instead of fabricating.
 *
 * Fixed content banks (sizes documented per the builder contract):
 * - CONCEPT_TEMPLATES: 8 per trendType (sound | dance | meme | format),
 *   32 total. Placeholders: {trend}, {niche}.
 * - HOOK_BANK: 12 fixed opening hooks. Placeholders: {trend}, {niche}.
 * - SHOOTING_TIPS: 6 per trendType, 24 total (no placeholders).
 *
 * Deterministic: an FNV-1a hash of (trendName|niche|trendType) seeds a
 * rotation that picks 4 concepts / 3 hooks / 3 tips. Same inputs always
 * produce identical outputs.
 */

export type TrendType = "sound" | "dance" | "meme" | "format";

export const TREND_TYPES: readonly TrendType[] = ["sound", "dance", "meme", "format"];

export const MAX_TREND_NAME_LEN = 120;
export const MAX_NICHE_LEN = 80;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Patterns that indicate the user is asking "what is trending now?" —
 * a question this tool cannot honestly answer. A real trend name ("the
 * demure trend") does not match these; question-shaped inputs do.
 */
const TREND_QUESTION_PATTERNS: RegExp[] = [
  /what('|’| i)s (trending|hot|viral|popular)/i,
  /which (trends?|sounds?|audios?) (are|is)/i,
  /\btrending (now|right now|today|currently)\b/i,
  /\b(currently |current |latest )(trending|viral|hot|popular)\b/i,
  /\bwhat('?s| is) (the )?(latest|current) (trends?|viral)/i,
  /\btell me (the )?(trends?|what'?s trending|what'?s viral)/i,
  /\bshow me (the )?(trends?|what'?s trending)/i,
];

/** 32 concept templates: 8 per trend type. {trend} and {niche} are filled. */
const CONCEPT_TEMPLATES: Record<TrendType, string[]> = {
  sound: [
    'Film a 15-second before/after of your {niche} transformation while "{trend}" plays — put the result as text overlay.',
    'Talk over "{trend}" while showing 3 {niche} mistakes — dip the music on each reveal.',
    'Use "{trend}" as a reveal sound: cover the camera, pull away to show your best {niche} result.',
    "Dance-free point-to-text: each beat of \"{trend}\" reveals one {niche} tip on screen.",
    'Storytime voiceover: narrate a {niche} win while "{trend}" runs low in the background.',
    'POV format: "POV: you\'re a {niche} beginner hearing this sound" — act out the relatable moment.',
    'Duet the original "{trend}" video with your {niche} reaction or correction in split screen.',
    'Process montage: your {niche} workflow sped up, timed to the drop in "{trend}".',
  ],
  dance: [
    'Do the "{trend}" dance but hold up text cards on each move — one {niche} fact per move.',
    'Teach the "{trend}" dance to a {niche} beginner — comedy version where you coach them through it.',
    '"{trend}" dance as a transition: start in "before" mode, land in "after" with your {niche} result.',
    'Dance the "{trend}" moves while your {niche} setup transforms behind you with stop-motion cuts.',
    'POV: your {niche} clients when the results come in — express it with the "{trend}" choreography.',
    '"{trend}" dance duet with a bigger creator, adding your {niche} caption angle on top.',
    'Fail-then-nail: botch the "{trend}" dance, then cut to your {niche} win — "at least I\'m good at this".',
    'Green-screen the "{trend}" dance over screenshots of your {niche} progress.',
  ],
  meme: [
    'Remake the "{trend}" meme with a {niche} twist: swap the punchline for a niche pain point.',
    '"{trend}" meme format, but every panel is a {niche} client type you\'ve met.',
    'Stitch the "{trend}" meme video and add your {niche} expert correction as the punchline.',
    'Recreate "{trend}" using only {niche} props from your desk or room.',
    'Two-character skit: you vs. your {niche} beginner self, using the "{trend}" dialogue.',
    '"{trend}" meme caption style, but the text tells a {niche} transformation story.',
    'POV meme: "Nobody: ... Me, doing {niche}:" — riding the "{trend}" joke structure.',
    'Commentary format: react to the "{trend}" meme and tie each joke back to a {niche} lesson.',
  ],
  format: [
    'Use the "{trend}" format\'s exact structure (hook → list → CTA) with {niche} content plugged in.',
    '"Get ready with me" version of "{trend}": do your {niche} routine while following the format\'s beats.',
    'Ranking format: apply "{trend}"\'s ranking style to {niche} tools, mistakes, or myths.',
    'Day-in-the-life: follow the "{trend}" format\'s editing cuts while showing a {niche} workday.',
    '"{trend}" Q&A format: answer the 3 most common {niche} questions in its style.',
    'Tutorial format: teach one {niche} skill using the "{trend}" format\'s step structure.',
    'Unboxing-style "{trend}": "unbox" a {niche} result, tool, or client win.',
    'Comparison format: "{trend}" style side-by-side — {niche} myth vs. reality.',
  ],
};

/** 12 fixed opening hooks. {trend} and {niche} are filled. */
const HOOK_BANK: string[] = [
  'Stop doing {niche} like this — try the "{trend}" way instead.',
  'This "{trend}" trend just fixed my {niche} content.',
  'POV: you finally found a {niche} trend worth copying.',
  'Everyone\'s doing "{trend}" — here\'s the {niche} version.',
  'The "{trend}" trend, but make it {niche}.',
  'I adapted "{trend}" for {niche} and it actually works.',
  '3-second {niche} glow-up, powered by "{trend}".',
  'Why "{trend}" is secretly a {niche} cheat code.',
  'Steal this: "{trend}" remixed for {niche} creators.',
  'My {niche} take on "{trend}" — save this.',
  'Don\'t sleep on "{trend}" if you do {niche}.',
  '"{trend}" + {niche} = your next viral post.',
];

/** 24 shooting tips: 6 per trend type. */
const SHOOTING_TIPS: Record<TrendType, string[]> = {
  sound: [
    "Business accounts can't use all commercial sounds — check the sound is licensed before you film.",
    "Save the sound from the original video first, so your version links to the trend page.",
    "Keep the music 6–10 dB under your voiceover so the words stay clear.",
    "Match your first cut to the sound's drop or beat change for a cleaner edit.",
    "Film the visual first, then lay the trending sound under it — don't perform live to it.",
    "Post within 48 hours of spotting the sound; audio trends decay fast.",
  ],
  dance: [
    "Practice at 0.5x playback speed before filming — clean moves beat fast ones.",
    "Film in 9:16 with your full body in frame; cropped choreography reads as a mistake.",
    "Put your niche text on screen so the video works even with the sound off.",
    "Learn the 3 signature moves of the dance; the rest can be your own styling.",
    "Film 3 full takes and pick the best — the algorithm can't tell you practiced.",
    "Keep the dance under 15 seconds if the niche message is the point.",
  ],
  meme: [
    "Post within 48 hours of spotting the meme — the joke expires quickly.",
    "Keep the original meme's structure beat-for-beat; change only the niche subject.",
    "The punchline must land by second 5 — cut any setup that delays it.",
    "Read the meme's top comments first; the audience tells you which angle lands.",
    "One meme, one joke — don't stack two punchlines in a single video.",
    "If the meme needs explaining, the adaptation is wrong — pick a simpler one.",
  ],
  format: [
    "Copy the format's structure, not its content — structure is what makes it a trend.",
    "Match the original's pacing: count its cuts and mirror them in your version.",
    "Keep the same hook style as the format for the first 3 seconds.",
    "End with the format's signature CTA style so viewers recognize the pattern.",
    "Your niche twist should be visible by second 3, or viewers scroll past.",
    "Formats last longer than sounds — you have 1–2 weeks to adapt a format.",
  ],
};

export const DISCLAIMER =
  "Adapted from the trend YOU pasted in — this tool cannot see live TikTok data and does not claim any trend is currently popular. Check TikTok Discover or the TikTok Creative Center for what's actually trending before you film.";

/** FNV-1a 32-bit hash — deterministic seed for bank rotation. */
function hash32(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function isTrendQuestion(text: string): boolean {
  return TREND_QUESTION_PATTERNS.some((re) => re.test(text));
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function fill(template: string, trend: string, niche: string): string {
  return template.split("{trend}").join(trend).split("{niche}").join(niche);
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  const trendName = clean(values["trendName"]);
  const niche = clean(values["niche"]);
  const trendTypeRaw = clean(values["trendType"]).toLowerCase();

  if (!trendName) {
    return { ok: false, error: "Enter a trend name or sound — this tool never invents a current trend for you." };
  }
  if (trendName.length > MAX_TREND_NAME_LEN) {
    return { ok: false, error: `Trend name must be ${MAX_TREND_NAME_LEN} characters or fewer.` };
  }
  if (isTrendQuestion(trendName)) {
    return {
      ok: false,
      error:
        "I can't see live TikTok trends — this tool only adapts trends you paste in. Open TikTok Discover or the TikTok Creative Center, copy a trend name or sound, and paste it in the trend name field.",
    };
  }
  if (!niche) {
    return { ok: false, error: "Enter your niche so the trend can be mapped to it." };
  }
  if (niche.length > MAX_NICHE_LEN) {
    return { ok: false, error: `Niche must be ${MAX_NICHE_LEN} characters or fewer.` };
  }
  if (!trendTypeRaw || !(TREND_TYPES as readonly string[]).includes(trendTypeRaw)) {
    return { ok: false, error: "Pick a trend type: sound, dance, meme, or format." };
  }
  const trendType = trendTypeRaw as TrendType;

  const seed = hash32(`${trendName.toLowerCase()}|${niche.toLowerCase()}|${trendType}`);
  const conceptsPool = CONCEPT_TEMPLATES[trendType];
  const tipsPool = SHOOTING_TIPS[trendType];

  const concepts: string[] = [];
  for (let i = 0; i < 4; i++) {
    concepts.push(fill(conceptsPool[(seed + i * 3) % conceptsPool.length], trendName, niche));
  }
  const hooks: string[] = [];
  for (let i = 0; i < 3; i++) {
    hooks.push(fill(HOOK_BANK[(seed * 7 + i * 5) % HOOK_BANK.length], trendName, niche));
  }
  const shootingTips: string[] = [];
  for (let i = 0; i < 3; i++) {
    shootingTips.push(tipsPool[(seed * 3 + i * 2) % tipsPool.length]);
  }

  return {
    ok: true,
    values: {
      concepts,
      hooks,
      shootingTips,
      disclaimer: DISCLAIMER,
    },
  };
}
