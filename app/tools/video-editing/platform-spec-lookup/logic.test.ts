import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const PLATFORMS = ["tiktok", "youtube", "youtube-shorts", "instagram-reels", "facebook", "x", "pinterest"];

describe("platform-spec-lookup (tool-274)", () => {
  it("happy path: tiktok video returns a spec table with verified date", () => {
    const r = runTool({ platform: "tiktok", specType: "video" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const specs = v.specs as { spec: string; value: string }[];
    assert.ok(Array.isArray(specs) && specs.length >= 6);
    assert.ok(specs.some((x) => x.spec === "Aspect ratios" && x.value.includes("9:16")));
    assert.ok(specs.some((x) => x.spec === "Recommended resolution"));
    assert.equal(v.lastVerifiedDate, "2026-10-01");
    assert.ok(String(v.freshnessNote).includes("ESTIMATES"));
    assert.ok(!r.error);
  });

  it("output keys match meta.ts outputs (specs, lastVerifiedDate, freshnessNote)", () => {
    const r = runTool({ platform: "tiktok", specType: "video" });
    assert.deepEqual(Object.keys(r.values as object).sort(), ["freshnessNote", "lastVerifiedDate", "specs"]);
  });

  it("every platform returns non-empty video and image tables", () => {
    for (const platform of PLATFORMS) {
      const rv = runTool({ platform, specType: "video" });
      const ri = runTool({ platform, specType: "image" });
      assert.equal(rv.ok, true, platform);
      assert.equal(ri.ok, true, platform);
      const sv = (rv.values as Record<string, unknown>).specs as unknown[];
      const si = (ri.values as Record<string, unknown>).specs as unknown[];
      assert.ok(sv.length >= 5, `${platform} video`);
      assert.ok(si.length >= 4, `${platform} image`);
      for (const row of [...sv, ...si] as { spec: string; value: string }[]) {
        assert.equal(typeof row.spec, "string");
        assert.equal(typeof row.value, "string");
      }
    }
  });

  it("specType 'all' returns video + image sections in one table", () => {
    const r = runTool({ platform: "youtube", specType: "all" });
    assert.equal(r.ok, true);
    const specs = (r.values as Record<string, unknown>).specs as { spec: string; value: string }[];
    assert.ok(specs.some((x) => x.spec.includes("Video specs")));
    assert.ok(specs.some((x) => x.spec.includes("Image specs")));
    const vOnly = (runTool({ platform: "youtube", specType: "video" }).values as Record<string, unknown>).specs as unknown[];
    const iOnly = (runTool({ platform: "youtube", specType: "image" }).values as Record<string, unknown>).specs as unknown[];
    assert.equal(specs.length, vOnly.length + iOnly.length + 2);
  });

  it("video and image tables differ for each platform", () => {
    for (const platform of PLATFORMS) {
      const v = runTool({ platform, specType: "video" }).values as Record<string, unknown>;
      const i = runTool({ platform, specType: "image" }).values as Record<string, unknown>;
      assert.notDeepEqual(v.specs, i.specs, platform);
    }
  });

  it("freshness note names the platform and the review dates", () => {
    const r = runTool({ platform: "x", specType: "video" });
    const note = String((r.values as Record<string, unknown>).freshnessNote);
    assert.ok(note.includes("X (Twitter)"), note);
    assert.ok(note.includes("2026-10-01"), note);
    assert.ok(note.includes("verify"), note);
  });

  it("every value row is labeled an estimate (no live-data claims)", () => {
    const r = runTool({ platform: "pinterest", specType: "video" });
    const specs = (r.values as Record<string, unknown>).specs as { spec: string; value: string }[];
    const changeable = specs.filter((x) => /max duration|max file size|codecs|frame rate/i.test(x.spec));
    assert.ok(changeable.length > 0);
    for (const row of changeable) {
      assert.ok(row.value.toLowerCase().includes("est."), `${row.spec}: ${row.value}`);
    }
  });

  it("validation: unknown platform -> error, never a guess", () => {
    const r = runTool({ platform: "myspace", specType: "video" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("Unknown platform"));
    assert.ok(String(r.error).includes("tiktok"));
  });

  it("validation: missing platform -> error", () => {
    const r = runTool({ specType: "video" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: unknown specType -> error", () => {
    const r = runTool({ platform: "tiktok", specType: "audio" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("spec type"));
  });

  it("platform matching is case-insensitive and trims whitespace", () => {
    const r = runTool({ platform: "  TikTok ", specType: "video" });
    assert.equal(r.ok, true);
  });

  it("determinism: same inputs twice -> identical output", () => {
    const a = runTool({ platform: "facebook", specType: "all" });
    const b = runTool({ platform: "facebook", specType: "all" });
    assert.deepEqual(a, b);
  });

  it("table coverage: 7 platforms each with video + image tables (14 entries)", () => {
    let count = 0;
    for (const platform of PLATFORMS) {
      for (const specType of ["video", "image"]) {
        const r = runTool({ platform, specType });
        assert.equal(r.ok, true);
        count++;
      }
    }
    assert.equal(count, 14);
  });

  it("every spec row has a non-empty value", () => {
    for (const platform of PLATFORMS) {
      const r = runTool({ platform, specType: "all" });
      const specs = (r.values as Record<string, unknown>).specs as { spec: string; value: string }[];
      for (const row of specs) {
        if (row.spec.startsWith("---")) continue; // section header
        assert.ok(row.value.length > 0, `${platform}: ${row.spec} has an empty value`);
      }
    }
  });

  it("shorts and reels video specs are 9:16-first", () => {
    for (const platform of ["youtube-shorts", "instagram-reels"]) {
      const r = runTool({ platform, specType: "video" });
      const specs = (r.values as Record<string, unknown>).specs as { spec: string; value: string }[];
      const ar = specs.find((x) => x.spec === "Aspect ratios");
      assert.ok(ar && ar.value.startsWith("9:16"), `${platform}: ${ar?.value}`);
    }
  });

  it("youtube image specs cover thumbnails", () => {
    const r = runTool({ platform: "youtube", specType: "image" });
    const specs = (r.values as Record<string, unknown>).specs as { spec: string; value: string }[];
    const res = specs.find((x) => x.spec === "Recommended resolution");
    assert.ok(res && res.value.includes("1280 x 720"), res?.value ?? 'failed');
  });

  it("freshness note is present for all three spec types", () => {
    for (const specType of ["video", "image", "all"]) {
      const r = runTool({ platform: "tiktok", specType });
      const note = String((r.values as Record<string, unknown>).freshnessNote);
      assert.ok(note.includes("2026-10-01"), specType);
      assert.ok(note.includes("ESTIMATES"), specType);
    }
  });

  it("honesty: result never claims to be live or current platform data", () => {
    const r = runTool({ platform: "instagram-reels", specType: "all" });
    const blob = JSON.stringify(r.values).toLowerCase();
    assert.ok(!blob.includes("live"), "must not claim live data");
    assert.ok(!blob.includes("real-time"), "must not claim real-time data");
    assert.ok(blob.includes("estimate"), "must label values as estimates");
  });
});
