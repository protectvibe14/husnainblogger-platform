/**
 * Tests for the PayPal Fee Calculator (tool-063).
 *
 * Run: node --test app/tools/make-money/paypal-fee-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the route estimate table in
 * logic.ts, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  ROUTE_TABLE,
  ROUTE_IDS,
  INTERNATIONAL_SURCHARGE,
  OUTPUT_IDS,
  MAX_AMOUNT,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

describe("happy path — one schedule per route", () => {
  it("direct_gs $100 domestic: fee 2.99, net 97.01, rate 2.99%, reverse 103.08", () => {
    // fee = 100*0.0299+0 = 2.99; reverse = 100/0.9701 = 103.08
    const r = runTool({ amount: 100, paymentRoute: "direct_gs" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 2.99);
    assert.strictEqual(r.values!.netReceived, 97.01);
    assert.strictEqual(r.values!.effectiveRate, 2.99);
    assert.strictEqual(r.values!.reverseAmountToNet, 103.08);
  });

  it("checkout $100 domestic: fee 3.98, net 96.02, rate 3.98%, reverse 104.12", () => {
    // fee = 100*0.0349+0.49 = 3.98; reverse = 100.49/0.9651 = 104.12
    const r = runTool({ amount: 100, paymentRoute: "checkout" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 3.98);
    assert.strictEqual(r.values!.netReceived, 96.02);
    assert.strictEqual(r.values!.effectiveRate, 3.98);
    assert.strictEqual(r.values!.reverseAmountToNet, 104.12);
  });

  it("card $100 domestic: fee 3.48, net 96.52, rate 3.48%, reverse 103.59", () => {
    // fee = 100*0.0299+0.49 = 3.48; reverse = 100.49/0.9701 = 103.59
    const r = runTool({ amount: 100, paymentRoute: "card" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 3.48);
    assert.strictEqual(r.values!.netReceived, 96.52);
    assert.strictEqual(r.values!.effectiveRate, 3.48);
    assert.strictEqual(r.values!.reverseAmountToNet, 103.59);
  });
});

describe("route differences are real", () => {
  it("direct_gs has NO fixed fee while checkout adds $0.49", () => {
    assert.strictEqual(ROUTE_TABLE.direct_gs.fixed, 0);
    assert.strictEqual(ROUTE_TABLE.checkout.fixed, 0.49);
    const gs = runTool({ amount: 100, paymentRoute: "direct_gs" });
    const co = runTool({ amount: 100, paymentRoute: "checkout" });
    assert.strictEqual(gs.values!.fee, 2.99);
    assert.strictEqual(co.values!.fee, 3.98);
    assert.ok((co.values!.fee as number) > (gs.values!.fee as number));
  });

  it("international adds exactly +1.5% to the rate", () => {
    assert.strictEqual(INTERNATIONAL_SURCHARGE, 0.015);
    // direct_gs intl: fee = 100*0.0449 = 4.49; reverse = 100/0.9551 = 104.70
    const r = runTool({ amount: 100, paymentRoute: "direct_gs", international: true });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 4.49);
    assert.strictEqual(r.values!.netReceived, 95.51);
    assert.strictEqual(r.values!.effectiveRate, 4.49);
    assert.strictEqual(r.values!.reverseAmountToNet, 104.7);
  });

  it("card $200 international: fee 9.47, net 190.53, rate 4.74%, reverse 209.92", () => {
    // fee = 200*0.0449+0.49 = 9.47; reverse = 200.49/0.9551 = 209.92
    const r = runTool({ amount: 200, paymentRoute: "card", international: true });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 9.47);
    assert.strictEqual(r.values!.netReceived, 190.53);
    assert.strictEqual(r.values!.effectiveRate, 4.74);
    assert.strictEqual(r.values!.reverseAmountToNet, 209.92);
  });

  it("currencyConversion is a note only — it never changes the fee math", () => {
    const a = runTool({ amount: 150, paymentRoute: "checkout", currencyConversion: true });
    const b = runTool({ amount: 150, paymentRoute: "checkout", currencyConversion: false });
    assert.deepStrictEqual(a, b);
  });

  it("route ids are case-insensitive", () => {
    const r = runTool({ amount: 100, paymentRoute: "Direct_GS" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 2.99);
  });

  it("route accepts space-separated spelling", () => {
    const r = runTool({ amount: 100, paymentRoute: "direct gs" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 2.99);
  });

  it("exactly three routes are defined", () => {
    assert.deepStrictEqual([...ROUTE_IDS].sort(), ["card", "checkout", "direct_gs"]);
  });
});

describe("edge cases", () => {
  it("tiny amount: fee can exceed the payment (honest negative net)", () => {
    // fee = 0.01*0.0349+0.49 = 0.49; net = -0.48
    const r = runTool({ amount: 0.01, paymentRoute: "checkout" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 0.49);
    assert.strictEqual(r.values!.netReceived, -0.48);
  });

  it("rejects an amount above the sanity cap", () => {
    const r = runTool({ amount: MAX_AMOUNT * 10, paymentRoute: "card" });
    assert.strictEqual(r.ok, false);
  });
});

describe("validation errors", () => {
  it("missing paymentRoute -> error (no single blended rate allowed)", () => {
    const r = runTool({ amount: 100 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("route"));
  });

  it("unknown paymentRoute -> error", () => {
    const r = runTool({ amount: 100, paymentRoute: "friends" });
    assert.strictEqual(r.ok, false);
  });

  it("missing amount -> error", () => {
    const r = runTool({ paymentRoute: "card" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("amount"));
  });

  it("amount of 0 -> error", () => {
    const r = runTool({ amount: 0, paymentRoute: "card" });
    assert.strictEqual(r.ok, false);
  });

  it("negative amount -> error", () => {
    const r = runTool({ amount: -25, paymentRoute: "card" });
    assert.strictEqual(r.ok, false);
  });

  it("NaN amount -> error", () => {
    const r = runTool({ amount: NaN, paymentRoute: "card" });
    assert.strictEqual(r.ok, false);
  });
});

describe("determinism", () => {
  it("run twice with identical inputs -> identical outputs", () => {
    const input = { amount: 249.99, paymentRoute: "checkout", international: true, currencyConversion: true };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepStrictEqual(a, b);
    assert.strictEqual(a.ok, true);
  });
});

describe("contract — outputs match meta.ts", () => {
  it("runTool output ids equal the meta.ts output ids", () => {
    const r = runTool({ amount: 100, paymentRoute: "direct_gs" });
    assert.strictEqual(r.ok, true);
    const runIds = Object.keys(r.values!).sort();
    const metaIds = metaOutputs.map((o) => o.id).sort();
    assert.deepStrictEqual(runIds, metaIds);
    assert.deepStrictEqual([...OUTPUT_IDS].sort(), metaIds);
  });
});
