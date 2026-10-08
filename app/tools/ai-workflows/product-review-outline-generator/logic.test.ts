import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, buildOutline, STRUCTURES, SECTION_COUNT, REVIEW_TYPES } from "./logic.ts";

describe("product-review-outline-generator", () => {
  it("happy path: hands-on review with a product name", () => {
    const r = runTool({ productName: "Sonos Era 100", reviewType: "hands-on" });
    assert.equal(r.ok, true);
    const outline = r.values?.outline as string;
    const sections = r.values?.sections as string[];
    assert.ok(outline.includes('Product Review Outline: "Sonos Era 100"'));
    assert.ok(outline.includes("Sonos Era 100"));
    assert.equal(sections.length, SECTION_COUNT);
    assert.ok(sections[0].startsWith("1. Quick verdict"));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ productName: "X", reviewType: "hands-on" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), ["outline", "sections"]);
  });

  it("SECTION_COUNT is 10 and every type has 10 sections", () => {
    assert.equal(SECTION_COUNT, 10);
    for (const t of REVIEW_TYPES) {
      assert.equal(STRUCTURES[t].length, 10, `${t} should have 10 sections`);
    }
  });

  it("missing productName -> error", () => {
    const r = runTool({ reviewType: "hands-on" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /product name/i);
  });

  it("whitespace productName -> error", () => {
    const r = runTool({ productName: "   ", reviewType: "comparison" });
    assert.equal(r.ok, false);
  });

  it("missing reviewType -> error", () => {
    const r = runTool({ productName: "X" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /review type/i);
  });

  it("invalid reviewType -> error listing allowed values", () => {
    const r = runTool({ productName: "X", reviewType: "video" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /hands-on, comparison, roundup/);
  });

  it("comparison: product substituted, [COMPETITOR] left as a fill-in", () => {
    const r = runTool({ productName: "Kindle", reviewType: "comparison" });
    assert.equal(r.ok, true);
    const outline = r.values?.outline as string;
    assert.ok(outline.includes("Kindle"));
    assert.ok(outline.includes("[COMPETITOR]"));
    assert.ok(!outline.includes("[PRODUCT]"));
  });

  it("roundup: anchor pick section names the product", () => {
    const sections = buildOutline("Kindle", "roundup");
    assert.ok(sections[2].title.includes("Best overall: Kindle"));
  });

  it("no raw [PRODUCT] placeholder left in any outline", () => {
    for (const t of REVIEW_TYPES) {
      const r = runTool({ productName: "Widget", reviewType: t });
      assert.ok(!(r.values?.outline as string).includes("[PRODUCT]"), `${t} leaks [PRODUCT]`);
    }
  });

  it("every section has a non-empty title, write prompt, and testing note", () => {
    for (const t of REVIEW_TYPES) {
      for (const s of STRUCTURES[t]) {
        assert.ok(s.title.trim().length > 0, `${t}: empty title`);
        assert.ok(s.prompt.trim().length > 0, `${t}: empty prompt`);
        assert.ok(s.testingNote.trim().length > 0, `${t}: empty testing note`);
      }
    }
  });

  it("outline includes testing-note slots (honest fill-in points)", () => {
    const r = runTool({ productName: "X", reviewType: "hands-on" });
    assert.equal(r.ok, true);
    const outline = r.values?.outline as string;
    assert.ok(outline.includes("Testing note:"));
    assert.ok(outline.includes("the tool writes no opinions for you"));
  });

  it("sections are numbered 1..10 in order", () => {
    const r = runTool({ productName: "X", reviewType: "roundup" });
    const sections = r.values?.sections as string[];
    assert.deepEqual(
      sections.map((s) => s.split(".")[0]),
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
    );
  });

  it("reviewType case-insensitive", () => {
    const r = runTool({ productName: "X", reviewType: "Hands-On" });
    assert.equal(r.ok, true);
    assert.ok((r.values?.outline as string).includes("Review type: hands-on"));
  });

  it("honesty: no invented verdicts or scores", () => {
    const r = runTool({ productName: "X", reviewType: "hands-on" });
    const outline = (r.values?.outline as string).toLowerCase();
    assert.ok(!outline.includes("9/10"));
    assert.ok(!outline.includes("5 stars"));
    assert.ok(!outline.includes("i recommend buying"));
  });

  it("deterministic: same inputs -> identical output", () => {
    const args = { productName: "X", reviewType: "comparison" as const };
    const a = runTool(args);
    const b = runTool(args);
    assert.deepEqual(a, b);
  });
});
