import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  planGrid,
  estimateDataUrlBytes,
  GRID_SIZE,
  SLOT_COUNT,
  MAX_CAPTION_LENGTH,
  LOCAL_STORAGE_QUOTA_BYTES,
} from "./logic.ts";

const B64 = "data:image/png;base64,";
const samplePost = (slot: number, captionDraft = "Hello") => ({
  slot,
  imageRef: "",
  captionDraft,
});

describe("profile-grid-planner", () => {
  it("happy path: 3 posts plan into correct grid cells", () => {
    const r = runTool({
      plannedPosts: JSON.stringify([samplePost(0), samplePost(4, "Mid"), samplePost(8, "End")]),
    });
    assert.equal(r.ok, true);
    const grid = r.values!.gridPreview as { columns: string[]; rows: string[][] };
    assert.deepEqual(grid.columns, ["Slot", "Row", "Col", "Image", "Caption"]);
    assert.equal(grid.rows.length, 9);
    // slot 0 -> row 1 col 1 ; slot 4 -> row 2 col 2 ; slot 8 -> row 3 col 3
    assert.deepEqual(grid.rows[0].slice(0, 3), ["1", "1", "1"]);
    assert.deepEqual(grid.rows[4].slice(0, 3), ["5", "2", "2"]);
    assert.deepEqual(grid.rows[8].slice(0, 3), ["9", "3", "3"]);
    assert.match(r.values!.summary as string, /3\/9 slots filled/);
  });

  it("output ids are gridPreview, reorderState, summary", () => {
    const r = runTool({ plannedPosts: "[]" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["gridPreview", "reorderState", "summary"]);
  });

  it("empty array is valid: all placeholders, balance note mentions no posts", () => {
    const r = runTool({ plannedPosts: "[]" });
    assert.equal(r.ok, true);
    const grid = r.values!.gridPreview as { rows: string[][] };
    for (const row of grid.rows) assert.equal(row[3], "Placeholder");
    assert.match(r.values!.summary as string, /No posts yet/);
  });

  it("accepts a native array value (not only a JSON string)", () => {
    const r = runTool({ plannedPosts: [samplePost(2, "Two")] });
    assert.equal(r.ok, true);
    const grid = r.values!.gridPreview as { rows: string[][] };
    assert.equal(grid.rows[2][4], "Two");
  });

  it("missing plannedPosts -> error", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.match(r.error!, /required/i);
  });

  it("invalid JSON -> error", () => {
    const r = runTool({ plannedPosts: "{oops" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /valid JSON/);
  });

  it("non-array JSON -> error", () => {
    const r = runTool({ plannedPosts: '{"slot": 0}' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /array/);
  });

  it("slot 9 out of range -> error", () => {
    const r = runTool({ plannedPosts: JSON.stringify([samplePost(9)]) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /0 to 8/);
  });

  it("negative slot -> error", () => {
    const r = runTool({ plannedPosts: JSON.stringify([samplePost(-1)]) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /0 to 8/);
  });

  it("duplicate slot -> error naming the slot", () => {
    const r = runTool({ plannedPosts: JSON.stringify([samplePost(3), samplePost(3)]) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /twice/);
  });

  it("non-object item -> error with item number", () => {
    const r = runTool({ plannedPosts: JSON.stringify(["nope"]) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1/);
  });

  it("invalid imageRef -> error mentioning dataURL", () => {
    const r = runTool({
      plannedPosts: JSON.stringify([{ slot: 0, imageRef: "https://example.com/x.png", captionDraft: "" }]),
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /dataURL/);
  });

  it("valid image dataURL passes and counts bytes", () => {
    const imageRef = B64 + "a".repeat(100);
    const bytes = estimateDataUrlBytes(imageRef);
    assert.ok(bytes > 0);
    const r = runTool({ plannedPosts: JSON.stringify([{ slot: 0, imageRef, captionDraft: "" }]) });
    assert.equal(r.ok, true);
    const grid = r.values!.gridPreview as { rows: string[][] };
    assert.equal(grid.rows[0][3], "Image");
    assert.match(r.values!.summary as string, /storage/i);
  });

  it("caption over 2200 chars -> error", () => {
    const r = runTool({ plannedPosts: JSON.stringify([samplePost(0, "x".repeat(MAX_CAPTION_LENGTH + 1))]) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /2200/);
  });

  it("huge image data triggers the localStorage full warning", () => {
    // base64 decodes to ~3/4 of its length, so we need > quota*4/3 chars
    const big = B64 + "a".repeat(Math.ceil((LOCAL_STORAGE_QUOTA_BYTES * 4) / 3) + 1000);
    const r = runTool({ plannedPosts: JSON.stringify([{ slot: 0, imageRef: big, captionDraft: "" }]) });
    assert.equal(r.ok, true);
    assert.match(r.values!.summary as string, /in memory only/i);
  });

  it("row completion notes are deterministic suggestions", () => {
    const posts = [samplePost(0), samplePost(1)]; // row 1 has 2 of 3
    const res = planGrid(posts.map((p) => ({ ...p, slot: p.slot, imageRef: p.imageRef, captionDraft: p.captionDraft })));
    assert.equal(res.rowsComplete, 0);
    assert.ok(res.balanceNotes.some((n) => n.includes("Row 1 has one empty slot")));
  });

  it("deterministic: same input twice -> identical output", () => {
    const input = { plannedPosts: JSON.stringify([samplePost(0, "A"), samplePost(5, "B")]) };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepEqual(a, b);
  });

  it("reorderState is valid JSON with 9 cells", () => {
    const r = runTool({ plannedPosts: JSON.stringify([samplePost(7)]) });
    assert.equal(r.ok, true);
    const state = JSON.parse(r.values!.reorderState as string) as { slot: number }[];
    assert.equal(state.length, 9);
    assert.deepEqual(
      state.map((c) => c.slot),
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
    );
  });

  it("long caption is preview-truncated in the grid table", () => {
    const r = runTool({ plannedPosts: JSON.stringify([samplePost(1, "x".repeat(100))]) });
    assert.equal(r.ok, true);
    const grid = r.values!.gridPreview as { rows: string[][] };
    assert.ok(grid.rows[1][4].endsWith("..."));
    assert.ok(grid.rows[1][4].length < 45);
  });

  it("GRID_SIZE and SLOT_COUNT constants are 3 and 9", () => {
    assert.equal(GRID_SIZE, 3);
    assert.equal(SLOT_COUNT, 9);
  });
});
