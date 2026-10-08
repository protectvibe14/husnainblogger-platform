import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, TOOL_DB, KEYWORD_MAP } from "./logic.ts";

function tableOf(result: { values?: Record<string, unknown> }): {
  columns: string[];
  rows: string[][];
} {
  assert.ok(result.values, "expected values");
  return result.values["toolTable"] as { columns: string[]; rows: string[][] };
}

const BASE = { monthlyBudget: 50, useCases: "blog writing, thumbnails, scheduling" };

describe("ai-tool-stack-planner: happy path", () => {
  it("returns ok with toolTable and budgetSummary", () => {
    const r = runTool(BASE);
    assert.equal(r.ok, true);
    const t = tableOf(r);
    assert.deepEqual(t.columns, [
      "Category",
      "Recommended tool",
      "Monthly cost (default USD)",
      "Free plan?",
      "Budget status",
    ]);
    assert.equal(typeof r.values!["budgetSummary"], "string");
  });

  it("matches use cases to categories via keywords", () => {
    const r = runTool(BASE);
    const t = tableOf(r);
    assert.deepEqual(
      t.rows.map((row) => row[0]),
      ["Writing", "Images", "Scheduling"]
    );
  });

  it("picks the cheapest affordable tool per category", () => {
    const r = runTool(BASE);
    const t = tableOf(r);
    const writing = t.rows.find((row) => row[0] === "Writing");
    assert.ok(writing);
    assert.equal(writing[1], "ChatGPT Plus");
    assert.equal(writing[2], "$20");
    assert.equal(writing[3], "Yes");
    assert.equal(writing[4], "Within budget");
  });

  it("flags picks over budget and totals the defaults", () => {
    const r = runTool({ monthlyBudget: 10, useCases: "writing" });
    assert.equal(r.ok, true);
    const t = tableOf(r);
    assert.equal(t.rows[0][4], "Over budget - default price exceeds your budget");
    const s = r.values!["budgetSummary"] as string;
    assert.ok(s.includes("exceed your budget"));
    assert.ok(s.includes("$20"));
  });

  it("summary states the total and budget", () => {
    const r = runTool(BASE);
    const s = r.values!["budgetSummary"] as string;
    // ChatGPT Plus $20 + Midjourney $10 + Buffer Essentials $6 = $36
    assert.ok(s.includes("$36"));
    assert.ok(s.includes("$50 budget"));
    assert.ok(s.includes("All picks fit within your budget."));
  });

  it("notes unmatched use cases in the summary", () => {
    const r = runTool({ monthlyBudget: 50, useCases: "writing, knitting patterns" });
    assert.equal(r.ok, true);
    const s = r.values!["budgetSummary"] as string;
    assert.ok(s.includes("knitting patterns"));
  });

  it("disclaims that prices are defaults, not live data", () => {
    const r = runTool(BASE);
    const s = r.values!["budgetSummary"] as string;
    assert.ok(s.includes("not live vendor pricing"));
  });

  it("accepts monthlyBudget as a string", () => {
    const r = runTool({ monthlyBudget: "30", useCases: "video" });
    assert.equal(r.ok, true);
    const t = tableOf(r);
    // CapCut is $0, within a $30 budget
    assert.equal(t.rows[0][1], "CapCut");
    assert.equal(t.rows[0][4], "Within budget");
  });

  it("accepts useCases as an array", () => {
    const r = runTool({ monthlyBudget: 100, useCases: ["podcast", "seo"] });
    assert.equal(r.ok, true);
    assert.deepEqual(
      tableOf(r).rows.map((row) => row[0]),
      ["Voice & audio", "SEO & research"]
    );
  });

  it("dedupes categories matched by several use cases", () => {
    const r = runTool({ monthlyBudget: 100, useCases: "writing, blog posts, copy" });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).rows.length, 1);
  });
});

describe("ai-tool-stack-planner: validation errors", () => {
  it("rejects a missing monthlyBudget", () => {
    const r = runTool({ useCases: "writing" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("monthly budget"));
  });

  it("rejects a negative budget", () => {
    const r = runTool({ monthlyBudget: -5, useCases: "writing" });
    assert.equal(r.ok, false);
  });

  it("rejects a non-numeric budget", () => {
    const r = runTool({ monthlyBudget: "unlimited", useCases: "writing" });
    assert.equal(r.ok, false);
  });

  it("rejects a missing useCases", () => {
    const r = runTool({ monthlyBudget: 50 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("use cases"));
  });

  it("rejects empty useCases", () => {
    const r = runTool({ monthlyBudget: 50, useCases: "  " });
    assert.equal(r.ok, false);
  });

  it("rejects more than 10 use cases", () => {
    const r = runTool({
      monthlyBudget: 50,
      useCases: "a,b,c,d,e,f,g,h,i,j,k",
    });
    assert.equal(r.ok, false);
  });

  it("drops a use case longer than 60 chars and keeps the rest", () => {
    const r = runTool({ monthlyBudget: 50, useCases: `writing, ${"x".repeat(61)}` });
    // the over-long token is dropped; "writing" still matches
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).rows.length, 1);
  });

  it("errors when nothing matches any category", () => {
    const r = runTool({ monthlyBudget: 50, useCases: "knitting, pottery" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("writing"));
  });

  it("rejects a mixed array with a non-string element", () => {
    const r = runTool({ monthlyBudget: 50, useCases: ["writing", 5] });
    assert.equal(r.ok, false);
  });
});

describe("ai-tool-stack-planner: edge cases", () => {
  it("handles a zero budget: free picks within, others flagged", () => {
    const r = runTool({ monthlyBudget: 0, useCases: "video, writing" });
    assert.equal(r.ok, true);
    const t = tableOf(r);
    const video = t.rows.find((row) => row[0] === "Video");
    assert.ok(video);
    assert.equal(video[1], "CapCut");
    assert.equal(video[4], "Within budget");
    const writing = t.rows.find((row) => row[0] === "Writing");
    assert.ok(writing);
    assert.equal(writing[4], "Over budget - default price exceeds your budget");
  });

  it("matches keywords case-insensitively", () => {
    const r = runTool({ monthlyBudget: 50, useCases: "SEO Keyword Research" });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).rows[0][0], "SEO & research");
  });

  it("handles exactly 10 use cases", () => {
    const r = runTool({
      monthlyBudget: 500,
      useCases: "writing, images, video, voice, seo, scheduling, blog, thumbnails, podcast, social",
    });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).rows.length, 6);
  });

  it("never recommends a tool outside the fixed database", () => {
    const r = runTool({ monthlyBudget: 1000, useCases: "writing, images, video, voice, seo, scheduling" });
    const names = new Set(TOOL_DB.map((t) => t.name));
    for (const row of tableOf(r).rows) {
      assert.ok(names.has(row[1]), `${row[1]} is not in TOOL_DB`);
    }
  });

  it("database has exactly 12 tools across 6 categories", () => {
    assert.equal(TOOL_DB.length, 12);
    const cats = new Set(TOOL_DB.map((t) => t.category));
    assert.equal(cats.size, 6);
  });

  it("every keyword-map category exists in the database", () => {
    const cats = new Set(TOOL_DB.map((t) => t.category));
    for (const kc of KEYWORD_MAP) {
      assert.ok(cats.has(kc.category), `${kc.category} missing from TOOL_DB`);
    }
  });

  it("is deterministic: same inputs give identical output", () => {
    const a = runTool(BASE);
    const b = runTool(BASE);
    assert.deepEqual(a, b);
  });

  it("returns only the declared output ids", () => {
    const r = runTool(BASE);
    assert.deepEqual(Object.keys(r.values!).sort(), ["budgetSummary", "toolTable"]);
  });

  it("rounds budget arithmetic to cents", () => {
    const r = runTool({ monthlyBudget: 50.5, useCases: "writing" });
    assert.equal(r.ok, true);
    const s = r.values!["budgetSummary"] as string;
    assert.ok(s.includes("$50.50 budget") || s.includes("$50.5 budget"));
  });
});
