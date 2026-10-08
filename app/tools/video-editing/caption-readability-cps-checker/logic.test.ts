/**
 * Tests for the Caption Readability (CPS) Checker (tool-258).
 * Run: node --test logic.test.ts   (zero dependencies)
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

type Values = Record<string, unknown>;

// 8 chars ("Hello!12") over 1s = 8 CPS -> pass under adult 20
const FAST_SRT =
  "1\n00:00:01,000 --> 00:00:02,000\nHello!12\n\n" +
  "2\n00:00:03,000 --> 00:00:04,000\nAnother text here...\n";

function okValues(v: Values) {
  const r = runTool(v);
  assert.equal(r.ok, true, JSON.stringify(r.error));
  assert.ok(r.values);
  return r.values;
}

describe("runTool — validation", () => {
  it("missing subtitleText → ok:false", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok(typeof r.error === "string");
  });

  it("blank subtitleText → ok:false", () => {
    assert.equal(runTool({ subtitleText: "  " }).ok, false);
  });

  it("no cues → ok:false", () => {
    assert.equal(runTool({ subtitleText: "not subtitles" }).ok, false);
  });

  it("bad audience value → ok:false", () => {
    const r = runTool({ subtitleText: FAST_SRT, audience: "teens" });
    assert.equal(r.ok, false);
  });

  it("bad script value → ok:false", () => {
    const r = runTool({ subtitleText: FAST_SRT, script: "arabic" });
    assert.equal(r.ok, false);
  });

  it("zero-duration cue → ok:false naming the cue", () => {
    const r = runTool({ subtitleText: "1\n00:00:01,000 --> 00:00:01,000\nHi\n" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Cue 1"));
  });

  it("empty-text cue → ok:false naming the cue", () => {
    const r = runTool({ subtitleText: "1\n00:00:01,000 --> 00:00:03,000\n   \n" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Cue 1"));
  });
});

describe("runTool — CPS math and verdicts", () => {
  it("counts chars with spaces+punctuation: 8 chars / 1s = 8 CPS", () => {
    const values = okValues({ subtitleText: "1\n00:00:01,000 --> 00:00:02,000\nHello!12\n" });
    const perCue = values.perCue as Array<{ cps: number; limit: number; verdict: string }>;
    assert.equal(perCue[0].cps, 8);
    assert.equal(perCue[0].limit, 20);
    assert.equal(perCue[0].verdict, "pass");
  });

  it("over the adult limit → fail verdict and overall fail", () => {
    // 40 chars over 1s = 40 CPS > 20
    const values = okValues({
      subtitleText: "1\n00:00:01,000 --> 00:00:02,000\n" + "a".repeat(40) + "\n",
    });
    const perCue = values.perCue as Array<{ verdict: string }>;
    assert.equal(perCue[0].verdict, "fail (over limit)");
    assert.ok((values.overallVerdict as string).startsWith("Fail"));
    assert.equal((values.worstCues as string[]).length, 1);
    assert.ok((values.worstCues as string[])[0].includes("Cue 1"));
  });

  it("all under limit → overall pass", () => {
    const values = okValues({ subtitleText: FAST_SRT });
    assert.ok((values.overallVerdict as string).startsWith("Pass"));
    assert.deepEqual(values.worstCues, []);
  });

  it("children audience applies the 17 CPS cap", () => {
    // 18 chars over 1s = 18 CPS: pass for adult, fail for children
    const srt = "1\n00:00:01,000 --> 00:00:02,000\n" + "b".repeat(18) + "\n";
    const adult = okValues({ subtitleText: srt, audience: "adult" });
    const kids = okValues({ subtitleText: srt, audience: "children" });
    const a = (adult.perCue as Array<{ verdict: string }>)[0];
    const k = (kids.perCue as Array<{ verdict: string }>)[0];
    assert.equal(a.verdict, "pass");
    assert.equal(k.verdict, "fail (over limit)");
    assert.equal((kids.perCue as Array<{ limit: number }>)[0].limit, 17);
  });

  it("cjk script applies 9 CPS — never the Latin 20", () => {
    // 12 chars over 1s = 12 CPS: fail under CJK 9, would pass under Latin 20
    const srt = "1\n00:00:01,000 --> 00:00:02,000\n" + "汉".repeat(12) + "\n";
    const cjk = okValues({ subtitleText: srt, script: "cjk" });
    const row = (cjk.perCue as Array<{ cps: number; limit: number; verdict: string }>)[0];
    assert.equal(row.limit, 9);
    assert.equal(row.verdict, "fail (over limit)");
  });

  it("exactly at the limit passes with the at-limit note", () => {
    // 20 chars over 1s = exactly 20 CPS
    const values = okValues({
      subtitleText: "1\n00:00:01,000 --> 00:00:02,000\n" + "c".repeat(20) + "\n",
      audience: "adult",
    });
    const row = (values.perCue as Array<{ verdict: string }>)[0];
    assert.equal(row.verdict, "pass (at limit)");
  });

  it("defaults: adult + latin when selects are omitted", () => {
    const values = okValues({ subtitleText: FAST_SRT });
    const row = (values.perCue as Array<{ limit: number }>)[0];
    assert.equal(row.limit, 20);
  });
});

describe("runTool — output contract and edge cases", () => {
  it("output ids match the contract: perCue, overallVerdict, worstCues", () => {
    const values = okValues({ subtitleText: FAST_SRT });
    assert.deepEqual(Object.keys(values).sort(), ["overallVerdict", "perCue", "worstCues"]);
  });

  it("worstCues lists the top 3 failing cues, worst first", () => {
    const srt =
      "1\n00:00:01,000 --> 00:00:02,000\n" + "d".repeat(30) + "\n\n" + // 30 CPS
      "2\n00:00:03,000 --> 00:00:04,000\n" + "e".repeat(50) + "\n\n" + // 50 CPS
      "3\n00:00:05,000 --> 00:00:06,000\n" + "f".repeat(40) + "\n\n" + // 40 CPS
      "4\n00:00:07,000 --> 00:00:08,000\n" + "g".repeat(60) + "\n"; // 60 CPS
    const values = okValues({ subtitleText: srt });
    const worst = values.worstCues as string[];
    assert.equal(worst.length, 3);
    assert.ok(worst[0].includes("Cue 4"));
    assert.ok(worst[1].includes("Cue 2"));
    assert.ok(worst[2].includes("Cue 3"));
  });

  it("cueIndex values are 1-based and in source order", () => {
    const values = okValues({ subtitleText: FAST_SRT });
    const perCue = values.perCue as Array<{ cueIndex: number }>;
    assert.deepEqual(perCue.map((c) => c.cueIndex), [1, 2]);
  });

  it("multi-line cue text is joined (line break counts like a space)", () => {
    // "ab" + space + "cd" = 5 chars over 1s = 5 CPS
    const values = okValues({ subtitleText: "1\n00:00:01,000 --> 00:00:02,000\nab\ncd\n" });
    const row = (values.perCue as Array<{ cps: number }>)[0];
    assert.equal(row.cps, 5);
  });

  it("VTT input with WEBVTT header is accepted", () => {
    const values = okValues({ subtitleText: "WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nHi there!\n" });
    const row = (values.perCue as Array<{ cps: number }>)[0];
    assert.equal(row.cps, 9); // "Hi there!" = 9 chars over 1s
  });

  it("is deterministic", () => {
    const v = { subtitleText: FAST_SRT, audience: "children" };
    assert.deepEqual(runTool(v), runTool(v));
  });

  it("unicode cue text is counted per UTF-16 code unit, still deterministic", () => {
    const values = okValues({ subtitleText: "1\n00:00:01,000 --> 00:00:02,000\nمرحبا\n" });
    const row = (values.perCue as Array<{ cps: number }>)[0];
    assert.equal(row.cps, 5);
  });
});
