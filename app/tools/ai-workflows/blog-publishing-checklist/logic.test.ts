import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TRACKER_ITEMS, describeProgress } from "./logic.ts";

describe("blog-publishing-checklist", () => {
  it("has 15–20 items (spec range)", () => {
    assert.ok(TRACKER_ITEMS.length >= 15 && TRACKER_ITEMS.length <= 20,
      `got ${TRACKER_ITEMS.length} items`);
  });

  it("item ids are unique", () => {
    const ids = TRACKER_ITEMS.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("item ids are lowercase kebab-case", () => {
    for (const item of TRACKER_ITEMS) {
      assert.match(item.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `bad id: ${item.id}`);
    }
  });

  it("every item has a non-empty label", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(typeof item.label === "string" && item.label.trim().length > 0, `empty label: ${item.id}`);
    }
  });

  it("every item has a 1-line detail (no run-on)", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(typeof item.detail === "string" && item.detail.trim().length > 0, `missing detail: ${item.id}`);
      assert.ok(!item.detail.includes("\n"), `multi-line detail: ${item.id}`);
    }
  });

  it("covers the SEO basics: title, meta, slug, h1, links, images", () => {
    const ids = new Set(TRACKER_ITEMS.map((i) => i.id));
    for (const must of ["title-tag", "meta-description", "url-slug", "single-h1", "internal-links", "image-alt"]) {
      assert.ok(ids.has(must), `missing item: ${must}`);
    }
  });

  it("covers QA basics: proofread, facts, mobile preview, publish date", () => {
    const ids = new Set(TRACKER_ITEMS.map((i) => i.id));
    for (const must of ["proofread", "facts-verified", "mobile-preview", "publish-date"]) {
      assert.ok(ids.has(must), `missing item: ${must}`);
    }
  });

  it("describeProgress: 0/total start state", () => {
    assert.equal(
      describeProgress(0, 18),
      "0 of 18 done — nothing checked yet. Start at the top.",
    );
  });

  it("describeProgress: total/total complete state", () => {
    assert.equal(
      describeProgress(18, 18),
      "18 of 18 done (100%) — checklist complete. Ready to publish!",
    );
  });

  it("describeProgress: partial progress with percent", () => {
    assert.equal(describeProgress(9, 18), "9 of 18 done (50%) — keep going.");
  });

  it("describeProgress: percent rounds to whole numbers", () => {
    assert.equal(describeProgress(1, 3), "1 of 3 done (33%) — keep going.");
    assert.equal(describeProgress(2, 3), "2 of 3 done (67%) — keep going.");
  });

  it("describeProgress: checked > total clamps to total", () => {
    assert.equal(describeProgress(99, 18), "18 of 18 done (100%) — checklist complete. Ready to publish!");
  });

  it("describeProgress: negative checked clamps to 0", () => {
    assert.equal(describeProgress(-5, 18), "0 of 18 done — nothing checked yet. Start at the top.");
  });

  it("describeProgress: total 0 never divides by zero", () => {
    assert.equal(describeProgress(0, 0), "0 of 0 done — nothing checked yet. Start at the top.");
  });

  it("describeProgress: fractional inputs are floored", () => {
    assert.equal(describeProgress(2.7, 18), "2 of 18 done (11%) — keep going.");
  });

  it("describeProgress is deterministic", () => {
    assert.equal(describeProgress(5, 18), describeProgress(5, 18));
  });

  it("labels and details are honest general guidance (no invented stats)", () => {
    const joined = TRACKER_ITEMS.map((i) => `${i.label} ${i.detail}`).join(" ");
    assert.ok(!/\b\d{3,}%\b/.test(joined), "no invented percentage stats");
    assert.ok(!joined.includes("guarantee"), "no guarantees promised");
  });
});
