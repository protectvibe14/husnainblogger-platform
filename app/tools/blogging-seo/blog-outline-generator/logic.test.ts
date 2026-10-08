/**
 * Tests for the Blog Outline Generator pure logic (tool-032).
 *
 * Run: node --test app/tools/blogging-seo/blog-outline-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildOutline,
  topicFromTitle,
  INTRO_BANK,
  BODY_BANK,
  SUBPOINT_BANK,
  CLOSER_BANK,
  INTRO_BANK_SIZE,
  BODY_BANK_SIZE,
  SUBPOINT_BANK_SIZE,
  CLOSER_BANK_SIZE,
  DEFAULT_DEPTH,
} from "./logic.ts";

describe("runTool — happy path", () => {
  it("builds a standard outline for a title-only input", () => {
    const res = runTool({ title: "How to Start a Garden" });
    assert.equal(res.ok, true);
    assert.ok(res.values);
    assert.equal(typeof res.values.outlineMarkdown, "string");
    assert.equal(typeof res.values.headingCount, "number");
  });

  it("defaults to standard depth (20 headings)", () => {
    const res = runTool({ title: "How to Start a Garden" });
    assert.equal(res.ok, true);
    assert.equal(res.values!.headingCount, 20);
    assert.equal(DEFAULT_DEPTH, "standard");
  });

  it("includes the target keyword line when a keyword is given", () => {
    const res = runTool({ title: "How to Start a Garden", targetKeyword: "start a garden" });
    assert.equal(res.ok, true);
    assert.ok((res.values!.outlineMarkdown as string).includes("Target keyword: start a garden"));
  });

  it("labels the outline as template-assembled, not AI", () => {
    const res = runTool({ title: "How to Start a Garden" });
    assert.ok((res.values!.outlineMarkdown as string).includes("not AI-generated"));
  });
});

describe("runTool — depth selection", () => {
  it("basic depth yields 10 headings", () => {
    const res = runTool({ title: "How to Start a Garden", depth: "basic" });
    assert.equal(res.ok, true);
    assert.equal(res.values!.headingCount, 10);
  });

  it("standard depth yields 20 headings", () => {
    const res = runTool({ title: "How to Start a Garden", depth: "standard" });
    assert.equal(res.ok, true);
    assert.equal(res.values!.headingCount, 20);
  });

  it("deep depth yields 42 headings", () => {
    const res = runTool({ title: "How to Start a Garden", depth: "deep" });
    assert.equal(res.ok, true);
    assert.equal(res.values!.headingCount, 42);
  });

  it("rejects an invalid depth", () => {
    const res = runTool({ title: "How to Start a Garden", depth: "extreme" });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });
});

describe("runTool — validation", () => {
  it("rejects a missing title", () => {
    assert.equal(runTool({}).ok, false);
  });

  it("rejects a blank title", () => {
    assert.equal(runTool({ title: "  " }).ok, false);
  });

  it("rejects a one-character title", () => {
    assert.equal(runTool({ title: "x" }).ok, false);
  });

  it("rejects an over-long title", () => {
    assert.equal(runTool({ title: "t".repeat(151) }).ok, false);
  });

  it("accepts a 150-character title", () => {
    assert.equal(runTool({ title: "t".repeat(150) }).ok, true);
  });

  it("rejects an over-long target keyword", () => {
    assert.equal(runTool({ title: "Gardening", targetKeyword: "k".repeat(101) }).ok, false);
  });

  it("rejects a non-string depth-adjacent garbage title", () => {
    assert.equal(runTool({ title: 123 }).ok, false);
  });
});

describe("outline structure", () => {
  it("starts with an intro H2 and ends with a conclusion H2", () => {
    const headings = buildOutline("How to Start a Garden", "", "standard");
    assert.equal(headings[0].level, 2);
    assert.ok(headings[0].text.startsWith("Introduction:"));
    const last = headings[headings.length - 1];
    assert.equal(last.level, 2);
    assert.ok(last.text.startsWith("Conclusion:"));
  });

  it("uses only H2 and H3 levels, H3s nested under body H2s", () => {
    const headings = buildOutline("How to Start a Garden", "", "deep");
    for (const h of headings) assert.ok(h.level === 2 || h.level === 3);
    // deep: 1 intro + 10*(1 H2 + 3 H3) + 1 closer = 42
    assert.equal(headings.filter((h) => h.level === 3).length, 30);
  });

  it("fills the topic into body headings", () => {
    const headings = buildOutline("How to Start a Garden", "", "basic");
    assert.ok(headings.some((h) => h.text.includes("a Garden")));
  });

  it("derives a clean topic phrase from the title", () => {
    assert.equal(topicFromTitle("How to Start a Garden"), "Start a Garden");
    assert.equal(topicFromTitle("The Ultimate Guide to SEO: Part 1"), "SEO");
    assert.equal(topicFromTitle("Gardening"), "Gardening");
  });

  it("bank sizes are documented and match the arrays", () => {
    assert.equal(INTRO_BANK_SIZE, 4);
    assert.equal(BODY_BANK_SIZE, 10);
    assert.equal(SUBPOINT_BANK_SIZE, 6);
    assert.equal(CLOSER_BANK_SIZE, 3);
    assert.equal(INTRO_BANK.length, INTRO_BANK_SIZE);
    assert.equal(BODY_BANK.length, BODY_BANK_SIZE);
    assert.equal(SUBPOINT_BANK.length, SUBPOINT_BANK_SIZE);
    assert.equal(CLOSER_BANK.length, CLOSER_BANK_SIZE);
  });
});

describe("edge cases and determinism", () => {
  it("handles a unicode title", () => {
    const res = runTool({ title: "Café Culture: 日本語 Guide" });
    assert.equal(res.ok, true);
    assert.ok((res.values!.outlineMarkdown as string).includes("# Café Culture: 日本語 Guide"));
  });

  it("is deterministic: same input twice gives identical output", () => {
    const a = runTool({ title: "How to Start a Garden", targetKeyword: "garden", depth: "deep" });
    const b = runTool({ title: "How to Start a Garden", targetKeyword: "garden", depth: "deep" });
    assert.deepEqual(a, b);
  });

  it("markdown starts with the H1 title", () => {
    const res = runTool({ title: "How to Start a Garden" });
    assert.ok((res.values!.outlineMarkdown as string).startsWith("# How to Start a Garden\n"));
  });

  it("output ids match the spec: outlineMarkdown + headingCount", () => {
    const res = runTool({ title: "How to Start a Garden" });
    assert.deepEqual(Object.keys(res.values!).sort(), ["headingCount", "outlineMarkdown"]);
  });
});
