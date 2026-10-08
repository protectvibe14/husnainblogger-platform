/**
 * Facebook Group Name Generator — pure logic (tool-388). Zero imports, zero
 * network, zero DOM.
 *
 * TEMPLATE BANK, NOT AI: assembles group-name candidates from hand-written
 * name patterns with the user's community topic inserted.
 *
 * Tone banks (10 patterns each):
 *   PROFESSIONAL_PATTERNS — formal, networking-oriented phrasing.
 *   CASUAL_PATTERNS       — friendly, enthusiast phrasing.
 * Totals: 20 patterns. Nothing is written by AI.
 *
 * Character cap: every candidate is kept <= 75 characters.
 * HONESTY NOTE (per spec): the group-name limit is SECONDARY-SOURCED, so
 * the 75-char cap is applied as guidance — the output's capNote says so
 * plainly rather than guaranteeing Facebook's current limit.
 *
 * Deterministic: same inputs -> same outputs (start index = char-code sum
 * of inputs, modulo bank size; 8 consecutive patterns, wrapping).
 */

export const GROUP_NAME_LIMIT = 75;

/** Input bounds. */
export const MAX_TOPIC_LENGTH = 60;

/** Number of name candidates returned per run. */
export const NAME_COUNT = 8;

export type GroupTone = "professional" | "casual";

/** Supported tones, in canonical order. */
export const GROUP_TONES: GroupTone[] = ["professional", "casual"];

/** 10 professional-tone group-name patterns. Placeholder: {topic}. */
export const PROFESSIONAL_PATTERNS: string[] = [
  "{topic} Professionals",
  "The {topic} Network",
  "{topic} Mastermind Group",
  "{topic} Community Hub",
  "Advanced {topic} Forum",
  "The {topic} Collective",
  "{topic} Leaders & Learners",
  "Professional {topic} Exchange",
  "{topic} Growth Community",
  "The {topic} Alliance",
];

/** 10 casual-tone group-name patterns. Placeholder: {topic}. */
export const CASUAL_PATTERNS: string[] = [
  "{topic} Lovers",
  "The {topic} Club",
  "Crazy About {topic}",
  "{topic} Enthusiasts",
  "The {topic} Hangout",
  "{topic} Addicts Anonymous",
  "Just {topic} Things",
  "{topic} Fan Club",
  "The Daily {topic}",
  "All Things {topic}",
];

export interface GroupNameResultValues {
  ok: boolean;
  values?: {
    groupNames: string[];
    copyAll: string;
    toneUsed: string;
    capNote: string;
  };
  error?: string;
}

function sumChars(s: string): number {
  let total = 0;
  for (let i = 0; i < s.length; i++) total += s.charCodeAt(i);
  return total;
}

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export function runTool(values: Record<string, unknown>): GroupNameResultValues {
  const topicRaw = values["communityTopic"];
  if (typeof topicRaw !== "string" || topicRaw.trim().length === 0) {
    return { ok: false, error: "Please enter your community topic (e.g. sourdough baking, freelance design)." };
  }
  const topic = titleCase(topicRaw.trim());

  if (topic.length > MAX_TOPIC_LENGTH) {
    return { ok: false, error: `Keep your community topic under ${MAX_TOPIC_LENGTH} characters (yours is ${topic.length}).` };
  }

  let tone: GroupTone = "professional"; // default per spec (optional input)
  const toneRaw = values["tone"];
  if (typeof toneRaw === "string" && toneRaw.trim().length > 0) {
    const t = toneRaw.trim().toLowerCase();
    if (t === "professional" || t === "casual") {
      tone = t;
    } else {
      return { ok: false, error: "Tone must be 'professional' or 'casual'." };
    }
  }

  const bank = tone === "professional" ? PROFESSIONAL_PATTERNS : CASUAL_PATTERNS;
  const seed = sumChars(topic + "|" + tone);
  const start = seed % bank.length;

  const groupNames: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < bank.length && groupNames.length < NAME_COUNT; i++) {
    const name = bank[(start + i) % bank.length].split("{topic}").join(topic);
    if (name.length === 0 || name.length > GROUP_NAME_LIMIT || seen.has(name)) continue;
    seen.add(name);
    groupNames.push(name);
  }

  return {
    ok: true,
    values: {
      groupNames,
      copyAll: groupNames.join("\n"),
      toneUsed: tone === "professional" ? "Professional" : "Casual",
      capNote:
        "Guidance, not a guarantee: Facebook's group-name limit is widely reported around 75 characters (secondary source) — every name above is within it, but double-check Facebook's current rule before publishing.",
    },
  };
}
