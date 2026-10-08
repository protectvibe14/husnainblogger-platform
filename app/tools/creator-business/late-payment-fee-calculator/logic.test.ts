/**
 * Tests for the Late Payment Fee Calculator pure logic (tool-453).
 *
 * Run: node --test app/tools/creator-business/late-payment-fee-calculator/logic.test.ts
 *
 * All expected values are hand-computed, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { calculateLateFee, runTool, LATE_FEE_MODES } from "./logic.ts";

describe("calculateLateFee — percent-per-day mode", () => {
  it("computes 1%/day on $1000 for 30 days = $300 fee, $1300 total", () => {
    // fee = 1000 * 0.01 * 30 = 300; total = 1300.
    const r = calculateLateFee({
      invoiceAmount: 1000,
      feeMode: "percent-per-day",
      lateFeeRatePct: 1,
      daysLate: 30,
    });
    assert.strictEqual(r.lateFeeAmount, 300);
    assert.strictEqual(r.totalAmountDue, 1300);
    assert.ok(r.effectiveAnnualizedNote.includes("365"), "annualized note mentions 365");
    assert.ok(r.effectiveAnnualizedNote.includes("Informational"), "note labeled informational");
    assert.strictEqual(r.warning, "");
  });

  it("handles fractional rates and rounding", () => {
    // fee = 249.99 * 0.001 * 7 = 1.74993 -> 1.75; total = 251.74.
    const r = calculateLateFee({
      invoiceAmount: 249.99,
      feeMode: "percent-per-day",
      lateFeeRatePct: 0.1,
      daysLate: 7,
    });
    assert.strictEqual(r.lateFeeAmount, 1.75);
    assert.strictEqual(r.totalAmountDue, 251.74);
  });

  it("daysLate = 0 gives a $0 fee and no annualized figure", () => {
    const r = calculateLateFee({
      invoiceAmount: 500,
      feeMode: "percent-per-day",
      lateFeeRatePct: 2,
      daysLate: 0,
    });
    assert.strictEqual(r.lateFeeAmount, 0);
    assert.strictEqual(r.totalAmountDue, 500);
    assert.ok(r.effectiveAnnualizedNote.startsWith("No annualized equivalent"), "annualized N/A");
  });

  it("rate 0% gives $0 fee", () => {
    const r = calculateLateFee({
      invoiceAmount: 800,
      feeMode: "percent-per-day",
      lateFeeRatePct: 0,
      daysLate: 60,
    });
    assert.strictEqual(r.lateFeeAmount, 0);
    assert.strictEqual(r.totalAmountDue, 800);
  });

  it("warns when the fee exceeds the principal", () => {
    // fee = 200 * 0.05 * 30 = 300 > 200 principal.
    const r = calculateLateFee({
      invoiceAmount: 200,
      feeMode: "percent-per-day",
      lateFeeRatePct: 5,
      daysLate: 30,
    });
    assert.strictEqual(r.lateFeeAmount, 300);
    assert.ok(r.warning.includes("Warning"), "warning flag set");
    assert.ok(r.warning.includes("informational"), "warning labeled informational");
  });

  it("rejects lateFeeRatePct above 100", () => {
    assert.throws(
      () =>
        calculateLateFee({
          invoiceAmount: 100,
          feeMode: "percent-per-day",
          lateFeeRatePct: 150,
          daysLate: 5,
        }),
      /must be between 0 and 100/,
    );
  });

  it("rejects missing lateFeeRatePct in percent-per-day mode", () => {
    assert.throws(
      () =>
        calculateLateFee({
          invoiceAmount: 100,
          feeMode: "percent-per-day",
          daysLate: 5,
        }),
      /is required/,
    );
  });
});

describe("calculateLateFee — flat-plus-daily mode", () => {
  it("computes flat $25 + $5/day for 10 days = $75 fee, $575 total", () => {
    // fee = 25 + 5*10 = 75; total = 500 + 75 = 575.
    const r = calculateLateFee({
      invoiceAmount: 500,
      feeMode: "flat-plus-daily",
      flatFee: 25,
      dailyFee: 5,
      daysLate: 10,
    });
    assert.strictEqual(r.lateFeeAmount, 75);
    assert.strictEqual(r.totalAmountDue, 575);
    assert.strictEqual(r.warning, "");
  });

  it("defaults missing flatFee/dailyFee to 0", () => {
    const r = calculateLateFee({
      invoiceAmount: 500,
      feeMode: "flat-plus-daily",
      daysLate: 10,
    });
    assert.strictEqual(r.lateFeeAmount, 0);
    assert.strictEqual(r.totalAmountDue, 500);
  });

  it("daysLate = 0 leaves only the flat fee", () => {
    // fee = 25 + 5*0 = 25.
    const r = calculateLateFee({
      invoiceAmount: 500,
      feeMode: "flat-plus-daily",
      flatFee: 25,
      dailyFee: 5,
      daysLate: 0,
    });
    assert.strictEqual(r.lateFeeAmount, 25);
    assert.strictEqual(r.totalAmountDue, 525);
  });

  it("warns when flat fee exceeds the principal", () => {
    const r = calculateLateFee({
      invoiceAmount: 50,
      feeMode: "flat-plus-daily",
      flatFee: 75,
      daysLate: 0,
    });
    assert.ok(r.warning.includes("Warning"), "warning flag set");
  });
});

describe("calculateLateFee — validation", () => {
  it("rejects a negative invoice amount", () => {
    assert.throws(
      () => calculateLateFee({ invoiceAmount: -1, feeMode: "percent-per-day", lateFeeRatePct: 1, daysLate: 1 }),
      /must be >= 0/,
    );
  });

  it("rejects non-integer daysLate", () => {
    assert.throws(
      () => calculateLateFee({ invoiceAmount: 100, feeMode: "percent-per-day", lateFeeRatePct: 1, daysLate: 2.5 }),
      /integer/,
    );
  });

  it("rejects unknown feeMode", () => {
    assert.throws(
      () =>
        calculateLateFee({
          invoiceAmount: 100,
          // @ts-expect-error testing invalid mode
          feeMode: "weekly",
          daysLate: 1,
        }),
      /must be one of/,
    );
  });

  it("exposes the two supported modes", () => {
    assert.deepStrictEqual([...LATE_FEE_MODES], ["percent-per-day", "flat-plus-daily"]);
  });
});

describe("runTool — adapter", () => {
  it("passes through a valid percent-per-day run", () => {
    const out = runTool({
      invoiceAmount: 1000,
      feeMode: "percent-per-day",
      lateFeeRatePct: 1,
      daysLate: 30,
    });
    assert.strictEqual(out.ok, true);
    assert.deepStrictEqual(Object.keys(out.values!).sort(), [
      "effectiveAnnualizedNote",
      "lateFeeAmount",
      "totalAmountDue",
      "warning",
    ]);
    assert.strictEqual(out.values!.lateFeeAmount, 300);
  });

  it("returns ok:false with a human error on invalid input", () => {
    const out = runTool({
      invoiceAmount: 100,
      feeMode: "percent-per-day",
      lateFeeRatePct: 1,
      daysLate: -3,
    });
    assert.strictEqual(out.ok, false);
    assert.ok(typeof out.error === "string" && out.error.length > 0, "human error message");
    assert.ok(!out.error!.includes("RangeError"), "no stack/jargon leakage");
  });

  it("returns ok:false with a human error on missing required input", () => {
    const out = runTool({ feeMode: "percent-per-day", lateFeeRatePct: 1, daysLate: 5 });
    assert.strictEqual(out.ok, false);
    assert.ok(out.error!.includes("invoiceAmount"), "names the missing field");
  });
});
