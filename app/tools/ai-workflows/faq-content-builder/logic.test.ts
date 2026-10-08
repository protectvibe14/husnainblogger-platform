import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, MIN_QUESTIONS, MAX_QUESTIONS, ANSWER_PLACEHOLDER } from "./logic.ts";

function qa(question: string, answer = ""): Record<string, unknown> {
  return { question, answer };
}

describe("faq-content-builder", () => {
  it("happy path: 2 questions -> lines + html + markdown", () => {
    const res = runTool({
      items: [qa("What is SEO?", "Search engine optimization."), qa("Is it free?", "Yes.")],
    });
    assert.equal(res.ok, true);
    const values = res.values!;
    assert.ok(values.lines.length > 2);
    assert.ok(values.lines[0] === "{");
    assert.ok(values.lines.join("\n").includes('"@context": "https://schema.org"'));
    assert.ok(values.html.includes("<h3>What is SEO?</h3>"));
    assert.ok(values.html.includes("<p>Search engine optimization.</p>"));
    assert.ok(values.markdown.includes("### What is SEO?"));
    assert.ok(values.markdown.includes("Search engine optimization."));
  });

  it("output ids match meta.ts outputs (lines, html, markdown)", () => {
    const res = runTool({ items: [qa("Q1", "A1"), qa("Q2", "A2")] });
    assert.deepEqual(Object.keys(res.values!).sort(), ["html", "lines", "markdown"]);
  });

  it("JSON-LD lines parse back to a valid FAQPage object", () => {
    const res = runTool({ items: [qa("Q1?", "A1."), qa("Q2?", "A2.")] });
    const parsed = JSON.parse(res.values!.lines.join("\n"));
    assert.equal(parsed["@type"], "FAQPage");
    assert.equal(parsed["@context"], "https://schema.org");
    assert.equal(parsed.mainEntity.length, 2);
    assert.equal(parsed.mainEntity[0]["@type"], "Question");
    assert.equal(parsed.mainEntity[0].name, "Q1?");
    assert.equal(parsed.mainEntity[0].acceptedAnswer["@type"], "Answer");
    assert.equal(parsed.mainEntity[0].acceptedAnswer.text, "A1.");
  });

  it("blank answer becomes a labeled fill-in slot (never invented)", () => {
    const res = runTool({ items: [qa("Q1?"), qa("Q2?", "  ")] });
    assert.equal(res.ok, true);
    assert.ok(res.values!.html.includes(ANSWER_PLACEHOLDER));
    assert.ok(res.values!.markdown.includes(ANSWER_PLACEHOLDER));
    const parsed = JSON.parse(res.values!.lines.join("\n"));
    assert.equal(parsed.mainEntity[0].acceptedAnswer.text, ANSWER_PLACEHOLDER);
  });

  it("fewer than 2 questions fails", () => {
    const res = runTool({ items: [qa("Only one?")] });
    assert.equal(res.ok, false);
    assert.match(res.error!, new RegExp(`at least ${MIN_QUESTIONS} questions`));
  });

  it("empty items fails", () => {
    const res = runTool({ items: [] });
    assert.equal(res.ok, false);
  });

  it("missing items arg fails", () => {
    const res = runTool({} as { items: Record<string, unknown>[] });
    assert.equal(res.ok, false);
  });

  it("exactly 20 questions allowed", () => {
    const items = Array.from({ length: MAX_QUESTIONS }, (_, i) => qa(`Q${i + 1}?`, `A${i + 1}.`));
    const res = runTool({ items });
    assert.equal(res.ok, true);
    const parsed = JSON.parse(res.values!.lines.join("\n"));
    assert.equal(parsed.mainEntity.length, 20);
  });

  it("21 questions rejected (spec cap)", () => {
    const items = Array.from({ length: MAX_QUESTIONS + 1 }, (_, i) => qa(`Q${i + 1}?`, `A${i + 1}.`));
    const res = runTool({ items });
    assert.equal(res.ok, false);
    assert.match(res.error!, /at most 20 questions/);
  });

  it("blank question fails with item number", () => {
    const res = runTool({ items: [qa("Q1?", "A1."), qa("   ", "A2.")] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 2: Question is required/);
  });

  it("non-object row fails with item number", () => {
    const res = runTool({ items: [qa("Q1?", "A1."), null as unknown as Record<string, unknown>] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 2/);
  });

  it("questions keep user order", () => {
    const res = runTool({ items: [qa("Zebra?", "Z."), qa("Apple?", "A."), qa("Mango?", "M.")] });
    const parsed = JSON.parse(res.values!.lines.join("\n"));
    assert.deepEqual(parsed.mainEntity.map((e: { name: string }) => e.name), ["Zebra?", "Apple?", "Mango?"]);
  });

  it("determinism: two runs produce identical output", () => {
    const items = () => [qa("Q1?", "A1."), qa("Q2?")];
    assert.deepEqual(runTool({ items: items() }), runTool({ items: items() }));
  });

  it("HTML escapes user content (XSS-safe)", () => {
    const res = runTool({ items: [qa("<script>alert(1)</script>?", "A & B"), qa("Second?", "Yes.")] });
    assert.equal(res.ok, true);
    assert.ok(!res.values!.html.includes("<script>"));
    assert.ok(res.values!.html.includes("&lt;script&gt;"));
    assert.ok(res.values!.html.includes("A &amp; B"));
  });

  it("JSON-LD safely encodes quotes and backslashes", () => {
    const res = runTool({ items: [qa('What is "SEO" \\ really?', 'It\'s "great".'), qa("Q2?", "A2.")] });
    const parsed = JSON.parse(res.values!.lines.join("\n"));
    assert.equal(parsed.mainEntity[0].name, 'What is "SEO" \\ really?');
    assert.equal(parsed.mainEntity[0].acceptedAnswer.text, 'It\'s "great".');
  });

  it("whitespace trimmed from questions and answers", () => {
    const res = runTool({ items: [qa("  Q1?  ", "  A1.  "), qa("Q2?", "A2.")] });
    const parsed = JSON.parse(res.values!.lines.join("\n"));
    assert.equal(parsed.mainEntity[0].name, "Q1?");
    assert.equal(parsed.mainEntity[0].acceptedAnswer.text, "A1.");
  });

  it("markdown block uses h3 headings per question", () => {
    const res = runTool({ items: [qa("Q1?", "A1."), qa("Q2?", "A2.")] });
    const headings = res.values!.markdown.split("\n").filter((l) => l.startsWith("### "));
    assert.equal(headings.length, 2);
  });

  it("html block wraps each pair in a faq div", () => {
    const res = runTool({ items: [qa("Q1?", "A1."), qa("Q2?", "A2."), qa("Q3?", "A3.")] });
    assert.equal((res.values!.html.match(/<div class="faq">/g) ?? []).length, 3);
  });
});
