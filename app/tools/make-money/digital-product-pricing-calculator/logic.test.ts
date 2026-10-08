/**
 * Tests for Digital Product Pricing Calculator logic (tool-090).
 * Zero dependencies: node:test + node:assert only.
 * Run from the husnainblogger-platform root:
 *   node --test app/tools/make-money/digital-product-pricing-calculator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, calculatePricing } from "./logic.ts";
import { outputs } from "./meta.ts";

describe("digital-product-pricing-calculator", () => {
  it("happy path: $5 cost, 40% margin, 10% fee, 100 units", () => {
    const r = runTool({
      productionCost: 5,
      desiredMargin: 40,
      platformFeeRate: 10,
      unitsPerMonth: 100,
    });
    assert.equal(r.ok, true);
    // price = 5 / (0.9 * 0.6) = 9.259... -> 9.26
    assert.equal(r.values!.suggestedPrice, 9.26);
    // profit = 9.26 * 0.9 - 5 = 3.334 -> 3.33
    assert.equal(r.values!.profitPerUnit, 3.33);
    assert.equal(r.values!.monthlyProfit, 333);
  });

  it("edge: platform fee reduces effective margin (fee solved, not added)", () => {
    const r = runTool({
      productionCost: 10,
      desiredMargin: 50,
      platformFeeRate: 20,
      unitsPerMonth: 50,
    });
    assert.equal(r.ok, true);
    // naive cost+margin would be $15; solved price = 10 / (0.8 * 0.5) = 25
    assert.equal(r.values!.suggestedPrice, 25);
    // take-home = 25 * 0.8 - 10 = 10 -> margin on take-home = 10/20 = 50%
    assert.equal(r.values!.profitPerUnit, 10);
    assert.equal(r.values!.monthlyProfit, 500);
  });

  it("edge: zero platform fee -> pure cost-plus-margin", () => {
    const r = runTool({
      productionCost: 8,
      desiredMargin: 25,
      platformFeeRate: 0,
      unitsPerMonth: 10,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.suggestedPrice, 10.67); // 8 / 0.75 = 10.666...
    assert.equal(r.values!.profitPerUnit, 2.67); // 10.67 - 8
    assert.equal(r.values!.monthlyProfit, 26.7);
  });

  it("edge: zero margin -> price covers cost and fee only", () => {
    const r = runTool({
      productionCost: 12,
      desiredMargin: 0,
      platformFeeRate: 10,
      unitsPerMonth: 5,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.suggestedPrice, 13.33); // 12 / 0.9
    assert.equal(r.values!.profitPerUnit, 0); // 13.33*0.9 - 12 = -0.003 -> 0 (rounded)
    assert.equal(r.values!.monthlyProfit, 0);
  });

  it("edge: zero production cost -> $0 price and $0 profit", () => {
    const r = runTool({
      productionCost: 0,
      desiredMargin: 60,
      platformFeeRate: 5,
      unitsPerMonth: 200,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.suggestedPrice, 0);
    assert.equal(r.values!.profitPerUnit, 0);
    assert.equal(r.values!.monthlyProfit, 0);
  });

  it("rounding: fractional cents round half-up", () => {
    const r = runTool({
      productionCost: 1,
      desiredMargin: 33,
      platformFeeRate: 7,
      unitsPerMonth: 3,
    });
    assert.equal(r.ok, true);
    // keep = 0.93 * 0.67 = 0.6231; price = 1.60475... -> 1.60
    assert.equal(r.values!.suggestedPrice, 1.6);
    assert.equal(r.values!.profitPerUnit, 0.49); // 1.60*0.93 - 1 = 0.488 -> 0.49
    assert.equal(r.values!.monthlyProfit, 1.47);
  });

  it("validation: 100% margin is rejected (unsolvable)", () => {
    const r = runTool({
      productionCost: 5,
      desiredMargin: 100,
      platformFeeRate: 10,
      unitsPerMonth: 10,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /unsolvable/);
  });

  it("validation: 100% platform fee is rejected", () => {
    const r = runTool({
      productionCost: 5,
      desiredMargin: 40,
      platformFeeRate: 100,
      unitsPerMonth: 10,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /below 100%/);
  });

  it("validation: platform fee above 100% is rejected", () => {
    const r = runTool({
      productionCost: 5,
      desiredMargin: 40,
      platformFeeRate: 150,
      unitsPerMonth: 10,
    });
    assert.equal(r.ok, false);
  });

  it("validation: negative platform fee fails", () => {
    const r = runTool({
      productionCost: 5,
      desiredMargin: 40,
      platformFeeRate: -2,
      unitsPerMonth: 10,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /0 or more/);
  });

  it("validation: margin above 100 fails", () => {
    const r = runTool({
      productionCost: 5,
      desiredMargin: 101,
      platformFeeRate: 10,
      unitsPerMonth: 10,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 0 and 100/);
  });

  it("validation: negative margin fails", () => {
    const r = runTool({
      productionCost: 5,
      desiredMargin: -10,
      platformFeeRate: 10,
      unitsPerMonth: 10,
    });
    assert.equal(r.ok, false);
  });

  it("validation: negative cost fails", () => {
    const r = runTool({
      productionCost: -1,
      desiredMargin: 40,
      platformFeeRate: 10,
      unitsPerMonth: 10,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /0 or more/);
  });

  it("validation: units = 0 fails", () => {
    const r = runTool({
      productionCost: 5,
      desiredMargin: 40,
      platformFeeRate: 10,
      unitsPerMonth: 0,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than 0/);
  });

  it("validation: fractional units fails", () => {
    const r = runTool({
      productionCost: 5,
      desiredMargin: 40,
      platformFeeRate: 10,
      unitsPerMonth: 2.5,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("validation: missing cost fails", () => {
    const r = runTool({
      desiredMargin: 40,
      platformFeeRate: 10,
      unitsPerMonth: 10,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /number/);
  });

  it("validation: non-numeric margin fails", () => {
    const r = runTool({
      productionCost: 5,
      desiredMargin: "high",
      platformFeeRate: 10,
      unitsPerMonth: 10,
    });
    assert.equal(r.ok, false);
  });

  it("validation: non-object input fails gracefully", () => {
    const r = runTool(undefined as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("accepts numeric strings for numeric inputs", () => {
    const r = runTool({
      productionCost: "5",
      desiredMargin: "40",
      platformFeeRate: "10",
      unitsPerMonth: "100",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.suggestedPrice, 9.26);
  });

  it("determinism: same inputs -> identical outputs", () => {
    const v = {
      productionCost: 7.5,
      desiredMargin: 55,
      platformFeeRate: 12,
      unitsPerMonth: 80,
    };
    assert.deepEqual(runTool(v), runTool(v));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({
      productionCost: 5,
      desiredMargin: 40,
      platformFeeRate: 10,
      unitsPerMonth: 100,
    });
    assert.equal(r.ok, true);
    const metaIds = outputs.map((o) => o.id).sort();
    const valueIds = Object.keys(r.values!).sort();
    assert.deepEqual(valueIds, metaIds);
  });

  it("calculatePricing throws a human error on bad input", () => {
    assert.throws(
      () =>
        calculatePricing({
          productionCost: 5,
          desiredMargin: 40,
          platformFeeRate: 10,
          unitsPerMonth: 0,
        }),
      /greater than 0/,
    );
  });
});
