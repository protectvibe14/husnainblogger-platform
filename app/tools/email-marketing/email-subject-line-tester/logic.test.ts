/**
 * Tests for the Email Subject Line Tester pure logic (tool-401).
 *
 * Run: node --test app/tools/email-marketing/email-subject-line-tester/logic.test.ts
 *
 * All expected scores are hand-computed from the documented signal impacts,
 * never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  testSubjectLine,
  SPAM_TRIGGERS,
  BASE_SCORE,
  MAX_SUBJECT_CHARS_ANALYZED,
} from "./logic.ts";

describe("testSubjectLine — strong subject", () => {
  it("scores 73 (good) for 'How to double your freelance income in 30 days'", () => {
    // Hand-computed: 46 chars -> +15; no spam; caps 0; no personalization;
    // no emoji; curiosity ("how") +5; digit ("30") +3; bangs 0.
    // 50 + 15 + 5 + 3 = 73 -> good.
    const r = testSubjectLine("How to double your freelance income in 30 days");
    assert.strictEqual(r.charCount, 46);
    assert.strictEqual(r.score, 73);
    assert.strictEqual(r.band, "good");
    assert.strictEqual(r.subject, "How to double your freelance income in 30 days");
  });

  it("scores 86 (excellent) with personalization + emoji + question + number", () => {
    // "How to grow fast in 30 days? {name} 🚀": 37 chars -> +15;
    // personalization +8; emoji 1 -> +5; "?" -> +5; digit -> +3.
    // 50 + 15 + 8 + 5 + 5 + 3 = 86 -> excellent.
    const r = testSubjectLine("How to grow fast in 30 days? {name} 🚀");
    assert.strictEqual(r.charCount, 37);
    assert.strictEqual(r.score, 86);
    assert.strictEqual(r.band, "excellent");
  });

  it("scores 63 (good) for a 2-emoji subject", () => {
    // "🚀 New gig ideas for you 🎉": 25 perceived chars -> +8; 2 emojis -> +5.
    // 50 + 8 + 5 = 63 -> good.
    const r = testSubjectLine("🚀 New gig ideas for you 🎉");
    assert.strictEqual(r.charCount, 25);
    assert.strictEqual(r.score, 63);
    assert.strictEqual(r.band, "good");
  });

  it("scores 73 (good) for a personalized subject", () => {
    // "Ayesha, your invoice is ready {first_name}": 42 chars -> +15;
    // personalization -> +8. 50 + 15 + 8 = 73.
    const r = testSubjectLine("Ayesha, your invoice is ready {first_name}");
    assert.strictEqual(r.score, 73);
    assert.strictEqual(r.band, "good");
  });

  it("detects all personalization token styles", () => {
    for (const s of [
      "Hi {{first_name}}, welcome",
      "Hi %FIRSTNAME%, welcome aboard",
      "Hi [Name], your report is ready",
    ]) {
      const r = testSubjectLine(s);
      const sig = r.signals.find((x) => x.signal === "personalization");
      assert.strictEqual(sig?.impact, 8, s);
    }
  });
});

describe("testSubjectLine — spammy subject", () => {
  it("scores 30 (needs-work) for 'FREE MONEY!!! Click here now, winner guaranteed'", () => {
    // Hand-computed: 47 chars -> +15; spam hits free/click here/winner/
    // guaranteed -> 4 x -8 = -32 capped at -24; caps 2/7 = 0.286 -> -5;
    // 3 bangs -> -6. 50 + 15 - 24 - 5 - 6 = 30 -> needs-work.
    const r = testSubjectLine("FREE MONEY!!! Click here now, winner guaranteed");
    assert.strictEqual(r.charCount, 47);
    assert.strictEqual(r.score, 30);
    assert.strictEqual(r.band, "needs-work");
    const spam = r.signals.find((x) => x.signal === "spam-triggers");
    assert.strictEqual(spam?.impact, -24);
    assert.ok(spam?.detail.includes("free"));
    assert.ok(
      r.suggestions.some((s) => s.includes("Remove spam-trigger")),
      "spam suggestion must be surfaced",
    );
  });

  it("does not match 'free' inside 'freelance' (word boundaries)", () => {
    const r = testSubjectLine("Freelance tips for beginners");
    const spam = r.signals.find((x) => x.signal === "spam-triggers");
    assert.strictEqual(spam?.impact, 0);
  });

  it("matches a standalone spam word: 'Get it free today' -> -8", () => {
    // 17 chars -> -5; spam "free" -> -8. 50 - 5 - 8 = 37 -> needs-work.
    const r = testSubjectLine("Get it free today");
    assert.strictEqual(r.score, 37);
    assert.strictEqual(r.band, "needs-work");
  });

  it("caps the spam penalty at -24 even with many triggers", () => {
    const r = testSubjectLine(
      "Free winner guaranteed! Click here now, urgent act now limited time",
    );
    const spam = r.signals.find((x) => x.signal === "spam-triggers");
    assert.ok(spam && spam.impact >= -24, "spam penalty must be capped");
  });
});

describe("testSubjectLine — caps, bangs, emoji", () => {
  it("penalizes heavy ALL-CAPS: 'HUGE SALE ENDS TODAY' -> 48", () => {
    // 20 chars -> +8; caps 4/4 = 1.0 -> -10. 50 + 8 - 10 = 48 -> fair.
    const r = testSubjectLine("HUGE SALE ENDS TODAY");
    assert.strictEqual(r.score, 48);
    assert.strictEqual(r.band, "fair");
    assert.ok(r.suggestions.some((s) => s.includes("ALL CAPS")));
  });

  it("penalizes moderate caps at the 0.25 threshold", () => {
    // "The SECRET to growth": caps 1/4 = 0.25 -> -5; 20 chars -> +8;
    // curiosity "secret" -> +5. 50 + 8 + 5 - 5 = 58 -> fair.
    const r = testSubjectLine("The SECRET to growth");
    const caps = r.signals.find((x) => x.signal === "all-caps");
    assert.strictEqual(caps?.impact, -5);
    assert.strictEqual(r.score, 58);
  });

  it("penalizes 5+ emojis: 53 (fair)", () => {
    // "🎉🎉🎉🎉🎉 Sale ends soon": 20 chars -> +8; 5 emojis -> -5.
    // 50 + 8 - 5 = 53 -> fair.
    const r = testSubjectLine("🎉🎉🎉🎉🎉 Sale ends soon");
    assert.strictEqual(r.score, 53);
    assert.strictEqual(r.band, "fair");
    assert.ok(r.suggestions.some((s) => s.includes("1–2 emojis")));
  });

  it("penalizes extra exclamation marks with a cap", () => {
    // "Sale ends today!!": 17 chars -> -5; 2 bangs -> -3. 50-5-3=42 -> fair.
    const two = testSubjectLine("Sale ends today!!");
    assert.strictEqual(two.score, 42);
    // "Wow!!!!!!": 9 chars -> -15; 6 bangs -> -(5*3)=-15 capped at -9.
    // 50 - 15 - 9 = 26.
    const six = testSubjectLine("Wow!!!!!!");
    assert.strictEqual(six.score, 26);
    const sig = six.signals.find((x) => x.signal === "exclamation");
    assert.strictEqual(sig?.impact, -9);
  });
});

describe("testSubjectLine — curiosity and questions", () => {
  it("awards curiosity once for '?' or cue words (not double)", () => {
    // "Are you making this pricing mistake?": 36 chars -> +15;
    // curiosity (both ? and "mistake") -> +5 once. 50+15+5=70 -> good.
    const r = testSubjectLine("Are you making this pricing mistake?");
    const sig = r.signals.find((x) => x.signal === "curiosity");
    assert.strictEqual(sig?.impact, 5);
    assert.strictEqual(r.score, 70);
  });
});

describe("testSubjectLine — edges and unicode", () => {
  it("rejects empty and whitespace-only subjects", () => {
    assert.throws(() => testSubjectLine(""), RangeError);
    assert.throws(() => testSubjectLine("   "), RangeError);
  });

  it("rejects non-string input", () => {
    assert.throws(() => testSubjectLine(123 as never), TypeError);
    assert.throws(() => testSubjectLine(null as never), TypeError);
  });

  it("warns on subjects over 200 chars but still scores them", () => {
    const r = testSubjectLine("a".repeat(250));
    assert.strictEqual(r.charCount, 250);
    assert.ok(r.warnings.length > 0, "long-subject warning must be surfaced");
    // 250 chars -> -15; nothing else. 50 - 15 = 35 -> needs-work.
    assert.strictEqual(r.score, 35);
    assert.strictEqual(r.band, "needs-work");
  });

  it("handles non-Latin scripts without crashing", () => {
    const r = testSubjectLine("セール実施中");
    assert.strictEqual(r.charCount, 6);
    // 6 chars -> -15; no letters for caps ratio; no spam. 50-15=35.
    assert.strictEqual(r.score, 35);
    assert.ok(r.score >= 0 && r.score <= 100);
  });

  it("handles ZWJ emoji sequences without crashing", () => {
    const r = testSubjectLine("👨‍👩‍👧 Family plan inside");
    assert.ok(r.charCount > 0);
    assert.ok(r.score >= 0 && r.score <= 100);
  });

  it("signal impacts always sum to score - 50 (transparent math)", () => {
    for (const s of [
      "How to double your freelance income in 30 days",
      "FREE MONEY!!! Click here now, winner guaranteed",
      "🚀 New gig ideas for you 🎉",
    ]) {
      const r = testSubjectLine(s);
      const sum = r.signals.reduce((t, x) => t + x.impact, 0);
      assert.strictEqual(BASE_SCORE + sum, r.score, s);
    }
  });
});

describe("testSubjectLine — honesty", () => {
  it("states the heuristic limits in assumptions", () => {
    const r = testSubjectLine("Hello world");
    const joined = r.assumptions.join(" ");
    assert.ok(joined.includes("NOT machine learning"));
    assert.ok(joined.includes("heuristic"));
  });

  it("exposes the transparent spam-trigger list", () => {
    assert.ok(SPAM_TRIGGERS.length > 10, "trigger list must be non-trivial");
    assert.ok(SPAM_TRIGGERS.includes("free"));
    assert.strictEqual(MAX_SUBJECT_CHARS_ANALYZED, 200);
  });

  it("offers an A/B-test suggestion when nothing is wrong", () => {
    const r = testSubjectLine("How to double your freelance income in 30 days");
    assert.ok(r.suggestions.some((s) => s.includes("A/B test")));
  });
});
/**
 * runTool() wrapper tests for the Email Subject Line Tester (tool-401).
 *
 * Run: node --test app/tools/email-marketing/email-subject-line-tester/logic.test.ts
 *
 * Expected values are hand-computed from the documented signal impacts in
 * logic.ts, never copied from tool output.
 */
import { runTool, TRUNCATION_CLIENTS } from "./logic.ts";
import { outputs } from "./meta.ts";

const META_OUTPUT_IDS = outputs.map((o) => o.id).sort();

function expectOk(result: { ok: boolean; values?: Record<string, unknown>; error?: string }) {
  assert.strictEqual(result.ok, true, `expected ok, got error: ${result.error}`);
  assert.ok(result.values, "ok result must carry values");
  assert.strictEqual(result.error, undefined);
  return result.values as Record<string, unknown>;
}

describe("runTool — validation", () => {
  it("rejects a missing subjectLine", () => {
    const r = runTool({});
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.values, undefined);
    assert.ok(typeof r.error === "string" && r.error.length > 0);
  });

  it("rejects a whitespace-only subjectLine", () => {
    const r = runTool({ subjectLine: "   " });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error?.includes("subject line"));
  });

  it("rejects a non-string subjectLine", () => {
    const r = runTool({ subjectLine: 42 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error && r.error.length > 0);
  });

  it("rejects a non-string audienceHint", () => {
    const r = runTool({ subjectLine: "Hello there", audienceHint: 99 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error?.includes("Audience hint"));
  });

  it("accepts an empty/absent audienceHint", () => {
    const v = expectOk(runTool({ subjectLine: "Hello there" }));
    assert.ok(typeof v.audienceNote === "string");
  });
});

describe("runTool — happy path", () => {
  it("maps testSubjectLine() result to output ids", () => {
    const v = expectOk(
      runTool({ subjectLine: "How to double your freelance income in 30 days" }),
    );
    // Hand-computed in the existing suite: score 73, band "good".
    assert.strictEqual(v.score, 73);
    assert.strictEqual(v.band, "good");
    assert.ok(Array.isArray(v.warnings));
    assert.ok(Array.isArray(v.suggestions));
    assert.ok(v.suggestions.length > 0);
    assert.ok(typeof v.audienceNote === "string");
  });

  it("builds checkResults as a table from signals", () => {
    const v = expectOk(runTool({ subjectLine: "HUGE SALE ENDS TODAY" }));
    const table = v.checkResults as { columns: string[]; rows: string[][] };
    assert.deepStrictEqual(table.columns, ["Check", "Result", "Detail"]);
    assert.ok(table.rows.length >= 8, "one row per signal");
    for (const row of table.rows) {
      assert.strictEqual(row.length, 3);
      assert.ok(row[1] === "Pass" || row[1] === "Fail");
    }
    const capsRow = table.rows.find((r) => r[0] === "all-caps");
    assert.strictEqual(capsRow?.[1], "Fail");
  });

  it("builds truncationPreview from TRUNCATION_CLIENTS", () => {
    const subject = "How to double your freelance income in 30 days"; // 46 chars
    const v = expectOk(runTool({ subjectLine: subject }));
    const preview = v.truncationPreview as { columns: string[]; rows: string[][] };
    assert.deepStrictEqual(preview.columns, [
      "Email client",
      "Visible characters (approx)",
    ]);
    assert.strictEqual(preview.rows.length, TRUNCATION_CLIENTS.length);
    const iphone = preview.rows[0];
    assert.ok(iphone[0].includes("approx"), "client label must say approx");
    assert.strictEqual(iphone[1], "41", "46 chars -> min(46, 41) = 41");
  });

  it("shows full visibility for short subjects in truncationPreview", () => {
    const v = expectOk(runTool({ subjectLine: "Short sale update" })); // 17 chars
    const preview = v.truncationPreview as { rows: string[][] };
    for (const row of preview.rows) {
      assert.strictEqual(row[1], "17", "short subject is fully visible everywhere");
    }
  });

  it("surfaces long-subject warnings through runTool", () => {
    const v = expectOk(runTool({ subjectLine: "a".repeat(250) }));
    assert.strictEqual(v.score, 35);
    const warnings = v.warnings as string[];
    assert.ok(warnings.some((w) => w.includes("250")));
  });

  it("echoes the audienceHint in audienceNote without changing the score", () => {
    const withHint = expectOk(
      runTool({ subjectLine: "Hello there", audienceHint: "new subscribers" }),
    );
    const withoutHint = expectOk(runTool({ subjectLine: "Hello there" }));
    assert.strictEqual(withHint.score, withoutHint.score);
    assert.ok((withHint.audienceNote as string).includes("new subscribers"));
    assert.ok(
      (withHint.audienceNote as string).includes("does not change"),
      "must state the hint is score-neutral",
    );
  });

  it("scores spammy input through the wrapper", () => {
    const v = expectOk(
      runTool({ subjectLine: "FREE MONEY!!! Click here now, winner guaranteed" }),
    );
    assert.strictEqual(v.score, 30);
    assert.strictEqual(v.band, "needs-work");
  });
});

describe("runTool — edges and determinism", () => {
  it("handles emoji subjects (code-point safe)", () => {
    const v = expectOk(runTool({ subjectLine: "🚀 New gig ideas for you 🎉" }));
    assert.strictEqual(v.score, 63);
    assert.strictEqual(v.band, "good");
  });

  it("handles non-Latin scripts without crashing", () => {
    const v = expectOk(runTool({ subjectLine: "セール実施中" }));
    assert.strictEqual(v.score, 35);
    assert.ok(typeof v.score === "number");
  });

  it("is deterministic: same input -> identical output", () => {
    const input = { subjectLine: "How to double your freelance income in 30 days" };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepStrictEqual(a, b);
  });

  it("agrees with direct testSubjectLine() scores", () => {
    for (const subject of [
      "How to double your freelance income in 30 days",
      "FREE MONEY!!! Click here now, winner guaranteed",
      "🚀 New gig ideas for you 🎉",
      "セール実施中",
    ]) {
      const viaWrapper = expectOk(runTool({ subjectLine: subject }));
      const direct = testSubjectLine(subject);
      assert.strictEqual(viaWrapper.score, direct.score, subject);
      assert.strictEqual(viaWrapper.band, direct.band, subject);
    }
  });

  it("output ids exactly match meta.ts outputs ids", () => {
    const v = expectOk(runTool({ subjectLine: "Hello there" }));
    assert.deepStrictEqual(Object.keys(v).sort(), META_OUTPUT_IDS);
  });

  it("error case returns no values", () => {
    const r = runTool({ subjectLine: "" });
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.values, undefined);
    assert.ok(r.error && r.error.length > 5, "human-readable error message");
  });

  it("ignores unknown extra input keys", () => {
    const v = expectOk(runTool({ subjectLine: "Hello there", nope: "zzz" }));
    // "Hello there" = 11 chars -> -5 length; nothing else fires. 50 - 5 = 45.
    assert.strictEqual(v.score, 45);
  });
});
