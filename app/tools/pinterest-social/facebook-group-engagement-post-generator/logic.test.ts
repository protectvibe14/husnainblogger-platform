import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generatePosts,
  POST_TYPES,
  DRAFTS_PER_TYPE,
  BANK_SIZES,
} from "./logic.ts";

describe("facebook-group-engagement-post-generator", () => {
  it("happy path: groupType only returns 4 archetypes (one per type)", () => {
    const r = runTool({ groupType: "sourdough bakers" });
    assert.equal(r.ok, true);
    const templates = r.values!.templates as string[];
    assert.equal(templates.length, 4);
    assert.equal(r.values!.count, 4);
    for (const t of templates) {
      assert.ok(t.includes("sourdough bakers"), t);
      assert.ok(t.includes("Type:"), t);
      assert.ok(t.includes("Draft:"), t);
      assert.ok(t.includes("Follow-up tip:"), t);
    }
    const types = templates.map((t) => t.match(/^Type: (\w+)/)![1]);
    assert.deepEqual(types.sort(), ["discussion", "poll", "question", "welcome"]);
  });

  it("postType=question returns all 3 question drafts", () => {
    const r = runTool({ groupType: "fitness beginners", postType: "question" });
    assert.equal(r.ok, true);
    const templates = r.values!.templates as string[];
    assert.equal(templates.length, 3);
    for (const t of templates) assert.ok(t.startsWith("Type: question"), t);
  });

  it("each post type returns 3 drafts when selected", () => {
    for (const pt of POST_TYPES) {
      const r = runTool({ groupType: "etsy sellers", postType: pt });
      assert.equal(r.ok, true);
      assert.equal((r.values!.templates as string[]).length, 3, pt);
    }
  });

  it("postType is case-insensitive", () => {
    const r = runTool({ groupType: "etsy sellers", postType: "POLL" });
    assert.equal(r.ok, true);
    assert.equal((r.values!.templates as string[]).length, 3);
    assert.ok((r.values!.templates as string[])[0].startsWith("Type: poll"));
  });

  it("groupType is trimmed before insertion", () => {
    const r = generatePosts("  fitness beginners  ");
    assert.ok(r.templates[0].draft.includes("fitness beginners"));
    assert.ok(!r.templates[0].draft.includes("  fitness"));
  });

  it("no leftover placeholders", () => {
    for (const pt of [...POST_TYPES, undefined]) {
      const r = runTool({ groupType: "book club", postType: pt as string | undefined });
      for (const t of r.values!.templates as string[]) {
        assert.ok(!t.includes("{groupType}"), t);
      }
    }
  });

  it("every draft has a non-empty follow-up tip", () => {
    const r = generatePosts("book club", "welcome");
    for (const t of r.templates) {
      assert.ok(t.followUpTip.length > 20, t.followUpTip);
    }
  });

  it("no engagement-bait wording anywhere in the bank", () => {
    const r = generatePosts("book club");
    const all = r.templates.map((t) => t.draft).join(" ").toLowerCase();
    const bait = ["comment yes", "type yes", "type amen", "like if you agree", "share if you agree", "tag a friend"];
    for (const b of bait) assert.ok(!all.includes(b), `bait found: ${b}`);
  });

  it("missing groupType errors", () => {
    const r = runTool({ postType: "poll" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Group type is required/);
  });

  it("blank groupType errors", () => {
    const r = runTool({ groupType: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Group type is required/);
  });

  it("non-string groupType errors", () => {
    const r = runTool({ groupType: 3 as unknown as string });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Group type is required/);
  });

  it("invalid postType errors with valid options", () => {
    const r = runTool({ groupType: "book club", postType: "meme" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("welcome"));
    assert.ok(r.error!.includes("discussion"));
  });

  it("non-string postType errors", () => {
    const r = runTool({ groupType: "book club", postType: 3 as unknown as string });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Post type must be/);
  });

  it("deterministic: same inputs give identical outputs", () => {
    const a = runTool({ groupType: "book club", postType: "discussion" });
    const b = runTool({ groupType: "book club", postType: "discussion" });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts (templates, count)", () => {
    const r = runTool({ groupType: "book club" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["count", "templates"]);
  });

  it("bank sizes are documented and consistent", () => {
    assert.equal(BANK_SIZES.postTypes, 4);
    assert.equal(BANK_SIZES.draftsPerType, DRAFTS_PER_TYPE);
    assert.equal(BANK_SIZES.total, 12);
    assert.deepEqual([...POST_TYPES], ["welcome", "question", "poll", "discussion"]);
  });

  it("no duplicate drafts within a type", () => {
    for (const pt of POST_TYPES) {
      const r = generatePosts("x", pt);
      const drafts = r.templates.map((t) => t.draft);
      assert.equal(new Set(drafts).size, drafts.length, pt);
    }
  });
});
