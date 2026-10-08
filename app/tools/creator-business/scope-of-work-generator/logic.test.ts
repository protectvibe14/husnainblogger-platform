/**
 * Tests for the Scope of Work Generator pure logic (tool-464).
 *
 * Run: node --test app/tools/creator-business/scope-of-work-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  generateScopeOfWork,
  parseList,
  OUT_OF_SCOPE_WARNING,
} from "./logic.ts";

function baseInput() {
  return {
    projectTitle: "Launch campaign content pack",
    clientName: "GlowCo LLC",
    deliverables: ["3 Instagram Reels", "5 product photos"],
    timeline: "4 weeks from kickoff call",
    revisionLimit: 2,
    outOfScope: ["Paid ad management", "Website redesign"],
    paymentTerms: "50% upfront, 50% on delivery",
    assumptions: ["Client provides product samples by week 1"],
  };
}

describe("parseList", () => {
  it("accepts an array of strings and trims entries", () => {
    assert.deepStrictEqual(parseList([" a ", "", "b"]), ["a", "b"]);
  });
  it("splits newline-separated strings", () => {
    assert.deepStrictEqual(parseList("one\ntwo\nthree"), ["one", "two", "three"]);
  });
  it("splits semicolon-separated items", () => {
    assert.deepStrictEqual(parseList("one; two;three"), ["one", "two", "three"]);
  });
  it("returns [] for non-string, non-array values", () => {
    assert.deepStrictEqual(parseList(null), []);
    assert.deepStrictEqual(parseList(42), []);
  });
});

describe("generateScopeOfWork — structure", () => {
  it("includes every numbered section", () => {
    const text = generateScopeOfWork(baseInput());
    for (const n of ["1.", "2.", "3.", "4.", "5.", "6.", "7."]) {
      assert.ok(text.includes(n), `missing section ${n}`);
    }
  });
  it("lists deliverables numbered in order", () => {
    const text = generateScopeOfWork(baseInput());
    assert.ok(text.includes("1. 3 Instagram Reels"));
    assert.ok(text.includes("2. 5 product photos"));
  });
  it("shows the revision limit", () => {
    const text = generateScopeOfWork(baseInput());
    assert.ok(text.includes("2 revision rounds included"));
  });
  it("uses the zero-revision wording for 0", () => {
    const text = generateScopeOfWork({ ...baseInput(), revisionLimit: 0 });
    assert.ok(text.includes("No revision rounds are included"));
  });
  it("lists out-of-scope items", () => {
    const text = generateScopeOfWork(baseInput());
    assert.ok(text.includes("Paid ad management"));
  });
  it("emits the warning when out-of-scope is empty (still generates)", () => {
    const text = generateScopeOfWork({ ...baseInput(), outOfScope: [] });
    assert.ok(text.includes(OUT_OF_SCOPE_WARNING));
    assert.ok(text.includes("2. DELIVERABLES"));
  });
  it("renders (No assumptions listed.) when assumptions are empty", () => {
    const text = generateScopeOfWork({ ...baseInput(), assumptions: [] });
    assert.ok(text.includes("(No assumptions listed.)"));
  });
  it("ends with the draft disclaimer", () => {
    const text = generateScopeOfWork(baseInput());
    assert.ok(text.includes("draft scope-of-work template"));
    assert.ok(text.includes("not legal advice"));
  });
  it("is deterministic", () => {
    assert.strictEqual(
      generateScopeOfWork(baseInput()),
      generateScopeOfWork(baseInput()),
    );
  });
});

describe("runTool — validation", () => {
  it("generates a document for valid inputs", () => {
    const r = runTool(baseInput());
    assert.strictEqual(r.ok, true);
    assert.ok(typeof r.values!.scopeOfWorkDocument === "string");
  });
  it("rejects an empty project title", () => {
    assert.strictEqual(runTool({ ...baseInput(), projectTitle: "" }).ok, false);
  });
  it("rejects an empty client name", () => {
    assert.strictEqual(runTool({ ...baseInput(), clientName: "  " }).ok, false);
  });
  it("rejects missing deliverables", () => {
    assert.strictEqual(
      runTool({ ...baseInput(), deliverables: [] }).ok,
      false,
    );
    assert.strictEqual(
      runTool({ ...baseInput(), deliverables: "\n  \n" }).ok,
      false,
    );
  });
  it("rejects an empty timeline", () => {
    assert.strictEqual(runTool({ ...baseInput(), timeline: "" }).ok, false);
  });
  it("rejects negative or fractional revision limits", () => {
    assert.strictEqual(runTool({ ...baseInput(), revisionLimit: -1 }).ok, false);
    assert.strictEqual(runTool({ ...baseInput(), revisionLimit: 1.5 }).ok, false);
  });
  it("rejects empty payment terms", () => {
    assert.strictEqual(runTool({ ...baseInput(), paymentTerms: "" }).ok, false);
  });
  it("accepts newline-separated deliverable strings", () => {
    const r = runTool({
      ...baseInput(),
      deliverables: "Reel\nPhoto set",
    });
    assert.strictEqual(r.ok, true);
    assert.ok((r.values as Record<string, string>).scopeOfWorkDocument.includes("1. Reel"));
  });
  it("accepts numeric strings for the revision limit", () => {
    const r = runTool({ ...baseInput(), revisionLimit: "3" });
    assert.strictEqual(r.ok, true);
    assert.ok((r.values as Record<string, string>).scopeOfWorkDocument.includes("3 revision rounds included"));
  });
  it("output key is exactly scopeOfWorkDocument", () => {
    const r = runTool(baseInput());
    assert.deepStrictEqual(Object.keys(r.values!), ["scopeOfWorkDocument"]);
  });
});
