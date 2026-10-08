import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  sanitize,
  parseList,
  matchTone,
  hashString,
  fill,
  pick,
  buildCopy,
  TONES,
  DEFAULT_TONE,
  MAX_LIST_ITEMS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = {
  serviceName: "Brand identity design",
  targetClient: "early-stage SaaS founders",
  benefits: "A logo suite that looks funded\nBrand guidelines your team can actually use",
  processSteps: "Discovery call\nConcepts in 7 days\nRevisions and final delivery",
  tone: "professional",
};

describe("happy path", () => {
  it("assembles a full page deck from the spec example", () => {
    const res = runTool(BASE);
    assert.equal(res.ok, true);
    const copy = res.values?.bookingPageCopy ?? "";
    assert.ok(copy.includes("BRAND IDENTITY DESIGN"));
    assert.ok(copy.includes("early-stage SaaS founders"));
    assert.ok(copy.includes("WHO THIS IS FOR"));
    assert.ok(copy.includes("WHAT YOU GET"));
    assert.ok(copy.includes("• A logo suite that looks funded"));
    assert.ok(copy.includes("• Brand guidelines your team can actually use"));
    assert.ok(copy.includes("HOW IT WORKS"));
    assert.ok(copy.includes("1. Discovery call"));
    assert.ok(copy.includes("2. Concepts in 7 days"));
    assert.ok(copy.includes("3. Revisions and final delivery"));
    assert.ok(copy.includes("QUESTIONS, ANSWERED"));
    assert.ok(copy.includes("Q: How do we start?"));
    assert.ok(!copy.includes("INVESTMENT"));
  });

  it("echoes the price anchor verbatim when provided", () => {
    const res = runTool({ ...BASE, priceAnchor: "$250 per session" });
    const copy = res.values?.bookingPageCopy ?? "";
    assert.ok(copy.includes("INVESTMENT"));
    assert.ok(copy.includes("$250 per session — shown exactly as you entered it."));
  });

  it("renders honest placeholders when benefits/steps are empty", () => {
    const res = runTool({ serviceName: "Coaching", targetClient: "founders" });
    const copy = res.values?.bookingPageCopy ?? "";
    assert.ok(copy.includes("[Add your benefits above — they will appear here as bullet points.]"));
    assert.ok(copy.includes("[Add your process steps above — they will appear here as numbered steps.]"));
  });

  it("defaults tone to professional when omitted", () => {
    const a = runTool({ ...BASE, tone: undefined });
    const b = runTool({ ...BASE, tone: "professional" });
    assert.equal(a.ok, true);
    assert.deepEqual(a.values, b.values);
  });

  it("accepts tone case-insensitively", () => {
    const res = runTool({ ...BASE, tone: "BOLD" });
    assert.equal(res.ok, true);
  });

  it("accepts benefits as an array", () => {
    const res = runTool({ ...BASE, benefits: ["One", "Two"] });
    assert.ok(res.values?.bookingPageCopy.includes("• One"));
  });
});

describe("validation errors", () => {
  it("errors when service name is missing", () => {
    assert.deepEqual(runTool({ targetClient: "founders" }), { ok: false, error: "Service name is required." });
    assert.deepEqual(runTool({ serviceName: "   ", targetClient: "founders" }), {
      ok: false,
      error: "Service name is required.",
    });
  });

  it("errors when target client is missing", () => {
    assert.deepEqual(runTool({ serviceName: "Design" }), { ok: false, error: "Target client is required." });
  });

  it("errors on an unknown tone", () => {
    const res = runTool({ ...BASE, tone: "sarcastic" });
    assert.equal(res.ok, false);
    assert.equal(res.error, "Tone must be one of: friendly, professional, bold, warm.");
  });

  it("errors when no inputs object is given", () => {
    assert.deepEqual(runTool(null as never), { ok: false, error: "No inputs were provided." });
  });
});

describe("edge cases", () => {
  it("is deterministic: identical inputs give identical copy", () => {
    assert.deepEqual(runTool(BASE), runTool(BASE));
  });

  it("different tones can produce different headlines", () => {
    const heads = new Set(
      TONES.map((t) => (runTool({ ...BASE, tone: t }).values?.bookingPageCopy ?? "").split("\n")[0]),
    );
    assert.ok(heads.size > 1, "expected tone variation across banks");
  });

  it("caps list items and dedupes case-insensitively", () => {
    const many = Array.from({ length: MAX_LIST_ITEMS + 5 }, (_, i) => `Benefit ${i}`).join("\n");
    const res = runTool({ ...BASE, benefits: `${many}\nbenefit 0\nBENEFIT 1` });
    const bullets = (res.values?.bookingPageCopy ?? "").split("\n").filter((l) => l.startsWith("• "));
    assert.equal(bullets.length, MAX_LIST_ITEMS);
  });

  it("splits semicolon-separated lists too", () => {
    const res = runTool({ ...BASE, benefits: "A;B;C" });
    const copy = res.values?.bookingPageCopy ?? "";
    assert.ok(copy.includes("• A") && copy.includes("• B") && copy.includes("• C"));
  });

  it("helpers: sanitize, matchTone, hashString, fill, pick", () => {
    assert.equal(sanitize("  x  ", 10), "x");
    assert.equal(sanitize(42, 10), "");
    assert.deepEqual(parseList("a\n\nb"), ["a", "b"]);
    assert.deepEqual(parseList(123), []);
    assert.equal(matchTone("Warm"), "warm");
    assert.equal(matchTone("nope"), null);
    assert.equal(hashString("abc"), hashString("abc"));
    assert.notEqual(hashString("abc"), hashString("abd"));
    assert.equal(fill("{service} for {client}", "S", "C"), "S for C");
    assert.equal(pick(["x"], "anything"), "x");
    assert.equal(TONES.length, 4);
    assert.equal(DEFAULT_TONE, "professional");
  });

  it("buildCopy renders the price anchor section only when provided", () => {
    const withAnchor = buildCopy("S", "C", [], [], "$9", "friendly");
    const without = buildCopy("S", "C", [], [], "", "friendly");
    assert.ok(withAnchor.includes("INVESTMENT"));
    assert.ok(!without.includes("INVESTMENT"));
  });

  it("output ids match meta.ts outputs", () => {
    assert.deepEqual(outputs.map((o) => o.id), ["bookingPageCopy"]);
  });
});
