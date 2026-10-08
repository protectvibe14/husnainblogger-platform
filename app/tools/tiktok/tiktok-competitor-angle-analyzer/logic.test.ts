import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  HOOK_TYPES,
  CONTENT_ANGLES,
  CTA_KEYWORDS,
  GAP_BANK,
  MIN_POST_LENGTH,
  MAX_POST_LENGTH,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = ["hookType", "contentAngle", "ctaDetected", "gaps"];

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values;
}

const tutorialText = "How to edit your TikTok videos step by step. In this tutorial I will show you exactly how to cut clips and add captions. Follow along with this beginner guide and let me show you each step.";
const storyText = "Storytime: last year when I started my business, my boss told me I would fail. True story — here is what happened when I launched anyway.";

describe("tiktok-competitor-angle-analyzer", () => {
  it("happy path: tutorial text -> Tutorial Hook + Educational angle", () => {
    const v = okValues({ pastedCompetitorPost: tutorialText, niche: "video editing" });
    assert.ok((v.hookType as string).startsWith("Tutorial Hook"), `got: ${v.hookType}`);
    assert.ok((v.contentAngle as string).startsWith("Educational"), `got: ${v.contentAngle}`);
    assert.ok((v.gaps as string[]).length === 6, "six gaps");
    assert.ok((v.gaps as string[]).every((g) => g.length > 0 && !g.includes("[ANGLE]")), "gaps filled");
  });

  it("story text -> Story Opening hook", () => {
    const v = okValues({ pastedCompetitorPost: storyText });
    assert.ok((v.hookType as string).startsWith("Story Opening"), `got: ${v.hookType}`);
  });

  it("question hook detection", () => {
    const v = okValues({ pastedCompetitorPost: "Have you ever wondered why your videos get zero views? Quick question for creators: did you know the first 3 seconds decide everything? Here is why it matters." });
    assert.ok((v.hookType as string).startsWith("Question Hook"), `got: ${v.hookType}`);
  });

  it("CTA keywords detected", () => {
    const v = okValues({ pastedCompetitorPost: tutorialText + " Follow for more and comment your favorite editing app below!" });
    assert.ok((v.ctaDetected as string).includes("follow"), "follow detected");
    assert.ok((v.ctaDetected as string).includes("comment"), "comment detected");
  });

  it("no CTA -> 'No CTA detected' message", () => {
    const noCta = "My morning skincare routine: cleanse for 60 seconds, pat dry, then apply moisturizer while skin is damp. This simple order changed my skin barrier in three weeks of daily use.";
    const v = okValues({ pastedCompetitorPost: noCta });
    assert.match(v.ctaDetected as string, /No CTA detected/);
    assert.ok((v.gaps as string[]).some((g) => g.includes("No clear CTA")), "CTA gap included");
  });

  it("CTA present -> comment-bait gap included instead", () => {
    const v = okValues({ pastedCompetitorPost: tutorialText + " Follow and share this with a friend who edits videos." });
    assert.ok((v.gaps as string[]).some((g) => g.includes("comment-bait")), "comment-bait gap included");
  });

  it("determinism: same text -> identical analysis", () => {
    const input = { pastedCompetitorPost: tutorialText, niche: "fitness" };
    assert.deepEqual(runTool(input).values, runTool(input).values);
  });

  it("niche slot is filled in gaps", () => {
    const v = okValues({ pastedCompetitorPost: tutorialText, niche: "skincare" });
    assert.ok(!(v.gaps as string[]).some((g) => g.includes("[NICHE]")), "no unfilled niche slots");
    assert.ok((v.gaps as string[]).some((g) => g.includes("skincare")), "niche used");
  });

  it("missing pastedCompetitorPost -> error", () => {
    const r = runTool({ niche: "fitness" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /paste/i);
  });

  it("empty pastedCompetitorPost -> error", () => {
    const r = runTool({ pastedCompetitorPost: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /paste/i);
  });

  it("bare @handle is refused with explanatory error", () => {
    const r = runTool({ pastedCompetitorPost: "@somecompetitor" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /can’t look up TikTok accounts/);
  });

  it("'analyze @handle' phrasing is refused", () => {
    const r = runTool({ pastedCompetitorPost: "analyze @somecompetitor" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /can’t look up/);
  });

  it("TikTok URL alone is refused", () => {
    const r = runTool({ pastedCompetitorPost: "https://www.tiktok.com/@someone/video/123" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /can’t look up/);
  });

  it("too-short text -> error", () => {
    const r = runTool({ pastedCompetitorPost: "short text here!" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /too short/);
  });

  it("too-long text -> error", () => {
    const r = runTool({ pastedCompetitorPost: "x".repeat(MAX_POST_LENGTH + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /too long/);
  });

  it("niche too long -> error", () => {
    const r = runTool({ pastedCompetitorPost: tutorialText, niche: "x".repeat(49) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /48/);
  });

  it("niche is optional: works without it", () => {
    const v = okValues({ pastedCompetitorPost: tutorialText });
    assert.ok((v.gaps as string[]).length === 6);
  });

  it("taxonomies match documented sizes", () => {
    assert.equal(HOOK_TYPES.length, 10);
    assert.equal(CONTENT_ANGLES.length, 6);
    assert.equal(CTA_KEYWORDS.length, 10);
    assert.equal(GAP_BANK.length, 12);
    for (const e of HOOK_TYPES) assert.ok(e.keywords.length > 0, `${e.id} has signals`);
    for (const e of CONTENT_ANGLES) assert.ok(e.keywords.length > 0, `${e.id} has signals`);
  });

  it("output ids match meta.ts outputs", () => {
    const ids = outputs.map((o) => o.id).sort();
    assert.deepEqual(ids, EXPECTED_OUTPUT_IDS.slice().sort());
  });

  it("never claims to fetch accounts or see real profiles", () => {
    const v = okValues({ pastedCompetitorPost: tutorialText });
    const blob = JSON.stringify(v).toLowerCase();
    assert.ok(!blob.includes("fetch"), "no fetch claims");
    assert.ok(!blob.includes("scrape"), "no scrape claims");
    assert.ok(!blob.includes("profile views"), "no fake analytics");
  });

  it("bold claim hook detection", () => {
    const v = okValues({ pastedCompetitorPost: "The secret nobody talks about: stop doing cardio if you want results. This changed my life and the truth about fat loss will shock you." });
    assert.ok((v.hookType as string).startsWith("Bold Claim"), `got: ${v.hookType}`);
  });
});
