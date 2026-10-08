import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = { totalDurationSec: 120, niche: "productivity", pattern: "hook-loop" };

describe("retention-pacing-planner (tool-279)", () => {
  it("happy path: hook-loop returns 6 segments", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const segs = v.segments as Record<string, unknown>[];
    assert.equal(segs.length, 6);
    for (const s of segs) {
      assert.equal(typeof s.startMs, "number");
      assert.equal(typeof s.endMs, "number");
      assert.equal(typeof s.purpose, "string");
      assert.equal(typeof s.beatType, "string");
      assert.ok(!String(s.purpose).includes("{n}"));
    }
    assert.ok(segs.some((s) => String(s.purpose).includes("productivity")));
    assert.equal(v.patternChangeCount, 5);
    assert.equal(typeof v.pacingScore, "number");
    assert.ok(Array.isArray(v.guidanceNotes));
  });

  it("output keys match meta.ts outputs (segments, patternChangeCount, pacingScore, guidanceNotes)", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), [
      "guidanceNotes",
      "pacingScore",
      "patternChangeCount",
      "segments",
    ]);
  });

  it("segments tile the full duration exactly, in order", () => {
    for (const pattern of ["hook-loop", "story-arc", "listicle"]) {
      const r = runTool({ ...base, pattern, totalDurationSec: 200 });
      assert.equal(r.ok, true);
      const segs = (r.values as Record<string, unknown>).segments as { startMs: number; endMs: number }[];
      assert.equal(segs[0].startMs, 0, pattern);
      assert.equal(segs[segs.length - 1].endMs, 200000, pattern);
      for (let i = 1; i < segs.length; i++) {
        assert.equal(segs[i].startMs, segs[i - 1].endMs, `${pattern} gap at ${i}`);
        assert.ok(segs[i].endMs > segs[i].startMs);
      }
    }
  });

  it("story-arc returns 5 segments ending in a CTA", () => {
    const r = runTool({ ...base, pattern: "story-arc" });
    const segs = (r.values as Record<string, unknown>).segments as Record<string, string>[];
    assert.equal(segs.length, 5);
    assert.equal(segs[segs.length - 1].beatType, "cta");
    assert.equal((r.values as Record<string, unknown>).patternChangeCount, 4);
  });

  it("listicle scales item count with duration (3-8 items)", () => {
    const short = runTool({ ...base, pattern: "listicle", totalDurationSec: 60 });
    const long = runTool({ ...base, pattern: "listicle", totalDurationSec: 600 });
    const itemsOf = (r: { values?: Record<string, unknown> }) =>
      ((r.values as Record<string, unknown>).segments as Record<string, string>[]).filter(
        (s) => s.beatType === "item"
      ).length;
    const nShort = itemsOf(short);
    const nLong = itemsOf(long);
    assert.ok(nShort >= 3 && nShort <= 8, `short items=${nShort}`);
    assert.ok(nLong >= 3 && nLong <= 8, `long items=${nLong}`);
    assert.ok(nLong >= nShort);
  });

  it("duration under 15s uses the micro pattern with a note", () => {
    const r = runTool({ totalDurationSec: 10, niche: "fitness", pattern: "listicle" });
    assert.equal(r.ok, true);
    const segs = (r.values as Record<string, unknown>).segments as unknown[];
    assert.equal(segs.length, 3);
    const notes = (r.values as Record<string, unknown>).guidanceNotes as string[];
    assert.ok(notes.some((n) => n.includes("micro-pattern")));
  });

  it("pacingScore is within 0-100 and labeled heuristic in notes", () => {
    for (const pattern of ["hook-loop", "story-arc", "listicle"]) {
      const r = runTool({ ...base, pattern, totalDurationSec: 90 });
      const score = (r.values as Record<string, unknown>).pacingScore as number;
      assert.ok(Number.isInteger(score) && score >= 0 && score <= 100, `${pattern}: ${score}`);
      const notes = (r.values as Record<string, unknown>).guidanceNotes as string[];
      assert.ok(notes.some((n) => n.includes("heuristic") && n.includes("not a predicted")));
    }
  });

  it("fast hook earns the hook bonus (score differs from slow hook)", () => {
    // 120s hook-loop: hook is 8% = 9.6s > 5s -> no hook bonus.
    // 60s hook-loop: hook is 8% = 4.8s <= 5s -> hook bonus.
    const slow = (runTool({ ...base, totalDurationSec: 120 }).values as Record<string, unknown>).pacingScore;
    const fast = (runTool({ ...base, totalDurationSec: 60 }).values as Record<string, unknown>).pacingScore;
    assert.ok((fast as number) > (slow as number), `fast=${fast} slow=${slow}`);
  });

  it("micro pattern scores lower than the same pattern at full length", () => {
    const micro = (runTool({ totalDurationSec: 10, niche: "x", pattern: "hook-loop" }).values as Record<string, unknown>).pacingScore;
    const full = (runTool({ totalDurationSec: 120, niche: "x", pattern: "hook-loop" }).values as Record<string, unknown>).pacingScore;
    assert.ok((micro as number) < (full as number));
  });

  it("niche is optional; falls back to a generic slot fill", () => {
    const r = runTool({ totalDurationSec: 60, pattern: "story-arc" });
    assert.equal(r.ok, true);
    const segs = (r.values as Record<string, unknown>).segments as Record<string, string>[];
    assert.ok(!segs.some((s) => s.purpose.includes("{n}")));
  });

  it("rejects duration below 5s", () => {
    assert.equal(runTool({ ...base, totalDurationSec: 4 }).ok, false);
  });

  it("rejects duration above 3600s", () => {
    assert.equal(runTool({ ...base, totalDurationSec: 3601 }).ok, false);
  });

  it("accepts boundary durations 5 and 3600", () => {
    assert.equal(runTool({ ...base, totalDurationSec: 5 }).ok, true);
    assert.equal(runTool({ ...base, totalDurationSec: 3600 }).ok, true);
  });

  it("rejects unknown pattern", () => {
    const r = runTool({ ...base, pattern: "freestyle" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("hook-loop"));
  });

  it("rejects missing duration", () => {
    assert.equal(runTool({ pattern: "hook-loop" }).ok, false);
  });

  it("is deterministic: same inputs twice give identical output", () => {
    const a = runTool(base);
    const b = runTool({ ...base });
    assert.deepEqual(a, b);
  });

  it("patternChangeCount equals segments - 1", () => {
    for (const pattern of ["hook-loop", "story-arc", "listicle"]) {
      const r = runTool({ ...base, pattern, totalDurationSec: 150 });
      const v = r.values as Record<string, unknown>;
      assert.equal(v.patternChangeCount, (v.segments as unknown[]).length - 1, pattern);
    }
  });
});
