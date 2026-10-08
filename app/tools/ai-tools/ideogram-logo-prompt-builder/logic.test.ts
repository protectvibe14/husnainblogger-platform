import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildLogoPrompt,
  cleanField,
  validateStyle,
  STYLES,
  VARIATION_TEMPLATES,
  NEGATIVE_PROMPT,
} from "./logic.ts";

const GOOD = {
  brandName: "Bean & Brew",
  industry: "coffee shop",
  style: "vintage",
  colors: "brown and cream",
  tagline: "slow mornings",
};

describe("ideogram-logo-prompt-builder", () => {
  it("happy path: prompt, negative, 3 variations and the Ideogram note", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const prompt = v["logoPrompt"] as string;
    assert.ok(prompt.includes('"Bean & Brew"'));
    assert.ok(prompt.includes("coffee shop"));
    assert.ok(prompt.includes(STYLES["vintage"]));
    assert.ok(prompt.includes("brown and cream"));
    assert.ok(prompt.includes('tagline "slow mornings"'));
    assert.equal(v["negativePrompt"], NEGATIVE_PROMPT);
    const variations = v["variations"] as string[];
    assert.equal(variations.length, 3);
    assert.ok(variations.every((x) => x.includes('"Bean & Brew"')));
    assert.ok((v["note"] as string).toLowerCase().includes("ideogram"));
    assert.ok((v["note"] as string).toLowerCase().includes("text rendering varies"));
  });

  it("variations follow the 3 fixed templates", () => {
    const { logoPrompt, variations } = buildLogoPrompt("Acme", "saas", "minimalist", "blue and white", "");
    for (let i = 0; i < VARIATION_TEMPLATES.length; i++) {
      assert.equal(
        variations[i],
        VARIATION_TEMPLATES[i].replace("{prompt}", logoPrompt),
      );
    }
  });

  it("tagline is optional and omitted when empty or missing", () => {
    const empty = runTool({ ...GOOD, tagline: "" });
    assert.equal(empty.ok, true);
    assert.ok(
      !((empty.values as Record<string, unknown>)["logoPrompt"] as string).includes("tagline"),
    );
    const { tagline: _omit, ...noTagline } = GOOD;
    const missing = runTool(noTagline);
    assert.equal(missing.ok, true);
    assert.ok(
      !((missing.values as Record<string, unknown>)["logoPrompt"] as string).includes("tagline"),
    );
  });

  it("tagline is truncated to the max field length", () => {
    const r = runTool({ ...GOOD, tagline: "t".repeat(150) });
    assert.equal(r.ok, true);
    const prompt = (r.values as Record<string, unknown>)["logoPrompt"] as string;
    assert.ok(prompt.includes("t".repeat(100)));
    assert.ok(!prompt.includes("t".repeat(101)));
  });

  it("every style is accepted and reflected", () => {
    for (const key of Object.keys(STYLES)) {
      const r = runTool({ ...GOOD, tagline: "x", style: key });
      assert.equal(r.ok, true, key);
      assert.ok((r.values as Record<string, unknown>)["logoPrompt"] as string);
    }
  });

  it("style keys are case/space-insensitive", () => {
    assert.equal(validateStyle("  Minimalist "), "minimalist");
    assert.equal(validateStyle("nope"), null);
  });

  it("cleanField strips HTML and URLs", () => {
    assert.equal(cleanField("<b>Acme</b> http://x.com"), "Acme");
  });

  it("determinism: same inputs twice -> identical output", () => {
    const args = { ...GOOD, tagline: "slow mornings" };
    assert.deepEqual(runTool(args), runTool(args));
  });

  it("validation: missing or short fields -> error", () => {
    assert.equal(runTool({ ...GOOD, brandName: "" }).ok, false);
    assert.equal(runTool({ ...GOOD, industry: "x" }).ok, false);
    assert.equal(runTool({ ...GOOD, colors: "" }).ok, false);
    assert.equal(runTool({ style: "minimalist" }).ok, false);
  });

  it("validation: invalid style -> error", () => {
    assert.equal(runTool({ ...GOOD, style: "photorealistic" }).ok, false);
  });

  it("validation: field over max length -> error", () => {
    assert.equal(runTool({ ...GOOD, brandName: "b".repeat(101) }).ok, false);
  });
});
