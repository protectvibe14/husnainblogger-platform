import { test } from "node:test";
import assert from "node:assert";
import { runTool, pickCombos, VIBES, BANK_SIZES, COMBOS_PER_VIBE } from "./logic.ts";

// --- happy path ------------------------------------------------------------

test("happy path: cute vibe, count 5", () => {
  const r = runTool({ vibe: "cute", count: 5 });
  assert.equal(r.ok, true);
  const combos = r.values!.combos as string[];
  assert.equal(combos.length, 5);
  for (const c of combos) assert.ok(c.length > 0);
});

test("happy path: count 1", () => {
  const r = runTool({ vibe: "dark", count: 1 });
  assert.equal(r.ok, true);
  assert.equal((r.values!.combos as string[]).length, 1);
});

test("happy path: count 10", () => {
  const r = runTool({ vibe: "y2k", count: 10 });
  assert.equal(r.ok, true);
  assert.equal((r.values!.combos as string[]).length, 10);
});

test("happy path: count as string", () => {
  const r = runTool({ vibe: "beach", count: "3" });
  assert.equal(r.ok, true);
  assert.equal((r.values!.combos as string[]).length, 3);
});

test("happy path: vibe case-insensitive", () => {
  const r = runTool({ vibe: "CUTE", count: 2 });
  assert.equal(r.ok, true);
  assert.equal((r.values!.combos as string[]).length, 2);
});

test("happy path: copyAll joins combos with newlines", () => {
  const r = runTool({ vibe: "minimal", count: 3 });
  assert.equal(r.ok, true);
  const combos = r.values!.combos as string[];
  assert.equal(r.values!.copyAll, combos.join("\n"));
});

// --- validation errors -----------------------------------------------------

test("error: missing vibe", () => {
  const r = runTool({ count: 5 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("vibe"));
});

test("error: empty vibe", () => {
  const r = runTool({ vibe: "  ", count: 5 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.length > 0);
});

test("error: unknown vibe", () => {
  const r = runTool({ vibe: "spooky", count: 5 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("spooky"));
  assert.ok(r.error!.includes("cute")); // lists valid vibes
});

test("error: missing count", () => {
  const r = runTool({ vibe: "cute" });
  assert.equal(r.ok, false);
  assert.ok(r.error!.length > 0);
});

test("error: count 0", () => {
  const r = runTool({ vibe: "cute", count: 0 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("1"));
});

test("error: count 11", () => {
  const r = runTool({ vibe: "cute", count: 11 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("10"));
});

test("error: fractional count", () => {
  const r = runTool({ vibe: "cute", count: 2.5 });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("whole number"));
});

test("error: non-numeric count", () => {
  const r = runTool({ vibe: "cute", count: "many" });
  assert.equal(r.ok, false);
  assert.ok(r.error!.length > 0);
});

// --- word-bank bounds ------------------------------------------------------

test("bank: 10 vibes x 12 combos = 120 combos", () => {
  assert.equal(VIBES.length, 10);
  assert.equal(COMBOS_PER_VIBE, 12);
  assert.equal(BANK_SIZES.totalCombos, 120);
});

test("bank: every vibe returns 12 non-empty combos via pickCombos", () => {
  for (const vibe of VIBES) {
    const res = pickCombos(vibe, 10);
    assert.equal(res.combos.length, 10);
    for (const c of res.combos) assert.ok(c.trim().length > 0, `${vibe}: empty combo`);
  }
});

test("bank: no duplicate combos within a vibe", () => {
  for (const vibe of VIBES) {
    const res = pickCombos(vibe, 10);
    assert.equal(new Set(res.combos).size, 10, `${vibe}: duplicates`);
  }
});

test("bank: picks are first-N in order (count 4 is prefix of count 7)", () => {
  const a = (runTool({ vibe: "nature", count: 4 }).values!.combos as string[]);
  const b = (runTool({ vibe: "nature", count: 7 }).values!.combos as string[]);
  assert.deepEqual(b.slice(0, 4), a);
});

// --- determinism + meta contract -------------------------------------------

test("determinism: same inputs twice -> identical outputs", () => {
  const v = { vibe: "luxury", count: 6 };
  assert.deepEqual(runTool(v).values, runTool(v).values);
});

test("meta contract: output ids are combos + copyAll", () => {
  const r = runTool({ vibe: "soft", count: 2 });
  assert.ok(r.ok);
  assert.deepEqual(Object.keys(r.values!).sort(), ["combos", "copyAll"]);
});
