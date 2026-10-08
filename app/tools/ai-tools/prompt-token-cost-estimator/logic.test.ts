import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  estimateTokens,
  estimateCost,
  formatUsd,
  CHARS_PER_TOKEN,
  MAX_PROMPT_CHARS,
} from "./logic.ts";

describe("prompt-token-cost-estimator", () => {
  it("happy path: computes transparent cost breakdown", () => {
    const r = runTool({
      promptText: "Write a haiku about the sea.",
      inputPricePerM: 2.5,
      outputPricePerM: 10,
      expectedOutputTokens: 50,
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v["promptChars"], "Write a haiku about the sea.".length);
    assert.equal(
      v["estimatedInputTokens"],
      Math.ceil("Write a haiku about the sea.".length / 4),
    );
    assert.equal(
      v["estimateNote"],
      "Rough estimate — real tokenizers differ.",
    );
    assert.ok(typeof v["totalCostDisplay"] === "string");
    assert.ok((v["totalCostDisplay"] as string).startsWith("$"));
    assert.ok(Array.isArray(v["math"]));
    assert.equal((v["math"] as string[]).length, 4);
  });

  it("math: token estimate uses ceil(chars/4)", () => {
    assert.equal(estimateTokens(0), 0);
    assert.equal(estimateTokens(1), 1);
    assert.equal(estimateTokens(4), 1);
    assert.equal(estimateTokens(5), 2);
    assert.equal(estimateTokens(100), 25);
    assert.equal(CHARS_PER_TOKEN, 4);
  });

  it("math: cost formula is tokens/1e6 * price", () => {
    const c = estimateCost(4000, 2.5, 10, 1000);
    assert.equal(c.estimatedInputTokens, 1000);
    assert.ok(Math.abs(c.inputCostUsd - (1000 / 1e6) * 2.5) < 1e-12);
    assert.ok(Math.abs(c.outputCostUsd - (1000 / 1e6) * 10) < 1e-12);
    assert.ok(
      Math.abs(c.totalCostUsd - (c.inputCostUsd + c.outputCostUsd)) < 1e-12,
    );
  });

  it("math lines disclose the rough-estimate label", () => {
    const c = estimateCost(100, 1, 1, 10);
    assert.ok(c.math[0].includes("rough estimate"));
    assert.ok(c.math[0].includes("real tokenizers differ"));
  });

  it("zero prices give zero cost (never invents provider prices)", () => {
    const r = runTool({
      promptText: "hello world",
      inputPricePerM: 0,
      outputPricePerM: 0,
      expectedOutputTokens: 0,
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v["totalCostUsd"], 0);
    assert.equal(v["totalCostDisplay"], "$0.00");
  });

  it("accepts numeric strings from form fields", () => {
    const r = runTool({
      promptText: "abc",
      inputPricePerM: "2.50",
      outputPricePerM: "10",
      expectedOutputTokens: "50",
    });
    assert.equal(r.ok, true);
  });

  it("formatUsd: tiny values keep 6 decimals", () => {
    assert.equal(formatUsd(0.000773), "$0.000773");
    assert.equal(formatUsd(0), "$0.00");
    assert.equal(formatUsd(1.23456), "$1.2346");
  });

  it("validation: missing prompt -> error", () => {
    const r = runTool({
      inputPricePerM: 2.5,
      outputPricePerM: 10,
      expectedOutputTokens: 50,
    });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: missing prices -> error (we never guess them)", () => {
    const r = runTool({
      promptText: "test",
      outputPricePerM: 10,
      expectedOutputTokens: 50,
    });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: negative price -> error", () => {
    const r = runTool({
      promptText: "test",
      inputPricePerM: -1,
      outputPricePerM: 10,
      expectedOutputTokens: 50,
    });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: fractional output tokens -> error", () => {
    const r = runTool({
      promptText: "test",
      inputPricePerM: 1,
      outputPricePerM: 1,
      expectedOutputTokens: 12.5,
    });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: oversized prompt -> error", () => {
    const r = runTool({
      promptText: "a".repeat(MAX_PROMPT_CHARS + 1),
      inputPricePerM: 1,
      outputPricePerM: 1,
      expectedOutputTokens: 10,
    });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("determinism: same inputs twice -> identical output", () => {
    const args = {
      promptText: "Summarize this article.",
      inputPricePerM: 1.25,
      outputPricePerM: 5,
      expectedOutputTokens: 300,
    };
    assert.deepEqual(runTool(args), runTool(args));
  });
});
