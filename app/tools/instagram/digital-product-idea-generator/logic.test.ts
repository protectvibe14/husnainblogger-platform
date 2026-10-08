import { test } from "node:test";
import assert from "node:assert";
import { runTool, generateIdeas, BANK_SIZES, DEFAULT_COUNT } from "./logic.ts";

// --- happy path ------------------------------------------------------------

test("happy path: niche + skills, default count", () => {
  const r = runTool({ niche: "fitness coaching", skills: "video editing" });
  assert.equal(r.ok, true);
  const ideas = r.values!.ideas as string[];
  assert.equal(ideas.length, DEFAULT_COUNT);
  for (const idea of ideas) {
    assert.ok(idea.includes("fitness coaching"), idea);
    assert.ok(idea.length > 0);
  }
});

test("happy path: count 1", () => {
  const r = runTool({ niche: "gardening", skills: "writing", count: 1 });
  assert.equal(r.ok, true);
  assert.equal((r.values!.ideas as string[]).length, 1);
});

test("happy path: count 10", () => {
  const r = runTool({ niche: "gardening", skills: "writing", count: 10 });
  assert.equal(r.ok, true);
  assert.equal((r.values!.ideas as string[]).length, 10);
});

test("happy path: priceHint is echoed and labeled as the user's own", () => {
  const r = runTool({ niche: "baking", skills: "photography", count: 2, priceHint: "$29" });
  assert.equal(r.ok, true);
  for (const idea of r.values!.ideas as string[]) {
    assert.ok(idea.includes("$29"), idea);
    assert.ok(idea.includes("not market data") || idea.includes("Your price hint"), idea);
  }
});

test("happy path: no priceHint -> 'not set' marker", () => {
  const r = runTool({ niche: "baking", skills: "photography", count: 1 });
  assert.equal(r.ok, true);
  assert.ok((r.values!.ideas as string[])[0].includes("not set"));
});

test("happy path: first skill before comma is used", () => {
  const res = generateIdeas("parenting", "meal planning, canva design", 10, null);
  assert.ok(res.ideas.some((i) => i.title.includes("meal planning")));
});

// --- validation errors -----------------------------------------------------

test("error: missing niche", () => {
  const r = runTool({ skills: "writing" });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("niche"));
});

test("error: empty niche", () => {
  const r = runTool({ niche: "   ", skills: "writing" });
  assert.equal(r.ok, false);
  assert.ok(r.error!.length > 0);
});

test("error: missing skills", () => {
  const r = runTool({ niche: "fitness" });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("skills"));
});

test("error: empty skills", () => {
  const r = runTool({ niche: "fitness", skills: "  " });
  assert.equal(r.ok, false);
  assert.ok(r.error!.length > 0);
});

test("error: count 0", () => {
  const r = runTool({ niche: "fitness", skills: "writing", count: 0 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("1"));
});

test("error: count 11", () => {
  const r = runTool({ niche: "fitness", skills: "writing", count: 11 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("10"));
});

test("error: fractional count", () => {
  const r = runTool({ niche: "fitness", skills: "writing", count: 2.5 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("whole number"));
});

test("error: niche too long", () => {
  const r = runTool({ niche: "x".repeat(81), skills: "writing" });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("too long"));
});

test("error: skills too long", () => {
  const r = runTool({ niche: "fitness", skills: "x".repeat(121) });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("too long"));
});

test("error: priceHint too long", () => {
  const r = runTool({ niche: "fitness", skills: "writing", priceHint: "$".repeat(21) });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("too long"));
});

// --- bank bounds -----------------------------------------------------------

test("bank: 14 formats, 10 titles, 8 validation steps", () => {
  assert.equal(BANK_SIZES.formats, 14);
  assert.equal(BANK_SIZES.titleTemplates, 10);
  assert.equal(BANK_SIZES.validationSteps, 8);
});

test("bank: 10 ideas cycle formats without immediate repeats", () => {
  const res = generateIdeas("fitness", "writing", 10, null);
  const formats = res.ideas.map((i) => i.format);
  assert.equal(new Set(formats).size, 10);
});

test("bank: titles are unique across 10 ideas", () => {
  const res = generateIdeas("fitness", "writing", 10, null);
  const titles = res.ideas.map((i) => i.title);
  assert.equal(new Set(titles).size, 10);
});

test("bank: every idea carries a non-empty validation step", () => {
  const res = generateIdeas("fitness", "writing", 10, null);
  for (const idea of res.ideas) assert.ok(idea.validationStep.length > 10);
});

// --- determinism + meta contract -------------------------------------------

test("determinism: same inputs twice -> identical outputs", () => {
  const v = { niche: "travel", skills: "video", count: 4, priceHint: "$19" };
  assert.deepEqual(runTool(v).values, runTool(v).values);
});

test("meta contract: output id is ideas", () => {
  const r = runTool({ niche: "travel", skills: "video", count: 2 });
  assert.ok(r.ok);
  assert.deepEqual(Object.keys(r.values!), ["ideas"]);
});
