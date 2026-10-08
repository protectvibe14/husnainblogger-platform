import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildPack,
  cleanField,
  validateStyle,
  STYLES,
  POSE_TEMPLATES,
  NEGATIVE_PROMPT,
} from "./logic.ts";

const GOOD = {
  profession: "software engineer",
  style: "corporate",
  background: "soft gray office background",
  attire: "a navy blazer",
};

describe("ai-headshot-prompt-pack-builder", () => {
  it("happy path: exactly 5 prompts plus the negative line", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const prompts = v["prompts"] as string[];
    assert.equal(prompts.length, 5);
    assert.equal(v["promptCount"], 5);
    assert.equal(v["negativePrompt"], NEGATIVE_PROMPT);
    for (const p of prompts) {
      assert.ok(p.includes("software engineer"));
      assert.ok(p.includes("a navy blazer"));
      assert.ok(p.includes("soft gray office background"));
      assert.ok(p.includes(STYLES["corporate"]));
    }
  });

  it("each prompt uses a different pose template", () => {
    const { prompts } = buildPack("doctor", "studio", "white studio backdrop", "scrubs");
    for (let i = 0; i < POSE_TEMPLATES.length; i++) {
      assert.ok(prompts[i].includes(POSE_TEMPLATES[i].split(",")[0]));
    }
    const unique = new Set(prompts);
    assert.equal(unique.size, 5);
  });

  it("every style is reflected in the prompts", () => {
    for (const key of Object.keys(STYLES)) {
      const r = runTool({ ...GOOD, style: key });
      assert.equal(r.ok, true, key);
      const prompts = (r.values as Record<string, unknown>)["prompts"] as string[];
      assert.ok(prompts.every((p) => p.includes(STYLES[key])));
    }
  });

  it("negative prompt is the fixed line, identical for all styles", () => {
    const a = (runTool({ ...GOOD, style: "corporate" }).values as Record<string, unknown>)["negativePrompt"];
    const b = (runTool({ ...GOOD, style: "outdoor" }).values as Record<string, unknown>)["negativePrompt"];
    assert.equal(a, b);
    assert.ok((a as string).includes("distorted face"));
  });

  it("style keys are case/space-insensitive", () => {
    assert.equal(validateStyle("  Studio "), "studio");
    assert.equal(validateStyle("nope"), null);
  });

  it("cleanField strips HTML tags and URLs", () => {
    assert.equal(cleanField("<b>lawyer</b> http://x.com"), "lawyer");
  });

  it("determinism: same inputs twice -> identical pack", () => {
    assert.deepEqual(runTool(GOOD), runTool(GOOD));
  });

  it("validation: missing or short fields -> error", () => {
    assert.equal(runTool({ ...GOOD, profession: "" }).ok, false);
    assert.equal(runTool({ ...GOOD, background: "x" }).ok, false);
    assert.equal(runTool({ style: "corporate" }).ok, false);
  });

  it("validation: invalid style -> error", () => {
    assert.equal(runTool({ ...GOOD, style: "noir" }).ok, false);
  });

  it("validation: field over max length -> error", () => {
    assert.equal(runTool({ ...GOOD, attire: "a".repeat(151) }).ok, false);
  });
});
