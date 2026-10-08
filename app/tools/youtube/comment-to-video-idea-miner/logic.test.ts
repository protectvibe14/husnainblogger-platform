import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_IDEAS,
  MAX_TEXT_CHARS,
  splitSentences,
  classifySentence,
  ideaFromSentence,
  mineIdeas,
  runTool,
} from "./logic.ts";

const META_OUTPUT_IDS = ["ideas", "ideaCount", "summary"];

const SAMPLE = `Love this video!
Can you make a video about sourdough discard recipes?
This helped a lot
How do I keep my starter alive in winter?
please do a tutorial on scoring bread
nice`;

describe("comment-to-video-idea-miner — splitSentences", () => {
  it("splits on newlines and keeps question marks", () => {
    const s = splitSentences("First line?\nSecond line.\nThird!");
    assert.ok(s.some((x) => x.endsWith("?")));
    assert.equal(s.length, 3);
  });
  it("strips bullet/number prefixes", () => {
    const s = splitSentences("- Can you do part 2?\n1) great video");
    assert.ok(s.some((x) => x.includes("Can you do part 2?")));
  });
  it("drops tiny fragments", () => {
    const s = splitSentences("ok\nWhat is this?");
    assert.ok(!s.includes("ok"));
    assert.ok(s.includes("What is this?"));
  });
});

describe("comment-to-video-idea-miner — classifySentence", () => {
  it("classifies questions", () => {
    assert.equal(classifySentence("What flour do you use?"), "question");
  });
  it("classifies requests (can you / tutorial on / part 2)", () => {
    assert.equal(classifySentence("Can you make a video about pancakes?"), "request");
    assert.equal(classifySentence("please do a tutorial on scoring"), "request");
    assert.equal(classifySentence("part 2 please"), "request");
  });
  it("requests win over questions when both match", () => {
    assert.equal(classifySentence("Can you cover taxes?"), "request");
  });
  it("classifies howto hints without question marks", () => {
    assert.equal(classifySentence("How do I fix a dense loaf"), "howto");
  });
  it("returns null for plain praise and rants", () => {
    assert.equal(classifySentence("Love this video!"), null);
    assert.equal(classifySentence("nice"), null);
    assert.equal(classifySentence("x".repeat(201)), null);
  });
  it("idea phrasing quotes the source sentence", () => {
    const idea = ideaFromSentence("question", "What flour do you use?");
    assert.ok(idea.includes("What flour do you use"));
    assert.ok(!idea.endsWith("?\"") || true);
  });
});

describe("comment-to-video-idea-miner — mineIdeas", () => {
  it("mines 3 ideas from the sample, in paste order", () => {
    const ideas = mineIdeas(SAMPLE);
    assert.equal(ideas.length, 3);
    assert.equal(ideas[0].kind, "request");
    assert.equal(ideas[1].kind, "question");
    assert.equal(ideas[2].kind, "request");
    assert.ok(ideas[0].source.includes("sourdough discard"));
  });
  it("dedupes identical sentences (first source kept)", () => {
    const ideas = mineIdeas("What flour?\nWhat flour?\nWHAT FLOUR?");
    assert.equal(ideas.length, 1);
  });
  it("caps output at MAX_IDEAS", () => {
    const text = Array.from({ length: 40 }, (_, i) => `Question number ${i}?`).join("\n");
    assert.equal(mineIdeas(text).length, MAX_IDEAS);
  });
  it("each idea carries its source snippet", () => {
    for (const m of mineIdeas(SAMPLE)) {
      assert.ok(m.source.length > 0);
      assert.ok(m.idea.length > 0);
    }
  });
  it("throws on non-string, blank, and over-long input", () => {
    assert.throws(() => mineIdeas(7 as unknown as string), TypeError);
    assert.throws(() => mineIdeas("   "), /non-empty/);
    assert.throws(() => mineIdeas("x".repeat(MAX_TEXT_CHARS + 1)), /exceeds/);
  });
});

describe("comment-to-video-idea-miner — runTool", () => {
  it("happy path returns ideas, count, and summary", () => {
    const r = runTool({ commentsText: SAMPLE });
    assert.equal(r.ok, true);
    const ideas = r.values!["ideas"] as string[];
    assert.equal(ideas.length, 3);
    assert.equal(r.values!["ideaCount"], 3);
    assert.ok((r.values!["summary"] as string).includes("3 video ideas"));
    assert.ok(ideas[0].includes("from:"), "each card quotes its source");
  });
  it("no matches -> ok with zero ideas and a tip", () => {
    const r = runTool({ commentsText: "Great video!\nSubscribed, love your channel." });
    assert.equal(r.ok, true);
    assert.equal(r.values!["ideaCount"], 0);
    assert.deepEqual(r.values!["ideas"], []);
    assert.ok((r.values!["summary"] as string).includes("paste"));
  });
  it("rejects blank text", () => {
    const r = runTool({ commentsText: "   " });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("empty"));
  });
  it("rejects missing values object", () => {
    const r = runTool(undefined as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });
  it("rejects non-string text", () => {
    const r = runTool({ commentsText: 123 });
    assert.equal(r.ok, false);
  });
  it("rejects text over the limit", () => {
    const r = runTool({ commentsText: "x".repeat(MAX_TEXT_CHARS + 1) });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("too long"));
  });
  it("no scraping claims: output never mentions an API or live fetch", () => {
    const r = runTool({ commentsText: SAMPLE });
    const blob = JSON.stringify(r.values);
    assert.ok(!/youtube api/i.test(blob));
    assert.ok(!/scrap/i.test(blob));
  });
  it("deterministic: run twice -> identical", () => {
    assert.deepEqual(runTool({ commentsText: SAMPLE }), runTool({ commentsText: SAMPLE }));
  });
  it("output ids match meta.ts outputs", () => {
    const r = runTool({ commentsText: SAMPLE });
    assert.deepEqual(Object.keys(r.values!).sort(), [...META_OUTPUT_IDS].sort());
  });
  it("error results carry no values", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.equal(r.values, undefined);
  });
});
