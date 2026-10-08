import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = {
  durationSec: 120,
  timestampSec: 12.5,
  sourceWidth: 1920,
  sourceHeight: 1080,
  outputSize: "1080p",
};

describe("video-frame-grabber (tool-272)", () => {
  it("happy path: returns the four expected outputs", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.actualTimestampSec, 12.5);
    assert.equal(v.outputDimensions, "1920 x 1080");
    assert.equal(typeof v.extractionSettings, "string");
    assert.equal(v.warning, "");
    assert.ok(!r.error);
  });

  it("output keys match meta.ts outputs (actualTimestampSec, outputDimensions, extractionSettings, warning)", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), [
      "actualTimestampSec",
      "extractionSettings",
      "outputDimensions",
      "warning",
    ]);
  });

  it("edge case: timestamp beyond duration -> clamped to last frame with warning", () => {
    const r = runTool({ ...base, timestampSec: 999 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.actualTimestampSec, 120);
    assert.ok(String(v.warning).includes("clamped to the last frame"));
    assert.ok(String(v.warning).includes("120"));
  });

  it("edge case: timestamp exactly at duration is accepted without warning", () => {
    const r = runTool({ ...base, timestampSec: 120 });
    assert.equal(r.ok, true);
    assert.equal((r.values as Record<string, unknown>).warning, "");
  });

  it("720p scales 1920x1080 down to 1280x720 preserving aspect", () => {
    const r = runTool({ ...base, outputSize: "720p" });
    assert.equal((r.values as Record<string, unknown>).outputDimensions, "1280 x 720");
  });

  it("original keeps source dimensions untouched", () => {
    const r = runTool({ ...base, outputSize: "original" });
    assert.equal((r.values as Record<string, unknown>).outputDimensions, "1920 x 1080");
  });

  it("portrait source: 1080p fits inside 1920x1080 without distortion", () => {
    const r = runTool({ ...base, sourceWidth: 1080, sourceHeight: 1920, outputSize: "1080p" });
    // scale = min(1920/1080, 1080/1920) = 0.5625 -> 607.5 -> even-down 606? No: 1080*0.5625=607.5 -> 606; 1920*0.5625=1080
    assert.equal((r.values as Record<string, unknown>).outputDimensions, "606 x 1080");
  });

  it("never upscales: 640x480 source stays 640x480 for 1080p", () => {
    const r = runTool({ ...base, sourceWidth: 640, sourceHeight: 480, outputSize: "1080p" });
    assert.equal((r.values as Record<string, unknown>).outputDimensions, "640 x 480");
  });

  it("odd source dimensions round down to even integers", () => {
    const r = runTool({
      ...base,
      sourceWidth: 1919,
      sourceHeight: 1079,
      outputSize: "720p",
    });
    const dims = String((r.values as Record<string, unknown>).outputDimensions);
    const [w, h] = dims.split(" x ").map(Number);
    assert.equal(w % 2, 0);
    assert.equal(h % 2, 0);
  });

  it("extraction settings name the actual timestamp and dimensions", () => {
    const r = runTool({ ...base, timestampSec: 200, outputSize: "720p" });
    const s = String((r.values as Record<string, unknown>).extractionSettings);
    assert.ok(s.includes("120s"), s);
    assert.ok(s.includes("1280x720"), s);
    assert.ok(s.includes("no upload"), s);
  });

  it("accepts numeric strings for numeric inputs", () => {
    const r = runTool({
      durationSec: "60",
      timestampSec: "30",
      sourceWidth: "1920",
      sourceHeight: "1080",
      outputSize: "720p",
    });
    assert.equal(r.ok, true);
    assert.equal((r.values as Record<string, unknown>).actualTimestampSec, 30);
  });

  it("validation: negative timestamp -> error", () => {
    const r = runTool({ ...base, timestampSec: -5 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("negative"));
  });

  it("validation: missing timestamp -> error", () => {
    const r = runTool({ ...base, timestampSec: "" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: zero/negative duration -> error", () => {
    for (const d of [0, -10]) {
      const r = runTool({ ...base, durationSec: d });
      assert.equal(r.ok, false, `durationSec=${d}`);
    }
  });

  it("validation: non-integer or zero resolution -> error", () => {
    const r1 = runTool({ ...base, sourceWidth: 1920.5 });
    assert.equal(r1.ok, false);
    const r2 = runTool({ ...base, sourceHeight: 0 });
    assert.equal(r2.ok, false);
  });

  it("validation: unknown output size -> error", () => {
    const r = runTool({ ...base, outputSize: "4k" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("1080p"));
  });

  it("validation: absurd resolution -> error", () => {
    const r = runTool({ ...base, sourceWidth: 20000 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("16384"));
  });

  it("determinism: same inputs twice -> identical output", () => {
    const a = runTool(base);
    const b = runTool(base);
    assert.deepEqual(a, b);
  });

  it("honesty: no image is ever produced — outputs are math + settings only", () => {
    const r = runTool(base);
    const v = r.values as Record<string, unknown>;
    const blob = JSON.stringify(v);
    assert.ok(!blob.includes("data:image"), "must not claim to output an image");
    assert.ok(!blob.includes("base64"), "must not claim to output an image");
  });
});
