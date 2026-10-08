/**
 * Freelance Invoice Generator — pure logic (tool-078).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Builds a structured invoice DATA
 *   object only — no HTML/PDF rendering (the UI layer renders it).
 * - All money math is plain arithmetic on user-provided values. There is no
 *   platform data involved, so there is no platform-rules source to cite;
 *   the output is only as correct as the user's inputs (stated in
 *   assumptions[]).
 * - Discount (flat amount) is applied BEFORE tax. Documented convention.
 * - Tax is a single flat percentage on the discounted subtotal. Multi-rate /
 *   jurisdiction-specific tax logic (e.g. VAT reverse charge) is NOT modeled.
 * - Dates are ISO YYYY-MM-DD, interpreted as UTC calendar dates. dueDate =
 *   issueDate + paymentTermsDays.
 * - Invoice numbers are sanitized to [A-Za-z0-9-_.], max 32 chars. When not
 *   provided, a deterministic number is generated from the issue date plus a
 *   4-digit checksum of the invoice content (stable for identical inputs).
 * - All money values round to the nearest cent (half-up) per line, then the
 *   rounded lines are summed.
 */

export const DEFAULT_PAYMENT_TERMS_DAYS = 30;
export const DEFAULT_CURRENCY = "USD";
export const MAX_INVOICE_NUMBER_LENGTH = 32;
export const MAX_PAYMENT_TERMS_DAYS = 365;
export const MAX_NOTES_LENGTH = 2000;

/**
 * One billable line item.
 */
export interface InvoiceLineItemInput {
  /** Description of the work. Must be a non-empty string. */
  description: string;
  /** Quantity (hours, units, …). Must be a finite number > 0. */
  quantity: number;
  /** Rate per unit in invoice currency. Must be a finite number >= 0. */
  rate: number;
}

/**
 * A party on the invoice (freelancer or client).
 */
export interface InvoicePartyInput {
  /** Display name. Must be a non-empty string. */
  name: string;
  /** Contact email. Optional; basic format sanity only. */
  email?: string;
  /** Postal address. Optional. */
  address?: string;
}

/**
 * Input for building an invoice.
 */
export interface InvoiceInput {
  /** The freelancer issuing the invoice. */
  freelancer: InvoicePartyInput;
  /** The client being billed. */
  client: InvoicePartyInput;
  /** At least one line item. */
  items: InvoiceLineItemInput[];
  /** Flat tax percentage (0–100). Defaults to 0. */
  taxRatePct?: number;
  /** Flat discount amount, applied BEFORE tax. >= 0. Defaults to 0. */
  discountAmount?: number;
  /** Issue date, ISO YYYY-MM-DD (UTC). Defaults to today (UTC). */
  issueDate?: string;
  /** Days until due. Integer 0–365. Defaults to 30. */
  paymentTermsDays?: number;
  /** Invoice number. Sanitized; auto-generated when missing. */
  invoiceNumber?: string;
  /** 3-letter currency code. Defaults to "USD". */
  currency?: string;
  /** Free-text notes (e.g. payment instructions). Max 2000 chars. */
  notes?: string;
}

/**
 * One computed line on the invoice.
 */
export interface InvoiceLine {
  description: string;
  quantity: number;
  rate: number;
  lineTotal: number;
}

/**
 * The generated invoice (data only).
 */
export interface InvoiceResult {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentTermsDays: number;
  currency: string;
  freelancer: Required<Pick<InvoicePartyInput, "name">> & Partial<InvoicePartyInput>;
  client: Required<Pick<InvoicePartyInput, "name">> & Partial<InvoicePartyInput>;
  lines: InvoiceLine[];
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxRatePct: number;
  taxAmount: number;
  total: number;
  notes: string;
  warnings: string[];
  /** Assumption/convention notes surfaced to the UI. */
  assumptions: string[];
}

/**
 * Round to the nearest cent, half-up.
 */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function assertFiniteNumber(name: string, value: unknown): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number (got ${String(value)}).`);
  }
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be finite (got ${String(value)}).`);
  }
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Validate an ISO YYYY-MM-DD date and return it normalized.
 * @throws {TypeError} when the value is not a string.
 * @throws {RangeError} when it is not a real calendar date.
 */
function assertValidIsoDate(name: string, value: unknown): string {
  const s = cleanString(value);
  if (typeof value !== "string" || s.length === 0) {
    throw new TypeError(`${name} must be an ISO date string (YYYY-MM-DD).`);
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) {
    throw new RangeError(`${name} must be YYYY-MM-DD (got "${s}").`);
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== mo - 1 ||
    dt.getUTCDate() !== d
  ) {
    throw new RangeError(`${name} is not a real calendar date (got "${s}").`);
  }
  return `${m[1]}-${m[2]}-${m[3]}`;
}

/** Add N days to an ISO date (UTC calendar math). */
function addDays(isoDate: string, days: number): string {
  const [y, mo, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/**
 * Sanitize an invoice number to [A-Za-z0-9-_.], max 32 chars.
 * Returns "" when nothing usable remains.
 */
export function sanitizeInvoiceNumber(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/[^A-Za-z0-9\-_.]/g, "")
    .slice(0, MAX_INVOICE_NUMBER_LENGTH);
}

/** Deterministic 4-digit checksum of a string (stable for identical input). */
function checksum4(s: string): string {
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum = (sum + s.charCodeAt(i)) % 10000;
  return String(sum).padStart(4, "0");
}

function validateParty(role: string, party: unknown): InvoicePartyInput {
  if (!party || typeof party !== "object") {
    throw new TypeError(`${role} must be an object.`);
  }
  const p = party as Record<string, unknown>;
  const name = cleanString(p.name);
  if (name.length === 0) {
    throw new RangeError(`${role}.name must be a non-empty string.`);
  }
  return {
    name,
    email: cleanString(p.email) || undefined,
    address: cleanString(p.address) || undefined,
  };
}

/**
 * Build a structured invoice from user input.
 *
 * @param input - freelancer, client, items, tax, discount, dates, terms.
 * @returns Invoice data object (no rendering) with warnings + assumptions.
 * @throws {TypeError} for wrong types (non-numeric money, bad enums, bad input shape).
 * @throws {RangeError} for empty names/items, negative money, bad dates,
 *   out-of-range tax/terms, or over-long notes.
 */
export function generateInvoice(input: InvoiceInput): InvoiceResult {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }

  const warnings: string[] = [];
  const assumptions: string[] = [];

  const freelancer = validateParty("freelancer", input.freelancer);
  const client = validateParty("client", input.client);

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new RangeError("items must be a non-empty array.");
  }

  const lines: InvoiceLine[] = input.items.map((item, i) => {
    if (!item || typeof item !== "object") {
      throw new TypeError(`items[${i}] must be an object.`);
    }
    const description = cleanString(item.description);
    if (description.length === 0) {
      throw new RangeError(`items[${i}].description must be a non-empty string.`);
    }
    const quantity = item.quantity;
    const rate = item.rate;
    assertFiniteNumber(`items[${i}].quantity`, quantity);
    assertFiniteNumber(`items[${i}].rate`, rate);
    if (quantity <= 0) {
      throw new RangeError(`items[${i}].quantity must be > 0.`);
    }
    if (rate < 0) {
      throw new RangeError(`items[${i}].rate must be >= 0.`);
    }
    return {
      description,
      quantity,
      rate,
      lineTotal: roundToCents(quantity * rate),
    };
  });

  const taxRatePct = input.taxRatePct ?? 0;
  assertFiniteNumber("taxRatePct", taxRatePct);
  if (taxRatePct < 0 || taxRatePct > 100) {
    throw new RangeError("taxRatePct must be between 0 and 100.");
  }

  const discountRaw = input.discountAmount ?? 0;
  assertFiniteNumber("discountAmount", discountRaw);
  if (discountRaw < 0) {
    throw new RangeError("discountAmount must be >= 0.");
  }

  const terms = input.paymentTermsDays ?? DEFAULT_PAYMENT_TERMS_DAYS;
  assertFiniteNumber("paymentTermsDays", terms);
  if (!Number.isInteger(terms) || terms < 0 || terms > MAX_PAYMENT_TERMS_DAYS) {
    throw new RangeError(
      `paymentTermsDays must be an integer between 0 and ${MAX_PAYMENT_TERMS_DAYS}.`,
    );
  }

  const currencyRaw = cleanString(input.currency ?? DEFAULT_CURRENCY).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currencyRaw)) {
    throw new TypeError('currency must be a 3-letter code (e.g. "USD").');
  }

  const notes = cleanString(input.notes);
  if (typeof input.notes === "string" && input.notes.length > MAX_NOTES_LENGTH) {
    throw new RangeError(`notes must be at most ${MAX_NOTES_LENGTH} characters.`);
  }

  const issueDate = input.issueDate
    ? assertValidIsoDate("issueDate", input.issueDate)
    : new Date().toISOString().slice(0, 10);
  const dueDate = addDays(issueDate, terms);

  // Invoice number: sanitize user value, else deterministic auto-number.
  let invoiceNumber = sanitizeInvoiceNumber(input.invoiceNumber);
  if (invoiceNumber.length === 0) {
    const seed = issueDate + client.name + JSON.stringify(lines);
    invoiceNumber = `INV-${issueDate.replace(/-/g, "")}-${checksum4(seed)}`;
    warnings.push(
      `No invoice number was provided; generated "${invoiceNumber}" deterministically from the invoice content.`,
    );
  } else if (input.invoiceNumber !== invoiceNumber) {
    warnings.push(
      `Invoice number was sanitized to "${invoiceNumber}" (allowed: letters, digits, - _ .; max ${MAX_INVOICE_NUMBER_LENGTH} chars).`,
    );
  }

  const subtotal = roundToCents(lines.reduce((s, l) => s + l.lineTotal, 0));
  let discountAmount = roundToCents(discountRaw);
  if (discountAmount > subtotal) {
    warnings.push(
      `Discount (${discountAmount}) exceeded the subtotal (${subtotal}) and was clamped to the subtotal.`,
    );
    discountAmount = subtotal;
  }
  const taxableAmount = roundToCents(subtotal - discountAmount);
  const taxAmount = roundToCents((taxableAmount * taxRatePct) / 100);
  const total = roundToCents(taxableAmount + taxAmount);

  if (freelancer.email && !freelancer.email.includes("@")) {
    warnings.push("Freelancer email does not look like an email address.");
  }
  if (client.email && !client.email.includes("@")) {
    warnings.push("Client email does not look like an email address.");
  }

  assumptions.push(
    "Discount is applied BEFORE tax (flat discount on the subtotal, then tax on the remainder).",
  );
  assumptions.push(
    "Tax is a single flat percentage. Multi-rate or jurisdiction-specific tax rules (e.g. VAT reverse charge) are NOT modeled — set the correct rate yourself.",
  );
  assumptions.push(
    "All amounts, dates, and rates are user-provided. The invoice is only as correct as its inputs; this tool performs no tax or legal validation.",
  );
  assumptions.push(
    "Dates are UTC calendar dates; dueDate = issueDate + paymentTermsDays.",
  );

  return {
    invoiceNumber,
    issueDate,
    dueDate,
    paymentTermsDays: terms,
    currency: currencyRaw,
    freelancer,
    client,
    lines,
    subtotal,
    discountAmount,
    taxableAmount,
    taxRatePct,
    taxAmount,
    total,
    notes,
    warnings,
    assumptions,
  };
}

/**
 * runTool adapter for the mountToolUI template (tool-078).
 *
 * The template passes flat form values keyed by input id; this adapter maps
 * them onto the existing `generateInvoice` engine and surfaces the invoice
 * as a copyable plain-text document plus the numeric totals.
 *
 * Inputs (flat form values):
 * - freelancerName (string, required): the freelancer issuing the invoice.
 * - clientName (string, required): the client being billed.
 * - lineItems (string, required): one line per item, format
 *   "description | quantity | rate" (e.g. "Logo design | 1 | 500").
 * - taxRatePct (number|string, optional, default 0): flat tax percent 0-100.
 * - invoiceNumber (string, optional): sanitized / auto-generated by engine.
 * - issueDate (string, optional, default today UTC): ISO YYYY-MM-DD.
 * - dueDate (string, required): ISO YYYY-MM-DD, must be >= issueDate.
 * - currency (string, optional, default USD): 3-letter code.
 * - notes (string, optional).
 *
 * HONESTY: pure client-side arithmetic on user inputs; no external data, no
 * tax/legal validation. Empty line items -> error. 100% tax -> warning.
 * Zero imports, zero network, zero DOM, no randomness (except the engine's
 * default issueDate=today, which tests pin explicitly).
 */

/** Parse the textarea of line items ("description | quantity | rate" per line). */
export function parseLineItemsText(text: unknown): InvoiceLineItemInput[] {
  const raw = typeof text === "string" ? text : "";
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) {
    throw new RangeError(
      'Add at least one line item (one per line: "description | quantity | rate").',
    );
  }
  return lines.map((line, i) => {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length !== 3) {
      throw new RangeError(
        `Line ${i + 1}: use the format "description | quantity | rate" (got "${line}").`,
      );
    }
    const [description, qtyRaw, rateRaw] = parts;
    if (description.length === 0) {
      throw new RangeError(`Line ${i + 1}: description is empty.`);
    }
    const quantity = Number(qtyRaw);
    const rate = Number(rateRaw);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new RangeError(`Line ${i + 1}: quantity must be a number greater than 0.`);
    }
    if (!Number.isFinite(rate) || rate < 0) {
      throw new RangeError(`Line ${i + 1}: rate must be a number of 0 or more.`);
    }
    return { description, quantity, rate };
  });
}

/** Calendar-day difference (due - issue) for ISO YYYY-MM-DD dates. */
function daysBetween(issueDate: string, dueDate: string): number {
  const ms = Date.parse(`${dueDate}T00:00:00Z`) - Date.parse(`${issueDate}T00:00:00Z`);
  return Math.round(ms / 86400000);
}

/** Render the invoice as a copyable plain-text document. */
export function renderInvoiceDocument(inv: InvoiceResult): string {
  const money = (n: number): string => `${inv.currency} ${n.toFixed(2)}`;
  const lines = inv.lines.map(
    (l, i) => `${i + 1}. ${l.description} — ${l.quantity} x ${money(l.rate)} = ${money(l.lineTotal)}`,
  );
  const parts: string[] = [
    `INVOICE ${inv.invoiceNumber}`,
    `From: ${inv.freelancer.name}`,
    `To: ${inv.client.name}`,
    `Issued: ${inv.issueDate} | Due: ${inv.dueDate} (${inv.paymentTermsDays} day${inv.paymentTermsDays === 1 ? "" : "s"})`,
    "",
    "Items:",
    ...lines,
    "",
    `Subtotal: ${money(inv.subtotal)}`,
  ];
  if (inv.discountAmount > 0) parts.push(`Discount: -${money(inv.discountAmount)}`);
  parts.push(`Tax (${inv.taxRatePct}%): ${money(inv.taxAmount)}`);
  parts.push(`TOTAL: ${money(inv.total)}`);
  if (inv.notes.length > 0) {
    parts.push("", "Notes:", inv.notes);
  }
  if (inv.warnings.length > 0) {
    parts.push("", "Warnings:", ...inv.warnings.map((w) => `- ${w}`));
  }
  return parts.join("\n");
}

function runToolNumber(name: string, value: unknown, def: number): number {
  if (value === undefined || value === null || value === "") return def;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n)) {
    throw new TypeError(`${name} must be a number.`);
  }
  return n;
}

/**
 * mountToolUI entry point. Returns `{ ok: false, error }` with a human
 * message on any invalid input instead of throwing.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    const freelancerName = cleanString(values.freelancerName);
    if (freelancerName.length === 0) {
      return { ok: false, error: "Enter your name (the freelancer issuing the invoice)." };
    }
    const clientName = cleanString(values.clientName);
    if (clientName.length === 0) {
      return { ok: false, error: "Enter the client's name." };
    }

    const items = parseLineItemsText(values.lineItems);

    const taxRatePct = runToolNumber("taxRatePct", values.taxRatePct, 0);
    if (taxRatePct < 0 || taxRatePct > 100) {
      return { ok: false, error: "Tax rate must be between 0 and 100 percent." };
    }

    const hasDue = typeof values.dueDate === "string" && values.dueDate.trim().length > 0;
    if (!hasDue) {
      return { ok: false, error: "Enter a due date (YYYY-MM-DD)." };
    }
    const dueDate = assertValidIsoDate("dueDate", values.dueDate);
    const issueDate =
      values.issueDate === undefined || values.issueDate === null || values.issueDate === ""
        ? new Date().toISOString().slice(0, 10)
        : assertValidIsoDate("issueDate", values.issueDate);
    const paymentTermsDays = daysBetween(issueDate, dueDate);
    if (paymentTermsDays < 0) {
      return { ok: false, error: "Due date must be on or after the issue date." };
    }

    const currency =
      values.currency === undefined || values.currency === null || values.currency === ""
        ? "USD"
        : cleanString(values.currency).toUpperCase();

    const inv = generateInvoice({
      freelancer: { name: freelancerName },
      client: { name: clientName },
      items,
      taxRatePct,
      paymentTermsDays,
      issueDate,
      invoiceNumber:
        typeof values.invoiceNumber === "string" && values.invoiceNumber.trim().length > 0
          ? values.invoiceNumber
          : undefined,
      currency,
      notes: typeof values.notes === "string" ? values.notes : undefined,
    });

    const warnings = [...inv.warnings];
    if (taxRatePct === 100) {
      warnings.push(
        "Tax is set to 100% — the total equals the subtotal plus an equal tax amount. Double-check this is intended.",
      );
    }

    return {
      ok: true,
      values: {
        invoiceDocument: renderInvoiceDocument(inv),
        subtotal: inv.subtotal,
        taxAmount: inv.taxAmount,
        total: inv.total,
        warnings,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not generate the invoice.",
    };
  }
}
