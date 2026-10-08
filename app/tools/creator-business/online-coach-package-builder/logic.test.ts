/**
 * Tests for the Online Coach Package Builder pure logic (tool-476).
 *
 * Run: node --test app/tools/creator-business/online-coach-package-builder/logic.test.ts
 *
 * All expected values are hand-computed, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool } from "./logic.ts";

const GLOBALS = {
  packageName: "Clarity Sprint",
  sessionsPerPackage: "8",
  sessionLengthMin: "60",
  pricePerSession: "75",
  packageDiscountPct: "10",
};

function row(description: string, price: string) {
  return { ...GLOBALS, addOnDescription: description, addOnPrice: price };
}

describe("runTool — normal cases", () => {
  it("computes 765 package price with tiers", () => {
    // sessionsTotal = 8 * 75 = 600; addOns = 150 + 100 = 250;
    // full = 850; packagePrice = 850 * 0.9 = 765.
    const r = runTool({
      items: [row("Voxer support between sessions", "150"), row("Meal plan", "100")],
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.packagePrice, 765);
    assert.deepStrictEqual(r.values!.packageTiers, [
      { name: "Starter", includes: "8 sessions only (no add-ons)", price: 600 },
      { name: "Standard", includes: "8 sessions + all add-ons", price: 850 },
      { name: "Premium", includes: "8 sessions + all add-ons (10% package discount)", price: 765 },
    ]);
  });

  it("package description is client-ready", () => {
    const r = runTool({
      items: [row("Voxer support between sessions", "150"), row("Meal plan", "100")],
    });
    assert.strictEqual(r.ok, true);
    const doc = r.values!.packageDescription;
    assert.match(doc, /CLARITY SPRINT/);
    assert.match(doc, /8 × 60-minute sessions/);
    assert.match(doc, /Voxer support between sessions: \$150\.00/);
    assert.match(doc, /Package discount: 10%/);
    assert.match(doc, /PACKAGE PRICE \(estimate\): \$765\.00/);
    assert.match(doc, /You save \$85\.00/);
  });

  it("reads globals from the first item only", () => {
    const r = runTool({
      items: [
        row("Add-on A", "100"),
        { ...row("Add-on B", "50"), sessionsPerPackage: "99", pricePerSession: "1" },
      ],
    });
    assert.strictEqual(r.ok, true);
    // 8 * 75 = 600; addOns = 150; full = 750; * 0.9 = 675.
    assert.strictEqual(r.values!.packagePrice, 675);
  });

  it("allows a 0-price row for packages with no paid add-ons", () => {
    const r = runTool({ items: [row("No add-ons in this package", "0")] });
    assert.strictEqual(r.ok, true);
    // full = 600; package = 540.
    assert.strictEqual(r.values!.packagePrice, 540);
    assert.match(r.values!.packageDescription, /Add-ons: none priced/);
  });

  it("handles 0% discount (tiers converge)", () => {
    const r = runTool({
      items: [{ ...row("Add-on A", "100"), packageDiscountPct: "0" }],
    });
    assert.strictEqual(r.ok, true);
    // sessions = 600; full = 700; package = 700.
    assert.strictEqual(r.values!.packagePrice, 700);
    assert.strictEqual(r.values!.packageTiers[1].price, 700);
    assert.strictEqual(r.values!.packageTiers[2].price, 700);
  });

  it("rounds to cents", () => {
    const r = runTool({
      items: [{ ...row("Add-on A", "33.333"), pricePerSession: "66.665", sessionsPerPackage: "3", packageDiscountPct: "15" }],
    });
    assert.strictEqual(r.ok, true);
    // sessions = 3 * 66.665 = 199.995 -> 200.00 (rounded at sessionsTotal);
    // addOn = 33.333 -> 33.33; full = 233.33; package = 233.33 * 0.85 = 198.3305 -> 198.33.
    assert.strictEqual(r.values!.packagePrice, 198.33);
  });

  it("works without a package name", () => {
    const { packageName: _omit, ...rest } = GLOBALS;
    const r = runTool({ items: [{ ...rest, addOnDescription: "Add-on A", addOnPrice: "50" }] });
    assert.strictEqual(r.ok, true);
    assert.match(r.values!.packageDescription, /COACHING PACKAGE/);
  });

  it("savings math is consistent", () => {
    const r = runTool({
      items: [row("Add-on A", "150"), row("Add-on B", "100")],
    });
    assert.strictEqual(r.ok, true);
    const tiers = r.values!.packageTiers;
    assert.ok(
      Math.abs(tiers[1].price - tiers[2].price - 85) < 0.02,
      "premium savings must equal standard minus premium"
    );
  });
});

describe("runTool — validation errors", () => {
  it("rejects an empty items array", () => {
    const r = runTool({ items: [] });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /at least one row/);
  });

  it("rejects sessions = 0", () => {
    const r = runTool({
      items: [{ ...row("Add-on A", "50"), sessionsPerPackage: "0" }],
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Item 1: sessionsPerPackage must be greater than 0/);
  });

  it("rejects fractional sessions", () => {
    const r = runTool({
      items: [{ ...row("Add-on A", "50"), sessionsPerPackage: "4.5" }],
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("rejects a discount above 100", () => {
    const r = runTool({
      items: [{ ...row("Add-on A", "50"), packageDiscountPct: "120" }],
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /at most 100/);
  });

  it("rejects a negative add-on price", () => {
    const r = runTool({ items: [row("Add-on A", "-10")] });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Item 1: addOnPrice must be at least 0/);
  });

  it("rejects a missing add-on description with the item number", () => {
    const r = runTool({
      items: [
        row("Add-on A", "50"),
        { ...GLOBALS, addOnDescription: " ", addOnPrice: "20" },
      ],
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Item 2: addOnDescription is required/);
  });

  it("rejects NaN session length", () => {
    const r = runTool({
      items: [{ ...row("Add-on A", "50"), sessionLengthMin: "abc" }],
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /finite number/);
  });

  it("rejects more than 50 rows", () => {
    const items = Array.from({ length: 51 }, (_, i) => row(`Add-on ${i + 1}`, "1"));
    const r = runTool({ items });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /at most 50/);
  });
});
