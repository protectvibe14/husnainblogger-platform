import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  expandQuestions,
  MAX_EXPANSIONS,
} from "./logic.ts";

describe("question-keyword-expander", () => {
  it("happy path: expands a normal seed", () => {
    const r = runTool({ seedKeyword: "intermittent fasting" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok(Array.isArray(v["expansions"]));
    assert.equal(v["count"], (v["expansions"] as string[]).length);
  });

  it("expansions cover all question words", () => {
    const { expansions } = expandQuestions("yoga");
    const starts = ["what", "how", "why", "when", "where", "who", "which", "can", "should", "is", "does"];
    for (const q of starts) {
      assert.ok(
        expansions.some((e) => e.startsWith(q + " ")),
        `missing question word: ${q}`,
      );
    }
    assert.ok(expansions.includes("what is yoga"));
    assert.ok(expansions.includes("how does yoga work"));
    assert.ok(expansions.includes("why is yoga important"));
  });

  it("count matches expansions length", () => {
    const { expansions, count } = expandQuestions("coffee");
    assert.equal(count, expansions.length);
  });

  it("never exceeds MAX_EXPANSIONS (23)", () => {
    const { expansions } = expandQuestions("a".repeat(100));
    assert.ok(expansions.length <= MAX_EXPANSIONS);
  });

  it("expansions are deduplicated", () => {
    const { expansions } = expandQuestions("seo");
    const lowered = expansions.map((e) => e.toLowerCase());
    assert.equal(new Set(lowered).size, lowered.length);
  });

  it("determinism: same seed twice -> identical output", () => {
    assert.deepEqual(
      runTool({ seedKeyword: "keto diet" }),
      runTool({ seedKeyword: "keto diet" }),
    );
  });

  it("validation: missing seedKeyword -> error", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: empty string -> error", () => {
    const r = runTool({ seedKeyword: "" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: non-string seed -> error", () => {
    const r = runTool({ seedKeyword: 42 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: too short -> error", () => {
    const r = runTool({ seedKeyword: " x " });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: longer than 100 chars -> error", () => {
    const r = runTool({ seedKeyword: "a".repeat(101) });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("edge case: seed that is already a question (trailing ?) is handled", () => {
    const r = runTool({ seedKeyword: "what is seo?" });
    assert.equal(r.ok, true);
    const exps = (r.values as Record<string, unknown>)["expansions"] as string[];
    assert.ok(!exps.some((e) => e.includes("?")));
    assert.ok(exps.some((e) => e.includes("what is seo")));
  });

  it("edge case: unicode seed works", () => {
    const r = runTool({ seedKeyword: "café recipes" });
    assert.equal(r.ok, true);
    const exps = (r.values as Record<string, unknown>)["expansions"] as string[];
    assert.ok(exps.includes("what is café recipes"));
  });

  it("edge case: trailing spaces are trimmed", () => {
    assert.deepEqual(
      runTool({ seedKeyword: "gardening   " }),
      runTool({ seedKeyword: "gardening" }),
    );
  });

  it("output keys are exactly expansions + count", () => {
    const r = runTool({ seedKeyword: "hiking" });
    assert.deepEqual(Object.keys(r.values as object).sort(), [
      "count",
      "expansions",
    ]);
  });

  it("word-bank bound: MAX_EXPANSIONS equals documented template total (3+4+2*8)", () => {
    assert.equal(MAX_EXPANSIONS, 3 + 4 + 2 * 8);
  });
});
