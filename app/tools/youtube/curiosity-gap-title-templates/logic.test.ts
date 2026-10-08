import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CATEGORIES,
  TEMPLATES,
  TEMPLATES_PER_CATEGORY,
  TEMPLATE_BANK_SIZE,
  TITLE_HARD_LIMIT,
  instantiateTemplate,
  generateTitles,
  runTool,
} from "./logic.ts";

describe("TEMPLATE bank integrity", () => {
  it("has exactly 60 templates", () => {
    assert.equal(TEMPLATES.length, TEMPLATE_BANK_SIZE);
  });
  it("has 12 templates per category", () => {
    for (const c of CATEGORIES) {
      const n = TEMPLATES.filter((t) => t.id.startsWith(c + "-")).length;
      assert.equal(n, TEMPLATES_PER_CATEGORY, c);
    }
  });
  it("every template id is unique", () => {
    const ids = TEMPLATES.map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length);
  });
  it("every pattern contains exactly one {topic} slot", () => {
    for (const t of TEMPLATES) {
      const slots = t.pattern.split("{topic}").length - 1;
      assert.equal(slots, 1, t.id);
    }
  });
  it("patterns never mention AI generation", () => {
    for (const t of TEMPLATES) {
      assert.ok(!/AI-generated|artificial intelligence/i.test(t.pattern), t.id);
    }
  });
});

describe("instantiateTemplate", () => {
  it("substitutes the topic into the slot", () => {
    const { title, wasTruncated } = instantiateTemplate(
      { id: "curiosity-1", pattern: "Why {topic} Will Change Everything You Know" },
      "AI tools",
    );
    assert.equal(title, "Why AI tools Will Change Everything You Know");
    assert.equal(wasTruncated, false);
  });
  it("truncates long instantiations to the 100-grapheme limit", () => {
    const { title, wasTruncated } = instantiateTemplate(
      { id: "x", pattern: "{topic}" },
      "word ".repeat(60),
    );
    const gs = [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(title)];
    assert.equal(gs.length, TITLE_HARD_LIMIT);
    assert.ok(title.endsWith("…"));
    assert.equal(wasTruncated, true);
  });
  it("counts emoji as one grapheme when truncating", () => {
    const { title } = instantiateTemplate({ id: "x", pattern: "{topic}" }, "🔥".repeat(150));
    const gs = [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(title)];
    assert.equal(gs.length, TITLE_HARD_LIMIT);
  });
  it("throws on non-string topic", () => {
    assert.throws(
      () => instantiateTemplate({ id: "x", pattern: "{topic}" }, 5 as unknown as string),
      TypeError,
    );
  });
});

describe("generateTitles", () => {
  it("generates the requested count in bank order", () => {
    const out = generateTitles("meal prep", "how-to", 3);
    assert.equal(out.length, 3);
    assert.equal(out[0].templateId, "how-to-1");
    assert.equal(out[1].templateId, "how-to-2");
    assert.equal(out[2].templateId, "how-to-3");
  });
  it("works for every category", () => {
    for (const c of CATEGORIES) {
      const out = generateTitles("guitar", c, 2);
      assert.equal(out.length, 2);
      assert.ok(out.every((g) => g.templateId.startsWith(c + "-")), c);
    }
  });
  it("caps at the bank size per category", () => {
    const out = generateTitles("guitar", "mistake", 50);
    assert.equal(out.length, TEMPLATES_PER_CATEGORY);
  });
  it("never returns a title over 100 graphemes", () => {
    const out = generateTitles("a ridiculously long topic phrase that goes on and on and on", "curiosity", 12);
    const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
    for (const g of out) {
      assert.ok([...seg.segment(g.title)].length <= TITLE_HARD_LIMIT, g.templateId);
    }
  });
  it("trims the topic before substitution", () => {
    const out = generateTitles("  drones  ", "number", 1);
    assert.ok(!out[0].title.includes("  drones  "));
    assert.ok(out[0].title.includes("drones"));
  });
});

describe("runTool — generator template adapter", () => {
  it("generates titles labeled with their template ids", () => {
    const r = runTool({ topic: "sourdough", category: "curiosity", count: 3 });
    assert.equal(r.ok, true);
    const titles = r.values!.titles as string[];
    assert.equal(titles.length, 3);
    assert.ok(titles[0].includes("sourdough"));
    assert.ok(titles[0].includes("(template: curiosity-1)"));
    assert.equal(r.values!.count, 3);
  });
  it("defaults to 10 titles when count is omitted", () => {
    const r = runTool({ topic: "sourdough", category: "number" });
    assert.equal((r.values!.titles as string[]).length, 10);
    assert.equal(r.values!.count, 10);
  });
  it("rejects an empty topic", () => {
    const r = runTool({ topic: "   ", category: "curiosity", count: 5 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /topic field is empty/);
  });
  it("rejects a missing topic", () => {
    assert.equal(runTool({ category: "curiosity" }).ok, false);
  });
  it("rejects an unknown category", () => {
    const r = runTool({ topic: "x", category: "clickbait" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Pick a template category/);
  });
  it("rejects a missing category", () => {
    assert.equal(runTool({ topic: "x" }).ok, false);
  });
  it("rejects count 0, 51, fractions, and non-numbers", () => {
    assert.equal(runTool({ topic: "x", category: "secret", count: 0 }).ok, false);
    assert.equal(runTool({ topic: "x", category: "secret", count: 51 }).ok, false);
    assert.equal(runTool({ topic: "x", category: "secret", count: 2.5 }).ok, false);
    assert.equal(runTool({ topic: "x", category: "secret", count: "many" }).ok, false);
  });
  it("accepts count as a numeric string", () => {
    const r = runTool({ topic: "x", category: "secret", count: "5" });
    assert.equal(r.ok, true);
    assert.equal((r.values!.titles as string[]).length, 5);
  });
  it("caps at the bank size and says so in the note", () => {
    const r = runTool({ topic: "x", category: "mistake", count: 30 });
    assert.equal(r.ok, true);
    assert.equal((r.values!.titles as string[]).length, TEMPLATES_PER_CATEGORY);
    assert.match(String(r.values!.note), /12 fixed templates/);
  });
  it("note states the bank is fixed and not AI", () => {
    const r = runTool({ topic: "x", category: "how-to", count: 2 });
    assert.match(String(r.values!.note), /fixed bank of 60 title templates \(not AI\)/);
  });
  it("is deterministic across runs", () => {
    const v = { topic: "home workouts", category: "number", count: 8 };
    assert.deepEqual(runTool(v), runTool(v));
  });
  it("output keys match the meta outputs contract (titles, count, note)", () => {
    const r = runTool({ topic: "x", category: "curiosity", count: 1 });
    assert.deepEqual(Object.keys(r.values!).sort(), ["count", "note", "titles"]);
  });
});
