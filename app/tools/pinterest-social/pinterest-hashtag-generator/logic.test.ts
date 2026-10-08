/**
 * Tests for the Pinterest Hashtag Generator.
 * Run: node --test app/tools/pinterest-social/pinterest-hashtag-generator/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, MAX_COUNT, DEFAULT_COUNT } from "./logic.ts";

const GOOD = { topic: "small balcony garden", count: 10 };

function tags(values: Record<string, unknown>): string[] {
  return values["hashtags"] as string[];
}

function assertValidTag(tag: string) {
  assert.ok(tag.startsWith("#"), `starts with #: ${tag}`);
  assert.ok(!/\s/.test(tag), `no spaces: ${tag}`);
  assert.ok(/^[#a-zA-Z0-9]+$/.test(tag), `alphanumeric only: ${tag}`);
}

describe("pinterest-hashtag-generator", () => {
  it("happy path: returns ok with exactly the meta output ids", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["hashtags", "note"]);
  });

  it("returns the requested count of valid tags", () => {
    const t = tags(runTool(GOOD).values!);
    assert.equal(t.length, 10);
    t.forEach(assertValidTag);
  });

  it("topic-derived tags come first (specific > generic)", () => {
    const t = tags(runTool(GOOD).values!);
    assert.equal(t[0], "#smallBalconyGarden");
    assert.ok(t[1].toLowerCase().includes("smallbalconygarden"), "suffix tags follow");
    assert.equal(new Set(t.map((x) => x.toLowerCase())).size, t.length, "no duplicates");
  });

  it("respects custom counts across the 1-20 range", () => {
    for (const count of [1, 5, 20]) {
      const t = tags(runTool({ topic: "meal prep", count }).values!);
      assert.equal(t.length, count, `count=${count}`);
      t.forEach(assertValidTag);
    }
  });

  it("omitted count defaults to 10", () => {
    const t = tags(runTool({ topic: "candle making" }).values!);
    assert.equal(t.length, DEFAULT_COUNT);
  });

  it("topic words are camelCased and cleaned", () => {
    const t = tags(runTool({ topic: "  DIY: Wedding-Decor!! ", count: 3 }).values!);
    assert.equal(t[0], "#diyWeddingDecor");
    t.forEach(assertValidTag);
  });

  it("note always carries the honest no-live-data label", () => {
    const note = runTool(GOOD).values!.note as string;
    assert.ok(note.includes("Curated suggestions, not live trend data"));
    assert.ok(note.includes("2–5"));
  });

  it("overly generic single-word topic gets a steering note", () => {
    const r = runTool({ topic: "food", count: 5 });
    assert.equal(r.ok, true);
    const note = r.values!.note as string;
    assert.ok(note.includes("very broad topic"), "steering note present");
    assert.ok(note.includes("food for small apartments") || note.includes("narrowing it"));
  });

  it("specific topic gets no steering note", () => {
    const note = runTool(GOOD).values!.note as string;
    assert.ok(!note.includes("very broad topic"));
  });

  it("missing topic is an error", () => {
    const r = runTool({ topic: "   " });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).length > 0);
  });

  it("topic with no letters or numbers is an error", () => {
    const r = runTool({ topic: "!!! ???" });
    assert.equal(r.ok, false);
  });

  it("topic over the length limit is an error", () => {
    const r = runTool({ topic: "x".repeat(81) });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("too long"));
  });

  it("count of 0 is an error", () => {
    const r = runTool({ topic: "pottery", count: 0 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("between 1 and 20"));
  });

  it("count above 20 is an error", () => {
    const r = runTool({ topic: "pottery", count: 21 });
    assert.equal(r.ok, false);
  });

  it("non-integer count is an error", () => {
    const r = runTool({ topic: "pottery", count: 2.5 });
    assert.equal(r.ok, false);
  });

  it("determinism: same input twice gives identical output", () => {
    assert.deepEqual(runTool(GOOD), runTool(GOOD));
    assert.deepEqual(
      runTool({ topic: "fall tablescape", count: 15 }),
      runTool({ topic: "fall tablescape", count: 15 }),
    );
  });

  it("different topics produce different tag lists", () => {
    const a = JSON.stringify(tags(runTool({ topic: "gardening", count: 10 }).values!));
    const b = JSON.stringify(tags(runTool({ topic: "baking", count: 10 }).values!));
    assert.notEqual(a, b);
  });

  it("bank bounds: no empty or invalid picks across many topics", () => {
    const topics = ["a", "knitting", "tiny house living", "keto", "wedding", "123 go"];
    for (const topic of topics) {
      const r = runTool({ topic, count: MAX_COUNT });
      assert.equal(r.ok, true, topic);
      const t = tags(r.values!);
      assert.equal(t.length, MAX_COUNT, topic);
      t.forEach(assertValidTag);
    }
  });
});
