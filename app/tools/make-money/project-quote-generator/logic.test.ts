/**
 * Tests for the Project Quote Generator pure logic (tool-069).
 *
 * Run: node --test app/tools/make-money/project-quote-generator/logic.test.ts
 *
 * All expected values are hand-computed from the documented cost-plus-margin
 * formula (subtotal = hours × rate + materials; total = subtotal ×
 * (1 + margin/100) × rush), never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

describe("runTool — happy paths", () => {
  it("computes a 20h × $50 quote with $150 materials and 20% margin", () => {
    // labor = 1000; materials = 150; subtotal = 1150;
    // margin = 230; total = 1380.
    const r = runTool({ estimatedHours: 20, hourlyRate: 50, materialCosts: 150, marginPercent: 20 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.subtotal, 1150);
    assert.strictEqual(r.values!.quoteTotal, 1380);
    assert.strictEqual(r.values!.warning, "");
    const items = r.values!.lineItems as string[];
    assert.ok(Array.isArray(items));
    assert.strictEqual(items.length, 5); // labor, materials, subtotal, margin, total
    assert.strictEqual(items[items.length - 1], "Quote total = $1380.00");
  });

  it("defaults materials/margin to 0 and rush to 1 (10h × $75 = $750)", () => {
    const r = runTool({ estimatedHours: 10, hourlyRate: 75 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.subtotal, 750);
    assert.strictEqual(r.values!.quoteTotal, 750);
    assert.strictEqual(r.values!.warning, "");
    const items = r.values!.lineItems as string[];
    assert.strictEqual(items.length, 5);
    assert.ok(!items.some((l) => l.startsWith("Rush fee")), "no rush line when multiplier is 1");
  });

  it("applies a 1.5x rush multiplier on top of margin (10h × $75, 1.5x = $1,125)", () => {
    // subtotal = 750; margin = 0; preRush = 750; total = 1125; rush fee = 375.
    const r = runTool({ estimatedHours: 10, hourlyRate: 75, rushMultiplier: 1.5 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.subtotal, 750);
    assert.strictEqual(r.values!.quoteTotal, 1125);
    const items = r.values!.lineItems as string[];
    assert.strictEqual(items.length, 6); // + rush line
    assert.ok(items.some((l) => l.startsWith("Rush fee (1.5x multiplier) = $375.00")));
  });

  it("renders line items as deterministic formatted USD strings", () => {
    const r = runTool({ estimatedHours: 2, hourlyRate: 100, materialCosts: 25, marginPercent: 10 });
    assert.strictEqual(r.ok, true);
    const items = r.values!.lineItems as string[];
    assert.deepStrictEqual(items, [
      "Labor: 2 h x $100.00/h = $200.00",
      "Materials & pass-through costs = $25.00",
      "Subtotal = $225.00",
      "Margin (10%) = $22.50",
      "Quote total = $247.50",
    ]);
  });

  it("rounds fractional amounts to cents", () => {
    // labor = 3 × 33.333 = 99.999 → 100.00.
    const r = runTool({ estimatedHours: 3, hourlyRate: 33.333 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.subtotal, 100);
    assert.strictEqual(r.values!.quoteTotal, 100);
  });
});

describe("runTool — rush sanity warning", () => {
  it("raises a warning for a 10x rush multiplier but still computes", () => {
    const r = runTool({ estimatedHours: 5, hourlyRate: 60, rushMultiplier: 10 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.subtotal, 300);
    assert.strictEqual(r.values!.quoteTotal, 3000);
    assert.match(r.values!.warning as string, /10x/i);
    assert.match(r.values!.warning as string, /unusually high/i);
  });

  it("does NOT warn at exactly the 5x threshold", () => {
    const r = runTool({ estimatedHours: 5, hourlyRate: 60, rushMultiplier: 5 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.warning, "");
  });

  it("does NOT warn for a normal 1.5x rush", () => {
    const r = runTool({ estimatedHours: 5, hourlyRate: 60, rushMultiplier: 1.5 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.warning, "");
  });
});

describe("runTool — validation errors", () => {
  it("rejects missing estimatedHours", () => {
    const r = runTool({ hourlyRate: 50 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Estimated hours/i);
  });

  it("rejects zero estimatedHours", () => {
    assert.strictEqual(runTool({ estimatedHours: 0, hourlyRate: 50 }).ok, false);
  });

  it("rejects negative estimatedHours", () => {
    assert.strictEqual(runTool({ estimatedHours: -2, hourlyRate: 50 }).ok, false);
  });

  it("rejects missing hourlyRate", () => {
    const r = runTool({ estimatedHours: 5 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Hourly rate/i);
  });

  it("rejects zero hourlyRate", () => {
    assert.strictEqual(runTool({ estimatedHours: 5, hourlyRate: 0 }).ok, false);
  });

  it("rejects negative materialCosts", () => {
    assert.strictEqual(runTool({ estimatedHours: 5, hourlyRate: 50, materialCosts: -10 }).ok, false);
  });

  it("rejects negative marginPercent", () => {
    assert.strictEqual(runTool({ estimatedHours: 5, hourlyRate: 50, marginPercent: -5 }).ok, false);
  });

  it("rejects a rush multiplier below 1", () => {
    const r = runTool({ estimatedHours: 5, hourlyRate: 50, rushMultiplier: 0.5 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /at least 1/);
  });

  it("rejects NaN and non-numeric inputs", () => {
    assert.strictEqual(runTool({ estimatedHours: NaN, hourlyRate: 50 }).ok, false);
    assert.strictEqual(runTool({ estimatedHours: "five" as never, hourlyRate: 50 }).ok, false);
  });

  it("rejects infinite inputs", () => {
    assert.strictEqual(runTool({ estimatedHours: Infinity, hourlyRate: 50 }).ok, false);
  });

  it("rejects a non-object values argument", () => {
    assert.strictEqual(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
});

describe("runTool — contract & determinism", () => {
  it("is deterministic: two runs with the same inputs are identical", () => {
    const args = { estimatedHours: 13.5, hourlyRate: 87.25, materialCosts: 99.99, marginPercent: 17.5, rushMultiplier: 1.25 };
    assert.deepStrictEqual(runTool(args), runTool(args));
  });

  it("returned output ids exactly match meta.ts outputs", () => {
    const r = runTool({ estimatedHours: 8, hourlyRate: 60, rushMultiplier: 2 });
    assert.strictEqual(r.ok, true);
    const expected = outputs.map((o) => o.id).sort();
    assert.deepStrictEqual(Object.keys(r.values!).sort(), expected);
  });
});
