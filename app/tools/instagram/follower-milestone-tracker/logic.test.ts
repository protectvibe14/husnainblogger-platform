import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, formatInt, MANUAL_ENTRY_NOTICE } from "./logic.ts";

describe("follower-milestone-tracker", () => {
  it("happy path: one milestone produces summary outputs", () => {
    const r = runTool({
      items: [{ label: "10K", targetFollowers: "10000", currentFollowers: "6500" }],
    });
    assert.equal(r.ok, true);
    const lines = r.values!.lines as string[];
    assert.equal(lines.length, 1);
    assert.ok(lines[0].includes("10K"));
    assert.ok(lines[0].includes("6,500/10,000"));
    assert.ok(lines[0].includes("(65%)"));
    assert.ok(lines[0].includes("3,500 to go"));
    assert.equal(r.values!.overallPercent, 65);
    assert.equal(r.values!.totalRemaining, 3500);
  });

  it("multiple milestones: overall percent is weighted by target", () => {
    const r = runTool({
      items: [
        { label: "A", targetFollowers: 1000, currentFollowers: 1000 },
        { label: "B", targetFollowers: 9000, currentFollowers: 0 },
      ],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.overallPercent, 10);
    assert.equal(r.values!.totalRemaining, 9000);
    assert.equal((r.values!.lines as string[]).length, 2);
  });

  it("current above target: percent capped at 100, 'Reached' status", () => {
    const r = runTool({
      items: [{ label: "5K", targetFollowers: 5000, currentFollowers: 6200 }],
    });
    assert.equal(r.ok, true);
    const line = (r.values!.lines as string[])[0];
    assert.ok(line.includes("(100%)"));
    assert.ok(line.includes("0 to go"));
    assert.ok(line.includes("Reached"));
  });

  it("verdict: all milestones reached", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: 100, currentFollowers: 100 }],
    });
    assert.ok((r.values!.verdict as string).includes("All 1 milestone reached"));
  });

  it("verdict: almost there at >= 75%", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: 100, currentFollowers: 80 }],
    });
    assert.ok((r.values!.verdict as string).startsWith("Almost there"));
  });

  it("verdict: making progress at 25-74%", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: 100, currentFollowers: 40 }],
    });
    assert.ok((r.values!.verdict as string).startsWith("Making progress"));
  });

  it("verdict: getting started below 25% with some followers", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: 100, currentFollowers: 10 }],
    });
    assert.ok((r.values!.verdict as string).startsWith("Getting started"));
  });

  it("verdict: not started at 0 followers", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: 100, currentFollowers: 0 }],
    });
    assert.ok((r.values!.verdict as string).startsWith("Not started yet"));
  });

  it("targetDate included in the line when valid", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: 1000, currentFollowers: 100, targetDate: "2026-12-31" }],
    });
    assert.equal(r.ok, true);
    assert.ok((r.values!.lines as string[])[0].includes("target date 2026-12-31"));
  });

  it("invalid targetDate format is rejected", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: 1000, currentFollowers: 100, targetDate: "31-12-2026" }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1.*targetDate/);
  });

  it("impossible targetDate is rejected", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: 1000, currentFollowers: 100, targetDate: "2026-02-30" }],
    });
    assert.equal(r.ok, false);
  });

  it("missing label is rejected with item number", () => {
    const r = runTool({
      items: [
        { label: "A", targetFollowers: 100, currentFollowers: 10 },
        { label: "  ", targetFollowers: 200, currentFollowers: 20 },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 2.*label/);
  });

  it("targetFollowers below 1 is rejected", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: 0, currentFollowers: 0 }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1.*targetFollowers/);
  });

  it("non-integer counts are rejected", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: 1000.5, currentFollowers: 100 }],
    });
    assert.equal(r.ok, false);
  });

  it("negative currentFollowers is rejected", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: 1000, currentFollowers: -3 }],
    });
    assert.equal(r.ok, false);
  });

  it("non-numeric count strings are rejected", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: "ten thousand", currentFollowers: 100 }],
    });
    assert.equal(r.ok, false);
  });

  it("empty items array is rejected", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one milestone/);
  });

  it("missing items is rejected", () => {
    const r = runTool({} as unknown as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
  });

  it("notice states manual entry only and no live follower access", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: 100, currentFollowers: 10 }],
    });
    const notice = r.values!.notice as string;
    assert.equal(notice, MANUAL_ENTRY_NOTICE);
    assert.ok(notice.includes("Manual entry only"));
    assert.ok(notice.includes("cannot read your live Instagram follower counts"));
    assert.ok(notice.includes("browser session"));
  });

  it("output ids match meta.ts (lines, overallPercent, totalRemaining, verdict, notice)", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: 100, currentFollowers: 10 }],
    });
    assert.deepEqual(
      Object.keys(r.values!).sort(),
      ["lines", "notice", "overallPercent", "totalRemaining", "verdict"]
    );
  });

  it("deterministic: same inputs give identical output", () => {
    const args = {
      items: [
        { label: "10K", targetFollowers: "10000", currentFollowers: "6500", targetDate: "2026-12-31" },
        { label: "25K", targetFollowers: 25000, currentFollowers: 6500 },
      ],
    };
    assert.deepEqual(runTool(args), runTool(args));
  });

  it("formatInt inserts thousands separators", () => {
    assert.equal(formatInt(1000000), "1,000,000");
    assert.equal(formatInt(999), "999");
  });

  it("percent rounds to one decimal", () => {
    const r = runTool({
      items: [{ label: "A", targetFollowers: 3000, currentFollowers: 1000 }],
    });
    assert.equal(r.values!.overallPercent, 33.3);
  });

  it("label is trimmed", () => {
    const r = runTool({
      items: [{ label: "  First 1K  ", targetFollowers: 1000, currentFollowers: 500 }],
    });
    assert.ok((r.values!.lines as string[])[0].startsWith("First 1K:"));
  });
});
