/**
 * Tests for the Kill Fee Calculator pure logic (tool-462).
 *
 * Run: node --test app/tools/creator-business/kill-fee-calculator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  computeKillFee,
  roundToCents,
  PROJECT_STAGES,
} from "./logic.ts";

describe("roundToCents", () => {
  it("rounds half-up to two decimals", () => {
    assert.strictEqual(roundToCents(12.345), 12.35);
    assert.strictEqual(roundToCents(12.344), 12.34);
  });
  it("returns whole numbers unchanged", () => {
    assert.strictEqual(roundToCents(500), 500);
    assert.strictEqual(roundToCents(0), 0);
  });
});

describe("computeKillFee — formula", () => {
  it("applies the stage percentage to the contract value", () => {
    const r = computeKillFee(2000, 25);
    assert.strictEqual(r.killFeeAmount, 500);
    assert.strictEqual(r.killFeePctApplied, 25);
    assert.strictEqual(r.clientRefund, 1500);
  });
  it("supports a 100% kill fee (user's choice)", () => {
    const r = computeKillFee(1200, 100);
    assert.strictEqual(r.killFeeAmount, 1200);
    assert.strictEqual(r.clientRefund, 0);
  });
  it("supports a 0% kill fee", () => {
    const r = computeKillFee(1200, 0);
    assert.strictEqual(r.killFeeAmount, 0);
    assert.strictEqual(r.clientRefund, 1200);
  });
  it("rounds fractional cents", () => {
    const r = computeKillFee(999.99, 33);
    assert.strictEqual(r.killFeeAmount, 330);
    assert.strictEqual(r.clientRefund, 669.99);
  });
  it("handles a zero contract value", () => {
    const r = computeKillFee(0, 50);
    assert.strictEqual(r.killFeeAmount, 0);
    assert.strictEqual(r.clientRefund, 0);
  });
});

describe("runTool — validation", () => {
  it("computes for the not-started stage", () => {
    const r = runTool({
      contractValue: 2000,
      projectStage: "not-started",
      killPctNotStarted: 25,
    });
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(r.values, {
      killFeeAmount: 500,
      killFeePctApplied: 25,
      clientRefund: 1500,
    });
  });
  it("picks the percentage for the in-progress stage only", () => {
    const r = runTool({
      contractValue: 2000,
      projectStage: "in-progress",
      killPctNotStarted: 25,
      killPctInProgress: 50,
      killPctNearComplete: 100,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.killFeeAmount, 1000);
    assert.strictEqual(r.values!.killFeePctApplied, 50);
  });
  it("picks the percentage for the near-complete stage", () => {
    const r = runTool({
      contractValue: 800,
      projectStage: "near-complete",
      killPctNearComplete: 100,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.killFeeAmount, 800);
    assert.strictEqual(r.values!.clientRefund, 0);
  });
  it("rejects a missing contract value", () => {
    const r = runTool({ projectStage: "not-started", killPctNotStarted: 25 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });
  it("rejects NaN / Infinity contract values", () => {
    assert.strictEqual(
      runTool({
        contractValue: Number.NaN,
        projectStage: "not-started",
        killPctNotStarted: 25,
      }).ok,
      false,
    );
    assert.strictEqual(
      runTool({
        contractValue: Number.POSITIVE_INFINITY,
        projectStage: "not-started",
        killPctNotStarted: 25,
      }).ok,
      false,
    );
  });
  it("rejects a negative contract value", () => {
    const r = runTool({
      contractValue: -100,
      projectStage: "not-started",
      killPctNotStarted: 25,
    });
    assert.strictEqual(r.ok, false);
  });
  it("rejects an unknown project stage", () => {
    const r = runTool({
      contractValue: 1000,
      projectStage: "almost-done",
      killPctNotStarted: 25,
    });
    assert.strictEqual(r.ok, false);
  });
  it("rejects a percentage above 100", () => {
    const r = runTool({
      contractValue: 1000,
      projectStage: "not-started",
      killPctNotStarted: 150,
    });
    assert.strictEqual(r.ok, false);
  });
  it("rejects a negative percentage", () => {
    const r = runTool({
      contractValue: 1000,
      projectStage: "not-started",
      killPctNotStarted: -5,
    });
    assert.strictEqual(r.ok, false);
  });
  it("rejects a missing stage percentage", () => {
    const r = runTool({
      contractValue: 1000,
      projectStage: "in-progress",
      killPctNotStarted: 25,
    });
    assert.strictEqual(r.ok, false);
  });
  it("accepts numeric strings for money inputs", () => {
    const r = runTool({
      contractValue: "2000",
      projectStage: "not-started",
      killPctNotStarted: "25",
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.killFeeAmount, 500);
  });
  it("never invents a percentage — only the selected stage's user input is used", () => {
    const r = runTool({
      contractValue: 1000,
      projectStage: "not-started",
      killPctInProgress: 75,
      killPctNearComplete: 100,
    });
    assert.strictEqual(r.ok, false);
  });
  it("refund equals contract value minus kill fee", () => {
    const r = runTool({
      contractValue: 1500,
      projectStage: "in-progress",
      killPctInProgress: 40,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.killFeeAmount, 600);
    assert.strictEqual(r.values!.clientRefund, 900);
  });
});

describe("PROJECT_STAGES", () => {
  it("exposes exactly the three documented stages", () => {
    assert.deepStrictEqual([...PROJECT_STAGES], [
      "not-started",
      "in-progress",
      "near-complete",
    ]);
  });
});
