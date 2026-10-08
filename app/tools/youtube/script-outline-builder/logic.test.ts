import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, FORMATS, SECTION_TYPES, FORMAT_SCAFFOLDS, WPM, MAX_ITEMS } from "./logic.ts";

const setup = (over: Record<string, unknown> = {}) => ({
  topic: "How to boil an egg",
  targetMinutes: "10",
  format: "tutorial",
  ...over,
});

describe("runTool — scaffold happy path", () => {
  it("setup-only item emits the tutorial scaffold", () => {
    const r = runTool({ items: [setup()] });
    assert.equal(r.ok, true);
    const outline = r.values!.outline as string[];
    assert.equal(outline.length, FORMAT_SCAFFOLDS.tutorial.length);
    assert.ok(outline[0].startsWith("1. [HOOK]"));
    assert.ok(outline.some((l) => l.includes("[CTA]")));
  });
  it("computes total words at 150 wpm", () => {
    const r = runTool({ items: [setup({ targetMinutes: "10" })] });
    assert.equal(r.values!.totalWords, 10 * WPM);
  });
  it("emits the review scaffold for format=review", () => {
    const r = runTool({ items: [setup({ format: "review" })] });
    const outline = r.values!.outline as string[];
    assert.equal(outline.length, FORMAT_SCAFFOLDS.review.length);
    assert.ok(outline.some((l) => l.includes("Pros")));
  });
  it("defaults format to tutorial when empty", () => {
    const r = runTool({ items: [setup({ format: "" })] });
    assert.equal((r.values!.outline as string[]).length, FORMAT_SCAFFOLDS.tutorial.length);
  });
  it("defaults targetMinutes to 10 when empty", () => {
    const r = runTool({ items: [setup({ targetMinutes: "" })] });
    assert.equal(r.values!.totalWords, 10 * WPM);
  });
});

describe("runTool — custom sections happy path", () => {
  const section = (over: Record<string, unknown> = {}) => ({
    sectionTitle: "My hook",
    sectionType: "hook",
    talkingPoints: "say the payoff first",
    ...over,
  });
  it("uses custom sections instead of the scaffold", () => {
    const r = runTool({
      items: [setup(), section(), section({ sectionTitle: "Main point", sectionType: "value" })],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!.sectionCount, 2);
    const outline = r.values!.outline as string[];
    assert.ok(outline[0].includes("My hook"));
    assert.ok(outline[0].includes("say the payoff first"));
  });
  it("splits the value share evenly across same-type sections", () => {
    const r = runTool({
      items: [
        setup({ targetMinutes: "10" }),
        section({ sectionTitle: "A", sectionType: "value" }),
        section({ sectionTitle: "B", sectionType: "value" }),
      ],
    });
    const outline = r.values!.outline as string[];
    const words = outline.map((l) => Number(l.match(/~([\d,]+) words/)![1].replace(/,/g, "")));
    assert.equal(words[0], words[1]);
    assert.equal(words[0], Math.round((10 * WPM * 0.6) / 2));
  });
  it("accepts uppercase sectionType", () => {
    const r = runTool({ items: [setup(), section({ sectionType: "HOOK" })] });
    assert.equal(r.ok, true);
  });
});

describe("runTool — validation errors", () => {
  it("no items array -> error", () => {
    assert.equal(runTool({} as never).ok, false);
  });
  it("empty items -> error", () => {
    assert.equal(runTool({ items: [] }).ok, false);
  });
  it("too many items -> error", () => {
    const items = Array.from({ length: MAX_ITEMS + 1 }, (_, i) =>
      i === 0 ? setup() : { sectionTitle: `S${i}`, sectionType: "value" },
    );
    const r = runTool({ items });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Too many items/);
  });
  it("item 1 missing topic -> 'Item 1' error", () => {
    const r = runTool({ items: [setup({ topic: "  " })] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: topic/);
  });
  it("item 1 bad targetMinutes -> error", () => {
    assert.equal(runTool({ items: [setup({ targetMinutes: "-3" })] }).ok, false);
    assert.equal(runTool({ items: [setup({ targetMinutes: "abc" })] }).ok, false);
  });
  it("item 1 unknown format -> error listing valid formats", () => {
    const r = runTool({ items: [setup({ format: "documentary" })] });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("tutorial"));
  });
  it("section item missing sectionTitle -> 'Item 2' error", () => {
    const r = runTool({ items: [setup(), { sectionTitle: "", sectionType: "hook" }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 2: sectionTitle/);
  });
  it("section item bad sectionType -> error", () => {
    const r = runTool({ items: [setup(), { sectionTitle: "X", sectionType: "middle" }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /sectionType/);
  });
  it("section item over-long talkingPoints -> error", () => {
    const r = runTool({ items: [setup(), { sectionTitle: "X", sectionType: "hook", talkingPoints: "y".repeat(501) }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /500/);
  });
});

describe("runTool — honesty, determinism, output ids", () => {
  it("honestyNotes say slots, not generated prose", () => {
    const r = runTool({ items: [setup()] });
    const notes = r.values!.honestyNotes as string[];
    assert.ok(notes.some((n) => n.includes("slots")));
    assert.ok(notes.some((n) => n.includes("never writes your script")));
  });
  it("same inputs -> identical outputs", () => {
    const a = runTool({ items: [setup()] });
    const b = runTool({ items: [setup()] });
    assert.deepEqual(a, b);
  });
  it("output ids match meta.ts outputs", () => {
    const r = runTool({ items: [setup()] });
    assert.deepEqual(Object.keys(r.values!).sort(), [
      "copyBlocks",
      "honestyNotes",
      "outline",
      "sectionCount",
      "summary",
      "totalWords",
    ]);
  });
  it("every scaffold uses only known section types", () => {
    for (const f of FORMATS) {
      for (const s of FORMAT_SCAFFOLDS[f]) {
        assert.ok((SECTION_TYPES as readonly string[]).includes(s.type), `${f}: ${s.type}`);
      }
    }
  });
  it("scaffold word budgets roughly total the plan (rounding slack)", () => {
    const r = runTool({ items: [setup({ targetMinutes: "10" })] });
    const outline = r.values!.outline as string[];
    const sum = outline.reduce((a, l) => a + Number(l.match(/~([\d,]+) words/)![1].replace(/,/g, "")), 0);
    assert.ok(Math.abs(sum - 10 * WPM) <= outline.length, `sum=${sum}`);
  });
});
