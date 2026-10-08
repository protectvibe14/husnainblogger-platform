import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  composeSvg,
  initialsOf,
  escapeXml,
  downloadName,
  PALETTES,
  SHAPES,
  STYLES,
} from "./logic.ts";

const ocean = PALETTES.find((p) => p.id === "ocean")!;

describe("svg-logo-composer", () => {
  it("produces valid standalone SVG markup", () => {
    const svg = composeSvg("Blue Finch", "circle", ocean, "initial");
    assert.ok(svg.startsWith("<svg"));
    assert.ok(svg.endsWith("</svg>"));
    assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'));
    assert.ok(svg.includes('viewBox="0 0 200 200"'));
    assert.ok(svg.includes(">BF</text>"), "monogram initials rendered");
  });

  it("all four shapes render", () => {
    for (const s of SHAPES) {
      const svg = composeSvg("Acme", s.id, ocean, "initial");
      assert.ok(svg.includes("<svg"), s.id);
      if (s.id === "hexagon") assert.ok(svg.includes("<polygon"));
      if (s.id === "shield") assert.ok(svg.includes("<path"));
      if (s.id === "circle" || s.id === "badge") assert.ok(svg.includes("<circle"));
    }
  });

  it("wordmark style renders full brand text", () => {
    const svg = composeSvg("Blue Finch", "badge", ocean, "wordmark");
    assert.ok(svg.includes(">Blue Finch</text>"));
  });

  it("brand text is XML-escaped", () => {
    const svg = composeSvg("A&B <Co>", "circle", ocean, "wordmark");
    assert.ok(svg.includes("A&amp;B &lt;Co&gt;"));
    assert.ok(!svg.includes(">A&B <Co></text>"));
  });

  it("escapeXml handles all special chars", () => {
    assert.equal(escapeXml(`a&b<c>d"e'f`), "a&amp;b&lt;c&gt;d&quot;e&apos;f");
  });

  it("initialsOf: first letters of first two words", () => {
    assert.equal(initialsOf("Blue Finch"), "BF");
    assert.equal(initialsOf("acme"), "A");
    assert.equal(initialsOf("  spaced   out  here "), "SO");
  });

  it("downloadName slugifies", () => {
    assert.equal(downloadName("Blue Finch"), "blue-finch-logo.svg");
    assert.equal(downloadName("A&B Co!"), "a-b-co-logo.svg");
  });

  it("palettes and styles are all usable", () => {
    assert.equal(PALETTES.length, 6);
    assert.equal(STYLES.length, 2);
    for (const p of PALETTES) {
      const svg = composeSvg("X", "hexagon", p, "initial");
      assert.ok(svg.includes(p.bg));
    }
  });

  it("happy path via runTool", () => {
    const r = runTool({
      brandText: "Northwind",
      shape: "Shield",
      palette: "Royal",
      style: "Monogram (initials)",
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok((v["svg"] as string).includes("<svg"));
    assert.equal(v["downloadName"], "northwind-logo.svg");
    assert.equal(v["initials"], "N");
  });

  it("accepts raw ids too", () => {
    const r = runTool({
      brandText: "X",
      shape: "circle",
      palette: "mono",
      style: "initial",
    });
    assert.equal(r.ok, true);
  });

  it("validation: missing brand -> error", () => {
    assert.equal(runTool({ shape: "Circle" }).ok, false);
  });

  it("validation: brand too long -> error", () => {
    assert.equal(
      runTool({
        brandText: "a".repeat(21),
        shape: "Circle",
        palette: "Ocean",
        style: "Monogram (initials)",
      }).ok,
      false,
    );
  });

  it("validation: unknown shape/palette/style -> error", () => {
    const base = { brandText: "Acme", shape: "Circle", palette: "Ocean", style: "Monogram (initials)" };
    assert.equal(runTool({ ...base, shape: "Nope" }).ok, false);
    assert.equal(runTool({ ...base, palette: "Nope" }).ok, false);
    assert.equal(runTool({ ...base, style: "Nope" }).ok, false);
  });

  it("determinism: same inputs twice -> identical output", () => {
    const args = {
      brandText: "Acme",
      shape: "Hexagon",
      palette: "Neon",
      style: "Wordmark (full text)",
    };
    assert.deepEqual(runTool(args), runTool(args));
  });
});
