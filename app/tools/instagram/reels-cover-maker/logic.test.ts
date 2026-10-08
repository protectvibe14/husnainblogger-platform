import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  MAX_TITLE_LENGTH,
  GRADIENTS,
  SAFE_ZONE_GUIDE,
} from "./logic.ts";

type Spec = {
  n: number;
  title: string;
  backgroundKind: "color" | "gradient" | "upload";
  background: string;
  canvas: string;
  titleOverBudget: number;
};

function okRun(items: Record<string, unknown>[]) {
  const r = runTool({ items });
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

describe("reels-cover-maker", () => {
  it("happy path: hex color background", () => {
    const v = okRun([{ title: "My Series", background: "#0a0a0a" }]);
    const covers = v.covers as Spec[];
    assert.equal(covers.length, 1);
    assert.equal(covers[0].title, "My Series");
    assert.equal(covers[0].backgroundKind, "color");
    assert.equal(covers[0].background, "#0A0A0A");
    assert.equal(covers[0].canvas, "1080x1920");
  });

  it("accepts 'color: #...' prefix form", () => {
    const v = okRun([{ title: "T", background: "color: #ff8800" }]);
    const covers = v.covers as Spec[];
    assert.equal(covers[0].backgroundKind, "color");
    assert.equal(covers[0].background, "#FF8800");
  });

  it("accepts 3-digit hex", () => {
    const v = okRun([{ title: "T", background: "#abc" }]);
    const covers = v.covers as Spec[];
    assert.equal(covers[0].background, "#ABC");
  });

  it("happy path: named gradient", () => {
    const v = okRun([{ title: "T", background: "sunset" }]);
    const covers = v.covers as Spec[];
    assert.equal(covers[0].backgroundKind, "gradient");
    assert.equal(covers[0].background, "sunset");
  });

  it("accepts 'gradient: <name>' prefix form", () => {
    const v = okRun([{ title: "T", background: "gradient: Ocean" }]);
    const covers = v.covers as Spec[];
    assert.equal(covers[0].background, "ocean");
  });

  it("happy path: upload URL", () => {
    const v = okRun([{ title: "T", background: "https://example.com/bg.jpg" }]);
    const covers = v.covers as Spec[];
    assert.equal(covers[0].backgroundKind, "upload");
    assert.equal(covers[0].background, "https://example.com/bg.jpg");
  });

  it("accepts 'upload: <url>' prefix form", () => {
    const v = okRun([{ title: "T", background: "upload: https://example.com/bg.png" }]);
    const covers = v.covers as Spec[];
    assert.equal(covers[0].backgroundKind, "upload");
  });

  it("returns exactly the meta output ids", () => {
    const v = okRun([{ title: "T", background: "#000000" }]);
    assert.deepEqual(Object.keys(v).sort(), ["count", "covers", "safeZoneGuide"]);
  });

  it("multiple items: count and numbering are correct", () => {
    const v = okRun([
      { title: "One", background: "#111111" },
      { title: "Two", background: "neon" },
    ]);
    assert.equal(v.count, 2);
    const covers = v.covers as Spec[];
    assert.deepEqual(covers.map((c) => c.n), [1, 2]);
  });

  it("safeZoneGuide is a fixed non-empty list mentioning 1080 × 1920", () => {
    const v = okRun([{ title: "T", background: "#000000" }]);
    const guide = v.safeZoneGuide as string[];
    assert.ok(guide.length >= 5);
    assert.ok(guide.some((g) => g.includes("1080 × 1920")));
    assert.deepEqual(guide, SAFE_ZONE_GUIDE);
  });

  it("missing title fails with the item number", () => {
    const r = runTool({ items: [{ background: "#000000" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 1: title is required/);
  });

  it(`title longer than ${MAX_TITLE_LENGTH} chars fails`, () => {
    const r = runTool({ items: [{ title: "x".repeat(61), background: "#000000" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 1: title must be 60 characters or fewer/);
  });

  it("title of exactly 60 chars passes", () => {
    const v = okRun([{ title: "x".repeat(60), background: "#000000" }]);
    assert.equal((v.covers as Spec[])[0].titleOverBudget, 0);
  });

  it("missing background fails", () => {
    const r = runTool({ items: [{ title: "T" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 1: background is required/);
  });

  it("garbage background fails with the accepted formats", () => {
    const r = runTool({ items: [{ title: "T", background: "banana" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /hex color/);
  });

  it("unknown gradient name fails listing valid gradients", () => {
    const r = runTool({ items: [{ title: "T", background: "gradient: lava" }] });
    assert.equal(r.ok, false);
    for (const g of GRADIENTS) assert.ok((r.error as string).includes(g));
  });

  it("invalid hex fails", () => {
    const r = runTool({ items: [{ title: "T", background: "#zzz" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /not a valid hex color/);
  });

  it("non-http upload URL fails", () => {
    const r = runTool({ items: [{ title: "T", background: "upload: ftp://example.com/bg.jpg" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must use http or https/);
  });

  it("javascript: URL is rejected", () => {
    const r = runTool({ items: [{ title: "T", background: "upload: javascript:alert(1)" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /not a valid URL|must use http or https/);
  });

  it("error names the failing item (Item 2)", () => {
    const r = runTool({
      items: [
        { title: "Good", background: "#000000" },
        { title: "", background: "#000000" },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 2:/);
  });

  it("missing items array fails", () => {
    const r = runTool({} as never);
    assert.equal(r.ok, false);
    assert.match(r.error as string, /No covers to build/);
  });

  it("empty items fail", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /at least one cover/);
  });

  it("non-object item fails with its number", () => {
    const r = runTool({ items: [{ title: "T", background: "#000" }, "nope" as never] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 2: not an object/);
  });

  it("deterministic: same items give identical specs", () => {
    const items = [
      { title: "One", background: "gradient: pastel" },
      { title: "Two", background: "https://example.com/a.jpg" },
    ];
    assert.equal(JSON.stringify(runTool({ items })), JSON.stringify(runTool({ items })));
  });
});
