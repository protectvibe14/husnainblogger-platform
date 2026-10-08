import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TRACKER_ITEMS, describeProgress } from "./logic.ts";

describe("ai-fact-check-checklist (tool-341)", () => {
  it("checklist holds 16 items (within the 15-20 contract range)", () => {
    assert.equal(TRACKER_ITEMS.length, 16);
    assert.ok(TRACKER_ITEMS.length >= 15 && TRACKER_ITEMS.length <= 20);
  });

  it("covers the 5 verification groups", () => {
    const groups = ["inventory", "numbers", "sources", "media", "gate"];
    const ids = TRACKER_ITEMS.map((i) => i.id);
    for (const g of groups) {
      assert.ok(ids.some((id) => id.startsWith(g + "-")), `no items for group ${g}`);
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

  it("every item has a 1-line detail", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        typeof item.detail === "string" && item.detail.trim().length > 0,
        `missing detail for ${item.id}`,
      );
      assert.ok(
        !(item.detail ?? "").includes("\n"),
        `detail for ${item.id} is not one line`,
      );
    }
  });

  it("details are verification steps, never automation claims", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        !/automatically (verify|check)|auto-verif|AI will verify/i.test(item.detail ?? ""),
        `detail for ${item.id} implies automated checking`,
      );
    }
  });

  it("covers hallucinated sources explicitly", () => {
    const item = TRACKER_ITEMS.find((i) => i.id === "sources-no-hallucinated");
    assert.ok(item, "missing the hallucinated-source step");
    assert.ok(/hallucinat/i.test(item?.detail ?? ""));
  });

  it("ends with a publish gate, not a fact verdict", () => {
    const gate = TRACKER_ITEMS.filter((i) => i.id.startsWith("gate-"));
    assert.ok(gate.length >= 2);
    assert.ok(
      gate.some((i) => /unverifiable|estimate/i.test(i.detail ?? "")),
      "publish gate should say what to do with unverifiable claims",
    );
  });

  it("starts with claim inventory, the correct first step", () => {
    assert.ok(TRACKER_ITEMS[0].id.startsWith("inventory-"));
  });

  it("details contain no invented stats or capabilities", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        !/\d+% (accurate|correct)/.test(item.detail ?? ""),
        `detail for ${item.id} cites an invented accuracy stat`,
      );
    }
  });

  it("describeProgress handles 0 of total", () => {
    assert.equal(
      describeProgress(0, 16),
      "0 of 16 verification steps done. Start by listing every claim.",
    );
  });

  it("describeProgress handles partial progress", () => {
    assert.equal(describeProgress(4, 16), "4 of 16 verification steps done.");
  });

  it("describeProgress handles total of total", () => {
    assert.equal(
      describeProgress(16, 16),
      "All 16 verification steps done. Publish with confidence.",
    );
  });

  it("describeProgress clamps out-of-range values", () => {
    assert.equal(describeProgress(-5, 16), describeProgress(0, 16));
    assert.equal(describeProgress(30, 16), describeProgress(16, 16));
  });

  it("describeProgress handles an empty checklist", () => {
    assert.equal(describeProgress(0, 0), "The checklist is empty.");
  });

  it("labels name their group for easy scanning", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        /^[A-Z][a-z]+:/.test(item.label),
        `label "${item.label}" does not start with a group name`,
      );
    }
  });
});
