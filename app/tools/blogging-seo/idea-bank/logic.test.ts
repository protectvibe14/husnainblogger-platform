/**
 * Tests for the Idea Bank pure logic (tool-040).
 *
 * Run: node --test app/tools/blogging-seo/idea-bank/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  parseTags,
  parseBank,
  flagDuplicates,
  filterIdeas,
  csvCell,
  exportCsv,
  MAX_IDEAS,
  MAX_TAGS_PER_IDEA,
  MAX_TITLE_CHARS,
} from "./logic.ts";

function bankJson(ideas: unknown[]): string {
  return JSON.stringify(ideas);
}

const IDEA_A = { title: "Email list building", tags: ["email"], status: "idea", notes: "lead magnet" };
const IDEA_B = { title: "SEO checklist", tags: ["seo", "on-page"], status: "draft", notes: "" };
const TWO = bankJson([IDEA_A, IDEA_B]);

describe("parseTags", () => {
  it("splits, trims and de-duplicates comma-separated tags", () => {
    assert.deepEqual(parseTags("seo, SEO , on-page,seo"), { tags: ["seo", "on-page"], truncated: false });
    assert.deepEqual(parseTags(""), { tags: [], truncated: false });
  });
  it("caps very long tag lists at MAX_TAGS_PER_IDEA and flags it", () => {
    const many = Array.from({ length: MAX_TAGS_PER_IDEA + 10 }, (_, i) => `tag${i}`).join(",");
    const { tags, truncated } = parseTags(many);
    assert.equal(tags.length, MAX_TAGS_PER_IDEA);
    assert.equal(truncated, true);
  });
});

describe("parseBank", () => {
  it("accepts an empty/missing bank as []", () => {
    assert.deepEqual(parseBank(undefined), { ideas: [] });
    assert.deepEqual(parseBank(""), { ideas: [] });
  });
  it("rejects invalid JSON and non-arrays", () => {
    assert.ok(parseBank("nope").error);
    assert.ok(parseBank('{"a":1}').error);
  });
  it("rejects ideas with bad title or status", () => {
    assert.ok(parseBank(bankJson([{ title: "", status: "idea" }])).error);
    assert.ok(parseBank(bankJson([{ title: "x".repeat(MAX_TITLE_CHARS + 1), status: "idea" }])).error);
    assert.ok(parseBank(bankJson([{ title: "ok", status: "bogus" }])).error);
    assert.ok(parseBank(bankJson([{ title: "ok", status: "idea", tags: "nope" }])).error);
  });
  it("rejects a bank over the MAX_IDEAS cap", () => {
    const many = Array.from({ length: MAX_IDEAS + 1 }, (_, i) => ({ title: `t${i}`, status: "idea" }));
    assert.ok(parseBank(bankJson(many)).error!.includes(String(MAX_IDEAS)));
  });
});

describe("flagDuplicates / filterIdeas / csvCell / exportCsv", () => {
  it("flags duplicate titles case-insensitively, allowed but marked", () => {
    const ideas = flagDuplicates([
      { title: "Same", tags: [], status: "idea" as const, notes: "" },
      { title: "same", tags: [], status: "idea" as const, notes: "" },
      { title: "Other", tags: [], status: "idea" as const, notes: "" },
    ]);
    assert.equal(ideas[0].duplicateTitle, true);
    assert.equal(ideas[1].duplicateTitle, true);
    assert.equal(ideas[2].duplicateTitle, undefined);
  });
  it("filters by tag, status and query", () => {
    const ideas = [
      { title: "Email list building", tags: ["email"], status: "idea" as const, notes: "lead magnet" },
      { title: "SEO checklist", tags: ["seo"], status: "draft" as const, notes: "" },
    ];
    assert.equal(filterIdeas(ideas, { tag: "EMAIL", status: "", query: "" }).length, 1);
    assert.equal(filterIdeas(ideas, { tag: "", status: "draft", query: "" }).length, 1);
    assert.equal(filterIdeas(ideas, { tag: "", status: "", query: "magnet" }).length, 1);
    assert.equal(filterIdeas(ideas, { tag: "", status: "", query: "zzz" }).length, 0);
    assert.equal(filterIdeas(ideas, { tag: "", status: "", query: "" }).length, 2);
  });
  it("quotes CSV cells containing commas, quotes or newlines", () => {
    assert.equal(csvCell("a,b"), '"a,b"');
    assert.equal(csvCell('say "hi"'), '"say ""hi"""');
    assert.equal(csvCell("a\nb"), '"a\nb"');
    assert.equal(csvCell("plain"), "plain");
  });
  it("exports a valid CSV with header and one row per idea", () => {
    const csv = exportCsv([
      { title: 'Tricky, "title"', tags: ["a", "b"], status: "idea", notes: "n1" },
    ]);
    const lines = csv.split("\n");
    assert.equal(lines[0], "title,tags,status,notes");
    assert.equal(lines.length, 2);
    assert.ok(lines[1].startsWith('"Tricky, ""title"""'));
    assert.ok(lines[1].includes("a;b"));
  });
});

describe("runTool — add", () => {
  it("adds an idea with defaults and returns it in the bank", () => {
    const res = runTool({ action: "add", title: "New idea", tags: "seo, content" });
    assert.equal(res.ok, true);
    const v = res.values as Record<string, unknown>;
    assert.equal(v["count"], 1);
    const table = v["ideas"] as { rows: string[][] };
    assert.equal(table.rows[0][1], "New idea");
    assert.equal(table.rows[0][2], "seo, content");
    assert.equal(table.rows[0][3], "idea");
    assert.ok((v["exportCsv"] as string).includes("New idea"));
  });
  it("flags duplicate titles instead of rejecting them", () => {
    const res = runTool({ action: "add", existingIdeas: TWO, title: "seo checklist" });
    assert.equal(res.ok, true);
    const v = res.values as Record<string, unknown>;
    assert.equal(v["count"], 3);
    const table = v["ideas"] as { rows: string[][] };
    const flagged = table.rows.filter((r) => r[5].includes("duplicate"));
    assert.equal(flagged.length, 2);
  });
  it("caps over-long tag lists on add and flags it", () => {
    const many = Array.from({ length: MAX_TAGS_PER_IDEA + 5 }, (_, i) => `t${i}`).join(",");
    const res = runTool({ action: "add", title: "tags test", tags: many });
    assert.equal(res.ok, true);
    const table = (res.values as Record<string, unknown>)["ideas"] as { rows: string[][] };
    assert.ok(table.rows[0][5].includes("tags capped"));
  });
  it("rejects add without a title and with a bad status", () => {
    assert.equal(runTool({ action: "add" }).ok, false);
    assert.equal(runTool({ action: "add", title: "x".repeat(MAX_TITLE_CHARS + 1) }).ok, false);
    assert.equal(runTool({ action: "add", title: "ok", status: "bogus" }).ok, false);
  });
});

describe("runTool — list / update / delete / export", () => {
  it("lists with filters applied", () => {
    const res = runTool({ action: "list", existingIdeas: TWO, filterStatus: "draft" });
    assert.equal(res.ok, true);
    assert.equal((res.values as Record<string, unknown>)["count"], 1);
  });
  it("lists everything when no filters are given", () => {
    const res = runTool({ action: "list", existingIdeas: TWO });
    assert.equal((res.values as Record<string, unknown>)["count"], 2);
  });
  it("rejects an invalid filter status", () => {
    assert.equal(runTool({ action: "list", existingIdeas: TWO, filterStatus: "bogus" }).ok, false);
  });
  it("updates an idea by 1-based index, keeping unprovided fields", () => {
    const res = runTool({ action: "update", existingIdeas: TWO, index: 1, status: "published" });
    assert.equal(res.ok, true);
    const table = (res.values as Record<string, unknown>)["ideas"] as { rows: string[][] };
    assert.equal(table.rows[0][3], "published");
    assert.equal(table.rows[0][1], "Email list building"); // title untouched
    assert.equal(table.rows[0][2], "email"); // tags untouched
  });
  it("updates the title when a new one is provided", () => {
    const res = runTool({ action: "update", existingIdeas: TWO, index: 2, title: "Renamed" });
    const table = (res.values as Record<string, unknown>)["ideas"] as { rows: string[][] };
    assert.equal(table.rows[1][1], "Renamed");
  });
  it("deletes an idea by 1-based index", () => {
    const res = runTool({ action: "delete", existingIdeas: TWO, index: 1 });
    assert.equal(res.ok, true);
    const v = res.values as Record<string, unknown>;
    assert.equal(v["count"], 1);
    const table = v["ideas"] as { rows: string[][] };
    assert.equal(table.rows[0][1], "SEO checklist");
  });
  it("rejects out-of-range indexes and empty banks", () => {
    assert.equal(runTool({ action: "update", existingIdeas: TWO, index: 5 }).ok, false);
    assert.equal(runTool({ action: "delete", existingIdeas: TWO, index: 0 }).ok, false);
    assert.equal(runTool({ action: "delete", index: 1 }).ok, false);
  });
  it("exports the full bank as CSV", () => {
    const res = runTool({ action: "export", existingIdeas: TWO });
    assert.equal(res.ok, true);
    const csv = (res.values as Record<string, unknown>)["exportCsv"] as string;
    assert.ok(csv.startsWith("title,tags,status,notes"));
    assert.ok(csv.includes("Email list building"));
    assert.ok(csv.includes("SEO checklist"));
  });
  it("accepts index as a numeric string (form input)", () => {
    const res = runTool({ action: "delete", existingIdeas: TWO, index: "2" });
    assert.equal(res.ok, true);
    assert.equal((res.values as Record<string, unknown>)["count"], 1);
  });
});

describe("runTool — validation & determinism", () => {
  it("rejects unknown actions", () => {
    const res = runTool({ action: "publish" });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes("add, list, update, delete, export"));
  });
  it("rejects malformed existingIdeas JSON", () => {
    assert.equal(runTool({ action: "list", existingIdeas: "nope" }).ok, false);
  });
  it("is deterministic: same inputs -> identical outputs", () => {
    const input = { action: "add", existingIdeas: TWO, title: "Determinism check", tags: "a,b" };
    assert.deepEqual(runTool(input), runTool(input));
  });
  it("returns only the declared output ids (ideas, count, exportCsv)", () => {
    const res = runTool({ action: "list", existingIdeas: TWO });
    assert.deepEqual(Object.keys(res.values ?? {}).sort(), ["count", "exportCsv", "ideas"]);
  });
  it("column count matches row cell count in the ideas table", () => {
    const res = runTool({ action: "list", existingIdeas: TWO });
    const table = (res.values as Record<string, unknown>)["ideas"] as { columns: string[]; rows: string[][] };
    for (const row of table.rows) {
      assert.equal(row.length, table.columns.length);
    }
  });
});
