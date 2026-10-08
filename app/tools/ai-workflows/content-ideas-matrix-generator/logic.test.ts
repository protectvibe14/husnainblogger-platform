import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TITLE_FORMULAS, MAX_TOPICS, MAX_FORMATS, MAX_CELLS, parseList, buildTitle, runTool } from "./logic.ts";

const twoByTwo = {
  topics: "Email list building\nMorning routines",
  formats: "blog post\nshort video",
};

describe("parseList", () => {
  it("splits lines, trims, drops empties", () => {
    assert.deepEqual(parseList("a\n\n  b  \r\nc"), ["a", "b", "c"]);
  });

  it("dedupes case-insensitively, keeping first casing", () => {
    assert.deepEqual(parseList("Blog Post\nblog post\nBLOG POST"), ["Blog Post"]);
  });

  it("returns [] for non-strings", () => {
    assert.deepEqual(parseList(undefined), []);
    assert.deepEqual(parseList(42), []);
  });
});

describe("buildTitle", () => {
  it("substitutes {topic} and {format} into a fixed formula", () => {
    const t = buildTitle("sourdough", "blog post", 0, 0);
    assert.ok(t.includes("sourdough"));
    assert.ok(t.includes("blog post"));
    assert.ok(!t.includes("{topic}") && !t.includes("{format}"));
  });

  it("uses a fixed 8-formula bank and spreads across cells", () => {
    assert.equal(TITLE_FORMULAS.length, 8);
    const firstCells = [
      buildTitle("t", "f", 0, 0),
      buildTitle("t", "f", 0, 1),
      buildTitle("t", "f", 1, 0),
      buildTitle("t", "f", 1, 1),
    ];
    assert.equal(new Set(firstCells).size, 4);
  });
});

describe("runTool — happy path", () => {
  it("builds a 2x2 matrix", () => {
    const res = runTool(twoByTwo);
    assert.equal(res.ok, true);
    const m = res.values!.ideaMatrix as { columns: string[]; rows: string[][] };
    assert.deepEqual(m.columns, ["Topic", "blog post", "short video"]);
    assert.equal(m.rows.length, 2);
    assert.equal(m.rows[0].length, 3);
    assert.equal(m.rows[0][0], "Email list building");
  });

  it("dedupes repeated topics and formats", () => {
    const res = runTool({ topics: "sourdough\nsourdough", formats: "blog post\nBLOG POST" });
    assert.equal(res.ok, true);
    const m = res.values!.ideaMatrix as { columns: string[]; rows: string[][] };
    assert.equal(m.rows.length, 1);
    assert.equal(m.columns.length, 2);
  });

  it("caps are as documented", () => {
    assert.equal(MAX_TOPICS, 20);
    assert.equal(MAX_FORMATS, 10);
    assert.equal(MAX_CELLS, 200);
  });

  it("accepts a max-size matrix (20 topics x 10 formats)", () => {
    const topics = Array.from({ length: 20 }, (_, i) => `topic ${i + 1}`).join("\n");
    const formats = Array.from({ length: 10 }, (_, i) => `format ${i + 1}`).join("\n");
    const res = runTool({ topics, formats });
    assert.equal(res.ok, true);
    const m = res.values!.ideaMatrix as { rows: string[][] };
    assert.equal(m.rows.length, 20);
    assert.equal(m.rows[0].length, 11);
  });
});

describe("runTool — validation errors", () => {
  it("rejects missing topics", () => {
    const res = runTool({ formats: "blog post" });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes("topic"));
  });

  it("rejects blank topics", () => {
    const res = runTool({ topics: "\n  \n", formats: "blog post" });
    assert.equal(res.ok, false);
  });

  it("rejects missing formats", () => {
    const res = runTool({ topics: "sourdough" });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes("format"));
  });

  it("rejects more than 20 topics", () => {
    const topics = Array.from({ length: 21 }, (_, i) => `topic ${i}`).join("\n");
    const res = runTool({ topics, formats: "blog post" });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes("20"));
  });

  it("rejects more than 10 formats", () => {
    const formats = Array.from({ length: 11 }, (_, i) => `format ${i}`).join("\n");
    const res = runTool({ topics: "sourdough", formats });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes("10"));
  });

  it("rejects cell counts above 200 (e.g. 20 topics x 11 formats would, via the format cap)", () => {
    // 20 topics x 10 formats = exactly 200 is allowed; 21 x 10 hits the topic cap first.
    const topics = Array.from({ length: 20 }, (_, i) => `topic ${i}`).join("\n");
    const formats = Array.from({ length: 10 }, (_, i) => `format ${i}`).join("\n");
    const okRes = runTool({ topics, formats });
    assert.equal(okRes.ok, true);
  });
});

describe("runTool — determinism and output contract", () => {
  it("same inputs -> identical outputs (deep equal)", () => {
    assert.deepEqual(runTool(twoByTwo), runTool(twoByTwo));
  });

  it("returns exactly one output key: ideaMatrix (matches meta.ts outputs)", () => {
    const res = runTool(twoByTwo);
    assert.deepEqual(Object.keys(res.values!).sort(), ["ideaMatrix"]);
  });

  it("every cell title is non-empty and mentions its topic", () => {
    const res = runTool(twoByTwo);
    const m = res.values!.ideaMatrix as { rows: string[][] };
    for (const [ri, row] of m.rows.entries()) {
      for (const [ci, cell] of row.slice(1).entries()) {
        assert.ok(cell.length > 0, `empty cell at ${ri},${ci}`);
        assert.ok(cell.toLowerCase().includes(row[0].toLowerCase()));
      }
    }
  });
});
