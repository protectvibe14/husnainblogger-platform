import test from "node:test";
import assert from "node:assert/strict";
import { runTool, STYLES } from "./logic.ts";

const GOOD = { keywords: "pixel, design", style: "professional", nameCount: 5 };

test("happy path: returns nameIdeas list and availabilityNote", () => {
  const r = runTool(GOOD);
  assert.equal(r.ok, true);
  assert.ok(r.values);
  assert.ok(Array.isArray(r.values.nameIdeas));
  assert.equal(r.values.nameIdeas.length, 5);
  assert.equal(typeof r.values.availabilityNote, "string");
});

test("output ids match meta.ts: nameIdeas, availabilityNote", () => {
  const r = runTool(GOOD);
  assert.ok(r.values);
  assert.deepEqual(Object.keys(r.values).sort(), [
    "availabilityNote",
    "nameIdeas",
  ]);
});

test("keywords are title-cased and combined with suffixes", () => {
  const r = runTool({ keywords: "pixel", style: "professional", nameCount: 3 });
  assert.deepEqual(r.values!.nameIdeas, [
    "Pixel Studio",
    "Studio Pixel",
    "Pixel & Studio",
  ]);
});

test("every name is non-empty and unique", () => {
  const r = runTool({
    keywords: "bright, bold, brave",
    style: "playful",
    nameCount: 50,
  });
  assert.ok(r.values!.nameIdeas.length > 0);
  const seen = new Set(r.values!.nameIdeas.map((n) => n.toLowerCase()));
  assert.equal(seen.size, r.values!.nameIdeas.length);
  for (const n of r.values!.nameIdeas) {
    assert.ok(n.trim().length > 0);
  }
});

test("styles produce different banks: professional vs playful differ", () => {
  const a = runTool({ keywords: "pixel", style: "professional", nameCount: 10 });
  const b = runTool({ keywords: "pixel", style: "playful", nameCount: 10 });
  assert.notDeepEqual(a.values!.nameIdeas, b.values!.nameIdeas);
  assert.ok(a.values!.nameIdeas.some((n) => n.includes("Studio")));
  assert.ok(b.values!.nameIdeas.some((n) => n.includes("Squad")));
});

test("minimal style works", () => {
  const r = runTool({ keywords: "north", style: "minimal", nameCount: 4 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.nameIdeas[0], "North Studio");
});

test("merged pattern joins keyword and suffix into one word", () => {
  const r = runTool({ keywords: "web design", style: "playful", nameCount: 4 });
  assert.ok(
    r.values!.nameIdeas.includes("WebDesignSquad"),
    "expected merged one-word name WebDesignSquad",
  );
  const merged = r.values!.nameIdeas.find((n) => !n.includes(" "));
  assert.ok(merged, "expected at least one space-free merged name");
  assert.match(merged!, /^[A-Za-z0-9]+$/);
});

test("nameCount defaults to 10 when omitted", () => {
  const r = runTool({ keywords: "pixel", style: "professional" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.nameIdeas.length, 10);
});

test("nameCount of 1 returns a single name", () => {
  const r = runTool({ keywords: "pixel", style: "professional", nameCount: 1 });
  assert.equal(r.values!.nameIdeas.length, 1);
});

test("nameCount capped by available combinations (1 keyword = 40 combos)", () => {
  const r = runTool({ keywords: "pixel", style: "professional", nameCount: 50 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.nameIdeas.length, 40);
});

test("keywords accept newline-separated lists", () => {
  const r = runTool({
    keywords: "pixel\ndesign\nbright",
    style: "minimal",
    nameCount: 3,
  });
  assert.equal(r.ok, true);
  assert.equal(r.values!.nameIdeas.length, 3);
});

test("extra whitespace and blank lines are ignored", () => {
  const r = runTool({
    keywords: "  pixel ,, \n design ",
    style: "professional",
    nameCount: 2,
  });
  assert.equal(r.ok, true);
  assert.ok(r.values!.nameIdeas[0].startsWith("Pixel"));
});

test("more than 20 keywords are capped at 20", () => {
  const many = Array.from({ length: 30 }, (_, i) => "kw" + i).join(", ");
  const r = runTool({ keywords: many, style: "professional", nameCount: 50 });
  assert.equal(r.ok, true);
  // 20 keywords x 40 combos is plenty; the 50 requested must all be unique
  assert.equal(r.values!.nameIdeas.length, 50);
});

test("determinism: same inputs run twice give identical output", () => {
  const a = runTool(GOOD);
  const b = runTool(GOOD);
  assert.deepEqual(a, b);
});

test("missing keywords returns a human error", () => {
  const r = runTool({ style: "professional", nameCount: 5 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /at least one keyword/i);
});

test("blank keywords return a human error", () => {
  const r = runTool({ keywords: "  , \n ", style: "professional" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /at least one keyword/i);
});

test("invalid style returns a human error listing options", () => {
  const r = runTool({ keywords: "pixel", style: "fancy", nameCount: 5 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /professional, playful, minimal/);
});

test("missing style returns a human error", () => {
  const r = runTool({ keywords: "pixel", nameCount: 5 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /style/i);
});

test("nameCount of 0 is rejected", () => {
  const r = runTool({ keywords: "pixel", style: "professional", nameCount: 0 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /between 1 and 50/);
});

test("nameCount above 50 is rejected", () => {
  const r = runTool({ keywords: "pixel", style: "professional", nameCount: 51 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /between 1 and 50/);
});

test("non-integer nameCount is rejected", () => {
  const r = runTool({
    keywords: "pixel",
    style: "professional",
    nameCount: 2.5,
  });
  assert.equal(r.ok, false);
  assert.match(r.error!, /whole number/i);
});

test("availabilityNote warns about domains and trademarks", () => {
  const r = runTool(GOOD);
  assert.match(r.values!.availabilityNote, /domain/i);
  assert.match(r.values!.availabilityNote, /trademark/i);
  assert.match(r.values!.availabilityNote, /yourself/i);
});

test("copy says template-based, never AI", () => {
  const r = runTool(GOOD);
  assert.match(r.values!.availabilityNote, /template-based/i);
  assert.match(r.values!.availabilityNote, /not AI/i);
});

test("STYLES export lists the three documented styles", () => {
  assert.deepEqual(STYLES, ["professional", "playful", "minimal"]);
});
