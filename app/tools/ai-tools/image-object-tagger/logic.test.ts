import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getModelConfig,
  getDisclosures,
  validateInputs,
  normalizeTags,
  HEADLINE,
  TOP_K,
  MAX_FILE_MB,
} from "./logic.ts";

describe("image-object-tagger logic", () => {
  it("model config is the verified ViT image-classification checkpoint", () => {
    const cfg = getModelConfig();
    assert.equal(cfg.id, "Xenova/vit-base-patch16-224");
    assert.equal(cfg.task, "image-classification");
    assert.ok(cfg.sizeMb > 0);
  });

  it("disclosures are honest (ImageNet classes, confidence not certainty)", () => {
    const d = getDisclosures().join(" ");
    assert.ok(d.includes("never uploaded"));
    assert.ok(d.includes("ImageNet"));
    assert.ok(d.includes("not certainty"));
  });

  it("headline is not hype", () => {
    assert.ok(!/ai-powered/i.test(HEADLINE));
  });

  it("normalizeTags sorts and caps at TOP_K", () => {
    const raw = [
      { label: "tabby", score: 0.4 },
      { label: "tiger cat", score: 0.8 },
      { label: "lynx", score: 0.1 },
    ];
    const tags = normalizeTags(raw);
    assert.equal(tags.length, 3);
    assert.equal(tags[0].label, "tiger cat");
    assert.deepEqual(normalizeTags(raw, 2).map((t) => t.label), ["tiger cat", "tabby"]);
  });

  it("normalizeTags drops malformed entries", () => {
    const raw = [
      { label: "ok", score: 0.5 },
      { label: 42, score: 0.9 },
      { label: "bad", score: NaN },
      null,
      "nope",
    ];
    const tags = normalizeTags(raw);
    assert.deepEqual(tags, [{ label: "ok", score: 0.5 }]);
  });

  it("normalizeTags handles non-arrays", () => {
    assert.deepEqual(normalizeTags(undefined), []);
    assert.deepEqual(normalizeTags({}), []);
  });

  it("TOP_K is 8", () => {
    assert.equal(TOP_K, 8);
  });

  it("validateInputs: happy path + failures", () => {
    assert.deepEqual(validateInputs({ fileName: "a.jpg", fileSizeMb: 2 }), { ok: true });
    assert.equal(validateInputs({}).ok, false);
    assert.equal(
      validateInputs({ fileName: "a.jpg", fileSizeMb: MAX_FILE_MB + 1 }).ok,
      false,
    );
  });
});
