import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, ADVANCED_KEYWORDS } from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_IDS = ["hook", "level", "steps", "recapCta"];

function okResult(topic = "tie a tie", stepCount: unknown = 5) {
  const r = runTool({ tutorialTopic: topic, stepCount });
  assert.equal(r.ok, true, `expected ok, got error: ${"error" in r ? r.error : ""}`);
  return (r as { ok: true; values: Record<string, string | string[]> }).values;
}

function onScreenOf(step: string): string {
  const m = step.match(/on-screen text: "([^"]*)"/);
  assert.ok(m, `on-screen text found in: ${step}`);
  return m![1];
}

describe("tiktok-tutorial-step-structurer", () => {
  it("happy path: hook, level, steps, recapCta returned", () => {
    const v = okResult();
    assert.deepEqual(Object.keys(v).sort(), EXPECTED_IDS.sort());
    assert.ok((v.hook as string).length > 10);
    assert.equal(v.level, "beginner-friendly");
    assert.equal((v.steps as string[]).length, 5);
    assert.ok((v.recapCta as string).length > 10);
  });

  it("advanced topic adds a prerequisite beat and level=advanced", () => {
    const v = okResult("advanced sourdough scoring", 4);
    assert.equal(v.level, "advanced");
    const steps = v.steps as string[];
    assert.equal(steps.length, 5); // 1 prereq + 4 steps
    assert.match(steps[0], /^PREREQUISITE/);
  });

  it("advanced keywords detected: expert, masterclass, deep dive, pro", () => {
    assert.ok(ADVANCED_KEYWORDS.test("expert photo editing"));
    assert.ok(ADVANCED_KEYWORDS.test("Excel masterclass"));
    assert.ok(ADVANCED_KEYWORDS.test("deep dive into taxes"));
    assert.ok(!ADVANCED_KEYWORDS.test("tie a tie"));
    const v = okResult("pro-level latte art", 3);
    assert.equal(v.level, "advanced");
  });

  it("every on-screen text line is <= 140 chars", () => {
    for (const topic of ["tie a tie", "advanced knot theory", "how to boil an egg"]) {
      const v = okResult(topic, 12);
      for (const s of v.steps as string[]) {
        if (s.startsWith("PREREQUISITE")) continue;
        assert.ok(onScreenOf(s).length <= 140, `line too long: ${s}`);
      }
    }
  });

  it("stepCount bounds: 2 and 12 work", () => {
    assert.equal((okResult("x", 2).steps as string[]).length, 2);
    assert.equal((okResult("x", 12).steps as string[]).length, 12);
  });

  it("missing tutorialTopic errors", () => {
    const r = runTool({ stepCount: 4 });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /topic/i);
  });

  it("blank tutorialTopic errors", () => {
    assert.equal(runTool({ tutorialTopic: "  ", stepCount: 4 }).ok, false);
  });

  it("tutorialTopic over 200 chars errors", () => {
    const r = runTool({ tutorialTopic: "b".repeat(201), stepCount: 4 });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /200/);
  });

  it("stepCount 1 and 13 error (2-12 range)", () => {
    assert.match((runTool({ tutorialTopic: "x", stepCount: 1 }) as { error: string }).error, /2 and 12/);
    assert.match((runTool({ tutorialTopic: "x", stepCount: 13 }) as { error: string }).error, /2 and 12/);
  });

  it("non-integer / non-numeric stepCount errors", () => {
    assert.equal(runTool({ tutorialTopic: "x", stepCount: 3.5 }).ok, false);
    assert.equal(runTool({ tutorialTopic: "x", stepCount: "many" }).ok, false);
  });

  it("numeric string stepCount is coerced", () => {
    assert.equal((okResult("x", "6").steps as string[]).length, 6);
  });

  it("deterministic: same inputs -> identical output", () => {
    assert.deepEqual(okResult("fold a shirt", 4), okResult("fold a shirt", 4));
  });

  it("different topics -> different hooks", () => {
    assert.notEqual(okResult("fold a shirt", 4).hook, okResult("peel garlic", 4).hook);
  });

  it("topic substituted into hook and recap (no {topic} leftovers)", () => {
    const v = okResult("change a tire", 3);
    assert.ok(!(v.hook as string).includes("{topic}"));
    assert.ok(!(v.recapCta as string).includes("{topic}"));
  });

  it("step numbering is sequential", () => {
    const steps = okResult("x", 4).steps as string[];
    steps.forEach((s, i) => assert.ok(s.startsWith(`Step ${i + 1}:`), s));
  });

  it("word-bank bounds: no empty picks across topics", () => {
    const v = okResult("make cold brew", 8);
    assert.ok((v.hook as string).length > 10);
    assert.ok((v.recapCta as string).length > 10);
    for (const s of v.steps as string[]) {
      assert.ok(s.length > 25);
      if (!s.startsWith("PREREQUISITE")) onScreenOf(s); // parses cleanly
    }
  });

  it("output ids match meta.ts outputs", () => {
    assert.deepEqual(outputs.map((o) => o.id).sort(), EXPECTED_IDS.sort());
  });
});
