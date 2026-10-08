import test from "node:test";
import assert from "node:assert/strict";
import { runTool, MAX_STEPS } from "./logic.ts";

const GOOD = [
  { processName: "Publishing a blog post", stepTitle: "Draft the post", owner: "Writer", frequency: "Weekly", details: "Use the content brief." },
  { processName: "Publishing a blog post", stepTitle: "Edit and proofread" },
];

test("happy path returns sopDocument and stepChecklist", () => {
  const r = runTool({ items: GOOD });
  assert.equal(r.ok, true);
  assert.ok(r.values);
  assert.equal(typeof r.values.sopDocument, "string");
  assert.ok(Array.isArray(r.values.stepChecklist));
});

test("output ids match meta.ts: sopDocument, stepChecklist", () => {
  const r = runTool({ items: GOOD });
  assert.deepEqual(Object.keys(r.values!).sort(), ["sopDocument", "stepChecklist"]);
});

test("document has the SOP title and all steps", () => {
  const r = runTool({ items: GOOD });
  const doc = r.values!.sopDocument;
  assert.match(doc, /# SOP: Publishing a blog post/);
  assert.match(doc, /### 1\. Draft the post/);
  assert.match(doc, /### 2\. Edit and proofread/);
});

test("per-step slots: owner, frequency, QA checkpoint, details", () => {
  const r = runTool({ items: GOOD });
  const doc = r.values!.sopDocument;
  assert.match(doc, /- Owner: Writer/);
  assert.match(doc, /- Frequency: Weekly/);
  assert.match(doc, /- QA checkpoint:/);
  assert.match(doc, /- Details: Use the content brief\./);
});

test("blank optional fields become labeled fill-in slots", () => {
  const r = runTool({ items: GOOD });
  const doc = r.values!.sopDocument;
  assert.match(doc, /- Owner: \[assign owner\]/);
  assert.match(doc, /- Frequency: \[set frequency\]/);
  assert.match(doc, /- Details: \[add details\]/);
});

test("document includes a purpose placeholder and revision log", () => {
  const r = runTool({ items: GOOD });
  assert.match(r.values!.sopDocument, /## Purpose/);
  assert.match(r.values!.sopDocument, /## Revision log/);
});

test("stepChecklist summarizes each step", () => {
  const r = runTool({ items: GOOD });
  assert.equal(r.values!.stepChecklist.length, 2);
  assert.match(r.values!.stepChecklist[0], /^1\. Draft the post/);
  assert.match(r.values!.stepChecklist[1], /^2\. Edit and proofread/);
});

test("empty items array is rejected", () => {
  const r = runTool({ items: [] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /at least one step/i);
});

test("missing processName is rejected with item number", () => {
  const r = runTool({ items: [{ stepTitle: "Some step" }] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Item 1: Process name is required/);
});

test("missing stepTitle is rejected with item number", () => {
  const r = runTool({ items: [{ processName: "Proc" }] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Item 1: Step title is required/);
});

test("error names the failing item in a multi-item run", () => {
  const r = runTool({
    items: [GOOD[0], { processName: "Publishing a blog post" }],
  });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Item 2/);
});

test("differing process names are rejected", () => {
  const r = runTool({
    items: [
      { processName: "Process A", stepTitle: "Step one" },
      { processName: "Process B", stepTitle: "Step two" },
    ],
  });
  assert.equal(r.ok, false);
  assert.match(r.error!, /same process/);
});

test("non-object item is rejected", () => {
  const r = runTool({ items: [GOOD[0], 42] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Item 2/);
});

test("more than MAX_STEPS items is rejected", () => {
  const many = Array.from({ length: MAX_STEPS + 1 }, (_, i) => ({
    processName: "Proc",
    stepTitle: `Step ${i}`,
  }));
  const r = runTool({ items: many });
  assert.equal(r.ok, false);
  assert.match(r.error!, new RegExp(String(MAX_STEPS)));
});

test("exactly MAX_STEPS items succeeds", () => {
  const many = Array.from({ length: MAX_STEPS }, (_, i) => ({
    processName: "Proc",
    stepTitle: `Step ${i}`,
  }));
  const r = runTool({ items: many });
  assert.equal(r.ok, true);
  assert.equal(r.values!.stepChecklist.length, MAX_STEPS);
});

test("single step works", () => {
  const r = runTool({ items: [GOOD[0]] });
  assert.equal(r.ok, true);
  assert.match(r.values!.sopDocument, /Steps: 1/);
});

test("whitespace-only stepTitle is rejected", () => {
  const r = runTool({ items: [{ processName: "Proc", stepTitle: "   " }] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Step title is required/);
});

test("deterministic: same items give identical outputs", () => {
  const a = runTool({ items: GOOD });
  const b = runTool({ items: GOOD });
  assert.deepEqual(a, b);
});

test("cap matches the documented constant", () => {
  assert.equal(MAX_STEPS, 30);
});

test("tool adds no process knowledge of its own", () => {
  const r = runTool({ items: [{ processName: "X", stepTitle: "Y" }] });
  assert.match(r.values!.sopDocument, /Generated from your own process description/);
});
