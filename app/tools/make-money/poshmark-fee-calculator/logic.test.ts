/**
 * Tests for the Poshmark Fee Calculator pure logic (tool-058).
 *
 * Run: node --test app/tools/make-money/poshmark-fee-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the inputs and the documented
 * defaults (never copied from tool output). Commission figures are the
 * EDITABLE ESTIMATES the spec requires — tests assert the two-tier math.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  calculatePoshmarkFee,
  roundToCents,
  FEE_THRESHOLD,
  DEFAULT_FLAT_FEE,
  DEFAULT_PERCENT_FEE,
  OUTPUT_IDS,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

describe("runTool — percent tier at/above $15", () => {
  it("charges 20% on a $20 sale", () => {
    // fee=20*0.20=4.00; net=16.00.
    const r = runTool({ salePrice: 20 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.poshmarkFee, 4);
    assert.strictEqual(r.values!.netPayout, 16);
  });

  it("applies the 20% tier at exactly $15", () => {
    // fee=15*0.20=3.00; net=12.00.
    const r = runTool({ salePrice: 15 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.poshmarkFee, 3);
    assert.strictEqual(r.values!.netPayout, 12);
  });

  it("applies the 20% tier just above $15", () => {
    // fee=15.01*0.20=3.002->3.00; net=15.01-3.00=12.01.
    const r = runTool({ salePrice: 15.01 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.poshmarkFee, 3);
    assert.strictEqual(r.values!.netPayout, 12.01);
  });
});

describe("runTool — flat tier below $15", () => {
  it("charges the $2.95 flat fee on a $10 sale", () => {
    // fee=2.95; net=7.05.
    const r = runTool({ salePrice: 10 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.poshmarkFee, 2.95);
    assert.strictEqual(r.values!.netPayout, 7.05);
  });

  it("flat fee can exceed 20% on tiny sales", () => {
    // $5 sale: fee=2.95 (59% of the sale); net=2.05.
    const r = runTool({ salePrice: 5 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.poshmarkFee, 2.95);
    assert.strictEqual(r.values!.netPayout, 2.05);
  });

  it("applies the flat fee just below $15", () => {
    // 14.99 < 15 -> flat 2.95; net=12.04.
    const r = runTool({ salePrice: 14.99 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.poshmarkFee, 2.95);
    assert.strictEqual(r.values!.netPayout, 12.04);
  });
});

describe("runTool — shipping discount", () => {
  it("reduces the payout dollar-for-dollar", () => {
    // $50 sale: fee=10; discount=5; net=35.
    const r = runTool({ salePrice: 50, shippingDiscount: 5 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.poshmarkFee, 10);
    assert.strictEqual(r.values!.netPayout, 35);
  });

  it("defaults the shipping discount to 0", () => {
    const r = runTool({ salePrice: 30 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.netPayout, 24);
  });

  it("shows a negative payout when the discount exceeds the payout", () => {
    // $10 sale: fee=2.95; discount=10; net=-2.95.
    const r = runTool({ salePrice: 10, shippingDiscount: 10 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.netPayout, -2.95);
  });
});

describe("runTool — user-editable rates", () => {
  it("honors a custom percent fee", () => {
    // salePrice=40, percentFee=25 -> fee=10; net=30.
    const r = runTool({ salePrice: 40, percentFeeAtOrOver15: 25 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.poshmarkFee, 10);
    assert.strictEqual(r.values!.netPayout, 30);
  });

  it("honors a custom flat fee", () => {
    // salePrice=10, flatFeeUnder15=3.5 -> fee=3.50; net=6.50.
    const r = runTool({ salePrice: 10, flatFeeUnder15: 3.5 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.poshmarkFee, 3.5);
    assert.strictEqual(r.values!.netPayout, 6.5);
  });
});

describe("runTool — validation errors", () => {
  it("rejects zero sale price", () => {
    const r = runTool({ salePrice: 0 });
    assert.strictEqual(r.ok, false);
    assert.ok(/greater than 0/.test(r.error!));
  });

  it("rejects negative sale price", () => {
    const r = runTool({ salePrice: -20 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects non-numeric sale price", () => {
    const r = runTool({ salePrice: "free" });
    assert.strictEqual(r.ok, false);
  });

  it("rejects negative shipping discount", () => {
    const r = runTool({ salePrice: 20, shippingDiscount: -1 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects negative flat fee", () => {
    const r = runTool({ salePrice: 10, flatFeeUnder15: -1 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a zero percent fee", () => {
    const r = runTool({ salePrice: 20, percentFeeAtOrOver15: 0 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a percent fee above 100", () => {
    const r = runTool({ salePrice: 20, percentFeeAtOrOver15: 101 });
    assert.strictEqual(r.ok, false);
  });
});

describe("runTool — determinism", () => {
  it("returns identical results for identical inputs", () => {
    const input = { salePrice: 27.77, shippingDiscount: 2.5, percentFeeAtOrOver15: 20 };
    assert.deepStrictEqual(runTool(input), runTool(input));
  });
});

describe("runTool — output ids match meta.ts outputs", () => {
  it("every runTool output key exists in meta outputs", () => {
    const r = runTool({ salePrice: 25 });
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
    assert.strictEqual(FEE_THRESHOLD, 15);
    assert.strictEqual(DEFAULT_FLAT_FEE, 2.95);
    assert.strictEqual(DEFAULT_PERCENT_FEE, 20);
  });

  it("roundToCents rounds half-up", () => {
    assert.strictEqual(roundToCents(2.345), 2.35);
    assert.strictEqual(roundToCents(2.344), 2.34);
  });

  it("assumptions label the commission as an estimate and note processing", () => {
    const b = calculatePoshmarkFee({
      salePrice: 30,
      shippingDiscount: 0,
      flatFeeUnder15: DEFAULT_FLAT_FEE,
      percentFeeAtOrOver15: DEFAULT_PERCENT_FEE,
    });
    assert.ok(b.assumptions.some((a) => /estimate/i.test(a)));
    assert.ok(
      b.assumptions.some((a) => /payment processing is included/i.test(a)),
      "must state processing is included in the commission",
    );
  });
});
