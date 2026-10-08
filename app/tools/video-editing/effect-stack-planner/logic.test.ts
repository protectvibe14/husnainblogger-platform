import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, LOOK_COUNT } from "./logic.ts";

const base = { desiredLook: "cinematic movie look", deviceTier: "mid", clipCount: 12 };

describe("effect-stack-planner", () => {
  it("happy path: cinematic look returns ordered stack, warnings, renderImpact", () => {
    const r = runTool({ ...base });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const stack = v.stack as { effect: string; order: number; intensity: number }[];
    assert.ok(stack.length >= 4);
    stack.forEach((s, i) => {
      assert.equal(s.order, i + 1, "order is 1..N");
      assert.ok(s.effect.length > 0);
      assert.ok(s.intensity >= 0 && s.intensity <= 100);
    });
    assert.equal(v.renderImpact, "med");
    assert.ok(Array.isArray(v.perfWarnings));
  });

  it("correction comes before stylization (rule baked into preset order)", () => {
    const r = runTool({ desiredLook: "cinematic", deviceTier: "high" });
    const stack = (r.values as Record<string, unknown>).stack as { effect: string }[];
    const idx = (name: string) => stack.findIndex((s) => s.effect === name);
    assert.ok(idx("Exposure Correction") < idx("Teal-Orange LUT"), "exposure before LUT");
    assert.ok(idx("Teal-Orange LUT") < idx("Film Grain"), "grade before grain");
    assert.ok(idx("Film Grain") < idx("Sharpen (light)"), "stylization before sharpen finish");
  });

  it("keyword matching: noir look", () => {
    const r = runTool({ desiredLook: "moody black and white", deviceTier: "mid" });
    assert.equal(r.ok, true);
    const names = ((r.values as Record<string, unknown>).stack as { effect: string }[]).map((s) => s.effect);
    assert.ok(names.includes("Black & White Filter"));
  });

  it("keyword matching: neon glow", () => {
    const r = runTool({ desiredLook: "neon city night cyber", deviceTier: "high" });
    const names = ((r.values as Record<string, unknown>).stack as { effect: string }[]).map((s) => s.effect);
    assert.ok(names.includes("Neon Glow"));
  });

  it("keyword matching: glitchy", () => {
    const r = runTool({ desiredLook: "edgy glitch trailer", deviceTier: "mid" });
    const names = ((r.values as Record<string, unknown>).stack as { effect: string }[]).map((s) => s.effect);
    assert.ok(names.includes("RGB Split"));
  });

  it("unmatched look falls back to clean stack with a warning", () => {
    const r = runTool({ desiredLook: "underwater documentary", deviceTier: "mid" });
    assert.equal(r.ok, true);
    const names = ((r.values as Record<string, unknown>).stack as { effect: string }[]).map((s) => s.effect);
    assert.ok(names.includes("White Balance Fix"));
    const warnings = (r.values as Record<string, unknown>).perfWarnings as string[];
    assert.ok(warnings.some((w) => w.includes("No preset matched")));
  });

  it("low tier + heavy stack -> strong warning with lighter alternative", () => {
    const r = runTool({ desiredLook: "cinematic", deviceTier: "low" });
    assert.equal(r.ok, true);
    const warnings = (r.values as Record<string, unknown>).perfWarnings as string[];
    assert.ok(warnings.some((w) => w.includes("STRONG WARNING") && w.includes("Lighter alternative")));
  });

  it("no strong warning on high tier", () => {
    const r = runTool({ desiredLook: "cinematic", deviceTier: "high" });
    const warnings = (r.values as Record<string, unknown>).perfWarnings as string[];
    assert.ok(!warnings.some((w) => w.includes("STRONG WARNING")));
  });

  it("blur redundancy flagged: dreamy soft has two blur-family effects", () => {
    const r = runTool({ desiredLook: "dreamy soft romantic", deviceTier: "mid" });
    const warnings = (r.values as Record<string, unknown>).perfWarnings as string[];
    assert.ok(warnings.some((w) => w.includes("REDUNDANCY") && w.includes("Soft Bloom") && w.includes("Gentle Blur")));
  });

  it("no redundancy warning for clean stack", () => {
    const r = runTool({ desiredLook: "clean natural", deviceTier: "mid" });
    const warnings = (r.values as Record<string, unknown>).perfWarnings as string[];
    assert.ok(!warnings.some((w) => w.includes("REDUNDANCY")));
  });

  it("clipCount > 30 warns about render queue", () => {
    const r = runTool({ ...base, clipCount: 60 });
    const warnings = (r.values as Record<string, unknown>).perfWarnings as string[];
    assert.ok(warnings.some((w) => w.includes("60 clips")));
  });

  it("renderImpact bumps up on low tier", () => {
    const low = (runTool({ desiredLook: "clean natural", deviceTier: "low" }).values as Record<string, unknown>).renderImpact;
    const high = (runTool({ desiredLook: "clean natural", deviceTier: "high" }).values as Record<string, unknown>).renderImpact;
    assert.equal(low, "med");
    assert.equal(high, "low");
  });

  it("rejects empty desiredLook", () => {
    const r = runTool({ desiredLook: "  ", deviceTier: "mid" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /desiredLook/);
  });

  it("rejects bad deviceTier", () => {
    const r = runTool({ desiredLook: "cinematic", deviceTier: "ultra" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /low.*mid.*high/);
  });

  it("rejects clipCount of 0", () => {
    const r = runTool({ ...base, clipCount: 0 });
    assert.equal(r.ok, false);
  });

  it("rejects clipCount over 500", () => {
    const r = runTool({ ...base, clipCount: 501 });
    assert.equal(r.ok, false);
  });

  it("rejects non-integer clipCount", () => {
    const r = runTool({ ...base, clipCount: 2.5 });
    assert.equal(r.ok, false);
  });

  it("deviceTier is case-insensitive", () => {
    const r = runTool({ ...base, deviceTier: "LOW" });
    assert.equal(r.ok, true);
  });

  it("determinism: two runs identical", () => {
    assert.equal(JSON.stringify(runTool({ ...base })), JSON.stringify(runTool({ ...base })));
  });

  it("look bank size documented: 8 presets", () => {
    assert.equal(LOOK_COUNT, 8);
  });
});
