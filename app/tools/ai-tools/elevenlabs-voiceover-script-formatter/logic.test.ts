import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  formatScript,
  splitSentences,
  findAllCapsWords,
  findHintedAbbreviations,
  stripHtml,
  LONG_SENTENCE_CHARS,
  CHARS_PER_MIN,
} from "./logic.ts";

describe("elevenlabs-voiceover-script-formatter", () => {
  it("happy path: adds break tags and labels the estimate", () => {
    const script =
      "Welcome to the show. Today we talk about productivity.\n\n" +
      "A".repeat(50) + " long sentence ".repeat(8) + "about focus and deep work habits.";
    const r = runTool({ rawScript: script });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const formatted = v["formattedScript"] as string;
    assert.ok(formatted.includes('<break time="1.0s"/>'), "paragraph pause missing");
    assert.ok(formatted.includes('<break time="0.5s"/>'), "long-sentence pause missing");
    assert.ok((v["estimatedDuration"] as string).includes("estimate"));
    assert.ok((v["estimatedDuration"] as string).includes(String(CHARS_PER_MIN)));
    assert.ok((v["wordCount"] as number) > 0);
    assert.ok((v["charCount"] as number) > 0);
  });

  it("flags ALL-CAPS words and gives pronunciation hints", () => {
    const r = runTool({ rawScript: "Our CEO explains the new API and SEO strategy." });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const flags = v["flags"] as string[];
    const hints = v["pronunciationHints"] as string[];
    assert.ok(flags.some((f) => f.includes('"CEO"')));
    assert.ok(flags.some((f) => f.includes('"API"')));
    assert.ok(hints.some((h) => h.includes('"CEO"') && h.includes("C. E. O.")));
    assert.ok(hints.some((h) => h.includes('"API"')));
  });

  it("unknown abbreviations are flagged without a hint", () => {
    const r = runTool({ rawScript: "The KPI dashboard needs a QBR review." });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const flags = v["flags"] as string[];
    assert.ok(flags.some((f) => f.includes('"KPI"')));
    assert.ok((v["pronunciationHints"] as string[]).length === 0);
  });

  it("short sentences get no break tags", () => {
    const r = runTool({ rawScript: "Hi there. How are you?" });
    assert.equal(r.ok, true);
    const formatted = (r.values as Record<string, unknown>)["formattedScript"] as string;
    assert.ok(!formatted.includes("<break"));
  });

  it("duration math: chars/850 per minute, rounded", () => {
    const chars = 850;
    const r = runTool({ rawScript: "a".repeat(chars) });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v["estimatedDurationSec"], 60);
    assert.equal(v["estimatedDuration"], "1m 0s (estimate at ~850 chars/min)");
  });

  it("LONG_SENTENCE_CHARS boundary is documented", () => {
    const atBoundary = "x".repeat(LONG_SENTENCE_CHARS);
    const justUnder = "x".repeat(LONG_SENTENCE_CHARS - 1);
    assert.ok(formatScript(atBoundary).formattedScript.includes('<break time="0.5s"/>'));
    assert.ok(!formatScript(justUnder).formattedScript.includes('<break time="0.5s"/>'));
  });

  it("splitSentences splits on sentence-ending punctuation", () => {
    assert.deepEqual(splitSentences("One. Two! Three?"), ["One.", "Two!", "Three?"]);
    assert.deepEqual(splitSentences("  spaced   out  "), ["spaced   out"]);
  });

  it("findAllCapsWords deduplicates", () => {
    assert.deepEqual(findAllCapsWords("CEO and CEO"), ["CEO"]);
  });

  it("findHintedAbbreviations matches dotted forms too", () => {
    assert.ok(findHintedAbbreviations("the A.I. boom").includes("AI"));
  });

  it("stripHtml preserves line breaks", () => {
    assert.equal(stripHtml("<p>one</p><p>two</p>"), "one\ntwo");
  });

  it("determinism: same input twice -> identical output", () => {
    const args = { rawScript: "Our CEO explains the API. Second paragraph here." };
    assert.deepEqual(runTool(args), runTool(args));
  });

  it("validation: missing/empty script -> error", () => {
    assert.equal(runTool({}).ok, false);
    assert.equal(runTool({ rawScript: "" }).ok, false);
    assert.equal(runTool({ rawScript: "   " }).ok, false);
    assert.equal(runTool({ rawScript: 123 }).ok, false);
  });

  it("validation: oversized script -> error", () => {
    assert.equal(runTool({ rawScript: "x".repeat(20001) }).ok, false);
  });
});
