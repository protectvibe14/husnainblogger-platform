import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const OUTPUT_IDS = ["sessionPlan", "totalMin", "endTime", "warnings"];

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("editor-pomodoro-timer", () => {
  it("happy path: defaults (25/5/4) from 09:00", () => {
    const v = okValues({ startTime: "09:00" });
    assert.equal(v.totalMin, 4 * 25 + 3 * 5); // 115
    assert.equal(v.endTime, "10:55");
    const plan = v.sessionPlan as string[];
    assert.equal(plan.length, 8); // header + 7 phases (4 focus + 3 breaks)
    assert.ok(plan[0].includes("09:00"), "header has start");
    assert.ok(plan[0].includes("10:55"), "header has end");
    assert.ok(plan[1].includes("Focus (Round 1)"), "first phase is focus");
    assert.ok(plan[1].includes("09:00 → 09:25"), "phase times");
    assert.ok(plan[2].includes("Break 1"), "second phase is break");
    assert.ok((v.warnings as string[]).length === 0, "no warnings");
  });

  it("no break after the final round", () => {
    const v = okValues({ startTime: "09:00", rounds: 2 });
    const plan = v.sessionPlan as string[];
    assert.equal(v.totalMin, 2 * 25 + 1 * 5); // 55
    assert.equal(plan[plan.length - 1].includes("Focus"), true);
    assert.ok(!plan.some((l) => l.includes("Break 2")), "no trailing break");
  });

  it("custom values: 50/10 x3 from 14:30", () => {
    const v = okValues({ startTime: "14:30", focusMin: 50, breakMin: 10, rounds: 3 });
    assert.equal(v.totalMin, 3 * 50 + 2 * 10); // 170
    assert.equal(v.endTime, "17:20");
  });

  it("taskLabel appears in the header", () => {
    const v = okValues({ startTime: "09:00", taskLabel: "Edit vlog" });
    assert.ok((v.sessionPlan as string[])[0].includes('"Edit vlog"'));
  });

  it("single round: no breaks at all", () => {
    const v = okValues({ startTime: "20:00", rounds: 1 });
    assert.equal(v.totalMin, 25);
    assert.equal(v.endTime, "20:25");
    assert.equal((v.sessionPlan as string[]).length, 2);
  });

  it("midnight crossing marks next day", () => {
    const v = okValues({ startTime: "23:30", rounds: 2 });
    assert.equal(v.endTime, "00:25 (next day)");
  });

  it(">8h session returns a warning but still succeeds", () => {
    const v = okValues({ startTime: "08:00", focusMin: 120, breakMin: 30, rounds: 4 });
    assert.equal(v.totalMin, 4 * 120 + 3 * 30); // 570
    const warnings = v.warnings as string[];
    assert.equal(warnings.length, 1);
    assert.ok(warnings[0].includes("over 8 hours"));
  });

  it("exactly 8h does not warn", () => {
    // 4*100 + 3*26.666... not integral; use 5 rounds of 96/6: 5*96+4*6=504. Try 480 exactly:
    // rounds=6, focus=60, break=24 -> 6*60+5*24 = 360+120 = 480
    const v = okValues({ startTime: "08:00", focusMin: 60, breakMin: 24, rounds: 6 });
    assert.equal(v.totalMin, 480);
    assert.equal((v.warnings as string[]).length, 0);
  });

  it("missing startTime errors", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.match(r.error!, /start time/i);
  });

  it("bad startTime formats error", () => {
    for (const bad of ["9am", "25:00", "09-00", "09:60", "", "noon"]) {
      const r = runTool({ startTime: bad });
      assert.equal(r.ok, false, bad);
    }
  });

  it("accepts single-digit hour 9:00", () => {
    const v = okValues({ startTime: "9:00" });
    assert.equal(v.endTime, "10:55");
  });

  it("focusMin below minimum errors", () => {
    const r = runTool({ startTime: "09:00", focusMin: 4 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Focus minutes must be between 5 and 120/);
  });

  it("focusMin above maximum errors", () => {
    const r = runTool({ startTime: "09:00", focusMin: 121 });
    assert.equal(r.ok, false);
  });

  it("breakMin out of range errors", () => {
    assert.equal(runTool({ startTime: "09:00", breakMin: 0 }).ok, false);
    assert.equal(runTool({ startTime: "09:00", breakMin: 31 }).ok, false);
  });

  it("rounds out of range errors", () => {
    assert.equal(runTool({ startTime: "09:00", rounds: 0 }).ok, false);
    assert.equal(runTool({ startTime: "09:00", rounds: 13 }).ok, false);
  });

  it("non-integer values error", () => {
    const r = runTool({ startTime: "09:00", focusMin: 25.5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("numeric strings are coerced", () => {
    const v = okValues({ startTime: "09:00", focusMin: "50", breakMin: "10", rounds: "2" });
    assert.equal(v.totalMin, 2 * 50 + 1 * 10);
  });

  it("deterministic: two runs identical", () => {
    const input = { startTime: "13:15", focusMin: 45, breakMin: 15, rounds: 5, taskLabel: "Grade reel" };
    assert.deepEqual(runTool(input), runTool(input));
  });

  it("output ids match meta outputs", () => {
    const v = okValues({ startTime: "09:00" });
    assert.deepEqual(Object.keys(v).sort(), [...OUTPUT_IDS].sort());
  });

  it("phase boundaries are contiguous", () => {
    const v = okValues({ startTime: "10:00", focusMin: 25, breakMin: 5, rounds: 3 });
    const plan = v.sessionPlan as string[];
    const times: string[] = [];
    for (const line of plan.slice(1)) {
      const m = /\((\d\d:\d\d) → (\d\d:\d\d)\)/.exec(line);
      assert.ok(m, `line has times: ${line}`);
      times.push(m[1], m[2]);
    }
    for (let k = 0; k + 2 < times.length; k += 2) {
      assert.equal(times[k + 1], times[k + 2], "each phase starts when the previous ends");
    }
  });
});
