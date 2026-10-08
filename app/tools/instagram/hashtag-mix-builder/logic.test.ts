import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildMix,
  NICHE_IDS,
  MAX_HASHTAGS,
} from "./logic.ts";

const META_OUTPUTS = ["mix", "readyToCopy", "copyNote"];

describe("hashtag-mix-builder (tool-202)", () => {
  it("builds a 5-tag mix for a valid row (feed/reach)", () => {
    const r = runTool({ items: [{ niche: "fitness", postType: "feed", goal: "reach" }] });
    assert.equal(r.ok, true);
    const mix = r.values?.mix as string[];
    assert.equal(mix.length, 1);
    const lines = mix[0].split("\n");
    assert.equal(lines.length, MAX_HASHTAGS);
    assert.ok(lines[0].includes("#"));
    // readyToCopy is a single #tag block when one row
    assert.match(r.values?.readyToCopy as string, /^#[a-z0-9 ]/);
    assert.equal((r.values?.readyToCopy as string).trim().split(/\s+/).length, 5);
  });

  it("never exceeds the 5-hashtag platform limit", () => {
    for (const niche of NICHE_IDS) {
      const r = runTool({ items: [{ niche, postType: "reel", goal: "community" }] });
      assert.equal(r.ok, true);
      const count = (r.values?.readyToCopy as string).trim().split(/\s+/).length;
      assert.ok(count <= MAX_HASHTAGS, `${niche} exceeded the cap`);
    }
  });

  it("community goal uses niche/community tiers, reach uses broad tiers", () => {
    const reach = buildMix({ niche: "food", postType: "feed", goal: "reach" }, 0);
    assert.deepEqual(reach.slots.map((s) => s.tier), ["broad", "broad", "medium", "medium", "niche"]);
    const community = buildMix({ niche: "food", postType: "feed", goal: "community" }, 0);
    assert.deepEqual(community.slots.map((s) => s.tier), ["niche", "niche", "community", "community", "medium"]);
  });

  it("branded goal uses its own tier template", () => {
    const b = buildMix({ niche: "travel", postType: "story", goal: "branded" }, 0);
    assert.deepEqual(b.slots.map((s) => s.tier), ["community", "niche", "medium", "medium", "broad"]);
  });

  it("postType changes the deterministic tag selection (offset)", () => {
    const feed = buildMix({ niche: "pets", postType: "feed", goal: "reach" }, 0);
    const reel = buildMix({ niche: "pets", postType: "reel", goal: "reach" }, 0);
    assert.notDeepEqual(
      feed.slots.map((s) => s.tag),
      reel.slots.map((s) => s.tag),
    );
    // but both are deterministic
    assert.deepEqual(buildMix({ niche: "pets", postType: "reel", goal: "reach" }, 0), reel);
  });

  it("is deterministic: same inputs -> identical outputs", () => {
    const a = runTool({ items: [{ niche: "beauty", postType: "carousel", goal: "branded" }] });
    const b = runTool({ items: [{ niche: "beauty", postType: "carousel", goal: "branded" }] });
    assert.deepEqual(a, b);
  });

  it("unknown niche falls back to the generic pool (not an error)", () => {
    const r = runTool({ items: [{ niche: "spaceships", postType: "feed", goal: "reach" }] });
    assert.equal(r.ok, true);
    const mix = (r.values?.mix as string[])[0];
    assert.ok(mix.includes("#instagram"));
    assert.match(r.values?.copyNote as string, /general pool/i);
  });

  it("niche matching is case-insensitive", () => {
    const a = runTool({ items: [{ niche: "Fitness", postType: "feed", goal: "reach" }] });
    const b = runTool({ items: [{ niche: "fitness", postType: "feed", goal: "reach" }] });
    assert.deepEqual(a, b);
  });

  it("blank goal defaults to reach", () => {
    const r = runTool({ items: [{ niche: "food", postType: "feed", goal: "" }] });
    assert.equal(r.ok, true);
    assert.ok((r.values?.readyToCopy as string).length > 0);
  });

  it("errors when items is missing or empty", () => {
    assert.equal(runTool({ items: [] }).ok, false);
    assert.equal(runTool({} as never).ok, false);
  });

  it("errors when niche is missing", () => {
    const r = runTool({ items: [{ postType: "feed", goal: "reach" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 1:.*niche/i);
  });

  it("errors on unknown postType", () => {
    const r = runTool({ items: [{ niche: "fitness", postType: "live", goal: "reach" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /postType/i);
  });

  it("errors on invalid goal", () => {
    const r = runTool({ items: [{ niche: "fitness", postType: "feed", goal: "viral" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /goal/i);
  });

  it("labels bad rows by item number", () => {
    const r = runTool({
      items: [
        { niche: "fitness", postType: "feed", goal: "reach" },
        { niche: "fitness", postType: "livestream", goal: "reach" },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 2:/);
  });

  it("handles multiple rows, prefixing readyToCopy per row", () => {
    const r = runTool({
      items: [
        { niche: "travel", postType: "reel", goal: "reach" },
        { niche: "food", postType: "story", goal: "community" },
      ],
    });
    assert.equal(r.ok, true);
    assert.equal((r.values?.mix as string[]).length, 2);
    assert.match(r.values?.readyToCopy as string, /Row 1/);
    assert.match(r.values?.readyToCopy as string, /Row 2/);
  });

  it("copyNote states pools are curated with no live data", () => {
    const r = runTool({ items: [{ niche: "fashion", postType: "feed", goal: "reach" }] });
    assert.match(r.values?.copyNote as string, /curated/i);
    assert.match(r.values?.copyNote as string, /no live hashtag/i);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ items: [{ niche: "business", postType: "feed", goal: "reach" }] });
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), [...META_OUTPUTS].sort());
  });

  it("bundled pools hold 8 niches x 24 tags + 24 generic (documented sizes)", () => {
    assert.equal(NICHE_IDS.length, 8);
    const m = buildMix({ niche: "photography", postType: "feed", goal: "reach" }, 0);
    const seen = new Set<string>();
    for (const goal of ["reach", "community", "branded"] as const) {
      for (let i = 0; i < 30; i++) {
        const mm = buildMix({ niche: "photography", postType: "feed", goal }, i);
        mm.slots.forEach((s) => seen.add(`${s.tier}:${s.tag}`));
      }
    }
    // 24 unique tier:tag pairs per niche pool (4 tiers x 6 tags)
    assert.equal(seen.size, 24);
    assert.ok(m.readyToCopy.length > 0);
  });
});
