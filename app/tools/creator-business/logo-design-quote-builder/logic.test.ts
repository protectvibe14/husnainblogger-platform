/**
 * Tests for the Logo Design Quote Builder pure logic (tool-473).
 *
 * Run: node --test app/tools/creator-business/logo-design-quote-builder/logic.test.ts
 *
 * All expected values are hand-computed, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool } from "./logic.ts";

const GLOBALS = {
  conceptsCount: "3",
  revisionRounds: "2",
  deliverableFormats: "AI, EPS, PNG, SVG",
  baseRate: "200",
  rushAddOn: "no",
  usageScope: "exclusive",
};

function row(description: string, quantity: string, unitPrice: string) {
  return { ...GLOBALS, itemDescription: description, quantity, unitPrice };
}

describe("runTool — normal cases", () => {
  it("builds a quote: design fee 600 + items 270 = 870", () => {
    // designFee = 3 * 200 = 600; items = 150 + 120 = 270; total = 870.
    const r = runTool({
      items: [
        row("Brand guidelines mini-book", "1", "150"),
        row("Social media kit", "1", "120"),
      ],
    });
    assert.strictEqual(r.ok, true);
    const lines = r.values!.itemizedQuote;
    assert.strictEqual(lines[0].label, "Design fee — 3 concepts");
    assert.strictEqual(lines[0].lineTotal, 600);
    assert.strictEqual(lines[1].lineTotal, 150);
    assert.strictEqual(lines[2].lineTotal, 120);
    assert.strictEqual(lines[lines.length - 1].label, "QUOTE TOTAL (estimate)");
    assert.strictEqual(lines[lines.length - 1].lineTotal, 870);
  });

  it("multiplies quantity by unit price per line", () => {
    // designFee = 600; favicons = 3 * 25 = 75; total = 675.
    const r = runTool({
      items: [row("Favicon set", "3", "25")],
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.itemizedQuote[1].lineTotal, 75);
    assert.strictEqual(r.values!.itemizedQuote[2].lineTotal, 675);
  });

  it("reads global settings from the first item only", () => {
    // Second row carries different globals; first row wins.
    const r = runTool({
      items: [
        row("Item A", "1", "10"),
        { ...row("Item B", "1", "20"), conceptsCount: "99", baseRate: "1" },
      ],
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.itemizedQuote[0].lineTotal, 600); // 3 * 200
    assert.strictEqual(r.values!.itemizedQuote[3].lineTotal, 630);
  });

  it("quote document contains all client-ready sections", () => {
    const r = runTool({ items: [row("Brand guidelines", "1", "150")] });
    assert.strictEqual(r.ok, true);
    const doc = r.values!.quoteDocument;
    assert.match(doc, /LOGO DESIGN QUOTE/);
    assert.match(doc, /3 concepts/);
    assert.match(doc, /Brand guidelines/);
    assert.match(doc, /Revision rounds included: 2/);
    assert.match(doc, /AI, EPS, PNG, SVG/);
    assert.match(doc, /Usage scope: Exclusive \(single business\)/);
    assert.match(doc, /QUOTE TOTAL \(estimate\): \$750\.00/);
    assert.match(doc, /Rush delivery: not requested/);
  });

  it("records a rush request as a note without inventing a surcharge", () => {
    const r = runTool({
      items: [{ ...row("Item A", "1", "100"), rushAddOn: "yes" }],
    });
    assert.strictEqual(r.ok, true);
    assert.match(r.values!.quoteDocument, /Rush delivery: requested/);
    assert.match(r.values!.quoteDocument, /not included above/);
    // Total unchanged: 600 + 100 = 700 (no invented rush fee).
    assert.strictEqual(r.values!.itemizedQuote[2].lineTotal, 700);
  });

  it("accepts the other usage scopes", () => {
    for (const scope of ["extended", "full-buyout"]) {
      const r = runTool({ items: [{ ...row("Item A", "1", "10"), usageScope: scope }] });
      assert.strictEqual(r.ok, true);
    }
    const r = runTool({ items: [{ ...row("Item A", "1", "10"), usageScope: "extended" }] });
    assert.match(r.values!.quoteDocument, /Extended license/);
  });

  it("handles a single concept and zero revisions", () => {
    const r = runTool({
      items: [{ ...row("Item A", "2", "50"), conceptsCount: "1", revisionRounds: "0" }],
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.itemizedQuote[0].label, "Design fee — 1 concept");
    assert.strictEqual(r.values!.itemizedQuote[0].lineTotal, 200);
    assert.match(r.values!.quoteDocument, /Revision rounds included: 0/);
  });

  it("rounds money to cents", () => {
    const r = runTool({
      items: [{ ...row("Item A", "3", "33.333"), baseRate: "199.995" }],
    });
    assert.strictEqual(r.ok, true);
    // designFee = 3 * 199.995 = 599.985 -> 599.99; item = 99.999 -> 100.00.
    assert.strictEqual(r.values!.itemizedQuote[0].lineTotal, 599.99);
    assert.strictEqual(r.values!.itemizedQuote[1].lineTotal, 100);
  });
});

describe("runTool — validation errors", () => {
  it("rejects an empty items array", () => {
    const r = runTool({ items: [] });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /at least one row/);
  });

  it("rejects concepts = 0", () => {
    const r = runTool({
      items: [{ ...row("Item A", "1", "10"), conceptsCount: "0" }],
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Item 1: conceptsCount must be at least 1/);
  });

  it("rejects a fractional concepts count", () => {
    const r = runTool({
      items: [{ ...row("Item A", "1", "10"), conceptsCount: "2.5" }],
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("rejects missing itemDescription with the item number", () => {
    const r = runTool({
      items: [row("Item A", "1", "10"), { ...GLOBALS, itemDescription: "  ", quantity: "1", unitPrice: "5" }],
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Item 2: itemDescription is required/);
  });

  it("rejects a negative unit price", () => {
    const r = runTool({ items: [row("Item A", "1", "-5")] });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Item 1: unitPrice must be at least 0/);
  });

  it("rejects NaN quantity", () => {
    const r = runTool({ items: [row("Item A", "abc", "10")] });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Item 1: quantity must be a finite number/);
  });

  it("rejects an invalid usage scope", () => {
    const r = runTool({
      items: [{ ...row("Item A", "1", "10"), usageScope: "whatever" }],
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /usageScope must be one of/);
  });

  it("rejects an invalid rushAddOn value", () => {
    const r = runTool({
      items: [{ ...row("Item A", "1", "10"), rushAddOn: "maybe" }],
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /rushAddOn must be yes or no/);
  });

  it("rejects empty deliverable formats", () => {
    const r = runTool({
      items: [{ ...row("Item A", "1", "10"), deliverableFormats: " , " }],
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /deliverableFormats is required/);
  });

  it("rejects more than 50 rows", () => {
    const items = Array.from({ length: 51 }, (_, i) =>
      row(`Item ${i + 1}`, "1", "1")
    );
    const r = runTool({ items });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /at most 50/);
  });
});
