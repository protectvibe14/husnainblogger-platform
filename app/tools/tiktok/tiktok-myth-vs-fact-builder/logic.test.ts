import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_IDS = ["script", "beats"];

const item1 = {
  myth: "You only use 10% of your brain.",
  fact: "You use virtually all of your brain, even during simple tasks.",
  source: "Neuroscience textbooks",
};

const item2 = {
  myth: "Cracking your knuckles causes arthritis.",
  fact: "Studies have found no link between knuckle cracking and arthritis.",
};

function okResult(items: Record<string, unknown>[]) {
  const r = runTool({ items });
  assert.equal(r.ok, true, `expected ok, got error: ${"error" in r ? r.error : ""}`);
  return (r as { ok: true; values: { script: string; beats: string[] } }).values;
}

describe("tiktok-myth-vs-fact-builder", () => {
  it("happy path: one item produces script + beats", () => {
    const v = okResult([item1]);
    assert.equal(typeof v.script, "string");
    assert.ok(Array.isArray(v.beats));
    assert.ok(v.script.length > 50);
    assert.ok(v.beats.length > 0);
  });

  it("output ids match meta.ts outputs", () => {
    const v = okResult([item1]);
    assert.deepEqual(Object.keys(v).sort(), EXPECTED_IDS.sort());
    assert.deepEqual(outputs.map((o) => o.id).sort(), EXPECTED_IDS.sort());
  });

  it("user myth and fact appear verbatim in the script", () => {
    const v = okResult([item1]);
    assert.ok(v.script.includes(item1.myth));
    assert.ok(v.script.includes(item1.fact));
  });

  it("three items produce three pair blocks", () => {
    const v = okResult([item1, item2, { myth: "Myth three", fact: "Fact three" }]);
    const separators = v.beats.filter((b) => b.startsWith("--- PAIR"));
    assert.equal(separators.length, 3);
  });

  it("each pair has hook, myth, transition, fact, cta beats", () => {
    const v = okResult([item1]);
    const joined = v.beats.join("\n");
    for (const tag of ["HOOK:", "MYTH:", "TRANSITION:", "FACT:", "CTA:"]) {
      assert.ok(joined.includes(tag), `missing beat tag ${tag}`);
    }
  });

  it("source adds a SOURCE ON SCREEN beat", () => {
    const v = okResult([item1]);
    assert.ok(v.beats.join("\n").includes("SOURCE ON SCREEN: Neuroscience textbooks"));
  });

  it("no source: no source beat", () => {
    const v = okResult([item2]);
    assert.ok(!v.beats.join("\n").includes("SOURCE ON SCREEN"));
  });

  it("empty items: error", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("at least one"));
  });

  it("more than 5 items: error", () => {
    const items = Array.from({ length: 6 }, (_, i) => ({
      myth: `myth ${i}`,
      fact: `fact ${i}`,
    }));
    const r = runTool({ items });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("Max 5"));
  });

  it("exactly 5 items: ok (upper bound)", () => {
    const items = Array.from({ length: 5 }, (_, i) => ({
      myth: `myth ${i}`,
      fact: `fact ${i}`,
    }));
    const v = okResult(items);
    assert.ok(v.script.length > 0);
  });

  it("missing myth: Item 1 error", () => {
    const r = runTool({ items: [{ fact: "some fact" }] });
    assert.equal(r.ok, false);
    assert.equal((r as { error: string }).error, "Item 1: myth is required — write the claim as viewers say it.");
  });

  it("missing fact on item 2: Item 2 error", () => {
    const r = runTool({ items: [item1, { myth: "a myth" }] });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.startsWith("Item 2:"));
  });

  it("whitespace-only myth: error", () => {
    const r = runTool({ items: [{ myth: "   ", fact: "a fact" }] });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.startsWith("Item 1:"));
  });

  it("null item: Item N invalid item error", () => {
    const r = runTool({ items: [null as unknown as Record<string, unknown>] });
    assert.equal(r.ok, false);
    assert.equal((r as { error: string }).error, "Item 1: invalid item.");
  });

  it("myth over 200 chars: error", () => {
    const r = runTool({ items: [{ myth: "m".repeat(201), fact: "a fact" }] });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("200 characters"));
  });

  it("fact over 400 chars: error", () => {
    const r = runTool({ items: [{ myth: "a myth", fact: "f".repeat(401) }] });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("400 characters"));
  });

  it("health claim adds the verify banner (sensitive edge case)", () => {
    const v = okResult([
      { myth: "This vitamin cures the flu overnight.", fact: "No vitamin cures the flu overnight." },
    ]);
    assert.ok(v.script.includes("HONESTY NOTE"));
    assert.ok(v.script.includes("Verify every claim"));
  });

  it("finance claim adds the verify banner", () => {
    const v = okResult([
      { myth: "This crypto will double your money.", fact: "No investment guarantees returns." },
    ]);
    assert.ok(v.script.includes("HONESTY NOTE"));
  });

  it("non-sensitive claim: no banner", () => {
    const v = okResult([item1]);
    assert.ok(!v.script.includes("HONESTY NOTE"));
  });

  it("source longer than 200 chars is truncated", () => {
    const long = "s".repeat(250);
    const v = okResult([{ myth: "m", fact: "f", source: long }]);
    assert.ok(!v.beats.join("\n").includes(long));
    assert.ok(v.beats.join("\n").includes("s".repeat(200)));
  });

  it("deterministic: same items run twice → identical", () => {
    const a = okResult([item1, item2]);
    const b = okResult([item1, item2]);
    assert.deepEqual(a, b);
  });

  it("different myths pick different hooks (bank bounds, non-empty)", () => {
    const hooks = new Set<string>();
    for (let i = 0; i < 12; i++) {
      const v = okResult([{ myth: `myth number ${i}`, fact: `fact number ${i}` }]);
      const hook = v.beats.find((b) => b.startsWith("HOOK:"));
      assert.ok(hook && hook.length > 10);
      hooks.add(hook);
    }
    assert.ok(hooks.size > 1, "hash should vary picks across inputs");
  });
});
