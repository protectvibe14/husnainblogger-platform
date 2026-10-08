import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  normalizeVideoType,
  SCRIPT_PROMPT_TEMPLATES,
  VIDEO_TYPES,
} from "./logic.ts";

describe("youtube-script-prompt-pack (tool-304)", () => {
  it("pack holds exactly 5 fixed templates, one per video type", () => {
    assert.equal(VIDEO_TYPES.length, 5);
    assert.deepEqual(Object.keys(SCRIPT_PROMPT_TEMPLATES).sort(), [...VIDEO_TYPES].sort());
  });

  it("each video type returns its own distinct template", () => {
    const seen = new Set<string>();
    for (const vt of VIDEO_TYPES) {
      const r = runTool({ videoType: vt });
      assert.equal(r.ok, true);
      const t = r.values?.template ?? "";
      assert.ok(t.length > 200, `template for ${vt} too short`);
      assert.ok(!seen.has(t), `duplicate template for ${vt}`);
      seen.add(t);
    }
  });

  it("tutorial template covers hook, steps, mistakes, recap", () => {
    const t = runTool({ videoType: "tutorial" }).values?.template ?? "";
    assert.ok(t.includes("HOOK"));
    assert.ok(t.includes("STEPS"));
    assert.ok(t.includes("COMMON MISTAKES"));
    assert.ok(t.includes("RECAP"));
  });

  it("review template warns against inventing specifications", () => {
    const t = runTool({ videoType: "review" }).values?.template ?? "";
    assert.ok(t.includes("Do not invent specifications"));
    assert.ok(t.includes("VERDICT"));
  });

  it("commentary template requires verified facts", () => {
    const t = runTool({ videoType: "commentary" }).values?.template ?? "";
    assert.ok(t.includes("verified facts"));
  });

  it("every template uses [PLACEHOLDER] syntax and names a CTA", () => {
    for (const vt of VIDEO_TYPES) {
      const t = SCRIPT_PROMPT_TEMPLATES[vt];
      assert.ok(/\[[A-Z][A-Z0-9 _/-]*\]/.test(t), `${vt} missing placeholders`);
      assert.ok(t.includes("CALL TO ACTION"), `${vt} missing CTA slot`);
    }
  });

  it("every template includes a target-length slot", () => {
    for (const vt of VIDEO_TYPES) {
      assert.ok(
        SCRIPT_PROMPT_TEMPLATES[vt].includes("[X] minutes"),
        `${vt} missing length slot`,
      );
    }
  });

  it("video type matching is case-insensitive and trims whitespace", () => {
    assert.equal(normalizeVideoType("  Tutorial "), "tutorial");
    assert.equal(normalizeVideoType("VLOG"), "vlog");
  });

  it("missing video type -> error listing the 5 options", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("Video type is required"));
    for (const vt of VIDEO_TYPES) assert.ok((r.error ?? "").includes(vt));
  });

  it("unknown video type -> error", () => {
    const r = runTool({ videoType: "livestream" });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("livestream") || (r.error ?? "").includes("Video type is required"));
  });

  it("non-string video type -> error", () => {
    const r = runTool({ videoType: 42 });
    assert.equal(r.ok, false);
  });

  it("deterministic: same input twice -> identical output", () => {
    const a = runTool({ videoType: "review" });
    const b = runTool({ videoType: "review" });
    assert.deepEqual(a, b);
  });

  it("output key is 'template' matching meta.ts outputs", () => {
    const r = runTool({ videoType: "unboxing" });
    assert.ok(r.ok);
    assert.deepEqual(Object.keys(r.values ?? {}), ["template"]);
  });

  it("templates never claim AI generation", () => {
    const banned = /as an ai|language model|i will generate/i;
    for (const vt of VIDEO_TYPES) {
      assert.ok(!banned.test(SCRIPT_PROMPT_TEMPLATES[vt]), `banned phrase in ${vt}`);
    }
  });

  it("normalizeVideoType returns null for empty/unknown", () => {
    assert.equal(normalizeVideoType(""), null);
    assert.equal(normalizeVideoType("podcast"), null);
    assert.equal(normalizeVideoType(null), null);
  });
});
