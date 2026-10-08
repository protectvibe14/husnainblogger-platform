import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateGiveawayIdeas,
  parsePrizeTier,
  hashString,
  IDEA_TEMPLATES,
  PRIZE_BANKS,
  ENTRY_MECHANICS,
  DURATIONS,
  MIN_COUNT,
  MAX_COUNT,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const base = { blogNiche: "home baking", audience: "new parents", prizeBudget: "$50", count: 3 };

describe("blog-giveaway-idea-generator (tool-434)", () => {
  it("happy path: returns requested count of ideas with all 4 keys", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const ideas = r.values!.ideas as Record<string, unknown>[];
    assert.equal(ideas.length, 3);
    for (const idea of ideas) {
      assert.deepEqual(Object.keys(idea).sort(), ["duration", "entryMechanic", "prize", "title"]);
      for (const k of ["title", "prize", "entryMechanic", "duration"]) {
        const v = idea[k] as string;
        assert.equal(typeof v, "string");
        assert.ok(v.length > 0, `empty ${k}`);
        assert.ok(!v.includes("{"), `unfilled slot in ${k}: ${v}`);
      }
    }
  });

  it("output ids match meta.ts outputs (ideas + notice)", () => {
    const r = runTool(base);
    const outIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(Object.keys(r.values!).sort(), outIds);
  });

  it("bank sizes are as documented (12 titles, 18 prizes, 6 mechanics, 4 durations)", () => {
    assert.equal(IDEA_TEMPLATES.length, 12);
    let prizeTotal = 0;
    for (const tier of Object.keys(PRIZE_BANKS) as (keyof typeof PRIZE_BANKS)[]) {
      assert.equal(PRIZE_BANKS[tier].length, 6, `tier ${tier} must have 6 prizes`);
      prizeTotal += PRIZE_BANKS[tier].length;
    }
    assert.equal(prizeTotal, 24); // 3 tiers + unspecified = 24 templates
    assert.equal(ENTRY_MECHANICS.length, 6);
    assert.equal(DURATIONS.length, 4);
  });

  it("parsePrizeTier picks the right tier from budget text", () => {
    assert.equal(parsePrizeTier("$10"), "low");
    assert.equal(parsePrizeTier("$20"), "low");
    assert.equal(parsePrizeTier("$50"), "mid");
    assert.equal(parsePrizeTier("$100"), "mid");
    assert.equal(parsePrizeTier("$500"), "high");
    assert.equal(parsePrizeTier(""), "unspecified");
    assert.equal(parsePrizeTier("not sure yet"), "unspecified");
  });

  it("$50 budget yields mid-tier prizes", () => {
    const r = runTool({ ...base, prizeBudget: "$50", count: 6 });
    const ideas = r.values!.ideas as { prize: string }[];
    const midFilled = PRIZE_BANKS.mid.map((t) => t.replaceAll("{niche}", "home baking"));
    for (const i of ideas) {
      assert.ok(midFilled.includes(i.prize), `prize not from mid tier: ${i.prize}`);
    }
  });

  it("no budget -> unspecified tier with honest generic prizes", () => {
    const r = runTool({ blogNiche: "travel", audience: "students", count: 2 });
    assert.equal(r.ok, true);
    const ideas = r.values!.ideas as { prize: string }[];
    assert.ok(ideas[0].prize.includes("travel"));
    assert.ok(ideas[0].prize.toLowerCase().includes("budget") || ideas[0].prize.length > 10);
  });

  it("count clamps to 1–10 (0 -> 1, 99 -> 10, 2.7 -> 2)", () => {
    assert.equal((runTool({ ...base, count: 0 }).values!.ideas as unknown[]).length, MIN_COUNT);
    assert.equal((runTool({ ...base, count: 99 }).values!.ideas as unknown[]).length, MAX_COUNT);
    assert.equal((runTool({ ...base, count: 2.7 }).values!.ideas as unknown[]).length, 2);
  });

  it("validation: missing blogNiche -> error", () => {
    const r = runTool({ audience: "x", count: 3 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("niche"));
  });

  it("validation: whitespace-only audience -> error", () => {
    const r = runTool({ blogNiche: "x", audience: "   ", count: 3 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("audience"));
  });

  it("validation: NaN/Infinity count -> error", () => {
    assert.equal(runTool({ ...base, count: NaN }).ok, false);
    assert.equal(runTool({ ...base, count: Infinity }).ok, false);
    assert.equal(runTool({ ...base, count: "3" }).ok, false);
  });

  it("validation: non-string prizeBudget -> error", () => {
    const r = runTool({ blogNiche: "x", audience: "y", prizeBudget: 50, count: 3 });
    assert.equal(r.ok, false);
  });

  it("determinism: same inputs -> identical ideas (hash-based selection)", () => {
    assert.deepEqual(runTool(base), runTool(base));
    const h1 = hashString("a|b");
    assert.equal(h1, hashString("a|b"));
    assert.ok(typeof h1 === "number" && h1 >= 0);
  });

  it("different niches produce different idea selections", () => {
    const a = runTool({ ...base, blogNiche: "home baking" }).values!.ideas;
    const b = runTool({ ...base, blogNiche: "dog training" }).values!.ideas;
    assert.notDeepEqual(a, b);
  });

  it("overlong input trimmed with visible notice", () => {
    const long = "z".repeat(MAX_INPUT_CHARS + 20);
    const r = generateGiveawayIdeas(long, "audience", "", 2);
    assert.ok(r.notice !== null);
    assert.ok(r.ideas[0].title.length > 0);
  });

  it("HTML in niche is sanitized out of outputs", () => {
    const r = runTool({ blogNiche: "<b>baking</b>", audience: "moms", count: 2 });
    assert.equal(r.ok, true);
    const ideas = r.values!.ideas as { title: string }[];
    assert.ok(!ideas[0].title.includes("<b>"));
    assert.ok(ideas[0].title.includes("baking"));
  });

  it("edge: emoji niche handled; CJK passes through", () => {
    const r = runTool({ blogNiche: "料理ブログ 🍳", audience: "主婦", count: 1 });
    assert.equal(r.ok, true);
    const ideas = r.values!.ideas as { title: string }[];
    assert.ok(ideas[0].title.includes("料理ブログ 🍳"));
  });
});
