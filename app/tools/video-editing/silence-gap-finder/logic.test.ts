import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const asRec = (r: { ok: boolean; values?: Record<string, unknown>; error?: string }) =>
  r.values as Record<string, unknown>;

// 100 samples at 10 ms: loud (-8) 0-9, silent (-60) 10-59 (500 ms),
// loud 60-69, silent 70-74 (50 ms, below the 400 ms minimum), loud 75-99.
function twoGapSeries(): string {
  const a: number[] = [];
  for (let i = 0; i < 100; i += 1) {
    a.push(i < 10 || (i >= 60 && i < 70) || i >= 75 ? -8 : -60);
  }
  return a.join(",");
}

describe("silence-gap-finder (tool-270)", () => {
  it("happy path: one kept gap, short run dropped", () => {
    const r = runTool({ levelValues: twoGapSeries(), thresholdDb: -40, minGapMs: 400, windowMs: 10 });
    assert.equal(r.ok, true);
    const v = asRec(r);
    const gaps = v.gaps as Record<string, unknown>[];
    assert.equal(gaps.length, 1);
    assert.equal(gaps[0].startMs, 100);
    assert.equal(gaps[0].endMs, 600);
    assert.equal(gaps[0].durationMs, 500);
    assert.deepEqual(v.suggestedCutPointsMs, [350]);
    assert.equal(v.totalSilenceSec, 0.5);
  });

  it("two long silent runs -> two gaps, midpoints, summed total", () => {
    const a: number[] = [];
    for (let i = 0; i < 120; i += 1) {
      a.push(i < 50 || (i >= 60 && i < 110) ? -60 : -8);
    }
    const r = runTool({ levelValues: a.join(","), thresholdDb: -40, minGapMs: 400, windowMs: 10 });
    const v = asRec(r);
    assert.equal((v.gaps as unknown[]).length, 2);
    assert.deepEqual(v.suggestedCutPointsMs, [250, 850]);
    assert.equal(v.totalSilenceSec, 1.0);
  });

  it("no gaps -> empty lists and zero total", () => {
    const r = runTool({ levelValues: new Array(50).fill(-8).join(","), thresholdDb: -40, minGapMs: 400 });
    assert.equal(r.ok, true);
    const v = asRec(r);
    assert.deepEqual(v.gaps, []);
    assert.deepEqual(v.suggestedCutPointsMs, []);
    assert.equal(v.totalSilenceSec, 0);
  });

  it("whole series silent -> single gap with a warning note", () => {
    const r = runTool({ levelValues: new Array(20).fill(-60).join(","), thresholdDb: -40, minGapMs: 100 });
    const v = asRec(r);
    const gaps = v.gaps as Record<string, unknown>[];
    assert.equal(gaps.length, 1);
    assert.equal(gaps[0].startMs, 0);
    assert.equal(gaps[0].endMs, 200);
    assert.ok(String(gaps[0].note).includes("entire series"));
  });

  it("value exactly at the threshold is NOT silent (strictly below)", () => {
    const r = runTool({ levelValues: new Array(30).fill(-40).join(","), thresholdDb: -40, minGapMs: 100 });
    assert.deepEqual(asRec(r).gaps, []);
  });

  it("defaults: threshold -40 dB and 400 ms min gap when omitted", () => {
    const a = [...new Array(50).fill(-50), ...new Array(30).fill(-30), ...new Array(20).fill(-8)];
    const r = runTool({ levelValues: a.join(",") });
    const v = asRec(r);
    const gaps = v.gaps as Record<string, unknown>[];
    assert.equal(gaps.length, 1); // only the -50 run (500 ms) qualifies
    assert.equal(gaps[0].durationMs, 500);
  });

  it("windowMs scales gap times (20 ms windows)", () => {
    const a = [...new Array(20).fill(-60), ...new Array(20).fill(-8)];
    const r = runTool({ levelValues: a.join(","), thresholdDb: -40, minGapMs: 400, windowMs: 20 });
    const gaps = asRec(r).gaps as Record<string, unknown>[];
    assert.equal(gaps.length, 1);
    assert.equal(gaps[0].startMs, 0);
    assert.equal(gaps[0].endMs, 400);
    assert.equal(gaps[0].durationMs, 400);
    assert.deepEqual(asRec(r).suggestedCutPointsMs, [200]);
    assert.equal(asRec(r).totalSilenceSec, 0.4);
  });

  it("gap exactly at minGapMs is kept (inclusive)", () => {
    const a = [...new Array(10).fill(-60), ...new Array(10).fill(-8)];
    const r = runTool({ levelValues: a.join(","), thresholdDb: -40, minGapMs: 100, windowMs: 10 });
    assert.equal((asRec(r).gaps as unknown[]).length, 1);
  });

  it("number[] input is accepted", () => {
    const a = [...new Array(50).fill(-60), ...new Array(50).fill(-8)];
    const r = runTool({ levelValues: a, thresholdDb: -40, minGapMs: 400 });
    assert.equal(r.ok, true);
    assert.equal((asRec(r).gaps as unknown[]).length, 1);
  });

  it("rejects thresholdDb outside -80..-10", () => {
    assert.equal(runTool({ levelValues: twoGapSeries(), thresholdDb: -5 }).ok, false);
    assert.equal(runTool({ levelValues: twoGapSeries(), thresholdDb: -85 }).ok, false);
  });

  it("accepts thresholdDb boundaries -80 and -10", () => {
    assert.equal(runTool({ levelValues: twoGapSeries(), thresholdDb: -80 }).ok, true);
    assert.equal(runTool({ levelValues: twoGapSeries(), thresholdDb: -10 }).ok, true);
  });

  it("rejects minGapMs outside 100..5000", () => {
    assert.equal(runTool({ levelValues: twoGapSeries(), minGapMs: 50 }).ok, false);
    assert.equal(runTool({ levelValues: twoGapSeries(), minGapMs: 6000 }).ok, false);
  });

  it("rejects a non-numeric token", () => {
    const r = runTool({ levelValues: "-60, -55, loud, -8" + ",-8".repeat(20) });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("not a number"));
  });

  it("rejects too few samples", () => {
    assert.equal(runTool({ levelValues: "-60, -55" }).ok, false);
  });

  it("rejects more than 200,000 samples", () => {
    const r = runTool({ levelValues: new Array(200001).fill(-60) });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("200000"));
  });

  it("rejects invalid windowMs", () => {
    assert.equal(runTool({ levelValues: twoGapSeries(), windowMs: 0 }).ok, false);
    assert.equal(runTool({ levelValues: twoGapSeries(), windowMs: 2000 }).ok, false);
  });

  it("rejects a missing level series", () => {
    const r = runTool({ thresholdDb: -40 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("audio file cannot be read here"));
  });

  it("output keys match meta.ts outputs", () => {
    const r = runTool({ levelValues: twoGapSeries() });
    assert.deepEqual(Object.keys(asRec(r)).sort(), ["gaps", "suggestedCutPointsMs", "totalSilenceSec"]);
  });

  it("is deterministic", () => {
    const opts = { levelValues: twoGapSeries(), thresholdDb: -35, minGapMs: 200 };
    assert.deepEqual(runTool(opts), runTool({ ...opts }));
  });
});
