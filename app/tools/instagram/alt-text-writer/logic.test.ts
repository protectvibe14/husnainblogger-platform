import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = {
  imageDescription: "Sunset over the beach with a surfer walking out of the water.",
  subject: "a surfer",
  count: 3,
};

describe("alt-text-writer (tool-217)", () => {
  it("happy path: returns count alt texts + tips", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const texts = r.values?.altTexts as string[];
    assert.equal(texts.length, 3);
    assert.ok(Array.isArray(r.values?.accessibilityTips));
    assert.ok((r.values?.accessibilityTips as string[]).length >= 5);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const ids = Object.keys(r.values ?? {}).sort();
    assert.deepEqual(ids, ["accessibilityTips", "altTexts"]);
  });

  it("every alt text is within the 125-char recommendation", () => {
    const r = runTool({ ...base, imageDescription: "A ".repeat(200) + "mountain.", count: 5 });
    assert.equal(r.ok, true);
    for (const t of r.values?.altTexts as string[]) {
      assert.ok(t.length <= 125, `too long (${t.length}): ${t}`);
    }
  });

  it("long input triggers the truncation note in tips", () => {
    const r = runTool({ ...base, imageDescription: "A very long description ".repeat(10) });
    assert.equal(r.ok, true);
    const tips = r.values?.accessibilityTips as string[];
    assert.ok(tips[0].includes("125-character"));
  });

  it("short input: no truncation note", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const tips = r.values?.accessibilityTips as string[];
    assert.ok(!tips[0].includes("trimmed"));
  });

  it("missing imageDescription: honest error", () => {
    const r = runTool({ subject: "a surfer", count: 2 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("Describe the photo"));
    assert.ok(String(r.error).includes("cannot see or analyze images"));
  });

  it("blank imageDescription: error", () => {
    const r = runTool({ imageDescription: "   " });
    assert.equal(r.ok, false);
  });

  it("subject optional: works without subject", () => {
    const r = runTool({ imageDescription: "A dog running in a park." });
    assert.equal(r.ok, true);
    const texts = r.values?.altTexts as string[];
    assert.equal(texts.length, 3);
    assert.ok(texts.every((t) => t.length > 10));
  });

  it("count defaults to 3 when omitted", () => {
    const r = runTool({ imageDescription: "A dog running in a park." });
    assert.equal(r.values?.altTexts && (r.values.altTexts as string[]).length, 3);
  });

  it("count=1 returns one option", () => {
    const r = runTool({ ...base, count: 1 });
    assert.equal(r.ok, true);
    assert.equal((r.values?.altTexts as string[]).length, 1);
  });

  it("count=5 returns five options", () => {
    const r = runTool({ ...base, count: 5 });
    assert.equal(r.ok, true);
    assert.equal((r.values?.altTexts as string[]).length, 5);
  });

  it("count=0 rejected", () => {
    const r = runTool({ ...base, count: 0 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("1 and 5"));
  });

  it("count=6 rejected", () => {
    const r = runTool({ ...base, count: 6 });
    assert.equal(r.ok, false);
  });

  it("count as numeric string accepted", () => {
    const r = runTool({ ...base, count: "2" });
    assert.equal(r.ok, true);
    assert.equal((r.values?.altTexts as string[]).length, 2);
  });

  it("count non-numeric rejected", () => {
    const r = runTool({ ...base, count: "many" });
    assert.equal(r.ok, false);
  });

  it("determinism: same inputs -> identical outputs", () => {
    const a = runTool(base);
    const b = runTool(base);
    assert.deepEqual(a, b);
  });

  it("options differ across count (template rotation, not duplicates)", () => {
    const r = runTool({ ...base, count: 5 });
    const texts = r.values?.altTexts as string[];
    assert.equal(new Set(texts).size, 5);
  });

  it("subject is slotted into the alt text", () => {
    const r = runTool({ ...base, count: 3 });
    const texts = r.values?.altTexts as string[];
    assert.ok(texts.some((t) => t.includes("a surfer")));
  });
});
