/**
 * Tests for the Mediavine Earnings Calculator pure logic (tool-051).
 *
 * Run: node --test app/tools/make-money/mediavine-earnings-calculator/logic.test.ts
 *
 * Expected values are hand-computed from the documented formula, never
 * copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, round2, DEFAULT_SESSION_RPM } from "./logic.ts";
import { outputs } from "./meta.ts";

const okValues = (input: Record<string, unknown>): Record<string, unknown> => {
  const r = runTool(input);
  assert.strictEqual(r.ok, true, `expected ok, got error: ${r.error}`);
  return r.values as Record<string, unknown>;
};

describe("mediavine — happy path", () => {
  it("computes earnings for 50000 sessions at default RPM 25", () => {
    // 50000 * 25 / 1000 = 1250.00; low = 750.00; high = 2000.00.
    const v = okValues({ monthlySessions: 50000 });
    assert.strictEqual(v.estimatedMonthlyEarnings, 1250);
    assert.strictEqual(v.earningsRangeLow, 750);
    assert.strictEqual(v.earningsRangeHigh, 2000);
  });

  it("uses a user-supplied RPM", () => {
    // 100000 * 32 / 1000 = 3200; low = 1920; high = 5120.
    const v = okValues({ monthlySessions: 100000, sessionRpm: 32 });
    assert.strictEqual(v.estimatedMonthlyEarnings, 3200);
    assert.strictEqual(v.earningsRangeLow, 1920);
    assert.strictEqual(v.earningsRangeHigh, 5120);
  });

  it("handles fractional RPM and rounds half-up to cents", () => {
    // 33333 * 17.5 / 1000 = 583.3275 -> 583.33; low = 349.998 -> 350;
    // high = 933.328 -> 933.33.
    const v = okValues({ monthlySessions: 33333, sessionRpm: 17.5 });
    assert.strictEqual(v.estimatedMonthlyEarnings, 583.33);
    assert.strictEqual(v.earningsRangeLow, 350);
    assert.strictEqual(v.earningsRangeHigh, 933.33);
  });

  it("accepts RPM at the sanity-band edges (1 and 200)", () => {
    const lo = okValues({ monthlySessions: 1000, sessionRpm: 1 });
    assert.strictEqual(lo.estimatedMonthlyEarnings, 1);
    const hi = okValues({ monthlySessions: 1000, sessionRpm: 200 });
    assert.strictEqual(hi.estimatedMonthlyEarnings, 200);
  });

  it("treats null/empty RPM as the default benchmark estimate", () => {
    const a = okValues({ monthlySessions: 8000, sessionRpm: null });
    const b = okValues({ monthlySessions: 8000, sessionRpm: "" });
    assert.strictEqual(a.estimatedMonthlyEarnings, 200); // 8000*25/1000
    assert.strictEqual(b.estimatedMonthlyEarnings, 200);
  });
});

describe("mediavine — edge cases from spec", () => {
  it("zero sessions -> $0 earnings, $0 range (valid, not an error)", () => {
    const v = okValues({ monthlySessions: 0 });
    assert.strictEqual(v.estimatedMonthlyEarnings, 0);
    assert.strictEqual(v.earningsRangeLow, 0);
    assert.strictEqual(v.earningsRangeHigh, 0);
  });

  it("flags RPM outside the 1-200 sanity band as invalid", () => {
    for (const bad of [0, 0.5, 201, 999]) {
      const r = runTool({ monthlySessions: 50000, sessionRpm: bad });
      assert.strictEqual(r.ok, false, `RPM ${bad} should be rejected`);
      assert.ok(
        String(r.error).includes("sanity band"),
        `error should mention sanity band, got: ${r.error}`,
      );
    }
  });

  it("accepts large session counts deterministically", () => {
    // 10_000_000 * 25 / 1000 = 250000; low = 150000; high = 400000.
    const v = okValues({ monthlySessions: 10000000 });
    assert.strictEqual(v.estimatedMonthlyEarnings, 250000);
    assert.strictEqual(v.earningsRangeLow, 150000);
    assert.strictEqual(v.earningsRangeHigh, 400000);
  });
});

describe("mediavine — validation errors", () => {
  it("rejects missing monthlySessions", () => {
    const r = runTool({});
    assert.strictEqual(r.ok, false);
    assert.ok(String(r.error).includes("Monthly sessions"));
  });

  it("rejects non-numeric monthlySessions", () => {
    for (const bad of ["50000", NaN, Infinity, undefined, true]) {
      const r = runTool({ monthlySessions: bad });
      assert.strictEqual(r.ok, false, `sessions=${String(bad)} should fail`);
    }
  });

  it("rejects negative sessions", () => {
    const r = runTool({ monthlySessions: -10 });
    assert.strictEqual(r.ok, false);
    assert.ok(String(r.error).includes("negative"));
  });

  it("rejects non-numeric or non-finite RPM", () => {
    for (const bad of ["25", NaN, Infinity]) {
      const r = runTool({ monthlySessions: 50000, sessionRpm: bad });
      assert.strictEqual(r.ok, false, `rpm=${String(bad)} should fail`);
    }
  });

  it("rejects negative RPM", () => {
    const r = runTool({ monthlySessions: 50000, sessionRpm: -5 });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a non-object input", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.strictEqual(r.ok, false);
  });
});

describe("mediavine — determinism", () => {
  it("run twice with same inputs -> identical outputs", () => {
    const input = { monthlySessions: 73333, sessionRpm: 27.3 };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepStrictEqual(a, b);
  });
});

describe("mediavine — output ids match meta.ts outputs", () => {
  it("runTool returns exactly the ids declared in meta outputs", () => {
    const metaIds = outputs.map((o) => o.id).sort();
    const v = okValues({ monthlySessions: 50000 });
    const resultIds = Object.keys(v).sort();
    assert.deepStrictEqual(resultIds, metaIds);
  });

  it("meta declares the expected output ids", () => {
    const ids = outputs.map((o) => o.id);
    assert.deepStrictEqual(ids.sort(), [
      "earningsRangeHigh",
      "earningsRangeLow",
      "estimatedMonthlyEarnings",
    ]);
  });
});

describe("mediavine — rounding helper", () => {
  it("rounds half-up to 2 decimals", () => {
    assert.strictEqual(round2(2.675), 2.68);
    assert.strictEqual(round2(2.674), 2.67);
    assert.strictEqual(round2(583.3275), 583.33);
  });

  it("documents the default RPM benchmark estimate", () => {
    assert.strictEqual(DEFAULT_SESSION_RPM, 25);
  });
});
