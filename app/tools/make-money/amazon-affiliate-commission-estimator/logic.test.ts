/**
 * Tests for amazon-affiliate-commission-estimator logic (tool-096).
 * node:test + node:assert only. Run from the husnainblogger-platform root:
 *   node --test app/tools/make-money/amazon-affiliate-commission-estimator/logic.test.ts
 * (Node >= 22 strips erasable TypeScript syntax natively.)
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AMAZON_CATEGORIES,
  AMAZON_RATE_CARD,
  DISCLAIMER_TEXT,
  calculateAmazonCommission,
  runTool,
} from "./logic.ts";

const EXPECTED_OUTPUT_IDS = ["commissionRate", "disclaimer", "estimatedCommission"].sort();

describe("rate card", () => {
  it("has the 10 spec categories with the spec rates", () => {
    const expected: Record<string, number> = {
      "Games (20%)": 20,
      "Luxury Beauty (10%)": 10,
      "Music & Handmade (5%)": 5,
      "Books, Kitchen & Automotive (4.5%)": 4.5,
      "Devices & Fashion (4%)": 4,
      "Home (3%)": 3,
      "PC Components (2.5%)": 2.5,
      "TVs & Digital Video Games (2%)": 2,
      "Grocery & Health/Personal Care (1%)": 1,
      "All Other Categories (4%)": 4,
    };
    assert.deepEqual(AMAZON_RATE_CARD, expected);
    assert.equal(AMAZON_CATEGORIES.length, 10);
  });
});

describe("calculateAmazonCommission — happy path", () => {
  it("Games 20%: 100 sales x $50 AOV = $1,000", () => {
    const r = calculateAmazonCommission({
      category: "Games (20%)",
      monthlySales: 100,
      avgOrderValue: 50,
    });
    assert.equal(r.commissionRate, 20);
    assert.equal(r.estimatedCommission, 1000);
    assert.equal(r.disclaimer, DISCLAIMER_TEXT);
  });

  it("Grocery 1%: 1000 sales x $10 AOV = $100", () => {
    const r = calculateAmazonCommission({
      category: "Grocery & Health/Personal Care (1%)",
      monthlySales: 1000,
      avgOrderValue: 10,
    });
    assert.equal(r.commissionRate, 1);
    assert.equal(r.estimatedCommission, 100);
  });

  it("fractional rate 4.5% multiplies correctly", () => {
    const r = calculateAmazonCommission({
      category: "Books, Kitchen & Automotive (4.5%)",
      monthlySales: 200,
      avgOrderValue: 25,
    });
    // 200 * 25 * 0.045 = 225
    assert.equal(r.commissionRate, 4.5);
    assert.equal(r.estimatedCommission, 225);
  });

  it("rounds half-up to 2 decimals", () => {
    const r = calculateAmazonCommission({
      category: "Books, Kitchen & Automotive (4.5%)",
      monthlySales: 3,
      avgOrderValue: 33.33,
    });
    // 3 * 33.33 * 0.045 = 4.49955 -> 4.50
    assert.equal(r.estimatedCommission, 4.5);
  });

  it("accepts fractional monthly sales", () => {
    const r = calculateAmazonCommission({
      category: "Home (3%)",
      monthlySales: 10.5,
      avgOrderValue: 40,
    });
    assert.equal(r.estimatedCommission, 12.6);
  });

  it("every rate-card category computes without error", () => {
    for (const category of AMAZON_CATEGORIES) {
      const r = calculateAmazonCommission({
        category,
        monthlySales: 100,
        avgOrderValue: 20,
      });
      assert.equal(r.commissionRate, AMAZON_RATE_CARD[category]);
      assert.equal(
        r.estimatedCommission,
        Math.round(100 * 20 * (AMAZON_RATE_CARD[category] / 100) * 100) / 100,
      );
    }
  });
});

describe("calculateAmazonCommission — validation errors", () => {
  it("unknown category throws TypeError", () => {
    assert.throws(
      () =>
        calculateAmazonCommission({
          category: "Spaceships",
          monthlySales: 10,
          avgOrderValue: 10,
        }),
      TypeError,
    );
  });

  it("missing category throws TypeError", () => {
    assert.throws(
      () =>
        calculateAmazonCommission({
          category: undefined as unknown as string,
          monthlySales: 10,
          avgOrderValue: 10,
        }),
      TypeError,
    );
  });

  it("monthlySales = 0 throws RangeError", () => {
    assert.throws(
      () =>
        calculateAmazonCommission({
          category: "Games (20%)",
          monthlySales: 0,
          avgOrderValue: 10,
        }),
      RangeError,
    );
  });

  it("monthlySales negative throws RangeError", () => {
    assert.throws(
      () =>
        calculateAmazonCommission({
          category: "Games (20%)",
          monthlySales: -5,
          avgOrderValue: 10,
        }),
      RangeError,
    );
  });

  it("monthlySales NaN throws TypeError", () => {
    assert.throws(
      () =>
        calculateAmazonCommission({
          category: "Games (20%)",
          monthlySales: Number.NaN,
          avgOrderValue: 10,
        }),
      TypeError,
    );
  });

  it("monthlySales as a string throws TypeError", () => {
    assert.throws(
      () =>
        calculateAmazonCommission({
          category: "Games (20%)",
          monthlySales: "100" as unknown as number,
          avgOrderValue: 10,
        }),
      TypeError,
    );
  });

  it("avgOrderValue = 0 throws RangeError", () => {
    assert.throws(
      () =>
        calculateAmazonCommission({
          category: "Games (20%)",
          monthlySales: 10,
          avgOrderValue: 0,
        }),
      RangeError,
    );
  });

  it("avgOrderValue Infinity throws TypeError", () => {
    assert.throws(
      () =>
        calculateAmazonCommission({
          category: "Games (20%)",
          monthlySales: 10,
          avgOrderValue: Number.POSITIVE_INFINITY,
        }),
      TypeError,
    );
  });

  it("non-object input throws TypeError", () => {
    assert.throws(
      () => calculateAmazonCommission(null as unknown as never),
      TypeError,
    );
  });
});

describe("runTool adapter", () => {
  it("happy path returns ok:true with the meta output ids", () => {
    const r = runTool({
      category: "Luxury Beauty (10%)",
      monthlySales: 50,
      avgOrderValue: 120,
    });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), EXPECTED_OUTPUT_IDS);
    assert.equal(r.values?.["commissionRate"], 10);
    assert.equal(r.values?.["estimatedCommission"], 600);
  });

  it("bad category returns ok:false with a human message", () => {
    const r = runTool({
      category: "Nope",
      monthlySales: 10,
      avgOrderValue: 10,
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /category/i);
  });

  it("zero sales returns ok:false", () => {
    const r = runTool({
      category: "Games (20%)",
      monthlySales: 0,
      avgOrderValue: 10,
    });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").length > 0);
  });

  it("missing inputs return ok:false", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").length > 0);
  });

  it("is deterministic: two runs give identical results", () => {
    const input = {
      category: "PC Components (2.5%)",
      monthlySales: 137,
      avgOrderValue: 89.99,
    };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepEqual(a, b);
  });
});
