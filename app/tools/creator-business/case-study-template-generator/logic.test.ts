import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id).sort();

function validValues() {
  return {
    clientName: "Bloom & Co.",
    industry: "florist e-commerce",
    challenge: "Mobile checkout took 6 steps and most visitors dropped off before paying.",
    solution: "Rebuilt the checkout as a single page and added order tracking.",
    results: "Checkout completion rose from 31% to 52% in 3 months (client-reported).",
    quote: "She made ordering flowers feel effortless.",
  };
}

describe("case-study-template-generator", () => {
  it("happy path: builds all sections", () => {
    const r = runTool(validValues());
    assert.equal(r.ok, true);
    const doc = r.values!["caseStudy"] as string;
    assert.ok(doc.includes("# Case Study: Bloom & Co. (florist e-commerce)"));
    assert.ok(doc.includes("## The Challenge"));
    assert.ok(doc.includes("## The Solution"));
    assert.ok(doc.includes("## The Results"));
    assert.ok(doc.includes("## Client Quote"));
    assert.ok(doc.includes("Checkout completion rose from 31% to 52%"));
  });

  it("results are labeled user-provided, not verified", () => {
    const r = runTool(validValues());
    const doc = r.values!["caseStudy"] as string;
    assert.ok(doc.includes("user-provided and were not independently verified"));
  });

  it("optional fields: omits quote section when no quote", () => {
    const v = validValues();
    delete (v as Record<string, unknown>)["quote"];
    const r = runTool(v);
    assert.equal(r.ok, true);
    const doc = r.values!["caseStudy"] as string;
    assert.ok(!doc.includes("## Client Quote"));
  });

  it("optional fields: omits industry from title when not given", () => {
    const v = validValues();
    delete (v as Record<string, unknown>)["industry"];
    const r = runTool(v);
    assert.equal(r.ok, true);
    const doc = r.values!["caseStudy"] as string;
    assert.ok(doc.startsWith("# Case Study: Bloom & Co.\n"));
  });

  it("optional fields: missing results shows placeholder + not-provided note", () => {
    const v = validValues();
    delete (v as Record<string, unknown>)["results"];
    const r = runTool(v);
    assert.equal(r.ok, true);
    const doc = r.values!["caseStudy"] as string;
    assert.ok(doc.includes("Results not provided for this case study."));
  });

  it("validation: missing clientName -> error", () => {
    const v = validValues();
    delete (v as Record<string, unknown>)["clientName"];
    const r = runTool(v);
    assert.equal(r.ok, false);
    assert.match(r.error!, /Client name is required/i);
  });

  it("validation: blank clientName -> error", () => {
    const r = runTool({ ...validValues(), clientName: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Client name is required/i);
  });

  it("validation: missing challenge -> error", () => {
    const v = validValues();
    delete (v as Record<string, unknown>)["challenge"];
    const r = runTool(v);
    assert.equal(r.ok, false);
    assert.match(r.error!, /Challenge is required/i);
  });

  it("validation: missing solution -> error", () => {
    const v = validValues();
    delete (v as Record<string, unknown>)["solution"];
    const r = runTool(v);
    assert.equal(r.ok, false);
    assert.match(r.error!, /Solution is required/i);
  });

  it("validation: challenge too long -> error", () => {
    const r = runTool({ ...validValues(), challenge: "x".repeat(5001) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /too long/i);
  });

  it("trims whitespace on all fields", () => {
    const r = runTool({ ...validValues(), clientName: "  Bloom & Co.  " });
    assert.equal(r.ok, true);
    const doc = r.values!["caseStudy"] as string;
    assert.ok(doc.startsWith("# Case Study: Bloom & Co. (florist e-commerce)"));
  });

  it("output ids exactly match meta.ts outputs", () => {
    const r = runTool(validValues());
    assert.deepEqual(Object.keys(r.values!).sort(), OUTPUT_IDS);
  });

  it("determinism: same input -> identical output", () => {
    const a = JSON.stringify(runTool(validValues()));
    const b = JSON.stringify(runTool(validValues()));
    assert.equal(a, b);
  });

  it("includes permission reminder in about section", () => {
    const r = runTool(validValues());
    const doc = r.values!["caseStudy"] as string;
    assert.ok(doc.includes("written permission"));
  });

  it("quote attributed to the client name", () => {
    const r = runTool(validValues());
    const doc = r.values!["caseStudy"] as string;
    assert.ok(doc.includes("> — Bloom & Co."));
  });

  it("results echoed verbatim, not reworded", () => {
    const results = "Unusual metric: 7 purple widgets sold (client-reported).";
    const r = runTool({ ...validValues(), results });
    const doc = r.values!["caseStudy"] as string;
    assert.ok(doc.includes(results));
  });
});
