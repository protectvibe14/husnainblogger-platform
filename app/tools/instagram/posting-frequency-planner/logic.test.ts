import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildPlan,
  pickTips,
  FORMATS,
  DAY_NAMES,
  CONSISTENCY_TIPS,
  MIN_POSTS_PER_WEEK,
  MAX_POSTS_PER_WEEK,
  MAX_AVAILABLE_HOURS,
} from "./logic.ts";

const BASIC = {
  postsPerWeek: 3,
  formatReels: true,
  formatCarousel: true,
  formatStories: false,
  availableHours: 10,
};

describe("posting-frequency-planner", () => {
  it("happy path: builds a 3-post weekly plan", () => {
    const res = runTool(BASIC);
    assert.equal(res.ok, true);
    const plan = res.values!.weeklyPlan as { columns: string[]; rows: string[][] };
    assert.deepEqual(plan.columns, ["Day", "Format", "Task"]);
    assert.equal(plan.rows.length, 3);
  });

  it("output ids match meta.ts outputs", () => {
    const res = runTool(BASIC);
    assert.deepEqual(Object.keys(res.values!).sort(), [
      "consistencyTips",
      "weeklyPlan",
      "workloadWarning",
    ]);
  });

  it("plan spreads posts across the week without duplicates", () => {
    const res = runTool({ ...BASIC, postsPerWeek: 5, formatStories: true });
    assert.equal(res.ok, true);
    const plan = res.values!.weeklyPlan as { rows: string[][] };
    assert.equal(plan.rows.length, 5);
    const days = plan.rows.map((r) => r[0]);
    assert.equal(new Set(days).size, 5, "days should not repeat for 5 posts");
  });

  it("plan rotates through selected formats", () => {
    const { rows } = buildPlan(4, FORMATS.filter((f) => f.inputId !== "formatStories"));
    assert.deepEqual(
      rows.map((r) => r.format),
      ["Reel", "Carousel", "Reel", "Carousel"],
    );
  });

  it("single post lands on Monday", () => {
    const { rows } = buildPlan(1, FORMATS);
    assert.equal(rows[0].day, "Monday");
  });

  it("7 posts fill every day", () => {
    const { rows } = buildPlan(7, FORMATS);
    assert.deepEqual(rows.map((r) => r.day), DAY_NAMES);
  });

  it("14 posts max: each day appears twice", () => {
    const { rows } = buildPlan(14, FORMATS);
    assert.equal(rows.length, 14);
    for (const day of DAY_NAMES) {
      assert.equal(rows.filter((r) => r.day === day).length, 2, day);
    }
  });

  it("no workload warning when plan fits available hours", () => {
    const res = runTool(BASIC); // 3 posts, 90+60+90 min = 4h vs 10h
    assert.equal(res.ok, true);
    assert.match(String(res.values!.workloadWarning), /fits your time/);
  });

  it("edge case: workload warning when effort exceeds available hours", () => {
    // 14 reels x 90 min = 21h needed, only 2h available
    const res = runTool({
      postsPerWeek: 14,
      formatReels: true,
      formatCarousel: false,
      formatStories: false,
      availableHours: 2,
    });
    assert.equal(res.ok, true);
    assert.match(String(res.values!.workloadWarning), /Workload warning/);
  });

  it("edge case: plan exactly at the hour boundary still fits", () => {
    // 3 stories = 60 min = 1h available
    const res = runTool({
      postsPerWeek: 3,
      formatReels: false,
      formatCarousel: false,
      formatStories: true,
      availableHours: 1,
    });
    assert.equal(res.ok, true);
    assert.match(String(res.values!.workloadWarning), /fits your time/);
  });

  it("validation: postsPerWeek below minimum fails", () => {
    const res = runTool({ ...BASIC, postsPerWeek: 0 });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /1 to 14/);
  });

  it("validation: postsPerWeek above maximum fails", () => {
    const res = runTool({ ...BASIC, postsPerWeek: 15 });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /1 to 14/);
  });

  it("validation: fractional postsPerWeek fails", () => {
    const res = runTool({ ...BASIC, postsPerWeek: 2.5 });
    assert.equal(res.ok, false);
    assert.equal(typeof res.error, "string");
  });

  it("validation: missing postsPerWeek fails", () => {
    const { postsPerWeek, ...rest } = BASIC;
    const res = runTool(rest);
    assert.equal(res.ok, false);
    assert.match(String(res.error), /Posts per week/);
  });

  it("validation: availableHours of zero fails", () => {
    const res = runTool({ ...BASIC, availableHours: 0 });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /greater than 0/);
  });

  it("validation: negative availableHours fails", () => {
    const res = runTool({ ...BASIC, availableHours: -5 });
    assert.equal(res.ok, false);
  });

  it("validation: availableHours above 168 fails", () => {
    const res = runTool({ ...BASIC, availableHours: MAX_AVAILABLE_HOURS + 1 });
    assert.equal(res.ok, false);
  });

  it("validation: no format selected fails", () => {
    const res = runTool({
      postsPerWeek: 3,
      formatReels: false,
      formatCarousel: false,
      formatStories: false,
      availableHours: 10,
    });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /at least one format/);
  });

  it("accepts numeric strings from form inputs", () => {
    const res = runTool({ ...BASIC, postsPerWeek: "4", availableHours: "6" });
    assert.equal(res.ok, true);
    const plan = res.values!.weeklyPlan as { rows: string[][] };
    assert.equal(plan.rows.length, 4);
  });

  it("determinism: same inputs twice give identical output", () => {
    assert.deepEqual(runTool(BASIC), runTool(BASIC));
  });

  it("tips: returns 4 tips, rotated deterministically by postsPerWeek", () => {
    const tips = pickTips(3, 4);
    assert.equal(tips.length, 4);
    assert.ok(tips.every((t) => CONSISTENCY_TIPS.includes(t)));
    assert.deepEqual(pickTips(3, 4), pickTips(3, 4));
    assert.notDeepEqual(pickTips(3, 4), pickTips(4, 4));
  });

  it("bank bounds: 3 formats, 6 tips, 7 days", () => {
    assert.equal(FORMATS.length, 3);
    assert.equal(CONSISTENCY_TIPS.length, 6);
    assert.equal(DAY_NAMES.length, 7);
    for (const f of FORMATS) {
      assert.ok(f.effortMinutes > 0, f.inputId);
      assert.ok(f.task.length > 0, f.inputId);
    }
  });

  it("constants: min 1, max 14 posts per week", () => {
    assert.equal(MIN_POSTS_PER_WEEK, 1);
    assert.equal(MAX_POSTS_PER_WEEK, 14);
  });

  it("table rows are [day, format, task] triples", () => {
    const res = runTool(BASIC);
    const plan = res.values!.weeklyPlan as { rows: string[][] };
    for (const row of plan.rows) {
      assert.equal(row.length, 3);
      assert.ok(DAY_NAMES.includes(row[0]));
      assert.ok(["Reel", "Carousel", "Stories"].includes(row[1]));
    }
  });
});
