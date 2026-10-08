/**
 * Tests for the Etsy Profit Calculator pure logic (tool-056).
 *
 * Run: node --test app/tools/make-money/etsy-profit-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the inputs and the documented
 * defaults (never copied from tool output). A default-values test
 * cross-checks the US processing schedule against tool-055's rule set.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  calculateEtsyProfit,
  roundToCents,
  ETSY_PROCESSING_SCHEDULES,
  DEFAULT_LISTING_FEE,
  DEFAULT_TRANSACTION_FEE_RATE,
  DEFAULT_OFFSITE_ADS_RATE,
  OFFSITE_ADS_CAP,
  MAX_GROSS_AMOUNT,
  OUTPUT_IDS,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

describe("runTool — happy path (US defaults)", () => {
  it("computes fees, costs, profit, margin for a typical sale", () => {
    // Hand-computed: gross=30.00; listing=0.20; txn=30*0.065=1.95;
    // proc=30*0.03+0.25=1.15; fees=3.30; costs=8+4.20+3.30=15.50;
    // net=14.50; margin=14.5/30*100=48.333->48.3; no warning.
    const r = runTool({
      salePrice: 25,
      itemCost: 8,
      shippingCharged: 5,
      shippingLabelCost: 4.2,
      sellerCountry: "US",
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.totalFees, 3.3);
    assert.strictEqual(r.values!.totalCosts, 15.5);
    assert.strictEqual(r.values!.netProfit, 14.5);
    assert.strictEqual(r.values!.profitMargin, 48.3);
    assert.strictEqual(r.values!.warning, "");
  });
});

describe("runTool — UK sale uses GBP processing schedule", () => {
  it("applies the UK 4% + £0.20 processing defaults", () => {
    // Hand-computed: gross=40.00; listing=0.20; txn=40*0.065=2.60;
    // proc=40*0.04+0.20=1.80; fees=4.60; costs=10+0+4.60=14.60;
    // net=25.40; margin=25.4/40*100=63.5.
    const r = runTool({
      salePrice: 40,
      itemCost: 10,
      shippingCharged: 0,
      shippingLabelCost: 0,
      sellerCountry: "UK",
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.totalFees, 4.6);
    assert.strictEqual(r.values!.netProfit, 25.4);
    assert.strictEqual(r.values!.profitMargin, 63.5);
  });
});

describe("runTool — user-editable fee defaults", () => {
  it("honors a custom transaction rate, listing fee, and processing fee", () => {
    // Hand-computed: gross=100; listing=0.50; txn=100*0.05=5.00;
    // proc=100*0.04+0.50=4.50; fees=10.00; costs=30+5+10=45; net=55; margin=55.
    const r = runTool({
      salePrice: 100,
      itemCost: 30,
      shippingCharged: 0,
      shippingLabelCost: 5,
      sellerCountry: "US",
      transactionFeeRate: 5,
      listingFee: 0.5,
      processingRate: 4,
      processingFixed: 0.5,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.totalFees, 10);
    assert.strictEqual(r.values!.totalCosts, 45);
    assert.strictEqual(r.values!.netProfit, 55);
    assert.strictEqual(r.values!.profitMargin, 55);
  });
});

describe("runTool — offsite ads", () => {
  it("adds the offsite ads fee only when attributed", () => {
    // salePrice=200, no shipping: gross=200; listing=0.20; txn=13.00;
    // proc=6.25; offsite=min(200*0.15,100)=30.00; fees=49.45;
    // costs=0+0+49.45; net=150.55.
    const attributed = runTool({
      salePrice: 200,
      itemCost: 0,
      shippingCharged: 0,
      shippingLabelCost: 0,
      sellerCountry: "US",
      offsiteAdsAttributed: true,
    });
    assert.strictEqual(attributed.ok, true);
    assert.strictEqual(attributed.values!.totalFees, 49.45);
    assert.strictEqual(attributed.values!.netProfit, 150.55);

    const notAttributed = runTool({
      salePrice: 200,
      itemCost: 0,
      shippingCharged: 0,
      shippingLabelCost: 0,
      sellerCountry: "US",
    });
    assert.strictEqual(notAttributed.ok, true);
    assert.strictEqual(notAttributed.values!.totalFees, 19.45);
  });

  it("caps the offsite ads fee at the cap", () => {
    // gross=1000: raw offsite=150 -> capped at 100.
    const r = runTool({
      salePrice: 1000,
      itemCost: 0,
      shippingCharged: 0,
      shippingLabelCost: 0,
      sellerCountry: "US",
      offsiteAdsAttributed: true,
    });
    assert.strictEqual(r.ok, true);
    // listing 0.20 + txn 65.00 + proc 30.25 + offsite 100 = 195.45
    assert.strictEqual(r.values!.totalFees, 195.45);
  });
});

describe("runTool — edge cases", () => {
  it("shows negative profit with a warning when costs exceed price", () => {
    // gross=20; fees: listing 0.20 + txn 1.30 + proc 0.85 = 2.35;
    // costs=15+10+2.35=27.35; net=-7.35; margin=-36.75 -> -36.7 in binary
    // floating point (deterministic).
    const r = runTool({
      salePrice: 20,
      itemCost: 15,
      shippingCharged: 0,
      shippingLabelCost: 10,
      sellerCountry: "US",
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.netProfit, -7.35);
    assert.strictEqual(r.values!.profitMargin, -36.7);
    assert.ok(
      typeof r.values!.warning === "string" && r.values!.warning.length > 0,
      "warning must be non-empty when profit is negative",
    );
  });

  it("returns an error for zero sale price", () => {
    const r = runTool({ salePrice: 0 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error && r.error.length > 0);
  });

  it("returns an error for negative sale price", () => {
    const r = runTool({ salePrice: -5 });
    assert.strictEqual(r.ok, false);
    assert.ok(/greater than 0/.test(r.error!));
  });

  it("returns an error for non-numeric sale price", () => {
    const r = runTool({ salePrice: "twenty" });
    assert.strictEqual(r.ok, false);
    assert.ok(/number/.test(r.error!));
  });

  it("returns an error for negative item cost", () => {
    const r = runTool({ salePrice: 10, itemCost: -1 });
    assert.strictEqual(r.ok, false);
    assert.ok(/Item cost/.test(r.error!));
  });

  it("returns an error for negative shipping charged", () => {
    const r = runTool({ salePrice: 10, shippingCharged: -2 });
    assert.strictEqual(r.ok, false);
  });

  it("returns an error for negative shipping label cost", () => {
    const r = runTool({ salePrice: 10, shippingLabelCost: -0.5 });
    assert.strictEqual(r.ok, false);
  });

  it("returns an error for an unknown seller country", () => {
    const r = runTool({ salePrice: 10, sellerCountry: "XX" });
    assert.strictEqual(r.ok, false);
    assert.ok(/Seller country/.test(r.error!));
  });

  it("returns an error for an out-of-range transaction rate", () => {
    const r = runTool({ salePrice: 10, transactionFeeRate: 150 });
    assert.strictEqual(r.ok, false);
  });

  it("returns an error for a non-boolean offsite flag", () => {
    const r = runTool({ salePrice: 10, offsiteAdsAttributed: "yes" });
    assert.strictEqual(r.ok, false);
  });

  it("rounds fractional-cent inputs to cents and records the assumption", () => {
    // salePrice 10.005 -> rounds to 10.01 before math; assumption pushed.
    const breakdown = calculateEtsyProfit({
      salePrice: 10.005,
      itemCost: 0,
      shippingCharged: 0,
      shippingLabelCost: 0,
      sellerCountry: "US",
      transactionFeeRate: DEFAULT_TRANSACTION_FEE_RATE,
      listingFee: DEFAULT_LISTING_FEE,
      processingRate: ETSY_PROCESSING_SCHEDULES.US.rate * 100,
      processingFixed: ETSY_PROCESSING_SCHEDULES.US.fixed,
      offsiteAdsAttributed: false,
      offsiteAdsRate: DEFAULT_OFFSITE_ADS_RATE,
    });
    assert.strictEqual(breakdown.grossRevenue, 10.01);
    assert.ok(
      breakdown.assumptions.some((a) => /rounded to the nearest cent/i.test(a)),
    );
  });

  it("throws a RangeError when gross exceeds the sanity cap", () => {
    assert.throws(
      () =>
        calculateEtsyProfit({
          salePrice: MAX_GROSS_AMOUNT + 1,
          itemCost: 0,
          shippingCharged: 0,
          shippingLabelCost: 0,
          sellerCountry: "US",
          transactionFeeRate: DEFAULT_TRANSACTION_FEE_RATE,
          listingFee: DEFAULT_LISTING_FEE,
          processingRate: ETSY_PROCESSING_SCHEDULES.US.rate * 100,
          processingFixed: ETSY_PROCESSING_SCHEDULES.US.fixed,
          offsiteAdsAttributed: false,
          offsiteAdsRate: DEFAULT_OFFSITE_ADS_RATE,
        }),
      RangeError,
    );
  });
});

describe("runTool — determinism", () => {
  it("returns identical results for identical inputs", () => {
    const input = {
      salePrice: 33.33,
      itemCost: 9.99,
      shippingCharged: 4.95,
      shippingLabelCost: 4.1,
      sellerCountry: "CA",
      offsiteAdsAttributed: true,
      offsiteAdsRate: 12,
    };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepStrictEqual(a, b);
  });
});

describe("runTool — output ids match meta.ts outputs", () => {
  it("every runTool output key exists in meta outputs", () => {
    const r = runTool({ salePrice: 50, itemCost: 10 });
    assert.strictEqual(r.ok, true);
    const metaIds = new Set(metaOutputs.map((o) => o.id));
    for (const key of Object.keys(r.values!)) {
      assert.ok(metaIds.has(key), `output id "${key}" missing from meta.ts outputs`);
    }
  });

  it("logic.ts exports the same ids meta.ts declares", () => {
    const logicIds = new Set<string>(OUTPUT_IDS);
    const metaIds = new Set(metaOutputs.map((o) => o.id));
    assert.deepStrictEqual([...logicIds].sort(), [...metaIds].sort());
  });
});

describe("helpers and constants", () => {
  it("roundToCents rounds half-up", () => {
    // 2.345 * 100 = 234.50000000000003 in binary -> rounds up to 235.
    assert.strictEqual(roundToCents(2.345), 2.35);
    assert.strictEqual(roundToCents(2.344), 2.34);
    assert.strictEqual(roundToCents(0), 0);
  });

  it("US schedule matches the tool-055 published rule set (3% + $0.25 USD)", () => {
    assert.deepStrictEqual(ETSY_PROCESSING_SCHEDULES.US, {
      rate: 0.03,
      fixed: 0.25,
      currency: "USD",
    });
  });

  it("defaults are the published Etsy fee values", () => {
    assert.strictEqual(DEFAULT_LISTING_FEE, 0.2);
    assert.strictEqual(DEFAULT_TRANSACTION_FEE_RATE, 6.5);
    assert.strictEqual(DEFAULT_OFFSITE_ADS_RATE, 15);
    assert.strictEqual(OFFSITE_ADS_CAP, 100);
  });

  it("assumptions disclose the excluded regulatory fee", () => {
    const breakdown = calculateEtsyProfit({
      salePrice: 50,
      itemCost: 0,
      shippingCharged: 0,
      shippingLabelCost: 0,
      sellerCountry: "US",
      transactionFeeRate: DEFAULT_TRANSACTION_FEE_RATE,
      listingFee: DEFAULT_LISTING_FEE,
      processingRate: ETSY_PROCESSING_SCHEDULES.US.rate * 100,
      processingFixed: ETSY_PROCESSING_SCHEDULES.US.fixed,
      offsiteAdsAttributed: false,
      offsiteAdsRate: DEFAULT_OFFSITE_ADS_RATE,
    });
    assert.ok(
      breakdown.assumptions.some((a) => /regulatory/i.test(a)),
      "regulatory fee exclusion must be surfaced",
    );
  });
});
