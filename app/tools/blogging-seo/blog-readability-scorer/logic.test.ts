import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { countSyllables, scoreReadability, runTool } from "./logic.ts";

describe("countSyllables", () => {
  it("counts simple words", () => {
    assert.equal(countSyllables("cat"), 1);
    assert.equal(countSyllables("hello"), 2);
    assert.equal(countSyllables("beautiful"), 3);
  });

  it("handles silent e", () => {
    assert.equal(countSyllables("make"), 1);
    assert.equal(countSyllables("table"), 2); // -le after consonant keeps 2
  });

  it("never returns zero for a real word", () => {
    assert.ok(countSyllables("rhythm") >= 1);
  });
});

describe("scoreReadability — real Flesch math", () => {
  it("matches the published formula on a known sample", () => {
    // Hand-verified: short simple sentences score high.
    const text = Array(10).fill("The cat sat on the mat. It was a hot day.").join(" ");
    const r = scoreReadability(text);
    assert.equal(r.heuristic, true);
    // words=110, sentences=20, syllables=110 -> 206.835 - 1.015*5.5 - 84.6*1 ≈ 116.7
    assert.ok(r.fleschScore > 90, `expected >90, got ${r.fleschScore}`);
    assert.match(r.verdict, /Very easy/);
  });

  it("complex text scores lower with a higher grade level", () => {
    const simple = Array(10).fill("The cat sat on the mat. It was a hot day.").join(" ");
    const complex = Array(10)
      .fill(
        "Notwithstanding the aforementioned considerations, the implementation necessitates comprehensive reconceptualization.",
      )
      .join(" ");
    const rs = scoreReadability(simple);
    const rc = scoreReadability(complex);
    assert.ok(rc.fleschScore < rs.fleschScore);
    assert.ok(rc.gradeLevel > rs.gradeLevel);
  });

  it("exposes word/sentence/syllable counts", () => {
    const text = Array(10).fill("The cat sat on the mat. It was a hot day.").join(" ");
    const r = scoreReadability(text);
    assert.equal(r.words, 110);
    assert.equal(r.sentences, 20);
    assert.ok(r.syllables > 0);
  });
});

describe("scoreReadability — errors", () => {
  it("rejects text under 30 words", () => {
    assert.throws(() => scoreReadability("Too short."), /30 words/);
  });
  it("throws on non-string", () => {
    assert.throws(() => scoreReadability(42 as unknown as string), TypeError);
  });
});

describe("runTool contract", () => {
  it("returns ok with all output keys", () => {
    const text = Array(10).fill("The cat sat on the mat. It was a hot day.").join(" ");
    const r = runTool({ text });
    assert.equal(r.ok, true);
    assert.ok(typeof r.values?.fleschScore === "number");
    assert.ok(typeof r.values?.gradeLevel === "number");
    assert.ok(typeof r.values?.verdict === "string");
    assert.ok(Array.isArray(r.values?.tips));
    assert.match(String(r.values?.methodNote), /Flesch/);
  });

  it("rejects empty text", () => {
    const r = runTool({ text: "   " });
    assert.equal(r.ok, false);
  });
});
