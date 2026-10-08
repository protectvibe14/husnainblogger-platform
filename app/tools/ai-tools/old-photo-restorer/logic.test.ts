import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getModelConfig,
  getDisclosures,
  validateInputs,
  computeContrastLut,
  grayWorldGains,
  medianFilter3x3,
  upscale2xBilinear,
  HEADLINE,
  MAX_FILE_MB,
} from "./logic.ts";

describe("old-photo-restorer logic", () => {
  it("getModelConfig returns null — no model, filters only", () => {
    assert.equal(getModelConfig(), null);
  });

  it("disclosures say filters, not AI", () => {
    const d = getDisclosures().join(" ");
    assert.ok(d.includes("not AI restoration"));
    assert.ok(d.includes("never uploaded"));
    assert.ok(/tears|deep damage/i.test(d));
  });

  it("headline is honest", () => {
    assert.ok(!/ai-powered|ai restoration/i.test(HEADLINE));
  });

  it("computeContrastLut stretches [min,max] to [0,255]", () => {
    const lut = computeContrastLut(50, 200);
    assert.equal(lut.length, 256);
    assert.equal(lut[50], 0);
    assert.equal(lut[200], 255);
    assert.equal(lut[125], 128);
    assert.ok(lut.every((v) => v >= 0 && v <= 255));
  });

  it("computeContrastLut with degenerate range is identity", () => {
    const lut = computeContrastLut(100, 100);
    assert.equal(lut[0], 0);
    assert.equal(lut[255], 255);
  });

  it("grayWorldGains neutralizes a yellow cast", () => {
    const [gr, gg, gb] = grayWorldGains(200, 180, 100); // yellowish
    assert.ok(gr < 1 && gg < 1, "warm channels are pulled down");
    assert.ok(gb > 1, "blue channel is boosted");
    assert.ok([gr, gg, gb].every((g) => g >= 0.5 && g <= 2));
  });

  it("grayWorldGains is ~1 for a neutral image", () => {
    const [gr, gg, gb] = grayWorldGains(128, 128, 128);
    assert.ok(Math.abs(gr - 1) < 1e-9);
    assert.ok(Math.abs(gg - 1) < 1e-9);
    assert.ok(Math.abs(gb - 1) < 1e-9);
  });

  it("medianFilter3x3 removes a single hot pixel", () => {
    const src = [
      [10, 10, 10],
      [10, 255, 10],
      [10, 10, 10],
    ];
    const out = medianFilter3x3(src, 3, 3);
    assert.equal(out[1][1], 10);
  });

  it("upscale2xBilinear doubles dimensions and interpolates", () => {
    const src = [
      [0, 100],
      [100, 200],
    ];
    const out = upscale2xBilinear(src, 2, 2);
    assert.equal(out.length, 4);
    assert.equal(out[0].length, 4);
    assert.equal(out[0][0], 0);
    assert.equal(out[3][3], 200);
    // center pixel is an average blend
    assert.ok(out[1][1] > 0 && out[1][1] < 200);
  });

  it("validateInputs: happy path", () => {
    assert.deepEqual(validateInputs({ fileName: "scan.jpg", fileSizeMb: 3 }), {
      ok: true,
    });
  });

  it("validateInputs: missing / oversized -> error", () => {
    assert.equal(validateInputs({}).ok, false);
    assert.equal(
      validateInputs({ fileName: "x.jpg", fileSizeMb: MAX_FILE_MB + 1 }).ok,
      false,
    );
  });

  it("determinism", () => {
    assert.deepEqual(computeContrastLut(10, 240), computeContrastLut(10, 240));
    assert.deepEqual(grayWorldGains(200, 180, 100), grayWorldGains(200, 180, 100));
  });
});
