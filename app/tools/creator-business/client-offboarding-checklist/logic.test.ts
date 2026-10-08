import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, PROJECT_TYPES } from "./logic.ts";

function baseInput() {
  return {
    projectType: "design",
    deliverablesHandover: false,
    finalInvoiceSent: false,
  };
}

describe("client-offboarding-checklist", () => {
  it("happy path: returns checklist with output id offboardingChecklist", () => {
    const res = runTool(baseInput());
    assert.equal(res.ok, true);
    assert.ok(res.values);
    assert.deepEqual(Object.keys(res.values!), ["offboardingChecklist"]);
    const list = res.values!["offboardingChecklist"] as string[];
    assert.ok(Array.isArray(list));
    assert.ok(list.length > 0);
  });

  it("checklist has 14 base + 3 extras + 2 conditional = 19 items", () => {
    const res = runTool(baseInput());
    const list = res.values!["offboardingChecklist"] as string[];
    assert.equal(list.length, 19);
  });

  it("toggles false: includes handover-to-complete and send-invoice items", () => {
    const res = runTool(baseInput());
    const list = (res.values!["offboardingChecklist"] as string[]).join("\n");
    assert.match(list, /Complete the deliverables handover/);
    assert.match(list, /Send the final invoice now/);
  });

  it("toggles true: swaps in receipt-confirmation and verify-paid items", () => {
    const res = runTool({
      projectType: "video",
      deliverablesHandover: true,
      finalInvoiceSent: true,
    });
    assert.equal(res.ok, true);
    const list = (res.values!["offboardingChecklist"] as string[]).join("\n");
    assert.match(list, /written confirmation that the client received the handover/);
    assert.match(list, /Verify the final invoice is paid in full/);
    assert.doesNotMatch(list, /Send the final invoice now/);
    assert.doesNotMatch(list, /Complete the deliverables handover/);
  });

  it("extras adapt to projectType (video)", () => {
    const res = runTool({ ...baseInput(), projectType: "video" });
    const list = (res.values!["offboardingChecklist"] as string[]).join("\n");
    assert.match(list, /Deliver master files plus web-ready exports/);
  });

  it("extras adapt to projectType (coaching)", () => {
    const res = runTool({ ...baseInput(), projectType: "coaching" });
    const list = (res.values!["offboardingChecklist"] as string[]).join("\n");
    assert.match(list, /Deliver the final report and session recordings/);
  });

  it("each of the 5 project types produces extras", () => {
    for (const t of PROJECT_TYPES) {
      const res = runTool({ ...baseInput(), projectType: t });
      assert.equal(res.ok, true, `projectType ${t} should succeed`);
      const list = res.values!["offboardingChecklist"] as string[];
      assert.equal(list.length, 19);
    }
  });

  it("base sections present regardless of toggles", () => {
    const a = (runTool({ ...baseInput() }).values!["offboardingChecklist"] as string[]).join("\n");
    const b = (
      runTool({ projectType: "design", deliverablesHandover: true, finalInvoiceSent: true })
        .values!["offboardingChecklist"] as string[]
    ).join("\n");
    for (const s of ["Final files:", "Credentials & access:", "Testimonial & referral:", "Archive & records:"]) {
      assert.match(a, new RegExp(s.replace(/[&]/g, "&")));
      assert.match(b, new RegExp(s.replace(/[&]/g, "&")));
    }
  });

  it("missing projectType returns human error", () => {
    const res = runTool({ deliverablesHandover: false });
    assert.equal(res.ok, false);
    assert.match(res.error!, /project type/i);
    assert.equal(res.values, undefined);
  });

  it("unknown projectType returns error listing valid options", () => {
    const res = runTool({ ...baseInput(), projectType: "plumbing" });
    assert.equal(res.ok, false);
    for (const t of PROJECT_TYPES) {
      assert.match(res.error!, new RegExp(t));
    }
  });

  it("non-string projectType returns error", () => {
    const res = runTool({ ...baseInput(), projectType: 42 });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("non-boolean deliverablesHandover returns error", () => {
    const res = runTool({ ...baseInput(), deliverablesHandover: "yes" });
    assert.equal(res.ok, false);
    assert.match(res.error!, /deliverablesHandover/);
  });

  it("non-boolean finalInvoiceSent returns error", () => {
    const res = runTool({ ...baseInput(), finalInvoiceSent: 1 });
    assert.equal(res.ok, false);
    assert.match(res.error!, /finalInvoiceSent/);
  });

  it("omitted booleans default to false", () => {
    const res = runTool({ projectType: "writing" });
    assert.equal(res.ok, true);
    const list = (res.values!["offboardingChecklist"] as string[]).join("\n");
    assert.match(list, /Send the final invoice now/);
  });

  it("projectType matching is case-insensitive and trimmed", () => {
    const res = runTool({ ...baseInput(), projectType: "  Design " });
    assert.equal(res.ok, true);
  });

  it("deterministic: identical inputs give identical outputs", () => {
    const a = runTool(baseInput());
    const b = runTool(baseInput());
    assert.deepEqual(a, b);
  });

  it("no empty or whitespace-only items", () => {
    const list = runTool(baseInput()).values!["offboardingChecklist"] as string[];
    for (const item of list) {
      assert.equal(typeof item, "string");
      assert.ok(item.trim().length > 0);
    }
  });

  it("every item carries a section prefix", () => {
    const list = runTool(baseInput()).values!["offboardingChecklist"] as string[];
    for (const item of list) {
      assert.match(item, /^[^:]+: .+/);
    }
  });
});
