import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getModelConfig,
  getDisclosures,
  validateInputs,
  HEADLINE,
  MAX_FILE_MB,
} from "./logic.ts";

describe("ocr-text-extractor logic", () => {
  it("model config is the verified TrOCR printed-text checkpoint", () => {
    const cfg = getModelConfig();
    assert.equal(cfg.id, "Xenova/trocr-small-printed");
    assert.equal(cfg.task, "image-to-text");
    assert.ok(cfg.sizeMb > 0);
    assert.ok(cfg.license.length > 0);
  });

  it("disclosures are honest (printed-only, on-device, ~120MB)", () => {
    const d = getDisclosures().join(" ");
    assert.ok(d.includes("never uploaded") || d.includes("browser"));
    assert.ok(d.includes("Printed text only"));
    assert.ok(d.includes("120 MB"));
  });

  it("headline never claims AI superpowers beyond on-device OCR", () => {
    assert.ok(!/ai-powered/i.test(HEADLINE));
    assert.ok(HEADLINE.includes("on-device"));
  });

  it("validateInputs: happy path", () => {
    assert.deepEqual(
      validateInputs({ fileName: "page.png", fileSizeMb: 2.4 }),
      { ok: true },
    );
  });

  it("validateInputs: missing file -> error", () => {
    const r = validateInputs({});
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validateInputs: oversized file -> error", () => {
    const r = validateInputs({ fileName: "big.png", fileSizeMb: MAX_FILE_MB + 1 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes(String(MAX_FILE_MB)));
  });

  it("validateInputs: bad size values -> error", () => {
    assert.equal(validateInputs({ fileName: "x.png", fileSizeMb: 0 }).ok, false);
    assert.equal(validateInputs({ fileName: "x.png", fileSizeMb: NaN }).ok, false);
    assert.equal(validateInputs({ fileName: "x.png" }).ok, false);
  });

  it("determinism: same inputs twice -> identical output", () => {
    const args = { fileName: "a.png", fileSizeMb: 1 };
    assert.deepEqual(validateInputs(args), validateInputs(args));
  });
});
