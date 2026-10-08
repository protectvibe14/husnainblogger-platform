/**
 * Pinterest Pin Image Idea Generator — pure logic (tool-355), zero imports,
 * zero network, zero DOM, zero randomness.
 *
 * TEXT BRIEFS ONLY, NOT AI AND NOT IMAGE GENERATION: this tool outputs
 * written creative briefs (concept direction for a designer or for you to
 * build in Canva/etc.). It never renders images and makes no
 * image-generation claim.
 *
 * Bank sizes (documented so the UI can state them honestly):
 *   pin titles        — 10 templates
 *   compositions      — 10 templates
 *   text overlays     — 10 templates (each <= 8 words, verified by tests)
 *   color directions  — 8 fixed directions
 *   first-frame notes — 4 (video format only)
 *   TOTAL             — 42 brief components.
 *
 * Placeholders: {topic} = the user's pin topic.
 *
 * Honesty rules enforced here:
 * - Briefs are concept direction only — composition, overlay text, and
 *   color direction as words. No pixels are produced anywhere.
 * - Every brief is tied to a supported ratio: standard -> 2:3,
 *   idea -> 9:16, video -> 9:16. Ratios are fixed per format, never invented
 *   per brief.
 * - Text overlay suggestions are capped at 8 words (short overlays read
 *   better on mobile).
 * - Abstract topics with no visual anchor (e.g. "motivation", "things")
 *   are rejected with guidance to supply a concrete sub-topic — the tool
 *   will not invent a misleading visual for a vague prompt.
 * - Video briefs include first-frame guidance (the hook frame matters most
 *   for video pins); other formats omit it.
 * - Non-Latin topics pass through unchanged.
 *
 * Deterministic: banks are cycled in order. Same inputs -> same briefs.
 */

export type PinFormat = "standard" | "idea" | "video";

/** Valid formats, in canonical order. */
export const PIN_FORMATS: PinFormat[] = ["standard", "idea", "video"];

/** Default format when the caller omits it. */
export const DEFAULT_FORMAT: PinFormat = "standard";

/** Fixed aspect ratio per format. */
export const FORMAT_RATIOS: Record<PinFormat, string> = {
  standard: "2:3",
  idea: "9:16",
  video: "9:16",
};

/** Default and bounds for `count`. */
export const DEFAULT_COUNT = 5;
export const MIN_COUNT = 1;
export const MAX_COUNT = 10;

/** Max topic length (chars) — longer topics make unreadable briefs. */
export const MAX_TOPIC_LENGTH = 120;

/** Max words for a text-overlay suggestion. */
export const MAX_OVERLAY_WORDS = 8;

/**
 * Topics too abstract to brief honestly. Matching (case-insensitive, exact)
 * topics are rejected with guidance to pick a concrete sub-topic.
 */
export const ABSTRACT_TOPICS: string[] = [
  "things",
  "stuff",
  "ideas",
  "inspiration",
  "motivation",
  "life",
  "success",
  "love",
  "happiness",
  "vibes",
  "goals",
  "random",
  "photos",
  "pictures",
];

/** Pin title templates — 10. {topic} = pin topic. */
export const TITLE_BANK: string[] = [
  "{topic}: 7 Ideas Worth Saving",
  "The {topic} Guide for Beginners",
  "{topic} — Before & After",
  "5 {topic} Mistakes to Avoid",
  "Easy {topic} You Can Try Today",
  "{topic} Checklist: Save This Pin",
  "How to Master {topic} Step by Step",
  "The Ultimate {topic} Roundup",
  "{topic} on a Budget",
  "10-Minute {topic} Wins",
];

/** Composition direction templates — 10. */
export const COMPOSITION_BANK: string[] = [
  "Single hero shot of {topic} centered on a clean background, generous negative space at top for the title.",
  "Split layout: {topic} example on the left, short step list on the right, bold divider between.",
  "Top-down flat lay of {topic} essentials arranged in a grid with soft shadows.",
  "Close-up detail of {topic} filling the frame, title band across the upper third.",
  "Collage of 4 {topic} variations in equal quadrants with thin white gutters.",
  "Lifestyle scene showing {topic} in use, warm natural light, title in the lower third.",
  "Before/after split of {topic} with a diagonal divider and short labels on each side.",
  "Minimal {topic} illustration on a solid color block, one accent shape behind the title.",
  "Vertical stack of 3 {topic} photos with numbered badges 1-2-3 down the left edge.",
  "Full-bleed {topic} photo with a soft gradient overlay at top for title legibility.",
];

/** Text-overlay suggestions — 10, each <= 8 words ({topic} counts as one). */
export const TEXT_OVERLAY_BANK: string[] = [
  "{topic} in 3 steps",
  "Save this {topic} guide",
  "5 {topic} mistakes",
  "Easy {topic} ideas",
  "{topic} checklist",
  "Try this {topic} today",
  "The {topic} shortcut",
  "{topic} before & after",
  "Beginner's {topic} guide",
  "{topic} made simple",
];

/** Color direction guidance — 8 fixed directions (design advice, not data). */
export const COLOR_DIRECTION_BANK: string[] = [
  "Warm neutrals with one terracotta accent; soft daylight feel.",
  "High-contrast black and cream with a single bold accent color.",
  "Muted sage and beige palette; calm, airy, minimal shadows.",
  "Bright whites with pops of coral; fresh and energetic.",
  "Deep navy background with gold title text; premium evening mood.",
  "Pastel pink and lavender gradient; soft, friendly, feminine.",
  "Earthy browns and forest green; organic, grounded, natural light.",
  "Monochrome charcoal with one vivid red accent; dramatic and bold.",
];

/** First-frame guidance for video pins — 4. */
export const FIRST_FRAME_BANK: string[] = [
  "First frame: the finished {topic} result, full-screen, so the loop hook lands instantly.",
  "First frame: bold title card reading the overlay text over a blurred {topic} background.",
  "First frame: close-up hands starting the {topic} process — motion in frame one.",
  "First frame: split screen showing the {topic} problem on the left and the result on the right.",
];

/** Bank sizes, exported so the UI can state them honestly. */
export const BANK_SIZES = {
  titles: TITLE_BANK.length,
  compositions: COMPOSITION_BANK.length,
  textOverlays: TEXT_OVERLAY_BANK.length,
  colorDirections: COLOR_DIRECTION_BANK.length,
  firstFrames: FIRST_FRAME_BANK.length,
  total:
    TITLE_BANK.length +
    COMPOSITION_BANK.length +
    TEXT_OVERLAY_BANK.length +
    COLOR_DIRECTION_BANK.length +
    FIRST_FRAME_BANK.length,
};

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isPinFormat(s: string): s is PinFormat {
  return (PIN_FORMATS as string[]).includes(s);
}

/**
 * Parse `count`: missing/blank -> default 5; otherwise must be an integer
 * in [1, 10]. Returns null when invalid.
 */
function parseCount(raw: unknown): number | null {
  if (raw === undefined || raw === null) return DEFAULT_COUNT;
  const n =
    typeof raw === "string" && raw.trim() !== "" ? Number(raw.trim()) : raw;
  if (typeof n !== "number" || !Number.isInteger(n)) return null;
  if (n < MIN_COUNT || n > MAX_COUNT) return null;
  return n;
}

function fill(template: string, topic: string): string {
  return template.replaceAll("{topic}", topic);
}

/**
 * runTool({ pinTopic, pinFormat?, count? }) -> { imageBriefs }.
 *
 * Errors (ok: false) for: missing/blank/non-string pinTopic; abstract
 * topic with no visual anchor; topic over 120 chars; unknown pinFormat;
 * invalid count.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return {
      ok: false,
      error: "Enter your pin topic to generate image briefs (for example: small balcony garden).",
    };
  }

  const rawTopic = values["pinTopic"];
  if (typeof rawTopic !== "string" || rawTopic.trim().length === 0) {
    return {
      ok: false,
      error: "A pin topic is required — tell the tool what the pin is about.",
    };
  }
  const topic = rawTopic.trim();
  if (topic.length > MAX_TOPIC_LENGTH) {
    return {
      ok: false,
      error: `That topic is ${topic.length} characters — keep it under ${MAX_TOPIC_LENGTH} characters so the briefs stay readable.`,
    };
  }
  if (
    topic.length <= 2 ||
    ABSTRACT_TOPICS.includes(topic.toLowerCase())
  ) {
    return {
      ok: false,
      error:
        "That topic is too abstract to brief honestly — pick a concrete sub-topic instead (for example: \"small balcony garden\" rather than \"gardening\", or \"5-minute pasta\" rather than \"food\").",
    };
  }

  const rawFormat = values["pinFormat"];
  let pinFormat: PinFormat = DEFAULT_FORMAT;
  if (rawFormat !== undefined && rawFormat !== null && String(rawFormat).trim() !== "") {
    if (typeof rawFormat !== "string" || !isPinFormat(rawFormat.trim())) {
      return {
        ok: false,
        error: `Unknown pin format. Choose one of: ${PIN_FORMATS.join(", ")}.`,
      };
    }
    pinFormat = rawFormat.trim() as PinFormat;
  }

  const count = parseCount(values["count"]);
  if (count === null) {
    return {
      ok: false,
      error: `Count must be a whole number between ${MIN_COUNT} and ${MAX_COUNT}.`,
    };
  }

  const ratio = FORMAT_RATIOS[pinFormat];
  const imageBriefs: string[] = [];
  for (let i = 0; i < count; i++) {
    const title = fill(TITLE_BANK[i % TITLE_BANK.length], topic);
    const composition = fill(COMPOSITION_BANK[i % COMPOSITION_BANK.length], topic);
    const overlay = fill(TEXT_OVERLAY_BANK[i % TEXT_OVERLAY_BANK.length], topic);
    const color = COLOR_DIRECTION_BANK[i % COLOR_DIRECTION_BANK.length];
    const lines = [
      `${i + 1}. ${title}`,
      `   Composition: ${composition}`,
      `   Text overlay: "${overlay}"`,
      `   Color direction: ${color}`,
      `   Format ratio: ${ratio}`,
    ];
    if (pinFormat === "video") {
      lines.push(
        `   ${fill(FIRST_FRAME_BANK[i % FIRST_FRAME_BANK.length], topic)}`
      );
    }
    imageBriefs.push(lines.join("\n"));
  }

  return { ok: true, values: { imageBriefs } };
}
