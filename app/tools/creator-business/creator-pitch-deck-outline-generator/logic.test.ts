import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

describe("creator-pitch-deck-outline-generator", () => {
  it("happy path: returns deckOutline output id", () => {
    const res = runTool({ niche: "fitness", audienceSize: "250K across platforms" });
    assert.equal(res.ok, true);
    assert.ok(res.values);
    assert.deepEqual(Object.keys(res.values!), ["deckOutline"]);
    const outline = res.values!["deckOutline"] as string;
    assert.ok(outline.startsWith("# Creator Pitch Deck Outline — fitness"));
  });

  it("injects niche into cover, content, and why-me sections", () => {
    const res = runTool({ niche: "fitness" });
    const outline = res.values!["deckOutline"] as string;
    assert.match(outline, /fitness creator/);
    assert.match(outline, /Your core fitness content pillars/);
    assert.match(outline, /Why your fitness audience trusts/);
  });

  it("injects audienceSize into the audience snapshot", () => {
    const res = runTool({ niche: "fitness", audienceSize: "250K across platforms" });
    const outline = res.values!["deckOutline"] as string;
    assert.match(outline, /Audience size: 250K across platforms/);
  });

  it("without audienceSize keeps an honest placeholder", () => {
    const res = runTool({ niche: "fitness" });
    const outline = res.values!["deckOutline"] as string;
    assert.match(outline, /\[Your total followers \/ subscribers\]/);
  });

  it("contains exactly 8 fixed sections", () => {
    const res = runTool({ niche: "fitness" });
    const outline = res.values!["deckOutline"] as string;
    const headings = outline.match(/^## \d\. /gm);
    assert.equal(headings!.length, 8);
  });

  it("contains 24 guidance bullets (8 sections x 3)", () => {
    const res = runTool({ niche: "fitness" });
    const outline = res.values!["deckOutline"] as string;
    const bullets = outline.match(/^- /gm);
    assert.equal(bullets!.length, 24);
  });

  it("keeps bracketed placeholders for user-filled numbers", () => {
    const res = runTool({ niche: "fitness", audienceSize: "100K" });
    const outline = res.values!["deckOutline"] as string;
    assert.match(outline, /\[Your Name\]/);
    assert.ok(outline.includes("[bracketed]"));
  });

  it("states it is a template, not AI-written copy", () => {
    const res = runTool({ niche: "fitness" });
    const outline = res.values!["deckOutline"] as string;
    assert.match(outline, /fixed template outline, not AI-written copy/);
  });

  it("never claims AI authorship anywhere in the outline", () => {
    const res = runTool({ niche: "fitness", audienceSize: "50K" });
    const outline = res.values!["deckOutline"] as string;
    assert.doesNotMatch(outline, /AI-generated/i);
    assert.doesNotMatch(outline, /written by AI/i);
    assert.doesNotMatch(outline, /powered by AI/i);
  });

  it("missing niche returns error", () => {
    const res = runTool({});
    assert.equal(res.ok, false);
    assert.match(res.error!, /niche/i);
    assert.equal(res.values, undefined);
  });

  it("whitespace-only niche returns error", () => {
    const res = runTool({ niche: "   " });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("non-string niche returns error", () => {
    const res = runTool({ niche: 123 });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("niche over 60 chars returns error", () => {
    const res = runTool({ niche: "x".repeat(61) });
    assert.equal(res.ok, false);
    assert.match(res.error!, /60 characters/);
  });

  it("non-string audienceSize returns error", () => {
    const res = runTool({ niche: "fitness", audienceSize: 50000 });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Audience size must be text/);
  });

  it("audienceSize over 60 chars returns error", () => {
    const res = runTool({ niche: "fitness", audienceSize: "y".repeat(61) });
    assert.equal(res.ok, false);
    assert.match(res.error!, /60 characters/);
  });

  it("trims whitespace from inputs", () => {
    const res = runTool({ niche: "  fitness  " });
    assert.equal(res.ok, true);
    assert.match(res.values!["deckOutline"] as string, /Outline — fitness/);
  });

  it("deterministic: identical inputs give identical outlines", () => {
    const a = runTool({ niche: "fitness", audienceSize: "250K" });
    const b = runTool({ niche: "fitness", audienceSize: "250K" });
    assert.deepEqual(a, b);
  });
});
