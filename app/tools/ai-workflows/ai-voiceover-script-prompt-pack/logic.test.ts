import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as logic from "./logic.ts";
import { TRACKER_ITEMS, describeProgress } from "./logic.ts";

describe("ai-voiceover-script-prompt-pack (tool-350)", () => {
  it("library holds 48 prompts (within the 40-60 contract range)", () => {
    assert.equal(TRACKER_ITEMS.length, 48);
    assert.ok(TRACKER_ITEMS.length >= 40 && TRACKER_ITEMS.length <= 60);
  });

  it("does NOT export runTool (library tools have no runner)", () => {
    assert.ok(!("runTool" in logic), "runTool must not be exported for library tools");
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

  it("covers 3 script types with 16 prompts each", () => {
    const prefixes: Record<string, number> = {
      "ad-": 16,
      "narration-": 16,
      "explainer-": 16,
    };
    for (const [prefix, expected] of Object.entries(prefixes)) {
      const count = TRACKER_ITEMS.filter((i) => i.id.startsWith(prefix)).length;
      assert.equal(count, expected, `expected ${expected} prompts for prefix ${prefix}`);
    }
  });

  it("labels start with their category name for scannable browsing", () => {
    const categories = ["Ad Voiceover:", "Narration:", "Explainer Voiceover:"];
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        categories.some((c) => item.label.startsWith(c)),
        `label missing category: ${item.label}`,
      );
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

  it("prompts include voice direction (pace/tone guidance)", () => {
    const withDirection = TRACKER_ITEMS.filter((i) =>
      /voice direction:/i.test(i.detail ?? ""),
    );
    assert.ok(
      withDirection.length >= 40,
      `only ${withDirection.length} prompts include voice direction`,
    );
  });

  it("no prompt claims AI generation or names a model as the actor", () => {
    const banned = /as an ai|i am an ai|language model|gpt-4|chatgpt will|i will generate/i;
    for (const item of TRACKER_ITEMS) {
      assert.ok(!banned.test(item.detail ?? ""), `banned phrase in ${item.id}`);
    }
  });

  it("prompts carry honesty guards (never invent claims/figures)", () => {
    const guarded = TRACKER_ITEMS.filter((i) =>
      /never invent|use only|do not invent/i.test(i.detail ?? ""),
    );
    assert.ok(guarded.length >= 10, `only ${guarded.length} prompts carry an honesty guard`);
  });

  it("prompt texts are reasonably sized (100-800 chars)", () => {
    for (const item of TRACKER_ITEMS) {
      const len = (item.detail ?? "").length;
      assert.ok(len >= 100 && len <= 800, `${item.id} detail length ${len}`);
    }
  });

  it("no prompt invents statistics or prices", () => {
    const banned = /\$\d|\d+x\b|guaranteed viral/i;
    for (const item of TRACKER_ITEMS) {
      assert.ok(!banned.test(item.detail ?? ""), `invented stat/price in ${item.id}`);
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

  it("no two prompts share the same detail text", () => {
    const details = TRACKER_ITEMS.map((i) => i.detail);
    assert.equal(new Set(details).size, details.length);
  });
});
