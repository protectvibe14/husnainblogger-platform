import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TRACKER_ITEMS, describeProgress } from "./logic.ts";

describe("ai-prompt-library-for-bloggers (tool-301)", () => {
  it("library holds 48 prompts (within the 40-60 contract range)", () => {
    assert.equal(TRACKER_ITEMS.length, 48);
    assert.ok(TRACKER_ITEMS.length >= 40 && TRACKER_ITEMS.length <= 60);
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

  it("every item has a non-empty detail (the copyable prompt text)", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        typeof item.detail === "string" && item.detail.trim().length > 0,
        `missing detail for ${item.id}`,
      );
    }
  });

  it("covers 8 categories with 6 prompts each", () => {
    const prefixes = [
      "ideas-",
      "outline-",
      "drafting-",
      "headlines-",
      "seo-",
      "editing-",
      "repurposing-",
      "promotion-",
    ];
    for (const p of prefixes) {
      const count = TRACKER_ITEMS.filter((i) => i.id.startsWith(p)).length;
      assert.equal(count, 6, `expected 6 prompts for prefix ${p}`);
    }
  });

  it("prompts use [PLACEHOLDER] syntax so users know what to fill in", () => {
    const withPlaceholder = TRACKER_ITEMS.filter((i) =>
      /\[[A-Z][A-Z0-9 _-]*\]/.test(i.detail ?? ""),
    );
    assert.ok(
      withPlaceholder.length >= 40,
      `only ${withPlaceholder.length} prompts contain placeholders`,
    );
  });

  it("no prompt claims AI generation or model behavior", () => {
    const banned = /as an ai|i am an ai|language model|gpt-4|chatgpt will/i;
    for (const item of TRACKER_ITEMS) {
      assert.ok(!banned.test(item.detail ?? ""), `banned phrase in ${item.id}`);
    }
  });

  it("labels start with their category name for scannable browsing", () => {
    const categories = [
      "Idea Generation",
      "Outlining",
      "Drafting",
      "Headlines",
      "SEO",
      "Editing",
      "Repurposing",
      "Promotion",
    ];
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        categories.some((c) => item.label.startsWith(c)),
        `label missing category: ${item.label}`,
      );
    }
  });

  it("describeProgress: 0 of total shows the browse hint", () => {
    assert.equal(
      describeProgress(0, 48),
      "0 of 48 prompts marked as tried. Browse the library and mark the ones you use.",
    );
  });

  it("describeProgress: partial progress", () => {
    assert.equal(describeProgress(5, 48), "5 of 48 prompts marked as tried.");
  });

  it("describeProgress: all done", () => {
    assert.equal(
      describeProgress(48, 48),
      "All 48 prompts marked as tried. Time to put them to work — publish something.",
    );
  });

  it("describeProgress: checked above total is clamped", () => {
    assert.equal(
      describeProgress(99, 48),
      "All 48 prompts marked as tried. Time to put them to work — publish something.",
    );
  });

  it("describeProgress: negative checked is clamped to 0", () => {
    assert.equal(
      describeProgress(-3, 48),
      "0 of 48 prompts marked as tried. Browse the library and mark the ones you use.",
    );
  });

  it("describeProgress: empty library", () => {
    assert.equal(describeProgress(0, 0), "The library is empty.");
  });

  it("describeProgress: fractional checked is floored", () => {
    assert.equal(describeProgress(2.9, 48), "2 of 48 prompts marked as tried.");
  });

  it("prompt texts are reasonably sized (50-600 chars)", () => {
    for (const item of TRACKER_ITEMS) {
      const len = (item.detail ?? "").length;
      assert.ok(len >= 50 && len <= 600, `${item.id} detail length ${len}`);
    }
  });
});
