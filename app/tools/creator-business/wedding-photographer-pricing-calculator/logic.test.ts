/**
 * Tests for the Wedding Photographer Pricing Calculator pure logic (tool-472).
 *
 * Run: node --test app/tools/creator-business/wedding-photographer-pricing-calculator/logic.test.ts
 *
 * All expected values are hand-computed, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool } from "./logic.ts";

describe("runTool — normal cases", () => {
  it("computes 3450 for 8h @100, 3x editing, no second shooter, 250 prints", () => {
    // shooting = 8*100 = 800; editingHours = 8*3 = 24; editing = 2400;
    // total = 800 + 2400 + 250 = 3450.
    const r = runTool({
      hoursOfCoverage: 8,
      baseRate: 100,
      editingHoursPerShootingHour: 3,
      printsAlbumsCost: 250,
      secondShooter: false,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.recommendedPackagePrice, 3450);
    const rows = r.values!.costBreakdown;
    assert.strictEqual(rows[rows.length - 1].label, "TOTAL");
    assert.strictEqual(rows[rows.length - 1].amount, 3450);
    assert.strictEqual(rows.length, 4); // shooting, editing, prints, total
  });

  it("adds the second shooter cost when enabled", () => {
    // second shooter = 8h * 50 = 400; total = 3450 + 400 = 3850.
    const r = runTool({
      hoursOfCoverage: 8,
      baseRate: 100,
      editingHoursPerShootingHour: 3,
      printsAlbumsCost: 250,
      secondShooter: true,
      secondShooterRate: 50,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.recommendedPackagePrice, 3850);
    assert.strictEqual(r.values!.costBreakdown.length, 5);
    assert.match(r.values!.costBreakdown[2].label, /Second shooter/);
    assert.strictEqual(r.values!.costBreakdown[2].amount, 400);
  });

  it("ignores secondShooterRate when the second shooter is off", () => {
    const r = runTool({
      hoursOfCoverage: 8,
      baseRate: 100,
      editingHoursPerShootingHour: 3,
      printsAlbumsCost: 250,
      secondShooter: false,
      secondShooterRate: 50,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.recommendedPackagePrice, 3450);
  });

  it("rounds to cents (half-up)", () => {
    // shooting = 7.5 * 99.99 = 749.925; editingHours = 7.5*2.5 = 18.75;
    // editing = 18.75 * 99.99 = 1874.8125; total = 2624.7375 -> 2624.74.
    const r = runTool({
      hoursOfCoverage: 7.5,
      baseRate: 99.99,
      editingHoursPerShootingHour: 2.5,
      printsAlbumsCost: 0,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.recommendedPackagePrice, 2624.74);
    assert.strictEqual(r.values!.costBreakdown[0].amount, 749.93);
    assert.strictEqual(r.values!.costBreakdown[1].amount, 1874.81);
  });

  it("accepts numeric strings", () => {
    const r = runTool({
      hoursOfCoverage: "8",
      baseRate: "100",
      editingHoursPerShootingHour: "3",
      printsAlbumsCost: "250",
      secondShooter: false,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.recommendedPackagePrice, 3450);
  });

  it("defaults secondShooter to false when omitted", () => {
    const r = runTool({
      hoursOfCoverage: 8,
      baseRate: 100,
      editingHoursPerShootingHour: 3,
      printsAlbumsCost: 250,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.recommendedPackagePrice, 3450);
  });

  it("allows zero editing multiplier and zero prints", () => {
    // total = 800 + 0 + 0 = 800.
    const r = runTool({
      hoursOfCoverage: 8,
      baseRate: 100,
      editingHoursPerShootingHour: 0,
      printsAlbumsCost: 0,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.recommendedPackagePrice, 800);
  });

  it("breakdown rows sum to the total", () => {
    const r = runTool({
      hoursOfCoverage: 10,
      baseRate: 80,
      editingHoursPerShootingHour: 2,
      printsAlbumsCost: 120,
      secondShooter: true,
      secondShooterRate: 40,
    });
    assert.strictEqual(r.ok, true);
    const rows = r.values!.costBreakdown;
    const sum = rows
      .slice(0, -1)
      .reduce((acc, row) => acc + row.amount, 0);
    assert.ok(
      Math.abs(sum - r.values!.recommendedPackagePrice) < 0.02,
      "rows must sum to total (within rounding)"
    );
  });
});

describe("runTool — validation errors", () => {
  it("rejects missing hoursOfCoverage", () => {
    const r = runTool({
      baseRate: 100,
      editingHoursPerShootingHour: 3,
      printsAlbumsCost: 250,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /hoursOfCoverage is required/);
  });

  it("rejects hoursOfCoverage = 0", () => {
    const r = runTool({
      hoursOfCoverage: 0,
      baseRate: 100,
      editingHoursPerShootingHour: 3,
      printsAlbumsCost: 250,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /greater than 0/);
  });

  it("rejects negative editing multiplier", () => {
    const r = runTool({
      hoursOfCoverage: 8,
      baseRate: 100,
      editingHoursPerShootingHour: -1,
      printsAlbumsCost: 250,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /editingHoursPerShootingHour/);
  });

  it("rejects NaN", () => {
    const r = runTool({
      hoursOfCoverage: NaN,
      baseRate: 100,
      editingHoursPerShootingHour: 3,
      printsAlbumsCost: 250,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /finite number/);
  });

  it("rejects Infinity", () => {
    const r = runTool({
      hoursOfCoverage: 8,
      baseRate: Infinity,
      editingHoursPerShootingHour: 3,
      printsAlbumsCost: 250,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /finite number/);
  });

  it("rejects empty strings", () => {
    const r = runTool({
      hoursOfCoverage: "  ",
      baseRate: 100,
      editingHoursPerShootingHour: 3,
      printsAlbumsCost: 250,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /required/);
  });

  it("rejects non-numeric types", () => {
    const r = runTool({
      hoursOfCoverage: 8,
      baseRate: 100,
      editingHoursPerShootingHour: 3,
      printsAlbumsCost: true,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /printsAlbumsCost must be a number/);
  });

  it("requires secondShooterRate when the second shooter is enabled", () => {
    const r = runTool({
      hoursOfCoverage: 8,
      baseRate: 100,
      editingHoursPerShootingHour: 3,
      printsAlbumsCost: 250,
      secondShooter: true,
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /secondShooterRate is required/);
  });

  it("rejects a non-boolean secondShooter", () => {
    const r = runTool({
      hoursOfCoverage: 8,
      baseRate: 100,
      editingHoursPerShootingHour: 3,
      printsAlbumsCost: 250,
      secondShooter: "yes",
    });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /secondShooter must be true or false/);
  });

  it("rejects a non-object input", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /object/);
  });
});
