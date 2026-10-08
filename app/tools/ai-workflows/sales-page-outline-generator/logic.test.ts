import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, buildOutline, SECTION_COUNT } from "./logic.ts";

describe("sales-page-outline-generator", () => {
  it("happy path: full inputs produce outline + section list", () => {
    const r = runTool({
      offerName: "Course X",
      price: "$97",
      targetAudience: "beginner bloggers",
    });
    assert.equal(r.ok, true);
    const outline = r.values?.outline as string;
    const sections = r.values?.sections as string[];
    assert.ok(outline.includes('Sales page outline for "Course X"'));
    assert.equal(sections.length, SECTION_COUNT);
    assert.ok(outline.includes("Course X"));
    assert.ok(outline.includes("$97"));
    assert.ok(outline.includes("beginner bloggers"));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ offerName: "X" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), ["outline", "sections"]);
  });

  it("exactly 10 fixed sections", () => {
    const sections = buildOutline("Offer", "$10", "Audience");
    assert.equal(sections.length, 10);
    assert.deepEqual(sections.map((s) => s.number), ["1","2","3","4","5","6","7","8","9","10"]);
    const titles = sections.map((s) => s.title);
    assert.ok(titles[0].startsWith("Hero"));
    assert.ok(titles[9].startsWith("Final call to action"));
  });

  it("missing offerName -> error", () => {
    const r = runTool({ price: "$10", targetAudience: "bloggers" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /offer name/i);
  });

  it("blank offerName (whitespace) -> error", () => {
    const r = runTool({ offerName: "   " });
    assert.equal(r.ok, false);
  });

  it("optional price/audience fall back to bracket placeholders", () => {
    const r = runTool({ offerName: "Course X" });
    assert.equal(r.ok, true);
    const outline = r.values?.outline as string;
    assert.ok(outline.includes("[your price]"));
    assert.ok(outline.includes("[your audience]"));
    assert.ok(!outline.includes("[OFFER]"), "no unfilled template tokens");
  });

  it("empty input object -> error", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });

  it("non-object input -> error", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("every section prompt is non-empty and contains no raw tokens", () => {
    const sections = buildOutline("Offer", "$10", "Audience");
    for (const s of sections) {
      assert.ok(s.prompt.length > 20, s.title);
      assert.ok(!s.prompt.includes("[OFFER]"));
      assert.ok(!s.prompt.includes("[PRICE]"));
      assert.ok(!s.prompt.includes("[AUDIENCE]"));
    }
  });

  it("proof section warns against inventing testimonials", () => {
    const sections = buildOutline("Offer", "$10", "Audience");
    const proof = sections.find((s) => s.title.startsWith("Proof"));
    assert.ok(proof !== undefined);
    assert.match(proof.prompt, /never invent/i);
  });

  it("inputs are trimmed", () => {
    const r = runTool({ offerName: "  Course X  " });
    assert.equal(r.ok, true);
    assert.ok((r.values?.outline as string).includes('"Course X"'));
  });

  it("special characters in offer name pass through unmodified", () => {
    const r = runTool({ offerName: "Kid's \"Ultimate\" Guide & More" });
    assert.equal(r.ok, true);
    assert.ok((r.values?.outline as string).includes('Kid\'s "Ultimate" Guide & More'));
  });

  it("deterministic: same inputs give identical output twice", () => {
    const a = runTool({ offerName: "X", price: "$9", targetAudience: "writers" });
    const b = runTool({ offerName: "X", price: "$9", targetAudience: "writers" });
    assert.deepEqual(a, b);
  });

  it("different offers give different outlines", () => {
    const a = runTool({ offerName: "Course A" }).values?.outline as string;
    const b = runTool({ offerName: "Course B" }).values?.outline as string;
    assert.notEqual(a, b);
  });

  it("section list headings are numbered titles only", () => {
    const r = runTool({ offerName: "X" });
    const sections = r.values?.sections as string[];
    assert.match(sections[0], /^1\. /);
    assert.match(sections[9], /^10\. /);
    assert.ok(sections.every((s) => !s.includes("Write:")));
  });

  it("outline text ends cleanly (no trailing blank lines)", () => {
    const r = runTool({ offerName: "X" });
    const outline = r.values?.outline as string;
    assert.ok(!outline.endsWith("\n"));
    assert.ok(outline.length > 500);
  });
});
