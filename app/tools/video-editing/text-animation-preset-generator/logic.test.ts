import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = {
  effect: "pop-in",
  durationMs: 800,
  easing: "ease-out",
  colorScheme: "white-on-black",
};

const OUTPUT_IDS = ["capcutSteps", "cssKeyframes", "previewParams"];
const EFFECTS = ["typewriter", "pop-in", "slide-up", "karaoke-highlight", "glitch"];
const EASINGS = ["linear", "ease", "ease-in", "ease-out", "ease-in-out"];

describe("text-animation-preset-generator (tool-261)", () => {
  it("happy path: returns cssKeyframes, capcutSteps, previewParams", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(typeof v.cssKeyframes, "string");
    assert.ok((v.cssKeyframes as string).includes("@keyframes"));
    assert.ok(Array.isArray(v.capcutSteps));
    assert.ok((v.capcutSteps as string[]).length >= 5);
    assert.equal(typeof v.previewParams, "string");
  });

  it("output keys match meta.ts outputs exactly", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), OUTPUT_IDS);
  });

  it("all 5 effects produce valid CSS with @keyframes and the duration", () => {
    for (const effect of EFFECTS) {
      const r = runTool({ ...base, effect, durationMs: 1200 });
      assert.equal(r.ok, true, effect);
      const css = (r.values as Record<string, unknown>).cssKeyframes as string;
      assert.ok(css.includes("@keyframes"), effect);
      assert.ok(css.includes("1200ms"), effect);
      assert.ok(css.length > 100, effect);
    }
  });

  it("all 5 easings are accepted and appear in the CSS", () => {
    for (const easing of EASINGS) {
      const r = runTool({ ...base, easing });
      assert.equal(r.ok, true, easing);
      const css = (r.values as Record<string, unknown>).cssKeyframes as string;
      assert.ok(css.includes(easing), easing);
    }
  });

  it("all 5 color schemes produce CSS without warnings", () => {
    const schemes = ["white-on-black", "yellow-highlight", "neon-cyan", "gradient-purple", "red-accent"];
    for (const colorScheme of schemes) {
      const r = runTool({ ...base, colorScheme });
      assert.equal(r.ok, true, colorScheme);
      const params = (r.values as Record<string, unknown>).previewParams as string;
      assert.ok(params.includes(colorScheme), colorScheme);
      assert.ok(params.includes("Warnings: none"), colorScheme);
    }
  });

  it("bank bounds: effect/easing/scheme enums reject unknown values", () => {
    const r1 = runTool({ ...base, effect: "spin" });
    assert.equal(r1.ok, false);
    assert.ok((r1.error as string).includes("pop-in"));
    const r2 = runTool({ ...base, easing: "bounce" });
    assert.equal(r2.ok, false);
    // unknown color scheme falls back, not an error
    const r3 = runTool({ ...base, colorScheme: "rainbow" });
    assert.equal(r3.ok, true);
    const params = (r3.values as Record<string, unknown>).previewParams as string;
    assert.ok(params.includes("white-on-black"));
    assert.ok(params.includes("fell back"));
  });

  it("validation error: duration below 100", () => {
    const r = runTool({ ...base, durationMs: 50 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("100"));
  });

  it("validation error: duration above 5000", () => {
    const r = runTool({ ...base, durationMs: 6000 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("5000"));
  });

  it("validation error: missing duration", () => {
    const r = runTool({ effect: "pop-in", easing: "ease" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("duration"));
  });

  it("validation error: non-numeric duration", () => {
    const r = runTool({ ...base, durationMs: "fast" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("duration"));
  });

  it("validation error: unknown effect", () => {
    const r = runTool({ ...base, effect: "" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("typewriter"));
  });

  it("validation error: unknown easing", () => {
    const r = runTool({ ...base, easing: "" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("ease"));
  });

  it("edge case: short duration warns about readability", () => {
    const r = runTool({ ...base, durationMs: 200 });
    assert.equal(r.ok, true);
    const params = (r.values as Record<string, unknown>).previewParams as string;
    assert.ok(params.toLowerCase().includes("readability"));
  });

  it("edge case: karaoke-highlight warns about per-word timing fallback", () => {
    const r = runTool({ ...base, effect: "karaoke-highlight" });
    assert.equal(r.ok, true);
    const params = (r.values as Record<string, unknown>).previewParams as string;
    assert.ok(params.toLowerCase().includes("per-word"));
    const steps = (r.values as Record<string, unknown>).capcutSteps as string[];
    assert.ok(steps.some((s) => s.toLowerCase().includes("even-split")));
  });

  it("capcut steps are honest: no CSS import is claimed", () => {
    const r = runTool(base);
    const steps = (r.values as Record<string, unknown>).capcutSteps as string[];
    assert.ok(steps[0].toLowerCase().includes("cannot import css"));
    assert.ok(!steps.some((s) => s.toLowerCase().includes("download") && s.toLowerCase().includes("import")));
  });

  it("typewriter CSS includes steps() and a character-count note", () => {
    const r = runTool({ ...base, effect: "typewriter" });
    const css = (r.values as Record<string, unknown>).cssKeyframes as string;
    assert.ok(css.includes("steps("));
    assert.ok(css.toLowerCase().includes("character count"));
  });

  it("string duration coerces to number", () => {
    const r = runTool({ ...base, durationMs: "900" });
    assert.equal(r.ok, true);
    const css = (r.values as Record<string, unknown>).cssKeyframes as string;
    assert.ok(css.includes("900ms"));
  });

  it("determinism: same inputs twice produce identical outputs", () => {
    const a = runTool(base);
    const b = runTool(base);
    assert.deepEqual(a, b);
  });

  it("determinism: karaoke run twice produces identical steps", () => {
    const a = runTool({ ...base, effect: "karaoke-highlight", durationMs: 2500 });
    const b = runTool({ ...base, effect: "karaoke-highlight", durationMs: 2500 });
    assert.deepEqual(a, b);
  });
});
