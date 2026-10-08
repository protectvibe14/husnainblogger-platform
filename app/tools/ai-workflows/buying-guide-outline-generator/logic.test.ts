import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, parseTiers, buildOutline, CRITERIA, DEFAULT_TIERS, MAX_TIERS } from "./logic.ts";

describe("buying-guide-outline-generator", () => {
  it("happy path: category + 3 tiers -> 8 sections (5 fixed + 3 tier slots)", () => {
    const r = runTool({
      categoryName: "robot vacuum cleaners",
      budgetTiers: "Under $300\n$300–$600\nPremium",
    });
    assert.equal(r.ok, true);
    const outline = r.values?.outline as string;
    const sections = r.values?.sections as string[];
    assert.ok(outline.includes("robot vacuum cleaners"));
    assert.equal(sections.length, 5 + 3);
    assert.ok(sections.some((s) => s.includes("Under $300 picks")));
    assert.ok(sections.some((s) => s.includes("Premium picks")));
    assert.equal((r.values?.criteria as string[]).length, 6);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ categoryName: "X" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), ["criteria", "outline", "sections"]);
  });

  it("missing categoryName -> error", () => {
    const r = runTool({ budgetTiers: "Budget" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /category/i);
  });

  it("whitespace categoryName -> error", () => {
    const r = runTool({ categoryName: "   " });
    assert.equal(r.ok, false);
  });

  it("no tiers -> default tier slots, labeled as defaults", () => {
    const r = runTool({ categoryName: "headphones" });
    assert.equal(r.ok, true);
    const sections = r.values?.sections as string[];
    for (const t of DEFAULT_TIERS) {
      assert.ok(sections.some((s) => s.includes(`${t} picks`)), `missing default tier ${t}`);
    }
    assert.ok((r.values?.outline as string).includes("default tier slots"));
    assert.equal(sections.length, 5 + DEFAULT_TIERS.length);
  });

  it("tiers are parsed one per line, trimmed, deduped", () => {
    assert.deepEqual(parseTiers(" Budget \nBudget\n\nMid-range\n"), ["Budget", "Mid-range"]);
  });

  it(`tiers capped at ${MAX_TIERS}`, () => {
    const raw = Array.from({ length: MAX_TIERS + 4 }, (_, i) => `Tier ${i}`).join("\n");
    const r = runTool({ categoryName: "X", budgetTiers: raw });
    assert.equal(r.ok, true);
    assert.equal((r.values?.sections as string[]).length, 5 + MAX_TIERS);
  });

  it("criteria checklist: 6 items, category substituted, no raw placeholder", () => {
    assert.equal(CRITERIA.length, 6);
    const r = runTool({ categoryName: "espresso machines" });
    assert.equal(r.ok, true);
    const criteria = r.values?.criteria as string[];
    assert.equal(criteria.length, 6);
    for (const c of criteria) {
      assert.ok(c.includes("espresso machines"), `criteria missing category: ${c}`);
      assert.ok(!c.includes("[CATEGORY]"));
    }
    assert.ok((r.values?.outline as string).includes("- [ ] Budget fit"));
  });

  it("honesty: no invented picks — slots say research first", () => {
    const r = runTool({ categoryName: "X", budgetTiers: "Budget" });
    assert.equal(r.ok, true);
    const outline = r.values?.outline as string;
    assert.ok(outline.includes("never invent a pick"));
    assert.ok(outline.includes("the tool makes no recommendations"));
  });

  it("non-string budgetTiers treated as no tiers", () => {
    const r = runTool({ categoryName: "X", budgetTiers: 42 });
    assert.equal(r.ok, true);
    assert.ok((r.values?.outline as string).includes("default tier slots"));
  });

  it("buildOutline returns fixed sections + one slot per tier", () => {
    const sections = buildOutline("drones", ["Cheap", "Pro"]);
    assert.equal(sections.length, 7);
    assert.ok(sections[0].title.includes("What this guide covers"));
    assert.ok(sections[sections.length - 1].title.includes("Final recommendation"));
    assert.ok(sections[2].title.includes("Cheap picks"));
    assert.ok(sections[3].title.includes("Pro picks"));
  });

  it("sections are numbered sequentially", () => {
    const r = runTool({ categoryName: "X", budgetTiers: "A\nB" });
    const sections = r.values?.sections as string[];
    sections.forEach((s, i) => assert.ok(s.startsWith(`${i + 1}.`), `bad numbering: ${s}`));
  });

  it("tier names are used verbatim (no price invention)", () => {
    const r = runTool({ categoryName: "X", budgetTiers: "My custom tier" });
    assert.equal(r.ok, true);
    assert.ok((r.values?.sections as string[]).some((s) => s.includes("My custom tier picks")));
  });

  it("5 fixed sections always present, in fixed positions", () => {
    const r = runTool({ categoryName: "X", budgetTiers: "A" });
    const sections = r.values?.sections as string[];
    assert.ok(sections[0].includes("What this guide covers"));
    assert.ok(sections[1].includes("How to choose"));
    assert.ok(sections[sections.length - 3].includes("Features worth paying for"));
    assert.ok(sections[sections.length - 2].includes("What to avoid"));
    assert.ok(sections[sections.length - 1].includes("Final recommendation"));
  });

  it("outline ends with the criteria checklist section", () => {
    const r = runTool({ categoryName: "X" });
    assert.ok((r.values?.outline as string).includes("## Criteria checklist"));
  });

  it("deterministic: same inputs -> identical output", () => {
    const args = { categoryName: "X", budgetTiers: "Budget\nPremium" };
    const a = runTool(args);
    const b = runTool(args);
    assert.deepEqual(a, b);
  });
});
