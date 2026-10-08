/**
 * Tests for the Usage Rights Fee Estimator pure logic (tool-455).
 *
 * Run: node --test app/tools/creator-business/usage-rights-fee-estimator/logic.test.ts
 *
 * All expected values are hand-computed, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { estimateUsageRights, runTool } from "./logic.ts";

describe("estimateUsageRights — normal cases", () => {
  it("computes usage fee = 500 × 2 × 1.5 × 2 = 3000, total 3600 with 20% exclusivity", () => {
    // factor = 2*1.5*2 = 6; usageFee = 3000; excl = 500*0.2 = 100; total = 3600.
    const r = estimateUsageRights({
      baseCreativeFee: 500,
      durationMonths: 12,
      durationMultiplier: 2,
      territoryMultiplier: 1.5,
      mediaChannelMultiplier: 2,
      exclusivityAddOnPct: 20,
    });
    assert.strictEqual(r.estimatedUsageFee, 3000);
    assert.strictEqual(r.totalWithBase, 3600);
    assert.ok(Array.isArray(r.factorBreakdown) && r.factorBreakdown.length >= 5, "breakdown listed");
    assert.ok(r.factorBreakdown.some((l) => l.includes("× 2 × 1.5 × 2 = × 6")), "combined factor shown");
    assert.ok(r.note.includes("ESTIMATE"), "labeled as estimate");
    assert.ok(r.note.includes("your own pricing assumption"), "honest about user factors");
  });

  it("defaults exclusivityAddOnPct to 0", () => {
    // usageFee = 1000 * 1.25 * 1 = 1250; total = 2250.
    const r = estimateUsageRights({
      baseCreativeFee: 1000,
      durationMonths: 6,
      durationMultiplier: 1.25,
      territoryMultiplier: 1,
      mediaChannelMultiplier: 1,
    });
    assert.strictEqual(r.estimatedUsageFee, 1250);
    assert.strictEqual(r.totalWithBase, 2250);
    assert.ok(r.factorBreakdown.some((l) => l.includes("Exclusivity add-on: 0%")), "exclusivity shown as 0%");
  });

  it("identity multipliers leave the usage fee equal to the base", () => {
    // factor = 1; usageFee = 800; total = 1600.
    const r = estimateUsageRights({
      baseCreativeFee: 800,
      durationMonths: 3,
      durationMultiplier: 1,
      territoryMultiplier: 1,
      mediaChannelMultiplier: 1,
      exclusivityAddOnPct: 0,
    });
    assert.strictEqual(r.estimatedUsageFee, 800);
    assert.strictEqual(r.totalWithBase, 1600);
  });

  it("rounds fractional results to cents", () => {
    // usageFee = 333.33 * 1.5 * 1.5 * 1.5 = 1124.98875 -> 1124.99.
    const r = estimateUsageRights({
      baseCreativeFee: 333.33,
      durationMonths: 12,
      durationMultiplier: 1.5,
      territoryMultiplier: 1.5,
      mediaChannelMultiplier: 1.5,
      exclusivityAddOnPct: 0,
    });
    assert.strictEqual(r.estimatedUsageFee, 1124.99);
    assert.strictEqual(r.totalWithBase, 1458.32);
  });

  it("zero multipliers produce $0 with a data-entry warning", () => {
    const r = estimateUsageRights({
      baseCreativeFee: 500,
      durationMonths: 12,
      durationMultiplier: 0,
      territoryMultiplier: 1.5,
      mediaChannelMultiplier: 2,
      exclusivityAddOnPct: 0,
    });
    assert.strictEqual(r.estimatedUsageFee, 0);
    assert.strictEqual(r.totalWithBase, 500);
    assert.ok(r.note.includes("Warning"), "zero-multiplier warning");
    assert.ok(r.note.includes("duration"), "names the zero factor");
  });

  it("base fee 0 gives a $0 total without warnings", () => {
    const r = estimateUsageRights({
      baseCreativeFee: 0,
      durationMonths: 12,
      durationMultiplier: 2,
      territoryMultiplier: 2,
      mediaChannelMultiplier: 2,
      exclusivityAddOnPct: 10,
    });
    assert.strictEqual(r.estimatedUsageFee, 0);
    assert.strictEqual(r.totalWithBase, 0);
    assert.ok(!r.note.includes("Warning"), "no false warning");
  });
});

describe("estimateUsageRights — validation", () => {
  it("rejects negative multipliers", () => {
    assert.throws(
      () =>
        estimateUsageRights({
          baseCreativeFee: 500,
          durationMonths: 12,
          durationMultiplier: -1,
          territoryMultiplier: 1,
          mediaChannelMultiplier: 1,
        }),
      /durationMultiplier: must be >= 0/,
    );
  });

  it("rejects exclusivity percent above 100", () => {
    assert.throws(
      () =>
        estimateUsageRights({
          baseCreativeFee: 500,
          durationMonths: 12,
          durationMultiplier: 1,
          territoryMultiplier: 1,
          mediaChannelMultiplier: 1,
          exclusivityAddOnPct: 120,
        }),
      /between 0 and 100/,
    );
  });

  it("rejects NaN and Infinity", () => {
    assert.throws(
      () =>
        estimateUsageRights({
          baseCreativeFee: Number.NaN,
          durationMonths: 12,
          durationMultiplier: 1,
          territoryMultiplier: 1,
          mediaChannelMultiplier: 1,
        }),
      /must be a number/,
    );
    assert.throws(
      () =>
        estimateUsageRights({
          baseCreativeFee: 500,
          durationMonths: 12,
          durationMultiplier: 1,
          territoryMultiplier: Number.POSITIVE_INFINITY,
          mediaChannelMultiplier: 1,
        }),
      /must be finite/,
    );
  });

  it("rejects missing required inputs", () => {
    // @ts-expect-error testing missing fields
    assert.throws(() => estimateUsageRights({}), /baseCreativeFee: must be a number/);
  });
});

describe("runTool — adapter", () => {
  it("passes through a valid run", () => {
    const out = runTool({
      baseCreativeFee: 500,
      durationMonths: 12,
      durationMultiplier: 2,
      territoryMultiplier: 1.5,
      mediaChannelMultiplier: 2,
      exclusivityAddOnPct: 20,
    });
    assert.strictEqual(out.ok, true);
    assert.deepStrictEqual(Object.keys(out.values!).sort(), [
      "estimatedUsageFee",
      "factorBreakdown",
      "note",
      "totalWithBase",
    ]);
    assert.strictEqual(out.values!.estimatedUsageFee, 3000);
    assert.strictEqual(out.values!.totalWithBase, 3600);
  });

  it("returns ok:false with a human error on invalid input", () => {
    const out = runTool({
      baseCreativeFee: 500,
      durationMonths: 12,
      durationMultiplier: -2,
      territoryMultiplier: 1,
      mediaChannelMultiplier: 1,
    });
    assert.strictEqual(out.ok, false);
    assert.ok(out.error!.includes("durationMultiplier"), "names the bad field");
    assert.ok(!out.error!.includes("at Object"), "no stack leakage");
  });

  it("returns ok:false with a human error on missing input", () => {
    const out = runTool({ durationMonths: 12 });
    assert.strictEqual(out.ok, false);
    assert.ok(out.error!.includes("baseCreativeFee"), "names the missing field");
  });

  it("surfaces the zero-multiplier warning through the adapter", () => {
    const out = runTool({
      baseCreativeFee: 500,
      durationMonths: 12,
      durationMultiplier: 0,
      territoryMultiplier: 1,
      mediaChannelMultiplier: 1,
    });
    assert.strictEqual(out.ok, true);
    assert.ok((out.values!.note as string).includes("Warning"), "warning surfaced");
  });
});
