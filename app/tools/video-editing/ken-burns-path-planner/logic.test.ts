import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = {
  imageW: 4000,
  imageH: 3000,
  videoAspect: "16:9",
  moveType: "zoom-in",
  durationSec: 6,
  zoomStrength: 1.3,
};
const OUTPUT_IDS = ["cropWindows", "keyframes", "safeCheck"];

describe("ken-burns-path-planner (tool-264)", () => {
  it("happy path: zoom-in returns 11 keyframes, 2 crop windows, safeCheck", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const kf = v.keyframes as { t: number; x: number; y: number; scale: number }[];
    assert.equal(kf.length, 11);
    assert.equal(kf[0].t, 0);
    assert.equal(kf[kf.length - 1].t, 6);
    assert.equal(kf[0].scale, 1);
    assert.equal(kf[kf.length - 1].scale, 1.3);
    const cw = v.cropWindows as { t: number; x: number; y: number; w: number; h: number }[];
    assert.equal(cw.length, 2);
    assert.equal(cw[0].t, 0);
    assert.equal(cw[1].t, 6);
    assert.ok(Array.isArray(v.safeCheck));
  });

  it("output keys match meta.ts outputs exactly", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), OUTPUT_IDS);
  });

  it("zoom-in: center stays at image center, scale rises 1 -> 1.3", () => {
    const r = runTool(base);
    const kf = (r.values as Record<string, unknown>).keyframes as { x: number; y: number; scale: number }[];
    for (const k of kf) {
      assert.equal(k.x, 2000);
      assert.equal(k.y, 1500);
    }
    const scales = kf.map((k) => k.scale);
    assert.deepEqual(scales, [...scales].sort((a, b) => a - b));
  });

  it("zoom-out: scale falls 1.3 -> 1", () => {
    const r = runTool({ ...base, moveType: "zoom-out" });
    const kf = (r.values as Record<string, unknown>).keyframes as { scale: number }[];
    assert.equal(kf[0].scale, 1.3);
    assert.equal(kf[kf.length - 1].scale, 1);
  });

  it("pan-left: x descends at constant zoom", () => {
    const r = runTool({ ...base, moveType: "pan-left" });
    const kf = (r.values as Record<string, unknown>).keyframes as { x: number; y: number; scale: number }[];
    assert.ok(kf[0].x > kf[kf.length - 1].x);
    for (const k of kf) assert.equal(k.scale, 1.3);
  });

  it("pan-right: x ascends", () => {
    const r = runTool({ ...base, moveType: "pan-right" });
    const kf = (r.values as Record<string, unknown>).keyframes as { x: number }[];
    assert.ok(kf[0].x < kf[kf.length - 1].x);
  });

  it("pan-up: y descends; pan-down: y ascends", () => {
    const up = (runTool({ ...base, moveType: "pan-up" }).values as Record<string, unknown>).keyframes as { y: number }[];
    assert.ok(up[0].y > up[up.length - 1].y);
    const down = (runTool({ ...base, moveType: "pan-down" }).values as Record<string, unknown>).keyframes as { y: number }[];
    assert.ok(down[0].y < down[down.length - 1].y);
  });

  it("9:16 aspect plans a vertical base crop", () => {
    const r = runTool({ ...base, imageW: 3000, imageH: 4000, videoAspect: "9:16", moveType: "zoom-in" });
    assert.equal(r.ok, true);
    const cw = (r.values as Record<string, unknown>).cropWindows as { w: number; h: number }[];
    assert.ok(cw[0].h > cw[0].w, "vertical crop");
    const kf = (r.values as Record<string, unknown>).keyframes as { x: number; y: number }[];
    assert.equal(kf[0].x, 1500);
    assert.equal(kf[0].y, 2000);
  });

  it("edge case: image too small errors (would upscale)", () => {
    const r = runTool({ ...base, imageW: 800, imageH: 600 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("upscale"));
  });

  it("edge case: zoomStrength 1.0 degenerates to static with a warning", () => {
    const r = runTool({ ...base, moveType: "pan-left", zoomStrength: 1.0 });
    assert.equal(r.ok, true);
    const kf = (r.values as Record<string, unknown>).keyframes as { x: number; y: number; scale: number }[];
    for (const k of kf) {
      assert.equal(k.x, 2000);
      assert.equal(k.y, 1500);
      assert.equal(k.scale, 1);
    }
    const checks = (r.values as Record<string, unknown>).safeCheck as string[];
    assert.ok(checks.some((s) => s.toLowerCase().includes("static")));
  });

  it("edge case: extreme pan on narrow image warns and clamps", () => {
    const r = runTool({ ...base, zoomStrength: 1.05, moveType: "pan-left" });
    assert.equal(r.ok, true);
    const checks = (r.values as Record<string, unknown>).safeCheck as string[];
    assert.ok(checks.some((s) => s.toLowerCase().includes("clamped")));
  });

  it("keyframes never leave the image bounds", () => {
    for (const moveType of ["zoom-in", "zoom-out", "pan-left", "pan-right", "pan-up", "pan-down"]) {
      const r = runTool({ ...base, moveType });
      const kf = (r.values as Record<string, unknown>).keyframes as { x: number; y: number }[];
      for (const k of kf) {
        assert.ok(k.x >= 0 && k.x <= 4000, `${moveType}: x=${k.x}`);
        assert.ok(k.y >= 0 && k.y <= 3000, `${moveType}: y=${k.y}`);
      }
      const cw = (r.values as Record<string, unknown>).cropWindows as { x: number; y: number; w: number; h: number }[];
      for (const w of cw) {
        assert.ok(w.x >= 0 && w.y >= 0, `${moveType}: window in bounds`);
        assert.ok(w.x + w.w <= 4000 + 0.01 && w.y + w.h <= 3000 + 0.01, `${moveType}: window fits`);
      }
    }
  });

  it("validation error: zoomStrength above 2.0", () => {
    const r = runTool({ ...base, zoomStrength: 2.5 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("2.0"));
  });

  it("validation error: zoomStrength below 1.0", () => {
    const r = runTool({ ...base, zoomStrength: 0.8 });
    assert.equal(r.ok, false);
  });

  it("validation error: duration 0", () => {
    const r = runTool({ ...base, durationSec: 0 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("above 0"));
  });

  it("validation error: non-positive image dimensions", () => {
    const r1 = runTool({ ...base, imageW: -100 });
    assert.equal(r1.ok, false);
    const r2 = runTool({ ...base, imageH: 0 });
    assert.equal(r2.ok, false);
  });

  it("validation error: unknown aspect", () => {
    const r = runTool({ ...base, videoAspect: "4:3" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("16:9"));
  });

  it("validation error: unknown moveType", () => {
    const r = runTool({ ...base, moveType: "tilt" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("zoom-in"));
  });

  it("determinism: same inputs twice produce identical outputs", () => {
    const a = runTool({ ...base, moveType: "pan-up" });
    const b = runTool({ ...base, moveType: "pan-up" });
    assert.deepEqual(a, b);
  });
});
