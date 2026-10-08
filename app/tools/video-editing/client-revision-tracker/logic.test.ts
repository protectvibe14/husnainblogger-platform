import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, VALID_STATUSES } from "./logic.ts";

const OUTPUT_IDS = ["summary", "openCount", "overLimit", "roundHistory", "exportCsv"];

function okValues(args: { items: Record<string, unknown>[]; revisionLimit?: unknown }): Record<string, unknown> {
  const r = runTool(args);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

const ITEMS = [
  { round: 1, request: "Trim the intro by 10 seconds", status: "approved" },
  { round: 2, request: "Make the logo bigger", status: "pending" },
  { round: 3, request: "Change the background music", status: "in-progress" },
];

describe("client-revision-tracker", () => {
  it("happy path: summary, open count, history, CSV", () => {
    const v = okValues({ items: ITEMS });
    assert.equal(v.openCount, 2);
    assert.equal(v.overLimit, "No");
    assert.ok((v.summary as string).includes("3 revisions logged"));
    assert.ok((v.summary as string).includes("2 open"));
    const history = v.roundHistory as string[];
    assert.equal(history.length, 3);
    assert.ok(history[0].startsWith("Round 1 — approved"));
    const csv = v.exportCsv as string;
    assert.ok(csv.startsWith("round,request,status\n"));
    assert.ok(csv.includes("1,Trim the intro by 10 seconds,approved"));
  });

  it("empty items errors", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one revision/i);
  });

  it("non-array items errors", () => {
    const r = runTool({ items: null as unknown as Record<string, unknown>[] });
    assert.equal(r.ok, false);
  });

  it("Item N: round must be a positive whole number", () => {
    assert.match(runTool({ items: [{ round: 0, request: "x", status: "pending" }] }).error!, /Item 1.*round/);
    assert.match(runTool({ items: [{ round: -2, request: "x", status: "pending" }] }).error!, /Item 1.*round/);
    assert.match(runTool({ items: [{ round: 1.5, request: "x", status: "pending" }] }).error!, /Item 1.*round/);
    assert.match(runTool({ items: [{ request: "x", status: "pending" }] }).error!, /Item 1.*round/);
  });

  it("Item N: request is required", () => {
    assert.match(runTool({ items: [{ round: 1, request: "", status: "pending" }] }).error!, /Item 1.*request/);
    assert.match(runTool({ items: [{ round: 1, request: "   ", status: "pending" }] }).error!, /Item 1.*request/);
  });

  it("Item N: unknown status errors listing valid statuses", () => {
    const r = runTool({ items: [{ round: 1, request: "Fix audio", status: "maybe" }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /pending, in-progress, approved, rejected/);
  });

  it("status canonicalization is case-insensitive", () => {
    const v = okValues({
      items: [
        { round: 1, request: "a", status: "APPROVED" },
        { round: 2, request: "b", status: "In Progress" },
        { round: 3, request: "c", status: "Pending" },
      ],
    });
    const history = v.roundHistory as string[];
    assert.ok(history[0].includes("approved"));
    assert.ok(history[1].includes("in-progress"));
    assert.ok(history[2].includes("pending"));
  });

  it("status aliases resolve", () => {
    const v = okValues({
      items: [
        { round: 1, request: "a", status: "done" },
        { round: 2, request: "b", status: "wip" },
        { round: 3, request: "c", status: "declined" },
      ],
    });
    const history = v.roundHistory as string[];
    assert.ok(history[0].includes("approved"), "done -> approved");
    assert.ok(history[1].includes("in-progress"), "wip -> in-progress");
    assert.ok(history[2].includes("rejected"), "declined -> rejected");
  });

  it("all four canonical statuses accepted", () => {
    for (const s of VALID_STATUSES) {
      const v = okValues({ items: [{ round: 1, request: "x", status: s }] });
      assert.ok((v.roundHistory as string[])[0].includes(s));
    }
  });

  it("exceeding revisionLimit flags overLimit Yes", () => {
    const v = okValues({ items: ITEMS, revisionLimit: 2 });
    assert.equal(v.overLimit, "Yes");
    assert.ok((v.summary as string).includes("Over your limit of 2"));
  });

  it("within revisionLimit reports No", () => {
    const v = okValues({ items: ITEMS, revisionLimit: 5 });
    assert.equal(v.overLimit, "No");
    assert.ok((v.summary as string).includes("Within your limit of 5"));
  });

  it("invalid revisionLimit errors", () => {
    assert.equal(runTool({ items: ITEMS, revisionLimit: 0 }).ok, false);
    assert.equal(runTool({ items: ITEMS, revisionLimit: "lots" }).ok, false);
  });

  it("out-of-order rounds are sorted with a note", () => {
    const v = okValues({
      items: [
        { round: 3, request: "c", status: "pending" },
        { round: 1, request: "a", status: "approved" },
        { round: 2, request: "b", status: "rejected" },
      ],
    });
    const history = v.roundHistory as string[];
    assert.ok(history[0].startsWith("Round 1"));
    assert.ok(history[1].startsWith("Round 2"));
    assert.ok(history[2].startsWith("Round 3"));
    assert.ok((v.summary as string).includes("out of order"));
  });

  it("CSV quotes fields with commas/quotes/newlines", () => {
    const v = okValues({
      items: [{ round: 1, request: 'Make it "pop", please\nand louder', status: "pending" }],
    });
    const csv = v.exportCsv as string;
    assert.ok(csv.includes('1,"Make it ""pop"", please\nand louder",pending'));
  });

  it("single revision uses singular wording", () => {
    const v = okValues({ items: [{ round: 1, request: "Fix typo", status: "approved" }] });
    assert.ok((v.summary as string).includes("1 revision logged"));
    assert.equal(v.openCount, 0);
  });

  it("numeric-string rounds are accepted", () => {
    const v = okValues({ items: [{ round: "2", request: "x", status: "pending" }] });
    assert.ok((v.roundHistory as string[])[0].startsWith("Round 2"));
  });

  it("deterministic: two runs identical", () => {
    const args = { items: ITEMS, revisionLimit: 2 };
    assert.deepEqual(runTool(args), runTool(args));
  });

  it("output ids match meta outputs", () => {
    const v = okValues({ items: ITEMS });
    assert.deepEqual(Object.keys(v).sort(), [...OUTPUT_IDS].sort());
  });
});
