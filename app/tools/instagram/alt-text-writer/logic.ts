/**
 * tool-217 — Alt Text Writer (generator).
 *
 * HONESTY: This tool CANNOT see or analyze images. The user describes the
 * photo in words (imageDescription, optional subject); the engine assembles
 * WCAG-style alt-text options from FIXED transparent templates and FIXED
 * word banks. No AI, no image processing, no network.
 *
 * Word banks (documented sizes):
 *   TEMPLATES — 8 fixed sentence formulas
 *   MOODS     — 14 fixed descriptive words
 *
 * Every option is capped at the recommended 125 characters (truncated at a
 * word boundary when longer, with a note in accessibilityTips).
 *
 * Pure TypeScript: zero imports, no DOM, no network, no Math.random.
 * Deterministic: same inputs -> same outputs, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_ALT_CHARS = 125;

const TEMPLATES: ReadonlyArray<(subject: string, desc: string, mood: string) => string> = [
  (s, d, m) => `Photo of ${s} ${d}, ${m}.`,
  (s, d, m) => `Close-up photo of ${s} ${d}.`,
  (s, d, m) => `Wide shot of ${s} ${d}, in a ${m} setting.`,
  (s, d, m) => `A ${m} photograph showing ${s} ${d}.`,
  (s, d, m) => `${capitalize(s)} ${d}, captured in ${m} light.`,
  (s, d, m) => `Overhead view of ${s} ${d}.`,
  (s, d, m) => `Candid shot of ${s} ${d}, ${m} atmosphere.`,
  (s, d, m) => `Detailed view of ${s} ${d} with ${m} tones.`,
];

const MOODS: ReadonlyArray<string> = [
  "warm",
  "bright",
  "soft",
  "dramatic",
  "calm",
  "vibrant",
  "cozy",
  "moody",
  "fresh",
  "golden",
  "serene",
  "lively",
  "minimal",
  "rich",
];

const ACCESSIBILITY_TIPS: ReadonlyArray<string> = [
  "Put the most important detail first — many screen readers cut off long text.",
  "Describe what is actually visible; skip opinions and extra adjectives.",
  "Keep it under 125 characters where possible.",
  "Don't repeat the caption word-for-word in the alt text.",
  "Skip emojis — screen readers read every emoji aloud.",
  "Name people, objects, and the setting so the photo makes sense without seeing it.",
];

function capitalize(word: string): string {
  return word.length === 0 ? word : word[0].toUpperCase() + word.slice(1);
}

function normalizeDesc(raw: string): string {
  const collapsed = raw.replace(/\s+/g, " ").trim().replace(/[.]+$/, "").trim();
  if (collapsed.length === 0) return collapsed;
  return collapsed[0].toLowerCase() + collapsed.slice(1);
}

/** Truncate at a word boundary; returns the text and whether it was cut. */
function capLength(text: string): { text: string; truncated: boolean } {
  if (text.length <= MAX_ALT_CHARS) return { text, truncated: false };
  const cut = text.slice(0, MAX_ALT_CHARS - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 20 ? cut.slice(0, lastSpace) : cut;
  return { text: base + "…", truncated: true };
}

function parseCount(value: unknown): number | null {
  if (value === undefined || value === null || String(value).trim() === "") return 3;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isInteger(n) || n < 1 || n > 5) return null;
  return n;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const description = String(values.imageDescription ?? "").trim();
  if (description === "") {
    return {
      ok: false,
      error:
        "Describe the photo to generate alt text (what's in it, where it was taken). Note: this tool cannot see or analyze images — it writes from your description.",
    };
  }

  const count = parseCount(values.count);
  if (count === null) {
    return { ok: false, error: "Choose between 1 and 5 alt-text options." };
  }

  const desc = normalizeDesc(description);
  const subject = String(values.subject ?? "").trim() || "a scene";

  const seed = desc.length + subject.length;
  const altTexts: string[] = [];
  let anyTruncated = false;
  for (let i = 0; i < count; i++) {
    const template = TEMPLATES[(seed + i * 3) % TEMPLATES.length];
    const mood = MOODS[(seed + i * 5) % MOODS.length];
    const capped = capLength(template(subject, desc, mood));
    if (capped.truncated) anyTruncated = true;
    altTexts.push(capped.text);
  }

  const accessibilityTips: string[] = anyTruncated
    ? ["Some options were trimmed to the recommended 125-character limit.", ...ACCESSIBILITY_TIPS]
    : [...ACCESSIBILITY_TIPS];

  return { ok: true, values: { altTexts, accessibilityTips } };
}
