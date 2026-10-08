/**
 * Tests for the Pinterest SEO Title Rewriter.
 * Run: node --test app/tools/pinterest-social/pinterest-seo-title-rewriter/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, MAX_REWRITE_LEN, KEYWORD_FRONT_WORDS } from "./logic.ts";

const GOOD = { draftTitle: "how to organize a tiny closet", primaryKeyword: "small closet organization" };

function rewrites(values: Record<string, unknown>): string[] {
  return values["rewrites"] as string[];
}

/** Case-insensitive check: keyword's first word within the first 5 words. */
function keywordFrontOk(rewrite: string, keyword: string): boolean {
  const first = keyword.toLowerCase().split(/\s+/)[0];
  const idx = rewrite.toLowerCase().split(/\s+/).indexOf(first);
  return idx >= 0 && idx < KEYWORD_FRONT_WORDS;
}

function assertAllValid(r: ReturnType<typeof runTool>, keyword: string) {
  assert.equal(r.ok, true);
  const list = rewrites(r.values!);
  assert.ok(list.length >= 4, `expected several rewrites, got ${list.length}`);
  for (const t of list) {
    assert.ok(t.length <= MAX_REWRITE_LEN, `<=100 chars: ${t}`);
    assert.ok(keywordFrontOk(t, keyword), `keyword front-loaded: ${t}`);
    assert.ok(t.toLowerCase().includes(keyword.toLowerCase()), `keyword present: ${t}`);
  }
  assert.equal(new Set(list.map((t) => t.toLowerCase())).size, list.length, "no duplicates");
}

describe("pinterest-seo-title-rewriter", () => {
  it("happy path: returns ok with exactly the meta output ids", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["note", "rewrites"]);
  });

  it("every rewrite is valid: <=100 chars, keyword front-loaded, no dupes", () => {
    assertAllValid(runTool(GOOD), GOOD.primaryKeyword);
  });

  it("works when the draft already contains the keyword", () => {
    const r = runTool({ draftTitle: "Small closet organization hacks that work", primaryKeyword: "small closet organization" });
    assertAllValid(r, "small closet organization");
  });

  it("already-optimized draft gets the 'already optimized' note", () => {
    const r = runTool({ draftTitle: "Small closet organization on a budget", primaryKeyword: "small closet organization" });
    assert.equal(r.ok, true);
    assert.ok((r.values!.note as string).includes("already looks optimized"));
    assert.ok(rewrites(r.values!).length > 0, "still returns variants");
  });

  it("non-optimized draft gets an empty note", () => {
    const r = runTool(GOOD);
    assert.equal(r.values!.note, "");
  });

  it("draft that is only the keyword uses coreless fallbacks", () => {
    const r = runTool({ draftTitle: "fall wreaths", primaryKeyword: "fall wreaths" });
    assertAllValid(r, "fall wreaths");
  });

  it("long drafts drop over-long patterns but still return valid rewrites", () => {
    const r = runTool({
      draftTitle: "the ultimate comprehensive step by step walkthrough guide for planning a rustic backyard wedding on a budget",
      primaryKeyword: "backyard wedding",
    });
    assertAllValid(r, "backyard wedding");
  });

  it("missing draftTitle is an error", () => {
    const r = runTool({ draftTitle: "   ", primaryKeyword: "cats" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("draft pin title"));
  });

  it("missing primaryKeyword is an error", () => {
    const r = runTool({ draftTitle: "cute cat photos", primaryKeyword: "  " });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("primary keyword"));
  });

  it("keyword over 100 chars is an error", () => {
    const r = runTool({ draftTitle: "cats", primaryKeyword: "x".repeat(101) });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("too long"));
  });

  it("draft over 200 chars is an error", () => {
    const r = runTool({ draftTitle: "x".repeat(201), primaryKeyword: "cats" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("too long"));
  });

  it("determinism: same input twice gives identical output", () => {
    assert.deepEqual(runTool(GOOD), runTool(GOOD));
    assert.deepEqual(
      runTool({ draftTitle: "a b c", primaryKeyword: "d e" }),
      runTool({ draftTitle: "a b c", primaryKeyword: "d e" }),
    );
  });

  it("different keywords give different rewrites", () => {
    const a = JSON.stringify(runTool({ ...GOOD, primaryKeyword: "pantry organization" }).values);
    const b = JSON.stringify(runTool({ ...GOOD, primaryKeyword: "closet organization" }).values);
    assert.notEqual(a, b);
  });

  it("bank bounds: many drafts across niches all return valid rewrites", () => {
    const cases: Array<[string, string]> = [
      ["easy weeknight dinners for families", "quick dinner ideas"],
      ["DIY wedding centerpieces under $10", "budget wedding decor"],
      ["beginner watercolor techniques", "watercolor painting"],
      ["5k training plan for beginners", "running plan"],
    ];
    for (const [draftTitle, primaryKeyword] of cases) {
      assertAllValid(runTool({ draftTitle, primaryKeyword }), primaryKeyword);
    }
  });

  it("keyword is never lost even when draft has odd separators", () => {
    const r = runTool({ draftTitle: "cozy reading nook | small spaces", primaryKeyword: "reading nook ideas" });
    assertAllValid(r, "reading nook ideas");
  });
});
