/**
 * Tests for the Reaction Layout Planner.
 * Run: node --test app/tools/video-editing/reaction-layout-planner/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const GOOD = { canvasAspect: "16:9", facecamSize: "medium", facecamCorner: "top-right" };

function rect(str: string): Record<string, number> {
  const m = str.match(/x=(\d+), y=(\d+), w=(\d+), h=(\d+)/);
  assert.ok(m, `rect parses: ${str}`);
  return { x: Number(m![1]), y: Number(m![2]), w: Number(m![3]), h: Number(m![4]) };
}

describe("reaction-layout-planner", () => {
  it("happy path: returns ok with all three output ids", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), [
      "contentRect",
      "facecamRect",
      "safeAreaNotes",
    ]);
  });

  it("16:9 medium top-right facecam has the expected geometry", () => {
    const r = runTool(GOOD).values!;
    const f = rect(r.facecamRect as string);
    // canvas 1920x1080, margin 48, w = 0.32*1920 = 614, h = round(614*9/16) = 345
    assert.deepEqual(f, { x: 1920 - 614 - 48, y: 48, w: 614, h: 345 });
    const c = rect(r.contentRect as string);
    assert.deepEqual(c, { x: 0, y: 0, w: 1920, h: 1080 });
  });

  it("9:16 canvas uses 1080x1920 geometry", () => {
    const r = runTool({ ...GOOD, canvasAspect: "9:16", facecamCorner: "bottom-left" }).values!;
    const f = rect(r.facecamRect as string);
    // margin 27, w = 0.32*1080 = 346, h = 195
    assert.deepEqual(f, { x: 27, y: 1920 - 195 - 27, w: 346, h: 195 });
    assert.ok((r.contentRect as string).includes("1080x1920"));
  });

  it("all four corners place the facecam inside the canvas with margin", () => {
    const cases: Array<[string, string]> = [
      ["16:9", "top-left"],
      ["16:9", "top-right"],
      ["16:9", "bottom-left"],
      ["16:9", "bottom-right"],
      ["9:16", "top-left"],
      ["9:16", "bottom-right"],
    ];
    for (const [aspect, corner] of cases) {
      const r = runTool({ canvasAspect: aspect, facecamSize: "small", facecamCorner: corner }).values!;
      const f = rect(r.facecamRect as string);
      const W = aspect === "16:9" ? 1920 : 1080;
      const H = aspect === "16:9" ? 1080 : 1920;
      assert.ok(f.x >= 0 && f.y >= 0 && f.x + f.w <= W && f.y + f.h <= H, `${aspect} ${corner} in bounds`);
    }
  });

  it("facecam sizes scale: small < medium < large", () => {
    const w = (s: string) =>
      rect(runTool({ ...GOOD, facecamSize: s }).values!.facecamRect as string).w;
    assert.ok(w("small") < w("medium") && w("medium") < w("large"));
  });

  it("large facecam on 9:16 triggers the coverage warning", () => {
    const notes = runTool({
      canvasAspect: "9:16",
      facecamSize: "large",
      facecamCorner: "top-left",
    }).values!.safeAreaNotes as string[];
    assert.ok(notes.some((n) => n.startsWith("Warning:")), "warning present");
  });

  it("small facecam on 9:16 does not trigger the coverage warning", () => {
    const notes = runTool({
      canvasAspect: "9:16",
      facecamSize: "small",
      facecamCorner: "top-left",
    }).values!.safeAreaNotes as string[];
    assert.ok(!notes.some((n) => n.startsWith("Warning:")), "no warning");
  });

  it("right-side corner on 9:16 notes the platform action rail", () => {
    const notes = runTool({ ...GOOD, canvasAspect: "9:16", facecamCorner: "bottom-right" }).values!
      .safeAreaNotes as string[];
    assert.ok(notes.some((n) => n.includes("right edge") && n.includes("like/comment/share")));
  });

  it("left-side corner on 9:16 does not mention the right rail", () => {
    const notes = runTool({ ...GOOD, canvasAspect: "9:16", facecamCorner: "top-left" }).values!
      .safeAreaNotes as string[];
    assert.ok(!notes.some((n) => n.includes("like/comment/share")));
  });

  it("bottom-right on 16:9 notes YouTube end-screen overlap", () => {
    const notes = runTool({ ...GOOD, facecamCorner: "bottom-right" }).values!.safeAreaNotes as string[];
    assert.ok(notes.some((n) => n.includes("end-screen")));
  });

  it("bottom corners on 9:16 note the caption/progress-bar safe area", () => {
    const notes = runTool({ ...GOOD, canvasAspect: "9:16", facecamCorner: "bottom-left" }).values!
      .safeAreaNotes as string[];
    assert.ok(notes.some((n) => n.includes("captions and the progress bar")));
  });

  it("notes always name the opposite half for subject placement", () => {
    const notes = runTool(GOOD).values!.safeAreaNotes as string[];
    assert.ok(notes[0].includes("bottom-left"), "top-right corner -> bottom-left subjects");
  });

  it("invalid canvasAspect is rejected", () => {
    const r = runTool({ ...GOOD, canvasAspect: "1:1" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /16:9/);
  });

  it("invalid facecamSize is rejected", () => {
    const r = runTool({ ...GOOD, facecamSize: "huge" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /small, medium, or large/);
  });

  it("invalid facecamCorner is rejected", () => {
    const r = runTool({ ...GOOD, facecamCorner: "center" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /corner/);
  });

  it("missing inputs are rejected", () => {
    assert.equal(runTool({}).ok, false);
    assert.equal(runTool({ canvasAspect: "16:9" }).ok, false);
  });

  it("notes are honest about estimates (no fake certainty)", () => {
    const notes = runTool(GOOD).values!.safeAreaNotes as string[];
    assert.ok(notes.length >= 2);
    assert.ok(notes.some((n) => n.includes("planning estimates")));
  });

  it("deterministic: two runs with identical inputs are identical", () => {
    assert.deepEqual(runTool(GOOD), runTool({ ...GOOD }));
  });
});
