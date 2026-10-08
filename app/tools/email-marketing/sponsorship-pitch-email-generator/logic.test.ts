import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generatePitchEmail,
  hasRepeatedWords,
  sanitizePlain,
  SUBJECTS,
  PITCH_TEMPLATES,
  FOLLOW_UP_TEMPLATES,
  ASSET_KINDS,
  PITCH_TONES,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const base = {
  yourAsset: "podcast",
  sponsorType: "meal-kit brands",
  ask: "a 60-second mid-roll mention in 4 episodes",
  tone: "friendly",
};

describe("sponsorship-pitch-email-generator (tool-436)", () => {
  it("happy path: returns 3 outputs with correct ids", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    assert.ok(r.values);
    assert.deepEqual(Object.keys(r.values).sort(), ["followUpNudge", "pitchEmail", "subjectOptions"]);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(base);
    const outIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(Object.keys(r.values!).sort(), outIds);
  });

  it("bank sizes are as documented (6 subjects, 8 pitches, 4 nudges)", () => {
    assert.equal(SUBJECTS.length, 6);
    let total = 0;
    for (const t of PITCH_TONES) {
      assert.equal(PITCH_TEMPLATES[t].length, 2, `tone ${t} must have 2 pitch templates`);
      total += PITCH_TEMPLATES[t].length;
    }
    assert.equal(total, 8);
    assert.equal(Object.keys(FOLLOW_UP_TEMPLATES).length, 4);
  });

  it("subjects insert sponsorType and asset label", () => {
    const r = runTool(base);
    const subs = r.values!.subjectOptions as string[];
    assert.equal(subs.length, 6);
    for (const s of subs) {
      assert.ok(s.includes("meal-kit brands"), `subject missing sponsorType: ${s}`);
      assert.ok(s.includes("podcast"), `subject missing asset: ${s}`);
      assert.ok(!s.includes("{"), `unfilled slot: ${s}`);
      assert.equal(hasRepeatedWords(s), false);
    }
  });

  it("pitch email is the ASK direction (you seek a sponsor) and fills all slots", () => {
    const r = runTool(base);
    const email = r.values!.pitchEmail as string;
    assert.ok(email.includes("podcast"));
    assert.ok(email.includes("meal-kit brands"));
    assert.ok(email.includes("60-second mid-roll mention in 4 episodes"));
    assert.ok(!email.includes("{"), "unfilled slot in pitch email");
  });

  it("follow-up nudge is short and mentions sponsorType and asset", () => {
    const r = runTool(base);
    const nudge = r.values!.followUpNudge as string;
    assert.ok(nudge.length > 0 && nudge.length < 400);
    assert.ok(nudge.includes("meal-kit brands"));
    assert.ok(nudge.includes("podcast"));
  });

  it("no invented stats: output contains no follower/revenue claims", () => {
    const r = runTool(base);
    const all = [
      r.values!.pitchEmail as string,
      r.values!.followUpNudge as string,
      ...(r.values!.subjectOptions as string[]),
    ].join(" ");
    assert.ok(!/\d{2,}\s*(k|K|followers|subscribers|downloads)/.test(all), "invented stat found");
  });

  it("each asset kind renders in subjects", () => {
    for (const asset of ASSET_KINDS) {
      const r = runTool({ ...base, yourAsset: asset });
      assert.equal(r.ok, true);
      const subs = r.values!.subjectOptions as string[];
      assert.ok(subs.some((s) => s.includes(asset)), `asset ${asset} missing from subjects`);
    }
  });

  it("validation: bad yourAsset -> error", () => {
    const r = runTool({ ...base, yourAsset: "youtube" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("blog"));
  });

  it("validation: whitespace-only sponsorType -> error", () => {
    const r = runTool({ ...base, sponsorType: "   " });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("sponsor type"));
  });

  it("validation: missing ask -> error", () => {
    const r = runTool({ yourAsset: "blog", sponsorType: "x", tone: "friendly" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("ask"));
  });

  it("validation: bad tone -> error listing options", () => {
    const r = runTool({ ...base, tone: "corporate" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("friendly"));
  });

  it("determinism: same inputs -> identical outputs", () => {
    assert.deepEqual(runTool(base), runTool(base));
  });

  it("overlong input trimmed with visible notice", () => {
    const long = "w".repeat(MAX_INPUT_CHARS + 40);
    const r = runTool({ ...base, ask: long });
    assert.equal(r.ok, true);
    assert.ok((r.values!.pitchEmail as string).includes("trimmed to 200 characters"));
  });

  it("sanitizePlain strips HTML; output has no raw tags", () => {
    assert.equal(sanitizePlain("<em>brand</em>"), "brand");
    const r = runTool({ ...base, sponsorType: "<b>meal-kit</b> brands" });
    assert.equal(r.ok, true);
    const email = r.values!.pitchEmail as string;
    assert.ok(!email.includes("<b>"));
    assert.ok(email.includes("meal-kit brands"));
  });

  it("generatePitchEmail throws on empty ask", () => {
    assert.throws(() => generatePitchEmail("blog", "x", "  ", "friendly"), RangeError);
    assert.throws(() => generatePitchEmail("radio", "x", "ask", "friendly"), RangeError);
  });
});
