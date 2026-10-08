/**
 * Webinar Topic Generator (tool-308) — pure logic.
 *
 * Honesty: this is a WORD-BANK combiner, not AI ideation. The user's niche and
 * audience pain point are inserted into fixed title formulas; nothing is
 * invented beyond the combination.
 *
 * Word banks (documented):
 * - TITLE_FORMULAS: 8 fixed title patterns with {niche} and {pain} slots.
 * - ANGLE_TWISTS: 8 fixed angle suffixes, one paired with each formula by index.
 * - GENERIC_NICHE: fallback label used when no niche is given ("your industry");
 *   output is explicitly labeled as the generic bank in that case.
 *
 * Deterministic: same inputs -> same topics, always. Zero imports.
 */

/** 8 fixed title formulas. */
export const TITLE_FORMULAS: string[] = [
  "How to Fix {pain} in 90 Days (The {niche} Playbook)",
  "{pain}: A Live {niche} Workshop for Beginners",
  "The 5-Step {niche} System to Eliminate {pain}",
  "From {pain} to Results: A {niche} Masterclass",
  "Live Q&A: Solving {pain} for {niche} Professionals",
  "The {niche} Shortcut: End {pain} Without the Overwhelm",
  "{niche} Deep Dive: What Actually Works Against {pain}",
  "Case Study Session: How We Solved {pain} in {niche}",
];

/** 8 angle variants, paired with TITLE_FORMULAS by index. */
export const ANGLE_TWISTS: string[] = [
  "Live Demo Edition",
  "Q&A Edition",
  "Case-Study Edition",
  "Workshop Edition",
  "Panel Edition",
  "Beginner Track",
  "Advanced Track",
  "Replay + Templates Edition",
];

/** Fallback niche label when the user provides none. */
export const GENERIC_NICHE = "your industry";

export const TOPIC_COUNT = 8;

export interface WebinarTopicsResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Capitalize the first letter; leave the rest of the user's wording untouched. */
function capFirst(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

function fill(template: string, niche: string, pain: string): string {
  return template.split("{niche}").join(niche).split("{pain}").join(pain);
}

/**
 * runTool({ niche?, audiencePain })
 * -> { ok: true, values: { topics: string[], note: string } }
 * -> { ok: false, error: '...' } on missing audiencePain.
 */
export function runTool(values: Record<string, unknown>): WebinarTopicsResult {
  if (!isRecord(values)) {
    return { ok: false, error: "Provide your inputs as an object." };
  }

  const audiencePain = readString(values.audiencePain);
  if (audiencePain.length === 0) {
    return { ok: false, error: "Describe your audience's pain point." };
  }

  const rawNiche = readString(values.niche);
  const generic = rawNiche.length === 0;
  const niche = generic ? GENERIC_NICHE : capFirst(rawNiche);
  const pain = capFirst(audiencePain);

  const topics: string[] = TITLE_FORMULAS.map((formula, i) => {
    const title = fill(formula, niche, pain);
    const variant = `${title} — ${ANGLE_TWISTS[i]}`;
    return `${i + 1}. ${title}\n   Angle variant: ${variant}`;
  });

  const note = generic
    ? "Used the generic word bank (no niche given), so titles say “your industry”. Enter a niche for sharper, niche-specific titles."
    : "Niche-specific titles from 8 fixed title formulas + 8 angle variants. Not AI ideation — refine the wording yourself before promoting.";

  return { ok: true, values: { topics, note } };
}
