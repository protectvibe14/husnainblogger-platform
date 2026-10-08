import test from "node:test";
import assert from "node:assert/strict";
import { runTool, MIN_EXPERTS, MAX_EXPERTS, QUESTION_BANK } from "./logic.ts";

const GOOD = { topic: "Email list building", expertCount: 10 };

test("happy path returns questions, outreachTracker, timeline", () => {
  const r = runTool(GOOD);
  assert.equal(r.ok, true);
  assert.ok(r.values);
  assert.ok(Array.isArray(r.values.questions));
  assert.ok(Array.isArray(r.values.timeline));
  assert.deepEqual(r.values.outreachTracker.columns, [
    "#",
    "Expert name",
    "Contact (email / handle)",
    "Invite sent",
    "Follow-up 1",
    "Follow-up 2",
    "Response received",
  ]);
});

test("output ids match meta.ts: questions, outreachTracker, timeline", () => {
  const r = runTool(GOOD);
  assert.deepEqual(Object.keys(r.values!).sort(), [
    "outreachTracker",
    "questions",
    "timeline",
  ]);
});

test("tracker has one row per expert slot with empty name/contact cells", () => {
  const r = runTool(GOOD);
  assert.equal(r.values!.outreachTracker.rows.length, 10);
  for (const row of r.values!.outreachTracker.rows) {
    assert.equal(row.length, 7);
    assert.equal(row[1], "", "expert name must be empty — never fabricated");
    assert.equal(row[2], "", "contact must be empty — never fabricated");
  }
});

test("tracker rows are numbered 1..N", () => {
  const r = runTool(GOOD);
  const numbers = r.values!.outreachTracker.rows.map((row) => row[0]);
  assert.deepEqual(numbers, ["1","2","3","4","5","6","7","8","9","10"]);
});

test("questions list contains the 6 generic templates, labeled", () => {
  const r = runTool(GOOD);
  assert.equal(r.values!.questions.length, 6);
  for (const q of r.values!.questions) {
    assert.match(q, /\[Generic template — personalize it\]/);
  }
});

test("custom questions come first, unlabeled", () => {
  const r = runTool({
    topic: "SEO",
    expertCount: 5,
    questionSet: "What is your #1 SEO tip?\n\nHow do you measure success?",
  });
  assert.equal(r.values!.questions.length, 8);
  assert.equal(r.values!.questions[0], "What is your #1 SEO tip?");
  assert.equal(r.values!.questions[1], "How do you measure success?");
  assert.match(r.values!.questions[2], /Generic template/);
});

test("blank lines in questionSet are ignored", () => {
  const r = runTool({ topic: "SEO", expertCount: 5, questionSet: "\n  \nOnly this\n" });
  assert.equal(r.values!.questions.length, 7);
  assert.equal(r.values!.questions[0], "Only this");
});

test("missing questionSet still returns the 6 generic questions", () => {
  const r = runTool(GOOD);
  assert.equal(r.values!.questions.length, 6);
});

test("timeline has 6 fixed milestones in day order", () => {
  const r = runTool(GOOD);
  const t = r.values!.timeline;
  assert.equal(t.length, 6);
  assert.match(t[0], /^Day 0: /);
  assert.match(t[1], /^Day 7: /);
  assert.match(t[2], /^Day 14: /);
  assert.match(t[3], /^Day 18: /);
  assert.match(t[4], /^Day 21: /);
  assert.match(t[5], /^Day 24: /);
});

test("timeline mentions follow-ups and a deadline", () => {
  const r = runTool(GOOD);
  const all = r.values!.timeline.join(" ");
  assert.match(all, /follow-up/i);
  assert.match(all, /deadline/i);
});

test("missing topic is rejected", () => {
  const r = runTool({ expertCount: 10 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /topic/i);
});

test("whitespace-only topic is rejected", () => {
  const r = runTool({ topic: "   ", expertCount: 10 });
  assert.equal(r.ok, false);
});

test("missing expertCount is rejected", () => {
  const r = runTool({ topic: "SEO" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /3 to 30/);
});

test("expertCount below 3 is rejected", () => {
  const r = runTool({ topic: "SEO", expertCount: 2 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /3 to 30/);
});

test("expertCount above 30 is rejected", () => {
  const r = runTool({ topic: "SEO", expertCount: 31 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /3 to 30/);
});

test("non-integer expertCount is rejected", () => {
  const r = runTool({ topic: "SEO", expertCount: 7.5 });
  assert.equal(r.ok, false);
});

test("non-numeric expertCount is rejected", () => {
  const r = runTool({ topic: "SEO", expertCount: "many" });
  assert.equal(r.ok, false);
});

test("boundary values 3 and 30 succeed", () => {
  assert.equal(runTool({ topic: "SEO", expertCount: 3 }).ok, true);
  assert.equal(runTool({ topic: "SEO", expertCount: 30 }).ok, true);
  assert.equal(runTool({ topic: "SEO", expertCount: 30 }).values!.outreachTracker.rows.length, 30);
});

test("expertCount accepts a numeric string", () => {
  const r = runTool({ topic: "SEO", expertCount: "8" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.outreachTracker.rows.length, 8);
});

test("deterministic: same inputs give identical outputs", () => {
  const a = runTool(GOOD);
  const b = runTool(GOOD);
  assert.deepEqual(a, b);
});

test("bank sizes match the documented constants", () => {
  assert.equal(MIN_EXPERTS, 3);
  assert.equal(MAX_EXPERTS, 30);
  assert.equal(QUESTION_BANK.length, 6);
});
