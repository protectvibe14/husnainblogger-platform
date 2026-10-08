/**
 * Tests for Substack Revenue Calculator logic (tool-087).
 * Zero dependencies: node:test + node:assert only.
 * Run from the husnainblogger-platform root:
 *   node --test app/tools/make-money/substack-revenue-calculator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  calculateSubstackRevenue,
  SUBSTACK_PLATFORM_FEE_RATE,
  STRIPE_RATE,
  STRIPE_FIXED_PER_TXN,
} from "./logic.ts";
import { outputs } from "./meta.ts";

describe("substack-revenue-calculator", () => {
  it("happy path: 500 subscribers x $10/month", () => {
    const r = runTool({ paidSubscribers: 500, monthlyPrice: 10 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossRevenue, 5000);
    assert.equal(r.values!.substackFee, 500); // 10% of gross
    assert.equal(r.values!.stripeFees, 295); // 500 * (10*0.029 + 0.30)
    assert.equal(r.values!.netRevenue, 4205);
  });

  it("fees are stacked, not compounded", () => {
    const r = runTool({ paidSubscribers: 100, monthlyPrice: 8 });
    assert.equal(r.ok, true);
    // substackFee on gross: 800 * 0.10 = 80; stripe on gross too: 100*(0.232+0.30)=53.20
    assert.equal(r.values!.substackFee, 80);
    assert.equal(r.values!.stripeFees, 53.2);
    assert.equal(r.values!.netRevenue, 666.8);
  });

  it("small price: stripe fixed fee dominates honestly", () => {
    const r = runTool({ paidSubscribers: 10, monthlyPrice: 1 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossRevenue, 10);
    assert.equal(r.values!.substackFee, 1);
    assert.equal(r.values!.stripeFees, 3.29); // 10 * (0.029 + 0.30)
    assert.equal(r.values!.netRevenue, 5.71);
  });

  it("rounding: fractional cents round half-up", () => {
    const r = runTool({ paidSubscribers: 3, monthlyPrice: 9.99 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossRevenue, 29.97);
    assert.equal(r.values!.substackFee, 3); // 2.997 -> 3.00
    assert.equal(r.values!.stripeFees, 1.77); // 1.76913 -> 1.77
    assert.equal(r.values!.netRevenue, 25.2); // 29.97 - 3.00 - 1.77
  });

  it("single subscriber works", () => {
    const r = runTool({ paidSubscribers: 1, monthlyPrice: 5 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossRevenue, 5);
    assert.equal(r.values!.substackFee, 0.5);
    assert.equal(r.values!.stripeFees, 0.45); // 5*0.029 + 0.30 = 0.445 -> 0.45
    assert.equal(r.values!.netRevenue, 4.05);
  });

  it("validation: missing paidSubscribers fails", () => {
    const r = runTool({ monthlyPrice: 10 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /subscribers/i);
  });

  it("validation: paidSubscribers = 0 fails", () => {
    const r = runTool({ paidSubscribers: 0, monthlyPrice: 10 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than 0/);
  });

  it("validation: fractional subscribers fails", () => {
    const r = runTool({ paidSubscribers: 10.5, monthlyPrice: 10 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("validation: negative subscribers fails", () => {
    const r = runTool({ paidSubscribers: -5, monthlyPrice: 10 });
    assert.equal(r.ok, false);
    assert.equal(r.values, undefined);
  });

  it("validation: missing monthlyPrice fails", () => {
    const r = runTool({ paidSubscribers: 100 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /price/i);
  });

  it("validation: monthlyPrice = 0 fails", () => {
    const r = runTool({ paidSubscribers: 100, monthlyPrice: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than 0/);
  });

  it("validation: negative monthlyPrice fails", () => {
    const r = runTool({ paidSubscribers: 100, monthlyPrice: -3 });
    assert.equal(r.ok, false);
  });

  it("validation: non-numeric price fails", () => {
    const r = runTool({ paidSubscribers: 100, monthlyPrice: "free" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /number/);
  });

  it("validation: non-object input fails gracefully", () => {
    const r = runTool(undefined as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("accepts numeric strings for numeric inputs", () => {
    const r = runTool({ paidSubscribers: "500", monthlyPrice: "10" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.netRevenue, 4205);
  });

  it("large input stays finite", () => {
    const r = runTool({ paidSubscribers: 200000, monthlyPrice: 15 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.grossRevenue, 3000000);
    assert.ok(Number.isFinite(r.values!.netRevenue as number));
  });

  it("determinism: same inputs -> identical outputs", () => {
    const a = runTool({ paidSubscribers: 777, monthlyPrice: 12.5 });
    const b = runTool({ paidSubscribers: 777, monthlyPrice: 12.5 });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ paidSubscribers: 10, monthlyPrice: 5 });
    assert.equal(r.ok, true);
    const metaIds = outputs.map((o) => o.id).sort();
    const valueIds = Object.keys(r.values!).sort();
    assert.deepEqual(valueIds, metaIds);
  });

  it("fee constants match the spec schedule", () => {
    assert.equal(SUBSTACK_PLATFORM_FEE_RATE, 0.1);
    assert.equal(STRIPE_RATE, 0.029);
    assert.equal(STRIPE_FIXED_PER_TXN, 0.3);
  });

  it("calculateSubstackRevenue throws a human error on bad input", () => {
    assert.throws(
      () => calculateSubstackRevenue({ paidSubscribers: 100, monthlyPrice: 0 }),
      /greater than 0 USD/,
    );
  });
});
