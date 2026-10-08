import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TITLE_STYLES,
  THUMB_STYLES,
  MAX_COMBOS,
  MIN_COMBOS,
  TITLE_MAX_CHARS,
  THUMB_MAX_WORDS,
  TOPIC_MAX_CHARS,
  buildTextMock,
  runTool,
} from "./logic.ts";

const META_OUTPUT_IDS = ["combos", "mockPreview", "honestyNote"];

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

describe("packaging-combo-preview — banks", () => {
  it("has 6 title styles x 3 templates = 18 title templates", () => {
    assert.equal(TITLE_STYLES.length, 6);
    for (const s of TITLE_STYLES) assert.equal(s.templates.length, 3, `title style ${s.id}`);
  });
  it("has 5 thumbnail styles x 4 templates = 20 thumbnail templates", () => {
    assert.equal(THUMB_STYLES.length, 5);
    for (const s of THUMB_STYLES) assert.equal(s.templates.length, 4, `thumb style ${s.id}`);
  });
  it("every thumbnail template is <=5 words (spec validation)", () => {
    for (const s of THUMB_STYLES) {
      for (const t of s.templates) {
        assert.ok(wordCount(t) <= THUMB_MAX_WORDS, `${s.id}: "${t}"`);
      }
    }
  });
  it("every title template contains the {topic} placeholder", () => {
    for (const s of TITLE_STYLES) {
      for (const t of s.templates) {
        assert.ok(t.includes("{topic}"), `${s.id}: "${t}"`);
      }
    }
  });
  it("style ids are unique within each bank", () => {
    assert.equal(new Set(TITLE_STYLES.map((s) => s.id)).size, TITLE_STYLES.length);
    assert.equal(new Set(THUMB_STYLES.map((s) => s.id)).size, THUMB_STYLES.length);
  });
});

describe("packaging-combo-preview — runTool happy path", () => {
  it("returns combos, mock preview, and honesty note", () => {
    const r = runTool({
      topic: "sourdough bread",
      titleStyle: "how-to",
      thumbStyle: "big-number",
      count: 3,
    });
    assert.equal(r.ok, true);
    const combos = r.values!["combos"] as string[];
    assert.equal(combos.length, 3);
    assert.ok(combos[0].includes("sourdough bread"), "topic inserted");
    assert.ok(!(combos.join(" ")).includes("{topic}"), "no leftover placeholders");
    const preview = r.values!["mockPreview"] as string;
    assert.ok(preview.includes("TEXT-ONLY PREVIEW"), "mock labeled as text-only");
    assert.ok((r.values!["honestyNote"] as string).includes("No images are generated"));
  });
  it("combos cycle deterministically through banks", () => {
    const r = runTool({
      topic: "meal prep",
      titleStyle: "listicle",
      thumbStyle: "reaction",
      count: MAX_COMBOS,
    });
    const combos = r.values!["combos"] as string[];
    assert.equal(combos.length, MAX_COMBOS);
    // 6 combos over 3 title templates: combos 1 and 4 reuse title template 1
    assert.ok(combos[0].includes("7 meal prep Mistakes"));
    assert.ok(combos[3].includes("7 meal prep Mistakes"), "title bank cycles");
    // thumbnail bank (4) cycles too: combos 1 and 5 reuse thumbnail template 1
    assert.ok(combos[0].includes("INSANE"));
    assert.ok(combos[4].includes("INSANE"), "thumbnail bank cycles");
  });
  it("long topic titles are trimmed to <=100 chars with a flag", () => {
    const longTopic = "a".repeat(120);
    const r = runTool({
      topic: longTopic,
      titleStyle: "curiosity-gap",
      thumbStyle: "short-promise",
      count: 1,
    });
    assert.equal(r.ok, true);
    const combo = (r.values!["combos"] as string[])[0];
    const m = combo.match(/Title: "([^"]*)"/);
    assert.ok(m, "title present");
    assert.ok(m![1].length <= TITLE_MAX_CHARS, `title ${m![1].length} chars <= ${TITLE_MAX_CHARS}`);
    assert.ok(m![1].endsWith("..."), "trimmed title ends with ellipsis");
  });
});

describe("packaging-combo-preview — buildTextMock", () => {
  it("is ASCII-only text and labeled as text-only", () => {
    const mock = buildTextMock("Some Title", "BIG WORDS");
    assert.ok(mock.includes("TEXT-ONLY PREVIEW"));
    assert.ok(mock.includes("Some Title"));
    assert.ok(mock.includes("BIG WORDS"));
  });
  it("long titles are visually shortened in the mock", () => {
    const mock = buildTextMock("x".repeat(80), "OK");
    assert.ok(!mock.includes("x".repeat(80)));
  });
});

describe("packaging-combo-preview — validation errors", () => {
  it("rejects missing values object", () => {
    const r = runTool(undefined as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.ok(r.error!.length > 0);
  });
  it("rejects blank topic", () => {
    const r = runTool({ topic: "   ", titleStyle: "how-to", thumbStyle: "big-number", count: 2 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Topic"));
  });
  it("rejects topic over 200 chars", () => {
    const r = runTool({
      topic: "t".repeat(TOPIC_MAX_CHARS + 1),
      titleStyle: "how-to",
      thumbStyle: "big-number",
      count: 2,
    });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("too long"));
  });
  it("rejects unknown title style", () => {
    const r = runTool({ topic: "x", titleStyle: "nope", thumbStyle: "big-number", count: 2 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Title style"));
  });
  it("rejects unknown thumbnail style", () => {
    const r = runTool({ topic: "x", titleStyle: "how-to", thumbStyle: "nope", count: 2 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Thumbnail text style"));
  });
  it("rejects count 0, 7, and non-integers", () => {
    for (const bad of [0, 7, 2.5, "three"]) {
      const r = runTool({ topic: "x", titleStyle: "how-to", thumbStyle: "big-number", count: bad });
      assert.equal(r.ok, false, `count ${bad}`);
      assert.ok(r.error!.includes("Count"));
    }
  });
  it("accepts string count", () => {
    const r = runTool({ topic: "x", titleStyle: "how-to", thumbStyle: "big-number", count: "4" });
    assert.equal(r.ok, true);
    assert.equal((r.values!["combos"] as string[]).length, 4);
  });
});

describe("packaging-combo-preview — determinism & contract", () => {
  it("run twice -> identical", () => {
    const args = { topic: "budget travel", titleStyle: "question", thumbStyle: "contrast-pair", count: 5 };
    assert.deepEqual(runTool(args), runTool(args));
  });
  it("output ids match meta.ts outputs", () => {
    const r = runTool({ topic: "x", titleStyle: "comparison", thumbStyle: "question-tease", count: 1 });
    assert.deepEqual(Object.keys(r.values!).sort(), [...META_OUTPUT_IDS].sort());
  });
  it("error results carry no values", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.equal(r.values, undefined);
  });
});
