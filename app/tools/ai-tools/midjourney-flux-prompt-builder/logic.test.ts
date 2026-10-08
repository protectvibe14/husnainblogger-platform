import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildPrompts,
  sanitizeSubject,
  validateSelect,
  pickLighting,
  STYLES,
  DETAILS,
  ASPECTS,
  LIGHTING_BANK,
  MIDJOURNEY_VERSION_FLAG,
} from "./logic.ts";

describe("midjourney-flux-prompt-builder", () => {
  it("happy path: builds both prompts deterministically", () => {
    const r = runTool({
      subject: "a lighthouse on a rocky cliff",
      style: "cinematic",
      aspect: "16:9",
      detailLevel: "balanced",
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v["subject"], "a lighthouse on a rocky cliff");
    assert.equal(v["style"], "cinematic");
    assert.equal(v["aspect"], "16:9");
    assert.equal(v["detailLevel"], "balanced");
    assert.ok((v["midjourneyPrompt"] as string).startsWith("a lighthouse on a rocky cliff"));
    assert.ok((v["midjourneyPrompt"] as string).includes("--ar 16:9"));
    assert.ok((v["midjourneyPrompt"] as string).includes(MIDJOURNEY_VERSION_FLAG));
    assert.ok((v["fluxPrompt"] as string).includes("a lighthouse on a rocky cliff"));
  });

  it("flux prompt has no parameter flags (--ar/--v)", () => {
    const r = runTool({
      subject: "mountain cabin",
      style: "photorealistic",
      aspect: "1:1",
      detailLevel: "simple",
    });
    assert.equal(r.ok, true);
    const flux = (r.values as Record<string, unknown>)["fluxPrompt"] as string;
    assert.ok(!flux.includes("--ar"));
    assert.ok(!flux.includes("--v"));
  });

  it("midjourneyParams echoes the --ar and version flag", () => {
    const { midjourneyParams } = buildPrompts("cat", "anime", "9:16", "simple");
    assert.equal(midjourneyParams, "--ar 9:16 --v 6");
  });

  it("every style key produces a prompt containing its descriptor", () => {
    for (const key of Object.keys(STYLES)) {
      const r = runTool({ subject: "old bicycle", style: key, aspect: "1:1", detailLevel: "balanced" });
      assert.equal(r.ok, true, `style ${key} failed`);
      const mj = (r.values as Record<string, unknown>)["midjourneyPrompt"] as string;
      assert.ok(mj.includes(STYLES[key].split(",")[0]));
    }
  });

  it("every detail level is reflected in output", () => {
    for (const key of Object.keys(DETAILS)) {
      const { midjourneyPrompt } = buildPrompts("tree", "watercolor", "4:3", key);
      assert.ok(midjourneyPrompt.includes(DETAILS[key]));
    }
  });

  it("every aspect ratio appears in the params", () => {
    for (const key of Object.keys(ASPECTS)) {
      const { midjourneyParams } = buildPrompts("tree", "watercolor", key, "simple");
      assert.ok(midjourneyParams.includes(`--ar ${ASPECTS[key]}`));
    }
  });

  it("lighting is deterministic: same subject -> same lighting", () => {
    const a = pickLighting("red sports car");
    const b = pickLighting("red sports car");
    assert.equal(a, b);
    assert.ok(LIGHTING_BANK.includes(a));
  });

  it("determinism: same inputs twice -> identical output", () => {
    const args = { subject: "city skyline at dusk", style: "cyberpunk", aspect: "16:9", detailLevel: "highly-detailed" };
    assert.deepEqual(runTool(args), runTool(args));
  });

  it("select keys are case/space-insensitive", () => {
    assert.equal(validateSelect("  Cinematic ", STYLES), "cinematic");
    assert.equal(validateSelect("9:16", ASPECTS), "9:16");
    assert.equal(validateSelect("bogus", STYLES), null);
    assert.equal(validateSelect(123, STYLES), null);
  });

  it("sanitizeSubject strips HTML tags and URLs", () => {
    assert.equal(
      sanitizeSubject('<b>lighthouse</b> https://example.com/photo'),
      "lighthouse",
    );
  });

  it("validation: missing subject -> error", () => {
    const r = runTool({ style: "cinematic", aspect: "16:9", detailLevel: "balanced" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: subject too short -> error", () => {
    const r = runTool({ subject: "x", style: "cinematic", aspect: "16:9", detailLevel: "balanced" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: subject over max length -> error", () => {
    const r = runTool({
      subject: "s".repeat(201),
      style: "cinematic",
      aspect: "16:9",
      detailLevel: "balanced",
    });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: invalid style -> error listing options", () => {
    const r = runTool({ subject: "cat", style: "nope", aspect: "1:1", detailLevel: "simple" });
    assert.equal(r.ok, false);
    assert.ok((r.error as string).includes("photorealistic"));
  });

  it("validation: invalid aspect -> error", () => {
    const r = runTool({ subject: "cat", style: "anime", aspect: "2:1", detailLevel: "simple" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: invalid detailLevel -> error", () => {
    const r = runTool({ subject: "cat", style: "anime", aspect: "1:1", detailLevel: "extreme" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: non-string subject -> error", () => {
    const r = runTool({ subject: 42, style: "anime", aspect: "1:1", detailLevel: "simple" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });
});
