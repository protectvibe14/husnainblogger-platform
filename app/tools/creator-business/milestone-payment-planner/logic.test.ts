/**
 * Tests for the Milestone Payment Planner pure logic (tool-459).
 *
 * Run: node --test app/tools/creator-business/milestone-payment-planner/logic.test.ts
 *
 * All expected values are hand-computed from the spec formula J-MILESTONE,
 * never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { planMilestones, parseMilestoneText, runTool } from "./logic.ts";

describe("planMilestones — normal cases", () => {
  it("50/50 split on a $1,000 contract", () => {
    // 1000 * 50/100 = 500 each; final absorbs 0 remainder.
    const r = planMilestones(1000, [
      { name: "Kickoff", pct: 50, dueCondition: "On signing" },
      { name: "Delivery", pct: 50, dueCondition: "On delivery" },
    ]);
    assert.strictEqual(r.sumCheck, 100);
    assert.strictEqual(r.milestoneSchedule[0].amount, 500);
    assert.strictEqual(r.milestoneSchedule[1].amount, 500);
    assert.strictEqual(r.warning, null);
    assert.ok(r.paymentTimeline.includes("#1 Kickoff — $500.00 (50%) — due: On signing"));
  });

  it("30/40/30 split on $2,500", () => {
    // 750, 1000, 750.
    const r = planMilestones(2500, [
      { name: "Start", pct: 30, dueCondition: "" },
      { name: "Midpoint", pct: 40, dueCondition: "Draft approved" },
      { name: "Launch", pct: 30, dueCondition: "Go live" },
    ]);
    assert.deepStrictEqual(
      r.milestoneSchedule.map((s) => s.amount),
      [750, 1000, 750],
    );
    assert.strictEqual(r.sumCheck, 100);
  });

  it("rounding remainder goes to the final milestone", () => {
    // 10 * 33.333/100 = 3.3333 -> 3.33; same for second; final = 10 - 6.66 = 3.34.
    const r = planMilestones(10, [
      { name: "A", pct: 33.333, dueCondition: "" },
      { name: "B", pct: 33.333, dueCondition: "" },
      { name: "C", pct: 33.334, dueCondition: "" },
    ]);
    assert.deepStrictEqual(
      r.milestoneSchedule.map((s) => s.amount),
      [3.33, 3.33, 3.34],
    );
    const total = r.milestoneSchedule.reduce((s, row) => s + row.amount, 0);
    assert.strictEqual(Math.round(total * 100) / 100, 10);
  });

  it("single milestone at 100% is allowed but flagged", () => {
    const r = planMilestones(800, [{ name: "All-in", pct: 100, dueCondition: "On delivery" }]);
    assert.strictEqual(r.milestoneSchedule[0].amount, 800);
    assert.ok(r.warning !== null && r.warning.includes("no upfront payment protection"));
  });

  it("33.33/33.33/33.34 passes the 100% sum check (float tolerance)", () => {
    const r = planMilestones(300, [
      { name: "A", pct: 33.33, dueCondition: "" },
      { name: "B", pct: 33.33, dueCondition: "" },
      { name: "C", pct: 33.34, dueCondition: "" },
    ]);
    assert.strictEqual(r.sumCheck, 100);
    assert.deepStrictEqual(
      r.milestoneSchedule.map((s) => s.amount),
      [99.99, 99.99, 100.02],
    );
  });

  it("zero contract value yields zero amounts", () => {
    const r = planMilestones(0, [{ name: "All", pct: 100, dueCondition: "" }]);
    assert.strictEqual(r.milestoneSchedule[0].amount, 0);
    assert.strictEqual(r.contractValue, 0);
  });

  it("milestone with 0% is allowed", () => {
    const r = planMilestones(1000, [
      { name: "Review checkpoint", pct: 0, dueCondition: "No payment" },
      { name: "Full payment", pct: 100, dueCondition: "On delivery" },
    ]);
    assert.strictEqual(r.milestoneSchedule[0].amount, 0);
    assert.strictEqual(r.milestoneSchedule[1].amount, 1000);
  });
});

describe("planMilestones — validation", () => {
  it("percentages not summing to 100 throw a human error", () => {
    assert.throws(
      () =>
        planMilestones(1000, [
          { name: "A", pct: 50, dueCondition: "" },
          { name: "B", pct: 40, dueCondition: "" },
        ]),
      /must add up to 100% \(currently 90%\)/,
    );
  });

  it("sum of 101% throws", () => {
    assert.throws(
      () =>
        planMilestones(1000, [
          { name: "A", pct: 60, dueCondition: "" },
          { name: "B", pct: 41, dueCondition: "" },
        ]),
      /currently 101%/,
    );
  });

  it("percentage above 100 throws a range error", () => {
    assert.throws(
      () => planMilestones(1000, [{ name: "A", pct: 110, dueCondition: "" }]),
      /between 0 and 100/,
    );
  });

  it("negative contract value throws", () => {
    assert.throws(
      () => planMilestones(-5, [{ name: "A", pct: 100, dueCondition: "" }]),
      /contractValue must be >= 0/,
    );
  });

  it("empty milestone name throws", () => {
    assert.throws(
      () => planMilestones(100, [{ name: "   ", pct: 100, dueCondition: "" }]),
      /name is required/,
    );
  });

  it("empty milestone list throws", () => {
    assert.throws(() => planMilestones(100, []), /At least one milestone is required/);
  });
});

describe("parseMilestoneText", () => {
  it("parses name | pct | due condition lines and skips blanks", () => {
    const ms = parseMilestoneText("Kickoff | 30 | On signing\n\nDelivery | 70% | On delivery");
    assert.deepStrictEqual(ms, [
      { name: "Kickoff", pct: 30, dueCondition: "On signing" },
      { name: "Delivery", pct: 70, dueCondition: "On delivery" },
    ]);
  });

  it("due condition is optional", () => {
    const ms = parseMilestoneText("Deposit | 50");
    assert.deepStrictEqual(ms, [{ name: "Deposit", pct: 50, dueCondition: "" }]);
  });

  it("missing percentage reports the line number", () => {
    assert.throws(() => parseMilestoneText("Kickoff | \nDelivery | 50"), /Line 1: percentage is required/);
  });

  it("non-numeric percentage reports the line number", () => {
    assert.throws(() => parseMilestoneText("Kickoff | thirty"), /Line 1: "thirty" is not a valid percentage/);
  });

  it("missing name reports the line number", () => {
    assert.throws(() => parseMilestoneText(" | 50"), /Line 1: milestone name is required/);
  });
});

describe("runTool — shape and validation", () => {
  it("accepts the textarea format and returns the five spec output keys", () => {
    const res = runTool({
      contractValue: 1000,
      milestones: "Kickoff | 30 | On signing\nDelivery | 70 | On delivery",
    });
    assert.strictEqual(res.ok, true);
    assert.deepStrictEqual(Object.keys(res.values!).sort(), [
      "contractValue",
      "milestoneSchedule",
      "paymentTimeline",
      "sumCheck",
      "warning",
    ]);
    assert.deepStrictEqual(
      (res.values!.milestoneSchedule as { amount: number }[]).map((s) => s.amount),
      [300, 700],
    );
  });

  it("accepts a pre-parsed array of milestones", () => {
    const res = runTool({
      contractValue: 2000,
      milestones: [
        { name: "A", pct: 25, dueCondition: "" },
        { name: "B", pct: 75, dueCondition: "" },
      ],
    });
    assert.strictEqual(res.ok, true);
    assert.deepStrictEqual(
      (res.values!.milestoneSchedule as { amount: number }[]).map((s) => s.amount),
      [500, 1500],
    );
  });

  it("non-100% sum returns a human error", () => {
    const res = runTool({ contractValue: 1000, milestones: "A | 30\nB | 30" });
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error, "Milestone percentages must add up to 100% (currently 60%).");
  });

  it("missing contractValue / milestones return human errors", () => {
    assert.strictEqual(runTool({ milestones: "A | 100" }).error, "contractValue is required.");
    assert.strictEqual(runTool({ contractValue: 100 }).error, "milestones is required.");
  });

  it("negative contractValue returns a human error", () => {
    const res = runTool({ contractValue: -100, milestones: "A | 100" });
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error, "contractValue must be >= 0.");
  });

  it("non-object input returns a human error", () => {
    assert.strictEqual(runTool(undefined as never).error, "Input must be an object.");
  });
});
