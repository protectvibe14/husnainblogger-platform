import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  POST_TYPES,
  BANK_SIZES,
  TOTAL_TEMPLATES,
  TEMPLATES_PER_TYPE,
  MIN_COUNT,
  MAX_COUNT,
  DEFAULT_COUNT,
  SOFT_CHAR_GUIDANCE,
  type PostTypeId,
} from "./logic.ts";
import { outputs } from "./meta.ts";

describe("community-post-idea-bank", () => {
  it("happy path: generates default count ideas for a niche + type", () => {
    const r = runTool({ niche: "sourdough baking", postType: "poll" });
    assert.equal(r.ok, true);
    const ideas = r.values!["ideas"] as string[];
    assert.equal(ideas.length, DEFAULT_COUNT);
    for (const idea of ideas) {
      assert.ok(idea.includes("sourdough baking"), "niche substituted");
      assert.ok(!idea.includes("{niche}"), "no raw placeholder left");
    }
  });

  it("all four post types produce ideas", () => {
    for (const t of POST_TYPES) {
      const r = runTool({ niche: "fitness", postType: t, count: 3 });
      assert.equal(r.ok, true, `type ${t}`);
      assert.equal((r.values!["ideas"] as string[]).length, 3);
    }
  });

  it("count respected (1 and 8)", () => {
    assert.equal((runTool({ niche: "x", postType: "text", count: 1 }).values!["ideas"] as string[]).length, 1);
    assert.equal((runTool({ niche: "x", postType: "quiz", count: 8 }).values!["ideas"] as string[]).length, 8);
  });

  it("niche is trimmed", () => {
    const r = runTool({ niche: "  meal prep  ", postType: "image", count: 2 });
    assert.equal(r.ok, true);
    assert.ok((r.values!["ideas"] as string[])[0].includes("meal prep"));
  });

  it("post type is case-insensitive", () => {
    const r = runTool({ niche: "x", postType: "POLL", count: 1 });
    assert.equal(r.ok, true);
  });

  it("missing niche -> error", () => {
    const r = runTool({ postType: "poll" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("niche"));
  });

  it("blank niche -> error", () => {
    const r = runTool({ niche: "   ", postType: "poll" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("niche over 80 chars -> error", () => {
    const r = runTool({ niche: "x".repeat(81), postType: "poll" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("80"));
  });

  it("missing post type -> error", () => {
    const r = runTool({ niche: "fitness" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("post type"));
  });

  it("invalid post type -> error listing valid types", () => {
    const r = runTool({ niche: "fitness", postType: "video" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("poll"));
  });

  it("count 0 -> error", () => {
    const r = runTool({ niche: "x", postType: "poll", count: 0 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes(String(MIN_COUNT)));
  });

  it("count 9 -> error", () => {
    const r = runTool({ niche: "x", postType: "poll", count: 9 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes(String(MAX_COUNT)));
  });

  it("fractional count -> error", () => {
    const r = runTool({ niche: "x", postType: "poll", count: 2.5 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("whole number"));
  });

  it("note discloses fixed bank + no publishing + soft guidance", () => {
    const r = runTool({ niche: "x", postType: "text", count: 1 });
    const note = r.values!["note"] as string;
    assert.ok(note.includes("40 templates"));
    assert.ok(note.toLowerCase().includes("cannot publish"));
    assert.ok(note.includes(SOFT_CHAR_GUIDANCE));
  });

  it("idea lines carry type, template number and char count", () => {
    const r = runTool({ niche: "yoga", postType: "quiz", count: 2 });
    const ideas = r.values!["ideas"] as string[];
    for (const idea of ideas) {
      const m = idea.match(/^\[quiz #(\d+) · (\d+) chars\] /);
      assert.ok(m, `format: ${idea}`);
      const templateNo = Number(m![1]);
      assert.ok(templateNo >= 1 && templateNo <= TEMPLATES_PER_TYPE);
      const body = idea.slice(m![0].length);
      assert.equal(Number(m![2]), body.length, "char count matches body length");
    }
  });

  it("determinism: same inputs twice -> identical output", () => {
    const v = { niche: "gaming", postType: "image", count: 6 };
    assert.deepEqual(runTool(v), runTool(v));
  });

  it("bank sizes documented: 10 templates per type, 40 total", () => {
    assert.equal(TOTAL_TEMPLATES, 40);
    for (const t of POST_TYPES) {
      assert.equal(BANK_SIZES[t as PostTypeId], 10);
    }
  });

  it("no idea exceeds the soft character guidance range", () => {
    // all template bodies are far below the ~1000-char soft estimate
    for (const t of POST_TYPES) {
      const r = runTool({ niche: "a".repeat(80), postType: t, count: 8 });
      for (const idea of r.values!["ideas"] as string[]) {
        const m = idea.match(/(\d+) chars\]/);
        assert.ok(Number(m![1]) < 1000, `idea too long: ${idea}`);
      }
    }
  });

  it("poll ideas include options", () => {
    const r = runTool({ niche: "chess", postType: "poll", count: 8 });
    for (const idea of r.values!["ideas"] as string[]) {
      assert.ok(idea.includes("Options:"), `missing options: ${idea}`);
    }
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ niche: "x", postType: "poll" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), outputs.map((o) => o.id).sort());
  });
});
