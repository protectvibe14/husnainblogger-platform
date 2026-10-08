/**
 * Tests for the E-E-A-T Checklist Generator pure logic (tool-038).
 *
 * Run: node --test app/tools/blogging-seo/e-e-a-t-checklist-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildChecklist,
  renderMarkdown,
  normalizeContentType,
  CONTENT_TYPES,
} from "./logic.ts";

describe("normalizeContentType", () => {
  it("accepts all four known types", () => {
    for (const t of CONTENT_TYPES) {
      assert.deepEqual(normalizeContentType(t), { type: t, fellBack: false });
    }
  });
  it("falls back to article for unknown values", () => {
    assert.deepEqual(normalizeContentType("podcast"), { type: "article", fellBack: true });
    assert.deepEqual(normalizeContentType(""), { type: "article", fellBack: true });
    assert.deepEqual(normalizeContentType(undefined), { type: "article", fellBack: true });
    assert.deepEqual(normalizeContentType(null), { type: "article", fellBack: true });
  });
});

describe("buildChecklist — bank structure", () => {
  it("has 8 base items for every type", () => {
    const baseIds = buildChecklist("article")
      .slice(0, 8)
      .map((i) => i.id);
    for (const t of CONTENT_TYPES) {
      const ids = buildChecklist(t).map((i) => i.id);
      assert.deepEqual(ids.slice(0, 8), baseIds);
    }
  });
  it("adds the documented type-specific counts", () => {
    assert.equal(buildChecklist("article").length, 11);
    assert.equal(buildChecklist("review").length, 12);
    assert.equal(buildChecklist("guide").length, 11);
    assert.equal(buildChecklist("homepage").length, 11);
  });
  it("includes review-specific checks (testing, pros/cons, alternatives)", () => {
    const ids = buildChecklist("review").map((i) => i.id);
    assert.ok(ids.includes("tested-product"));
    assert.ok(ids.includes("balanced-pros-cons"));
    assert.ok(ids.includes("compare-alternatives"));
    assert.ok(ids.includes("verdict-criteria"));
  });
  it("item ids are lowercase kebab and unique within each checklist", () => {
    for (const t of CONTENT_TYPES) {
      const ids = buildChecklist(t).map((i) => i.id);
      assert.equal(new Set(ids).size, ids.length, `duplicate ids for ${t}`);
      for (const id of ids) {
        assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
      }
    }
  });
  it("every item has a non-empty label and detail", () => {
    for (const t of CONTENT_TYPES) {
      for (const item of buildChecklist(t)) {
        assert.ok(item.label.trim().length > 0);
        assert.ok(item.detail.trim().length > 0);
      }
    }
  });
});

describe("renderMarkdown", () => {
  it("renders one checkbox line per item plus the honesty header", () => {
    const items = buildChecklist("guide");
    const md = renderMarkdown("guide", items, false);
    assert.ok(md.includes("# E-E-A-T Checklist"));
    assert.ok(md.includes("not a Google endorsement"));
    const boxes = md.split("\n").filter((l) => l.startsWith("- [ ]"));
    assert.equal(boxes.length, items.length);
  });
  it("notes the fallback when an unknown type fell back to article", () => {
    const items = buildChecklist("article");
    const md = renderMarkdown("article", items, true);
    assert.ok(md.includes("falls back to article"));
  });
});

describe("runTool — happy path", () => {
  it("defaults to the article checklist when contentType is missing", () => {
    const res = runTool({});
    assert.equal(res.ok, true);
    const v = res.values as Record<string, unknown>;
    const table = v["checklist"] as { rows: string[][] };
    assert.equal(table.rows.length, 11);
    assert.ok((v["checklistMarkdown"] as string).includes("Article / blog post"));
  });
  it("builds the review checklist (12 items)", () => {
    const res = runTool({ contentType: "review" });
    assert.equal(res.ok, true);
    const v = res.values as Record<string, unknown>;
    assert.equal((v["checklist"] as { rows: string[][] }).rows.length, 12);
  });
  it("builds the guide checklist", () => {
    const res = runTool({ contentType: "guide" });
    const v = res.values as Record<string, unknown>;
    assert.equal((v["checklist"] as { rows: string[][] }).rows.length, 11);
    assert.ok((v["checklistMarkdown"] as string).includes("How-to guide"));
  });
  it("builds the homepage checklist", () => {
    const res = runTool({ contentType: "homepage" });
    const v = res.values as Record<string, unknown>;
    assert.equal((v["checklist"] as { rows: string[][] }).rows.length, 11);
  });
  it("falls back to article for an unknown contentType instead of erroring", () => {
    const res = runTool({ contentType: "podcast" });
    assert.equal(res.ok, true);
    const v = res.values as Record<string, unknown>;
    assert.equal((v["checklist"] as { rows: string[][] }).rows.length, 11);
    assert.ok((v["checklistMarkdown"] as string).includes("falls back to article"));
  });
  it("works with no values object at all", () => {
    assert.equal(runTool({}).ok, true);
  });
});

describe("runTool — determinism & output shape", () => {
  it("is deterministic: same inputs -> identical outputs", () => {
    assert.deepEqual(runTool({ contentType: "review" }), runTool({ contentType: "review" }));
  });
  it("returns only the declared output ids (checklist, checklistMarkdown)", () => {
    const res = runTool({ contentType: "article" });
    assert.deepEqual(Object.keys(res.values ?? {}).sort(), ["checklist", "checklistMarkdown"]);
  });
  it("column count matches row cell count in the checklist table", () => {
    const res = runTool({ contentType: "review" });
    const v = res.values as Record<string, unknown>;
    const table = v["checklist"] as { columns: string[]; rows: string[][] };
    for (const row of table.rows) {
      assert.equal(row.length, table.columns.length);
    }
  });
});
