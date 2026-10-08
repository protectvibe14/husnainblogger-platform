/**
 * Newsletter Outline Generator — pure logic (tool-418).
 *
 * HONESTY / ASSUMPTIONS (also surfaced in meta.ts):
 * - This is a DETERMINISTIC outline assembler from a FIXED template
 *   library (sizes documented below). It is NOT AI and does NOT write
 *   newsletter copy — it produces a planning scaffold: sections with a
 *   word budget and a writing purpose each.
 * - Word budgets are arithmetic splits of the user's target word count and
 *   always sum to exactly that target.
 * - Lengths are measured in Unicode code points ([...s].length).
 * - Overlong inputs are truncated WITH a visible notice, never silently.
 *
 * TEMPLATE LIBRARY SIZES:
 * - SECTION_TEMPLATES: 8 default sections (fixed label/purpose/weight)
 * - TONE_VOICE: 5 tones x 1 voice-guidance line
 * - MAX_CUSTOM_SECTIONS: 12 user-supplied section names
 */

export const TONES = [
  "playful",
  "professional",
  "witty",
  "minimal",
  "bold",
] as const;
export type Tone = (typeof TONES)[number];

export const MAX_TOPIC_CHARS = 120;
export const MAX_CUSTOM_SECTIONS = 12;
export const MIN_TARGET_WORDS = 100;
export const MAX_TARGET_WORDS = 10000;

export interface SectionTemplate {
  /** Section label template; {topic} is replaced with the user's topic. */
  label: string;
  /** Writing purpose template; {topic} is replaced with the user's topic. */
  purpose: string;
  /** Share of the target word count (weights sum to 100). */
  weight: number;
}

/** 8 default section templates. Weights sum to 100. */
export const SECTION_TEMPLATES: readonly SectionTemplate[] = [
  {
    label: "The Hook",
    purpose: "Open with one surprising line about {topic} that earns the scroll.",
    weight: 8,
  },
  {
    label: "Quick Wins",
    purpose: "2–3 fast, actionable tips on {topic} readers can use today.",
    weight: 12,
  },
  {
    label: "The Deep Dive",
    purpose: "The main feature: one idea about {topic} explored in depth.",
    weight: 34,
  },
  {
    label: "Worth Your Clicks",
    purpose: "3–5 curated links on {topic}, each with a one-line why-it-matters.",
    weight: 14,
  },
  {
    label: "From the Inbox",
    purpose: "Reader replies, poll results, or questions about {topic}.",
    weight: 10,
  },
  {
    label: "Tool of the Week",
    purpose: "One tool for {topic} with an honest one-paragraph verdict.",
    weight: 9,
  },
  {
    label: "Behind the Scenes",
    purpose: "A short personal note connecting you to {topic} this week.",
    weight: 6,
  },
  {
    label: "One Next Step",
    purpose: "A single clear call to action about {topic} to close the issue.",
    weight: 7,
  },
];

/** One voice-guidance line per tone, appended to every section purpose. */
export const TONE_VOICE: Record<Tone, string> = {
  playful: "Keep the voice fun and punchy.",
  professional: "Keep the voice crisp and authoritative.",
  witty: "Keep the voice clever with a dry edge.",
  minimal: "Keep the voice spare and direct.",
  bold: "Keep the voice direct and opinionated.",
};

export interface OutlineSection {
  section: string;
  purpose: string;
  wordBudget: number;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** User-perceived character count (Unicode code points, not UTF-16 units). */
export function codePoints(s: string): number {
  return [...s].length;
}

/** Strip angle brackets so plain-text outputs never carry unescaped HTML. */
export function sanitizePlain(s: string): string {
  return s.replace(/[<>]/g, "");
}

/**
 * Split targetWords into whole-word budgets that sum to exactly targetWords.
 * weights must sum to 100.
 */
export function splitBudgets(
  targetWords: number,
  weights: readonly number[],
): number[] {
  const budgets: number[] = [];
  let assigned = 0;
  for (let i = 0; i < weights.length; i++) {
    if (i === weights.length - 1) {
      budgets.push(targetWords - assigned);
    } else {
      const b = Math.round((targetWords * weights[i]) / 100);
      budgets.push(b);
      assigned += b;
    }
  }
  return budgets;
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please provide your newsletter topic first." };
  }
  const notices: string[] = [];

  // --- topic (required) ---
  const rawTopic = values["topic"];
  if (typeof rawTopic !== "string" || rawTopic.trim().length === 0) {
    return { ok: false, error: "Please enter your newsletter topic." };
  }
  let topic = sanitizePlain(rawTopic.trim());
  const topicCps = [...topic];
  if (topicCps.length > MAX_TOPIC_CHARS) {
    topic = topicCps.slice(0, MAX_TOPIC_CHARS).join("");
    notices.push(
      `Topic was shortened to ${MAX_TOPIC_CHARS} characters; extra text was not used.`,
    );
  }

  // --- tone (required enum) ---
  const rawTone = values["tone"];
  if (typeof rawTone !== "string" || !(TONES as readonly string[]).includes(rawTone)) {
    return { ok: false, error: `Please pick a tone: ${TONES.join(", ")}.` };
  }
  const tone = rawTone as Tone;

  // --- targetWords (required, clamped 100–10000) ---
  const rawTarget = values["targetWords"];
  if (typeof rawTarget !== "number" || !Number.isFinite(rawTarget)) {
    return { ok: false, error: "Target word count must be a number." };
  }
  const targetWords = Math.min(
    MAX_TARGET_WORDS,
    Math.max(MIN_TARGET_WORDS, Math.floor(rawTarget)),
  );

  // --- sections (optional comma-separated custom names) ---
  let labels: string[];
  let weights: number[];
  const rawSections = values["sections"];
  if (
    typeof rawSections === "string" &&
    rawSections.trim().length > 0
  ) {
    const names = rawSections
      .split(",")
      .map((s) => sanitizePlain(s.trim()))
      .filter((s) => s.length > 0);
    if (names.length < 2) {
      return {
        ok: false,
        error:
          "Add at least two section names (comma-separated), or leave the field blank to use the default structure.",
      };
    }
    if (names.length > MAX_CUSTOM_SECTIONS) {
      notices.push(
        `Only the first ${MAX_CUSTOM_SECTIONS} section names were used; the rest were skipped.`,
      );
    }
    labels = names.slice(0, MAX_CUSTOM_SECTIONS);
    weights = labels.map(() => 100 / labels.length);
  } else if (rawSections !== undefined && rawSections !== null && rawSections !== "") {
    return { ok: false, error: "Section names must be text." };
  } else {
    labels = SECTION_TEMPLATES.map((t) =>
      t.label.replaceAll("{topic}", topic),
    );
    weights = SECTION_TEMPLATES.map((t) => t.weight);
  }

  const budgets = splitBudgets(targetWords, weights);
  const voice = TONE_VOICE[tone];

  const outline: OutlineSection[] = labels.map((label, i) => {
    let purpose: string;
    if (weights.length === SECTION_TEMPLATES.length) {
      purpose = SECTION_TEMPLATES[i].purpose.replaceAll("{topic}", topic);
    } else {
      purpose = `A section on "${label}" covering ${topic}. Fill it with your own material.`;
    }
    return {
      section: label,
      purpose: `${purpose} ${voice}`,
      wordBudget: budgets[i],
    };
  });

  const totalWords = budgets.reduce((a, b) => a + b, 0);

  return {
    ok: true,
    values: { outline, totalWords, notices },
  };
}
