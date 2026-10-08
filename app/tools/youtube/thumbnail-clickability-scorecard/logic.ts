/**
 * Thumbnail Clickability Scorecard — pure logic (tool-107).
 *
 * SCORER tool: runTool(values) with self-assessed checklist answers.
 * Pure TypeScript, zero imports, zero network, zero DOM, zero Date.now().
 * Deterministic: same answers -> same score.
 *
 * ## What this does (and does NOT do)
 * A fixed 8-item heuristic rubric (weights sum to 100) scored from the
 * creator's OWN answers (yes / partially / no). It produces a 0–100 score,
 * per-item pass/partial/fail lines, and one improvement tip per non-passing
 * item. It is a SELF-ASSESSED heuristic checklist — it CANNOT predict actual
 * click-through rate, and every surfaced result says so. Missing or blank
 * answers default to neutral ("partially", half credit) per the spec.
 *
 * ## Rubric (8 items, weights sum to 100)
 *   text-readable      15 — thumbnail text is short (≤4 words) and readable
 *   high-contrast      15 — subject pops against the background
 *   face-or-emotion    15 — face with a clear emotion (or strong focal subject)
 *   curiosity-gap      10 — raises a question the video answers
 *   no-clutter        10 — one idea, no competing elements
 *   matches-title      15 — thumbnail and title promise the same thing
 *   mobile-legible     10 — readable at small phone size
 *   brand-consistent   10 — consistent style/colors/fonts across uploads
 *
 * ## Scoring
 *   yes -> full weight; partially -> half weight; no -> 0.
 *   Final score = rounded sum (0–100). Bands: 80+ Strong, 60–79 Good,
 *   40–59 Needs work, 0–39 Weak. Bands always carry the "(self-assessed)" label.
 *
 * @module thumbnail-clickability-scorecard/logic
 */

/** One rubric criterion. */
export interface RubricItem {
  id: string;
  label: string;
  weight: number;
  /** One-line improvement tip shown when the item does not fully pass. */
  failTip: string;
}

/** Fixed 8-item rubric. Weights sum to exactly 100. */
export const RUBRIC: RubricItem[] = [
  {
    id: "text-readable",
    label: "Text is short and readable",
    weight: 15,
    failTip: "Cut thumbnail text to 4 words or fewer in a large, bold font.",
  },
  {
    id: "high-contrast",
    label: "High contrast colors",
    weight: 15,
    failTip: "Push the subject away from the background with brighter, higher-contrast colors.",
  },
  {
    id: "face-or-emotion",
    label: "Face or strong focal subject",
    weight: 15,
    failTip: "Add a close-up face showing a clear emotion — or one unmistakable focal subject.",
  },
  {
    id: "curiosity-gap",
    label: "Curiosity gap",
    weight: 10,
    failTip: "Tease an unanswered question the video actually answers — no clickbait the video can't pay off.",
  },
  {
    id: "no-clutter",
    label: "No clutter, one idea",
    weight: 10,
    failTip: "Remove competing elements until one idea remains; give the subject breathing room.",
  },
  {
    id: "matches-title",
    label: "Matches the video title",
    weight: 15,
    failTip: "Align the thumbnail's promise with the title — mismatches earn clicks that bounce.",
  },
  {
    id: "mobile-legible",
    label: "Legible on a phone",
    weight: 10,
    failTip: "Zoom the thumbnail down to phone size; if you can't read it in one second, simplify.",
  },
  {
    id: "brand-consistent",
    label: "Consistent branding",
    weight: 10,
    failTip: "Reuse your palette, fonts, and layout so subscribers recognize your videos instantly.",
  },
];

export type Answer = "yes" | "partially" | "no";

/** Answers this tool accepts (case-insensitive, trimmed). */
const ANSWER_ALIASES: Record<string, Answer> = {
  yes: "yes",
  y: "yes",
  partially: "partially",
  partial: "partially",
  somewhat: "partially",
  no: "no",
  n: "no",
};

/**
 * Parse one answer. Missing/blank -> "partially" (neutral default per spec).
 * Unknown non-blank values -> null (caller reports a validation error).
 */
export function parseAnswer(value: unknown): Answer | null {
  if (value === undefined || value === null) return "partially";
  const s = String(value).trim().toLowerCase();
  if (s === "") return "partially";
  return ANSWER_ALIASES[s] ?? null;
}

/** Weight credit multiplier per answer. */
function credit(a: Answer): number {
  return a === "yes" ? 1 : a === "partially" ? 0.5 : 0;
}

export interface ItemScore {
  id: string;
  label: string;
  answer: Answer;
  earned: number;
  weight: number;
  status: "pass" | "partial" | "fail";
}

export interface ScorecardResult {
  score: number;
  band: string;
  items: ItemScore[];
  suggestions: string[];
}

/** Fixed honesty label attached to every result (never a CTR prediction). */
export const HONESTY_NOTE =
  "SELF-ASSESSED SCORECARD — this 0–100 score reflects your own answers against a fixed 8-item rubric. " +
  "It is a heuristic self-check, not a CTR prediction: it cannot predict how YouTube viewers will respond.";

/** Score a full answer set. Throws on an invalid (non-blank, unrecognized) answer. */
export function scoreAnswers(answers: Record<string, unknown>): ScorecardResult {
  const items: ItemScore[] = RUBRIC.map((r) => {
    const a = parseAnswer(answers[r.id]);
    if (a === null) {
      throw new Error(
        `Invalid answer for "${r.label}": use "yes", "partially", or "no".`,
      );
    }
    const earned = Math.round(r.weight * credit(a) * 100) / 100;
    return {
      id: r.id,
      label: r.label,
      answer: a,
      earned,
      weight: r.weight,
      status: a === "yes" ? "pass" : a === "partially" ? "partial" : "fail",
    };
  });
  const raw = items.reduce((sum, i) => sum + i.earned, 0);
  const score = Math.round(raw);
  const band =
    score >= 80
      ? "Strong (self-assessed)"
      : score >= 60
        ? "Good (self-assessed)"
        : score >= 40
          ? "Needs work (self-assessed)"
          : "Weak (self-assessed)";
  const suggestions = RUBRIC.filter((r) => {
    const it = items.find((i) => i.id === r.id);
    return it !== undefined && it.status !== "pass";
  }).map((r) => `${r.label}: ${r.failTip}`);
  return { score, band, items, suggestions };
}

/** One-line, UI-ready per-item result. */
export function formatItemResult(item: ItemScore): string {
  const mark = item.status === "pass" ? "PASS" : item.status === "partial" ? "PARTIAL" : "FAIL";
  return `${mark} — ${item.label} (${trimNum(item.earned)}/${item.weight})`;
}

function trimNum(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n);
}

/**
 * Template entry point (scorer dispatch).
 * values: { [rubricItemId]: "yes" | "partially" | "no" }.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No answers provided." };
  }
  let result: ScorecardResult;
  try {
    result = scoreAnswers(values);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid answers." };
  }
  return {
    ok: true,
    values: {
      score: result.score,
      band: result.band,
      itemResults: result.items.map(formatItemResult),
      suggestions: result.suggestions,
      honestyNote: HONESTY_NOTE,
    },
  };
}
