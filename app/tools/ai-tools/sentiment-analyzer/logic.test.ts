import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getModelConfig,
  getDisclosures,
  validateInputs,
  normalizeSentiment,
  HEADLINE,
  MAX_TEXT_CHARS,
} from "./logic.ts";

describe("sentiment-analyzer logic", () => {
  it("model config is the verified DistilBERT SST-2 checkpoint", () => {
    const cfg = getModelConfig();
    assert.equal(cfg.id, "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
    assert.equal(cfg.task, "text-classification");
    assert.ok(cfg.sizeMb > 0);
  });

  it("disclosures are honest (binary, English, short texts)", () => {
    const d = getDisclosures().join(" ");
    assert.ok(d.includes("never uploaded"));
    assert.ok(d.includes("Binary sentiment only"));
    assert.ok(d.includes("sarcasm"));
  });

  it("headline is not hype", () => {
    assert.ok(!/ai-powered/i.test(HEADLINE));
  });

  it("normalizeSentiment picks the winning label", () => {
    const r = normalizeSentiment([
      { label: "NEGATIVE", score: 0.2 },
      { label: "POSITIVE", score: 0.8 },
    ])!;
    assert.equal(r.label, "POSITIVE");
    assert.equal(r.score, 0.8);
    assert.equal(r.positive, 0.8);
    assert.equal(r.negative, 0.2);
  });

  it("normalizeSentiment is case-insensitive and clamps scores", () => {
    const r = normalizeSentiment([{ label: "negative", score: 1.5 }])!;
    assert.equal(r.label, "NEGATIVE");
    assert.equal(r.score, 1);
  });

  it("normalizeSentiment returns null for garbage", () => {
    assert.equal(normalizeSentiment([]), null);
    assert.equal(normalizeSentiment([{ label: "JOY", score: 0.9 }]), null);
    assert.equal(normalizeSentiment("nope"), null);
  });

  it("validateInputs: happy path", () => {
    assert.deepEqual(validateInputs({ text: "I love this product!" }), { ok: true });
  });

  it("validateInputs: empty / too short / too long -> error", () => {
    assert.equal(validateInputs({}).ok, false);
    assert.equal(validateInputs({ text: "ok" }).ok, false);
    assert.equal(validateInputs({ text: "a".repeat(MAX_TEXT_CHARS + 1) }).ok, false);
  });

  it("determinism", () => {
    const raw = [{ label: "POSITIVE", score: 0.7 }];
    assert.deepEqual(normalizeSentiment(raw), normalizeSentiment(raw));
  });
});
