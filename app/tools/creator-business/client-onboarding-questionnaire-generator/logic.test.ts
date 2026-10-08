/**
 * Tests for the Client Onboarding Questionnaire Generator pure logic (tool-465).
 *
 * Run: node --test app/tools/creator-business/client-onboarding-questionnaire-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  generateQuestionnaire,
  parseSections,
  SECTIONS,
  SERVICE_TYPES,
} from "./logic.ts";

describe("parseSections", () => {
  it("parses comma-separated strings in canonical order", () => {
    assert.deepStrictEqual(parseSections("budget, goals"), ["goals", "budget"]);
  });
  it("parses newline-separated strings and arrays", () => {
    assert.deepStrictEqual(parseSections("audience\nlogistics"), [
      "audience",
      "logistics",
    ]);
    assert.deepStrictEqual(parseSections(["brand", "brand", "goals"]), [
      "goals",
      "brand",
    ]);
  });
  it("drops unknown section ids", () => {
    assert.deepStrictEqual(parseSections("goals, unicorns"), ["goals"]);
  });
  it("returns [] for empty or non-string input", () => {
    assert.deepStrictEqual(parseSections(""), []);
    assert.deepStrictEqual(parseSections(null), []);
    assert.deepStrictEqual(parseSections([]), []);
  });
});

describe("generateQuestionnaire — structure", () => {
  it("groups questions under section headings", () => {
    const text = generateQuestionnaire({
      serviceType: "design",
      includeSections: ["goals", "budget"],
    });
    assert.ok(text.includes("GOALS & SUCCESS METRICS"));
    assert.ok(text.includes("BUDGET & TIMELINE"));
    assert.ok(!text.includes("BRAND & VOICE"));
  });
  it("numbers questions continuously across sections", () => {
    const text = generateQuestionnaire({
      serviceType: "design",
      includeSections: ["goals", "budget"],
    });
    assert.ok(text.includes("1. What is the #1 outcome"));
    assert.ok(text.includes("6. What budget range"));
  });
  it("appends service-specific questions for a known service type", () => {
    const text = generateQuestionnaire({
      serviceType: "video",
      includeSections: ["goals"],
    });
    assert.ok(text.includes("VIDEO-SPECIFIC QUESTIONS"));
    assert.ok(text.includes("target runtime"));
  });
  it("adds no service-specific block for 'other'", () => {
    const text = generateQuestionnaire({
      serviceType: "other",
      includeSections: ["goals"],
    });
    assert.ok(!text.includes("SPECIFIC QUESTIONS"));
    assert.ok(text.includes("Total questions: 5."));
  });
  it("reports the total question count", () => {
    const text = generateQuestionnaire({
      serviceType: "marketing",
      includeSections: ["goals", "brand", "audience", "logistics", "budget"],
    });
    // 5 sections x 5 questions + 3 marketing questions = 28
    assert.ok(text.includes("Total questions: 28."));
  });
  it("includes the service type label in the header", () => {
    const text = generateQuestionnaire({
      serviceType: "writing",
      includeSections: ["goals"],
    });
    assert.ok(text.includes("Service type: Writing"));
  });
  it("is deterministic", () => {
    const input = { serviceType: "design" as const, includeSections: ["goals" as const] };
    assert.strictEqual(generateQuestionnaire(input), generateQuestionnaire(input));
  });
});

describe("runTool — validation", () => {
  it("generates a questionnaire for valid inputs", () => {
    const r = runTool({
      serviceType: "design",
      includeSections: "goals, brand",
    });
    assert.strictEqual(r.ok, true);
    assert.ok(typeof r.values!.questionnaireDocument === "string");
  });
  it("rejects a missing service type", () => {
    const r = runTool({ includeSections: "goals" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error);
  });
  it("rejects an unknown service type", () => {
    const r = runTool({ serviceType: "plumbing", includeSections: "goals" });
    assert.strictEqual(r.ok, false);
  });
  it("rejects when no valid section is selected", () => {
    assert.strictEqual(
      runTool({ serviceType: "design", includeSections: "" }).ok,
      false,
    );
    assert.strictEqual(
      runTool({ serviceType: "design", includeSections: "unicorns" }).ok,
      false,
    );
  });
  it("accepts arrays for includeSections", () => {
    const r = runTool({
      serviceType: "social-media",
      includeSections: ["audience", "logistics"],
    });
    assert.strictEqual(r.ok, true);
    assert.ok((r.values as Record<string, string>).questionnaireDocument.includes("AUDIENCE"));
    assert.ok((r.values as Record<string, string>).questionnaireDocument.includes("SOCIAL MEDIA-SPECIFIC QUESTIONS"));
  });
  it("output key is exactly questionnaireDocument", () => {
    const r = runTool({ serviceType: "design", includeSections: "goals" });
    assert.deepStrictEqual(Object.keys(r.values!), ["questionnaireDocument"]);
  });
  it("bank totals: SECTIONS and SERVICE_TYPES match the documented bank", () => {
    assert.strictEqual(SECTIONS.length, 5);
    assert.strictEqual(SERVICE_TYPES.length, 7);
  });
});
