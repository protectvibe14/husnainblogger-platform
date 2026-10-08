import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  getCtaLines,
  CTA_GOALS,
  CTA_TONES,
  CTA_LINES_TOTAL,
  CTA_LINES_PER_PAIR,
} from "./logic.ts";

describe("cta-prompt-library", () => {
  it("happy path: returns 3 fixed lines for click/direct", () => {
    const r = runTool({ ctaGoal: "click", tone: "direct" });
    assert.equal(r.ok, true);
    assert.equal(r.error, undefined);
    const lines = r.values?.ctaLines as string[];
    assert.ok(Array.isArray(lines));
    assert.equal(lines.length, CTA_LINES_PER_PAIR);
    assert.deepEqual(lines, [
      "Click here to get started.",
      "Click below to see how it works.",
      "Tap the button to continue.",
    ]);
  });

  it("output id matches meta.ts outputs", () => {
    const r = runTool({ ctaGoal: "subscribe", tone: "friendly" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}), ["ctaLines"]);
  });

  it("bank coverage: every goal x tone pair returns exactly 3 non-empty lines", () => {
    let total = 0;
    for (const goal of CTA_GOALS) {
      for (const tone of CTA_TONES) {
        const lines = getCtaLines(goal, tone);
        assert.equal(lines.length, CTA_LINES_PER_PAIR, `${goal}/${tone}`);
        for (const line of lines) {
          assert.ok(line.trim().length > 0, `${goal}/${tone} has empty line`);
          assert.ok(!line.includes("["), `${goal}/${tone} line has placeholder: ${line}`);
        }
        total += lines.length;
      }
    }
    assert.equal(total, CTA_LINES_TOTAL);
  });

  it("bank lines are unique within a pair", () => {
    for (const goal of CTA_GOALS) {
      for (const tone of CTA_TONES) {
        const lines = getCtaLines(goal, tone);
        assert.equal(new Set(lines).size, lines.length, `${goal}/${tone} has duplicates`);
      }
    }
  });

  it("missing ctaGoal -> friendly error", () => {
    const r = runTool({ tone: "direct" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /goal/i);
  });

  it("invalid ctaGoal -> friendly error listing valid goals", () => {
    const r = runTool({ ctaGoal: "like", tone: "direct" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /click.*subscribe.*buy.*share/);
  });

  it("missing tone -> friendly error", () => {
    const r = runTool({ ctaGoal: "buy" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /tone/i);
  });

  it("invalid tone -> friendly error listing valid tones", () => {
    const r = runTool({ ctaGoal: "buy", tone: "loud" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /direct/);
  });

  it("non-string goal rejected", () => {
    const r = runTool({ ctaGoal: 42, tone: "direct" });
    assert.equal(r.ok, false);
  });

  it("empty input object rejected", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });

  it("non-object input rejected", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("deterministic: same inputs give identical output twice", () => {
    const a = runTool({ ctaGoal: "share", tone: "playful" });
    const b = runTool({ ctaGoal: "share", tone: "playful" });
    assert.deepEqual(a, b);
  });

  it("different goals give different lines", () => {
    const a = runTool({ ctaGoal: "click", tone: "direct" }).values?.ctaLines as string[];
    const b = runTool({ ctaGoal: "buy", tone: "direct" }).values?.ctaLines as string[];
    assert.notDeepEqual(a, b);
  });

  it("different tones give different lines", () => {
    const a = runTool({ ctaGoal: "subscribe", tone: "direct" }).values?.ctaLines as string[];
    const b = runTool({ ctaGoal: "subscribe", tone: "urgent" }).values?.ctaLines as string[];
    assert.notDeepEqual(a, b);
  });

  it("returned array is a copy (mutating it does not poison the bank)", () => {
    const first = runTool({ ctaGoal: "click", tone: "direct" }).values?.ctaLines as string[];
    first.push("INJECTED");
    const second = runTool({ ctaGoal: "click", tone: "direct" }).values?.ctaLines as string[];
    assert.equal(second.length, CTA_LINES_PER_PAIR);
    assert.ok(!second.includes("INJECTED"));
  });

  it("case-sensitive: 'Click' (capital) is rejected", () => {
    const r = runTool({ ctaGoal: "Click", tone: "direct" });
    assert.equal(r.ok, false);
  });
});
