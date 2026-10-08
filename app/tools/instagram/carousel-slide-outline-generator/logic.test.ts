import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateOutline,
  CAROUSEL_GOALS,
  BANK_SIZES,
  MIN_SLIDES,
  MAX_SLIDES,
} from "./logic.ts";

describe("carousel-slide-outline-generator", () => {
  it("happy path: 5 educate slides with hook/value/proof/cta roles", () => {
    const r = runTool({ topic: "email marketing", slideCount: 5, goal: "educate" });
    assert.equal(r.ok, true);
    const outline = r.values!.outline as { columns: string[]; rows: string[][] };
    assert.deepEqual(outline.columns, ["Slide", "Role", "Text", "Visual note"]);
    assert.equal(outline.rows.length, 5);
    const roles = outline.rows.map((row) => row[1]);
    assert.deepEqual(roles, ["hook", "value", "value", "proof", "cta"]);
  });

  it("output ids are outline and copyAll", () => {
    const r = runTool({ topic: "x", slideCount: 4, goal: "sell" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["copyAll", "outline"]);
  });

  it("3 slides: hook -> value -> cta (no proof)", () => {
    const r = generateOutline("fitness", "grow", 3);
    assert.deepEqual(r.slides.map((s) => s.role), ["hook", "value", "cta"]);
  });

  it("10 slides: one hook, one proof (second-to-last), one cta", () => {
    const r = generateOutline("fitness", "engage", 10);
    assert.equal(r.slides.length, 10);
    assert.equal(r.slides[0].role, "hook");
    assert.equal(r.slides[8].role, "proof");
    assert.equal(r.slides[9].role, "cta");
    assert.ok(r.slides.slice(1, 8).every((s) => s.role === "value"));
  });

  it("all four goals produce valid outlines with topic filled in", () => {
    for (const goal of CAROUSEL_GOALS) {
      const r = generateOutline("meal prep", goal, 6);
      assert.equal(r.goal, goal);
      for (const s of r.slides) {
        assert.ok(!s.text.includes("{topic}"), `unfilled slot in ${goal}`);
      }
      // the topic appears in the outline (hooks/values carry it)
      assert.ok(r.slides.some((s) => s.text.includes("meal prep")), `topic missing in ${goal}`);
    }
  });

  it("slide count 15 clamps to 10 with a note in copyAll", () => {
    const r = runTool({ topic: "x", slideCount: 15, goal: "educate" });
    assert.equal(r.ok, true);
    assert.equal((r.values!.outline as { rows: string[][] }).rows.length, 10);
    assert.match(r.values!.copyAll as string, /clamped to 10/);
    assert.match(r.values!.copyAll as string, /requested 15 slides/);
  });

  it("slide count 25 also clamps to 10 with a note", () => {
    const r = generateOutline("x", "sell", 25);
    assert.equal(r.clamped, true);
    assert.equal(r.slideCount, 10);
  });

  it("slide count 2 -> error", () => {
    const r = runTool({ topic: "x", slideCount: 2, goal: "educate" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least 3/);
  });

  it("non-numeric slide count -> error", () => {
    const r = runTool({ topic: "x", slideCount: "many", goal: "educate" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("missing topic -> error", () => {
    const r = runTool({ slideCount: 5, goal: "educate" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Topic is required/);
  });

  it("invalid goal -> error listing goals", () => {
    const r = runTool({ topic: "x", slideCount: 5, goal: "viral" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /educate, sell, grow, engage/);
  });

  it("missing goal defaults to educate", () => {
    const r = runTool({ topic: "x", slideCount: 4 });
    assert.equal(r.ok, true);
    assert.match(r.values!.copyAll as string, /goal: educate/);
  });

  it("value slides cycle in bank order with {i} numbering", () => {
    const r = generateOutline("yoga", "educate", 8);
    const values = r.slides.filter((s) => s.role === "value");
    assert.equal(values.length, 5); // 8 - hook - proof - cta
    assert.ok(values[0].text.includes("Point 1:"));
    assert.ok(values[1].text.includes("Point 2:"));
  });

  it("no duplicate slide texts within one outline", () => {
    const r = generateOutline("finance", "grow", 10);
    const texts = r.slides.map((s) => s.text);
    assert.equal(new Set(texts).size, texts.length);
  });

  it("deterministic: same inputs twice -> identical outline", () => {
    const a = runTool({ topic: "email marketing", slideCount: 6, goal: "sell" });
    const b = runTool({ topic: "email marketing", slideCount: 6, goal: "sell" });
    assert.deepEqual(a, b);
  });

  it("copyAll contains every slide text and the honesty line", () => {
    const r = generateOutline("dogs", "grow", 4);
    for (const s of r.slides) assert.ok(r.copyAll.includes(s.text));
    assert.match(r.copyAll, /76 hand-written slide templates/);
  });

  it("BANK_SIZES documents 76 templates honestly", () => {
    assert.equal(BANK_SIZES.total, 76);
    assert.equal(BANK_SIZES.perGoal, 19);
    assert.equal(BANK_SIZES.goals, 4);
  });

  it("constants match the spec bounds", () => {
    assert.equal(MIN_SLIDES, 3);
    assert.equal(MAX_SLIDES, 10);
    assert.deepEqual(CAROUSEL_GOALS, ["educate", "sell", "grow", "engage"]);
  });

  it("result carries isTemplateBased: true", () => {
    assert.equal(generateOutline("x", "educate", 3).isTemplateBased, true);
  });
});
