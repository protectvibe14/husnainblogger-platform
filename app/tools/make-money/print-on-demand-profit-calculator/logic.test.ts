/**
 * Tests for the Print-on-Demand Profit Calculator (tool-061).
 *
 * Run: node --test app/tools/make-money/print-on-demand-profit-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the documented formula, never
 * copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  round2,
  round1,
  OUTPUT_IDS,
  DEFAULT_PLATFORM_FEE_RATE_PCT,
  MAX_AMOUNT,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

describe("happy path — full inputs", () => {
  it("sale 25, base 9.50, fee 5%, ship 4.50 -> fee 1.25, profit 9.75, margin 39", () => {
    // fee = 25*0.05 = 1.25; profit = 25-1.25-9.50-4.50 = 9.75; margin = 39.0
    const r = runTool({ salePrice: 25, baseProductCost: 9.5, platformFeeRate: 5, shippingCost: 4.5 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.platformFee, 1.25);
    assert.strictEqual(r.values!.netProfit, 9.75);
    assert.strictEqual(r.values!.margin, 39);
  });

  it("accepts a fractional fee rate", () => {
    // fee = 24.99*0.0325 = 0.812175 -> 0.81; profit = 24.99-0.81-10-3 = 11.18
    const r = runTool({ salePrice: 24.99, baseProductCost: 10, platformFeeRate: 3.25, shippingCost: 3 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.platformFee, 0.81);
    assert.strictEqual(r.values!.netProfit, 11.18);
    assert.strictEqual(r.values!.margin, 44.7);
  });
});

describe("defaults — fee rate and shipping", () => {
  it("uses the documented estimate default when platformFeeRate is omitted", () => {
    // fee = 30*0.05 = 1.50; profit = 30-1.50-12-0 = 16.50; margin = 55.0
    assert.strictEqual(DEFAULT_PLATFORM_FEE_RATE_PCT, 5);
    const r = runTool({ salePrice: 30, baseProductCost: 12 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.platformFee, 1.5);
    assert.strictEqual(r.values!.netProfit, 16.5);
    assert.strictEqual(r.values!.margin, 55);
  });

  it("treats empty-string optional inputs as defaults", () => {
    const r = runTool({ salePrice: 30, baseProductCost: 12, platformFeeRate: "", shippingCost: "" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.netProfit, 16.5);
  });

  it("allows a zero platform fee rate", () => {
    // fee 0; profit = 50-0-10-5 = 35; margin = 70
    const r = runTool({ salePrice: 50, baseProductCost: 10, platformFeeRate: 0, shippingCost: 5 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.platformFee, 0);
    assert.strictEqual(r.values!.netProfit, 35);
    assert.strictEqual(r.values!.margin, 70);
  });

  it("allows a zero base product cost", () => {
    const r = runTool({ salePrice: 20, baseProductCost: 0, platformFeeRate: 0, shippingCost: 0 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.netProfit, 20);
    assert.strictEqual(r.values!.margin, 100);
  });
});

describe("edge cases", () => {
  it("reports negative profit and negative margin honestly when costs exceed price", () => {
    // fee = 20*0.05 = 1; profit = 20-1-25-0 = -6; margin = -30.0
    const r = runTool({ salePrice: 20, baseProductCost: 25, platformFeeRate: 5, shippingCost: 0 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.netProfit, -6);
    assert.strictEqual(r.values!.margin, -30);
  });

  it("coerces numeric strings (URL-state friendly)", () => {
    const r = runTool({ salePrice: "25", baseProductCost: "9.5", platformFeeRate: "5", shippingCost: "4.5" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.netProfit, 9.75);
  });

  it("rejects a sale price above the sanity cap", () => {
    const r = runTool({ salePrice: MAX_AMOUNT * 2, baseProductCost: 1 });
    assert.strictEqual(r.ok, false);
    assert.ok(typeof r.error === "string" && r.error.length > 0);
  });
});

describe("validation errors", () => {
  it("missing salePrice -> error", () => {
    const r = runTool({ baseProductCost: 10 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("sale price"));
  });

  it("salePrice of 0 -> error", () => {
    const r = runTool({ salePrice: 0, baseProductCost: 10 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("greater than 0"));
  });

  it("negative salePrice -> error", () => {
    const r = runTool({ salePrice: -5, baseProductCost: 10 });
    assert.strictEqual(r.ok, false);
  });

  it("NaN salePrice -> error", () => {
    const r = runTool({ salePrice: NaN, baseProductCost: 10 });
    assert.strictEqual(r.ok, false);
  });

  it("Infinity salePrice -> error", () => {
    const r = runTool({ salePrice: Infinity, baseProductCost: 10 });
    assert.strictEqual(r.ok, false);
  });

  it("non-numeric string salePrice -> error", () => {
    const r = runTool({ salePrice: "twenty", baseProductCost: 10 });
    assert.strictEqual(r.ok, false);
  });

  it("missing baseProductCost -> error (never assumed)", () => {
    const r = runTool({ salePrice: 25 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("base product cost"));
  });

  it("negative baseProductCost -> error", () => {
    const r = runTool({ salePrice: 25, baseProductCost: -1 });
    assert.strictEqual(r.ok, false);
  });

  it("negative platformFeeRate -> error", () => {
    const r = runTool({ salePrice: 25, baseProductCost: 10, platformFeeRate: -2 });
    assert.strictEqual(r.ok, false);
  });

  it("negative shippingCost -> error", () => {
    const r = runTool({ salePrice: 25, baseProductCost: 10, shippingCost: -0.5 });
    assert.strictEqual(r.ok, false);
  });

  it("non-object input -> error", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.strictEqual(r.ok, false);
    assert.ok(typeof r.error === "string" && r.error.length > 0);
  });
});

describe("determinism", () => {
  it("run twice with identical inputs -> identical outputs", () => {
    const input = { salePrice: 27.99, baseProductCost: 11.35, platformFeeRate: 6.5, shippingCost: 4.99 };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepStrictEqual(a, b);
    assert.strictEqual(a.ok, true);
  });
});

describe("contract — outputs match meta.ts", () => {
  it("runTool output ids equal the meta.ts output ids", () => {
    const r = runTool({ salePrice: 25, baseProductCost: 9.5 });
    assert.strictEqual(r.ok, true);
    const runIds = Object.keys(r.values!).sort();
    const metaIds = metaOutputs.map((o) => o.id).sort();
    assert.deepStrictEqual(runIds, metaIds);
    assert.deepStrictEqual([...OUTPUT_IDS].sort(), metaIds);
  });

  it("rounding helpers behave half-up", () => {
    // values chosen exactly representable in binary FP (no 2.675-style trap)
    assert.strictEqual(round2(1.125), 1.13);
    assert.strictEqual(round2(2.625), 2.63);
    assert.strictEqual(round1(44.75), 44.8);
  });
});
