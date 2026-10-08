import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = {
  prize: "a $100 gift card",
  entryMethod: "Tag a friend",
  endDate: "2099-12-31",
  region: "the US",
};

describe("giveaway-rules-generator (tool-220)", () => {
  it("happy path: rules text + steps + checklist", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const rules = String(r.values?.rulesText);
    assert.ok(rules.includes("a $100 gift card"));
    assert.ok(rules.includes("Tag a friend"));
    assert.ok(rules.includes("December 31, 2099"));
    assert.equal((r.values?.entrySteps as string[]).length, 4);
    assert.equal((r.values?.complianceChecklist as string[]).length, 5);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), ["complianceChecklist", "entrySteps", "rulesText"]);
  });

  it("rules text carries the not-legal-advice disclaimer", () => {
    const r = runTool(base);
    assert.ok(String(r.values?.rulesText).includes("Template only — not legal advice"));
  });

  it("compliance checklist carries the not-legal-advice line", () => {
    const r = runTool(base);
    const list = r.values?.complianceChecklist as string[];
    assert.ok(list.some((s) => s.includes("not legal advice")));
    assert.ok(list.some((s) => s.includes("Instagram's promotion guidelines")));
  });

  it("compliance checklist includes no-purchase-necessary note", () => {
    const r = runTool(base);
    const list = r.values?.complianceChecklist as string[];
    assert.ok(list.some((s) => s.includes("No purchase necessary")));
  });

  it("region omitted: generic eligibility line", () => {
    const r = runTool({ ...base, region: "" });
    assert.equal(r.ok, true);
    assert.ok(String(r.values?.rulesText).includes("where lawful"));
  });

  it("region slotted into eligibility", () => {
    const r = runTool(base);
    assert.ok(String(r.values?.rulesText).includes("the US"));
  });

  it("each entry method yields its own 4 steps", () => {
    const methods = ["Like + comment", "Follow both accounts", "Tag a friend", "Share to your story"];
    const firsts = methods.map((m) => (runTool({ ...base, entryMethod: m }).values?.entrySteps as string[])[0]);
    assert.equal(new Set(firsts).size, 4);
    for (const m of methods) {
      const steps = runTool({ ...base, entryMethod: m }).values?.entrySteps as string[];
      assert.equal(steps.length, 4);
    }
  });

  it("missing prize: error", () => {
    const r = runTool({ entryMethod: "Tag a friend", endDate: "2099-12-31" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("prize"));
  });

  it("blank prize: error", () => {
    assert.equal(runTool({ ...base, prize: "   " }).ok, false);
  });

  it("missing entryMethod: error listing options", () => {
    const r = runTool({ prize: "x", endDate: "2099-12-31" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("Tag a friend"));
  });

  it("unknown entryMethod: error", () => {
    const r = runTool({ ...base, entryMethod: "Post a reel" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("entry method"));
  });

  it("missing endDate: error", () => {
    const r = runTool({ prize: "x", entryMethod: "Tag a friend" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("end date"));
  });

  it("invalid endDate: error", () => {
    const r = runTool({ ...base, endDate: "next friday-ish" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("not a valid date"));
  });

  it("past endDate: error", () => {
    const r = runTool({ ...base, endDate: "2000-01-01" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("future"));
  });

  it("rules text includes Instagram non-affiliation line", () => {
    const r = runTool(base);
    assert.ok(String(r.values?.rulesText).includes("in no way sponsored"));
  });

  it("determinism: identical runs", () => {
    assert.deepEqual(runTool(base), runTool(base));
  });
});
