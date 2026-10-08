import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, SECTION_IDS } from "./logic.ts";

function items() {
  return [
    { projectName: "Spring Campaign", section: "wins", note: "Landed the retainer." },
    { projectName: "Spring Campaign", section: "issues" },
    { projectName: "Spring Campaign", section: "metrics" },
  ];
}

describe("project-debrief-template-builder", () => {
  it("happy path: returns debriefDocument output id", () => {
    const res = runTool({ items: items() });
    assert.equal(res.ok, true);
    assert.ok(res.values);
    assert.deepEqual(Object.keys(res.values!), ["debriefDocument"]);
    const doc = res.values!["debriefDocument"] as string;
    assert.ok(doc.includes("# Project Debrief — Spring Campaign"));
  });

  it("emits sections in canonical order regardless of input order", () => {
    const res = runTool({
      items: [
        { projectName: "P", section: "followups" },
        { projectName: "P", section: "wins" },
        { projectName: "P", section: "lessons" },
      ],
    });
    const doc = res.values!["debriefDocument"] as string;
    const idx = (s: string) => doc.indexOf(s);
    assert.ok(idx("## Wins & highlights") < idx("## Lessons learned"));
    assert.ok(idx("## Lessons learned") < idx("## Follow-ups & next steps"));
  });

  it("includes the 3 fixed prompts per section", () => {
    const res = runTool({ items: [{ projectName: "P", section: "metrics" }] });
    const doc = res.values!["debriefDocument"] as string;
    assert.match(doc, /What were the final numbers/);
    assert.match(doc, /How did the actuals compare/);
    assert.match(doc, /Which metric are you proudest of/);
  });

  it("appends user notes under their section", () => {
    const res = runTool({ items: items() });
    const doc = res.values!["debriefDocument"] as string;
    assert.match(doc, /Landed the retainer\./);
  });

  it("dedupes repeated sections and joins notes", () => {
    const res = runTool({
      items: [
        { projectName: "P", section: "wins", note: "First win" },
        { projectName: "P", section: "wins", note: "Second win" },
      ],
    });
    const doc = res.values!["debriefDocument"] as string;
    assert.equal(doc.split("## Wins & highlights").length - 1, 1);
    assert.match(doc, /First win \| Second win/);
  });

  it("groups multiple projects into separate documents", () => {
    const res = runTool({
      items: [
        { projectName: "Alpha", section: "wins" },
        { projectName: "Beta", section: "issues" },
      ],
    });
    const doc = res.values!["debriefDocument"] as string;
    assert.match(doc, /# Project Debrief — Alpha/);
    assert.match(doc, /# Project Debrief — Beta/);
    assert.match(doc, /---/);
  });

  it("all 5 sections can appear in one document", () => {
    const res = runTool({
      items: SECTION_IDS.map((s) => ({ projectName: "P", section: s })),
    });
    assert.equal(res.ok, true);
    const doc = res.values!["debriefDocument"] as string;
    for (const title of [
      "Wins & highlights",
      "Issues & blockers",
      "Key metrics",
      "Lessons learned",
      "Follow-ups & next steps",
    ]) {
      assert.match(doc, new RegExp(title.replace(/[&]/g, "&")));
    }
  });

  it("empty items array returns error", () => {
    const res = runTool({ items: [] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /at least one section/i);
  });

  it("non-array items returns error", () => {
    const res = runTool({ items: "nope" });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("missing items key returns error", () => {
    const res = runTool({} as { items: unknown });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("item 2 with invalid section names the item in the error", () => {
    const res = runTool({
      items: [
        { projectName: "P", section: "wins" },
        { projectName: "P", section: "vibes" },
      ],
    });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 2/);
    assert.match(res.error!, /wins, issues, metrics, lessons, followups/);
  });

  it("empty project name returns error", () => {
    const res = runTool({ items: [{ projectName: "   ", section: "wins" }] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 1.*project name is required/);
  });

  it("missing section returns error", () => {
    const res = runTool({ items: [{ projectName: "P" }] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 1.*section is required/);
  });

  it("project name over 120 chars returns error", () => {
    const res = runTool({ items: [{ projectName: "x".repeat(121), section: "wins" }] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /120 characters/);
  });

  it("note over 1000 chars returns error", () => {
    const res = runTool({
      items: [{ projectName: "P", section: "wins", note: "y".repeat(1001) }],
    });
    assert.equal(res.ok, false);
    assert.match(res.error!, /1000 characters/);
  });

  it("non-object item returns error", () => {
    const res = runTool({ items: [42] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 1/);
  });

  it("section matching is case-insensitive", () => {
    const res = runTool({ items: [{ projectName: "P", section: "Wins" }] });
    assert.equal(res.ok, true);
    assert.match(res.values!["debriefDocument"] as string, /## Wins & highlights/);
  });

  it("deterministic: identical items give identical documents", () => {
    const a = runTool({ items: items() });
    const b = runTool({ items: items() });
    assert.deepEqual(a, b);
  });
});
