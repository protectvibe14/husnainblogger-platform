import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, MAX_ITEMS } from "./logic.ts";

function row(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    episodeTitle: "Ep 42: Workflow Wins",
    guestName: "Jane Doe",
    episodeSummary: "How Jane cut her editing time in half.",
    keyLinkLabel: "Jane's blog",
    keyLinkUrl: "https://janedoe.example/blog",
    chapterTimestamp: "02:15",
    chapterTitle: "Why workflows matter",
    ...overrides,
  };
}

describe("podcast-show-notes-builder", () => {
  it("happy path: builds markdown lines + html", () => {
    const res = runTool({ items: [row()] });
    assert.equal(res.ok, true);
    const values = res.values!;
    assert.equal(values.lines[0], "# Ep 42: Workflow Wins");
    assert.ok(values.lines.includes("*Guest: Jane Doe*"));
    assert.ok(values.lines.includes("How Jane cut her editing time in half."));
    assert.ok(values.lines.includes("## Chapters"));
    assert.ok(values.lines.includes("- 02:15 — Why workflows matter"));
    assert.ok(values.lines.includes("## Links mentioned"));
    assert.ok(values.lines.includes("- [Jane's blog](https://janedoe.example/blog)"));
    assert.ok(values.html.includes("<h1>Ep 42: Workflow Wins</h1>"));
    assert.ok(values.html.includes('<a href="https://janedoe.example/blog">Jane\'s blog</a>'));
  });

  it("output ids match meta.ts outputs (lines, html)", () => {
    const res = runTool({ items: [row()] });
    assert.deepEqual(Object.keys(res.values!).sort(), ["html", "lines"]);
    assert.ok(Array.isArray(res.values!.lines));
  });

  it("missing chapters section omitted cleanly", () => {
    const res = runTool({ items: [row({ chapterTimestamp: "", chapterTitle: "" })] });
    assert.equal(res.ok, true);
    assert.ok(!res.values!.lines.includes("## Chapters"));
  });

  it("missing links section omitted cleanly", () => {
    const res = runTool({ items: [row({ keyLinkLabel: "", keyLinkUrl: "" })] });
    assert.equal(res.ok, true);
    assert.ok(!res.values!.lines.includes("## Links mentioned"));
  });

  it("missing guest/summary omitted cleanly", () => {
    const res = runTool({ items: [row({ guestName: "", episodeSummary: "" })] });
    assert.equal(res.ok, true);
    assert.ok(!res.values!.lines.some((l) => l.startsWith("*Guest:")));
  });

  it("header fields come from the FIRST item only", () => {
    const res = runTool({
      items: [row({ episodeTitle: "Real Title", guestName: "Real Guest" }), row({ episodeTitle: "Other", guestName: "Other" })],
    });
    assert.equal(res.ok, true);
    assert.equal(res.values!.lines[0], "# Real Title");
    assert.ok(res.values!.lines.includes("*Guest: Real Guest*"));
  });

  it("missing episode title fails on item 1", () => {
    const res = runTool({ items: [row({ episodeTitle: "   " })] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 1: Episode title is required/);
  });

  it("invalid link URL fails with item number", () => {
    const res = runTool({
      items: [row(), row({ keyLinkLabel: "Bad", keyLinkUrl: "not-a-url" })],
    });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 2: Link URL/);
  });

  it("bare URL link renders without label brackets", () => {
    const res = runTool({ items: [row({ keyLinkLabel: "", keyLinkUrl: "https://example.com/x" })] });
    assert.equal(res.ok, true);
    assert.ok(res.values!.lines.includes("- https://example.com/x"));
  });

  it("chapter without timestamp renders plain", () => {
    const res = runTool({ items: [row({ chapterTimestamp: "", chapterTitle: "Cold open" })] });
    assert.equal(res.ok, true);
    assert.ok(res.values!.lines.includes("- Cold open"));
  });

  it("empty items array fails", () => {
    const res = runTool({ items: [] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /at least one row/);
  });

  it("missing items arg fails", () => {
    const res = runTool({} as { items: Record<string, unknown>[] });
    assert.equal(res.ok, false);
  });

  it("non-object row fails with item number", () => {
    const res = runTool({ items: [row(), "nope" as unknown as Record<string, unknown>] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 2/);
  });

  it("over MAX_ITEMS fails", () => {
    const many = Array.from({ length: MAX_ITEMS + 1 }, () => row());
    const res = runTool({ items: many });
    assert.equal(res.ok, false);
    assert.match(res.error!, /at most 100 rows/);
  });

  it("determinism: two runs produce identical output", () => {
    const a = runTool({ items: [row(), row({ keyLinkUrl: "https://b.example", chapterTitle: "Outro" })] });
    const b = runTool({ items: [row(), row({ keyLinkUrl: "https://b.example", chapterTitle: "Outro" })] });
    assert.deepEqual(a, b);
  });

  it("nothing is invented: no guest/summary lines when user gave none", () => {
    const res = runTool({
      items: [{ episodeTitle: "Solo Ep", keyLinkUrl: "", chapterTitle: "" }],
    });
    assert.equal(res.ok, true);
    const joined = res.values!.lines.join("\n");
    assert.ok(!joined.includes("Guest:"));
    assert.equal(res.values!.lines[0], "# Solo Ep");
  });

  it("HTML escapes user content", () => {
    const res = runTool({ items: [row({ episodeTitle: "A <b>bold</b> title", guestName: "X & Y" })] });
    assert.equal(res.ok, true);
    assert.ok(res.values!.html.includes("A &lt;b&gt;bold&lt;/b&gt; title"));
    assert.ok(res.values!.html.includes("X &amp; Y"));
    assert.ok(!res.values!.html.includes("<b>bold</b>"));
  });

  it("links keep user order (no reordering)", () => {
    const res = runTool({
      items: [
        row({ keyLinkLabel: "Zeta", keyLinkUrl: "https://zeta.example" }),
        row({ keyLinkLabel: "Alpha", keyLinkUrl: "https://alpha.example" }),
      ],
    });
    const linkLines = res.values!.lines.filter((l) => l.startsWith("- ["));
    assert.deepEqual(linkLines, [
      "- [Zeta](https://zeta.example)",
      "- [Alpha](https://alpha.example)",
    ]);
  });
});
