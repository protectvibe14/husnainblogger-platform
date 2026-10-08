import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

describe("clip-segment-planner", () => {
  it("happy path: even strategy returns segments, coveragePct, warnings", () => {
    const r = runTool({ sourceDurationSec: 600, targetClipSec: 30, strategy: "even" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const segs = v.segments as { startMs: number; endMs: number; label: string }[];
    assert.ok(segs.length > 0);
    for (const s of segs) {
      assert.ok(s.endMs - s.startMs === 30000, "each even clip is exactly 30s");
      assert.ok(s.startMs >= 0 && s.endMs <= 600000);
      assert.ok(s.label.length > 0);
    }
    assert.equal(typeof v.coveragePct, "number");
    assert.ok((v.coveragePct as number) > 0 && (v.coveragePct as number) <= 100);
    assert.ok(Array.isArray(v.warnings));
  });

  it("even strategy count = floor(source/target), capped at 10", () => {
    const r = runTool({ sourceDurationSec: 600, targetClipSec: 30, strategy: "even" });
    const segs = (r.values as Record<string, unknown>).segments as unknown[];
    assert.equal(segs.length, 10); // floor(600/30)=20 -> capped at 10
  });

  it("even strategy: fewer than 10 when source only fits a few", () => {
    const r = runTool({ sourceDurationSec: 100, targetClipSec: 30, strategy: "even" });
    const segs = (r.values as Record<string, unknown>).segments as unknown[];
    assert.equal(segs.length, 3);
  });

  it("highlights strategy skips the first 8% intro", () => {
    const r = runTool({ sourceDurationSec: 600, targetClipSec: 30, strategy: "highlights" });
    const segs = (r.values as Record<string, unknown>).segments as { startMs: number; label: string }[];
    assert.ok(segs[0].startMs >= 48000, `first highlight starts at ${segs[0].startMs}ms (>= 8% of 600s)`);
    assert.ok(segs[0].label.includes("template position"));
  });

  it("highlights strategy warns it does not detect highlights", () => {
    const r = runTool({ sourceDurationSec: 600, targetClipSec: 30, strategy: "highlights" });
    const warnings = (r.values as Record<string, unknown>).warnings as string[];
    assert.ok(warnings.some((w) => w.includes("does not detect highlights")));
  });

  it("custom strategy parses line format", () => {
    const r = runTool({
      sourceDurationSec: 600,
      targetClipSec: 30,
      strategy: "custom",
      customRanges: "0:45 - 1:15\n90 - 120",
    });
    assert.equal(r.ok, true);
    const segs = (r.values as Record<string, unknown>).segments as { startMs: number; endMs: number }[];
    assert.equal(segs.length, 2);
    assert.deepEqual([segs[0].startMs, segs[0].endMs], [45000, 75000]);
    assert.deepEqual([segs[1].startMs, segs[1].endMs], [90000, 120000]);
  });

  it("custom strategy accepts JSON array", () => {
    const r = runTool({
      sourceDurationSec: 600,
      targetClipSec: 30,
      strategy: "custom",
      customRanges: '[{"startSec":10,"endSec":40},{"startSec":100,"endSec":130}]',
    });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).segments as unknown[]).length, 2);
  });

  it("custom strategy merges overlaps with a warning", () => {
    const r = runTool({
      sourceDurationSec: 600,
      targetClipSec: 30,
      strategy: "custom",
      customRanges: "0:45 - 1:15\n1:00 - 2:00",
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const segs = v.segments as { startMs: number; endMs: number }[];
    assert.equal(segs.length, 1);
    assert.deepEqual([segs[0].startMs, segs[0].endMs], [45000, 120000]);
    assert.ok((v.warnings as string[]).some((w) => w.includes("Merged")));
  });

  it("custom range outside source errors", () => {
    const r = runTool({
      sourceDurationSec: 60,
      targetClipSec: 15,
      strategy: "custom",
      customRanges: "0:30 - 2:00",
    });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /outside the video/);
  });

  it("custom strategy with empty ranges errors", () => {
    const r = runTool({ sourceDurationSec: 600, targetClipSec: 30, strategy: "custom", customRanges: "   " });
    assert.equal(r.ok, false);
  });

  it("target longer than source errors", () => {
    const r = runTool({ sourceDurationSec: 60, targetClipSec: 90, strategy: "even" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /not shorter/i);
  });

  it("target equal to source errors", () => {
    const r = runTool({ sourceDurationSec: 60, targetClipSec: 60, strategy: "even" });
    assert.equal(r.ok, false);
  });

  it("rejects source of 0", () => {
    const r = runTool({ sourceDurationSec: 0, targetClipSec: 30, strategy: "even" });
    assert.equal(r.ok, false);
  });

  it("rejects negative target", () => {
    const r = runTool({ sourceDurationSec: 600, targetClipSec: -5, strategy: "even" });
    assert.equal(r.ok, false);
  });

  it("rejects bad strategy", () => {
    const r = runTool({ sourceDurationSec: 600, targetClipSec: 30, strategy: "random" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /highlights.*even.*custom/);
  });

  it("coveragePct math: even 600s source, 3x30s = 15%", () => {
    const r = runTool({ sourceDurationSec: 600, targetClipSec: 30, strategy: "even", });
    // count = floor(600/30)=20 -> capped 10, coverage = 10*30/600 = 50%
    const v = r.values as Record<string, unknown>;
    assert.equal(v.coveragePct, 50);
  });

  it("custom coverage: 60s of 600s = 10%", () => {
    const r = runTool({
      sourceDurationSec: 600,
      targetClipSec: 30,
      strategy: "custom",
      customRanges: "0 - 30\n300 - 330",
    });
    assert.equal((r.values as Record<string, unknown>).coveragePct, 10);
  });

  it("string numbers for durations are accepted", () => {
    const r = runTool({ sourceDurationSec: "600", targetClipSec: "30", strategy: "even" });
    assert.equal(r.ok, true);
  });

  it("determinism: two runs identical", () => {
    const opts = { sourceDurationSec: 600, targetClipSec: 30, strategy: "highlights" as string };
    assert.equal(JSON.stringify(runTool(opts)), JSON.stringify(runTool(opts)));
  });
});
