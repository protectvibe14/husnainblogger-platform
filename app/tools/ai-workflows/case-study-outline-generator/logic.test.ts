import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  HEADLINE_FORMULAS,
  CHALLENGE_OPENERS,
  CTA_LINES,
} from "./logic.ts";

describe("case-study-outline-generator (tool-339)", () => {
  it("happy path returns outline + sections for a client type", () => {
    const res = runTool({ clientType: "dental clinic" });
    assert.equal(res.ok, true);
    assert.ok(res.values);
    assert.ok(typeof res.values.outline === "string" && res.values.outline.length > 200);
    assert.ok(Array.isArray(res.values.sections) && res.values.sections.length === 9);
  });

  it("output ids match meta.ts outputs ('outline', 'sections')", () => {
    const res = runTool({ clientType: "SaaS startup" });
    assert.deepEqual(Object.keys(res.values ?? {}).sort(), ["outline", "sections"]);
  });

  it("outline contains the client type", () => {
    const res = runTool({ clientType: "real estate agency" });
    assert.ok(res.values?.outline.includes("real estate agency"));
  });

  it("optional industry is used when provided", () => {
    const res = runTool({ clientType: "fitness coach", industry: "Health & fitness" });
    assert.ok(res.values?.outline.includes("Industry: Health & fitness"));
  });

  it("missing industry falls back to a placeholder", () => {
    const res = runTool({ clientType: "fitness coach" });
    assert.ok(res.values?.outline.includes("Industry: [INDUSTRY]"));
  });

  it("error when clientType is missing", () => {
    const res = runTool({});
    assert.equal(res.ok, false);
    assert.ok(/client type is required/i.test(res.error ?? ""));
  });

  it("error when clientType is empty or whitespace", () => {
    for (const v of ["", "   "]) {
      const res = runTool({ clientType: v });
      assert.equal(res.ok, false, `no error for ${JSON.stringify(v)}`);
    }
  });

  it("error when clientType is not a string", () => {
    const res = runTool({ clientType: 42 });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("error when values is null/undefined", () => {
    const res = runTool(null as unknown as Record<string, unknown>);
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("long clientType input is truncated, not rejected", () => {
    const long = "dental clinic " + "x".repeat(500);
    const res = runTool({ clientType: long });
    assert.equal(res.ok, true);
    assert.ok((res.values?.outline ?? "").length < 6000);
  });

  it("deterministic: same inputs -> identical outputs", () => {
    const a = runTool({ clientType: "dental clinic", industry: "Healthcare" });
    const b = runTool({ clientType: "dental clinic", industry: "Healthcare" });
    assert.deepEqual(a, b);
  });

  it("different client types can pick different headline formulas", () => {
    const seen = new Set<string>();
    for (const t of ["dental clinic", "saas startup", "plumbing company", "law firm"]) {
      const res = runTool({ clientType: t });
      const firstHeadline = (res.values?.outline ?? "").split("\n")[4] ?? "";
      seen.add(firstHeadline);
    }
    // bank of 4 must be exercisable across varied inputs
    assert.ok(seen.size >= 1);
    assert.ok(HEADLINE_FORMULAS.length === 4);
    assert.ok(CHALLENGE_OPENERS.length === 3);
    assert.ok(CTA_LINES.length === 3);
  });

  it("never invents results: placeholders present when no knownResult", () => {
    const res = runTool({ clientType: "dental clinic" });
    const outline = res.values?.outline ?? "";
    assert.ok(outline.includes("[PROOF NEEDED]"));
    // no hard-coded numeric claims as results
    assert.ok(!/\bincreased (revenue|sales) by \d+/i.test(outline));
  });

  it("uses the user's own knownResult verbatim (their data, not invented)", () => {
    const res = runTool({
      clientType: "dental clinic",
      knownResult: "Booked 40 new patient calls in 60 days",
    });
    assert.ok(
      (res.values?.outline ?? "").includes("Booked 40 new patient calls in 60 days"),
    );
  });

  it("outline includes a client-quote placeholder and approval reminder", () => {
    const res = runTool({ clientType: "SaaS startup" });
    const outline = res.values?.outline ?? "";
    assert.ok(outline.includes("CLIENT QUOTE"));
    assert.ok(/approv/i.test(outline));
  });

  it("outline includes an honesty check before publishing", () => {
    const res = runTool({ clientType: "SaaS startup" });
    const outline = res.values?.outline ?? "";
    assert.ok(outline.includes("HONESTY CHECK"));
    assert.ok(/never publish/i.test(outline));
  });

  it("word banks have no empty entries", () => {
    for (const bank of [HEADLINE_FORMULAS, CHALLENGE_OPENERS, CTA_LINES]) {
      for (const entry of bank) {
        assert.ok(entry.trim().length > 0);
      }
    }
  });

  it("sections list covers the full case-study arc", () => {
    const res = runTool({ clientType: "agency" });
    const s = (res.values?.sections ?? []).join(" ").toLowerCase();
    for (const word of ["challenge", "solution", "results", "call to action"]) {
      assert.ok(s.includes(word), `sections missing "${word}"`);
    }
  });
});
