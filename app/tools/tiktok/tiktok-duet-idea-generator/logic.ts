/**
 * TikTok Duet Idea Generator — pure logic (tool-156).
 * Zero imports, zero network, zero DOM, fully deterministic.
 *
 * HONESTY: ideas are assembled from FIXED template/word banks — this tool has
 * NO access to TikTok data and is NOT AI. Bank sizes:
 *   - DUET_IDEAS: 4 duet types x 6 idea templates (concept + setup each)
 *   - HOOKS: 8 opener lines
 *   - CTAS: 6 call-to-action lines
 *   - PARTNER_TIPS: 4 duet types x 3 coordination tips
 *   - NO_PARTNER_GUIDANCE: 1 fixed guidance template (names no real creators)
 * Output count: exactly 5 ideas per run (IDEA_COUNT).
 * Determinism: same inputs -> same outputs (bank index = hash of inputs).
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_NICHE_LEN = 100;
const IDEA_COUNT = 5;

const DUET_TYPES = ["react", "reply", "collab", "challenge"] as const;

/** FNV-1a 32-bit hash — deterministic bank seeding, no Math.random. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(bank: readonly T[], seed: number, i: number): T {
  return bank[(seed + i) % bank.length];
}

function fill(template: string, niche: string): string {
  return template.split("{niche}").join(niche);
}

interface IdeaTemplate {
  concept: string;
  setup: string;
}

const DUET_IDEAS: Record<(typeof DUET_TYPES)[number], readonly IdeaTemplate[]> = {
  react: [
    {
      concept: "React to a viral {niche} hack and give your expert verdict",
      setup:
        "Find a short {niche} video on your For You page and duet it. Film your genuine first reaction, then pause mid-video to add your {niche} take: agree, correct, or upgrade the hack on camera.",
    },
    {
      concept: "Myth-busting reaction to a popular {niche} claim",
      setup:
        "Duet a video making a bold {niche} claim. Let the original play for 3 seconds, then freeze it and explain on your side of the screen why it is true, false, or only half-true.",
    },
    {
      concept: "Try-it-live reaction: attempt a {niche} trick on camera",
      setup:
        "Duet a {niche} tutorial and attempt the trick live on your side. Viewers love watching real attempts — keep your mistakes in, they make the duet feel authentic.",
    },
    {
      concept: "Before/after reaction to a {niche} transformation",
      setup:
        "Duet a {niche} transformation video. On your side, narrate what you would change or predict the result before it is revealed, then react to whether you were right.",
    },
    {
      concept: "Expert commentary over a beginner's {niche} video",
      setup:
        "Duet a beginner-level {niche} video and add coaching commentary as it plays. Keep it kind and constructive — coaching duets get saved and shared.",
    },
    {
      concept: "Rating a trending {niche} product or result out of 10",
      setup:
        "Duet a video showing a {niche} result or product. Hold up score cards (1-10) as you react, then explain your score in one clear sentence.",
    },
  ],
  reply: [
    {
      concept: "Respectful rebuttal to a hot {niche} opinion",
      setup:
        "Duet a {niche} opinion video you disagree with. State the part you agree with first, then present your counterpoint with one piece of evidence or experience.",
    },
    {
      concept: "Answer a {niche} question posed to the community",
      setup:
        "Duet a creator asking a {niche} question to their audience. Answer directly on your side, then ask your viewers the same question to keep the thread going.",
    },
    {
      concept: "Add the missing context to a {niche} story",
      setup:
        "Duet a {niche} storytime and add the context most viewers are missing. Frame it as 'here is the part nobody mentioned' — curiosity hooks work well here.",
    },
    {
      concept: "Finish their sentence: complete a {niche} list",
      setup:
        "Duet a creator listing their top {niche} tips and add your own #1 at the end. Tag-style replies make both videos more discoverable.",
    },
    {
      concept: "Agree and amplify with your own {niche} proof",
      setup:
        "Duet a {niche} tip you genuinely use. Show your own proof or result on your side of the screen to validate the original creator.",
    },
    {
      concept: "POV reply: your {niche} experience on the same topic",
      setup:
        "Duet a {niche} experience video and share how the same thing went for you. Parallel-story duets invite comments comparing both sides.",
    },
  ],
  collab: [
    {
      concept: "Side-by-side {niche} tutorial with your duet partner",
      setup:
        "Your partner posts the first half of a {niche} tutorial; you duet it and perform the second half live on your side. Agree on the handoff point before filming.",
    },
    {
      concept: "Question-and-answer collab across two {niche} accounts",
      setup:
        "Your partner asks 3 rapid {niche} questions in their video; you duet and answer each one without pausing. Time it so your answers land on their cuts.",
    },
    {
      concept: "Versus format: two {niche} methods, one screen",
      setup:
        "Your partner demos {niche} method A while you demo method B on your side at the same time. Let viewers vote in the comments for the winner.",
    },
    {
      concept: "Call-and-response {niche} routine",
      setup:
        "Your partner films a {niche} prompt (a move, a step, a tip); you duet and respond on beat. Rehearse the timing once — synced responses get replayed.",
    },
    {
      concept: "Double review: two takes on one {niche} product",
      setup:
        "Both of you duet the same {niche} product clip — your partner reacts first, then you duet their duet with the opposite take. Chain duets multiply reach.",
    },
    {
      concept: "Teach-back collab: partner teaches, you attempt",
      setup:
        "Your partner teaches a quick {niche} skill in their video; you duet it and attempt the skill live, narrating what is hard about it in real time.",
    },
  ],
  challenge: [
    {
      concept: "Start a 7-day {niche} challenge and invite duets",
      setup:
        "Post a day-1 {niche} challenge video and invite viewers to duet their own day 1. Film yours in one take so followers feel they can join in.",
    },
    {
      concept: "Pass-it-on {niche} relay challenge",
      setup:
        "Do a {niche} move or task, then duet-invite one specific follower to add the next move. Name the person in your caption so the relay feels personal.",
    },
    {
      concept: "Beat-the-clock {niche} challenge",
      setup:
        "Attempt a {niche} task in under 60 seconds on camera and challenge viewers to duet with a faster time. Show a visible timer for credibility.",
    },
    {
      concept: "Remake my video {niche} challenge",
      setup:
        "Post a simple {niche} video and challenge followers to remake it better. Promise to duet your favorite remake — the promise drives entries.",
    },
    {
      concept: "Two-truths {niche} challenge duet chain",
      setup:
        "Share two truths and a lie about your {niche} journey, then invite followers to duet with their guesses and their own version.",
    },
    {
      concept: "Before-you-scroll {niche} dare",
      setup:
        "Post a quick {niche} dare viewers can do in 30 seconds, and ask them to duet proof. Low-effort dares get the most duet responses.",
    },
  ],
};

const HOOKS: readonly string[] = [
  "Open with your most surprising {niche} take in the first 2 seconds.",
  "Start mid-reaction — never open a duet with a hello.",
  "Lead with the result, then show how the duet gets there.",
  "Ask the viewer a yes-or-no {niche} question before the duet starts.",
  "Open with a bold on-screen caption summarizing your verdict.",
  "Start with the exact moment in the original video you disagree with.",
  "Tease the payoff: 'watch what happens at the end of this duet'.",
  "Mirror the original video's energy in your first frame.",
];

const CTAS: readonly string[] = [
  "End by inviting viewers to duet your duet with their own take.",
  "Close with one question that splits your {niche} audience in the comments.",
  "Finish by asking viewers to stitch this with their answer.",
  "End with a follow ask tied to your next {niche} video, not a generic one.",
  "Close by telling viewers exactly which of your videos to watch next.",
  "End with a save-worthy summary: 'save this {niche} breakdown'.",
];

const PARTNER_TIPS: Record<(typeof DUET_TYPES)[number], readonly string[]> = {
  react: [
    "Send your partner the video you plan to react to first, so nothing feels like an ambush.",
    "Agree on a 3-second countdown so both sides start filming at the same moment.",
    "Let your partner post first; your duet links back and sends them traffic too.",
  ],
  reply: [
    "Write your one-sentence reply before filming so it lands cleanly in 15 seconds.",
    "Tell your partner the stance you are taking so the reply feels like a real debate, not a script.",
    "Agree to pin each other's video in the comments for cross-discovery.",
  ],
  collab: [
    "Film a 10-second test duet first to check audio balance between both sides.",
    "Decide who films first — the lead video sets the timing your duet must match.",
    "Post within 24 hours of each other so the algorithm treats them as a pair.",
  ],
  challenge: [
    "Launch the challenge at the same time on both accounts for double the starting push.",
    "Agree on one shared hashtag before either of you posts.",
    "Each of you duets the other's launch video so both audiences see both sides.",
  ],
};

const NO_PARTNER_GUIDANCE =
  "No duet partner yet? No problem. Browse TikTok for a public {niche} video you can genuinely react to — TikTok lets you duet any video whose creator has duets enabled. Pick a video with clear audio and a strong opening 3 seconds, then add your {niche} perspective on your side of the screen. Avoid naming or targeting specific creators in a negative way; react to the content, not the person. Once you post, reply to every comment on your duet for the first hour — early engagement is what pushes duets to new viewers.";

export function runTool(values: Record<string, unknown>): RunResult {
  const rawNiche = values["niche"];
  if (typeof rawNiche !== "string" || rawNiche.trim().length === 0) {
    return {
      ok: false,
      error: 'Please enter your niche — for example "sourdough baking" — so the ideas can be tailored to it.',
    };
  }
  const niche = rawNiche.trim();
  if (niche.length > MAX_NICHE_LEN) {
    return { ok: false, error: "Niche must be 100 characters or fewer — shorten it and try again." };
  }

  const rawType = values["duetType"];
  const duetType = typeof rawType === "string" ? rawType.trim().toLowerCase() : "";
  if (!(DUET_TYPES as readonly string[]).includes(duetType)) {
    return { ok: false, error: "Please choose a duet type: react, reply, collab, or challenge." };
  }

  const rawPartner = values["hasPartner"];
  const hasPartner = typeof rawPartner === "string" ? rawPartner.trim().toLowerCase() : "";
  if (hasPartner !== "yes" && hasPartner !== "no") {
    return { ok: false, error: "Please tell us whether you already have a duet partner: yes or no." };
  }

  const seed = hashString(niche.toLowerCase() + "|" + duetType);
  const ideas = DUET_IDEAS[duetType as (typeof DUET_TYPES)[number]];

  const duetIdeas: string[] = [];
  for (let i = 0; i < IDEA_COUNT; i++) {
    const idea = pick(ideas, seed, i);
    const hook = fill(pick(HOOKS, seed, i * 3), niche);
    const cta = fill(pick(CTAS, seed, i * 2), niche);
    duetIdeas.push(
      `Idea ${i + 1} — ${fill(idea.concept, niche)}. Setup: ${fill(idea.setup, niche)} Hook tip: ${hook} CTA: ${cta}`,
    );
  }

  let partnerGuidance: string;
  if (hasPartner === "yes") {
    const tips = PARTNER_TIPS[duetType as (typeof DUET_TYPES)[number]];
    partnerGuidance =
      "Partner coordination tips: " +
      tips.map((t, i) => `${i + 1}. ${t}`).join(" ");
  } else {
    partnerGuidance = fill(NO_PARTNER_GUIDANCE, niche);
  }

  return { ok: true, values: { duetIdeas, partnerGuidance } };
}
