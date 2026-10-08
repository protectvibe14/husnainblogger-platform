import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, buildInvoiceDocument } from "./logic.ts";
import * as meta from "./meta.ts";

const TWO_LINES = {
  items: [
    {
      description: "Logo design",
      hours: 4.5,
      rate: 80,
      clientName: "Acme Corp",
      invoiceNumber: "INV-001",
      dueDate: "2026-11-01",
      taxRatePct: 7.5,
      paymentDetails: "Bank transfer",
    },
    { description: "Revisions", hours: 2, rate: 80 },
  ],
};

describe("billable-hours-invoice-builder", () => {
  it("builds an itemized invoice with tax", () => {
    const r = runTool(TWO_LINES);
    assert.equal(r.ok, true);
    const v = r.values!;
    assert.equal(v.subtotal, 520); // 4.5*80 + 2*80
    assert.equal(v.taxAmount, 39); // 520 * 7.5%
    assert.equal(v.totalDue, 559);
    const doc = v.invoiceDocument as string;
    assert.match(doc, /INVOICE/);
    assert.match(doc, /Invoice #: INV-001/);
    assert.match(doc, /Bill to: Acme Corp/);
    assert.match(doc, /Due date: 2026-11-01/);
    assert.match(doc, /1\. Logo design — 4\.5 h x \$80\.00 = \$360\.00/);
    assert.match(doc, /2\. Revisions — 2 h x \$80\.00 = \$160\.00/);
    assert.match(doc, /Subtotal: \$520\.00/);
    assert.match(doc, /Tax \(7\.5%\): \$39\.00/);
    assert.match(doc, /Total due: \$559\.00/);
    assert.match(doc, /Payment details: Bank transfer/);
  });

  it("omits the tax line when no tax rate is entered (no 0% assumption)", () => {
    const r = runTool({
      items: [{ description: "Work", hours: 3, rate: 50, clientName: "X" }],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.taxAmount, 0);
    assert.equal(r.values!.totalDue, 150);
    const doc = r.values!.invoiceDocument as string;
    assert.match(doc, /Tax: not applied \(no tax rate entered/);
    assert.doesNotMatch(doc, /Tax \(/);
  });

  it("renders an explicit 0% tax line when 0 is entered", () => {
    const r = runTool({
      items: [{ description: "Work", hours: 3, rate: 50, clientName: "X", taxRatePct: 0 }],
    });
    assert.equal(r.ok, true);
    assert.match(r.values!.invoiceDocument as string, /Tax \(0%\): \$0\.00/);
  });

  it("rounds line totals to 2 decimals", () => {
    const r = runTool({
      items: [{ description: "Tiny", hours: 1.333, rate: 10, clientName: "X" }],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.subtotal, 13.33);
    assert.match(r.values!.invoiceDocument as string, /= \$13\.33/);
  });

  it("accepts hours/rate as numeric strings", () => {
    const r = runTool({
      items: [{ description: "Work", hours: "2.5", rate: "40", clientName: "X" }],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.subtotal, 100);
  });

  it("shows dashes for missing optional header fields", () => {
    const doc = buildInvoiceDocument(
      { clientName: "", invoiceNumber: "", dueDate: "", paymentDetails: "", taxRatePct: null },
      [{ description: "Work", hours: 1, rate: 10 }],
      10,
      0,
      10,
    );
    assert.match(doc, /Invoice #: —/);
    assert.match(doc, /Bill to: —/);
    assert.match(doc, /Due date: —/);
    assert.doesNotMatch(doc, /Payment details/);
  });

  it("rejects an empty item list", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one line item/);
  });

  it("rejects a missing items array", () => {
    const r = runTool({} as never);
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one line item/);
  });

  it("rejects an item with an empty description", () => {
    const r = runTool({ items: [{ description: "  ", hours: 1, rate: 10 }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: description is required/);
  });

  it("rejects non-numeric hours", () => {
    const r = runTool({ items: [{ description: "W", hours: "lots", rate: 10 }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: hours/);
  });

  it("rejects empty hours", () => {
    const r = runTool({ items: [{ description: "W", hours: "", rate: 10 }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: hours/);
  });

  it("rejects NaN rate", () => {
    const r = runTool({ items: [{ description: "W", hours: 1, rate: NaN }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: rate/);
  });

  it("rejects Infinity hours", () => {
    const r = runTool({ items: [{ description: "W", hours: Infinity, rate: 10 }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: hours/);
  });

  it("rejects negative rate", () => {
    const r = runTool({ items: [{ description: "W", hours: 1, rate: -5 }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: rate/);
  });

  it("rejects a negative tax rate on the first item", () => {
    const r = runTool({
      items: [{ description: "W", hours: 1, rate: 10, taxRatePct: -2 }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /tax rate/);
  });

  it("reports the failing item number", () => {
    const r = runTool({
      items: [
        { description: "OK", hours: 1, rate: 10 },
        { description: "Bad", hours: 1, rate: "free" },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 2/);
  });

  it("is deterministic: same inputs give identical outputs", () => {
    const a = runTool(TWO_LINES);
    const b = runTool(TWO_LINES);
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(TWO_LINES);
    assert.equal(r.ok, true);
    const expected = meta.outputs.map((o) => o.id).sort();
    const actual = Object.keys(r.values!).sort();
    assert.deepEqual(actual, expected);
  });
});
