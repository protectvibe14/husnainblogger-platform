import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TRACKER_ITEMS, describeProgress } from "./logic.ts";

describe("email-subject-line-prompt-pack (tool-338)", () => {
  it("pack holds 48 prompts (within the 40-60 contract range)", () => {
    assert.equal(TRACKER_ITEMS.length, 48);
    assert.ok(TRACKER_ITEMS.length >= 40 && TRACKER_ITEMS.length <= 60);
  });

  it("covers the 4 email categories with 12 prompts each", () => {
    const counts: Record<string, number> = {
      newsletter: 0,
      promo: 0,
      welcome: 0,
      abandoned: 0,
    };
    for (const item of TRACKER_ITEMS) {
      const cat = item.id.split("-")[0];
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    for (const [cat, n] of Object.entries(counts)) {
      assert.equal(n, 12, `expected 12 prompts in category ${cat}, got ${n}`);
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

  it("every item has a non-empty detail (the copyable prompt text)", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        typeof item.detail === "string" && item.detail.trim().length > 0,
        `missing detail for ${item.id}`,
      );
    }
  });

  it("every detail is a complete standalone prompt (mentions subject lines)", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        /subject line/i.test(item.detail ?? ""),
        `detail for ${item.id} does not read as a subject-line prompt`,
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

  it("details never claim AI generation — it is a fixed pack", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        !/AI-generated|artificial intelligence/i.test(item.detail ?? ""),
        `detail for ${item.id} makes an AI claim`,
      );
    }
  });

  it("details stay honest (no invented numbers as facts)", () => {
    for (const item of TRACKER_ITEMS) {
      // placeholders use [N]/[X]% style; nothing hard-coded as a fact
      assert.ok(
        !/\b\d{2,}%\s*off\b/.test(item.detail ?? "") ||
          /\[X\]/.test(item.detail ?? ""),
        `detail for ${item.id} hard-codes a discount number`,
      );
    }
  });

  it("newsletter items read like newsletter prompts", () => {
    const items = TRACKER_ITEMS.filter((i) => i.id.startsWith("newsletter-"));
    assert.ok(items.length > 0);
    for (const item of items) {
      assert.ok(
        /newsletter/i.test(item.detail ?? "") || /subscriber/i.test(item.detail ?? ""),
        `newsletter item ${item.id} does not mention newsletters`,
      );
    }
  });

  it("abandoned items read like cart-recovery prompts", () => {
    const items = TRACKER_ITEMS.filter((i) => i.id.startsWith("abandoned-"));
    assert.ok(items.length > 0);
    for (const item of items) {
      assert.ok(
        /cart|purchase|viewed|checkout/i.test(item.detail ?? ""),
        `abandoned item ${item.id} does not mention carts or purchases`,
      );
    }
  });

  it("describeProgress handles 0 of total", () => {
    assert.equal(
      describeProgress(0, 48),
      "0 of 48 prompts marked as tried. Browse the pack and mark the ones you use.",
    );
  });

  it("describeProgress handles partial progress", () => {
    assert.equal(describeProgress(7, 48), "7 of 48 prompts marked as tried.");
  });

  it("describeProgress handles total of total", () => {
    assert.equal(
      describeProgress(48, 48),
      "All 48 prompts marked as tried. Time to put them to work — write those subject lines.",
    );
  });

  it("describeProgress clamps out-of-range values", () => {
    assert.equal(describeProgress(-3, 48), describeProgress(0, 48));
    assert.equal(describeProgress(99, 48), describeProgress(48, 48));
  });

  it("describeProgress handles an empty pack", () => {
    assert.equal(describeProgress(0, 0), "The prompt pack is empty.");
  });

  it("labels name their category for easy browsing", () => {
    const prefixes = ["Newsletter:", "Promo:", "Welcome:", "Abandoned:"];
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        prefixes.some((p) => item.label.startsWith(p)),
        `label "${item.label}" does not name a category`,
      );
    }
  });
});
