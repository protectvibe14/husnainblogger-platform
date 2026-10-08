import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildPitch,
  CONTENT_TYPES,
  DELIVERABLES_BANK,
  MAX_TEXT_LENGTH,
} from "./logic.ts";

const VALID = {
  brand: "GlowLab",
  niche: "skincare for beginners",
  contentType: "Product unboxing video",
};

describe("ugc-pitch-template-generator", () => {
  it("happy path: builds pitch, deliverables, and follow-up", () => {
    const res = runTool(VALID);
    assert.equal(res.ok, true);
    assert.ok((res.values!.pitch as string).length > 0);
    assert.equal((res.values!.deliverablesList as string[]).length, 4);
    assert.ok((res.values!.followUpTemplate as string).length > 0);
  });

  it("output ids match meta.ts outputs", () => {
    const res = runTool(VALID);
    assert.deepEqual(Object.keys(res.values!).sort(), [
      "deliverablesList",
      "followUpTemplate",
      "pitch",
    ]);
  });

  it("pitch contains the brand, niche, and content type", () => {
    const res = runTool(VALID);
    const pitch = res.values!.pitch as string;
    assert.ok(pitch.includes("GlowLab"));
    assert.ok(pitch.includes("skincare for beginners"));
    assert.ok(pitch.includes("product unboxing video"));
  });

  it("follow-up contains the brand and niche", () => {
    const res = runTool(VALID);
    const followUp = res.values!.followUpTemplate as string;
    assert.ok(followUp.includes("GlowLab"));
    assert.ok(followUp.includes("skincare for beginners"));
  });

  it("optional rate is included when provided", () => {
    const res = runTool({ ...VALID, rate: "$150" });
    assert.equal(res.ok, true);
    assert.ok((res.values!.pitch as string).includes("My rate for this package is $150."));
  });

  it("missing rate falls back to the flexible line", () => {
    const res = runTool(VALID);
    assert.equal(res.ok, true);
    assert.ok((res.values!.pitch as string).includes("My rates are flexible"));
  });

  it("deliverables differ per content type", () => {
    for (const type of CONTENT_TYPES) {
      const res = runTool({ ...VALID, contentType: type });
      assert.equal(res.ok, true);
      assert.equal((res.values!.deliverablesList as string[]).length, 4);
    }
    const a = runTool({ ...VALID, contentType: "Product unboxing video" }).values!.deliverablesList;
    const b = runTool({ ...VALID, contentType: "Photo carousel post" }).values!.deliverablesList;
    assert.notDeepEqual(a, b);
  });

  it("no unfilled template slots remain", () => {
    const res = runTool({ ...VALID, rate: "$200" });
    assert.equal(res.ok, true);
    for (const key of ["pitch", "followUpTemplate"] as const) {
      assert.ok(!(res.values![key] as string).includes("{"), key);
    }
  });

  it("validation: missing brand fails", () => {
    const { brand, ...rest } = VALID;
    const res = runTool(rest);
    assert.equal(res.ok, false);
    assert.match(String(res.error), /brand name/i);
  });

  it("validation: blank brand fails", () => {
    const res = runTool({ ...VALID, brand: "  " });
    assert.equal(res.ok, false);
    assert.equal(typeof res.error, "string");
  });

  it("validation: missing niche fails", () => {
    const { niche, ...rest } = VALID;
    const res = runTool(rest);
    assert.equal(res.ok, false);
    assert.match(String(res.error), /niche/i);
  });

  it("validation: missing content type fails", () => {
    const { contentType, ...rest } = VALID;
    const res = runTool(rest);
    assert.equal(res.ok, false);
    assert.match(String(res.error), /content type/i);
  });

  it("validation: unknown content type fails", () => {
    const res = runTool({ ...VALID, contentType: "Dance challenge" });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /not a valid content type/);
  });

  it("validation: brand over 120 chars fails", () => {
    const res = runTool({ ...VALID, brand: "b".repeat(MAX_TEXT_LENGTH + 1) });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /120 characters/);
  });

  it("validation: rate over 120 chars fails", () => {
    const res = runTool({ ...VALID, rate: "r".repeat(MAX_TEXT_LENGTH + 1) });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /rate must be/);
  });

  it("accepts surrounding whitespace in text inputs", () => {
    const res = runTool({ ...VALID, brand: "  GlowLab  " });
    assert.equal(res.ok, true);
    assert.ok((res.values!.pitch as string).includes("Hi GlowLab team,"));
  });

  it("determinism: same inputs twice give identical output", () => {
    assert.deepEqual(runTool({ ...VALID, rate: "$100" }), runTool({ ...VALID, rate: "$100" }));
  });

  it("determinism: buildPitch is stable", () => {
    assert.deepEqual(
      buildPitch("A", "b", CONTENT_TYPES[0], ""),
      buildPitch("A", "b", CONTENT_TYPES[0], ""),
    );
  });

  it("word-bank bounds: 5 content types, 4 deliverables each", () => {
    assert.equal(CONTENT_TYPES.length, 5);
    for (const type of CONTENT_TYPES) {
      assert.ok(DELIVERABLES_BANK[type], type);
      assert.equal(DELIVERABLES_BANK[type].length, 4, type);
      for (const d of DELIVERABLES_BANK[type]) assert.ok(d.length > 0, type);
    }
  });

  it("pitch includes a [Your Name] signature placeholder", () => {
    const res = runTool(VALID);
    assert.ok((res.values!.pitch as string).includes("[Your Name]"));
  });

  it("rate placeholder text only appears when rate is missing", () => {
    const withRate = runTool({ ...VALID, rate: "$150" }).values!.pitch as string;
    const withoutRate = runTool(VALID).values!.pitch as string;
    assert.ok(!withRate.includes("happy to discuss"));
    assert.ok(withoutRate.includes("happy to discuss"));
  });
});
