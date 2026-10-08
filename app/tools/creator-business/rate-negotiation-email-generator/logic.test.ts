/**
 * Tests for the Rate Negotiation Email Generator pure logic (tool-466).
 *
 * Run: node --test app/tools/creator-business/rate-negotiation-email-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, generateEmail, formatMoney, parseList } from "./logic.ts";

function baseInput() {
  return {
    clientName: "Daniel",
    yourName: "Ayesha Khan",
    currentOffer: 800,
    counterOffer: 1000,
    tone: "firm" as const,
    valuePoints: ["5 years of campaign experience", "24-hour turnaround on revisions"],
  };
}

describe("formatMoney", () => {
  it("formats with thousands separators and two decimals", () => {
    assert.strictEqual(formatMoney(1500), "$1,500.00");
    assert.strictEqual(formatMoney(99.9), "$99.90");
    assert.strictEqual(formatMoney(0), "$0.00");
  });
  it("handles large values and negatives", () => {
    assert.strictEqual(formatMoney(1234567.8), "$1,234,567.80");
    assert.strictEqual(formatMoney(-50), "-$50.00");
  });
});

describe("parseList", () => {
  it("accepts arrays and newline/semicolon strings", () => {
    assert.deepStrictEqual(parseList(["a", "b"]), ["a", "b"]);
    assert.deepStrictEqual(parseList("a\nb"), ["a", "b"]);
    assert.deepStrictEqual(parseList("a; b"), ["a", "b"]);
  });
  it("drops empty entries", () => {
    assert.deepStrictEqual(parseList("a\n\n  \nb"), ["a", "b"]);
  });
});

describe("generateEmail — templates", () => {
  it("includes subject line and both names for the firm tone", () => {
    const text = generateEmail(baseInput());
    assert.ok(text.startsWith("Subject: "));
    assert.ok(text.includes("Hi Daniel,"));
    assert.ok(text.includes("Ayesha Khan"));
  });
  it("includes current offer and counter offer as money", () => {
    const text = generateEmail(baseInput());
    assert.ok(text.includes("$800.00"));
    assert.ok(text.includes("$1,000.00"));
  });
  it("renders value points as bullets", () => {
    const text = generateEmail(baseInput());
    assert.ok(text.includes("- 5 years of campaign experience"));
  });
  it("friendly tone uses its own subject and wording", () => {
    const text = generateEmail({ ...baseInput(), tone: "friendly" });
    assert.ok(text.startsWith("Subject: Quick chat about the project rate?"));
    assert.ok(text.includes("excited"));
  });
  it("walk-away tone declines politely", () => {
    const text = generateEmail({ ...baseInput(), tone: "walk-away" });
    assert.ok(text.startsWith("Subject: Thank you — I'll have to pass"));
    assert.ok(text.includes("have to pass"));
  });
  it("flags a counter below the offer as a concession, still generated", () => {
    const text = generateEmail({
      ...baseInput(),
      currentOffer: 1000,
      counterOffer: 700,
    });
    assert.ok(text.includes("Flagged as a concession"));
    assert.ok(text.includes("$700.00"));
  });
  it("does not flag a concession when counter equals or exceeds the offer", () => {
    assert.ok(!generateEmail({ ...baseInput(), counterOffer: 800 }).includes("concession"));
    assert.ok(!generateEmail(baseInput()).includes("concession"));
  });
  it("omits the value-points block when none are given", () => {
    const text = generateEmail({ ...baseInput(), valuePoints: [] });
    assert.ok(!text.includes("- 5 years"));
  });
  it("is deterministic", () => {
    assert.strictEqual(generateEmail(baseInput()), generateEmail(baseInput()));
  });
});

describe("runTool — validation", () => {
  it("generates a draft for valid inputs", () => {
    const r = runTool(baseInput());
    assert.strictEqual(r.ok, true);
    assert.ok(typeof r.values!.negotiationEmailDraft === "string");
  });
  it("rejects an empty client name", () => {
    assert.strictEqual(runTool({ ...baseInput(), clientName: "" }).ok, false);
  });
  it("rejects an empty sender name", () => {
    assert.strictEqual(runTool({ ...baseInput(), yourName: "  " }).ok, false);
  });
  it("rejects non-numeric or negative offers", () => {
    assert.strictEqual(
      runTool({ ...baseInput(), currentOffer: "abc" }).ok,
      false,
    );
    assert.strictEqual(
      runTool({ ...baseInput(), counterOffer: -10 }).ok,
      false,
    );
  });
  it("rejects a missing or unknown tone", () => {
    assert.strictEqual(runTool({ ...baseInput(), tone: "" }).ok, false);
    assert.strictEqual(
      runTool({ ...baseInput(), tone: "aggressive" }).ok,
      false,
    );
  });
  it("accepts numeric strings for the offers", () => {
    const r = runTool({
      ...baseInput(),
      currentOffer: "800",
      counterOffer: "1000",
    });
    assert.strictEqual(r.ok, true);
  });
  it("generates despite a concession and flags it", () => {
    const r = runTool({ ...baseInput(), currentOffer: 1000, counterOffer: 700 });
    assert.strictEqual(r.ok, true);
    assert.ok((r.values as Record<string, string>).negotiationEmailDraft.includes("concession"));
  });
  it("output key is exactly negotiationEmailDraft", () => {
    const r = runTool(baseInput());
    assert.deepStrictEqual(Object.keys(r.values!), ["negotiationEmailDraft"]);
  });
});
