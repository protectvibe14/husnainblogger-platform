/**
 * Keyword Gap Worksheet — pure logic (zero imports, zero network, zero DOM).
 *
 * Compares two user-pasted keyword lists (yours vs a competitor's) and
 * produces a gap worksheet: every keyword classified as a Gap (competitor
 * targets it, you don't), an Overlap (both target it), or Your-only.
 *
 * Word bank: none — this is a worksheet, not a generator. All keywords come
 * from the user's own pasted lists; nothing is invented by the tool.
 *
 * Normalization: keywords are compared case-insensitively with collapsed
 * whitespace (trim + lowercase + single spaces), so "SEO Tips" and
 * "seo  tips" count as the same keyword. Displayed rows use the normalized
 * form. Duplicates inside one list are removed.
 *
 * Determinism: same inputs -> byte-identical outputs. Rows are sorted
 * alphabetically inside each status group (Gaps, then Overlaps, then
 * Your-only).
 */

export const MAX_KEYWORDS_PER_LIST = 500;
export const MAX_LABEL_CHARS = 60;

/** Normalize a keyword for comparison: trim, lowercase, collapse whitespace. */
export function normalizeKeyword(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

function coerceItem(entry: unknown): string | null {
  if (typeof entry === "string" || typeof entry === "number") {
    return String(entry);
  }
  return null;
}

/**
 * Parse one keyword list from a textarea string (one keyword per line)
 * or a string array. Returns deduped normalized keywords or an error.
 */
function parseKeywordList(
  raw: unknown,
  fieldLabel: string,
): { items: string[]; error: string | null } {
  if (raw === undefined || raw === null) {
    return { items: [], error: `${fieldLabel} is required.` };
  }
  let entries: unknown[];
  if (typeof raw === "string") {
    entries = raw.split(/\r?\n/);
  } else if (Array.isArray(raw)) {
    entries = raw;
  } else {
    return {
      items: [],
      error: `${fieldLabel} must be text (one keyword per line) or a list of keywords.`,
    };
  }

  const seen = new Set<string>();
  const items: string[] = [];
  for (const entry of entries) {
    const text = coerceItem(entry);
    if (text === null) {
      return { items: [], error: `${fieldLabel} must contain text only.` };
    }
    const normalized = normalizeKeyword(text);
    if (!normalized) continue; // skip blank lines
    if (!seen.has(normalized)) {
      seen.add(normalized);
      items.push(normalized);
    }
  }
  if (items.length === 0) {
    return { items: [], error: `${fieldLabel} needs at least one keyword.` };
  }
  if (items.length > MAX_KEYWORDS_PER_LIST) {
    return {
      items: [],
      error: `${fieldLabel} supports up to ${MAX_KEYWORDS_PER_LIST} keywords (you pasted ${items.length}).`,
    };
  }
  return { items, error: null };
}

function alphaSort(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function csvEscape(cell: string): string {
  return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

/**
 * Run the worksheet. Values in:
 *   yourKeywords: string (one per line) | string[]   (required)
 *   competitorKeywords: string (one per line) | string[] (required)
 *   competitorLabel: string                           (optional, max 60 chars)
 *
 * Values out:
 *   gapTable: { columns: string[]; rows: string[][] }
 *   overlapCount: number
 *   worksheetCsv: string (CSV payload for download)
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const v = values ?? {};

  const yours = parseKeywordList(v["yourKeywords"], "Your keywords");
  if (yours.error) return { ok: false, error: yours.error };

  const theirs = parseKeywordList(v["competitorKeywords"], "Competitor keywords");
  if (theirs.error) return { ok: false, error: theirs.error };

  let label = "";
  const rawLabel = v["competitorLabel"];
  if (rawLabel !== undefined && rawLabel !== null && String(rawLabel).trim() !== "") {
    label = String(rawLabel).trim();
    if (label.length > MAX_LABEL_CHARS) {
      return {
        ok: false,
        error: `Competitor label must be ${MAX_LABEL_CHARS} characters or fewer.`,
      };
    }
  }

  const yourSet = new Set(yours.items);
  const competitorSet = new Set(theirs.items);

  const gaps: string[] = [];
  const overlaps: string[] = [];
  const yourOnly: string[] = [];

  for (const kw of competitorSet) {
    if (yourSet.has(kw)) overlaps.push(kw);
    else gaps.push(kw);
  }
  for (const kw of yourSet) {
    if (!competitorSet.has(kw)) yourOnly.push(kw);
  }
  gaps.sort(alphaSort);
  overlaps.sort(alphaSort);
  yourOnly.sort(alphaSort);

  const competitorColumn = label ? `Competitor (${label})` : "Competitor";
  const columns = ["Keyword", "Your list", competitorColumn, "Status"];

  const rows: string[][] = [];
  const pushRow = (kw: string, status: string): void => {
    rows.push([
      kw,
      yourSet.has(kw) ? "Yes" : "—",
      competitorSet.has(kw) ? "Yes" : "—",
      status,
    ]);
  };
  for (const kw of gaps) pushRow(kw, "Gap — competitor targets it, you don't");
  for (const kw of overlaps) pushRow(kw, "Overlap — both lists target it");
  for (const kw of yourOnly) pushRow(kw, "Only in your list");

  const csvHeader = ["keyword", "your_list", label ? `competitor_${label}` : "competitor_list", "status"];
  const csvLines = [csvHeader.map(csvEscape).join(",")];
  for (const row of rows) {
    csvLines.push(row.map(csvEscape).join(","));
  }

  return {
    ok: true,
    values: {
      gapTable: { columns, rows },
      overlapCount: overlaps.length,
      worksheetCsv: csvLines.join("\n"),
    },
  };
}
