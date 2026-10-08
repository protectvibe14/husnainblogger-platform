/**
 * Tests for the Testimonial Request Email Generator pure logic (tool-424).
 *
 * Run: node --test app/tools/email-marketing/testimonial-request-email-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  repeatedPhraseNotice,
  SUBJECT_TEMPLATES,
  SUBJECT_COUNT,
  OPENERS,
  ASK_FRAMINGS,
  EASE_LINES,
  INCENTIVE_LINES,
  CLOSERS,
  SIGNOFFS,
  MAX_SPECIFIC_ASK_CHARS,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

const VALID = {
  clientName: "Sarah",
  product: "Content Calendar Pro",
  specificAsk: "how it helped you plan a month of content in one afternoon",
  incentive: "a $10 Amazon gift card",
};

describe("runTool — happy path", () => {
  it("returns ok with subjectOptions (5) and bodyDraft", () => {
    const r = runTool({ ...VALID });
    assert.strictEqual(r.ok, true);
    assert.ok(r.values);
    const subjects = r.values!["subjectOptions"] as string[];
    assert.strictEqual(subjects.length, SUBJECT_COUNT);
    for (const s of subjects) {
      assert.strictEqual(typeof s, "string");
      assert.ok(s.length > 0, "no empty subject picks");
    }
    assert.strictEqual(typeof r.values!["bodyDraft"], "string");
  });

  it("embeds client, product, ask, and incentive in the body draft", () => {
    const r = runTool({ ...VALID });
    const body = r.values!["bodyDraft"] as string;
    assert.ok(body.includes("Hi Sarah,"));
    assert.ok(body.includes("Content Calendar Pro"));
    assert.ok(body.includes("how it helped you plan a month of content in one afternoon"));
    assert.ok(body.includes("a $10 Amazon gift card"));
  });

  it("subject options are distinct", () => {
    const r = runTool({ ...VALID });
    const subjects = r.values!["subjectOptions"] as string[];
    assert.strictEqual(new Set(subjects).size, subjects.length);
  });

  it("omits the incentive paragraph when no incentive is given", () => {
    const { incentive, ...rest } = VALID;
    const r = runTool(rest);
    assert.strictEqual(r.ok, true);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(!body.includes("a $10 Amazon gift card"));
    for (const line of INCENTIVE_LINES) {
      const filled = line.replace("{incentive}", "a $10 Amazon gift card");
      assert.ok(!body.includes(filled.split("{")[0].slice(0, 20)));
    }
  });

  it("treats an empty-string incentive as omitted", () => {
    const r = runTool({ ...VALID, incentive: "" });
    assert.strictEqual(r.ok, true);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(!body.includes("a $10 Amazon gift card"));
  });

  it("ends with the [Your Name] fallback signature", () => {
    const r = runTool({ ...VALID });
    const body = r.values!["bodyDraft"] as string;
    assert.ok(body.includes("[Your Name]"));
  });
});

describe("runTool — output ids match meta.ts", () => {
  it("values keys equal the meta outputs ids", () => {
    const r = runTool({ ...VALID });
    assert.ok(r.values);
    assert.deepStrictEqual(
      Object.keys(r.values!).sort(),
      metaOutputs.map((o) => o.id).sort(),
    );
    assert.deepStrictEqual(Object.keys(r.values!).sort(), ["bodyDraft", "subjectOptions"]);
  });
});

describe("runTool — validation errors", () => {
  it("errors when clientName is missing", () => {
    const { clientName, ...rest } = VALID;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Client name"));
  });

  it("errors when product is whitespace-only", () => {
    const r = runTool({ ...VALID, product: "  " });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Product"));
  });

  it("errors when specificAsk is missing", () => {
    const { specificAsk, ...rest } = VALID;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Specific ask"));
  });

  it("errors when clientName is not a string", () => {
    const r = runTool({ ...VALID, clientName: ["Sarah"] });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Client name"));
  });
});

describe("runTool — edge cases", () => {
  it("truncates overlong specificAsk with a visible notice", () => {
    const long = "x".repeat(MAX_SPECIFIC_ASK_CHARS + 30);
    const r = runTool({ ...VALID, specificAsk: long });
    assert.strictEqual(r.ok, true);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(body.includes("Notes:"));
    assert.ok(
      body.includes(`shortened from ${MAX_SPECIFIC_ASK_CHARS + 30} to ${MAX_SPECIFIC_ASK_CHARS}`),
    );
  });

  it("escapes HTML in user input (plain-text output)", () => {
    const r = runTool({ ...VALID, product: "Pro <img src=x>" });
    assert.strictEqual(r.ok, true);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(!body.includes("<img"));
    assert.ok(body.includes("&lt;img src=x&gt;"));
  });

  it("flags a repeated-word pattern with a visible notice", () => {
    const r = runTool({ ...VALID, specificAsk: "tell tell tell us everything" });
    assert.strictEqual(r.ok, true);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(body.includes("repeats 3+ times in a row"));
  });

  it("repeatedPhraseNotice returns null for clean copy", () => {
    assert.strictEqual(
      repeatedPhraseNotice("Thanks for using our product this month."),
      null,
    );
  });
});

describe("runTool — determinism and bank bounds", () => {
  it("returns identical output for identical inputs", () => {
    const a = runTool({ ...VALID });
    const b = runTool({ ...VALID });
    assert.deepStrictEqual(a, b);
  });

  it("uses the documented bank sizes with no empty picks", () => {
    assert.strictEqual(SUBJECT_TEMPLATES.length, 10);
    assert.strictEqual(OPENERS.length, 6);
    assert.strictEqual(ASK_FRAMINGS.length, 5);
    assert.strictEqual(EASE_LINES.length, 5);
    assert.strictEqual(INCENTIVE_LINES.length, 5);
    assert.strictEqual(CLOSERS.length, 5);
    assert.strictEqual(SIGNOFFS.length, 4);
    for (const bank of [
      SUBJECT_TEMPLATES, OPENERS, ASK_FRAMINGS, EASE_LINES, INCENTIVE_LINES, CLOSERS, SIGNOFFS,
    ]) {
      for (const entry of bank) {
        assert.ok(entry.trim().length > 0, "bank entry must not be empty");
      }
    }
  });
});
