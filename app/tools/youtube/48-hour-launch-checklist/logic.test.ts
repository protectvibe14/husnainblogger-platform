import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TRACKER_ITEMS, describeProgress } from "./logic.ts";

describe("TRACKER_ITEMS — structure", () => {
  it("has 18 items", () => {
    assert.equal(TRACKER_ITEMS.length, 18);
  });
  it("ids are unique lowercase kebab-case", () => {
    const ids = TRACKER_ITEMS.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) assert.match(id, /^[a-z0-9-]+$/);
  });
  it("every item has a non-empty label", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(item.label.trim().length > 0, `empty label for ${item.id}`);
    }
  });
  it("every item has a 1-line detail", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(item.detail && item.detail.trim().length > 0, `missing detail for ${item.id}`);
    }
  });
  it("covers all 7 timed phases", () => {
    const labels = TRACKER_ITEMS.map((i) => i.label).join(" ");
    for (const phase of ["T-48h", "T-24h", "T-2h", "T+0", "T+24h", "T+48h"]) {
      assert.ok(labels.includes(phase), `missing phase ${phase}`);
    }
  });
  it("phase order follows the launch timeline", () => {
    const phaseOf = (label: string) => label.split(" ")[0];
    const order = ["T-48h", "T-24h", "T-2h", "T+0", "T+24h", "T+48h"];
    const phases = TRACKER_ITEMS.map((i) => phaseOf(i.label));
    const firstSeen: string[] = [];
    for (const p of phases) if (!firstSeen.includes(p)) firstSeen.push(p);
    assert.deepEqual(firstSeen, order);
  });
  it("is deterministic (deep-equal across reads)", () => {
    assert.deepEqual(TRACKER_ITEMS, JSON.parse(JSON.stringify(TRACKER_ITEMS)));
  });
  it("no item claims automation or posting", () => {
    const text = TRACKER_ITEMS.map((i) => `${i.label} ${i.detail}`).join(" ").toLowerCase();
    assert.ok(!text.includes("auto-post"), "checklist must not claim automation");
    assert.ok(!text.includes("automatically post"), "checklist must not claim automation");
  });
});

describe("describeProgress", () => {
  it("0 of total -> not started message", () => {
    const s = describeProgress(0, 18);
    assert.ok(s.startsWith("0 of 18 done"));
    assert.ok(s.toLowerCase().includes("nothing checked"));
  });
  it("partial -> count and percent", () => {
    const s = describeProgress(9, 18);
    assert.ok(s.includes("9 of 18 done (50%)"));
  });
  it("rounds percent", () => {
    const s = describeProgress(1, 3);
    assert.ok(s.includes("33%"), s);
  });
  it("all done -> complete message", () => {
    const s = describeProgress(18, 18);
    assert.ok(s.includes("18 of 18 done (100%)"));
    assert.ok(s.toLowerCase().includes("complete"));
  });
  it("clamps checked above total", () => {
    const s = describeProgress(25, 18);
    assert.ok(s.includes("18 of 18 done (100%)"), s);
  });
  it("clamps negative checked to 0", () => {
    const s = describeProgress(-3, 18);
    assert.ok(s.startsWith("0 of 18 done"), s);
  });
  it("handles 0 total without NaN", () => {
    const s = describeProgress(0, 0);
    assert.ok(!s.includes("NaN"), s);
    assert.ok(s.includes("0 of 0 done"), s);
  });
  it("floors fractional counts", () => {
    const s = describeProgress(2.7, 18);
    assert.ok(s.includes("2 of 18 done"), s);
  });
  it("is deterministic", () => {
    assert.equal(describeProgress(5, 18), describeProgress(5, 18));
  });
});
