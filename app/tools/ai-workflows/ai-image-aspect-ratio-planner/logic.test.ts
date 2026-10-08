import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  gcd,
  round2,
  simplifyRatio,
  nearestPresets,
  buildCropGuidance,
  findPreset,
  PRESETS,
} from "./logic.ts";

describe("ai-image-aspect-ratio-planner (tool-348)", () => {
  it("happy path: 1920x1080 simplifies to 16:9", () => {
    const res = runTool({ width: 1920, height: 1080 });
    assert.equal(res.ok, true);
    assert.equal(res.values!.simplifiedRatio, "16:9 (decimal 1.78)");
  });

  it("square: 1080x1080 simplifies to 1:1", () => {
    const res = runTool({ width: 1080, height: 1080 });
    assert.equal(res.ok, true);
    assert.equal(res.values!.simplifiedRatio, "1:1 (decimal 1.00)");
  });

  it("GCD handles non-obvious sizes: 1200x630 -> 40:21", () => {
    const res = runTool({ width: 1200, height: 630 });
    assert.equal(res.ok, true);
    assert.match(res.values!.simplifiedRatio, /^40:21/);
  });

  it("decimal rounds to 2 decimals: 1000x700 -> 10:7 (decimal 1.43)", () => {
    const res = runTool({ width: 1000, height: 700 });
    assert.equal(res.ok, true);
    assert.equal(res.values!.simplifiedRatio, "10:7 (decimal 1.43)");
  });

  it("rejects missing width", () => {
    const res = runTool({ height: 1080 });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Width is required/);
  });

  it("rejects missing height", () => {
    const res = runTool({ width: 1920 });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Height is required/);
  });

  it("rejects zero width", () => {
    const res = runTool({ width: 0, height: 1080 });
    assert.equal(res.ok, false);
    assert.match(res.error!, /positive/);
  });

  it("rejects negative height", () => {
    const res = runTool({ width: 1920, height: -5 });
    assert.equal(res.ok, false);
    assert.match(res.error!, /positive/);
  });

  it("rejects non-integer dimensions", () => {
    const res = runTool({ width: 1920.5, height: 1080 });
    assert.equal(res.ok, false);
    assert.match(res.error!, /whole number/);
  });

  it("rejects non-numeric dimensions", () => {
    const res = runTool({ width: "abc", height: 1080 });
    assert.equal(res.ok, false);
    assert.match(res.error!, /whole number/);
  });

  it("accepts numeric strings as dimensions", () => {
    const res = runTool({ width: "1920", height: "1080" });
    assert.equal(res.ok, true);
    assert.equal(res.values!.simplifiedRatio, "16:9 (decimal 1.78)");
  });

  it("preset path: youtube-shorts -> 9:16 with an exact match line", () => {
    const res = runTool({ preset: "youtube-shorts" });
    assert.equal(res.ok, true);
    assert.equal(res.values!.simplifiedRatio, "9:16 (decimal 0.56)");
    assert.match(res.values!.nearestPresets[0], /9:16 \(decimal 0\.56\).*EXACT MATCH/);
    assert.ok(
      res.values!.nearestPresets.some((l) => /YouTube Shorts.*EXACT MATCH/.test(l)),
      "YouTube Shorts should appear as an exact match",
    );
    assert.match(res.values!.cropGuidance, /^Selected preset: YouTube Shorts/);
  });

  it("preset lookup is case-insensitive", () => {
    assert.equal(findPreset("YouTube-Shorts")!.id, "youtube-shorts");
  });

  it("unknown preset returns a helpful error", () => {
    const res = runTool({ preset: "my-cousin-vinny" });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Unknown platform preset/);
    assert.match(res.error!, /youtube-shorts/);
  });

  it("explicit width/height take precedence over a pre-selected preset", () => {
    const res = runTool({ width: 1920, height: 1080, preset: "instagram-square" });
    assert.equal(res.ok, true);
    assert.equal(res.values!.simplifiedRatio, "16:9 (decimal 1.78)");
  });

  it("preset is used when width/height are blank", () => {
    const res = runTool({ width: "", height: "", preset: "instagram-square" });
    assert.equal(res.ok, true);
    assert.equal(res.values!.simplifiedRatio, "1:1 (decimal 1.00)");
  });

  it("nearest presets: exactly 3, sorted by ascending diff", () => {
    const s = simplifyRatio(1500, 900);
    const near = nearestPresets(s);
    assert.equal(near.length, 3);
    for (let i = 1; i < near.length; i++) {
      assert.ok(near[i].diff >= near[i - 1].diff, "not sorted by diff");
    }
  });

  it("nearest presets: 1920x1080 marks a 16:9 preset as exact", () => {
    const near = nearestPresets(simplifyRatio(1920, 1080));
    assert.equal(near[0].exact, true);
    assert.equal(near[0].diff, 0);
  });

  it("crop guidance: exact match says no cropping needed", () => {
    const res = runTool({ width: 1920, height: 1080 });
    assert.match(res.values!.cropGuidance, /No cropping needed/);
  });

  it("crop guidance: taller input trims height (1500x900 -> 16:9)", () => {
    const res = runTool({ width: 1500, height: 900 });
    assert.match(
      res.values!.cropGuidance,
      /trim 56 px total from the height \(900 -> 844 px\)/,
    );
    assert.match(res.values!.cropGuidance, /about 28 px from top and bottom/);
  });

  it("crop guidance: wider input trims width (1800x900 -> 40:21)", () => {
    const res = runTool({ width: 1800, height: 900 });
    assert.match(
      res.values!.cropGuidance,
      /trim 86 px total from the width \(1800 -> 1714 px\)/,
    );
  });

  it("crop guidance always includes the preset note and edge advice", () => {
    const res = runTool({ width: 1500, height: 900 });
    assert.match(res.values!.cropGuidance, /Preset note:/);
    assert.match(res.values!.cropGuidance, /General advice/);
  });

  it("buildCropGuidance is callable directly with a custom size note", () => {
    const s = simplifyRatio(800, 600);
    const near = nearestPresets(s);
    const g = buildCropGuidance(s, near[0], "Custom note line.");
    assert.ok(g.startsWith("Custom note line."));
  });

  it("deterministic: same input produces identical output twice", () => {
    const a = runTool({ width: 1500, height: 900 });
    const b = runTool({ width: 1500, height: 900 });
    assert.deepEqual(a, b);
  });

  it("preset table holds exactly 14 reference presets", () => {
    assert.equal(PRESETS.length, 14);
    const ids = PRESETS.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("gcd is correct on known pairs", () => {
    assert.equal(gcd(1920, 1080), 120);
    assert.equal(gcd(1200, 630), 30);
    assert.equal(gcd(7, 5), 1);
    assert.equal(gcd(1080, 1080), 1080);
  });

  it("round2 rounds half-up to 2 decimals", () => {
    assert.equal(round2(1.428571), 1.43);
    assert.equal(round2(1.777777), 1.78);
    assert.equal(round2(1.9), 1.9);
  });

  it("output ids are exactly simplifiedRatio, nearestPresets, cropGuidance", () => {
    const res = runTool({ width: 1920, height: 1080 });
    assert.deepEqual(Object.keys(res.values!).sort(), [
      "cropGuidance",
      "nearestPresets",
      "simplifiedRatio",
    ]);
  });

  it("portrait: 1080x1920 -> 9:16, nearest are the vertical presets", () => {
    const res = runTool({ width: 1080, height: 1920 });
    assert.equal(res.values!.simplifiedRatio, "9:16 (decimal 0.56)");
    assert.match(res.values!.nearestPresets[0], /9:16/);
  });
});
