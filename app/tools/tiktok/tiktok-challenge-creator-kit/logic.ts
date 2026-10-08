/**
 * TikTok Challenge Creator Kit — pure logic (tool-160).
 * Zero imports, zero network, zero DOM, fully deterministic.
 *
 * HONESTY: a FIXED template kit — this tool CANNOT launch a real hashtag
 * challenge on TikTok; you post the rules video yourself. No AI. Sizes:
 *   - CHALLENGE_TYPES: 4 (dance | how-to | before-after | duet-chain)
 *   - Per type: 1 rules template, 1 example-script template, 4 judging
 *     criteria, 1 launch-CTA template
 *   - DISCLOSURE_NOTE: 1 fixed honesty/disclosure template (branded-deal
 *     #ad reminder + trademark-avoidance note)
 * Determinism: same inputs -> same outputs (pure template substitution).
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_NAME_LEN = 80;
const MAX_NICHE_LEN = 60;

const CHALLENGE_TYPES = ["dance", "how-to", "before-after", "duet-chain"] as const;
type ChallengeType = (typeof CHALLENGE_TYPES)[number];

function fill(template: string, slots: Record<string, string>): string {
  let out = template;
  for (const key of Object.keys(slots)) {
    out = out.split("{" + key + "}").join(slots[key]);
  }
  return out;
}

/** Build a hashtag from the challenge name; null when nothing usable remains. */
export function hashtagFromName(name: string): string | null {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean.length === 0) return null;
  return "#" + clean;
}

interface KitTemplates {
  rules: string;
  script: string;
  judging: readonly string[];
  cta: string;
}

const KITS: Record<ChallengeType, KitTemplates> = {
  dance: {
    rules:
      "{name} — official rules:\n" +
      "1. Learn the {name} routine from my demo video (link in my bio).\n" +
      "2. Film yourself doing it in ONE take — no cuts, no edits.\n" +
      "3. Post it with {hashtag} in your caption and tag 2 friends to try it next.\n" +
      "4. Entries close in 14 days; I will duet my favorite entries every Friday.",
    script:
      "Example launch video script (30 seconds):\n" +
      "[0-3s] Hook: 'I bet you cannot finish the {name} in one take.'\n" +
      "[3-20s] Perform the routine at full speed, then once more in slow motion.\n" +
      "[20-27s] 'Rules are simple: one take, no cuts, tag 2 friends, use {hashtag}.'\n" +
      "[27-30s] 'I am dueting the best ones Friday. Show me what you got.'",
    judging: [
      "Clean execution — the full routine in one take with no visible cuts.",
      "Energy and camera presence — commit to the performance.",
      "Creativity — your own twist on the routine (location, outfit, transition).",
      "Caption compliance — {hashtag} present and 2 friends tagged.",
    ],
    cta:
      "Post your {name} entry today with {hashtag} — I reply to every entry in the first 48 hours, and the best ones get dueted on Friday.",
  },
  "how-to": {
    rules:
      "{name} — official rules:\n" +
      "1. Watch my {name} tutorial so you know the exact steps.\n" +
      "2. Film yourself doing the {name} from start to finish.\n" +
      "3. Post it with {hashtag} and one sentence about what surprised you.\n" +
      "4. Entries close in 14 days; the clearest tutorial-style entry wins a duet feature.",
    script:
      "Example launch video script (30 seconds):\n" +
      "[0-3s] Hook: 'Here is the {name} — and I want YOU to try it.'\n" +
      "[3-20s] Do the {name} at normal speed while naming each step out loud.\n" +
      "[20-27s] 'Film your attempt, post it with {hashtag}, tell me what surprised you.'\n" +
      "[27-30s] 'Best tutorial-style entry gets featured on my page.'",
    judging: [
      "Completeness — all steps of the {name} shown from start to finish.",
      "Clarity — a beginner could follow along with your video.",
      "Your twist — what you changed or improved versus my tutorial.",
      "Caption compliance — {hashtag} present plus your one-sentence takeaway.",
    ],
    cta:
      "Try the {name} today and post it with {hashtag} — the clearest entry gets featured on my page next week.",
  },
  "before-after": {
    rules:
      "{name} — official rules:\n" +
      "1. Film your 'before' — your honest starting point, no filters.\n" +
      "2. Do the {name} for the full challenge period.\n" +
      "3. Film your 'after' in the same spot and lighting, and post both with {hashtag}.\n" +
      "4. Entries close in 21 days; the most dramatic honest transformation gets dueted.",
    script:
      "Example launch video script (30 seconds):\n" +
      "[0-3s] Hook: 'This is my day 1 of the {name}. No filter, no edits.'\n" +
      "[3-20s] Show your honest 'before' and explain exactly what you will do each day.\n" +
      "[20-27s] 'Join me: film your before, do the work, post your after with {hashtag}.'\n" +
      "[27-30s] 'Same spot, same lighting — keep it honest. I will duet the best after.'",
    judging: [
      "Honesty — unfiltered before and after in the same spot and lighting.",
      "Consistency — visible effort across the challenge period.",
      "Story — your caption explains what the {name} actually took.",
      "Caption compliance — {hashtag} present on the final after video.",
    ],
    cta:
      "Film your 'before' for the {name} today and post it with {hashtag} — your future after video starts now.",
  },
  "duet-chain": {
    rules:
      "{name} — official rules:\n" +
      "1. Watch my {name} starter video and duet it with your addition.\n" +
      "2. Your duet must build on the previous video — add one new move, step, or twist.\n" +
      "3. Post with {hashtag} and name the person you are passing it to.\n" +
      "4. The chain runs until someone breaks it; longest clean chain gets a group duet.",
    script:
      "Example launch video script (30 seconds):\n" +
      "[0-3s] Hook: 'I am starting a chain — the {name}. Duet this to join.'\n" +
      "[3-20s] Perform the starter move for the {name}, clearly and slowly.\n" +
      "[20-27s] 'Duet this, add ONE new move, use {hashtag}, and pass it to a friend.'\n" +
      "[27-30s] 'Longest clean chain gets a group duet from me. Go.'",
    judging: [
      "Chain integrity — your addition clearly builds on the previous video.",
      "One addition only — exactly one new move, step, or twist.",
      "Clean handoff — you name the next person in your caption.",
      "Caption compliance — {hashtag} present so the chain is traceable.",
    ],
    cta:
      "Duet my {name} starter video today, add your move, and pass it on with {hashtag} — the chain only works if you join.",
  },
};

const DISCLOSURE_NOTE =
  "Honesty note: this kit cannot launch a hashtag challenge on TikTok — you post the rules video yourself and TikTok's algorithm decides the rest. " +
  "If a brand sponsors your challenge, disclose it with #ad in the caption; do not use a trademarked hashtag without the owner's permission, " +
  "and avoid promising prizes you cannot deliver — undisclosed sponsored challenges can violate FTC and TikTok rules.";

export function runTool(values: Record<string, unknown>): RunResult {
  const rawName = values["challengeName"];
  if (typeof rawName !== "string" || rawName.trim().length === 0) {
    return {
      ok: false,
      error: 'Please name your challenge — for example "Two-Minute Tidy" — so the kit can be built around it.',
    };
  }
  const challengeName = rawName.trim();
  if (challengeName.length > MAX_NAME_LEN) {
    return { ok: false, error: "Challenge name must be 80 characters or fewer — shorten it and try again." };
  }

  let niche = "";
  const rawNiche = values["niche"];
  if (rawNiche !== undefined && rawNiche !== null && String(rawNiche).trim().length > 0) {
    niche = String(rawNiche).trim();
    if (niche.length > MAX_NICHE_LEN) {
      return { ok: false, error: "Niche must be 60 characters or fewer — shorten it and try again." };
    }
  }

  const rawType = values["challengeType"];
  const challengeType = typeof rawType === "string" ? rawType.trim().toLowerCase() : "";
  if (!(CHALLENGE_TYPES as readonly string[]).includes(challengeType)) {
    return { ok: false, error: "Please choose a challenge type: dance, how-to, before-after, or duet-chain." };
  }

  const hashtag = hashtagFromName(challengeName);
  if (hashtag === null) {
    return { ok: false, error: "Challenge name must contain at least one letter or number so a hashtag can be built from it." };
  }

  const kit = KITS[challengeType as ChallengeType];
  const slots = { name: challengeName, hashtag, niche: niche.length > 0 ? niche : "your niche" };

  return {
    ok: true,
    values: {
      challengeHashtag: hashtag,
      rulesText: fill(kit.rules, slots),
      exampleScript: fill(kit.script, slots),
      judgingCriteria: kit.judging.map((j) => fill(j, slots)),
      launchCta: fill(kit.cta, slots),
      disclosureNote: DISCLOSURE_NOTE,
    },
  };
}
