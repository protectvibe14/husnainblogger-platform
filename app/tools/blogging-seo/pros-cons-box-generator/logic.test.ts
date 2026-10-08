import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  escapeHtml,
  parseItems,
  validateItems,
  buildProsConsBox,
  MAX_ITEMS,
  MAX_ITEM_CHARS,
  DEFAULT_TITLE,
} from "./logic.ts";

describe("pros-cons-box-generator", () => {
  it("builds a box on a happy path", () => {
    const r = runTool({ pros: "Fast\nEasy to use", cons: "Pricey", title: "My Review" });
    assert.equal(r.ok, true);
    const html = r.values!.boxHtml as string;
    assert.ok(html.includes("My Review"));
    assert.ok(html.includes("Fast"));
    assert.ok(html.includes("Pricey"));
    assert.ok(html.includes("✓ Pros"));
    assert.ok(html.includes("✕ Cons"));
    assert.ok((r.values!.boxCss as string).includes(".hb-proscons"));
  });

  it("uses the default title when none is given", () => {
    const r = runTool({ pros: "A", cons: "B" });
    assert.equal(r.ok, true);
    assert.ok((r.values!.boxHtml as string).includes(escapeHtml(DEFAULT_TITLE)));
  });

  it("escapes <script> in a pro item", () => {
    const r = runTool({ pros: "<script>alert(1)</script>", cons: "B" });
    assert.equal(r.ok, true);
    const html = r.values!.boxHtml as string;
    assert.ok(!html.includes("<script>"));
    assert.ok(html.includes("&lt;script&gt;"));
  });

  it("escapes the title", () => {
    const r = runTool({ pros: "A", cons: "B", title: "<img src=x onerror=y>" });
    assert.equal(r.ok, true);
    assert.ok((r.values!.boxHtml as string).includes("&lt;img"));
  });

  it("escapes quotes and ampersands", () => {
    const r = runTool({ pros: 'Tom & "Jerry"', cons: "B" });
    assert.equal(r.ok, true);
    assert.ok((r.values!.boxHtml as string).includes("Tom &amp; &quot;Jerry&quot;"));
  });

  it("rejects missing pros", () => {
    const r = runTool({ cons: "B" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /pro/i);
  });

  it("rejects missing cons", () => {
    const r = runTool({ pros: "A" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /con/i);
  });

  it("rejects an empty pros list", () => {
    const r = runTool({ pros: "\n\n", cons: "B" });
    assert.equal(r.ok, false);
  });

  it("rejects more than 10 pros", () => {
    const many = Array.from({ length: MAX_ITEMS + 1 }, (_, i) => `pro ${i}`).join("\n");
    const r = runTool({ pros: many, cons: "B" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Too many pros/);
  });

  it("accepts exactly 10 items per side", () => {
    const ten = Array.from({ length: MAX_ITEMS }, (_, i) => `item ${i}`).join("\n");
    const r = runTool({ pros: ten, cons: ten });
    assert.equal(r.ok, true);
  });

  it("rejects an item over 200 chars", () => {
    const long = "x".repeat(MAX_ITEM_CHARS + 1);
    const r = runTool({ pros: long, cons: "B" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /201 chars/);
  });

  it("accepts an item of exactly 200 chars", () => {
    const r = runTool({ pros: "x".repeat(MAX_ITEM_CHARS), cons: "B" });
    assert.equal(r.ok, true);
  });

  it("rejects a title over 100 chars", () => {
    const r = runTool({ pros: "A", cons: "B", title: "t".repeat(101) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Title is 101 chars/);
  });

  it("keeps unicode items intact", () => {
    const r = runTool({ pros: "بہت تیز ⚡", cons: "مہنگا" });
    assert.equal(r.ok, true);
    assert.ok((r.values!.boxHtml as string).includes("بہت تیز ⚡"));
  });

  it("accepts array-form inputs", () => {
    const r = runTool({ pros: ["A", "B"], cons: ["C"] });
    assert.equal(r.ok, true);
  });

  it("validateItems flags per-side counts", () => {
    assert.deepEqual(validateItems([], "pros"), ["Add at least 1 pro."]);
    assert.deepEqual(validateItems([], "cons"), ["Add at least 1 con."]);
    assert.equal(validateItems(["ok"], "pros").length, 0);
  });

  it("parseItems skips blank lines", () => {
    assert.deepEqual(parseItems("A\n\nB\n"), ["A", "B"]);
    assert.equal(parseItems(123), null);
  });

  it("buildProsConsBox renders both columns", () => {
    const { boxHtml } = buildProsConsBox(["P"], ["C"], "T");
    assert.ok(boxHtml.includes("hb-proscons-pros"));
    assert.ok(boxHtml.includes("hb-proscons-cons"));
  });

  it("is deterministic (same inputs → identical outputs)", () => {
    const input = { pros: "Fast\nReliable", cons: "Pricey", title: "Review" };
    assert.deepEqual(runTool(input), runTool(input));
  });

  it("returns exactly the output ids defined in meta.ts", () => {
    const r = runTool({ pros: "A", cons: "B" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["boxCss", "boxHtml"]);
  });

  it("rejects a non-object input", () => {
    const r = runTool(undefined as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });
});
