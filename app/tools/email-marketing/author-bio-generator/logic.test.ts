import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateBio,
  hasRepeatedWords,
  countWords,
  stripTags,
  takeCodePoints,
  BIO_TEMPLATES,
  BIO_LENGTHS,
  BIO_POVS,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const baseValues = {
  name: "Ayesha Khan",
  expertise: "email deliverability specialist",
  publications: "Blogging Weekly",
  length: "100",
  pov: "third",
};

describe("author-bio-generator (tool-443)", () => {
  it("happy path: returns bio and honest word count", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const bio = r.values?.bio as string;
    const wordCount = r.values?.wordCount as number;
    assert.ok(bio.includes("Ayesha Khan"));
    assert.ok(bio.includes("Blogging Weekly"));
    assert.equal(wordCount, countWords(bio), "wordCount must equal actual count");
  });

  it("template bank sizes are as documented (3 lengths x 2 pov = 6)", () => {
    assert.equal(BIO_LENGTHS.length, 3);
    assert.equal(BIO_POVS.length, 2);
    assert.equal(Object.keys(BIO_TEMPLATES).length, 3);
    for (const l of BIO_LENGTHS) {
      assert.equal(Object.keys(BIO_TEMPLATES[l]).length, 2, `length ${l} needs 2 povs`);
    }
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const metaIds = new Set((outputs as { id: string }[]).map((o) => o.id));
    assert.deepEqual(new Set(Object.keys(r.values ?? {})), metaIds);
  });

  it("determinism: same inputs produce identical outputs", () => {
    assert.deepEqual(runTool(baseValues), runTool(baseValues));
  });

  it("rejects missing name", () => {
    const r = runTool({ ...baseValues, name: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /name/i);
  });

  it("rejects whitespace-only expertise", () => {
    const r = runTool({ ...baseValues, expertise: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /expertise/i);
  });

  it("rejects invalid length", () => {
    const r = runTool({ ...baseValues, length: "75" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /length/i);
  });

  it("rejects invalid pov", () => {
    const r = runTool({ ...baseValues, pov: "second" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /point of view/i);
  });

  it("publications are optional: fallback sentence, no empty placeholder", () => {
    const r = runTool({ ...baseValues, publications: "" });
    assert.equal(r.ok, true);
    const bio = r.values?.bio as string;
    assert.ok(!bio.includes("{pubSentence}"));
    assert.ok(bio.includes("real projects, not textbooks"));
  });

  it("first-person bio uses I, third-person uses they — never mismatched", () => {
    const first = runTool({ ...baseValues, pov: "first" }).values?.bio as string;
    const third = runTool({ ...baseValues, pov: "third" }).values?.bio as string;
    assert.ok(/\bI am\b/.test(first));
    assert.ok(!/\bI am\b/.test(third));
    assert.ok(/they write/i.test(third));
  });

  it("lengths produce different bio sizes (50 < 100 < 200)", () => {
    const wc = (length: string) =>
      runTool({ ...baseValues, length }).values?.wordCount as number;
    assert.ok(wc("50") < wc("100"));
    assert.ok(wc("100") < wc("200"));
  });

  it("word counts land near targets (50: 40-80, 100: 85-130, 200: 175-245)", () => {
    const wc = (length: string) =>
      runTool({ ...baseValues, length }).values?.wordCount as number;
    const w50 = wc("50"), w100 = wc("100"), w200 = wc("200");
    assert.ok(w50 >= 40 && w50 <= 80, `50-target=${w50}`);
    assert.ok(w100 >= 85 && w100 <= 130, `100-target=${w100}`);
    assert.ok(w200 >= 175 && w200 <= 245, `200-target=${w200}`);
  });

  it("wordCount is honest: grows with longer input values", () => {
    const short = runTool({ ...baseValues, length: "50" }).values?.wordCount as number;
    const long = runTool({ ...baseValues, length: "50", publications: "Blogging Weekly, The Newsletter Post, and Email Geeks" }).values?.wordCount as number;
    assert.ok(long > short);
  });

  it("overlong input is trimmed with a visible notice", () => {
    const r = runTool({ ...baseValues, expertise: "x".repeat(MAX_INPUT_CHARS + 20) });
    assert.equal(r.ok, true);
    assert.ok((r.values?.bio as string).includes("trimmed"));
  });

  it("HTML tags are stripped from inputs", () => {
    const r = runTool({ ...baseValues, name: "Ayesha <em>Khan</em>" });
    assert.equal(r.ok, true);
    const bio = r.values?.bio as string;
    assert.ok(!bio.includes("<em>"));
    assert.ok(bio.includes("Ayesha Khan"));
  });

  it("no unfilled slots remain in the bio", () => {
    const r = runTool(baseValues);
    const bio = r.values?.bio as string;
    assert.ok(!/\{(name|firstName|expertise|expertiseLower|pubSentence)\}/.test(bio));
  });

  it("CJK input works and counts in code points", () => {
    const r = runTool({ ...baseValues, name: "王小明", expertise: "博客写作专家" });
    assert.equal(r.ok, true);
    assert.ok((r.values?.bio as string).includes("王小明"));
  });

  it("takeCodePoints keeps emoji whole", () => {
    const taken = takeCodePoints("ab🎉cd🎉", 3);
    assert.equal([...taken].length, 3);
    assert.ok(taken.endsWith("🎉"));
  });

  it("hasRepeatedWords detection works", () => {
    assert.equal(hasRepeatedWords("great great post"), true);
    assert.equal(hasRepeatedWords("a great post"), false);
  });

  it("duplicate word in input triggers review flag", () => {
    const r = runTool({ ...baseValues, name: "Khan Khan" });
    assert.equal(r.ok, true);
    assert.ok((r.values?.bio as string).includes("Review flag"));
  });

  it("generateBio throws RangeError on bad pov", () => {
    assert.throws(() => generateBio("A", "B", "", "50", "second"), RangeError);
  });

  it("non-string tone-ish values are rejected", () => {
    const r = runTool({ ...baseValues, length: 100 });
    assert.equal(r.ok, false);
  });

  it("countWords handles empty and whitespace-only strings", () => {
    assert.equal(countWords(""), 0);
    assert.equal(countWords("   "), 0);
    assert.equal(countWords("one  two"), 2);
  });
});
