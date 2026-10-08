/**
 * Tests for tool-365 Pinterest Content Calendar Generator logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  THEME_BANK,
  THEME_BANK_SIZE,
  SEASONAL_SUBSET,
  SEASONAL_SUBSET_SIZE,
  PIN_TYPE_ROTATION,
  DEFAULT_PINS_PER_WEEK,
  MAX_PINS_PER_WEEK,
  SEASONAL_EVERY_NTH,
  daysInMonth,
  parseYearMonth,
  isPastMonth,
} from "./logic.ts";

const FUTURE = "2030-11"; // far-future month, never "past" in tests
const FUTURE2 = "2031-03";

test("happy path: niche + 2030-11, default 5 pins/week", () => {
  const r = runTool({ niche: "home decor", yearMonth: FUTURE });
  assert.equal(r.ok, true);
  assert.ok(r.values);
  const weeks = Math.ceil(daysInMonth(2030, 11) / 7);
  assert.equal(r.values!.pinCount, weeks * DEFAULT_PINS_PER_WEEK);
  assert.equal(r.values!.calendar.rows.length, r.values!.pinCount);
  assert.equal(r.values!.monthUsed, FUTURE);
  assert.ok(r.values!.scheduleNote.includes(String(weeks)));
});

test("pin count matches pinsPerWeek x weeks: 3/week", () => {
  const r = runTool({ niche: "recipes", yearMonth: FUTURE, pinsPerWeek: 3 });
  assert.equal(r.ok, true);
  const weeks = Math.ceil(daysInMonth(2030, 11) / 7);
  assert.equal(r.values!.pinCount, weeks * 3);
});

test("dates are valid for the month: all within 2030-11", () => {
  const r = runTool({ niche: "recipes", yearMonth: FUTURE, pinsPerWeek: 2 });
  assert.equal(r.ok, true);
  for (const row of r.values!.calendar.rows) {
    assert.match(row[0], /^2030-11-\d{2} \(/);
    const day = parseInt(row[0].slice(8, 10), 10);
    assert.ok(day >= 1 && day <= 30);
  }
});

test("theme rotation: 10-theme bank cycles, no placeholder leaks", () => {
  const r = runTool({ niche: "fashion", yearMonth: FUTURE2, pinsPerWeek: 7 });
  assert.equal(r.ok, true);
  const text = JSON.stringify(r.values!.calendar.rows);
  assert.ok(!text.includes("{niche}"));
  assert.ok(text.includes("fashion"));
});

test("pin type rotation: standard -> idea -> video cycles", () => {
  const r = runTool({ niche: "fashion", yearMonth: FUTURE2, pinsPerWeek: 3 });
  assert.equal(r.ok, true);
  const types = r.values!.calendar.rows.map((row) => row[2]);
  assert.deepEqual(types.slice(0, 3), PIN_TYPE_ROTATION);
});

test("seasonal merge: November gets Thanksgiving/Black Friday seasonal pins", () => {
  const r = runTool({ niche: "decor", yearMonth: FUTURE, pinsPerWeek: 4 });
  assert.equal(r.ok, true);
  const seasonalRows = r.values!.calendar.rows.filter((row) => row[1].includes("[Seasonal:"));
  assert.ok(seasonalRows.length > 0, "expected seasonal pins in November");
  const text = JSON.stringify(seasonalRows).toLowerCase();
  assert.ok(text.includes("thanksgiving") || text.includes("black friday"));
  assert.ok(r.values!.scheduleNote.includes(String(SEASONAL_SUBSET_SIZE)));
});

test("seasonal every-4th rule", () => {
  const r = runTool({ niche: "decor", yearMonth: FUTURE, pinsPerWeek: 4 });
  assert.equal(r.ok, true);
  const rows = r.values!.calendar.rows;
  const seasonalIdx = rows.map((row, i) => (row[1].includes("[Seasonal:") ? i : -1)).filter((i) => i >= 0);
  for (const i of seasonalIdx) assert.equal(i % SEASONAL_EVERY_NTH, SEASONAL_EVERY_NTH - 1);
});

test("non-seasonal month (March 2031): no seasonal rows, note says so", () => {
  const r = runTool({ niche: "decor", yearMonth: FUTURE2, pinsPerWeek: 2 });
  assert.equal(r.ok, true);
  const seasonalRows = r.values!.calendar.rows.filter((row) => row[1].includes("[Seasonal:"));
  assert.equal(seasonalRows.length, 0);
  assert.ok(/no seasonal events/i.test(r.values!.scheduleNote));
});

test("edge case pinsPerWeek >21 -> capped at 21 with note", () => {
  const r = runTool({ niche: "decor", yearMonth: FUTURE, pinsPerWeek: 30 });
  assert.equal(r.ok, true);
  const weeks = Math.ceil(daysInMonth(2030, 11) / 7);
  assert.equal(r.values!.pinCount, weeks * MAX_PINS_PER_WEEK);
  assert.ok(/capped at 21/i.test(r.values!.scheduleNote));
  assert.ok(r.values!.scheduleNote.includes("30"));
});

test("edge case: past month -> error", () => {
  const r = runTool({ niche: "decor", yearMonth: "2000-01" });
  assert.equal(r.ok, false);
  assert.ok(r.error && /past/i.test(r.error));
});

test("validation: missing niche -> error", () => {
  const r = runTool({ yearMonth: FUTURE });
  assert.equal(r.ok, false);
  assert.ok(r.error && /niche/i.test(r.error));
});

test("validation: bad yearMonth format -> error", () => {
  for (const bad of ["2030-13", "2030", "11-2030", "2030/11", ""]) {
    const r = runTool({ niche: "decor", yearMonth: bad });
    assert.equal(r.ok, false, `expected error for ${bad}`);
  }
});

test("validation: pinsPerWeek 0 -> error", () => {
  const r = runTool({ niche: "decor", yearMonth: FUTURE, pinsPerWeek: 0 });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("validation: non-integer pinsPerWeek -> error", () => {
  const r = runTool({ niche: "decor", yearMonth: FUTURE, pinsPerWeek: 2.5 });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("dataset sizes documented", () => {
  assert.equal(THEME_BANK.length, THEME_BANK_SIZE);
  assert.equal(SEASONAL_SUBSET.length, SEASONAL_SUBSET_SIZE);
  assert.equal(SEASONAL_SUBSET_SIZE, 12);
  assert.equal(DEFAULT_PINS_PER_WEEK, 5);
  assert.equal(MAX_PINS_PER_WEEK, 21);
});

test("unit helpers: parseYearMonth, isPastMonth, daysInMonth", () => {
  assert.deepEqual(parseYearMonth("2030-11"), { year: 2030, month: 11 });
  assert.equal(parseYearMonth("2030-13"), null);
  assert.equal(parseYearMonth(123), null);
  assert.equal(isPastMonth(2000, 1), true);
  assert.equal(isPastMonth(2999, 1), false);
  assert.equal(daysInMonth(2030, 11), 30);
  assert.equal(daysInMonth(2031, 2), 28);
});

test("determinism: same inputs twice give identical outputs", () => {
  const a = runTool({ niche: "travel", yearMonth: "2030-12", pinsPerWeek: 5 });
  const b = runTool({ niche: "travel", yearMonth: "2030-12", pinsPerWeek: 5 });
  assert.deepEqual(a, b);
});

test("output ids match meta.ts: calendar, pinCount, monthUsed, scheduleNote", () => {
  const r = runTool({ niche: "travel", yearMonth: FUTURE });
  assert.equal(r.ok, true);
  const keys = Object.keys(r.values!).sort();
  assert.deepEqual(keys, ["calendar", "monthUsed", "pinCount", "scheduleNote"]);
});
