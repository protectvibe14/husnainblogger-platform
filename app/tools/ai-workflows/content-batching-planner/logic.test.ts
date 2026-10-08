import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, TASK_BANK, DAYS_OF_WEEK, BLOCK_MINUTES } from "./logic.ts";

const BASE = {
  piecesPerBatch: 3,
  batchDay: "Saturday",
  platforms: "Blog, Instagram, YouTube",
};

function gridOf(result: { values?: Record<string, unknown> }): {
  columns: string[];
  rows: string[][];
} {
  assert.ok(result.values, "expected values");
  assert.ok(result.values["batchCalendar"], "expected batchCalendar");
  return result.values["batchCalendar"] as { columns: string[]; rows: string[][] };
}

describe("content-batching-planner: happy path", () => {
  it("returns ok with a batchCalendar grid and planSummary", () => {
    const r = runTool(BASE);
    assert.equal(r.ok, true);
    const g = gridOf(r);
    assert.deepEqual(g.columns, ["Piece", "Task", "Batch day", "Time slot", "Est. time", "Platform"]);
    assert.equal(typeof r.values!["planSummary"], "string");
  });

  it("creates 6 task rows per piece in TASK_BANK order", () => {
    const r = runTool(BASE);
    const g = gridOf(r);
    assert.equal(g.rows.length, 3 * 6);
    const firstPieceTasks = g.rows.slice(0, 6).map((row) => row[1]);
    assert.deepEqual(firstPieceTasks, [...TASK_BANK]);
  });

  it("labels pieces sequentially and rotates platforms", () => {
    const r = runTool(BASE);
    const g = gridOf(r);
    assert.equal(g.rows[0][0], "Piece 1");
    assert.equal(g.rows[0][5], "Blog");
    assert.equal(g.rows[6][0], "Piece 2");
    assert.equal(g.rows[6][5], "Instagram");
    assert.equal(g.rows[12][0], "Piece 3");
    assert.equal(g.rows[12][5], "YouTube");
  });

  it("wraps platform rotation back to the first platform", () => {
    const r = runTool({ ...BASE, piecesPerBatch: 4 });
    const g = gridOf(r);
    assert.equal(g.rows[18][0], "Piece 4");
    assert.equal(g.rows[18][5], "Blog");
  });

  it("computes sequential 30-minute time slots starting 9:00 AM", () => {
    const r = runTool(BASE);
    const g = gridOf(r);
    assert.equal(g.rows[0][3], "9:00 AM - 9:30 AM");
    assert.equal(g.rows[1][3], "9:30 AM - 10:00 AM");
    assert.equal(g.rows[2][4], "30 min");
  });

  it("shows the chosen batch day on every row", () => {
    const r = runTool({ ...BASE, batchDay: "Wednesday" });
    const g = gridOf(r);
    assert.ok(g.rows.every((row) => row[2] === "Wednesday"));
  });

  it("summary totals the blocks and hours", () => {
    const r = runTool(BASE);
    const s = r.values!["planSummary"] as string;
    assert.ok(s.includes("Saturday"));
    assert.ok(s.includes("18 task blocks"));
    assert.ok(s.includes("9h"));
    assert.ok(s.includes("Blog, Instagram, YouTube"));
  });

  it("accepts piecesPerBatch as a numeric string", () => {
    const r = runTool({ ...BASE, piecesPerBatch: "5" });
    assert.equal(r.ok, true);
    assert.equal(gridOf(r).rows.length, 5 * 6);
  });

  it("accepts platforms as an array of strings", () => {
    const r = runTool({ ...BASE, platforms: ["Blog", "Pinterest"] });
    assert.equal(r.ok, true);
    const g = gridOf(r);
    assert.equal(g.rows[6][5], "Pinterest");
  });

  it("dedupes repeated platforms case-insensitively", () => {
    const r = runTool({ ...BASE, platforms: "Blog, blog, BLOG, Instagram" });
    assert.equal(r.ok, true);
    const g = gridOf(r);
    assert.equal(g.rows[0][5], "Blog");
    assert.equal(g.rows[6][5], "Instagram");
    assert.equal(g.rows[12][5], "Blog");
  });
});

describe("content-batching-planner: validation errors", () => {
  it("rejects missing piecesPerBatch", () => {
    const { piecesPerBatch: _drop, ...rest } = BASE;
    const r = runTool(rest);
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Pieces per batch"));
  });

  it("rejects 0 pieces", () => {
    const r = runTool({ ...BASE, piecesPerBatch: 0 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("1 to 50"));
  });

  it("rejects 51 pieces", () => {
    const r = runTool({ ...BASE, piecesPerBatch: 51 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("1 to 50"));
  });

  it("rejects fractional pieces", () => {
    const r = runTool({ ...BASE, piecesPerBatch: 2.5 });
    assert.equal(r.ok, false);
  });

  it("rejects non-numeric pieces", () => {
    const r = runTool({ ...BASE, piecesPerBatch: "lots" });
    assert.equal(r.ok, false);
  });

  it("rejects an unknown batch day", () => {
    const r = runTool({ ...BASE, batchDay: "Someday" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Monday"));
  });

  it("rejects missing batch day", () => {
    const { batchDay: _drop, ...rest } = BASE;
    const r = runTool(rest);
    assert.equal(r.ok, false);
  });

  it("rejects empty platforms", () => {
    const r = runTool({ ...BASE, platforms: "   " });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("platforms"));
  });

  it("rejects missing platforms", () => {
    const { platforms: _drop, ...rest } = BASE;
    const r = runTool(rest);
    assert.equal(r.ok, false);
  });

  it("rejects more than 6 platforms", () => {
    const r = runTool({ ...BASE, platforms: "a,b,c,d,e,f,g" });
    assert.equal(r.ok, false);
  });

  it("rejects a non-string non-array platforms value", () => {
    const r = runTool({ ...BASE, platforms: 42 });
    assert.equal(r.ok, false);
  });
});

describe("content-batching-planner: edge cases", () => {
  it("handles exactly 1 piece", () => {
    const r = runTool({ ...BASE, piecesPerBatch: 1 });
    assert.equal(r.ok, true);
    const g = gridOf(r);
    assert.equal(g.rows.length, 6);
    const s = r.values!["planSummary"] as string;
    assert.ok(s.includes("1 piece x"));
    assert.ok(s.includes("3h"));
  });

  it("handles exactly 50 pieces", () => {
    const r = runTool({ ...BASE, piecesPerBatch: 50, platforms: "Blog" });
    assert.equal(r.ok, true);
    assert.equal(gridOf(r).rows.length, 50 * 6);
    const g = gridOf(r);
    assert.equal(g.rows[299][0], "Piece 50");
    assert.equal(g.rows[299][5], "Blog");
  });

  it("accepts all 7 weekdays", () => {
    for (const day of DAYS_OF_WEEK) {
      const r = runTool({ ...BASE, batchDay: day });
      assert.equal(r.ok, true, `expected ok for ${day}`);
    }
  });

  it("splits platforms on semicolons and newlines too", () => {
    const r = runTool({ ...BASE, platforms: "Blog;Instagram\nYouTube" });
    assert.equal(r.ok, true);
    const g = gridOf(r);
    assert.equal(g.rows[0][5], "Blog");
    assert.equal(g.rows[6][5], "Instagram");
    assert.equal(g.rows[12][5], "YouTube");
  });

  it("drops platform names longer than 40 chars but keeps the rest", () => {
    const long = "x".repeat(41);
    const r = runTool({ ...BASE, platforms: `Blog, ${long}` });
    assert.equal(r.ok, true);
    assert.equal(gridOf(r).rows[0][5], "Blog");
  });

  it("fails when every platform name is too long", () => {
    const r = runTool({ ...BASE, platforms: "x".repeat(50) });
    assert.equal(r.ok, false);
  });

  it("is deterministic: same inputs give identical output", () => {
    const a = runTool(BASE);
    const b = runTool(BASE);
    assert.deepEqual(a, b);
  });

  it("returns only the declared output ids", () => {
    const r = runTool(BASE);
    assert.deepEqual(Object.keys(r.values!).sort(), ["batchCalendar", "planSummary"]);
  });

  it("BLOCK_MINUTES constant matches the rendered est. time", () => {
    const r = runTool(BASE);
    const g = gridOf(r);
    assert.ok(g.rows.every((row) => row[4] === `${BLOCK_MINUTES} min`));
  });
});
