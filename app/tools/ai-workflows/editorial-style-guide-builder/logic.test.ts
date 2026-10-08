import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, CORE_SECTIONS, MAX_ITEMS, DECIDE_LATER, DEFAULT_GUIDE_NAME } from "./logic.ts";

function toneItem(section = "Voice & Tone", extra: Record<string, unknown> = {}) {
  return { section, rule: "Second person, contractions allowed.", example: "", ...extra };
}

describe("editorial-style-guide-builder", () => {
  it("happy path: answers compile into a guide with section headings", () => {
    const r = runTool({
      items: [
        { guideName: "Acme Blog", ...toneItem() },
        { section: "Casing & Capitalization", rule: "Sentence case for headings." },
      ],
    });
    assert.equal(r.ok, true);
    const guide = r.values?.guide as string;
    const sections = r.values?.sections as string[];
    assert.ok(guide.includes("# Acme Blog"));
    assert.ok(guide.includes("Second person, contractions allowed."));
    assert.ok(guide.includes("Sentence case for headings."));
    assert.equal(sections.length, 6); // 2 answered + 4 decide-later
    assert.ok(sections[0].includes("Voice & Tone"));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ items: [toneItem()] });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), ["guide", "sections"]);
  });

  it("empty items -> error", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /at least one rule/i);
  });

  it("missing items -> error", () => {
    const r = runTool({} as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
  });

  it("more than MAX_ITEMS -> error", () => {
    const items = Array.from({ length: MAX_ITEMS + 1 }, (_, i) => ({
      section: i === 0 ? "Voice & Tone" : `Section ${i}`,
      rule: `Rule ${i}.`,
    }));
    const r = runTool({ items });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", new RegExp(String(MAX_ITEMS)));
  });

  it("item missing section -> 'Item N: section' error", () => {
    const r = runTool({
      items: [toneItem(), { rule: "A rule with no section." }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Item 2: section/i);
  });

  it("item missing rule -> 'Item N: rule' error", () => {
    const r = runTool({
      items: [{ section: "Voice & Tone" }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Item 1: .*rule/i);
  });

  it("no tone section -> error naming tone", () => {
    const r = runTool({
      items: [{ section: "Casing & Capitalization", rule: "Sentence case." }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /tone/i);
  });

  it("section mentioning 'voice' counts as the tone section", () => {
    const r = runTool({
      items: [toneItem("Brand Voice")],
    });
    assert.equal(r.ok, true);
  });

  it("unanswered core sections get the decide-later placeholder", () => {
    const r = runTool({ items: [toneItem()] });
    assert.equal(r.ok, true);
    const guide = r.values?.guide as string;
    assert.ok(guide.includes(DECIDE_LATER));
    // The placeholder appears once per unanswered core section (5 of 6).
    assert.equal(guide.split(DECIDE_LATER).length - 1, CORE_SECTIONS.length - 1);
  });

  it("no invented rules: placeholder is honest, not a default standard", () => {
    const r = runTool({ items: [toneItem()] });
    assert.equal(r.ok, true);
    const guide = r.values?.guide as string;
    assert.ok(!guide.includes("Use AP style"));
    assert.ok(!guide.includes("Oxford comma"));
  });

  it("blank guideName falls back to the default title", () => {
    const r = runTool({ items: [toneItem()] });
    assert.equal(r.ok, true);
    assert.ok((r.values?.guide as string).includes(`# ${DEFAULT_GUIDE_NAME}`));
  });

  it("custom (non-core) sections are included verbatim", () => {
    const r = runTool({
      items: [toneItem(), { section: "Image Alt Text", rule: "Describe, don't caption." }],
    });
    assert.equal(r.ok, true);
    const sections = r.values?.sections as string[];
    assert.ok(sections.some((s) => s.includes("Image Alt Text")));
    assert.ok((r.values?.guide as string).includes("Describe, don't caption."));
  });

  it("section order follows first appearance", () => {
    const r = runTool({
      items: [
        toneItem(),
        { section: "Banned Words & Phrases", rule: "Never say 'leverage'." },
        { section: "Casing & Capitalization", rule: "Sentence case." },
      ],
    });
    assert.equal(r.ok, true);
    const sections = r.values?.sections as string[];
    assert.ok(sections[0].includes("Voice & Tone"));
    assert.ok(sections[1].includes("Banned Words & Phrases"));
    assert.ok(sections[2].includes("Casing & Capitalization"));
  });

  it("example is rendered under its rule", () => {
    const r = runTool({
      items: [toneItem("Voice & Tone", { example: "do → 'You can'; don't → 'It can be done'" })],
    });
    assert.equal(r.ok, true);
    assert.ok((r.values?.guide as string).includes("Example: do → 'You can'"));
  });

  it("whitespace-only guideName still uses the default title", () => {
    const r = runTool({
      items: [{ guideName: "   ", ...toneItem() }],
    });
    assert.equal(r.ok, true);
    assert.ok((r.values?.guide as string).includes(`# ${DEFAULT_GUIDE_NAME}`));
  });

  it("deterministic: same items -> identical output", () => {
    const args = {
      items: [
        { guideName: "Acme", ...toneItem() },
        { section: "Numbers & Units", rule: "Metric first." },
      ],
    };
    const a = runTool(args);
    const b = runTool(args);
    assert.deepEqual(a, b);
  });
});
