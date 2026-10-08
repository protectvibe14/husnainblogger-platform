/**
 * Tests for the Content Brief Generator pure logic (tool-031).
 *
 * Run: node --test app/tools/blogging-seo/content-brief-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildBrief,
  guessIntent,
  allocateWords,
  SECTION_BANK,
  SECTION_BANK_SIZE,
  MIN_WORD_COUNT,
  MAX_WORD_COUNT,
  DEFAULT_WORD_COUNT,
} from "./logic.ts";

describe("runTool — happy path", () => {
  it("builds a brief for a minimal topic-only input", () => {
    const res = runTool({ topic: "email marketing" });
    assert.equal(res.ok, true);
    assert.ok(res.values);
    const v: Record<string, unknown> = res.values;
    assert.equal(typeof v.briefMarkdown, "string");
    assert.ok((v.briefMarkdown as string).includes("email marketing"));
    assert.ok(Array.isArray(v.sections));
  });

  it("uses the default word count of 1500 when omitted", () => {
    const res = runTool({ topic: "email marketing" });
    assert.equal(res.ok, true);
    assert.ok(
      (res.values!.briefMarkdown as string).includes(
        `Target word count: ${DEFAULT_WORD_COUNT}`,
      ),
    );
  });

  it("includes keyword, audience, and custom word count in the brief", () => {
    const res = runTool({
      topic: "email marketing",
      targetKeyword: "email marketing tips",
      wordCount: 2500,
      audience: "small business owners",
    });
    assert.equal(res.ok, true);
    const md = res.values!.briefMarkdown as string;
    assert.ok(md.includes("email marketing tips"));
    assert.ok(md.includes("small business owners"));
    assert.ok(md.includes("Target word count: 2500"));
  });

  it("labels the brief as template-assembled, not AI", () => {
    const res = runTool({ topic: "email marketing" });
    assert.equal(res.ok, true);
    assert.ok(
      (res.values!.briefMarkdown as string).includes("not AI-generated"),
    );
  });
});

describe("runTool — validation", () => {
  it("rejects a missing topic", () => {
    const res = runTool({});
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects an empty topic", () => {
    const res = runTool({ topic: "   " });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects a one-character topic", () => {
    const res = runTool({ topic: "x" });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects an over-long topic", () => {
    const res = runTool({ topic: "a".repeat(151) });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects a word count below the minimum", () => {
    const res = runTool({ topic: "email marketing", wordCount: 299 });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects a word count above the maximum", () => {
    const res = runTool({ topic: "email marketing", wordCount: 10001 });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects a non-integer word count", () => {
    const res = runTool({ topic: "email marketing", wordCount: 1500.5 });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("accepts the boundary word counts", () => {
    assert.equal(runTool({ topic: "email marketing", wordCount: MIN_WORD_COUNT }).ok, true);
    assert.equal(runTool({ topic: "email marketing", wordCount: MAX_WORD_COUNT }).ok, true);
  });

  it("rejects an over-long target keyword", () => {
    const res = runTool({ topic: "email marketing", targetKeyword: "k".repeat(101) });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects an over-long audience", () => {
    const res = runTool({ topic: "email marketing", audience: "a".repeat(101) });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });
});

describe("section selection and word allocation", () => {
  it("uses 6 sections for a short brief (300-800 words)", () => {
    const res = buildBrief({ topic: "email marketing", wordCount: 600 });
    assert.equal(res.sections.length, 6);
  });

  it("uses 9 sections for a medium brief (801-2000 words)", () => {
    const res = buildBrief({ topic: "email marketing", wordCount: 1500 });
    assert.equal(res.sections.length, 9);
  });

  it("uses 12 sections for a long brief (2001+ words)", () => {
    const res = buildBrief({ topic: "email marketing", wordCount: 5000 });
    assert.equal(res.sections.length, 12);
  });

  it("always starts with the intro and ends with the conclusion", () => {
    for (const wc of [400, 1500, 5000]) {
      const res = buildBrief({ topic: "email marketing", wordCount: wc });
      assert.ok(res.sections[0].startsWith("Introduction:"));
      assert.ok(res.sections[res.sections.length - 1].startsWith("Conclusion:"));
    }
  });

  it("word targets sum exactly to the requested word count", () => {
    for (const wc of [300, 800, 1500, 10000]) {
      const res = buildBrief({ topic: "email marketing", wordCount: wc });
      const total = res.sections
        .map((s) => Number(s.match(/~(\d+) words/)![1]))
        .reduce((a, b) => a + b, 0);
      assert.equal(total, wc, `word targets sum to ${wc}`);
    }
  });

  it("allocateWords keeps every non-final section at >= 50 words", () => {
    const sections = allocateWords([0, 1, 2, 3, 4, 12], 300);
    for (const s of sections.slice(0, -1)) assert.ok(s.wordTarget >= 50);
  });

  it("documents the fixed bank size honestly", () => {
    assert.equal(SECTION_BANK_SIZE, 14);
    assert.equal(SECTION_BANK.length, SECTION_BANK_SIZE);
  });
});

describe("intent heuristic", () => {
  it("guesses transactional for buying language", () => {
    assert.ok(guessIntent("buy running shoes").startsWith("transactional"));
  });

  it("guesses commercial for comparison language", () => {
    assert.ok(guessIntent("best laptop vs desktop").startsWith("commercial"));
  });

  it("defaults to informational otherwise", () => {
    assert.ok(guessIntent("how to bake bread").startsWith("informational"));
  });

  it("labels every guess as a heuristic", () => {
    assert.ok(guessIntent("gardening tips").includes("heuristic"));
  });
});

describe("edge cases and determinism", () => {
  it("handles a unicode topic", () => {
    const res = runTool({ topic: "café marketing 日本語" });
    assert.equal(res.ok, true);
    assert.ok((res.values!.briefMarkdown as string).includes("café marketing 日本語"));
  });

  it("is deterministic: same input twice gives identical output", () => {
    const a = runTool({
      topic: "email marketing",
      targetKeyword: "email tips",
      wordCount: 1800,
      audience: "founders",
    });
    const b = runTool({
      topic: "email marketing",
      targetKeyword: "email tips",
      wordCount: 1800,
      audience: "founders",
    });
    assert.deepEqual(a, b);
  });

  it("trims whitespace from the topic", () => {
    const res = runTool({ topic: "   email marketing   " });
    assert.equal(res.ok, true);
    assert.ok((res.values!.briefMarkdown as string).includes("# Content Brief: email marketing\n"));
  });

  it("output ids match the spec: briefMarkdown + sections", () => {
    const res = runTool({ topic: "email marketing" });
    assert.equal(res.ok, true);
    assert.deepEqual(Object.keys(res.values!).sort(), ["briefMarkdown", "sections"]);
  });
});
