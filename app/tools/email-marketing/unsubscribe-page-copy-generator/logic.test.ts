import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateUnsubscribeCopy,
  hasRepeatedWords,
  sanitizePlain,
  HEADLINES,
  BODY_TEMPLATES,
  PREFERENCE_OPTIONS,
  UN_SUB_TONES,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const base = { brand: "Morning Brew Daily", alternatives: "weekly digest", tone: "friendly" };

describe("unsubscribe-page-copy-generator (tool-432)", () => {
  it("happy path: returns 3 outputs with correct ids", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    assert.ok(r.values);
    assert.deepEqual(Object.keys(r.values).sort(), ["bodyDraft", "headlineOptions", "preferenceOptions"]);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const outIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(Object.keys(r.values!).sort(), outIds);
  });

  it("headline bank is 4 tones x 4 = 16 templates", () => {
    assert.equal(UN_SUB_TONES.length, 4);
    let total = 0;
    for (const t of UN_SUB_TONES) {
      assert.equal(HEADLINES[t].length, 4, `tone ${t} must have 4 headlines`);
      total += HEADLINES[t].length;
    }
    assert.equal(total, 16);
  });

  it("body templates: 4 tones, each includes CAN-SPAM 10-day reminder", () => {
    for (const t of UN_SUB_TONES) {
      const body = BODY_TEMPLATES[t];
      assert.ok(body.includes("10 business days"), `tone ${t} must carry CAN-SPAM reminder`);
      assert.ok(body.includes("not legal advice"), `tone ${t} must disclaim legal advice`);
    }
  });

  it("preference options bank has exactly 8 lines, all non-empty", () => {
    assert.equal(PREFERENCE_OPTIONS.length, 8);
    for (const p of PREFERENCE_OPTIONS) {
      assert.ok(p.trim().length > 0);
    }
  });

  it("headlines insert the brand and contain no guilt-trip phrasing", () => {
    const r = runTool(base);
    const heads = r.values!.headlineOptions as string[];
    assert.equal(heads.length, 4);
    const guilt = ["don't go", "you'll miss", "shame", "begging", "we're crying"];
    for (const h of heads) {
      assert.ok(h.includes("Morning Brew Daily"), `headline must include brand: ${h}`);
      const lower = h.toLowerCase();
      for (const g of guilt) assert.ok(!lower.includes(g), `guilt phrase "${g}" in: ${h}`);
      assert.equal(hasRepeatedWords(h), false);
    }
  });

  it("body draft includes alternatives line and CAN-SPAM reminder", () => {
    const r = runTool(base);
    const body = r.values!.bodyDraft as string;
    assert.ok(body.includes("weekly digest"));
    assert.ok(body.includes("10 business days"));
  });

  it("empty alternatives uses the default preferences hint line", () => {
    const r = runTool({ brand: "Acme", tone: "professional" });
    assert.equal(r.ok, true);
    const body = r.values!.bodyDraft as string;
    assert.ok(body.includes("adjust your preferences"));
  });

  it("validation: missing brand -> error", () => {
    const r = runTool({ tone: "friendly" });
    assert.equal(r.ok, false);
    assert.ok(r.error && r.error.length > 0);
  });

  it("validation: whitespace-only brand -> error", () => {
    const r = runTool({ brand: "   ", tone: "friendly" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("brand"));
  });

  it("validation: bad tone -> error", () => {
    const r = runTool({ brand: "Acme", tone: "sassy" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("friendly"));
  });

  it("determinism: same inputs -> identical outputs", () => {
    const a = runTool(base);
    const b = runTool(base);
    assert.deepEqual(a, b);
  });

  it("overlong input is trimmed with a visible notice, never silently dropped", () => {
    const long = "x".repeat(MAX_INPUT_CHARS + 50);
    const r = runTool({ brand: long, tone: "sincere" });
    assert.equal(r.ok, true);
    const body = r.values!.bodyDraft as string;
    assert.ok(body.includes("trimmed to 200 characters"));
    const heads = r.values!.headlineOptions as string[];
    assert.ok([...heads[0]].length <= MAX_INPUT_CHARS + 60);
  });

  it("sanitizePlain strips HTML tags from user input", () => {
    const clean = sanitizePlain("<b>Acme</b> News");
    assert.equal(clean, "Acme News");
    const r = runTool({ brand: "<script>alert(1)</script>Acme", tone: "friendly" });
    assert.equal(r.ok, true);
    const heads = r.values!.headlineOptions as string[];
    for (const h of heads) assert.ok(!h.includes("<script>"), `unsanitized output: ${h}`);
  });

  it("hasRepeatedWords detects adjacent duplicates", () => {
    assert.equal(hasRepeatedWords("you you are"), true);
    assert.equal(hasRepeatedWords("you are you"), false);
    assert.equal(hasRepeatedWords("You you are"), true);
  });

  it("edge: emoji/CJK input measured in code points", () => {
    const emoji = "🎉".repeat(MAX_INPUT_CHARS + 10);
    const r = generateUnsubscribeCopy(emoji, "", "playful");
    assert.ok(r.notice !== null);
    const heads = runTool({ brand: "東京ニュース", tone: "sincere" });
    assert.equal(heads.ok, true);
    assert.ok((heads.values!.headlineOptions as string[])[0].includes("東京ニュース"));
  });

  it("generateUnsubscribeCopy throws on empty brand", () => {
    assert.throws(() => generateUnsubscribeCopy("  ", "", "friendly"), RangeError);
  });
});
