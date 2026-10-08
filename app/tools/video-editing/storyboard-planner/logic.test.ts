import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = {
  scriptBeats: "Hook: the one mistake ruining your edits\nDemo: apply the fix live\nCTA: follow for part 2",
  totalDurationSec: 30,
  framesPerBeat: 1,
};

describe("storyboard-planner (tool-277)", () => {
  it("happy path: 3 beats -> 3 frames with all fields", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const frames = v.frames as Record<string, unknown>[];
    assert.equal(frames.length, 3);
    for (const f of frames) {
      assert.equal(typeof f.beat, "string");
      assert.equal(typeof f.visualDescription, "string");
      assert.equal(typeof f.camera, "string");
      assert.equal(typeof f.durationMs, "number");
      assert.equal(typeof f.caption, "string");
    }
    assert.ok((v.totalCheck as string).includes("30"));
  });

  it("output keys match meta.ts outputs (frames, totalCheck)", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), ["frames", "totalCheck"]);
  });

  it("frames sum exactly to the total duration in ms", () => {
    const r = runTool({ ...base, totalDurationSec: 47, framesPerBeat: 2 });
    const frames = (r.values as Record<string, unknown>).frames as { durationMs: number }[];
    assert.equal(frames.length, 6);
    const sum = frames.reduce((a, f) => a + f.durationMs, 0);
    assert.equal(sum, 47000);
  });

  it("uneven division deals out remainder 1ms at a time to first frames", () => {
    const r = runTool({
      scriptBeats: "one\ntwo\nthree",
      totalDurationSec: 10,
      framesPerBeat: 1,
    });
    const frames = (r.values as Record<string, unknown>).frames as { durationMs: number }[];
    assert.deepEqual(frames.map((f) => f.durationMs), [3334, 3333, 3333]);
  });

  it("framesPerBeat > 1 multiplies frames and varies visual descriptions", () => {
    const r = runTool({
      scriptBeats: "Hook line",
      totalDurationSec: 10,
      framesPerBeat: 3,
    });
    const frames = (r.values as Record<string, unknown>).frames as Record<string, string>[];
    assert.equal(frames.length, 3);
    assert.notEqual(frames[0].visualDescription, frames[1].visualDescription);
    assert.ok((frames[1].visualDescription as string).includes("alternate angle"));
  });

  it("visual hint after ' | ' is used; missing hint becomes TBD", () => {
    const r = runTool({
      scriptBeats: "Intro | close-up of the product\nPlain beat with no hint",
      totalDurationSec: 10,
    });
    const frames = (r.values as Record<string, unknown>).frames as Record<string, string>[];
    assert.equal(frames[0].visualDescription, "close-up of the product");
    assert.ok((frames[1].visualDescription as string).startsWith("TBD"));
  });

  it("camera setups cycle through the 6-entry bank in order", () => {
    const beats = "a\nb\nc\nd\ne\nf\ng";
    const r = runTool({ scriptBeats: beats, totalDurationSec: 20 });
    const frames = (r.values as Record<string, unknown>).frames as Record<string, string>[];
    const cams = frames.map((f) => f.camera);
    assert.equal(new Set(cams.slice(0, 6)).size, 6);
    assert.equal(cams[6], cams[0]);
  });

  it("long beat text is truncated in caption with ellipsis", () => {
    const long = "x".repeat(100);
    const r = runTool({ scriptBeats: long, totalDurationSec: 5 });
    const frames = (r.values as Record<string, unknown>).frames as Record<string, string>[];
    assert.ok((frames[0].caption as string).length <= 61);
    assert.ok((frames[0].caption as string).endsWith("…"));
    assert.equal(frames[0].beat, long);
  });

  it("blank lines are ignored", () => {
    const r = runTool({ scriptBeats: "\n\nBeat one\n\n\nBeat two\n", totalDurationSec: 10 });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).frames as unknown[]).length, 2);
  });

  it("framesPerBeat defaults to 1 when omitted", () => {
    const r = runTool({ scriptBeats: "one\ntwo", totalDurationSec: 10 });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).frames as unknown[]).length, 2);
  });

  it("rejects empty beats", () => {
    const r = runTool({ scriptBeats: "   \n  ", totalDurationSec: 10 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("at least one"));
  });

  it("rejects missing beats", () => {
    const r = runTool({ totalDurationSec: 10 });
    assert.equal(r.ok, false);
  });

  it("rejects zero/negative duration", () => {
    assert.equal(runTool({ ...base, totalDurationSec: 0 }).ok, false);
    assert.equal(runTool({ ...base, totalDurationSec: -5 }).ok, false);
  });

  it("rejects missing duration", () => {
    assert.equal(runTool({ scriptBeats: "one" }).ok, false);
  });

  it("rejects framesPerBeat outside 1-5", () => {
    assert.equal(runTool({ ...base, framesPerBeat: 0 }).ok, false);
    assert.equal(runTool({ ...base, framesPerBeat: 6 }).ok, false);
    assert.equal(runTool({ ...base, framesPerBeat: 2.5 }).ok, false);
  });

  it("errors when beats exceed duration at the 1s minimum frame", () => {
    const r = runTool({ scriptBeats: "a\nb\nc\nd\ne", totalDurationSec: 3 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("Merge beats"));
  });

  it("accepts the exact boundary: frames x 1s == total", () => {
    const r = runTool({ scriptBeats: "a\nb\nc", totalDurationSec: 3 });
    assert.equal(r.ok, true);
    const frames = (r.values as Record<string, unknown>).frames as { durationMs: number }[];
    assert.deepEqual(frames.map((f) => f.durationMs), [1000, 1000, 1000]);
  });

  it("is deterministic: same inputs twice give identical output", () => {
    const a = runTool(base);
    const b = runTool({ ...base });
    assert.deepEqual(a, b);
  });

  it("single beat with one frame gets the whole duration", () => {
    const r = runTool({ scriptBeats: "Only beat", totalDurationSec: 12 });
    const frames = (r.values as Record<string, unknown>).frames as { durationMs: number }[];
    assert.equal(frames.length, 1);
    assert.equal(frames[0].durationMs, 12000);
  });
});
