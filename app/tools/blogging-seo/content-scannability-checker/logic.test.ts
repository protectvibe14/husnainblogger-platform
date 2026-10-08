import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  splitSentences,
  MAX_CONTENT_CHARS,
  MIN_WORDS,
} from "./logic.ts";

const PERFECT = `# How to Water Houseplants

Watering houseplants is simple once you learn the basics. Most plants like a steady routine.

## Check the soil first

Stick your finger into the soil. If the top inch feels dry, it is time to water. If it feels damp, wait a day.

## Water thoroughly

- Pour water slowly at the base.
- Let excess water drain out.
- Empty the saucer after ten minutes.

## Watch the leaves

Yellow leaves often mean too much water. Brown tips often mean too little. Adjust your routine and watch for change.

## Feed lightly in spring

Most houseplants need very little fertilizer. Feed once a month in spring and summer, and skip feeding in winter.`;

function okValues(input: Record<string, unknown>) {
  const r = runTool(input);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

describe("content-scannability-checker", () => {
  it("happy path: well-structured content scores 100 / A", () => {
    const v = okValues({ content: PERFECT });
    assert.equal(v.score, 100);
    assert.equal(v.grade, "A");
    const checks = v.checks as string[];
    assert.ok(checks.every((c) => c.startsWith("PASS")));
    assert.deepEqual(v.recommendations, []);
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues({ content: PERFECT });
    assert.deepEqual(Object.keys(v).sort(), [
      "checks",
      "grade",
      "recommendations",
      "score",
    ]);
  });

  it("empty content rejected", () => {
    const r = runTool({ content: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /paste/i);
  });

  it("whitespace-only content rejected", () => {
    const r = runTool({ content: "   \n\n  " });
    assert.equal(r.ok, false);
  });

  it("non-string content rejected", () => {
    const r = runTool({ content: 42 });
    assert.equal(r.ok, false);
  });

  it("missing content rejected", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });

  it(`content over ${MAX_CONTENT_CHARS} chars rejected`, () => {
    const r = runTool({ content: "x ".repeat(MAX_CONTENT_CHARS) });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /characters or fewer/);
  });

  it("no headings: -20 and a recommendation", () => {
    const content =
      "This is a plain paragraph with enough words to pass the length check comfortably. ".repeat(8) +
      "\n\n- one\n- two\n- three\n";
    const v = okValues({ content });
    // -20 no headings only (two paragraphs: avg 59 words, longest 112)
    assert.equal(v.score, 80);
    assert.equal(v.grade, "B");
    const checks = v.checks as string[];
    assert.ok(checks.some((c) => c.includes("Headings: none")));
    assert.ok(
      (v.recommendations as string[]).some((rec) => rec.includes("subheading")),
    );
  });

  it("single huge paragraph: long + dense deductions", () => {
    const content = "Word ".repeat(400).trim(); // 400 words, one paragraph, one sentence
    const v = okValues({ content });
    // -20 no headings, -15 long paragraph, -10 dense paragraphs, -10 no lists, -10 long sentences
    assert.equal(v.score, 35);
    assert.equal(v.grade, "F");
  });

  it("short content: -15", () => {
    const v = okValues({ content: "# Title\n\nShort post here with a list:\n\n- a\n- b\n" });
    const checks = v.checks as string[];
    assert.ok(checks.some((c) => c.includes("−15") || c.includes("-15") || c.includes("under 100")));
    assert.ok((v.score as number) <= 85);
  });

  it("no lists: -10", () => {
    const paras = Array.from(
      { length: 12 },
      (_, i) => `## Section ${i + 1}\n\nThis is a short paragraph with simple words for testing purposes.`,
    ).join("\n\n");
    const v = okValues({ content: paras });
    assert.equal(v.score, 90);
    const checks = v.checks as string[];
    assert.ok(checks.some((c) => c.includes("Lists: none")));
  });

  it("long average sentence: -10", () => {
    const sentence =
      "This is an extremely long and winding sentence that keeps going with many additional clauses and descriptive phrases so that the average sentence length grows well beyond the warning threshold for sure. ";
    const v = okValues({ content: "# H\n\n" + sentence.repeat(10) + "\n\n- a\n- b\n" });
    assert.ok((v.score as number) <= 90);
    const checks = v.checks as string[];
    assert.ok(checks.some((c) => c.includes("Average sentence")));
  });

  it("sparse headings: -10 when under 1 per 300 words", () => {
    const body = "Simple filler sentence with common words. ".repeat(90); // ~630 words
    const v = okValues({ content: "# Only heading\n\n" + body + "\n\n- a\n- b\n" });
    const checks = v.checks as string[];
    assert.ok(checks.some((c) => c.includes("Heading density")));
    assert.ok((v.score as number) <= 90);
  });

  it("markdown vs plain text: same words, headings decide the -20", () => {
    const words = "Simple words here. ".repeat(40);
    const withH = okValues({ content: "# Head\n\n" + words + "\n\n- a\n- b\n" });
    const plain = okValues({ content: words + "\n\n- a\n- b\n" });
    assert.equal((withH.score as number) - (plain.score as number), 20);
  });

  it("HTML <h2> headings are counted", () => {
    const v = okValues({
      content: "<h2>Intro</h2>\n\n" + "Simple words here. ".repeat(40) + "\n\n- a\n- b\n",
    });
    const checks = v.checks as string[];
    assert.ok(!checks.some((c) => c.includes("Headings: none")));
  });

  it("unicode content works", () => {
    const v = okValues({ content: "# Ünïcodé héadíng 😋\n\nCafé naïve résumé. ".repeat(30) + "\n\n- één\n- twee\n" });
    assert.equal(typeof v.score, "number");
    assert.ok((v.score as number) >= 0 && (v.score as number) <= 100);
  });

  it("no terminal punctuation: treated as one sentence, no crash", () => {
    const v = okValues({
      content: "# H\n\nThis text has no terminal punctuation at all just words flowing on",
    });
    assert.equal(typeof v.score, "number");
  });

  it("score is always within 0-100 even for worst content", () => {
    const v = okValues({ content: "x" });
    assert.ok((v.score as number) >= 0 && (v.score as number) <= 100);
    // -15 short, -20 no headings, -10 no lists = 55 -> D
    assert.equal(v.score, 55);
    assert.equal(v.grade, "D");
  });

  it("grade bands: 90 -> A, 80 -> B", () => {
    // 90: only the -10 no-lists deduction (see "no lists" test)
    const paras = Array.from(
      { length: 12 },
      (_, i) => `## Section ${i + 1}\n\nThis is a short paragraph with simple words for testing purposes.`,
    ).join("\n\n");
    const v = okValues({ content: paras });
    assert.equal(v.score, 90);
    assert.equal(v.grade, "A");
  });

  it("every FAIL check has exactly one matching recommendation", () => {
    const v = okValues({ content: "tiny" });
    const checks = v.checks as string[];
    const fails = checks.filter((c) => c.startsWith("FAIL"));
    assert.ok(fails.length > 0);
    assert.equal(fails.length, (v.recommendations as string[]).length);
    // all FAILs come before all PASSes
    const passIdx = checks
      .map((c, i) => (c.startsWith("PASS") ? i : -1))
      .filter((i) => i >= 0);
    const failIdx = checks
      .map((c, i) => (c.startsWith("FAIL") ? i : -1))
      .filter((i) => i >= 0);
    assert.ok(Math.max(...failIdx) < Math.min(...passIdx));
  });

  it("splitSentences protects abbreviations", () => {
    const s = splitSentences("Mr. Smith went home. He ate e.g. cake. Done.");
    assert.equal(s.length, 3);
  });

  it("deterministic: same inputs give identical output twice", () => {
    const input = { content: PERFECT };
    assert.deepEqual(runTool(input), runTool(input));
  });

  it("MIN_WORDS constant matches spec", () => {
    assert.equal(MIN_WORDS, 100);
  });
});
