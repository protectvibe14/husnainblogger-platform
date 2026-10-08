/**
 * Tests for tool-364 Pinterest Niche Idea Generator logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  NICHE_BANK,
  NICHE_BANK_SIZE,
  IDEAS_RETURNED,
  MIN_HITS_FOR_SPECIFIC,
  AUDIENCE_OPTIONS,
  ALL_AUDIENCES,
  NON_VISUAL_HINTS,
  CLARIFIER_PICKS,
} from "./logic.ts";

test("happy path: decor interests -> Home Decor ranked first", () => {
  const r = runTool({ interests: "home decor and interior design" });
  assert.equal(r.ok, true);
  assert.ok(r.values);
  assert.equal(r.values!.ideaCount, IDEAS_RETURNED);
  assert.equal(r.values!.nicheIdeas.rows[0][0], "Home Decor");
  assert.ok(r.values!.nicheIdeas.rows[0][2].includes("Matches your interest"));
  assert.equal(r.values!.audienceUsed, ALL_AUDIENCES);
});

test("food interests -> Recipes & Meal Prep ranked first", () => {
  const r = runTool({ interests: "cooking recipes and baking" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.nicheIdeas.rows[0][0], "Recipes & Meal Prep");
});

test("audience option accepted: UK", () => {
  const r = runTool({ interests: "gardening plants", audience: "UK" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.audienceUsed, "UK");
  assert.ok(r.values!.guidance.includes("UK"));
});

test("audience lowercase accepted", () => {
  const r = runTool({ interests: "gardening", audience: "ca" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.audienceUsed, "CA");
});

test("validation: invalid audience -> error", () => {
  const r = runTool({ interests: "gardening", audience: "FR" });
  assert.equal(r.ok, false);
  assert.ok(r.error && /audience/i.test(r.error));
});

test("validation: missing interests -> error", () => {
  const r = runTool({});
  assert.equal(r.ok, false);
  assert.ok(r.error && /interest/i.test(r.error));
});

test("validation: blank interests -> error", () => {
  const r = runTool({ interests: "   " });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("edge case vague interests: 3 exploratory picks + clarifier list", () => {
  const r = runTool({ interests: "stuff things" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.ideaCount, 3);
  assert.ok(/too vague|exploratory/i.test(r.values!.guidance));
  for (const pick of CLARIFIER_PICKS.slice(0, 3)) {
    assert.ok(r.values!.guidance.includes(pick.split(" ")[0]), `missing clarifier ${pick}`);
  }
  assert.ok(CLARIFIER_PICKS.length >= 8);
});

test("edge case non-visual niche: honest handicap note", () => {
  const r = runTool({ interests: "small business etsy side hustle accounting" });
  assert.equal(r.ok, true);
  assert.ok(/non-visual|handicap/i.test(r.values!.guidance));
  assert.ok(r.values!.ideaCount > 0);
  assert.ok(NON_VISUAL_HINTS.includes("accounting"));
});

test("edge case: vague + non-visual -> vague clarifier wins", () => {
  const r = runTool({ interests: "xyz abc" });
  assert.equal(r.ok, true);
  assert.ok(/vague/i.test(r.values!.guidance));
});

test("bank size documented: 24 niches", () => {
  assert.equal(NICHE_BANK.length, NICHE_BANK_SIZE);
  assert.equal(NICHE_BANK_SIZE, 24);
  for (const n of NICHE_BANK) {
    assert.ok(n.name.length > 2);
    assert.ok(n.keywords.length >= 3);
    assert.ok(n.angle.length > 10);
    assert.ok(n.rationale.length > 10);
    assert.ok(!/lorem/i.test(n.name + n.angle + n.rationale));
  }
});

test("ranking: more keyword hits rank higher", () => {
  const r = runTool({ interests: "wedding bride bridal planning" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.nicheIdeas.rows[0][0], "Wedding Planning");
});

test("determinism: same inputs twice give identical outputs", () => {
  const a = runTool({ interests: "travel itineraries", audience: "AU" });
  const b = runTool({ interests: "travel itineraries", audience: "AU" });
  assert.deepEqual(a, b);
});

test("guidance never claims market data or profitability", () => {
  const r = runTool({ interests: "nail art manicure" });
  assert.equal(r.ok, true);
  assert.ok(/not market data|not a profitability/i.test(r.values!.guidance));
});

test("output ids match meta.ts: nicheIdeas, ideaCount, audienceUsed, guidance", () => {
  const r = runTool({ interests: "dogs and pets" });
  assert.equal(r.ok, true);
  const keys = Object.keys(r.values!).sort();
  assert.deepEqual(keys, ["audienceUsed", "guidance", "ideaCount", "nicheIdeas"]);
  assert.ok(MIN_HITS_FOR_SPECIFIC >= 1);
  assert.deepEqual(AUDIENCE_OPTIONS, ["US", "UK", "CA", "AU"]);
});
