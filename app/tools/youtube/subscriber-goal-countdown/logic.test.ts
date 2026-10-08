import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, addDaysUTC, diffDaysUTC, parseDateUTC, SCENARIO_FACTORS } from "./logic.ts";

describe("date helpers", () => {
  it("addDaysUTC adds whole days", () => {
    assert.equal(addDaysUTC("2026-10-01", 30), "2026-10-31");
    assert.equal(addDaysUTC("2026-10-01", 0), "2026-10-01");
  });
  it("diffDaysUTC measures whole days", () => {
    assert.equal(diffDaysUTC("2026-10-01", "2026-10-31"), 30);
  });
  it("parseDateUTC rejects impossible dates", () => {
    assert.equal(parseDateUTC("2026-02-30"), null);
    assert.ok(parseDateUTC("2026-10-01") !== null);
  });
});

describe("runTool — happy path", () => {
  it("850 -> 1000 at 5/day = 30 days, 2026-10-31", () => {
    const r = runTool({ currentSubs: 850, targetSubs: 1000, growthRate: 5, today: "2026-10-01", scenario: "expected" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.daysToTarget, 30);
    assert.equal(r.values!.estTargetDate, "2026-10-31");
  });
  it("rounds days UP (ceil)", () => {
    const r = runTool({ currentSubs: 850, targetSubs: 1000, growthRate: 6, today: "2026-10-01" });
    assert.equal(r.values!.daysToTarget, 25); // 150/6 = 25 exactly
    const r2 = runTool({ currentSubs: 851, targetSubs: 1000, growthRate: 6, today: "2026-10-01" });
    assert.equal(r2.values!.daysToTarget, 25); // 149/6 = 24.83 -> 25
  });
  it("progressPercent is current/target", () => {
    const r = runTool({ currentSubs: 500, targetSubs: 1000, growthRate: 5, today: "2026-10-01" });
    assert.equal(r.values!.progressPercent, 50);
  });
  it("scenario defaults to expected", () => {
    const a = runTool({ currentSubs: 850, targetSubs: 1000, growthRate: 5, today: "2026-10-01" });
    const b = runTool({ currentSubs: 850, targetSubs: 1000, growthRate: 5, today: "2026-10-01", scenario: "expected" });
    assert.deepEqual(a.values, b.values);
  });
  it("conservative scenario stretches the timeline (0.7x rate)", () => {
    const r = runTool({ currentSubs: 850, targetSubs: 1000, growthRate: 5, today: "2026-10-01", scenario: "conservative" });
    assert.equal(r.values!.daysToTarget, Math.ceil(150 / (5 * SCENARIO_FACTORS.conservative)));
    assert.ok((r.values!.daysToTarget as number) > 30);
  });
  it("optimistic scenario shortens the timeline (1.3x rate)", () => {
    const r = runTool({ currentSubs: 850, targetSubs: 1000, growthRate: 5, today: "2026-10-01", scenario: "optimistic" });
    assert.ok((r.values!.daysToTarget as number) < 30);
  });
  it("chosenDate -> requiredDailyRate", () => {
    const r = runTool({
      currentSubs: 850,
      targetSubs: 1000,
      growthRate: 5,
      today: "2026-10-01",
      chosenDate: "2026-10-31",
    });
    assert.equal(r.values!.requiredDailyRate, 5); // 150/30
  });
  it("no chosenDate -> requiredDailyRate is null", () => {
    const r = runTool({ currentSubs: 850, targetSubs: 1000, growthRate: 5, today: "2026-10-01" });
    assert.equal(r.values!.requiredDailyRate, null);
  });
  it("accepts numeric strings", () => {
    const r = runTool({ currentSubs: "850", targetSubs: "1000", growthRate: "5", today: "2026-10-01" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.daysToTarget, 30);
  });
  it("summary is labeled a projection", () => {
    const r = runTool({ currentSubs: 850, targetSubs: 1000, growthRate: 5, today: "2026-10-01" });
    assert.match(r.values!.summary as string, /Projection, not a promise/);
  });
});

describe("runTool — validation errors", () => {
  const base = { currentSubs: 850, targetSubs: 1000, growthRate: 5, today: "2026-10-01" };
  it("target <= current -> error", () => {
    const r = runTool({ ...base, targetSubs: 850 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than current/);
  });
  it("target below current -> error", () => {
    assert.equal(runTool({ ...base, targetSubs: 100 }).ok, false);
  });
  it("growthRate = 0 -> guarded error, not a crash", () => {
    const r = runTool({ ...base, growthRate: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /greater than 0/);
  });
  it("negative growthRate -> error", () => {
    assert.equal(runTool({ ...base, growthRate: -2 }).ok, false);
  });
  it("non-integer subs -> error", () => {
    assert.equal(runTool({ ...base, currentSubs: 850.5 }).ok, false);
    assert.equal(runTool({ ...base, targetSubs: 1000.5 }).ok, false);
  });
  it("negative currentSubs -> error", () => {
    assert.equal(runTool({ ...base, currentSubs: -1 }).ok, false);
  });
  it("missing today -> error", () => {
    const { today: _t, ...rest } = base;
    assert.equal(runTool(rest).ok, false);
  });
  it("bad today format -> error", () => {
    assert.equal(runTool({ ...base, today: "10/01/2026" }).ok, false);
  });
  it("invalid scenario -> error", () => {
    assert.equal(runTool({ ...base, scenario: "moon" }).ok, false);
  });
  it("chosenDate on/before today -> error", () => {
    assert.equal(runTool({ ...base, chosenDate: "2026-10-01" }).ok, false);
    assert.equal(runTool({ ...base, chosenDate: "2026-09-01" }).ok, false);
  });
  it("bad chosenDate format -> error", () => {
    assert.equal(runTool({ ...base, chosenDate: "soon" }).ok, false);
  });
  it("non-object values -> error", () => {
    assert.equal(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
});

describe("runTool — edge cases, determinism, output ids", () => {
  it("growth is not linear -> guidance carries the disclaimer", () => {
    const r = runTool({ currentSubs: 850, targetSubs: 1000, growthRate: 5, today: "2026-10-01" });
    const g = r.values!.guidance as string[];
    assert.ok(g.some((x) => x.includes("rarely linear")));
    assert.ok(g.some((x) => x.includes("cannot read your live YouTube subscriber count")));
  });
  it("determinism: same inputs -> identical outputs", () => {
    const v = { currentSubs: 850, targetSubs: 1000, growthRate: 5, today: "2026-10-01", scenario: "expected" };
    assert.deepEqual(runTool(v), runTool(v));
  });
  it("output ids match meta.ts outputs", () => {
    const r = runTool({ currentSubs: 850, targetSubs: 1000, growthRate: 5, today: "2026-10-01" });
    assert.deepEqual(Object.keys(r.values!).sort(), [
      "daysToTarget",
      "estTargetDate",
      "guidance",
      "progressPercent",
      "requiredDailyRate",
      "summary",
    ]);
  });
});
