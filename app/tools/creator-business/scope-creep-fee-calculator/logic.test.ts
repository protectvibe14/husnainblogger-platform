import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, OUTPUT_IDS, MODE_HOURLY, MODE_PCT_OF_FEE, roundToCents } from "./logic.ts";
import { outputs } from "./meta.ts";

function okRun(values: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(values);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

const HOURLY = { originalFee: 3000, mode: MODE_HOURLY, additionalHours: 5, hourlyRate: 100 };
const PCT = { originalFee: 3000, mode: MODE_PCT_OF_FEE, creepPct: 15 };

describe("scope-creep-fee-calculator", () => {
  it("happy path (hourly mode): fee, revised total, creep percent", () => {
    const v = okRun({ ...HOURLY });
    assert.equal(v.scopeCreepFee, 500); // 5 * 100
    assert.equal(v.revisedProjectTotal, 3500);
    assert.equal(v.creepAsPctOfOriginal, 16.67); // 500/3000*100 rounded
  });

  it("happy path (pct-of-fee mode)", () => {
    const v = okRun({ ...PCT });
    assert.equal(v.scopeCreepFee, 450); // 3000 * 15%
    assert.equal(v.revisedProjectTotal, 3450);
    assert.equal(v.creepAsPctOfOriginal, 15);
  });

  it("edge: additionalHours = 0 gives a $0 fee", () => {
    const v = okRun({ ...HOURLY, additionalHours: 0 });
    assert.equal(v.scopeCreepFee, 0);
    assert.equal(v.revisedProjectTotal, 3000);
    assert.equal(v.creepAsPctOfOriginal, 0);
  });

  it("edge: originalFee = 0 is allowed; creep percent reports 0", () => {
    const v = okRun({ originalFee: 0, mode: MODE_HOURLY, additionalHours: 2, hourlyRate: 75 });
    assert.equal(v.scopeCreepFee, 150);
    assert.equal(v.revisedProjectTotal, 150);
    assert.equal(v.creepAsPctOfOriginal, 0);
  });

  it("hourly mode ignores creepPct when present", () => {
    const v = okRun({ ...HOURLY, creepPct: 99 });
    assert.equal(v.scopeCreepFee, 500);
  });

  it("pct mode ignores additionalHours/hourlyRate when present", () => {
    const v = okRun({ ...PCT, additionalHours: 100, hourlyRate: 1000 });
    assert.equal(v.scopeCreepFee, 450);
  });

  it("creepPct of 100 equals the full original fee", () => {
    const v = okRun({ ...PCT, creepPct: 100 });
    assert.equal(v.scopeCreepFee, 3000);
    assert.equal(v.creepAsPctOfOriginal, 100);
  });

  it("missing originalFee fails", () => {
    const r = runTool({ mode: MODE_HOURLY, additionalHours: 5, hourlyRate: 100 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Original project fee is required/);
  });

  it("missing mode fails", () => {
    const r = runTool({ originalFee: 3000 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Pricing mode is required/);
  });

  it("invalid mode fails", () => {
    const r = runTool({ originalFee: 3000, mode: "daily" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be "hourly" or "pct-of-fee"/);
  });

  it("hourly mode: missing additionalHours fails", () => {
    const r = runTool({ originalFee: 3000, mode: MODE_HOURLY, hourlyRate: 100 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Additional hours is required/);
  });

  it("hourly mode: missing hourlyRate fails", () => {
    const r = runTool({ originalFee: 3000, mode: MODE_HOURLY, additionalHours: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Your hourly rate is required/);
  });

  it("pct mode: missing creepPct fails", () => {
    const r = runTool({ originalFee: 3000, mode: MODE_PCT_OF_FEE });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Scope creep percentage is required/);
  });

  it("creepPct above 100 fails", () => {
    const r = runTool({ ...PCT, creepPct: 101 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be 100 or less/);
  });

  it("negative creepPct fails", () => {
    const r = runTool({ ...PCT, creepPct: -1 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be 0 or more/);
  });

  it("negative originalFee fails", () => {
    const r = runTool({ ...PCT, originalFee: -500 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Original project fee must be 0 or more/);
  });

  it("negative additionalHours fails", () => {
    const r = runTool({ ...HOURLY, additionalHours: -2 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Additional hours must be 0 or more/);
  });

  it("negative hourlyRate fails", () => {
    const r = runTool({ ...HOURLY, hourlyRate: -50 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Your hourly rate must be 0 or more/);
  });

  it("NaN additionalHours fails", () => {
    const r = runTool({ ...HOURLY, additionalHours: NaN });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /NaN/);
  });

  it("Infinity creepPct fails", () => {
    const r = runTool({ ...PCT, creepPct: Infinity });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /finite/);
  });

  it("empty-string required input fails", () => {
    const r = runTool({ ...HOURLY, hourlyRate: "" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Your hourly rate is required/);
  });

  it("non-number input fails", () => {
    const r = runTool({ ...PCT, originalFee: "three grand" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be a number/);
  });

  it("non-object input fails", () => {
    const r = runTool(42 as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must be an object/);
  });

  it("rounding: fractional fees round half-up to cents", () => {
    const v = okRun({
      originalFee: 1999,
      mode: MODE_PCT_OF_FEE,
      creepPct: 12.5,
    });
    assert.equal(v.scopeCreepFee, roundToCents(1999 * 0.125)); // 249.875 -> 249.88? Math.round(24987.5)=24988 -> 249.88
    assert.equal(v.scopeCreepFee, 249.88);
  });

  it("deterministic: same inputs produce identical outputs", () => {
    assert.deepEqual(okRun({ ...HOURLY }), okRun({ ...HOURLY }));
    assert.deepEqual(okRun({ ...PCT }), okRun({ ...PCT }));
  });

  it("output ids match meta.ts outputs", () => {
    const v = okRun({ ...PCT });
    const metaIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(Object.keys(v).sort(), metaIds);
    assert.deepEqual([...OUTPUT_IDS].sort(), metaIds);
  });
});
