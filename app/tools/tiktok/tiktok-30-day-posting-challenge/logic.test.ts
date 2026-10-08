import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, REST_DAYS, TOTAL_CHALLENGE_DAYS } from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_IDS = ["calendar"];

interface Calendar {
  columns: string[];
  rows: string[][];
}

function okResult(niche: string, startDate: string) {
  const r = runTool({ niche, startDate });
  assert.equal(r.ok, true, `expected ok, got error: ${"error" in r ? r.error : ""}`);
  return (r as { ok: true; values: { calendar: Calendar } }).values.calendar;
}

describe("tiktok-30-day-posting-challenge", () => {
  it("happy path: calendar table with 30 rows", () => {
    const cal = okResult("sourdough baking", "2026-10-01");
    assert.deepEqual(cal.columns, ["Day", "Date", "Video idea", "Format", "CTA"]);
    assert.equal(cal.rows.length, 30);
    assert.equal(TOTAL_CHALLENGE_DAYS, 30);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ niche: "x", startDate: "2026-10-01" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys((r as { ok: true; values: object }).values).sort(), EXPECTED_IDS.sort());
    assert.deepEqual(outputs.map((o) => o.id).sort(), EXPECTED_IDS.sort());
  });

  it("day 1 starts on the start date (Thu, Oct 1)", () => {
    const cal = okResult("sourdough baking", "2026-10-01");
    assert.equal(cal.rows[0][0], "1");
    assert.equal(cal.rows[0][1], "Thu, Oct 1");
  });

  it("dates advance one day per row", () => {
    const cal = okResult("sourdough baking", "2026-10-01");
    assert.equal(cal.rows[6][1], "Wed, Oct 7");
    assert.equal(cal.rows[29][1], "Fri, Oct 30");
  });

  it("dates cross month boundaries correctly", () => {
    const cal = okResult("sourdough baking", "2026-01-30");
    assert.equal(cal.rows[2][1], "Sun, Feb 1");
  });

  it("rest days 7, 14, 21, 28 are marked as rest", () => {
    assert.deepEqual(REST_DAYS, [7, 14, 21, 28]);
    const cal = okResult("sourdough baking", "2026-10-01");
    for (const d of REST_DAYS) {
      const row = cal.rows[d - 1];
      assert.equal(row[3], "Rest day", `day ${d} should be a rest day`);
      assert.ok(row[4].toLowerCase().includes("no posting"), `day ${d} CTA should say no posting`);
    }
  });

  it("posting days include the niche in the idea", () => {
    const cal = okResult("sourdough baking", "2026-10-01");
    assert.ok(cal.rows[0][2].includes("sourdough baking"));
    assert.ok(cal.rows[1][2].includes("sourdough baking"));
  });

  it("no leftover {niche} slots anywhere", () => {
    const cal = okResult("sourdough baking", "2026-10-01");
    for (const row of cal.rows) {
      for (const cell of row) {
        assert.ok(!cell.includes("{niche}"), `leftover slot in ${cell}`);
      }
    }
  });

  it("every row has a non-empty CTA", () => {
    const cal = okResult("sourdough baking", "2026-10-01");
    for (const row of cal.rows) {
      assert.ok(row[4].length > 3, `empty CTA on day ${row[0]}`);
    }
  });

  it("missing niche: error", () => {
    const r = runTool({ startDate: "2026-10-01" });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("niche"));
  });

  it("whitespace-only niche: error", () => {
    const r = runTool({ niche: "   ", startDate: "2026-10-01" });
    assert.equal(r.ok, false);
  });

  it("niche over 120 chars: error", () => {
    const r = runTool({ niche: "n".repeat(121), startDate: "2026-10-01" });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("120 characters"));
  });

  it("missing startDate: error", () => {
    const r = runTool({ niche: "sourdough baking" });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("start date"));
  });

  it("garbage date: error", () => {
    const r = runTool({ niche: "sourdough baking", startDate: "not-a-date" });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("not a valid calendar date"));
  });

  it("impossible month (2026-13-01): error", () => {
    const r = runTool({ niche: "sourdough baking", startDate: "2026-13-01" });
    assert.equal(r.ok, false);
  });

  it("impossible day (2026-02-30): error", () => {
    const r = runTool({ niche: "sourdough baking", startDate: "2026-02-30" });
    assert.equal(r.ok, false);
  });

  it("deterministic: same inputs run twice → identical", () => {
    const a = okResult("sourdough baking", "2026-10-01");
    const b = okResult("sourdough baking", "2026-10-01");
    assert.deepEqual(a, b);
  });

  it("niche whitespace is trimmed (same output)", () => {
    const a = okResult("  sourdough baking  ", "2026-10-01");
    const b = okResult("sourdough baking", "2026-10-01");
    assert.deepEqual(a, b);
  });
});
