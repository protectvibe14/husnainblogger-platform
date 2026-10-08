/**
 * Emoji Combo Generator — pure logic (tool-242), zero imports, zero
 * network, zero DOM.
 *
 * CURATED LIBRARY, NOT AI: combos come from a hand-written bank of
 * 10 vibes x 12 combos = 120 emoji combos. The tool returns the first N
 * combos from the chosen vibe's bank (N = user's count) — no randomness,
 * no AI, nothing generated on the fly.
 *
 * Bank sizes: 10 vibes, 12 combos per vibe, 120 combos total.
 *
 * Deterministic: same inputs -> same outputs, always.
 */

export const MIN_COUNT = 1;
export const MAX_COUNT = 10;
export const COMBOS_PER_VIBE = 12;

/** The 10 supported vibes, in canonical order. */
export const VIBES = [
  "cute",
  "aesthetic",
  "soft",
  "dark",
  "kawaii",
  "nature",
  "luxury",
  "minimal",
  "y2k",
  "beach",
] as const;

export type EmojiVibe = (typeof VIBES)[number];

/** Curated combo bank — 12 combos per vibe, 120 total. */
const COMBO_BANK: Record<EmojiVibe, string[]> = {
  cute: [
    "🎀🌷✨💗", "🍓🧸🌸💕", "🌷🎀🍰✨", "💗🧁🎀🌷",
    "🌸🍓💕✨", "🧸🎀🍰💗", "🌷🍓🌸✨", "💕🎀🍓🧸",
    "🍰🌸💗✨", "🌷💕🎀🍓", "✨🧸🌸💗", "🍓🎀🌷💕",
  ],
  aesthetic: [
    "🍂☕📚🤎", "🌙✨🖤🕯️", "☁️🕊️🤍🌿", "📷🎞️🪩✨",
    "🍵📖🌧️🤍", "🖤🌙⛓️✨", "🤎🍂🕯️📚", "🌿☁️🍃🤍",
    "✨🪐🌌💜", "🕯️📜🍷🤎", "🌧️☕📖🖤", "🤍🕊️🌷☁️",
  ],
  soft: [
    "🌸☁️🤍🫧", "💗🌷✨🍼", "🫧🌸💕☁️", "🤍🍰🌷✨",
    "🌷🫧💗🌸", "☁️💕🍼🤍", "✨🌸🫧💗", "🍰☁️🌷🤍",
    "💕🌸✨🫧", "🌷🤍🍼💕", "🫧💗☁️🌸", "🤍✨🌷🍰",
  ],
  dark: [
    "🖤⛓️🌙🔪", "🥀🖤🕷️🌑", "🌑⛓️🖤🥀", "🕷️🌙🖤🔗",
    "🖤🥀🌑🕯️", "⛓️🖤🌙🕷️", "🌑🖤🥀🔪", "🕯️🌑🖤⛓️",
    "🖤🌙🕷️🥀", "🥀⛓️🌑🖤", "🔗🖤🌙🥀", "🌑🕷️🖤🕯️",
  ],
  kawaii: [
    "🎀🍡🌸✨", "🧸🍓🎀💕", "🌸🍡🎀✨", "🍓🧁🌸🎀",
    "✨🎀🍡💕", "🌷🧸🍓✨", "🎀💕🌸🍡", "🍰🧸🎀🌸",
    "💕🍓✨🎀", "🌸🎀🧁🍡", "🍡✨🌷💕", "🧸🌸🎀🍓",
  ],
  nature: [
    "🌿🍃🌱🌸", "🌲🍂🌾🦋", "🌊🐚🌅🦀", "🍄🌲🦌🍂",
    "🌻🌾🐝☀️", "🌵🏜️🌞🦎", "❄️⛄🌨️🤍", "🌺🌴🥥☀️",
    "🍁🦊🌲🍂", "🌷🐝🌿🌸", "🦋🌸🌿💧", "🌅🌊🐬✨",
  ],
  luxury: [
    "💎👑🥂✨", "🖤💎👜🌹", "🥂✨👑💍", "💰💎🛍️✨",
    "🌹🖤💎🥂", "👑💍✨💎", "👜🌹🥂🖤", "✨💎👠🌹",
    "💍🥂💎👑", "🖤🌹💰✨", "💎🥂👜✨", "👑🌹💎🖤",
  ],
  minimal: [
    "🤍◻️▫️✨", "🖤◼️▪️🌙", "🤍☁️🕊️✨", "⬜🤍◽🕊️",
    "⬛🖤◾🌑", "🤍✨◻️☁️", "🖤🌙◼️✨", "◽🤍▫️🕊️",
    "◾🖤▪️🌑", "🤍🕊️✨◻️", "🖤✨◼️🌙", "☁️🤍◽✨",
  ],
  y2k: [
    "💿✨🦋💖", "📼💅✨🌟", "🦋💿💖✨", "🌟📼💅💿",
    "💖🦋🌟✨", "✨💿📼💖", "💅🌟🦋💿", "📼✨💖🌟",
    "🦋💅💿✨", "💖🌟📼🦋", "✨🌟💿💅", "💿🦋💖📼",
  ],
  beach: [
    "🌊🐚☀️🏖️", "🏝️🥥🌺✨", "🐬🌊☀️🐚", "🌅🏖️🌊🥥",
    "☀️🌺🏝️🐚", "🐚🌊✨🏖️", "🌊🥥☀️🌺", "🏖️🐬🌅✨",
    "🌺☀️🐚🌊", "🥥🏝️✨🌊", "🐚🏖️🌺☀️", "🌅🌊🐬🏝️",
  ],
};

export const BANK_SIZES = {
  vibes: VIBES.length,
  combosPerVibe: COMBOS_PER_VIBE,
  totalCombos: VIBES.length * COMBOS_PER_VIBE,
};

export interface ComboResult {
  vibe: EmojiVibe;
  count: number;
  combos: string[];
  copyAll: string;
  /** Always true — reminds consumers this is a curated bank, not AI. */
  isTemplateBased: true;
}

export const ASSUMPTIONS: string[] = [
  "Combos come from a fixed curated bank of 120 combos (10 vibes x 12) — they are picked in bank order, not generated or personalized.",
  "Emoji rendering varies by device and app — always preview a combo in your bio or caption before relying on it.",
];

function isVibe(s: string): s is EmojiVibe {
  return (VIBES as readonly string[]).includes(s);
}

function coerceCount(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Pick emoji combos. Throws for: missing/unknown vibe, count outside 1-10.
 */
export function pickCombos(vibeRaw: unknown, countRaw: unknown): ComboResult {
  if (typeof vibeRaw !== "string" || vibeRaw.trim().length === 0) {
    throw new Error("Please choose a vibe from the list.");
  }
  const vibe = vibeRaw.trim().toLowerCase();
  if (!isVibe(vibe)) {
    throw new Error(`Unknown vibe "${vibeRaw}". Valid vibes: ${VIBES.join(", ")}.`);
  }
  const count = coerceCount(countRaw);
  if (count === null) {
    throw new Error("Please enter how many combos you want (1-10).");
  }
  if (!Number.isInteger(count) || count < MIN_COUNT || count > MAX_COUNT) {
    throw new Error(`Count must be a whole number between ${MIN_COUNT} and ${MAX_COUNT}.`);
  }

  const combos = COMBO_BANK[vibe].slice(0, count);
  return {
    vibe,
    count,
    combos,
    copyAll: combos.join("\n"),
    isTemplateBased: true,
  };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Platform entry point. values: { vibe: string, count: number|string }.
 * Returns { combos: string[], copyAll: string }.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  try {
    const result = pickCombos(values["vibe"], values["count"]);
    return {
      ok: true,
      values: {
        combos: result.combos,
        copyAll: result.copyAll,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
