/**
 * Tests for tool-387 Facebook Page Name Generator logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  parseKeywords,
  PAGE_NAME_LIMIT,
  KEYWORD_PATTERNS,
  NOTYPE_PATTERNS,
  NAME_COUNT,
  MAX_BUSINESS_TYPE_LENGTH,
  MAX_KEYWORD_LENGTH,
  MAX_KEYWORDS,
  MISLEADING_CLAIMS,
} from "./logic.ts";

const BASE = { businessType: "bakery", keywords: "custom cakes, Chicago" };

test("happy path: 8 names, all <= 75 chars, all output ids present", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  assert.ok(r.values);
  const v = r.values!;
  assert.equal(v.pageNames.length, NAME_COUNT);
  for (const n of v.pageNames) {
    assert.ok(n.length > 0);
    assert.ok(n.length <= PAGE_NAME_LIMIT, `name too long: "${n}" (${n.length})`);
    assert.ok(n.includes("Bakery"));
  }
  assert.equal(v.copyAll, v.pageNames.join("\n"));
  assert.ok(v.availabilityNote.includes("cannot be checked"));
});

test("names use the keywords", () => {
  const r = runTool(BASE);
  const joined = r.values!.pageNames.join(" ");
  assert.ok(joined.includes("Custom Cakes") || joined.includes("Chicago"));
});

test("no keywords -> still returns 8 type-only names", () => {
  const r = runTool({ businessType: "plumbing service" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.pageNames.length, NAME_COUNT);
  for (const n of r.values!.pageNames) assert.ok(n.length <= PAGE_NAME_LIMIT);
});

test("empty keywords string -> type-only names", () => {
  const r = runTool({ businessType: "bakery", keywords: "   " });
  assert.equal(r.ok, true);
  assert.equal(r.values!.pageNames.length, NAME_COUNT);
});

test("missing businessType -> error", () => {
  const r = runTool({ keywords: "cakes" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /business type/i);
});

test("blank businessType -> error", () => {
  const r = runTool({ businessType: "  " });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("businessType too long -> error", () => {
  const r = runTool({ businessType: "x".repeat(MAX_BUSINESS_TYPE_LENGTH + 1) });
  assert.equal(r.ok, false);
  assert.match(r.error!, /60/i);
});

for (const claim of MISLEADING_CLAIMS) {
  test(`misleading claim "${claim}" rejected`, () => {
    const r = runTool({ businessType: `super ${claim} bakery` });
    assert.equal(r.ok, false);
    assert.match(r.error!, /official\/verified|reject/i);
  });
}

test("misleading claim in keywords rejected", () => {
  const r = runTool({ businessType: "bakery", keywords: "official" });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("keyword too long -> error", () => {
  const r = runTool({ businessType: "bakery", keywords: "x".repeat(MAX_KEYWORD_LENGTH + 1) });
  assert.equal(r.ok, false);
  assert.match(r.error!, /keyword/i);
});

test("parseKeywords: commas, newlines, cap at 5", () => {
  assert.deepEqual(parseKeywords("a, b\nc"), ["a", "b", "c"]);
  assert.deepEqual(parseKeywords("a,a,b,c,d,e,f"), ["a", "a", "b", "c", "d"]);
  assert.equal(parseKeywords("a,b,c,d,e,f").length, MAX_KEYWORDS);
  assert.deepEqual(parseKeywords(123), []);
});

test("deterministic: same inputs -> identical outputs", () => {
  const a = runTool(BASE);
  const b = runTool(BASE);
  assert.deepEqual(a, b);
});

test("names are unique within a run", () => {
  const names = runTool(BASE).values!.pageNames;
  assert.equal(new Set(names).size, names.length);
});

test("bank sizes documented: 8 keyword + 8 type-only patterns", () => {
  assert.equal(KEYWORD_PATTERNS.length, 8);
  assert.equal(NOTYPE_PATTERNS.length, 8);
});

test("no pattern produces an empty or placeholder-leaking name", () => {
  const r = runTool({ businessType: "yoga studio", keywords: "morning classes" });
  for (const n of r.values!.pageNames) {
    assert.ok(!n.includes("{type}") && !n.includes("{kw}"));
  }
});
