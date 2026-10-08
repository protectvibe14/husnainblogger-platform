import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  buildPack,
  normalizeStreamType,
  STREAM_TYPES,
  TYPE_LABELS,
  MAX_TITLE_CHARS,
} from "./logic.ts";

const QA_ITEM = { topic: "sourdough starter mistakes", streamType: "Q&A" };

// ---------- happy path ----------

test("happy path: one Q&A item builds 6 titles + 1 description", () => {
  const r = runTool({ items: [QA_ITEM] });
  assert.equal(r.ok, true);
  const titles = r.values!.titles as string[];
  const descriptions = r.values!.descriptions as string[];
  assert.equal(r.values!.count, 1);
  assert.equal(titles.filter((t) => t.startsWith("[Announcement]")).length, 2);
  assert.equal(titles.filter((t) => t.startsWith("[Live]")).length, 2);
  assert.equal(titles.filter((t) => t.startsWith("[Replay]")).length, 2);
  assert.equal(descriptions.length, 2); // header + snippet
  assert.ok(descriptions[1].includes("sourdough starter mistakes"));
  assert.ok(descriptions[1].includes("#qa"));
});

test("happy path: all stream types produce labeled packs", () => {
  for (const t of STREAM_TYPES) {
    const r = runTool({ items: [{ topic: "x", streamType: t }] });
    assert.equal(r.ok, true, t);
    const titles = r.values!.titles as string[];
    assert.ok(titles.some((x) => x.includes(TYPE_LABELS[t])), t);
  }
});

test("happy path: type matching is case-insensitive with aliases", () => {
  assert.equal(normalizeStreamType("Gaming"), "gaming");
  assert.equal(normalizeStreamType("  Q AND A "), "q&a");
  assert.equal(normalizeStreamType("how to"), "tutorial");
  assert.equal(normalizeStreamType("PODCAST"), "talk");
  const r = runTool({ items: [{ topic: "x", streamType: "Gaming" }] });
  assert.equal(r.ok, true);
});

test("happy path: multiple items compose in order", () => {
  const r = runTool({
    items: [QA_ITEM, { topic: "elden ring boss rush", streamType: "gaming" }],
  });
  assert.equal(r.ok, true);
  assert.equal(r.values!.count, 2);
  const titles = r.values!.titles as string[];
  assert.ok(titles[0].includes("sourdough starter mistakes"));
  const secondHeader = titles.findIndex((t) => t.includes("elden ring boss rush"));
  assert.ok(secondHeader > 0);
});

test("happy path: description snippet has expect-line per type", () => {
  const r = runTool({ items: [{ topic: "x", streamType: "tutorial" }] });
  assert.equal(r.ok, true);
  const descriptions = r.values!.descriptions as string[];
  assert.ok(descriptions[1].includes("step-by-step walkthrough"));
  assert.ok(descriptions[1].includes("#tutorial"));
});

// ---------- validation errors ----------

test("validation: empty items array fails", () => {
  const r = runTool({ items: [] });
  assert.equal(r.ok, false);
  assert.match(String(r.error), /at least one/i);
});

test("validation: missing items fails", () => {
  const r = runTool({} as never);
  assert.equal(r.ok, false);
});

test("validation: empty topic fails with item number", () => {
  const r = runTool({ items: [{ topic: "   ", streamType: "talk" }] });
  assert.equal(r.ok, false);
  assert.ok(String(r.error).startsWith("Item 1:"));
  assert.match(String(r.error), /topic/i);
});

test("validation: unknown stream type fails with item number", () => {
  const r = runTool({ items: [{ topic: "x", streamType: "cooking-show" }] });
  assert.equal(r.ok, false);
  assert.ok(String(r.error).startsWith("Item 1:"));
  assert.ok(String(r.error).includes("Q&A"));
});

test("validation: second bad item reports 'Item 2'", () => {
  const r = runTool({
    items: [QA_ITEM, { topic: "x", streamType: "nope" }],
  });
  assert.equal(r.ok, false);
  assert.ok(String(r.error).startsWith("Item 2:"));
});

test("validation: topic so long titles exceed 100 chars fails", () => {
  const longTopic = "a".repeat(90);
  const r = runTool({ items: [{ topic: longTopic, streamType: "talk" }] });
  assert.equal(r.ok, false);
  assert.ok(String(r.error).startsWith("Item 1:"));
  assert.match(String(r.error), /too long/i);
});

// ---------- edge cases ----------

test("edge: unicode topic inserted verbatim", () => {
  const r = runTool({ items: [{ topic: "寿司の作り方 🍣", streamType: "talk" }] });
  assert.equal(r.ok, true);
  const titles = r.values!.titles as string[];
  assert.ok(titles.some((t) => t.includes("寿司の作り方 🍣")));
});

test("edge: topic trimmed before packing", () => {
  const r = runTool({ items: [{ topic: "  padded topic  ", streamType: "talk" }] });
  assert.equal(r.ok, true);
  const titles = r.values!.titles as string[];
  assert.ok(titles.some((t) => t.includes("padded topic")));
  assert.ok(!titles.some((t) => t.includes("  padded")));
});

test("edge: all generated titles respect the 100-char limit", () => {
  const r = runTool({
    items: [
      { topic: "a".repeat(35), streamType: "q&a" },
      { topic: "b".repeat(35), streamType: "gaming" },
      { topic: "c".repeat(35), streamType: "talk" },
      { topic: "d".repeat(35), streamType: "tutorial" },
    ],
  });
  assert.equal(r.ok, true);
  for (const t of r.values!.titles as string[]) {
    if (t.startsWith("[")) {
      assert.ok([...t].length <= MAX_TITLE_CHARS, t);
    }
  }
});

// ---------- determinism / contract ----------

test("determinism: same items -> identical output", () => {
  const args = { items: [QA_ITEM, { topic: "y", streamType: "gaming" }] };
  const a = runTool(args);
  const b = runTool(args);
  assert.deepEqual(a, b);
});

test("output ids match meta.ts outputs (titles, descriptions, count)", () => {
  const r = runTool({ items: [QA_ITEM] });
  assert.equal(r.ok, true);
  assert.deepEqual(Object.keys(r.values!).sort(), ["count", "descriptions", "titles"]);
});

test("buildPack: 6 titles, 1 description, no placeholders leak", () => {
  const pack = buildPack("my topic", "gaming");
  assert.equal(pack.titles.length, 6);
  assert.ok(!pack.titles.some((t) => t.includes("{topic}")));
  assert.ok(!pack.description.includes("{topic}"));
  assert.ok(pack.description.includes("my topic"));
});

test("normalizeStreamType: null for unknown/non-string", () => {
  assert.equal(normalizeStreamType("karaoke"), null);
  assert.equal(normalizeStreamType(""), null);
  assert.equal(normalizeStreamType(42), null);
});

test("constants: 4 stream types, 100-char title limit", () => {
  assert.equal(STREAM_TYPES.length, 4);
  assert.equal(MAX_TITLE_CHARS, 100);
  assert.equal(Object.keys(TYPE_LABELS).length, 4);
});
