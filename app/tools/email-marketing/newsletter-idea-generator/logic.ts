/**
 * Newsletter Idea Generator (tool-416) — pure logic, zero imports.
 *
 * FIXED PATTERN LIBRARY, NOT AI: every idea is assembled from fixed pattern
 * banks documented below. Selection is deterministic: the same inputs always
 * produce the same idea list (a char-code hash of the inputs picks the
 * starting offset, then patterns rotate so ideas never repeat within one
 * run). The UI must never claim AI generation — copy must say "patterns".
 *
 * Word banks (sizes documented for honest UI copy):
 *   TITLES: 24 fixed newsletter-issue title patterns ({niche} slot)
 *   ANGLES: 12 fixed content-angle patterns
 *   WHYS: 12 fixed "why it works" explanations
 *   FREQUENCIES: 3 fixed cadences (weekly, biweekly, monthly)
 *
 * Because the title bank holds 24 patterns and the maximum count is 20,
 * titles are unique within any single run by construction.
 *
 * Input rules:
 *   - niche, audience: required, non-empty after trim; max 100 Unicode code
 *     points ([...s].length, so emoji count as one); overlong input is
 *     truncated with a visible notice, never silently dropped.
 *   - frequency: one of weekly, biweekly, monthly (default weekly). It is
 *     recorded for planning context; idea patterns are cadence-agnostic and
 *     this is stated honestly in the output notice.
 *   - count: finite number, clamped to 1–20 (default 10). NaN/Infinity are
 *     rejected; out-of-range values are clamped with a notice.
 *
 * Output sanitization: user text interpolated into patterns is HTML-escaped.
 */

export const FREQUENCIES: readonly string[] = ["weekly", "biweekly", "monthly"];
export const DEFAULT_FREQUENCY = "weekly";
export const DEFAULT_COUNT = 10;
export const MIN_COUNT = 1;
export const MAX_COUNT = 20;
export const MAX_INPUT_CHARS = 100;

/** 24 fixed title patterns. Slot: {niche}. */
export const TITLES: readonly string[] = [
  "The {niche} playbook: 5 tactics that actually work",
  "{niche} myths, busted",
  "What I learned about {niche} this week",
  "The beginner's guide to {niche} (part 1)",
  "{niche} case study: from zero to results",
  "7 {niche} mistakes to avoid",
  "The {niche} toolkit I recommend",
  "{niche} trends worth watching",
  "Reader questions: {niche} edition",
  "A simple {niche} checklist",
  "Behind the scenes: my {niche} process",
  "{niche} on a budget",
  "The one {niche} habit that changed everything",
  "Two {niche} approaches, compared honestly",
  "Quick {niche} wins for busy people",
  "The {niche} glossary: terms you should know",
  "What experts get wrong about {niche}",
  "Your {niche} questions, answered",
  "A {niche} experiment and its results",
  "The future of {niche}: my take",
  "{niche} resources worth bookmarking",
  "How to start {niche} with zero experience",
  "The {niche} decision framework I use",
  "One year of {niche}: lessons learned",
];

/** 12 fixed content-angle patterns. */
export const ANGLES: readonly string[] = [
  "Curated list — gather the best resources so readers don't have to search.",
  "Myth-busting — challenge a popular belief with clear reasoning.",
  "Personal story — share what happened and what you learned.",
  "How-to tutorial — step-by-step instructions readers can follow today.",
  "Case study — walk through one real example from start to finish.",
  "Opinion piece — take a clear stance on a debated topic.",
  "Q&A roundup — answer the most common reader questions.",
  "Checklist — a scannable list readers can act on immediately.",
  "Trend analysis — explain what a trend means for the reader.",
  "Comparison — weigh two options side by side, honestly.",
  "Behind the scenes — show your process, tools, and numbers.",
  "Resource roundup — link the week's most useful finds.",
];

/** 12 fixed "why it works" explanations (general engagement reasoning, no invented stats). */
export const WHYS: readonly string[] = [
  "Listicles promise quick, specific payoffs — each item is a reason to keep reading.",
  "Challenging assumptions sparks replies and forwards — natural engagement fuel.",
  "Personal stories build trust; readers remember stories longer than tips.",
  "Tutorials get saved and shared because they solve an immediate problem.",
  "Concrete examples make abstract advice believable and actionable.",
  "A clear stance polarizes in a good way: loyal readers love strong opinions.",
  "Answering real questions proves you listen — and each answer stays evergreen.",
  "Checklists are scannable on mobile and easy to forward to a friend.",
  "Timely angles ride existing attention instead of fighting for it.",
  "Comparisons help undecided readers choose — strong reply potential.",
  "Transparency builds loyalty; process posts humanize your brand.",
  "Curated links position you as a filter, saving readers time.",
];

// ---------------------------------------------------------------------------
// Helpers (pure, no imports)
// ---------------------------------------------------------------------------

function codePoints(s: string): number {
  return [...s].length;
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(bank: readonly T[], seed: number): T {
  return bank[((seed % bank.length) + bank.length) % bank.length];
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function requiredText(values: Record<string, unknown>, id: string, label: string): string {
  const raw = values[id];
  if (typeof raw !== "string" || raw.trim() === "") {
    throw new Error(`Please enter ${label}.`);
  }
  return raw.trim();
}

function truncateWithNotice(s: string, id: string, notices: string[]): string {
  if (codePoints(s) > MAX_INPUT_CHARS) {
    notices.push(
      `Note: ${id} was over ${MAX_INPUT_CHARS} characters, so it was shortened. The full text was not silently dropped — edit it down to what matters most.`,
    );
    return [...s].slice(0, MAX_INPUT_CHARS).join("");
  }
  return s;
}

function validatedFrequency(raw: unknown): string {
  if (typeof raw === "undefined" || raw === null || raw === "") return DEFAULT_FREQUENCY;
  if (typeof raw !== "string" || !FREQUENCIES.includes(raw)) {
    throw new Error(`Please choose a frequency: ${FREQUENCIES.join(", ")}.`);
  }
  return raw;
}

function clampedCount(raw: unknown, notices: string[]): number {
  if (typeof raw === "undefined" || raw === null || raw === "") return DEFAULT_COUNT;
  const n = typeof raw === "string" ? Number(raw) : raw;
  if (typeof n !== "number" || Number.isNaN(n) || !Number.isFinite(n)) {
    throw new Error(`Count must be a number between ${MIN_COUNT} and ${MAX_COUNT}.`);
  }
  const rounded = Math.round(n);
  if (rounded < MIN_COUNT) {
    notices.push(`Note: count was raised to the minimum of ${MIN_COUNT}.`);
    return MIN_COUNT;
  }
  if (rounded > MAX_COUNT) {
    notices.push(`Note: count was lowered to the maximum of ${MAX_COUNT}.`);
    return MAX_COUNT;
  }
  return rounded;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface NewsletterIdea {
  title: string;
  angle: string;
  whyItWorks: string;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const notices: string[] = [];
  let niche: string;
  let audience: string;
  let frequency: string;
  let count: number;
  try {
    niche = requiredText(values, "niche", "your newsletter niche");
    audience = requiredText(values, "audience", "your target audience");
    frequency = validatedFrequency(values.frequency);
    count = clampedCount(values.count, notices);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }

  niche = escapeHtml(truncateWithNotice(niche, "niche", notices));
  audience = escapeHtml(truncateWithNotice(audience, "audience", notices));

  // Deterministic rotation: start offset from input hash, then walk the banks
  // so no title repeats within a run (24 titles >= max count of 20).
  const seed = hashStr(`${niche}|${audience}|${frequency}`);
  const ideas: NewsletterIdea[] = [];
  for (let i = 0; i < count; i++) {
    ideas.push({
      title: TITLES[(seed + i) % TITLES.length].split("{niche}").join(niche),
      angle: ANGLES[(seed + i) % ANGLES.length],
      whyItWorks: WHYS[(seed + 2 * i) % WHYS.length],
    });
  }

  notices.push(
    `Ideas are format patterns matched to "${niche}" for ${audience}; the ${frequency} cadence is noted for your planning — the patterns themselves work at any frequency.`,
  );

  return {
    ok: true,
    values: {
      ideas: {
        columns: ["#", "Title", "Angle", "Why it works"],
        rows: ideas.map((idea, i) => [String(i + 1), idea.title, idea.angle, idea.whyItWorks]),
      },
      notices: notices.join(" "),
    },
  };
}
