/**
 * Tests for the Caption Timing Validator (tool-257).
 * Run: node --test logic.test.ts   (zero dependencies)
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const CLEAN_SRT =
  "1\n00:00:01,000 --> 00:00:04,000\nHello world\n\n" +
  "2\n00:00:05,000 --> 00:00:08,000\nSecond cue here\n";

function issuesOf(r: { ok: boolean; values?: Record<string, unknown> }) {
  assert.equal(r.ok, true);
  return r.values!.issues as Array<{
    cueIndex: number;
    rule: string;
    severity: string;
    message: string;
  }>;
}

describe("runTool — validation", () => {
  it("missing input → ok:false", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok(typeof r.error === "string" && r.error.length > 0);
  });

  it("blank input → ok:false", () => {
    const r = runTool({ subtitleText: "  \n " });
    assert.equal(r.ok, false);
  });

  it("no parseable cues → ok:false", () => {
    const r = runTool({ subtitleText: "this is not a subtitle file at all" });
    assert.equal(r.ok, false);
  });
});

describe("runTool — happy path", () => {
  it("clean SRT → pass, zero errors, zero warnings", () => {
    const r = runTool({ subtitleText: CLEAN_SRT });
    assert.equal(r.ok, true);
    assert.equal(r.values!.passFail, "pass");
    assert.deepEqual(r.values!.summary, { errors: 0, warnings: 0 });
    assert.deepEqual(r.values!.issues, []);
  });

  it("clean VTT with WEBVTT header parses too", () => {
    const vtt =
      "WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nHello world\n\n" +
      "00:00:05.000 --> 00:00:08.000\nSecond cue here\n";
    const r = runTool({ subtitleText: vtt });
    assert.equal(r.ok, true);
    assert.equal(r.values!.passFail, "pass");
  });

  it("output ids match the contract: issues, summary, passFail", () => {
    const r = runTool({ subtitleText: CLEAN_SRT });
    assert.ok(r.values);
    assert.deepEqual(Object.keys(r.values).sort(), ["issues", "passFail", "summary"]);
  });

  it("is deterministic", () => {
    const a = runTool({ subtitleText: CLEAN_SRT });
    const b = runTool({ subtitleText: CLEAN_SRT });
    assert.deepEqual(a, b);
  });
});

describe("runTool — error rules", () => {
  it("zero-duration cue → error, passFail fail", () => {
    const r = runTool({ subtitleText: "1\n00:00:01,000 --> 00:00:01,000\nSame time\n" });
    const issues = issuesOf(r);
    assert.ok(issues.some((i) => i.rule === "zero-duration" && i.severity === "error"));
    assert.equal(r.values!.passFail, "fail");
    assert.equal((r.values!.summary as { errors: number }).errors, 1);
  });

  it("end before start → zero-duration error", () => {
    const r = runTool({ subtitleText: "1\n00:00:05,000 --> 00:00:02,000\nBackwards\n" });
    assert.ok(issuesOf(r).some((i) => i.rule === "zero-duration"));
    assert.equal(r.values!.passFail, "fail");
  });

  it("overlapping cues → overlap error naming both cues", () => {
    const srt =
      "1\n00:00:01,000 --> 00:00:04,000\nFirst\n\n" +
      "2\n00:00:03,000 --> 00:00:05,000\nSecond\n";
    const r = runTool({ subtitleText: srt });
    const issues = issuesOf(r);
    const overlap = issues.find((i) => i.rule === "overlap");
    assert.ok(overlap);
    assert.equal(overlap.severity, "error");
    assert.equal(overlap.cueIndex, 2);
    assert.equal(r.values!.passFail, "fail");
  });

  it("empty cue text → empty-text error", () => {
    const r = runTool({ subtitleText: "1\n00:00:01,000 --> 00:00:04,000\n   \n" });
    assert.ok(issuesOf(r).some((i) => i.rule === "empty-text" && i.severity === "error"));
    assert.equal(r.values!.passFail, "fail");
  });

  it("unparseable timing line → unparseable-timing error, cue skipped", () => {
    const srt =
      "1\n00:00:01,000 --> 00:00:04,000\nGood\n\n" +
      "2\nnot-a-timestamp --> 00:00:06,000\nBad\n";
    const r = runTool({ subtitleText: srt });
    const issues = issuesOf(r);
    assert.ok(issues.some((i) => i.rule === "unparseable-timing" && i.severity === "error"));
    assert.equal(r.values!.passFail, "fail");
  });
});

describe("runTool — warning rules", () => {
  it("gap < 83ms → min-gap warning (Netflix 2-frame rule)", () => {
    const srt =
      "1\n00:00:01,000 --> 00:00:04,000\nFirst\n\n" +
      "2\n00:00:04,050 --> 00:00:06,000\nSecond\n";
    const r = runTool({ subtitleText: srt });
    const issues = issuesOf(r);
    assert.ok(issues.some((i) => i.rule === "min-gap" && i.severity === "warning"));
    assert.equal(r.values!.passFail, "pass"); // warnings do not fail the run
  });

  it("gap exactly 83ms → no min-gap warning", () => {
    const srt =
      "1\n00:00:01,000 --> 00:00:04,000\nFirst\n\n" +
      "2\n00:00:04,083 --> 00:00:06,000\nSecond\n";
    assert.ok(!issuesOf(runTool({ subtitleText: srt })).some((i) => i.rule === "min-gap"));
  });

  it("duration < 833ms → flash-risk warning", () => {
    const r = runTool({ subtitleText: "1\n00:00:01,000 --> 00:00:01,500\nQuick\n" });
    assert.ok(issuesOf(r).some((i) => i.rule === "flash-risk" && i.severity === "warning"));
  });

  it("duration exactly 833ms → no flash-risk warning", () => {
    const r = runTool({ subtitleText: "1\n00:00:01,000 --> 00:00:01,833\nEdge\n" });
    assert.ok(!issuesOf(r).some((i) => i.rule === "flash-risk"));
  });

  it("duration > 7000ms → excessive-duration warning", () => {
    const r = runTool({ subtitleText: "1\n00:00:01,000 --> 00:00:09,000\nLong cue\n" });
    assert.ok(issuesOf(r).some((i) => i.rule === "excessive-duration" && i.severity === "warning"));
  });
});

describe("runTool — edge cases", () => {
  it("single cue file → gap checks skipped, no false overlap", () => {
    const r = runTool({ subtitleText: "1\n00:00:01,000 --> 00:00:04,000\nOnly cue\n" });
    assert.ok(
      !issuesOf(r).some((i) => i.rule === "overlap" || i.rule === "min-gap"),
    );
    assert.equal(r.values!.passFail, "pass");
  });

  it("summary counts errors and warnings separately", () => {
    const srt =
      "1\n00:00:01,000 --> 00:00:04,000\nFirst\n\n" +
      "2\n00:00:03,000 --> 00:00:03,500\nSecond\n";
    const r = runTool({ subtitleText: srt });
    const summary = r.values!.summary as { errors: number; warnings: number };
    assert.equal(summary.errors, 1); // overlap
    assert.equal(summary.warnings, 1); // flash-risk on cue 2 (500ms)
  });

  it("issue objects carry cueIndex, rule, severity, message", () => {
    const r = runTool({ subtitleText: "1\n00:00:01,000 --> 00:00:01,500\nQuick\n" });
    const issues = issuesOf(r);
    assert.ok(issues.length > 0);
    for (const i of issues) {
      assert.equal(typeof i.cueIndex, "number");
      assert.equal(typeof i.rule, "string");
      assert.ok(i.severity === "error" || i.severity === "warning");
      assert.ok(i.message.length > 0);
    }
  });

  it("CRLF line endings are handled", () => {
    const r = runTool({ subtitleText: "1\r\n00:00:01,000 --> 00:00:04,000\r\nHi\r\n" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.passFail, "pass");
  });

  it("dot-decimal timestamps are accepted", () => {
    const r = runTool({ subtitleText: "1\n00:00:01.000 --> 00:00:04.000\nHi\n" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.passFail, "pass");
  });

  it("out-of-order cue start (gap computed against previous) stays deterministic", () => {
    const srt =
      "1\n00:00:01,000 --> 00:00:04,000\nFirst\n\n" +
      "2\n00:00:02,000 --> 00:00:03,000\nEarly\n";
    const a = runTool({ subtitleText: srt });
    const b = runTool({ subtitleText: srt });
    assert.deepEqual(a, b);
    assert.ok(issuesOf(a).some((i) => i.rule === "overlap"));
  });
});
