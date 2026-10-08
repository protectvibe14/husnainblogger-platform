import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  planScenes,
  splitDurations,
  sanitizeIdea,
  SHOT_TYPES,
  NARRATION_TEMPLATES,
  MIN_SCENES,
  MAX_SCENES,
  MIN_LENGTH_SEC,
  MAX_LENGTH_SEC,
} from "./logic.ts";

describe("ai-video-scene-planner", () => {
  it("happy path: durations sum exactly to the target", () => {
    const r = runTool({ videoIdea: "5-minute morning routine", targetLengthSec: 60, sceneCount: 4 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const scenes = v["scenes"] as Array<{ scene: number; durationSec: number }>;
    assert.equal(scenes.length, 4);
    assert.equal(scenes.reduce((s, x) => s + x.durationSec, 0), 60);
    assert.equal(v["totalSec"], 60);
    assert.equal(v["sceneCount"], 4);
  });

  it("uneven split distributes the leftover to early scenes", () => {
    assert.deepEqual(splitDurations(60, 4), [15, 15, 15, 15]);
    assert.deepEqual(splitDurations(61, 4), [16, 15, 15, 15]);
    assert.deepEqual(splitDurations(62, 4), [16, 16, 15, 15]);
    assert.deepEqual(splitDurations(59, 4), [15, 15, 15, 14]);
  });

  it("split always sums to total for a range of inputs", () => {
    for (const total of [5, 7, 30, 61, 100, 599]) {
      for (const count of [2, 3, 5]) {
        if (total < count) continue;
        const parts = splitDurations(total, count);
        assert.equal(parts.length, count);
        assert.equal(parts.reduce((s, x) => s + x, 0), total);
        assert.ok(parts.every((p) => p > 0));
      }
    }
  });

  it("validation: target shorter than scene count -> error (no zero-second scenes)", () => {
    const r = runTool({ videoIdea: "ok idea", targetLengthSec: 5, sceneCount: 6 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("1+ second"));
  });

  it("scenes are numbered sequentially with shot + narration text", () => {
    const { scenes } = planScenes("how to bake sourdough", 45, 3);
    assert.deepEqual(scenes.map((s) => s.scene), [1, 2, 3]);
    for (const s of scenes) {
      assert.ok(typeof s.visualPrompt === "string" && s.visualPrompt.length > 0);
      assert.ok(typeof s.narration === "string" && s.narration.length > 0);
    }
    assert.ok(scenes[0].visualPrompt.includes(SHOT_TYPES[0]));
  });

  it("shot types and narration templates cycle when scenes exceed banks", () => {
    const { scenes } = planScenes("quick tip video", 60, 10);
    assert.equal(scenes[8].visualPrompt.split(":")[0], SHOT_TYPES[8 % SHOT_TYPES.length]);
    assert.ok(scenes[8].narration.length > 0);
  });

  it("narration lines embed the video idea (template placeholder replaced)", () => {
    const { scenes } = planScenes("desk setup tour", 30, 2);
    assert.ok(scenes.every((s) => s.narration.includes("desk setup tour")));
    assert.ok(scenes.every((s) => !s.narration.includes("{idea}")));
  });

  it("determinism: same inputs twice -> identical plan", () => {
    const args = { videoIdea: "garden tips", targetLengthSec: 90, sceneCount: 5 };
    assert.deepEqual(runTool(args), runTool(args));
  });

  it("boundary: minimum and maximum values accepted", () => {
    const lo = runTool({ videoIdea: "hi there", targetLengthSec: MIN_LENGTH_SEC, sceneCount: MIN_SCENES });
    assert.equal(lo.ok, true);
    const hi = runTool({ videoIdea: "hi there", targetLengthSec: MAX_LENGTH_SEC, sceneCount: MAX_SCENES });
    assert.equal(hi.ok, true);
    assert.equal((hi.values as Record<string, unknown>)["sceneCount"], MAX_SCENES);
  });

  it("sanitizeIdea strips HTML and URLs", () => {
    assert.equal(sanitizeIdea("<em>idea</em> http://x.com"), "idea");
  });

  it("validation: missing videoIdea -> error", () => {
    const r = runTool({ targetLengthSec: 30, sceneCount: 3 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: targetLengthSec out of range -> error", () => {
    assert.equal(runTool({ videoIdea: "ok idea", targetLengthSec: 4, sceneCount: 3 }).ok, false);
    assert.equal(runTool({ videoIdea: "ok idea", targetLengthSec: 601, sceneCount: 3 }).ok, false);
    assert.equal(runTool({ videoIdea: "ok idea", targetLengthSec: "30", sceneCount: 3 }).ok, false);
    assert.equal(runTool({ videoIdea: "ok idea", targetLengthSec: NaN, sceneCount: 3 }).ok, false);
  });

  it("validation: sceneCount out of range or fractional -> error", () => {
    assert.equal(runTool({ videoIdea: "ok idea", targetLengthSec: 30, sceneCount: 1 }).ok, false);
    assert.equal(runTool({ videoIdea: "ok idea", targetLengthSec: 30, sceneCount: 13 }).ok, false);
    assert.equal(runTool({ videoIdea: "ok idea", targetLengthSec: 30, sceneCount: 2.6 }).ok, false);
  });

  it("NARRATION_TEMPLATES bank documented size is 8", () => {
    assert.equal(NARRATION_TEMPLATES.length, 8);
    assert.equal(SHOT_TYPES.length, 8);
  });
});
