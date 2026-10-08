/**
 * Tests for the Pinterest Alt Text Generator.
 * Run: node --test app/tools/pinterest-social/pinterest-alt-text-generator/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, MAX_ALT_CHARS } from "./logic.ts";

const GOOD = { imageDescription: "a rustic wooden tray with three lit candles", keyword: "cozy fall decor" };

function alt(values: Record<string, unknown>): string {
  return values["altText"] as string;
}

describe("pinterest-alt-text-generator", () => {
  it("happy path: returns ok with exactly the meta output ids", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["altText"]);
  });

  it("alt text describes the image and weaves the keyword once", () => {
    const a = alt(runTool(GOOD).values!);
    assert.ok(a.toLowerCase().includes("rustic wooden tray"), "describes the image");
    assert.ok(a.toLowerCase().includes("cozy fall decor"), "keyword woven in");
    assert.ok(a.length <= MAX_ALT_CHARS);
  });

  it("works without a keyword", () => {
    const a = alt(runTool({ imageDescription: "a red bicycle leaning on a brick wall" }).values!);
    assert.ok(a.toLowerCase().includes("red bicycle"));
    assert.ok(a.length <= MAX_ALT_CHARS);
  });

  it("strips 'image of' filler prefix from the description", () => {
    const a = alt(runTool({ imageDescription: "image of a cat sleeping on a sofa" }).values!);
    assert.ok(!/^an?\s+(image|picture|photo)\s+of/i.test(a), `no filler prefix: ${a}`);
    assert.ok(a.toLowerCase().includes("cat sleeping"));
  });

  it("strips 'picture of' filler prefix too", () => {
    const a = alt(runTool({ imageDescription: "Picture of mountains at sunset" }).values!);
    assert.ok(!/^an?\s+(image|picture|photo)\s+of/i.test(a));
  });

  it("long description is compressed to the 500-char cap", () => {
    const long = "a very detailed scene with " + "beautiful flowers, ".repeat(60);
    const r = runTool({ imageDescription: long, keyword: "spring garden" });
    assert.equal(r.ok, true);
    const a = alt(r.values!);
    assert.ok(a.length <= MAX_ALT_CHARS, `capped at 500: ${a.length}`);
    assert.ok(a.length > 100, "still descriptive, not gutted");
  });

  it("description near the cap is left intact when it fits", () => {
    const desc = "x".repeat(490);
    const a = alt(runTool({ imageDescription: desc }).values!);
    assert.ok(a.length <= MAX_ALT_CHARS);
    assert.ok(!a.endsWith("…"), "no truncation marker when it fits");
  });

  it("missing description is an error", () => {
    const r = runTool({ imageDescription: "   ", keyword: "cats" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("describe what you see"));
  });

  it("keyword alone with no description is an error", () => {
    const r = runTool({ keyword: "fall decor" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("keyword alone is not enough"));
  });

  it("keyword over 80 chars is an error", () => {
    const r = runTool({ imageDescription: "a cat", keyword: "x".repeat(81) });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("too long"));
  });

  it("keyword is never stuffed: appears at most once", () => {
    const cases = [
      { imageDescription: "a blue ceramic vase with dried lavender", keyword: "farmhouse decor" },
      { imageDescription: "homemade pizza on a wooden board", keyword: "easy dinner" },
    ];
    for (const c of cases) {
      const a = alt(runTool(c).values!).toLowerCase();
      const kw = (c.keyword as string).toLowerCase();
      const occurrences = a.split(kw).length - 1;
      assert.ok(occurrences <= 1, `keyword used at most once: ${a}`);
    }
  });

  it("determinism: same input twice gives identical output", () => {
    assert.deepEqual(runTool(GOOD), runTool(GOOD));
    assert.deepEqual(
      runTool({ imageDescription: "sunset over the ocean" }),
      runTool({ imageDescription: "sunset over the ocean" }),
    );
  });

  it("different descriptions give different alt text", () => {
    const a = alt(runTool({ imageDescription: "a cat" }).values!);
    const b = alt(runTool({ imageDescription: "a dog" }).values!);
    assert.notEqual(a, b);
  });

  it("bank bounds: no empty or invalid picks across many descriptions", () => {
    const descs = [
      "a cat",
      "two friends laughing at a cafe table with coffee cups",
      "minimalist desk setup with laptop and plant",
      "colorful hot air balloons over a valley at dawn",
    ];
    for (const imageDescription of descs) {
      for (const keyword of ["fall vibes", ""]) {
        const r = runTool({ imageDescription, keyword });
        assert.equal(r.ok, true, imageDescription);
        const a = alt(r.values!);
        assert.ok(a.length >= 5, `non-empty: ${imageDescription}`);
        assert.ok(a.length <= MAX_ALT_CHARS, imageDescription);
        const contentWord = imageDescription.replace(/^(an?\s+)/i, "").split(/\s+/)[0].toLowerCase();
        assert.ok(a.toLowerCase().includes(contentWord), `describes input: ${imageDescription}`);
        assert.ok(!a.includes("{desc}") && !a.includes("{keyword}"), "no raw placeholders");
      }
    }
  });

  it("alt text starts with a capital letter", () => {
    const a = alt(runTool({ imageDescription: "a sleepy puppy" }).values!);
    assert.ok(/^[A-Z]/.test(a), a);
  });
});
