/**
 * Tests for the Etsy Fee Calculator pure logic (tool-055).
 *
 * Run: node --test app/tools/make-money/etsy-fee-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the fee constants, never copied
 * from tool output. One test cross-checks the constants against
 * data/platform-rules/etsy.json.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  calculateEtsyFees,
  roundToCents,
  runTool,
  ETSY_LISTING_FEE,
  ETSY_TRANSACTION_FEE_RATE,
  ETSY_PROCESSING_SCHEDULES,
  ETSY_OFFSITE_ADS_RATE_STANDARD,
  ETSY_OFFSITE_ADS_RATE_HIGH_VOLUME,
  ETSY_OFFSITE_ADS_CAP,
  OFFSITE_TIER_STANDARD,
  OFFSITE_TIER_HIGH_VOLUME,
  OFFSITE_TIER_OPTIONS,
  MAX_GROSS_AMOUNT,
} from "./logic.ts";
import { inputs, outputs, content } from "./meta.ts";

describe("calculateEtsyFees — normal US sale", () => {
  it("computes the full breakdown for itemPrice 25, qty 1, shipping 5, US", () => {
    // Hand-computed: gross=30.00; listing=0.20; txn=30*0.065=1.95;
    // proc=30*0.03+0.25=1.15; total=3.30; net=26.70; margin=89.00%.
    const r = calculateEtsyFees({
      itemPrice: 25,
      quantity: 1,
      shippingCharged: 5,
      sellerCountry: "US",
    });
    assert.strictEqual(r.currency, "USD");
    assert.strictEqual(r.grossRevenue, 30);
    assert.strictEqual(r.listingFee, 0.2);
    assert.strictEqual(r.transactionFee, 1.95);
    assert.strictEqual(r.paymentProcessingFee, 1.15);
    assert.strictEqual(r.offsiteAdsFee, 0);
    assert.strictEqual(r.totalFees, 3.3);
    assert.strictEqual(r.netProfit, 26.7);
    assert.strictEqual(r.marginPct, 89);
    assert.ok(r.assumptions.length >= 4, "assumptions must be surfaced to the UI");
  });
});

describe("calculateEtsyFees — UK multi-quantity sale", () => {
  it("applies the UK 4% + £0.20 processing schedule and GBP currency", () => {
    // Hand-computed: gross=43.00; listing=0.40; txn=43*0.065=2.795->2.80;
    // proc=43*0.04+0.20=1.92; total=5.12; net=37.88; margin=88.09%.
    const r = calculateEtsyFees({
      itemPrice: 20,
      quantity: 2,
      shippingCharged: 3,
      sellerCountry: "UK",
    });
    assert.strictEqual(r.currency, "GBP");
    assert.strictEqual(r.grossRevenue, 43);
    assert.strictEqual(r.listingFee, 0.4);
    assert.strictEqual(r.transactionFee, 2.8);
    assert.strictEqual(r.paymentProcessingFee, 1.92);
    assert.strictEqual(r.totalFees, 5.12);
    assert.strictEqual(r.netProfit, 37.88);
    assert.strictEqual(r.marginPct, 88.09);
  });
});

describe("calculateEtsyFees — DE/FR/CA/AU schedules", () => {
  it("uses EUR schedules for DE and FR", () => {
    // gross=50; proc DE=50*0.04+0.30=2.30.
    const de = calculateEtsyFees({ itemPrice: 50, sellerCountry: "DE" });
    const fr = calculateEtsyFees({ itemPrice: 50, sellerCountry: "FR" });
    assert.strictEqual(de.currency, "EUR");
    assert.strictEqual(de.paymentProcessingFee, 2.3);
    assert.strictEqual(fr.paymentProcessingFee, 2.3);
  });
  it("uses CAD/AUD schedules for CA and AU", () => {
    const ca = calculateEtsyFees({ itemPrice: 50, sellerCountry: "CA" });
    const au = calculateEtsyFees({ itemPrice: 50, sellerCountry: "AU" });
    assert.strictEqual(ca.currency, "CAD");
    assert.strictEqual(ca.paymentProcessingFee, 1.75); // 50*0.03+0.25
    assert.strictEqual(au.currency, "AUD");
    assert.strictEqual(au.paymentProcessingFee, 1.75);
  });
});

describe("calculateEtsyFees — Offsite Ads", () => {
  it("adds 15% offsite fee when attributed (standard rate)", () => {
    // gross=100; listing=0.20; txn=6.50; proc=3.25; offsite=min(15,100)=15;
    // total=24.95; net=75.05.
    const r = calculateEtsyFees({
      itemPrice: 100,
      offsiteAdsAttributed: true,
      offsiteAdsRate: ETSY_OFFSITE_ADS_RATE_STANDARD,
    });
    assert.strictEqual(r.offsiteAdsFee, 15);
    assert.strictEqual(r.totalFees, 24.95);
    assert.strictEqual(r.netProfit, 75.05);
  });
  it("uses the 12% rate for high-volume sellers", () => {
    const r = calculateEtsyFees({
      itemPrice: 100,
      offsiteAdsAttributed: true,
      offsiteAdsRate: ETSY_OFFSITE_ADS_RATE_HIGH_VOLUME,
    });
    assert.strictEqual(r.offsiteAdsFee, 12);
  });
  it("caps the offsite fee at $100 per attributed order", () => {
    // gross=1000; offsite=min(1000*0.15,100)=100; txn=65; proc=30.25;
    // total=195.45; net=804.55.
    const r = calculateEtsyFees({
      itemPrice: 1000,
      offsiteAdsAttributed: true,
      offsiteAdsRate: 0.15,
    });
    assert.strictEqual(r.offsiteAdsFee, 100);
    assert.strictEqual(r.totalFees, 195.45);
    assert.strictEqual(r.netProfit, 804.55);
  });
});

describe("calculateEtsyFees — defaults", () => {
  it("defaults quantity=1, shipping=0, country=US, no offsite ads", () => {
    const r = calculateEtsyFees({ itemPrice: 10 });
    assert.strictEqual(r.grossRevenue, 10);
    assert.strictEqual(r.currency, "USD");
    assert.strictEqual(r.offsiteAdsFee, 0);
  });
});

describe("calculateEtsyFees — boundary and rounding", () => {
  it("handles the minimum sane sale (0.01, no shipping)", () => {
    // gross=0.01; listing=0.20; txn=round(0.00065)=0.00; proc=round(0.2503)=0.25;
    // total=0.45; net=-0.44; margin=-4400%.
    const r = calculateEtsyFees({ itemPrice: 0.01 });
    assert.strictEqual(r.grossRevenue, 0.01);
    assert.strictEqual(r.transactionFee, 0);
    assert.strictEqual(r.paymentProcessingFee, 0.25);
    assert.strictEqual(r.totalFees, 0.45);
    assert.strictEqual(r.netProfit, -0.44);
    assert.strictEqual(r.marginPct, -4400);
  });
  it("rounds inputs with >2 decimals to cents (half-up) and notes it", () => {
    // 10.005 -> 10.01; gross=10.01; txn=round(0.65065)=0.65;
    // proc=round(0.5503)=0.55; total=1.40; net=8.61.
    const r = calculateEtsyFees({ itemPrice: 10.005 });
    assert.strictEqual(r.grossRevenue, 10.01);
    assert.strictEqual(r.transactionFee, 0.65);
    assert.strictEqual(r.paymentProcessingFee, 0.55);
    assert.strictEqual(r.totalFees, 1.4);
    assert.strictEqual(r.netProfit, 8.61);
    assert.ok(
      r.assumptions.some((a) => a.includes("rounded to the nearest cent")),
      "rounding assumption must be surfaced",
    );
  });
  it("accepts huge values up to the sanity cap", () => {
    const r = calculateEtsyFees({ itemPrice: 1e11, quantity: 10 });
    assert.strictEqual(r.grossRevenue, MAX_GROSS_AMOUNT);
    assert.ok(Number.isFinite(r.totalFees));
  });
  it("rejects gross amounts above the sanity cap", () => {
    assert.throws(
      () => calculateEtsyFees({ itemPrice: 1e12, quantity: 2 }),
      RangeError,
    );
  });
});

describe("calculateEtsyFees — invalid input", () => {
  it("rejects zero and negative prices", () => {
    assert.throws(() => calculateEtsyFees({ itemPrice: 0 }), RangeError);
    assert.throws(() => calculateEtsyFees({ itemPrice: -5 }), RangeError);
  });
  it("rejects non-numeric input (numbers, strings, unicode)", () => {
    assert.throws(() => calculateEtsyFees({ itemPrice: NaN }), TypeError);
    assert.throws(() => calculateEtsyFees({ itemPrice: Infinity }), TypeError);
    assert.throws(
      () => calculateEtsyFees({ itemPrice: "25" as unknown as number }),
      TypeError,
    );
    // Full-width digits (unicode) are not numbers either.
    assert.throws(
      () => calculateEtsyFees({ itemPrice: "２５" as unknown as number }),
      TypeError,
    );
    assert.throws(
      () => calculateEtsyFees({ itemPrice: undefined as unknown as number }),
      TypeError,
    );
  });
  it("rejects invalid quantity and shipping", () => {
    assert.throws(() => calculateEtsyFees({ itemPrice: 10, quantity: 0 }), RangeError);
    assert.throws(() => calculateEtsyFees({ itemPrice: 10, quantity: 1.5 }), RangeError);
    assert.throws(() => calculateEtsyFees({ itemPrice: 10, shippingCharged: -1 }), RangeError);
  });
  it("rejects unknown seller country", () => {
    assert.throws(
      () => calculateEtsyFees({ itemPrice: 10, sellerCountry: "XX" as never }),
      TypeError,
    );
  });
  it("rejects an invalid offsite ads rate", () => {
    assert.throws(
      () =>
        calculateEtsyFees({
          itemPrice: 10,
          offsiteAdsAttributed: true,
          offsiteAdsRate: 0.2 as never,
        }),
      RangeError,
    );
  });
  it("rejects a non-object input", () => {
    assert.throws(() => calculateEtsyFees(null as never), TypeError);
  });
});

describe("roundToCents", () => {
  it("rounds half-up", () => {
    assert.strictEqual(roundToCents(2.795), 2.8);
    assert.strictEqual(roundToCents(2.794), 2.79);
    assert.strictEqual(roundToCents(0.005), 0.01);
  });
});

describe("constants match data/platform-rules/etsy.json", () => {
  it("fee values encoded in logic.ts equal the verified rule values", () => {
    const rulesPath = fileURLToPath(
      new URL("../../../../data/platform-rules/etsy.json", import.meta.url),
    );
    const raw = JSON.parse(readFileSync(rulesPath, "utf8")) as
      | Array<{ ruleId: string; value: number | string }>
      | { rules: Array<{ ruleId: string; value: number | string }> };
    // Canonical MA5 shape is { platform, rules: [...] }; tolerate a bare array.
    const rules = Array.isArray(raw) ? raw : raw.rules;
    const byId = Object.fromEntries(rules.map((r) => [r.ruleId, r.value]));

    assert.strictEqual(byId["etsy-listing-fee"], ETSY_LISTING_FEE);
    assert.strictEqual(
      Number(byId["etsy-transaction-fee"]) / 100,
      ETSY_TRANSACTION_FEE_RATE,
    );

    // Processing schedules are stored as "X% + <fixed>" strings; parse them.
    const scheduleRules: Record<string, "US" | "UK" | "DE" | "FR" | "CA" | "AU"> = {
      "etsy-processing-fee-us": "US",
      "etsy-processing-fee-uk": "UK",
      "etsy-processing-fee-de-fr": "DE",
      "etsy-processing-fee-ca-au": "CA",
    };
    for (const [ruleId, country] of Object.entries(scheduleRules)) {
      const raw = String(byId[ruleId]);
      const rate = Number(raw.match(/([\d.]+)%/)?.[1]) / 100;
      const fixed = Number(raw.match(/[\d.]+$/)?.[0]);
      assert.strictEqual(rate, ETSY_PROCESSING_SCHEDULES[country].rate, ruleId);
      assert.strictEqual(fixed, ETSY_PROCESSING_SCHEDULES[country].fixed, ruleId);
    }
    // FR shares the DE/FR rule; AU shares the CA/AU rule.
    assert.strictEqual(
      ETSY_PROCESSING_SCHEDULES.FR.rate,
      ETSY_PROCESSING_SCHEDULES.DE.rate,
    );
    assert.strictEqual(
      ETSY_PROCESSING_SCHEDULES.AU.fixed,
      ETSY_PROCESSING_SCHEDULES.CA.fixed,
    );

    // Offsite Ads: 15%/12% with a $100 cap.
    const offsite = String(byId["etsy-offsite-ads-fee"]);
    assert.ok(offsite.includes("15%") && offsite.includes("12%"), "offsite rates");
    assert.ok(offsite.includes("$100"), "offsite cap");
    assert.ok(ETSY_OFFSITE_ADS_CAP === 100);
    assert.ok(
      ETSY_OFFSITE_ADS_RATE_STANDARD === 0.15 &&
        ETSY_OFFSITE_ADS_RATE_HIGH_VOLUME === 0.12,
    );
  });
});

/**
 * Tests for the runTool({values}) adapter (tool platform contract).
 *
 * The adapter reuses the tested calculateEtsyFees engine above; expected
 * values below are hand-computed from the same constants.
 */

const okToolValues = (input: Record<string, unknown>): Record<string, unknown> => {
  const r = runTool(input);
  assert.strictEqual(r.ok, true, `expected ok, got error: ${r.error}`);
  return r.values as Record<string, unknown>;
};

describe("runTool — happy path", () => {
  it("returns the meta-declared output ids for a standard US sale", () => {
    // Hand-computed: gross=30; listing=0.20; txn=1.95; proc=1.15;
    // total=3.30; net=26.70.
    const v = okToolValues({
      itemPrice: 25,
      quantity: 1,
      shippingCharged: 5,
      sellerCountry: "US",
    });
    assert.deepStrictEqual(v, {
      grossRevenue: 30,
      listingFee: 0.2,
      transactionFee: 1.95,
      processingFee: 1.15,
      offsiteAdsFee: 0,
      totalFees: 3.3,
      netPayout: 26.7,
    });
  });

  it("applies defaults: quantity 1, shipping 0, US, no offsite ads", () => {
    const v = okToolValues({ itemPrice: 10 });
    assert.strictEqual(v.grossRevenue, 10);
    assert.strictEqual(v.listingFee, 0.2);
    assert.strictEqual(v.offsiteAdsFee, 0);
  });

  it("maps the UK schedule onto processingFee", () => {
    // Hand-computed: gross=43; listing=0.40; txn=2.80; proc=1.92;
    // total=5.12; net=37.88.
    const v = okToolValues({
      itemPrice: 20,
      quantity: 2,
      shippingCharged: 3,
      sellerCountry: "UK",
    });
    assert.strictEqual(v.processingFee, 1.92);
    assert.strictEqual(v.transactionFee, 2.8);
    assert.strictEqual(v.totalFees, 5.12);
    assert.strictEqual(v.netPayout, 37.88);
  });

  it("rounds fractional-cent inputs before computing (10.005 -> 10.01)", () => {
    const v = okToolValues({ itemPrice: 10.005 });
    assert.strictEqual(v.grossRevenue, 10.01);
    assert.strictEqual(v.transactionFee, 0.65);
    assert.strictEqual(v.processingFee, 0.55);
    assert.strictEqual(v.totalFees, 1.4);
    assert.strictEqual(v.netPayout, 8.61);
  });
});

describe("runTool — Offsite Ads tiers", () => {
  it("adds the 15% standard-tier fee when attributed", () => {
    const v = okToolValues({
      itemPrice: 100,
      offsiteAdsAttributed: true,
      offsiteAdsTier: OFFSITE_TIER_STANDARD,
    });
    assert.strictEqual(v.offsiteAdsFee, 15);
    assert.strictEqual(v.totalFees, 24.95);
    assert.strictEqual(v.netPayout, 75.05);
  });

  it("uses the 12% high-volume tier when selected", () => {
    const v = okToolValues({
      itemPrice: 100,
      offsiteAdsAttributed: true,
      offsiteAdsTier: OFFSITE_TIER_HIGH_VOLUME,
    });
    assert.strictEqual(v.offsiteAdsFee, 12);
  });

  it("keeps offsiteAdsFee at 0 when the sale is not attributed", () => {
    const v = okToolValues({ itemPrice: 100, offsiteAdsTier: OFFSITE_TIER_HIGH_VOLUME });
    assert.strictEqual(v.offsiteAdsFee, 0);
  });

  it("rejects an unknown offsite tier", () => {
    const r = runTool({ itemPrice: 100, offsiteAdsTier: "15 percent" });
    assert.strictEqual(r.ok, false);
    assert.ok(String(r.error).includes("Offsite Ads tier"));
  });
});

describe("runTool — validation errors (never throws)", () => {
  it("rejects missing, zero, negative, or non-numeric itemPrice", () => {
    const missing = runTool({});
    assert.strictEqual(missing.ok, false);
    assert.ok(String(missing.error).includes("Item price is required"));
    for (const bad of [0, -5, "25", NaN, Infinity, "２５"]) {
      const r = runTool({ itemPrice: bad });
      assert.strictEqual(r.ok, false, `itemPrice=${String(bad)} should fail`);
      assert.ok(typeof r.error === "string" && r.error.length > 0);
    }
  });

  it("rejects bad quantity and shipping", () => {
    assert.strictEqual(runTool({ itemPrice: 10, quantity: 0 }).ok, false);
    assert.strictEqual(runTool({ itemPrice: 10, quantity: 1.5 }).ok, false);
    assert.strictEqual(runTool({ itemPrice: 10, quantity: "2" }).ok, false);
    const ship = runTool({ itemPrice: 10, shippingCharged: -1 });
    assert.strictEqual(ship.ok, false);
    assert.ok(String(ship.error).includes("negative"));
  });

  it("rejects unknown seller country", () => {
    const r = runTool({ itemPrice: 10, sellerCountry: "XX" });
    assert.strictEqual(r.ok, false);
    assert.ok(String(r.error).includes("US, UK, DE, FR, CA, AU"));
  });

  it("rejects a non-boolean offsiteAdsAttributed", () => {
    const r = runTool({ itemPrice: 10, offsiteAdsAttributed: "true" });
    assert.strictEqual(r.ok, false);
  });

  it("returns an error (not a throw) when the gross exceeds the sanity cap", () => {
    const r = runTool({ itemPrice: 1e12, quantity: 2 });
    assert.strictEqual(r.ok, false);
    assert.ok(typeof r.error === "string");
  });

  it("rejects a non-object input", () => {
    assert.strictEqual(runTool(null as never).ok, false);
  });
});

describe("runTool — determinism", () => {
  it("run twice with same inputs -> identical outputs", () => {
    const input = {
      itemPrice: 49.99,
      quantity: 3,
      shippingCharged: 7.5,
      sellerCountry: "DE",
      offsiteAdsAttributed: true,
      offsiteAdsTier: OFFSITE_TIER_HIGH_VOLUME,
    };
    assert.deepStrictEqual(runTool(input), runTool(input));
  });
});

describe("runTool — output ids match meta.ts outputs", () => {
  it("runTool returns exactly the ids declared in meta outputs", () => {
    const metaIds = outputs.map((o) => o.id).sort();
    const v = okToolValues({ itemPrice: 25 });
    assert.deepStrictEqual(Object.keys(v).sort(), metaIds);
  });

  it("meta declares the expected output ids", () => {
    assert.deepStrictEqual(
      outputs.map((o) => o.id).sort(),
      [
        "grossRevenue",
        "listingFee",
        "netPayout",
        "offsiteAdsFee",
        "processingFee",
        "totalFees",
        "transactionFee",
      ],
    );
  });
});

describe("runTool — meta.ts input contracts", () => {
  it("sellerCountry select offers the six supported countries", () => {
    const country = inputs.find((i) => i.id === "sellerCountry");
    assert.ok(country, "sellerCountry input must exist");
    assert.deepStrictEqual(country!.options, ["US", "UK", "DE", "FR", "CA", "AU"]);
  });

  it("offsiteAdsTier options match the logic constants exactly", () => {
    const tier = inputs.find((i) => i.id === "offsiteAdsTier");
    assert.ok(tier, "offsiteAdsTier input must exist");
    assert.deepStrictEqual(tier!.options, [...OFFSITE_TIER_OPTIONS]);
  });

  it("meta discloses the regulatory-fee exclusion in methodology, assumptions, and FAQ", () => {
    assert.ok(
      String(content.methodology).toLowerCase().includes("regulatory"),
      "methodology must disclose the regulatory fee exclusion",
    );
    assert.ok(
      (content.assumptions ?? []).some((a) =>
        a.toLowerCase().includes("regulatory operating fee"),
      ),
      "assumptions must disclose the regulatory fee exclusion",
    );
    assert.ok(
      content.faqs.some(
        (f) =>
          f.question.toLowerCase().includes("how to calculate etsy") &&
          f.answer.toLowerCase().includes("regulatory"),
      ),
      "the fee-breakdown FAQ must disclose the regulatory fee exclusion",
    );
  });
});
