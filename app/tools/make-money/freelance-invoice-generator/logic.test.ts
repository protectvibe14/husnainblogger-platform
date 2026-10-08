/**
 * Tests for the Freelance Invoice Generator pure logic (tool-078).
 *
 * Run: node --test app/tools/make-money/freelance-invoice-generator/logic.test.ts
 *
 * All expected values are hand-computed, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  generateInvoice,
  sanitizeInvoiceNumber,
  roundToCents,
  runTool,
  parseLineItemsText,
  renderInvoiceDocument,
  DEFAULT_PAYMENT_TERMS_DAYS,
  DEFAULT_CURRENCY,
} from "./logic.ts";

const FREELANCER = { name: "Ayesha Khan", email: "ayesha@example.com" };
const CLIENT = { name: "Acme Corp", email: "billing@acme.com" };

function baseInput() {
  return {
    freelancer: { ...FREELANCER },
    client: { ...CLIENT },
    items: [
      { description: "Logo design", quantity: 1, rate: 500 },
      { description: "Revisions", quantity: 2, rate: 50 },
    ],
  };
}

describe("generateInvoice — full invoice", () => {
  it("computes subtotal 600 / discount 50 / tax 55 / total 605", () => {
    // Hand-computed: lines 500.00 + 100.00 = 600.00; discount 50 ->
    // taxable 550.00; tax 10% = 55.00; total 605.00.
    // dueDate: 2026-10-01 + 30 days = 2026-10-31.
    const r = generateInvoice({
      ...baseInput(),
      taxRatePct: 10,
      discountAmount: 50,
      issueDate: "2026-10-01",
      paymentTermsDays: 30,
      invoiceNumber: "INV-001",
    });
    assert.strictEqual(r.invoiceNumber, "INV-001");
    assert.strictEqual(r.issueDate, "2026-10-01");
    assert.strictEqual(r.dueDate, "2026-10-31");
    assert.deepStrictEqual(
      r.lines.map((l) => l.lineTotal),
      [500, 100],
    );
    assert.strictEqual(r.subtotal, 600);
    assert.strictEqual(r.discountAmount, 50);
    assert.strictEqual(r.taxableAmount, 550);
    assert.strictEqual(r.taxAmount, 55);
    assert.strictEqual(r.total, 605);
    assert.strictEqual(r.currency, "USD");
    assert.ok(r.assumptions.length >= 3, "assumptions must be surfaced");
  });

  it("applies defaults: no tax/discount, 30-day terms, USD, auto number", () => {
    const r = generateInvoice(baseInput());
    assert.strictEqual(r.taxAmount, 0);
    assert.strictEqual(r.discountAmount, 0);
    assert.strictEqual(r.total, 600);
    assert.strictEqual(r.paymentTermsDays, DEFAULT_PAYMENT_TERMS_DAYS);
    assert.strictEqual(r.currency, DEFAULT_CURRENCY);
    assert.match(r.invoiceNumber, /^INV-\d{8}-\d{4}$/);
    assert.ok(
      r.warnings.some((w) => w.includes("generated")),
      "auto-number warning must be surfaced",
    );
  });

  it("generates the same auto-number for identical input (deterministic)", () => {
    const a = generateInvoice({ ...baseInput(), issueDate: "2026-10-01" });
    const b = generateInvoice({ ...baseInput(), issueDate: "2026-10-01" });
    assert.strictEqual(a.invoiceNumber, b.invoiceNumber);
  });
});

describe("generateInvoice — dates", () => {
  it("adds terms across a month boundary (2026-01-31 + 30 = 2026-03-02)", () => {
    const r = generateInvoice({
      ...baseInput(),
      issueDate: "2026-01-31",
      paymentTermsDays: 30,
    });
    assert.strictEqual(r.dueDate, "2026-03-02");
  });

  it("dueDate equals issueDate when terms are 0", () => {
    const r = generateInvoice({
      ...baseInput(),
      issueDate: "2026-10-01",
      paymentTermsDays: 0,
    });
    assert.strictEqual(r.dueDate, "2026-10-01");
  });

  it("rejects impossible and malformed dates", () => {
    assert.throws(
      () => generateInvoice({ ...baseInput(), issueDate: "2026-13-01" }),
      RangeError,
    );
    assert.throws(
      () => generateInvoice({ ...baseInput(), issueDate: "2026-02-30" }),
      RangeError,
    );
    assert.throws(
      () => generateInvoice({ ...baseInput(), issueDate: "not-a-date" }),
      RangeError,
    );
    assert.throws(
      () => generateInvoice({ ...baseInput(), issueDate: 20261001 as never }),
      TypeError,
    );
  });
});

describe("generateInvoice — discount and rounding", () => {
  it("clamps a discount larger than the subtotal and warns", () => {
    const r = generateInvoice({
      ...baseInput(),
      items: [{ description: "Consulting", quantity: 1, rate: 100 }],
      discountAmount: 150,
      taxRatePct: 10,
    });
    assert.strictEqual(r.discountAmount, 100);
    assert.strictEqual(r.taxableAmount, 0);
    assert.strictEqual(r.taxAmount, 0);
    assert.strictEqual(r.total, 0);
    assert.ok(r.warnings.some((w) => w.includes("clamped")));
  });

  it("rounds line totals half-up (1.5 x 19.995 -> 29.99)", () => {
    // 1.5 * 19.995 = 29.9925 -> 29.99.
    const r = generateInvoice({
      ...baseInput(),
      items: [{ description: "Editing", quantity: 1.5, rate: 19.995 }],
    });
    assert.strictEqual(r.lines[0].lineTotal, 29.99);
    assert.strictEqual(r.subtotal, 29.99);
  });

  it("allows fractional quantities and zero rates", () => {
    const r = generateInvoice({
      ...baseInput(),
      items: [
        { description: "Hours", quantity: 2.5, rate: 40 },
        { description: "Bonus (free)", quantity: 1, rate: 0 },
      ],
    });
    assert.deepStrictEqual(
      r.lines.map((l) => l.lineTotal),
      [100, 0],
    );
  });
});

describe("generateInvoice — invoice number sanitization", () => {
  it("strips unsafe characters and warns", () => {
    const r = generateInvoice({ ...baseInput(), invoiceNumber: "INV #001/2026!!" });
    assert.strictEqual(r.invoiceNumber, "INV0012026");
    assert.ok(r.warnings.some((w) => w.includes("sanitized")));
  });

  it("falls back to auto-number for an empty-after-sanitize value", () => {
    const r = generateInvoice({ ...baseInput(), invoiceNumber: "!!! ###" });
    assert.match(r.invoiceNumber, /^INV-\d{8}-\d{4}$/);
  });

  it("sanitizeInvoiceNumber keeps only [A-Za-z0-9-_.] and caps length", () => {
    assert.strictEqual(sanitizeInvoiceNumber("INV-2026.001_x"), "INV-2026.001_x");
    assert.strictEqual(sanitizeInvoiceNumber("<script>alert(1)</script>"), "scriptalert1script");
    assert.strictEqual(sanitizeInvoiceNumber(123 as never), "");
    assert.ok(sanitizeInvoiceNumber("A".repeat(100)).length <= 32);
  });
});

describe("generateInvoice — invalid input", () => {
  it("rejects empty items and bad line items", () => {
    assert.throws(() => generateInvoice({ ...baseInput(), items: [] }), RangeError);
    assert.throws(
      () =>
        generateInvoice({
          ...baseInput(),
          items: [{ description: "   ", quantity: 1, rate: 10 }],
        }),
      RangeError,
    );
    assert.throws(
      () =>
        generateInvoice({
          ...baseInput(),
          items: [{ description: "Work", quantity: 0, rate: 10 }],
        }),
      RangeError,
    );
    assert.throws(
      () =>
        generateInvoice({
          ...baseInput(),
          items: [{ description: "Work", quantity: 1, rate: -5 }],
        }),
      RangeError,
    );
    assert.throws(
      () =>
        generateInvoice({
          ...baseInput(),
          items: [{ description: "Work", quantity: NaN, rate: 10 }],
        }),
      TypeError,
    );
  });

  it("rejects empty party names and missing parties", () => {
    assert.throws(
      () => generateInvoice({ ...baseInput(), freelancer: { name: "  " } }),
      RangeError,
    );
    assert.throws(
      () => generateInvoice({ ...baseInput(), client: null as never }),
      TypeError,
    );
  });

  it("rejects out-of-range tax, negative discount, bad terms, bad currency", () => {
    assert.throws(
      () => generateInvoice({ ...baseInput(), taxRatePct: 101 }),
      RangeError,
    );
    assert.throws(
      () => generateInvoice({ ...baseInput(), taxRatePct: -1 }),
      RangeError,
    );
    assert.throws(
      () => generateInvoice({ ...baseInput(), discountAmount: -10 }),
      RangeError,
    );
    assert.throws(
      () => generateInvoice({ ...baseInput(), paymentTermsDays: 1.5 }),
      RangeError,
    );
    assert.throws(
      () => generateInvoice({ ...baseInput(), paymentTermsDays: 366 }),
      RangeError,
    );
    assert.throws(
      () => generateInvoice({ ...baseInput(), currency: "USDD" }),
      TypeError,
    );
  });

  it("normalizes a lowercase currency code", () => {
    const r = generateInvoice({ ...baseInput(), currency: "eur" });
    assert.strictEqual(r.currency, "EUR");
  });

  it("rejects over-long notes and non-object input", () => {
    assert.throws(
      () => generateInvoice({ ...baseInput(), notes: "x".repeat(2001) }),
      RangeError,
    );
    assert.throws(() => generateInvoice(null as never), TypeError);
  });

  it("warns on malformed emails instead of throwing", () => {
    const r = generateInvoice({
      ...baseInput(),
      freelancer: { name: "Ayesha", email: "not-an-email" },
    });
    assert.ok(r.warnings.some((w) => w.includes("Freelancer email")));
    assert.strictEqual(r.total, 600);
  });
});

describe("generateInvoice — assumptions honesty", () => {
  it("documents discount-before-tax and user-input responsibility", () => {
    const r = generateInvoice(baseInput());
    const joined = r.assumptions.join(" ");
    assert.ok(joined.includes("BEFORE tax"), "discount convention stated");
    assert.ok(joined.includes("user-provided"), "input responsibility stated");
  });
});

describe("roundToCents", () => {
  it("rounds half-up", () => {
    assert.strictEqual(roundToCents(29.9925), 29.99);
    assert.strictEqual(roundToCents(29.995), 30);
    assert.strictEqual(roundToCents(0.005), 0.01);
  });
});

describe("parseLineItemsText", () => {
  it("parses description | quantity | rate lines", () => {
    const items = parseLineItemsText("Logo design | 1 | 500\nRevisions | 2 | 50");
    assert.deepEqual(items, [
      { description: "Logo design", quantity: 1, rate: 500 },
      { description: "Revisions", quantity: 2, rate: 50 },
    ]);
  });

  it("accepts a zero rate (free item)", () => {
    const items = parseLineItemsText("Bonus page | 1 | 0");
    assert.deepEqual(items, [{ description: "Bonus page", quantity: 1, rate: 0 }]);
  });

  it("skips blank lines", () => {
    const items = parseLineItemsText("\nLogo design | 1 | 500\n\n");
    assert.strictEqual(items.length, 1);
  });

  it("empty text -> error", () => {
    assert.throws(() => parseLineItemsText(""), RangeError);
    assert.throws(() => parseLineItemsText("   \n  "), RangeError);
    assert.throws(() => parseLineItemsText(undefined), RangeError);
  });

  it("wrong segment count -> error with line number", () => {
    assert.throws(() => parseLineItemsText("Logo design | 1"), (e: Error) =>
      /Line 1/.test(e.message),
    );
    assert.throws(() => parseLineItemsText("ok | 1 | 5\nbad line"), (e: Error) =>
      /Line 2/.test(e.message),
    );
  });

  it("bad quantity / rate -> error with line number", () => {
    assert.throws(() => parseLineItemsText("Design | zero | 50"), (e: Error) => /Line 1/.test(e.message));
    assert.throws(() => parseLineItemsText("Design | 0 | 50"), RangeError);
    assert.throws(() => parseLineItemsText("Design | 1 | -5"), RangeError);
  });
});

describe("runTool (mountToolUI adapter)", () => {
  function baseValues() {
    return {
      freelancerName: "Ayesha Khan",
      clientName: "Acme Corp",
      lineItems: "Logo design | 1 | 500\nRevisions | 2 | 50",
      taxRatePct: 10,
      issueDate: "2026-10-01",
      dueDate: "2026-10-31",
      invoiceNumber: "INV-001",
    };
  }

  it("happy path: document + hand-computed totals", () => {
    // subtotal = 500 + 100 = 600 ; tax = 60 ; total = 660
    const r = runTool(baseValues());
    assert.equal(r.ok, true);
    assert.equal(r.values!.subtotal, 600);
    assert.equal(r.values!.taxAmount, 60);
    assert.equal(r.values!.total, 660);
    const doc = r.values!.invoiceDocument as string;
    assert.match(doc, /INVOICE INV-001/);
    assert.match(doc, /Ayesha Khan/);
    assert.match(doc, /Acme Corp/);
    assert.match(doc, /USD 660\.00/);
  });

  it("default tax is 0 and totals match", () => {
    const r = runTool({ ...baseValues(), taxRatePct: undefined });
    assert.equal(r.ok, true);
    assert.equal(r.values!.taxAmount, 0);
    assert.equal(r.values!.total, 600);
  });

  it("empty line items -> validation error", () => {
    const r = runTool({ ...baseValues(), lineItems: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /line item/i);
  });

  it("missing freelancer name -> validation error", () => {
    const r = runTool({ ...baseValues(), freelancerName: "  " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /your name/i);
  });

  it("missing client name -> validation error", () => {
    const r = runTool({ ...baseValues(), clientName: "" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /client's name/i);
  });

  it("missing due date -> validation error", () => {
    const r = runTool({ ...baseValues(), dueDate: "" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /due date/i);
  });

  it("due date before issue date -> validation error", () => {
    const r = runTool({ ...baseValues(), issueDate: "2026-10-15", dueDate: "2026-10-01" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /on or after the issue date/);
  });

  it("tax above 100 -> validation error", () => {
    const r = runTool({ ...baseValues(), taxRatePct: 120 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 0 and 100/);
  });

  it("100% tax -> success with a warning (edge case)", () => {
    const r = runTool({ ...baseValues(), taxRatePct: 100 });
    assert.equal(r.ok, true);
    // subtotal 600, tax 600, total 1200
    assert.equal(r.values!.taxAmount, 600);
    assert.equal(r.values!.total, 1200);
    const warnings = r.values!.warnings as string[];
    assert.ok(warnings.some((w) => /100%/.test(w)));
  });

  it("bad invoice date format -> validation error", () => {
    const r = runTool({ ...baseValues(), dueDate: "31-10-2026" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /YYYY-MM-DD/);
  });

  it("bad currency code -> validation error", () => {
    const r = runTool({ ...baseValues(), currency: "USDD" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /3-letter/);
  });

  it("invoice number omitted -> deterministic auto-number in document", () => {
    const { invoiceNumber: _omit, ...v } = { ...baseValues(), invoiceNumber: "" };
    void _omit;
    const r = runTool(v);
    assert.equal(r.ok, true);
    const doc = r.values!.invoiceDocument as string;
    assert.match(doc, /INVOICE INV-20261001-\d{4}/);
  });

  it("notes appear in the rendered document", () => {
    const r = runTool({ ...baseValues(), notes: "Pay via bank transfer." });
    assert.equal(r.ok, true);
    assert.match(r.values!.invoiceDocument as string, /Pay via bank transfer/);
  });

  it("renderInvoiceDocument renders totals, dates, and warnings", () => {
    const inv = generateInvoice({
      freelancer: { name: "A" },
      client: { name: "B" },
      items: [{ description: "Work", quantity: 1, rate: 100 }],
      taxRatePct: 0,
      issueDate: "2026-10-01",
      paymentTermsDays: 14,
      invoiceNumber: "X-1",
    });
    const doc = renderInvoiceDocument(inv);
    assert.match(doc, /INVOICE X-1/);
    assert.match(doc, /Due: 2026-10-15/);
    assert.match(doc, /TOTAL: USD 100\.00/);
  });

  it("string numbers are accepted (form inputs arrive as strings)", () => {
    const r = runTool({ ...baseValues(), taxRatePct: "10" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.total, 660);
  });

  it("determinism: identical inputs give identical outputs", () => {
    const v = baseValues();
    assert.deepEqual(runTool(v), runTool(v));
  });

  it("output ids match meta.ts outputs", async () => {
    const { outputs } = await import("./meta.ts");
    const r = runTool(baseValues());
    assert.equal(r.ok, true);
    const metaIds = outputs.map((o) => o.id).sort();
    const valueIds = Object.keys(r.values!).sort();
    assert.deepEqual(valueIds, metaIds);
  });
});
