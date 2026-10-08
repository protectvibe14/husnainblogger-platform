/**
 * Tests for the Before/After Slider Generator.
 * Run: node --test app/tools/video-editing/before-after-slider-generator/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  HANDLE_STYLES,
  PLACEHOLDER_BEFORE,
  PLACEHOLDER_AFTER,
  MAX_LABEL_CHARS,
  MIN_START_PCT,
  MAX_START_PCT,
  DEFAULT_START_PCT,
} from "./logic.ts";

const GOOD = {
  labelBefore: "Before",
  labelAfter: "After",
  orientation: "horizontal",
  startPct: 50,
};

describe("before-after-slider-generator", () => {
  it("happy path: returns ok with all four output ids", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), [
      "cssSnippet",
      "embedParams",
      "htmlSnippet",
      "jsSnippet",
    ]);
  });

  it("omitted startPct defaults to 50", () => {
    const r = runTool({
      labelBefore: "Before",
      labelAfter: "After",
      orientation: "vertical",
    });
    assert.equal(r.ok, true);
    assert.ok((r.values!.embedParams as string).includes(`startPct=${DEFAULT_START_PCT}`));
    assert.ok((r.values!.htmlSnippet as string).includes("--hb-pos:50%"));
  });

  it("startPct boundaries 5 and 95 are accepted", () => {
    for (const p of [MIN_START_PCT, MAX_START_PCT]) {
      const r = runTool({ ...GOOD, startPct: p });
      assert.equal(r.ok, true, `startPct=${p}`);
      assert.ok((r.values!.embedParams as string).includes(`startPct=${p}`));
    }
  });

  it("startPct below 5 is rejected", () => {
    const r = runTool({ ...GOOD, startPct: 4 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 5 and 95/);
  });

  it("startPct above 95 is rejected", () => {
    const r = runTool({ ...GOOD, startPct: 96 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 5 and 95/);
  });

  it("non-numeric startPct is rejected", () => {
    const r = runTool({ ...GOOD, startPct: "half" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /number/);
  });

  it("missing labelBefore is rejected", () => {
    const r = runTool({ labelAfter: "After", orientation: "horizontal" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /BEFORE/);
  });

  it("missing labelAfter is rejected", () => {
    const r = runTool({ labelBefore: "Before", orientation: "horizontal" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /AFTER/);
  });

  it("blank (whitespace-only) labels are rejected", () => {
    const r = runTool({ labelBefore: "   ", labelAfter: "After", orientation: "horizontal" });
    assert.equal(r.ok, false);
  });

  it(`labels longer than ${MAX_LABEL_CHARS} chars are rejected`, () => {
    const long = "x".repeat(MAX_LABEL_CHARS + 1);
    assert.equal(runTool({ ...GOOD, labelBefore: long }).ok, false);
    assert.equal(runTool({ ...GOOD, labelAfter: long }).ok, false);
  });

  it("labels at exactly 40 chars are accepted", () => {
    const edge = "x".repeat(MAX_LABEL_CHARS);
    assert.equal(runTool({ ...GOOD, labelBefore: edge, labelAfter: edge }).ok, true);
  });

  it("unknown orientation is rejected", () => {
    const r = runTool({ ...GOOD, orientation: "diagonal" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /orientation/);
  });

  it("HTML contains the placeholder image tokens (tool hosts no images)", () => {
    const r = runTool(GOOD).values!;
    assert.ok((r.htmlSnippet as string).includes(PLACEHOLDER_BEFORE));
    assert.ok((r.htmlSnippet as string).includes(PLACEHOLDER_AFTER));
    assert.ok(!(r.htmlSnippet as string).includes("http"));
  });

  it("labels are HTML-escaped in the snippets", () => {
    const r = runTool({
      ...GOOD,
      labelBefore: 'A<B>&"C"',
      labelAfter: "D",
    }).values!;
    assert.ok((r.htmlSnippet as string).includes("A&lt;B&gt;&amp;&quot;C&quot;"));
    assert.ok(!(r.htmlSnippet as string).includes('A<B>&"C"'));
  });

  it("vertical orientation flips the CSS/JS axis", () => {
    const r = runTool({ ...GOOD, orientation: "vertical" }).values!;
    assert.ok((r.cssSnippet as string).includes("vertical layout"));
    assert.ok((r.cssSnippet as string).includes("ns-resize"));
    assert.ok((r.jsSnippet as string).includes("clientY"));
    const h = runTool(GOOD).values!;
    assert.ok((h.cssSnippet as string).includes("horizontal layout"));
    assert.ok((h.jsSnippet as string).includes("clientX"));
  });

  it("CSS documents the full handle-style bank and HTML activates the default", () => {
    const r = runTool(GOOD).values!;
    for (const s of HANDLE_STYLES) {
      assert.ok((r.cssSnippet as string).includes(`data-style="${s}"`), s);
    }
    assert.ok((r.htmlSnippet as string).includes(`data-style="${HANDLE_STYLES[0]}"`));
    assert.ok((r.embedParams as string).includes(`${HANDLE_STYLES.length} presets`));
  });

  it("JS snippet wires pointer drag and keyboard control with no dependencies", () => {
    const js = runTool(GOOD).values!.jsSnippet as string;
    assert.ok(js.includes("pointerdown"));
    assert.ok(js.includes("keydown"));
    assert.ok(!js.includes("import "));
    assert.ok(!js.includes("http"));
  });

  it("embedParams names the honesty edge case (user-supplied URLs only)", () => {
    const params = runTool(GOOD).values!.embedParams as string;
    assert.ok(params.includes("hosts no images"));
    assert.ok(params.includes(PLACEHOLDER_BEFORE));
  });

  it("deterministic: two runs with identical inputs are byte-identical", () => {
    const a = runTool(GOOD);
    const b = runTool({ ...GOOD });
    assert.deepEqual(a, b);
  });

  it("different inputs change the output", () => {
    const a = runTool(GOOD).values!.htmlSnippet as string;
    const b = runTool({ ...GOOD, labelBefore: "Original" }).values!.htmlSnippet as string;
    assert.notEqual(a, b);
    assert.ok(b.includes("Original"));
  });
});
