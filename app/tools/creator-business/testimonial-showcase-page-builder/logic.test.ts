import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, MAX_ITEMS, DEFAULT_PAGE_TITLE, DEFAULT_BRAND_COLOR } from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id).sort();

function validItems() {
  return [
    {
      pageTitle: "What My Clients Say",
      brandColor: "#FF6B35",
      quote: "Working with her doubled our launch-week sales.",
      clientName: "Sarah Ahmed",
      role: "Founder, Bloom & Co.",
      photoUrl: "https://example.com/sarah.jpg",
    },
    {
      quote: "Fast, honest, and easy to work with.",
      clientName: "Danish Raza",
    },
  ];
}

describe("testimonial-showcase-page-builder", () => {
  it("happy path: builds page HTML and embed snippet", () => {
    const r = runTool({ items: validItems() });
    assert.equal(r.ok, true);
    const html = r.values!["showcasePageHTML"] as string;
    const embed = r.values!["embedSnippet"] as string;
    assert.ok(html.includes("<!DOCTYPE html>"));
    assert.ok(html.includes("What My Clients Say"));
    assert.ok(html.includes("Sarah Ahmed"));
    assert.ok(html.includes("Danish Raza"));
    assert.ok(embed.includes("<section"));
    assert.ok(embed.includes("Fast, honest, and easy to work with."));
  });

  it("brand color is applied and title rendered", () => {
    const r = runTool({ items: validItems() });
    const html = r.values!["showcasePageHTML"] as string;
    assert.ok(html.includes("#FF6B35"));
    assert.ok(html.includes("What My Clients Say"));
  });

  it("defaults: page title and brand color when not given", () => {
    const r = runTool({
      items: [{ quote: "Great work.", clientName: "Ali" }],
    });
    assert.equal(r.ok, true);
    const html = r.values!["showcasePageHTML"] as string;
    assert.ok(html.includes(DEFAULT_PAGE_TITLE));
    assert.ok(html.includes(DEFAULT_BRAND_COLOR));
  });

  it("role omitted when not given", () => {
    const r = runTool({ items: [{ quote: "Great work.", clientName: "Ali" }] });
    const html = r.values!["showcasePageHTML"] as string;
    assert.ok(!html.includes('<p class="hb-t-role">'));
  });

  it("photo fallback initial shown when no photoUrl", () => {
    const r = runTool({ items: [{ quote: "Great work.", clientName: "Ali" }] });
    const html = r.values!["showcasePageHTML"] as string;
    assert.ok(html.includes("hb-t-photo-fallback"));
    assert.ok(html.includes(">A<"));
  });

  it("validation: no items -> error", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one/i);
  });

  it("validation: items not an array -> error", () => {
    const r = runTool({} as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
  });

  it("validation: missing quote -> error naming the item", () => {
    const r = runTool({ items: [{ clientName: "Ali" }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1.*quote/i);
  });

  it("validation: missing clientName -> error naming the item", () => {
    const r = runTool({ items: [{ quote: "Great work." }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1.*client name/i);
  });

  it("validation: second bad item names Item 2", () => {
    const r = runTool({
      items: [{ quote: "Good.", clientName: "Ali" }, { quote: "", clientName: "Bob" }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 2/);
  });

  it("validation: invalid photoUrl -> error", () => {
    const r = runTool({
      items: [{ quote: "Great work.", clientName: "Ali", photoUrl: "not-a-url" }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /photo URL/i);
  });

  it("validation: invalid brandColor -> error", () => {
    const r = runTool({
      items: [{ quote: "Great work.", clientName: "Ali", brandColor: "red" }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /hex color/i);
  });

  it("validation: quote too long -> error", () => {
    const r = runTool({
      items: [{ quote: "x".repeat(2001), clientName: "Ali" }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /too long/i);
  });

  it("validation: more than MAX_ITEMS -> error", () => {
    const items = Array.from({ length: MAX_ITEMS + 1 }, (_, i) => ({
      quote: `Quote ${i}`,
      clientName: `Client ${i}`,
    }));
    const r = runTool({ items });
    assert.equal(r.ok, false);
    assert.match(r.error!, new RegExp(String(MAX_ITEMS)));
  });

  it("accepts exactly MAX_ITEMS", () => {
    const items = Array.from({ length: MAX_ITEMS }, (_, i) => ({
      quote: `Quote ${i}`,
      clientName: `Client ${i}`,
    }));
    const r = runTool({ items });
    assert.equal(r.ok, true);
  });

  it("HTML-escapes user content (no script injection)", () => {
    const r = runTool({
      items: [{ quote: '<script>alert("x")</script>', clientName: "A&B <Corp>" }],
    });
    assert.equal(r.ok, true);
    const html = r.values!["showcasePageHTML"] as string;
    assert.ok(!html.includes("<script>"));
    assert.ok(html.includes("&lt;script&gt;"));
    assert.ok(html.includes("A&amp;B &lt;Corp&gt;"));
  });

  it("output ids exactly match meta.ts outputs", () => {
    const r = runTool({ items: validItems() });
    assert.deepEqual(Object.keys(r.values!).sort(), OUTPUT_IDS);
  });

  it("determinism: same items -> identical output", () => {
    const a = JSON.stringify(runTool({ items: validItems() }));
    const b = JSON.stringify(runTool({ items: validItems() }));
    assert.equal(a, b);
  });

  it("embed snippet is self-contained with scoped inline styles", () => {
    const r = runTool({ items: validItems() });
    const embed = r.values!["embedSnippet"] as string;
    assert.ok(!embed.includes("<html"));
    assert.ok(embed.includes("#FF6B35"));
    assert.ok(embed.includes("testimonial-1"));
  });
});
