/**
 * Shorts Hook Bank (tool-124) — pure logic, zero imports, zero network,
 * zero DOM, no Math.random.
 *
 * TEMPLATE BANK, NOT AI. Returns opening lines assembled from 40
 * hand-written hook formulas (10 per style × 4 styles — bank sizes
 * documented below and in the result). The {topic} placeholder is filled
 * with the user's topic; nothing is written by a language model.
 *
 * Selection is deterministic: hooks are served in bank order, cycling back
 * to the start when `count` exceeds the 10 templates of the style.
 *
 * Hook styles (fixed list), all specific to the first 2 seconds of
 * vertical short-form:
 *   question    — curiosity-driving questions
 *   bold-claim  — confident, punchy statements
 *   visual      — "show, don't tell" watch-this openers
 *   loop        — seamless-rewatch open loops (… + ellipsis lead-in)
 */

export type HookStyle = "question" | "bold-claim" | "visual" | "loop";

/** The four supported styles, in canonical order. */
export const HOOK_STYLES: HookStyle[] = [
  "question",
  "bold-claim",
  "visual",
  "loop",
];

/** Human labels for the style options. */
export const STYLE_LABELS: Record<HookStyle, string> = {
  question: "Question",
  "bold-claim": "Bold claim",
  visual: "Visual (show, don't tell)",
  loop: "Loop (seamless rewatch)",
};

/** Templates per style (also the count at which the bank starts cycling). */
export const TEMPLATES_PER_STYLE = 10;

/** Maximum hooks per call. Requests above this are capped (capped: true). */
export const MAX_HOOKS = 40;

/** Default hook count when the input is omitted. */
export const DEFAULT_COUNT = 10;

/**
 * Hand-written template banks. `{topic}` is replaced with the user's topic.
 * Bank sizes: 10 templates per style, 40 total. Documented here so the UI
 * can state honestly what the tool does ("40 hand-written templates").
 */
const BANKS: Record<HookStyle, string[]> = {
  question: [
    "What if everything you knew about {topic} was wrong?",
    "Why does nobody talk about this {topic} trick?",
    "Could {topic} be the reason you're stuck?",
    "What happens when you try {topic} for 30 days?",
    "Is {topic} actually worth your time?",
    "What's the #1 mistake people make with {topic}?",
    "Have you been doing {topic} wrong this whole time?",
    "What does {topic} look like for a total beginner?",
    "Why do the best in {topic} all do this one thing?",
    "Can you really master {topic} in 7 days?",
  ],
  "bold-claim": [
    "Stop doing {topic} — do this instead.",
    "This {topic} trick works every single time.",
    "Nobody is ready for this {topic} truth.",
    "{topic} is broken. Here's the fix.",
    "I wasted a year on {topic} before learning this.",
    "This is the fastest way to win at {topic}.",
    "Everything they told you about {topic} is outdated.",
    "{topic} in 30 seconds — no fluff.",
    "The {topic} shortcut nobody shares.",
    "Do {topic} like this and you'll never go back.",
  ],
  visual: [
    "Watch what happens when I try {topic} live.",
    "This is {topic} done right — watch closely.",
    "POV: you finally get {topic} right.",
    "Look at this {topic} transformation.",
    "I'm doing {topic} wrong on purpose — spot the mistake.",
    "Before and after: {topic} edition.",
    "You need to see this {topic} result to believe it.",
    "Filming my {topic} attempt — no edits.",
    "This {topic} demo broke my expectations.",
    "Side by side: bad {topic} vs good {topic}.",
  ],
  loop: [
    "Here's why {topic} keeps failing for you — and the fix starts now…",
    "The {topic} loop nobody escapes: watch till the end…",
    "I tried {topic} 100 times — attempt 100 changed everything…",
    "This {topic} cycle repeats forever unless you…",
    "Round 1 of {topic}: fail. Round 2: watch this…",
    "The {topic} pattern: mistake, fix, repeat — starting now…",
    "Stop scrolling — this {topic} loop ends with a trick…",
    "{topic}, but every attempt gets better — watch…",
    "The endless {topic} debate ends right here…",
    "One {topic} loop, three lessons — first one now…",
  ],
};

/** Bank sizes per style, exported for tests and honest UI copy. */
export const BANK_SIZES: Record<HookStyle, number> = {
  question: BANKS.question.length,
  "bold-claim": BANKS["bold-claim"].length,
  visual: BANKS.visual.length,
  loop: BANKS.loop.length,
};

export interface GeneratedHook {
  /** The filled hook line. */
  line: string;
  /** Template attribution, e.g. "bold-claim #3". */
  template: string;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function fillTopic(template: string, topic: string): string {
  return template.split("{topic}").join(topic);
}

/**
 * Generate hooks for a topic + style. Exported so the bank is testable
 * without runTool.
 */
export function generateHooks(
  topic: string,
  style: HookStyle,
  count: number,
): { hooks: GeneratedHook[]; capped: boolean } {
  const bank = BANKS[style];
  const capped = count > MAX_HOOKS;
  const n = Math.min(Math.max(1, Math.floor(count)), MAX_HOOKS);
  const hooks: GeneratedHook[] = [];
  for (let i = 0; i < n; i++) {
    const idx = i % bank.length;
    hooks.push({
      line: fillTopic(bank[idx], topic),
      template: `${style} #${idx + 1}`,
    });
  }
  return { hooks, capped };
}

/**
 * runTool — generator dispatch shape.
 * values in:  { topic, style, count? }
 * values out: { hooks, count, note }
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const rawTopic = values["topic"];
  const topic = typeof rawTopic === "string" ? rawTopic.trim() : "";
  if (!topic) {
    return { ok: false, error: "Enter a topic for your Short (e.g. \"sourdough starter\")." };
  }

  const rawStyle = values["style"];
  const style = typeof rawStyle === "string" ? rawStyle.trim().toLowerCase() : "";
  if (!(HOOK_STYLES as readonly string[]).includes(style)) {
    return {
      ok: false,
      error: `Pick a hook style: ${HOOK_STYLES.join(", ")}.`,
    };
  }

  const rawCount = values["count"];
  const count =
    rawCount === undefined || rawCount === null || rawCount === ""
      ? DEFAULT_COUNT
      : typeof rawCount === "number"
        ? rawCount
        : Number(String(rawCount).trim());
  if (!Number.isFinite(count) || count < 1) {
    return { ok: false, error: "Hook count must be at least 1." };
  }

  const { hooks, capped } = generateHooks(topic, style as HookStyle, count);
  const lines = hooks.map((h) => `${h.line}  [template: ${h.template}]`);
  const totalBank = HOOK_STYLES.reduce((sum, s) => sum + BANK_SIZES[s], 0);
  const note =
    `Template library, not AI: ${hooks.length} hook${hooks.length === 1 ? "" : "s"} ` +
    `assembled from ${totalBank} hand-written templates (10 per style × 4 styles) ` +
    `with your topic filled in.` +
    (capped ? ` Requests above ${MAX_HOOKS} are capped.` : "") +
    (hooks.length > BANK_SIZES[style as HookStyle]
      ? " Bank cycled — templates repeat after 10."
      : "");

  return {
    ok: true,
    values: { hooks: lines, count: hooks.length, note },
  };
}
