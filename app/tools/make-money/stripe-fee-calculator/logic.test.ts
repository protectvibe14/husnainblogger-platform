/**
 * Tests for the Stripe Fee Calculator (tool-064).
 *
 * Run: node --test app/tools/make-money/stripe-fee-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the method estimate table in
 * logic.ts, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  METHOD_TABLE,
  METHOD_IDS,
  ACH_FEE_CAP,
  INTERNATIONAL_SURCHARGE_BPS,
  FX_SURCHARGE_BPS,
  OUTPUT_IDS,
  MAX_AMOUNT,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

describe("happy path — one schedule per method", () => {
  it("online $100: fee 3.20, net 96.80, rate 3.20%, reverse 103.30", () => {
    // fee = 100*0.029+0.30 = 3.20; reverse = 100.30/0.971 = 103.30
    const r = runTool({ amount: 100, paymentMethod: "online" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 3.2);
    assert.strictEqual(r.values!.netReceived, 96.8);
    assert.strictEqual(r.values!.effectiveRate, 3.2);
    assert.strictEqual(r.values!.reverseAmountToNet, 103.3);
  });

  it("in_person $100: fee 2.75, net 97.25, rate 2.75%, reverse 102.83", () => {
    // fee = 100*0.027+0.05 = 2.75; reverse = 100.05/0.973 = 102.83
    const r = runTool({ amount: 100, paymentMethod: "in_person" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 2.75);
    assert.strictEqual(r.values!.netReceived, 97.25);
    assert.strictEqual(r.values!.effectiveRate, 2.75);
    assert.strictEqual(r.values!.reverseAmountToNet, 102.83);
  });

  it("ach $100: fee 0.80, net 99.20, rate 0.80%, reverse 100.81", () => {
    // fee = min(100*0.008, 5) = 0.80; reverse = 100/0.992 = 100.81 (cap not hit)
    const r = runTool({ amount: 100, paymentMethod: "ach" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 0.8);
    assert.strictEqual(r.values!.netReceived, 99.2);
    assert.strictEqual(r.values!.effectiveRate, 0.8);
    assert.strictEqual(r.values!.reverseAmountToNet, 100.81);
  });
});

describe("ACH cap", () => {
  it("ach $10,000: fee capped at $5, net 9995, rate 0.05%", () => {
    assert.strictEqual(ACH_FEE_CAP, 5);
    const r = runTool({ amount: 10000, paymentMethod: "ach" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 5);
    assert.strictEqual(r.values!.netReceived, 9995);
    assert.strictEqual(r.values!.effectiveRate, 0.05);
  });

  it("ach reverse with cap binding: charge target + $5", () => {
    // uncapped solution 10000/0.992 = 10080.65 would fee $80.64 > cap -> invalid
    const r = runTool({ amount: 10000, paymentMethod: "ach" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.reverseAmountToNet, 10005);
  });

  it("ach stacking can push the fee into the cap", () => {
    // domestic: min(500*0.008, 5) = 4.00; intl: min(500*0.023, 5) = 5.00
    const dom = runTool({ amount: 500, paymentMethod: "ach" });
    const intl = runTool({ amount: 500, paymentMethod: "ach", internationalCard: true });
    assert.strictEqual(dom.values!.fee, 4);
    assert.strictEqual(intl.values!.fee, 5);
  });
});

describe("stacking", () => {
  it("international +1.5% and FX +1% stack on the rate", () => {
    assert.strictEqual(INTERNATIONAL_SURCHARGE_BPS, 150);
    assert.strictEqual(FX_SURCHARGE_BPS, 100);
    // rate = 0.029+0.015+0.01 = 0.054; fee = 5.40+0.30 = 5.70
    // reverse = 100.30/0.946 = 106.0254 -> 106.03
    const r = runTool({
      amount: 100,
      paymentMethod: "online",
      internationalCard: true,
      currencyConversion: true,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 5.7);
    assert.strictEqual(r.values!.netReceived, 94.3);
    assert.strictEqual(r.values!.effectiveRate, 5.7);
    assert.strictEqual(r.values!.reverseAmountToNet, 106.03);
  });

  it("FX alone adds 1%: online $100 -> fee 4.20", () => {
    // fee = 100*0.039+0.30 = 4.20
    const r = runTool({ amount: 100, paymentMethod: "online", currencyConversion: true });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 4.2);
  });

  it("in-person differs from online (method must be explicit)", () => {
    assert.notStrictEqual(METHOD_TABLE.online.rateBps, METHOD_TABLE.in_person.rateBps);
    assert.notStrictEqual(METHOD_TABLE.online.fixed, METHOD_TABLE.in_person.fixed);
    const on = runTool({ amount: 100, paymentMethod: "online" });
    const ip = runTool({ amount: 100, paymentMethod: "in_person" });
    assert.notStrictEqual(on.values!.fee, ip.values!.fee);
  });

  it("method ids are case-insensitive", () => {
    const r = runTool({ amount: 100, paymentMethod: "ONLINE" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 3.2);
  });

  it("boolean flags accept 'true'/'false' strings", () => {
    const r = runTool({ amount: 100, paymentMethod: "online", internationalCard: "true" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 4.7); // 100*0.044+0.30
  });
});

describe("edge cases", () => {
  it("tiny amount: fee exceeds the charge (honest negative net)", () => {
    // fee = 0.01*0.029+0.30 = 0.30; net = -0.29
    const r = runTool({ amount: 0.01, paymentMethod: "online" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fee, 0.3);
    assert.strictEqual(r.values!.netReceived, -0.29);
  });

  it("rejects an amount above the sanity cap", () => {
    const r = runTool({ amount: MAX_AMOUNT * 10, paymentMethod: "online" });
    assert.strictEqual(r.ok, false);
  });

  it("exactly three methods are defined", () => {
    assert.deepStrictEqual([...METHOD_IDS].sort(), ["ach", "in_person", "online"]);
  });
});

describe("validation errors", () => {
  it("missing paymentMethod -> error", () => {
    const r = runTool({ amount: 100 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("method"));
  });

  it("unknown paymentMethod -> error", () => {
    const r = runTool({ amount: 100, paymentMethod: "wire" });
    assert.strictEqual(r.ok, false);
  });

  it("missing amount -> error", () => {
    const r = runTool({ paymentMethod: "online" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("amount"));
  });

  it("amount of 0 -> error", () => {
    const r = runTool({ amount: 0, paymentMethod: "online" });
    assert.strictEqual(r.ok, false);
  });

  it("negative amount -> error", () => {
    const r = runTool({ amount: -50, paymentMethod: "online" });
    assert.strictEqual(r.ok, false);
  });

  it("NaN amount -> error", () => {
    const r = runTool({ amount: NaN, paymentMethod: "online" });
    assert.strictEqual(r.ok, false);
  });
});

describe("determinism", () => {
  it("run twice with identical inputs -> identical outputs", () => {
    const input = {
      amount: 349.99,
      paymentMethod: "online",
      internationalCard: true,
      currencyConversion: true,
    };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepStrictEqual(a, b);
    assert.strictEqual(a.ok, true);
  });
});

describe("contract — outputs match meta.ts", () => {
  it("runTool output ids equal the meta.ts output ids", () => {
    const r = runTool({ amount: 100, paymentMethod: "online" });
    assert.strictEqual(r.ok, true);
    const runIds = Object.keys(r.values!).sort();
    const metaIds = metaOutputs.map((o) => o.id).sort();
    assert.deepStrictEqual(runIds, metaIds);
    assert.deepStrictEqual([...OUTPUT_IDS].sort(), metaIds);
  });
});
