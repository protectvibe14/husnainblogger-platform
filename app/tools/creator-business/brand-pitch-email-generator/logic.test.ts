import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  sanitize,
  normalizePitchAngle,
  parseEngagementRate,
  parsePastResults,
  assembleDraft,
  PITCH_ANGLES,
  DEFAULT_PITCH_ANGLE,
  DEFAULT_CALL_TO_ACTION,
  MAX_RESULTS_LINES,
} from "./logic.ts";

const base = {
  brandName: "GlowLab",
  creatorName: "Maya Khan",
  niche: "skincare",
  followerCount: "125K",
  engagementRate: 4.2,
  pastResults: "Drove 800 link clicks for a serum launch\n2 past brand deals completed",
  pitchAngle: "value-first",
  callToAction: "a 20-minute call on Thursday",
};

function draftOf(result: { ok: boolean; values?: { pitchEmailDraft: string } }): string {
  assert.equal(result.ok, true);
  return result.values?.pitchEmailDraft ?? "";
}

describe("brand-pitch-email-generator (tool-467)", () => {
  it("happy path: returns exactly one output key pitchEmailDraft", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}), ["pitchEmailDraft"]);
  });

  it("draft contains brand name, creator name, and niche", () => {
    const d = draftOf(runTool(base));
    assert.ok(d.includes("GlowLab"));
    assert.ok(d.includes("Maya Khan"));
    assert.ok(d.includes("skincare"));
  });

  it("draft has exactly 3 subject options plus a body section", () => {
    const d = draftOf(runTool(base));
    assert.ok(d.includes("SUBJECT OPTIONS"));
    assert.ok(d.includes("1."));
    assert.ok(d.includes("2."));
    assert.ok(d.includes("3."));
    assert.ok(!d.includes("4. "));
    assert.ok(d.includes("EMAIL BODY:"));
  });

  it("metrics are echoed as user-provided, never verified", () => {
    const d = draftOf(runTool({ ...base, pitchAngle: "data-driven" }));
    assert.ok(d.includes("125K"));
    assert.ok(d.includes("4.2"));
    assert.ok(d.includes("self-reported"));
  });

  it("past results are rendered as bullet lines", () => {
    const d = draftOf(runTool(base));
    assert.ok(d.includes("- Drove 800 link clicks for a serum launch"));
    assert.ok(d.includes("- 2 past brand deals completed"));
  });

  it("missing brandName returns a human error", () => {
    const r = runTool({ ...base, brandName: "   " });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").toLowerCase().includes("brand name"));
  });

  it("missing creatorName returns a human error", () => {
    const r = runTool({ ...base, creatorName: "" });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").toLowerCase().includes("your name"));
  });

  it("non-object input returns a human error", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("unknown pitchAngle falls back to the default angle", () => {
    assert.equal(normalizePitchAngle("nonsense"), DEFAULT_PITCH_ANGLE);
    const d = draftOf(runTool({ ...base, pitchAngle: "nonsense" }));
    assert.ok(d.includes("GlowLab"));
  });

  it("each of the 5 angles produces a distinct body", () => {
    const bodies = PITCH_ANGLES.map((a) =>
      assembleDraft({
        brandName: "B",
        creatorName: "C",
        niche: "n",
        followerCount: "1K",
        engagementRate: 3,
        pastResults: [],
        pitchAngle: a,
        callToAction: "a call",
      }),
    );
    const unique = new Set(bodies);
    assert.equal(unique.size, PITCH_ANGLES.length);
  });

  it("engagementRate above 100 is rejected", () => {
    const r = runTool({ ...base, engagementRate: 150 });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("100"));
  });

  it("engagementRate non-numeric is rejected", () => {
    const r = runTool({ ...base, engagementRate: "high" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("empty engagementRate is allowed and shows a placeholder", () => {
    const d = draftOf(runTool({ ...base, pitchAngle: "data-driven", engagementRate: "" }));
    assert.ok(d.includes("[your engagement rate]"));
  });

  it("empty callToAction falls back to the default CTA", () => {
    const d = draftOf(runTool({ ...base, callToAction: "" }));
    assert.ok(d.includes(DEFAULT_CALL_TO_ACTION));
  });

  it("empty niche falls back to a generic phrase", () => {
    const d = draftOf(runTool({ ...base, niche: "" }));
    assert.ok(d.includes("content creation"));
  });

  it("HTML tags are stripped from inputs", () => {
    assert.equal(sanitize("<b>GlowLab</b>"), "GlowLab");
    const d = draftOf(runTool({ ...base, brandName: "<script>alert(1)</script>GlowLab" }));
    assert.ok(!d.includes("<script>"));
    assert.ok(d.includes("GlowLab"));
  });

  it("parseEngagementRate accepts numeric strings", () => {
    assert.deepEqual(parseEngagementRate("4.5"), { rate: 4.5, error: null });
  });

  it("parsePastResults caps lines at MAX_RESULTS_LINES", () => {
    const many = Array.from({ length: 30 }, (_, i) => `result ${i}`).join("\n");
    assert.equal(parsePastResults(many).length, MAX_RESULTS_LINES);
  });

  it("same inputs produce byte-identical output (deterministic)", () => {
    const a = draftOf(runTool(base));
    const b = draftOf(runTool(base));
    assert.equal(a, b);
  });

  it("custom CTA is used verbatim in the body", () => {
    const d = draftOf(runTool({ ...base, callToAction: "coffee in Austin next Tuesday" }));
    assert.ok(d.includes("coffee in Austin next Tuesday"));
  });
});
