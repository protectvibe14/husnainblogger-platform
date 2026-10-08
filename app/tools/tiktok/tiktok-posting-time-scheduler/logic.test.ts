import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  WEEKDAYS,
  TIME_SLOTS,
  PLAN_TIPS,
  MIN_POSTS_PER_WEEK,
  MAX_POSTS_PER_WEEK,
  MAX_NICHE_LENGTH,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = ["schedule", "planSummary", "tips"];

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values;
}

const base = () => ({ timezone: "America/New_York", niche: "fitness", postsPerWeek: 5 });

describe("tiktok-posting-time-scheduler", () => {
  it("happy path: 5 posts -> table with 5 rows", () => {
    const v = okValues(base());
    const schedule = v.schedule as { columns: string[]; rows: string[][] };
    assert.deepEqual(schedule.columns, ["Day", "Time window (local)", "Why this window"]);
    assert.equal(schedule.rows.length, 5);
    for (const row of schedule.rows) {
      assert.equal(row.length, 3);
      assert.ok(WEEKDAYS.includes(row[0]), `known weekday: ${row[0]}`);
      assert.ok(row[1].includes("America/New_York"), "timezone in window label");
      assert.ok(row[2].includes("general estimate"), "window labeled as estimate");
    }
  });

  it("planSummary names niche, count, timezone and states the limitation", () => {
    const v = okValues(base());
    const s = v.planSummary as string;
    assert.ok(s.includes("5-post"), "post count");
    assert.ok(s.includes("fitness"), "niche");
    assert.ok(s.includes("America/New_York"), "timezone");
    assert.ok(s.includes("cannot see your TikTok audience"), "honesty statement");
  });

  it("tips are returned and mention TikTok Analytics", () => {
    const v = okValues(base());
    const tips = v.tips as string[];
    assert.equal(tips.length, PLAN_TIPS.length);
    assert.ok(tips.some((t) => t.includes("TikTok Analytics")), "analytics tip present");
  });

  it("1 post per week -> exactly 1 row", () => {
    const v = okValues({ ...base(), postsPerWeek: 1 });
    assert.equal((v.schedule as { rows: string[][] }).rows.length, 1);
  });

  it("21 posts per week -> exactly 21 rows", () => {
    const v = okValues({ ...base(), postsPerWeek: 21 });
    assert.equal((v.schedule as { rows: string[][] }).rows.length, 21);
  });

  it("rows are sorted by weekday order then slot", () => {
    const v = okValues({ ...base(), postsPerWeek: 21 });
    const rows = (v.schedule as { rows: string[][] }).rows;
    const idxs = rows.map((r) => WEEKDAYS.indexOf(r[0]));
    for (let i = 1; i < idxs.length; i++) assert.ok(idxs[i] >= idxs[i - 1], "sorted by weekday");
  });

  it("determinism: same inputs -> identical outputs", () => {
    assert.deepEqual(runTool(base()).values, runTool(base()).values);
  });

  it("different niches can shift day placement", () => {
    const a = JSON.stringify(okValues({ ...base(), niche: "fitness" }).schedule);
    const b = JSON.stringify(okValues({ ...base(), niche: "cooking" }).schedule);
    assert.ok(a.length > 0 && b.length > 0);
    // not guaranteed different, but both valid plans
    assert.ok((okValues({ ...base(), niche: "cooking" }).schedule as { rows: string[][] }).rows.length === 5);
  });

  it("missing timezone -> error", () => {
    const r = runTool({ niche: "fitness", postsPerWeek: 3 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /timezone/i);
  });

  it("invalid timezone format -> error", () => {
    for (const tz of ["New York", "UTC+5", "123", "America/"]) {
      const r = runTool({ ...base(), timezone: tz });
      assert.equal(r.ok, false, `expected error for ${tz}`);
      assert.match(r.error as string, /IANA/i);
    }
  });

  it("IANA sub-area zones are accepted", () => {
    const v = okValues({ ...base(), timezone: "America/Argentina/Buenos_Aires" });
    const rows = (v.schedule as { rows: string[][] }).rows;
    assert.ok(rows[0][1].includes("America/Argentina/Buenos_Aires"));
  });

  it("missing niche -> error", () => {
    const r = runTool({ timezone: "Europe/London", postsPerWeek: 3 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /niche/i);
  });

  it("niche too long -> error", () => {
    const r = runTool({ ...base(), niche: "x".repeat(MAX_NICHE_LENGTH + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /48/);
  });

  it("postsPerWeek 0 -> error", () => {
    const r = runTool({ ...base(), postsPerWeek: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /between 1 and 21/);
  });

  it("postsPerWeek 22 -> error", () => {
    const r = runTool({ ...base(), postsPerWeek: MAX_POSTS_PER_WEEK + 1 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /between 1 and 21/);
  });

  it("postsPerWeek non-integer -> error", () => {
    const r = runTool({ ...base(), postsPerWeek: 2.5 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /whole number/);
  });

  it("postsPerWeek non-numeric string -> error", () => {
    const r = runTool({ ...base(), postsPerWeek: "five" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /whole number/);
  });

  it("postsPerWeek numeric string is accepted", () => {
    const v = okValues({ ...base(), postsPerWeek: "7" });
    assert.equal((v.schedule as { rows: string[][] }).rows.length, 7);
  });

  it("word banks match documented sizes", () => {
    assert.equal(TIME_SLOTS.length, 5);
    assert.equal(WEEKDAYS.length, 7);
    assert.equal(PLAN_TIPS.length, 6);
    for (const s of TIME_SLOTS) {
      assert.ok(s.window.length > 0 && s.why.length > 0);
      assert.ok(s.why.toLowerCase().includes("estimate"), "every slot labeled as estimate");
    }
  });

  it("output ids match meta.ts outputs", () => {
    const ids = outputs.map((o) => o.id).sort();
    assert.deepEqual(ids, EXPECTED_OUTPUT_IDS.slice().sort());
  });

  it("every window stays a fixed general slot (no invented audience claim)", () => {
    const v = okValues(base());
    const summary = v.planSummary as string;
    assert.ok(!/your audience is online/i.test(summary), "never claims audience data");
    assert.ok(!/your followers/i.test(summary) || /cannot see/i.test(summary), "no follower-data claim");
  });
});
