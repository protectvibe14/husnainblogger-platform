/**
 * Packaging Combo Preview — pure logic (tool-138).
 *
 * COMBINATORIAL TEXT ASSEMBLY, NOT IMAGE GENERATION: this module pairs
 * title templates with thumbnail-text templates to preview YouTube
 * "packaging" (title + thumbnail text) as TEXT-ONLY mockups. It never
 * generates, renders, or downloads images. Each combo is shown inside an
 * ASCII layout mock labeled as a text preview.
 *
 * Static bank sizes (documented, fixed):
 *   - TITLE_STYLES: 6 title styles. Each has 3 title templates
 *     (18 title templates total) using a {topic} placeholder.
 *   - THUMB_STYLES: 5 thumbnail-text styles. Each has 4 thumbnail text
 *     templates (20 thumbnail templates total), each ≤5 words by
 *     construction (validation guidance honored in the bank, and the
 *     test suite enforces the ≤5-word rule on every template).
 *   - Combos are served deterministically in bank order: title template i
 *     pairs with thumbnail template (i mod 4) of the chosen style, cycling.
 *
 * Inputs: topic (text, required, ≤200 chars), titleStyle, thumbStyle
 * (selects), count (integer 1–6). Titles assembled are capped at 100 chars
 * (templates are short by design; runTool trims to 100 and flags it).
 *
 * Deterministic: same inputs always produce the same combos.
 * Zero imports, zero DOM, zero network.
 */

export interface TitleStyle {
  id: string;
  label: string;
  templates: string[];
}

export interface ThumbStyle {
  id: string;
  label: string;
  templates: string[];
}

/** Six title styles × 3 templates = 18 title templates. {topic} = video topic. */
export const TITLE_STYLES: TitleStyle[] = [
  {
    id: "how-to",
    label: "How-to / tutorial",
    templates: [
      "How to {topic} (Step by Step)",
      "{topic}: The Complete Beginner Guide",
      "How I {topic} — Full Tutorial",
    ],
  },
  {
    id: "listicle",
    label: "Listicle",
    templates: [
      "7 {topic} Mistakes You're Probably Making",
      "5 {topic} Tips That Actually Work",
      "10 {topic} Ideas You Need to Try",
    ],
  },
  {
    id: "question",
    label: "Question hook",
    templates: [
      "Is {topic} Actually Worth It?",
      "Why Does Nobody Talk About {topic}?",
      "What If You Tried {topic} for 30 Days?",
    ],
  },
  {
    id: "curiosity-gap",
    label: "Curiosity gap",
    templates: [
      "The {topic} Secret Nobody Tells You",
      "I Tried {topic} So You Don't Have To",
      "What They Don't Tell You About {topic}",
    ],
  },
  {
    id: "bold-claim",
    label: "Bold claim",
    templates: [
      "{topic} Changed Everything for Me",
      "Stop Doing {topic} Wrong",
      "The Only {topic} Guide You'll Ever Need",
    ],
  },
  {
    id: "comparison",
    label: "Comparison / vs",
    templates: [
      "{topic} vs The Alternatives: Honest Review",
      "Beginner vs Pro at {topic}",
      "{topic}: What $0 vs $100 Gets You",
    ],
  },
];

/** Five thumbnail-text styles × 4 templates = 20 thumbnail templates (all ≤5 words). */
export const THUMB_STYLES: ThumbStyle[] = [
  {
    id: "big-number",
    label: "Big number",
    templates: ["7 MISTAKES", "TOP 5 TIPS", "10 IDEAS", "3 SECRETS"],
  },
  {
    id: "short-promise",
    label: "Short promise",
    templates: ["WORKS EVERY TIME", "DO THIS", "GAME CHANGER", "EASY WIN"],
  },
  {
    id: "contrast-pair",
    label: "Contrast pair",
    templates: ["BEFORE → AFTER", "WRONG vs RIGHT", "FAIL → WIN", "OLD vs NEW"],
  },
  {
    id: "reaction",
    label: "Reaction word",
    templates: ["INSANE", "WAIT WHAT?!", "MIND = BLOWN", "UNBELIEVABLE"],
  },
  {
    id: "question-tease",
    label: "Question tease",
    templates: ["REALLY?!", "WHY NOT?", "TOO EASY?", "WHAT IF..."],
  },
];

/** Max combos per call. */
export const MAX_COMBOS = 6;
/** Min combos per call. */
export const MIN_COMBOS = 1;
/** YouTube title display limit guidance (spec validation: title <=100 chars). */
export const TITLE_MAX_CHARS = 100;
/** Thumbnail text guidance (spec validation): <=5 words. Enforced on every template. */
export const THUMB_MAX_WORDS = 5;
/** Topic length cap to keep assembly sane. */
export const TOPIC_MAX_CHARS = 200;

export interface PackagingCombo {
  comboNumber: number;
  title: string;
  titleChars: number;
  titleTrimmed: boolean;
  thumbnailText: string;
  thumbnailWords: number;
  textMock: string;
}

/**
 * Build the ASCII text mockup for one combo. Labeled as a text preview —
 * never presented as a rendered image.
 */
export function buildTextMock(title: string, thumbnailText: string): string {
  const bar = "┌" + "─".repeat(44) + "┐";
  const mid = "├" + "─".repeat(44) + "┤";
  const bottom = "└" + "─".repeat(44) + "┘";
  const pad = (s: string): string => {
    const t = s.length > 42 ? s.slice(0, 39) + "..." : s;
    return "│ " + t + " ".repeat(42 - t.length) + "│";
  };
  return [
    "[ TEXT-ONLY PREVIEW — not a rendered thumbnail ]",
    bar,
    pad("THUMBNAIL TEXT: " + thumbnailText),
    pad("(your video still would go here)"),
    mid,
    pad("TITLE: " + title),
    bottom,
  ].join("\n");
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function parseCount(raw: unknown): number | null {
  const n =
    typeof raw === "string" && raw.trim() !== "" ? Number(raw.trim()) : raw;
  if (typeof n !== "number" || !Number.isInteger(n)) return null;
  if (n < MIN_COMBOS || n > MAX_COMBOS) return null;
  return n;
}

/**
 * runTool adapter (mountToolUI generator template).
 * Validates { topic, titleStyle, thumbStyle, count } and returns
 * { combos, mockPreview, honestyNote }. Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Enter your video topic and pick a title style and thumbnail text style." };
  }
  const topicRaw = values["topic"];
  const titleStyleRaw = values["titleStyle"];
  const thumbStyleRaw = values["thumbStyle"];
  const count = parseCount(values["count"]);

  if (typeof topicRaw !== "string" || topicRaw.trim().length === 0) {
    return { ok: false, error: "Topic is required — what is your video about?" };
  }
  const topic = topicRaw.trim();
  if (topic.length > TOPIC_MAX_CHARS) {
    return { ok: false, error: `Topic is too long — keep it under ${TOPIC_MAX_CHARS} characters.` };
  }
  const titleStyle = TITLE_STYLES.find((s) => s.id === titleStyleRaw);
  if (typeof titleStyleRaw !== "string" || !titleStyle) {
    return {
      ok: false,
      error: `Title style is required. Choose one of: ${TITLE_STYLES.map((s) => s.id).join(", ")}.`,
    };
  }
  const thumbStyle = THUMB_STYLES.find((s) => s.id === thumbStyleRaw);
  if (typeof thumbStyleRaw !== "string" || !thumbStyle) {
    return {
      ok: false,
      error: `Thumbnail text style is required. Choose one of: ${THUMB_STYLES.map((s) => s.id).join(", ")}.`,
    };
  }
  if (count === null) {
    return {
      ok: false,
      error: `Count must be a whole number between ${MIN_COMBOS} and ${MAX_COMBOS}.`,
    };
  }

  const combos: PackagingCombo[] = [];
  const mockLines: string[] = [];
  for (let i = 0; i < count; i++) {
    const titleTemplate = titleStyle.templates[i % titleStyle.templates.length];
    const thumbTemplate = thumbStyle.templates[i % thumbStyle.templates.length];
    let title = titleTemplate.replaceAll("{topic}", topic);
    let trimmed = false;
    if (title.length > TITLE_MAX_CHARS) {
      title = title.slice(0, TITLE_MAX_CHARS - 3).trimEnd() + "...";
      trimmed = true;
    }
    const textMock = buildTextMock(title, thumbTemplate);
    combos.push({
      comboNumber: i + 1,
      title,
      titleChars: title.length,
      titleTrimmed: trimmed,
      thumbnailText: thumbTemplate,
      thumbnailWords: thumbTemplate.trim().split(/\s+/).length,
      textMock,
    });
    mockLines.push(`COMBO ${i + 1}\n${textMock}`);
  }

  const listItems = combos.map(
    (c) => `#${c.comboNumber}  Title: "${c.title}"  •  Thumbnail text: "${c.thumbnailText}"`,
  );

  return {
    ok: true,
    values: {
      combos: listItems,
      mockPreview: mockLines.join("\n\n"),
      honestyNote:
        "Text-only preview: these are title + thumbnail-text pairings assembled from fixed templates, " +
        "shown as layout mockups. No images are generated here — design your real thumbnail in your editor " +
        "and test packaging variants with YouTube's Test & Compare feature.",
    },
  };
}
