import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, buildSvg, escapeXml, parseBackground, labelFontSize } from "./logic.ts";

const META_OUTPUTS = ["svg", "svgCode"];

describe("highlight-cover-maker (tool-205)", () => {
  it("builds a solid-color SVG cover (label + icon)", () => {
    const r = runTool({ items: [{ label: "Tips", background: "#FF6B6B", icon: "✈️" }] });
    assert.equal(r.ok, true);
    const svg = r.values?.svg as string;
    assert.ok(svg.startsWith("<svg"));
    assert.ok(svg.endsWith("</svg>"));
    assert.ok(svg.includes('viewBox="0 0 1080 1080"'));
    assert.ok(svg.includes("#FF6B6B"));
    assert.ok(svg.includes("Tips"));
    assert.ok(svg.includes("✈️"));
  });

  it("builds a gradient background from colorA|colorB", () => {
    const r = runTool({ items: [{ label: "Food", background: "#FF6B6B|#4ECDC4", icon: "🍕" }] });
    assert.equal(r.ok, true);
    const svg = r.values?.svg as string;
    assert.ok(svg.includes("<linearGradient"));
    assert.ok(svg.includes('url(#g0)'));
    assert.ok(svg.includes("#4ECDC4"));
  });

  it("gradient ids are unique per item", () => {
    const r = runTool({
      items: [
        { label: "A", background: "#111111|#222222", icon: "" },
        { label: "B", background: "#333333|#444444", icon: "" },
      ],
    });
    assert.equal(r.ok, true);
    const svg = r.values?.svg as string;
    assert.ok(svg.includes('id="g0"') && svg.includes('id="g1"'));
  });

  it("icon-only cover is allowed (no label)", () => {
    const r = runTool({ items: [{ label: "", background: "#000000", icon: "🌟" }] });
    assert.equal(r.ok, true);
    assert.ok((r.values?.svg as string).includes("🌟"));
  });

  it("label-only cover is allowed (no icon)", () => {
    const r = runTool({ items: [{ label: "Travel", background: "#000", icon: "" }] });
    assert.equal(r.ok, true);
    assert.ok((r.values?.svg as string).includes("Travel"));
  });

  it("errors when both label and icon are empty", () => {
    const r = runTool({ items: [{ label: "", background: "#FF6B6B", icon: "" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /label or an icon/i);
  });

  it("errors when label exceeds 60 chars", () => {
    const r = runTool({ items: [{ label: "x".repeat(61), background: "#FF6B6B", icon: "" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /60 characters/);
  });

  it("errors on invalid background color", () => {
    const r = runTool({ items: [{ label: "Tips", background: "red", icon: "" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /background/i);
  });

  it("errors on malformed gradient", () => {
    const r = runTool({ items: [{ label: "Tips", background: "#FF6B6B|red", icon: "" }] });
    assert.equal(r.ok, false);
  });

  it("errors on missing background", () => {
    const r = runTool({ items: [{ label: "Tips", background: "", icon: "" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 1:.*background is required/i);
  });

  it("labels bad rows by item number", () => {
    const r = runTool({
      items: [
        { label: "OK", background: "#111111", icon: "" },
        { label: "", background: "", icon: "" },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 2:/);
  });

  it("errors when items is missing or empty", () => {
    assert.equal(runTool({ items: [] }).ok, false);
    assert.equal(runTool({} as never).ok, false);
  });

  it("XML-escapes label and icon text", () => {
    const svg = buildSvg({ label: "Q&A <tips>", background: "#123456", icon: ">" }, 0);
    assert.ok(svg.includes("Q&amp;A &lt;tips&gt;"));
    assert.ok(svg.includes("&gt;"));
    assert.ok(!svg.includes("Q&A <tips>"));
  });

  it("escapeXml covers all five XML entities", () => {
    assert.equal(escapeXml(`&<>"'`), "&amp;&lt;&gt;&quot;&apos;");
  });

  it("parseBackground handles 3-digit hex", () => {
    const bg = parseBackground("#abc", 0);
    assert.deepEqual(bg, { kind: "solid", colorA: "#abc" });
  });

  it("labelFontSize shrinks for long labels, floored at 40", () => {
    assert.ok(labelFontSize("Tips") <= 96);
    assert.ok(labelFontSize("x".repeat(60)) >= 40);
    assert.equal(labelFontSize("x".repeat(60)), 40);
    assert.ok(labelFontSize("Tips") > labelFontSize("A fairly long highlight label here"));
  });

  it("is deterministic: same inputs -> identical SVG", () => {
    const a = buildSvg({ label: "Tips", background: "#FF6B6B|#4ECDC4", icon: "✈️" }, 0);
    const b = buildSvg({ label: "Tips", background: "#FF6B6B|#4ECDC4", icon: "✈️" }, 0);
    assert.equal(a, b);
  });

  it("multiple items produce one SVG document per row", () => {
    const r = runTool({
      items: [
        { label: "A", background: "#111111", icon: "1" },
        { label: "B", background: "#222222", icon: "2" },
      ],
    });
    assert.equal(r.ok, true);
    const count = ((r.values?.svg as string).match(/<svg/g) ?? []).length;
    assert.equal(count, 2);
  });

  it("svg and svgCode carry the same payload", () => {
    const r = runTool({ items: [{ label: "Tips", background: "#FF6B6B", icon: "" }] });
    assert.equal(r.values?.svg, r.values?.svgCode);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ items: [{ label: "Tips", background: "#FF6B6B", icon: "" }] });
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), [...META_OUTPUTS].sort());
  });

  it("uses no DOM/canvas APIs (string-built SVG)", async () => {
    const src = await import("node:fs").then((fs) =>
      fs.readFileSync(new URL("./logic.ts", import.meta.url), "utf8"),
    );
    for (const banned of ["document.createElement", "window.", "getContext(", "toDataURL", "Math.random(", "createElementNS"]) {
      assert.ok(!src.includes(banned), `logic.ts must not use ${banned}`);
    }
  });
});
