import { test } from "node:test";
import assert from "node:assert";
import { runTool } from "./logic.ts";

// Expected output ids (must match meta.ts outputs).
const OUTPUT_IDS = ["presets", "copyBlocks", "guides", "honestyNotes", "count"];

function baseItem(overrides = {}) {
  return {
    name: "Weekly tutorial",
    titleSuffix: "| Tech Tips",
    descriptionFooter: "Subscribe for more tech tips every Tuesday.",
    defaultTags: "tech tips, tutorial, how to",
    visibility: "public",
    playlist: "Tutorials",
    ...overrides,
  };
}

test("happy path: single preset builds all outputs", () => {
  const r = runTool({ items: [baseItem()] });
  assert.strictEqual(r.ok, true);
  assert.ok(r.values);
  const v = r.values!;
  assert.deepStrictEqual(Object.keys(v).sort(), OUTPUT_IDS.sort());
  assert.strictEqual((v.presets as string[]).length, 1);
  assert.strictEqual((v.copyBlocks as string[]).length, 1);
  assert.strictEqual((v.guides as string[]).length, 6);
  assert.strictEqual(v.count, 1);
  assert.ok((v.presets as string[])[0].includes('Preset "Weekly tutorial"'));
  assert.ok((v.copyBlocks as string[])[0].includes("| Tech Tips"));
  assert.ok((v.copyBlocks as string[])[0].includes("tech tips, tutorial, how to"));
  assert.ok((v.copyBlocks as string[])[0].includes("public"));
  assert.ok((v.copyBlocks as string[])[0].includes("Tutorials"));
});

test("happy path: multiple presets", () => {
  const r = runTool({
    items: [baseItem(), baseItem({ name: "Shorts" }), baseItem({ name: "Vlog" })],
  });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.values!.count, 3);
  assert.strictEqual((r.values!.presets as string[]).length, 3);
});

test("defaults visibility to unlisted when omitted", () => {
  const r = runTool({ items: [baseItem({ visibility: undefined })] });
  assert.strictEqual(r.ok, true);
  assert.ok((r.values!.copyBlocks as string[])[0].includes("unlisted"));
});

test("minimal item: name only", () => {
  const r = runTool({ items: [{ name: "Bare" }] });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.values!.count, 1);
  const block = (r.values!.copyBlocks as string[])[0];
  assert.ok(block.includes("(none — no suffix set)"));
  assert.ok(block.includes("(none — no tags set)"));
});

test("validation: empty items array", () => {
  const r = runTool({ items: [] });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error);
});

test("validation: items not an array", () => {
  const r = runTool({ items: undefined as unknown as Record<string, unknown>[] });
  assert.strictEqual(r.ok, false);
});

test("validation: more than 20 presets", () => {
  const items = Array.from({ length: 21 }, (_, i) =>
    baseItem({ name: `P${i}` })
  );
  const r = runTool({ items });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.includes("20"));
});

test("validation: item 1 missing name", () => {
  const r = runTool({ items: [{ titleSuffix: "| x" }] });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.startsWith("Item 1:"));
});

test("validation: item 2 invalid -> 'Item 2:' prefix", () => {
  const r = runTool({
    items: [baseItem(), { name: "   " }],
  });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.startsWith("Item 2:"));
});

test("validation: invalid visibility value", () => {
  const r = runTool({ items: [baseItem({ visibility: "friends-only" })] });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.includes("visibility"));
});

test("validation: tags total over 500 chars rejected", () => {
  const longTags = Array.from({ length: 50 }, (_, i) => `tag${i}abcdef`).join(
    ", "
  );
  assert.ok(longTags.length > 500);
  const r = runTool({ items: [baseItem({ defaultTags: longTags })] });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.includes("500"));
});

test("validation: tags exactly at 500 chars accepted", () => {
  const parts = Array.from({ length: 8 }, () => "a".repeat(60));
  parts.push("b".repeat(4)); // 8*60 + 4 + 8*2 (separators) = 500
  const tags = parts.join(", ");
  assert.strictEqual(tags.length, 500);
  const r = runTool({ items: [baseItem({ defaultTags: tags })] });
  assert.strictEqual(r.ok, true);
});

test("validation: single tag over 60 chars rejected", () => {
  const r = runTool({
    items: [baseItem({ defaultTags: "x".repeat(61) })],
  });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.includes("60"));
});

test("validation: name over 120 chars rejected", () => {
  const r = runTool({ items: [baseItem({ name: "n".repeat(121) })] });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.includes("120"));
});

test("validation: non-object item rejected", () => {
  const r = runTool({ items: ["oops" as unknown as Record<string, unknown>] });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.startsWith("Item 1:"));
});

test("edge: tag list trims blanks and collapses whitespace", () => {
  const r = runTool({
    items: [baseItem({ defaultTags: "  tech , , tutorial ,,  " })],
  });
  assert.strictEqual(r.ok, true);
  assert.ok((r.values!.copyBlocks as string[])[0].includes("tech, tutorial"));
  assert.ok((r.values!.presets as string[])[0].includes("2 tags"));
});

test("honesty notes mention copy-paste only, no API claims", () => {
  const r = runTool({ items: [baseItem()] });
  const notes = r.values!.honestyNotes as string[];
  const joined = notes.join(" ").toLowerCase();
  assert.ok(joined.includes("copy-paste"));
  assert.ok(!joined.toLowerCase().includes("api writes"));
  assert.ok(!joined.toLowerCase().includes("automatically applied"));
});

test("determinism: two runs produce identical output", () => {
  const items = [baseItem(), baseItem({ name: "Second" })];
  const a = runTool({ items });
  const b = runTool({ items });
  assert.deepStrictEqual(a, b);
});
