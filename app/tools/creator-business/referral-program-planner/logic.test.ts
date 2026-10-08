import test from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const GOOD = {
  avgClientValue: 2000,
  commissionPct: 10,
  flatBounty: 50,
  expectedReferralsPerQuarter: 4,
};

test("happy path: returns all three outputs", () => {
  const r = runTool(GOOD);
  assert.equal(r.ok, true);
  assert.ok(r.values);
  assert.equal(typeof r.values.payoutPerReferral, "number");
  assert.equal(typeof r.values.quarterlyProgramCost, "number");
  assert.equal(typeof r.values.programROIEstimate, "string");
});

test("output ids match meta.ts: payoutPerReferral, quarterlyProgramCost, programROIEstimate", () => {
  const r = runTool(GOOD);
  assert.ok(r.values);
  assert.deepEqual(Object.keys(r.values).sort(), [
    "payoutPerReferral",
    "programROIEstimate",
    "quarterlyProgramCost",
  ]);
});

test("payout math: 10% of 2000 + 50 = 250", () => {
  const r = runTool(GOOD);
  assert.equal(r.values!.payoutPerReferral, 250);
});

test("quarterly cost math: 250 x 4 = 1000", () => {
  const r = runTool(GOOD);
  assert.equal(r.values!.quarterlyProgramCost, 1000);
});

test("estimate text labels itself an estimate and shows the ROI ratio", () => {
  const r = runTool(GOOD);
  // revenue = 4 x 2000 = 8000; cost = 1000 -> 8.0x
  assert.match(r.values!.programROIEstimate, /estimate/i);
  assert.match(r.values!.programROIEstimate, /8\.0x/);
  assert.match(r.values!.programROIEstimate, /\$250\.00/);
  assert.match(r.values!.programROIEstimate, /\$1,000\.00/);
});

test("flatBounty is optional: omitted means 0", () => {
  const r = runTool({
    avgClientValue: 2000,
    commissionPct: 10,
    expectedReferralsPerQuarter: 4,
  });
  assert.equal(r.ok, true);
  assert.equal(r.values!.payoutPerReferral, 200);
  assert.equal(r.values!.quarterlyProgramCost, 800);
});

test("empty-string flatBounty is treated as 0", () => {
  const r = runTool({ ...GOOD, flatBounty: "" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.payoutPerReferral, 200);
});

test("zero referrals: zero cost, estimate handles the missing ratio", () => {
  const r = runTool({ ...GOOD, expectedReferralsPerQuarter: 0 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.quarterlyProgramCost, 0);
  assert.match(r.values!.programROIEstimate, /cannot be computed/);
});

test("zero commission and zero bounty: zero payout, no divide-by-zero", () => {
  const r = runTool({
    avgClientValue: 2000,
    commissionPct: 0,
    flatBounty: 0,
    expectedReferralsPerQuarter: 3,
  });
  assert.equal(r.ok, true);
  assert.equal(r.values!.payoutPerReferral, 0);
  assert.equal(r.values!.quarterlyProgramCost, 0);
});

test("commissionPct of 100 is allowed", () => {
  const r = runTool({ ...GOOD, commissionPct: 100 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.payoutPerReferral, 2050);
});

test("fractional inputs round to 2 decimals", () => {
  const r = runTool({
    avgClientValue: 1999.99,
    commissionPct: 12.5,
    flatBounty: 0.005,
    expectedReferralsPerQuarter: 3,
  });
  assert.equal(r.ok, true);
  assert.equal(r.values!.payoutPerReferral, 250);
  assert.equal(r.values!.quarterlyProgramCost, 750);
});

test("numeric strings are accepted", () => {
  const r = runTool({
    avgClientValue: "2000",
    commissionPct: "10",
    flatBounty: "50",
    expectedReferralsPerQuarter: "4",
  });
  assert.equal(r.ok, true);
  assert.equal(r.values!.payoutPerReferral, 250);
});

test("determinism: same inputs run twice give identical outputs", () => {
  const a = runTool(GOOD);
  const b = runTool(GOOD);
  assert.deepEqual(a, b);
});

test("missing avgClientValue returns a human error", () => {
  const r = runTool({
    commissionPct: 10,
    expectedReferralsPerQuarter: 4,
  });
  assert.equal(r.ok, false);
  assert.match(r.error!, /average client value/i);
});

test("missing commissionPct returns a human error", () => {
  const r = runTool({
    avgClientValue: 2000,
    expectedReferralsPerQuarter: 4,
  });
  assert.equal(r.ok, false);
  assert.match(r.error!, /commission percentage/i);
});

test("missing expectedReferralsPerQuarter returns a human error", () => {
  const r = runTool({ avgClientValue: 2000, commissionPct: 10 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /referrals per quarter/i);
});

test("NaN input is rejected", () => {
  const r = runTool({ ...GOOD, avgClientValue: NaN });
  assert.equal(r.ok, false);
  assert.match(r.error!, /valid number/i);
});

test("Infinity input is rejected", () => {
  const r = runTool({ ...GOOD, commissionPct: Infinity });
  assert.equal(r.ok, false);
  assert.match(r.error!, /valid number/i);
});

test("empty-string input is rejected", () => {
  const r = runTool({ ...GOOD, avgClientValue: "" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /valid number/i);
});

test("non-numeric text is rejected", () => {
  const r = runTool({ ...GOOD, avgClientValue: "two thousand" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /valid number/i);
});

test("negative avgClientValue is rejected", () => {
  const r = runTool({ ...GOOD, avgClientValue: -100 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /0 or more/);
});

test("negative commissionPct is rejected", () => {
  const r = runTool({ ...GOOD, commissionPct: -5 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /0 or more/);
});

test("commissionPct above 100 is rejected", () => {
  const r = runTool({ ...GOOD, commissionPct: 150 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /between 0 and 100/);
});

test("negative referrals are rejected", () => {
  const r = runTool({ ...GOOD, expectedReferralsPerQuarter: -2 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /0 or more/);
});

test("negative flatBounty is rejected", () => {
  const r = runTool({ ...GOOD, flatBounty: -10 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /0 or more/);
});

test("estimate disclaims it is not business or legal advice", () => {
  const r = runTool(GOOD);
  assert.match(r.values!.programROIEstimate, /not business or legal advice/i);
});

test("singular referral wording for exactly 1 referral", () => {
  const r = runTool({ ...GOOD, expectedReferralsPerQuarter: 1 });
  assert.match(r.values!.programROIEstimate, /1 expected referral per quarter/);
});
