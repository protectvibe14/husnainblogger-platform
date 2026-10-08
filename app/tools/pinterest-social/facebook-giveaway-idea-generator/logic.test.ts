import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateGiveaways,
  CONCEPT_TEMPLATES,
  CONCEPT_COUNT,
  COMPLIANCE_CHECKLIST,
} from "./logic.ts";

describe("facebook-giveaway-idea-generator", () => {
  it("happy path: business + prize returns 4 concepts with prize inserted", () => {
    const r = runTool({ business: "Sunny Side Bakery", prize: "a $50 gift card" });
    assert.equal(r.ok, true);
    const concepts = r.values!.concepts as string[];
    assert.equal(concepts.length, 4);
    assert.equal(r.values!.count, 4);
    for (const c of concepts) {
      assert.ok(c.includes("Sunny Side Bakery"), c);
      assert.ok(c.includes("a $50 gift card"), c);
    }
  });

  it("omitted prize falls back to a business-based suggestion", () => {
    const r = runTool({ business: "GlowFit Studio" });
    assert.equal(r.ok, true);
    const concepts = r.values!.concepts as string[];
    for (const c of concepts) {
      assert.ok(c.includes("best-seller or gift bundle from GlowFit Studio"), c);
    }
  });

  it("each concept line has concept, entry mechanic and prize sections", () => {
    const r = runTool({ business: "Bloom Cafe" });
    const concepts = r.values!.concepts as string[];
    for (const c of concepts) {
      assert.ok(c.includes("Concept:"), c);
      assert.ok(c.includes("Entry:"), c);
      assert.ok(c.includes("Prize:"), c);
    }
  });

  it("no leftover placeholders", () => {
    const r = runTool({ business: "Bloom Cafe", prize: "free cake" });
    for (const c of r.values!.concepts as string[]) {
      assert.ok(!c.includes("{business}"), c);
      assert.ok(!c.includes("{prize}"), c);
    }
  });

  it("compliance checklist is always included with 5 items", () => {
    const r = runTool({ business: "Bloom Cafe" });
    assert.equal(r.ok, true);
    const checklist = r.values!.checklist as string[];
    assert.equal(checklist.length, 5);
    assert.deepEqual(checklist, COMPLIANCE_CHECKLIST);
  });

  it("checklist covers no-purchase-necessary and Facebook disclaimer", () => {
    const joined = COMPLIANCE_CHECKLIST.join(" ");
    assert.ok(joined.includes("No purchase necessary"));
    assert.ok(joined.includes("Facebook does not sponsor"));
    assert.ok(joined.includes("local contest laws"));
  });

  it("no spammy 'tag friends' style mechanics suggested", () => {
    const r = runTool({ business: "Bloom Cafe" });
    const all = (r.values!.concepts as string[]).join(" ").toLowerCase();
    assert.ok(!all.includes("tag 50 friends"));
    assert.ok(!all.includes("tag friends to enter"));
    assert.ok(!all.includes("share on your timeline"));
  });

  it("missing business errors", () => {
    const r = runTool({ prize: "free cake" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Business is required/);
  });

  it("blank business errors", () => {
    const r = runTool({ business: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Business is required/);
  });

  it("non-string business errors", () => {
    const r = runTool({ business: 7 as unknown as string });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Business is required/);
  });

  it("non-string prize errors", () => {
    const r = runTool({ business: "Bloom Cafe", prize: 7 as unknown as string });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Prize must be text/);
  });

  it("blank prize is treated as omitted", () => {
    const r = runTool({ business: "Bloom Cafe", prize: "   " });
    assert.equal(r.ok, true);
    const first = (r.values!.concepts as string[])[0];
    assert.ok(first.includes("best-seller or gift bundle from Bloom Cafe"));
  });

  it("business is trimmed before insertion", () => {
    const r = generateGiveaways("  Bloom Cafe  ");
    assert.ok(r.concepts[0].concept.includes("Bloom Cafe"));
    assert.ok(!r.concepts[0].concept.includes("  Bloom"));
  });

  it("deterministic: same inputs give identical outputs", () => {
    const a = runTool({ business: "Bloom Cafe", prize: "free cake" });
    const b = runTool({ business: "Bloom Cafe", prize: "free cake" });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts (concepts, checklist, count)", () => {
    const r = runTool({ business: "Bloom Cafe" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["checklist", "concepts", "count"]);
  });

  it("library has exactly 4 frameworks", () => {
    assert.equal(CONCEPT_COUNT, 4);
    assert.equal(CONCEPT_TEMPLATES.length, 4);
    const titles = CONCEPT_TEMPLATES.map((t) => t.title);
    assert.equal(new Set(titles).size, 4);
  });

  it("never promises guaranteed virality", () => {
    const all = [
      ...CONCEPT_TEMPLATES.flatMap((t) => [t.title, t.concept, t.entryMechanic]),
      ...COMPLIANCE_CHECKLIST,
    ]
      .join(" ")
      .toLowerCase();
    assert.ok(!all.includes("guaranteed viral"));
    assert.ok(!all.includes("guaranteed to go viral"));
  });
});
