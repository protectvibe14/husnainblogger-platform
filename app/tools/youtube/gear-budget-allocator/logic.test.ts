import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, allocateWholeDollars, PRESETS, CATEGORIES, SHOPPING_ORDER } from "./logic.ts";

function amountsFrom(lines: string[]): number[] {
  return lines.map((l) => Number(l.match(/\$([\d,]+)/)![1].replace(/,/g, "")));
}

describe("runTool — happy path", () => {
  it("starter $1000 splits exactly", () => {
    const r = runTool({ totalBudget: 1000, profile: "starter" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.allocations.length, 5);
    assert.deepEqual(amountsFrom(r.values.allocations), [300, 300, 150, 150, 100]);
    assert.ok(r.values.summary.includes("$1,000"));
  });
  it("growth profile applies its preset", () => {
    const r = runTool({ totalBudget: 2000, profile: "growth" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.deepEqual(amountsFrom(r.values.allocations), [700, 500, 300, 300, 200]);
  });
  it("pro profile applies its preset", () => {
    const r = runTool({ totalBudget: 500, profile: "pro" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.deepEqual(amountsFrom(r.values.allocations), [200, 100, 100, 50, 50]);
  });
  it("odd budget still sums exactly (largest remainder)", () => {
    const r = runTool({ totalBudget: 777, profile: "starter" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    const total = amountsFrom(r.values.allocations).reduce((a, b) => a + b, 0);
    assert.equal(total, 777);
  });
  it("accepts numeric string budget", () => {
    const r = runTool({ totalBudget: " 1200 ", profile: "starter" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    const total = amountsFrom(r.values.allocations).reduce((a, b) => a + b, 0);
    assert.equal(total, 1200);
  });
  it("custom profile with valid percentages", () => {
    const r = runTool({ totalBudget: 1000, profile: "custom", customPercents: "40,20,20,10,10" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.deepEqual(amountsFrom(r.values.allocations), [400, 200, 200, 100, 100]);
  });
  it("shopping order is audio-first priority", () => {
    const r = runTool({ totalBudget: 1000, profile: "starter" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.values.shoppingOrder.length, 5);
    assert.match(r.values.shoppingOrder[0], /^1\. Audio/);
    assert.match(r.values.shoppingOrder[4], /^5\. Accessories/);
    assert.ok(r.values.shoppingOrder[0].includes("$300"));
  });
  it("honesty note disclaims product recommendations", () => {
    const r = runTool({ totalBudget: 1000, profile: "starter" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.ok(r.values.honestyNote.includes("No product recommendations") || r.values.honestyNote.includes("no product recommendations"));
  });
});

describe("runTool — validation errors", () => {
  it("budget 0 -> error", () => {
    const r = runTool({ totalBudget: 0, profile: "starter" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /greater than 0/);
  });
  it("negative budget -> error", () => {
    const r = runTool({ totalBudget: -50, profile: "starter" });
    assert.equal(r.ok, false);
  });
  it("NaN budget -> error", () => {
    const r = runTool({ totalBudget: NaN, profile: "starter" });
    assert.equal(r.ok, false);
  });
  it("non-numeric string budget -> error", () => {
    const r = runTool({ totalBudget: "abc", profile: "starter" });
    assert.equal(r.ok, false);
  });
  it("missing profile -> error", () => {
    const r = runTool({ totalBudget: 1000 });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /profile/i);
  });
  it("unknown profile -> error", () => {
    const r = runTool({ totalBudget: 1000, profile: "elite" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /Unknown profile/);
  });
  it("custom without percentages -> error", () => {
    const r = runTool({ totalBudget: 1000, profile: "custom" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /custom percentages/i);
  });
  it("custom with wrong count -> error", () => {
    const r = runTool({ totalBudget: 1000, profile: "custom", customPercents: "50,50" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /exactly 5/);
  });
  it("custom percentages not summing to 100 -> error", () => {
    const r = runTool({ totalBudget: 1000, profile: "custom", customPercents: "40,20,20,10,5" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /add up to 100/);
  });
  it("custom negative percentage -> error", () => {
    const r = runTool({ totalBudget: 1000, profile: "custom", customPercents: "50,50,10,0,-10" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /non-negative/);
  });
});

describe("presets & constants", () => {
  it("every preset sums to 100", () => {
    for (const key of Object.keys(PRESETS) as (keyof typeof PRESETS)[]) {
      const sum = PRESETS[key].reduce((a, b) => a + b, 0);
      assert.equal(sum, 100, `preset ${key}`);
    }
  });
  it("5 categories in fixed order", () => {
    assert.deepEqual(CATEGORIES.map((c) => c.id), ["camera", "audio", "lighting", "editing", "accessories"]);
  });
  it("shopping order covers all categories once", () => {
    const ids = SHOPPING_ORDER.map((s) => s.categoryId).sort();
    assert.deepEqual(ids, ["accessories", "audio", "camera", "editing", "lighting"]);
  });
});

describe("allocateWholeDollars", () => {
  it("sums exactly to budget for fractional splits", () => {
    const amounts = allocateWholeDollars(100, [33.33, 33.33, 33.34]);
    assert.equal(amounts.reduce((a, b) => a + b, 0), 100);
  });
  it("tiny budget distributes whole dollars", () => {
    const amounts = allocateWholeDollars(5, [30, 30, 15, 15, 10]);
    assert.equal(amounts.reduce((a, b) => a + b, 0), 5);
    assert.ok(amounts.every((a) => Number.isInteger(a)));
  });
});

describe("runTool — determinism & output contract", () => {
  it("same input -> identical output (run twice)", () => {
    const v = { totalBudget: 777, profile: "custom", customPercents: "25,25,25,15,10" };
    assert.deepEqual(runTool(v), runTool(v));
  });
  it("values keys match meta outputs", () => {
    const r = runTool({ totalBudget: 1000, profile: "starter" });
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.deepEqual(Object.keys(r.values).sort(), [
      "allocations",
      "honestyNote",
      "shoppingOrder",
      "summary",
    ]);
  });
});
