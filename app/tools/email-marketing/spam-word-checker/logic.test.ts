/**
 * Tests for the Spam Word Checker pure logic (tool-403).
 *
 * Run: node --test app/tools/email-marketing/spam-word-checker/logic.test.ts
 *
 * This tool is a pattern linter against a bundled 45-term list — NOT a live
 * spam-filter test. Tests assert list-driven matching, severity, and risk
 * rules exactly as documented in logic.ts.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, SPAM_TERMS, MAX_TEXT_CHARS } from "./logic.ts";
import { outputs } from "./meta.ts";

const META_OUTPUT_IDS = outputs.map((o) => o.id).sort();

function expectOk(result: { ok: boolean; values?: Record<string, unknown>; error?: string }) {
  assert.strictEqual(result.ok, true, `expected ok, got error: ${result.error}`);
  assert.ok(result.values, "ok result must carry values");
  return result.values as Record<string, unknown>;
}

interface MatchesTable {
  columns: string[];
  rows: string[][];
}

function matchedTerms(v: Record<string, unknown>): string[] {
  return (v.matches as MatchesTable).rows.map((r) => r[0]);
}

describe("runTool — validation", () => {
  it("rejects missing text", () => {
    const r = runTool({});
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.values, undefined);
    assert.ok(r.error && r.error.length > 0);
  });

  it("rejects whitespace-only text", () => {
    assert.strictEqual(runTool({ text: "  \n " }).ok, false);
  });

  it("rejects non-string text", () => {
    assert.strictEqual(runTool({ text: 123 }).ok, false);
  });
});

describe("runTool — matching", () => {
  it("flags a clean email with zero matches and low risk", () => {
    const v = expectOk(
      runTool({ text: "Hi Sarah, here is the weekly roundup you signed up for." }),
    );
    assert.deepStrictEqual(matchedTerms(v), []);
    assert.strictEqual(v.riskLevel, "low");
    assert.ok((v.rewriteSuggestions as string[]).length > 0);
    assert.strictEqual(v.notice, "");
  });

  it("flags high-severity terms and sets risk high", () => {
    const v = expectOk(
      runTool({ text: "Act now! This is urgent and 100% free, guaranteed." }),
    );
    const terms = matchedTerms(v);
    assert.ok(terms.includes("act now"), terms.join(","));
    assert.ok(terms.includes("urgent"), terms.join(","));
    assert.ok(terms.includes("guaranteed"), terms.join(","));
    assert.strictEqual(v.riskLevel, "high");
  });

  it("matches case-insensitively", () => {
    const v = expectOk(runTool({ text: "FREE money, CLICK HERE today" }));
    const terms = matchedTerms(v);
    assert.ok(terms.includes("free"));
    assert.ok(terms.includes("click here"));
  });

  it("does not match 'free' inside 'freelance' (word boundaries)", () => {
    const v = expectOk(runTool({ text: "Freelance tips for your career" }));
    assert.ok(!matchedTerms(v).includes("free"));
    assert.strictEqual(v.riskLevel, "low");
  });

  it("dedupes overlapping terms: '100% free' wins over 'free'", () => {
    const v = expectOk(runTool({ text: "It is 100% free today." }));
    const terms = matchedTerms(v);
    assert.ok(terms.includes("100% free"), terms.join(","));
    assert.ok(!terms.includes("free"), "shorter overlap must be dropped");
    assert.strictEqual(terms.length, 1);
  });

  it("sets risk medium for medium-severity matches", () => {
    const v = expectOk(runTool({ text: "Buy now and save with this deal" }));
    // "buy now" is medium; "deal" is low.
    assert.strictEqual(v.riskLevel, "medium");
  });

  it("sets risk high at 6+ low-severity matches", () => {
    const v = expectOk(
      runTool({ text: "Sale! Discount deal offer bonus free trial opportunity save big" }),
    );
    // free trial, sale, discount, deal, offer, save big, bonus, opportunity = 8 low.
    assert.strictEqual(v.riskLevel, "high");
  });

  it("matches multi-word phrases with punctuation around them", () => {
    const v = expectOk(runTool({ text: "(dear friend), congratulations!" }));
    const terms = matchedTerms(v);
    assert.ok(terms.includes("dear friend"));
    assert.ok(terms.includes("congratulations"));
  });

  it("reports category and severity columns for every match", () => {
    const v = expectOk(runTool({ text: "Urgent: buy now, no risk miracle cure" }));
    const table = v.matches as MatchesTable;
    assert.deepStrictEqual(table.columns, ["Term", "Category", "Severity"]);
    for (const row of table.rows) {
      assert.strictEqual(row.length, 3);
      assert.ok(["high", "medium", "low"].includes(row[2]));
      assert.ok(row[1].length > 0);
    }
    const severities = Object.fromEntries(table.rows.map((r) => [r[0], r[2]]));
    assert.strictEqual(severities["urgent"], "high");
    assert.strictEqual(severities["buy now"], "medium");
  });

  it("gives one rewrite suggestion per matched category", () => {
    const v = expectOk(runTool({ text: "Urgent! Buy now — 100% free, guaranteed." }));
    const suggestions = v.rewriteSuggestions as string[];
    assert.ok(suggestions.length >= 3, suggestions.join(" | "));
    assert.strictEqual(new Set(suggestions).size, suggestions.length, "no duplicate suggestions");
  });
});

describe("runTool — honesty and edges", () => {
  it("states the linter limit in the clean-result suggestion", () => {
    const v = expectOk(runTool({ text: "A perfectly ordinary newsletter intro." }));
    const joined = (v.rewriteSuggestions as string[]).join(" ");
    assert.ok(joined.includes("not a live spam-filter test"));
  });

  it("truncates overlong input with a visible notice", () => {
    const v = expectOk(runTool({ text: "ok ".repeat(3000) }));
    assert.ok((v.notice as string).includes(String(MAX_TEXT_CHARS)));
  });

  it("handles unicode text without crashing", () => {
    const v = expectOk(runTool({ text: "🎉 セール Free お得情報" }));
    assert.ok(["low", "medium", "high"].includes(v.riskLevel as string));
  });

  it("is deterministic: same text -> identical result", () => {
    const input = { text: "Act now! Free winner, click here, guaranteed." };
    assert.deepStrictEqual(runTool(input), runTool(input));
  });

  it("output ids exactly match meta.ts outputs ids", () => {
    const v = expectOk(runTool({ text: "Hello world" }));
    assert.deepStrictEqual(Object.keys(v).sort(), META_OUTPUT_IDS);
  });

  it("error case carries a human message and no values", () => {
    const r = runTool({ text: "" });
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.values, undefined);
    assert.ok(r.error && r.error.length > 10);
  });

  it("documents the advertised 45-term bundled list", () => {
    assert.strictEqual(SPAM_TERMS.length, 45);
    const categories = new Set(SPAM_TERMS.map((t) => t.category));
    assert.ok(categories.size >= 6, [...categories].join(","));
    assert.ok(SPAM_TERMS.every((t) => ["high", "medium", "low"].includes(t.severity)));
  });
});
