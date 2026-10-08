import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = {
  targetPlatform: "TikTok",
  sourceResolution: "1080p",
  sourceFps: 30,
  priority: "quality",
};

describe("capcut-export-settings-finder (tool-251)", () => {
  it("happy path: TikTok 1080p/30/quality returns all 7 outputs", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.resolution, "1080p (1080x1920)");
    assert.equal(v.frameRate, 30);
    assert.equal(v.codec, "H.264");
    assert.equal(v.format, "MP4");
    assert.equal(v.aspectRatio, "9:16");
    assert.ok(String(v.bitrateTier).startsWith("High"));
    assert.ok(Array.isArray(v.rationale) && (v.rationale as string[]).length > 0);
  });

  it("output keys match meta.ts outputs", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), [
      "aspectRatio",
      "bitrateTier",
      "codec",
      "format",
      "frameRate",
      "rationale",
      "resolution",
    ]);
  });

  it("YouTube with 4K source raises export to 2160p landscape", () => {
    const r = runTool({ ...base, targetPlatform: "YouTube", sourceResolution: "2160p (4K)" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.resolution, "2160p (3840x2160)");
    assert.equal(v.aspectRatio, "16:9");
  });

  it("YouTube with 1080p source stays at 1080p (no 4K upscale)", () => {
    const r = runTool({ ...base, targetPlatform: "YouTube" });
    assert.equal((r.values as Record<string, unknown>).resolution, "1080p (1920x1080)");
  });

  it("desktop matches source resolution up to 4K", () => {
    const r = runTool({ ...base, targetPlatform: "desktop", sourceResolution: "1440p" });
    assert.equal((r.values as Record<string, unknown>).resolution, "1440p (2560x1440)");
  });

  it("desktop caps 8K source at 2160p with a rationale note", () => {
    const r = runTool({ ...base, targetPlatform: "desktop", sourceResolution: "4320p (8K)" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.resolution, "2160p (3840x2160)");
    assert.ok((v.rationale as string[]).some((x) => x.includes("8K")));
  });

  it("low-res source is never upscaled: warns against upscaling", () => {
    const r = runTool({ ...base, sourceResolution: "480p" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.resolution, "480p (480x853)");
    const rationale = v.rationale as string[];
    assert.ok(rationale.some((x) => x.toLowerCase().includes("upscal")));
  });

  it("fps above 60 is capped at 60 with a note", () => {
    const r = runTool({ ...base, sourceFps: 120 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.frameRate, 60);
    assert.ok((v.rationale as string[]).some((x) => x.includes("120 fps")));
  });

  it("non-standard fps 48 rounds to nearest standard (50)", () => {
    const r = runTool({ ...base, sourceFps: 48 });
    assert.equal((r.values as Record<string, unknown>).frameRate, 50);
  });

  it("standard fps 24 is kept as-is", () => {
    const r = runTool({ ...base, sourceFps: 24 });
    assert.equal((r.values as Record<string, unknown>).frameRate, 24);
  });

  it("priority fileSize picks the Low tier; uploadSpeed picks Balanced", () => {
    const fs = runTool({ ...base, priority: "fileSize" });
    const us = runTool({ ...base, priority: "uploadSpeed" });
    assert.ok(String((fs.values as Record<string, unknown>).bitrateTier).startsWith("Low"));
    assert.ok(String((us.values as Record<string, unknown>).bitrateTier).startsWith("Balanced"));
  });

  it("unknown platform falls back to safe defaults with a warning", () => {
    const r = runTool({ ...base, targetPlatform: "Vimeo" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.codec, "H.264");
    assert.equal(v.format, "MP4");
    assert.equal(v.frameRate, 30);
    assert.equal(v.resolution, "1080p (1920x1080)");
    assert.ok((v.rationale as string[]).some((x) => x.includes('Unknown platform "Vimeo"')));
  });

  it("validation: missing platform errors", () => {
    const r = runTool({ ...base, targetPlatform: "" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).toLowerCase().includes("platform"));
  });

  it("validation: unknown source resolution errors", () => {
    const r = runTool({ ...base, sourceResolution: "360p" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).toLowerCase().includes("resolution"));
  });

  it("validation: fps 0, 300, and non-numeric error", () => {
    for (const sourceFps of [0, 300, "thirty"]) {
      const r = runTool({ ...base, sourceFps });
      assert.equal(r.ok, false, String(sourceFps));
    }
  });

  it("validation: unknown priority errors", () => {
    const r = runTool({ ...base, priority: "fastest" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).toLowerCase().includes("priority"));
  });

  it("deterministic: two runs produce identical output", () => {
    const a = runTool(base);
    const b = runTool(base);
    assert.deepEqual(a, b);
  });

  it("bitrate rationale labels tiers as rule-of-thumb estimates", () => {
    const r = runTool(base);
    const rationale = (r.values as Record<string, unknown>).rationale as string[];
    assert.ok(rationale.some((x) => x.includes("rule-of-thumb")));
  });
});
