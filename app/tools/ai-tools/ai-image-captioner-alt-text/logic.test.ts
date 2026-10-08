import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getModelConfig,
  getDisclosures,
  validateInputs,
  toAltText,
  HEADLINE,
  ALT_MAX_CHARS,
  MAX_FILE_MB,
} from "./logic.ts";

describe("ai-image-captioner-alt-text logic", () => {
  it("model config is the verified ViT-GPT2 captioning checkpoint", () => {
    const cfg = getModelConfig();
    assert.equal(cfg.id, "Xenova/vit-gpt2-image-captioning");
    assert.equal(cfg.task, "image-to-text");
    assert.ok(cfg.sizeMb > 0);
  });

  it("disclosures are honest (generic guesses, ~350MB, review alt text)", () => {
    const d = getDisclosures().join(" ");
    assert.ok(d.includes("never uploaded"));
    assert.ok(d.includes("generic"));
    assert.ok(d.includes("125 characters"));
  });

  it("headline is not hype", () => {
    assert.ok(!/ai-powered/i.test(HEADLINE));
  });

  it("toAltText: short captions pass through", () => {
    const c = "A dog sitting on a park bench.";
    assert.equal(toAltText(c), c);
  });

  it("toAltText: long captions truncate at a word boundary <= 125", () => {
    const c =
      "A very long caption describing a beautiful sunset over the mountains with birds " +
      "flying across the orange sky while a river reflects the light and trees sway gently.";
    const alt = toAltText(c);
    assert.ok(alt.length <= ALT_MAX_CHARS, `got ${alt.length}`);
    assert.ok(!alt.endsWith(" ") && !/[.,;:!?]$/.test(alt));
    assert.ok(c.startsWith(alt.slice(0, 20)));
  });

  it("toAltText: collapses whitespace", () => {
    assert.equal(toAltText("  a   b\nc  "), "a b c");
  });

  it("toAltText is deterministic", () => {
    const c = "x".repeat(200);
    assert.equal(toAltText(c), toAltText(c));
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
