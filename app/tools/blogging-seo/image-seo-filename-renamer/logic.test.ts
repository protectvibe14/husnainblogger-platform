import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id).sort();

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "expected values");
  assert.deepEqual(Object.keys(r.values).sort(), OUTPUT_IDS);
  return r.values;
}

describe("image-seo-filename-renamer", () => {
  it("happy path: keywords become the filename", () => {
    const v = okValues({ originalName: "IMG_20241001 (2).JPG", keywords: "red running shoes" });
    assert.equal(v["suggestedFilename"], "red-running-shoes.jpg");
    assert.equal(v["downloadFilename"], "red-running-shoes.jpg");
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ originalName: "photo.png" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), OUTPUT_IDS);
  });

  it("derives the name from the original basename when no keywords given", () => {
    const v = okValues({ originalName: "My Vacation Photo 2024.png" });
    assert.equal(v["suggestedFilename"], "my-vacation-photo-2024.png");
  });

  it("strips path components (both / and \\)", () => {
    const v = okValues({ originalName: "C:\\Users\\me\\pics/vacation photo.jpg", keywords: "beach" });
    assert.equal(v["suggestedFilename"], "beach.jpg");
  });

  it("transliterates accented latin letters", () => {
    const v = okValues({ originalName: "café crème brûlée.jpg" });
    assert.equal(v["suggestedFilename"], "cafe-creme-brulee.jpg");
  });

  it("keeps no extension when the file has none", () => {
    const v = okValues({ originalName: "screenshot", keywords: "dashboard view" });
    assert.equal(v["suggestedFilename"], "dashboard-view");
  });

  it("handles multiple dots: extension is the last suffix", () => {
    const v = okValues({ originalName: "my.photo.final.PNG", keywords: "sunset" });
    assert.equal(v["suggestedFilename"], "sunset.png");
  });

  it("long suffix after last dot is treated as part of the name", () => {
    const v = okValues({ originalName: "photo.backupfile", keywords: "" });
    assert.equal(v["suggestedFilename"], "photo-backupfile");
  });

  it("dotfile keeps a usable name", () => {
    const v = okValues({ originalName: ".htaccess" });
    assert.equal(v["suggestedFilename"], "htaccess");
  });

  it("trailing dot: no extension added", () => {
    const v = okValues({ originalName: "photo." });
    assert.equal(v["suggestedFilename"], "photo");
  });

  it("non-latin-only name falls back to 'image'", () => {
    const v = okValues({ originalName: "图片测试.jpg" });
    assert.equal(v["suggestedFilename"], "image.jpg");
  });

  it("caps the name part at 60 characters", () => {
    // 23 words -> 114-char slug (under the 120-char keyword limit), must be cut to 60.
    const v = okValues({ originalName: "x.jpg", keywords: "word ".repeat(23).trim() });
    const name = v["suggestedFilename"] as string;
    const base = name.replace(/\.jpg$/, "");
    assert.ok(base.length <= 60, `base too long: ${base.length}`);
    assert.ok(!base.endsWith("-"));
  });

  it("validation: empty original name errors", () => {
    const r = runTool({ originalName: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /file name/i);
  });

  it("validation: name longer than 200 chars errors", () => {
    const r = runTool({ originalName: "a".repeat(201) + ".jpg" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /200/);
  });

  it("validation: keywords longer than 120 chars error", () => {
    const r = runTool({ originalName: "photo.jpg", keywords: "k".repeat(121) });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /120/);
  });

  it("validation: non-string keywords error", () => {
    const r = runTool({ originalName: "photo.jpg", keywords: 42 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /keywords/i);
  });

  it("determinism: same inputs produce identical results", () => {
    const input = { originalName: "IMG_2024 (1).JPEG", keywords: "Blue Running Shoes!" };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepEqual(a, b);
  });

  it("uppercase extension is lowercased", () => {
    const v = okValues({ originalName: "photo.JPEG", keywords: "cat" });
    assert.equal(v["suggestedFilename"], "cat.jpeg");
  });

  it("collapses punctuation and whitespace into single hyphens", () => {
    const v = okValues({ originalName: "a.jpg", keywords: "big  —  SALE!!! 2024" });
    assert.equal(v["suggestedFilename"], "big-sale-2024.jpg");
  });
});
