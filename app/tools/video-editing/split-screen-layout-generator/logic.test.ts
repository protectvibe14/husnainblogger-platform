import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, ARRANGEMENTS, ASPECTS } from "./logic.ts";

const OUTPUT_IDS = ["paneList", "cssGridSnippet", "svgPreview", "warnings"];

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

function rectsOf(v: Record<string, unknown>): { x: number; y: number; w: number; h: number }[] {
  const preview = v.svgPreview as string;
  return [...preview.matchAll(/rect\((\d+),(\d+),(\d+),(\d+)\)/g)].map((m) => ({
    x: +m[1], y: +m[2], w: +m[3], h: +m[4],
  }));
}

describe("split-screen-layout-generator", () => {
  it("happy path: 2 panes side-by-side on 16:9, gap 8", () => {
    const v = okValues({ panes: 2, arrangement: "side-by-side", canvasAspect: "16:9", gapPx: 8 });
    const rects = rectsOf(v);
    assert.equal(rects.length, 2);
    assert.deepEqual(rects[0], { x: 0, y: 0, w: 956, h: 1080 });
    assert.deepEqual(rects[1], { x: 964, y: 0, w: 956, h: 1080 });
    assert.ok((v.cssGridSnippet as string).includes("repeat(2, 1fr)"));
    assert.deepEqual(v.warnings, []);
    const list = v.paneList as string[];
    assert.equal(list.length, 2);
    assert.ok(list[0].includes("x=0, y=0, w=956, h=1080"));
  });

  it("panes must be 2-4", () => {
    assert.equal(runTool({ panes: 1, arrangement: "side-by-side", canvasAspect: "16:9" }).ok, false);
    assert.equal(runTool({ panes: 5, arrangement: "side-by-side", canvasAspect: "16:9" }).ok, false);
    assert.equal(runTool({ panes: 2.5, arrangement: "side-by-side", canvasAspect: "16:9" }).ok, false);
    assert.match(
      runTool({ panes: 5, arrangement: "side-by-side", canvasAspect: "16:9" }).error!,
      /2 to 4/
    );
  });

  it("invalid arrangement errors", () => {
    const r = runTool({ panes: 2, arrangement: "diagonal", canvasAspect: "16:9" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("side-by-side"));
  });

  it("invalid aspect errors", () => {
    const r = runTool({ panes: 2, arrangement: "side-by-side", canvasAspect: "21:9" });
    assert.equal(r.ok, false);
  });

  it("negative gap errors; gap defaults to 0", () => {
    assert.equal(runTool({ panes: 2, arrangement: "side-by-side", canvasAspect: "16:9", gapPx: -1 }).ok, false);
    const v = okValues({ panes: 2, arrangement: "side-by-side", canvasAspect: "16:9" });
    const rects = rectsOf(v);
    assert.deepEqual(rects[0], { x: 0, y: 0, w: 960, h: 1080 });
    assert.deepEqual(rects[1], { x: 960, y: 0, w: 960, h: 1080 });
  });

  it("stacked: 3 rows on 9:16", () => {
    const v = okValues({ panes: 3, arrangement: "stacked", canvasAspect: "9:16", gapPx: 16 });
    const rects = rectsOf(v);
    assert.equal(rects.length, 3);
    // usable = 1920-32 = 1888; base = 629; last = 1920-1258-32 = 630
    assert.deepEqual(rects.map((r) => r.h), [629, 629, 630]);
    assert.ok(rects.every((r) => r.w === 1080 && r.x === 0));
    assert.ok((v.cssGridSnippet as string).includes("grid-template-rows"));
  });

  it("grid 4 on 1:1 is 2x2", () => {
    const v = okValues({ panes: 4, arrangement: "grid", canvasAspect: "1:1", gapPx: 0 });
    const rects = rectsOf(v);
    assert.equal(rects.length, 4);
    assert.ok(rects.every((r) => r.w === 540 && r.h === 540));
    assert.deepEqual([rects[0].x, rects[1].x, rects[2].x, rects[3].x], [0, 540, 0, 540]);
  });

  it("grid 3: top row of 2 + full-width bottom pane", () => {
    const v = okValues({ panes: 3, arrangement: "grid", canvasAspect: "16:9", gapPx: 0 });
    const rects = rectsOf(v);
    assert.equal(rects.length, 3);
    assert.deepEqual([rects[0].w, rects[1].w], [960, 960]);
    assert.deepEqual(rects[2], { x: 0, y: 540, w: 1920, h: 540 });
    assert.ok((v.cssGridSnippet as string).includes("grid-column: 1 / -1"));
  });

  it("grid 2 on landscape behaves as side-by-side", () => {
    const a = okValues({ panes: 2, arrangement: "grid", canvasAspect: "16:9", gapPx: 8 });
    const b = okValues({ panes: 2, arrangement: "side-by-side", canvasAspect: "16:9", gapPx: 8 });
    assert.deepEqual(rectsOf(a), rectsOf(b));
  });

  it("grid 2 on portrait behaves as stacked", () => {
    const a = okValues({ panes: 2, arrangement: "grid", canvasAspect: "9:16", gapPx: 8 });
    const rects = rectsOf(a);
    assert.ok(rects[0].w === 1080 && rects[1].w === 1080);
    assert.ok(rects[1].y > 0);
  });

  it("pip: main pane full canvas + overlays with z-order note", () => {
    const v = okValues({ panes: 3, arrangement: "pip", canvasAspect: "16:9", gapPx: 16 });
    const rects = rectsOf(v);
    assert.equal(rects.length, 3);
    assert.deepEqual(rects[0], { x: 0, y: 0, w: 1920, h: 1080 });
    assert.ok(rects[1].w === Math.round(1920 * 0.28));
    assert.ok((v.warnings as string[]).some((w) => w.includes("z-order")));
    assert.ok((v.paneList as string[])[1].includes("z-order"));
    assert.ok((v.cssGridSnippet as string).includes("position: relative"));
  });

  it("3 panes side-by-side on 9:16 warns panes get tiny", () => {
    const v = okValues({ panes: 3, arrangement: "side-by-side", canvasAspect: "9:16", gapPx: 0 });
    const rects = rectsOf(v);
    assert.ok(rects[0].w === 360);
    assert.ok((v.warnings as string[]).some((w) => w.includes("only 360px wide")));
  });

  it("4 panes side-by-side on 9:16 also warns", () => {
    const v = okValues({ panes: 4, arrangement: "side-by-side", canvasAspect: "9:16", gapPx: 0 });
    const rects = rectsOf(v);
    assert.ok(rects[0].w === 270);
    assert.ok((v.warnings as string[]).some((w) => w.includes("only 270px wide")));
  });

  it("panes tile the canvas exactly (no gaps/overlaps)", () => {
    for (const aspect of ASPECTS) {
      for (const panes of [2, 3, 4]) {
        const v = okValues({ panes, arrangement: "side-by-side", canvasAspect: aspect, gapPx: 12 });
        const rects = rectsOf(v);
        const totalW = rects.reduce((s, r) => s + r.w, 0) + 12 * (panes - 1);
        const canvasW = { "16:9": 1920, "9:16": 1080, "1:1": 1080, "4:3": 1600 }[aspect];
        assert.equal(totalW, canvasW, `${aspect} x${panes}`);
      }
    }
  });

  it("numeric-string inputs are coerced", () => {
    const v = okValues({ panes: "2", arrangement: "side-by-side", canvasAspect: "16:9", gapPx: "8" });
    assert.equal(rectsOf(v).length, 2);
  });

  it("arrangement bank has 4 entries; aspects have 4", () => {
    assert.equal(ARRANGEMENTS.length, 4);
    assert.equal(ASPECTS.length, 4);
  });

  it("deterministic: two runs identical", () => {
    const input = { panes: 3, arrangement: "pip", canvasAspect: "9:16", gapPx: 16 };
    assert.deepEqual(runTool(input), runTool(input));
  });

  it("output ids match meta outputs", () => {
    const v = okValues({ panes: 2, arrangement: "side-by-side", canvasAspect: "16:9" });
    assert.deepEqual(Object.keys(v).sort(), [...OUTPUT_IDS].sort());
  });
});
