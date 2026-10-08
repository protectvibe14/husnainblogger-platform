import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  MAX_ITEMS,
  MAX_PRODUCT_NAME_LENGTH,
  VALID_LENGTHS,
  VALID_VOICES,
  DISCLOSURE_LINE,
  HOOKS,
  DEMO_BEATS,
  TESTIMONIALS,
  OBJECTION_HANDLERS,
  CTAS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = ["scripts"];

function okValues(items: Record<string, unknown>[]): Record<string, unknown> {
  const r = runTool({ items });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values;
}

const item = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  productName: "Aurora Vitamin C Serum",
  brandVoice: "friendly",
  videoLength: "30",
  ...over,
});

describe("tiktok-ugc-script-builder", () => {
  it("happy path: one item -> one script with hook, demos, testimonial, CTA", () => {
    const v = okValues([item()]);
    const scripts = v.scripts as string[];
    assert.equal(scripts.length, 1);
    const s = scripts[0];
    assert.ok(s.includes("Aurora Vitamin C Serum"), "product name used");
    assert.ok(s.includes("HOOK"), "hook line");
    assert.ok(s.includes("DEMO BEAT 1") && s.includes("DEMO BEAT 2"), "two demo beats for 30s");
    assert.ok(s.includes("Testimonial beat"), "testimonial line");
    assert.ok(s.includes("CTA:"), "CTA line");
    assert.ok(!s.includes("[PRODUCT]"), "no unfilled slots");
  });

  it("15s script: 1 demo beat, no testimonial", () => {
    const s = (okValues([item({ videoLength: "15" })]).scripts as string[])[0];
    assert.ok(s.includes("DEMO BEAT 1"));
    assert.ok(!s.includes("DEMO BEAT 2"));
    assert.ok(!s.includes("Testimonial beat"));
  });

  it("60s script: 3 demos, testimonial, objection handler", () => {
    const s = (okValues([item({ videoLength: "60" })]).scripts as string[])[0];
    assert.ok(s.includes("DEMO BEAT 3"));
    assert.ok(s.includes("Testimonial beat"));
    assert.ok(s.includes("Objection beat"));
  });

  it("sponsored item inserts the #ad disclosure line", () => {
    const s = (okValues([item({ isSponsored: "yes" })]).scripts as string[])[0];
    assert.ok(s.includes(DISCLOSURE_LINE), "disclosure present");
    assert.ok(s.includes("#ad"), "#ad present");
  });

  it("non-sponsored item has no disclosure", () => {
    const s = (okValues([item()]).scripts as string[])[0];
    assert.ok(!s.includes("#ad"), "no disclosure");
  });

  it("isSponsored 'YES' (any case) counts as sponsored", () => {
    const s = (okValues([item({ isSponsored: "YES" })]).scripts as string[])[0];
    assert.ok(s.includes("#ad"));
  });

  it("multiple items -> one script each, deterministic order", () => {
    const v = okValues([item(), item({ productName: "Nebula Night Cream", brandVoice: "bold", videoLength: "15" })]);
    const scripts = v.scripts as string[];
    assert.equal(scripts.length, 2);
    assert.ok(scripts[0].includes("Aurora Vitamin C Serum"));
    assert.ok(scripts[1].includes("Nebula Night Cream"));
    assert.ok(scripts[1].includes("bold voice"));
  });

  it("different voices produce different hooks", () => {
    const a = (okValues([item({ brandVoice: "funny" })]).scripts as string[])[0];
    const b = (okValues([item({ brandVoice: "luxury" })]).scripts as string[])[0];
    const hookA = a.split("\n").find((l) => l.startsWith("HOOK")) as string;
    const hookB = b.split("\n").find((l) => l.startsWith("HOOK")) as string;
    assert.notEqual(hookA, hookB);
  });

  it("determinism: same items -> identical scripts", () => {
    const items = [item(), item({ productName: "Nebula Night Cream" })];
    assert.deepEqual(runTool({ items }).values, runTool({ items }).values);
  });

  it("empty items -> error", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /at least one item/i);
  });

  it("more than 10 items -> error", () => {
    const r = runTool({ items: Array.from({ length: MAX_ITEMS + 1 }, () => item()) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /maximum 10/);
  });

  it("Item 2 error message names the item", () => {
    const r = runTool({ items: [item(), { brandVoice: "friendly", videoLength: "30" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /^Item 2:/);
    assert.match(r.error as string, /productName/);
  });

  it("Item 3: empty productName -> 'Item 3:' error", () => {
    const r = runTool({ items: [item(), item(), item({ productName: "   " })] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /^Item 3:/);
  });

  it("Item 1: productName too long -> error", () => {
    const r = runTool({ items: [item({ productName: "x".repeat(MAX_PRODUCT_NAME_LENGTH + 1) })] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /^Item 1:/);
    assert.match(r.error as string, /100/);
  });

  it("invalid brandVoice -> 'Item N:' error listing voices", () => {
    const r = runTool({ items: [item({ brandVoice: "sassy" })] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /^Item 1:/);
    assert.match(r.error as string, /friendly, funny, bold, luxury, professional/);
  });

  it("missing brandVoice -> error", () => {
    const r = runTool({ items: [{ productName: "X", videoLength: "15" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /brandVoice/);
  });

  it("invalid videoLength -> error", () => {
    const r = runTool({ items: [item({ videoLength: "45" })] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /15, 30, 60/);
  });

  it("numeric videoLength 60 is accepted", () => {
    const s = (okValues([item({ videoLength: 60 })]).scripts as string[])[0];
    assert.ok(s.includes("60s"));
  });

  it("non-object item -> 'Item N:' error", () => {
    const r = runTool({ items: [item(), "nope" as unknown as Record<string, unknown>] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /^Item 2:/);
  });

  it("word banks match documented sizes", () => {
    assert.equal(Object.keys(HOOKS).length, 5);
    for (const v of VALID_VOICES) assert.equal(HOOKS[v].length, 4, `voice ${v} has 4 hooks`);
    assert.equal(DEMO_BEATS.length, 8);
    assert.equal(TESTIMONIALS.length, 6);
    assert.equal(OBJECTION_HANDLERS.length, 6);
    assert.equal(CTAS.length, 6);
    assert.deepEqual(VALID_LENGTHS, ["15", "30", "60"]);
  });

  it("output ids match meta.ts outputs", () => {
    const ids = outputs.map((o) => o.id).sort();
    assert.deepEqual(ids, EXPECTED_OUTPUT_IDS.slice().sort());
  });

  it("script lines never claim AI generation", () => {
    const s = (okValues([item()]).scripts as string[])[0].toLowerCase();
    assert.ok(!s.includes("ai-generated") && !s.includes("generated by ai"), "no AI claims");
  });
});
