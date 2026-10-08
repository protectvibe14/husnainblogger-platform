/**
 * TikTok Search Intent Mapper (tool-164) — pure logic, zero imports, zero
 * network, zero DOM.
 *
 * CORE MECHANISM (per spec honestyNote + correction): keyword-to-intent
 * classification via word-bank matching, plus generated content angles.
 * NO TikTok Search Insights data is used — this is an honest subset only.
 *
 * How it works:
 * 1. The phrase is lowercased and matched against 5 intent trigger banks
 *    (how-to | review | entertainment | local | buy). Multi-word triggers
 *    match as substrings; single-word triggers match on word boundaries
 *    (so "how" does not match "show").
 * 2. Each intent scores 1 point per distinct trigger matched.
 * 3. Confidence rules:
 *    - top score >= 2 and lead over runner-up >= 2 -> HIGH, single intent.
 *    - top score >= 1 -> MODERATE, top-2 intents shown as a blend with a
 *      confidence note (per spec edgeCase: never a single invented
 *      classification for ambiguous phrases).
 *    - top score = 0 -> LOW, "unclear", all 5 intents listed as possibilities.
 * 4. Content angles come from FIXED banks (6 per intent); 4 are picked for
 *    the primary intent, 2 for the secondary (deterministic rotation by
 *    hash of the phrase).
 *
 * Fixed content banks (sizes documented per the builder contract):
 * - TRIGGERS: 5 intents x 15 triggers = 75 triggers.
 * - ANGLES: 5 intents x 6 angles = 30 angles with {phrase} placeholder.
 * - CAPTION_TIPS: 3 fixed caption keyword-placement tips.
 *
 * Deterministic: same phrase always yields the same classification.
 */

export const INTENTS = ["how-to", "review", "entertainment", "local", "buy"] as const;
export type Intent = (typeof INTENTS)[number];

export const MAX_PHRASE_LEN = 150;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

interface ScoredIntent {
  intent: Intent;
  score: number;
  matched: string[];
}

/** 75 triggers: 15 per intent. */
const TRIGGERS: Record<Intent, string[]> = {
  "how-to": [
    "how to",
    "tutorial",
    "guide",
    "diy",
    "steps",
    "learn",
    "tips",
    "trick",
    "beginner",
    "easy",
    "lesson",
    "explained",
    "instructions",
    "method",
    "walkthrough",
  ],
  review: [
    "review",
    "honest",
    "vs",
    "versus",
    "compared",
    "best",
    "top",
    "worth it",
    "unboxing",
    "rating",
    "rated",
    "pros and cons",
    "tested",
    "tried",
    "worth it or skip",
  ],
  entertainment: [
    "funny",
    "meme",
    "fail",
    "cringe",
    "satisfying",
    "pov",
    "skit",
    "prank",
    "reaction",
    "comedy",
    "dance",
    "challenge",
    "drama",
    "storytime",
    "expectation vs reality",
  ],
  local: [
    "near me",
    "nearby",
    "downtown",
    "uptown",
    "city",
    "address",
    "open now",
    "location",
    "directions",
    "neighborhood",
    "local",
    "hours",
    "parking",
    "worth the hype",
    "hidden gem",
  ],
  buy: [
    "buy",
    "price",
    "cheap",
    "cheapest",
    "discount",
    "deal",
    "sale",
    "shop",
    "coupon",
    "promo",
    "order",
    "affordable",
    "under $",
    "where to buy",
    "dupes",
  ],
};

/** 30 content angles: 6 per intent. {phrase} is filled with the user's phrase. */
const ANGLES: Record<Intent, string[]> = {
  "how-to": [
    'Step-by-step tutorial: film each step of "{phrase}" as a separate clip with on-screen numbers.',
    '"{phrase} in 60 seconds" — the fast version hooks viewers; pin the full version in the comments.',
    'Common mistakes: "3 {phrase} mistakes beginners make."',
    'Before/after: show the result of "{phrase}" done right.',
    'Tools list: "Everything you need for {phrase} (with prices on screen)."',
    'POV beginner: "Trying {phrase} for the first time — day 1."',
  ],
  review: [
    'Honest review: test "{phrase}" on camera and give a 1–10 score.',
    '"{phrase} — worth it or skip?" 30-second verdict format.',
    'Comparison: "{phrase} vs. the cheaper alternative."',
    'Unboxing + first impressions of "{phrase}".',
    '"I tried {phrase} so you don\'t have to" — results after 7 days.',
    'Pros vs. cons list with on-screen text for "{phrase}".',
  ],
  entertainment: [
    'POV skit built around "{phrase}" — exaggerate the relatable moment.',
    'Storytime: "The funniest thing that happened with {phrase}."',
    'Duet or react to the most viral "{phrase}" video.',
    '"{phrase} expectation vs. reality" comedy cut.',
    'Meme format: caption the "{phrase}" moment everyone knows.',
    'Challenge version: "Can I {phrase} in under 60 seconds?"',
  ],
  local: [
    '"Best {phrase} near me" — walking tour with the address on screen.',
    'Hours, prices, and parking: the practical "{phrase}" guide.',
    'Hidden gem: "{phrase} nobody talks about" in your area.',
    'Rating 5 local {phrase} spots from worst to best.',
    '"Is {phrase} in your city worth the hype?"',
    'Day-trip vlog centered on "{phrase}".',
  ],
  buy: [
    '"Where to buy {phrase} cheapest" — compare 3 stores on camera.',
    'Unboxing + "was it worth the price?" for "{phrase}".',
    'Discount alert: "How I got {phrase} for less."',
    '"{phrase} dupes that actually work" — budget alternatives.',
    'What\'s in the bag: full "{phrase}" haul with prices on screen.',
    '"Don\'t buy {phrase} until you watch this" — 3 things to check first.',
  ],
};

/** 3 fixed caption keyword-placement tips. */
const CAPTION_TIPS: string[] = [
  "Say the exact search phrase out loud in the first 3 seconds — TikTok transcribes speech and indexes it.",
  "Put the phrase in your on-screen text, not just the caption — on-screen text is searchable.",
  "Match the video's intent: tutorials answer questions, reviews give verdicts, entertainment hooks fast.",
];

/** FNV-1a 32-bit hash — deterministic seed for angle rotation. */
function hash32(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Escape regex special chars. */
function escapeRe(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Count distinct triggers matched for one intent (1 point each). */
function scoreIntent(phraseLower: string, intent: Intent): ScoredIntent {
  const matched: string[] = [];
  for (const trigger of TRIGGERS[intent]) {
    const hit = trigger.includes(" ")
      ? phraseLower.includes(trigger)
      : new RegExp(`\\b${escapeRe(trigger)}\\b`).test(phraseLower);
    if (hit) matched.push(trigger);
  }
  return { intent, score: matched.length, matched };
}

function fillAngles(intent: Intent, phrase: string, seed: number, salt: number, count: number): string[] {
  const bank = ANGLES[intent];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(bank[(seed + salt * 53 + i * 3) % bank.length].split("{phrase}").join(phrase));
  }
  return out;
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  const phrase = clean(values["searchPhrase"]);

  if (!phrase) {
    return { ok: false, error: "Type a search phrase — e.g. \"best budget mic\" or \"how to curl hair\"." };
  }
  if (phrase.length > MAX_PHRASE_LEN) {
    return { ok: false, error: `Search phrase must be ${MAX_PHRASE_LEN} characters or fewer.` };
  }

  const lower = phrase.toLowerCase();
  const scored = INTENTS.map((intent) => scoreIntent(lower, intent)).sort((a, b) => b.score - a.score);
  const [first, second] = scored;
  const seed = hash32(lower);

  let intentLabel: string;
  let secondaryIntent: string;
  let confidence: string;
  let angles: string[];

  if (first.score === 0) {
    // No signals at all — show every intent as a possibility.
    intentLabel = "unclear";
    secondaryIntent = "none";
    confidence =
      "Low — no intent signals were found in this phrase, so no single intent is claimed. All 5 intents are listed as possibilities below; pick the one that matches what a searcher most likely wants.";
    angles = INTENTS.flatMap((intent) => fillAngles(intent, phrase, seed, INTENTS.indexOf(intent), 2));
  } else if (first.score >= 2 && first.score - second.score >= 2) {
    // Strong single signal.
    intentLabel = first.intent;
    secondaryIntent = "none";
    confidence = `High — strong ${first.intent} signals (${first.score} matched: ${first.matched.join(
      ", "
    )}). One clear intent; build the video for it.`;
    angles = fillAngles(first.intent, phrase, seed, 1, 4);
  } else {
    // Ambiguous: top-2 blend with an explicit confidence note — never a
    // single invented classification (spec edgeCase).
    intentLabel = first.intent;
    secondaryIntent = second.score > 0 ? second.intent : "none";
    const blendNote =
      second.score > 0
        ? ` Treat it as a blend: lead with ${first.intent}, borrow the ${second.intent} angle.`
        : " Only one weak signal was found, so treat this as a guess, not a classification.";
    confidence =
      `Moderate — the phrase leans ${first.intent} (${first.score} matched: ${first.matched.join(", ")})` +
      (second.score > 0
        ? ` but also matches ${second.intent} (${second.score} matched: ${second.matched.join(", ")}).`
        : ", with no strong runner-up.") +
      blendNote;
    angles = [
      ...fillAngles(first.intent, phrase, seed, 1, 4),
      ...(second.score > 0 ? fillAngles(second.intent, phrase, seed, 2, 2) : []),
    ];
  }

  const matchedSignals = scored
    .filter((s) => s.score > 0)
    .map((s) => `${s.intent}: ${s.matched.join(", ")} (${s.score})`);

  return {
    ok: true,
    values: {
      intentLabel,
      secondaryIntent,
      confidence,
      contentAngles: angles,
      captionKeywordTips: [...CAPTION_TIPS],
      matchedSignals: matchedSignals.length > 0 ? matchedSignals : ["no trigger words matched any intent"],
    },
  };
}
