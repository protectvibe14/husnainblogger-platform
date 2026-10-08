import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = { vibe: "hormozi", platform: "tiktok" };
const OUTPUT_IDS = ["capcutSteps", "preset"];
const VIBES = ["bold", "minimal", "hormozi", "karaoke", "neon"];
const PLATFORMS = ["tiktok", "reels", "shorts"];
const REQUIRED_KEYS = [
  "vibe", "font", "fallbackFonts", "sizeGuidance", "uppercase", "stroke",
  "shadow", "bg", "animation", "colors", "keywordHighlight", "note", "platform",
];

describe("caption-style-preset-library (tool-262)", () => {
  it("happy path: returns preset object and capcutSteps", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const preset = v.preset as Record<string, unknown>;
    assert.equal(typeof preset.font, "string");
    assert.ok(Array.isArray(preset.fallbackFonts));
    assert.ok(Array.isArray(v.capcutSteps));
    assert.ok((v.capcutSteps as string[]).length >= 8);
  });

  it("output keys match meta.ts outputs exactly", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), OUTPUT_IDS);
  });

  it("all 5 vibes return complete presets with all required keys", () => {
    for (const vibe of VIBES) {
      const r = runTool({ vibe, platform: "tiktok" });
      assert.equal(r.ok, true, vibe);
      const preset = (r.values as Record<string, unknown>).preset as Record<string, unknown>;
      for (const key of REQUIRED_KEYS) {
        assert.ok(key in preset, `${vibe}: missing ${key}`);
      }
      assert.equal(preset.vibe, vibe);
      assert.ok((preset.fallbackFonts as string[]).length >= 3, `${vibe}: fallback fonts`);
      const colors = preset.colors as Record<string, string>;
      assert.ok(colors.text && colors.accent && colors.bg, `${vibe}: colors`);
    }
  });

  it("bank bounds: 5 distinct vibes, each with a distinct font", () => {
    const fonts = new Set<string>();
    for (const vibe of VIBES) {
      const r = runTool({ vibe, platform: "tiktok" });
      fonts.add(((r.values as Record<string, unknown>).preset as Record<string, unknown>).font as string);
    }
    assert.equal(fonts.size, 5);
  });

  it("all 3 platforms accepted with platform-specific placement step", () => {
    for (const platform of PLATFORMS) {
      const r = runTool({ vibe: "bold", platform });
      assert.equal(r.ok, true, platform);
      const steps = (r.values as Record<string, unknown>).capcutSteps as string[];
      const placement = steps.find((s) => s.toLowerCase().includes(platform === "tiktok" ? "tiktok:" : platform === "reels" ? "reels:" : "shorts:"));
      assert.ok(placement, `${platform}: placement step`);
      const preset = (r.values as Record<string, unknown>).preset as Record<string, unknown>;
      assert.equal(preset.platform, platform);
    }
  });

  it("edge case: unknown vibe defaults to bold with a note", () => {
    const r = runTool({ vibe: "vaporwave", platform: "reels" });
    assert.equal(r.ok, true);
    const preset = (r.values as Record<string, unknown>).preset as Record<string, unknown>;
    assert.equal(preset.vibe, "bold");
    assert.ok(String(preset.fallbackNote).toLowerCase().includes("defaulted"));
    assert.ok(String(preset.fallbackNote).includes("vaporwave"));
  });

  it("edge case: missing vibe defaults to bold with a note", () => {
    const r = runTool({ platform: "shorts" });
    assert.equal(r.ok, true);
    const preset = (r.values as Record<string, unknown>).preset as Record<string, unknown>;
    assert.equal(preset.vibe, "bold");
    assert.ok(String(preset.fallbackNote).toLowerCase().includes("defaulted"));
  });

  it("validation error: unknown platform", () => {
    const r = runTool({ vibe: "bold", platform: "snapchat" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("tiktok"));
  });

  it("validation error: missing platform", () => {
    const r = runTool({ vibe: "bold" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("platform"));
  });

  it("capcut steps mention fallback fonts (device coverage)", () => {
    const r = runTool(base);
    const steps = (r.values as Record<string, unknown>).capcutSteps as string[];
    const fontStep = steps.find((s) => s.toLowerCase().includes("fallback"));
    assert.ok(fontStep);
    assert.ok(fontStep.includes("Archivo Black"));
  });

  it("font names are never misrepresented as built-in capcut fonts", () => {
    for (const vibe of VIBES) {
      const r = runTool({ vibe, platform: "tiktok" });
      const preset = (r.values as Record<string, unknown>).preset as Record<string, unknown>;
      assert.ok(!(preset.font as string).toLowerCase().includes("capcut"));
      const steps = (r.values as Record<string, unknown>).capcutSteps as string[];
      assert.ok(!steps.some((s) => s.toLowerCase().includes("capcut's font")));
    }
  });

  it("preset is a plain JSON-safe object (no functions)", () => {
    const r = runTool(base);
    const preset = (r.values as Record<string, unknown>).preset;
    const roundTripped = JSON.parse(JSON.stringify(preset));
    assert.deepEqual(roundTripped, preset);
  });

  it("uppercase flag varies by vibe (bold true, minimal false)", () => {
    const bold = (runTool({ vibe: "bold", platform: "tiktok" }).values as Record<string, unknown>).preset as Record<string, unknown>;
    const minimal = (runTool({ vibe: "minimal", platform: "tiktok" }).values as Record<string, unknown>).preset as Record<string, unknown>;
    assert.equal(bold.uppercase, true);
    assert.equal(minimal.uppercase, false);
  });

  it("platform changes placement only — core style identical across platforms", () => {
    const a = (runTool({ vibe: "neon", platform: "tiktok" }).values as Record<string, unknown>).preset as Record<string, unknown>;
    const b = (runTool({ vibe: "neon", platform: "shorts" }).values as Record<string, unknown>).preset as Record<string, unknown>;
    assert.equal(a.font, b.font);
    assert.deepEqual(a.colors, b.colors);
    assert.equal(a.animation, b.animation);
    assert.equal(a.platform, "tiktok");
    assert.equal(b.platform, "shorts");
  });

  it("determinism: same inputs twice produce identical outputs", () => {
    const a = runTool(base);
    const b = runTool(base);
    assert.deepEqual(a, b);
  });

  it("determinism: unknown-vibe default path is stable", () => {
    const a = runTool({ vibe: "nope", platform: "shorts" });
    const b = runTool({ vibe: "nope", platform: "shorts" });
    assert.deepEqual(a, b);
  });
});
