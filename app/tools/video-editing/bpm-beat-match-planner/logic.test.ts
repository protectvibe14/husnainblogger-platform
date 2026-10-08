import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const asRec = (r: { ok: boolean; values?: Record<string, unknown>; error?: string }) =>
  r.values as Record<string, unknown>;

const base = { bpm: 120, trackDurationSec: 60, introOffsetSec: 0, cutEveryNBeats: 4 };

describe("bpm-beat-match-planner (tool-268)", () => {
  it("happy path: 120bpm/60s/every-4 -> 500ms interval, 121 beats, 31 cuts", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = asRec(r);
    assert.equal(v.beatIntervalMs, 500);
    assert.equal(v.totalBeats, 121);
    const cuts = v.cutPointsMs as number[];
    assert.equal(cuts.length, 31);
    assert.equal(cuts[0], 0);
    assert.equal(cuts[cuts.length - 1], 60000);
    const markers = v.timelineMarkers as Record<string, unknown>[];
    assert.equal(markers.length, 31);
    assert.deepEqual(markers[0], { marker: "Cut 1", timeMs: 0, beatNumber: 0, note: "" });
    assert.deepEqual(markers[1], { marker: "Cut 2", timeMs: 2000, beatNumber: 4, note: "" });
  });

  it("intro offset shifts all beats", () => {
    const r = runTool({ ...base, introOffsetSec: 2 });
    const v = asRec(r);
    assert.equal(v.totalBeats, 117); // (60000-2000)/500 + 1
    const cuts = v.cutPointsMs as number[];
    assert.equal(cuts[0], 2000);
    assert.equal(cuts[1], 4000);
  });

  it("cutEveryNBeats defaults to 4 when omitted", () => {
    const r = runTool({ bpm: 120, trackDurationSec: 60 });
    assert.equal((asRec(r).cutPointsMs as number[]).length, 31);
  });

  it("cutEveryNBeats=1 marks every beat as a cut", () => {
    const r = runTool({ ...base, cutEveryNBeats: 1 });
    const v = asRec(r);
    assert.equal((v.cutPointsMs as number[]).length, v.totalBeats);
  });

  it("beat interval math is exact (128bpm -> 468.75ms)", () => {
    const r = runTool({ bpm: 128, trackDurationSec: 30, cutEveryNBeats: 4 });
    assert.equal(asRec(r).beatIntervalMs, 468.75);
  });

  it("marker beatNumbers follow the N-beat grid", () => {
    const r = runTool(base);
    const markers = asRec(r).timelineMarkers as Record<string, unknown>[];
    assert.deepEqual(markers.slice(0, 4).map((m) => m.beatNumber), [0, 4, 8, 12]);
  });

  it("bpm over 200 adds the frantic warning note to the first marker", () => {
    const r = runTool({ bpm: 210, trackDurationSec: 10, cutEveryNBeats: 4 });
    const markers = asRec(r).timelineMarkers as Record<string, unknown>[];
    assert.ok(String(markers[0].note).includes("frantic"));
  });

  it("bpm exactly 200 carries no warning", () => {
    const r = runTool({ bpm: 200, trackDurationSec: 10, cutEveryNBeats: 4 });
    const markers = asRec(r).timelineMarkers as Record<string, unknown>[];
    assert.equal(markers[0].note, "");
  });

  it("rejects bpm of 0, negative, below 30, above 300", () => {
    assert.equal(runTool({ ...base, bpm: 0 }).ok, false);
    assert.equal(runTool({ ...base, bpm: -90 }).ok, false);
    assert.equal(runTool({ ...base, bpm: 29 }).ok, false);
    const r = runTool({ ...base, bpm: 301 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("30 and 300"));
  });

  it("rejects zero or negative duration", () => {
    assert.equal(runTool({ ...base, trackDurationSec: 0 }).ok, false);
    assert.equal(runTool({ ...base, trackDurationSec: -3 }).ok, false);
  });

  it("rejects duration over 3600 seconds", () => {
    const r = runTool({ ...base, trackDurationSec: 3601 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("3600"));
  });

  it("rejects intro offset at or beyond the duration", () => {
    const r = runTool({ ...base, introOffsetSec: 60 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("beyond"));
    assert.equal(runTool({ ...base, introOffsetSec: 61 }).ok, false);
  });

  it("rejects negative intro offset", () => {
    assert.equal(runTool({ ...base, introOffsetSec: -1 }).ok, false);
  });

  it("rejects cutEveryNBeats of 0 and non-integers", () => {
    assert.equal(runTool({ ...base, cutEveryNBeats: 0 }).ok, false);
    const r = runTool({ ...base, cutEveryNBeats: 2.5 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("whole number"));
  });

  it("rejects missing bpm", () => {
    assert.equal(runTool({ trackDurationSec: 60 }).ok, false);
  });

  it("accepts the 3600s duration cap", () => {
    const r = runTool({ bpm: 60, trackDurationSec: 3600, cutEveryNBeats: 4 });
    assert.equal(r.ok, true);
    assert.equal(asRec(r).totalBeats, 3601);
    assert.equal((asRec(r).cutPointsMs as number[]).length, 901);
  });

  it("output keys match meta.ts outputs", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(asRec(r)).sort(), [
      "beatIntervalMs",
      "cutPointsMs",
      "timelineMarkers",
      "totalBeats",
    ]);
  });

  it("is deterministic", () => {
    const a = runTool(base);
    const b = runTool({ ...base });
    assert.deepEqual(a, b);
  });
});
