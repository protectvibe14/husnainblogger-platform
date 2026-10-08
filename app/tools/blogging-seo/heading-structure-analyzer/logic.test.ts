import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id).sort();

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "expected values");
  assert.deepEqual(Object.keys(r.values).sort(), OUTPUT_IDS);
  return r.values;
}

function tableOf(v: Record<string, unknown>, id: string): { columns: string[]; rows: string[][] } {
  return v[id] as { columns: string[]; rows: string[][] };
}

describe("heading-structure-analyzer", () => {
  it("perfect structure scores 100 with an 'ok' row", () => {
    const v = okValues({
      html: "<h1>Guide</h1><p>Intro</p><h2>Basics</h2><h3>Details</h3><h2>FAQ</h2>",
    });
    assert.equal(v["score"], 100);
    const issues = tableOf(v, "issues");
    assert.deepEqual(issues.columns, ["Severity", "Issue", "Detail"]);
    assert.equal(issues.rows.length, 1);
    assert.equal(issues.rows[0][0], "ok");
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ html: "<h1>Hi</h1>" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), OUTPUT_IDS);
  });

  it("outline lists headings in document order with levels", () => {
    const v = okValues({ html: "<h1>Guide</h1><h2>Basics</h2><h3>Details</h3>" });
    const outline = tableOf(v, "outline");
    assert.deepEqual(outline.columns, ["Level", "Heading"]);
    assert.deepEqual(outline.rows, [
      ["H1", "Guide"],
      ["H2", "Basics"],
      ["H3", "Details"],
    ]);
  });

  it("missing H1 costs 25 points", () => {
    const v = okValues({ html: "<h2>Basics</h2><h3>Details</h3>" });
    assert.equal(v["score"], 75);
    const rows = tableOf(v, "issues").rows;
    assert.ok(rows.some((r) => r[1] === "Missing H1"));
  });

  it("multiple H1s cost 10 points each beyond the first", () => {
    const v = okValues({ html: "<h1>One</h1><h1>Two</h1><h1>Three</h1>" });
    assert.equal(v["score"], 80);
    const rows = tableOf(v, "issues").rows;
    assert.ok(rows.some((r) => r[0] === "error" && r[1].includes("Multiple H1s")));
  });

  it("skipped level (H1 -> H3) costs 10 points", () => {
    const v = okValues({ html: "<h1>Guide</h1><h3>Details</h3>" });
    assert.equal(v["score"], 90);
    const rows = tableOf(v, "issues").rows;
    assert.ok(rows.some((r) => r[1].includes("H1 → H3")));
  });

  it("empty heading costs 10 points", () => {
    const v = okValues({ html: "<h1>Guide</h1><h2></h2>" });
    assert.equal(v["score"], 90);
    const outline = tableOf(v, "outline").rows;
    assert.equal(outline[1][1], "(empty)");
  });

  it("duplicate heading text costs 5 points (once per repeated text)", () => {
    const v = okValues({ html: "<h1>Guide</h1><h2>FAQ</h2><h2>faq</h2><h2>FAQ</h2>" });
    assert.equal(v["score"], 95);
    const rows = tableOf(v, "issues").rows;
    assert.equal(rows.filter((r) => r[1].startsWith("Duplicate")).length, 1);
  });

  it("deductions combine: missing H1 + skipped level + empty = 55", () => {
    const v = okValues({ html: "<h2></h2><h4>Deep</h4>" });
    // no H1 (-25) + empty h2 (-10) + H2->H4 skip (-10) = 55
    assert.equal(v["score"], 55);
  });

  it("score never drops below 0", () => {
    const v = okValues({
      html: "<h2></h2><h2></h2><h2></h2><h2></h2><h2></h2><h2></h2><h2></h2><h2></h2>",
    });
    assert.equal(v["score"], 0);
  });

  it("uppercase tags are recognized", () => {
    const v = okValues({ html: "<H1>Guide</H1><H2>Basics</H2>" });
    assert.equal(v["score"], 100);
  });

  it("inner markup is stripped from heading text", () => {
    const v = okValues({ html: '<h1>Guide</h1><h2><span class="x">Basics</span></h2>' });
    const outline = tableOf(v, "outline").rows;
    assert.equal(outline[1][1], "Basics");
  });

  it("common entities are decoded", () => {
    const v = okValues({ html: "<h1>Tom &amp; Jerry</h1><h2>Q&amp;A</h2>" });
    const outline = tableOf(v, "outline").rows;
    assert.equal(outline[0][1], "Tom & Jerry");
  });

  it("validation: no heading tags errors", () => {
    const r = runTool({ html: "<p>Just a paragraph.</p>" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /heading tags/i);
  });

  it("validation: empty html errors", () => {
    const r = runTool({ html: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /empty/i);
  });

  it("unclosed heading tags are ignored (no valid headings -> error)", () => {
    const r = runTool({ html: "<h1>Broken<h2>Also broken" });
    assert.equal(r.ok, false);
  });

  it("headings with attributes are parsed", () => {
    const v = okValues({
      html: '<h1 id="top" class="title">Guide</h1><h2 data-x="1">Basics</h2>',
    });
    assert.equal(v["score"], 100);
    assert.equal(tableOf(v, "outline").rows.length, 2);
  });

  it("determinism: same inputs produce identical results", () => {
    const input = { html: "<h1>A</h1><h3>B</h3><h3>B</h3>" };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepEqual(a, b);
  });
});
