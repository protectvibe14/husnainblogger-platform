/**
 * TikTok Live Session Planner — pure logic (tool-159).
 * Zero imports, zero network, zero DOM, fully deterministic.
 *
 * HONESTY: a STATIC run-of-show planner — fixed segment templates and fixed
 * engagement banks, NOT AI and no TikTok data. Includes an eligibility
 * honesty banner: TikTok LIVE typically requires ~1,000 followers and the
 * rule changes over time, so the planner always says to verify in the app.
 * Template bank sizes:
 *   - MAIN_SEGMENTS: 6 (name + what-to-do template each)
 *   - ENGAGEMENT_PROMPTS: 8 (4 picked per run)
 *   - GIFT_GOAL_TEMPLATES: 3
 *   - Solo-only row set: cold open, welcome, Q&A, close (+ co-host intro row
 *     only in co-host mode)
 * Determinism: same inputs -> same outputs. Minutes are distributed
 * proportionally by segment weight and always sum exactly to durationMin.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_TOPIC_LEN = 80;
const MAX_NICHE_LEN = 60;
const MIN_DURATION = 5;
const MAX_DURATION = 240;
/** Typical LIVE follower gate — shown as "typically", never as a fact. */
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

function fill(template: string, topic: string, niche: string): string {
  return template.split("{topic}").join(topic).split("{niche}").join(niche);
}

interface SegmentDef {
  name: string;
  detail: string;
  weight: number;
  topicOnly: boolean;
}

const MAIN_SEGMENTS: readonly SegmentDef[] = [
  {
    name: "Live demo: {topic}",
    detail: "Do {topic} live on camera — narrate every step so late joiners can catch up.",
    weight: 3,
    topicOnly: true,
  },
  {
    name: "Deep dive: the why behind {topic}",
    detail: "Explain why your approach to {topic} works, with one example held up to the camera.",
    weight: 3,
    topicOnly: true,
  },
  {
    name: "Audience Q&A break",
    detail: "Answer the 3 most-liked comments about {topic} — pin each question as you answer it.",
    weight: 3,
    topicOnly: true,
  },
  {
    name: "Common {topic} mistakes",
    detail: "Walk through the 3 mistakes beginners make with {topic} and fix each one live.",
    weight: 3,
    topicOnly: true,
  },
  {
    name: "Rapid-fire tips",
    detail: "Share 5 quick {topic} tips in 60 seconds — speed segments spike retention.",
    weight: 3,
    topicOnly: true,
  },
  {
    name: "Behind the scenes",
    detail: "Show your real {topic} setup or process — unpolished moments build trust on LIVE.",
    weight: 3,
    topicOnly: true,
  },
];

const ENGAGEMENT_PROMPTS: readonly string[] = [
  "Drop a '1' in the chat if you have ever struggled with {topic}.",
  "Tap the screen if you want me to slow down and repeat that {topic} step.",
  "Comment your biggest {topic} question — I am answering the top 3 next.",
  "Share this LIVE with one friend who needs {topic} help.",
  "Vote in the chat: should I demo option A or option B next?",
  "First-time viewers — say hi and tell me where you are watching from.",
  "Screenshot this moment and tag me if you try {topic} today.",
  "Drop your {topic} hot take — the most controversial one gets a shoutout.",
];

const GIFT_GOAL_TEMPLATES: readonly string[] = [
  "Opening gift goal — hit {target} gifts in the first stretch and I will reveal my full {topic} checklist on screen.",
  "Mid-session gift goal — hit {target} gifts by the halfway mark and I will do an extra live {topic} demo.",
  "Final-stretch gift goal — hit {target} gifts in the last 15 minutes and I will announce the next LIVE topic early.",
];

const COLD_OPEN: SegmentDef = {
  name: "Cold open",
  detail: "Start mid-energy with your hook — no greetings. Late viewers decide in 5 seconds whether to stay.",
  weight: 1,
  topicOnly: false,
};
const WELCOME: SegmentDef = {
  name: "Welcome + agenda",
  detail: "Say your name, today's {topic} plan in one sentence, and the one reason to stay until the end.",
  weight: 1.5,
  topicOnly: true,
};
const COHOST_INTRO: SegmentDef = {
  name: "Co-host introduction",
  detail: "Bring your co-host on screen, introduce their {niche} expertise, and let them tease their segment.",
  weight: 1,
  topicOnly: false,
};
const GIFT_PUSH: SegmentDef = {
  name: "Gift goal push",
  detail: "Announce the current gift goal out loud and celebrate every milestone on camera.",
  weight: 1,
  topicOnly: false,
};
const QA_BLOCK: SegmentDef = {
  name: "Q&A + comment shoutouts",
  detail: "Slow down, answer {topic} questions from the chat, and say viewers' names — names keep people watching.",
  weight: 1.5,
  topicOnly: true,
};
const CLOSE: SegmentDef = {
  name: "Close + CTA",
  detail: "Recap the one {topic} takeaway, thank the chat, and deliver your closing call to action.",
  weight: 1,
  topicOnly: true,
};

function blockCount(duration: number): number {
  if (duration < 20) return 1;
  if (duration < 40) return 2;
  if (duration < 70) return 3;
  if (duration < 110) return 4;
  if (duration < 170) return 5;
  return 6;
}

/** Distribute `total` minutes across weights; result sums exactly to total. */
function distribute(total: number, weights: number[]): number[] {
  const wSum = weights.reduce((a, b) => a + b, 0);
  const mins = weights.map((w) => Math.floor((total * w) / wSum));
  let remainder = total - mins.reduce((a, b) => a + b, 0);
  let i = 0;
  while (remainder > 0) {
    mins[i % mins.length] += 1;
    remainder--;
    i++;
  }
  return mins;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const rawTopic = values["liveTopic"];
  if (typeof rawTopic !== "string" || rawTopic.trim().length === 0) {
    return {
      ok: false,
      error: 'Please enter your LIVE topic — for example "beginner budgeting" — so the plan fits your stream.',
    };
  }
  const liveTopic = rawTopic.trim();
  if (liveTopic.length > MAX_TOPIC_LEN) {
    return { ok: false, error: "LIVE topic must be 80 characters or fewer — shorten it and try again." };
  }

  let niche = "";
  const rawNiche = values["niche"];
  if (rawNiche !== undefined && rawNiche !== null && String(rawNiche).trim().length > 0) {
    niche = String(rawNiche).trim();
    if (niche.length > MAX_NICHE_LEN) {
      return { ok: false, error: "Niche must be 60 characters or fewer — shorten it and try again." };
    }
  }
  const nicheForCopy = niche.length > 0 ? niche : "your niche";

  const rawDur = values["durationMin"];
  if (typeof rawDur !== "number" || !Number.isFinite(rawDur)) {
    return { ok: false, error: "Please enter your planned LIVE duration in minutes (a number from 5 to 240)." };
  }
  if (!Number.isInteger(rawDur)) {
    return { ok: false, error: "Duration must be a whole number of minutes between 5 and 240." };
  }
  if (rawDur < MIN_DURATION || rawDur > MAX_DURATION) {
    return { ok: false, error: "Duration must be between 5 and 240 minutes — TikTok LIVE supports multi-hour broadcasts." };
  }
  const duration = rawDur;

  const rawMode = values["sessionMode"];
  const mode = typeof rawMode === "string" ? rawMode.trim().toLowerCase() : "";
  if (mode !== "solo" && mode !== "co-host") {
    return { ok: false, error: "Please choose a session mode: solo or co-host." };
  }

  let followers: number | null = null;
  const rawFollowers = values["followerCount"];
  if (rawFollowers !== undefined && rawFollowers !== null && String(rawFollowers).trim().length > 0) {
    const n = Number(rawFollowers);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
      return { ok: false, error: "Follower count must be a whole number of 0 or more." };
    }
    followers = n;
  }

  // ---- build the segment list ----
  const segments: SegmentDef[] = [COLD_OPEN, WELCOME];
  if (mode === "co-host") segments.push(COHOST_INTRO);
  const nBlocks = blockCount(duration);
  for (let i = 0; i < nBlocks; i++) segments.push(MAIN_SEGMENTS[i]);
  if (duration >= 30) {
    // gift-goal moment lands right after the first main content block
    segments.splice(2 + (mode === "co-host" ? 1 : 0) + 1, 0, GIFT_PUSH);
  }
  segments.push(QA_BLOCK, CLOSE);

  const mins = distribute(duration, segments.map((s) => s.weight));
  const rows: string[][] = [];
  let cursor = 0;
  for (let i = 0; i < segments.length; i++) {
    const start = cursor;
    const end = cursor + mins[i];
    cursor = end;
    rows.push([
      `${start}–${end} min`,
      fill(segments[i].name, liveTopic, nicheForCopy),
      fill(segments[i].detail, liveTopic, nicheForCopy),
    ]);
  }

  // ---- engagement prompts: pick 4 deterministically ----
  const seed = hashString((liveTopic + "|" + mode).toLowerCase());
  const engagementPrompts: string[] = [];
  for (let i = 0; i < 4; i++) {
    engagementPrompts.push(fill(ENGAGEMENT_PROMPTS[(seed + i * 2) % ENGAGEMENT_PROMPTS.length], liveTopic, nicheForCopy));
  }

  // ---- gift goal moments (sample numbers — labeled as samples) ----
  const base = Math.max(10, Math.round(duration / 5));
  const giftGoalMoments = GIFT_GOAL_TEMPLATES.map((t, i) =>
    fill(t, liveTopic, nicheForCopy).split("{target}").join(String(base * (i + 1))),
  );

  const closingCta =
    `Close every ${liveTopic} LIVE with this: "If this helped you, follow for part 2 — and drop your ${liveTopic} ` +
    `question in the comments so I can answer it next time." Save this CTA and reuse it verbatim; ` +
    `consistency trains your audience to act.`;

  let eligibilityNote: string;
  if (followers !== null && followers < TYPICAL_LIVE_GATE) {
    eligibilityNote =
      `Eligibility heads-up: you entered ${followers} followers, and TikTok LIVE typically requires at least ` +
      `1,000 followers, so this account may not be able to go live yet. Focus on short videos until ` +
      `you qualify, then use this plan. Requirements change over time — confirm in the TikTok app.`;
  } else {
    eligibilityNote =
      `Eligibility note: TikTok LIVE typically requires at least 1,000 followers. This rule ` +
      `changes over time and can vary by region and account standing — verify that your account can go live in ` +
      `the TikTok app before your session. This planner is a static template and cannot check your account.`;
  }

  return {
    ok: true,
    values: {
      runOfShow: { columns: ["Time", "Segment", "What to do"], rows },
      engagementPrompts,
      giftGoalMoments,
      closingCta,
      eligibilityNote,
    },
  };
}
