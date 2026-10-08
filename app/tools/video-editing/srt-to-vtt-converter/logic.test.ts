/**
 * Tests for the SRT → WebVTT converter logic module.
 * Run: node --test logic.test.ts   (zero dependencies)
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  convertSrtToVtt,
  MAX_INPUT_CHARS,
  msToVttTimestamp,
  parseSrt,
  parseTimestamp,
  runTool,
} from "./logic.ts";

describe("parseTimestamp", () => {
  it("parses canonical SRT timestamps", () => {
    assert.equal(parseTimestamp("00:00:01,000"), 1000);
    assert.equal(parseTimestamp("01:02:03,456"), 3723456);
  });
  it("accepts dot decimals and 1-digit hours", () => {
    assert.equal(parseTimestamp("0:00:01.500"), 1500);
    assert.equal(parseTimestamp("1:30:45.100"), 5445100);
  });
  it("rejects invalid timestamps", () => {
    assert.equal(parseTimestamp("00:70:01,000"), null); // minutes > 59
    assert.equal(parseTimestamp("00:00:61,000"), null); // seconds > 59
    assert.equal(parseTimestamp("not a time"), null);
    assert.equal(parseTimestamp("00:00:01"), null); // no millis
    assert.equal(parseTimestamp(""), null);
  });
});

describe("msToVttTimestamp", () => {
  it("formats with dot decimals and zero padding", () => {
    assert.equal(msToVttTimestamp(1000), "00:00:01.000");
    assert.equal(msToVttTimestamp(3723456), "01:02:03.456");
    assert.equal(msToVttTimestamp(0), "00:00:00.000");
  });
});

describe("convertSrtToVtt — happy path", () => {
  it("converts a valid SRT document to WebVTT", () => {
    const srt =
      "1\n00:00:01,000 --> 00:00:04,000\nHello world\n\n" +
      "2\n00:00:05,500 --> 00:00:07,000\nSecond cue\nwith two lines\n";
    const r = convertSrtToVtt(srt);
    assert.equal(r.errors.length, 0);
    assert.equal(r.warnings.length, 0);
    assert.equal(r.cueCount, 2);
    assert.equal(
      r.vtt,
      "WEBVTT\n\n" +
        "00:00:01.000 --> 00:00:04.000\nHello world\n\n" +
        "00:00:05.500 --> 00:00:07.000\nSecond cue\nwith two lines\n",
    );
  });
});

describe("convertSrtToVtt — edge cases", () => {
  it("empty input → EMPTY_INPUT error, header-only VTT", () => {
    const r = convertSrtToVtt("   \n  ");
    assert.equal(r.cueCount, 0);
    assert.equal(r.vtt, "WEBVTT\n");
    assert.equal(r.errors.length, 1);
    assert.equal(r.errors[0].code, "EMPTY_INPUT");
  });

  it("CRLF line endings are normalized", () => {
    const r = convertSrtToVtt("1\r\n00:00:01,000 --> 00:00:02,000\r\nHi\r\n");
    assert.equal(r.errors.length, 0);
    assert.equal(r.cueCount, 1);
    assert.ok(r.vtt.includes("00:00:01.000 --> 00:00:02.000"));
  });

  it("dot decimals accepted with warning and converted", () => {
    const r = convertSrtToVtt("1\n00:00:01.000 --> 00:00:02.000\nHi\n");
    assert.equal(r.cueCount, 1);
    assert.ok(r.warnings.some((w) => w.code === "DOT_DECIMAL_SEPARATOR"));
    assert.ok(r.vtt.includes("00:00:01.000 --> 00:00:02.000"));
  });

  it("malformed timestamp → error, block skipped, other cues kept", () => {
    const srt =
      "1\n00:00:01,000 --> 00:00:02,000\nGood\n\n" +
      "2\nnot-a-timestamp --> 00:00:05,000\nBad\n\n" +
      "3\n00:00:06,000 --> 00:00:07,000\nAlso good\n";
    const r = convertSrtToVtt(srt);
    assert.equal(r.cueCount, 2);
    assert.equal(r.errors.length, 1);
    assert.equal(r.errors[0].code, "MALFORMED_TIMESTAMP");
    assert.equal(r.errors[0].block, 2);
  });

  it("end before start → NON_POSITIVE_DURATION error, cue dropped", () => {
    const r = convertSrtToVtt("1\n00:00:05,000 --> 00:00:02,000\nBackwards\n");
    assert.equal(r.cueCount, 0);
    assert.ok(r.errors.some((e) => e.code === "NON_POSITIVE_DURATION"));
  });

  it("overlapping cues → OVERLAPPING_CUES warning, both kept", () => {
    const srt =
      "1\n00:00:01,000 --> 00:00:04,000\nFirst\n\n" +
      "2\n00:00:03,000 --> 00:00:05,000\nSecond\n";
    const r = convertSrtToVtt(srt);
    assert.equal(r.cueCount, 2);
    assert.ok(r.warnings.some((w) => w.code === "OVERLAPPING_CUES"));
  });

  it("non-sequential numbering → NON_SEQUENTIAL_NUMBERING warning", () => {
    const srt =
      "1\n00:00:01,000 --> 00:00:02,000\nA\n\n" +
      "5\n00:00:03,000 --> 00:00:04,000\nB\n";
    const r = convertSrtToVtt(srt);
    assert.equal(r.cueCount, 2);
    assert.ok(r.warnings.some((w) => w.code === "NON_SEQUENTIAL_NUMBERING"));
  });

  it("missing sequence number → assigned from order with warning", () => {
    const r = convertSrtToVtt("00:00:01,000 --> 00:00:02,000\nNo number\n");
    assert.equal(r.cueCount, 1);
    assert.ok(r.warnings.some((w) => w.code === "MISSING_SEQUENCE_NUMBER"));
  });

  it("unicode text is preserved byte-identical", () => {
    const text = "مرحبا 🎬 Привет 你好";
    const r = convertSrtToVtt(`1\n00:00:01,000 --> 00:00:02,000\n${text}\n`);
    assert.equal(r.errors.length, 0);
    assert.ok(r.vtt.includes(text));
  });

  it("garbage block → MALFORMED_BLOCK error and NO_VALID_CUES when nothing parses", () => {
    const r = convertSrtToVtt("this is not a subtitle file at all");
    assert.equal(r.cueCount, 0);
    assert.ok(r.errors.some((e) => e.code === "MALFORMED_BLOCK"));
  });

  it("oversized input → INPUT_TOO_LARGE error", () => {
    const r = convertSrtToVtt("x".repeat(MAX_INPUT_CHARS + 1));
    assert.equal(r.cueCount, 0);
    assert.ok(r.errors.some((e) => e.code === "INPUT_TOO_LARGE"));
  });
});

describe("parseSrt — unit level", () => {
  it("returns cue objects with millisecond timings", () => {
    const { cues, errors } = parseSrt("1\n00:01:00,250 --> 00:01:02,750\nText\n");
    assert.equal(errors.length, 0);
    assert.deepEqual(cues, [
      { sequence: 1, startMs: 60250, endMs: 62750, text: ["Text"] },
    ]);
  });
});

describe("runTool — contract adapter", () => {
  it("missing srtText → ok:false", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok(typeof r.error === "string" && r.error.length > 0);
  });

  it("non-string srtText → ok:false", () => {
    const r = runTool({ srtText: 42 });
    assert.equal(r.ok, false);
    assert.ok(typeof r.error === "string");
  });

  it("blank srtText → ok:false", () => {
    const r = runTool({ srtText: "   \n " });
    assert.equal(r.ok, false);
  });

  it("valid SRT → ok:true with vtt, cueCount, errors, warnings", () => {
    const srt =
      "1\n00:00:01,000 --> 00:00:04,000\nHello world\n\n" +
      "2\n00:00:05,500 --> 00:00:07,000\nSecond cue\n";
    const r = runTool({ srtText: srt });
    assert.equal(r.ok, true);
    assert.ok(r.values);
    assert.equal(r.values.cueCount, 2);
    assert.equal(
      r.values.vtt,
      "WEBVTT\n\n" +
        "00:00:01.000 --> 00:00:04.000\nHello world\n\n" +
        "00:00:05.500 --> 00:00:07.000\nSecond cue\n",
    );
    assert.deepEqual(r.values.errors, []);
    assert.deepEqual(r.values.warnings, []);
  });

  it("converts with issues → arrays present, still ok:true", () => {
    const srt =
      "1\n00:00:01.000 --> 00:00:04.000\nDot decimals\n\n" +
      "2\nbad --> 00:00:06,000\nBad timing\n";
    const r = runTool({ srtText: srt });
    assert.equal(r.ok, true);
    assert.ok(r.values);
    const values = r.values;
    assert.ok(Array.isArray(values.errors));
    assert.ok(Array.isArray(values.warnings));
    assert.ok((values.errors as unknown[]).length > 0);
    assert.ok((values.warnings as unknown[]).length > 0);
    assert.equal(values.cueCount, 1);
  });

  it("is deterministic", () => {
    const srt = "1\n00:00:01,000 --> 00:00:02,000\nHi\n";
    const a = runTool({ srtText: srt });
    const b = runTool({ srtText: srt });
    assert.deepEqual(a, b);
  });

  it("output ids match the contract: vtt, cueCount, errors, warnings", () => {
    const r = runTool({ srtText: "1\n00:00:01,000 --> 00:00:02,000\nHi\n" });
    assert.ok(r.values);
    assert.deepEqual(Object.keys(r.values).sort(), ["cueCount", "errors", "vtt", "warnings"]);
  });
});
