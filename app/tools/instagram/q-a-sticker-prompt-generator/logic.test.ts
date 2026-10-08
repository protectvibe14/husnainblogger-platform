import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, QA_TONES, BANK_SIZES, ASSUMPTIONS } from "./logic.ts";

const GOOD = { niche: "skincare", tone: "friendly", count: 4 };

describe("q-a-sticker-prompt-generator", () => {
  it("happy path: prompts list + copyAll + promptCount", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.ok(r.values);
    const prompts = r.values["prompts"] as string[];
    assert.equal(prompts.length, 4);
    assert.equal(r.values["promptCount"], 4);
    assert.ok(typeof r.values["copyAll"] === "string");
    for (const p of prompts) assert.ok(p.length > 0);
  });

  it("defaults to 5 prompts when count is omitted", () => {
    const r = runTool({ niche: "fitness", tone: "bold" });
    assert.equal(r.ok, true);
    assert.equal((r.values!["prompts"] as string[]).length, 5);
  });

  it("niche is inserted, no leftover placeholders", () => {
    const r = runTool({ niche: "freelance writing", tone: "professional", count: 10 });
    const prompts = r.values!["prompts"] as string[];
    for (const p of prompts) {
      assert.ok(!p.includes("{niche}"), p);
      assert.ok(p.includes("freelance writing"), p);
    }
  });

  it("tone changes the opener: all four tones produce different first prompts", () => {
    const firsts = QA_TONES.map(
      (tone) => (runTool({ niche: "x", tone, count: 1 }).values!["prompts"] as string[])[0],
    );
    assert.equal(new Set(firsts).size, 4);
  });

  it("tone is case-insensitive and trims whitespace", () => {
    const a = runTool({ niche: "x", tone: "Funny", count: 2 });
    const b = runTool({ niche: "x", tone: "  funny  ", count: 2 });
    assert.equal(a.ok, true);
    assert.deepEqual(a.values, b.values);
  });

  it("no prompt repeats for count=10 (opener x core pairs are unique)", () => {
    for (const tone of QA_TONES) {
      const r = runTool({ niche: "x", tone, count: 10 });
      const prompts = r.values!["prompts"] as string[];
      assert.equal(new Set(prompts).size, 10, `tone ${tone}`);
    }
  });

  it("niche is trimmed", () => {
    const r = runTool({ niche: "  travel  ", tone: "friendly", count: 1 });
    const prompts = r.values!["prompts"] as string[];
    assert.ok(prompts[0].includes("travel"));
    assert.ok(!prompts[0].includes("  travel"));
  });

  it("unicode niche is inserted verbatim", () => {
    const r = runTool({ niche: "café culture ☕", tone: "friendly", count: 1 });
    const prompts = r.values!["prompts"] as string[];
    assert.ok(prompts[0].includes("café culture ☕"));
  });

  it("errors on missing niche", () => {
    const r = runTool({ tone: "friendly" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("niche"));
  });

  it("errors on empty niche", () => {
    const r = runTool({ niche: "   ", tone: "friendly" });
    assert.equal(r.ok, false);
  });

  it("errors on missing tone", () => {
    const r = runTool({ niche: "x" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("tone"));
  });

  it("errors on unknown tone and lists valid tones", () => {
    const r = runTool({ niche: "x", tone: "sassy" });
    assert.equal(r.ok, false);
    for (const t of QA_TONES) assert.ok(r.error!.includes(t));
  });

  it("errors on non-string tone", () => {
    const r = runTool({ niche: "x", tone: 42 });
    assert.equal(r.ok, false);
  });

  it("errors when count is 0", () => {
    const r = runTool({ niche: "x", tone: "friendly", count: 0 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("1") && r.error!.includes("10"));
  });

  it("errors when count exceeds 10", () => {
    const r = runTool({ niche: "x", tone: "friendly", count: 11 });
    assert.equal(r.ok, false);
  });

  it("errors on fractional and non-numeric count", () => {
    assert.equal(runTool({ niche: "x", tone: "friendly", count: 2.5 }).ok, false);
    assert.equal(runTool({ niche: "x", tone: "friendly", count: "many" }).ok, false);
  });

  it("count accepts a numeric string", () => {
    const r = runTool({ niche: "x", tone: "friendly", count: "7" });
    assert.equal(r.ok, true);
    assert.equal(r.values!["promptCount"], 7);
  });

  it("deterministic: same inputs give identical output", () => {
    const a = runTool({ niche: "pets", tone: "bold", count: 6 });
    const b = runTool({ niche: "pets", tone: "bold", count: 6 });
    assert.deepEqual(a, b);
  });

  it("bank sizes documented and consistent", () => {
    assert.equal(BANK_SIZES.tones, 4);
    assert.equal(BANK_SIZES.toneOpeners, 12);
    assert.equal(BANK_SIZES.corePrompts, 14);
    assert.ok(BANK_SIZES.corePrompts >= BANK_SIZES.maxCount);
  });

  it("assumptions are honest about template-based generation", () => {
    assert.ok(ASSUMPTIONS.length >= 1);
    assert.ok(ASSUMPTIONS.some((a) => a.toLowerCase().includes("not ai")));
  });

  it("copyAll contains every prompt", () => {
    const r = runTool({ niche: "cooking", tone: "funny", count: 3 });
    const prompts = r.values!["prompts"] as string[];
    const copy = r.values!["copyAll"] as string;
    for (const p of prompts) assert.ok(copy.includes(p));
  });

  it("output ids are the contract ids: prompts, copyAll, promptCount", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["copyAll", "promptCount", "prompts"]);
  });
});
