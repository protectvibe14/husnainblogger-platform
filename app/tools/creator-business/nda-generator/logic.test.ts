/**
 * Tests for the NDA Generator pure logic (tool-463).
 *
 * Run: node --test app/tools/creator-business/nda-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, generateNdaDraft, NDA_DISCLAIMER } from "./logic.ts";

function baseInput() {
  return {
    disclosingParty: "Ayesha Khan",
    receivingParty: "GlowCo LLC",
    effectiveDate: "2026-11-15",
    confidentialInfoDescription: "Product launch plans and pricing strategy",
    termYears: 2,
    mutual: false,
    governingLawJurisdiction: "California, USA",
  };
}

describe("generateNdaDraft — structure", () => {
  it("includes every numbered section", () => {
    const text = generateNdaDraft(baseInput());
    for (const n of ["1.", "2.", "3.", "4.", "5.", "6.", "7.", "8."]) {
      assert.ok(text.includes(n), `missing section ${n}`);
    }
  });
  it("interpolates both party names and the effective date", () => {
    const text = generateNdaDraft(baseInput());
    assert.ok(text.includes("Ayesha Khan"));
    assert.ok(text.includes("GlowCo LLC"));
    assert.ok(text.includes("2026-11-15"));
  });
  it("uses ONE-WAY wording when mutual is false", () => {
    const text = generateNdaDraft({ ...baseInput(), mutual: false });
    assert.ok(text.includes("ONE-WAY"));
    assert.ok(!text.includes("MUTUAL:"));
  });
  it("uses MUTUAL wording when mutual is true", () => {
    const text = generateNdaDraft({ ...baseInput(), mutual: true });
    assert.ok(text.includes("MUTUAL"));
  });
  it("renders the term in years with correct pluralization", () => {
    assert.ok(generateNdaDraft({ ...baseInput(), termYears: 1 }).includes("1 year from"));
    assert.ok(generateNdaDraft({ ...baseInput(), termYears: 3 }).includes("3 years from"));
  });
  it("echoes the jurisdiction as user-provided", () => {
    const text = generateNdaDraft({
      ...baseInput(),
      governingLawJurisdiction: "Dubai, UAE",
    });
    assert.ok(text.includes("Dubai, UAE"));
    assert.ok(text.includes("not verified by this tool"));
  });
  it("ALWAYS includes the mandatory disclaimer", () => {
    const text = generateNdaDraft(baseInput());
    assert.ok(text.includes(NDA_DISCLAIMER));
    assert.strictEqual(
      NDA_DISCLAIMER,
      "Template only — not legal advice. Consult a licensed attorney.",
    );
  });
  it("includes the confidential info description", () => {
    const text = generateNdaDraft(baseInput());
    assert.ok(text.includes("Product launch plans and pricing strategy"));
  });
  it("states draft status and no electronic signature", () => {
    const text = generateNdaDraft(baseInput());
    assert.ok(text.includes("TEMPLATE DRAFT"));
    assert.ok(text.includes("not signed"));
  });
  it("is deterministic — same inputs produce the same text", () => {
    assert.strictEqual(generateNdaDraft(baseInput()), generateNdaDraft(baseInput()));
  });
});

describe("runTool — validation", () => {
  it("generates a draft for valid inputs", () => {
    const r = runTool(baseInput());
    assert.strictEqual(r.ok, true);
    assert.ok(typeof r.values!.ndaDraftText === "string");
    assert.ok((r.values as Record<string, string>).ndaDraftText.includes(NDA_DISCLAIMER));
  });
  it("rejects an empty disclosing party", () => {
    const r = runTool({ ...baseInput(), disclosingParty: "   " });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });
  it("rejects an empty receiving party", () => {
    const r = runTool({ ...baseInput(), receivingParty: "" });
    assert.strictEqual(r.ok, false);
  });
  it("rejects an invalid effective date", () => {
    assert.strictEqual(runTool({ ...baseInput(), effectiveDate: "15/11/2026" }).ok, false);
    assert.strictEqual(runTool({ ...baseInput(), effectiveDate: "2026-13-01" }).ok, false);
    assert.strictEqual(runTool({ ...baseInput(), effectiveDate: "2026-02-30" }).ok, false);
  });
  it("rejects an empty confidential info description", () => {
    const r = runTool({ ...baseInput(), confidentialInfoDescription: "" });
    assert.strictEqual(r.ok, false);
  });
  it("rejects a zero or negative term", () => {
    assert.strictEqual(runTool({ ...baseInput(), termYears: 0 }).ok, false);
    assert.strictEqual(runTool({ ...baseInput(), termYears: -2 }).ok, false);
  });
  it("rejects a fractional term", () => {
    const r = runTool({ ...baseInput(), termYears: 1.5 });
    assert.strictEqual(r.ok, false);
  });
  it("rejects a missing jurisdiction", () => {
    const r = runTool({ ...baseInput(), governingLawJurisdiction: "" });
    assert.strictEqual(r.ok, false);
  });
  it("accepts numeric strings for termYears", () => {
    const r = runTool({ ...baseInput(), termYears: "3" });
    assert.strictEqual(r.ok, true);
    assert.ok((r.values as Record<string, string>).ndaDraftText.includes("3 years"));
  });
  it("output key is exactly ndaDraftText", () => {
    const r = runTool(baseInput());
    assert.deepStrictEqual(Object.keys(r.values!), ["ndaDraftText"]);
  });
});
