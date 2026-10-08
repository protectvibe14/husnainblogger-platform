import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  parsePairsText,
  buildFaqSchema,
  validatePair,
  MAX_PAIRS,
  MAX_QUESTION_CHARS,
  MAX_ANSWER_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues() {
  return {
    pairs: [
      { question: "What is SEO?", answer: "Search engine optimization." },
      { question: "Why does SEO matter?", answer: "It drives organic traffic." },
    ],
  };
}

describe("faq-schema-generator", () => {
  it("happy path: 2 pairs -> valid FAQPage JSON-LD", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.equal(r.error, undefined);
    const jsonLd = r.values?.jsonLd as string;
    assert.equal(typeof jsonLd, "string");
    const parsed = JSON.parse(jsonLd);
    assert.equal(parsed["@context"], "https://schema.org");
    assert.equal(parsed["@type"], "FAQPage");
    assert.equal(parsed.mainEntity.length, 2);
    assert.equal(parsed.mainEntity[0]["@type"], "Question");
    assert.equal(parsed.mainEntity[0].name, "What is SEO?");
    assert.equal(parsed.mainEntity[0].acceptedAnswer["@type"], "Answer");
    assert.equal(parsed.mainEntity[0].acceptedAnswer.text, "Search engine optimization.");
    assert.deepEqual(r.values?.errors, []);
    assert.equal(r.values?.pairCount, 2);
  });

  it("accepts the textarea format (blank-line-separated blocks)", () => {
    const r = runTool({
      pairs: "What is SEO?\nSearch engine optimization.\n\nHow long does it take?\nA few months.",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values?.pairCount, 2);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.mainEntity[0].name, "What is SEO?");
    assert.equal(parsed.mainEntity[1].acceptedAnswer.text, "A few months.");
  });

  it("trims whitespace around questions and answers", () => {
    const r = runTool({ pairs: [{ question: "  Q?  ", answer: "  A.  " }] });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.mainEntity[0].name, "Q?");
    assert.equal(parsed.mainEntity[0].acceptedAnswer.text, "A.");
  });

  it("multi-line answers are preserved", () => {
    const r = runTool({
      pairs: "Line one?\nFirst line.\nSecond line.",
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.mainEntity[0].acceptedAnswer.text, "First line.\nSecond line.");
  });

  it("missing pairs -> ok:false", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok(typeof r.error === "string" && r.error.length > 0);
  });

  it("empty string -> ok:false", () => {
    const r = runTool({ pairs: "   " });
    assert.equal(r.ok, false);
  });

  it("empty array -> ok:false", () => {
    const r = runTool({ pairs: [] });
    assert.equal(r.ok, false);
  });

  it("non-object values -> ok:false", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("over max pairs -> ok:false with guidance", () => {
    const pairs = Array.from({ length: MAX_PAIRS + 1 }, (_, i) => ({
      question: `Q${i}?`,
      answer: `A${i}.`,
    }));
    const r = runTool({ pairs });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Too many pairs/);
  });

  it("exactly MAX_PAIRS pairs accepted", () => {
    const pairs = Array.from({ length: MAX_PAIRS }, (_, i) => ({
      question: `Question ${i}?`,
      answer: `Answer ${i}.`,
    }));
    const r = runTool({ pairs });
    assert.equal(r.ok, true);
    assert.equal(r.values?.pairCount, MAX_PAIRS);
  });

  it("one bad pair among good ones: skipped, reported, rest emitted", () => {
    const r = runTool({
      pairs: [
        { question: "Good?", answer: "Yes." },
        { question: "", answer: "Missing question." },
      ],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values?.pairCount, 1);
    assert.ok((r.values?.errors as string[]).length > 0);
    assert.match((r.values?.errors as string[])[0], /Pair 2/);
  });

  it("all pairs invalid -> ok:false", () => {
    const r = runTool({ pairs: [{ question: "", answer: "" }] });
    assert.equal(r.ok, false);
  });

  it("question over max chars is rejected", () => {
    const errs = validatePair({ question: "q".repeat(MAX_QUESTION_CHARS + 1), answer: "a" }, 0);
    assert.ok(errs.length > 0);
    const r = runTool({
      pairs: [{ question: "q".repeat(MAX_QUESTION_CHARS + 1), answer: "a" }],
    });
    assert.equal(r.ok, false);
  });

  it("answer over max chars is skipped with a note", () => {
    const r = runTool({
      pairs: [
        { question: "Ok?", answer: "Fine." },
        { question: "Bad?", answer: "a".repeat(MAX_ANSWER_CHARS + 1) },
      ],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values?.pairCount, 1);
    assert.ok((r.values?.errors as string[]).some((e) => /answer is \d+ chars/.test(e)));
  });

  it("duplicate questions (case-insensitive) are deduplicated", () => {
    const r = runTool({
      pairs: [
        { question: "What is SEO?", answer: "First." },
        { question: "WHAT IS seo?", answer: "Second." },
      ],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values?.pairCount, 1);
    assert.ok((r.values?.errors as string[]).some((e) => /duplicate/i.test(e)));
  });

  it("HTML in answers is kept as literal text", () => {
    const r = runTool({
      pairs: [{ question: "Tags?", answer: "<b>Bold</b> text." }],
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.mainEntity[0].acceptedAnswer.text, "<b>Bold</b> text.");
  });

  it("unicode questions and answers are preserved", () => {
    const r = runTool({
      pairs: [{ question: "Was ist SEO? 🚀", answer: "Suchmaschinenoptimierung — Grüße!" }],
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.mainEntity[0].name, "Was ist SEO? 🚀");
  });

  it("deterministic: same input -> identical output", () => {
    const a = runTool(happyValues());
    const b = runTool(happyValues());
    assert.equal(a.ok, true);
    assert.equal(b.ok, true);
    assert.deepEqual(a.values, b.values);
  });

  it("output ids match meta.ts", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}), OUTPUT_IDS);
    assert.deepEqual(OUTPUT_IDS, ["jsonLd", "errors", "pairCount"]);
  });

  it("parsePairsText ignores empty blocks", () => {
    assert.deepEqual(parsePairsText("\n\n\n"), []);
  });

  it("buildFaqSchema exposes acceptedPairs for on-page parity", () => {
    const r = buildFaqSchema([{ question: " Q? ", answer: " A. " }]);
    assert.equal(r.ok, true);
    assert.deepEqual(r.acceptedPairs, [{ question: "Q?", answer: "A." }]);
  });

  it("quotes/newlines survive JSON round-trip", () => {
    const r = runTool({ pairs: [{ question: 'She said "hi"?', answer: "Line1\nLine2" }] });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.mainEntity[0].acceptedAnswer.text, "Line1\nLine2");
  });
});
