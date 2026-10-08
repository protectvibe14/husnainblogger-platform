import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkFreshness, parseISODate, runTool, FRESH_MAX_DAYS, NEEDS_UPDATE_MAX_DAYS } from "./logic.ts";

const TODAY = "2026-10-02";

describe("parseISODate", () => {
  it("parses valid dates", () => {
    const d = parseISODate("2026-01-15")!;
    assert.equal(d.getUTCFullYear(), 2026);
    assert.equal(d.getUTCMonth(), 0);
    assert.equal(d.getUTCDate(), 15);
  });
  it("rejects impossible dates", () => {
    assert.equal(parseISODate("2026-02-30"), null);
    assert.equal(parseISODate("2026-13-01"), null);
    assert.equal(parseISODate("not-a-date"), null);
    assert.equal(parseISODate("2026/01/15"), null);
    assert.equal(parseISODate(""), null);
  });
  it("leap day works", () => {
    assert.ok(parseISODate("2024-02-29") !== null);
    assert.equal(parseISODate("2025-02-29"), null);
  });
});

describe("checkFreshness — normal cases", () => {
  it("recently updated -> Fresh", () => {
    const r = checkFreshness({ publishDate: "2025-01-01", updatedDate: "2026-09-01", todayISO: TODAY });
    assert.equal(r.heuristic, true);
    assert.equal(r.verdict, "Fresh");
    assert.equal(r.daysSinceUpdate, 31);
    assert.ok(r.ageDays > 600);
    assert.equal(r.neverUpdated, false);
  });
  it("old update -> Needs update", () => {
    const r = checkFreshness({ publishDate: "2024-01-01", updatedDate: "2026-04-01", todayISO: TODAY });
    assert.equal(r.verdict, "Needs update");
    assert.equal(r.daysSinceUpdate, 184);
  });
  it("very old -> Stale", () => {
    const r = checkFreshness({ publishDate: "2020-06-01", updatedDate: "2021-01-01", todayISO: TODAY });
    assert.equal(r.verdict, "Stale");
    assert.ok(r.daysSinceUpdate > 365);
  });
  it("never updated + old -> bonus priority", () => {
    const r = checkFreshness({ publishDate: "2020-01-01", updatedDate: "2020-01-01", wordCount: 3000, todayISO: TODAY });
    assert.equal(r.neverUpdated, true);
    assert.ok(r.priorityScore >= 80, `expected >=80, got ${r.priorityScore}`);
  });
  it("word count raises priority", () => {
    const low = checkFreshness({ publishDate: "2024-01-01", updatedDate: "2024-06-01", wordCount: 200, todayISO: TODAY });
    const high = checkFreshness({ publishDate: "2024-01-01", updatedDate: "2024-06-01", wordCount: 4000, todayISO: TODAY });
    assert.ok(high.priorityScore > low.priorityScore);
  });
  it("priority capped at 100", () => {
    const r = checkFreshness({ publishDate: "2015-01-01", updatedDate: "2015-01-01", wordCount: 10000, todayISO: TODAY });
    assert.ok(r.priorityScore <= 100);
  });
});

describe("checkFreshness — boundaries", () => {
  it("exactly 90 days -> Fresh, 91 -> Needs update", () => {
    const fresh = checkFreshness({ publishDate: "2026-01-01", updatedDate: "2026-07-04", todayISO: TODAY });
    assert.equal(fresh.daysSinceUpdate, 90);
    assert.equal(fresh.verdict, "Fresh");
    const aging = checkFreshness({ publishDate: "2026-01-01", updatedDate: "2026-07-03", todayISO: TODAY });
    assert.equal(aging.daysSinceUpdate, 91);
    assert.equal(aging.verdict, "Needs update");
  });
  it("exactly 365 -> Needs update, 366 -> Stale", () => {
    const a = checkFreshness({ publishDate: "2024-01-01", updatedDate: "2025-10-02", todayISO: TODAY });
    assert.equal(a.daysSinceUpdate, 365);
    assert.equal(a.verdict, "Needs update");
    const b = checkFreshness({ publishDate: "2024-01-01", updatedDate: "2025-10-01", todayISO: TODAY });
    assert.equal(b.daysSinceUpdate, 366);
    assert.equal(b.verdict, "Stale");
  });
  it("band constants", () => {
    assert.equal(FRESH_MAX_DAYS, 90);
    assert.equal(NEEDS_UPDATE_MAX_DAYS, 365);
  });
  it("rejects future dates", () => {
    assert.throws(() => checkFreshness({ publishDate: "2027-01-01", updatedDate: "2027-01-01", todayISO: TODAY }), /future/);
  });
  it("rejects updated-before-published", () => {
    assert.throws(() => checkFreshness({ publishDate: "2026-05-01", updatedDate: "2026-01-01", todayISO: TODAY }), /before the publish/);
  });
  it("rejects invalid dates", () => {
    assert.throws(() => checkFreshness({ publishDate: "nope", updatedDate: "2026-01-01", todayISO: TODAY }), /Invalid publish/);
  });
  it("throws on non-string", () => {
    assert.throws(() => checkFreshness({ publishDate: 5 as unknown as string, updatedDate: "2026-01-01" }), TypeError);
  });
});

describe("runTool — contract", () => {
  it("rejects missing dates", () => {
    assert.equal(runTool({ publishDate: "", updatedDate: "2026-01-01" }).ok, false);
    assert.equal(runTool({ publishDate: "2026-01-01", updatedDate: "" }).ok, false);
  });
  it("rejects bad word count", () => {
    assert.equal(runTool({ publishDate: "2026-01-01", updatedDate: "2026-06-01", wordCount: -5 }).ok, false);
  });
  it("returns verdict, ages, priority, guidance, honesty note", () => {
    const r = runTool({ publishDate: "2024-01-01", updatedDate: "2024-06-01", wordCount: 1500 });
    assert.equal(r.ok, true);
    assert.ok(["Fresh", "Needs update", "Stale"].includes(r.values!.verdict as string));
    assert.ok(typeof r.values!.ageDays === "number");
    assert.ok(typeof r.values!.priorityScore === "number");
    assert.ok(typeof r.values!.guidance === "string");
    assert.ok((r.values!.heuristicNote as string).includes("Google publishes no freshness thresholds"));
  });
});
