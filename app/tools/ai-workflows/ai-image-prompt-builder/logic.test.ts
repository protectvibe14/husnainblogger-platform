import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  sanitize,
  normalizeItem,
  assembleImagePrompt,
  ART_STYLES,
  ASPECT_RATIOS,
  LIGHTING,
  CAMERA_ANGLES,
  DEFAULT_STYLE,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_LIGHTING,
  DEFAULT_CAMERA_ANGLE,
} from "./logic.ts";

const baseItem = {
  subject: "a cozy coffee shop in autumn",
  artStyle: "cinematic",
  aspectRatio: "16:9",
  lighting: "golden hour",
  cameraAngle: "wide shot",
  negativeTerms: "blurry, watermark",
};

describe("ai-image-prompt-builder (tool-303)", () => {
  it("happy path: assembles a full image prompt", () => {
    const r = runTool({ items: [baseItem] });
    assert.equal(r.ok, true);
    assert.equal(r.values?.lines.length, 1);
    const p = r.values?.lines[0] ?? "";
    assert.ok(p.includes("cinematic image of a cozy coffee shop in autumn"));
    assert.ok(p.includes("golden hour lighting"));
    assert.ok(p.includes("wide shot"));
    assert.ok(p.includes("aspect ratio 16:9"));
    assert.ok(p.includes("Negative prompt: blurry, watermark"));
  });

  it("phrase bank sizes are as documented", () => {
    assert.equal(ART_STYLES.length, 12);
    assert.equal(ASPECT_RATIOS.length, 5);
    assert.equal(LIGHTING.length, 8);
    assert.equal(CAMERA_ANGLES.length, 8);
  });

  it("missing subject -> Item 1 error", () => {
    const r = runTool({ items: [{ ...baseItem, subject: "   " }] });
    assert.equal(r.ok, false);
    assert.equal(r.error, "Item 1: subject is required.");
  });

  it("unknown art style falls back to photorealistic (spec edge case)", () => {
    const r = runTool({ items: [{ ...baseItem, artStyle: "claymation" }] });
    assert.ok(r.ok);
    assert.ok((r.values?.lines[0] ?? "").startsWith(`${DEFAULT_STYLE} image of`));
  });

  it("empty art style falls back to photorealistic", () => {
    const r = runTool({ items: [{ ...baseItem, artStyle: "" }] });
    assert.ok(r.ok);
    assert.ok((r.values?.lines[0] ?? "").startsWith("photorealistic image of"));
  });

  it("style matching is case-insensitive", () => {
    const r = runTool({ items: [{ ...baseItem, artStyle: "Anime" }] });
    assert.ok(r.ok);
    assert.ok((r.values?.lines[0] ?? "").startsWith("anime image of"));
  });

  it("invalid aspect ratio -> error listing valid options", () => {
    const r = runTool({ items: [{ ...baseItem, aspectRatio: "21:9" }] });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").startsWith("Item 1:"));
    for (const ar of ASPECT_RATIOS) assert.ok((r.error ?? "").includes(ar));
  });

  it("empty aspect ratio falls back to 16:9", () => {
    const r = runTool({ items: [{ ...baseItem, aspectRatio: "" }] });
    assert.ok(r.ok);
    assert.ok((r.values?.lines[0] ?? "").includes(`aspect ratio ${DEFAULT_ASPECT_RATIO}`));
  });

  it("all five aspect ratios are accepted", () => {
    for (const ar of ASPECT_RATIOS) {
      const r = runTool({ items: [{ ...baseItem, aspectRatio: ar }] });
      assert.ok(r.ok, `aspect ratio ${ar} rejected`);
      assert.ok((r.values?.lines[0] ?? "").includes(`aspect ratio ${ar}`));
    }
  });

  it("empty lighting/camera fall back to defaults", () => {
    const r = runTool({ items: [{ ...baseItem, lighting: "", cameraAngle: "" }] });
    assert.ok(r.ok);
    const p = r.values?.lines[0] ?? "";
    assert.ok(p.includes(`${DEFAULT_LIGHTING} lighting`));
    assert.ok(p.includes(`${DEFAULT_CAMERA_ANGLE} shot`));
  });

  it("custom lighting text is used verbatim (user's creative choice)", () => {
    const r = runTool({ items: [{ ...baseItem, lighting: "candlelit tavern glow" }] });
    assert.ok(r.ok);
    assert.ok((r.values?.lines[0] ?? "").includes("candlelit tavern glow lighting"));
  });

  it("no negative terms -> no negative-prompt line", () => {
    const r = runTool({ items: [{ ...baseItem, negativeTerms: "" }] });
    assert.ok(r.ok);
    assert.ok(!(r.values?.lines[0] ?? "").includes("Negative prompt"));
  });

  it("multiple items -> one prompt per item", () => {
    const r = runTool({
      items: [baseItem, { subject: "a robot chef", artStyle: "pixel art", aspectRatio: "1:1" }],
    });
    assert.ok(r.ok);
    assert.equal(r.values?.lines.length, 2);
    assert.ok((r.values?.lines[1] ?? "").includes("pixel art image of a robot chef"));
  });

  it("error in second item reports 'Item 2'", () => {
    const r = runTool({ items: [baseItem, { subject: "" }] });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").startsWith("Item 2:"));
  });

  it("empty items array -> error", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("at least one item"));
  });

  it("deterministic: same input twice -> identical output", () => {
    const a = runTool({ items: [baseItem] });
    const b = runTool({ items: [baseItem] });
    assert.deepEqual(a, b);
  });

  it("output key is 'lines' matching meta.ts outputs", () => {
    const r = runTool({ items: [baseItem] });
    assert.ok(r.ok);
    assert.deepEqual(Object.keys(r.values ?? {}), ["lines"]);
  });

  it("sanitize strips control chars and caps length", () => {
    assert.equal(sanitize("a\t\nb"), "a b");
    assert.equal(sanitize("x".repeat(500)).length, 300);
  });

  it("normalizeItem returns normalized fields for valid input", () => {
    const res = normalizeItem(baseItem, 0);
    assert.equal(res.ok, true);
    assert.equal(res.item?.subject, "a cozy coffee shop in autumn");
    assert.equal(res.item?.style, "cinematic");
    assert.equal(res.item?.negativeTerms, "blurry, watermark");
  });

  it("assembleImagePrompt formats without negative terms cleanly", () => {
    const p = assembleImagePrompt({
      subject: "a lighthouse",
      style: "watercolor",
      aspectRatio: "9:16",
      lighting: "moonlight",
      cameraAngle: "low angle",
      negativeTerms: "",
    });
    assert.equal(
      p,
      "watercolor image of a lighthouse, moonlight lighting, low angle shot, highly detailed (aspect ratio 9:16)",
    );
  });
});
