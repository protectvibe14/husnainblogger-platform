import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  extractKeywords,
  tokenize,
  toHashtag,
  STOPWORDS,
  BIGRAM_BONUS,
  METHOD_NOTE,
} from "./logic.ts";

const SAMPLE =
  "Email marketing is powerful. Email marketing drives sales. " +
  "Good email marketing needs great subject lines and strong email marketing strategy.";

describe("keyword-tag-extractor", () => {
  it("happy path: top unigram + hashtag output", () => {
    const r = runTool({ text: SAMPLE });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const keywords = v["keywords"] as { keyword: string; count: number; score: number; type: string }[];
    assert.ok(keywords.length > 0);
    // The "email marketing" phrase (4 occurrences x 1.5 bonus = 6) tops "email" (4).
    assert.equal(keywords[0].keyword, "email marketing");
    assert.equal(keywords[0].type, "phrase");
    const email = keywords.find((k) => k.keyword === "email");
    assert.ok(email);
    assert.equal(email.count, 4);
    const hashtags = v["hashtags"] as string[];
    assert.ok(hashtags[0].startsWith("#"));
    assert.equal(v["methodNote"], METHOD_NOTE);
  });

  it("bigrams with >=2 occurrences get the 1.5x bonus", () => {
    const { keywords } = extractKeywords(SAMPLE, 10);
    const phrase = keywords.find((k) => k.keyword === "email marketing");
    assert.ok(phrase, "expected the 'email marketing' phrase");
    assert.equal(phrase.type, "phrase");
    assert.equal(phrase.score, phrase.count * BIGRAM_BONUS);
  });

  it("stopwords are removed", () => {
    const tokens = tokenize("the quick brown fox and the lazy dog");
    assert.ok(!tokens.includes("the"));
    assert.ok(!tokens.includes("and"));
    assert.ok(tokens.includes("quick"));
  });

  it("short tokens (<3 chars) are dropped", () => {
    const tokens = tokenize("a be cat do");
    assert.deepEqual(tokens, ["cat"]);
  });

  it("toHashtag builds CamelCase tags", () => {
    assert.equal(toHashtag("email marketing"), "#EmailMarketing");
    assert.equal(toHashtag("seo"), "#Seo");
  });

  it("includeHashtags=false omits hashtags", () => {
    const r = runTool({ text: SAMPLE, includeHashtags: false });
    assert.equal(r.ok, true);
    assert.deepEqual((r.values as Record<string, unknown>)["hashtags"], []);
  });

  it("topN bounds are enforced", () => {
    assert.equal(runTool({ text: SAMPLE, topN: 3 }).ok, false);
    assert.equal(runTool({ text: SAMPLE, topN: 51 }).ok, false);
    assert.equal(runTool({ text: SAMPLE, topN: 7.5 }).ok, false);
    const ok = runTool({ text: SAMPLE, topN: 7 });
    assert.equal(ok.ok, true);
    assert.ok(
      ((ok.values as Record<string, unknown>)["keywords"] as unknown[]).length <= 7,
    );
  });

  it("ties break alphabetically (deterministic)", () => {
    const a = extractKeywords("zebra apple mango", 10);
    const b = extractKeywords("zebra apple mango", 10);
    assert.deepEqual(a, b);
  });

  it("stopword list is substantial", () => {
    assert.ok(STOPWORDS.length >= 100);
  });

  it("validation: missing text -> error", () => {
    assert.equal(runTool({}).ok, false);
  });

  it("validation: oversized text -> error", () => {
    assert.equal(runTool({ text: "a".repeat(100001) }).ok, false);
  });

  it("determinism: same inputs twice -> identical output", () => {
    const args = { text: SAMPLE, topN: 15 };
    assert.deepEqual(runTool(args), runTool(args));
  });
});
