import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  sanitize,
  parsePrice,
  resolvePackageConfig,
  buildSalesSheet,
  round2,
  formatMoney,
  DEFAULT_PACKAGE_NAME,
  DEFAULT_DISCOUNT_PCT,
  MAX_SERVICES,
} from "./logic.ts";
import { outputs } from "./meta.ts";

function svc(name: string, price: unknown, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return { name, price, ...extra };
}

describe("happy path", () => {
  it("builds a package with per-row config on the first row", () => {
    const res = runTool({
      items: [
        svc("Logo design", 500, { packageName: "Starter Brand Pack", bundleDiscountPct: 20, packageDescription: "Everything a new brand needs." }),
        svc("Brand guidelines", 300),
        svc("Social kit", 200),
      ],
    });
    assert.equal(res.ok, true);
    assert.equal(res.values?.packagePrice, 800);
    assert.equal(res.values?.savingsVsALaCarte, 200);
    const sheet = res.values?.packageSalesSheet ?? "";
    assert.ok(sheet.includes("STARTER BRAND PACK"));
    assert.ok(sheet.includes("Everything a new brand needs."));
    assert.ok(sheet.includes("1. Logo design — $500.00"));
    assert.ok(sheet.includes("A-la-carte total: $1,000.00"));
    assert.ok(sheet.includes("Bundle discount: 20%"));
    assert.ok(sheet.includes("Package price: $800.00"));
    assert.ok(sheet.includes("You save: $200.00"));
    assert.ok(sheet.includes('Reply with "START"'));
  });

  it("accepts package config as top-level args", () => {
    const res = runTool({
      items: [svc("Audit", 250)],
      packageName: "Quick Audit",
      bundleDiscountPct: 0,
      packageDescription: "",
    });
    assert.equal(res.ok, true);
    assert.equal(res.values?.packagePrice, 250);
    assert.equal(res.values?.savingsVsALaCarte, 0);
    assert.ok(res.values?.packageSalesSheet.includes("QUICK AUDIT"));
  });

  it("uses defaults when no package config is given", () => {
    const res = runTool({ items: [svc("Call", 100)] });
    assert.equal(res.ok, true);
    assert.equal(res.values?.packagePrice, 90);
    assert.ok(res.values?.packageSalesSheet.includes(DEFAULT_PACKAGE_NAME.toUpperCase()));
  });

  it("reads config from the first filled row, skipping empty earlier rows", () => {
    const res = runTool({
      items: [svc("A", 100), svc("B", 100, { packageName: "Second Row Pack", bundleDiscountPct: 50 })],
    });
    assert.equal(res.ok, true);
    assert.equal(res.values?.packagePrice, 100);
    assert.ok(res.values?.packageSalesSheet.includes("SECOND ROW PACK"));
  });

  it("accepts $/comma price strings and percent-sign discounts", () => {
    const res = runTool({
      items: [svc("Site", "$1,200")],
      packageName: "P",
      bundleDiscountPct: "10%",
    });
    assert.equal(res.ok, true);
    assert.equal(res.values?.packagePrice, 1080);
  });
});

describe("validation errors", () => {
  it("errors when items is not an array", () => {
    assert.deepEqual(runTool({ items: "x" as never }), { ok: false, error: "No items were provided." });
  });

  it("errors when no services are given", () => {
    assert.deepEqual(runTool({ items: [] }), { ok: false, error: "Add at least one service to build a package." });
  });

  it("errors when a service name is missing", () => {
    const res = runTool({ items: [svc("  ", 100)] });
    assert.equal(res.ok, false);
    assert.equal(res.error, "Item 1: service name is required.");
  });

  it("errors when a price is not a number >= 0", () => {
    for (const bad of ["free", -5, NaN, Infinity, ""]) {
      const res = runTool({ items: [svc("S", bad)] });
      assert.equal(res.ok, false, `should reject ${String(bad)}`);
      assert.equal(res.error, "Item 1: price must be a number of 0 or more.");
    }
  });

  it("errors when a discount is out of range or not a number", () => {
    for (const bad of [101, -1, "huge"]) {
      const res = runTool({ items: [svc("S", 100)], bundleDiscountPct: bad });
      assert.equal(res.ok, false, `should reject ${String(bad)}`);
      assert.equal(res.error, "Bundle discount must be a number between 0 and 100.");
    }
  });

  it("errors with the row label when a row-level discount is invalid", () => {
    const res = runTool({ items: [svc("S", 100, { bundleDiscountPct: "200" })] });
    assert.equal(res.ok, false);
    assert.equal(res.error, "Item 1: bundle discount must be a number between 0 and 100.");
  });

  it("errors when an item is not an object", () => {
    const res = runTool({ items: [null as never] });
    assert.equal(res.error, "Item 1: not an object.");
  });

  it("errors when too many services are given", () => {
    const items = Array.from({ length: MAX_SERVICES + 1 }, (_, i) => svc(`S${i}`, 10));
    assert.equal(runTool({ items }).error, `Too many services (max ${MAX_SERVICES}).`);
  });
});

describe("edge cases", () => {
  it("handles a 100% discount (free package)", () => {
    const res = runTool({ items: [svc("S", 400)], bundleDiscountPct: 100 });
    assert.equal(res.values?.packagePrice, 0);
    assert.equal(res.values?.savingsVsALaCarte, 400);
  });

  it("handles zero-price services", () => {
    const res = runTool({ items: [svc("Bonus", 0), svc("Core", 300)] });
    assert.equal(res.values?.packagePrice, 270);
  });

  it("rounds fractional money to 2 decimals", () => {
    const res = runTool({ items: [svc("S", 99.99)], bundleDiscountPct: 33 });
    assert.equal(res.values?.packagePrice, round2(99.99 * 0.67));
    assert.equal(res.values?.savingsVsALaCarte, round2(99.99 - round2(99.99 * 0.67)));
  });

  it("is deterministic: identical inputs give identical outputs", () => {
    const args = { items: [svc("A", 100), svc("B", 200)], packageName: "P", bundleDiscountPct: 15 };
    assert.deepEqual(runTool(args), runTool(args));
  });

  it("helpers: sanitize, parsePrice, formatMoney, config resolution", () => {
    assert.equal(sanitize("  x  ", 10), "x");
    assert.equal(parsePrice("  "), null);
    assert.equal(parsePrice(0), 0);
    assert.equal(formatMoney(0), "$0.00");
    const cfg = resolvePackageConfig({ items: [{ name: "S", price: 50 }] });
    assert.deepEqual([cfg.name, cfg.discountPct, cfg.description], [DEFAULT_PACKAGE_NAME, DEFAULT_DISCOUNT_PCT, ""]);
    const bad = resolvePackageConfig({ items: [], bundleDiscountPct: "abc" });
    assert.equal(bad.ok, false);
    const sheet = buildSalesSheet("Pack", "", [{ name: "A", price: 10 }], 10, 10, 9, 1);
    assert.ok(!sheet.includes("WHAT'S INCLUDED\n\n"));
  });

  it("output ids match meta.ts outputs", () => {
    assert.deepEqual(
      outputs.map((o) => o.id).sort(),
      ["packagePrice", "packageSalesSheet", "savingsVsALaCarte"].sort(),
    );
  });
});
