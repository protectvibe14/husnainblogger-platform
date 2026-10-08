/**
 * Tests for the Karaoke Timing Grid Planner (tool-259).
 * Run: node --test logic.test.ts   (zero dependencies)
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

type Values = Record<string, unknown>;
interface GridRow {
  lineIndex: number;
  text: string;
  startMs: number;
  endMs: number;
  wordsPerSec: number;
  snappedToBeat: boolean;
}
interface WordTiming {
  lineIndex: number;
  wordIndex: number;
  word: string;
  startMs: number;
  endMs: number;
  estimated: boolean;
}

const LYRICS = "Hello world\nThis is line two\nShort";

function okValues(v: Values) {
  const r = runTool(v);
  assert.equal(r.ok, true, JSON.stringify(r.error));
  assert.ok(r.values);
  return r.values;
}

function gridOf(v: Values): GridRow[] {
  return okValues(v).grid as GridRow[];
}

function wordsOf(v: Values): WordTiming[] {
  return okValues(v).suggestedWordTimings as WordTiming[];
}

describe("runTool — validation", () => {
  it("missing lyricLines → ok:false", () => {
    const r = runTool({ totalDurationSec: 10 });
    assert.equal(r.ok, false);
    assert.ok(typeof r.error === "string");
  });

  it("blank lyricLines → ok:false", () => {
    assert.equal(runTool({ lyricLines: "  \n ", totalDurationSec: 10 }).ok, false);
  });

  it("missing duration → ok:false", () => {
    assert.equal(runTool({ lyricLines: LYRICS }).ok, false);
  });

  it("zero/negative duration → ok:false", () => {
    assert.equal(runTool({ lyricLines: LYRICS, totalDurationSec: 0 }).ok, false);
    assert.equal(runTool({ lyricLines: LYRICS, totalDurationSec: -5 }).ok, false);
  });

  it("non-numeric duration → ok:false", () => {
    assert.equal(runTool({ lyricLines: LYRICS, totalDurationSec: "abc" }).ok, false);
  });

  it("bpm below 30 → ok:false", () => {
    assert.equal(runTool({ lyricLines: LYRICS, totalDurationSec: 10, beatsPerMinute: 20 }).ok, false);
  });

  it("bpm above 240 → ok:false", () => {
    assert.equal(runTool({ lyricLines: LYRICS, totalDurationSec: 10, beatsPerMinute: 300 }).ok, false);
  });

  it("non-integer bpm → ok:false", () => {
    assert.equal(runTool({ lyricLines: LYRICS, totalDurationSec: 10, beatsPerMinute: 120.5 }).ok, false);
  });

  it("too many lines for the duration → ok:false with guidance", () => {
    // 10 lines * 833ms = 8330ms > 5000ms
    const lyrics = Array.from({ length: 10 }, (_, i) => `line ${i + 1}`).join("\n");
    const r = runTool({ lyricLines: lyrics, totalDurationSec: 5 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("fewer lines") || r.error!.includes("longer duration"));
  });
});

describe("runTool — grid allocation", () => {
  it("first line starts at 0 and the last ends exactly at totalMs", () => {
    const grid = gridOf({ lyricLines: LYRICS, totalDurationSec: 12 });
    assert.equal(grid[0].startMs, 0);
    assert.equal(grid[grid.length - 1].endMs, 12000);
  });

  it("contiguous boundaries with no gaps or overlaps", () => {
    const grid = gridOf({ lyricLines: LYRICS, totalDurationSec: 12 });
    for (let i = 1; i < grid.length; i++) {
      assert.equal(grid[i].startMs, grid[i - 1].endMs);
    }
  });

  it("every line gets at least 833ms", () => {
    const grid = gridOf({ lyricLines: LYRICS, totalDurationSec: 12 });
    for (const row of grid) {
      assert.ok(row.endMs - row.startMs >= 833, JSON.stringify(row));
    }
  });

  it("exactly fitting lines (3 lines, 2.499s) is allowed", () => {
    const grid = gridOf({ lyricLines: "a\nb\nc", totalDurationSec: 2.499 });
    assert.equal(grid.length, 3);
    assert.equal(grid[grid.length - 1].endMs, 2499);
  });

  it("uneven line lengths distribute by character weight, not equal split", () => {
    // "aaaaaaaaaa" (10 chars) vs "b" (1 char): the long line must get more time
    const grid = gridOf({ lyricLines: "aaaaaaaaaa\nb", totalDurationSec: 10 });
    const longDur = grid[0].endMs - grid[0].startMs;
    const shortDur = grid[1].endMs - grid[1].startMs;
    assert.ok(longDur > shortDur);
    // Long line: 833 + (10000-1666)*10/11 ≈ 8409ms
    assert.ok(longDur > 8000);
  });

  it("equal-length lines split evenly", () => {
    const grid = gridOf({ lyricLines: "abcd\nefgh", totalDurationSec: 10 });
    const d0 = grid[0].endMs - grid[0].startMs;
    const d1 = grid[1].endMs - grid[1].startMs;
    assert.ok(Math.abs(d0 - d1) <= 1);
  });

  it("wordsPerSec is computed per line", () => {
    // "Hello world" = 2 words; 12s across 3 lines weighted — just check sanity
    const grid = gridOf({ lyricLines: "Hello world", totalDurationSec: 4 });
    assert.equal(grid.length, 1);
    assert.equal(grid[0].wordsPerSec, 0.5); // 2 words / 4s
  });
});

describe("runTool — BPM snapping", () => {
  it("boundaries snap to beats at 120 BPM (500ms grid)", () => {
    // 2 lines, 3.7s total: natural boundary lands near 1850ms -> snaps to 2000ms
    const grid = gridOf({ lyricLines: "aaaaaaaaaaaaaaaaaaaa\nb", totalDurationSec: 3.7, beatsPerMinute: 120 });
    const boundary = grid[1].startMs;
    assert.equal(boundary % 500, 0);
    assert.ok(grid[1].snappedToBeat);
  });

  it("no bpm → no snapping, boundaries stay natural", () => {
    const grid = gridOf({ lyricLines: LYRICS, totalDurationSec: 12 });
    assert.ok(grid.every((r) => r.snappedToBeat === false));
  });

  it("blank bpm string is treated as not given", () => {
    const grid = gridOf({ lyricLines: LYRICS, totalDurationSec: 12, beatsPerMinute: "" });
    assert.equal(grid.length, 3);
  });
});

describe("runTool — word timings", () => {
  it("word timings cover each line exactly with no gaps", () => {
    const v = { lyricLines: LYRICS, totalDurationSec: 12 };
    const grid = gridOf(v);
    const words = wordsOf(v);
    for (const row of grid) {
      const lineWords = words.filter((w) => w.lineIndex === row.lineIndex);
      assert.equal(lineWords[0].startMs, row.startMs);
      assert.equal(lineWords[lineWords.length - 1].endMs, row.endMs);
      for (let i = 1; i < lineWords.length; i++) {
        assert.equal(lineWords[i].startMs, lineWords[i - 1].endMs);
      }
    }
  });

  it("longer words get proportionally more time", () => {
    const words = wordsOf({ lyricLines: "a bb", totalDurationSec: 4 });
    const w0 = words[0];
    const w1 = words[1];
    assert.ok(w1.endMs - w1.startMs > w0.endMs - w0.startMs);
  });

  it("every word timing is flagged as an estimate", () => {
    const words = wordsOf({ lyricLines: LYRICS, totalDurationSec: 12 });
    assert.ok(words.length > 0);
    assert.ok(words.every((w) => w.estimated === true));
  });

  it("wordIndex is 1-based within each line", () => {
    const words = wordsOf({ lyricLines: "Hello world", totalDurationSec: 4 });
    assert.deepEqual(words.map((w) => [w.word, w.wordIndex]), [
      ["Hello", 1],
      ["world", 2],
    ]);
  });

  it("output ids match the contract: grid, suggestedWordTimings", () => {
    const values = okValues({ lyricLines: LYRICS, totalDurationSec: 12 });
    assert.deepEqual(Object.keys(values).sort(), ["grid", "suggestedWordTimings"]);
  });

  it("is deterministic", () => {
    const v = { lyricLines: LYRICS, totalDurationSec: 12, beatsPerMinute: 128 };
    assert.deepEqual(runTool(v), runTool(v));
  });

  it("CRLF lyrics are handled", () => {
    const grid = gridOf({ lyricLines: "One\r\nTwo words\r\n", totalDurationSec: 6 });
    assert.equal(grid.length, 2);
  });
});
