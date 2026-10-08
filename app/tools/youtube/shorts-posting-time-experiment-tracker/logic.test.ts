import { test } from "node:test";
import assert from "node:assert";
import {
  TRACKER_ITEMS,
  describeProgress,
  validateEntry,
  slotHour,
  slotLabel,
  summarizeSlots,
  bestSlot,
  MIN_PER_SLOT,
  type PostingEntry,
} from "./logic.ts";

function entry(postedAt: string, views24h: number, avgViewDurationSec: number): PostingEntry {
  return { postedAt, views24h, avgViewDurationSec };
}

// ---------- TRACKER_ITEMS contract ----------

test("tracker items: ids are lowercase kebab and unique", () => {
  const ids = TRACKER_ITEMS.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) {
    assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  }
});

test("tracker items: 12 protocol steps, every label non-empty", () => {
  assert.equal(TRACKER_ITEMS.length, 12);
  for (const item of TRACKER_ITEMS) {
    assert.ok(item.label.trim().length > 0, item.id);
    assert.ok((item.detail ?? "").trim().length > 0, `${item.id} missing detail`);
  }
});

test("tracker items: cover rotate slots, hold content constant, 24h reads, 5-per-slot guard", () => {
  const ids = TRACKER_ITEMS.map((i) => i.id);
  assert.ok(ids.includes("rotate-slots-evenly"));
  assert.ok(ids.includes("hold-content-type-constant"));
  assert.ok(ids.includes("read-views-at-24h"));
  assert.ok(ids.includes("reach-five-per-slot"));
});

test("describeProgress: formats checked/total with percent", () => {
  assert.equal(describeProgress(0, 12), "0 of 12 experiment steps complete (0%)");
  assert.equal(describeProgress(6, 12), "6 of 12 experiment steps complete (50%)");
  assert.equal(
    describeProgress(12, 12),
    "12 of 12 experiment steps complete (100%) — ready to judge the results",
  );
});

test("describeProgress: clamps and guards bad input", () => {
  assert.equal(describeProgress(0, 0), "0 of 0 experiment steps complete (0%)");
  assert.equal(describeProgress(99, 12).startsWith("12 of 12"), true);
  assert.equal(describeProgress(-3, 12).startsWith("0 of 12"), true);
  assert.equal(describeProgress(NaN, 12).startsWith("0 of 12"), true);
});

// ---------- entry validation ----------

test("validateEntry: accepts a valid entry", () => {
  assert.equal(validateEntry(entry("2026-09-20T18:05:00Z", 1200, 24.5)), null);
});

test("validateEntry: rejects bad datetime", () => {
  assert.ok(validateEntry(entry("not-a-date", 10, 5)) !== null);
});

test("validateEntry: rejects negative views and negative duration", () => {
  assert.ok(validateEntry(entry("2026-09-20T18:05:00Z", -1, 5)) !== null);
  assert.ok(validateEntry(entry("2026-09-20T18:05:00Z", 10, -0.5)) !== null);
});

test("validateEntry: zero metrics are valid", () => {
  assert.equal(validateEntry(entry("2026-09-20T18:05:00Z", 0, 0)), null);
});

// ---------- aggregation ----------

test("summarizeSlots: aggregates per posting hour with averages", () => {
  const entries = [
    entry("2026-09-20T18:05:00Z", 1000, 20),
    entry("2026-09-21T18:30:00Z", 2000, 30),
    entry("2026-09-22T07:00:00Z", 500, 10),
  ];
  const { aggregates, skipped } = summarizeSlots(entries);
  assert.equal(skipped, 0);
  assert.equal(aggregates.length, 2);
  const pm = aggregates.find((a) => a.slot === 18)!;
  assert.equal(pm.count, 2);
  assert.equal(pm.avgViews, 1500);
  assert.equal(pm.avgViewDurationSec, 25);
  assert.equal(pm.label, "6 PM");
});

test("summarizeSlots: skips invalid entries and reports the count", () => {
  const { aggregates, skipped } = summarizeSlots([
    entry("2026-09-20T18:05:00Z", 1000, 20),
    entry("bad-date", 100, 5),
    entry("2026-09-21T18:30:00Z", -5, 5),
  ]);
  assert.equal(skipped, 2);
  assert.equal(aggregates.length, 1);
});

test("summarizeSlots: empty input -> empty aggregates", () => {
  const { aggregates, skipped } = summarizeSlots([]);
  assert.deepEqual(aggregates, []);
  assert.equal(skipped, 0);
});

test("slotHour: uses UTC hour deterministically", () => {
  assert.equal(slotHour(entry("2026-09-20T18:05:00Z", 1, 1)), 18);
  assert.equal(slotHour(entry("2026-09-20T00:00:00Z", 1, 1)), 0);
});

test("slotLabel: formats hours as AM/PM", () => {
  assert.equal(slotLabel(0), "12 AM");
  assert.equal(slotLabel(7), "7 AM");
  assert.equal(slotLabel(12), "12 PM");
  assert.equal(slotLabel(18), "6 PM");
  assert.equal(slotLabel(23), "11 PM");
});

// ---------- best-slot guard (edge case: never a false winner) ----------

test("bestSlot: no entries -> keep-testing", () => {
  const v = bestSlot([]);
  assert.equal(v.verdict, "keep-testing");
});

test("bestSlot: slots below 5 entries -> keep-testing, never a winner", () => {
  const entries: PostingEntry[] = [];
  for (let i = 0; i < 4; i++) {
    entries.push(entry(`2026-09-2${i}T18:00:00Z`, 50000, 40)); // huge views, still guarded
  }
  const { aggregates } = summarizeSlots(entries);
  const v = bestSlot(aggregates);
  assert.equal(v.verdict, "keep-testing");
  assert.ok((v as { reason: string }).reason.includes("5"));
});

test("bestSlot: names a winner when a slot reaches 5 entries", () => {
  const entries: PostingEntry[] = [];
  for (let i = 0; i < 5; i++) {
    entries.push(entry(`2026-09-1${i}T18:00:00Z`, 1000 + i * 100, 20));
  }
  for (let i = 0; i < 5; i++) {
    entries.push(entry(`2026-09-2${i}T07:00:00Z`, 100, 10));
  }
  const { aggregates } = summarizeSlots(entries);
  const v = bestSlot(aggregates);
  assert.equal(v.verdict, "winner");
  if (v.verdict === "winner") {
    assert.equal(v.slot, 18);
    assert.equal(v.count, 5);
    assert.equal(v.avgViews, 1200);
  }
});

test("bestSlot: tie on avg views breaks by larger sample, then earlier hour", () => {
  const { aggregates } = summarizeSlots([
    ...[0, 1, 2, 3, 4].map((i) => entry(`2026-09-1${i}T20:00:00Z`, 1000, 20)),
    ...[0, 1, 2, 3, 4, 5].map((i) => entry(`2026-09-2${i}T09:00:00Z`, 1000, 20)),
  ]);
  const v = bestSlot(aggregates);
  assert.equal(v.verdict, "winner");
  if (v.verdict === "winner") assert.equal(v.slot, 9); // 6 samples beats 5
});

test("determinism: same entries -> identical aggregates and verdict", () => {
  const entries = [entry("2026-09-20T18:05:00Z", 1000, 20), entry("2026-09-21T18:30:00Z", 2000, 30)];
  assert.deepEqual(summarizeSlots(entries), summarizeSlots(entries));
  assert.deepEqual(bestSlot(summarizeSlots(entries).aggregates), bestSlot(summarizeSlots(entries).aggregates));
});

test("MIN_PER_SLOT is 5 per the spec guard", () => {
  assert.equal(MIN_PER_SLOT, 5);
});
