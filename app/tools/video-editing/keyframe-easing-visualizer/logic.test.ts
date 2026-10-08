import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = { easing: "ease-out", durationMs: 800, samples: 60 };
const OUTPUT_IDS = ["capcutApproximation", "cssEasingString", "curvePoints"];

describe("keyframe-easing-visualizer (tool-263)", () => {
  it("happy path: returns curvePoints, cssEasingString, capcutApproximation", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok(Array.isArray(v.curvePoints));
    assert.equal((v.curvePoints as unknown[]).length, 60);
    assert.equal(typeof v.cssEasingString, "string");
    assert.equal(typeof v.capcutApproximation, "string");
  });

  it("output keys match meta.ts outputs exactly", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), OUTPUT_IDS);
  });

  it("named easings emit the standard CSS control points", () => {
    const expected: Record<string, string> = {
      linear: "linear",
      ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      "ease-in": "cubic-bezier(0.42, 0, 1, 1)",
      "ease-out": "cubic-bezier(0, 0, 0.58, 1)",
      "ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1)",
    };
    for (const [easing, css] of Object.entries(expected)) {
      const r = runTool({ easing, durationMs: 500 });
      assert.equal(r.ok, true, easing);
      assert.equal((r.values as Record<string, unknown>).cssEasingString, css, easing);
    }
  });

  it("curve starts at 0 and ends at 1 for named easings", () => {
    for (const easing of ["linear", "ease", "ease-in", "ease-out", "ease-in-out"]) {
      const r = runTool({ easing, durationMs: 500, samples: 60 });
      const pts = (r.values as Record<string, unknown>).curvePoints as { t: number; value: number }[];
      assert.equal(pts[0].t, 0);
      assert.ok(Math.abs(pts[0].value - 0) < 1e-3, easing);
      const last = pts[pts.length - 1] as { t: number; value: number };
      assert.equal(last.t, 1);
      assert.ok(Math.abs(last.value - 1) < 1e-3, easing);
    }
  });

  it("linear easing is a straight diagonal (value == t within tolerance)", () => {
    const r = runTool({ easing: "linear", durationMs: 500, samples: 11 });
    const pts = (r.values as Record<string, unknown>).curvePoints as { t: number; value: number }[];
    for (const p of pts) {
      assert.ok(Math.abs(p.value - p.t) < 1e-3, `t=${p.t}`);
    }
  });

  it("custom bezier: valid control points produce a curve", () => {
    const r = runTool({ easing: "custom", durationMs: 900, x1: 0.68, y1: -0.55, x2: 0.27, y2: 1.55 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.cssEasingString, "cubic-bezier(0.68, -0.55, 0.27, 1.55)");
    assert.equal((v.curvePoints as unknown[]).length, 60);
  });

  it("custom bezier: overshoot y warns about anticipation", () => {
    const r = runTool({ easing: "custom", durationMs: 900, x1: 0.68, y1: -0.55, x2: 0.27, y2: 1.55 });
    const text = (r.values as Record<string, unknown>).capcutApproximation as string;
    assert.ok(text.toLowerCase().includes("overshoot"));
  });

  it("validation error: bezier x1 outside 0-1", () => {
    const r = runTool({ easing: "custom", durationMs: 900, x1: 1.5, y1: 0, x2: 0.5, y2: 1 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("0-1"));
  });

  it("validation error: bezier x2 outside 0-1", () => {
    const r = runTool({ easing: "custom", durationMs: 900, x1: 0.5, y1: 0, x2: -0.2, y2: 1 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("0-1"));
  });

  it("validation error: custom easing missing control points", () => {
    const r = runTool({ easing: "custom", durationMs: 900, x1: 0.5 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("x1, y1, x2, y2"));
  });

  it("validation error: duration 0", () => {
    const r = runTool({ easing: "ease", durationMs: 0 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("above 0"));
  });

  it("validation error: negative duration", () => {
    const r = runTool({ easing: "ease", durationMs: -200 });
    assert.equal(r.ok, false);
  });

  it("validation error: missing duration", () => {
    const r = runTool({ easing: "ease" });
    assert.equal(r.ok, false);
  });

  it("validation error: samples below 10", () => {
    const r = runTool({ easing: "ease", durationMs: 500, samples: 5 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("10"));
  });

  it("validation error: samples above 240", () => {
    const r = runTool({ easing: "ease", durationMs: 500, samples: 300 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("240"));
  });

  it("validation error: samples not a whole number", () => {
    const r = runTool({ easing: "ease", durationMs: 500, samples: 60.5 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("whole number"));
  });

  it("samples default to 60 when omitted", () => {
    const r = runTool({ easing: "ease", durationMs: 500 });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).curvePoints as unknown[]).length, 60);
  });

  it("samples=10 and samples=240 both accepted (bounds)", () => {
    const lo = runTool({ easing: "ease", durationMs: 500, samples: 10 });
    assert.equal(lo.ok, true);
    assert.equal(((lo.values as Record<string, unknown>).curvePoints as unknown[]).length, 10);
    const hi = runTool({ easing: "ease", durationMs: 500, samples: 240 });
    assert.equal(hi.ok, true);
    assert.equal(((hi.values as Record<string, unknown>).curvePoints as unknown[]).length, 240);
  });

  it("validation error: unknown easing", () => {
    const r = runTool({ easing: "bounce", durationMs: 500 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("custom"));
  });

  it("capcut approximation is honest about being an approximation", () => {
    const r = runTool(base);
    const text = (r.values as Record<string, unknown>).capcutApproximation as string;
    assert.ok(text.toLowerCase().includes("approximat"));
    assert.ok(text.toLowerCase().includes("limited"));
  });

  it("determinism: same inputs twice produce identical curve points", () => {
    const a = runTool({ easing: "custom", durationMs: 900, x1: 0.34, y1: 1.2, x2: 0.64, y2: 1, samples: 120 });
    const b = runTool({ easing: "custom", durationMs: 900, x1: 0.34, y1: 1.2, x2: 0.64, y2: 1, samples: 120 });
    assert.deepEqual(a, b);
  });
});
