import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TRACKER_ITEMS, describeProgress } from "./logic.ts";

describe("viral-format-swipe-file (tool-342)", () => {
  it("swipe file holds 48 format cards (within the 40-60 contract range)", () => {
    assert.equal(TRACKER_ITEMS.length, 48);
    assert.ok(TRACKER_ITEMS.length >= 40 && TRACKER_ITEMS.length <= 60);
  });

  it("covers the 8 format categories with 6 cards each", () => {
    const counts: Record<string, number> = {};
    for (const item of TRACKER_ITEMS) {
      const cat = item.id.split("-")[0];
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    const expected = [
      "hooks",
      "storytelling",
      "listicle",
      "comparison",
      "tutorial",
      "behindscenes",
      "ugc",
      "repurposing",
    ];
    for (const cat of expected) {
      assert.equal(counts[cat], 6, `expected 6 cards in category ${cat}, got ${counts[cat]}`);
    }
  });

  it("every item has a unique kebab-case id", () => {
    const ids = TRACKER_ITEMS.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) {
      assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("every item has a non-empty label", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(item.label.trim().length > 0, `empty label for ${item.id}`);
    }
  });

  it("every item has a non-empty detail (the copyable format card)", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        typeof item.detail === "string" && item.detail.trim().length > 0,
        `missing detail for ${item.id}`,
      );
    }
  });

  it("every detail contains a structure breakdown AND an example prompt template", () => {
    for (const item of TRACKER_ITEMS) {
      const d = item.detail ?? "";
      assert.ok(
        /STRUCTURE:/i.test(d),
        `detail for ${item.id} has no structure breakdown`,
      );
      assert.ok(
        /PROMPT TEMPLATE:/i.test(d),
        `detail for ${item.id} has no example prompt template`,
      );
    }
  });

  it("every detail includes at least one fill-in placeholder", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        /\[.+\]/.test(item.detail ?? ""),
        `detail for ${item.id} has no [PLACEHOLDER]`,
      );
    }
  });

  it("details never promise virality or engagement numbers", () => {
    for (const item of TRACKER_ITEMS) {
      const d = item.detail ?? "";
      assert.ok(
        !/\bguarantee\w* (viral|views|engagement)|\d+[KkMm]? views? guaranteed/i.test(d),
        `detail for ${item.id} promises results`,
      );
      assert.ok(
        !/\d+% (more|higher) engagement/i.test(d),
        `detail for ${item.id} cites an invented stat`,
      );
    }
  });

  it("hooks cards are labeled and grouped as hook formats", () => {
    const items = TRACKER_ITEMS.filter((i) => i.id.startsWith("hooks-"));
    assert.equal(items.length, 6);
    for (const item of items) {
      assert.ok(item.label.startsWith("Hooks:"), `hooks card ${item.id} mislabeled`);
    }
  });

  it("tutorial cards read like tutorial formats", () => {
    const items = TRACKER_ITEMS.filter((i) => i.id.startsWith("tutorial-"));
    for (const item of items) {
      assert.ok(
        /step|guide|how/i.test(item.detail ?? ""),
        `tutorial card ${item.id} off-topic`,
      );
    }
  });

  it("describeProgress handles 0 of total", () => {
    assert.equal(
      describeProgress(0, 48),
      "0 of 48 formats marked as used. Browse the file and mark the ones you try.",
    );
  });

  it("describeProgress handles partial progress", () => {
    assert.equal(describeProgress(11, 48), "11 of 48 formats marked as used.");
  });

  it("describeProgress handles total of total", () => {
    assert.equal(
      describeProgress(48, 48),
      "All 48 formats marked as used. Time to make them your own.",
    );
  });

  it("describeProgress clamps out-of-range values", () => {
    assert.equal(describeProgress(-1, 48), describeProgress(0, 48));
    assert.equal(describeProgress(200, 48), describeProgress(48, 48));
  });

  it("describeProgress handles an empty swipe file", () => {
    assert.equal(describeProgress(0, 0), "The swipe file is empty.");
  });

  it("labels name their category for easy browsing", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        /^[A-Za-z][^:]*:/.test(item.label),
        `label "${item.label}" does not name a category`,
      );
    }
  });
});
