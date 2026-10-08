/**
 * X Thread Idea Generator — pure logic (tool-371). Zero imports, zero
 * network, zero DOM, no randomness.
 *
 * TEMPLATE BANK, NOT AI: assembles a structured thread outline from
 * hand-written sentence templates with the user's topic inserted.
 *
 * Template banks (documented sizes):
 *   HOOK_TEMPLATES  — 10 hook templates (tweet 1, standalone).
 *   POINT_TEMPLATES — 12 point templates (middle tweets).
 *   CTA_TEMPLATES   —  8 call-to-action templates (final tweet).
 * Totals: 30 templates. Nothing is written by AI.
 *
 * Thread structure: tweet 1 = hook, tweets 2..N-1 = points, tweet N = CTA.
 * Each tweet is kept within 280 weighted characters (conservative X-style
 * weighted count: URLs count 23, non-ASCII code points count 2, everything
 * else counts 1). Over-budget text is trimmed at a word boundary with an
 * ellipsis and reported.
 *
 * Deterministic: same inputs -> same outputs (template index = char-code
 * sum of inputs, offset per position, modulo bank size).
 */

export const THREAD_LIMIT = 280;
export const MIN_TWEETS = 2;
export const MAX_TWEETS = 25;
export const DEFAULT_TWEETS = 7;
export const MAX_TOPIC_LENGTH = 140;
/** Topics shorter than this word count are "thin" for long threads. */
export const THIN_TOPIC_WORDS = 4;
export const THIN_TOPIC_MAX = 8;

/** Placeholder used inside every template for the user's topic. */
export const TOPIC_TOKEN = "{topic}";

/** 10 hook templates. Placeholders: {topic}. Each is standalone. */
export const HOOK_TEMPLATES: string[] = [
  "I spent 6 months studying {topic}. Here's everything I wish someone told me on day 1:",
  "{topic} in one thread — no fluff, just the lessons that actually matter:",
  "Stop guessing about {topic}. I made every mistake so you don't have to:",
  "Everyone talks about {topic}. Almost nobody explains it well. Let me fix that:",
  "What I learned about {topic} after doing it wrong for a year (thread):",
  "{topic}, explained like you're smart but busy. A thread:",
  "I used to be terrible at {topic}. Then I learned these 7 things:",
  "The {topic} thread I wish existed when I started:",
  "Hot take: most advice about {topic} is outdated. Here's what works now:",
  "Nobody is talking about {topic} the right way. Thread time:",
];

/** 12 point templates. Placeholders: {topic}. */
export const POINT_TEMPLATES: string[] = [
  "First: the basics of {topic} matter more than the advanced stuff. Nail the fundamentals and 80% of your problems disappear.",
  "Second: consistency beats intensity with {topic}. Small daily reps outperform one heroic effort every time.",
  "Third: track your progress on {topic}. What gets measured gets improved — even a simple notes file works.",
  "Most people quit {topic} right before it clicks. The dip is normal. Push through.",
  "The mistake I see most with {topic}: copying someone else's playbook instead of adapting it to your situation.",
  "Environment beats willpower. Set up your surroundings so the {topic} habit is the easy choice.",
  "Ask for feedback early on {topic}. A 5-minute review from someone ahead of you saves weeks of wandering.",
  "Document what you learn about {topic}. Future-you will thank present-you — and it becomes content later.",
  "Beware shiny-object syndrome. New {topic} tools and trends appear weekly; master one approach before adding another.",
  "Find one person further along in {topic} and study their path. Model, don't idolize.",
  "The 80/20 of {topic}: a handful of actions drive nearly all the results. Identify yours and double down.",
  "Patience is the unfair advantage in {topic}. Everyone wants it fast; almost nobody wants to wait it out.",
];

/** 8 CTA templates. Placeholders: {topic}. Each ends the thread with a call to action. */
export const CTA_TEMPLATES: string[] = [
  "That's it! If this helped, follow me for more threads on {topic} — and repost the first tweet so others can learn too.",
  "Want more like this? Follow for weekly threads on {topic}. And bookmark this one for later.",
  "Found this useful? Repost it so someone else discovers {topic} today. Follow for part 2.",
  "If you're serious about {topic}, follow me — I post practical threads every week. No fluff.",
  "Your turn: reply with your biggest {topic} question and I'll cover it in the next thread. Follow so you don't miss it.",
  "This thread took hours to write. One repost keeps it going — and follow for more {topic} breakdowns.",
  "Save this thread if you're starting {topic}. Follow me for the advanced playbook next week.",
  "That's the {topic} starter pack. Follow for the deep dives — I share what actually works, not theory.",
];

export type ThreadRole = "hook" | "point" | "cta";

export interface ThreadTweet {
  position: number;
  text: string;
  role: ThreadRole;
}

export interface ThreadIdeaResult {
  ok: boolean;
  values?: {
    thread: ThreadTweet[];
    note: string;
  };
  error?: string;
}

const URL_RE = /https?:\/\/[^\s]+/g;

/**
 * Conservative X-style weighted character count. URLs count 23
 * (documented t.co behavior); non-ASCII code points count 2; all else 1.
 * Documented in the methodology as an approximation, not an official API.
 */
export function weightedLength(text: string): number {
  const replaced = text.replace(URL_RE, "x".repeat(23));
  let n = 0;
  for (const ch of replaced) {
    n += (ch.codePointAt(0) as number) > 127 ? 2 : 1;
  }
  return n;
}

/** Deterministic seed: sum of char codes of the string. */
export function seedOf(s: string): number {
  let total = 0;
  for (let i = 0; i < s.length; i++) total += s.charCodeAt(i);
  return total;
}

/** Fill {topic} placeholders with the topic. */
export function fill(template: string, topic: string): string {
  return template.split(TOPIC_TOKEN).join(topic);
}

/**
 * Trim text to fit the weighted limit at a word boundary, adding an
 * ellipsis when trimmed. Returns the text and whether trimming happened.
 */
export function trimToLimit(text: string, limit: number): { text: string; trimmed: boolean } {
  if (weightedLength(text) <= limit) return { text, trimmed: false };
  const words = text.split(/\s+/);
  let out = "";
  for (const w of words) {
    const candidate = out === "" ? w : out + " " + w;
    if (weightedLength(candidate + "…") > limit) break;
    out = candidate;
  }
  // Single unbreakable word exceeding the limit: keep it whole and report.
  if (out === "") return { text: words[0] ?? text, trimmed: true };
  return { text: out + "…", trimmed: true };
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function runTool(values: Record<string, unknown>): ThreadIdeaResult {
  const topicRaw = values["topic"];
  if (!isNonEmptyString(topicRaw)) {
    return { ok: false, error: "Please enter a topic for your thread (e.g. \"freelance copywriting\")." };
  }
  const topic = topicRaw.trim();
  if (topic.length > MAX_TOPIC_LENGTH) {
    return {
      ok: false,
      error: `Keep the topic under ${MAX_TOPIC_LENGTH} characters (yours is ${topic.length}) — short topics make stronger threads.`,
    };
  }

  const notes: string[] = [];

  // tweetCount: optional, default 7, must be an integer in 2..25;
  // >25 is clamped to 25 with a note (thread practicality).
  let tweetCount = DEFAULT_TWEETS;
  const countRaw = values["tweetCount"];
  if (countRaw !== undefined && countRaw !== null && String(countRaw).trim() !== "") {
    const n = Number(countRaw);
    if (!Number.isInteger(n)) {
      return { ok: false, error: "Tweet count must be a whole number." };
    }
    if (n < MIN_TWEETS) {
      return { ok: false, error: `A thread needs at least ${MIN_TWEETS} tweets (hook + CTA).` };
    }
    if (n > MAX_TWEETS) {
      tweetCount = MAX_TWEETS;
      notes.push(`Tweet count capped at ${MAX_TWEETS} — longer threads rarely get finished.`);
    } else {
      tweetCount = n;
    }
  }

  // Thin-topic edge case: a very short topic cannot honestly fill a long thread.
  const words = wordCount(topic);
  if (words < THIN_TOPIC_WORDS && tweetCount > THIN_TOPIC_MAX) {
    tweetCount = THIN_TOPIC_MAX;
    notes.push(
      `Topic is short (${words} words), so the thread was reduced to ${THIN_TOPIC_MAX} tweets — add detail to your topic for a longer thread.`,
    );
  }

  const seed = seedOf(topic + "|" + tweetCount);
  const thread: ThreadTweet[] = [];
  let trimmedAny = false;

  for (let i = 0; i < tweetCount; i++) {
    let template: string;
    let role: ThreadRole;
    if (i === 0) {
      role = "hook";
      template = HOOK_TEMPLATES[(seed + i) % HOOK_TEMPLATES.length];
    } else if (i === tweetCount - 1) {
      role = "cta";
      template = CTA_TEMPLATES[(seed + i) % CTA_TEMPLATES.length];
    } else {
      role = "point";
      template = POINT_TEMPLATES[(seed + i) % POINT_TEMPLATES.length];
    }
    const built = fill(template, topic);
    const trimmed = trimToLimit(built, THREAD_LIMIT);
    if (trimmed.trimmed) trimmedAny = true;
    thread.push({ position: i + 1, text: trimmed.text, role });
  }

  if (trimmedAny) {
    notes.push("One or more tweets were trimmed at a word boundary to fit the 280-character budget.");
  }

  const note =
    `Generated a ${tweetCount}-tweet outline for "${topic}" from a fixed bank of ` +
    `${HOOK_TEMPLATES.length + POINT_TEMPLATES.length + CTA_TEMPLATES.length} templates (no AI). ` +
    `Tweet 1 is a standalone hook; the final tweet carries the call to action; every tweet fits the 280 weighted-character budget.` +
    (notes.length > 0 ? " " + notes.join(" ") : "");

  return { ok: true, values: { thread, note } };
}
