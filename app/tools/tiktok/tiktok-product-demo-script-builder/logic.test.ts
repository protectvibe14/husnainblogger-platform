import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_IDS = ["script", "beats"];

function okResult(items: Record<string, unknown>[]) {
  const r = runTool({ items });
  assert.equal(r.ok, true, `expected ok, got error: ${"error" in r ? r.error : ""}`);
  return (r as { ok: true; values: { script: string; beats: string[] } }).values;
}

const serum = {
  productName: "Aurora Vitamin C Serum",
  keyFeatures: "20% vitamin C, fragrance-free, glass dropper",
};

describe("tiktok-product-demo-script-builder", () => {
  it("happy path: script + beats with one beat per feature", () => {
    const v = okResult([serum]);
    assert.ok(v.script.includes("Aurora Vitamin C Serum"));
    assert.ok(v.script.includes("HOOK:"));
    assert.ok(v.script.includes("PROOF MOMENT:"));
    assert.ok(v.script.includes("CTA:"));
    assert.ok(v.script.includes("SHOP CTA:"));
    // 3 features -> 3 BEAT lines
    const beatLines = v.beats.filter((b) => b.startsWith("BEAT "));
    assert.equal(beatLines.length, 3);
    assert.ok(beatLines[0].includes("20% vitamin C"));
  });

  it("beats output id matches script sections", () => {
    const v = okResult([serum]);
    assert.ok(v.beats.length > 0);
    assert.ok(v.script.includes(v.beats[0]));
  });

  it("sponsored demo inserts the #ad disclosure line", () => {
    const v = okResult([{ ...serum, isSponsored: "yes" }]);
    assert.ok(v.script.includes("#ad"));
    assert.ok(v.beats.some((b) => b.includes("#ad")));
  });

  it("sponsored flag variants: affiliate / Sponsored / paid", () => {
    for (const flag of ["affiliate", "Sponsored", "paid", "TRUE"]) {
      const v = okResult([{ ...serum, isSponsored: flag }]);
      assert.ok(v.script.includes("#ad"), `flag ${flag} should disclose`);
    }
  });

  it("non-sponsored demo has no disclosure line", () => {
    const v = okResult([serum]);
    assert.ok(!v.script.includes("#ad"));
    const v2 = okResult([{ ...serum, isSponsored: "no" }]);
    assert.ok(!v2.script.includes("#ad"));
  });

  it("multiple items are joined with a separator", () => {
    const v = okResult([serum, { productName: "Glow Mug", keyFeatures: "keeps drinks hot" }]);
    assert.ok(v.script.includes("Aurora Vitamin C Serum"));
    assert.ok(v.script.includes("Glow Mug"));
    assert.ok(v.script.includes("---"));
    const hooks = v.beats.filter((b) => b.startsWith("HOOK:"));
    assert.equal(hooks.length, 2);
  });

  it("max 5 features: 5 works, 6 errors", () => {
    const five = { productName: "P", keyFeatures: "a, b, c, d, e" };
    assert.equal(okResult([five]).beats.filter((b) => b.startsWith("BEAT ")).length, 5);
    const six = runTool({ items: [{ productName: "P", keyFeatures: "a, b, c, d, e, f" }] });
    assert.equal(six.ok, false);
    assert.match((six as { error: string }).error, /Item 1:.*max 5/i);
  });

  it("missing productName errors with item index", () => {
    const r = runTool({ items: [{ keyFeatures: "a" }] });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /Item 1:.*productName/);
  });

  it("blank productName errors", () => {
    assert.equal(runTool({ items: [{ productName: "  ", keyFeatures: "a" }] }).ok, false);
  });

  it("missing keyFeatures errors", () => {
    const r = runTool({ items: [{ productName: "P" }] });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /Item 1:.*feature/);
  });

  it("blank/whitespace-only keyFeatures errors", () => {
    assert.equal(runTool({ items: [{ productName: "P", keyFeatures: " , ," }] }).ok, false);
  });

  it("error in second item names Item 2", () => {
    const r = runTool({ items: [serum, { productName: "", keyFeatures: "a" }] });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /Item 2/);
  });

  it("empty items array errors", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /at least one product/i);
  });

  it("non-array items errors", () => {
    const r = runTool({ items: "nope" } as unknown as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
  });

  it("long productName (>150 chars) errors", () => {
    const r = runTool({ items: [{ productName: "x".repeat(151), keyFeatures: "a" }] });
    assert.equal(r.ok, false);
  });

  it("deterministic: same items -> identical script", () => {
    const a = okResult([{ ...serum, isSponsored: "yes" }]);
    const b = okResult([{ ...serum, isSponsored: "yes" }]);
    assert.deepEqual(a, b);
  });

  it("different products -> different hooks", () => {
    const a = okResult([{ productName: "Alpha Gadget", keyFeatures: "fast" }]);
    const b = okResult([{ productName: "Beta Widget", keyFeatures: "fast" }]);
    assert.notEqual(a.beats[0], b.beats[0]);
  });

  it("word-bank bounds: no empty lines, no {product} leftovers", () => {
    const v = okResult([{ ...serum, isSponsored: "yes" }]);
    assert.ok(!v.script.includes("{product}"));
    for (const b of v.beats) assert.ok(b.length > 10);
  });

  it("output ids match meta.ts outputs", () => {
    assert.deepEqual(outputs.map((o) => o.id).sort(), EXPECTED_IDS.sort());
  });
});
