import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const asRec = (r: { ok: boolean; values?: Record<string, unknown>; error?: string }) =>
  r.values as Record<string, unknown>;

const base = { sourceFps: 120, timelineFps: 24, desiredSlowFactor: 0.5 };

describe("slow-mo-frame-rate-planner (tool-267)", () => {
  it("happy path: 120fps -> 24fps timeline at 50% is achievable", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = asRec(r);
    assert.equal(v.achievable, "Yes");
    assert.equal(v.playbackSpeedPct, 50);
    assert.equal(v.effectiveFps, 60);
    assert.ok(String(v.qualityVerdict).includes("evenly spaced"));
  });

  it("exact boundary: effective fps equal to timeline fps is achievable", () => {
    const r = runTool({ sourceFps: 60, timelineFps: 30, desiredSlowFactor: 0.5 });
    assert.equal(asRec(r).achievable, "Yes");
    assert.equal(asRec(r).effectiveFps, 30);
  });

  it("not achievable: recommends reshoot fps rounded to a standard step", () => {
    const r = runTool({ sourceFps: 30, timelineFps: 24, desiredSlowFactor: 0.5 });
    assert.equal(r.ok, true);
    const v = asRec(r);
    assert.equal(v.achievable, "No");
    assert.equal(v.effectiveFps, 15);
    assert.ok(String(v.qualityVerdict).includes("interpolation"));
    // needs ceil(24/0.5)=48 fps -> next standard step 60
    assert.ok(String(v.shootRecommendation).includes("60 fps"));
  });

  it("reshoot step rounds up to 120 for a 96 fps requirement", () => {
    const r = runTool({ sourceFps: 30, timelineFps: 24, desiredSlowFactor: 0.25 });
    assert.ok(String(asRec(r).shootRecommendation).includes("120 fps"));
  });

  it("judder warning when source is not a multiple of timeline", () => {
    const r = runTool({ sourceFps: 100, timelineFps: 24, desiredSlowFactor: 0.5 });
    const v = asRec(r);
    assert.equal(v.achievable, "Yes");
    assert.ok(String(v.qualityVerdict).includes("judder"));
  });

  it("even cadence (100fps -> 25fps) has no judder warning", () => {
    const r = runTool({ sourceFps: 100, timelineFps: 25, desiredSlowFactor: 0.5 });
    assert.ok(!String(asRec(r).qualityVerdict).includes("judder"));
  });

  it("240fps+ sources get the light-flicker warning", () => {
    const r = runTool({ sourceFps: 240, timelineFps: 30, desiredSlowFactor: 1 });
    assert.ok(String(asRec(r).shootRecommendation).includes("flicker"));
  });

  it("960fps max source is accepted", () => {
    assert.equal(runTool({ sourceFps: 960, timelineFps: 24, desiredSlowFactor: 0.05 }).ok, true);
  });

  it("full speed (1.0) is always achievable and reads 100%", () => {
    const r = runTool({ sourceFps: 60, timelineFps: 30, desiredSlowFactor: 1.0 });
    const v = asRec(r);
    assert.equal(v.achievable, "Yes");
    assert.equal(v.playbackSpeedPct, 100);
  });

  it("playbackSpeedPct rounds to one decimal (0.333 -> 33.3)", () => {
    const r = runTool({ sourceFps: 120, timelineFps: 24, desiredSlowFactor: 0.333 });
    assert.equal(asRec(r).playbackSpeedPct, 33.3);
  });

  it("numeric strings are accepted for all inputs", () => {
    const r = runTool({ sourceFps: "120", timelineFps: "24", desiredSlowFactor: "0.5" });
    assert.equal(r.ok, true);
    assert.equal(asRec(r).achievable, "Yes");
  });

  it("rejects sourceFps below 24 and above 960", () => {
    assert.equal(runTool({ ...base, sourceFps: 23 }).ok, false);
    assert.equal(runTool({ ...base, sourceFps: 961 }).ok, false);
  });

  it("rejects timelineFps outside the known set", () => {
    assert.equal(runTool({ ...base, timelineFps: 29 }).ok, false);
    const r = runTool({ ...base, timelineFps: 48 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("24, 25, 30, or 60"));
  });

  it("rejects slow factor below 0.05 and above 1.0", () => {
    assert.equal(runTool({ ...base, desiredSlowFactor: 0.04 }).ok, false);
    assert.equal(runTool({ ...base, desiredSlowFactor: 1.01 }).ok, false);
  });

  it("rejects non-numeric sourceFps", () => {
    const r = runTool({ ...base, sourceFps: "abc" });
    assert.equal(r.ok, false);
  });

  it("rejects missing inputs", () => {
    assert.equal(runTool({}).ok, false);
    assert.equal(runTool({ sourceFps: 120 }).ok, false);
  });

  it("minimum slow factor 0.05 is accepted", () => {
    const r = runTool({ sourceFps: 960, timelineFps: 24, desiredSlowFactor: 0.05 });
    assert.equal(asRec(r).achievable, "Yes");
    assert.equal(asRec(r).playbackSpeedPct, 5);
  });

  it("output keys match meta.ts outputs", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(asRec(r)).sort(), [
      "achievable",
      "effectiveFps",
      "playbackSpeedPct",
      "qualityVerdict",
      "shootRecommendation",
    ]);
  });

  it("is deterministic", () => {
    const a = runTool(base);
    const b = runTool({ ...base });
    assert.deepEqual(a, b);
  });
});
