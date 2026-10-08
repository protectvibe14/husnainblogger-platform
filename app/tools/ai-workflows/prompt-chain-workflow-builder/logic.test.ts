import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, defaultStepTemplate, MIN_STEPS, MAX_STEPS, GOAL_VARIABLE } from "./logic.ts";

describe("prompt-chain-workflow-builder", () => {
  it("happy path: 3 steps assemble an ordered chain with handoffs", () => {
    const r = runTool({
      items: [
        { chainGoal: "Write a product review", stepName: "Outline" },
        { stepName: "Draft" },
        { stepName: "Edit" },
      ],
    });
    assert.equal(r.ok, true);
    const chain = r.values?.chain as string;
    assert.ok(chain.includes("Write a product review"));
    assert.ok(chain.includes("## Step 1 — Outline"));
    assert.ok(chain.includes("## Step 2 — Draft"));
    assert.ok(chain.includes("## Step 3 — Edit"));
    assert.ok(chain.includes("Uses: {goal}"));
    assert.ok(chain.includes("Produces: {outline_output}"));
    assert.ok(chain.includes("Uses: {outline_output}"));
    assert.deepEqual(r.values?.warnings, []);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ items: [{ stepName: "A" }, { stepName: "B" }] });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), ["chain", "warnings"]);
  });

  it("empty items -> error", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
  });

  it("single step -> at-least-2 error", () => {
    const r = runTool({ items: [{ stepName: "Only step" }] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", new RegExp(`at least ${MIN_STEPS}`));
  });

  it(`exactly ${MIN_STEPS} steps -> ok`, () => {
    const r = runTool({ items: [{ stepName: "A" }, { stepName: "B" }] });
    assert.equal(r.ok, true);
  });

  it(`more than ${MAX_STEPS} steps -> error`, () => {
    const items = Array.from({ length: MAX_STEPS + 1 }, (_, i) => ({ stepName: `S${i}` }));
    const r = runTool({ items });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", new RegExp(String(MAX_STEPS)));
  });

  it("missing stepName -> 'Item N: step name' error", () => {
    const r = runTool({ items: [{ stepName: "A" }, { stepPrompt: "no name" }] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Item 2: step name/i);
  });

  it("undefined variable -> warnings panel entry", () => {
    const r = runTool({
      items: [
        { stepName: "Outline" },
        { stepName: "Draft", stepPrompt: "Expand {unknown_var} into prose." },
      ],
    });
    assert.equal(r.ok, true);
    const warnings = r.values?.warnings as string[];
    assert.equal(warnings.length, 1);
    assert.ok(warnings[0].includes("{unknown_var}"));
    assert.ok(warnings[0].includes("not defined"));
    assert.ok((r.values?.chain as string).includes("## Warnings"));
  });

  it("{goal} counts as defined — no warning", () => {
    const r = runTool({
      items: [
        { chainGoal: "Launch email course", stepName: "Outline", stepPrompt: "Outline {goal}." },
        { stepName: "Draft" },
      ],
    });
    assert.equal(r.ok, true);
    assert.deepEqual(r.values?.warnings, []);
  });

  it("referencing an earlier step's output variable -> no warning", () => {
    const r = runTool({
      items: [
        { stepName: "Research" },
        { stepName: "Outline", stepPrompt: "Turn {research_output} into an outline." },
      ],
    });
    assert.equal(r.ok, true);
    assert.deepEqual(r.values?.warnings, []);
    assert.ok((r.values?.chain as string).includes("Uses: {research_output}"));
  });

  it("malformed variable name -> warning about valid names", () => {
    const r = runTool({
      items: [
        { stepName: "A" },
        { stepName: "B", stepPrompt: "Use {bad var} here." },
      ],
    });
    assert.equal(r.ok, true);
    const warnings = r.values?.warnings as string[];
    assert.equal(warnings.length, 1);
    assert.ok(warnings[0].includes("valid variable name"));
  });

  it("blank stepPrompt uses the fixed default template", () => {
    const r = runTool({ items: [{ stepName: "A" }, { stepName: "B" }] });
    assert.equal(r.ok, true);
    assert.ok((r.values?.chain as string).includes(defaultStepTemplate("A")));
  });

  it("duplicate step names get disambiguated variable names", () => {
    const r = runTool({
      items: [{ stepName: "Outline" }, { stepName: "Outline" }, { stepName: "Draft" }],
    });
    assert.equal(r.ok, true);
    const chain = r.values?.chain as string;
    assert.ok(chain.includes("{outline_output}"));
    assert.ok(chain.includes("{outline_output_2}"));
  });

  it("goal defaults honestly when blank", () => {
    const r = runTool({ items: [{ stepName: "A" }, { stepName: "B" }] });
    assert.equal(r.ok, true);
    assert.ok((r.values?.chain as string).includes("Untitled chain"));
  });

  it("custom step prompt is kept verbatim", () => {
    const r = runTool({
      items: [
        { stepName: "Outline" },
        { stepName: "Draft", stepPrompt: "My own exact words here." },
      ],
    });
    assert.equal(r.ok, true);
    assert.ok((r.values?.chain as string).includes("My own exact words here."));
  });

  it("GOAL_VARIABLE is {goal}", () => {
    assert.equal(GOAL_VARIABLE, "{goal}");
  });

  it("deterministic: same items -> identical output", () => {
    const args = {
      items: [
        { chainGoal: "G", stepName: "A", stepPrompt: "Do {goal}." },
        { stepName: "B", stepPrompt: "Use {mystery}." },
      ],
    };
    const a = runTool(args);
    const b = runTool(args);
    assert.deepEqual(a, b);
  });
});
