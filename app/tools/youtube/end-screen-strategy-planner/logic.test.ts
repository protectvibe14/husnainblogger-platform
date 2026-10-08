import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const BASE = { videoDuration: 480, goal: "subs", madeForKids: false };

describe("end-screen-strategy-planner — happy path", () => {
  it("returns ok with layout, timing, eligibility, runwaySeconds", () => {
    const r = runTool({ ...BASE });
    assert.equal(r.ok, true);
    assert.ok(Array.isArray(r.values!.layout));
    assert.equal(typeof r.values!.timing, "string");
    assert.equal(typeof r.values!.eligibility, "string");
    assert.equal(typeof r.values!.runwaySeconds, "number");
  });

  it("uses a 20s runway for a long video", () => {
    const r = runTool({ ...BASE });
    assert.equal(r.values!.runwaySeconds, 20);
  });

  it("staggers elements inside the final 20 seconds", () => {
    const r = runTool({ videoDuration: 480, goal: "subs" });
    const layout = r.values!.layout as string[];
    assert.equal(layout.length, 3);
    assert.ok(layout[0].includes("7:40")); // 480 - 20
    assert.ok(layout.every((line) => line.includes("8:00")));
  });

  it("uses the goal-specific element set for watch time", () => {
    const r = runTool({ videoDuration: 300, goal: "watch-time" });
    const layout = (r.values!.layout as string[]).join(" ");
    assert.ok(layout.includes("Playlist (next in series)"));
    assert.ok(layout.includes("Specific video (next episode)"));
  });

  it("uses the goal-specific element set for external links", () => {
    const r = runTool({ videoDuration: 300, goal: "external-link" });
    const layout = (r.values!.layout as string[]).join(" ");
    assert.ok(layout.includes("Associated website link"));
  });

  it("never exceeds the 4-element maximum", () => {
    for (const goal of ["subs", "watch-time", "external-link"]) {
      const r = runTool({ videoDuration: 600, goal });
      assert.ok((r.values!.layout as string[]).length <= 4);
    }
  });

  it("accepts exactly 25 seconds (minimum)", () => {
    const r = runTool({ videoDuration: 25, goal: "subs" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.runwaySeconds, 20);
  });

  it("keeps the full 20s runway for a short 30s video", () => {
    const r = runTool({ videoDuration: 30, goal: "subs" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.runwaySeconds, 20); // min(20, 30-5)
  });

  it("is deterministic — same inputs give identical output", () => {
    const a = runTool({ ...BASE });
    const b = runTool({ ...BASE });
    assert.deepEqual(a, b);
  });
});

describe("end-screen-strategy-planner — validation errors", () => {
  it("rejects duration under 25s with an unavailable message", () => {
    const r = runTool({ videoDuration: 24, goal: "subs" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("unavailable"));
  });

  it("rejects a missing duration", () => {
    const r = runTool({ goal: "subs" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects a non-numeric duration", () => {
    const r = runTool({ videoDuration: "480", goal: "subs" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects zero duration", () => {
    const r = runTool({ videoDuration: 0, goal: "subs" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects an unrealistically long duration", () => {
    const r = runTool({ videoDuration: 99999999, goal: "subs" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects a missing goal", () => {
    const r = runTool({ videoDuration: 480 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects an unknown goal value", () => {
    const r = runTool({ videoDuration: 480, goal: "virality" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });
});

describe("end-screen-strategy-planner — edge cases", () => {
  it("made-for-kids returns a graceful unavailable plan, not an error", () => {
    const r = runTool({ videoDuration: 480, goal: "subs", madeForKids: true });
    assert.equal(r.ok, true);
    assert.deepEqual(r.values!.layout, []);
    assert.equal(r.values!.runwaySeconds, 0);
    assert.ok((r.values!.eligibility as string).includes("made-for-kids"));
  });

  it("made-for-kids timing explains there is no timing plan", () => {
    const r = runTool({ videoDuration: 480, goal: "watch-time", madeForKids: true });
    assert.ok((r.values!.timing as string).includes("cannot be applied"));
  });
});
