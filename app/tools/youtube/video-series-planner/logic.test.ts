import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  buildSeriesPlan,
  parseStartDate,
  formatDateUTC,
  CADENCES,
  MIN_EPISODES,
  MAX_EPISODES,
} from "./logic.ts";

const BASE = {
  seriesTitle: "30-Day Drawing Challenge",
  episodeCount: 8,
  cadence: "weekly",
  startDate: "2026-11-02",
};

// ---------- happy path ----------

test("happy path: weekly 8-episode plan has 8 rows with correct dates", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  const schedule = r.values!.schedule as { date: string }[];
  assert.equal(schedule.length, 8);
  assert.equal(schedule[0].date, "2026-11-02");
  assert.equal(schedule[1].date, "2026-11-09");
  assert.equal(schedule[7].date, "2026-12-21");
  assert.equal(r.values!.endDate, "2026-12-21");
});

test("happy path: arc phases are intro / deep dives / finale", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  const schedule = r.values!.schedule as { phase: string; episode: number }[];
  assert.equal(schedule[0].phase, "Intro");
  assert.equal(schedule[7].phase, "Finale");
  const dives = schedule.filter((s) => s.phase === "Deep dive");
  assert.equal(dives.length, 6);
  assert.deepEqual(
    schedule.map((s) => s.episode),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
});

test("happy path: working titles use the series title and fill-in slots", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  const schedule = r.values!.schedule as { workingTitle: string }[];
  assert.ok(schedule[0].workingTitle.includes("30-Day Drawing Challenge"));
  assert.ok(schedule[2].workingTitle.includes("[your topic here]"));
  assert.ok(schedule[7].workingTitle.includes("30-Day Drawing Challenge"));
});

test("happy path: summary names arc counts and span", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  const summary = String(r.values!.summary);
  assert.ok(summary.includes("8-episode"));
  assert.ok(summary.includes("1 intro"));
  assert.ok(summary.includes("6 deep dives"));
  assert.ok(summary.includes("1 finale"));
});

test("happy path: daily cadence steps one day at a time", () => {
  const r = runTool({ ...BASE, cadence: "daily", episodeCount: 3 });
  assert.equal(r.ok, true);
  const schedule = r.values!.schedule as { date: string }[];
  assert.deepEqual(
    schedule.map((s) => s.date),
    ["2026-11-02", "2026-11-03", "2026-11-04"],
  );
});

test("happy path: twice-weekly cadence steps 3 days", () => {
  const r = runTool({ ...BASE, cadence: "twice-weekly", episodeCount: 3 });
  assert.equal(r.ok, true);
  const schedule = r.values!.schedule as { date: string }[];
  assert.deepEqual(
    schedule.map((s) => s.date),
    ["2026-11-02", "2026-11-05", "2026-11-08"],
  );
});

test("happy path: biweekly cadence steps 14 days", () => {
  const r = runTool({ ...BASE, cadence: "biweekly", episodeCount: 3 });
  assert.equal(r.ok, true);
  const schedule = r.values!.schedule as { date: string }[];
  assert.deepEqual(
    schedule.map((s) => s.date),
    ["2026-11-02", "2026-11-16", "2026-11-30"],
  );
});

test("happy path: monthly cadence steps calendar months", () => {
  const r = runTool({ ...BASE, cadence: "monthly", episodeCount: 3 });
  assert.equal(r.ok, true);
  const schedule = r.values!.schedule as { date: string }[];
  assert.deepEqual(
    schedule.map((s) => s.date),
    ["2026-11-02", "2026-12-02", "2027-01-02"],
  );
});

// ---------- validation errors ----------

test("validation: missing series title fails", () => {
  const r = runTool({ ...BASE, seriesTitle: "   " });
  assert.equal(r.ok, false);
  assert.match(String(r.error), /series title/i);
});

test("validation: episode count below minimum fails", () => {
  const r = runTool({ ...BASE, episodeCount: 1 });
  assert.equal(r.ok, false);
  assert.match(String(r.error), /between 2 and 52/);
});

test("validation: episode count above maximum fails", () => {
  const r = runTool({ ...BASE, episodeCount: 53 });
  assert.equal(r.ok, false);
  assert.match(String(r.error), /between 2 and 52/);
});

test("validation: non-integer episode count fails", () => {
  const r = runTool({ ...BASE, episodeCount: 4.5 });
  assert.equal(r.ok, false);
  assert.equal(r.values, undefined);
});

test("validation: unknown cadence fails", () => {
  const r = runTool({ ...BASE, cadence: "hourly" });
  assert.equal(r.ok, false);
  assert.match(String(r.error), /cadence/i);
});

test("validation: malformed start date fails", () => {
  const r = runTool({ ...BASE, startDate: "Nov 2 2026" });
  assert.equal(r.ok, false);
  assert.match(String(r.error), /valid start date/i);
});

test("validation: impossible date (Feb 30) fails", () => {
  const r = runTool({ ...BASE, startDate: "2026-02-30" });
  assert.equal(r.ok, false);
});

test("validation: missing start date fails", () => {
  const r = runTool({ ...BASE, startDate: undefined });
  assert.equal(r.ok, false);
});

// ---------- edge cases from spec ----------

test("edge: 2 episodes = intro + finale, zero deep dives", () => {
  const r = runTool({ ...BASE, episodeCount: 2 });
  assert.equal(r.ok, true);
  const schedule = r.values!.schedule as { phase: string }[];
  assert.deepEqual(
    schedule.map((s) => s.phase),
    ["Intro", "Finale"],
  );
  assert.ok(String(r.values!.summary).includes("0 deep dives"));
});

test("edge: 52 episodes (max) plans 52 rows", () => {
  const r = runTool({ ...BASE, episodeCount: 52 });
  assert.equal(r.ok, true);
  assert.equal((r.values!.schedule as unknown[]).length, 52);
});

test("edge: month-end start rolls to last valid day (Jan 31 -> Feb 28)", () => {
  const r = runTool({
    ...BASE,
    cadence: "monthly",
    episodeCount: 2,
    startDate: "2026-01-31",
  });
  assert.equal(r.ok, true);
  const schedule = r.values!.schedule as { date: string }[];
  assert.equal(schedule[1].date, "2026-02-28");
});

test("edge: leap-day start is accepted", () => {
  const r = runTool({
    ...BASE,
    cadence: "weekly",
    episodeCount: 2,
    startDate: "2028-02-29",
  });
  assert.equal(r.ok, true);
  const schedule = r.values!.schedule as { date: string }[];
  assert.equal(schedule[0].date, "2028-02-29");
});

// ---------- determinism / contract ----------

test("determinism: same inputs -> identical output", () => {
  const a = runTool(BASE);
  const b = runTool(BASE);
  assert.deepEqual(a, b);
});

test("output ids match meta.ts outputs (schedule, summary, endDate)", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  assert.deepEqual(Object.keys(r.values!).sort(), [
    "endDate",
    "schedule",
    "summary",
  ]);
});

test("exported helpers: parseStartDate/formatDateUTC round-trip", () => {
  const d = parseStartDate("2026-11-02");
  assert.ok(d instanceof Date);
  assert.equal(formatDateUTC(d), "2026-11-02");
  assert.equal(parseStartDate("2026-13-01"), null);
  assert.equal(parseStartDate("not-a-date"), null);
  assert.equal(parseStartDate(123), null);
});

test("exported constants: cadence list and episode bounds", () => {
  assert.deepEqual([...CADENCES], [
    "daily",
    "twice-weekly",
    "weekly",
    "biweekly",
    "monthly",
  ]);
  assert.equal(MIN_EPISODES, 2);
  assert.equal(MAX_EPISODES, 52);
});

test("buildSeriesPlan: spanDays counts calendar days", () => {
  const plan = buildSeriesPlan(
    "X",
    3,
    "weekly",
    parseStartDate("2026-11-02")!,
  );
  assert.equal(plan.endDate, "2026-11-16");
  assert.equal(plan.spanDays, 14);
});
