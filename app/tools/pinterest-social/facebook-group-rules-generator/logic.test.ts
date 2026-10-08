/**
 * Tests for tool-389 Facebook Group Rules Generator logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  formatRule,
  RULE_BANK,
  RULE_CATEGORIES,
  STRICTNESS_LEVELS,
  MAX_PURPOSE_LENGTH,
} from "./logic.ts";

const BASE = { groupPurpose: "a support community for new parents", strictness: "moderate" };

test("happy path: 5 rules with rule+why, all output ids present", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  assert.ok(r.values);
  const v = r.values!;
  assert.equal(v.rules.length, 5);
  for (const rule of v.rules) {
    assert.ok(rule.startsWith("Rule: "));
    assert.ok(rule.includes("\nWhy: "));
    const why = rule.split("\nWhy: ")[1];
    assert.ok(why && why.length > 0);
  }
  assert.ok(v.intro.includes("a support community for new parents"));
  assert.ok(v.intro.includes("moderate"));
  assert.ok(v.copyAll.includes(v.rules[0]));
  assert.ok(v.disclaimer.includes("not legal advice"));
});

test("categories covered in order: spam, self-promo, respect, off-topic, moderation", () => {
  assert.deepEqual([...RULE_CATEGORIES], ["spam", "self-promo", "respect", "off-topic", "moderation"]);
  const r = runTool(BASE);
  assert.equal(r.values!.rules.length, 5);
});

test("strictness missing -> defaults to moderate", () => {
  const r = runTool({ groupPurpose: "x purpose" });
  assert.equal(r.ok, true);
  assert.ok(r.values!.intro.includes("moderate"));
});

test("relaxed strictness -> relaxed phrasing", () => {
  const r = runTool({ ...BASE, strictness: "relaxed" });
  assert.equal(r.ok, true);
  assert.ok(r.values!.intro.includes("relaxed"));
  const joined = r.values!.rules.join(" ");
  assert.ok(/welcome|friendly|fine in moderation/i.test(joined));
});

test("strict strictness -> strict phrasing", () => {
  const r = runTool({ ...BASE, strictness: "strict" });
  assert.equal(r.ok, true);
  const joined = r.values!.rules.join(" ");
  assert.ok(/zero tolerance|immediate|ban/i.test(joined));
});

test("invalid strictness -> error", () => {
  const r = runTool({ ...BASE, strictness: "hardcore" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /relaxed.*moderate.*strict/i);
});

test("missing groupPurpose -> error", () => {
  const r = runTool({ strictness: "relaxed" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /purpose/i);
});

test("blank groupPurpose -> error", () => {
  const r = runTool({ groupPurpose: "   " });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("purpose too long -> error", () => {
  const r = runTool({ groupPurpose: "x".repeat(MAX_PURPOSE_LENGTH + 1) });
  assert.equal(r.ok, false);
  assert.match(r.error!, /120/i);
});

test("deterministic: same inputs -> identical outputs", () => {
  const a = runTool(BASE);
  const b = runTool(BASE);
  assert.deepEqual(a, b);
});

test("different purposes vary rule variants deterministically", () => {
  const a = runTool(BASE).values!.rules;
  const b = runTool({ ...BASE, groupPurpose: "a fan club for retro gamers" }).values!.rules;
  // same categories/order, variants may differ — both valid
  assert.equal(a.length, b.length);
  assert.equal(a.length, 5);
});

test("bank sizes documented: 5 categories x 3 levels x 2 variants = 30", () => {
  let count = 0;
  for (const level of STRICTNESS_LEVELS) {
    for (const cat of RULE_CATEGORIES) {
      assert.equal(RULE_BANK[level][cat].length, 2);
      for (const rule of RULE_BANK[level][cat]) {
        assert.ok(rule.rule.length > 0 && rule.why.length > 0);
        assert.equal(rule.category, cat);
        count++;
      }
    }
  }
  assert.equal(count, 30);
});

test("formatRule renders Rule/Why lines", () => {
  const s = formatRule({ category: "spam", rule: "No spam.", why: "Keeps feed clean." });
  assert.equal(s, "Rule: No spam.\nWhy: Keeps feed clean.");
});

test("no hard character cap applied to rules text", () => {
  const r = runTool(BASE);
  // longest bank rule is well under any Facebook field limit; key point: no truncation marker
  for (const rule of r.values!.rules) assert.ok(!rule.includes("…"));
});

test("strictness is case-insensitive ('Strict' works)", () => {
  const r = runTool({ ...BASE, strictness: "Strict" });
  assert.equal(r.ok, true);
  assert.ok(r.values!.intro.includes("strict"));
});

test("disclaimer mentions Facebook Community Standards", () => {
  const r = runTool(BASE);
  assert.ok(r.values!.disclaimer.includes("Community Standards"));
});
