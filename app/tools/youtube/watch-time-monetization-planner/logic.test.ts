import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  LONG_FORM_HOURS_THRESHOLD,
  SHORTS_VIEWS_THRESHOLD,
  YPP_SUBSCRIBER_THRESHOLD,
  FAN_FUNDING_HOURS,
  planMonetization,
  runTool,
} from "./logic.ts";

describe("runTool — long-form happy path", () => {
  it("computes remaining hours and estimated days", () => {
    const r = runTool({
      path: "long-form",
      currentWatchHours: 2500,
      avgViewsPerDay: 1000,
      avgViewDurationMinutes: 6,
    });
    assert.equal(r.ok, true);
    const v = r.values!;
    assert.equal(v["threshold"], "4,000 watch hours");
    assert.equal(v["current"], 2500);
    assert.equal(v["remaining"], 1500);
    // 1000 views/day * 6 min / 60 = 100 h/day -> 1500/100 = 15 days
    assert.equal(v["estimatedDays"], 15);
    assert.equal(v["isEstimate"], true);
    assert.ok(String(v["paceSummary"]).includes("estimate"));
  });
  it("threshold already met gives 0 remaining and already-met summary", () => {
    const r = runTool({ path: "long-form", currentWatchHours: 4000 });
    assert.equal(r.ok, true);
    assert.equal(r.values!["remaining"], 0);
    assert.equal(r.values!["estimatedDays"], null);
    assert.ok(String(r.values!["paceSummary"]).includes("already met"));
  });
  it("over-threshold clamps remaining to 0", () => {
    const r = runTool({ path: "long-form", currentWatchHours: 99999 });
    assert.equal(r.values!["remaining"], 0);
  });
});

describe("runTool — shorts happy path", () => {
  it("computes remaining views and days", () => {
    const r = runTool({
      path: "shorts",
      currentShortsViews: 9000000,
      avgViewsPerDay: 50000,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!["threshold"], "10,000,000 Shorts views");
    assert.equal(r.values!["remaining"], 1000000);
    assert.equal(r.values!["estimatedDays"], 20);
  });
  it("shorts warning about watch hours not counting is present", () => {
    const r = runTool({ path: "shorts", currentShortsViews: 1000 });
    assert.ok(
      (r.values!["warnings"] as string[]).some((w) => w.includes("do NOT count"))
    );
  });
  it("shorts plan uses 90-day rolling window warning", () => {
    const r = runTool({ path: "shorts", currentShortsViews: 1000 });
    assert.ok(
      (r.values!["warnings"] as string[]).some((w) => w.includes("90-day"))
    );
  });
});

describe("runTool — validation errors", () => {
  it("missing path errors", () => {
    const r = runTool({ currentWatchHours: 100 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("long-form"));
  });
  it("invalid path errors", () => {
    const r = runTool({ path: "live" });
    assert.equal(r.ok, false);
  });
  it("long-form without currentWatchHours errors", () => {
    const r = runTool({ path: "long-form" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("watch hours"));
  });
  it("shorts without currentShortsViews errors", () => {
    const r = runTool({ path: "shorts" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Shorts views"));
  });
  it("negative numbers rejected", () => {
    const r = runTool({ path: "long-form", currentWatchHours: -5 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("non-negative"));
  });
  it("non-finite rejected", () => {
    const r = runTool({ path: "shorts", currentShortsViews: Infinity });
    assert.equal(r.ok, false);
  });
  it("past target date rejected", () => {
    const r = runTool({
      path: "long-form",
      currentWatchHours: 100,
      targetDate: "2000-01-01",
    });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("future"));
  });
  it("malformed target date rejected", () => {
    const r = runTool({
      path: "long-form",
      currentWatchHours: 100,
      targetDate: "tomorrow",
    });
    assert.equal(r.ok, false);
  });
});

describe("runTool — target date pace", () => {
  it("computes required daily pace for a future date", () => {
    const r = runTool({
      path: "long-form",
      currentWatchHours: 3500,
      avgViewDurationMinutes: 5,
      targetDate: "2099-01-01",
    });
    assert.equal(r.ok, true);
    const pace = String(r.values!["requiredDailyPace"]);
    assert.ok(pace.includes("watch hours/day"));
    assert.ok(pace.includes("views/day"));
  });
  it("no targetDate -> requiredDailyPace is null", () => {
    const r = runTool({ path: "shorts", currentShortsViews: 100 });
    assert.equal(r.values!["requiredDailyPace"], null);
  });
  it("already met + target date -> no pace needed message", () => {
    const r = runTool({
      path: "long-form",
      currentWatchHours: 4000,
      targetDate: "2099-01-01",
    });
    assert.ok(String(r.values!["requiredDailyPace"]).includes("already met"));
  });
});

describe("runTool — fan funding + warnings", () => {
  it("fan funding eligible when all tier inputs met (long-form)", () => {
    const r = runTool({
      path: "long-form",
      currentWatchHours: FAN_FUNDING_HOURS,
      subscribers: 600,
      uploadsLast90Days: 5,
    });
    assert.ok(String(r.values!["fanFunding"]).includes("likely eligible"));
  });
  it("fan funding prompts for missing inputs", () => {
    const r = runTool({ path: "long-form", currentWatchHours: 100 });
    assert.ok(String(r.values!["fanFunding"]).includes("Add"));
  });
  it("subscriber shortfall warning under 1000", () => {
    const r = runTool({
      path: "long-form",
      currentWatchHours: 100,
      subscribers: 250,
    });
    assert.ok(
      (r.values!["warnings"] as string[]).some((w) => w.includes("1,000 subscribers"))
    );
  });
  it("no pace inputs -> estimatedDays null with helpful summary", () => {
    const r = runTool({ path: "long-form", currentWatchHours: 100 });
    assert.equal(r.values!["estimatedDays"], null);
    assert.ok(String(r.values!["paceSummary"]).includes("add average views/day"));
  });
});

describe("determinism + output ids", () => {
  it("same inputs -> identical outputs", () => {
    const args = {
      path: "shorts",
      currentShortsViews: 2000000,
      avgViewsPerDay: 10000,
      subscribers: 800,
      targetDate: "2099-06-01",
    };
    assert.deepEqual(runTool(args), runTool(args));
  });
  it("output ids match meta.ts outputs", () => {
    const r = runTool({ path: "long-form", currentWatchHours: 1 });
    const ids = Object.keys(r.values!).sort();
    assert.deepEqual(ids, [
      "current",
      "disclaimer",
      "estimatedDays",
      "fanFunding",
      "isEstimate",
      "paceSummary",
      "remaining",
      "requiredDailyPace",
      "threshold",
      "warnings",
    ]);
  });
});

describe("constants", () => {
  it("thresholds match verified YPP rules", () => {
    assert.equal(LONG_FORM_HOURS_THRESHOLD, 4000);
    assert.equal(SHORTS_VIEWS_THRESHOLD, 10000000);
    assert.equal(YPP_SUBSCRIBER_THRESHOLD, 1000);
  });
  it("planMonetization is a pure function of its input", () => {
    const input = {
      path: "long-form" as const,
      subscribers: 1200,
      currentWatchHours: 3900,
      currentShortsViews: null,
      avgViewsPerDay: 2000,
      avgViewDurationMinutes: 4,
      uploadsLast90Days: 10,
      targetDate: null,
    };
    assert.deepEqual(planMonetization(input), planMonetization(input));
  });
});
