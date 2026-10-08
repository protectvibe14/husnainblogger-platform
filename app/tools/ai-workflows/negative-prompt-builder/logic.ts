/**
 * Negative Prompt Builder — pure logic (builder tool).
 *
 * WHAT IT HONESTLY DOES:
 * Combines the user's selected terms into a single negative-prompt string
 * for image generators. Fixed combination rules, no AI.
 *
 * FIXED COMBINATION RULES (documented):
 * 1. Each item's `term` is trimmed; embedded commas become spaces so the
 *    output stays a clean comma-joined list.
 * 2. Internal whitespace collapses to single spaces.
 * 3. Duplicates are removed case-insensitively, keeping the first spelling.
 * 4. Terms are joined with ", " in the order the user added them.
 *
 * Deterministic: same items -> identical string, always.
 * Zero imports, zero DOM, zero network, zero Math.random.
 */

/** Suggested starter terms users can copy into builder rows (fixed bank of 24). */
export const SUGGESTED_TERMS: ReadonlyArray<string> = [
  "blurry", "low quality", "watermark", "text", "logo", "extra fingers",
  "deformed hands", "distorted face", "bad anatomy", "mutated", "ugly",
  "oversaturated", "grainy", "noisy", "jpeg artifacts", "cropped",
  "out of frame", "duplicate", "morbid", "disfigured", "asymmetric",
  "bad proportions", "floating limbs", "tiling",
];

/** Clean one raw term: trim, drop commas, collapse whitespace. */
export function cleanTerm(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/,+/g, " ").replace(/\s+/g, " ").trim();
}

/** Combine cleaned terms: dedupe case-insensitively, keep first casing, join with ", ". */
export function combineTerms(terms: string[]): string {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const term of terms) {
    const key = term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(term);
  }
  return unique.join(", ");
}

export function runTool(args: { items: Record<string, unknown>[] }): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const items = args.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Add at least one term to avoid (one builder row)." };
  }

  const cleaned: string[] = [];
  for (let i = 0; i < items.length; i += 1) {
    const term = cleanTerm(items[i]["term"]);
    if (term.length === 0) {
      return { ok: false, error: `Item ${i + 1}: the term is required — type what you want to avoid.` };
    }
    cleaned.push(term);
  }

  return { ok: true, values: { negativePrompt: combineTerms(cleaned) } };
}
