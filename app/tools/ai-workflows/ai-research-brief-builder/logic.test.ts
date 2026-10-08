import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  SUB_QUESTIONS,
  VERIFICATION_STEPS,
  DEFAULT_SOURCES,
  DEFAULT_DEPTH,
  DEPTHS,
  MAX_ITEMS,
} from "./logic.ts";

function briefItems(question = "Are standing desks worth it?", extra: Record<string, unknown> = {}) {
  return { items: [{ researchQuestion: question, depth: "deep", sourceType: "Industry publications", ...extra }] };
}

describe("ai-research-brief-builder", () => {
  it("happy path: deep brief with a source row", () => {
    const r = runTool(briefItems());
    assert.equal(r.ok, true);
    const brief = r.values?.brief as string;
    assert.ok(brief.includes("Are standing desks worth it?"));
    assert.ok(brief.includes("## Sub-questions to answer"));
    assert.ok(brief.includes("## Source checklist"));
    assert.ok(brief.includes("## Verification steps"));
    assert.ok(brief.includes("Industry publications"));
    assert.equal((r.values?.subQuestions as string[]).length, 8);
    assert.equal((r.values?.verification as string[]).length, 7);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(briefItems());
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), ["brief", "subQuestions", "verification"]);
  });

  it("empty items -> error", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
  });

  it(`more than ${MAX_ITEMS} rows -> error`, () => {
    const items = Array.from({ length: MAX_ITEMS + 1 }, () => ({ researchQuestion: "Q?" }));
    const r = runTool({ items });
    assert.equal(r.ok, false);
  });

  it("missing research question -> error", () => {
    const r = runTool({ items: [{ depth: "quick" }, { sourceType: "News" }] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /research question/i);
  });

  it("invalid depth -> error listing the allowed values", () => {
    const r = runTool({ items: [{ researchQuestion: "Q?", depth: "extreme" }] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /quick, standard, deep/);
  });

  it("blank depth defaults to standard", () => {
    const r = runTool({ items: [{ researchQuestion: "Q?" }] });
    assert.equal(r.ok, true);
    assert.equal((r.values?.subQuestions as string[]).length, 6);
    assert.equal((r.values?.verification as string[]).length, 5);
    assert.equal(DEFAULT_DEPTH, "standard");
  });

  it("depth is case-insensitive", () => {
    const r = runTool({ items: [{ researchQuestion: "Q?", depth: "Quick" }] });
    assert.equal(r.ok, true);
    assert.equal((r.values?.subQuestions as string[]).length, 4);
  });

  it("no source rows -> suggested default sources, labeled as suggestions", () => {
    const r = runTool({ items: [{ researchQuestion: "Q?", depth: "quick" }] });
    assert.equal(r.ok, true);
    const brief = r.values?.brief as string;
    for (const s of DEFAULT_SOURCES) {
      assert.ok(brief.includes(s), `brief should list default source: ${s}`);
    }
    assert.ok(brief.includes("Suggested starting points"));
  });

  it("duplicate source types are removed, order preserved", () => {
    const r = runTool({
      items: [
        { researchQuestion: "Q?" },
        { sourceType: "News coverage" },
        { sourceType: "News coverage" },
        { sourceType: "Expert interviews" },
      ],
    });
    assert.equal(r.ok, true);
    const brief = r.values?.brief as string;
    assert.equal(brief.split("- [ ] News coverage").length - 1, 1);
    assert.ok(brief.indexOf("News coverage") < brief.indexOf("Expert interviews"));
  });

  it("quick depth bank sizes: 4 sub-questions, 3 verification steps", () => {
    assert.equal(SUB_QUESTIONS.quick.length, 4);
    assert.equal(VERIFICATION_STEPS.quick.length, 3);
    const r = runTool({ items: [{ researchQuestion: "Q?", depth: "quick" }] });
    assert.equal((r.values?.subQuestions as string[]).length, 4);
    assert.equal((r.values?.verification as string[]).length, 3);
  });

  it("standard depth bank sizes: 6 sub-questions, 5 verification steps", () => {
    assert.equal(SUB_QUESTIONS.standard.length, 6);
    assert.equal(VERIFICATION_STEPS.standard.length, 5);
  });

  it("deep depth bank sizes: 8 sub-questions, 7 verification steps", () => {
    assert.equal(SUB_QUESTIONS.deep.length, 8);
    assert.equal(VERIFICATION_STEPS.deep.length, 7);
  });

  it("[QUESTION] is substituted — no raw placeholder left", () => {
    const r = runTool(briefItems("Do standing desks help posture?"));
    assert.equal(r.ok, true);
    const brief = r.values?.brief as string;
    assert.ok(brief.includes("Do standing desks help posture?"));
    assert.ok(!brief.includes("[QUESTION]"));
  });

  it("honesty footer: no research performed, no sources cited", () => {
    const r = runTool(briefItems());
    assert.equal(r.ok, true);
    const brief = r.values?.brief as string;
    assert.ok(brief.includes("performs no research and cites no sources"));
  });

  it("DEPTHS lists the three allowed values", () => {
    assert.deepEqual(DEPTHS, ["quick", "standard", "deep"]);
  });

  it("deterministic: same items -> identical output", () => {
    const args = briefItems();
    const a = runTool(args);
    const b = runTool(args);
    assert.deepEqual(a, b);
  });
});
