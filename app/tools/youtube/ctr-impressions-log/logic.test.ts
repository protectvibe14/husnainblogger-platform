import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MIN_IMPRESSIONS_PER_VARIANT,
  addEntry,
  removeEntry,
  validateEntry,
  ctrOf,
  summarize,
  aggregateByPeriod,
  trendDirection,
  compareVariants,
  runTool,
} from "./logic.ts";
import type { CtrEntry } from "./logic.ts";

const e1: CtrEntry = { id: "a", date: "2026-09-01", label: "Video 1", variant: "A", impressions: 1000, clicks: 50 };
const e2: CtrEntry = { id: "b", date: "2026-09-02", label: "Video 1", variant: "B", impressions: 1000, clicks: 70 };
const e3: CtrEntry = { id: "c", date: "2026-09-03", label: "Video 2", impressions: 500, clicks: 10 };

describe("validateEntry", () => {
  it("valid entry -> no problems", () => assert.deepEqual(validateEntry(e1), []));
  it("catches clicks > impressions", () => {
    const p = validateEntry({ ...e1, clicks: 2000 });
    assert.ok(p.some((x) => x.includes("clicks cannot exceed impressions")));
  });
  it("catches negatives, non-integers, bad dates", () => {
    assert.ok(validateEntry({ ...e1, impressions: -5 }).length > 0);
    assert.ok(validateEntry({ ...e1, clicks: 1.5 }).length > 0);
    assert.ok(validateEntry({ ...e1, date: "not-a-date" }).length > 0);
    assert.ok(validateEntry({ ...e1, id: "  " }).length > 0);
  });
  it("non-object -> problem", () => {
    assert.ok(validateEntry(null as unknown as CtrEntry).length > 0);
  });
});

describe("ctrOf", () => {
  it("computes CTR as percentage", () => assert.equal(ctrOf(e1), 5));
  it("rounds to 2 decimals", () => assert.equal(ctrOf({ ...e1, impressions: 3, clicks: 1 }), 33.33));
  it("zero impressions -> 0 (guarded)", () => assert.equal(ctrOf({ ...e1, impressions: 0, clicks: 0 }), 0));
  it("max boundary: 100% CTR", () => assert.equal(ctrOf({ ...e1, impressions: 7, clicks: 7 }), 100));
  it("huge numbers stay finite", () => {
    assert.ok(Number.isFinite(ctrOf({ ...e1, impressions: 1e12, clicks: 5e10 })));
  });
});

describe("addEntry / removeEntry", () => {
  it("adds immutably", () => {
    const base: CtrEntry[] = [e1];
    const next = addEntry(base, e2);
    assert.equal(base.length, 1);
    assert.equal(next.length, 2);
  });
  it("throws on invalid entry", () => {
    assert.throws(() => addEntry([], { ...e1, clicks: -1 }), /Invalid entry/);
  });
  it("throws on duplicate id", () => {
    assert.throws(() => addEntry([e1], { ...e2, id: "a" }), /Duplicate id/);
  });
  it("removeEntry drops by id, throws when missing", () => {
    assert.deepEqual(removeEntry([e1, e2], "a"), [e2]);
    assert.throws(() => removeEntry([e1], "zzz"), /Unknown id/);
  });
});

describe("summarize", () => {
  it("empty log -> zeros and nulls", () => {
    const s = summarize([]);
    assert.equal(s.entryCount, 0);
    assert.equal(s.totalImpressions, 0);
    assert.equal(s.overallCtr, 0);
    assert.equal(s.best, null);
    assert.equal(s.worst, null);
    assert.equal(s.dateRange, null);
  });
  it("computes weighted overall CTR and best/worst", () => {
    const s = summarize([e1, e2, e3]);
    assert.equal(s.totalImpressions, 2500);
    assert.equal(s.totalClicks, 130);
    assert.equal(s.overallCtr, 5.2);
    assert.equal(s.best!.id, "b"); // 7%
    assert.equal(s.worst!.id, "c"); // 2%
    assert.deepEqual(s.dateRange, { from: "2026-09-01", to: "2026-09-03" });
  });
  it("minImpressions excludes thin entries from best/worst", () => {
    const thin: CtrEntry = { id: "t", date: "2026-09-04", label: "x", impressions: 2, clicks: 2 }; // 100% CTR, n=2
    const s = summarize([e1, thin], 100);
    assert.equal(s.best!.id, "a");
  });
  it("unicode labels survive", () => {
    const u: CtrEntry = { ...e1, id: "u", label: "🔥 最好的视频" };
    const s = summarize([u]);
    assert.equal(s.best!.label, "🔥 最好的视频");
  });
});

describe("aggregateByPeriod", () => {
  const entries: CtrEntry[] = [
    { id: "1", date: "2026-09-01", label: "v", impressions: 100, clicks: 5 },
    { id: "2", date: "2026-09-01", label: "v", impressions: 200, clicks: 10 },
    { id: "3", date: "2026-09-08", label: "v", impressions: 400, clicks: 40 },
    { id: "4", date: "2026-10-01", label: "v", impressions: 300, clicks: 15 },
  ];
  it("day buckets", () => {
    const b = aggregateByPeriod(entries, "day");
    assert.equal(b.length, 3);
    assert.equal(b[0].impressions, 300);
    assert.equal(b[0].ctr, 5);
  });
  it("week buckets (ISO)", () => {
    const b = aggregateByPeriod(entries, "week");
    assert.ok(b.every((x) => /^2026-W\d{2}$/.test(x.period)));
    assert.equal(b.length, 3);
  });
  it("month buckets", () => {
    const b = aggregateByPeriod(entries, "month");
    assert.deepEqual(b.map((x) => x.period), ["2026-09", "2026-10"]);
    assert.equal(b[0].impressions, 700);
  });
  it("empty input -> empty array", () => {
    assert.deepEqual(aggregateByPeriod([], "day"), []);
  });
});

describe("trendDirection", () => {
  const mk = (id: string, date: string, ctr: number): CtrEntry => ({
    id, date, label: "v", impressions: 1000, clicks: Math.round(ctr * 10),
  });
  it("up trend", () => {
    assert.equal(trendDirection([mk("a", "2026-09-01", 2), mk("b", "2026-09-02", 5), mk("c", "2026-09-03", 9)]), "up");
  });
  it("down trend", () => {
    assert.equal(trendDirection([mk("a", "2026-09-01", 9), mk("b", "2026-09-02", 5), mk("c", "2026-09-03", 2)]), "down");
  });
  it("flat when slope is tiny", () => {
    assert.equal(trendDirection([mk("a", "2026-09-01", 5), mk("b", "2026-09-02", 5.01), mk("c", "2026-09-03", 5.02)]), "flat");
  });
  it("insufficient with <3 days", () => {
    assert.equal(trendDirection([mk("a", "2026-09-01", 5), mk("b", "2026-09-02", 6)]), "insufficient");
    assert.equal(trendDirection([]), "insufficient");
  });
});

describe("compareVariants", () => {
  it("declares a winner with enough data", () => {
    const r = compareVariants([e1, e2]);
    assert.equal(r.verdict, "winner");
    assert.equal(r.winner, "B");
  });
  it("inconclusive below impression threshold", () => {
    const thin = [e1, { ...e2, impressions: 50, clicks: 10 }];
    const r = compareVariants(thin);
    assert.equal(r.verdict, "inconclusive");
    assert.equal(r.winner, null);
    assert.ok(r.reason.includes("Inconclusive"));
  });
  it("tie verdict", () => {
    const r = compareVariants([
      { ...e1, variant: "A", impressions: 200, clicks: 10 },
      { ...e2, variant: "B", impressions: 200, clicks: 10 },
    ]);
    assert.equal(r.verdict, "tie");
  });
  it("single variant -> inconclusive", () => {
    const r = compareVariants([e1]);
    assert.equal(r.verdict, "inconclusive");
  });
  it("MIN_IMPRESSIONS_PER_VARIANT constant", () => {
    assert.equal(MIN_IMPRESSIONS_PER_VARIANT, 100);
  });
});

describe("runTool adapter — happy path", () => {
  const log = [
    { id: "a", date: "2026-09-01", label: "Video 1", impressions: 1000, clicks: 50 },
    { id: "b", date: "2026-09-02", label: "Video 1", impressions: 1000, clicks: 70 },
    { id: "c", date: "2026-09-03", label: "Video 2", impressions: 500, clicks: 10 },
  ];
  it("computes summary stats", () => {
    const r = runTool({ entries: log });
    assert.equal(r.ok, true);
    assert.equal(r.values!.entryCount, 3);
    assert.equal(r.values!.totalImpressions, 2500);
    assert.equal(r.values!.totalClicks, 130);
    assert.equal(r.values!.overallCtr, 5.2);
  });
  it("summary text mentions entries, impressions and CTR", () => {
    const r = runTool({ entries: log });
    assert.match(r.values!.summary as string, /3 entries/);
    assert.match(r.values!.summary as string, /2,500 impressions/);
    assert.match(r.values!.summary as string, /5\.20% overall CTR/);
  });
  it("entriesTable has the table shape with per-entry CTR", () => {
    const r = runTool({ entries: log });
    const t = r.values!.entriesTable as { columns: string[]; rows: string[][] };
    assert.deepEqual(t.columns, ["Date", "Label", "Impressions", "Clicks", "CTR"]);
    assert.equal(t.rows.length, 3);
    assert.equal(t.rows[0][4], "5.00%");
  });
  it("best/worst entry by CTR", () => {
    const r = runTool({ entries: log });
    assert.match(r.values!.bestEntry as string, /Video 1/);
    assert.match(r.values!.bestEntry as string, /7\.00%/);
    assert.match(r.values!.worstEntry as string, /Video 2/);
  });
  it("period aggregates default to day buckets", () => {
    const r = runTool({ entries: log });
    const agg = r.values!.periodAggregates as string[];
    assert.equal(agg.length, 3);
    assert.ok(agg[0].startsWith("2026-09-01:"));
  });
  it("period=week aggregates into ISO week buckets", () => {
    const r = runTool({ entries: log, period: "week" });
    const agg = r.values!.periodAggregates as string[];
    assert.equal(agg.length, 1);
    assert.match(agg[0], /W36/);
  });
  it("csv export is a parseable header + rows", () => {
    const r = runTool({ entries: log });
    const lines = (r.values!.csv as string).split("\n");
    assert.equal(lines[0], "date,label,impressions,clicks,ctr_pct");
    assert.equal(lines.length, 4);
    assert.match(lines[1], /^2026-09-01,Video 1,1000,50,5\.00$/);
  });
  it("csv escapes commas in labels", () => {
    const r = runTool({ entries: [{ id: "x", date: "2026-09-01", label: "A, B", impressions: 10, clicks: 1 }] });
    assert.ok((r.values!.csv as string).includes('"A, B"'));
  });
  it("trend text is human-readable", () => {
    const r = runTool({ entries: log });
    assert.match(r.values!.trend as string, /^(Up|Down|Flat|Insufficient data)/);
  });
  it("guidance always carries the manual-log honesty note", () => {
    const r = runTool({ entries: log });
    const g = r.values!.guidance as string[];
    assert.ok(g.some((x) => x.includes("Manual log only")));
  });
});

describe("runTool adapter — validation errors", () => {
  it("missing entries -> error", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one entry/);
  });
  it("empty entries -> error", () => {
    assert.equal(runTool({ entries: [] }).ok, false);
  });
  it("entry with clicks > impressions -> 'Entry 1' error", () => {
    const r = runTool({ entries: [{ id: "a", date: "2026-09-01", label: "V", impressions: 10, clicks: 11 }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Entry 1/);
  });
  it("duplicate ids -> error", () => {
    const r = runTool({
      entries: [
        { id: "a", date: "2026-09-01", label: "V1", impressions: 10, clicks: 1 },
        { id: "a", date: "2026-09-02", label: "V2", impressions: 10, clicks: 1 },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /duplicate id/);
  });
  it("bad ISO date -> error", () => {
    const r = runTool({ entries: [{ id: "a", date: "09/01/2026", label: "V", impressions: 10, clicks: 1 }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Entry 1/);
  });
  it("non-object values -> error", () => {
    assert.equal(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
});

describe("runTool adapter — edge cases from spec", () => {
  it("zero-impression entry -> 0% CTR, no crash", () => {
    const r = runTool({ entries: [{ id: "a", date: "2026-09-01", label: "V", impressions: 0, clicks: 0 }] });
    assert.equal(r.ok, true);
    const t = r.values!.entriesTable as { rows: string[][] };
    assert.equal(t.rows[0][4], "0.00%");
  });
  it("single entry -> trend 'insufficient data'", () => {
    const r = runTool({ entries: [{ id: "a", date: "2026-09-01", label: "V", impressions: 100, clicks: 5 }] });
    assert.match(r.values!.trend as string, /Insufficient data/);
    assert.ok((r.values!.guidance as string[]).some((g) => g.includes("at least 3 different days")));
  });
  it("determinism: same log -> identical output", () => {
    const log = [{ id: "a", date: "2026-09-01", label: "V", impressions: 100, clicks: 5 }];
    assert.deepEqual(runTool({ entries: log }), runTool({ entries: log }));
  });
  it("output ids match meta.ts outputs", () => {
    const r = runTool({ entries: [{ id: "a", date: "2026-09-01", label: "V", impressions: 100, clicks: 5 }] });
    assert.deepEqual(Object.keys(r.values!).sort(), [
      "bestEntry",
      "csv",
      "entriesTable",
      "entryCount",
      "guidance",
      "overallCtr",
      "periodAggregates",
      "summary",
      "totalClicks",
      "totalImpressions",
      "trend",
      "worstEntry",
    ]);
  });
});

describe("runTool {items} alias (TrackerTemplate log mode)", () => {
  it("accepts items like entries", () => {
    const e = { id: "a", date: "2026-09-01", label: "V1", impressions: 100, clicks: 5 };
    const a = runTool({ items: [e] });
    const b = runTool({ entries: [e] });
    assert.equal(a.ok, true);
    assert.deepEqual(a.values, b.values);
  });
});
