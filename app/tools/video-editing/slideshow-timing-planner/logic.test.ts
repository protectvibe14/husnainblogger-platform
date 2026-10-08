import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = { slideCount: 5, totalDurationSec: 12, transitionMs: 500, holdStyle: "equal" };
const OUTPUT_IDS = ["timeline", "totalCheck"];

function total(v: Record<string, unknown>): number {
  return (v.timeline as { endMs: number }[]).reduce((_, r) => r.endMs, 0);
}

describe("slideshow-timing-planner (tool-265)", () => {
  it("happy path: timeline rows + totalCheck", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const tl = v.timeline as { slide: number; startMs: number; endMs: number; transitionMs: number }[];
    assert.equal(tl.length, 5);
    assert.deepEqual(tl.map((x) => x.slide), [1, 2, 3, 4, 5]);
    assert.equal(typeof v.totalCheck, "string");
  });

  it("output keys match meta.ts outputs exactly", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), OUTPUT_IDS);
  });

  it("equal holds: 5 slides, 12s, 500ms transitions -> 2000ms holds", () => {
    const r = runTool(base);
    const tl = (r.values as Record<string, unknown>).timeline as { startMs: number; endMs: number; transitionMs: number }[];
    for (const row of tl.slice(0, 4)) {
      assert.equal(row.endMs - row.startMs, 2000);
      assert.equal(row.transitionMs, 500);
    }
    assert.equal(tl[4].transitionMs, 0);
    assert.equal(tl[4].endMs, 12000);
  });

  it("timeline is contiguous and ends exactly at the total", () => {
    const cases = [
      { slideCount: 3, totalDurationSec: 10, transitionMs: 300, holdStyle: "equal" },
      { slideCount: 7, totalDurationSec: 20.5, transitionMs: 700, holdStyle: "equal" },
      { slideCount: 1, totalDurationSec: 5, holdStyle: "equal" },
    ];
    for (const c of cases) {
      const r = runTool(c);
      assert.equal(r.ok, true, JSON.stringify(c));
      const v = r.values as Record<string, unknown>;
      const tl = v.timeline as { startMs: number; endMs: number; transitionMs: number }[];
      const expectedTotal = Math.round((c.totalDurationSec as number) * 1000);
      assert.equal(tl[tl.length - 1].endMs, expectedTotal, JSON.stringify(c));
      for (let i = 1; i < tl.length; i++) {
        assert.equal(tl[i].startMs, tl[i - 1].endMs + tl[i - 1].transitionMs, `gap ${i}`);
      }
      assert.ok((v.totalCheck as string).includes("="));
    }
  });

  it("weightedByText: longer text gets longer holds", () => {
    const r = runTool({
      slideCount: 3, totalDurationSec: 12, transitionMs: 500,
      holdStyle: "weightedByText", textLengths: "100, 20, 40",
    });
    assert.equal(r.ok, true);
    const tl = (r.values as Record<string, unknown>).timeline as { endMs: number; startMs: number }[];
    const holds = tl.map((x) => x.endMs - x.startMs);
    assert.ok(holds[0] > holds[1], `holds=${holds}`);
    assert.ok(holds[0] > holds[2], `holds=${holds}`);
    assert.equal(tl[2].endMs, 12000);
  });

  it("weightedByText: equal text lengths -> equal holds", () => {
    const r = runTool({
      slideCount: 4, totalDurationSec: 10, transitionMs: 0,
      holdStyle: "weightedByText", textLengths: "50,50,50,50",
    });
    assert.equal(r.ok, true);
    const tl = (r.values as Record<string, unknown>).timeline as { endMs: number; startMs: number }[];
    const holds = new Set(tl.map((x) => x.endMs - x.startMs));
    assert.equal(holds.size, 1);
  });

  it("edge case: single slide skips transition with a note", () => {
    const r = runTool({ slideCount: 1, totalDurationSec: 5, holdStyle: "equal" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const tl = v.timeline as { transitionMs: number; endMs: number }[];
    assert.equal(tl.length, 1);
    assert.equal(tl[0].transitionMs, 0);
    assert.equal(tl[0].endMs, 5000);
    assert.ok((v.totalCheck as string).toLowerCase().includes("single slide"));
  });

  it("edge case: transitions eating the whole duration -> error", () => {
    const r = runTool({ slideCount: 5, totalDurationSec: 2, transitionMs: 600, holdStyle: "equal" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("eat the whole duration"));
  });

  it("edge case: transition >= per-slide hold -> error", () => {
    const r = runTool({ slideCount: 4, totalDurationSec: 4, transitionMs: 800, holdStyle: "equal" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("shorter than each slide"));
  });

  it("edge case: weightedByText without textLengths -> error", () => {
    const r = runTool({ slideCount: 3, totalDurationSec: 10, holdStyle: "weightedByText" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("text lengths"));
  });

  it("edge case: textLengths count mismatch -> error", () => {
    const r = runTool({
      slideCount: 3, totalDurationSec: 10, holdStyle: "weightedByText", textLengths: "10,20",
    });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("3 slide(s)"));
  });

  it("edge case: non-numeric text length -> error", () => {
    const r = runTool({
      slideCount: 2, totalDurationSec: 10, holdStyle: "weightedByText", textLengths: "10,abc",
    });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("abc"));
  });

  it("validation error: slideCount 0", () => {
    const r = runTool({ slideCount: 0, totalDurationSec: 10, holdStyle: "equal" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("at least 1"));
  });

  it("validation error: slideCount not whole", () => {
    const r = runTool({ slideCount: 2.5, totalDurationSec: 10, holdStyle: "equal" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("whole number"));
  });

  it("validation error: totalDuration 0", () => {
    const r = runTool({ slideCount: 3, totalDurationSec: 0, holdStyle: "equal" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("above 0"));
  });

  it("validation error: negative transition", () => {
    const r = runTool({ slideCount: 3, totalDurationSec: 10, transitionMs: -100, holdStyle: "equal" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).toLowerCase().includes("negative"));
  });

  it("validation error: unknown holdStyle", () => {
    const r = runTool({ slideCount: 3, totalDurationSec: 10, holdStyle: "random" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("weightedByText"));
  });

  it("transition defaults to 500ms when omitted", () => {
    const r = runTool({ slideCount: 2, totalDurationSec: 6, holdStyle: "equal" });
    assert.equal(r.ok, true);
    const tl = (r.values as Record<string, unknown>).timeline as { transitionMs: number }[];
    assert.equal(tl[0].transitionMs, 500);
  });

  it("short holds produce a readability note", () => {
    const r = runTool({ slideCount: 5, totalDurationSec: 6, transitionMs: 200, holdStyle: "equal" });
    assert.equal(r.ok, true);
    const check = (r.values as Record<string, unknown>).totalCheck as string;
    assert.ok(check.includes("1.5s"));
  });

  it("determinism: same inputs twice produce identical outputs", () => {
    const input = {
      slideCount: 4, totalDurationSec: 15, transitionMs: 400,
      holdStyle: "weightedByText", textLengths: "30, 90, 10, 50",
    };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepEqual(a, b);
  });
});
