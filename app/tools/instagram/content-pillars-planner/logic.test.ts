import { test } from "node:test";
import assert from "node:assert";
import { runTool, planPillars, parsePillars, distributeSlots, WEIGHT_PRESETS } from "./logic.ts";

// --- happy path ------------------------------------------------------------

test("happy path: 3 pillars, 7 weekly slots", () => {
  const r = runTool({ pillars: "Tutorials\nBehind the scenes\nClient results", weeklySlots: 7 });
  assert.equal(r.ok, true);
  const alloc = r.values!.allocation as string[];
  assert.equal(alloc.length, 3);
  assert.ok(alloc[0].startsWith("Tutorials — 40%"));
  // slots must add up to 7
  const total = alloc.map((s) => Number(s.match(/\((\d+) posts?\/week\)/)![1])).reduce((a, b) => a + b, 0);
  assert.equal(total, 7);
  assert.ok(typeof r.values!.balanceWarning === "string");
});

test("happy path: comma-separated pillars + 5 pillars preset", () => {
  const r = runTool({
    pillars: "Tips, Stories, Reviews, Memes, Lives",
    weeklySlots: 10,
  });
  assert.equal(r.ok, true);
  assert.equal((r.values!.allocation as string[]).length, 5);
  assert.ok((r.values!.allocation as string[])[0].includes("30%"));
});

test("happy path: 4 pillars weeklySlots as string", () => {
  const r = runTool({ pillars: "a\nb\nc\nd", weeklySlots: "4" });
  assert.equal(r.ok, true);
  const alloc = r.values!.allocation as string[];
  const total = alloc.map((s) => Number(s.match(/\((\d+) posts?\/week\)/)![1])).reduce((a, b) => a + b, 0);
  assert.equal(total, 4);
});

// --- validation errors -----------------------------------------------------

test("error: missing pillars", () => {
  const r = runTool({ weeklySlots: 5 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.length > 0);
});

test("error: empty pillars string", () => {
  const r = runTool({ pillars: "   ", weeklySlots: 5 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("pillars"));
});

test("error: only 2 pillars", () => {
  const r = runTool({ pillars: "one\ntwo", weeklySlots: 5 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("at least 3"));
});

test("error: 6 pillars", () => {
  const r = runTool({ pillars: "a,b,c,d,e,f", weeklySlots: 5 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("Too many"));
});

test("error: missing weeklySlots", () => {
  const r = runTool({ pillars: "a\nb\nc" });
  assert.equal(r.ok, false);
  assert.ok(r.error!.length > 0);
});

test("error: weeklySlots 0", () => {
  const r = runTool({ pillars: "a\nb\nc", weeklySlots: 0 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("1"));
});

test("error: weeklySlots 22", () => {
  const r = runTool({ pillars: "a\nb\nc", weeklySlots: 22 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("21"));
});

test("error: weeklySlots fractional", () => {
  const r = runTool({ pillars: "a\nb\nc", weeklySlots: 2.5 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("whole number"));
});

test("error: weeklySlots non-numeric string", () => {
  const r = runTool({ pillars: "a\nb\nc", weeklySlots: "lots" });
  assert.equal(r.ok, false);
  assert.ok(r.error!.length > 0);
});

// --- edge cases ------------------------------------------------------------

test("edge: duplicate pillars are de-duplicated", () => {
  const pillars = parsePillars("Tips\ntips\nTIPS\nStories\nReviews");
  assert.deepEqual(pillars, ["Tips", "Stories", "Reviews"]);
});

test("edge: semicolons and mixed separators", () => {
  const pillars = parsePillars("one; two, three\nfour");
  assert.deepEqual(pillars, ["one", "two", "three", "four"]);
});

test("edge: largest-remainder sums exactly (3 pillars, 5 slots)", () => {
  assert.deepEqual(distributeSlots(WEIGHT_PRESETS[3], 5).reduce((a, b) => a + b, 0), 5);
});

test("edge: largest-remainder sums exactly (5 pillars, 1 slot)", () => {
  const d = distributeSlots(WEIGHT_PRESETS[5], 1);
  assert.equal(d.reduce((a, b) => a + b, 0), 1);
  assert.equal(d[0], 1); // primary pillar wins the single slot
});

test("edge: starved pillars produce a warning", () => {
  const plan = planPillars("a\nb\nc\nd\ne", 2);
  assert.ok(plan.balanceWarning.includes("Warning"));
});

test("edge: balanced schedule produces no warning", () => {
  const plan = planPillars("a\nb\nc", 7);
  assert.ok(plan.balanceWarning.includes("Balanced"));
});

test("edge: preset weights sum to 100", () => {
  for (const n of [3, 4, 5]) {
    assert.equal(WEIGHT_PRESETS[n].reduce((a, b) => a + b, 0), 100);
  }
});

// --- determinism + meta contract -------------------------------------------

test("determinism: same inputs twice -> identical outputs", () => {
  const v = { pillars: "Tips\nStories\nReviews\nMemes", weeklySlots: 9 };
  assert.deepEqual(runTool(v).values, runTool(v).values);
});

test("meta contract: output ids are allocation + balanceWarning", () => {
  const r = runTool({ pillars: "a\nb\nc", weeklySlots: 3 });
  assert.ok(r.ok);
  assert.deepEqual(Object.keys(r.values!).sort(), ["allocation", "balanceWarning"]);
});

test("meta contract: allocation entries are non-empty strings", () => {
  const r = runTool({ pillars: "a\nb\nc", weeklySlots: 3 });
  for (const line of r.values!.allocation as string[]) {
    assert.ok(line.length > 0);
    assert.ok(line.includes("%"));
  }
});
