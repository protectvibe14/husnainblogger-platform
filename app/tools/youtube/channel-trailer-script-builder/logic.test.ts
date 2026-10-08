import { test } from "node:test";
import assert from "node:assert";
import { runTool, ALLOWED_DURATIONS, WPM, BEAT_SHARES } from "./logic.ts";

const OUTPUT_IDS = ["scripts", "wordBudgets", "count"];

function baseItem(overrides = {}) {
  return {
    niche: "budget travel",
    targetViewer: "busy parents",
    uploadSchedule: "every Tuesday and Friday",
    durationSec: "60",
    ...overrides,
  };
}

test("happy path: 60s trailer builds timed script", () => {
  const r = runTool({ items: [baseItem()] });
  assert.strictEqual(r.ok, true);
  const v = r.values!;
  assert.deepStrictEqual(Object.keys(v).sort(), OUTPUT_IDS.sort());
  assert.strictEqual(v.count, 1);
  const script = (v.scripts as string[])[0];
  assert.ok(script.includes("budget travel"));
  assert.ok(script.includes("busy parents"));
  assert.ok(script.includes("every Tuesday and Friday"));
  assert.ok(script.includes("[0:00–"));
  assert.ok((v.wordBudgets as string[])[0].includes("150 words budget"));
});

test("word budget: 30s = 75 words, 60s = 150 words at 150wpm", () => {
  const r30 = runTool({ items: [baseItem({ durationSec: "30" })] });
  assert.ok((r30.values!.wordBudgets as string[])[0].includes("75 words budget"));
  const r60 = runTool({ items: [baseItem({ durationSec: "60" })] });
  assert.ok((r60.values!.wordBudgets as string[])[0].includes("150 words budget"));
});

test("word budget: 45s = 113 words", () => {
  const r = runTool({ items: [baseItem({ durationSec: "45" })] });
  assert.strictEqual(r.ok, true);
  assert.ok((r.values!.wordBudgets as string[])[0].includes("113 words budget"));
});

test("WPM constant is 150", () => {
  assert.strictEqual(WPM, 150);
});

test("7 beats in every script, timestamps ascend", () => {
  const r = runTool({ items: [baseItem({ durationSec: "45" })] });
  const lines = (r.values!.scripts as string[])[0].split("\n");
  assert.strictEqual(lines.length, 7);
  for (const name of BEAT_SHARES.map((b) => b.name)) {
    assert.ok((r.values!.scripts as string[])[0].includes(name.split(" — ")[0]) || lines.length === 7);
  }
  assert.ok(lines[0].startsWith("[0:00–"));
  assert.ok(lines[6].includes("0:45]"));
});

test("all beats present: hook, what, who, why, proof, schedule, CTA", () => {
  const r = runTool({ items: [baseItem()] });
  const s = (r.values!.scripts as string[])[0];
  assert.ok(s.includes("I'm [Your Name]"));
  assert.ok(s.includes("practical budget travel content"));
  assert.ok(s.includes("made for busy parents"));
  assert.ok(s.includes("why subscribe") || s.includes("Subscribe if you want"));
  assert.ok(s.includes("[your viewers"));
  assert.ok(s.includes("every Tuesday and Friday"));
  assert.ok(s.includes("Hit subscribe"));
});

test("multiple items", () => {
  const r = runTool({
    items: [baseItem(), baseItem({ niche: "vegan cooking", durationSec: "30" })],
  });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.values!.count, 2);
  assert.ok((r.values!.scripts as string[])[1].includes("vegan cooking"));
});

test("validation: empty items", () => {
  const r = runTool({ items: [] });
  assert.strictEqual(r.ok, false);
});

test("validation: item 1 missing niche", () => {
  const r = runTool({ items: [{ targetViewer: "x", uploadSchedule: "y", durationSec: "60" }] });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.startsWith("Item 1:"));
  assert.ok(r.error!.includes("niche"));
});

test("validation: item 3 invalid -> 'Item 3:'", () => {
  const r = runTool({
    items: [baseItem(), baseItem({ niche: "n2" }), { niche: "n3" }],
  });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.startsWith("Item 3:"));
});

test("validation: missing targetViewer", () => {
  const r = runTool({ items: [baseItem({ targetViewer: "   " })] });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.includes("targetViewer"));
});

test("validation: missing uploadSchedule", () => {
  const r = runTool({ items: [baseItem({ uploadSchedule: "" })] });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.includes("uploadSchedule"));
});

test("validation: bad duration rejected", () => {
  const r = runTool({ items: [baseItem({ durationSec: "90" })] });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.includes("30, 45, 60"));
});

test("validation: non-numeric duration rejected", () => {
  const r = runTool({ items: [baseItem({ durationSec: "long" })] });
  assert.strictEqual(r.ok, false);
});

test("validation: more than 20 items", () => {
  const items = Array.from({ length: 21 }, (_, i) => baseItem({ niche: `n${i}` }));
  const r = runTool({ items });
  assert.strictEqual(r.ok, false);
});

test("validation: niche too long", () => {
  const r = runTool({ items: [baseItem({ niche: "n".repeat(81) })] });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.includes("80"));
});

test("validation: non-object item", () => {
  const r = runTool({ items: [null as unknown as Record<string, unknown>] });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.startsWith("Item 1:"));
});

test("wordBudgets label is template scaffold, not AI", () => {
  const r = runTool({ items: [baseItem()] });
  assert.ok((r.values!.wordBudgets as string[])[0].includes("not AI copywriting"));
});

test("determinism: run twice identical", () => {
  const a = runTool({ items: [baseItem(), baseItem({ niche: "n2" })] });
  const b = runTool({ items: [baseItem(), baseItem({ niche: "n2" })] });
  assert.deepStrictEqual(a, b);
});

test("allowed durations are exactly 30/45/60", () => {
  assert.deepStrictEqual([...ALLOWED_DURATIONS], [30, 45, 60]);
});
