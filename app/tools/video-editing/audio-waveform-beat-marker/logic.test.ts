import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const asRec = (r: { ok: boolean; values?: Record<string, unknown>; error?: string }) =>
  r.values as Record<string, unknown>;

function seriesWithPeaks(): string {
  // 200 samples (2 s at 10 ms/window), background 0.1, peaks of 1.0 at
  // indices 20, 60, 100, 150.
  const a = new Array(200).fill(0.1) as number[];
  for (const i of [20, 60, 100, 150]) a[i] = 1.0;
  return a.join(",");
}

describe("audio-waveform-beat-marker (tool-269)", () => {
  it("happy path: 4 peaks found at the right times with full strength", () => {
    const r = runTool({ amplitudeValues: seriesWithPeaks(), sensitivity: "med", windowMs: 10 });
    assert.equal(r.ok, true);
    const v = asRec(r);
    const peaks = v.peaks as Record<string, unknown>[];
    assert.equal(peaks.length, 4);
    assert.deepEqual(peaks.map((p) => p.timeMs), [200, 600, 1000, 1500]);
    assert.deepEqual(peaks.map((p) => p.strength), [1, 1, 1, 1]);
    assert.deepEqual(v.suggestedCutPointsMs, [200, 600, 1000, 1500]);
    assert.ok(String(v.waveformSummary).includes("4 candidate"));
  });

  it("peaks are sorted by time even when the strongest is last", () => {
    const a = new Array(100).fill(0.1) as number[];
    a[20] = 0.7;
    a[80] = 1.0;
    const r = runTool({ amplitudeValues: a.join(","), sensitivity: "med", windowMs: 10 });
    const peaks = asRec(r).peaks as Record<string, unknown>[];
    assert.equal(peaks.length, 2);
    assert.deepEqual(peaks.map((p) => p.timeMs), [200, 800]);
  });

  it("silent series (all zeros) -> zero peaks with an explicit message", () => {
    const r = runTool({ amplitudeValues: new Array(50).fill(0).join(","), sensitivity: "med" });
    assert.equal(r.ok, true);
    const v = asRec(r);
    assert.deepEqual(v.peaks, []);
    assert.deepEqual(v.suggestedCutPointsMs, []);
    assert.ok(String(v.waveformSummary).includes("silent"));
  });

  it("flat non-zero series -> no peaks, threshold message", () => {
    const r = runTool({ amplitudeValues: new Array(50).fill(0.5).join(","), sensitivity: "med" });
    assert.equal(r.ok, true);
    assert.ok(String(asRec(r).waveformSummary).includes("No peaks found"));
  });

  it("low sensitivity excludes medium peaks that med keeps", () => {
    // bg 0.2; strong 1.0 at 10,50; medium 0.38 at 30,70.
    const a = new Array(100).fill(0.2) as number[];
    a[10] = 1.0;
    a[50] = 1.0;
    a[30] = 0.38;
    a[70] = 0.38;
    const low = runTool({ amplitudeValues: a.join(","), sensitivity: "low", windowMs: 10 });
    assert.equal((asRec(low).peaks as unknown[]).length, 2);
    const med = runTool({ amplitudeValues: a.join(","), sensitivity: "med", windowMs: 10 });
    assert.equal((asRec(med).peaks as unknown[]).length, 4);
    const high = runTool({ amplitudeValues: a.join(","), sensitivity: "high", windowMs: 10 });
    assert.equal((asRec(high).peaks as unknown[]).length, 4);
  });

  it("sensitivity defaults to med when omitted", () => {
    const r = runTool({ amplitudeValues: seriesWithPeaks() });
    assert.equal((asRec(r).peaks as unknown[]).length, 4);
  });

  it("refractory filter drops a weaker peak within 100 ms", () => {
    const a = new Array(100).fill(0.1) as number[];
    a[20] = 1.0;
    a[25] = 0.9; // 50 ms later -> suppressed
    const r = runTool({ amplitudeValues: a.join(","), sensitivity: "med", windowMs: 10 });
    const peaks = asRec(r).peaks as Record<string, unknown>[];
    assert.equal(peaks.length, 1);
    assert.equal(peaks[0].timeMs, 200);
  });

  it("windowMs scales the reported times", () => {
    const a = new Array(60).fill(0.1) as number[];
    a[10] = 1.0;
    const r = runTool({ amplitudeValues: a.join(","), sensitivity: "med", windowMs: 20 });
    const peaks = asRec(r).peaks as Record<string, unknown>[];
    assert.equal(peaks.length, 1);
    assert.equal(peaks[0].timeMs, 200);
  });

  it("number[] input is accepted", () => {
    const a = new Array(200).fill(0.1) as number[];
    a[20] = 1.0;
    const r = runTool({ amplitudeValues: a, sensitivity: "med", windowMs: 10 });
    assert.equal(r.ok, true);
    assert.equal((asRec(r).peaks as unknown[]).length, 1);
  });

  it("negative values are clamped to 0, not rejected", () => {
    const a = new Array(200).fill(-0.5) as number[];
    a[20] = 1.0;
    const r = runTool({ amplitudeValues: a, sensitivity: "med", windowMs: 10 });
    assert.equal(r.ok, true);
    assert.equal((asRec(r).peaks as unknown[]).length, 1);
  });

  it("summary reports duration, threshold, and the honest beats caveat", () => {
    const r = runTool({ amplitudeValues: seriesWithPeaks(), sensitivity: "med", windowMs: 10 });
    const s = String(asRec(r).waveformSummary);
    assert.ok(s.includes("2 s"));
    assert.ok(s.includes("threshold"));
    assert.ok(s.includes("not true tempo beats"));
  });

  it("rejects a non-numeric token", () => {
    const r = runTool({ amplitudeValues: "0.1, 0.2, abc, 0.4" + ",0.1".repeat(40), sensitivity: "med" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("not a number"));
  });

  it("rejects too few samples", () => {
    const r = runTool({ amplitudeValues: "0.1, 0.2, 0.3", sensitivity: "med" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("at least 32"));
  });

  it("rejects more than 200,000 samples", () => {
    const r = runTool({ amplitudeValues: new Array(200001).fill(0.1), sensitivity: "med" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("200000"));
  });

  it("rejects unknown sensitivity", () => {
    const r = runTool({ amplitudeValues: seriesWithPeaks(), sensitivity: "ultra" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("low, med, high"));
  });

  it("rejects invalid windowMs", () => {
    assert.equal(runTool({ amplitudeValues: seriesWithPeaks(), windowMs: 0 }).ok, false);
    assert.equal(runTool({ amplitudeValues: seriesWithPeaks(), windowMs: 2000 }).ok, false);
  });

  it("rejects a missing amplitude series", () => {
    const r = runTool({ sensitivity: "med" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("audio file cannot be read here"));
  });

  it("output keys match meta.ts outputs", () => {
    const r = runTool({ amplitudeValues: seriesWithPeaks() });
    assert.deepEqual(Object.keys(asRec(r)).sort(), ["peaks", "suggestedCutPointsMs", "waveformSummary"]);
  });

  it("is deterministic", () => {
    const opts = { amplitudeValues: seriesWithPeaks(), sensitivity: "high", windowMs: 10 };
    assert.deepEqual(runTool(opts), runTool({ ...opts }));
  });
});
