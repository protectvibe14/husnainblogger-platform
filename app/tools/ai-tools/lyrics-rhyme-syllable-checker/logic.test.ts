import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  analyzeLyrics,
  estimateSyllables,
  lineSyllables,
  rhymeKey,
  SYLLABLE_METHOD_NOTE,
  RHYME_METHOD_NOTE,
} from "./logic.ts";

describe("lyrics-rhyme-syllable-checker", () => {
  it("syllable heuristic: basic words", () => {
    assert.equal(estimateSyllables("cat"), 1);
    assert.equal(estimateSyllables("fire"), 1); // silent-e rule
    assert.equal(estimateSyllables("beautiful"), 3);
    assert.equal(estimateSyllables("running"), 2);
    assert.equal(estimateSyllables("a"), 1);
    assert.equal(estimateSyllables(""), 0);
  });

  it("lineSyllables sums word estimates", () => {
    assert.equal(lineSyllables("the cat sat"), 3);
    assert.equal(lineSyllables(""), 0);
  });

  it("rhymeKey: final vowel group to end", () => {
    assert.equal(rhymeKey("fire"), "ire");
    assert.equal(rhymeKey("desire"), "ire");
    assert.equal(rhymeKey("cat"), "at");
    assert.equal(rhymeKey("dreams"), "eam"); // plural normalized: dreams->dream->"eam"
    assert.equal(rhymeKey(""), "");
  });

  it("AABB scheme detected for a rhyming quatrain", () => {
    const r = analyzeLyrics([
      "I walk alone in the fire",
      "nothing left but burning desire",
      "the night is cold and dark",
      "I leave my lonely mark",
    ]);
    assert.equal(r.scheme, "A A B B");
    assert.deepEqual(r.rhymeGroups, { A: [1, 2], B: [3, 4] });
  });

  it("ABAB scheme detected", () => {
    const r = analyzeLyrics([
      "roses are red",
      "the sky is blue",
      "my love is true like red",
      "and deep like blue",
    ]);
    assert.equal(r.scheme, "A B A B");
  });

  it("non-rhyming lines each get their own letter", () => {
    const r = analyzeLyrics(["alpha", "brick", "stone"]);
    assert.equal(r.scheme, "A B C");
  });

  it("blank lines get '-' and are excluded from groups", () => {
    const r = analyzeLyrics(["hello world", "", "goodbye world"]);
    assert.equal(r.lines[1].scheme, "-");
    assert.ok(!("−" in r.rhymeGroups));
    assert.deepEqual(Object.keys(r.rhymeGroups), ["A"]);
  });

  it("syllable stats: min/max/avg", () => {
    const r = analyzeLyrics(["one two", "one two three four"]);
    assert.equal(r.minSyllables, 2);
    assert.equal(r.maxSyllables, 4);
    assert.equal(r.avgSyllables, 3);
  });

  it("happy path via runTool includes method notes", () => {
    const r = runTool({ lyrics: "Twinkle twinkle little star\nHow I wonder what you are" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v["syllableNote"], SYLLABLE_METHOD_NOTE);
    assert.equal(v["rhymeNote"], RHYME_METHOD_NOTE);
    assert.ok(typeof v["scheme"] === "string");
    assert.ok(Array.isArray(v["lines"]));
  });

  it("validation: missing lyrics -> error", () => {
    assert.equal(runTool({}).ok, false);
  });

  it("validation: blank-only lyrics -> error", () => {
    assert.equal(runTool({ lyrics: "   \n  " }).ok, false);
  });

  it("validation: too many lines -> error", () => {
    const many = Array.from({ length: 201 }, () => "la").join("\n");
    const r = runTool({ lyrics: many });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: overlong line -> error", () => {
    const r = runTool({ lyrics: `short\n${"x".repeat(501)}` });
    assert.equal(r.ok, false);
  });

  it("determinism: same lyrics twice -> identical output", () => {
    const args = { lyrics: "line one here\nline two there" };
    assert.deepEqual(runTool(args), runTool(args));
  });
});
