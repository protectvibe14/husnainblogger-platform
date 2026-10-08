import test from "node:test";
import assert from "node:assert/strict";
import { runTool, MAX_PITCHES } from "./logic.ts";

const GOOD = [{ blogName: "TechBlog", topicIdea: "AI tools for small teams", credentials: "5 years in SaaS marketing" }];

test("happy path returns pitchEmail and subjectLines", () => {
  const r = runTool({ items: GOOD });
  assert.equal(r.ok, true);
  assert.ok(r.values);
  assert.equal(typeof r.values.pitchEmail, "string");
  assert.ok(Array.isArray(r.values.subjectLines));
});

test("output ids match meta.ts: pitchEmail, subjectLines", () => {
  const r = runTool({ items: GOOD });
  assert.deepEqual(Object.keys(r.values!).sort(), ["pitchEmail", "subjectLines"]);
});

test("returns exactly 5 subject lines for one pitch", () => {
  const r = runTool({ items: GOOD });
  assert.equal(r.values!.subjectLines.length, 5);
});

test("email fills blog name, topic idea, and credentials", () => {
  const r = runTool({ items: GOOD });
  const email = r.values!.pitchEmail;
  assert.match(email, /TechBlog/);
  assert.match(email, /AI tools for small teams/);
  assert.match(email, /5 years in SaaS marketing/);
});

test("subject lines fill the blog name and topic idea", () => {
  const r = runTool({ items: GOOD });
  for (const s of r.values!.subjectLines) {
    assert.ok(s.length > 10, "no empty subject line");
  }
  assert.match(r.values!.subjectLines.join(" "), /TechBlog/);
});

test("no unfilled template slots remain", () => {
  const r = runTool({ items: GOOD });
  assert.ok(!/\{[A-Z_]+\}/.test(r.values!.pitchEmail), "no leftover slots");
  assert.ok(!r.values!.subjectLines.some((s) => /\{[A-Z_]+\}/.test(s)));
});

test("missing credentials uses the neutral fallback line", () => {
  const r = runTool({ items: [{ blogName: "FoodBlog", topicIdea: "Meal prep basics" }] });
  assert.equal(r.ok, true);
  assert.match(r.values!.pitchEmail, /write about this topic regularly/i);
});

test("blank credentials string uses the fallback line", () => {
  const r = runTool({
    items: [{ blogName: "FoodBlog", topicIdea: "Meal prep basics", credentials: "   " }],
  });
  assert.equal(r.ok, true);
  assert.match(r.values!.pitchEmail, /write about this topic regularly/i);
});

test("empty items array is rejected", () => {
  const r = runTool({ items: [] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /at least one pitch/i);
});

test("missing blogName is rejected with item number", () => {
  const r = runTool({ items: [{ topicIdea: "Some topic" }] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Item 1: Blog name is required/);
});

test("missing topicIdea is rejected with item number", () => {
  const r = runTool({ items: [{ blogName: "SomeBlog" }] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Item 1: Topic idea is required/);
});

test("error names the failing item in a multi-item run", () => {
  const r = runTool({
    items: [GOOD[0], { blogName: "OtherBlog" }],
  });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Item 2/);
});

test("non-object item is rejected", () => {
  const r = runTool({ items: [GOOD[0], "nope"] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Item 2/);
});

test("more than MAX_PITCHES items is rejected", () => {
  const many = Array.from({ length: MAX_PITCHES + 1 }, (_, i) => ({
    blogName: `Blog${i}`,
    topicIdea: `Topic ${i}`,
  }));
  const r = runTool({ items: many });
  assert.equal(r.ok, false);
  assert.match(r.error!, new RegExp(String(MAX_PITCHES)));
});

test("exactly MAX_PITCHES items succeeds", () => {
  const many = Array.from({ length: MAX_PITCHES }, (_, i) => ({
    blogName: `Blog${i}`,
    topicIdea: `Topic ${i}`,
  }));
  const r = runTool({ items: many });
  assert.equal(r.ok, true);
  assert.equal(r.values!.subjectLines.length, MAX_PITCHES * 5);
});

test("multiple pitches are labeled and separated", () => {
  const r = runTool({
    items: [
      { blogName: "BlogA", topicIdea: "Topic A" },
      { blogName: "BlogB", topicIdea: "Topic B" },
    ],
  });
  assert.equal(r.ok, true);
  assert.match(r.values!.pitchEmail, /pitch 1 of 2/);
  assert.match(r.values!.pitchEmail, /pitch 2 of 2/);
  assert.equal(r.values!.subjectLines.length, 10);
});

test("whitespace-only blogName is rejected", () => {
  const r = runTool({ items: [{ blogName: "   ", topicIdea: "Topic" }] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Blog name is required/);
});

test("deterministic: same items give identical outputs", () => {
  const a = runTool({ items: GOOD });
  const b = runTool({ items: GOOD });
  assert.deepEqual(a, b);
});

test("bank sizes match the documented constants", () => {
  const r = runTool({ items: GOOD });
  assert.equal(r.values!.subjectLines.length, 5);
  assert.equal(MAX_PITCHES, 10);
});

test("honest copy: email asks the user to personalize", () => {
  const r = runTool({ items: GOOD });
  assert.match(r.values!.pitchEmail, /following/i);
});
