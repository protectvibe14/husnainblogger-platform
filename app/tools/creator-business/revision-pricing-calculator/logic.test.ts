/**
 * Tests for the Revision Pricing Calculator pure logic (tool-461).
 *
 * Run: node --test app/tools/creator-business/revision-pricing-calculator/logic.test.ts
 *
 * All expected values are hand-computed from the spec formula J-REVISION,
 * never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateRevisionPricing, runTool } from "./logic.ts";

describe("calculateRevisionPricing — pct-of-fee mode", () => {
  it("$1,000 fee, 2 included, 5 requested, 10% per extra revision", () => {
    // extra = 3; fee = 1000 * 0.10 * 3 = 300; total = 1300.
    const r = calculateRevisionPricing({
      baseProjectFee: 1000,
      includedRevisions: 2,
      requestedRevisions: 5,
      pricingMode: "pct-of-fee",
      revisionPct: 10,
    });
    assert.strictEqual(r.extraRevisionCount, 3);
    assert.strictEqual(r.revisionFee, 300);
    assert.strictEqual(r.newProjectTotal, 1300);
    assert.ok(r.note.includes("3 extra revision(s)"));
  });

  it("requested <= included: fee is $0", () => {
    const r = calculateRevisionPricing({
      baseProjectFee: 1000,
      includedRevisions: 3,
      requestedRevisions: 2,
      pricingMode: "pct-of-fee",
      revisionPct: 15,
    });
    assert.strictEqual(r.extraRevisionCount, 0);
    assert.strictEqual(r.revisionFee, 0);
    assert.strictEqual(r.newProjectTotal, 1000);
    assert.ok(r.note.includes("no extra fee"));
  });

  it("requested == included: fee is $0", () => {
    const r = calculateRevisionPricing({
      baseProjectFee: 500,
      includedRevisions: 2,
      requestedRevisions: 2,
      pricingMode: "pct-of-fee",
      revisionPct: 20,
    });
    assert.strictEqual(r.extraRevisionCount, 0);
    assert.strictEqual(r.revisionFee, 0);
    assert.strictEqual(r.newProjectTotal, 500);
  });

  it("0% pct flags free revisions with a prompt note", () => {
    // extra = 1; fee = 500 * 0 * 1 = 0; total = 500.
    const r = calculateRevisionPricing({
      baseProjectFee: 500,
      includedRevisions: 1,
      requestedRevisions: 2,
      pricingMode: "pct-of-fee",
      revisionPct: 0,
    });
    assert.strictEqual(r.revisionFee, 0);
    assert.ok(r.note.includes("FREE"));
    assert.ok(r.note.includes("Double-check"));
  });

  it("rounds fractional fees to cents", () => {
    // fee = 333.33 * 0.075 * 2 = 49.9995 -> 50.00; total = 383.33.
    const r = calculateRevisionPricing({
      baseProjectFee: 333.33,
      includedRevisions: 1,
      requestedRevisions: 3,
      pricingMode: "pct-of-fee",
      revisionPct: 7.5,
    });
    assert.strictEqual(r.revisionFee, 50);
    assert.strictEqual(r.newProjectTotal, 383.33);
  });
});

describe("calculateRevisionPricing — flat-per-revision mode", () => {
  it("$2,000 fee, 1 included, 4 requested, $75 flat per revision", () => {
    // extra = 3; fee = 75 * 3 = 225; total = 2225.
    const r = calculateRevisionPricing({
      baseProjectFee: 2000,
      includedRevisions: 1,
      requestedRevisions: 4,
      pricingMode: "flat-per-revision",
      flatPerRevision: 75,
    });
    assert.strictEqual(r.extraRevisionCount, 3);
    assert.strictEqual(r.revisionFee, 225);
    assert.strictEqual(r.newProjectTotal, 2225);
  });

  it("flat mode with zero extras: fee $0", () => {
    const r = calculateRevisionPricing({
      baseProjectFee: 800,
      includedRevisions: 5,
      requestedRevisions: 5,
      pricingMode: "flat-per-revision",
      flatPerRevision: 100,
    });
    assert.strictEqual(r.extraRevisionCount, 0);
    assert.strictEqual(r.revisionFee, 0);
    assert.strictEqual(r.newProjectTotal, 800);
  });

  it("flat mode rounds fractional totals to cents", () => {
    // extra = 2; fee = 19.995 * 2 = 39.99; total = 299.99 + 39.99 = 339.98.
    const r = calculateRevisionPricing({
      baseProjectFee: 299.99,
      includedRevisions: 0,
      requestedRevisions: 2,
      pricingMode: "flat-per-revision",
      flatPerRevision: 19.995,
    });
    assert.strictEqual(r.revisionFee, 39.99);
    assert.strictEqual(r.newProjectTotal, 339.98);
  });
});

describe("calculateRevisionPricing — validation throws", () => {
  it("unknown pricingMode throws", () => {
    assert.throws(
      () =>
        calculateRevisionPricing({
          baseProjectFee: 100,
          includedRevisions: 1,
          requestedRevisions: 2,
          pricingMode: "hourly" as never,
        }),
      /pricingMode must be/,
    );
  });

  it("fractional revision counts throw", () => {
    assert.throws(
      () =>
        calculateRevisionPricing({
          baseProjectFee: 100,
          includedRevisions: 1.5,
          requestedRevisions: 2,
          pricingMode: "flat-per-revision",
          flatPerRevision: 50,
        }),
      /includedRevisions must be a whole number/,
    );
  });

  it("revisionPct above 100 throws", () => {
    assert.throws(
      () =>
        calculateRevisionPricing({
          baseProjectFee: 100,
          includedRevisions: 1,
          requestedRevisions: 2,
          pricingMode: "pct-of-fee",
          revisionPct: 101,
        }),
      /between 0 and 100/,
    );
  });

  it("negative base fee throws", () => {
    assert.throws(
      () =>
        calculateRevisionPricing({
          baseProjectFee: -100,
          includedRevisions: 1,
          requestedRevisions: 2,
          pricingMode: "flat-per-revision",
          flatPerRevision: 50,
        }),
      /baseProjectFee must be >= 0/,
    );
  });

  it("missing revisionPct in pct mode throws", () => {
    assert.throws(
      () =>
        calculateRevisionPricing({
          baseProjectFee: 100,
          includedRevisions: 1,
          requestedRevisions: 2,
          pricingMode: "pct-of-fee",
        }),
      /revisionPct must be a number/,
    );
  });

  it("NaN / Infinity / non-number throw TypeError", () => {
    assert.throws(
      () =>
        calculateRevisionPricing({
          baseProjectFee: NaN,
          includedRevisions: 1,
          requestedRevisions: 2,
          pricingMode: "flat-per-revision",
          flatPerRevision: 50,
        }),
      TypeError,
    );
    assert.throws(
      () =>
        calculateRevisionPricing({
          baseProjectFee: 100,
          includedRevisions: 1,
          requestedRevisions: Infinity,
          pricingMode: "flat-per-revision",
          flatPerRevision: 50,
        }),
      /must be finite/,
    );
  });
});

describe("runTool — shape and validation", () => {
  it("pct mode returns ok:true with the four spec output keys", () => {
    const res = runTool({
      baseProjectFee: 1000,
      includedRevisions: 2,
      requestedRevisions: 5,
      pricingMode: "pct-of-fee",
      revisionPct: 10,
    });
    assert.strictEqual(res.ok, true);
    assert.deepStrictEqual(Object.keys(res.values!).sort(), [
      "extraRevisionCount",
      "newProjectTotal",
      "note",
      "revisionFee",
    ]);
    assert.strictEqual(res.values!.extraRevisionCount, 3);
    assert.strictEqual(res.values!.revisionFee, 300);
    assert.strictEqual(res.values!.newProjectTotal, 1300);
  });

  it("flat mode returns the same four keys", () => {
    const res = runTool({
      baseProjectFee: 2000,
      includedRevisions: 1,
      requestedRevisions: 4,
      pricingMode: "flat-per-revision",
      flatPerRevision: 75,
    });
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.values!.revisionFee, 225);
    assert.strictEqual(res.values!.newProjectTotal, 2225);
  });

  it("missing pricingMode / baseProjectFee return human errors", () => {
    const v = {
      baseProjectFee: 1000,
      includedRevisions: 2,
      requestedRevisions: 5,
      revisionPct: 10,
    };
    assert.strictEqual(runTool(v).error, "pricingMode is required.");
    assert.strictEqual(
      runTool({ ...v, pricingMode: "pct-of-fee", baseProjectFee: "" }).error,
      "baseProjectFee is required.",
    );
  });

  it("invalid pricingMode value returns a human error", () => {
    const res = runTool({
      baseProjectFee: 1000,
      includedRevisions: 2,
      requestedRevisions: 5,
      pricingMode: "per-word",
    });
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error, 'pricingMode must be "pct-of-fee" or "flat-per-revision".');
  });

  it("missing mode-specific rate returns a human error", () => {
    const pctRes = runTool({
      baseProjectFee: 1000,
      includedRevisions: 2,
      requestedRevisions: 5,
      pricingMode: "pct-of-fee",
    });
    assert.strictEqual(pctRes.error, "revisionPct is required for the pct-of-fee mode.");
    const flatRes = runTool({
      baseProjectFee: 1000,
      includedRevisions: 2,
      requestedRevisions: 5,
      pricingMode: "flat-per-revision",
    });
    assert.strictEqual(flatRes.error, "flatPerRevision is required for the flat-per-revision mode.");
  });

  it("revisionPct above 100 returns a human error", () => {
    const res = runTool({
      baseProjectFee: 1000,
      includedRevisions: 2,
      requestedRevisions: 5,
      pricingMode: "pct-of-fee",
      revisionPct: 120,
    });
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error, "revisionPct must be between 0 and 100.");
  });

  it("fractional revisions return a human error", () => {
    const res = runTool({
      baseProjectFee: 1000,
      includedRevisions: 2.5,
      requestedRevisions: 5,
      pricingMode: "pct-of-fee",
      revisionPct: 10,
    });
    assert.strictEqual(res.error, "includedRevisions must be a whole number.");
  });

  it("non-object input returns a human error", () => {
    assert.strictEqual(runTool(null as never).error, "Input must be an object.");
  });
});
