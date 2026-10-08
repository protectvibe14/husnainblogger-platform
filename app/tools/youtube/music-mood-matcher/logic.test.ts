import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOODS, SEGMENTS, COPYRIGHT_REMINDER, runTool } from "./logic.ts";

const META_OUTPUT_IDS = ["musicBrief", "searchTerms", "copyrightReminder"];

describe("music-mood-matcher — banks", () => {
  it("has exactly 10 moods", () => {
    assert.equal(MOODS.length, 10);
  });
  it("every mood has tempo, 3 genres, 3 instruments, 5 search terms, and a tip", () => {
    for (const m of MOODS) {
      assert.ok(m.id.length > 0, `mood id missing`);
      assert.ok(m.tempo.label.length > 0 && m.tempo.bpmRange.length > 0, `tempo for ${m.id}`);
      assert.equal(m.genres.length, 3, `genres for ${m.id}`);
      assert.equal(m.instruments.length, 3, `instruments for ${m.id}`);
      assert.equal(m.searchTerms.length, 5, `search terms for ${m.id}`);
      assert.ok(m.usageTip.length > 0, `tip for ${m.id}`);
    }
  });
  it("mood ids are unique", () => {
    const ids = MOODS.map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length);
  });
  it("has exactly 6 segments with placement notes", () => {
    assert.equal(SEGMENTS.length, 6);
    for (const s of SEGMENTS) {
      assert.ok(s.placementNotes.length >= 1, `notes for ${s.id}`);
    }
  });
  it("segment ids are unique", () => {
    const ids = SEGMENTS.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe("music-mood-matcher — runTool happy path", () => {
  it("returns brief, search terms, and copyright reminder for a valid pair", () => {
    const r = runTool({ mood: "energetic", segment: "intro" });
    assert.equal(r.ok, true);
    assert.ok(r.values);
    assert.equal(typeof r.values["musicBrief"], "string");
    assert.ok((r.values["musicBrief"] as string).includes("Energetic"));
    assert.ok((r.values["musicBrief"] as string).includes("first 15s"));
    assert.deepEqual(r.values["searchTerms"], [
      "upbeat energetic background music royalty free",
      "driving pop rock instrumental",
      "funk upbeat no copyright music",
      "EDM energetic vlog background",
      "positive high energy corporate music",
    ]);
    assert.equal(r.values["copyrightReminder"], COPYRIGHT_REMINDER);
  });
  it("works for every mood x every segment (all 60 combos valid)", () => {
    for (const m of MOODS) {
      for (const s of SEGMENTS) {
        const r = runTool({ mood: m.id, segment: s.id });
        assert.equal(r.ok, true, `${m.id} x ${s.id}`);
        const brief = r.values!["musicBrief"] as string;
        assert.ok(brief.includes(m.label), `brief names mood ${m.id}`);
      }
    }
  });
  it("brief never claims to include actual music", () => {
    const r = runTool({ mood: "calm", segment: "outro" });
    const brief = r.values!["musicBrief"] as string;
    assert.ok(brief.includes("search term"), "brief frames output as search terms");
    assert.ok(!/download the track/i.test(brief));
  });
  it("copyright reminder mentions royalty-free and licensing", () => {
    assert.ok(COPYRIGHT_REMINDER.includes("royalty-free"));
    assert.ok(COPYRIGHT_REMINDER.toLowerCase().includes("license"));
  });
});

describe("music-mood-matcher — validation errors", () => {
  it("rejects missing values object", () => {
    const r = runTool(undefined as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.ok(typeof r.error === "string" && r.error.length > 0);
  });
  it("rejects missing mood", () => {
    const r = runTool({ segment: "intro" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Mood"));
  });
  it("rejects missing segment", () => {
    const r = runTool({ mood: "calm" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("segment"));
  });
  it("rejects unknown mood", () => {
    const r = runTool({ mood: "jazzy", segment: "intro" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Mood"));
  });
  it("rejects unknown segment", () => {
    const r = runTool({ mood: "calm", segment: "middle" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("segment"));
  });
  it("rejects non-string mood", () => {
    const r = runTool({ mood: 5, segment: "intro" });
    assert.equal(r.ok, false);
  });
});

describe("music-mood-matcher — determinism & contract", () => {
  it("run twice -> identical", () => {
    const a = runTool({ mood: "dramatic", segment: "b-roll" });
    const b = runTool({ mood: "dramatic", segment: "b-roll" });
    assert.deepEqual(a, b);
  });
  it("output ids match meta.ts outputs", () => {
    const r = runTool({ mood: "funny", segment: "transition" });
    assert.deepEqual(Object.keys(r.values!).sort(), [...META_OUTPUT_IDS].sort());
  });
  it("error results carry no values", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.equal(r.values, undefined);
  });
});
