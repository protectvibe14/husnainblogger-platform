/**
 * Tests for the Pre-Publish SEO Checklist pure logic (tool-039).
 *
 * Run: node --test app/tools/blogging-seo/pre-publish-seo-checklist/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildChecks,
  TITLE_MIN,
  TITLE_MAX,
  META_MIN,
  META_MAX,
  MAX_TITLE_CHARS,
  MAX_META_CHARS,
  MAX_KEYWORD_CHARS,
} from "./logic.ts";

describe("buildChecks — automatic checks", () => {
  it("passes title length inside 30-60", () => {
    const checks = buildChecks({ title: "Best blog post seo checklist for beginners", metaDescription: "", targetKeyword: "" });
    const c = checks.find((x) => x.id === "title-length")!;
    assert.equal(c.status, "pass");
    assert.ok(c.finding!.includes("characters"));
  });
  it("fails title length outside the range", () => {
    const short = buildChecks({ title: "Tiny", metaDescription: "", targetKeyword: "" }).find((x) => x.id === "title-length")!;
    assert.equal(short.status, "fail");
    assert.ok(short.finding!.includes(`${TITLE_MIN}-${TITLE_MAX}`));
    const long = buildChecks({ title: "x".repeat(61), metaDescription: "", targetKeyword: "" }).find((x) => x.id === "title-length")!;
    assert.equal(long.status, "fail");
  });
  it("marks title checks manual when no title is given", () => {
    const checks = buildChecks({ title: "", metaDescription: "", targetKeyword: "seo" });
    assert.equal(checks.find((x) => x.id === "title-length")!.status, "manual");
    assert.equal(checks.find((x) => x.id === "title-keyword")!.status, "manual");
  });
  it("evaluates keyword presence case-insensitively", () => {
    const checks = buildChecks({
      title: "The Ultimate SEO Checklist",
      metaDescription: "Learn seo the easy way with this complete guide to on-page basics and more details here.",
      targetKeyword: "SEO",
    });
    assert.equal(checks.find((x) => x.id === "title-keyword")!.status, "pass");
    assert.equal(checks.find((x) => x.id === "meta-keyword")!.status, "pass");
  });
  it("fails when the keyword is missing from title/meta", () => {
    const checks = buildChecks({
      title: "A completely unrelated headline about cats",
      metaDescription: "This meta description is long enough to pass the length check comfortably and mentions nothing.",
      targetKeyword: "seo",
    });
    assert.equal(checks.find((x) => x.id === "title-keyword")!.status, "fail");
    assert.equal(checks.find((x) => x.id === "meta-keyword")!.status, "fail");
  });
  it("passes meta length inside 120-160 and fails outside", () => {
    const good = buildChecks({ title: "", metaDescription: "x".repeat(150), targetKeyword: "" }).find((x) => x.id === "meta-length")!;
    assert.equal(good.status, "pass");
    const bad = buildChecks({ title: "", metaDescription: "x".repeat(200), targetKeyword: "" }).find((x) => x.id === "meta-length")!;
    assert.equal(bad.status, "fail");
  });
  it("accepts the boundary values exactly (30, 60, 120, 160)", () => {
    const checks = buildChecks({
      title: "x".repeat(TITLE_MIN),
      metaDescription: "x".repeat(META_MIN),
      targetKeyword: "",
    });
    assert.equal(checks.find((x) => x.id === "title-length")!.status, "pass");
    assert.equal(checks.find((x) => x.id === "meta-length")!.status, "pass");
    const checks2 = buildChecks({
      title: "x".repeat(TITLE_MAX),
      metaDescription: "x".repeat(META_MAX),
      targetKeyword: "",
    });
    assert.equal(checks2.find((x) => x.id === "title-length")!.status, "pass");
    assert.equal(checks2.find((x) => x.id === "meta-length")!.status, "pass");
  });
});

describe("buildChecks — structure and manual items", () => {
  it("always returns 12 checks (4 automatic + 8 manual)", () => {
    const checks = buildChecks({ title: "", metaDescription: "", targetKeyword: "" });
    assert.equal(checks.length, 12);
    const manual = checks.filter((c) => c.status === "manual");
    assert.equal(manual.length, 12); // nothing to evaluate -> all manual
  });
  it("includes the manual-only checks the tool cannot see", () => {
    const ids = buildChecks({ title: "x".repeat(40), metaDescription: "x".repeat(140), targetKeyword: "y" }).map((c) => c.id);
    for (const id of ["slug-keyword", "h1-keyword", "images-alt", "internal-links", "external-sources", "mobile-preview", "read-aloud", "keyword-in-intro"]) {
      assert.ok(ids.includes(id), `missing ${id}`);
    }
  });
  it("manual items never carry a pass/fail finding", () => {
    const checks = buildChecks({ title: "", metaDescription: "", targetKeyword: "" });
    for (const c of checks.filter((x) => x.status === "manual")) {
      assert.equal(c.finding, undefined);
    }
  });
});

describe("runTool — happy path", () => {
  it("counts passes and fails across the evaluated checks", () => {
    const res = runTool({
      title: "Best blog post SEO checklist for beginners",
      metaDescription: "Learn blog post SEO the easy way: this checklist covers titles, meta descriptions and on-page basics for beginners.",
      targetKeyword: "blog post seo",
    });
    assert.equal(res.ok, true);
    const v = res.values as Record<string, unknown>;
    assert.equal(v["passCount"], 3); // title length, title keyword, meta keyword
    assert.equal(v["failCount"], 1); // meta length 121? -> check below
  });
  it("returns a generic all-manual checklist when everything is empty", () => {
    const res = runTool({ title: "", metaDescription: "", targetKeyword: "" });
    assert.equal(res.ok, true);
    const v = res.values as Record<string, unknown>;
    assert.equal(v["passCount"], 0);
    assert.equal(v["failCount"], 0);
    const table = v["checklist"] as { rows: string[][] };
    assert.equal(table.rows.length, 12);
    assert.ok(table.rows.every((r) => r[2] === "MANUAL"));
  });
  it("works with no values object at all (generic checklist)", () => {
    const res = runTool({});
    assert.equal(res.ok, true);
    assert.equal((res.values as Record<string, unknown>)["passCount"], 0);
  });
});

describe("runTool — validation", () => {
  it("rejects an over-long title", () => {
    const res = runTool({ title: "x".repeat(MAX_TITLE_CHARS + 1) });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes(String(MAX_TITLE_CHARS)));
  });
  it("rejects an over-long meta description", () => {
    const res = runTool({ metaDescription: "x".repeat(MAX_META_CHARS + 1) });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes(String(MAX_META_CHARS)));
  });
  it("rejects an over-long target keyword", () => {
    const res = runTool({ targetKeyword: "x".repeat(MAX_KEYWORD_CHARS + 1) });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes(String(MAX_KEYWORD_CHARS)));
  });
});

describe("runTool — determinism & output shape", () => {
  it("is deterministic: same inputs -> identical outputs", () => {
    const input = { title: "x".repeat(45), metaDescription: "y".repeat(140), targetKeyword: "z" };
    assert.deepEqual(runTool(input), runTool(input));
  });
  it("returns only the declared output ids (checklist, passCount, failCount)", () => {
    const res = runTool({ title: "x".repeat(45) });
    assert.deepEqual(Object.keys(res.values ?? {}).sort(), ["checklist", "failCount", "passCount"]);
  });
  it("column count matches row cell count in the checklist table", () => {
    const res = runTool({ title: "x".repeat(45), metaDescription: "y".repeat(140), targetKeyword: "z" });
    const v = res.values as Record<string, unknown>;
    const table = v["checklist"] as { columns: string[]; rows: string[][] };
    for (const row of table.rows) {
      assert.equal(row.length, table.columns.length);
    }
  });
});
