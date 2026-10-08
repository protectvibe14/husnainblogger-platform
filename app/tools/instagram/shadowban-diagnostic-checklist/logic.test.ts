import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TRACKER_ITEMS, describeProgress, RISK_BANDS } from "./logic.ts";

const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

describe("shadowban-diagnostic-checklist (tool-203)", () => {
  it("holds 14 items (within the 12-15 contract range)", () => {
    assert.equal(TRACKER_ITEMS.length, 14);
    assert.ok(TRACKER_ITEMS.length >= 12 && TRACKER_ITEMS.length <= 15);
  });

  it("every item has a unique kebab-case id", () => {
    const ids = TRACKER_ITEMS.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length, "duplicate ids");
    for (const id of ids) assert.match(id, KEBAB, `not kebab-case: ${id}`);
  });

  it("every item has a non-empty label", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(item.label.trim().length > 0, `empty label: ${item.id}`);
    }
  });

  it("every item has a 1-line detail", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(typeof item.detail === "string" && item.detail.trim().length > 0, `missing detail: ${item.id}`);
      assert.ok(!item.detail.includes("\n"), `multi-line detail: ${item.id}`);
      assert.ok(item.detail.length <= 160, `detail too long: ${item.id}`);
    }
  });

  it("covers the 4 symptom groups", () => {
    const ids = TRACKER_ITEMS.map((i) => i.id);
    for (const g of ["reach-", "tag-", "engage-", "account-"]) {
      assert.ok(ids.some((id) => id.startsWith(g)), `no items for group ${g}`);
    }
  });

  it("risk band boundaries are fixed and contiguous", () => {
    assert.deepEqual([RISK_BANDS.LOW.min, RISK_BANDS.LOW.max], [0, 4]);
    assert.deepEqual([RISK_BANDS.MODERATE.min, RISK_BANDS.MODERATE.max], [5, 8]);
    assert.deepEqual([RISK_BANDS.HIGH.min, RISK_BANDS.HIGH.max], [9, 14]);
  });

  it("describeProgress: 0/total -> LOW band", () => {
    const s = describeProgress(0, 14);
    assert.match(s, /0 of 14 warning signs checked/);
    assert.match(s, /Risk band: LOW/);
  });

  it("describeProgress: total/total -> HIGH band", () => {
    const s = describeProgress(14, 14);
    assert.match(s, /All 14 warning signs checked/);
    assert.match(s, /Risk band: HIGH/);
  });

  it("describeProgress: 6/14 -> MODERATE band", () => {
    assert.match(describeProgress(6, 14), /Risk band: MODERATE/);
  });

  it("describeProgress: 4/14 is LOW, 5/14 is MODERATE, 9/14 is HIGH", () => {
    assert.match(describeProgress(4, 14), /Risk band: LOW/);
    assert.match(describeProgress(5, 14), /Risk band: MODERATE/);
    assert.match(describeProgress(8, 14), /Risk band: MODERATE/);
    assert.match(describeProgress(9, 14), /Risk band: HIGH/);
  });

  it("describeProgress always carries the self-assessment honesty note", () => {
    for (const s of [describeProgress(0, 14), describeProgress(3, 14), describeProgress(14, 14)]) {
      assert.match(s, /self-assessment/i);
      assert.match(s, /cannot detect a real shadowban/i);
    }
  });

  it("describeProgress: empty checklist", () => {
    assert.equal(describeProgress(0, 0), "The checklist is empty.");
  });

  it("describeProgress clamps out-of-range values", () => {
    assert.match(describeProgress(-3, 14), /0 of 14/);
    assert.match(describeProgress(99, 14), /All 14/);
    assert.match(describeProgress(7.9, 14), /7 of 14/);
  });

  it("describeProgress is deterministic", () => {
    assert.equal(describeProgress(5, 14), describeProgress(5, 14));
  });

  it("details give actionable verification steps (no dead ends)", () => {
    const text = TRACKER_ITEMS.map((i) => i.detail).join(" ");
    assert.match(text, /Insights/);
    assert.match(text, /non-follower/i);
  });

  it("exposes no runTool (tracker contract)", async () => {
    const mod = await import("./logic.ts");
    assert.equal(typeof (mod as Record<string, unknown>).runTool, "undefined");
  });
});
