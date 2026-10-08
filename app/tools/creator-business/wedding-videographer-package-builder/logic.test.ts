import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildTier,
  buildTable,
  buildSummary,
  parseAddOnPrices,
  parseDeliverables,
  parseNumberField,
  formatMoney,
  roundToCents,
  MAX_ITEMS,
} from "./logic.ts";

const tier1 = {
  tierName: "Essential",
  hoursOfCoverage: "6",
  shooters: "1",
  deliverables: "highlight film, teaser",
  basePrice: "1200",
  addOnPrices: "200, 100",
  bundleDiscountPct: "10",
};

const tier2 = {
  tierName: "Premium",
  hoursOfCoverage: 10,
  shooters: 2,
  deliverables: "highlight film, full film, teaser, raw footage",
  basePrice: 2500,
  addOnPrices: "",
  bundleDiscountPct: "",
};

type Values = {
  packageTiers: { columns: string[]; rows: string[][] };
  packageSummary: string;
};

function run(items: Record<string, unknown>[]) {
  const r = runTool({ items });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  return r.values as Values;
}

describe("wedding-videographer-package-builder (tool-471)", () => {
  it("happy path: two tiers build a table and a summary", () => {
    const v = run([tier1, tier2]);
    assert.equal(v.packageTiers.rows.length, 2);
    assert.equal(v.packageTiers.columns.length, 7);
    assert.ok(v.packageSummary.includes("Essential"));
    assert.ok(v.packageSummary.includes("Premium"));
  });

  it("discount math: full 1500 x (1 - 10%) = 1350, savings 150", () => {
    const { tier, error } = buildTier(1, tier1);
    assert.equal(error, null);
    assert.equal(tier.fullPrice, 1500);
    assert.equal(tier.tierPrice, 1350);
    assert.equal(tier.bundleSavings, 150);
  });

  it("zero discount: package price equals full price, savings 0", () => {
    const { tier, error } = buildTier(1, tier2);
    assert.equal(error, null);
    assert.equal(tier.fullPrice, 2500);
    assert.equal(tier.tierPrice, 2500);
    assert.equal(tier.bundleSavings, 0);
  });

  it("returns exactly the 2 output keys", () => {
    const r = runTool({ items: [tier1] });
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), ["packageSummary", "packageTiers"]);
  });

  it("hours of coverage = 0 -> 'Item 1' validation error", () => {
    const r = runTool({ items: [{ ...tier1, hoursOfCoverage: "0" }] });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").startsWith("Item 1:"));
    assert.ok((r.error ?? "").includes("greater than 0"));
  });

  it("no deliverables -> 'Item N' validation error", () => {
    const r = runTool({ items: [{ ...tier1, deliverables: "  , " }] });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").startsWith("Item 1:"));
    assert.ok((r.error ?? "").toLowerCase().includes("deliverable"));
  });

  it("error on the second item is labeled 'Item 2'", () => {
    const r = runTool({ items: [tier1, { ...tier2, basePrice: "-50" }] });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").startsWith("Item 2:"));
  });

  it("negative base price is rejected", () => {
    const r = runTool({ items: [{ ...tier1, basePrice: "-1" }] });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("non-numeric base price is rejected", () => {
    const r = runTool({ items: [{ ...tier1, basePrice: "expensive" }] });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("Infinity and NaN are rejected", () => {
    assert.ok(parseNumberField(1, "base price", Number.POSITIVE_INFINITY, { required: true, min: 0 }).error);
    assert.ok(parseNumberField(1, "base price", Number.NaN, { required: true, min: 0 }).error);
  });

  it("discount above 100 is rejected", () => {
    const r = runTool({ items: [{ ...tier1, bundleDiscountPct: "101" }] });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("100"));
  });

  it("empty items array -> human error", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").toLowerCase().includes("at least one"));
  });

  it("missing items -> human error", () => {
    const r = runTool({} as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("more than MAX_ITEMS tiers -> error", () => {
    const many = Array.from({ length: MAX_ITEMS + 1 }, (_, i) => ({ ...tier1, tierName: `T${i}` }));
    const r = runTool({ items: many });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes(String(MAX_ITEMS)));
  });

  it("shooters defaults to 1 when empty", () => {
    const { tier, error } = buildTier(1, { ...tier1, shooters: "" });
    assert.equal(error, null);
    assert.equal(tier.shooters, 1);
  });

  it("fractional shooters rejected", () => {
    const r = runTool({ items: [{ ...tier1, shooters: "1.5" }] });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").toLowerCase().includes("whole number"));
  });

  it("bad add-on price is rejected with its position", () => {
    const { error } = parseAddOnPrices(1, "200, nope");
    assert.ok(error);
    assert.ok(error.includes("#2"));
  });

  it("empty add-ons -> full price equals base price", () => {
    const { tier, error } = buildTier(1, { ...tier1, addOnPrices: "" });
    assert.equal(error, null);
    assert.equal(tier.fullPrice, 1200);
  });

  it("missing tier name -> error", () => {
    const r = runTool({ items: [{ ...tier1, tierName: "   " }] });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").toLowerCase().includes("tier name"));
  });

  it("summary contains prices, savings, and the honesty note", () => {
    const v = run([tier1]);
    assert.ok(v.packageSummary.includes("1,350.00"));
    assert.ok(v.packageSummary.includes("150.00"));
    assert.ok(v.packageSummary.toLowerCase().includes("entered by you"));
    assert.ok(v.packageSummary.toLowerCase().includes("not pricing advice"));
  });

  it("table rows carry formatted money values", () => {
    const t = buildTable([buildTier(1, tier1).tier]);
    assert.deepEqual(t.columns, ["Tier", "Hours", "Shooters", "Deliverables", "Full price", "Package price", "Bundle savings"]);
    assert.equal(t.rows[0][4], "1,500.00");
    assert.equal(t.rows[0][5], "1,350.00");
    assert.equal(t.rows[0][6], "150.00");
  });

  it("parseDeliverables splits on commas and newlines", () => {
    const { deliverables, error } = parseDeliverables(1, "highlight film\nteaser, raw footage");
    assert.equal(error, null);
    assert.deepEqual(deliverables, ["highlight film", "teaser", "raw footage"]);
  });

  it("formatMoney groups thousands with 2 decimals", () => {
    assert.equal(formatMoney(1234567.8), "1,234,567.80");
    assert.equal(roundToCents(10.005), 10.01);
  });

  it("deterministic: same items, identical outputs", () => {
    assert.deepEqual(run([tier1, tier2]), run([tier1, tier2]));
  });
});
