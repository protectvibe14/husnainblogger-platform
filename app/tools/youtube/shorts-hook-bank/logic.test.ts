import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  generateHooks,
  HOOK_STYLES,
  STYLE_LABELS,
  BANK_SIZES,
  TEMPLATES_PER_STYLE,
  MAX_HOOKS,
  DEFAULT_COUNT,
} from "./logic.ts";

const BASE = { topic: "sourdough starter", style: "question", count: 5 };

// ---------- happy path ----------

test("happy path: generates N hooks for topic + style", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  const hooks = r.values!.hooks as string[];
  assert.equal(hooks.length, 5);
  assert.equal(r.values!.count, 5);
  for (const h of hooks) {
    assert.ok(h.includes("sourdough starter"));
    assert.ok(!h.includes("{topic}"));
    assert.ok(h.includes("[template: question #"));
  }
});

test("happy path: all four styles produce hooks with attribution", () => {
  for (const style of HOOK_STYLES) {
    const r = runTool({ topic: "fitness", style, count: 3 });
    assert.equal(r.ok, true, `style ${style}`);
    const hooks = r.values!.hooks as string[];
    assert.equal(hooks.length, 3);
    assert.ok(hooks[0].includes(`[template: ${style} #1]`));
  }
});

test("happy path: topic is trimmed", () => {
  const r = runTool({ ...BASE, topic: "  meal prep  " });
  assert.equal(r.ok, true);
  assert.ok((r.values!.hooks as string[])[0].includes("meal prep"));
});

test("happy path: count omitted -> DEFAULT_COUNT hooks", () => {
  const r = runTool({ topic: "x", style: "visual" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.count, DEFAULT_COUNT);
});

test("happy path: note states template library, not AI", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  const note = String(r.values!.note);
  assert.ok(note.includes("Template library, not AI"));
  assert.ok(note.includes("40 hand-written templates"));
});

// ---------- validation errors ----------

test("validation: empty topic fails", () => {
  const r = runTool({ ...BASE, topic: "   " });
  assert.equal(r.ok, false);
  assert.match(String(r.error), /topic/i);
});

test("validation: missing topic fails", () => {
  const r = runTool({ style: "question", count: 5 });
  assert.equal(r.ok, false);
  assert.equal(r.values, undefined);
});

test("validation: unknown style fails and lists valid styles", () => {
  const r = runTool({ ...BASE, style: "funny" });
  assert.equal(r.ok, false);
  assert.ok(String(r.error).includes("question"));
  assert.ok(String(r.error).includes("loop"));
});

test("validation: missing style fails", () => {
  const r = runTool({ topic: "x", count: 5 });
  assert.equal(r.ok, false);
});

test("validation: count of 0 fails", () => {
  const r = runTool({ ...BASE, count: 0 });
  assert.equal(r.ok, false);
  assert.match(String(r.error), /at least 1/);
});

// ---------- edge cases ----------

test("edge: count above MAX_HOOKS is capped", () => {
  const r = runTool({ ...BASE, count: 999 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.count, MAX_HOOKS);
  assert.ok(String(r.values!.note).includes("capped"));
});

test("edge: count above bank size cycles templates deterministically", () => {
  const a = runTool({ ...BASE, count: 12 });
  const b = runTool({ ...BASE, count: 12 });
  assert.equal(a.ok, true);
  assert.deepEqual(a.values!.hooks, b.values!.hooks);
  const hooks = a.values!.hooks as string[];
  assert.ok(hooks[0].includes("[template: question #1]"));
  assert.ok(hooks[10].includes("[template: question #1]"));
  assert.ok(String(a.values!.note).includes("cycled"));
});

test("edge: count of 1 returns a single hook", () => {
  const r = runTool({ ...BASE, count: 1 });
  assert.equal(r.ok, true);
  assert.equal((r.values!.hooks as string[]).length, 1);
});

test("edge: unicode topic inserted verbatim", () => {
  const r = runTool({ topic: "寿司の作り方 🍣", style: "curiosity" as never, count: 2 });
  // 'curiosity' is not a valid style in this spec -> must fail, not crash
  assert.equal(r.ok, false);
  const r2 = runTool({ topic: "寿司の作り方 🍣", style: "loop", count: 2 });
  assert.equal(r2.ok, true);
  assert.ok((r2.values!.hooks as string[])[0].includes("寿司の作り方 🍣"));
});

// ---------- determinism / contract ----------

test("determinism: same inputs -> identical output", () => {
  const a = runTool(BASE);
  const b = runTool(BASE);
  assert.deepEqual(a, b);
});

test("output ids match meta.ts outputs (hooks, count, note)", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  assert.deepEqual(Object.keys(r.values!).sort(), ["count", "hooks", "note"]);
});

test("bank constants: 4 styles x 10 templates = 40 total", () => {
  assert.deepEqual([...HOOK_STYLES], [
    "question",
    "bold-claim",
    "visual",
    "loop",
  ]);
  let total = 0;
  for (const s of HOOK_STYLES) {
    assert.equal(BANK_SIZES[s], TEMPLATES_PER_STYLE);
    total += BANK_SIZES[s];
  }
  assert.equal(total, 40);
  assert.equal(MAX_HOOKS, 40);
});

test("style labels exist for all styles", () => {
  for (const s of HOOK_STYLES) {
    assert.ok(STYLE_LABELS[s].length > 0);
  }
});

test("generateHooks: no {topic} placeholder leaks", () => {
  for (const style of HOOK_STYLES) {
    const { hooks } = generateHooks("y", style, TEMPLATES_PER_STYLE);
    for (const h of hooks) {
      assert.ok(!h.line.includes("{topic}"));
      assert.ok(h.line.includes("y"));
    }
  }
});
