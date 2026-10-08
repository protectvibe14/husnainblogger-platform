/**
 * Tests for the eBay Fee Calculator pure logic (tool-057).
 *
 * Run: node --test app/tools/make-money/ebay-fee-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the inputs and the documented
 * defaults (never copied from tool output). Fee rates are treated as the
 * ESTIMATES the spec requires — tests assert the math, not eBay's
 * official schedule.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  calculateEbayFees,
  roundToCents,
  CATEGORY_DEFAULT_FVF,
  TIER_THRESHOLD,
  TIER_RATE,
  INTERNATIONAL_SURCHARGE_RATE,
  PER_ORDER_FEE_LOW,
  PER_ORDER_FEE_HIGH,
  INSERTION_FEE_PER_LISTING,
  MAX_TOTAL_SALE,
  OUTPUT_IDS,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

describe("runTool — happy path (most categories, default 13.6% estimate)", () => {
  it("computes fees for a $100 item with $10 shipping", () => {
    // Hand-computed: totalSale=110; fvf=110*0.136=14.96; perOrder=0.40;
    // insertion=0; total=15.36; net=94.64.
    const r = runTool({ salePrice: 100, shippingCharged: 10 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.finalValueFee, 14.96);
    assert.strictEqual(r.values!.perOrderFee, 0.4);
    assert.strictEqual(r.values!.insertionFee, 0);
    assert.strictEqual(r.values!.totalFees, 15.36);
    assert.strictEqual(r.values!.netPayout, 94.64);
  });
});

describe("runTool — user-editable fee rate override", () => {
  it("uses the user's final value fee rate instead of the default", () => {
    // Hand-computed: totalSale=200; fvf=200*0.1325=26.50; perOrder=0.40;
    // total=26.90; net=173.10.
    const r = runTool({ salePrice: 200, shippingCharged: 0, finalValueRate: 13.25 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.finalValueFee, 26.5);
    assert.strictEqual(r.values!.totalFees, 26.9);
    assert.strictEqual(r.values!.netPayout, 173.1);
  });
});

describe("runTool — category overrides", () => {
  it("applies the 15.3% books/DVDs/music default", () => {
    // totalSale=20; fvf=20*0.153=3.06; perOrder=0.40; total=3.46; net=16.54.
    const r = runTool({ salePrice: 20, category: "books-dvds-music" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.finalValueFee, 3.06);
    assert.strictEqual(r.values!.totalFees, 3.46);
    assert.strictEqual(r.values!.netPayout, 16.54);
  });

  it("applies the 6.7% guitars default", () => {
    // totalSale=500; fvf=500*0.067=33.50; perOrder=0.40; total=33.90; net=466.10.
    const r = runTool({ salePrice: 500, category: "guitars-bass-guitars" });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.finalValueFee, 33.5);
    assert.strictEqual(r.values!.netPayout, 466.1);
  });
});

describe("runTool — tiered FVF above $7,500", () => {
  it("charges 2.35% on the portion above $7,500", () => {
    // totalSale=8000: below=7500*0.136=1020; above=500*0.0235=11.75;
    // fvf=1031.75; perOrder=0.40; total=1032.15; net=6967.85.
    const r = runTool({ salePrice: 8000, shippingCharged: 0 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.finalValueFee, 1031.75);
    assert.strictEqual(r.values!.totalFees, 1032.15);
    assert.strictEqual(r.values!.netPayout, 6967.85);
  });

  it("charges no tiered portion at exactly $7,500", () => {
    // fvf=7500*0.136=1020; total=1020.40; net=6479.60.
    const r = runTool({ salePrice: 7500, shippingCharged: 0 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.finalValueFee, 1020);
    assert.strictEqual(r.values!.netPayout, 6479.6);
  });
});

describe("runTool — per-order fee tier", () => {
  it("charges $0.30 when the total sale is $10 or less", () => {
    // totalSale=10; fvf=10*0.136=1.36; perOrder=0.30; total=1.66; net=8.34.
    const r = runTool({ salePrice: 8, shippingCharged: 2 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.perOrderFee, 0.3);
    assert.strictEqual(r.values!.totalFees, 1.66);
    assert.strictEqual(r.values!.netPayout, 8.34);
  });

  it("charges $0.40 when the total sale is above $10", () => {
    const r = runTool({ salePrice: 10.01, shippingCharged: 0 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.perOrderFee, 0.4);
  });
});

describe("runTool — international surcharge and insertion fees", () => {
  it("adds the 1.65% international surcharge when flagged", () => {
    // totalSale=100; fvf=13.60+1.65=15.25; perOrder=0.40; total=15.65; net=84.35.
    const r = runTool({ salePrice: 100, internationalBuyer: true });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.finalValueFee, 15.25);
    assert.strictEqual(r.values!.totalFees, 15.65);
    assert.strictEqual(r.values!.netPayout, 84.35);
  });

  it("charges $0.35 per listing beyond the free allowance", () => {
    // totalSale=50; fvf=6.80; perOrder=0.40; insertion=3*0.35=1.05;
    // total=8.25; net=41.75.
    const r = runTool({ salePrice: 50, listingsBeyondFree: 3 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.insertionFee, 1.05);
    assert.strictEqual(r.values!.totalFees, 8.25);
    assert.strictEqual(r.values!.netPayout, 41.75);
  });

  it("defaults insertion fee to 0 when not provided", () => {
    const r = runTool({ salePrice: 50 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.insertionFee, 0);
  });
});

describe("runTool — validation errors", () => {
  it("rejects zero sale price", () => {
    const r = runTool({ salePrice: 0 });
    assert.strictEqual(r.ok, false);
    assert.ok(/greater than 0/.test(r.error!));
  });

  it("rejects negative sale price", () => {
    const r = runTool({ salePrice: -1 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects non-numeric sale price", () => {
    const r = runTool({ salePrice: "abc" });
    assert.strictEqual(r.ok, false);
  });

  it("rejects an unknown category", () => {
    const r = runTool({ salePrice: 10, category: "cars" });
    assert.strictEqual(r.ok, false);
    assert.ok(/Category/.test(r.error!));
  });

  it("rejects negative shipping charged", () => {
    const r = runTool({ salePrice: 10, shippingCharged: -5 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a zero fee-rate override", () => {
    const r = runTool({ salePrice: 10, finalValueRate: 0 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a fee-rate override above 100", () => {
    const r = runTool({ salePrice: 10, finalValueRate: 101 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects negative listings beyond free", () => {
    const r = runTool({ salePrice: 10, listingsBeyondFree: -1 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects fractional listings beyond free", () => {
    const r = runTool({ salePrice: 10, listingsBeyondFree: 1.5 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a non-boolean international flag", () => {
    const r = runTool({ salePrice: 10, internationalBuyer: "yes" });
    assert.strictEqual(r.ok, false);
  });

  it("throws a RangeError when the total sale exceeds the sanity cap", () => {
    assert.throws(
      () =>
        calculateEbayFees({
          salePrice: MAX_TOTAL_SALE + 1,
          shippingCharged: 0,
          category: "most-categories",
          finalValueRate: null,
          internationalBuyer: false,
          listingsBeyondFree: 0,
        }),
      RangeError,
    );
  });
});

describe("runTool — determinism", () => {
  it("returns identical results for identical inputs", () => {
    const input = {
      salePrice: 123.45,
      shippingCharged: 6.78,
      category: "books-dvds-music",
      internationalBuyer: true,
      listingsBeyondFree: 7,
    };
    assert.deepStrictEqual(runTool(input), runTool(input));
  });
});

describe("runTool — output ids match meta.ts outputs", () => {
  it("every runTool output key exists in meta outputs", () => {
    const r = runTool({ salePrice: 50 });
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
  it("category defaults are the documented estimates", () => {
    assert.deepStrictEqual(CATEGORY_DEFAULT_FVF, {
      "most-categories": 13.6,
      "books-dvds-music": 15.3,
      "guitars-bass-guitars": 6.7,
    });
  });

  it("tier and surcharge constants match the documented rule set", () => {
    assert.strictEqual(TIER_THRESHOLD, 7500);
    assert.strictEqual(TIER_RATE, 2.35);
    assert.strictEqual(INTERNATIONAL_SURCHARGE_RATE, 1.65);
    assert.strictEqual(PER_ORDER_FEE_LOW, 0.3);
    assert.strictEqual(PER_ORDER_FEE_HIGH, 0.4);
    assert.strictEqual(INSERTION_FEE_PER_LISTING, 0.35);
  });

  it("roundToCents rounds half-up", () => {
    assert.strictEqual(roundToCents(2.345), 2.35);
    assert.strictEqual(roundToCents(2.344), 2.34);
  });

  it("assumptions label the fee figures as estimates", () => {
    const b = calculateEbayFees({
      salePrice: 50,
      shippingCharged: 0,
      category: "most-categories",
      finalValueRate: null,
      internationalBuyer: false,
      listingsBeyondFree: 0,
    });
    assert.ok(
      b.assumptions.some((a) => /estimate/i.test(a)),
      "assumptions must label fees as estimates",
    );
    assert.ok(
      b.assumptions.some((a) => /verify/i.test(a)),
      "assumptions must tell the user to verify on eBay",
    );
  });
});
