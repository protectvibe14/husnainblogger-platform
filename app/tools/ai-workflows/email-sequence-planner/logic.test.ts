import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  SEQUENCE_GOALS,
  MIN_EMAILS,
  MAX_EMAILS,
  MIN_GAP,
  MAX_GAP,
  SLOTS_PER_GOAL,
  SCHEDULE_COLUMNS,
} from "./logic.ts";

function schedule(r: { values?: Record<string, unknown> }) {
  return r.values?.schedule as { columns: string[]; rows: string[][] };
}

describe("email-sequence-planner", () => {
  it("happy path: 5-email welcome sequence, 2 days apart", () => {
    const r = runTool({ sequenceGoal: "welcome", emailCount: 5, daysBetween: 2 });
    assert.equal(r.ok, true);
    const s = schedule(r);
    assert.deepEqual(s.columns, [...SCHEDULE_COLUMNS]);
    assert.equal(s.rows.length, 5);
    assert.deepEqual(s.rows[0][0], "1");
    assert.deepEqual(s.rows[0][1], "Day 1");
    assert.deepEqual(s.rows[1][1], "Day 3");
    assert.deepEqual(s.rows[4][1], "Day 9");
    assert.equal(typeof r.values?.summary, "string");
    assert.match(r.values?.summary as string, /5-email welcome sequence/);
    assert.match(r.values?.summary as string, /day 9/i);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ sequenceGoal: "nurture", emailCount: 3, daysBetween: 7 });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), ["schedule", "summary"]);
  });

  it("min boundary: 2 emails", () => {
    const r = runTool({ sequenceGoal: "sales", emailCount: 2, daysBetween: 1 });
    assert.equal(r.ok, true);
    assert.equal(schedule(r).rows.length, 2);
  });

  it("max boundary: 12 emails", () => {
    const r = runTool({ sequenceGoal: "re-engagement", emailCount: 12, daysBetween: 14 });
    assert.equal(r.ok, true);
    assert.equal(schedule(r).rows.length, 12);
    assert.equal(schedule(r).rows[11][1], "Day 155"); // 1 + 11*14
  });

  it("below min emailCount rejected", () => {
    const r = runTool({ sequenceGoal: "welcome", emailCount: 1, daysBetween: 2 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /between 2 and 12/);
  });

  it("above max emailCount rejected", () => {
    const r = runTool({ sequenceGoal: "welcome", emailCount: 13, daysBetween: 2 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /between 2 and 12/);
  });

  it("missing emailCount rejected", () => {
    const r = runTool({ sequenceGoal: "welcome", daysBetween: 2 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /how many emails/i);
  });

  it("negative daysBetween rejected", () => {
    const r = runTool({ sequenceGoal: "welcome", emailCount: 4, daysBetween: -1 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /between 0 and 14/);
  });

  it("daysBetween above 14 rejected", () => {
    const r = runTool({ sequenceGoal: "welcome", emailCount: 4, daysBetween: 15 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /between 0 and 14/);
  });

  it("missing daysBetween rejected", () => {
    const r = runTool({ sequenceGoal: "welcome", emailCount: 4 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /days between/i);
  });

  it("daysBetween = 0: all emails on day 1", () => {
    const r = runTool({ sequenceGoal: "nurture", emailCount: 3, daysBetween: 0 });
    assert.equal(r.ok, true);
    for (const row of schedule(r).rows) assert.deepEqual(row[1], "Day 1");
    assert.match(r.values?.summary as string, /all sent on day 1/);
  });

  it("fractional emailCount rounded", () => {
    const r = runTool({ sequenceGoal: "welcome", emailCount: 4.6, daysBetween: 2 });
    assert.equal(r.ok, true);
    assert.equal(schedule(r).rows.length, 5);
  });

  it("fractional daysBetween rounded (spec edge case)", () => {
    const r = runTool({ sequenceGoal: "welcome", emailCount: 3, daysBetween: 2.5 });
    assert.equal(r.ok, true);
    const rows = schedule(r).rows;
    // gap rounds 2.5 -> 3, so days are 1, 4, 7 (all whole days, deterministic)
    assert.deepEqual(rows[0][1], "Day 1");
    assert.deepEqual(rows[1][1], "Day 4");
    assert.deepEqual(rows[2][1], "Day 7");
  });

  it("string numbers accepted", () => {
    const r = runTool({ sequenceGoal: "sales", emailCount: "4", daysBetween: "3" });
    assert.equal(r.ok, true);
    assert.equal(schedule(r).rows.length, 4);
  });

  it("invalid sequenceGoal rejected", () => {
    const r = runTool({ sequenceGoal: "drip", emailCount: 4, daysBetween: 2 });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /welcome/);
  });

  it("missing sequenceGoal rejected", () => {
    const r = runTool({ emailCount: 4, daysBetween: 2 });
    assert.equal(r.ok, false);
  });

  it("subject slots are templates, not written copy", () => {
    const r = runTool({ sequenceGoal: "welcome", emailCount: 6, daysBetween: 1 });
    const rows = schedule(r).rows;
    const slotText = rows.map((row) => row[2]).join(" ");
    assert.ok(slotText.includes("["), "expected [bracket] placeholders for the user to fill");
    for (const row of rows) {
      assert.ok(row[2].length > 0 && row[3].length > 0, "no empty slots");
    }
  });

  it("each goal has exactly 12 subject + 12 purpose slots", () => {
    // exercised indirectly: 12-email sequence works for every goal
    for (const goal of SEQUENCE_GOALS) {
      const r = runTool({ sequenceGoal: goal, emailCount: SLOTS_PER_GOAL, daysBetween: 1 });
      assert.equal(r.ok, true, goal);
      assert.equal(schedule(r).rows.length, SLOTS_PER_GOAL, goal);
    }
  });

  it("non-finite emailCount rejected", () => {
    const r = runTool({ sequenceGoal: "welcome", emailCount: NaN, daysBetween: 2 });
    assert.equal(r.ok, false);
  });

  it("deterministic: same inputs give identical output twice", () => {
    const a = runTool({ sequenceGoal: "sales", emailCount: 6, daysBetween: 3 });
    const b = runTool({ sequenceGoal: "sales", emailCount: 6, daysBetween: 3 });
    assert.deepEqual(a, b);
  });

  it("bounds constants match spec", () => {
    assert.equal(MIN_EMAILS, 2);
    assert.equal(MAX_EMAILS, 12);
    assert.equal(MIN_GAP, 0);
    assert.equal(MAX_GAP, 14);
  });
});
