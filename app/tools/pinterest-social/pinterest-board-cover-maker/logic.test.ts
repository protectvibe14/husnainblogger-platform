import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  PALETTES,
  TYPOGRAPHY,
  LAYOUTS,
  COVER_TIPS,
  BOARD_NAME_MIN,
  BOARD_NAME_MAX,
  THEME_MAX,
} from "./logic.ts";

type Spec = {
  n: number;
  boardName: string;
  theme: string | null;
  palette: { name: string; background: string; accent: string; text: string };
  customAccent: string | null;
  typography: { name: string; instruction: string };
  layout: { name: string; instruction: string };
  canvas: string;
  brief: string;
  html: string;
};

function okRun(items: Record<string, unknown>[]) {
  const r = runTool({ items });
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

function failRun(items: unknown) {
  const r = runTool({ items: items as Record<string, unknown>[] });
  assert.equal(r.ok, false);
  assert.ok(typeof r.error === "string" && r.error.length > 0);
  return r.error as string;
}

describe("pinterest-board-cover-maker", () => {
  it("happy path: single board with only the required field", () => {
    const v = okRun([{ boardName: "Home Decor" }]);
    const covers = v.covers as Spec[];
    assert.equal(covers.length, 1);
    assert.equal(covers[0].n, 1);
    assert.equal(covers[0].boardName, "Home Decor");
    assert.equal(covers[0].theme, null);
    assert.equal(covers[0].customAccent, null);
    assert.equal(covers[0].canvas, "800x800");
    assert.ok(covers[0].brief.includes("Home Decor"));
    assert.ok(covers[0].html.includes("800px"));
    assert.ok(covers[0].html.includes("Home Decor"));
  });

  it("happy path: theme and brandColor are accepted", () => {
    const v = okRun([{ boardName: "Meal Prep", theme: "healthy weeknight dinners", brandColor: "#ff8800" }]);
    const covers = v.covers as Spec[];
    assert.equal(covers[0].theme, "healthy weeknight dinners");
    assert.equal(covers[0].customAccent, "#FF8800");
    assert.equal(covers[0].palette.accent, "#FF8800");
    assert.ok(covers[0].brief.includes("healthy weeknight dinners"));
  });

  it("returns exactly the meta output ids", () => {
    const v = okRun([{ boardName: "Travel" }]);
    assert.deepEqual(Object.keys(v).sort(), ["count", "coverTips", "covers", "html"]);
  });

  it("multiple boards: count, numbering, and html combine", () => {
    const v = okRun([{ boardName: "Travel" }, { boardName: "Recipes" }, { boardName: "Wedding" }]);
    const covers = v.covers as Spec[];
    assert.equal(v.count, 3);
    assert.equal(covers.length, 3);
    assert.deepEqual(covers.map((c) => c.n), [1, 2, 3]);
    const html = v.html as string;
    assert.ok(html.includes("Travel") && html.includes("Recipes") && html.includes("Wedding"));
  });

  it("rejects empty board name", () => {
    const err = failRun([{ boardName: "   " }]);
    assert.match(err, /^Item 1: board name is required\./);
  });

  it("rejects missing board name", () => {
    const err = failRun([{}]);
    assert.match(err, /^Item 1: board name is required\./);
  });

  it("rejects too-short board name with item number", () => {
    const err = failRun([{ boardName: "Travel" }, { boardName: "X" }]);
    assert.match(err, /^Item 2: board name must be 2-60 characters \(got 1\)\./);
  });

  it("rejects too-long board name", () => {
    const err = failRun([{ boardName: "a".repeat(61) }]);
    assert.match(err, /^Item 1: board name must be 2-60 characters \(got 61\)\./);
  });

  it("accepts boundary lengths: 2 and 60 chars", () => {
    const v = okRun([{ boardName: "AB" }, { boardName: "a".repeat(60) }]);
    assert.equal((v.covers as Spec[]).length, 2);
    assert.equal(BOARD_NAME_MIN, 2);
    assert.equal(BOARD_NAME_MAX, 60);
  });

  it("rejects invalid brand color", () => {
    const err = failRun([{ boardName: "Travel", brandColor: "red" }]);
    assert.match(err, /^Item 1: brand color "red" is not a valid hex color/);
  });

  it("rejects brand color that is not hex but starts with #", () => {
    const err = failRun([{ boardName: "Travel" }, { boardName: "Recipes" }, { boardName: "Xy", brandColor: "#12" }]);
    assert.match(err, /^Item 3: brand color/);
  });

  it("rejects too-long theme", () => {
    const err = failRun([{ boardName: "Travel", theme: "a".repeat(THEME_MAX + 1) }]);
    assert.match(err, /^Item 1: theme must be 80 characters or fewer \(got 81\)\./);
  });

  it("accepts 3-digit hex brand color", () => {
    const v = okRun([{ boardName: "Travel", brandColor: "#abc" }]);
    const covers = v.covers as Spec[];
    assert.equal(covers[0].customAccent, "#ABC");
  });

  it("rejects a non-object item with its item number", () => {
    const err = failRun([{ boardName: "Travel" }, "not-an-object" as unknown as Record<string, unknown>]);
    assert.match(err, /^Item 2: not an object\./);
  });

  it("rejects empty items array", () => {
    const err = failRun([]);
    assert.match(err, /Add at least one board to build\./);
  });

  it("rejects missing items", () => {
    const r = runTool({} as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).length > 0);
  });

  it("accepts unicode board names", () => {
    const v = okRun([{ boardName: "✨ Ideas de boda 🌸" }, { boardName: "旅行インスピレーション" }]);
    const covers = v.covers as Spec[];
    assert.equal(covers[0].boardName, "✨ Ideas de boda 🌸");
    assert.equal(covers[1].boardName, "旅行インスピレーション");
    assert.ok(covers[0].brief.includes("✨ Ideas de boda 🌸"));
  });

  it("is deterministic: same input twice gives identical output", () => {
    const items = [{ boardName: "Home Decor", theme: "farmhouse" }, { boardName: "Recipes", brandColor: "#123456" }];
    const a = okRun(items);
    const b = okRun(items);
    assert.deepEqual(a, b);
  });

  it("same board name always maps to the same palette/typography/layout", () => {
    const a = okRun([{ boardName: "Gardening" }]).covers as Spec[];
    const b = okRun([{ boardName: "gardening" }]).covers as Spec[];
    assert.equal(a[0].palette.name, b[0].palette.name);
    assert.equal(a[0].typography.name, b[0].typography.name);
    assert.equal(a[0].layout.name, b[0].layout.name);
  });

  it("bank sizes are as documented", () => {
    assert.equal(PALETTES.length, 8);
    assert.equal(TYPOGRAPHY.length, 6);
    assert.equal(LAYOUTS.length, 4);
    assert.equal(COVER_TIPS.length, 5);
  });

  it("escapes HTML in board name and theme", () => {
    const v = okRun([{ boardName: '<script>alert("x")</script>', theme: "a & b" }]);
    const covers = v.covers as Spec[];
    const html = covers[0].html;
    assert.ok(!html.includes("<script>"), "raw script tag leaked");
    assert.ok(html.includes("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"));
    assert.ok(html.includes("a &amp; b"));
  });

  it("brief is honest: it says the cover is recreated, not generated", () => {
    const v = okRun([{ boardName: "Home Decor" }]);
    const covers = v.covers as Spec[];
    assert.match(covers[0].brief, /Recreate:/);
    assert.match(covers[0].brief, /800 x 800/);
  });

  it("coverTips is a fixed copy on every run", () => {
    const a = (okRun([{ boardName: "AB" }]).coverTips as string[]);
    const b = (okRun([{ boardName: "CD" }]).coverTips as string[]);
    assert.deepEqual(a, b);
    assert.equal(a.length, 5);
  });
});
