/**
 * Logo Design Quote Builder — pure logic (tool-473).
 *
 * ZERO imports, zero network, zero DOM. Deterministic arithmetic + document
 * assembly only.
 *
 * Builder contract: runTool({ items }) -> { ok, values, error }.
 * Output ids match meta.ts outputs ('itemizedQuote', 'quoteDocument').
 *
 * Row model: one row per quote line item with
 *   - itemDescription (required text)
 *   - quantity (text parsed as a number >= 0)
 *   - unitPrice (text parsed as a number >= 0)
 *
 * Global quote settings are read from the FIRST item only (same convention
 * as other builder tools in this repo):
 *   - conceptsCount (integer >= 1; 0 is a validation error)
 *   - revisionRounds (integer >= 0)
 *   - deliverableFormats (comma-separated text, at least one entry)
 *   - baseRate (number >= 0) — the designer's own per-concept base rate
 *   - rushAddOn (text: yes/no; true/false; 1/0 — default no)
 *   - usageScope (one of: exclusive | extended | full-buyout)
 *
 * HONESTY: every price is USER-PROVIDED. designFee = baseRate * conceptsCount
 * uses the designer's own rate — the tool knows no market rates. A requested
 * rush delivery is recorded as a note only; the tool invents no rush
 * surcharge. The usage scope labels describe the chosen option; they are not
 * legal terms.
 */

const MAX_ITEMS = 50;

const USAGE_SCOPES = ["exclusive", "extended", "full-buyout"] as const;
type UsageScope = (typeof USAGE_SCOPES)[number];

const SCOPE_LABELS: Record<UsageScope, string> = {
  exclusive: "Exclusive (single business)",
  extended: "Extended license",
  "full-buyout": "Full buyout / rights transfer",
};

export interface QuoteLine {
  label: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface QuoteValues {
  /** Flat itemized table; final row has label "QUOTE TOTAL (estimate)". */
  itemizedQuote: QuoteLine[];
  /** Client-ready plain-text quote document. */
  quoteDocument: string;
}

export interface QuoteResult {
  ok: boolean;
  values?: QuoteValues;
  error?: string;
}

/** Round to the nearest cent, half-up. */
function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Parse a number from a text/number cell. Empty -> "required" error. */
function parseNumberCell(
  itemNo: number,
  name: string,
  value: unknown,
  opts: { min: number; integer?: boolean }
): { ok: true; value: number } | { ok: false; error: string } {
  const label = `Item ${itemNo}: ${name}`;
  if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
    return { ok: false, error: `${label} is required.` };
  }
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (Number.isNaN(n) || !Number.isFinite(n)) {
    return { ok: false, error: `${label} must be a finite number.` };
  }
  if (n < opts.min) {
    return { ok: false, error: `${label} must be at least ${opts.min}.` };
  }
  if (opts.integer && !Number.isInteger(n)) {
    return { ok: false, error: `${label} must be a whole number.` };
  }
  return { ok: true, value: n };
}

function parseRushAddOn(itemNo: number, value: unknown): { ok: true; value: boolean } | { ok: false; error: string } {
  const s = clean(value).toLowerCase();
  if (s === "" || s === "no" || s === "false" || s === "0") return { ok: true, value: false };
  if (s === "yes" || s === "true" || s === "1") return { ok: true, value: true };
  return { ok: false, error: `Item ${itemNo}: rushAddOn must be yes or no.` };
}

function money(n: number): string {
  return "$" + n.toFixed(2);
}

export function runTool(args: { items: Record<string, unknown>[] }): QuoteResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return {
      ok: false,
      error: "Add at least one row with a quote line item to build a logo design quote.",
    };
  }
  if (items.length > MAX_ITEMS) {
    return { ok: false, error: `Too many rows: the builder accepts at most ${MAX_ITEMS} rows.` };
  }

  // ---- Global settings from the first item ----
  const first = items[0] as Record<string, unknown>;
  const concepts = parseNumberCell(1, "conceptsCount", first.conceptsCount, {
    min: 1,
    integer: true,
  });
  if (!concepts.ok) return { ok: false, error: concepts.error };

  const revisions = parseNumberCell(1, "revisionRounds", first.revisionRounds, {
    min: 0,
    integer: true,
  });
  if (!revisions.ok) return { ok: false, error: revisions.error };

  const formatsRaw = clean(first.deliverableFormats);
  const formats = formatsRaw
    .split(",")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);
  if (formats.length === 0) {
    return { ok: false, error: "Item 1: deliverableFormats is required (e.g. AI, EPS, PNG, SVG)." };
  }

  const baseRate = parseNumberCell(1, "baseRate", first.baseRate, { min: 0 });
  if (!baseRate.ok) return { ok: false, error: baseRate.error };

  const rush = parseRushAddOn(1, first.rushAddOn);
  if (!rush.ok) return { ok: false, error: rush.error };

  const scopeRaw = clean(first.usageScope).toLowerCase();
  if (!USAGE_SCOPES.includes(scopeRaw as UsageScope)) {
    return {
      ok: false,
      error: `Item 1: usageScope must be one of: ${USAGE_SCOPES.join(" | ")}.`,
    };
  }
  const usageScope = scopeRaw as UsageScope;

  // ---- Line items (every row) ----
  const lines: QuoteLine[] = [];
  const designFee = roundToCents(baseRate.value * concepts.value);
  lines.push({
    label: `Design fee — ${concepts.value} concept${concepts.value === 1 ? "" : "s"}`,
    quantity: concepts.value,
    unitPrice: roundToCents(baseRate.value),
    lineTotal: designFee,
  });

  for (let i = 0; i < items.length; i++) {
    const row = items[i] as Record<string, unknown>;
    const n = i + 1;
    if (typeof row !== "object" || row === null) {
      return { ok: false, error: `Item ${n}: each row must be a set of fields.` };
    }
    const description = clean(row.itemDescription);
    if (!description) {
      return { ok: false, error: `Item ${n}: itemDescription is required.` };
    }
    const qty = parseNumberCell(n, "quantity", row.quantity, { min: 0 });
    if (!qty.ok) return { ok: false, error: qty.error };
    const price = parseNumberCell(n, "unitPrice", row.unitPrice, { min: 0 });
    if (!price.ok) return { ok: false, error: price.error };
    lines.push({
      label: description,
      quantity: qty.value,
      unitPrice: roundToCents(price.value),
      lineTotal: roundToCents(qty.value * price.value),
    });
  }

  const total = roundToCents(lines.reduce((acc, l) => acc + l.lineTotal, 0));
  const itemizedQuote: QuoteLine[] = [
    ...lines,
    { label: "QUOTE TOTAL (estimate)", quantity: 0, unitPrice: 0, lineTotal: total },
  ];

  const docLines: string[] = [
    "LOGO DESIGN QUOTE",
    "=================",
    "",
    `Design fee: ${concepts.value} concept${concepts.value === 1 ? "" : "s"} × ${money(roundToCents(baseRate.value))} = ${money(designFee)}`,
    "",
  ];
  docLines.push("Additional line items:");
  for (let i = 1; i < lines.length; i++) {
    const l = lines[i];
    docLines.push(`- ${l.label} × ${l.quantity} @ ${money(l.unitPrice)} = ${money(l.lineTotal)}`);
  }
  docLines.push("");
  docLines.push(
    `Revision rounds included: ${revisions.value}`,
    `Deliverable formats: ${formats.join(", ")}`,
    `Usage scope: ${SCOPE_LABELS[usageScope]}`,
    rush.value
      ? "Rush delivery: requested (rush surcharge to be agreed with the client — not included above)"
      : "Rush delivery: not requested",
    "",
    `QUOTE TOTAL (estimate): ${money(total)}`,
    "",
    "Prepared from the designer's own rates. All prices are in USD unless agreed otherwise.",
    "Timeline, payment schedule, and usage terms to be agreed in writing before work begins."
  );

  return {
    ok: true,
    values: { itemizedQuote, quoteDocument: docLines.join("\n") },
  };
}
