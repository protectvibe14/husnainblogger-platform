import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, OUTPUT_IDS, roundToCents } from "./logic.ts";
import { outputs } from "./meta.ts";

function okRun(values: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(values);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

const BASE = { baseContentFee: 800, whitelistPctPerMonth: 50, whitelistMonths: 3 };

describe("whitelisting-fee-calculator", () => {
  it("happy path (percentage mode): monthly fee, total, deal value", () => {
    const v = okRun({ ...BASE });
    assert.equal(v.monthlyFee, 400); // 800 * 50%
    assert.equal(v.whitelistingFeeTotal, 1200); // 400 * 3
    assert.equal(v.totalDealValue, 2000); // 800 + 1200
  });

  it("flat mode: flatMonthlyMode replaces the percentage", () => {
    const v = okRun({ baseContentFee: 800, whitelistMonths: 3, flatMonthlyMode: 500 });
    assert.equal(v.monthlyFee, 500);
    assert.equal(v.whitelistingFeeTotal, 1500);
    assert.equal(v.totalDealValue, 2300);
  });

  it("flat mode of 0 is accepted and does not require a percentage", () => {
    const v = okRun({ baseContentFee: 800, whitelistMonths: 3, flatMonthlyMode: 0 });
    assert.equal(v.monthlyFee, 0);
    assert.equal(v.whitelistingFeeTotal, 0);
    assert.equal(v.totalDealValue, 800);
  });

  it("0% gives a $0 monthly fee", () => {
    const v = okRun({ ...BASE, whitelistPctPerMonth: 0 });
    assert.equal(v.monthlyFee, 0);
    assert.equal(v.whitelistingFeeTotal, 0);
    assert.equal(v.totalDealValue, 800);
  });

  it("0 months gives a $0 whitelisting total", () => {
    const v = okRun({ ...BASE, whitelistMonths: 0 });
    assert.equal(v.whitelistingFeeTotal, 0);
    assert.equal(v.totalDealValue, 800);
  });

  it("100% per month equals the full content fee each month", () => {
    const v = okRun({ ...BASE, whitelistPctPerMonth: 100 });
    assert.equal(v.monthlyFee, 800);
    assert.equal(v.whitelistingFeeTotal, 2400);
  });

  it("missing baseContentFee fails", () => {
    const r = runTool({ whitelistPctPerMonth: 50, whitelistMonths: 3 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Base content fee is required/);
  });

  it("missing whitelistMonths fails", () => {
    const r = runTool({ baseContentFee: 800, whitelistPctPerMonth: 50 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Whitelisting months is required/);
  });

  it("missing whitelistPctPerMonth fails in percentage mode", () => {
    const r = runTool({ baseContentFee: 800, whitelistMonths: 3 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Whitelisting percentage per month is required/);
  });

  it("whitelistPctPerMonth above 100 fails", () => {
    const r = runTool({ ...BASE, whitelistPctPerMonth: 150 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be 100 or less/);
  });

  it("negative whitelistPctPerMonth fails", () => {
    const r = runTool({ ...BASE, whitelistPctPerMonth: -10 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be 0 or more/);
  });

  it("negative baseContentFee fails", () => {
    const r = runTool({ ...BASE, baseContentFee: -1 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Base content fee must be 0 or more/);
  });

  it("negative whitelistMonths fails", () => {
    const r = runTool({ ...BASE, whitelistMonths: -2 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Whitelisting months must be 0 or more/);
  });

  it("negative flatMonthlyMode fails", () => {
    const r = runTool({ baseContentFee: 800, whitelistMonths: 3, flatMonthlyMode: -5 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Flat monthly fee must be 0 or more/);
  });

  it("NaN whitelistMonths fails", () => {
    const r = runTool({ ...BASE, whitelistMonths: NaN });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /NaN/);
  });

  it("Infinity baseContentFee fails", () => {
    const r = runTool({ ...BASE, baseContentFee: Infinity });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /finite/);
  });

  it("empty-string required input fails", () => {
    const r = runTool({ ...BASE, baseContentFee: "" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Base content fee is required/);
  });

  it("non-number input fails", () => {
    const r = runTool({ ...BASE, whitelistPctPerMonth: "fifty" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be a number/);
  });

  it("non-object input fails", () => {
    const r = runTool([] as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be an object/);
  });

  it("rounding: fractional monthly fee rounds half-up to cents", () => {
    const v = okRun({ baseContentFee: 999, whitelistPctPerMonth: 33.333, whitelistMonths: 2 });
    assert.equal(v.monthlyFee, roundToCents(999 * 0.33333));
    assert.equal(v.whitelistingFeeTotal, roundToCents(v.monthlyFee as number * 2));
  });

  it("deterministic: same inputs produce identical outputs", () => {
    assert.deepEqual(okRun({ ...BASE }), okRun({ ...BASE }));
    assert.deepEqual(
      okRun({ baseContentFee: 800, whitelistMonths: 3, flatMonthlyMode: 500 }),
      okRun({ baseContentFee: 800, whitelistMonths: 3, flatMonthlyMode: 500 }),
    );
  });

  it("output ids match meta.ts outputs", () => {
    const v = okRun({ ...BASE });
    const metaIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(Object.keys(v).sort(), metaIds);
    assert.deepEqual([...OUTPUT_IDS].sort(), metaIds);
  });
});
