/**
 * Tests for tool-362 Pinterest Fresh Pin Checklist logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  CHECKLIST_BANK,
  PIN_TYPES,
  TOTAL_CHECKLIST_ITEMS,
  FRESHNESS_DISCLAIMER,
} from "./logic.ts";

function expectShape(r: ReturnType<typeof runTool>) {
  assert.equal(r.ok, true);
  assert.ok(r.values);
  const v = r.values!;
  assert.ok(v.checklist.columns.includes("Checklist item"));
  assert.ok(v.checklist.columns.includes("Why it matters"));
  assert.equal(typeof v.itemCount, "number");
  assert.equal(typeof v.pinTypeUsed, "string");
  assert.equal(typeof v.disclaimer, "string");
  assert.equal(v.checklist.rows.length, v.itemCount);
  for (const row of v.checklist.rows) {
    assert.equal(row.length, 2);
    assert.ok(row[0].length > 10, "item too short");
    assert.ok(row[1].length > 10, "why too short");
  }
}

test("happy path default: no pinType -> standard checklist", () => {
  const r = runTool({});
  expectShape(r);
  assert.ok(r.values!.pinTypeUsed.includes("Standard"));
  assert.equal(r.values!.itemCount, CHECKLIST_BANK.standard.length);
});

test("standard pinType: 8 items about new image, unique title/desc, 2:3, keywords", () => {
  const r = runTool({ pinType: "standard" });
  expectShape(r);
  assert.equal(r.values!.itemCount, 8);
  const text = JSON.stringify(r.values!.checklist.rows).toLowerCase();
  assert.ok(text.includes("brand-new image"));
  assert.ok(text.includes("unique title"));
  assert.ok(text.includes("2:3"));
  assert.ok(text.includes("keyword"));
});

test("idea pinType: idea-specific items", () => {
  const r = runTool({ pinType: "idea" });
  expectShape(r);
  assert.ok(r.values!.pinTypeUsed.includes("Idea"));
  assert.equal(r.values!.itemCount, 8);
  const text = JSON.stringify(r.values!.checklist.rows).toLowerCase();
  assert.ok(text.includes("idea pin"));
  assert.ok(text.includes("9:16"));
});

test("video pinType: video-specific items", () => {
  const r = runTool({ pinType: "video" });
  expectShape(r);
  assert.ok(r.values!.pinTypeUsed.includes("Video"));
  assert.equal(r.values!.itemCount, 8);
  const text = JSON.stringify(r.values!.checklist.rows).toLowerCase();
  assert.ok(text.includes("video"));
  assert.ok(text.includes("hook"));
});

test("validation: invalid pinType -> error", () => {
  const r = runTool({ pinType: "carousel" });
  assert.equal(r.ok, false);
  assert.ok(r.error && /standard.*idea.*video|pin type/i.test(r.error));
});

test("validation: numeric pinType -> treated as missing, defaults to standard", () => {
  const r = runTool({ pinType: 42 });
  assert.equal(r.ok, true);
  assert.ok(r.values!.pinTypeUsed.includes("Standard"));
});

test("validation: blank string pinType defaults to standard", () => {
  const r = runTool({ pinType: "   " });
  assert.equal(r.ok, true);
  assert.ok(r.values!.pinTypeUsed.includes("Standard"));
});

test("pinType is case-insensitive", () => {
  const r = runTool({ pinType: "VIDEO" });
  assert.equal(r.ok, true);
  assert.ok(r.values!.pinTypeUsed.includes("Video"));
});

test("edge case: disclaimer disclaims guaranteed boost honestly", () => {
  const r = runTool({ pinType: "standard" });
  assert.equal(r.ok, true);
  assert.ok(/does not describe Pinterest's internal/i.test(r.values!.disclaimer));
  assert.ok(/does not\s+guarantee/i.test(r.values!.disclaimer));
  assert.equal(r.values!.disclaimer, FRESHNESS_DISCLAIMER);
});

test("edge case: banks differ per pinType", () => {
  const a = runTool({ pinType: "standard" }).values!.checklist.rows;
  const b = runTool({ pinType: "video" }).values!.checklist.rows;
  assert.notDeepEqual(a, b);
});

test("bank size documented: 3 banks x 8 = 24 items", () => {
  assert.deepEqual(PIN_TYPES, ["standard", "idea", "video"]);
  let total = 0;
  for (const t of PIN_TYPES) total += CHECKLIST_BANK[t].length;
  assert.equal(total, TOTAL_CHECKLIST_ITEMS);
  assert.equal(total, 24);
});

test("determinism: same inputs twice give identical outputs", () => {
  const a = runTool({ pinType: "idea" });
  const b = runTool({ pinType: "idea" });
  assert.deepEqual(a, b);
});

test("no lorem / no empty items in bank", () => {
  for (const t of PIN_TYPES) {
    for (const it of CHECKLIST_BANK[t]) {
      assert.ok(!/lorem/i.test(it.item + it.why));
      assert.ok(it.item.trim().length > 0 && it.why.trim().length > 0);
    }
  }
});

test("output ids match meta.ts: checklist, itemCount, pinTypeUsed, disclaimer", () => {
  const r = runTool({});
  assert.equal(r.ok, true);
  const keys = Object.keys(r.values!).sort();
  assert.deepEqual(keys, ["checklist", "disclaimer", "itemCount", "pinTypeUsed"]);
});

test("every bank item mentions a concrete action", () => {
  for (const t of PIN_TYPES) {
    for (const it of CHECKLIST_BANK[t]) {
      assert.ok(it.item.length >= 12, `vague item: ${it.item}`);
      assert.ok(it.why.length >= 20, `thin why: ${it.item}`);
    }
  }
});
