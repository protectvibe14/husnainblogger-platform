/**
 * Tests for the Lower Third Generator (tool-260).
 * Run: node --test logic.test.ts   (zero dependencies)
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

type Values = Record<string, unknown>;

const GOOD: Values = {
  name: "Jane Doe",
  title: "Senior Editor",
  style: "modern-bar",
  brandColor: "#ff3366",
  durationSec: 5,
};

function okValues(v: Values) {
  const r = runTool(v);
  assert.equal(r.ok, true, JSON.stringify(r.error));
  assert.ok(r.values);
  return r.values;
}

describe("runTool — validation", () => {
  it("missing name → ok:false", () => {
    assert.equal(runTool({ ...GOOD, name: "" }).ok, false);
  });

  it("blank name → ok:false", () => {
    assert.equal(runTool({ ...GOOD, name: "   " }).ok, false);
  });

  it("name over 60 chars → ok:false", () => {
    assert.equal(runTool({ ...GOOD, name: "x".repeat(61) }).ok, false);
  });

  it("title over 60 chars → ok:false", () => {
    assert.equal(runTool({ ...GOOD, title: "y".repeat(61) }).ok, false);
  });

  it("empty title is allowed (name-only style)", () => {
    const values = okValues({ ...GOOD, title: "" });
    const html = values.htmlSnippet as string;
    assert.ok(html.includes("Jane Doe"));
    assert.ok(!html.includes("hb-lt-title"));
  });

  it("bad style → ok:false", () => {
    assert.equal(runTool({ ...GOOD, style: "fancy-glow" }).ok, false);
  });

  it("invalid brandColor → ok:false", () => {
    assert.equal(runTool({ ...GOOD, brandColor: "red" }).ok, false);
    assert.equal(runTool({ ...GOOD, brandColor: "#ff33" }).ok, false);
    assert.equal(runTool({ ...GOOD, brandColor: "" }).ok, false);
  });

  it("duration under 2s → ok:false", () => {
    assert.equal(runTool({ ...GOOD, durationSec: 1.5 }).ok, false);
  });

  it("duration over 10s → ok:false", () => {
    assert.equal(runTool({ ...GOOD, durationSec: 11 }).ok, false);
  });

  it("non-numeric duration → ok:false", () => {
    assert.equal(runTool({ ...GOOD, durationSec: "long" }).ok, false);
  });
});

describe("runTool — snippets", () => {
  it("HTML contains the escaped name and title", () => {
    const values = okValues(GOOD);
    const html = values.htmlSnippet as string;
    assert.ok(html.includes("Jane Doe"));
    assert.ok(html.includes("Senior Editor"));
    assert.ok(html.includes('class="hb-lower-third"'));
  });

  it("HTML escapes dangerous characters", () => {
    const values = okValues({ ...GOOD, name: '<b>Ada</b> & "Co"' });
    const html = values.htmlSnippet as string;
    assert.ok(html.includes("&lt;b&gt;Ada&lt;/b&gt; &amp; &quot;Co&quot;"));
    assert.ok(!html.includes("<b>Ada</b>"));
  });

  it("CSS contains the brand color and keyframes", () => {
    const values = okValues(GOOD);
    const css = values.cssSnippet as string;
    assert.ok(css.includes("#ff3366"));
    assert.ok(css.includes("@keyframes hb-lt-in"));
    assert.ok(css.includes("@keyframes hb-lt-out"));
  });

  it("all 5 styles generate distinct CSS with the accent color", () => {
    const styles = ["modern-bar", "classic-slant", "minimal-line", "bold-block", "mono-card"];
    const seen = new Set<string>();
    for (const style of styles) {
      const values = okValues({ ...GOOD, style });
      const css = values.cssSnippet as string;
      assert.ok(css.includes("#ff3366"), style);
      seen.add(css);
    }
    assert.equal(seen.size, 5); // each style is visually distinct
  });

  it("brand color is normalized to lowercase", () => {
    const values = okValues({ ...GOOD, brandColor: "#FF3366" });
    assert.ok((values.cssSnippet as string).includes("#ff3366"));
  });

  it("3-digit hex is accepted", () => {
    const values = okValues({ ...GOOD, brandColor: "#f36" });
    assert.ok((values.cssSnippet as string).includes("#f36"));
  });
});

describe("runTool — timing", () => {
  it("timing phases sum to the total duration", () => {
    const values = okValues({ ...GOOD, durationSec: 5 });
    const timing = values.timing as Array<{ phase: string; ms: number }>;
    const sum = timing.reduce((a, t) => a + t.ms, 0);
    assert.equal(sum, 5000);
    assert.deepEqual(timing.map((t) => t.phase), ["Fade in", "Hold", "Fade out"]);
    assert.equal(timing[0].ms, 500);
    assert.equal(timing[2].ms, 500);
    assert.equal(timing[1].ms, 4000);
  });

  it("2s duration still gives a positive hold", () => {
    const values = okValues({ ...GOOD, durationSec: 2 });
    const timing = values.timing as Array<{ ms: number }>;
    assert.ok(timing[1].ms >= 1000);
  });
});

describe("runTool — safeAreaCheck", () => {
  it("long names auto-shrink the font with a note", () => {
    const values = okValues({ ...GOOD, name: "A".repeat(40) });
    const css = values.cssSnippet as string;
    assert.ok(css.includes("font-size: 24px"), css.slice(0, 400));
    const check = values.safeAreaCheck as string;
    assert.ok(check.includes("Auto-shrink"));
    assert.ok(check.includes("24px"));
  });

  it("short names keep the base 44px font, no shrink note", () => {
    const values = okValues(GOOD);
    assert.ok((values.cssSnippet as string).includes("font-size: 44px"));
    assert.ok(!(values.safeAreaCheck as string).includes("Auto-shrink"));
  });

  it("short duration vs long text → read-time warning", () => {
    // 60 + 60 chars = 120 chars need 6s at 20 CPS; 2s is not enough
    const values = okValues({
      ...GOOD,
      name: "n".repeat(60),
      title: "t".repeat(60),
      durationSec: 2,
    });
    assert.ok((values.safeAreaCheck as string).includes("Read-time warning"));
  });

  it("comfortable duration → read time OK", () => {
    const values = okValues(GOOD);
    assert.ok((values.safeAreaCheck as string).includes("Read time OK"));
  });

  it("width estimate note is always present", () => {
    const values = okValues(GOOD);
    assert.ok((values.safeAreaCheck as string).includes("Width OK"));
  });
});

describe("runTool — contract", () => {
  it("output ids match the contract: cssSnippet, htmlSnippet, timing, safeAreaCheck", () => {
    const values = okValues(GOOD);
    assert.deepEqual(Object.keys(values).sort(), ["cssSnippet", "htmlSnippet", "safeAreaCheck", "timing"]);
  });

  it("is deterministic", () => {
    assert.deepEqual(runTool(GOOD), runTool(GOOD));
  });
});
