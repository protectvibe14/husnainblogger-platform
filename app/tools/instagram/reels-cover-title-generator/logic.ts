/**
 * Reels Cover Title Generator — pure logic (tool-209), zero imports, zero
 * network, zero DOM, no Math.random.
 *
 * TEMPLATE BANK, NOT AI: titles are assembled from a fixed bank of 48
 * hand-written cover-title formulas (12 per tone). Selection is
 * deterministic: a string hash of the topic picks the start offset inside
 * the chosen tone's pool. If count exceeds the 12 tone-specific formulas,
 * remaining titles cycle through the full bank (skipping duplicates), so up
 * to 20 unique titles are always returned.
 *
 * LENGTH RULE (spec validation): covers stay readable at ≤ 60 characters.
 * Titles longer than 60 chars are auto-truncated at the last word boundary
 * (≤ 57 chars + "…") and the truncation count is reported in the safe-zone
 * note (spec edge case: "long titles -> auto-truncate option with warning").
 */

export type CoverTone = "bold" | "playful" | "professional" | "curious";

/** The four supported tones, in canonical order. */
export const COVER_TONES: CoverTone[] = ["bold", "playful", "professional", "curious"];

export const MIN_COUNT = 1;
export const MAX_COUNT = 20;
export const MAX_TITLE_CHARS = 60; // recommended cover readability limit

/** 12 fixed formulas per tone (48 total). {topic} = user's trimmed topic. */
const TITLE_BANK: Record<CoverTone, string[]> = {
  bold: [
    "{topic} — Do This NOW",
    "STOP Ignoring {topic}",
    "The {topic} Truth",
    "{topic} Changed Everything",
    "I Was Wrong About {topic}",
    "This {topic} Hack Wins",
    "Nobody Tells You This About {topic}",
    "{topic}: The Hard Truth",
    "Watch This Before {topic}",
    "The {topic} Shortcut",
    "{topic} in 30 Seconds",
    "Why {topic} Works",
  ],
  playful: [
    "POV: You Finally Get {topic}",
    "{topic} But Make It Fun",
    "The {topic} Glow-Up",
    "Me vs {topic}: I Win",
    "{topic} Era Loading...",
    "Oops, I Mastered {topic}",
    "{topic} Hits Different",
    "Plot Twist: {topic}",
    "Main Character {topic}",
    "{topic} But Cuter",
    "Hot Take: {topic}",
    "The {topic} Vibe Check",
  ],
  professional: [
    "The {topic} Framework",
    "{topic}: A Complete Guide",
    "How {topic} Works",
    "The {topic} Playbook",
    "{topic} Best Practices",
    "Understanding {topic}",
    "The {topic} Process",
    "{topic} Explained Simply",
    "A Smarter Way to {topic}",
    "The {topic} Checklist",
    "{topic} for Professionals",
    "Mastering {topic}",
  ],
  curious: [
    "What If {topic} Worked?",
    "Why Does {topic} Work?",
    "The {topic} Mystery",
    "Is {topic} Worth It?",
    "What Nobody Asks About {topic}",
    "{topic}: Expectation vs Reality",
    "The Secret Behind {topic}",
    "How Does {topic} Actually Work?",
    "{topic} — Fact or Hype?",
    "What's Inside {topic}?",
    "The {topic} Experiment",
    "Does {topic} Really Work?",
  ],
};

/** Documented bank sizes. */
export const BANK_SIZES = {
  formulas: 48,
  perTone: 12,
  tones: COVER_TONES.length,
  maxTitleChars: MAX_TITLE_CHARS,
};

/** Deterministic FNV-1a 32-bit hash (no Math.random anywhere). */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function isCoverTone(s: string): s is CoverTone {
  return (COVER_TONES as string[]).includes(s);
}

function toCount(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value.trim()) : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

/** Truncate at the last space within 57 chars, append "…". Returns [text, wasTruncated]. */
export function enforceLength(title: string): [string, boolean] {
  if (title.length <= MAX_TITLE_CHARS) return [title, false];
  const cut = title.lastIndexOf(" ", MAX_TITLE_CHARS - 4);
  const base = cut > 10 ? title.slice(0, cut) : title.slice(0, MAX_TITLE_CHARS - 3);
  return [base + "…", true];
}

export interface CoverTitle {
  title: string;
  chars: number;
  truncated: boolean;
}

export interface CoverTitlesResult {
  topic: string;
  tone: CoverTone;
  count: number;
  titles: CoverTitle[];
  truncatedCount: number;
  safeZoneNote: string;
  isTemplateBased: true;
}

export function generateCoverTitles(topicRaw: string, tone: CoverTone, count: number): CoverTitlesResult {
  const topic = topicRaw.trim().replace(/\s+/g, " ");
  const pool = TITLE_BANK[tone];
  const all = COVER_TONES.flatMap((t) => TITLE_BANK[t]);

  const picked: string[] = [];
  const seen = new Set<string>();
  const offset = hashString(topic.toLowerCase()) % pool.length;
  for (let i = 0; i < pool.length && picked.length < count; i++) {
    const t = pool[(offset + i) % pool.length].replace("{topic}", topic);
    if (!seen.has(t)) {
      seen.add(t);
      picked.push(t);
    }
  }
  // Fill any remainder from the full bank (deterministic second offset).
  const offset2 = (hashString(topic.toLowerCase() + "|" + tone) + 7) % all.length;
  for (let i = 0; i < all.length && picked.length < count; i++) {
    const t = all[(offset2 + i) % all.length].replace("{topic}", topic);
    if (!seen.has(t)) {
      seen.add(t);
      picked.push(t);
    }
  }

  let truncatedCount = 0;
  const titles: CoverTitle[] = picked.map((raw) => {
    const [title, truncated] = enforceLength(raw);
    if (truncated) truncatedCount++;
    return { title, chars: title.length, truncated };
  });

  const safeZoneNote = [
    "Cover safe zones (1080x1920): keep key text inside the middle vertical band — the top ~200 px is cropped in the profile grid, and the bottom ~350 px sits under the caption and UI buttons. Center your title, 3–6 words, high contrast.",
    `All titles assembled from a fixed bank of 48 hand-written formulas (${tone} tone) — not AI-generated.`,
    truncatedCount > 0
      ? `${truncatedCount} title${truncatedCount === 1 ? " was" : "s were"} over ${MAX_TITLE_CHARS} chars and auto-truncated at a word boundary (marked with …).`
      : `Every title is within the ${MAX_TITLE_CHARS}-char readability limit.`,
  ].join(" ");

  return { topic, tone, count, titles, truncatedCount, safeZoneNote, isTemplateBased: true };
}

/** Template entry point. values: topic (text), tone (select), count (number). */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const topicRaw = values.topic;
  if (typeof topicRaw !== "string" || topicRaw.trim() === "") {
    return { ok: false, error: "Topic is required — what is the reel about? (e.g. \"meal prep\")." };
  }
  const toneRaw = values.tone;
  const tone: string =
    toneRaw === undefined || toneRaw === null || String(toneRaw).trim() === ""
      ? "bold"
      : String(toneRaw).trim().toLowerCase();
  if (!isCoverTone(tone)) {
    return { ok: false, error: `Tone "${String(toneRaw)}" is not supported — pick one: ${COVER_TONES.join(", ")}.` };
  }
  const count = toCount(values.count);
  if (count === null || count < MIN_COUNT || count > MAX_COUNT) {
    return { ok: false, error: `Count must be a whole number from ${MIN_COUNT} to ${MAX_COUNT}.` };
  }
  const result = generateCoverTitles(topicRaw, tone, count);
  return {
    ok: true,
    values: {
      titles: result.titles.map((t) => `${t.title} (${t.chars} chars)`),
      safeZoneNote: result.safeZoneNote,
    },
  };
}
