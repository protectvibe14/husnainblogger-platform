import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

describe("sponsorship-negotiation-script-generator", () => {
  it("happy path: returns negotiationScript output id", () => {
    const res = runTool({ brandName: "GlowCo", askAmount: 1500 });
    assert.equal(res.ok, true);
    assert.ok(res.values);
    assert.deepEqual(Object.keys(res.values!), ["negotiationScript"]);
    const script = res.values!["negotiationScript"] as string;
    assert.ok(script.startsWith("# Sponsorship Negotiation Scripts — GlowCo"));
  });

  it("injects brand name into all 3 scripts", () => {
    const res = runTool({ brandName: "GlowCo", askAmount: 1500 });
    const script = res.values!["negotiationScript"] as string;
    assert.equal((script.match(/GlowCo/g) || []).length >= 3, true);
  });

  it("formats the ask amount in USD", () => {
    const res = runTool({ brandName: "GlowCo", askAmount: 2500 });
    assert.match(res.values!["negotiationScript"] as string, /\$2,500/);
  });

  it("formats amounts with thousands separators and cents", () => {
    const res = runTool({ brandName: "GlowCo", askAmount: 1234567.5 });
    assert.match(res.values!["negotiationScript"] as string, /\$1,234,567\.5/);
  });

  it("without askAmount keeps an honest placeholder, never invents a rate", () => {
    const res = runTool({ brandName: "GlowCo" });
    assert.equal(res.ok, true);
    const script = res.values!["negotiationScript"] as string;
    assert.match(script, /\[your rate\]/);
    assert.doesNotMatch(script, /\$\d/);
  });

  it("contains exactly 3 fixed scripts", () => {
    const res = runTool({ brandName: "GlowCo" });
    const script = res.values!["negotiationScript"] as string;
    const headings = script.match(/^## Script \d —/gm);
    assert.equal(headings!.length, 3);
  });

  it("covers counter-offer, value justification, and terms", () => {
    const res = runTool({ brandName: "GlowCo", askAmount: 800 });
    const script = res.values!["negotiationScript"] as string;
    assert.match(script, /Counter-offer email/);
    assert.match(script, /Value-justification reply/);
    assert.match(script, /Usage-rights & payment-terms follow-up/);
  });

  it("includes the not-legal-or-financial-advice disclaimer", () => {
    const res = runTool({ brandName: "GlowCo" });
    assert.match(
      res.values!["negotiationScript"] as string,
      /not legal or financial advice/i
    );
  });

  it("never claims AI generation", () => {
    const res = runTool({ brandName: "GlowCo", askAmount: 900 });
    const script = res.values!["negotiationScript"] as string;
    assert.doesNotMatch(script, /AI-generated/i);
  });

  it("missing brandName returns error", () => {
    const res = runTool({});
    assert.equal(res.ok, false);
    assert.match(res.error!, /brand name/i);
    assert.equal(res.values, undefined);
  });

  it("whitespace-only brandName returns error", () => {
    const res = runTool({ brandName: "   " });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("non-string brandName returns error", () => {
    const res = runTool({ brandName: 42 });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("brandName over 80 chars returns error", () => {
    const res = runTool({ brandName: "x".repeat(81) });
    assert.equal(res.ok, false);
    assert.match(res.error!, /80 characters/);
  });

  it("zero askAmount returns error", () => {
    const res = runTool({ brandName: "GlowCo", askAmount: 0 });
    assert.equal(res.ok, false);
    assert.match(res.error!, /greater than zero/);
  });

  it("negative askAmount returns error", () => {
    const res = runTool({ brandName: "GlowCo", askAmount: -500 });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("NaN askAmount returns error", () => {
    const res = runTool({ brandName: "GlowCo", askAmount: NaN });
    assert.equal(res.ok, false);
    assert.match(res.error!, /must be a number/);
  });

  it("string askAmount returns error", () => {
    const res = runTool({ brandName: "GlowCo", askAmount: "1500" });
    assert.equal(res.ok, false);
    assert.match(res.error!, /must be a number/);
  });

  it("unrealistically large askAmount returns error", () => {
    const res = runTool({ brandName: "GlowCo", askAmount: 50_000_000 });
    assert.equal(res.ok, false);
    assert.match(res.error!, /unrealistic/);
  });

  it("deterministic: identical inputs give identical scripts", () => {
    const a = runTool({ brandName: "GlowCo", askAmount: 1500 });
    const b = runTool({ brandName: "GlowCo", askAmount: 1500 });
    assert.deepEqual(a, b);
  });
});
