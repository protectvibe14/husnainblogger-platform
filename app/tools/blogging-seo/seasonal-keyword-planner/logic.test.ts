import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  EVENT_BANK,
  EVENT_BANK_VERSION,
  ANGLES_PER_EVENT,
  nicheMatchesSeed,
  publishByDate,
} from "./logic.ts";

const CURRENT_YEAR = new Date().getUTCFullYear();

function planOf(result: { values?: Record<string, unknown> }): { columns: string[]; rows: string[][] } {
  return result.values!["seasonalPlan"] as { columns: string[]; rows: string[][] };
}

describe("seasonal-keyword-planner", () => {
  it("happy path: full-year plan for a seed keyword", () => {
    const r = runTool({ seedKeyword: "protein powder", year: CURRENT_YEAR });
    assert.equal(r.ok, true);
    const p = planOf(r);
    assert.deepEqual(p.columns, ["Month", "Event", "Content angles", "Publish by", "Niche match"]);
    assert.equal(p.rows.length, EVENT_BANK.length);
    assert.equal(r.values!["eventBankVersion"], EVENT_BANK_VERSION);
    // sorted by month then name
    assert.equal(p.rows[0][0], "January");
    assert.equal(p.rows[p.rows.length - 1][0], "December");
    // every row has the seed substituted and no leftover placeholders
    for (const row of p.rows) {
      assert.ok(row[2].includes("protein powder"));
      assert.ok(!row[2].includes("{seed}"));
      assert.match(row[3], /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(row[4] === "Yes" || row[4] === "Generic");
    }
  });

  it("year omitted defaults to the current UTC year", () => {
    const r = runTool({ seedKeyword: "yoga mats" });
    assert.equal(r.ok, true);
    const p = planOf(r);
    assert.ok(p.rows[0][3].startsWith(String(CURRENT_YEAR)) || p.rows[0][3].startsWith(String(CURRENT_YEAR - 1)));
  });

  it("Christmas publish-by is 6 weeks before December 1", () => {
    // Dec 1 minus 42 days = Oct 20 (checked independently in test)
    assert.equal(publishByDate(2027, 12, 6), "2027-10-20");
    const r = runTool({ seedKeyword: "candles", year: 2027 });
    const row = planOf(r).rows.find((row) => row[1] === "Christmas")!;
    assert.equal(row[3], "2027-10-20");
  });

  it("publish-by can land in the previous year", () => {
    // New Year's resolutions (Jan, lead 4): Jan 1 2027 minus 28 days = Dec 4 2026
    assert.equal(publishByDate(2027, 1, 4), "2026-12-04");
  });

  it("year outside current +/- 1 is rejected", () => {
    for (const bad of [CURRENT_YEAR - 2, CURRENT_YEAR + 2, 1999, 2100]) {
      const r = runTool({ seedKeyword: "candles", year: bad });
      assert.equal(r.ok, false);
      assert.match(r.error!, /Year must be/);
    }
  });

  it("non-integer year is rejected", () => {
    const r = runTool({ seedKeyword: "candles", year: 2026.5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("year accepts the boundary values current-1 and current+1", () => {
    assert.equal(runTool({ seedKeyword: "candles", year: CURRENT_YEAR - 1 }).ok, true);
    assert.equal(runTool({ seedKeyword: "candles", year: CURRENT_YEAR + 1 }).ok, true);
  });

  it("missing seed keyword is rejected", () => {
    const r = runTool({ year: CURRENT_YEAR });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Seed keyword is required/);
  });

  it("seed shorter than 2 chars is rejected", () => {
    const r = runTool({ seedKeyword: "a" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /2-100/);
  });

  it("seed longer than 100 chars is rejected", () => {
    const r = runTool({ seedKeyword: "x".repeat(101) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /2-100/);
  });

  it("niche match: fitness seed matches fitness-tagged events", () => {
    const r = runTool({ seedKeyword: "home fitness workouts", year: CURRENT_YEAR });
    const p = planOf(r);
    const marathon = p.rows.find((row) => row[1] === "Spring marathon season")!;
    const resolutions = p.rows.find((row) => row[1] === "New Year's resolutions")!;
    assert.equal(marathon[4], "Yes");
    assert.equal(resolutions[4], "Yes");
    // generic events are always present and marked Generic
    const winterSales = p.rows.find((row) => row[1] === "Winter sales")!;
    assert.equal(winterSales[4], "Generic");
  });

  it("niche with no seasonal events in bank still gets generic events", () => {
    const r = runTool({ seedKeyword: "quantum cryptography", year: CURRENT_YEAR });
    assert.equal(r.ok, true);
    const p = planOf(r);
    assert.ok(p.rows.length > 0);
    assert.ok(p.rows.every((row) => row[4] === "Generic"));
    assert.ok(p.rows.every((row) => row[2].includes("quantum cryptography")));
  });

  it("unicode seed keyword works", () => {
    const r = runTool({ seedKeyword: "café recipes", year: CURRENT_YEAR });
    assert.equal(r.ok, true);
    const p = planOf(r);
    assert.ok(p.rows.every((row) => row[2].includes("café recipes")));
  });

  it("event bank has 36 events with 3 angles each and valid months", () => {
    assert.equal(EVENT_BANK.length, 36);
    for (const e of EVENT_BANK) {
      assert.ok(e.month >= 1 && e.month <= 12, `bad month on ${e.name}`);
      assert.equal(e.angles.length, ANGLES_PER_EVENT);
      assert.ok(e.leadWeeks >= 1 && e.leadWeeks <= 8);
      assert.ok(e.angles.every((a) => a.includes("{seed}")));
    }
  });

  it("nicheMatchesSeed is case-insensitive and handles plurals loosely", () => {
    const fitnessEvent = EVENT_BANK.find((e) => e.name === "Spring marathon season")!;
    assert.equal(nicheMatchesSeed("FITNESS coaching", fitnessEvent), true);
    assert.equal(nicheMatchesSeed("gardening tools", fitnessEvent), false);
  });

  it("output ids match meta.ts (seasonalPlan, eventBankVersion)", () => {
    const r = runTool({ seedKeyword: "tea", year: CURRENT_YEAR });
    assert.deepEqual(Object.keys(r.values!).sort(), ["eventBankVersion", "seasonalPlan"]);
  });

  it("determinism: two runs produce identical output", () => {
    const a = runTool({ seedKeyword: "sourdough bread", year: CURRENT_YEAR });
    const b = runTool({ seedKeyword: "sourdough bread", year: CURRENT_YEAR });
    assert.deepEqual(a, b);
  });
});
