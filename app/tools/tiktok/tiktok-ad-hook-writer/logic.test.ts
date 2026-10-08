import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, ANGLES, HOOK_BANKS } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = { productName: "LED sunset lamp", angle: "problem" };

function okValues(overrides: Record<string, unknown> = {}) {
  const r = runTool({ ...BASE, ...overrides });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

function hooksOf(v: Record<string, unknown>): string[] {
  return v.adHooks as string[];
}

describe("tiktok-ad-hook-writer", () => {
  it("happy path: 10 hooks + claim flags, output ids match meta", () => {
    const v = okValues();
    assert.equal(hooksOf(v).length, 10);
    assert.equal(typeof v.claimFlags, "string");
    assert.deepEqual(
      Object.keys(v).sort(),
      outputs.map((o) => o.id).sort(),
    );
  });

  it("every angle produces 10 hooks", () => {
    for (const angle of ANGLES) {
      const hs = hooksOf(okValues({ angle }));
      assert.equal(hs.length, 10, `angle ${angle}`);
    }
  });

  it("hooks have opening-3-seconds framing and mention the product", () => {
    for (const h of hooksOf(okValues())) {
      assert.ok(h.startsWith("[0:00–0:03]"), `framing: ${h}`);
      assert.ok(h.includes("LED sunset lamp"), `mentions product: ${h}`);
      assert.ok(!h.includes("{P}"), "no unreplaced placeholder");
      assert.ok(h.length <= 140 + "[0:00–0:03] ".length, `readability cap: ${h.length}`);
    }
  });

  it("hooks are unique within a run", () => {
    const hs = hooksOf(okValues());
    assert.equal(new Set(hs).size, hs.length);
  });

  it("deterministic: same inputs -> identical outputs", () => {
    assert.deepEqual(okValues(), okValues());
  });

  it("different angles -> different hooks", () => {
    const a = hooksOf(okValues({ angle: "problem" }));
    const b = hooksOf(okValues({ angle: "offer" }));
    assert.notDeepEqual(a, b);
  });

  it("claim guard: clean product name -> no flags", () => {
    const f = okValues().claimFlags as string;
    assert.match(f, /No unverifiable superlatives detected/);
  });

  it("claim guard: superlative in product name gets flagged for review", () => {
    const v = okValues({ productName: "Best Blender Pro" });
    assert.match(v.claimFlags as string, /"best"/i);
    assert.match(v.claimFlags as string, /Review before publishing/);
  });

  it("claim guard: '#1' in product name gets flagged", () => {
    const v = okValues({ productName: "#1 Phone Grip" });
    assert.match(v.claimFlags as string, /#1/);
  });

  it("word banks: 4 angles x 10 templates = 40, none empty, all have {P}", () => {
    assert.equal(ANGLES.length, 4);
    assert.deepEqual(Object.keys(HOOK_BANKS).sort(), [...ANGLES].sort());
    let total = 0;
    for (const angle of ANGLES) {
      const bank = HOOK_BANKS[angle];
      assert.equal(bank.length, 10, `angle ${angle} has 10 templates`);
      for (const t of bank) {
        assert.ok(t.length > 0, "no empty template");
        assert.ok(t.includes("{P}"), `template has placeholder: ${t}`);
        total++;
      }
    }
    assert.equal(total, 40);
  });

  it("templates contain no superlatives themselves (flags come only from user input)", () => {
    const words = ["best", "guaranteed", "proven", "miracle", "overnight", "instant"];
    for (const angle of ANGLES) {
      for (const t of HOOK_BANKS[angle]) {
        for (const w of words) {
          assert.ok(
            !new RegExp(`\\b${w}\\b`, "i").test(t),
            `template clean of "${w}": ${t}`,
          );
        }
      }
    }
  });

  it("long product names keep hooks within the readability cap", () => {
    const v = okValues({ productName: "x".repeat(120) });
    for (const h of hooksOf(v)) {
      assert.ok(h.length <= 140 + "[0:00–0:03] ".length);
    }
  });

  it("errors on missing productName", () => {
    const r = runTool({ angle: "problem" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /product name/i);
  });

  it("errors on blank productName", () => {
    const r = runTool({ productName: "  ", angle: "problem" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /product name/i);
  });

  it("errors when productName exceeds 120 chars", () => {
    const r = runTool({ productName: "x".repeat(121), angle: "problem" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /120/);
  });

  it("errors on missing angle", () => {
    const r = runTool({ productName: "lamp" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /angle/i);
  });

  it("errors on invalid angle", () => {
    const r = runTool({ productName: "lamp", angle: "funny" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /problem, result, curiosity, offer/);
  });
});
