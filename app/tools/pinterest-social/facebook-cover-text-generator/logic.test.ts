import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateCoverCopy,
  SAFE_ZONE_NOTES,
  COVER_TYPES,
  DEFAULT_COVER_TYPE,
  MAX_OFFER_WORDS,
  MAX_COPY_WORDS,
  TEMPLATE_COUNT,
} from "./logic.ts";

function wordCount(s: string): number {
  return s.split(/\s+/).filter((w) => w.length > 0).length;
}

describe("facebook-cover-text-generator", () => {
  it("happy path: offer + page returns 5 copy lines with page note", () => {
    const r = runTool({ offer: "free first haircut", coverType: "page" });
    assert.equal(r.ok, true);
    const copy = r.values!.coverCopy as string[];
    assert.equal(copy.length, 5);
    assert.equal(r.values!.count, 5);
    for (const c of copy) assert.ok(c.includes("free first haircut"), c);
    assert.equal(r.values!.safeZoneNote, SAFE_ZONE_NOTES.page);
  });

  it("group cover type returns the group safe-zone note", () => {
    const r = runTool({ offer: "weekly live Q&A", coverType: "group" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.safeZoneNote, SAFE_ZONE_NOTES.group);
    assert.ok((r.values!.safeZoneNote as string).includes("1640 x 856"));
  });

  it("page note mentions page dimensions", () => {
    assert.ok(SAFE_ZONE_NOTES.page.includes("851 x 315"));
  });

  it("coverType defaults to page when omitted", () => {
    const r = runTool({ offer: "20% off all plans" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.safeZoneNote, SAFE_ZONE_NOTES.page);
  });

  it("coverType is case-insensitive", () => {
    const r = runTool({ offer: "free trial", coverType: "GROUP" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.safeZoneNote, SAFE_ZONE_NOTES.group);
  });

  it("every copy line is 12 words or fewer", () => {
    const r = runTool({ offer: "one two three four five six seven eight", coverType: "page" });
    assert.equal(r.ok, true);
    for (const c of r.values!.coverCopy as string[]) {
      assert.ok(wordCount(c) <= MAX_COPY_WORDS, `${c} (${wordCount(c)} words)`);
    }
  });

  it("offer over the word limit errors", () => {
    const r = runTool({ offer: "one two three four five six seven eight nine ten" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /readable at cover scale/);
  });

  it("invalid coverType errors with valid options", () => {
    const r = runTool({ offer: "free trial", coverType: "event" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("page"));
    assert.ok(r.error!.includes("group"));
  });

  it("missing offer errors", () => {
    const r = runTool({ coverType: "page" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Offer is required/);
  });

  it("blank offer errors", () => {
    const r = runTool({ offer: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Offer is required/);
  });

  it("non-string offer errors", () => {
    const r = runTool({ offer: 9 as unknown as string });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Offer is required/);
  });

  it("non-string coverType errors", () => {
    const r = runTool({ offer: "free trial", coverType: 9 as unknown as string });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Cover type must be/);
  });

  it("offer is trimmed before insertion", () => {
    const r = generateCoverCopy("  free first haircut  ");
    for (const c of r.copy) {
      assert.ok(c.includes("free first haircut"));
      assert.ok(!c.includes("  free"));
    }
  });

  it("no leftover placeholders", () => {
    const r = runTool({ offer: "free trial", coverType: "page" });
    for (const c of r.values!.coverCopy as string[]) {
      assert.ok(!c.includes("{offer}"), c);
    }
  });

  it("notes clarify text copy only, no image design", () => {
    assert.ok(SAFE_ZONE_NOTES.page.includes("text copy only"));
    assert.ok(SAFE_ZONE_NOTES.group.includes("text copy only"));
  });

  it("deterministic: same inputs give identical outputs", () => {
    const a = runTool({ offer: "free trial", coverType: "group" });
    const b = runTool({ offer: "free trial", coverType: "group" });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts (coverCopy, safeZoneNote, count)", () => {
    const r = runTool({ offer: "free trial" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["count", "coverCopy", "safeZoneNote"]);
  });

  it("exported constants are consistent", () => {
    assert.deepEqual(COVER_TYPES, ["page", "group"]);
    assert.equal(DEFAULT_COVER_TYPE, "page");
    assert.equal(TEMPLATE_COUNT, 5);
    assert.equal(MAX_OFFER_WORDS, 8);
    assert.equal(MAX_COPY_WORDS, 12);
  });
});
