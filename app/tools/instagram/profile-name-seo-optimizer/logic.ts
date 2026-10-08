/**
 * Profile Name SEO Optimizer (tool-250) — pure logic (zero imports, zero
 * network, zero DOM).
 *
 * HONESTY CONTRACT: a rule engine on strings, not AI and not live data.
 * It cannot read your Instagram profile or know what ranks — it applies
 * fixed, published rules:
 *   - keywords are split (comma/newline/semicolon), trimmed, deduplicated
 *     case-insensitively, and priority-ranked in the order you typed them
 *     (first keyword = most important);
 *   - candidate names try three separators (" | ", " · ", ", ") over
 *     keyword subsets (all, top 3, top 2, top 1, plus current-name combos);
 *   - every candidate is HARD-CAPPED at CHAR_BUDGET (30) characters;
 *   - when the full keyword set does not fit, the lowest-priority keywords
 *     are dropped first and the dropped words are reported in `note`;
 *   - a single keyword longer than the budget is cut at 30 chars and noted.
 *
 * keywordCoverage: share (0-100) of your input keywords present in the
 * recommended (first) name. charBudgetBar: a 30-block visual bar for the
 * recommended name. Deterministic: same inputs -> same names, always.
 */

export const CHAR_BUDGET = 30;
export const MAX_NAMES = 6;

const SEPARATORS = [" | ", " · ", ", "] as const;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Split on commas, newlines, semicolons; trim; drop empties; dedupe case-insensitively. */
function parseKeywords(raw: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of raw.split(/[,\n;]+/)) {
    const kw = part.trim().replace(/\s+/g, " ");
    if (kw.length === 0) continue;
    const key = kw.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(kw);
    }
  }
  return out;
}

function presentIn(name: string, kw: string): boolean {
  return name.toLowerCase().includes(kw.toLowerCase());
}

/** Try to join keywords with each separator; return the first that fits the budget. */
function fitJoin(keywords: string[]): string | null {
  for (const sep of SEPARATORS) {
    const candidate = keywords.join(sep);
    if (candidate.length <= CHAR_BUDGET) return candidate;
  }
  return null;
}

/**
 * Priority-ranked truncation: drop the lowest-priority (last) keywords
 * until the set fits. Returns { used, dropped }. If even one keyword is
 * too long, it is hard-cut at the budget.
 */
function truncateToBudget(keywords: string[]): {
  used: string[];
  dropped: string[];
  hardCut: boolean;
} {
  const used = [...keywords];
  const dropped: string[] = [];
  while (used.length > 0 && fitJoin(used) === null) {
    if (used.length === 1) {
      const only = used[0];
      if (only.length > CHAR_BUDGET) {
        return { used: [only.slice(0, CHAR_BUDGET)], dropped, hardCut: true };
      }
      return { used, dropped, hardCut: false };
    }
    dropped.unshift(used.pop() as string);
  }
  return { used, dropped, hardCut: false };
}

function charBudgetBar(name: string): string {
  const filled = Math.min(name.length, CHAR_BUDGET);
  return "█".repeat(filled) + "░".repeat(CHAR_BUDGET - filled) + ` ${name.length}/${CHAR_BUDGET}`;
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  const rawKeywords = values.keywords;
  const rawName = values.name;

  if (typeof rawKeywords !== "string" || rawKeywords.trim().length === 0) {
    return { ok: false, error: "Keywords are required — add at least one keyword." };
  }
  if (rawName !== undefined && typeof rawName !== "string") {
    return { ok: false, error: "Current name must be text." };
  }

  const keywords = parseKeywords(rawKeywords);
  if (keywords.length === 0) {
    return { ok: false, error: "Keywords are required — add at least one keyword." };
  }
  const currentName = clean(rawName ?? "");

  const candidates: string[] = [];
  const droppedAll: string[] = [];
  let hardCut = false;

  // Keyword subsets in priority order: all, top 3, top 2, top 1.
  const subsets: string[][] = [keywords];
  if (keywords.length > 3) subsets.push(keywords.slice(0, 3));
  if (keywords.length > 2) subsets.push(keywords.slice(0, 2));
  subsets.push(keywords.slice(0, 1));

  for (const subset of subsets) {
    const { used, dropped, hardCut: hc } = truncateToBudget(subset);
    const built = fitJoin(used);
    if (built !== null && !candidates.includes(built)) {
      candidates.push(built);
      for (const d of dropped) if (!droppedAll.includes(d)) droppedAll.push(d);
      if (hc) hardCut = true;
    }
  }

  // Current-name combos: "<name> | <top keywords that fit>" and vice versa.
  if (currentName.length > 0 && currentName.length <= CHAR_BUDGET) {
    for (const subset of [keywords.slice(0, 2), keywords.slice(0, 1)]) {
      for (const order of [
        [currentName, ...subset],
        [...subset, currentName],
      ]) {
        const { used, dropped, hardCut: hc } = truncateToBudget(order);
        const built = fitJoin(used);
        if (built !== null && !candidates.includes(built)) {
          candidates.push(built);
          for (const d of dropped) if (!droppedAll.includes(d)) droppedAll.push(d);
          if (hc) hardCut = true;
        }
        if (candidates.length >= MAX_NAMES) break;
      }
      if (candidates.length >= MAX_NAMES) break;
    }
  }

  const optimizedNames = candidates.slice(0, MAX_NAMES);
  if (optimizedNames.length === 0) {
    return { ok: false, error: "Could not build a name within the 30-character budget." };
  }

  const recommended = optimizedNames[0];
  const covered = keywords.filter((kw) => presentIn(recommended, kw)).length;
  const keywordCoverage = Math.round((covered / keywords.length) * 100);

  const noteParts: string[] = [];
  if (droppedAll.length > 0) {
    noteParts.push(
      `Keywords dropped to fit the 30-character budget (lowest priority first): ${droppedAll.join(", ")}.`
    );
  }
  if (hardCut) {
    noteParts.push("One keyword was longer than 30 characters, so it was cut at the budget.");
  }
  if (noteParts.length === 0) {
    noteParts.push("All keywords fit inside the 30-character budget.");
  }

  return {
    ok: true,
    values: {
      optimizedNames,
      keywordCoverage,
      charBudgetBar: charBudgetBar(recommended),
      note: noteParts.join(" "),
    },
  };
}
