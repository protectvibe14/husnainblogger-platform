import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  buildBlocks,
  combinedPool,
  NICHES,
  POST_TYPES,
  BANK_SIZES,
  MAX_BLOCK_SIZE,
} from "./logic.ts";

const goodItem = { niche: "fitness", postType: "reel", blockSize: 5 };

// --- happy path ------------------------------------------------------------

test("happy path: one item builds block + 2 alts", () => {
  const r = runTool({ items: [goodItem] });
  assert.equal(r.ok, true);
  const lines = r.values!.lines as string[];
  const alts = r.values!.alternates as string[];
  assert.equal(lines.length, 1);
  assert.equal(alts.length, 2);
  assert.equal(r.values!.count, 1);
  assert.deepEqual(r.values!.warnings, []);
  // main block has 5 tags
  assert.equal(lines[0].split(" ").length, 5);
  assert.ok(lines[0].startsWith("#reels"));
});

test("happy path: blockSize as string", () => {
  const r = runTool({ items: [{ niche: "food", postType: "photo", blockSize: "3" }] });
  assert.equal(r.ok, true);
  assert.equal((r.values!.lines as string[])[0].split(" ").length, 3);
});

test("happy path: multiple items", () => {
  const r = runTool({
    items: [
      { niche: "travel", postType: "carousel", blockSize: 2 },
      { niche: "finance", postType: "story", blockSize: 4 },
    ],
  });
  assert.equal(r.ok, true);
  assert.equal(r.values!.count, 2);
  assert.equal((r.values!.lines as string[]).length, 2);
  assert.equal((r.values!.alternates as string[]).length, 4);
});

test("happy path: tags are unique within a block", () => {
  const res = buildBlocks([{ niche: "pets", postType: "reel", blockSize: 5 }]);
  for (const tags of [res.blocks[0].block, ...res.blocks[0].altBlocks]) {
    const list = tags.split(" ");
    assert.equal(new Set(list).size, list.length, "duplicate tag in block");
  }
});

test("happy path: alt blocks differ from main block", () => {
  const res = buildBlocks([goodItem]);
  const [main, ...alts] = [res.blocks[0].block, ...res.blocks[0].altBlocks];
  for (const alt of alts) assert.notEqual(alt, main);
});

test("happy path: combined pool dedupes post-type + niche overlap", () => {
  const pool = combinedPool("photography", "photo");
  assert.equal(new Set(pool).size, pool.length);
  assert.ok(pool.length >= 24);
});

// --- validation errors -----------------------------------------------------

test("error: missing items", () => {
  const r = runTool({});
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("at least one item"));
});

test("error: empty items array", () => {
  const r = runTool({ items: [] });
  assert.equal(r.ok, false);
  assert.ok(r.error!.length > 0);
});

test("error: too many items", () => {
  const items = Array.from({ length: 11 }, () => ({ ...goodItem }));
  const r = runTool({ items });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("10"));
});

test("error: item missing niche", () => {
  const r = runTool({ items: [{ postType: "reel", blockSize: 3 }] });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("Item 1") && r.error!.includes("niche"));
});

test("error: unknown niche lists supported niches", () => {
  const r = runTool({ items: [{ niche: "quantum", postType: "reel", blockSize: 3 }] });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("quantum"));
  assert.ok(r.error!.includes("fitness"));
});

test("error: item missing postType", () => {
  const r = runTool({ items: [{ niche: "food", blockSize: 3 }] });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("postType"));
});

test("error: unknown postType", () => {
  const r = runTool({ items: [{ niche: "food", postType: "livestream", blockSize: 3 }] });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("livestream"));
  assert.ok(r.error!.includes("reel"));
});

test("error: missing blockSize", () => {
  const r = runTool({ items: [{ niche: "food", postType: "photo" }] });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("blockSize"));
});

test("error: blockSize 0", () => {
  const r = runTool({ items: [{ niche: "food", postType: "photo", blockSize: 0 }] });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("1"));
});

test("error: fractional blockSize", () => {
  const r = runTool({ items: [{ niche: "food", postType: "photo", blockSize: 2.5 }] });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("whole number"));
});

test("error: non-numeric blockSize", () => {
  const r = runTool({ items: [{ niche: "food", postType: "photo", blockSize: "big" }] });
  assert.equal(r.ok, false);
  assert.ok(r.error!.length > 0);
});

test("error: bad item index in message (item 2)", () => {
  const r = runTool({ items: [goodItem, { niche: "nope", postType: "reel", blockSize: 2 }] });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("Item 2"));
});

// --- edge cases ------------------------------------------------------------

test("edge: blockSize 8 clamps to 5 with a warning note", () => {
  const r = runTool({ items: [{ niche: "gaming", postType: "story", blockSize: 8 }] });
  assert.equal(r.ok, true);
  assert.equal((r.values!.lines as string[])[0].split(" ").length, MAX_BLOCK_SIZE);
  const warnings = r.values!.warnings as string[];
  assert.equal(warnings.length, 1);
  assert.ok(warnings[0].includes("clamped to 5"));
});

test("edge: niche matching is case/space insensitive", () => {
  const r = runTool({ items: [{ niche: "Real Estate", postType: "Reel", blockSize: 2 }] });
  assert.equal(r.ok, true);
  assert.equal(r.values!.count, 1);
  assert.ok((r.values!.lines as string[])[0].startsWith("#reels"), "postType normalized too");
});

test("edge: block never exceeds 5 tags even after clamping", () => {
  const res = buildBlocks([{ niche: "beauty", postType: "carousel", blockSize: 99 }]);
  assert.equal(res.blocks[0].block.split(" ").length, 5);
  assert.equal(res.blocks[0].blockSize, 5);
});

// --- bank bounds -----------------------------------------------------------

test("bank: 16 niches x 24 tags + 32 post-type tags", () => {
  assert.equal(NICHES.length, 16);
  assert.equal(POST_TYPES.length, 4);
  assert.equal(BANK_SIZES.nicheTagsTotal, 384);
  assert.equal(BANK_SIZES.postTypeTagsTotal, 32);
});

test("bank: every niche pool has 24 non-empty tags", () => {
  for (const niche of NICHES) {
    const pool = combinedPool(niche, "reel");
    assert.ok(pool.length >= 24, `${niche}: pool too small`);
    for (const t of pool) assert.ok(/^[a-z0-9]+$/.test(t), `${niche}: bad tag "${t}"`);
  }
});

// --- determinism + meta contract -------------------------------------------

test("determinism: same items twice -> identical outputs", () => {
  const args = { items: [{ niche: "wedding", postType: "carousel", blockSize: 4 }] };
  assert.deepEqual(runTool(args).values, runTool(args).values);
});

test("meta contract: output ids are lines, alternates, warnings, count", () => {
  const r = runTool({ items: [goodItem] });
  assert.ok(r.ok);
  assert.deepEqual(Object.keys(r.values!).sort(), ["alternates", "count", "lines", "warnings"]);
});
