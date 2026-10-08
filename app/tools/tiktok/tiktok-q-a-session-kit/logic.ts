/**
 * TikTok Q&A Session Kit (tool-196) — template question-bank generator.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * HONESTY: builds a Q&A run-of-show from FIXED question templates and fixed
 * phase scripts — templated, not AI-written, and uses no TikTok data.
 * Includes an eligibility honesty banner (tool-159 pattern): TikTok LIVE
 * typically requires ~1,000 followers and the rule changes over time, so the
 * kit always says to verify in the app. The follower-count check is a static
 * banner driven by the number the user types, never an account lookup.
 *
 * WORD BANKS (all fixed; sizes documented — picks are deterministic):
 *   WARM_UP_QUESTIONS   10 question templates
 *   RAPID_FIRE_QUESTIONS 10 question templates
 *   DEEP_DIVE_QUESTIONS   8 question templates
 *   PHASE_SCRIPTS        2 session types x 4 phases (warm-up, rapid-fire,
 *                         deep-dive, CTA) = 8 fixed phase scripts
 *   TOTAL: 36 fixed bank entries.
 *
 * Determinism: FNV-1a seed from (niche|sessionType); same inputs ->
 * same outputs, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_NICHE_LEN = 60;
const MAX_FOLLOWERS = 1000000000;
/** Typical LIVE follower gate — phrased as "typically", never as a fact. */
const TYPICAL_LIVE_GATE = 1000;

/** FNV-1a 32-bit hash — deterministic bank seeding, no Math.random. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function fill(template: string, niche: string): string {
  return template.split("{niche}").join(niche);
}

const WARM_UP_QUESTIONS: readonly string[] = [
  "What got you into {niche} in the first place?",
  "How long have you been doing {niche}?",
  "What does a normal day of {niche} look like for you?",
  "What's your favorite part of {niche} right now?",
  "What is one thing about {niche} that surprised you when you started?",
  "Who is your {niche} content for — beginners, pros, or everyone?",
  "What made you start posting {niche} videos on TikTok?",
  "What is the most common {niche} question you get in your comments?",
  "If a friend asked you one {niche} question, what would it be?",
  "What is one small {niche} win you had this week?",
];

const RAPID_FIRE_QUESTIONS: readonly string[] = [
  "Best {niche} tip you can give in one sentence?",
  "Biggest {niche} myth you want to kill?",
  "One {niche} tool or resource you use daily?",
  "What should a {niche} beginner learn first?",
  "What is the most overrated {niche} trend?",
  "What is the most underrated {niche} trend?",
  "One {niche} mistake you see everyone make?",
  "Coffee or chaos — how do you plan your {niche} content?",
  "Your go-to {niche} answer when someone asks 'is it worth it'?",
  "Finish this: every {niche} beginner should know that ___",
];

const DEEP_DIVE_QUESTIONS: readonly string[] = [
  "Walk us through your full {niche} process, start to finish.",
  "What changed in your {niche} results once you got consistent?",
  "Tell the story of your biggest {niche} failure — and what it taught you.",
  "What would you do differently if you started {niche} over today?",
  "What does nobody tell beginners about {niche}?",
  "How do you measure whether your {niche} effort is actually working?",
  "What is the one {niche} debate you have a strong opinion on?",
  "Give us the honest behind-the-scenes of one {niche} project.",
];

/**
 * Phase scripts keyed by session type. Placeholders: {niche}.
 * Live rows use chat pins; video-comments rows use reply-video structure.
 */
const PHASE_SCRIPTS: Readonly<Record<string, readonly string[]>> = {
  live: [
    "Open with the classic line: 'Ask me anything about {niche} — I am answering the top-voted comments for the next 10 minutes.' Pin it in the chat.",
    "Rapid-fire round: answer each question in 30 seconds or less. Say the viewer's name before each answer and tap the screen-prompt every 2 minutes.",
    "Deep-dive round: pick 2-3 meaty questions and slow down — share one story, one example, one takeaway per answer.",
    "Close: 'Comment your {niche} question and I will answer it in the next Q&A — follow so you do not miss it.' Screenshot the best question and tease the follow-up video.",
  ],
  "video-comments": [
    "Collect 10-15 comment questions about {niche} and reply to the 5 easiest with quick text answers to warm up the comment section.",
    "Film a rapid-fire video: one question on screen, 30-second answer each, hard cuts between questions.",
    "Film a second video for the 2-3 deepest questions — one question per video so each one can rank on its own.",
    "End every answer with: 'Drop your {niche} question in the comments — I am answering the best ones next.' Pin the question that started the video.",
  ],
};

const WARM_UP_COUNT = 5;
const RAPID_FIRE_COUNT = 6;
const DEEP_DIVE_COUNT = 3;

/** Pick `count` templates from `bank` deterministically using seed.
 * NOTE: step 1 is deliberate — a step sharing a factor with bank.length
 * would only cycle a subset of indices and could loop forever when count
 * exceeds that subset. */
function pick(bank: readonly string[], count: number, seed: number, niche: string): string[] {
  const out: string[] = [];
  const used = new Set<number>();
  let i = 0;
  while (out.length < count && used.size < bank.length) {
    const idx = (seed + i) % bank.length;
    i++;
    if (used.has(idx)) continue;
    used.add(idx);
    out.push(fill(bank[idx], niche));
  }
  return out;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const rawNiche = values["niche"];
  if (typeof rawNiche !== "string" || rawNiche.trim().length === 0) {
    return {
      ok: false,
      error: 'Please enter your niche — for example "vegan baking" — so the questions match your audience.',
    };
  }
  const niche = rawNiche.trim();
  if (niche.length > MAX_NICHE_LEN) {
    return { ok: false, error: "Niche must be 60 characters or fewer — shorten it and try again." };
  }

  const rawType = values["sessionType"];
  const sessionType = typeof rawType === "string" ? rawType.trim().toLowerCase() : "";
  if (sessionType !== "live" && sessionType !== "video-comments") {
    return { ok: false, error: "Please choose a session type: live or video-comments." };
  }

  let followers: number | null = null;
  const rawFollowers = values["followerCount"];
  if (rawFollowers !== undefined && rawFollowers !== null && String(rawFollowers).trim().length > 0) {
    const n = Number(rawFollowers);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > MAX_FOLLOWERS) {
      return { ok: false, error: "Follower count must be a whole number between 0 and 1,000,000,000." };
    }
    followers = n;
  }

  const seed = hashString((niche + "|" + sessionType).toLowerCase());
  const warmUp = pick(WARM_UP_QUESTIONS, WARM_UP_COUNT, seed, niche);
  const rapidFire = pick(RAPID_FIRE_QUESTIONS, RAPID_FIRE_COUNT, seed + 7, niche);
  const deepDive = pick(DEEP_DIVE_QUESTIONS, DEEP_DIVE_COUNT, seed + 13, niche);
  const questionBank = [
    ...warmUp.map((q) => "[Warm-up] " + q),
    ...rapidFire.map((q) => "[Rapid-fire] " + q),
    ...deepDive.map((q) => "[Deep-dive] " + q),
  ];

  const scripts = PHASE_SCRIPTS[sessionType];
  const typeLabel = sessionType === "live" ? "TikTok LIVE" : "video comments";
  const runOfShow = {
    columns: ["Phase", "Format", "Script"],
    rows: [
      ["Warm-up", typeLabel, fill(scripts[0], niche)],
      ["Rapid-fire", typeLabel, fill(scripts[1], niche)],
      ["Deep-dive", typeLabel, fill(scripts[2], niche)],
      ["CTA", typeLabel, fill(scripts[3], niche)],
    ],
  };

  const callToAction =
    sessionType === "live"
      ? `Closing line for your ${niche} Q&A LIVE: "Comment your ${niche} question now and follow — I am answering the best ones in the next session."`
      : `Closing line for your ${niche} Q&A videos: "Drop your ${niche} question in the comments — the best ones become my next videos."`;

  let eligibilityNote: string;
  if (sessionType === "live" && followers !== null && followers < TYPICAL_LIVE_GATE) {
    eligibilityNote =
      `Eligibility heads-up: you entered ${followers} followers, and TikTok LIVE typically requires at least ` +
      `${TYPICAL_LIVE_GATE} followers, so this account may not be able to go live yet. Keep building with the ` +
      `video-comments version of this kit until you qualify. Requirements change over time — confirm in the TikTok app.`;
  } else {
    eligibilityNote =
      sessionType === "live"
        ? `Eligibility note: TikTok LIVE typically requires at least ${TYPICAL_LIVE_GATE} followers. Rules change ` +
          `over time and can vary by region and account standing — verify that your account can go live in the ` +
          `TikTok app before your session. This kit is a static template and cannot check your account.`
        : `Note: the video-comments Q&A format works at any follower count — no LIVE access needed. This kit is a ` +
          `static template and cannot check your TikTok account.`;
  }

  return {
    ok: true,
    values: { questionBank, runOfShow, callToAction, eligibilityNote },
  };
}
