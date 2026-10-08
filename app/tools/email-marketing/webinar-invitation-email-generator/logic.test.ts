/**
 * Tests for the Webinar Invitation Email Generator pure logic (tool-422).
 *
 * Run: node --test app/tools/email-marketing/webinar-invitation-email-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  parseBenefits,
  repeatedPhraseNotice,
  SUBJECT_TEMPLATES,
  SUBJECT_COUNT,
  MAX_BENEFITS,
  MAX_TITLE_CHARS,
  OPENERS,
  BODY_PATTERNS,
  CTA_LINES,
  PS_LINES,
  SIGNOFFS,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

const VALID = {
  webinarTitle: "Email List Growth Masterclass",
  dateTime: "Oct 15, 2026 at 2:00 PM EST",
  speaker: "Jane Doe",
  benefits: "Grow your list faster\nWrite emails people open\nAutomate follow-ups",
  cta: "https://example.com/register",
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

  it("embeds the webinar details in the body draft", () => {
    const r = runTool({ ...VALID });
    const body = r.values!["bodyDraft"] as string;
    assert.ok(body.includes("Email List Growth Masterclass"));
    assert.ok(body.includes("Oct 15, 2026 at 2:00 PM EST"));
    assert.ok(body.includes("Jane Doe"));
    assert.ok(body.includes("https://example.com/register"));
    assert.ok(body.includes("- Grow your list faster"));
    assert.ok(body.includes("- Write emails people open"));
    assert.ok(body.includes("- Automate follow-ups"));
  });

  it("subject options are distinct", () => {
    const r = runTool({ ...VALID });
    const subjects = r.values!["subjectOptions"] as string[];
    assert.strictEqual(new Set(subjects).size, subjects.length);
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
  it("errors when webinarTitle is missing", () => {
    const { webinarTitle, ...rest } = VALID;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Webinar title"));
  });

  it("errors on whitespace-only speaker", () => {
    const r = runTool({ ...VALID, speaker: "   " });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Speaker"));
  });

  it("errors when benefits is not a string", () => {
    const r = runTool({ ...VALID, benefits: 42 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Benefits"));
  });

  it("errors when dateTime is missing", () => {
    const { dateTime, ...rest } = VALID;
    const r = runTool(rest);
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Date and time"));
  });

  it("errors when cta is empty", () => {
    const r = runTool({ ...VALID, cta: "" });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Call to action"));
  });

  it("errors when benefits has no parseable benefit", () => {
    const r = runTool({ ...VALID, benefits: " , ; " });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error!.includes("Benefits"));
  });
});

describe("runTool — edge cases", () => {
  it("truncates overlong title with a visible notice", () => {
    const long = "A".repeat(MAX_TITLE_CHARS + 25);
    const r = runTool({ ...VALID, webinarTitle: long });
    assert.strictEqual(r.ok, true);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(body.includes("Notes:"));
    assert.ok(body.includes(`shortened from ${MAX_TITLE_CHARS + 25} to ${MAX_TITLE_CHARS}`));
    assert.ok(!body.includes("A".repeat(MAX_TITLE_CHARS + 1)));
  });

  it("measures emoji as one character when truncating", () => {
    // 60 rocket emojis + filler: code points = 60 + 61 = 121 > 120 cap.
    const title = "🚀".repeat(60) + "x".repeat(61);
    assert.strictEqual([...title].length, 121);
    const r = runTool({ ...VALID, webinarTitle: title });
    assert.strictEqual(r.ok, true);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(body.includes("shortened from 121 to 120"));
    // Truncated value keeps whole emoji (60 rockets + 60 x's = 120 code points).
    assert.ok(body.includes("🚀".repeat(60) + "x".repeat(60)));
  });

  it("escapes HTML in user input (plain-text output)", () => {
    const r = runTool({ ...VALID, speaker: "<script>alert(1)</script>" });
    assert.strictEqual(r.ok, true);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(!body.includes("<script>"));
    assert.ok(body.includes("&lt;script&gt;"));
  });

  it("flags a repeated-word pattern with a visible notice", () => {
    const r = runTool({ ...VALID, benefits: "learn learn learn the basics" });
    assert.strictEqual(r.ok, true);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(body.includes("repeats 3+ times in a row"));
  });

  it("caps benefits at 6 with a visible notice", () => {
    const many = "b1\nb2\nb3\nb4\nb5\nb6\nb7\nb8";
    const r = runTool({ ...VALID, benefits: many });
    assert.strictEqual(r.ok, true);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(body.includes("- b6"));
    assert.ok(!body.includes("- b7"));
    assert.ok(body.includes(`Only the first ${MAX_BENEFITS} benefits were used`));
  });

  it("splits comma-separated benefits as a fallback", () => {
    const r = runTool({ ...VALID, benefits: "alpha, beta, gamma" });
    assert.strictEqual(r.ok, true);
    const body = r.values!["bodyDraft"] as string;
    assert.ok(body.includes("- alpha"));
    assert.ok(body.includes("- beta"));
    assert.ok(body.includes("- gamma"));
  });

  it("dedupes repeated benefits", () => {
    const parsed = parseBenefits("Alpha\nbeta\nALPHA\nbeta");
    assert.deepStrictEqual(parsed.benefits, ["Alpha", "beta"]);
  });

  it("repeatedPhraseNotice returns null for clean copy", () => {
    assert.strictEqual(
      repeatedPhraseNotice("Join us for a live webinar about email marketing basics."),
      null,
    );
  });
});

describe("runTool — determinism", () => {
  it("returns identical output for identical inputs", () => {
    const a = runTool({ ...VALID });
    const b = runTool({ ...VALID });
    assert.deepStrictEqual(a, b);
  });

  it("picks deterministically from the documented banks (no empty picks)", () => {
    assert.strictEqual(SUBJECT_TEMPLATES.length, 12);
    assert.strictEqual(OPENERS.length, 6);
    assert.strictEqual(BODY_PATTERNS.length, 4);
    assert.strictEqual(CTA_LINES.length, 6);
    assert.strictEqual(PS_LINES.length, 6);
    assert.strictEqual(SIGNOFFS.length, 4);
    for (const bank of [SUBJECT_TEMPLATES, OPENERS, BODY_PATTERNS, CTA_LINES, PS_LINES, SIGNOFFS]) {
      for (const entry of bank) {
        assert.ok(entry.trim().length > 0, "bank entry must not be empty");
      }
    }
  });
});
