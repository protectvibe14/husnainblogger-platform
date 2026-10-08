import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generatePitch,
  formatFollowers,
  DELIVERABLES,
  DELIVERABLE_LABELS,
  BANK_SIZES,
  ASSUMPTIONS,
} from "./logic.ts";

describe("dm-collab-pitch-generator", () => {
  it("happy path: pitch contains brand, niche, formatted followers", () => {
    const r = runTool({ brand: "GlowCo", niche: "skincare", followerCount: 12500, deliverable: "reel" });
    assert.equal(r.ok, true);
    const pitch = r.values!.pitch as string;
    assert.ok(pitch.includes("GlowCo"));
    assert.ok(pitch.includes("skincare"));
    assert.ok(pitch.includes("12.5K followers"));
    assert.ok(!pitch.includes("{brand}"));
    assert.ok(!pitch.includes("{niche}"));
  });

  it("followerCount 0 uses the 'growing account' phrasing variant", () => {
    const r = runTool({ brand: "GlowCo", niche: "skincare", followerCount: 0, deliverable: "ugc" });
    assert.equal(r.ok, true);
    const pitch = r.values!.pitch as string;
    assert.ok(pitch.includes("growing account"));
    assert.ok(!pitch.includes("0 followers"));
  });

  it("all five deliverables produce distinct proposal lines", () => {
    const pitches = DELIVERABLES.map(
      (d) => runTool({ brand: "B", niche: "n", followerCount: 100, deliverable: d }).values!.pitch as string
    );
    assert.equal(new Set(pitches).size, 5);
  });

  it("subject lines: 6 filled templates, no leftover slots", () => {
    const r = runTool({ brand: "GlowCo", niche: "skincare", followerCount: 500, deliverable: "review" });
    const subjects = r.values!.subjectLines as string[];
    assert.equal(subjects.length, 6);
    for (const s of subjects) {
      assert.ok(!s.includes("{brand}") && !s.includes("{niche}"), s);
      assert.ok(s.includes("GlowCo") || s.includes("skincare"), s);
    }
  });

  it("brand is required", () => {
    const r = runTool({ niche: "skincare", followerCount: 100, deliverable: "reel" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Brand is required/);
  });

  it("blank brand is rejected", () => {
    const r = runTool({ brand: "   ", niche: "skincare", followerCount: 100, deliverable: "reel" });
    assert.equal(r.ok, false);
  });

  it("niche is required", () => {
    const r = runTool({ brand: "GlowCo", followerCount: 100, deliverable: "reel" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Niche is required/);
  });

  it("negative followerCount is rejected", () => {
    const r = runTool({ brand: "GlowCo", niche: "skincare", followerCount: -5, deliverable: "reel" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /0 or higher/);
  });

  it("missing followerCount is rejected", () => {
    const r = runTool({ brand: "GlowCo", niche: "skincare", deliverable: "reel" });
    assert.equal(r.ok, false);
  });

  it("unknown deliverable is rejected and lists valid options", () => {
    const r = runTool({ brand: "GlowCo", niche: "skincare", followerCount: 100, deliverable: "podcast" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("reel"));
    assert.ok(r.error!.includes("review"));
  });

  it("numeric string followerCount is accepted", () => {
    const r = runTool({ brand: "GlowCo", niche: "skincare", followerCount: "8500", deliverable: "story" });
    assert.equal(r.ok, true);
    assert.ok((r.values!.pitch as string).includes("8.5K followers"));
  });

  it("formatFollowers: exact, K, and M formatting", () => {
    assert.equal(formatFollowers(950), "950");
    assert.equal(formatFollowers(1000), "1K");
    assert.equal(formatFollowers(12500), "12.5K");
    assert.equal(formatFollowers(20000), "20K");
    assert.equal(formatFollowers(1500000), "1.5M");
    assert.equal(formatFollowers(2000000), "2M");
  });

  it("copyAll contains the pitch and the subject lines", () => {
    const r = runTool({ brand: "GlowCo", niche: "skincare", followerCount: 300, deliverable: "carousel" });
    const copyAll = r.values!.copyAll as string;
    assert.ok(copyAll.includes(r.values!.pitch as string));
    for (const s of r.values!.subjectLines as string[]) assert.ok(copyAll.includes(s));
  });

  it("output ids match meta.ts (pitch, subjectLines, copyAll)", () => {
    const r = runTool({ brand: "B", niche: "n", followerCount: 1, deliverable: "story" });
    assert.deepEqual(Object.keys(r.values!).sort(), ["copyAll", "pitch", "subjectLines"]);
  });

  it("bank sizes documented: 6 subject lines, 5 deliverables", () => {
    assert.equal(BANK_SIZES.subjectLines, 6);
    assert.equal(BANK_SIZES.deliverables, 5);
  });

  it("deterministic: same inputs give identical output", () => {
    const v = { brand: "GlowCo", niche: "skincare", followerCount: 9999, deliverable: "reel" };
    assert.deepEqual(runTool(v), runTool(v));
  });

  it("pitch is multi-paragraph with value bullets", () => {
    const r = runTool({ brand: "B", niche: "n", followerCount: 10, deliverable: "ugc" });
    const pitch = r.values!.pitch as string;
    assert.ok(pitch.split("\n\n").length >= 4);
    assert.ok(pitch.includes("•"));
  });

  it("null values object is rejected", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("brand and niche are trimmed", () => {
    const { pitch } = generatePitch("  GlowCo ", " skincare ", 100, "review");
    assert.ok(pitch.includes("Hi GlowCo team,"));
  });

  it("every deliverable has a human label", () => {
    for (const d of DELIVERABLES) assert.ok(DELIVERABLE_LABELS[d].length > 0, d);
  });

  it("assumptions state the follower count is never verified", () => {
    assert.ok(ASSUMPTIONS.some((a) => a.includes("never verified")));
    assert.ok(ASSUMPTIONS.some((a) => a.includes("growing account")));
  });
});
