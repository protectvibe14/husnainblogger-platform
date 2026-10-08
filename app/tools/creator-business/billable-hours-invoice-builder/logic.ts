/**
 * Billable Hours Invoice Builder — pure logic (zero imports, zero network, zero DOM).
 *
 * BuilderTemplate calls runTool({ items }). Each item is one invoice line:
 *   { description, hours, rate }            (required per line)
 * Header fields (clientName, invoiceNumber, dueDate, paymentDetails,
 * taxRatePct) are read from the FIRST item only — fill them once there;
 * they apply to the whole invoice. This is documented in the UI copy.
 *
 * Formula J-BILLABLE-INVOICE:
 *   lineTotal = hours x rate            (per line)
 *   subtotal  = sum(lineTotals)
 *   taxAmount = taxRatePct == null ? 0 : subtotal x taxRatePct / 100
 *             (no tax line is rendered when no tax rate is entered —
 *              never a 0% assumption)
 *   totalDue  = subtotal + taxAmount
 * All money values rounded to 2 decimals. No hardcoded tax rates.
 */

export interface InvoiceLineInput {
  description: string;
  hours: number;
  rate: number;
}

export interface InvoiceHeader {
  clientName: string;
  invoiceNumber: string;
  dueDate: string;
  paymentDetails: string;
  taxRatePct: number | null;
}

export type ToolResult =
  | { ok: true; values: Record<string, unknown> }
  | { ok: false; error: string };

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function money(n: number): string {
  return "$" + round2(n).toFixed(2);
}

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Parse a numeric field that may arrive as a number or numeric string. */
function parseMoneyNumber(v: unknown): number | null {
  if (isFiniteNumber(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function readHeader(first: Record<string, unknown>): InvoiceHeader | { error: string } {
  const rawTax = first["taxRatePct"];
  const taxEmpty =
    rawTax === undefined ||
    rawTax === null ||
    (typeof rawTax === "string" && rawTax.trim() === "");
  let taxRatePct: number | null = null;
  if (!taxEmpty) {
    const n = parseMoneyNumber(rawTax);
    if (n === null || n < 0) {
      return {
        error:
          "Item 1: tax rate must be a finite number, 0 or more (or leave it empty for no tax line). No tax rate is assumed.",
      };
    }
    taxRatePct = n;
  }
  return {
    clientName: clean(first["clientName"]),
    invoiceNumber: clean(first["invoiceNumber"]),
    dueDate: clean(first["dueDate"]),
    paymentDetails: clean(first["paymentDetails"]),
    taxRatePct,
  };
}

/**
 * Assemble the printable invoice document from fixed text templates.
 * Exported for tests.
 */
export function buildInvoiceDocument(
  header: InvoiceHeader,
  lines: InvoiceLineInput[],
  subtotal: number,
  taxAmount: number,
  totalDue: number,
): string {
  const out: string[] = [];
  out.push("INVOICE");
  out.push(`Invoice #: ${header.invoiceNumber === "" ? "—" : header.invoiceNumber}`);
  out.push(`Bill to: ${header.clientName === "" ? "—" : header.clientName}`);
  out.push(`Due date: ${header.dueDate === "" ? "—" : header.dueDate}`);
  out.push("");
  out.push("Line items:");
  lines.forEach((l, i) => {
    const lineTotal = round2(l.hours * l.rate);
    out.push(`${i + 1}. ${l.description} — ${l.hours} h x ${money(l.rate)} = ${money(lineTotal)}`);
  });
  out.push("");
  out.push(`Subtotal: ${money(subtotal)}`);
  if (header.taxRatePct === null) {
    out.push("Tax: not applied (no tax rate entered — none assumed)");
  } else {
    out.push(`Tax (${header.taxRatePct}%): ${money(taxAmount)}`);
  }
  out.push(`Total due: ${money(totalDue)}`);
  if (header.paymentDetails !== "") {
    out.push("");
    out.push(`Payment details: ${header.paymentDetails}`);
  }
  return out.join("\n");
}

/**
 * Tool logic slot (builder). BuilderTemplate calls runTool({ items }).
 * Returns values.invoiceDocument (copy payload), values.subtotal,
 * values.taxAmount, values.totalDue (currency numbers, 2dp).
 */
export function runTool(args: { items: Record<string, unknown>[] }): ToolResult {
  if (!args || typeof args !== "object" || !Array.isArray(args.items)) {
    return { ok: false, error: "Add at least one line item to build an invoice." };
  }
  if (args.items.length === 0) {
    return { ok: false, error: "Add at least one line item to build an invoice." };
  }

  const lines: InvoiceLineInput[] = [];
  for (let i = 0; i < args.items.length; i++) {
    const item = args.items[i];
    const label = `Item ${i + 1}`;
    if (!item || typeof item !== "object") {
      return { ok: false, error: `${label}: not a valid entry.` };
    }
    const description = clean(item["description"]);
    if (description.length === 0) {
      return { ok: false, error: `${label}: description is required.` };
    }
    const hours = parseMoneyNumber(item["hours"]);
    if (hours === null || hours < 0) {
      return { ok: false, error: `${label}: hours must be a finite number, 0 or more.` };
    }
    const rate = parseMoneyNumber(item["rate"]);
    if (rate === null || rate < 0) {
      return { ok: false, error: `${label}: rate must be a finite number, 0 or more.` };
    }
    lines.push({ description, hours, rate });
  }

  const headerOrError = readHeader(args.items[0]);
  if ("error" in headerOrError) {
    return { ok: false, error: headerOrError.error };
  }
  const header = headerOrError;

  const subtotal = round2(lines.reduce((sum, l) => sum + l.hours * l.rate, 0));
  const taxAmount =
    header.taxRatePct === null ? 0 : round2((subtotal * header.taxRatePct) / 100);
  const totalDue = round2(subtotal + taxAmount);

  const invoiceDocument = buildInvoiceDocument(header, lines, subtotal, taxAmount, totalDue);

  return {
    ok: true,
    values: { invoiceDocument, subtotal, taxAmount, totalDue },
  };
}
