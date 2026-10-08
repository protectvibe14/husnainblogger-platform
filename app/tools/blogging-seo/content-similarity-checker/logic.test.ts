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

describe("content-similarity-checker", () => {
  it("identical texts score 1 / 100% / Near-duplicate", () => {
    const v = okValues({
      textA: "The quick brown fox jumps over the lazy dog.",
      textB: "The quick brown fox jumps over the lazy dog.",
    });
    assert.equal(v["jaccardSimilarity"], 1);
    assert.equal(v["similarityPercent"], 100);
    assert.match(v["verdict"] as string, /Near-duplicate/);
  });

  it("completely different texts score 0 / No measurable similarity", () => {
    const v = okValues({
      textA: "Apples oranges bananas grapes mangoes kiwi melon.",
      textB: "Trucks trains airplanes bicycles motorcycles scooters.",
    });
    assert.equal(v["jaccardSimilarity"], 0);
    assert.equal(v["similarityPercent"], 0);
    assert.match(v["verdict"] as string, /No measurable similarity/);
  });

  it("partial overlap lands in the Moderate band (j = 1/3)", () => {
    // A bigrams: the quick, quick brown, brown fox, fox jumps
    // B bigrams: the quick, quick brown, brown dog, dog runs
    // intersection 2, union 6 -> 0.3333
    const v = okValues({
      textA: "the quick brown fox jumps",
      textB: "the quick brown dog runs",
      shingleSize: 2,
    });
    assert.equal(v["jaccardSimilarity"], 0.3333);
    assert.equal(v["similarityPercent"], 33.33);
    assert.match(v["verdict"] as string, /Moderate similarity/);
  });

  it("high-overlap texts land in the High band", () => {
    // One word differs: 9 bigrams each, 7 shared -> 7/11 = 0.6364
    const v = okValues({
      textA: "one two three four five six seven eight nine ten",
      textB: "one two three four fiver six seven eight nine ten",
      shingleSize: 2,
    });
    const j = v["jaccardSimilarity"] as number;
    assert.ok(j >= 0.5 && j < 0.9, `expected high band, got ${j}`);
    assert.match(v["verdict"] as string, /High similarity/);
  });

  it("small overlap lands in the Low band", () => {
    const v = okValues({
      textA: "alpha beta gamma delta epsilon",
      textB: "alpha beta zeta eta theta",
      shingleSize: 2,
    });
    const j = v["jaccardSimilarity"] as number;
    assert.ok(j > 0 && j < 0.2, `expected low band, got ${j}`);
    assert.match(v["verdict"] as string, /Low similarity/);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ textA: "hello world", textB: "hello world" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), OUTPUT_IDS);
  });

  it("validation: missing Text A errors", () => {
    const r = runTool({ textB: "some text" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /both/i);
  });

  it("validation: missing Text B errors", () => {
    const r = runTool({ textA: "some text" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /both/i);
  });

  it("validation: shingle size below 2 errors", () => {
    const r = runTool({ textA: "some text here", textB: "other text here", shingleSize: 1 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /between 2 and 5/);
  });

  it("validation: shingle size above 5 errors", () => {
    const r = runTool({ textA: "some text here", textB: "other text here", shingleSize: 6 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /between 2 and 5/);
  });

  it("validation: non-integer shingle size errors", () => {
    const r = runTool({ textA: "some text here", textB: "other text here", shingleSize: 2.5 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /whole number/);
  });

  it("shingle size accepts numeric strings", () => {
    const v = okValues({ textA: "a b c d", textB: "a b c e", shingleSize: "2" });
    assert.ok(typeof v["jaccardSimilarity"] === "number");
  });

  it("texts shorter than the shingle size: identical -> 1", () => {
    const v = okValues({ textA: "hi there", textB: "hi there", shingleSize: 3 });
    assert.equal(v["jaccardSimilarity"], 1);
  });

  it("texts shorter than the shingle size: different -> 0", () => {
    const v = okValues({ textA: "hi there", textB: "hello world", shingleSize: 3 });
    assert.equal(v["jaccardSimilarity"], 0);
  });

  it("comparison is case-insensitive", () => {
    const v = okValues({ textA: "HELLO WORLD TEST", textB: "hello world test" });
    assert.equal(v["jaccardSimilarity"], 1);
  });

  it("similarityPercent always equals jaccardSimilarity * 100", () => {
    const v = okValues({
      textA: "the cat sat on the mat and the dog sat too",
      textB: "the cat sat on the rug and the bird flew",
      shingleSize: 3,
    });
    const j = v["jaccardSimilarity"] as number;
    const p = v["similarityPercent"] as number;
    assert.equal(p, Math.round(j * 10000) / 100);
  });

  it("jaccardSimilarity is rounded to 4 decimals", () => {
    const v = okValues({
      textA: "a b c d e f g",
      textB: "a b c d e f h",
      shingleSize: 2,
    });
    const j = v["jaccardSimilarity"] as number;
    assert.equal(j, Math.round(j * 10000) / 10000);
  });

  it("validation: text over 200000 chars errors", () => {
    const r = runTool({ textA: "x".repeat(200001), textB: "short" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /200,000/);
  });

  it("determinism: same inputs produce identical results", () => {
    const input = {
      textA: "Content marketing drives organic traffic over time.",
      textB: "Content marketing drives organic traffic over time, mostly.",
      shingleSize: 3,
    };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepEqual(a, b);
  });
});
