/**
 * Tests for the Amazon FBA Profit Calculator pure logic (tool-059).
 *
 * Run: node --test app/tools/make-money/amazon-fba-profit-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the inputs and the documented
 * defaults (never copied from tool output). Fee figures are the EDITABLE
 * ESTIMATES the spec requires — tests assert the math, not Amazon's
 * official rate card.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  calculateFbaProfit,
  roundToCents,
  roundToTenth,
  DEFAULT_REFERRAL_RATE,
  DEFAULT_FUEL_SURCHARGE_RATE,
  OUTPUT_IDS,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

describe("runTool — happy path", () => {
  it("computes the full breakdown for a typical product", () => {
    // Hand-computed: referral=30*0.15=4.50; fuel=5*0.035=0.175->0.18;
    // totalAmazon=4.50+5+0.18=9.68; net/unit=30-9.68-10=10.32;
    // monthly=10.32*100=1032; margin=10.32/30*100=34.4; roi=103.2.
    const r = runTool({
      salePrice: 30,
      fulfillmentFee: 5,
      productCost: 10,
      unitsPerMonth: 100,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.referralFee, 4.5);
    assert.strictEqual(r.values!.fuelSurcharge, 0.18);
    assert.strictEqual(r.values!.totalAmazonFees, 9.68);
    assert.strictEqual(r.values!.netProfitPerUnit, 10.32);
    assert.strictEqual(r.values!.monthlyProfit, 1032);
    assert.strictEqual(r.values!.margin, 34.4);
    assert.strictEqual(r.values!.roi, 103.2);
  });
});

describe("runTool — user-editable fees", () => {
  it("honors a custom referral rate (electronics 8%)", () => {
    // salePrice=100, referral 8%: referral=8.00; fulfillment=6 -> fuel=0.21;
    // totalAmazon=14.21; cost=40; net/unit=45.79; units=10 -> monthly=457.90;
    // margin=45.79%; roi=114.475->114.5.
    const r = runTool({
      salePrice: 100,
      referralRate: 8,
      fulfillmentFee: 6,
      productCost: 40,
      unitsPerMonth: 10,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.referralFee, 8);
    assert.strictEqual(r.values!.fuelSurcharge, 0.21);
    assert.strictEqual(r.values!.totalAmazonFees, 14.21);
    assert.strictEqual(r.values!.netProfitPerUnit, 45.79);
    assert.strictEqual(r.values!.monthlyProfit, 457.9);
    assert.strictEqual(r.values!.margin, 45.8);
    assert.strictEqual(r.values!.roi, 114.5);
  });

  it("adds storage cost and other per-unit fees to the total", () => {
    // salePrice=30, referral 15%: 4.50; fulfillment=5, fuel=0.18;
    // storage=20 (monthly, v1 approximation), other=1.25;
    // totalAmazon=4.50+5+0.18+20+1.25=30.93; cost=0 -> net/unit=-0.93;
    // roi=null when product cost is 0.
    const r = runTool({
      salePrice: 30,
      fulfillmentFee: 5,
      productCost: 0,
      unitsPerMonth: 50,
      storageCost: 20,
      otherFeesPerUnit: 1.25,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.totalAmazonFees, 30.93);
    assert.strictEqual(r.values!.netProfitPerUnit, -0.93);
    assert.strictEqual(r.values!.roi, null);
  });

  it("honors a custom fuel surcharge rate", () => {
    // fulfillment=10, fuel rate 5%: fuel=0.50.
    const r = runTool({ salePrice: 50, fulfillmentFee: 10, fuelSurchargeRate: 5 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.fuelSurcharge, 0.5);
  });
});

describe("runTool — edge cases", () => {
  it("zero units -> monthly profit $0", () => {
    const r = runTool({ salePrice: 30, fulfillmentFee: 5, productCost: 10, unitsPerMonth: 0 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.monthlyProfit, 0);
    assert.strictEqual(r.values!.netProfitPerUnit, 10.32);
  });

  it("defaults optional inputs when omitted", () => {
    // Only salePrice + fulfillmentFee: referral 15%, cost 0, units 0,
    // storage 0, fuel 3.5%, other 0.
    const r = runTool({ salePrice: 20, fulfillmentFee: 4 });
    assert.strictEqual(r.ok, true);
    // referral=3.00; fuel=0.14; total=7.14; net=12.86; margin=64.3; roi=null.
    assert.strictEqual(r.values!.referralFee, 3);
    assert.strictEqual(r.values!.fuelSurcharge, 0.14);
    assert.strictEqual(r.values!.totalAmazonFees, 7.14);
    assert.strictEqual(r.values!.netProfitPerUnit, 12.86);
    assert.strictEqual(r.values!.margin, 64.3);
    assert.strictEqual(r.values!.roi, null);
  });

  it("shows negative per-unit profit when fees exceed price", () => {
    // salePrice=10, fulfillment=8: referral=1.50; fuel=0.28;
    // total=9.78; cost=5 -> net=-4.78; margin=-47.8.
    const r = runTool({ salePrice: 10, fulfillmentFee: 8, productCost: 5, unitsPerMonth: 10 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.netProfitPerUnit, -4.78);
    assert.strictEqual(r.values!.margin, -47.8);
    assert.strictEqual(r.values!.monthlyProfit, -47.8);
  });
});

describe("runTool — validation errors", () => {
  it("rejects zero sale price", () => {
    const r = runTool({ salePrice: 0, fulfillmentFee: 5 });
    assert.strictEqual(r.ok, false);
    assert.ok(/greater than 0/.test(r.error!));
  });

  it("rejects negative sale price", () => {
    const r = runTool({ salePrice: -10, fulfillmentFee: 5 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects non-numeric sale price", () => {
    const r = runTool({ salePrice: "lots", fulfillmentFee: 5 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects missing fulfillment fee", () => {
    const r = runTool({ salePrice: 30 });
    assert.strictEqual(r.ok, false);
    assert.ok(/Fulfillment fee/.test(r.error!));
  });

  it("rejects negative fulfillment fee", () => {
    const r = runTool({ salePrice: 30, fulfillmentFee: -1 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a zero referral rate", () => {
    const r = runTool({ salePrice: 30, fulfillmentFee: 5, referralRate: 0 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a referral rate above 100", () => {
    const r = runTool({ salePrice: 30, fulfillmentFee: 5, referralRate: 120 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects negative product cost", () => {
    const r = runTool({ salePrice: 30, fulfillmentFee: 5, productCost: -2 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects fractional units per month", () => {
    const r = runTool({ salePrice: 30, fulfillmentFee: 5, unitsPerMonth: 2.5 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects negative units per month", () => {
    const r = runTool({ salePrice: 30, fulfillmentFee: 5, unitsPerMonth: -1 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects negative storage cost", () => {
    const r = runTool({ salePrice: 30, fulfillmentFee: 5, storageCost: -3 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects negative fuel surcharge rate", () => {
    const r = runTool({ salePrice: 30, fulfillmentFee: 5, fuelSurchargeRate: -1 });
    assert.strictEqual(r.ok, false);
  });
});

describe("runTool — determinism", () => {
  it("returns identical results for identical inputs", () => {
    const input = {
      salePrice: 47.99,
      referralRate: 15,
      fulfillmentFee: 6.32,
      productCost: 12.5,
      unitsPerMonth: 250,
      storageCost: 45.75,
      otherFeesPerUnit: 0.99,
    };
    assert.deepStrictEqual(runTool(input), runTool(input));
  });
});

describe("runTool — output ids match meta.ts outputs", () => {
  it("every runTool output key exists in meta outputs", () => {
    const r = runTool({ salePrice: 30, fulfillmentFee: 5 });
    assert.strictEqual(r.ok, true);
    const metaIds = new Set(metaOutputs.map((o) => o.id));
    for (const key of Object.keys(r.values!)) {
      assert.ok(metaIds.has(key), `output id "${key}" missing from meta.ts outputs`);
    }
  });

  it("logic.ts OUTPUT_IDS equals the ids meta.ts declares", () => {
    const logicIds = new Set<string>(OUTPUT_IDS);
    const metaIds = new Set(metaOutputs.map((o) => o.id));
    assert.deepStrictEqual([...logicIds].sort(), [...metaIds].sort());
  });
});

describe("constants and helpers", () => {
  it("defaults are the documented estimates", () => {
    assert.strictEqual(DEFAULT_REFERRAL_RATE, 15);
    assert.strictEqual(DEFAULT_FUEL_SURCHARGE_RATE, 3.5);
  });

  it("roundToTenth rounds to one decimal", () => {
    assert.strictEqual(roundToTenth(34.44), 34.4);
    assert.strictEqual(roundToTenth(34.46), 34.5);
  });

  it("assumptions disclose estimates and the storage approximation", () => {
    const b = calculateFbaProfit({
      salePrice: 30,
      referralRate: 15,
      fulfillmentFee: 5,
      productCost: 10,
      unitsPerMonth: 100,
      storageCost: 0,
      fuelSurchargeRate: 3.5,
      otherFeesPerUnit: 0,
    });
    assert.ok(b.assumptions.some((a) => /estimate/i.test(a)));
    assert.ok(
      b.assumptions.some((a) => /approximation/i.test(a)),
      "must disclose the monthly-storage v1 approximation",
    );
  });
});
