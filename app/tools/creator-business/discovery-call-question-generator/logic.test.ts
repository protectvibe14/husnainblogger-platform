import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, SERVICE_TYPES, CALL_GOALS, QUESTION_BANK, GROUPS } from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id).sort();

describe("discovery-call-question-generator", () => {
  it("happy path: qualify returns 19 questions", () => {
    const r = runTool({ serviceType: "Web design", callGoal: "qualify" });
    assert.equal(r.ok, true);
    const qs = r.values!["questions"] as string[];
    assert.equal(qs.length, 19); // rapport 5 + needs 8 + budget 6
    assert.equal(r.values!["questionCount"], 19);
    assert.equal(r.values!["goalLabel"], "Is this client a fit?");
  });

  it("scope returns 18 questions", () => {
    const r = runTool({ serviceType: "Copywriting", callGoal: "scope" });
    assert.equal(r.ok, true);
    const qs = r.values!["questions"] as string[];
    assert.equal(qs.length, 18); // rapport 5 + needs 8 + timeline 5
    assert.equal(r.values!["questionCount"], 18);
    assert.equal(r.values!["goalLabel"], "What will the project take?");
  });

  it("close returns all 29 questions", () => {
    const r = runTool({ serviceType: "Video editing", callGoal: "close" });
    assert.equal(r.ok, true);
    const qs = r.values!["questions"] as string[];
    assert.equal(qs.length, 29);
    assert.equal(r.values!["questionCount"], 29);
    assert.equal(r.values!["goalLabel"], "Can we agree and start?");
  });

  it("questions carry group prefixes", () => {
    const r = runTool({ serviceType: "SEO", callGoal: "qualify" });
    const qs = r.values!["questions"] as string[];
    assert.ok(qs[0].startsWith("[Rapport] "));
    assert.ok(qs.some((q) => q.startsWith("[Needs] ")));
    assert.ok(qs.some((q) => q.startsWith("[Budget] ")));
    assert.ok(!qs.some((q) => q.startsWith("[Decision] ")));
  });

  it("service type fills {service} placeholders", () => {
    const r = runTool({ serviceType: "Web design", callGoal: "qualify" });
    const qs = r.values!["questions"] as string[];
    assert.ok(qs.some((q) => q.includes("web design project")));
    assert.ok(!qs.some((q) => q.includes("{service}")));
  });

  it("each service type produces the same count for a goal", () => {
    for (const s of SERVICE_TYPES) {
      const r = runTool({ serviceType: s, callGoal: "scope" });
      assert.equal(r.ok, true, `service ${s} should be accepted`);
      assert.equal(r.values!["questionCount"], 18);
    }
  });

  it("validation: missing serviceType -> error", () => {
    const r = runTool({ callGoal: "qualify" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /service type/i);
  });

  it("validation: unknown serviceType -> error", () => {
    const r = runTool({ serviceType: "Plumbing", callGoal: "qualify" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Unknown service type/i);
  });

  it("validation: missing callGoal -> error", () => {
    const r = runTool({ serviceType: "SEO" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /call goal/i);
  });

  it("validation: unknown callGoal -> error", () => {
    const r = runTool({ serviceType: "SEO", callGoal: "upsell" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Unknown call goal/i);
  });

  it("validation: non-string inputs -> error", () => {
    const r = runTool({ serviceType: 42, callGoal: null });
    assert.equal(r.ok, false);
  });

  it("output ids exactly match meta.ts outputs", () => {
    const r = runTool({ serviceType: "SEO", callGoal: "close" });
    assert.deepEqual(Object.keys(r.values!).sort(), OUTPUT_IDS);
  });

  it("determinism: same input -> identical output", () => {
    const input = { serviceType: "UGC creation", callGoal: "scope" };
    const a = JSON.stringify(runTool(input));
    const b = JSON.stringify(runTool(input));
    assert.equal(a, b);
  });

  it("word bank: 29 questions, 5 groups, no empty picks", () => {
    let total = 0;
    for (const g of GROUPS) {
      const list = QUESTION_BANK[g];
      assert.ok(list.length > 0, `group ${g} must be non-empty`);
      for (const q of list) {
        assert.ok(q.trim().length > 0, "question must be non-empty");
        total++;
      }
    }
    assert.equal(total, 29);
  });

  it("question count equals the sum of its groups", () => {
    const r = runTool({ serviceType: "Email marketing", callGoal: "close" });
    const qs = r.values!["questions"] as string[];
    const expected =
      QUESTION_BANK.rapport.length +
      QUESTION_BANK.needs.length +
      QUESTION_BANK.budget.length +
      QUESTION_BANK.timeline.length +
      QUESTION_BANK.decision.length;
    assert.equal(qs.length, expected);
  });

  it("CALL_GOALS has exactly the 3 documented goals", () => {
    assert.deepEqual([...CALL_GOALS], ["qualify", "scope", "close"]);
  });
});
