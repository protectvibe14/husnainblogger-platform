/**
 * Tests for break-even-roas-calculator logic (tool-099).
 * node:test + node:assert only. Run from the husnainblogger-platform root:
 *   node --test app/tools/make-money/break-even-roas-calculator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DISCLAIMER_TEXT, calculateBreakEvenRoas, runTool } from "./logic.ts";

const EXPECTED_OUTPUT_IDS = ["actualROAS", "breakEvenROAS", "disclaimer", "verdict"].sort();

describe("calculateBreakEvenRoas — happy path", () => {
  it("40% margin -> 2.50x break-even; 3200/1000 = 3.20x actual -> profitable", () => {
    const r = calculateBreakEvenRoas({
      grossMarginPercent: 40,
      adSpend: 1000,
      revenue: 3200,
    });
    assert.equal(r.breakEvenRoas, 2.5);
    assert.equal(r.actualRoas, 3.2);
    assert.equal(r.profitable, true);
    assert.match(r.verdict, /profitable/i);
    assert.match(r.verdict, /3\.20x/);
    assert.match(r.verdict, /2\.50x/);
    assert.equal(r.disclaimer, DISCLAIMER_TEXT);
  });

  it("below break-even -> not profitable", () => {
    const r = calculateBreakEvenRoas({
      grossMarginPercent: 25,
      adSpend: 2000,
      revenue: 3000,
    });
    assert.equal(r.breakEvenRoas, 4); // 1 / 0.25
    assert.equal(r.actualRoas, 1.5);
    assert.equal(r.profitable, false);
    assert.match(r.verdict, /not profitable/i);
  });

  it("exactly at break-even counts as break-even, not losing", () => {
    const r = calculateBreakEvenRoas({
      grossMarginPercent: 50,
      adSpend: 500,
      revenue: 1000,
    });
    assert.equal(r.breakEvenRoas, 2);
    assert.equal(r.actualRoas, 2);
    assert.equal(r.profitable, true);
    assert.match(r.verdict, /at break-even/i);
  });

  it("ROAS = 1/margin holds for a fractional margin", () => {
    const r = calculateBreakEvenRoas({
      grossMarginPercent: 33.33,
      adSpend: 900,
      revenue: 2700,
    });
    // 1 / 0.3333 = 3.0003... -> 3.00
    assert.equal(r.breakEvenRoas, 3);
    assert.equal(r.actualRoas, 3);
  });

  it("100% margin -> 1.00x break-even", () => {
    const r = calculateBreakEvenRoas({
      grossMarginPercent: 100,
      adSpend: 100,
      revenue: 150,
    });
    assert.equal(r.breakEvenRoas, 1);
    assert.equal(r.actualRoas, 1.5);
    assert.equal(r.profitable, true);
  });

  it("tiny margin -> very high break-even", () => {
    const r = calculateBreakEvenRoas({
      grossMarginPercent: 2,
      adSpend: 100,
      revenue: 100,
    });
    assert.equal(r.breakEvenRoas, 50);
    assert.equal(r.actualRoas, 1);
    assert.equal(r.profitable, false);
  });
});

describe("calculateBreakEvenRoas — validation errors", () => {
  const good = { grossMarginPercent: 40, adSpend: 1000, revenue: 3200 };

  it("margin 0 -> RangeError (division by zero)", () => {
    assert.throws(
      () => calculateBreakEvenRoas({ ...good, grossMarginPercent: 0 }),
      (err: unknown) => err instanceof RangeError && /division by zero/i.test(err.message),
    );
  });

  it("margin negative throws RangeError", () => {
    assert.throws(
      () => calculateBreakEvenRoas({ ...good, grossMarginPercent: -5 }),
      RangeError,
    );
  });

  it("margin > 100 throws RangeError", () => {
    assert.throws(
      () => calculateBreakEvenRoas({ ...good, grossMarginPercent: 101 }),
      RangeError,
    );
  });

  it("adSpend 0 throws RangeError", () => {
    assert.throws(
      () => calculateBreakEvenRoas({ ...good, adSpend: 0 }),
      RangeError,
    );
  });

  it("adSpend negative throws RangeError", () => {
    assert.throws(
      () => calculateBreakEvenRoas({ ...good, adSpend: -10 }),
      RangeError,
    );
  });

  it("revenue 0 throws RangeError", () => {
    assert.throws(
      () => calculateBreakEvenRoas({ ...good, revenue: 0 }),
      RangeError,
    );
  });

  it("revenue negative throws RangeError", () => {
    assert.throws(
      () => calculateBreakEvenRoas({ ...good, revenue: -1 }),
      RangeError,
    );
  });

  it("margin NaN throws TypeError", () => {
    assert.throws(
      () => calculateBreakEvenRoas({ ...good, grossMarginPercent: Number.NaN }),
      TypeError,
    );
  });

  it("adSpend Infinity throws TypeError", () => {
    assert.throws(
      () => calculateBreakEvenRoas({ ...good, adSpend: Number.POSITIVE_INFINITY }),
      TypeError,
    );
  });

  it("non-object input throws TypeError", () => {
    assert.throws(() => calculateBreakEvenRoas(null as unknown as never), TypeError);
  });
});

describe("runTool adapter", () => {
  it("happy path returns ok:true with the meta output ids", () => {
    const r = runTool({ grossMarginPercent: 40, adSpend: 1000, revenue: 3200 });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), EXPECTED_OUTPUT_IDS);
    assert.equal(r.values?.["breakEvenROAS"], 2.5);
    assert.equal(r.values?.["actualROAS"], 3.2);
  });

  it("margin 0 returns ok:false with a division-by-zero message", () => {
    const r = runTool({ grossMarginPercent: 0, adSpend: 1000, revenue: 3200 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /undefined|margin/i);
  });

  it("adSpend 0 returns ok:false", () => {
    const r = runTool({ grossMarginPercent: 40, adSpend: 0, revenue: 3200 });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").length > 0);
  });

  it("missing inputs return ok:false", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });

  it("is deterministic: two runs give identical results", () => {
    const input = { grossMarginPercent: 37.5, adSpend: 1250, revenue: 4100 };
    assert.deepEqual(runTool(input), runTool(input));
  });
});
