import { test } from "node:test";
import assert from "node:assert";
import { runTool, planPostingTimes, DAYS, REGIONS, TIMEZONE_OPTIONS } from "./logic.ts";

const base = { audienceRegion: "North America", userTimezone: "UTC-5" };

// --- happy path ------------------------------------------------------------

test("happy path: all days default -> one slot per day (7, incl. generic fallback)", () => {
  const r = runTool(base);
  assert.equal(r.ok, true);
  const slots = r.values!.suggestedSlots as string[];
  assert.equal(slots.length, 7);
  assert.ok(slots[0].includes("Mon"));
  assert.ok(slots.some((s) => s.includes("Generic midday slot")), "Saturday gets generic fallback");
  assert.ok(typeof r.values!.disclaimerNoLiveData === "string");
  assert.ok((r.values!.disclaimerNoLiveData as string).includes("Insights"));
});

test("happy path: selected days filter slots", () => {
  const r = runTool({ ...base, monday: true, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false });
  assert.equal(r.ok, true);
  const slots = r.values!.suggestedSlots as string[];
  assert.equal(slots.length, 1);
  assert.ok(slots[0].startsWith("Mon"));
});

test("happy path: day without region slot gets generic fallback", () => {
  // North America has no Saturday slot
  const r = runTool({ ...base, saturday: true, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, sunday: false });
  assert.equal(r.ok, true);
  const slots = r.values!.suggestedSlots as string[];
  assert.equal(slots.length, 1);
  assert.ok(slots[0].includes("Generic midday slot"));
});

test("happy path: timezone conversion shifts window", () => {
  const r = runTool({ audienceRegion: "North America", userTimezone: "UTC-8" });
  assert.equal(r.ok, true);
  const slots = r.values!.suggestedSlots as string[];
  // Monday 12:00–13:30 audience (UTC-5) -> 09:00–10:30 in UTC-8
  assert.ok(slots[0].includes("audience 12:00–13:30 → your 09:00–10:30 (UTC-8)"));
});

test("happy path: same-offset timezone keeps audience window", () => {
  const r = runTool({ audienceRegion: "Europe", userTimezone: "UTC+1" });
  assert.equal(r.ok, true);
  const slots = r.values!.suggestedSlots as string[];
  assert.ok(slots[0].includes("audience 12:00–13:30 → your 12:00–13:30 (UTC+1)"));
});

test("happy path: large positive shift moves day label", () => {
  // Europe Thu 19:00 + (12-1)=11h shift -> Fri 06:00
  const r = runTool({ audienceRegion: "Europe", userTimezone: "UTC+12", thursday: true, monday: false, tuesday: false, wednesday: false, friday: false, saturday: false, sunday: false });
  assert.equal(r.ok, true);
  const slots = r.values!.suggestedSlots as string[];
  assert.equal(slots.length, 1);
  assert.ok(slots[0].startsWith("Fri"), slots[0]);
  assert.ok(slots[0].includes("your 06:00–08:00"));
});

test("happy path: rationale present on every slot", () => {
  const r = runTool(base);
  for (const s of r.values!.suggestedSlots as string[]) {
    assert.ok(s.includes("—"), s);
    assert.ok(s.length > 30);
  }
});

// --- validation errors -----------------------------------------------------

test("error: missing region", () => {
  const r = runTool({ userTimezone: "UTC-5" });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("region"));
});

test("error: unknown region", () => {
  const r = runTool({ audienceRegion: "Atlantis", userTimezone: "UTC-5" });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("Atlantis"));
});

test("error: missing timezone", () => {
  const r = runTool({ audienceRegion: "Europe" });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("timezone"));
});

test("error: invalid timezone", () => {
  const r = runTool({ audienceRegion: "Europe", userTimezone: "Mars/Phobos" });
  assert.equal(r.ok, false);
  assert.ok(r.error!.length > 0);
});

test("error: all days off", () => {
  const off: Record<string, unknown> = { ...base };
  for (const d of DAYS) off[d] = false;
  const r = runTool(off);
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes("at least one day"));
});

// --- edge cases ------------------------------------------------------------

test("edge: boolean days given as strings", () => {
  const r = runTool({ ...base, monday: "true", tuesday: "false", wednesday: "false", thursday: "false", friday: "false", saturday: "false", sunday: "false" });
  assert.equal(r.ok, true);
  assert.equal((r.values!.suggestedSlots as string[]).length, 1);
});

test("edge: Middle East includes Sunday slot (workweek difference)", () => {
  const plan = planPostingTimes("Middle East", "UTC+3", {});
  assert.ok(plan.slots.some((s) => s.day === "sunday"), "expected a Sunday slot");
});

test("edge: Global region works with default days", () => {
  const plan = planPostingTimes("Global / not sure", "UTC+0", {});
  assert.equal(plan.slots.length, 7); // 6 region slots + 1 generic fallback
});

test("edge: every region yields one slot per selected day (7)", () => {
  assert.equal(REGIONS.length, 8);
  for (const region of REGIONS) {
    const plan = planPostingTimes(region, "UTC+0", {});
    assert.equal(plan.slots.length, 7, `${region}`);
  }
});

test("edge: half-hour formatting", () => {
  const r = runTool({ ...base, monday: true, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false });
  const slots = r.values!.suggestedSlots as string[];
  assert.ok(slots[0].includes("12:00–13:30"));
});

test("edge: 21 timezone options exposed", () => {
  assert.equal(TIMEZONE_OPTIONS.length, 21);
});

// --- determinism + meta contract -------------------------------------------

test("determinism: same inputs twice -> identical outputs", () => {
  assert.deepEqual(runTool(base).values, runTool(base).values);
});

test("meta contract: output ids are suggestedSlots + disclaimerNoLiveData", () => {
  const r = runTool(base);
  assert.ok(r.ok);
  assert.deepEqual(Object.keys(r.values!).sort(), ["disclaimerNoLiveData", "suggestedSlots"]);
});
