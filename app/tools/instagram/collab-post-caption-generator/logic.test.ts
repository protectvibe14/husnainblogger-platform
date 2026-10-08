import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = { partnerHandle: "@brandname", campaign: "summer skincare launch", tone: "friendly" };

describe("collab-post-caption-generator (tool-219)", () => {
  it("happy path: 3 captions + disclosure reminder", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const captions = r.values?.captions as string[];
    assert.equal(captions.length, 3);
    assert.ok(captions.every((c) => c.length > 30));
    assert.ok(String(r.values?.disclosureReminder).includes("#ad"));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), ["captions", "disclosureReminder"]);
  });

  it("partner handle is slotted into every caption", () => {
    const r = runTool(base);
    for (const c of r.values?.captions as string[]) {
      assert.ok(c.includes("@brandname"), `missing handle: ${c}`);
    }
  });

  it("campaign is slotted into every caption", () => {
    const r = runTool(base);
    for (const c of r.values?.captions as string[]) {
      assert.ok(c.includes("summer skincare launch"), `missing campaign: ${c}`);
    }
  });

  it("handle without @ gets normalized", () => {
    const r = runTool({ ...base, partnerHandle: "brandname" });
    assert.equal(r.ok, true);
    assert.ok((r.values?.captions as string[]).every((c) => c.includes("@brandname")));
  });

  it("each tone produces its own phrasing", () => {
    const tones = ["friendly", "professional", "playful", "bold"];
    const firsts = tones.map((t) => (runTool({ ...base, tone: t }).values?.captions as string[])[0]);
    assert.equal(new Set(firsts).size, 4);
  });

  it("unknown tone falls back to friendly", () => {
    const r = runTool({ ...base, tone: "mysterious" });
    assert.equal(r.ok, true);
    assert.deepEqual(r.values, runTool({ ...base, tone: "friendly" }).values);
  });

  it("missing partnerHandle: error", () => {
    const r = runTool({ campaign: "x", tone: "friendly" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("handle"));
  });

  it("blank partnerHandle: error", () => {
    assert.equal(runTool({ ...base, partnerHandle: "   " }).ok, false);
  });

  it("invalid handle characters: error", () => {
    const r = runTool({ ...base, partnerHandle: "@not a handle!" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("valid Instagram handle"));
  });

  it("missing campaign: error", () => {
    const r = runTool({ partnerHandle: "@brandname", tone: "friendly" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("campaign"));
  });

  it("blank campaign: error", () => {
    assert.equal(runTool({ ...base, campaign: "  " }).ok, false);
  });

  it("disclosure reminder mentions paid-partnership tagging", () => {
    const r = runTool(base);
    assert.ok(String(r.values?.disclosureReminder).includes("paid partnership"));
  });

  it("three captions are distinct", () => {
    const r = runTool(base);
    const captions = r.values?.captions as string[];
    assert.equal(new Set(captions).size, 3);
  });

  it("determinism: identical runs", () => {
    assert.deepEqual(runTool(base), runTool(base));
  });
});
