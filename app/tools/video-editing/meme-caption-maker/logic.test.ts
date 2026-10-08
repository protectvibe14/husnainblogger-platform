import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, TEMPLATES, VALID_STYLES } from "./logic.ts";

const OUTPUT_IDS = ["summary", "memeSpecs", "svgParams", "exportJson"];

function okValues(items: Record<string, unknown>[]): Record<string, unknown> {
  const r = runTool({ items });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("meme-caption-maker", () => {
  it("happy path: classic meme with top + bottom text", () => {
    const v = okValues([
      { template: "classic-top-bottom", topText: "WHEN THE RENDER FINISHES", bottomText: "ON THE FIRST TRY", style: "classic" },
    ]);
    assert.ok((v.summary as string).includes("1 meme spec ready"));
    assert.ok((v.summary as string).includes("image itself is drawn by the preview"));
    const specs = v.memeSpecs as string[];
    assert.equal(specs.length, 1);
    assert.ok(specs[0].includes("Classic top + bottom"));
    assert.ok(specs[0].includes("64px classic"));
    const params = v.svgParams as string[];
    assert.ok(params[0].includes("template=classic-top-bottom"));
    assert.ok(params[0].includes("fontSize=64"));
    assert.ok(params[0].includes("stroke=#000000"));
    const json = JSON.parse(v.exportJson as string);
    assert.equal(json[0].template, "classic-top-bottom");
    assert.equal(json[0].fontSize, 64);
  });

  it("empty items errors", () => {
    assert.equal(runTool({ items: [] }).ok, false);
    assert.match(runTool({ items: [] }).error!, /at least one meme/i);
  });

  it("unknown template errors listing valid ids", () => {
    const r = runTool({ items: [{ template: "drake", topText: "a", bottomText: "b" }] });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("classic-top-bottom"));
  });

  it("template id matching is case-insensitive; label also accepted", () => {
    const v = okValues([{ template: "Classic-Top-Bottom", topText: "a", bottomText: "b" }]);
    assert.ok((v.memeSpecs as string[])[0].includes("Classic top + bottom"));
    const v2 = okValues([{ template: "Modern minimal", topText: "a", bottomText: "b" }]);
    assert.ok((v2.memeSpecs as string[])[0].includes("Modern minimal"));
  });

  it("captions over 120 chars error with Item N prefix", () => {
    const r = runTool({
      items: [
        { template: "classic-top-bottom", topText: "ok", bottomText: "ok" },
        { template: "classic-top-bottom", topText: "x".repeat(121), bottomText: "ok" },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 2.*120 characters/);
  });

  it("exactly 120 chars is accepted", () => {
    const v = okValues([{ template: "classic-top-bottom", topText: "x".repeat(120), bottomText: "y" }]);
    assert.ok(v);
  });

  it("both captions empty errors", () => {
    const r = runTool({ items: [{ template: "classic-top-bottom", topText: "  ", bottomText: "" }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one caption/i);
  });

  it("top-only template requires top text", () => {
    const r = runTool({ items: [{ template: "top-only", topText: "", bottomText: "punchline" }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /needs top text/);
  });

  it("bottom-only template requires bottom text", () => {
    const r = runTool({ items: [{ template: "bottom-only", topText: "setup", bottomText: "" }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /needs bottom text/);
  });

  it("invalid style errors", () => {
    const r = runTool({ items: [{ template: "classic-top-bottom", topText: "a", bottomText: "b", style: "fancy" }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /"classic" or "modern"/);
  });

  it("style defaults to classic; modern drops the stroke", () => {
    const v = okValues([{ template: "classic-top-bottom", topText: "a", bottomText: "b", style: "modern" }]);
    assert.ok((v.svgParams as string[])[0].includes("stroke=none"));
    assert.ok((v.svgParams as string[])[0].includes("style=modern"));
  });

  it("long caption auto-shrinks with a note", () => {
    const long = "x".repeat(90); // > 60 -> shrink: 64*60/90 = 42
    const v = okValues([{ template: "classic-top-bottom", topText: long, bottomText: "short" }]);
    const specs = v.memeSpecs as string[];
    assert.ok(specs[0].includes("42px"), specs[0]);
    assert.ok(specs[0].includes("auto-shrunk"));
  });

  it("very long caption floors at 24px (demotivator base 48: 48*60/120 = 24)", () => {
    const v = okValues([{ template: "demotivator", topText: "x".repeat(120), bottomText: "y" }]);
    assert.ok((v.svgParams as string[])[0].includes("fontSize=24"));
  });

  it("font size never drops below 24px", () => {
    for (const t of TEMPLATES) {
      const item: Record<string, unknown> = { template: t.id, topText: "x".repeat(120), bottomText: "y" };
      if (t.requiresBottom) item.topText = "x";
      const v = okValues([item]);
      const m = /fontSize=(\d+)/.exec((v.svgParams as string[])[0]);
      assert.ok(m && parseInt(m[1], 10) >= 24, `${t.id} size ${m?.[1]}`);
    }
  });

  it("short captions never shrink", () => {
    const v = okValues([{ template: "demotivator", topText: "SHORT", bottomText: "shorter" }]);
    assert.ok((v.svgParams as string[])[0].includes("fontSize=48"));
  });

  it("template bank has 6 entries; styles are classic|modern", () => {
    assert.equal(TEMPLATES.length, 6);
    assert.deepEqual([...VALID_STYLES], ["classic", "modern"]);
    const ids = TEMPLATES.map((t) => t.id);
    assert.equal(new Set(ids).size, 6);
  });

  it("params escape semicolons and equals in captions", () => {
    const v = okValues([{ template: "classic-top-bottom", topText: "a;b=c", bottomText: "d" }]);
    assert.ok((v.svgParams as string[])[0].includes("top=a\\;b\\=c"));
  });

  it("multiple memes produce parallel spec/param lines", () => {
    const v = okValues([
      { template: "top-only", topText: "first" },
      { template: "demotivator", topText: "second", bottomText: "sub", style: "modern" },
    ]);
    assert.equal((v.memeSpecs as string[]).length, 2);
    assert.equal((v.svgParams as string[]).length, 2);
    assert.equal(JSON.parse(v.exportJson as string).length, 2);
  });

  it("deterministic: two runs identical", () => {
    const items = [{ template: "split-caption", topText: "SETUP", bottomText: "PUNCHLINE", style: "classic" }];
    assert.deepEqual(runTool({ items }), runTool({ items }));
  });

  it("output ids match meta outputs", () => {
    const v = okValues([{ template: "classic-top-bottom", topText: "a", bottomText: "b" }]);
    assert.deepEqual(Object.keys(v).sort(), [...OUTPUT_IDS].sort());
  });
});
