/**
 * Tests for the Raptive Revenue Estimator pure logic (tool-052).
 *
 * Run: node --test app/tools/make-money/raptive-revenue-estimator/logic.test.ts
 *
 * Expected values are hand-computed from the documented formula, never
 * copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  round2,
  DEFAULT_PAGE_RPM,
  RAPTIVE_ELIGIBILITY_THRESHOLD,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const okValues = (input: Record<string, unknown>): Record<string, unknown> => {
  const r = runTool(input);
  assert.strictEqual(r.ok, true, `expected ok, got error: ${r.error}`);
  return r.values as Record<string, unknown>;
};

describe("raptive — happy path", () => {
  it("computes earnings for 120000 pageviews at default RPM 30", () => {
    // 120000 * 30 / 1000 = 3600; low = 2160; high = 5760; no warning.
    const v = okValues({ monthlyPageviews: 120000 });
    assert.strictEqual(v.estimatedMonthlyEarnings, 3600);
    assert.strictEqual(v.earningsRangeLow, 2160);
    assert.strictEqual(v.earningsRangeHigh, 5760);
    assert.strictEqual(v.eligibilityWarning, "");
  });

  it("uses a user-supplied RPM", () => {
    // 200000 * 45 / 1000 = 9000; low = 5400; high = 14400.
    const v = okValues({ monthlyPageviews: 200000, pageRpm: 45 });
    assert.strictEqual(v.estimatedMonthlyEarnings, 9000);
    assert.strictEqual(v.earningsRangeLow, 5400);
    assert.strictEqual(v.earningsRangeHigh, 14400);
  });

  it("handles fractional RPM with cent rounding", () => {
    // 187765 * 28.5 / 1000 = 5351.3025 -> 5351.30; low = 3210.78; high = 8562.08.
    const v = okValues({ monthlyPageviews: 187765, pageRpm: 28.5 });
    assert.strictEqual(v.estimatedMonthlyEarnings, 5351.3);
    assert.strictEqual(v.earningsRangeLow, 3210.78);
    assert.strictEqual(v.earningsRangeHigh, 8562.08);
    assert.strictEqual(v.eligibilityWarning, "");
  });

  it("accepts RPM at the sanity-band edges (1 and 200)", () => {
    const lo = okValues({ monthlyPageviews: 100000, pageRpm: 1 });
    assert.strictEqual(lo.estimatedMonthlyEarnings, 100);
    const hi = okValues({ monthlyPageviews: 100000, pageRpm: 200 });
    assert.strictEqual(hi.estimatedMonthlyEarnings, 20000);
  });

  it("treats null/empty RPM as the default benchmark estimate", () => {
    const a = okValues({ monthlyPageviews: 100000, pageRpm: null });
    assert.strictEqual(a.estimatedMonthlyEarnings, 3000); // 100000*30/1000
  });
});

describe("raptive — edge cases from spec", () => {
  it("zero pageviews -> $0 earnings (valid, not an error)", () => {
    const v = okValues({ monthlyPageviews: 0 });
    assert.strictEqual(v.estimatedMonthlyEarnings, 0);
    assert.strictEqual(v.earningsRangeLow, 0);
    assert.strictEqual(v.earningsRangeHigh, 0);
    // Zero is below the threshold, so the warning fires too.
    assert.ok(String(v.eligibilityWarning).length > 0);
  });

  it("below 100k pageviews -> eligibility warning is returned", () => {
    const v = okValues({ monthlyPageviews: 99999 });
    assert.ok(String(v.eligibilityWarning).includes("100,000"));
    assert.ok(String(v.eligibilityWarning).includes("99,999"));
    // Earnings are still computed alongside the warning.
    assert.strictEqual(v.estimatedMonthlyEarnings, 2999.97);
  });

  it("at exactly 100k pageviews -> no warning", () => {
    const v = okValues({ monthlyPageviews: RAPTIVE_ELIGIBILITY_THRESHOLD });
    assert.strictEqual(v.eligibilityWarning, "");
  });

  it("flags RPM outside the 1-200 sanity band as invalid", () => {
    for (const bad of [0, 0.5, 201, 1500]) {
      const r = runTool({ monthlyPageviews: 120000, pageRpm: bad });
      assert.strictEqual(r.ok, false, `RPM ${bad} should be rejected`);
      assert.ok(String(r.error).includes("sanity band"));
    }
  });

  it("accepts large pageview counts", () => {
    // 25_000_000 * 30 / 1000 = 750000; low = 450000; high = 1200000.
    const v = okValues({ monthlyPageviews: 25000000 });
    assert.strictEqual(v.estimatedMonthlyEarnings, 750000);
    assert.strictEqual(v.earningsRangeLow, 450000);
    assert.strictEqual(v.earningsRangeHigh, 1200000);
  });
});

describe("raptive — validation errors", () => {
  it("rejects missing monthlyPageviews", () => {
    const r = runTool({});
    assert.strictEqual(r.ok, false);
    assert.ok(String(r.error).includes("Monthly pageviews"));
  });

  it("rejects non-numeric monthlyPageviews", () => {
    for (const bad of ["120000", NaN, Infinity, undefined, false]) {
      const r = runTool({ monthlyPageviews: bad });
      assert.strictEqual(r.ok, false, `pageviews=${String(bad)} should fail`);
    }
  });

  it("rejects negative pageviews", () => {
    const r = runTool({ monthlyPageviews: -1 });
    assert.strictEqual(r.ok, false);
    assert.ok(String(r.error).includes("negative"));
  });

  it("rejects non-numeric or non-finite RPM", () => {
    for (const bad of ["30", NaN, Infinity]) {
      const r = runTool({ monthlyPageviews: 120000, pageRpm: bad });
      assert.strictEqual(r.ok, false, `rpm=${String(bad)} should fail`);
    }
  });

  it("rejects a non-object input", () => {
    const r = runTool("nope" as unknown as Record<string, unknown>);
    assert.strictEqual(r.ok, false);
  });
});

describe("raptive — determinism", () => {
  it("run twice with same inputs -> identical outputs", () => {
    const input = { monthlyPageviews: 65432, pageRpm: 33.3 };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepStrictEqual(a, b);
  });
});

describe("raptive — output ids match meta.ts outputs", () => {
  it("runTool returns exactly the ids declared in meta outputs", () => {
    const metaIds = outputs.map((o) => o.id).sort();
    const v = okValues({ monthlyPageviews: 120000 });
    const resultIds = Object.keys(v).sort();
    assert.deepStrictEqual(resultIds, metaIds);
  });

  it("meta declares the expected output ids", () => {
    const ids = outputs.map((o) => o.id);
    assert.deepStrictEqual(ids.sort(), [
      "earningsRangeHigh",
      "earningsRangeLow",
      "eligibilityWarning",
      "estimatedMonthlyEarnings",
    ]);
  });
});

describe("raptive — constants", () => {
  it("documents the default RPM benchmark estimate and threshold", () => {
    assert.strictEqual(DEFAULT_PAGE_RPM, 30);
    assert.strictEqual(RAPTIVE_ELIGIBILITY_THRESHOLD, 100000);
    assert.strictEqual(round2(2501.3025), 2501.3);
  });
});
