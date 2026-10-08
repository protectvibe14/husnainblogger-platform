import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, analyzeStreak, parseDateUTC, isoWeekIndex } from "./logic.ts";

describe("parseDateUTC / isoWeekIndex", () => {
  it("accepts valid ISO dates", () => {
    assert.ok(parseDateUTC("2026-09-01") !== null);
  });
  it("rejects impossible calendar dates", () => {
    assert.equal(parseDateUTC("2026-02-30"), null);
    assert.equal(parseDateUTC("2026-13-01"), null);
  });
  it("rejects non-ISO formats", () => {
    assert.equal(parseDateUTC("09/01/2026"), null);
    assert.equal(parseDateUTC("2026-9-1"), null);
  });
  it("isoWeekIndex is monotonic across a year boundary", () => {
    const a = isoWeekIndex("2025-12-28"); // Sunday, last ISO week of 2025
    const b = isoWeekIndex("2026-01-04"); // next Sunday
    assert.ok(b > a, `${a} -> ${b}`);
  });
});

describe("runTool — daily cadence happy path", () => {
  const dates = ["2026-09-26", "2026-09-27", "2026-09-28", "2026-09-29", "2026-09-30"];
  it("5 consecutive days ending today -> current streak 5", () => {
    const r = runTool({ dates, cadence: "daily", today: "2026-09-30" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.currentStreak, 5);
    assert.equal(r.values!.longestStreak, 5);
    assert.equal(r.values!.totalUploads, 5);
    assert.equal(r.values!.missedSlots, 0);
  });
  it("streak stays alive when last upload was yesterday", () => {
    const r = runTool({ dates: ["2026-09-28", "2026-09-29"], cadence: "daily", today: "2026-09-30" });
    assert.equal(r.values!.currentStreak, 2);
  });
  it("streak breaks to 0 when last upload is older than yesterday", () => {
    const r = runTool({ dates: ["2026-09-26", "2026-09-27"], cadence: "daily", today: "2026-09-30" });
    assert.equal(r.values!.currentStreak, 0);
    assert.equal(r.values!.longestStreak, 2);
  });
  it("longest streak finds the best run, missed slots counted", () => {
    const r = runTool({
      dates: ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-10"],
      cadence: "daily",
      today: "2026-09-10",
    });
    assert.equal(r.values!.longestStreak, 3);
    assert.equal(r.values!.missedSlots, 10 - 4);
  });
  it("weeklyRate is uploads per 7-day window", () => {
    const r = runTool({ dates, cadence: "daily", today: "2026-09-30" });
    assert.equal(r.values!.weeklyRate, 7); // 5 uploads in 5 days -> 7/week
  });
  it("dedupes same-day uploads and reports it", () => {
    const r = runTool({ dates: ["2026-09-29", "2026-09-29", "2026-09-30"], cadence: "daily", today: "2026-09-30" });
    assert.equal(r.values!.totalUploads, 2);
    assert.ok((r.values!.guidance as string[]).some((g) => g.includes("duplicate")));
  });
  it("summary is human-readable", () => {
    const r = runTool({ dates, cadence: "daily", today: "2026-09-30" });
    assert.match(r.values!.summary as string, /current streak: 5 days/);
  });
});

describe("runTool — weekly cadence", () => {
  it("4 consecutive upload weeks -> current streak 4", () => {
    const r = runTool({
      dates: ["2026-09-07", "2026-09-14", "2026-09-21", "2026-09-28"],
      cadence: "weekly",
      today: "2026-09-30",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.currentStreak, 4);
  });
  it("skipped week resets the weekly streak to the latest run", () => {
    const r = runTool({
      dates: ["2026-09-07", "2026-09-21"],
      cadence: "weekly",
      today: "2026-09-30",
    });
    // Last upload was last week -> streak alive at 1; the skipped week counts as missed.
    assert.equal(r.values!.currentStreak, 1);
    assert.equal(r.values!.longestStreak, 1);
    assert.equal(r.values!.missedSlots, 2);
  });
  it("weekly streak fully breaks when last upload is older than last week", () => {
    const r = runTool({
      dates: ["2026-09-07", "2026-09-14"],
      cadence: "weekly",
      today: "2026-09-30",
    });
    assert.equal(r.values!.currentStreak, 0);
    assert.equal(r.values!.longestStreak, 2);
  });
});

describe("runTool — validation errors", () => {
  it("missing dates -> error", () => {
    const r = runTool({ cadence: "daily" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one upload date/);
  });
  it("empty dates -> error", () => {
    assert.equal(runTool({ dates: [] }).ok, false);
  });
  it("invalid date string -> 'Date N' error", () => {
    const r = runTool({ dates: ["2026-09-30", "not-a-date"] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Date 2/);
  });
  it("impossible calendar date -> error", () => {
    assert.equal(runTool({ dates: ["2026-02-30"] }).ok, false);
  });
  it("future date vs today -> error", () => {
    const r = runTool({ dates: ["2026-10-05"], today: "2026-10-01" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /earlier than your latest/);
  });
  it("invalid cadence -> error", () => {
    const r = runTool({ dates: ["2026-09-30"], cadence: "monthly" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Cadence/);
  });
  it("non-object values -> error", () => {
    assert.equal(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
});

describe("runTool — edge cases from spec", () => {
  it("timezone-safe: same UTC day string dedupes regardless of time", () => {
    const r = runTool({ dates: ["2026-09-30", "2026-09-30"], today: "2026-09-30" });
    assert.equal(r.values!.totalUploads, 1);
  });
  it("single upload -> guidance notes more dates needed", () => {
    const r = runTool({ dates: ["2026-09-30"], today: "2026-09-30" });
    assert.equal(r.values!.currentStreak, 1);
    assert.ok((r.values!.guidance as string[]).some((g) => g.includes("Only one upload")));
  });
  it("today defaults to the latest logged date", () => {
    const a = runTool({ dates: ["2026-09-28", "2026-09-29"] });
    const b = runTool({ dates: ["2026-09-28", "2026-09-29"], today: "2026-09-29" });
    assert.deepEqual(a.values, b.values);
  });
  it("determinism: same inputs -> identical outputs", () => {
    const v = { dates: ["2026-09-26", "2026-09-27", "2026-09-30"], today: "2026-09-30" };
    assert.deepEqual(runTool(v), runTool(v));
  });
  it("output ids match meta.ts outputs", () => {
    const r = runTool({ dates: ["2026-09-30"], today: "2026-09-30" });
    assert.deepEqual(Object.keys(r.values!).sort(), [
      "currentStreak",
      "guidance",
      "longestStreak",
      "missedSlots",
      "summary",
      "totalUploads",
      "weeklyRate",
    ]);
  });
  it("analyzeStreak exported directly works too", () => {
    const s = analyzeStreak(["2026-09-29", "2026-09-30"], { today: "2026-09-30", cadence: "daily" });
    assert.equal(s.currentStreak, 2);
  });
});

describe("runTool {items} adapter (TrackerTemplate log mode)", () => {
  it("accepts items with date fields", () => {
    const r = runTool({ items: [{ date: "2026-09-29" }, { date: "2026-09-30" }] });
    assert.equal(r.ok, true);
    assert.equal(r.values!.totalUploads, 2);
  });
  it("items shape matches dates shape", () => {
    const a = runTool({ items: [{ date: "2026-09-29" }, { date: "2026-09-30" }] });
    const b = runTool({ dates: ["2026-09-29", "2026-09-30"] });
    assert.deepEqual(a, b);
  });
  it("rejects invalid dates inside items", () => {
    const r = runTool({ items: [{ date: "not-a-date" }] });
    assert.equal(r.ok, false);
  });
});
