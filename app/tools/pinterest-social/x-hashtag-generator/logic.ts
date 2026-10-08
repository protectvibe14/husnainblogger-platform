/**
 * X Hashtag Generator — pure logic (tool-375). Zero imports, zero network,
 * zero DOM, no randomness.
 *
 * CURATED BANK, NOT TREND DATA: builds hashtag suggestions from the user's
 * topic (its words, joined and separate, in CamelCase) plus a fixed,
 * hand-written bank of generic community/context tags. Live trend data is
 * unavailable client-side, so every output is labeled as composed — never
 * presented as "trending".
 *
 * Curated bank: GENERIC_TAGS — 24 generic, non-trend tags (documented).
 * Topics in LOW_HASHTAG_TOPICS (8 entries) get an extra honest note:
 * hashtags add little value on X for these subjects.
 *
 * count: optional 1–5 (default 3). Best-practice cap (0–2 per post) is
 * surfaced in the usage note.
 *
 * Deterministic: same inputs -> same outputs (bank picks = char-code seed
 * of the topic, modulo bank size).
 */

export const MIN_COUNT = 1;
export const MAX_COUNT = 5;
export const DEFAULT_COUNT = 3;
export const MAX_TOPIC_LENGTH = 100;

/**
 * 24 generic community/context tags. Curated by hand — NOT live trend data.
 */
export const GENERIC_TAGS: string[] = [
  "Tips", "HowTo", "Thread", "Discussion", "Community",
  "LearnWithMe", "DidYouKnow", "TodayILearned", "ProTip", "Beginners",
  "Guide", "Explained", "DeepDive", "AskX", "MyTake",
  "UnpopularOpinion", "HotTake", "StoryTime", "LifeLessons", "Motivation",
  "Productivity", "Mindset", "Growth", "Journey",
];

/**
 * Topics where hashtags add little value on X — the tool says so honestly
 * instead of pretending the tags will help.
 */
export const LOW_HASHTAG_TOPICS: string[] = [
  "tax", "accounting", "insurance", "legal", "funeral",
  "plumbing", "mortgage", "divorce",
];

export interface HashtagResult {
  ok: boolean;
  values?: {
    hashtags: string[];
    usageNote: string;
  };
  error?: string;
}

/** Deterministic seed: sum of char codes. */
export function seedOf(s: string): number {
  let total = 0;
  for (let i = 0; i < s.length; i++) total += s.charCodeAt(i);
  return total;
}

/** Capitalize the first letter of a word. */
function cap(word: string): string {
  if (word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Normalize a raw topic fragment into a valid hashtag body:
 * keep letters/digits/underscore only (Unicode-aware), drop spaces.
 */
export function normalizeTagBody(raw: string): string {
  return raw.replace(/[^\p{L}\p{N}_]/gu, "");
}

/**
 * Build candidate tag bodies from the topic: the full joined topic plus
 * each significant word on its own. Returns unique, non-empty bodies.
 */
export function topicTags(topic: string): string[] {
  const words = topic.split(/[\s\-_]+/).map(normalizeTagBody).filter((w) => w.length > 0);
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (body: string): void => {
    const lowered = body.toLowerCase();
    if (!seen.has(lowered)) {
      seen.add(lowered);
      out.push(body);
    }
  };
  if (words.length > 1) push(words.map(cap).join(""));
  for (const w of words) {
    if (w.length >= 3) push(cap(w));
  }
  if (words.length === 1 && words[0].length >= 3) push(cap(words[0]));
  return out;
}

export function runTool(values: Record<string, unknown>): HashtagResult {
  const topicRaw = values["topic"];
  if (typeof topicRaw !== "string" || topicRaw.trim().length === 0) {
    return { ok: false, error: "Please enter a topic (e.g. \"freelance design\")." };
  }
  let topic = topicRaw.trim().replace(/^#+/, "");
  if (topic.length > MAX_TOPIC_LENGTH) {
    return {
      ok: false,
      error: `Keep the topic under ${MAX_TOPIC_LENGTH} characters (yours is ${topic.length}).`,
    };
  }
  if (!/[\p{L}\p{N}]/u.test(topic)) {
    return { ok: false, error: "The topic needs at least one letter or digit to build hashtags from." };
  }

  // count: optional, default 3, must be an integer in 1..5.
  let count = DEFAULT_COUNT;
  const countRaw = values["count"];
  if (countRaw !== undefined && countRaw !== null && String(countRaw).trim() !== "") {
    const n = Number(countRaw);
    if (!Number.isInteger(n)) {
      return { ok: false, error: "Count must be a whole number." };
    }
    if (n < MIN_COUNT || n > MAX_COUNT) {
      return { ok: false, error: `Count must be between ${MIN_COUNT} and ${MAX_COUNT}.` };
    }
    count = n;
  }

  const topicDerived = topicTags(topic);
  const seed = seedOf(topic.toLowerCase());

  // Deterministic generic-tag picks, skipping any that duplicate topic tags.
  const derivedLower = new Set(topicDerived.map((t) => t.toLowerCase()));
  const generic: string[] = [];
  let i = 0;
  while (generic.length < GENERIC_TAGS.length && i < GENERIC_TAGS.length * 2) {
    const tag = GENERIC_TAGS[(seed + i) % GENERIC_TAGS.length];
    i++;
    if (derivedLower.has(tag.toLowerCase())) continue;
    if (generic.some((g) => g.toLowerCase() === tag.toLowerCase())) continue;
    generic.push(tag);
  }

  const hashtags: string[] = [];
  for (const body of [...topicDerived, ...generic]) {
    if (hashtags.length >= count) break;
    hashtags.push("#" + body);
  }

  const lowCulture = LOW_HASHTAG_TOPICS.some((t) => topic.toLowerCase().includes(t));
  let usageNote =
    "0–2 hashtags per post is the recommended best practice — more reads as spam. " +
    "These tags are composed from your topic plus a curated generic bank; they are NOT live trending data, which is unavailable client-side. " +
    "Check X search before posting to see which tags your audience actually uses.";
  if (lowCulture) {
    usageNote +=
      " Honest note: hashtags add little value on X for this topic — most of these posts perform better with none.";
  }

  return { ok: true, values: { hashtags, usageNote } };
}
