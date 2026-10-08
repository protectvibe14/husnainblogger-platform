import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  MODIFIER_TEMPLATES,
  BUILT_IN_CITIES,
  MAX_LOCATIONS,
  MAX_LOCATION_CHARS,
} from "./logic.ts";

function expansionsOf(result: { values?: Record<string, unknown> }): string[] {
  return result.values!["expansions"] as string[];
}

describe("local-keyword-modifier-expander", () => {
  it("happy path: default city list produces 24 cities x 6 templates", () => {
    const r = runTool({ seedKeyword: "plumber" });
    assert.equal(r.ok, true);
    const ex = expansionsOf(r);
    assert.equal(ex.length, BUILT_IN_CITIES.length * MODIFIER_TEMPLATES.length);
    assert.equal(r.values!["count"], ex.length);
    assert.ok(ex.includes("plumber in New York"));
    assert.ok(ex.includes("New York plumber"));
    assert.ok(ex.includes("best plumber in New York"));
    assert.ok(ex.includes("affordable plumber in New York"));
    assert.ok(ex.includes("plumber New York prices"));
    assert.ok(ex.includes("plumber near New York"));
  });

  it("custom location list replaces the built-in list", () => {
    const r = runTool({ seedKeyword: "dentist", locations: "Austin\nDenver" });
    assert.equal(r.ok, true);
    const ex = expansionsOf(r);
    assert.equal(ex.length, 2 * MODIFIER_TEMPLATES.length);
    assert.ok(ex.includes("dentist in Austin"));
    assert.ok(ex.includes("Denver dentist"));
    assert.ok(!ex.some((s) => s.includes("New York")));
  });

  it("custom locations accepted as an array", () => {
    const r = runTool({ seedKeyword: "roofer", locations: ["Miami", "Tampa"] });
    assert.equal(r.ok, true);
    assert.equal(expansionsOf(r).length, 2 * MODIFIER_TEMPLATES.length);
  });

  it("blank lines in textarea input are skipped", () => {
    const r = runTool({ seedKeyword: "roofer", locations: "\nMiami\n\nTampa\n" });
    assert.equal(r.ok, true);
    assert.equal(expansionsOf(r).length, 2 * MODIFIER_TEMPLATES.length);
  });

  it("duplicate locations are deduped case-insensitively", () => {
    const r = runTool({ seedKeyword: "roofer", locations: "Miami\nmiami\n MIAMI \nTampa" });
    assert.equal(r.ok, true);
    assert.equal(expansionsOf(r).length, 2 * MODIFIER_TEMPLATES.length);
  });

  it("unicode place names are supported", () => {
    const r = runTool({ seedKeyword: "baker", locations: "München\nZürich\nSão Paulo" });
    assert.equal(r.ok, true);
    const ex = expansionsOf(r);
    assert.ok(ex.includes("baker in München"));
    assert.ok(ex.includes("Zürich baker"));
    assert.ok(ex.includes("best baker in São Paulo"));
  });

  it("missing seed keyword is rejected", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.match(r.error!, /Seed keyword is required/);
  });

  it("seed shorter than 2 or longer than 100 chars is rejected", () => {
    assert.match(runTool({ seedKeyword: "a" }).error!, /2-100/);
    assert.match(runTool({ seedKeyword: "x".repeat(101) }).error!, /2-100/);
  });

  it("seed of exactly 2 and 100 chars is accepted", () => {
    assert.equal(runTool({ seedKeyword: "ab" }).ok, true);
    assert.equal(runTool({ seedKeyword: "x".repeat(100) }).ok, true);
  });

  it("location longer than 60 chars is rejected", () => {
    const r = runTool({ seedKeyword: "plumber", locations: "x".repeat(MAX_LOCATION_CHARS + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /60/);
  });

  it("location of exactly 60 chars is accepted", () => {
    const r = runTool({ seedKeyword: "plumber", locations: "x".repeat(MAX_LOCATION_CHARS) });
    assert.equal(r.ok, true);
  });

  it("more than 50 locations is rejected", () => {
    const many = Array.from({ length: MAX_LOCATIONS + 1 }, (_, i) => `City${i}`);
    const r = runTool({ seedKeyword: "plumber", locations: many });
    assert.equal(r.ok, false);
    assert.match(r.error!, /50/);
  });

  it("exactly 50 locations is accepted", () => {
    const many = Array.from({ length: MAX_LOCATIONS }, (_, i) => `City${i}`);
    const r = runTool({ seedKeyword: "plumber", locations: many });
    assert.equal(r.ok, true);
    assert.equal(expansionsOf(r).length, MAX_LOCATIONS * MODIFIER_TEMPLATES.length);
  });

  it("non-text location entries are rejected", () => {
    const r = runTool({ seedKeyword: "plumber", locations: ["Austin", { city: 1 }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /text only/);
  });

  it("empty locations falls back to the built-in city list", () => {
    assert.equal(expansionsOf(runTool({ seedKeyword: "plumber", locations: "" })).length,
      BUILT_IN_CITIES.length * MODIFIER_TEMPLATES.length);
    assert.equal(expansionsOf(runTool({ seedKeyword: "plumber", locations: [] })).length,
      BUILT_IN_CITIES.length * MODIFIER_TEMPLATES.length);
  });

  it("word-bank bounds: 6 templates and 24 built-in cities", () => {
    assert.equal(MODIFIER_TEMPLATES.length, 6);
    assert.equal(BUILT_IN_CITIES.length, 24);
    assert.ok(MODIFIER_TEMPLATES.every((t) => t.includes("{seed}") && t.includes("{loc}")));
    assert.equal(new Set(BUILT_IN_CITIES.map((c) => c.toLowerCase())).size, 24);
  });

  it("output ids match meta.ts (expansions, count)", () => {
    const r = runTool({ seedKeyword: "plumber" });
    assert.deepEqual(Object.keys(r.values!).sort(), ["count", "expansions"]);
  });

  it("determinism: two runs produce identical output", () => {
    const a = runTool({ seedKeyword: "electrician", locations: "Austin\nDenver" });
    const b = runTool({ seedKeyword: "electrician", locations: "Austin\nDenver" });
    assert.deepEqual(a, b);
  });
});
