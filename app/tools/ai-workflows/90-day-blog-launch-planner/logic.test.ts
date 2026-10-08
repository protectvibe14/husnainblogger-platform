import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, MILESTONES } from "./logic.ts";

function gridOf(result: { values?: Record<string, unknown> }): {
  columns: string[];
  rows: string[][];
} {
  assert.ok(result.values, "expected values");
  return result.values["milestoneGrid"] as { columns: string[]; rows: string[][] };
}

function futureIso(daysAhead: number): string {
  const ts = Date.UTC(2030, 0, 1) + daysAhead * 86400000;
  const d = new Date(ts);
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${mo}-${day}`;
}

const BASE = { launchDate: "2027-03-01", niche: "sourdough baking" };

describe("90-day-blog-launch-planner: happy path", () => {
  it("returns ok with milestoneGrid and planSummary", () => {
    const r = runTool(BASE);
    assert.equal(r.ok, true);
    const g = gridOf(r);
    assert.deepEqual(g.columns, ["Phase", "Date", "Timing", "Milestone", "What to do"]);
    assert.equal(typeof r.values!["planSummary"], "string");
  });

  it("emits all 12 fixed milestones", () => {
    const r = runTool(BASE);
    assert.equal(gridOf(r).rows.length, MILESTONES.length);
    assert.equal(MILESTONES.length, 12);
  });

  it("maps milestone dates onto the launch date offsets", () => {
    const r = runTool(BASE);
    const g = gridOf(r);
    // launch day row
    const launchRow = g.rows.find((row) => row[2] === "Launch day");
    assert.ok(launchRow);
    assert.equal(launchRow[1], "2027-03-01");
    // first pre-launch milestone is 60 days before: 2026-12-31
    const first = g.rows[0];
    assert.equal(first[0], "Pre-launch");
    assert.equal(first[1], "2026-12-31");
    assert.equal(first[2], "60 days before launch");
    // last post-launch milestone is 45 days after: 2027-04-15
    const last = g.rows[g.rows.length - 1];
    assert.equal(last[0], "Post-launch");
    assert.equal(last[1], "2027-04-15");
    assert.equal(last[2], "45 days after launch");
  });

  it("keeps phases in order: pre-launch, launch day, post-launch", () => {
    const r = runTool(BASE);
    const phases = gridOf(r).rows.map((row) => row[0]);
    const joined = phases.join("|");
    assert.ok(joined.startsWith("Pre-launch|Pre-launch"));
    assert.ok(joined.includes("Launch day"));
    assert.ok(joined.endsWith("Post-launch|Post-launch"));
  });

  it("uses every milestone's fixed title and detail", () => {
    const r = runTool(BASE);
    const g = gridOf(r);
    for (let i = 0; i < MILESTONES.length; i++) {
      assert.equal(g.rows[i][3], MILESTONES[i].title);
      assert.equal(g.rows[i][4], MILESTONES[i].detail);
    }
  });

  it("summary names the niche, launch date, and plan span", () => {
    const r = runTool(BASE);
    const s = r.values!["planSummary"] as string;
    assert.ok(s.includes("sourdough baking"));
    assert.ok(s.includes("2027-03-01"));
    assert.ok(s.includes("2026-12-31"));
    assert.ok(s.includes("2027-04-15"));
  });

  it("summary says the milestones are a fixed checklist", () => {
    const r = runTool(BASE);
    const s = r.values!["planSummary"] as string;
    assert.ok(s.toLowerCase().includes("fixed"));
  });

  it("accepts a leap-day launch date", () => {
    const r = runTool({ launchDate: "2028-02-29", niche: "gardening" });
    assert.equal(r.ok, true);
    const launchRow = gridOf(r).rows.find((row) => row[2] === "Launch day");
    assert.equal(launchRow![1], "2028-02-29");
  });
});

describe("90-day-blog-launch-planner: validation errors", () => {
  it("rejects a missing launchDate", () => {
    const r = runTool({ niche: "x" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("launch date"));
  });

  it("rejects a non-ISO date", () => {
    const r = runTool({ launchDate: "March 1 2027", niche: "x" });
    assert.equal(r.ok, false);
  });

  it("rejects an impossible date like 2027-02-30", () => {
    const r = runTool({ launchDate: "2027-02-30", niche: "x" });
    assert.equal(r.ok, false);
  });

  it("rejects month 13", () => {
    const r = runTool({ launchDate: "2027-13-01", niche: "x" });
    assert.equal(r.ok, false);
  });

  it("rejects a non-leap Feb 29", () => {
    const r = runTool({ launchDate: "2027-02-29", niche: "x" });
    assert.equal(r.ok, false);
  });

  it("rejects a non-string launchDate", () => {
    const r = runTool({ launchDate: 20270301, niche: "x" });
    assert.equal(r.ok, false);
  });

  it("rejects a missing niche", () => {
    const r = runTool({ launchDate: "2027-03-01" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("niche"));
  });

  it("rejects a blank niche", () => {
    const r = runTool({ launchDate: "2027-03-01", niche: "   " });
    assert.equal(r.ok, false);
  });

  it("rejects a niche longer than 120 chars", () => {
    const r = runTool({ launchDate: "2027-03-01", niche: "x".repeat(121) });
    assert.equal(r.ok, false);
  });

  it("collapses whitespace in the niche", () => {
    const r = runTool({ launchDate: "2027-03-01", niche: "  sourdough\n  baking " });
    assert.equal(r.ok, true);
    assert.ok((r.values!["planSummary"] as string).includes('"sourdough baking"'));
  });
});

describe("90-day-blog-launch-planner: edge cases", () => {
  it("flags past launch dates in the summary but still builds the plan", () => {
    const r = runTool({ launchDate: "2020-01-01", niche: "knitting" });
    assert.equal(r.ok, true);
    const s = r.values!["planSummary"] as string;
    assert.ok(s.toLowerCase().includes("in the past"));
    assert.equal(gridOf(r).rows.length, 12);
  });

  it("does not flag a future launch date", () => {
    const r = runTool({ launchDate: futureIso(30), niche: "knitting" });
    assert.equal(r.ok, true);
    const s = r.values!["planSummary"] as string;
    assert.ok(!s.toLowerCase().includes("in the past"));
  });

  it("handles month and year boundaries correctly", () => {
    const r = runTool({ launchDate: "2027-01-10", niche: "travel" });
    assert.equal(r.ok, true);
    const g = gridOf(r);
    // -60 days from 2027-01-10 = 2026-11-11
    assert.equal(g.rows[0][1], "2026-11-11");
    // +45 days from 2027-01-10 = 2027-02-24
    assert.equal(g.rows[g.rows.length - 1][1], "2027-02-24");
  });

  it("labels a 7-day offset with plural 'days'", () => {
    const r = runTool(BASE);
    const row = gridOf(r).rows.find((row) => row[1] === "2027-03-08");
    assert.ok(row);
    assert.equal(row[2], "7 days after launch");
  });

  it("is deterministic: same inputs on the same day give identical output", () => {
    const a = runTool(BASE);
    const b = runTool(BASE);
    assert.deepEqual(a, b);
  });

  it("returns only the declared output ids", () => {
    const r = runTool(BASE);
    assert.deepEqual(Object.keys(r.values!).sort(), ["milestoneGrid", "planSummary"]);
  });

  it("niche text never changes milestone titles (fixed template)", () => {
    const a = gridOf(runTool({ launchDate: "2027-03-01", niche: "knitting" }));
    const b = gridOf(runTool({ launchDate: "2027-03-01", niche: "crypto trading" }));
    assert.deepEqual(
      a.rows.map((row) => row.slice(0, 1).concat(row.slice(3))),
      b.rows.map((row) => row.slice(0, 1).concat(row.slice(3)))
    );
  });
});
