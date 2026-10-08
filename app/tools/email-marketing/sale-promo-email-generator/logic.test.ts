/**
 * Tests for the Sale/Promo Email Generator pure logic (tool-423).
 *
 * Run: node --test app/tools/email-marketing/sale-promo-email-generator/logic.test.ts
 *
 * The honesty guardrail is tested explicitly: without a user-supplied
 * deadline, no urgency copy (subjects or body) may appear.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  repeatedPhraseNotice,
  SUBJECT_TEMPLATES,
  SUBJECT_COUNT,
  TONES,
  OPENERS,
  BODY_PATTERNS,
  CTA_LINES,
  URGENCY_TEMPLATES,
  URGENT_SUBJECT_INDEXES,
  SIGNOFFS,
  NO_DEADLINE_MESSAGE,
  MAX_OFFER_CHARS,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

const VALID = {
  offer: "Pro Annual Plan",
  discount: "40%",
  deadline: "October 31, 2026",
  audience: "newsletter subscribers",
  tone: "friendly",
};

describe("runTool — happy path with deadline", () => {
  it("returns ok with subjectOptions, bodyDraft, urgencyBlock", () => {
    const r = runTool({ ...VALID });
    assert.strictEqual(r.ok, true);
    assert.ok(r.values);
    const subjects = r.values!["subjectOptions"] as string[];
    assert.strictEqual(subjects.length, SUBJECT_COUNT);
    for (const s of subjects) {
      assert.strictEqual(typeof s, "string");
      assert.ok(s.length > 0);
    }
    assert.strictEqual(typeof r.values!["bodyDraft"], "string");
    assert.strictEqual(typeof r.values!["urgencyBlock"], "string");
  });

  it("urgencyBlock echoes the user-supplied deadline", () => {
    const r = runTool({ ...VALID });
    const urgency = r.values!["urgencyBlock"] as string;
    assert.ok(urgency.includes("October 31, 2026"));
    assert.notStrictEqual(urgency, NO_DEADLINE_MESSAGE);
  });

  it("body draft includes the deadline urgency line when a deadline is given", () => {
    const r = runTool({ ...VALID });
    const body = r.values!["bodyDraft"] as string;
    assert.ok(body.includes("October 31, 2026"));
    assert.ok(body.includes("Pro Annual Plan"));
    assert.ok(body.includes("40%"));
    assert.ok(body.includes("newsletter subscribers"));
  });

  it("subject options are distinct", () => {
    const r = runTool({ ...VALID });
    const subjects = r.values!["subjectOptions"] as string[];
    assert.strictEqual(new Set(subjects).size, subjects.length);
  });
});

describe("runTool — honesty guardrail (no deadline)", () => {
  const NO_DEADLINE = { ...VALID, deadline: "" };

  it("urgencyBlock states that no urgency was generated", () => {
    const r = runTool(NO_DEADLINE);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!["urgencyBlock"], NO_DEADLINE_MESSAGE);
  });

  it("urgency-implying subjects are filtered out without a deadline", () => {
    const r = runTool(NO_DEADLINE);
    const subjects = r.values!["subjectOptions"] as string[];
    assert.strictEqual(subjects.length, SUBJECT_COUNT);
    for (const s of subjects) {
      assert.ok(!/last chance/i.test(s), `false urgency in subject: ${s}`);
      assert.ok(!/for a short time/i.test(s), `false urgency in subject: ${s}`);
      assert.ok(!/ends /i.test(s) || s.includes("October"), `false urgency in subject: ${s}`);
    }
  });

  it("body draft contains no deadline claims without a deadline", () => {
    const r = runTool(NO_DEADLINE);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(!body.includes("October 31, 2026"));
    assert.ok(!/ends on/i.test(body));
    assert.ok(!/expires on/i.test(body));
    assert.ok(!/final day/i.test(body));
  });

  it("missing deadline entirely behaves like an empty deadline", () => {
    const { deadline, ...rest } = VALID;
    const r = runTool(rest);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.values!["urgencyBlock"], NO_DEADLINE_MESSAGE);
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
    assert.deepStrictEqual(Object.keys(r.values!).sort(), [
      "bodyDraft",
      "subjectOptions",
      "urgencyBlock",
    ]);
  });
});

describe("runTool — validation errors", () => {
  it("errors when offer is missing", () => {
    const { offer, ...rest } = VALID;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Offer"));
  });

  it("errors when discount is missing", () => {
    const { discount, ...rest } = VALID;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Discount"));
  });

  it("errors when audience is whitespace-only", () => {
    const r = runTool({ ...VALID, audience: "   " });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Audience"));
  });

  it("errors on an invalid tone", () => {
    const r = runTool({ ...VALID, tone: "luxurious" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Tone must be one of"));
  });

  it("errors when tone is missing", () => {
    const { tone, ...rest } = VALID;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Tone must be one of"));
  });

  it("errors when offer is not a string", () => {
    const r = runTool({ ...VALID, offer: 99 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Offer"));
  });

  it("accepts all four documented tones", () => {
    for (const tone of TONES) {
      const r = runTool({ ...VALID, tone });
      assert.strictEqual(r.ok, true, tone);
    }
  });
});

describe("runTool — edge cases", () => {
  it("truncates overlong offer with a visible notice", () => {
    const long = "B".repeat(MAX_OFFER_CHARS + 10);
    const r = runTool({ ...VALID, offer: long });
    assert.strictEqual(r.ok, true);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(body.includes("Notes:"));
    assert.ok(body.includes(`shortened from ${MAX_OFFER_CHARS + 10} to ${MAX_OFFER_CHARS}`));
  });

  it("escapes HTML in user input (plain-text output)", () => {
    const r = runTool({ ...VALID, discount: "<b>50%</b>" });
    assert.strictEqual(r.ok, true);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(!body.includes("<b>"));
    assert.ok(body.includes("&lt;b&gt;50%&lt;/b&gt;"));
  });

  it("flags a repeated-word pattern with a visible notice", () => {
    const r = runTool({ ...VALID, offer: "deal deal deal of the day plan" });
    assert.strictEqual(r.ok, true);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(body.includes("repeats 3+ times in a row"));
  });

  it("repeatedPhraseNotice returns null for clean copy", () => {
    assert.strictEqual(
      repeatedPhraseNotice("Save big on our annual plan this weekend."),
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
    assert.strictEqual(SUBJECT_TEMPLATES.length, 12);
    assert.strictEqual(OPENERS.length, 4);
    assert.ok(OPENERS.every((o) => o.length === 3));
    assert.strictEqual(BODY_PATTERNS.length, 4);
    assert.strictEqual(CTA_LINES.length, 4);
    assert.ok(CTA_LINES.every((c) => c.length === 3));
    assert.strictEqual(URGENCY_TEMPLATES.length, 6);
    assert.strictEqual(SIGNOFFS.length, 4);
    const all: string[] = [
      ...SUBJECT_TEMPLATES,
      ...OPENERS.flat(),
      ...BODY_PATTERNS,
      ...CTA_LINES.flat(),
      ...URGENCY_TEMPLATES,
      ...SIGNOFFS,
    ];
    for (const entry of all) {
      assert.ok(entry.trim().length > 0, "bank entry must not be empty");
    }
    // Urgency-implying subject indexes point at urgency-implying templates.
    for (const idx of URGENT_SUBJECT_INDEXES) {
      assert.ok(idx >= 0 && idx < SUBJECT_TEMPLATES.length);
    }
  });
});
