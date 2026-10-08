import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  verdictFor,
  BANK_SIZE,
  MAX_CONTENT_CHARS,
  LOW_DENSITY,
  GOOD_DENSITY,
  MATCHED_WORDS_CAP,
} from "./logic.ts";

function okValues(input: Record<string, unknown>) {
  const r = runTool(input);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

function matched(v: Record<string, unknown>) {
  return v.matchedWords as { columns: string[]; rows: string[][] };
}

describe("transition-words-checker", () => {
  it("happy path: counts single and multi-word transitions", () => {
    const v = okValues({
      content: "However, this is a test. For example, it works well. In addition, it is fast.",
    });
    assert.equal(v.transitionCount, 3);
    assert.ok((v.density as number) > 0);
    const rows = matched(v).rows;
    assert.deepEqual(matched(v).columns, ["Transition word/phrase", "Occurrences"]);
    assert.ok(rows.some((r) => r[0] === "however" && r[1] === "1"));
    assert.ok(rows.some((r) => r[0] === "for example"));
    assert.ok(rows.some((r) => r[0] === "in addition"));
    assert.equal(typeof v.verdict, "string");
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues({ content: "However this works." });
    assert.deepEqual(Object.keys(v).sort(), [
      "density",
      "matchedWords",
      "transitionCount",
      "verdict",
    ]);
  });

  it("matching is case-insensitive", () => {
    const v = okValues({ content: "HOWEVER, this works. however again." });
    assert.equal(v.transitionCount, 2);
    assert.equal(matched(v).rows[0][0], "however");
    assert.equal(matched(v).rows[0][1], "2");
  });

  it("longest phrase wins: 'first of all' counted once, not as 'first'", () => {
    const v = okValues({ content: "First of all, welcome." });
    assert.equal(v.transitionCount, 1);
    assert.equal(matched(v).rows[0][0], "first of all");
  });

  it("word boundaries: 'after' does not match inside 'afterwards'", () => {
    const v = okValues({ content: "We met afterwards at the cafe." });
    assert.equal(v.transitionCount, 0);
    assert.equal((v.density as number), 0);
  });

  it("density = transitions per 100 words", () => {
    // 2 transitions in 20 words -> 10.0
    const v = okValues({
      content: "However word word word word word word word word word. Moreover word word word word word word word word word.",
    });
    assert.equal(v.transitionCount, 2);
    assert.equal(v.density, 10);
  });

  it("verdict: Low under 1.0", () => {
    const v = okValues({ content: "Plain words here. ".repeat(40) });
    assert.match(v.verdict as string, /^Low/);
    assert.ok((v.density as number) < LOW_DENSITY);
  });

  it("verdict: Moderate between 1.0 and 3.0", () => {
    // 1 transition in 50 words -> 2.0
    const v = okValues({ content: "However " + "word ".repeat(49) });
    assert.equal(v.density, 2);
    assert.match(v.verdict as string, /^Moderate/);
  });

  it("verdict: Good above 3.0", () => {
    const v = okValues({
      content: "However, moreover, therefore, furthermore, additionally, meanwhile, otherwise, instead, likewise, similarly.",
    });
    assert.ok((v.density as number) > GOOD_DENSITY);
    assert.match(v.verdict as string, /^Good/);
  });

  it("verdictFor boundaries", () => {
    assert.match(verdictFor(0.99), /^Low/);
    assert.match(verdictFor(1.0), /^Moderate/);
    assert.match(verdictFor(3.0), /^Moderate/);
    assert.match(verdictFor(3.01), /^Good/);
  });

  it("no transitions: zero count, empty table", () => {
    const v = okValues({ content: "The cat sat on the mat." });
    assert.equal(v.transitionCount, 0);
    assert.equal(v.density, 0);
    assert.deepEqual(matched(v).rows, []);
  });

  it("very short content works", () => {
    const v = okValues({ content: "However!" });
    assert.equal(v.transitionCount, 1);
  });

  it("matched words sorted by count desc", () => {
    const v = okValues({
      content: "However this. However that. Moreover other.",
    });
    const rows = matched(v).rows;
    assert.equal(rows[0][0], "however");
    assert.equal(rows[0][1], "2");
    assert.equal(rows[1][0], "moreover");
  });

  it("matched words capped at 50 rows", () => {
    assert.equal(MATCHED_WORDS_CAP, 50);
  });

  it("non-English content simply scores low (bank is English)", () => {
    const v = okValues({ content: "Dies ist ein deutscher Text ohne englische Wörter." });
    assert.equal(v.transitionCount, 0);
    assert.match(v.verdict as string, /^Low/);
  });

  it("unicode content does not crash", () => {
    const v = okValues({ content: "However, café naïve 😋 résumé works." });
    assert.equal(v.transitionCount, 1);
  });

  it("empty content rejected", () => {
    const r = runTool({ content: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /paste/i);
  });

  it("whitespace-only rejected", () => {
    const r = runTool({ content: "  \n " });
    assert.equal(r.ok, false);
  });

  it("missing content rejected", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });

  it("non-string content rejected", () => {
    const r = runTool({ content: ["however"] });
    assert.equal(r.ok, false);
  });

  it(`content over ${MAX_CONTENT_CHARS} chars rejected`, () => {
    const r = runTool({ content: "x ".repeat(MAX_CONTENT_CHARS) });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /characters or fewer/);
  });

  it("non-object input rejected", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("deterministic: same inputs give identical output twice", () => {
    const input = { content: "However, for example, this is deterministic. In addition, yes." };
    assert.deepEqual(runTool(input), runTool(input));
  });

  it("bank size is exactly 111 phrases", () => {
    assert.equal(BANK_SIZE, 111);
  });
});
