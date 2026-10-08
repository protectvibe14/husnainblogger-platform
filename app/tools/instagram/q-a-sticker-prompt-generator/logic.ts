/**
 * Q&A Sticker Prompt Generator — pure logic (tool-223), zero imports, zero
 * network, zero DOM, zero randomness.
 *
 * TEMPLATE BANK, NOT AI: assembles "Ask me a question" sticker prompts from
 * two fixed, hand-written banks: 12 tone openers (4 tones x 3 openers) and
 * 14 core prompt templates. Prompt i = opener[tone][i % 3] + core[i % 14].
 * The (opener, core) pairs are all distinct for count <= 10, so no prompt
 * repeats. The user's niche is inserted verbatim.
 *
 * Tones (fixed list): friendly | funny | professional | bold.
 *
 * Placeholders: {niche} = the user's niche, trimmed.
 *
 * Bank sizes: 12 tone openers + 14 core prompts = 26 bank entries total.
 */

export type QaTone = "friendly" | "funny" | "professional" | "bold";

/** The four supported tones, in canonical order. */
export const QA_TONES: QaTone[] = ["friendly", "funny", "professional", "bold"];

/** Tone openers — 3 per tone (12 total). Prepended to the core prompt. */
const TONE_OPENERS: Record<QaTone, string[]> = {
  friendly: ["Ask away, friend 💬", "I'm all ears 💬", "No question too small 🌱"],
  funny: ["Shoot your shot 😂", "Dumb questions welcome 🙃", "Make me think AND laugh 🤡"],
  professional: ["Ask a professional:", "Office hours are open:", "Expert Q&A —"],
  bold: ["Don't be shy 🔥", "Bring the heat 🔥", "No-filter Q&A ⚡"],
};

/** Core prompt templates — 14 total. {niche} is the user's niche. */
const CORE_PROMPTS: string[] = [
  "Ask me anything about {niche} 👇",
  "Got {niche} questions? Drop them below — I reply to every single one.",
  "AMA: {niche} edition. What do you want to know?",
  "Stuck with {niche}? Ask me — let's figure it out together.",
  "What should my next {niche} post be about? You decide.",
  "Be honest: what's your biggest {niche} struggle right now?",
  "Ask me your spiciest {niche} question 🔥",
  "New to {niche}? Ask me anything — no dumb questions here.",
  "What does everyone get wrong about {niche}? Debate me.",
  "Drop your {niche} hot takes — I'll rate them honestly.",
  "If you could ask a {niche} expert one thing, what would it be?",
  "Which {niche} topic should I cover this week?",
  "Tell me your {niche} win this week — I read every reply.",
  "Challenge my {niche} advice — ask me anything.",
];

export const BANK_SIZES = {
  toneOpeners: 12,
  corePrompts: CORE_PROMPTS.length, // 14
  tones: QA_TONES.length, // 4
  minCount: 1,
  maxCount: 10,
};

export const ASSUMPTIONS: string[] = [
  "Prompts are assembled from 26 hand-written bank entries (12 tone openers + 14 core prompts), not AI generation.",
  "The tone only changes the opening line's voice — it does not rewrite the core prompt.",
  "The same niche, tone and count always produce the same prompts (bank order is fixed).",
];

function fill(template: string, niche: string): string {
  return template.replaceAll("{niche}", niche);
}

function toInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isInteger(n)) return n;
  }
  return null;
}

function parseTone(value: unknown): QaTone | null {
  if (typeof value !== "string") return null;
  const t = value.trim().toLowerCase();
  return (QA_TONES as string[]).includes(t) ? (t as QaTone) : null;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Generate Q&A sticker prompts. Errors: missing/empty niche; unknown tone;
 * count (when provided) not an integer in 1–10. Never throws.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const rawNiche = values["niche"];
  if (typeof rawNiche !== "string" || rawNiche.trim().length === 0) {
    return {
      ok: false,
      error: "Please enter your niche first — e.g. “skincare”, “freelance writing”.",
    };
  }
  const niche = rawNiche.trim();

  const tone = parseTone(values["tone"]);
  if (tone === null) {
    return {
      ok: false,
      error: `Please pick a tone: ${QA_TONES.join(", ")}.`,
    };
  }

  let count = 5; // default when not provided
  if (values["count"] !== undefined && values["count"] !== null && values["count"] !== "") {
    const parsed = toInteger(values["count"]);
    if (parsed === null || parsed < BANK_SIZES.minCount || parsed > BANK_SIZES.maxCount) {
      return {
        ok: false,
        error: `Count must be a whole number between ${BANK_SIZES.minCount} and ${BANK_SIZES.maxCount}.`,
      };
    }
    count = parsed;
  }

  const openers = TONE_OPENERS[tone];
  const prompts: string[] = [];
  for (let i = 0; i < count; i++) {
    prompts.push(`${openers[i % openers.length]} ${fill(CORE_PROMPTS[i % CORE_PROMPTS.length], niche)}`);
  }

  const copyAll = prompts.map((p, i) => `${i + 1}. ${p}`).join("\n\n");

  return {
    ok: true,
    values: {
      prompts,
      copyAll,
      promptCount: count,
    },
  };
}
