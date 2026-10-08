/**
 * Tests for the Pinterest Keyword Combiner.
 * Run: node --test app/tools/pinterest-social/pinterest-keyword-combiner/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, DEFAULT_MODIFIERS, DEFAULT_MAX_COMBOS, MAX_ALLOWED_COMBOS } from "./logic.ts";

const GOOD = { seedKeywords: "cozy bedroom\nsmall apartment", modifiers: "best\nideas" };

function combos(values: Record<string, unknown>): string[] {
  return values["keywordCombos"] as string[];
}

describe("pinterest-keyword-combiner", () => {
  it("happy path: returns ok with exactly the meta output ids", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["keywordCombos", "note"]);
  });

  it("builds modifier+seed and seed+modifier combos", () => {
    const c = combos(runTool(GOOD).values!);
    assert.ok(c.includes("best cozy bedroom"));
    assert.ok(c.includes("ideas small apartment"));
    assert.ok(c.includes("cozy bedroom best"));
    assert.ok(c.includes("small apartment ideas"));
  });

  it("builds seed+seed pairs", () => {
    const c = combos(runTool(GOOD).values!);
    assert.ok(c.includes("cozy bedroom small apartment"));
    assert.ok(c.includes("small apartment cozy bedroom"));
  });

  it("defaults to the five built-in modifiers when modifiers omitted", () => {
    const c = combos(runTool({ seedKeywords: "fall decor" }).values!);
    for (const m of DEFAULT_MODIFIERS) {
      assert.ok(c.includes(`${m} fall decor`), `has "${m} fall decor"`);
    }
  });

  it("defaults maxCombos to 50 and caps output", () => {
    const seeds = Array.from({ length: 10 }, (_, i) => `seed${i}`).join("\n");
    const r = runTool({ seedKeywords: seeds });
    assert.equal(r.ok, true);
    assert.equal(combos(r.values!).length, DEFAULT_MAX_COMBOS);
  });

  it("respects a custom maxCombos", () => {
    const c = combos(runTool({ seedKeywords: "a\nb", maxCombos: 3 }).values!);
    assert.equal(c.length, 3);
  });

  it("deduplicates after normalization (case + spacing)", () => {
    const c = combos(
      runTool({ seedKeywords: "Cozy  Bedroom\ncozy bedroom", modifiers: "Best\nbest" }).values!,
    );
    const lowered = c.map((x) => x.toLowerCase());
    assert.deepEqual(c, lowered, "all combos normalized to lowercase");
    assert.equal(new Set(lowered).size, lowered.length, "no duplicates");
  });

  it("modifier overlapping a seed dedupes cleanly", () => {
    const c = combos(runTool({ seedKeywords: "easy dinner", modifiers: "easy" }).values!);
    assert.equal(new Set(c).size, c.length);
    assert.ok(c.includes("easy easy dinner") || c.includes("easy dinner"));
  });

  it("single seed still produces combos from modifiers", () => {
    const c = combos(runTool({ seedKeywords: "wedding", modifiers: "ideas\ntips" }).values!);
    assert.ok(c.length > 0);
    assert.ok(c.every((x) => x.includes("wedding")));
  });

  it("comma-separated seeds on one line are split", () => {
    const c = combos(runTool({ seedKeywords: "red, blue", modifiers: "ideas" }).values!);
    assert.ok(c.includes("ideas red"));
    assert.ok(c.includes("ideas blue"));
  });

  it("empty seeds is an error", () => {
    const r = runTool({ seedKeywords: "   " });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("at least one seed keyword"));
  });

  it("missing seedKeywords is an error", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });

  it("more than 10 seeds is an error", () => {
    const seeds = Array.from({ length: 11 }, (_, i) => `seed${i}`).join("\n");
    const r = runTool({ seedKeywords: seeds });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("at most 10"));
  });

  it("maxCombos of 0 is an error", () => {
    const r = runTool({ seedKeywords: "a", maxCombos: 0 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("at least 1"));
  });

  it("maxCombos over the hard cap is an error", () => {
    const r = runTool({ seedKeywords: "a", maxCombos: MAX_ALLOWED_COMBOS + 1 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("too large"));
  });

  it("determinism: same input twice gives identical output", () => {
    assert.deepEqual(runTool(GOOD), runTool(GOOD));
    assert.deepEqual(
      runTool({ seedKeywords: "x\ny\nz" }),
      runTool({ seedKeywords: "x\ny\nz" }),
    );
  });

  it("note honestly frames combos as idea seeds without volume data", () => {
    const note = runTool(GOOD).values!.note as string;
    assert.ok(note.includes("idea seeds"));
    assert.ok(note.includes("no search volume"));
  });

  it("array input is also accepted", () => {
    const r = runTool({ seedKeywords: ["rustic kitchen", "farmhouse sink"], modifiers: "best" });
    assert.equal(r.ok, true);
    assert.ok(combos(r.values!).includes("best rustic kitchen"));
  });
});
