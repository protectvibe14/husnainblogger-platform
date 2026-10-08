import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const SAMPLES = "0.0, 0.25, -0.5, 0.75, -0.75, 0.5, -0.25, 0.1, -0.1, 0.4";

describe("voiceover-level-meter (tool-271)", () => {
  it("happy path: returns all five outputs with correct types", () => {
    const r = runTool({ samples: SAMPLES, targetDb: -12 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(typeof v.peakDb, "number");
    assert.equal(typeof v.rmsDb, "number");
    assert.equal(typeof v.loudnessVerdict, "string");
    assert.equal(typeof v.gainAdjustmentDb, "number");
    assert.equal(typeof v.clippingDetected, "string");
    assert.ok(!r.error);
  });

  it("output keys match meta.ts outputs (peakDb, rmsDb, loudnessVerdict, gainAdjustmentDb, clippingDetected)", () => {
    const r = runTool({ samples: SAMPLES, targetDb: -12 });
    assert.deepEqual(Object.keys(r.values as object).sort(), [
      "clippingDetected",
      "gainAdjustmentDb",
      "loudnessVerdict",
      "peakDb",
      "rmsDb",
    ]);
  });

  it("peakDb = 20*log10(max|x|): 0.75 peak -> about -2.5 dBFS", () => {
    const r = runTool({ samples: SAMPLES, targetDb: -12 });
    const v = r.values as Record<string, unknown>;
    assert.equal(v.peakDb, -2.5);
  });

  it("rmsDb matches the manual RMS calculation", () => {
    const vals = SAMPLES.split(",").map(Number);
    const rms = Math.sqrt(vals.reduce((a, x) => a + x * x, 0) / vals.length);
    const expected = Math.round(20 * Math.log10(rms) * 10) / 10;
    const r = runTool({ samples: SAMPLES, targetDb: -12 });
    assert.equal((r.values as Record<string, unknown>).rmsDb, expected);
  });

  it("gainAdjustmentDb = targetDb - rmsDb", () => {
    const r = runTool({ samples: SAMPLES, targetDb: -12 });
    const v = r.values as Record<string, unknown>;
    assert.equal(v.gainAdjustmentDb, Math.round((-12 - (v.rmsDb as number)) * 10) / 10);
  });

  it("quiet input yields a 'Too quiet' verdict with a positive gain suggestion", () => {
    const r = runTool({ samples: "0.01, -0.02, 0.015, -0.01, 0.02, -0.015, 0.012, -0.018", targetDb: -12 });
    const v = r.values as Record<string, unknown>;
    assert.ok(String(v.loudnessVerdict).startsWith("Too quiet"), String(v.loudnessVerdict));
    assert.ok((v.gainAdjustmentDb as number) > 0);
  });

  it("on-target input yields an 'On target' verdict", () => {
    // RMS -12 dBFS -> amplitude ~0.251; use constant 0.251 across samples.
    const r = runTool({ samples: Array(12).fill("0.251").join(", "), targetDb: -12 });
    const v = r.values as Record<string, unknown>;
    assert.ok(String(v.loudnessVerdict).startsWith("On target"), String(v.loudnessVerdict));
    assert.ok(Math.abs(v.gainAdjustmentDb as number) <= 0.2);
  });

  it("loud input yields a 'Too loud' verdict with a negative gain suggestion", () => {
    const r = runTool({ samples: Array(12).fill("0.9").join(", "), targetDb: -12 });
    const v = r.values as Record<string, unknown>;
    assert.ok(String(v.loudnessVerdict).startsWith("Too loud"), String(v.loudnessVerdict));
    assert.ok((v.gainAdjustmentDb as number) < 0);
  });

  it("clipping: sample at exactly 1.0 -> clippingDetected Yes + clipping warning", () => {
    const r = runTool({ samples: "0.2, -0.3, 1.0, 0.1, -0.2, 0.3, -0.1, 0.25", targetDb: -12 });
    const v = r.values as Record<string, unknown>;
    assert.equal(v.clippingDetected, "Yes");
    assert.ok(String(v.loudnessVerdict).includes("Clipping detected"));
    assert.equal(v.peakDb, 0);
  });

  it("no clipping when all samples are below 1.0", () => {
    const r = runTool({ samples: SAMPLES, targetDb: -12 });
    assert.equal((r.values as Record<string, unknown>).clippingDetected, "No");
  });

  it("all silence -> explicit silence message, floor dB, zero gain adjustment", () => {
    const r = runTool({ samples: "0, 0, 0, 0, 0, 0, 0, 0, 0, 0", targetDb: -12 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.peakDb, -120);
    assert.equal(v.rmsDb, -120);
    assert.ok(String(v.loudnessVerdict).includes("All silence"));
    assert.equal(v.gainAdjustmentDb, 0);
    assert.equal(v.clippingDetected, "No");
  });

  it("accepts a number[] input directly", () => {
    const r = runTool({ samples: [0.2, -0.3, 0.5, -0.5, 0.4, -0.4, 0.1, -0.1], targetDb: -12 });
    assert.equal(r.ok, true);
    assert.equal((r.values as Record<string, unknown>).peakDb, -6);
  });

  it("accepts whitespace/newline-separated samples too", () => {
    const r = runTool({ samples: "0.2\n-0.3 0.5\n-0.5 0.4 -0.4 0.1 -0.1", targetDb: -12 });
    assert.equal(r.ok, true);
  });

  it("targetDb defaults to -12 when omitted", () => {
    const a = runTool({ samples: SAMPLES });
    const b = runTool({ samples: SAMPLES, targetDb: -12 });
    assert.deepEqual(a.values, b.values);
  });

  it("validation: empty samples -> error", () => {
    const r = runTool({ samples: "   ", targetDb: -12 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: non-numeric token names its position", () => {
    const r = runTool({ samples: "0.1, 0.2, abc, 0.4, 0.1, 0.2, 0.3, 0.4", targetDb: -12 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("#3"));
  });

  it("validation: sample outside -1..1 -> error", () => {
    const r = runTool({ samples: "0.1, 0.2, 1.5, 0.4, 0.1, 0.2, 0.3, 0.4", targetDb: -12 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("-1..1"));
  });

  it("validation: fewer than 8 samples -> error", () => {
    const r = runTool({ samples: "0.1, 0.2, 0.3", targetDb: -12 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("at least 8"));
  });

  it("validation: targetDb outside -30..-3 -> error", () => {
    for (const t of [-40, 0, -2]) {
      const r = runTool({ samples: SAMPLES, targetDb: t });
      assert.equal(r.ok, false, `targetDb=${t}`);
      assert.ok(String(r.error).includes("-30 to -3"));
    }
  });

  it("validation: non-numeric targetDb -> error", () => {
    const r = runTool({ samples: SAMPLES, targetDb: "loud" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("determinism: same input twice -> identical output", () => {
    const a = runTool({ samples: SAMPLES, targetDb: -14 });
    const b = runTool({ samples: SAMPLES, targetDb: -14 });
    assert.deepEqual(a, b);
  });

  it("determinism: textarea string and equivalent number[] agree", () => {
    const a = runTool({ samples: "0.2, -0.3, 0.5, -0.5, 0.4, -0.4, 0.1, -0.1", targetDb: -12 });
    const b = runTool({ samples: [0.2, -0.3, 0.5, -0.5, 0.4, -0.4, 0.1, -0.1], targetDb: -12 });
    assert.deepEqual(a.values, b.values);
  });
});
