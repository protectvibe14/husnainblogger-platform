import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, debugPrompt, RUBRIC, PARAM_TYPOS } from "./logic.ts";

describe("prompt-health-debugger", () => {
  it("happy path: a strong prompt scores high", () => {
    const r = runTool({
      promptText:
        "A photorealistic portrait of an elderly fisherman, weathered face, harbor at dawn, soft light, dramatic lighting, shallow depth of field",
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok((v["score"] as number) >= 90);
    assert.equal(v["grade"], "A");
    assert.equal(v["issueCount"], 0);
  });

  it("weak prompt: short + vague + missing style/lighting scores low", () => {
    const { score, grade, issues } = debugPrompt("a beautiful dog");
    assert.ok(score <= 60, `expected low score, got ${score}`);
    assert.ok(["C", "D", "F"].includes(grade));
    const checks = issues.map((i) => i.check);
    assert.ok(checks.includes("vague-words"));
    assert.ok(checks.includes("missing-style"));
    assert.ok(checks.includes("missing-lighting"));
  });

  it("detects conflicting terms", () => {
    const { issues } = debugPrompt(
      "a dark bright neon cityscape, photorealistic, soft light",
    );
    const conflict = issues.find((i) => i.check === "conflicting-terms");
    assert.ok(conflict);
    assert.ok(conflict.message.includes('"dark"'));
    assert.ok(conflict.suggestion.length > 0);
  });

  it("detects parameter typos with corrections", () => {
    const { issues } = debugPrompt(
      "a lighthouse, photorealistic, soft light --aspec 16:9",
    );
    const typo = issues.find((i) => i.check === "param-typos");
    assert.ok(typo);
    assert.ok(typo.suggestion.includes("--ar"));
  });

  it("detects em-dash parameter syntax", () => {
    const { issues } = debugPrompt("a cat —ar 1:1, photorealistic, soft light");
    assert.ok(issues.some((i) => i.check === "param-typos"));
  });

  it("detects comma stuffing", () => {
    const tags = Array.from({ length: 15 }, (_, i) => `tag${i}`).join(", ");
    const { issues } = debugPrompt(`a cat, photorealistic, soft light, ${tags}`);
    const stuffing = issues.find((i) => i.check === "comma-stuffing");
    assert.ok(stuffing);
    assert.equal(stuffing.deduction, 8);
  });

  it("very long prompt loses points", () => {
    const long = `a cat, photorealistic, soft light, ${"detail, ".repeat(120)}`;
    const { issues } = debugPrompt(long);
    assert.ok(issues.some((i) => i.check === "length"));
  });

  it("score is floored at 0", () => {
    const { score } = debugPrompt("nice good cool pretty awesome");
    assert.ok(score >= 0);
  });

  it("every issue carries a suggestion and a deduction", () => {
    const { issues } = debugPrompt("a beautiful nice good dog");
    assert.ok(issues.length > 0);
    for (const i of issues) {
      assert.ok(i.suggestion.length > 0);
      assert.ok(i.deduction > 0);
      assert.ok(["error", "warning", "info"].includes(i.severity));
    }
  });

  it("rubric is public and has 8 checks", () => {
    assert.equal(RUBRIC.length, 8);
    const v = (
      runTool({ promptText: "a cat, photorealistic, soft light" }).values as Record<string, unknown>
    )["rubric"];
    assert.deepEqual(v, RUBRIC);
  });

  it("param-typo map covers common mistakes", () => {
    assert.equal(PARAM_TYPOS["--aspec"], "--ar");
    assert.equal(PARAM_TYPOS["--styel"], "--style");
  });

  it("validation: missing prompt -> error", () => {
    assert.equal(runTool({}).ok, false);
  });

  it("validation: oversized prompt -> error", () => {
    assert.equal(runTool({ promptText: "a".repeat(2001) }).ok, false);
  });

  it("determinism: same prompt twice -> identical result", () => {
    const args = { promptText: "a beautiful dark bright dog" };
    assert.deepEqual(runTool(args), runTool(args));
  });
});
