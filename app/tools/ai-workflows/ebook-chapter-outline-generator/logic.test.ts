import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  truncateTitle,
  MIN_CHAPTERS,
  MAX_CHAPTERS,
  MAX_TITLE_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const base = {
  workingTitle: "Email Marketing for Freelancers",
  chapterCount: 5,
  targetReader: "busy coaches",
};

describe("ebook-chapter-outline-generator", () => {
  it("happy path (5 chapters): outline has 5 numbered entries", () => {
    const r = runTool({ ...base });
    assert.equal(r.ok, true);
    const outline = r.values!.outline as string[];
    assert.equal(outline.length, 5);
    outline.forEach((item, i) => {
      assert.match(item, new RegExp(`^Chapter ${i + 1}:`));
    });
  });

  it("happy path: first chapter is the opening overview, last is the closing action plan", () => {
    const r = runTool({ ...base });
    const outline = r.values!.outline as string[];
    assert.match(outline[0], /Quick-Start Overview/);
    assert.match(outline[4], /Action Plan — Next 30 Days/);
  });

  it("happy path: each chapter carries exactly 3 beat slots", () => {
    const r = runTool({ ...base });
    const outline = r.values!.outline as string[];
    for (const item of outline) {
      const beats = item.split("\n").filter((l) => l.startsWith("• Beat —"));
      assert.equal(beats.length, 3);
    }
  });

  it("happy path: target reader appears in the beats", () => {
    const r = runTool({ ...base });
    const outline = r.values!.outline as string[];
    assert.ok(outline.join("\n").includes("busy coaches"));
  });

  it("min chapters (3): 1 opening + 1 body + 1 closing", () => {
    const r = runTool({ ...base, chapterCount: 3 });
    assert.equal(r.ok, true);
    assert.equal((r.values!.outline as string[]).length, 3);
  });

  it("max chapters (30): accepted, 30 entries", () => {
    const r = runTool({ ...base, chapterCount: 30 });
    assert.equal(r.ok, true);
    assert.equal((r.values!.outline as string[]).length, 30);
  });

  it("chapterCount 2: rejected with bounds message", () => {
    const r = runTool({ ...base, chapterCount: 2 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 3 and 30/);
  });

  it("chapterCount 31: rejected with bounds message", () => {
    const r = runTool({ ...base, chapterCount: 31 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 3 and 30/);
  });

  it("chapterCount non-integer (4.5): rejected", () => {
    const r = runTool({ ...base, chapterCount: 4.5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it('chapterCount non-numeric ("abc"): rejected', () => {
    const r = runTool({ ...base, chapterCount: "abc" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("chapterCount as numeric string ('7'): accepted", () => {
    const r = runTool({ ...base, chapterCount: "7" });
    assert.equal(r.ok, true);
    assert.equal((r.values!.outline as string[]).length, 7);
  });

  it("missing workingTitle: rejected with human message", () => {
    const r = runTool({ chapterCount: 5, targetReader: "coaches" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /working title/);
  });

  it("blank workingTitle: rejected", () => {
    const r = runTool({ ...base, workingTitle: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /working title/);
  });

  it("very long title: truncated at 80 chars in chapter titles", () => {
    const longTitle = "A".repeat(50) + " " + "B".repeat(60);
    const r = runTool({ ...base, workingTitle: longTitle });
    assert.equal(r.ok, true);
    const outline = r.values!.outline as string[];
    assert.ok(outline[0].includes("…"));
    assert.ok(!outline[0].split("\n")[0].includes(longTitle));
    assert.equal(truncateTitle(longTitle).length <= MAX_TITLE_CHARS, true);
  });

  it("short title: not truncated", () => {
    assert.equal(truncateTitle("My Ebook"), "My Ebook");
  });

  it("targetReader omitted: falls back to 'your readers'", () => {
    const r = runTool({ workingTitle: "My Ebook", chapterCount: 4 });
    assert.equal(r.ok, true);
    assert.ok((r.values!.outline as string[]).join("\n").includes("your readers"));
  });

  it("determinism: same inputs produce identical output", () => {
    const a = runTool({ ...base });
    const b = runTool({ ...base });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs ids", () => {
    const r = runTool({ ...base });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), outputs.map((o) => o.id).sort());
  });

  it("body chapter titles rotate (no two adjacent body chapters identical)", () => {
    const r = runTool({ ...base, chapterCount: 8 });
    const outline = r.values!.outline as string[];
    const bodyTitles = outline.slice(1, 7).map((s) => s.split("\n")[0]);
    for (let i = 1; i < bodyTitles.length; i++) {
      assert.notEqual(bodyTitles[i], bodyTitles[i - 1]);
    }
  });

  it("non-object input: rejected", () => {
    const r = runTool("nope" as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.match(r.error!, /object/);
  });

  it("constants honor spec bounds", () => {
    assert.equal(MIN_CHAPTERS, 3);
    assert.equal(MAX_CHAPTERS, 30);
    assert.equal(MAX_TITLE_CHARS, 80);
  });
});
