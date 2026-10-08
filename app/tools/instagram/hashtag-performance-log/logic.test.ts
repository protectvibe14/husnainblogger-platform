import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const setA = { setLabel: "fitness-core", date: "2026-09-20", reach: 12000, likes: 480, comments: 96, posts: 8 };
const setB = { setLabel: "gym-broad", date: "2026-09-21", reach: 20000, likes: 400, comments: 50 };
const setC = { setLabel: "zero-reach", date: "2026-09-22", reach: 0, likes: 0, comments: 0 };

describe("hashtag-performance-log (tool-216)", () => {
  it("happy path: returns aggregate outputs", () => {
    const r = runTool({ items: [setA, setB] });
    assert.equal(r.ok, true);
    assert.equal(r.values?.totalReach, 32000);
    // engagement = (480+96+400+50) / 32000 * 100 = 1026/32000*100 = 3.20625
    assert.equal(r.values?.avgEngagementRate, 3.21);
    // setA: 576/12000*100 = 4.8 ; setB: 450/20000*100 = 2.25
    assert.equal(r.values?.bestSetLabel, "fitness-core");
    assert.equal(r.values?.setCount, 2);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ items: [setA] });
    assert.equal(r.ok, true);
    const ids = Object.keys(r.values ?? {}).sort();
    for (const want of ["totalReach", "avgEngagementRate", "bestSetLabel"]) {
      assert.ok(ids.includes(want), `missing output id ${want}`);
    }
  });

  it("single item: best set is the only set", () => {
    const r = runTool({ items: [setB] });
    assert.equal(r.ok, true);
    assert.equal(r.values?.bestSetLabel, "gym-broad");
  });

  it("zero-reach set: no division by zero, rate 0", () => {
    const r = runTool({ items: [setC] });
    assert.equal(r.ok, true);
    assert.equal(r.values?.avgEngagementRate, 0);
    assert.equal(r.values?.totalReach, 0);
    assert.equal(r.values?.bestSetLabel, "zero-reach");
  });

  it("zero-reach set does not win over an engaging set", () => {
    const r = runTool({ items: [setC, setA] });
    assert.equal(r.ok, true);
    assert.equal(r.values?.bestSetLabel, "fitness-core");
  });

  it("tie in engagement rate: first set wins", () => {
    const x = { setLabel: "first", date: "2026-09-20", reach: 1000, likes: 50, comments: 50 };
    const y = { setLabel: "second", date: "2026-09-21", reach: 2000, likes: 100, comments: 100 };
    const r = runTool({ items: [x, y] });
    assert.equal(r.ok, true);
    assert.equal(r.values?.bestSetLabel, "first");
  });

  it("empty log: error with onboarding prompt + honesty note", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("log is empty"));
    assert.ok(String(r.error).includes("cannot pull real hashtag reach"));
  });

  it("missing items array: same onboarding error", () => {
    const r = runTool({} as never);
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("log is empty"));
  });

  it("item 1 missing setLabel: indexed error", () => {
    const r = runTool({ items: [{ ...setA, setLabel: "" }] });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).startsWith("Item 1:"));
    assert.ok(String(r.error).includes("Set label"));
  });

  it("item 2 missing date: indexed error", () => {
    const r = runTool({ items: [setA, { ...setB, date: "" }] });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).startsWith("Item 2:"));
  });

  it("invalid date string: error", () => {
    const r = runTool({ items: [{ ...setA, date: "not-a-date" }] });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("not a valid date"));
  });

  it("non-numeric reach: error", () => {
    const r = runTool({ items: [{ ...setA, reach: "lots" }] });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("Reach"));
  });

  it("negative likes: error", () => {
    const r = runTool({ items: [{ ...setA, likes: -5 }] });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("Likes cannot be negative"));
  });

  it("negative comments: error", () => {
    const r = runTool({ items: [{ ...setA, comments: -1 }] });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("Comments cannot be negative"));
  });

  it("invalid optional posts: error", () => {
    const r = runTool({ items: [{ ...setA, posts: "many" }] });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("Posts must be a number"));
  });

  it("numeric strings are accepted (builder text inputs)", () => {
    const r = runTool({
      items: [{ setLabel: "s", date: "2026-09-20", reach: "5000", likes: "100", comments: "20" }],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values?.totalReach, 5000);
    assert.equal(r.values?.avgEngagementRate, 2.4);
  });

  it("determinism: two runs give identical values", () => {
    const a = runTool({ items: [setA, setB] });
    const b = runTool({ items: [setA, setB] });
    assert.deepEqual(a, b);
  });
});
