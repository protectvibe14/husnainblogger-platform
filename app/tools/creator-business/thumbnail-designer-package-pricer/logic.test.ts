/**
 * Tests for the Thumbnail Designer Package Pricer pure logic (tool-474).
 *
 * Run: node --test app/tools/creator-business/thumbnail-designer-package-pricer/logic.test.ts
 *
 * All expected values are hand-computed, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool } from "./logic.ts";

describe("runTool — normal cases", () => {
  it("computes 450 monthly / 22.50 effective for 20 thumbs @25 with 10% off", () => {
    // monthly = 20 * 25 * 0.9 = 450; effective = 450 / 20 = 22.5.
    const r = runTool({
      thumbnailsPerMonth: 20,
      pricePerThumbnail: 25,
      revisionsIncluded: 2,
      bundleDiscountPct: 10,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.monthlyPackagePrice, 450);
    assert.strictEqual(r.values!.perThumbnailEffective, 22.5);
    assert.strictEqual(r.values!.revisionsIncluded, 2);
  });

  it("computes tier options with a-la-carte savings", () => {
    // 10-pack: ala 250, pack 225, save 25. 20-pack: 500/450/50. 30-pack: 750/675/75.
    const r = runTool({
      thumbnailsPerMonth: 20,
      pricePerThumbnail: 25,
      revisionsIncluded: 2,
      bundleDiscountPct: 10,
    });
    assert.strictEqual(r.ok, true);
    const tiers = r.values!.tierOptions;
    assert.strictEqual(tiers.length, 3);
    assert.deepStrictEqual(tiers[0], {
      packSize: 10,
      aLaCartePrice: 250,
      packPrice: 225,
      savingsVsALaCarte: 25,
    });
    assert.deepStrictEqual(tiers[1], {
      packSize: 20,
      aLaCartePrice: 500,
      packPrice: 450,
      savingsVsALaCarte: 50,
    });
    assert.deepStrictEqual(tiers[2], {
      packSize: 30,
      aLaCartePrice: 750,
      packPrice: 675,
      savingsVsALaCarte: 75,
    });
  });

  it("handles 0% discount (package = a-la-carte)", () => {
    const r = runTool({
      thumbnailsPerMonth: 10,
      pricePerThumbnail: 30,
      revisionsIncluded: 0,
      bundleDiscountPct: 0,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.monthlyPackagePrice, 300);
    assert.strictEqual(r.values!.perThumbnailEffective, 30);
    assert.strictEqual(r.values!.tierOptions[0].savingsVsALaCarte, 0);
  });

  it("handles 100% discount (free package)", () => {
    const r = runTool({
      thumbnailsPerMonth: 10,
      pricePerThumbnail: 30,
      revisionsIncluded: 1,
      bundleDiscountPct: 100,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.monthlyPackagePrice, 0);
    assert.strictEqual(r.values!.perThumbnailEffective, 0);
    assert.strictEqual(r.values!.tierOptions[1].packPrice, 0);
  });

  it("rounds to cents", () => {
    // monthly = 7 * 19.99 * 0.85 = 118.9405 -> 118.94; effective = 16.9914 -> 16.99.
    const r = runTool({
      thumbnailsPerMonth: 7,
      pricePerThumbnail: 19.99,
      revisionsIncluded: 2,
      bundleDiscountPct: 15,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.monthlyPackagePrice, 118.94);
    assert.strictEqual(r.values!.perThumbnailEffective, 16.99);
  });

  it("accepts numeric strings", () => {
    const r = runTool({
      thumbnailsPerMonth: "20",
      pricePerThumbnail: "25",
      revisionsIncluded: "2",
      bundleDiscountPct: "10",
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.monthlyPackagePrice, 450);
  });

  it("savings are consistent: ala - pack = savings", () => {
    const r = runTool({
      thumbnailsPerMonth: 13,
      pricePerThumbnail: 17.5,
      revisionsIncluded: 3,
      bundleDiscountPct: 12.5,
    });
    assert.strictEqual(r.ok, true);
    for (const t of r.values!.tierOptions) {
      assert.ok(
        Math.abs(t.aLaCartePrice - t.packPrice - t.savingsVsALaCarte) < 0.02,
        "savings must equal ala minus pack (within rounding)"
      );
    }
  });
});

describe("runTool — validation errors", () => {
  it("rejects volume = 0", () => {
    const r = runTool({
      thumbnailsPerMonth: 0,
      pricePerThumbnail: 25,
      revisionsIncluded: 2,
      bundleDiscountPct: 10,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /thumbnailsPerMonth must be greater than 0/);
  });

  it("rejects fractional volume", () => {
    const r = runTool({
      thumbnailsPerMonth: 2.5,
      pricePerThumbnail: 25,
      revisionsIncluded: 2,
      bundleDiscountPct: 10,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("rejects negative price", () => {
    const r = runTool({
      thumbnailsPerMonth: 10,
      pricePerThumbnail: -5,
      revisionsIncluded: 2,
      bundleDiscountPct: 10,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /pricePerThumbnail must be at least 0/);
  });

  it("rejects discount above 100", () => {
    const r = runTool({
      thumbnailsPerMonth: 10,
      pricePerThumbnail: 25,
      revisionsIncluded: 2,
      bundleDiscountPct: 101,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /at most 100/);
  });

  it("rejects negative discount", () => {
    const r = runTool({
      thumbnailsPerMonth: 10,
      pricePerThumbnail: 25,
      revisionsIncluded: 2,
      bundleDiscountPct: -1,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /at least 0/);
  });

  it("rejects NaN", () => {
    const r = runTool({
      thumbnailsPerMonth: 10,
      pricePerThumbnail: NaN,
      revisionsIncluded: 2,
      bundleDiscountPct: 10,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /finite number/);
  });

  it("rejects Infinity", () => {
    const r = runTool({
      thumbnailsPerMonth: 10,
      pricePerThumbnail: 25,
      revisionsIncluded: 2,
      bundleDiscountPct: Infinity,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /finite number/);
  });

  it("rejects empty input", () => {
    const r = runTool({
      thumbnailsPerMonth: "",
      pricePerThumbnail: 25,
      revisionsIncluded: 2,
      bundleDiscountPct: 10,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /is required/);
  });

  it("rejects a non-object input", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /object/);
  });
});
