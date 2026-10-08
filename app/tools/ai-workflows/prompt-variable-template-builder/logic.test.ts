import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  detectVariables,
  sanitize,
  summarizeItem,
  renderPreview,
  MAX_ITEMS,
  MAX_TEXT_CHARS,
} from "./logic.ts";

const t1 = "Write a {tone} blog post about {topic} in {length} words.";

describe("prompt-variable-template-builder (tool-347)", () => {
  it("happy path: detects 3 variables in order of appearance", () => {
    const res = runTool({ items: [{ templateText: t1 }] });
    assert.equal(res.ok, true);
    assert.equal(res.values!.lines.length, 1);
    assert.match(res.values!.lines[0], /Template 1 — 3 variables \(tone, topic, length\)/);
    assert.match(res.values!.preview, /TEMPLATE 1 — reusable form \(3 variables: tone, topic, length\)/);
    assert.match(res.values!.preview, /tone = \[____________\]/);
    assert.match(res.values!.preview, /\{tone\}/);
    assert.deepEqual(res.values!.warnings, []);
  });

  it("preview shows the full original template text", () => {
    const res = runTool({ items: [{ templateText: t1 }] });
    assert.ok(res.values!.preview.includes(t1));
  });

  it("variables are case-sensitive: {Topic} and {topic} are different", () => {
    const d = detectVariables("About {Topic} vs {topic}.");
    assert.deepEqual(d.variables.map((v) => v.name), ["Topic", "topic"]);
  });

  it("duplicate variables collapse to one entry with a count", () => {
    const d = detectVariables("Write about {topic}. Then expand {topic} more.");
    assert.equal(d.variables.length, 1);
    assert.equal(d.variables[0].name, "topic");
    assert.equal(d.variables[0].count, 2);
  });

  it("duplicate count is shown in the summary line", () => {
    const res = runTool({ items: [{ templateText: "Write about {topic}. Then expand {topic} more." }] });
    assert.match(res.values!.lines[0], /topic \(x2\)/);
  });

  it("variable names allow spaces, underscores, hyphens, and periods", () => {
    const d = detectVariables("Hello {user name}, your id is {user_id} and plan is {plan-type} v{ver.1}.");
    assert.deepEqual(d.variables.map((v) => v.name), ["user name", "user_id", "plan-type", "ver.1"]);
  });

  it("rejects missing items array", () => {
    const res = runTool({} as never);
    assert.equal(res.ok, false);
    assert.match(res.error!, /No items/);
  });

  it("rejects an empty item list", () => {
    const res = runTool({ items: [] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /at least one template/);
  });

  it("rejects more than MAX_ITEMS items", () => {
    const items = Array.from({ length: MAX_ITEMS + 1 }, () => ({ templateText: "Hi {name}." }));
    const res = runTool({ items });
    assert.equal(res.ok, false);
    assert.match(res.error!, new RegExp(`max ${MAX_ITEMS}`));
  });

  it("rejects an item with missing template text (Item N: error)", () => {
    const res = runTool({ items: [{}] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /^Item 1: template text is required/);
  });

  it("rejects an item with only whitespace (Item N: error)", () => {
    const res = runTool({ items: [{ templateText: "   " }] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /^Item 1: template text is required/);
  });

  it("rejects text with no {variables} (Item N: error)", () => {
    const res = runTool({ items: [{ templateText: "Just a plain sentence." }] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /^Item 1: no \{variables\} found/);
  });

  it("numbers the error with the failing item index", () => {
    const res = runTool({
      items: [{ templateText: "Hi {name}." }, { templateText: "No variables here." }],
    });
    assert.equal(res.ok, false);
    assert.match(res.error!, /^Item 2: no \{variables\} found/);
  });

  it("rejects text over MAX_TEXT_CHARS", () => {
    const res = runTool({ items: [{ templateText: "Hi {name}. " + "x".repeat(MAX_TEXT_CHARS) }] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /^Item 1: template text is too long/);
  });

  it("unmatched opening brace becomes a warning, not an error", () => {
    const res = runTool({ items: [{ templateText: "Hi {name}, welcome {oops" }] });
    assert.equal(res.ok, true);
    assert.equal(res.values!.warnings.length, 1);
    assert.match(res.values!.warnings[0], /Template 1: Unmatched "\{" at character 20/);
  });

  it("unmatched closing brace becomes a warning, not an error", () => {
    const res = runTool({ items: [{ templateText: "Hi {name}}." }] });
    assert.equal(res.ok, true);
    assert.match(res.values!.warnings[0], /Template 1: Unmatched "\}"/);
  });

  it("empty {} becomes a warning, not an error", () => {
    const res = runTool({ items: [{ templateText: "Hi {name} and {}." }] });
    assert.equal(res.ok, true);
    assert.match(res.values!.warnings[0], /Empty "\{\}"/);
  });

  it("invalid variable name becomes a warning, not an error", () => {
    const res = runTool({ items: [{ templateText: "Hi {name}, call {9lives}." }] });
    assert.equal(res.ok, true);
    assert.match(res.values!.warnings[0], /not a valid variable name/);
  });

  it("warnings from multiple templates are prefixed with the template number", () => {
    const res = runTool({
      items: [{ templateText: "A {x} B {" }, { templateText: "C {y}} D" }],
    });
    assert.equal(res.ok, true);
    assert.equal(res.values!.warnings.length, 2);
    assert.match(res.values!.warnings[0], /^Template 1:/);
    assert.match(res.values!.warnings[1], /^Template 2:/);
  });

  it("deterministic: same input produces identical output twice", () => {
    const items = [{ templateText: t1 }, { templateText: "Summarize {text} for {audience}." }];
    const a = runTool({ items });
    const b = runTool({ items });
    assert.deepEqual(a, b);
  });

  it("sanitize strips control chars and collapses whitespace", () => {
    assert.equal(sanitize("  hi\t\tthere\n\u0000"), "hi there");
  });

  it("sanitize returns empty string for non-strings", () => {
    assert.equal(sanitize(42), "");
    assert.equal(sanitize(null), "");
  });

  it("summarizeItem truncates long templates at 80 chars", () => {
    const long = "A {x} " + "word ".repeat(40);
    const line = summarizeItem(0, long, [{ name: "x", count: 1 }]);
    assert.ok(line.endsWith('..."'));
    assert.match(line, /Template 1 — 1 variable \(x\)/);
  });

  it("renderPreview renders a block per template separated by ---", () => {
    const items = [
      { text: t1, detection: detectVariables(t1) },
      { text: "Summarize {text}.", detection: detectVariables("Summarize {text}.") },
    ];
    const p = renderPreview(items);
    assert.match(p, /TEMPLATE 1/);
    assert.match(p, /TEMPLATE 2/);
    assert.ok(p.includes("---"));
  });

  it("singular vs plural: 1 variable vs 2 variables in summary", () => {
    const one = runTool({ items: [{ templateText: "Hi {name}." }] });
    assert.match(one.values!.lines[0], /1 variable \(/);
    const two = runTool({ items: [{ templateText: "Hi {name}, {friend}." }] });
    assert.match(two.values!.lines[0], /2 variables \(/);
  });

  it("output ids are exactly lines, preview, warnings", () => {
    const res = runTool({ items: [{ templateText: t1 }] });
    assert.deepEqual(Object.keys(res.values!).sort(), ["lines", "preview", "warnings"]);
  });
});
