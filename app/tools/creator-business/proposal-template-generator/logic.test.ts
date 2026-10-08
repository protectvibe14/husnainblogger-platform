import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, formatInvestment } from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id).sort();

function validValues() {
  return {
    clientName: "Acme Studio",
    projectTitle: "Brand refresh",
    approach: "Audit the identity, present 2 directions, build the full system.",
    deliverables: "New logo\nBrand guidelines PDF\nSocial media kit",
    timeline: "4 weeks, with weekly check-ins",
    investment: 2500,
    termsSummary: "50% deposit, 50% on delivery; 2 revision rounds.",
  };
}

describe("proposal-template-generator", () => {
  it("happy path: builds all 7 blocks", () => {
    const r = runTool(validValues());
    assert.equal(r.ok, true);
    const doc = r.values!["proposal"] as string;
    assert.ok(doc.includes("# Project Proposal: Brand refresh"));
    assert.ok(doc.includes("**Prepared for:** Acme Studio"));
    assert.ok(doc.includes("## 1. Project Overview"));
    assert.ok(doc.includes("## 2. Deliverables"));
    assert.ok(doc.includes("## 3. Timeline"));
    assert.ok(doc.includes("## 4. Investment"));
    assert.ok(doc.includes("## 5. Terms"));
    assert.ok(doc.includes("## 6. Next Steps"));
  });

  it("deliverables lines become bullets", () => {
    const r = runTool(validValues());
    const doc = r.values!["proposal"] as string;
    assert.ok(doc.includes("- New logo"));
    assert.ok(doc.includes("- Brand guidelines PDF"));
    assert.ok(doc.includes("- Social media kit"));
  });

  it("investment formatted with grouping", () => {
    const r = runTool({ ...validValues(), investment: 12500 });
    const doc = r.values!["proposal"] as string;
    assert.ok(doc.includes("**Total: 12,500 (your currency)**"));
  });

  it("investment 0 is allowed", () => {
    const r = runTool({ ...validValues(), investment: 0 });
    assert.equal(r.ok, true);
    assert.ok((r.values!["proposal"] as string).includes("**Total: 0 (your currency)**"));
  });

  it("investment as numeric string is accepted", () => {
    const r = runTool({ ...validValues(), investment: "2500" });
    assert.equal(r.ok, true);
  });

  it("validation: missing clientName -> error", () => {
    const v = validValues();
    delete (v as Record<string, unknown>)["clientName"];
    const r = runTool(v);
    assert.equal(r.ok, false);
    assert.match(r.error!, /Client name is required/i);
  });

  it("validation: missing projectTitle -> error", () => {
    const v = validValues();
    delete (v as Record<string, unknown>)["projectTitle"];
    const r = runTool(v);
    assert.equal(r.ok, false);
    assert.match(r.error!, /Project title is required/i);
  });

  it("validation: missing investment -> error", () => {
    const v = validValues();
    delete (v as Record<string, unknown>)["investment"];
    const r = runTool(v);
    assert.equal(r.ok, false);
    assert.match(r.error!, /Investment must be a number/i);
  });

  it("validation: negative investment -> error", () => {
    const r = runTool({ ...validValues(), investment: -100 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /cannot be negative/i);
  });

  it("validation: non-numeric investment -> error", () => {
    const r = runTool({ ...validValues(), investment: "a lot" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /must be a number/i);
  });

  it("minimal input: skipped sections become [placeholders]", () => {
    const r = runTool({ clientName: "Northbeam", projectTitle: "Emails", investment: 1200 });
    assert.equal(r.ok, true);
    const doc = r.values!["proposal"] as string;
    assert.ok(doc.includes("[Describe your approach"));
    assert.ok(doc.includes("[List each deliverable"));
    assert.ok(doc.includes("[Add your timeline"));
    assert.ok(doc.includes("[Add payment terms"));
  });

  it("deliverables: strips leading bullet markers and numbers", () => {
    const r = runTool({ ...validValues(), deliverables: "- New logo\n1. Brand guide\n• Social kit" });
    const doc = r.values!["proposal"] as string;
    assert.ok(doc.includes("- New logo"));
    assert.ok(doc.includes("- Brand guide"));
    assert.ok(doc.includes("- Social kit"));
    assert.ok(!doc.includes("- - New logo"));
  });

  it("too many deliverables -> error", () => {
    const lines = Array.from({ length: 51 }, (_, i) => `Item ${i}`).join("\n");
    const r = runTool({ ...validValues(), deliverables: lines });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Too many deliverables/i);
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

  it("formatInvestment: decimals and grouping", () => {
    assert.equal(formatInvestment(2500), "2,500");
    assert.equal(formatInvestment(1999.5), "1,999.5");
    assert.equal(formatInvestment(0), "0");
  });

  it("disclaimer: not a contract, not legal advice", () => {
    const r = runTool(validValues());
    const doc = r.values!["proposal"] as string;
    assert.ok(doc.includes("not a contract"));
    assert.ok(doc.includes("not legal advice"));
  });
});
