import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TRACKER_ITEMS, describeProgress } from "./logic.ts";

describe("ai-content-editing-checklist (tool-340)", () => {
  it("checklist holds 18 items (within the 15-20 contract range)", () => {
    assert.equal(TRACKER_ITEMS.length, 18);
    assert.ok(TRACKER_ITEMS.length >= 15 && TRACKER_ITEMS.length <= 20);
  });

  it("covers the 5 editing groups", () => {
    const groups = ["humanize", "verify", "tone", "structure", "polish"];
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

  it("details give guidance, not invented facts", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(
        !/studies show \d|%\s*improvement/i.test(item.detail ?? ""),
        `detail for ${item.id} contains a stat-like claim`,
      );
    }
  });

  it("includes a humanize group for AI drafts", () => {
    const humanize = TRACKER_ITEMS.filter((i) => i.id.startsWith("humanize-"));
    assert.ok(humanize.length >= 3);
    assert.ok(
      humanize.some((i) => /experience|story/i.test(i.detail ?? "")),
      "humanize group should mention adding real experience",
    );
  });

  it("includes a verify group for factual claims", () => {
    const verify = TRACKER_ITEMS.filter((i) => i.id.startsWith("verify-"));
    assert.ok(verify.length >= 3);
    assert.ok(
      verify.some((i) => /source/i.test(i.detail ?? "")),
      "verify group should mention checking sources",
    );
  });

  it("ends with a final polish group", () => {
    const polish = TRACKER_ITEMS.filter((i) => i.id.startsWith("polish-"));
    assert.ok(polish.length >= 2);
    assert.ok(
      polish.some((i) => /read/i.test(i.detail ?? "")),
      "polish group should include a read-through",
    );
  });

  it("describeProgress handles 0 of total", () => {
    assert.equal(
      describeProgress(0, 18),
      "0 of 18 editing checks done. Start at the top — humanize first.",
    );
  });

  it("describeProgress handles partial progress", () => {
    assert.equal(describeProgress(5, 18), "5 of 18 editing checks done.");
  });

  it("describeProgress handles total of total", () => {
    assert.equal(
      describeProgress(18, 18),
      "All 18 editing checks done. This draft is ready to publish.",
    );
  });

  it("describeProgress clamps out-of-range values", () => {
    assert.equal(describeProgress(-2, 18), describeProgress(0, 18));
    assert.equal(describeProgress(50, 18), describeProgress(18, 18));
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
