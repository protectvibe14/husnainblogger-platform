import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, CREATOR_SHARE, MAX_TIERS, PERK_COUNT, perksForPrice } from "./logic.ts";
import { outputs } from "./meta.ts";

function twoTiers() {
  return {
    tierCount: 2,
    tier1Name: "Supporter",
    tier1Price: 4.99,
    tier1Members: 100,
    tier2Name: "VIP",
    tier2Price: 14.99,
    tier2Members: 20,
  };
}

describe("membership-tier-planner", () => {
  it("happy path: per-tier and total revenue math", () => {
    const r = runTool(twoTiers());
    assert.equal(r.ok, true);
    const v = r.values!;
    // tier1: 100 x 4.99 x 0.7 = 349.30 ; tier2: 20 x 14.99 x 0.7 = 209.86
    assert.equal(v["totalRevenue"], 559.16);
    const table = v["tiers"] as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["Tier", "Price / month", "Est. members", "Est. creator payout / month"]);
    assert.equal(table.rows.length, 2);
    assert.equal(table.rows[0][3], "$349.30");
    assert.equal(table.rows[1][3], "$209.86");
  });

  it("creator share is 70%", () => {
    assert.equal(CREATOR_SHARE, 0.7);
    const r = runTool({ tierCount: 1, tier1Name: "A", tier1Price: 10, tier1Members: 10 });
    assert.equal(r.values!["totalRevenue"], 70);
  });

  it("single tier works", () => {
    const r = runTool({ tierCount: 1, tier1Name: "Solo", tier1Price: 2.99, tier1Members: 50 });
    assert.equal(r.ok, true);
    assert.equal((r.values!["tiers"] as { rows: string[][] }).rows.length, 1);
    assert.equal((r.values!["perkChecklist"] as string[]).length, 1);
  });

  it("six tiers (YouTube max) works", () => {
    const v: Record<string, unknown> = { tierCount: 6 };
    for (let i = 1; i <= 6; i++) {
      v[`tier${i}Name`] = `Tier ${i}`;
      v[`tier${i}Price`] = i;
      v[`tier${i}Members`] = i * 10;
    }
    const r = runTool(v);
    assert.equal(r.ok, true);
    assert.equal((r.values!["tiers"] as { rows: string[][] }).rows.length, 6);
  });

  it("extra tier inputs beyond tierCount are ignored", () => {
    const v = { ...twoTiers(), tier3Name: "Ignored", tier3Price: 99, tier3Members: 999 };
    const r = runTool(v);
    assert.equal(r.ok, true);
    assert.equal((r.values!["tiers"] as { rows: string[][] }).rows.length, 2);
  });

  it("missing tierCount -> error", () => {
    const r = runTool({ tier1Name: "A", tier1Price: 5, tier1Members: 10 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("1-6"));
  });

  it("tierCount 0 -> error", () => {
    const r = runTool({ tierCount: 0 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("6"));
  });

  it("tierCount 7 -> error (YouTube limit)", () => {
    const r = runTool({ tierCount: 7 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("6"));
  });

  it("fractional tierCount -> error", () => {
    const r = runTool({ tierCount: 2.5 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("missing tier name -> Tier N error", () => {
    const r = runTool({ tierCount: 1, tier1Price: 5, tier1Members: 10 });
    assert.equal(r.ok, false);
    assert.equal(r.error, "Tier 1: name is required.");
  });

  it("missing tier price -> error", () => {
    const r = runTool({ tierCount: 1, tier1Name: "A", tier1Members: 10 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("price is required"));
  });

  it("zero or negative price -> error", () => {
    for (const price of [0, -4.99]) {
      const r = runTool({ tierCount: 1, tier1Name: "A", tier1Price: price, tier1Members: 10 });
      assert.equal(r.ok, false, `price ${price}`);
      assert.ok(r.error!.includes("greater than 0"));
    }
  });

  it("non-numeric price -> error", () => {
    const r = runTool({ tierCount: 1, tier1Name: "A", tier1Price: "free", tier1Members: 10 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("price"));
  });

  it("missing members -> error", () => {
    const r = runTool({ tierCount: 1, tier1Name: "A", tier1Price: 5 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("estimated members is required"));
  });

  it("negative members -> error", () => {
    const r = runTool({ tierCount: 1, tier1Name: "A", tier1Price: 5, tier1Members: -3 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("cannot be negative"));
  });

  it("zero members is allowed (payout $0.00)", () => {
    const r = runTool({ tierCount: 1, tier1Name: "A", tier1Price: 5, tier1Members: 0 });
    assert.equal(r.ok, true);
    assert.equal(r.values!["totalRevenue"], 0);
  });

  it("perk checklist grows with price", () => {
    const cheap = runTool({ tierCount: 1, tier1Name: "A", tier1Price: 0.99, tier1Members: 1 });
    const pricey = runTool({ tierCount: 1, tier1Name: "A", tier1Price: 49.99, tier1Members: 1 });
    const cheapLine = (cheap.values!["perkChecklist"] as string[])[0];
    const priceyLine = (pricey.values!["perkChecklist"] as string[])[0];
    assert.ok(priceyLine.length > cheapLine.length);
    assert.ok(cheapLine.includes("Loyalty badges"));
    assert.ok(priceyLine.includes("Personalized shoutout video"));
  });

  it("perk bank has 12 perks; thresholds behave", () => {
    assert.equal(PERK_COUNT, 12);
    assert.equal(perksForPrice(0.5).length, 0);
    assert.equal(perksForPrice(0.99).length, 2);
    assert.equal(perksForPrice(100).length, 12);
  });

  it("money is rounded to cents", () => {
    const r = runTool({ tierCount: 1, tier1Name: "A", tier1Price: 1.11, tier1Members: 3 });
    // 3 x 1.11 x 0.7 = 2.331 -> 2.33
    assert.equal(r.values!["totalRevenue"], 2.33);
    const rows = (r.values!["tiers"] as { rows: string[][] }).rows;
    assert.equal(rows[0][3], "$2.33");
  });

  it("determinism: same inputs twice -> identical output", () => {
    const v = twoTiers();
    assert.deepEqual(runTool(v), runTool(v));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(twoTiers());
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), outputs.map((o) => o.id).sort());
  });

  it("MAX_TIERS equals YouTube's 6-level limit", () => {
    assert.equal(MAX_TIERS, 6);
  });
});
