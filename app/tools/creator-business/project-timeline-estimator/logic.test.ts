import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, parseTasks, parseStartDate } from "./logic.ts";
import * as meta from "./meta.ts";

const BASIC = {
  tasks: "Script writing, 4\nRough cut edit, 8\nColor grade, 2",
  workHoursPerDay: 6,
  startDate: "2026-10-05",
  bufferDays: 2,
};

describe("project-timeline-estimator", () => {
  it("estimates total hours, work days, and end date", () => {
    const r = runTool(BASIC);
    assert.equal(r.ok, true);
    const v = r.values!;
    assert.equal(v.totalHours, 14);
    // ceil(14/6 + 2) = ceil(4.333) = 5 work days
    assert.equal(v.estimatedWorkDays, 5);
    // 2026-10-05 + 5 days = 2026-10-10
    assert.equal(v.estimatedEndDate, "2026-10-10");
    const table = v.taskBreakdown as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["Task", "Hours", "Share of total"]);
    assert.equal(table.rows.length, 4); // 3 tasks + TOTAL
    assert.deepEqual(table.rows[0], ["Script writing", "4 h", "28.57%"]);
    assert.deepEqual(table.rows[3], ["TOTAL", "14 h", "100%"]);
  });

  it("accepts tasks as an array of records", () => {
    const r = runTool({
      tasks: [
        { name: "A", hours: 3 },
        { name: "B", hours: 3 },
      ],
      workHoursPerDay: 6,
      startDate: "2026-10-05",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.totalHours, 6);
    assert.equal(r.values!.estimatedWorkDays, 1); // ceil(6/6 + 0)
    assert.equal(r.values!.estimatedEndDate, "2026-10-06");
  });

  it("shows the buffer note when bufferDays is 0", () => {
    const r = runTool({
      tasks: "Edit, 8",
      workHoursPerDay: 8,
      startDate: "2026-10-05",
      bufferDays: 0,
    });
    assert.equal(r.ok, true);
    const table = (r.values!.taskBreakdown as { rows: string[][] }).rows;
    const note = table.find((row) => row[0] === "Note");
    assert.ok(note);
    assert.match(note[1], /bufferDays = 0/);
  });

  it("treats a missing bufferDays as 0 with the note shown", () => {
    const r = runTool({ tasks: "Edit, 8", workHoursPerDay: 8, startDate: "2026-10-05" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.estimatedWorkDays, 1);
    const rows = (r.values!.taskBreakdown as { rows: string[][] }).rows;
    assert.ok(rows.some((row) => row[0] === "Note"));
  });

  it("hides the buffer note when bufferDays > 0", () => {
    const r = runTool(BASIC);
    assert.equal(r.ok, true);
    const rows = (r.values!.taskBreakdown as { rows: string[][] }).rows;
    assert.ok(!rows.some((row) => row[0] === "Note"));
  });

  it("rounds up partial days", () => {
    const r = runTool({
      tasks: "Edit, 7",
      workHoursPerDay: 6,
      startDate: "2026-10-05",
      bufferDays: 0,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.estimatedWorkDays, 2); // ceil(7/6)
  });

  it("accepts workHoursPerDay as a numeric string", () => {
    const r = runTool({
      tasks: "Edit, 12",
      workHoursPerDay: "6",
      startDate: "2026-10-05",
      bufferDays: 0,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.estimatedWorkDays, 2);
  });

  it("handles zero total hours", () => {
    const r = runTool({
      tasks: "Waiting on client, 0",
      workHoursPerDay: 6,
      startDate: "2026-10-05",
      bufferDays: 0,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.totalHours, 0);
    assert.equal(r.values!.estimatedWorkDays, 0);
    assert.equal(r.values!.estimatedEndDate, "2026-10-05");
    const rows = (r.values!.taskBreakdown as { rows: string[][] }).rows;
    assert.deepEqual(rows[0], ["Waiting on client", "0 h", "—"]);
  });

  it("rejects empty tasks", () => {
    const r = runTool({ tasks: "  ", workHoursPerDay: 6, startDate: "2026-10-05" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one task/);
  });

  it("rejects a malformed task line", () => {
    const r = runTool({
      tasks: "Edit 8",
      workHoursPerDay: 6,
      startDate: "2026-10-05",
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Task line 1/);
  });

  it("rejects a task with an empty name", () => {
    const r = runTool({
      tasks: ", 8",
      workHoursPerDay: 6,
      startDate: "2026-10-05",
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /task name is required/);
  });

  it("rejects non-numeric task hours", () => {
    const r = runTool({
      tasks: "Edit, many",
      workHoursPerDay: 6,
      startDate: "2026-10-05",
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /hours/);
  });

  it("rejects NaN task hours in a record array", () => {
    const parsed = parseTasks([{ name: "Edit", hours: NaN }]);
    assert.equal(parsed.ok, false);
  });

  it("rejects workHoursPerDay of 0", () => {
    const r = runTool({ tasks: "Edit, 8", workHoursPerDay: 0, startDate: "2026-10-05" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than 0/);
  });

  it("rejects negative workHoursPerDay", () => {
    const r = runTool({ tasks: "Edit, 8", workHoursPerDay: -2, startDate: "2026-10-05" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than 0/);
  });

  it("rejects Infinity workHoursPerDay", () => {
    const r = runTool({ tasks: "Edit, 8", workHoursPerDay: Infinity, startDate: "2026-10-05" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than 0/);
  });

  it("rejects an invalid start date", () => {
    const r = runTool({ tasks: "Edit, 8", workHoursPerDay: 6, startDate: "2026-13-40" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /valid date/);
  });

  it("rejects a non-date start date", () => {
    const r = runTool({ tasks: "Edit, 8", workHoursPerDay: 6, startDate: "tomorrow" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /valid date/);
  });

  it("rejects a missing start date", () => {
    const r = runTool({ tasks: "Edit, 8", workHoursPerDay: 6, startDate: "" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /start date/i);
  });

  it("rejects negative bufferDays", () => {
    const r = runTool({
      tasks: "Edit, 8",
      workHoursPerDay: 6,
      startDate: "2026-10-05",
      bufferDays: -1,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Buffer days/);
  });

  it("parseStartDate rejects impossible calendar dates", () => {
    assert.equal(parseStartDate("2026-02-30").ok, false);
    assert.equal(parseStartDate("2026-10-05").ok, true);
  });

  it("end date is computed in UTC (no timezone drift)", () => {
    const r = runTool({
      tasks: "Edit, 6",
      workHoursPerDay: 6,
      startDate: "2026-01-01",
      bufferDays: 0,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.estimatedEndDate, "2026-01-02");
  });

  it("is deterministic: same inputs give identical outputs", () => {
    const a = runTool(BASIC);
    const b = runTool(BASIC);
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(BASIC);
    assert.equal(r.ok, true);
    const expected = meta.outputs.map((o) => o.id).sort();
    const actual = Object.keys(r.values!).sort();
    assert.deepEqual(actual, expected);
  });
});
