/**
 * Tests for Twitch Subscriber Revenue Calculator logic (tool-089).
 * Zero dependencies: node:test + node:assert only.
 * Run from the husnainblogger-platform root:
 *   node --test app/tools/make-money/twitch-subscriber-revenue-calculator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  calculateTwitchRevenue,
  TWITCH_SPLIT_OPTIONS,
  TWITCH_TIER_PRICES,
  BITS_PER_CHEER_USD,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE_50 = "Base 50/50 split";

describe("twitch-subscriber-revenue-calculator", () => {
  it("happy path: mixed tiers + bits on the base split", () => {
    const r = runTool({
      tier1Subs: 100,
      tier2Subs: 10,
      tier3Subs: 5,
      splitTier: BASE_50,
      bitsCheered: 1000,
    });
    assert.equal(r.ok, true);
    // (100*4.99 + 10*9.99 + 5*24.99) * 0.5 = 361.924999... (FP) -> 361.92
    assert.equal(r.values!.subRevenue, 361.92);
    assert.equal(r.values!.bitsRevenue, 10);
    assert.equal(r.values!.totalMonthly, 371.92);
  });

  it("Plus 60/40 split", () => {
    const r = runTool({
      tier1Subs: 100,
      tier2Subs: 0,
      tier3Subs: 0,
      splitTier: "Plus Program 60/40 split",
      bitsCheered: 0,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.subRevenue, 299.4); // 499 * 0.6
    assert.equal(r.values!.totalMonthly, 299.4);
  });

  it("Plus 70/30 split", () => {
    const r = runTool({
      tier1Subs: 0,
      tier2Subs: 0,
      tier3Subs: 10,
      splitTier: "Plus Program 70/30 split",
      bitsCheered: 0,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.subRevenue, 174.93); // 249.9 * 0.7
  });

  it("bits-only revenue works", () => {
    const r = runTool({
      tier1Subs: 0,
      tier2Subs: 0,
      tier3Subs: 0,
      splitTier: BASE_50,
      bitsCheered: 333,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.subRevenue, 0);
    assert.equal(r.values!.bitsRevenue, 3.33);
    assert.equal(r.values!.totalMonthly, 3.33);
  });

  it("all zeros is valid and totals $0", () => {
    const r = runTool({
      tier1Subs: 0,
      tier2Subs: 0,
      tier3Subs: 0,
      splitTier: BASE_50,
      bitsCheered: 0,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.totalMonthly, 0);
  });

  it("rounding: half-cent subtotal rounds half-up", () => {
    const r = runTool({
      tier1Subs: 1,
      tier2Subs: 0,
      tier3Subs: 0,
      splitTier: BASE_50,
      bitsCheered: 0,
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.subRevenue, 2.5); // 4.99 * 0.5 = 2.495 -> 2.50
  });

  it("validation: negative tier-1 subs fails", () => {
    const r = runTool({
      tier1Subs: -1,
      tier2Subs: 0,
      tier3Subs: 0,
      splitTier: BASE_50,
      bitsCheered: 0,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("validation: negative tier-3 subs fails", () => {
    const r = runTool({
      tier1Subs: 0,
      tier2Subs: 0,
      tier3Subs: -2,
      splitTier: BASE_50,
      bitsCheered: 0,
    });
    assert.equal(r.ok, false);
  });

  it("validation: fractional subs fails", () => {
    const r = runTool({
      tier1Subs: 1.5,
      tier2Subs: 0,
      tier3Subs: 0,
      splitTier: BASE_50,
      bitsCheered: 0,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("validation: negative bits fails", () => {
    const r = runTool({
      tier1Subs: 0,
      tier2Subs: 0,
      tier3Subs: 0,
      splitTier: BASE_50,
      bitsCheered: -50,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Bits/);
  });

  it("validation: non-numeric bits fails", () => {
    const r = runTool({
      tier1Subs: 0,
      tier2Subs: 0,
      tier3Subs: 0,
      splitTier: BASE_50,
      bitsCheered: "lots",
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /number/);
  });

  it("validation: missing splitTier fails", () => {
    const r = runTool({
      tier1Subs: 10,
      tier2Subs: 0,
      tier3Subs: 0,
      bitsCheered: 0,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /split/i);
  });

  it("validation: unknown splitTier fails and lists valid options", () => {
    const r = runTool({
      tier1Subs: 10,
      tier2Subs: 0,
      tier3Subs: 0,
      splitTier: "90/10",
      bitsCheered: 0,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Base 50\/50 split/);
  });

  it("validation: missing tier counts fail", () => {
    const r = runTool({ splitTier: BASE_50, bitsCheered: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /subscribers/i);
  });

  it("validation: non-object input fails gracefully", () => {
    const r = runTool("nope" as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("accepts numeric strings for counts", () => {
    const r = runTool({
      tier1Subs: "100",
      tier2Subs: "10",
      tier3Subs: "5",
      splitTier: BASE_50,
      bitsCheered: "1000",
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.totalMonthly, 371.92);
  });

  it("large counts stay finite", () => {
    const r = runTool({
      tier1Subs: 50000,
      tier2Subs: 5000,
      tier3Subs: 1000,
      splitTier: "Plus Program 70/30 split",
      bitsCheered: 1000000,
    });
    assert.equal(r.ok, true);
    assert.ok(Number.isFinite(r.values!.totalMonthly as number));
  });

  it("determinism: same inputs -> identical outputs", () => {
    const v = {
      tier1Subs: 321,
      tier2Subs: 45,
      tier3Subs: 6,
      splitTier: "Plus Program 60/40 split",
      bitsCheered: 7777,
    };
    assert.deepEqual(runTool(v), runTool(v));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({
      tier1Subs: 5,
      tier2Subs: 0,
      tier3Subs: 0,
      splitTier: BASE_50,
      bitsCheered: 0,
    });
    assert.equal(r.ok, true);
    const metaIds = outputs.map((o) => o.id).sort();
    const valueIds = Object.keys(r.values!).sort();
    assert.deepEqual(valueIds, metaIds);
  });

  it("constants match the spec schedule", () => {
    assert.deepEqual(
      TWITCH_TIER_PRICES.map((t) => t.price),
      [4.99, 9.99, 24.99],
    );
    assert.deepEqual(
      TWITCH_SPLIT_OPTIONS.map((s) => s.split),
      [0.5, 0.6, 0.7],
    );
    assert.equal(BITS_PER_CHEER_USD, 0.01);
  });

  it("calculateTwitchRevenue throws a human error on bad input", () => {
    assert.throws(
      () =>
        calculateTwitchRevenue({
          tier1Subs: 1,
          tier2Subs: 0,
          tier3Subs: 0,
          splitTier: "???",
          bitsCheered: 0,
        }),
      /revenue split/,
    );
  });
});
