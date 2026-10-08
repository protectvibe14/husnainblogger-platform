import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, OUTPUT_IDS, roundToCents } from "./logic.ts";
import { outputs } from "./meta.ts";

function okRun(values: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(values);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

const BASE = { baseDealFee: 5000, exclusivityPct: 20, exclusivityMonths: 6 };

describe("exclusivity-fee-calculator", () => {
  it("happy path (percentage mode): fee, total, monthly equivalent", () => {
    const v = okRun({ ...BASE });
    assert.equal(v.exclusivityFee, 1000); // 5000 * 20%
    assert.equal(v.totalDealValue, 6000);
    assert.equal(v.monthlyEquivalent, 166.67); // 1000 / 6 rounded
  });

  it("flat mode: flatFeeMode replaces the percentage", () => {
    const v = okRun({ baseDealFee: 5000, exclusivityMonths: 6, flatFeeMode: 2500 });
    assert.equal(v.exclusivityFee, 2500);
    assert.equal(v.totalDealValue, 7500);
    assert.equal(v.monthlyEquivalent, 416.67);
  });

  it("flat mode of 0 is accepted and does not require a percentage", () => {
    const v = okRun({ baseDealFee: 5000, exclusivityMonths: 6, flatFeeMode: 0 });
    assert.equal(v.exclusivityFee, 0);
    assert.equal(v.totalDealValue, 5000);
  });

  it("0% exclusivity gives a $0 fee", () => {
    const v = okRun({ ...BASE, exclusivityPct: 0 });
    assert.equal(v.exclusivityFee, 0);
    assert.equal(v.totalDealValue, 5000);
  });

  it("100% exclusivity doubles the deal value", () => {
    const v = okRun({ ...BASE, exclusivityPct: 100 });
    assert.equal(v.exclusivityFee, 5000);
    assert.equal(v.totalDealValue, 10000);
  });

  it("0 months: monthly equivalent equals the full fee", () => {
    const v = okRun({ ...BASE, exclusivityMonths: 0 });
    assert.equal(v.monthlyEquivalent, 1000);
  });

  it("missing baseDealFee fails", () => {
    const r = runTool({ exclusivityPct: 20, exclusivityMonths: 6 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Base deal fee is required/);
  });

  it("missing exclusivityMonths fails", () => {
    const r = runTool({ baseDealFee: 5000, exclusivityPct: 20 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Exclusivity months is required/);
  });

  it("missing exclusivityPct fails in percentage mode", () => {
    const r = runTool({ baseDealFee: 5000, exclusivityMonths: 6 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Exclusivity percentage is required/);
  });

  it("exclusivityPct above 100 fails", () => {
    const r = runTool({ ...BASE, exclusivityPct: 101 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be 100 or less/);
  });

  it("negative exclusivityPct fails", () => {
    const r = runTool({ ...BASE, exclusivityPct: -5 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be 0 or more/);
  });

  it("negative baseDealFee fails", () => {
    const r = runTool({ ...BASE, baseDealFee: -100 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Base deal fee must be 0 or more/);
  });

  it("negative exclusivityMonths fails", () => {
    const r = runTool({ ...BASE, exclusivityMonths: -1 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Exclusivity months must be 0 or more/);
  });

  it("negative flatFeeMode fails", () => {
    const r = runTool({ baseDealFee: 5000, exclusivityMonths: 6, flatFeeMode: -10 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Flat exclusivity fee must be 0 or more/);
  });

  it("NaN baseDealFee fails", () => {
    const r = runTool({ ...BASE, baseDealFee: NaN });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /NaN/);
  });

  it("Infinity exclusivityPct fails", () => {
    const r = runTool({ ...BASE, exclusivityPct: Infinity });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /finite/);
  });

  it("empty-string required input fails", () => {
    const r = runTool({ ...BASE, baseDealFee: "" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Base deal fee is required/);
  });

  it("non-number input fails", () => {
    const r = runTool({ ...BASE, exclusivityMonths: "six" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be a number/);
  });

  it("non-object input fails", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be an object/);
  });

  it("rounding: repeating decimals round half-up to cents", () => {
    const v = okRun({ baseDealFee: 1000, exclusivityPct: 33.333, exclusivityMonths: 3 });
    assert.equal(v.exclusivityFee, 333.33);
    assert.equal(roundToCents(166.665), 166.67);
  });

  it("deterministic: same inputs produce identical outputs", () => {
    assert.deepEqual(okRun({ ...BASE }), okRun({ ...BASE }));
    assert.deepEqual(
      okRun({ baseDealFee: 5000, exclusivityMonths: 6, flatFeeMode: 2500 }),
      okRun({ baseDealFee: 5000, exclusivityMonths: 6, flatFeeMode: 2500 }),
    );
  });

  it("output ids match meta.ts outputs", () => {
    const v = okRun({ ...BASE });
    const metaIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(Object.keys(v).sort(), metaIds);
    assert.deepEqual([...OUTPUT_IDS].sort(), metaIds);
  });
});
