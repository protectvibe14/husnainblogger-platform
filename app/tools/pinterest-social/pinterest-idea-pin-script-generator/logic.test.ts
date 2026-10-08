/**
 * Tests for the Pinterest Idea Pin Script Generator.
 * Run: node --test app/tools/pinterest-social/pinterest-idea-pin-script-generator/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  MAX_PAGES,
  DEFAULT_PAGES,
  MAX_ONSCREEN_CHARS,
  MAX_CAPTION_CHARS,
} from "./logic.ts";

const GOOD = { topic: "small balcony garden", pageCount: 5 };

function tableOf(values: Record<string, unknown>) {
  return values["scriptPages"] as { columns: string[]; rows: string[][] };
}

describe("pinterest-idea-pin-script-generator", () => {
  it("happy path: returns ok with exactly the meta output ids", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["scriptPages", "warning"]);
  });

  it("table has the four documented columns and the right row count", () => {
    const t = tableOf(runTool(GOOD).values!);
    assert.deepEqual(t.columns, ["Page", "Visual direction", "On-screen text", "Caption line"]);
    assert.equal(t.rows.length, 5);
    t.rows.forEach((row, i) => {
      assert.equal(row[0], String(i + 1), "page numbers are 1-based");
      assert.equal(row.length, 4);
    });
  });

  it("page 1 is a hook and the last page is a CTA", () => {
    const t = tableOf(runTool(GOOD).values!).rows;
    assert.ok(t[0][2].length > 5, "hook on-screen text is non-empty");
    assert.ok(/save|follow|comment|share|try|start/i.test(t[t.length - 1][2]), "last page is a CTA");
  });

  it("every page cell is non-empty and topic has no raw placeholders", () => {
    const t = tableOf(runTool({ topic: "meal prep bowls", pageCount: 7 }).values!).rows;
    for (const row of t) {
      for (const cell of row) {
        assert.ok(cell.length > 0, "no empty cells");
        assert.ok(!cell.includes("{topic}"), "no raw {topic} placeholder");
        assert.ok(!cell.includes("{n}"), "no raw {n} placeholder");
      }
      assert.ok(row[2].length <= MAX_ONSCREEN_CHARS, "on-screen text fits 9:16");
      assert.ok(row[3].length <= MAX_CAPTION_CHARS, "caption fits cap");
    }
  });

  it("middle pages are numbered steps", () => {
    const t = tableOf(runTool({ topic: "sourdough bread", pageCount: 5 }).values!).rows;
    assert.ok(t[1][2].includes("Step 1"), "page 2 is step 1");
    assert.ok(t[2][2].includes("Step 2"), "page 3 is step 2");
  });

  it("single page returns just the hook page", () => {
    const t = tableOf(runTool({ topic: "origami", pageCount: 1 }).values!).rows;
    assert.equal(t.length, 1);
    assert.equal(t[0][0], "1");
  });

  it("omitted pageCount defaults to 5", () => {
    const r = runTool({ topic: "candle making" });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r.values!).rows.length, DEFAULT_PAGES);
  });

  it("pageCount > 20 clamps to 20 with a warning", () => {
    const r = runTool({ topic: "crochet", pageCount: 30 });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r.values!).rows.length, MAX_PAGES);
    assert.ok((r.values!.warning as string).includes("clamped to 20"));
  });

  it("pageCount of exactly 20 is not clamped", () => {
    const r = runTool({ topic: "crochet", pageCount: 20 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.warning, "");
    assert.equal(tableOf(r.values!).rows.length, 20);
  });

  it("topic hinting at an outbound link adds the no-link warning", () => {
    const r = runTool({ topic: "shop my handmade soaps - link in bio", pageCount: 3 });
    assert.equal(r.ok, true);
    assert.ok((r.values!.warning as string).includes("no outbound link"));
  });

  it("plain topic produces no warning", () => {
    const r = runTool({ topic: "watercolor florals", pageCount: 4 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.warning, "");
  });

  it("missing topic is an error", () => {
    const r = runTool({ topic: "   ", pageCount: 5 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).length > 0);
  });

  it("topic over the length limit is an error", () => {
    const r = runTool({ topic: "x".repeat(121) });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("too long"));
  });

  it("pageCount of 0 is an error", () => {
    const r = runTool({ topic: "knitting", pageCount: 0 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("at least 1"));
  });

  it("non-integer pageCount is an error", () => {
    const r = runTool({ topic: "knitting", pageCount: 2.5 });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("whole number"));
  });

  it("determinism: same input twice gives identical output", () => {
    assert.deepEqual(runTool(GOOD), runTool(GOOD));
    assert.deepEqual(
      runTool({ topic: "tiny homes", pageCount: 12 }),
      runTool({ topic: "tiny homes", pageCount: 12 }),
    );
  });

  it("different topics can produce different scripts", () => {
    const a = JSON.stringify(runTool({ topic: "gardening", pageCount: 5 }).values);
    const b = JSON.stringify(runTool({ topic: "woodworking", pageCount: 5 }).values);
    assert.notEqual(a, b);
  });

  it("bank bounds: no empty picks across many topics", () => {
    const topics = ["a", "b", "c", "pottery", "budget travel", "wedding decor", "keto snacks"];
    for (const topic of topics) {
      const r = runTool({ topic, pageCount: 9 });
      assert.equal(r.ok, true, topic);
      const rows = tableOf(r.values!).rows;
      assert.equal(rows.length, 9, topic);
      for (const row of rows) {
        assert.ok(row[1].length > 10 && row[2].length > 5 && row[3].length > 10, topic);
      }
    }
  });
});
