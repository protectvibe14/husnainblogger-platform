import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateCtas,
  CTA_GOALS,
  GOAL_LABELS,
  BANK_SIZES,
  MIN_COUNT,
  MAX_COUNT,
  ASSUMPTIONS,
} from "./logic.ts";

describe("cta-text-generator", () => {
  it("happy path: 5 comment CTAs with topic inserted", () => {
    const r = runTool({ goal: "comment", topic: "meal prep", count: 5 });
    assert.equal(r.ok, true);
    const ctas = r.values!.ctas as string[];
    assert.equal(ctas.length, 5);
    for (const c of ctas) {
      assert.ok(c.includes("this meal prep post"), c);
      assert.ok(!c.includes("{thing}"), c);
    }
  });

  it("topic omitted: {thing} becomes 'this post'", () => {
    const r = runTool({ goal: "save", count: 2 });
    assert.equal(r.ok, true);
    const ctas = r.values!.ctas as string[];
    assert.ok(ctas[0].includes("this post"));
    assert.ok(!ctas.some((c) => c.includes("{thing}")));
  });

  it("blank topic string behaves like omitted topic", () => {
    const r = runTool({ goal: "share", topic: "   ", count: 1 });
    assert.equal(r.ok, true);
    assert.ok((r.values!.ctas as string[])[0].includes("this post"));
  });

  it("all six goals generate valid output", () => {
    for (const goal of CTA_GOALS) {
      const r = runTool({ goal, topic: "fitness", count: 3 });
      assert.equal(r.ok, true, `goal ${goal}`);
      assert.equal((r.values!.ctas as string[]).length, 3);
    }
  });

  it("goal is required", () => {
    const r = runTool({ topic: "x", count: 3 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /goal/i);
  });

  it("unknown goal is rejected and lists valid goals", () => {
    const r = runTool({ goal: "viral", topic: "x", count: 3 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("comment"));
    assert.ok(r.error!.includes("follow"));
  });

  it("goal is case-sensitive", () => {
    const r = runTool({ goal: "Comment", topic: "x", count: 3 });
    assert.equal(r.ok, false);
  });

  it("count below MIN is rejected", () => {
    const r = runTool({ goal: "dm", count: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 1 and 10/);
  });

  it("count above MAX is rejected", () => {
    const r = runTool({ goal: "link", count: 11 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 1 and 10/);
  });

  it("non-integer count is rejected", () => {
    const r = runTool({ goal: "follow", count: 2.5 });
    assert.equal(r.ok, false);
  });

  it("missing count defaults to 5", () => {
    const r = runTool({ goal: "comment" });
    assert.equal(r.ok, true);
    assert.equal((r.values!.ctas as string[]).length, 5);
  });

  it("count 10 cycles the 6-template bank in order", () => {
    const r = runTool({ goal: "save", topic: "x", count: 10 });
    assert.equal(r.ok, true);
    const ctas = r.values!.ctas as string[];
    assert.equal(ctas.length, 10);
    assert.equal(ctas[0], ctas[6]); // bank wraps
    assert.equal(ctas[1], ctas[7]);
  });

  it("boundary counts 1 and 10 work", () => {
    const one = runTool({ goal: "dm", count: MIN_COUNT });
    assert.equal((one.values!.ctas as string[]).length, 1);
    const ten = runTool({ goal: "dm", count: MAX_COUNT });
    assert.equal((ten.values!.ctas as string[]).length, 10);
  });

  it("copyAll joins CTAs with newlines", () => {
    const r = runTool({ goal: "link", topic: "seo", count: 3 });
    const ctas = r.values!.ctas as string[];
    assert.equal(r.values!.copyAll, ctas.join("\n"));
  });

  it("output ids match meta.ts (ctas, copyAll, bankSizes)", () => {
    const r = runTool({ goal: "follow", count: 2 });
    assert.deepEqual(Object.keys(r.values!).sort(), ["bankSizes", "copyAll", "ctas"]);
  });

  it("bank sizes documented: 6 per goal, 6 goals, 36 total", () => {
    assert.equal(BANK_SIZES.templatesPerGoal, 6);
    assert.equal(BANK_SIZES.goals, 6);
    assert.equal(BANK_SIZES.total, 36);
  });

  it("deterministic: same inputs give identical output", () => {
    const a = runTool({ goal: "share", topic: "budget travel", count: 7 });
    const b = runTool({ goal: "share", topic: "budget travel", count: 7 });
    assert.deepEqual(a, b);
  });

  it("topic is trimmed", () => {
    const r = runTool({ goal: "comment", topic: "  skincare  ", count: 1 });
    assert.ok((r.values!.ctas as string[])[0].includes("this skincare post"));
  });

  it("null values object is rejected", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("unicode topic inserted verbatim", () => {
    const r = runTool({ goal: "save", topic: "寿司 🍣", count: 1 });
    assert.ok((r.values!.ctas as string[])[0].includes("this 寿司 🍣 post"));
  });

  it("assumptions disclose template-based, non-AI nature", () => {
    assert.ok(ASSUMPTIONS.some((a) => a.includes("36 hand-written")));
    assert.ok(ASSUMPTIONS.some((a) => a.includes("not AI")));
  });

  it("every goal has a human label", () => {
    for (const goal of CTA_GOALS) {
      assert.ok(GOAL_LABELS[goal].length > 0, goal);
    }
  });
});
