/**
 * Tests for the Shopify Fee Calculator (tool-062).
 *
 * Run: node --test app/tools/make-money/shopify-fee-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the fixed estimate table in
 * logic.ts, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, PLAN_TABLE, PLAN_IDS, OUTPUT_IDS, MAX_VALUE } from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

describe("happy path — Shopify Payments", () => {
  it("basic plan: 100 orders x $50 -> processing 175, total 214, rate 4.28%", () => {
    // processing = 100*(50*0.029+0.30) = 175; sub 39; total 214; rate 214/5000*100 = 4.28
    const r = runTool({ orderValue: 50, ordersPerMonth: 100, plan: "basic", useShopifyPayments: true });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.processingFees, 175);
    assert.strictEqual(r.values!.gatewaySurcharge, 0);
    assert.strictEqual(r.values!.monthlySubscription, 39);
    assert.strictEqual(r.values!.totalMonthlyCost, 214);
    assert.strictEqual(r.values!.effectiveRate, 4.28);
  });

  it("advanced plan rates apply per the estimate table", () => {
    // processing = 10*(200*0.025+0.30) = 53; sub 399; total 452; rate 452/2000*100 = 22.6
    const r = runTool({ orderValue: 200, ordersPerMonth: 10, plan: "advanced", useShopifyPayments: true });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.processingFees, 53);
    assert.strictEqual(r.values!.monthlySubscription, 399);
    assert.strictEqual(r.values!.totalMonthlyCost, 452);
    assert.strictEqual(r.values!.effectiveRate, 22.6);
  });

  it("plus plan estimate: 50 orders x $200 -> processing 235, total 2535", () => {
    // processing = 50*(200*0.022+0.30) = 235; sub 2300; total 2535; rate 25.35
    const r = runTool({ orderValue: 200, ordersPerMonth: 50, plan: "plus" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.processingFees, 235);
    assert.strictEqual(r.values!.monthlySubscription, 2300);
    assert.strictEqual(r.values!.totalMonthlyCost, 2535);
    assert.strictEqual(r.values!.effectiveRate, 25.35);
  });
});

describe("third-party gateway stacking", () => {
  it("stacks Shopify surcharge on top of the gateway's own fee", () => {
    // grow: processing = 100*(50*0.027+0.30) = 165
    // gateway = 100*50*(0.01+0.025) = 175; sub 105; total 445; rate 8.9
    const r = runTool({
      orderValue: 50,
      ordersPerMonth: 100,
      plan: "grow",
      useShopifyPayments: false,
      gatewayRate: 2.5,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.processingFees, 165);
    assert.strictEqual(r.values!.gatewaySurcharge, 175);
    assert.strictEqual(r.values!.monthlySubscription, 105);
    assert.strictEqual(r.values!.totalMonthlyCost, 445);
    assert.strictEqual(r.values!.effectiveRate, 8.9);
  });

  it("plus has no additional third-party surcharge — only the gateway's own fee", () => {
    // gateway = 10*100*(0+0.02) = 20; processing = 10*(100*0.022+0.30) = 25
    const r = runTool({
      orderValue: 100,
      ordersPerMonth: 10,
      plan: "plus",
      useShopifyPayments: false,
      gatewayRate: 2,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.gatewaySurcharge, 20);
    assert.strictEqual(r.values!.processingFees, 25);
  });

  it("gatewayRate is required when not using Shopify Payments", () => {
    const r = runTool({ orderValue: 50, ordersPerMonth: 10, plan: "basic", useShopifyPayments: false });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("gateway"));
  });

  it("gatewayRate defaults to 0 when Shopify Payments is used", () => {
    const r = runTool({ orderValue: 50, ordersPerMonth: 10, plan: "basic", useShopifyPayments: true });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.gatewaySurcharge, 0);
  });
});

describe("edge cases", () => {
  it("zero orders -> subscription cost still shown, effective rate 0", () => {
    const r = runTool({ orderValue: 50, ordersPerMonth: 0, plan: "basic", useShopifyPayments: true });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.processingFees, 0);
    assert.strictEqual(r.values!.gatewaySurcharge, 0);
    assert.strictEqual(r.values!.monthlySubscription, 39);
    assert.strictEqual(r.values!.totalMonthlyCost, 39);
    assert.strictEqual(r.values!.effectiveRate, 0);
  });

  it("plan ids are case-insensitive", () => {
    const r = runTool({ orderValue: 50, ordersPerMonth: 10, plan: "Basic" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.monthlySubscription, 39);
  });

  it("plan table holds exactly the four documented estimate plans", () => {
    assert.deepStrictEqual([...PLAN_IDS].sort(), ["advanced", "basic", "grow", "plus"]);
    assert.deepStrictEqual(Object.keys(PLAN_TABLE).sort(), ["advanced", "basic", "grow", "plus"]);
  });

  it("rejects an order value above the sanity cap", () => {
    const r = runTool({ orderValue: MAX_VALUE * 10, ordersPerMonth: 1, plan: "basic" });
    assert.strictEqual(r.ok, false);
  });
});

describe("validation errors", () => {
  it("missing orderValue -> error", () => {
    const r = runTool({ ordersPerMonth: 10, plan: "basic" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("order value"));
  });

  it("orderValue of 0 -> error", () => {
    const r = runTool({ orderValue: 0, ordersPerMonth: 10, plan: "basic" });
    assert.strictEqual(r.ok, false);
  });

  it("negative orderValue -> error", () => {
    const r = runTool({ orderValue: -10, ordersPerMonth: 10, plan: "basic" });
    assert.strictEqual(r.ok, false);
  });

  it("NaN orderValue -> error", () => {
    const r = runTool({ orderValue: NaN, ordersPerMonth: 10, plan: "basic" });
    assert.strictEqual(r.ok, false);
  });

  it("missing plan -> error", () => {
    const r = runTool({ orderValue: 50, ordersPerMonth: 10 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("plan"));
  });

  it("unknown plan -> error", () => {
    const r = runTool({ orderValue: 50, ordersPerMonth: 10, plan: "starter" });
    assert.strictEqual(r.ok, false);
  });

  it("fractional ordersPerMonth -> error", () => {
    const r = runTool({ orderValue: 50, ordersPerMonth: 2.5, plan: "basic" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("whole number"));
  });

  it("negative ordersPerMonth -> error", () => {
    const r = runTool({ orderValue: 50, ordersPerMonth: -1, plan: "basic" });
    assert.strictEqual(r.ok, false);
  });

  it("negative gatewayRate -> error", () => {
    const r = runTool({
      orderValue: 50,
      ordersPerMonth: 10,
      plan: "basic",
      useShopifyPayments: false,
      gatewayRate: -1,
    });
    assert.strictEqual(r.ok, false);
  });
});

describe("determinism", () => {
  it("run twice with identical inputs -> identical outputs", () => {
    const input = {
      orderValue: 79.99,
      ordersPerMonth: 37,
      plan: "grow",
      useShopifyPayments: false,
      gatewayRate: 1.8,
    };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepStrictEqual(a, b);
    assert.strictEqual(a.ok, true);
  });
});

describe("contract — outputs match meta.ts", () => {
  it("runTool output ids equal the meta.ts output ids", () => {
    const r = runTool({ orderValue: 50, ordersPerMonth: 100, plan: "basic", useShopifyPayments: true });
    assert.strictEqual(r.ok, true);
    const runIds = Object.keys(r.values!).sort();
    const metaIds = metaOutputs.map((o) => o.id).sort();
    assert.deepStrictEqual(runIds, metaIds);
    assert.deepStrictEqual([...OUTPUT_IDS].sort(), metaIds);
  });
});
