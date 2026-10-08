import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  escapeHtml,
  parseHeaders,
  parseRows,
  buildComparisonTable,
  parseHighlightIndex,
  MIN_HEADERS,
  MAX_HEADERS,
  MAX_ROWS,
} from "./logic.ts";

const HEADERS = "Feature\nProduct A\nProduct B";
const ROWS = "Price | $10 | $20\nRating | 4.5 | 4.0";

describe("comparison-table-html-generator", () => {
  it("builds a table on a happy path", () => {
    const r = runTool({ headers: HEADERS, rows: ROWS });
    assert.equal(r.ok, true);
    const html = r.values!.tableHtml as string;
    assert.ok(html.includes("<table"));
    assert.ok(html.includes("Product A"));
    assert.ok(html.includes("$10"));
    assert.ok((r.values!.tableCss as string).includes(".hb-compare-table"));
  });

  it("escapes <script> in cell content", () => {
    const r = runTool({
      headers: "A\nB",
      rows: "<script>alert(1)</script> | ok",
    });
    assert.equal(r.ok, true);
    const html = r.values!.tableHtml as string;
    assert.ok(!html.includes("<script>"));
    assert.ok(html.includes("&lt;script&gt;"));
  });

  it("escapes ampersands and quotes", () => {
    assert.equal(escapeHtml('a&b<"c\'>d'), "a&amp;b&lt;&quot;c&#39;&gt;d");
  });

  it("escapes header text", () => {
    const r = runTool({ headers: "<b>Bold</b>\nPlain", rows: "x | y" });
    assert.equal(r.ok, true);
    assert.ok((r.values!.tableHtml as string).includes("&lt;b&gt;Bold&lt;/b&gt;"));
  });

  it("rejects fewer than 2 headers", () => {
    const r = runTool({ headers: "Only", rows: "x" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least 2/);
  });

  it("rejects more than 6 headers", () => {
    const r = runTool({ headers: "a\nb\nc\nd\ne\nf\ng", rows: "1|2|3|4|5|6|7" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Too many headers/);
  });

  it("rejects missing headers", () => {
    const r = runTool({ rows: ROWS });
    assert.equal(r.ok, false);
  });

  it("rejects missing rows", () => {
    const r = runTool({ headers: HEADERS });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least 1 table row/);
  });

  it("rejects more than 20 rows", () => {
    const manyRows = Array.from({ length: MAX_ROWS + 1 }, (_, i) => `r${i} | a | b`).join("\n");
    const r = runTool({ headers: HEADERS, rows: manyRows });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Too many rows/);
  });

  it("accepts exactly 20 rows", () => {
    const manyRows = Array.from({ length: MAX_ROWS }, (_, i) => `r${i} | a | b`).join("\n");
    const r = runTool({ headers: HEADERS, rows: manyRows });
    assert.equal(r.ok, true);
  });

  it("rejects a row whose cell count mismatches the headers", () => {
    const r = runTool({ headers: HEADERS, rows: "only | two" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Row 1 has 2 cells but there are 3 headers/);
  });

  it("reports the correct row number on a bad row", () => {
    const r = runTool({ headers: HEADERS, rows: "a | b | c\nx | y" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Row 2/);
  });

  it("highlights the chosen column", () => {
    const r = runTool({ headers: HEADERS, rows: ROWS, highlightColumn: 1 });
    assert.equal(r.ok, true);
    assert.ok((r.values!.tableHtml as string).includes("hb-compare-hl"));
  });

  it("rejects an out-of-range highlight column", () => {
    const r = runTool({ headers: HEADERS, rows: ROWS, highlightColumn: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /between 0 and 2/);
  });

  it("rejects a non-integer highlight column", () => {
    const r = runTool({ headers: HEADERS, rows: ROWS, highlightColumn: 1.5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /whole number/);
  });

  it("keeps unicode cell content intact", () => {
    const r = runTool({ headers: "لغة\n日本語", rows: "مرحبا | こんにちは 🎉" });
    assert.equal(r.ok, true);
    const html = r.values!.tableHtml as string;
    assert.ok(html.includes("مرحبا"));
    assert.ok(html.includes("🎉"));
  });

  it("accepts array-form headers and rows", () => {
    const r = runTool({
      headers: ["A", "B"],
      rows: [["x", "y"], ["1", "2"]],
    });
    assert.equal(r.ok, true);
    assert.ok((r.values!.tableHtml as string).includes("<td"));
  });

  it("skips blank header lines", () => {
    const parsed = parseHeaders("A\n\nB\n");
    assert.deepEqual(parsed, ["A", "B"]);
    assert.ok(MIN_HEADERS === 2 && MAX_HEADERS === 6);
  });

  it("parseHighlightIndex treats empty as not provided", () => {
    assert.deepEqual(parseHighlightIndex("", 3), { ok: true, index: null });
    assert.deepEqual(parseHighlightIndex(undefined, 3), { ok: true, index: null });
  });

  it("buildComparisonTable without highlight has no hl class", () => {
    const { tableHtml } = buildComparisonTable(["A", "B"], [["x", "y"]], null);
    assert.ok(!tableHtml.includes("hb-compare-hl"));
    const parsed = parseRows("a | b");
    assert.ok(parsed !== null);
    assert.ok(parsed.length === 1);
  });

  it("is deterministic (same inputs → identical outputs)", () => {
    const input = { headers: HEADERS, rows: ROWS, highlightColumn: 2 };
    assert.deepEqual(runTool(input), runTool(input));
  });

  it("returns exactly the output ids defined in meta.ts", () => {
    const r = runTool({ headers: HEADERS, rows: ROWS });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["tableCss", "tableHtml"]);
  });

  it("rejects a non-object input", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });
});
