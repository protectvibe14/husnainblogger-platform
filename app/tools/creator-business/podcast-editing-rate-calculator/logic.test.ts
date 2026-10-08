/**
 * Tests for the Podcast Editing Rate Calculator pure logic (tool-475).
 *
 * Run: node --test app/tools/creator-business/podcast-editing-rate-calculator/logic.test.ts
 *
 * All expected values are hand-computed, never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool } from "./logic.ts";

const BASE = {
  episodeMinutes: 45,
  editMultiplier: 3,
  hourlyRate: 40,
  episodesPerMonth: 4,
  addOnShowNotesPrice: 20,
  addOnAudiogramPrice: 0,
  addOnChaptersPrice: 15,
};

describe("runTool — normal cases", () => {
  it("computes 125 per episode / 500 retainer", () => {
    // editHours = 0.75 * 3 = 2.25; labor = 90; addOns = 35;
    // perEpisode = 125; retainer = 125 * 4 = 500.
    const r = runTool(BASE);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.perEpisodePrice, 125);
    assert.strictEqual(r.values!.monthlyRetainerEstimate, 500);
    assert.deepStrictEqual(r.values!.addOnsIncluded, [
      { label: "Show notes", price: 20 },
      { label: "Chapters", price: 15 },
    ]);
  });

  it("excludes zero-priced add-ons", () => {
    const r = runTool({ ...BASE, addOnShowNotesPrice: 0, addOnChaptersPrice: 0 });
    // perEpisode = 90; retainer = 360.
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.perEpisodePrice, 90);
    assert.strictEqual(r.values!.monthlyRetainerEstimate, 360);
    assert.deepStrictEqual(r.values!.addOnsIncluded, []);
  });

  it("handles zero episodes per month (retainer = 0)", () => {
    const r = runTool({ ...BASE, episodesPerMonth: 0 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.perEpisodePrice, 125);
    assert.strictEqual(r.values!.monthlyRetainerEstimate, 0);
  });

  it("handles a zero edit multiplier (add-ons only)", () => {
    const r = runTool({ ...BASE, editMultiplier: 0 });
    // labor = 0; perEpisode = 35; retainer = 140.
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.perEpisodePrice, 35);
    assert.strictEqual(r.values!.monthlyRetainerEstimate, 140);
  });

  it("rounds to cents", () => {
    // editHours = (52/60) * 2.5 = 2.1667; labor = 2.1667*37.5 = 81.25;
    // addOns = 12.33; perEpisode = 93.58; retainer = 93.58 * 3 = 280.74.
    const r = runTool({
      episodeMinutes: 52,
      editMultiplier: 2.5,
      hourlyRate: 37.5,
      episodesPerMonth: 3,
      addOnShowNotesPrice: 12.33,
      addOnAudiogramPrice: 0,
      addOnChaptersPrice: 0,
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.perEpisodePrice, 93.58);
    assert.strictEqual(r.values!.monthlyRetainerEstimate, 280.74);
  });

  it("accepts numeric strings", () => {
    const r = runTool({
      episodeMinutes: "45",
      editMultiplier: "3",
      hourlyRate: "40",
      episodesPerMonth: "4",
      addOnShowNotesPrice: "20",
      addOnAudiogramPrice: "0",
      addOnChaptersPrice: "15",
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.perEpisodePrice, 125);
  });

  it("retainer scales linearly with episodes", () => {
    const r = runTool({ ...BASE, episodesPerMonth: 8 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!.monthlyRetainerEstimate, 1000);
  });
});

describe("runTool — validation errors", () => {
  it("rejects episodeMinutes = 0", () => {
    const r = runTool({ ...BASE, episodeMinutes: 0 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /episodeMinutes must be greater than 0/);
  });

  it("rejects a negative edit multiplier", () => {
    const r = runTool({ ...BASE, editMultiplier: -2 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /editMultiplier must be at least 0/);
  });

  it("rejects a negative hourly rate", () => {
    const r = runTool({ ...BASE, hourlyRate: -10 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /hourlyRate must be at least 0/);
  });

  it("rejects a negative add-on price", () => {
    const r = runTool({ ...BASE, addOnAudiogramPrice: -1 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /addOnAudiogramPrice must be at least 0/);
  });

  it("rejects NaN", () => {
    const r = runTool({ ...BASE, hourlyRate: NaN });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /finite number/);
  });

  it("rejects Infinity", () => {
    const r = runTool({ ...BASE, editMultiplier: Infinity });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /finite number/);
  });

  it("rejects empty strings", () => {
    const r = runTool({ ...BASE, episodeMinutes: " " });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /is required/);
  });

  it("rejects a missing add-on price", () => {
    const { addOnShowNotesPrice: _omit, ...rest } = BASE;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /addOnShowNotesPrice is required/);
  });

  it("rejects a non-object input", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /object/);
  });
});
