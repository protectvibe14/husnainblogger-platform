/**
 * Comparison Table HTML Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Turns the user's headers and rows into a clean, responsive HTML <table>
 * snippet plus a matching CSS block.
 *
 * Honesty contract:
 * - The tool only FORMATS the user's own text as an HTML table. Nothing is
 *   written by AI; the words in the output are always exactly the words the
 *   user typed.
 * - All user content is HTML-escaped — user input can never inject raw HTML,
 *   scripts, or attributes into the output.
 * - Styling is intentionally minimal and inline so the snippet works in any
 *   blog theme; the separate CSS block uses prefixed class names
 *   (hb-compare-*) that are safe to customize or drop.
 * - Deterministic: same inputs → same outputs, always.
 *
 * Input shape for runTool values:
 * - headers: textarea string (one header per line) or string[] (2–6)
 * - rows: textarea string (one row per line, cells separated by "|") or
 *   array of arrays/strings (1–20 rows; each row must have the same number
 *   of cells as there are headers)
 * - highlightColumn: optional 0-based column index to highlight
 *
 * Validation bounds (documented per the batch contract):
 * - headers: 2–6 non-empty
 * - rows: 1–20 non-empty; every row's cell count must equal the header count
 * - highlightColumn: 0-based index within the header range when provided
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MIN_HEADERS = 2;
export const MAX_HEADERS = 6;
export const MIN_ROWS = 1;
export const MAX_ROWS = 20;

/** Escape user text so it can never become markup in the output. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Split textarea text into non-empty trimmed lines. */
function parseLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== "");
}

/** Normalize the headers input (string or string[]) to a trimmed array. */
export function parseHeaders(raw: unknown): string[] | null {
  if (Array.isArray(raw)) {
    return raw.map((h) => String(h).trim()).filter((h) => h !== "");
  }
  if (typeof raw === "string") return parseLines(raw);
  return null;
}

/** Normalize the rows input (string or arrays) to a cell matrix. */
export function parseRows(raw: unknown): string[][] | null {
  if (typeof raw === "string") {
    return parseLines(raw).map((line) =>
      line.split("|").map((c) => c.trim())
    );
  }
  if (Array.isArray(raw)) {
    return raw.map((row) => {
      if (Array.isArray(row)) return row.map((c) => String(c).trim());
      return String(row)
        .split("|")
        .map((c) => c.trim());
    });
  }
  return null;
}

/**
 * Parse the optional 0-based highlight column index.
 * Returns null when not provided; a Result with ok:false when invalid.
 */
export function parseHighlightIndex(
  value: unknown,
  maxExclusive: number
): { ok: boolean; index: number | null; error?: string } {
  if (value === undefined || value === null || String(value).trim() === "") {
    return { ok: true, index: null };
  }
  let n: number;
  if (typeof value === "number") n = value;
  else if (typeof value === "string") n = Number(value.trim());
  else return { ok: false, index: null, error: "Highlight column must be a whole number." };
  if (!Number.isInteger(n)) {
    return { ok: false, index: null, error: "Highlight column must be a whole number." };
  }
  if (n < 0 || n >= maxExclusive) {
    return {
      ok: false,
      index: null,
      error: `Highlight column must be between 0 and ${maxExclusive - 1}.`,
    };
  }
  return { ok: true, index: n };
}

/**
 * Core builder: assemble the table HTML + CSS from validated parts.
 * All content is escaped here, so callers only need structural validation.
 */
export function buildComparisonTable(
  headers: string[],
  rows: string[][],
  highlightColumn: number | null
): { tableHtml: string; tableCss: string } {
  const thCells = headers
    .map((h, i) => {
      const hl =
        highlightColumn === i
          ? ' class="hb-compare-th hb-compare-hl" style="background:#fff8e1;"'
          : ' class="hb-compare-th"';
      return `<th${hl}>${escapeHtml(h)}</th>`;
    })
    .join("");

  const trRows = rows
    .map(
      (row, r) =>
        `<tr class="hb-compare-tr"${r % 2 === 1 ? ' style="background:#fafafa;"' : ""}>` +
        row
          .map((cell, i) => {
            const hl =
              highlightColumn === i
                ? ' class="hb-compare-td hb-compare-hl" style="background:#fff8e1;"'
                : ' class="hb-compare-td"';
            return `<td${hl}>${escapeHtml(cell)}</td>`;
          })
          .join("") +
        "</tr>"
    )
    .join("\n");

  const tableHtml =
    `<div class="hb-compare-wrap" style="overflow-x:auto;margin:1.5em 0;">\n` +
    `<table class="hb-compare-table" style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.5;">\n` +
    `<thead>\n<tr>\n${thCells}\n</tr>\n</thead>\n` +
    `<tbody>\n${trRows}\n</tbody>\n` +
    `</table>\n` +
    `</div>`;

  const tableCss =
    `/* Comparison table styles — optional. The HTML above carries inline\n` +
    `   styles, so it works even without this CSS. Customize freely. */\n` +
    `.hb-compare-wrap { overflow-x: auto; margin: 1.5em 0; }\n` +
    `.hb-compare-table { width: 100%; border-collapse: collapse; font-size: 15px; line-height: 1.5; }\n` +
    `.hb-compare-th { text-align: left; padding: 10px 12px; border: 1px solid #e2e2e2; background: #f4f4f4; font-weight: 700; }\n` +
    `.hb-compare-td { padding: 10px 12px; border: 1px solid #e2e2e2; vertical-align: top; }\n` +
    `.hb-compare-tr:nth-child(even) { background: #fafafa; }\n` +
    `.hb-compare-hl { background: #fff8e1; }\n`;

  return { tableHtml, tableCss };
}

/**
 * Tool-logic slot: validate input, build the table, return run values.
 * Values keys: tableHtml, tableCss (match meta.ts output ids).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return {
      ok: false,
      error: "Add your table headers and rows first.",
    };
  }

  const headers = parseHeaders(values["headers"]);
  if (headers === null || headers.length === 0) {
    return { ok: false, error: "Add at least 2 table headers (one per line)." };
  }
  if (headers.length < MIN_HEADERS) {
    return {
      ok: false,
      error: `Add at least ${MIN_HEADERS} headers (you have ${headers.length}).`,
    };
  }
  if (headers.length > MAX_HEADERS) {
    return {
      ok: false,
      error: `Too many headers: ${headers.length} (max ${MAX_HEADERS}).`,
    };
  }

  const rows = parseRows(values["rows"]);
  if (rows === null || rows.length === 0) {
    return { ok: false, error: "Add at least 1 table row." };
  }
  if (rows.length > MAX_ROWS) {
    return {
      ok: false,
      error: `Too many rows: ${rows.length} (max ${MAX_ROWS}).`,
    };
  }
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].length !== headers.length) {
      return {
        ok: false,
        error: `Row ${i + 1} has ${rows[i].length} cells but there are ${headers.length} headers — separate cells with |.`,
      };
    }
  }

  const hl = parseHighlightIndex(values["highlightColumn"], headers.length);
  if (!hl.ok) return { ok: false, error: hl.error };
  const highlightColumn = hl.index;

  const { tableHtml, tableCss } = buildComparisonTable(
    headers,
    rows,
    highlightColumn
  );
  return { ok: true, values: { tableHtml, tableCss } };
}
