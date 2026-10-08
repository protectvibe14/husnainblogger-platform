/**
 * Tests for the Launch Content Planner.
 * Run: node --test app/tools/instagram/launch-content-planner/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const FUTURE = "2099-03-10"; // safely in the future
const GOOD = { launchDate: FUTURE, offer: "Glow Serum", teaseDays: 7 };

interface Table {
  columns: string[];
  rows: string[][];
}

describe("launch-content-planner", () => {
  it("happy path: returns ok with timeline table and checklistExport", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["checklistExport", "timeline"]);
    const t = r.values!.timeline as Table;
    assert.deepEqual(t.columns, ["Date", "Day", "Phase", "Task"]);
  });

  it("default teaseDays=7 gives 7 + 5 + 3 = 15 rows", () => {
    const { teaseDays: _t, ...rest } = GOOD;
    const rows = (runTool(rest).values!.timeline as Table).rows;
    assert.equal(rows.length, 15);
  });

  it("teaseDays=0 skips the tease phase: 0 + 5 + 3 = 8 rows", () => {
    const rows = (runTool({ ...GOOD, teaseDays: 0 }).values!.timeline as Table).rows;
    assert.equal(rows.length, 8);
    assert.ok(rows.every((row) => row[2] !== "Tease"));
  });

  it("teaseDays=30 gives 30 + 5 + 3 = 38 rows; teaseDays=1 gives 9 rows", () => {
    assert.equal((runTool({ ...GOOD, teaseDays: 30 }).values!.timeline as Table).rows.length, 38);
    assert.equal((runTool({ ...GOOD, teaseDays: 1 }).values!.timeline as Table).rows.length, 9);
  });

  it("launch-day rows carry the launch date and 'Launch day' label", () => {
    const rows = (runTool(GOOD).values!.timeline as Table).rows;
    const launchRows = rows.filter((row) => row[2] === "Launch day");
    assert.equal(launchRows.length, 5);
    assert.ok(launchRows.every((row) => row[0] === FUTURE && row[1] === "Launch day"));
  });

  it("day labels count down correctly: T-7 first tease row, T+3 last row", () => {
    const rows = (runTool(GOOD).values!.timeline as Table).rows;
    assert.equal(rows[0][1], "T-7");
    assert.equal(rows[rows.length - 1][1], "T+3");
  });

  it("tease dates are calendar-correct relative to launch", () => {
    const rows = (runTool({ ...GOOD, teaseDays: 2 }).values!.timeline as Table).rows;
    assert.deepEqual(
      rows.slice(0, 2).map((r) => r[0]),
      ["2099-03-08", "2099-03-09"],
    );
    assert.deepEqual(rows.slice(-1).map((r) => r[0]), ["2099-03-13"]);
  });

  it("offer name is filled into tasks; no raw placeholders remain", () => {
    const rows = (runTool(GOOD).values!.timeline as Table).rows;
    assert.ok(rows.some((row) => row[3].includes("Glow Serum")));
    assert.ok(rows.every((row) => !row[3].includes("{offer}")));
  });

  it("checklistExport is plain text with phase headers and checkbox lines", () => {
    const text = runTool(GOOD).values!.checklistExport as string;
    assert.ok(text.includes("Instagram Product Launch Plan — Glow Serum"));
    assert.ok(text.includes(`Launch date: ${FUTURE}`));
    assert.ok(text.includes("TEASE (T-7 to T-1)"));
    assert.ok(text.includes("LAUNCH DAY"));
    assert.ok(text.includes("POST-LAUNCH (T+1 to T+3)"));
    const boxes = text.split("\n").filter((l) => l.startsWith("[ ] "));
    assert.equal(boxes.length, 15);
  });

  it("past launchDate -> error", () => {
    const r = runTool({ ...GOOD, launchDate: "2000-01-01" });
    assert.equal(r.ok, false);
    assert.ok(/future/i.test(r.error!));
  });

  it("invalid date formats -> error", () => {
    for (const d of ["", "not-a-date", "2099-13-01", "2099-02-30", "03/10/2099", "2099-3-1"]) {
      assert.equal(runTool({ ...GOOD, launchDate: d }).ok, false, `launchDate=${d}`);
    }
  });

  it("teaseDays -1, 31, 1.5, 'abc' -> error; '10' string ok", () => {
    for (const t of [-1, 31, 1.5, "abc"]) {
      const r = runTool({ ...GOOD, teaseDays: t });
      assert.equal(r.ok, false, `teaseDays=${t}`);
      assert.ok(/tease/i.test(r.error!), `teaseDays=${t}`);
    }
    assert.equal((runTool({ ...GOOD, teaseDays: "10" }).values!.timeline as Table).rows.length, 18);
  });

  it("missing offer -> error; offer over 100 chars -> error", () => {
    assert.equal(runTool({ launchDate: FUTURE, teaseDays: 7 }).ok, false);
    assert.equal(runTool({ ...GOOD, offer: "O".repeat(101) }).ok, false);
    assert.equal(runTool({ ...GOOD, offer: "O".repeat(100) }).ok, true);
  });

  it("missing launchDate -> error", () => {
    const r = runTool({ offer: "Glow Serum" });
    assert.equal(r.ok, false);
    assert.ok(/launch date/i.test(r.error!));
  });

  it("determinism: same inputs -> identical outputs", () => {
    assert.deepEqual(runTool(GOOD), runTool({ ...GOOD }));
  });

  it("month-boundary math: launch on 2099-04-01 with teaseDays=2 spans March/April", () => {
    const rows = (runTool({ launchDate: "2099-04-01", offer: "X", teaseDays: 2 }).values!.timeline as Table).rows;
    assert.deepEqual(
      rows.map((r) => r[0]),
      ["2099-03-30", "2099-03-31", "2099-04-01", "2099-04-01", "2099-04-01", "2099-04-01", "2099-04-01", "2099-04-02", "2099-04-03", "2099-04-04"],
    );
  });
});
