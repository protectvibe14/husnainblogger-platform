import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  splitSentences,
  countSyllables,
  MAX_CONTENT_CHARS,
  LONG_SENTENCE_WORDS,
  LONG_SENTENCES_CAP,
} from "./logic.ts";

function okValues(input: Record<string, unknown>) {
  const r = runTool(input);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

function longSent(v: Record<string, unknown>) {
  return v.longSentences as { columns: string[]; rows: string[][] };
}

describe("sentence-length-analyzer", () => {
  it("happy path: known-value check on 'The cat sat.'", () => {
    const v = okValues({ content: "The cat sat." });
    // 1 sentence, 3 words, 3 syllables, 9 chars, 0 complex
    assert.equal(v.avgSentenceLength, 3);
    assert.equal(v.fleschReadingEase, 119.19); // 206.835 - 1.015*3 - 84.6*1
    assert.equal(v.fleschKincaidGrade, -2.62); // 0.39*3 + 11.8*1 - 15.59
    assert.equal(v.gunningFog, 1.2); // 0.4 * (3 + 0)
    assert.equal(v.ari, -5.8); // 4.71*3 + 0.5*3 - 21.43
    assert.deepEqual(longSent(v).rows, []);
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues({ content: "Hello world. How are you?" });
    assert.deepEqual(Object.keys(v).sort(), [
      "ari",
      "avgSentenceLength",
      "fleschKincaidGrade",
      "fleschReadingEase",
      "gunningFog",
      "longSentences",
    ]);
  });

  it("multi-sentence averages", () => {
    const v = okValues({ content: "One two three. Four five six seven eight." });
    assert.equal(v.avgSentenceLength, 4); // 8 words / 2 sentences
  });

  it("long sentences (> 25 words) are listed", () => {
    const long = "word ".repeat(30).trim() + ".";
    const v = okValues({ content: `Short one. ${long} Another short.` });
    const t = longSent(v);
    assert.deepEqual(t.columns, ["Sentence #", "Words", "Sentence"]);
    assert.equal(t.rows.length, 1);
    assert.equal(t.rows[0][0], "2");
    assert.equal(t.rows[0][1], "30");
  });

  it("boundary: 25-word sentence is not long, 26-word is", () => {
    const mk = (n: number) => "word ".repeat(n).trim() + ".";
    const v25 = okValues({ content: mk(25) });
    const v26 = okValues({ content: mk(26) });
    assert.equal(longSent(v25).rows.length, 0);
    assert.equal(longSent(v26).rows.length, 1);
  });

  it("long-sentence table capped at 20 rows", () => {
    const one = "word ".repeat(30).trim() + ". ";
    const v = okValues({ content: one.repeat(25) });
    assert.equal(longSent(v).rows.length, LONG_SENTENCES_CAP);
    assert.equal(LONG_SENTENCES_CAP, 20);
  });

  it("long sentence preview truncated with ellipsis", () => {
    const v = okValues({ content: "word ".repeat(40).trim() + "." });
    const preview = longSent(v).rows[0][2];
    assert.ok(preview.endsWith("…"));
    assert.ok(preview.length <= 95);
  });

  it("single-sentence content", () => {
    const v = okValues({ content: "Just one single sentence here." });
    assert.equal(v.avgSentenceLength, 5);
  });

  it("no terminal punctuation: whole text is one sentence", () => {
    const v = okValues({ content: "just words here flowing on and on" });
    assert.equal(v.avgSentenceLength, 7);
  });

  it("abbreviations don't split: 'Mr.' and 'e.g.'", () => {
    const s = splitSentences("Mr. Smith went home. He ate cake e.g. pie. Done.");
    assert.equal(s.length, 3);
  });

  it("heavy abbreviation text: 'e.g.' mid-sentence stays intact", () => {
    const s = splitSentences("Use tools e.g. hammers daily. They help a lot.");
    assert.equal(s.length, 2);
    assert.match(s[0].text, /e\.g\./);
  });

  it("countSyllables: heuristic checks", () => {
    assert.equal(countSyllables("the"), 1);
    assert.equal(countSyllables("cat"), 1);
    assert.equal(countSyllables("apple"), 2); // consonant + le
    assert.equal(countSyllables("beautiful"), 3);
    assert.equal(countSyllables("queue"), 1); // silent e, min 1
    assert.equal(countSyllables("rhythm"), 1);
    assert.equal(countSyllables("internationalization") >= 3, true);
  });

  it("gunning fog counts 3+ syllable words (simplified, no proper-noun exclusion)", () => {
    // "internationalization" (8) and "confuses" (3 — the heuristic counts the
    // plural -es as a vowel group) are the 2 complex words of 5 total.
    const v = okValues({ content: "Internationalization confuses many new readers." });
    // ASL=5, complex=2/5 -> 0.4*(5+40) = 18
    assert.equal(v.gunningFog, 18);
  });

  it("question and exclamation marks split sentences", () => {
    const v = okValues({ content: "Really? Yes! Absolutely." });
    assert.equal(v.avgSentenceLength, 1);
  });

  it("unicode content works", () => {
    const v = okValues({ content: "Café naïve 😋. Über alles gut!" });
    assert.equal(typeof v.fleschReadingEase, "number");
    assert.ok(Number.isFinite(v.fleschReadingEase as number));
  });

  it("empty content rejected", () => {
    const r = runTool({ content: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /paste/i);
  });

  it("whitespace-only rejected", () => {
    const r = runTool({ content: "   " });
    assert.equal(r.ok, false);
  });

  it("missing content rejected", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });

  it("non-string content rejected", () => {
    const r = runTool({ content: 42 });
    assert.equal(r.ok, false);
  });

  it("punctuation-only content: no sentences detected", () => {
    const r = runTool({ content: ".... !!!" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /sentences/i);
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
    const input = { content: "Deterministic text here. Mr. Smith agrees, e.g. fully." };
    assert.deepEqual(runTool(input), runTool(input));
  });

  it("LONG_SENTENCE_WORDS constant is 25 (editorial threshold)", () => {
    assert.equal(LONG_SENTENCE_WORDS, 25);
  });
});
