import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TRACKER_ITEMS,
  describeProgress,
  MIN_IMPRESSIONS_PER_VARIANT,
  variantCtr,
  validateVariantNumbers,
  compareThumbnailVariants,
} from "./logic.ts";
import type { ThumbnailVariant } from "./logic.ts";
import { inputs, outputs, trackerMode, trackerItems, content } from "./meta.ts";

const A: ThumbnailVariant = { label: "A", impressions: 2000, clicks: 120 };
const B: ThumbnailVariant = { label: "B", impressions: 2000, clicks: 160 };
const C_LOW: ThumbnailVariant = { label: "C", impressions: 50, clicks: 5 };

describe("TRACKER_ITEMS", () => {
  it("has exactly 10 steps", () => {
    assert.equal(TRACKER_ITEMS.length, 10);
  });
  it("ids are unique lowercase kebab-case", () => {
    const ids = TRACKER_ITEMS.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
  it("every item has a non-empty label and detail", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(item.label.trim().length > 0, item.id);
      assert.ok((item.detail ?? "").trim().length > 0, item.id);
    }
  });
  it("covers the A/B/C edge case and the manual-tracking honesty note", () => {
    const all = TRACKER_ITEMS.map((i) => `${i.label} ${i.detail}`).join(" ");
    assert.ok(all.includes("A/B/C"));
    assert.ok(all.includes("manual tracking"));
  });
});

describe("describeProgress", () => {
  it("formats 0/total", () => {
    assert.equal(describeProgress(0, 10), "0/10 steps logged — keep logging; never judge a variant below the 1,000-impression rule. Manual tracking only.");
  });
  it("formats partial progress", () => {
    assert.ok(describeProgress(4, 10).startsWith("4/10"));
  });
  it("formats completion with the winner-rule reminder", () => {
    const s = describeProgress(10, 10);
    assert.ok(s.startsWith("10/10"));
    assert.ok(s.includes("winner rule"));
  });
  it("handles total 0", () => {
    assert.ok(describeProgress(0, 0).length > 0);
  });
  it("clamps checked above total", () => {
    assert.ok(describeProgress(99, 10).startsWith("10/10"));
  });
});

describe("variantCtr", () => {
  it("computes CTR as a 2-decimal percentage", () => {
    assert.equal(variantCtr(2000, 120), 6);
    assert.equal(variantCtr(3, 1), 33.33);
  });
  it("returns 0 for 0 impressions (guarded division)", () => {
    assert.equal(variantCtr(0, 0), 0);
  });
});

describe("validateVariantNumbers", () => {
  it("accepts a valid row", () => {
    assert.deepEqual(validateVariantNumbers(A), []);
  });
  it("rejects clicks > impressions", () => {
    const p = validateVariantNumbers({ label: "A", impressions: 10, clicks: 11 });
    assert.ok(p.some((m) => m.includes("clicks cannot exceed impressions")));
  });
  it("rejects negative numbers", () => {
    const p = validateVariantNumbers({ label: "A", impressions: -1, clicks: 0 });
    assert.ok(p.some((m) => m.includes("impressions must be >= 0")));
  });
  it("rejects non-integers", () => {
    const p = validateVariantNumbers({ label: "A", impressions: 10.5, clicks: 1 });
    assert.ok(p.some((m) => m.includes("must be an integer")));
  });
  it("rejects an empty label", () => {
    const p = validateVariantNumbers({ label: "  ", impressions: 10, clicks: 1 });
    assert.ok(p.some((m) => m.includes("label")));
  });
});

describe("compareThumbnailVariants", () => {
  it("declares the higher-CTR variant the winner at full sample", () => {
    const r = compareThumbnailVariants([A, B]);
    assert.equal(r.verdict, "winner");
    assert.equal(r.winner, "B");
    assert.equal(r.variants[0].ctr, 8);
    assert.equal(r.variants[1].ctr, 6);
    assert.ok(r.reason.includes("manual tracking"));
  });
  it("supports A/B/C", () => {
    const c: ThumbnailVariant = { label: "C", impressions: 2000, clicks: 200 };
    const r = compareThumbnailVariants([A, B, c]);
    assert.equal(r.verdict, "winner");
    assert.equal(r.winner, "C");
    assert.equal(r.variants.length, 3);
  });
  it("is inconclusive below the impression rule (low impressions -> never 'A wins')", () => {
    const r = compareThumbnailVariants([C_LOW, { label: "B", impressions: 60, clicks: 2 }]);
    assert.equal(r.verdict, "inconclusive");
    assert.equal(r.winner, null);
  });
  it("is inconclusive when only one variant is under-sampled", () => {
    const r = compareThumbnailVariants([A, C_LOW]);
    assert.equal(r.verdict, "inconclusive");
    assert.ok(r.reason.includes("C"));
  });
  it("is inconclusive with fewer than 2 variants", () => {
    const r = compareThumbnailVariants([A]);
    assert.equal(r.verdict, "inconclusive");
    assert.equal(r.winner, null);
  });
  it("declares a tie on equal top CTRs", () => {
    const r = compareThumbnailVariants([
      { label: "A", impressions: 2000, clicks: 100 },
      { label: "B", impressions: 2000, clicks: 100 },
    ]);
    assert.equal(r.verdict, "tie");
    assert.equal(r.winner, null);
  });
  it("is deterministic (same inputs -> identical output)", () => {
    const r1 = compareThumbnailVariants([B, A]);
    const r2 = compareThumbnailVariants([B, A]);
    assert.deepEqual(r1, r2);
  });
  it("exposes the documented 1000-impression default", () => {
    assert.equal(MIN_IMPRESSIONS_PER_VARIANT, 1000);
  });
});

describe("meta contract (tracker)", () => {
  it("trackerMode is checklist", () => {
    assert.equal(trackerMode, "checklist");
  });
  it("trackerItems re-exports TRACKER_ITEMS", () => {
    assert.equal(trackerItems, TRACKER_ITEMS);
  });
  it("inputs and outputs are empty for a tracker", () => {
    assert.deepEqual(inputs, []);
    assert.deepEqual(outputs, []);
  });
  it("title is <= 60 chars and description is 140-160 chars", () => {
    assert.ok(content.title.length <= 60, `title ${content.title.length}`);
    assert.ok(
      content.description.length >= 140 && content.description.length <= 160,
      `description ${content.description.length}`,
    );
  });
  it("canonical url is absolute and matches the slug", () => {
    const ld = content.jsonLd ?? [];
    const app = ld.find((o) => o["@type"] === "SoftwareApplication") as Record<string, unknown>;
    assert.equal(app["url"], "https://husnainblogger.com/tools/youtube/thumbnail-a-b-test-tracker/");
  });
});
