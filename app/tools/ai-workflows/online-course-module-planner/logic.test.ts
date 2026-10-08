import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  LESSONS_PER_MODULE_PATTERN,
  LESSON_NAME_TEMPLATES,
  MIN_MODULES,
  MAX_MODULES,
  MIN_LESSON_MINUTES,
  MAX_LESSON_MINUTES,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const base = {
  courseTopic: "Watercolor for Beginners",
  moduleCount: 4,
  lessonLengthMinutes: 12,
};

describe("online-course-module-planner", () => {
  it("happy path: grid has one row per module", () => {
    const r = runTool({ ...base });
    assert.equal(r.ok, true);
    const grid = r.values!.moduleGrid as { columns: string[]; rows: string[][] };
    assert.equal(grid.rows.length, 4);
    assert.deepEqual(grid.columns, ["Module", "Lesson name template", "Lessons", "Est. duration"]);
    assert.equal(grid.rows[0][0], "Module 1");
  });

  it("happy path: lesson slots follow the [4,3,5] rotation", () => {
    const r = runTool({ ...base, moduleCount: 6 });
    const grid = r.values!.moduleGrid as { columns: string[]; rows: string[][] };
    const slots = grid.rows.map((row) => Number(row[2]));
    assert.deepEqual(slots, [4, 3, 5, 4, 3, 5]);
  });

  it("happy path: per-module durations equal slots x lesson minutes", () => {
    const r = runTool({ ...base });
    const grid = r.values!.moduleGrid as { columns: string[]; rows: string[][] };
    assert.equal(grid.rows[0][3], "48 min"); // 4 x 12
    assert.equal(grid.rows[1][3], "36 min"); // 3 x 12
    assert.equal(grid.rows[2][3], "60 min"); // 5 x 12
  });

  it("happy path: summary carries totals (4+3+5+4 = 16 lessons, 192 min)", () => {
    const r = runTool({ ...base });
    const summary = r.values!.summary as string;
    assert.match(summary, /Watercolor for Beginners/);
    assert.match(summary, /16 lessons/);
    assert.match(summary, /192 min total/);
    assert.match(summary, /3h 12m/);
  });

  it("happy path: lesson-name templates contain the topic, not curriculum", () => {
    const r = runTool({ ...base });
    const grid = r.values!.moduleGrid as { columns: string[]; rows: string[][] };
    assert.ok(grid.rows[0][1].includes("Watercolor for Beginners"));
    assert.match(r.values!.summary as string, /templates/);
  });

  it("edge case: fractional lesson minutes rounded up (7.5 -> 8)", () => {
    const r = runTool({ ...base, lessonLengthMinutes: 7.5, moduleCount: 2 });
    assert.equal(r.ok, true);
    const grid = r.values!.moduleGrid as { columns: string[]; rows: string[][] };
    assert.equal(grid.rows[0][3], "32 min"); // 4 x 8, not 4 x 7
  });

  it("min modules (2): accepted", () => {
    const r = runTool({ ...base, moduleCount: 2 });
    assert.equal(r.ok, true);
    assert.equal((r.values!.moduleGrid as { rows: string[][] }).rows.length, 2);
  });

  it("max modules (20): accepted", () => {
    const r = runTool({ ...base, moduleCount: 20 });
    assert.equal(r.ok, true);
    assert.equal((r.values!.moduleGrid as { rows: string[][] }).rows.length, 20);
  });

  it("moduleCount 1: rejected", () => {
    const r = runTool({ ...base, moduleCount: 1 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 2 and 20/);
  });

  it("moduleCount 21: rejected", () => {
    const r = runTool({ ...base, moduleCount: 21 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 2 and 20/);
  });

  it("moduleCount non-integer: rejected", () => {
    const r = runTool({ ...base, moduleCount: 3.2 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("moduleCount as numeric string ('5'): accepted", () => {
    const r = runTool({ ...base, moduleCount: "5" });
    assert.equal(r.ok, true);
    assert.equal((r.values!.moduleGrid as { rows: string[][] }).rows.length, 5);
  });

  it("missing courseTopic: rejected", () => {
    const r = runTool({ moduleCount: 4, lessonLengthMinutes: 12 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /course topic/);
  });

  it("blank courseTopic: rejected", () => {
    const r = runTool({ ...base, courseTopic: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /course topic/);
  });

  it("lessonLengthMinutes 0: rejected", () => {
    const r = runTool({ ...base, lessonLengthMinutes: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 1 and 480/);
  });

  it("lessonLengthMinutes 481: rejected", () => {
    const r = runTool({ ...base, lessonLengthMinutes: 481 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 1 and 480/);
  });

  it('lessonLengthMinutes non-numeric ("long"): rejected', () => {
    const r = runTool({ ...base, lessonLengthMinutes: "long" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 1 and 480/);
  });

  it("determinism: same inputs produce identical output", () => {
    const a = runTool({ ...base });
    const b = runTool({ ...base });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs ids", () => {
    const r = runTool({ ...base });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), outputs.map((o) => o.id).sort());
  });

  it("fixed banks documented: 3-slot lesson pattern, 3 name templates", () => {
    assert.deepEqual(LESSONS_PER_MODULE_PATTERN, [4, 3, 5]);
    assert.equal(LESSON_NAME_TEMPLATES.length, 3);
    assert.ok(LESSON_NAME_TEMPLATES.every((t) => t.includes("{topic}") && t.includes("{k}")));
  });

  it("constants honor spec bounds", () => {
    assert.equal(MIN_MODULES, 2);
    assert.equal(MAX_MODULES, 20);
    assert.equal(MIN_LESSON_MINUTES, 1);
    assert.equal(MAX_LESSON_MINUTES, 480);
  });

  it("non-object input: rejected", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.match(r.error!, /object/);
  });
});
