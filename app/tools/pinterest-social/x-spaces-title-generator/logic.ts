/**
 * X Spaces Title Generator — pure logic (tool-378), zero imports, zero
 * network, zero DOM.
 *
 * TEMPLATE LIBRARY, NOT AI: titles are assembled from 12 hand-written,
 * curiosity-led templates with the user's {topic} filled in. When guests
 * are provided, a " with {guests}" / " ft. {guests}" suffix rotates in on
 * alternating titles. Selection is deterministic: a char-code hash of
 * topic+guests rotates the starting template, then titles are served in
 * bank order — the same inputs always return the same 8 titles.
 *
 * Honesty note (per spec): no verified X Spaces title character limit was
 * found, so NO hard cap is enforced. Titles follow a ≤ 70-character
 * guidance instead; any template that would exceed 70 chars after the
 * topic is inserted gets the topic shortened (with an ellipsis) until it
 * fits. This guidance is stated in the UI copy and in meta.ts — it is not
 * presented as a platform rule.
 */

export const TITLE_COUNT = 8;
/** Guidance only — not a verified platform limit (see header note). */
export const TITLE_GUIDANCE_LIMIT = 70;
export const MAX_TOPIC_LEN = 120;
export const MAX_GUESTS_LEN = 120;

/**
 * 12 hand-written, curiosity-led title templates. {topic} = raw topic,
 * {Topic} = topic with first letter capitalized.
 */
const TITLE_TEMPLATES: string[] = [
  "The Truth About {topic} Nobody Tells You",
  "{topic}: Live Q&A — Ask Us Anything",
  "Why {topic} Is About to Change Everything",
  "Insider Secrets: Mastering {topic}",
  "{topic} Hot Takes: Unfiltered Debate",
  "From Zero to Pro: {topic} Live",
  "The {topic} Mistakes Costing You Money",
  "Breaking Down {topic}: What Actually Works",
  "{topic} AMA: Your Questions, Real Answers",
  "The Future of {topic} — Live Discussion",
  "{topic} Deep Dive: Beyond the Basics",
  "Controversial {topic} Opinions (Live)",
];

/** Guest suffixes, alternating by position. */
const GUEST_SUFFIXES: string[] = [" with {guests}", " ft. {guests}"];

/** Deterministic char-code hash — same inputs always pick the same start. */
export function hashSeed(s: string): number {
  let h = 0;
  for (const ch of s) h = (h + (ch.codePointAt(0) as number)) % 1000003;
  return h;
}

function capitalizeFirst(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

/** Shorten a topic with an ellipsis until the filled title fits guidance. */
function fitTopic(template: string, topic: string, suffix: string): string {
  let fitted = topic;
  const render = (f: string): string => {
    const shown = f.length === 0 ? "…" : f + "…";
    return template
      .replace(/\{Topic\}/g, capitalizeFirst(shown))
      .replace(/\{topic\}/g, shown) + suffix;
  };
  let title = template
    .replace(/\{Topic\}/g, capitalizeFirst(fitted))
    .replace(/\{topic\}/g, fitted) + suffix;
  while (title.length > TITLE_GUIDANCE_LIMIT && fitted.length > 0) {
    fitted = fitted.slice(0, -1).trimEnd();
    title = render(fitted);
  }
  return title;
}

export interface SpacesTitles {
  titles: string[];
}

/**
 * Generate 8 Spaces titles for a topic (and optional guests).
 * @throws {TypeError} on non-string inputs. @throws {Error} on empty topic.
 */
export function buildTitles(topic: string, guests: string): SpacesTitles {
  if (typeof topic !== "string" || typeof guests !== "string") {
    throw new TypeError("buildTitles expects two strings");
  }
  const cleanTopic = topic.trim();
  if (cleanTopic === "") throw new Error("buildTitles requires a non-empty topic");
  const cleanGuests = guests.trim();

  const start = hashSeed(cleanTopic + "|" + cleanGuests) % TITLE_TEMPLATES.length;
  const titles: string[] = [];
  for (let i = 0; i < TITLE_COUNT; i++) {
    const template = TITLE_TEMPLATES[(start + i) % TITLE_TEMPLATES.length];
    const suffix =
      cleanGuests === ""
        ? ""
        : GUEST_SUFFIXES[i % GUEST_SUFFIXES.length].replace(/\{guests\}/g, cleanGuests);
    titles.push(fitTopic(template, cleanTopic, suffix));
  }
  return { titles };
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const topicRaw = values["topic"];
  if (typeof topicRaw !== "string" || topicRaw.trim() === "") {
    return { ok: false, error: "Please enter the topic of your Space." };
  }
  const topic = topicRaw.trim();
  if (topic.length > MAX_TOPIC_LEN) {
    return { ok: false, error: `Topic is too long (max ${MAX_TOPIC_LEN} characters).` };
  }

  const guestsRaw = values["guests"];
  const guests = typeof guestsRaw === "string" ? guestsRaw.trim() : "";
  if (guests.length > MAX_GUESTS_LEN) {
    return { ok: false, error: `Guest names are too long (max ${MAX_GUESTS_LEN} characters).` };
  }

  const { titles } = buildTitles(topic, guests);
  return {
    ok: true,
    values: { spaceTitles: titles },
  };
}
