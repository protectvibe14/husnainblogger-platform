import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = {
  sourceW: 1920,
  sourceH: 1080,
  targetAspect: "9:16",
  cropAnchor: "center",
};

describe("aspect-ratio-crop-visualizer (tool-273)", () => {
  it("happy path: 16:9 -> 9:16 centered crop with all six outputs", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.cropRect, "x=656, y=0, w=608, h=1080");
    assert.equal(v.pixelsLostPct, 68.3);
    assert.equal(typeof v.safeZones, "string");
    assert.equal(typeof v.svgPreviewParams, "string");
    assert.equal(v.mode, "crop");
    assert.ok(String(v.warning).includes("Heavy crop"), String(v.warning));
    assert.ok(!r.error);
  });

  it("output keys match meta.ts outputs", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), [
      "cropRect",
      "mode",
      "pixelsLostPct",
      "safeZones",
      "svgPreviewParams",
      "warning",
    ]);
  });

  it("1:1 crop from 1920x1080 centers a 1080x1080 square", () => {
    const r = runTool({ ...base, targetAspect: "1:1" });
    const v = r.values as Record<string, unknown>;
    assert.equal(v.cropRect, "x=420, y=0, w=1080, h=1080");
    assert.equal(v.pixelsLostPct, 43.8);
    assert.equal(v.warning, "");
  });

  it("same aspect (16:9 -> 16:9) keeps the full frame, 0% lost", () => {
    const r = runTool({ ...base, targetAspect: "16:9" });
    const v = r.values as Record<string, unknown>;
    assert.equal(v.cropRect, "x=0, y=0, w=1920, h=1080");
    assert.equal(v.pixelsLostPct, 0);
  });

  it("edge case: target wider than source -> letterbox mode with warning", () => {
    const r = runTool({ sourceW: 1080, sourceH: 1920, targetAspect: "16:9", cropAnchor: "center" });
    const v = r.values as Record<string, unknown>;
    assert.equal(v.mode, "letterbox");
    assert.equal(v.pixelsLostPct, 0);
    assert.ok(String(v.cropRect).includes("full frame"));
    assert.ok(String(v.warning).includes("letterbox"));
  });

  it("anchor top/bottom: vertical anchors are no-ops when the crop keeps full height", () => {
    // 1920x1080 -> 1:1: the crop keeps the full 1080px height, so only x can move.
    const top = runTool({ sourceW: 1920, sourceH: 1080, targetAspect: "1:1", cropAnchor: "top" });
    assert.ok(String((top.values as Record<string, unknown>).cropRect).startsWith("x=420, y=0"));
    const bottom = runTool({ sourceW: 1920, sourceH: 1080, targetAspect: "1:1", cropAnchor: "bottom" });
    assert.equal((bottom.values as Record<string, unknown>).cropRect, "x=420, y=0, w=1080, h=1080");
  });

  it("anchor left/right pin the crop horizontally", () => {
    const left = runTool({ ...base, cropAnchor: "left" });
    assert.ok(String((left.values as Record<string, unknown>).cropRect).startsWith("x=0, y=0"));
    const right = runTool({ ...base, cropAnchor: "right" });
    assert.ok(String((right.values as Record<string, unknown>).cropRect).startsWith("x=1312, y=0"));
  });

  it("custom anchor 0/0 pins to top-left; values clamp inside bounds", () => {
    const r = runTool({ ...base, cropAnchor: "custom", anchorX: 0, anchorY: 0 });
    assert.ok(String((r.values as Record<string, unknown>).cropRect).startsWith("x=0, y=0"));
    const mid = runTool({ ...base, cropAnchor: "custom", anchorX: 50, anchorY: 50 });
    assert.equal((mid.values as Record<string, unknown>).cropRect, "x=656, y=0, w=608, h=1080");
  });

  it("custom aspect 3:4 parses and crops correctly", () => {
    const r = runTool({ ...base, targetAspect: "custom", targetAspectCustom: "3:4" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    // targetRatio 0.75: cropW = 810, cropH = 1080, x = (1920-810)/2 = 555
    assert.equal(v.cropRect, "x=555, y=0, w=810, h=1080");
  });

  it("safe zones describe the center 80% with concrete coordinates", () => {
    const r = runTool(base);
    const sz = String((r.values as Record<string, unknown>).safeZones);
    assert.ok(sz.includes("center 80%"), sz);
    assert.ok(/\d+-\d+/.test(sz), sz);
  });

  it("svgPreviewParams is parseable JSON with source/crop/safe/mode", () => {
    const r = runTool(base);
    const p = JSON.parse(String((r.values as Record<string, unknown>).svgPreviewParams)) as Record<string, unknown>;
    assert.deepEqual(p.source, { w: 1920, h: 1080 });
    assert.deepEqual(p.crop, { x: 656, y: 0, w: 608, h: 1080 });
    assert.ok((p.safe as object) !== undefined);
    assert.equal(p.mode, "crop");
  });

  it("validation: zero/negative source dimensions -> error", () => {
    assert.equal(runTool({ ...base, sourceW: 0 }).ok, false);
    assert.equal(runTool({ ...base, sourceH: -5 }).ok, false);
  });

  it("validation: unknown target aspect -> error", () => {
    const r = runTool({ ...base, targetAspect: "21:9" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("target aspect"));
  });

  it("validation: malformed custom aspect -> error", () => {
    const r = runTool({ ...base, targetAspect: "custom", targetAspectCustom: "wide" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("3:4"));
  });

  it("validation: custom anchor outside 0-100 -> error", () => {
    const r = runTool({ ...base, cropAnchor: "custom", anchorX: 120, anchorY: 50 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("0 and 100"));
  });

  it("validation: unknown anchor -> error", () => {
    const r = runTool({ ...base, cropAnchor: "diagonal" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("determinism: same inputs twice -> identical output", () => {
    assert.deepEqual(runTool(base), runTool(base));
  });

  it("honesty: svgPreviewParams is parameters, not a rendered image", () => {
    const r = runTool(base);
    const p = String((r.values as Record<string, unknown>).svgPreviewParams);
    assert.ok(!p.includes("data:image"), "must be coordinates, not an image");
    const parsed = JSON.parse(p) as Record<string, unknown>;
    assert.ok(parsed.crop !== undefined && parsed.safe !== undefined);
  });
});
