/**
 * Tests for the Rush Fee Calculator pure logic (tool-454).
 *
 * Run: node --test app/tools/creator-business/rush-fee-calculator/logic.test.ts
 *
 * All expected values are hand-computed, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { calculateRushFee, runTool } from "./logic.ts";

describe("calculateRushFee — normal cases", () => {
  it("computes 25% of $1000 = $250 fee, $1250 total", () => {
    // fee = 1000 * 0.25 = 250; total = 1250.
    const r = calculateRushFee({ baseProjectPrice: 1000, rushPct: 25 });
    assert.strictEqual(r.rushFeeAmount, 250);
    assert.strictEqual(r.rushTotal, 1250);
    assert.strictEqual(r.rushFeeAsPctOfBase, 25);
    assert.strictEqual(r.note, "");
  });

  it("handles fractional percentages with rounding", () => {
    // fee = 499.99 * 0.125 = 62.49875 -> 62.50; total = 562.49.
    const r = calculateRushFee({ baseProjectPrice: 499.99, rushPct: 12.5 });
    assert.strictEqual(r.rushFeeAmount, 62.5);
    assert.strictEqual(r.rushTotal, 562.49);
  });

  it("rushPct = 0 leaves the total equal to the base", () => {
    const r = calculateRushFee({ baseProjectPrice: 1200, rushPct: 0 });
    assert.strictEqual(r.rushFeeAmount, 0);
    assert.strictEqual(r.rushTotal, 1200);
    assert.strictEqual(r.rushFeeAsPctOfBase, 0);
    assert.strictEqual(r.note, "");
  });

  it("base price 0 gives zero fee and total", () => {
    const r = calculateRushFee({ baseProjectPrice: 0, rushPct: 50 });
    assert.strictEqual(r.rushFeeAmount, 0);
    assert.strictEqual(r.rushTotal, 0);
  });

  it("100% doubles the base", () => {
    const r = calculateRushFee({ baseProjectPrice: 750, rushPct: 100 });
    assert.strictEqual(r.rushFeeAmount, 750);
    assert.strictEqual(r.rushTotal, 1500);
    assert.strictEqual(r.note, "", "100% is still accepted silently");
  });

  it("flags a caution note above 100% (but still computes)", () => {
    // fee = 400 * 1.5 = 600; total = 1000.
    const r = calculateRushFee({ baseProjectPrice: 400, rushPct: 150 });
    assert.strictEqual(r.rushFeeAmount, 600);
    assert.strictEqual(r.rushTotal, 1000);
    assert.ok(r.note.length > 0, "caution note set");
    assert.ok(r.note.includes("100%"), "note explains the threshold");
  });

  it("accepts exactly 200% at the top of the range", () => {
    // fee = 300 * 2 = 600; total = 900.
    const r = calculateRushFee({ baseProjectPrice: 300, rushPct: 200 });
    assert.strictEqual(r.rushFeeAmount, 600);
    assert.strictEqual(r.rushTotal, 900);
  });
});

describe("calculateRushFee — validation", () => {
  it("rejects rushPct above 200 as a likely typo", () => {
    assert.throws(
      () => calculateRushFee({ baseProjectPrice: 500, rushPct: 250 }),
      /typo/,
    );
  });

  it("rejects negative rushPct", () => {
    assert.throws(
      () => calculateRushFee({ baseProjectPrice: 500, rushPct: -5 }),
      /must be >= 0/,
    );
  });

  it("rejects negative base price", () => {
    assert.throws(
      () => calculateRushFee({ baseProjectPrice: -10, rushPct: 25 }),
      /must be >= 0/,
    );
  });

  it("rejects NaN and Infinity", () => {
    assert.throws(
      () => calculateRushFee({ baseProjectPrice: Number.NaN, rushPct: 25 }),
      /must be a number/,
    );
    assert.throws(
      () => calculateRushFee({ baseProjectPrice: 100, rushPct: Number.POSITIVE_INFINITY }),
      /must be finite/,
    );
  });

  it("rejects missing inputs", () => {
    // @ts-expect-error testing missing fields
    assert.throws(() => calculateRushFee({}), /must be a number/);
  });
});

describe("runTool — adapter", () => {
  it("passes through a valid run", () => {
    const out = runTool({ baseProjectPrice: 1000, rushPct: 25 });
    assert.strictEqual(out.ok, true);
    assert.deepStrictEqual(Object.keys(out.values!).sort(), [
      "note",
      "rushFeeAmount",
      "rushFeeAsPctOfBase",
      "rushTotal",
    ]);
    assert.strictEqual(out.values!.rushFeeAmount, 250);
    assert.strictEqual(out.values!.rushTotal, 1250);
  });

  it("returns ok:false with a human error for a typo-level percentage", () => {
    const out = runTool({ baseProjectPrice: 100, rushPct: 250 });
    assert.strictEqual(out.ok, false);
    assert.ok(out.error!.includes("typo"), "human message, no jargon");
  });

  it("returns ok:false with a human error on missing base price", () => {
    const out = runTool({ rushPct: 25 });
    assert.strictEqual(out.ok, false);
    assert.ok(out.error!.includes("baseProjectPrice"), "names the missing field");
  });

  it("returns the caution note through the adapter above 100%", () => {
    const out = runTool({ baseProjectPrice: 400, rushPct: 150 });
    assert.strictEqual(out.ok, true);
    assert.ok((out.values!.note as string).length > 0, "note surfaced");
  });
});
