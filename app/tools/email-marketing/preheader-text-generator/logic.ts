/**
 * Preheader Text Generator — pure logic (tool-404).
 *
 * Deterministic template library — NOT AI. Assembles preheader (preview
 * text) variants client-side from bundled templates plus tone extenders.
 *
 * BANK SIZES (documented for honesty):
 * - 18 base templates with a {s} (summary) slot.
 * - 5 tones x 1 extender each = 5 deterministic tone extenders.
 * - 6 variants served per run in fixed order (templates picked round-robin).
 *
 * RULES (from spec):
 * - Every variant is 40-100 user-perceived characters ([...s].length).
 * - A variant never repeats the subject: significant subject words
 *   overlapping a variant above 50% causes the variant to be skipped.
 * - Apple Mail on iOS 18.2+ may show AI-generated summaries instead of the
 *   preheader — surfaced in the returned notice and in meta.ts assumptions.
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM, zero randomness. Deterministic:
 *   same inputs -> same variants.
 * - Overlong summary input is trimmed at a word boundary with a visible
 *   notice in `notice` — never silently dropped.
 */

export const TONES = [
  "friendly",
  "urgent",
  "professional",
  "curious",
  "playful",
] as const;
export type PreheaderTone = (typeof TONES)[number];

export const VARIANT_COUNT = 6;
export const MIN_PREHEADER_CHARS = 40;
export const MAX_PREHEADER_CHARS = 100;
export const MIN_SUMMARY_CHARS = 10;
export const MAX_SUMMARY_CHARS = 300;

const APPLE_MAIL_NOTE =
  "Note: Apple Mail on iOS 18.2+ may show an AI-generated summary instead of your preheader.";

/** 18 base templates; {s} = trimmed summary core. */
const TEMPLATES: readonly string[] = [
  "{s} - here's what you need to know",
  "Inside: {s}",
  "{s}. Open to read more",
  "Your update on {s}",
  "{s} - don't miss the details",
  "New: {s}",
  "{s}. Plus what's next",
  "Quick look: {s}",
  "{s} - the short version",
  "Today: {s}",
  "{s}. Here's the full story",
  "Just in: {s}",
  "{s} - worth 2 minutes",
  "The latest on {s}",
  "{s}. See inside",
  "Fresh update: {s}",
  "{s} - all the highlights",
  "What changed: {s}",
];

/** One deterministic extender per tone; guarantees the 40-char minimum. */
const TONE_EXTENDERS: Record<PreheaderTone, string> = {
  friendly: " - open to read the full story",
  urgent: " - open now before it's gone",
  professional: " - full details in this email",
  curious: " - you won't want to miss this",
  playful: " - come take a peek inside \u{1F440}",
};

export interface PreheaderOption {
  text: string;
  charCount: number;
}

function sanitize(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .replace(/\b(\w+)( \1\b)+/gi, "$1")
    .trim();
}

function significantWords(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9']+/)
    .filter((w) => w.length > 3);
}

/** Trim to maxChars at a word boundary (no mid-word cuts). */
function trimToFit(s: string, maxChars: number): string {
  const chars = [...s];
  if (chars.length <= maxChars) return s;
  const cut = chars.slice(0, maxChars).join("");
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > maxChars / 2 ? cut.slice(0, lastSpace) : cut).trim();
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const summaryRaw = values["emailSummary"];
  if (typeof summaryRaw !== "string" || summaryRaw.trim().length === 0) {
    return { ok: false, error: "Describe what your email is about." };
  }
  let summary = sanitize(summaryRaw);
  if ([...summary].length < MIN_SUMMARY_CHARS) {
    return {
      ok: false,
      error: `Email summary must be at least ${MIN_SUMMARY_CHARS} characters.`,
    };
  }

  const subjectRaw = values["subjectLine"];
  let subject = "";
  if (subjectRaw !== undefined && subjectRaw !== null && subjectRaw !== "") {
    if (typeof subjectRaw !== "string") {
      return { ok: false, error: "Subject line must be text." };
    }
    subject = sanitize(subjectRaw);
  }

  const toneRaw = values["tone"];
  let tone: PreheaderTone = "friendly";
  if (toneRaw !== undefined && toneRaw !== null && toneRaw !== "") {
    if (typeof toneRaw !== "string" || !(TONES as readonly string[]).includes(toneRaw)) {
      return {
        ok: false,
        error: "Tone must be one of: friendly, urgent, professional, curious, playful.",
      };
    }
    tone = toneRaw as PreheaderTone;
  }

  let notice = APPLE_MAIL_NOTE;
  if ([...summary].length > MAX_SUMMARY_CHARS) {
    summary = trimToFit(summary, MAX_SUMMARY_CHARS);
    notice = `Summary was shortened to ${MAX_SUMMARY_CHARS} characters. ${APPLE_MAIL_NOTE}`;
  }

  const subjectWords = significantWords(subject);
  const extender = TONE_EXTENDERS[tone];
  const options: PreheaderOption[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < TEMPLATES.length && options.length < VARIANT_COUNT; i++) {
    let text = TEMPLATES[i].split("{s}").join(summary);
    text = text.replace(/\s+/g, " ").trim();

    // Never repeat the subject: skip variants that mostly restate it.
    if (subjectWords.length > 0) {
      const variantWords = new Set(significantWords(text));
      const overlap = subjectWords.filter((w) => variantWords.has(w)).length;
      if (overlap / subjectWords.length > 0.5) continue;
    }
    if (subject.length > 0 && text.toLowerCase() === subject.toLowerCase()) continue;

    if ([...text].length < MIN_PREHEADER_CHARS) {
      text = `${text}${extender}`;
    }
    if ([...text].length > MAX_PREHEADER_CHARS) {
      text = trimToFit(text, MAX_PREHEADER_CHARS);
    }
    if (seen.has(text)) continue;
    seen.add(text);
    options.push({ text, charCount: [...text].length });
  }

  const preheaderOptions = {
    columns: ["Preheader", "Characters"],
    rows: options.map((o) => [o.text, String(o.charCount)]),
  };

  return { ok: true, values: { preheaderOptions, notice } };
}
