import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = { problemWord: "quinoa", targetTtsEngine: "elevenlabs", contextSentence: "" };

describe("tts-pronunciation-fixer (tool-253)", () => {
  it("happy path: bank word quinoa returns KEEN-wah spellings", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const spellings = v.phoneticSpellings as string[];
    assert.ok(spellings.includes("KEEN-wah"));
    assert.ok(String(v.ipaHint).includes("KEEN-wah"));
    assert.ok(String(v.testSentence).includes("KEEN-wah"));
    assert.ok(String(v.engineNotes).toLowerCase().includes("elevenlabs"));
  });

  it("output keys match meta.ts outputs", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), [
      "engineNotes",
      "ipaHint",
      "phoneticSpellings",
      "testSentence",
    ]);
  });

  it("unknown word gets deterministic syllable-split variants", () => {
    const r = runTool({ ...base, problemWord: "blorptastic" });
    assert.equal(r.ok, true);
    const spellings = (r.values as Record<string, unknown>).phoneticSpellings as string[];
    assert.ok(spellings.length >= 2);
    assert.ok(spellings[0].includes("-"), spellings[0]);
    assert.ok(spellings.some((s) => s === s.toLowerCase() || /[A-Z]{2,}/.test(s)));
  });

  it("already-phonetic input is returned unchanged with a note", () => {
    const r = runTool({ ...base, problemWord: "on-truh-pruh-NUR" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.deepEqual(v.phoneticSpellings, ["on-truh-pruh-NUR"]);
    assert.ok(String(v.ipaHint).toLowerCase().includes("unchanged"));
  });

  it("non-Latin script is marked unsupported with an explanation", () => {
    const r = runTool({ ...base, problemWord: "日本語" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.deepEqual(v.phoneticSpellings, []);
    assert.ok(String(v.ipaHint).toLowerCase().includes("unsupported"));
    assert.ok(String(v.engineNotes).toLowerCase().includes("romanized"));
  });

  it("context sentence gets the word replaced with the top spelling", () => {
    const r = runTool({
      ...base,
      contextSentence: "I cooked quinoa for dinner tonight.",
    });
    assert.equal(r.ok, true);
    const s = String((r.values as Record<string, unknown>).testSentence);
    assert.ok(s.includes("KEEN-wah"));
    assert.ok(!s.toLowerCase().includes("quinoa"));
  });

  it("context without the word appends the respelling note", () => {
    const r = runTool({ ...base, contextSentence: "Dinner was great." });
    const s = String((r.values as Record<string, unknown>).testSentence);
    assert.ok(s.includes("KEEN-wah"));
  });

  it("engine notes differ per engine", () => {
    const el = String((runTool({ ...base, targetTtsEngine: "elevenlabs" }).values as Record<string, unknown>).engineNotes);
    const cc = String((runTool({ ...base, targetTtsEngine: "capcut" }).values as Record<string, unknown>).engineNotes);
    const tt = String((runTool({ ...base, targetTtsEngine: "tiktok" }).values as Record<string, unknown>).engineNotes);
    assert.ok(el.includes("pronunciation dictionary"));
    assert.ok(cc.includes("CapCut"));
    assert.ok(tt.includes("TikTok"));
    assert.notEqual(el, cc);
  });

  it("proper noun gets a proper-noun note in engine notes", () => {
    const r = runTool({ ...base, problemWord: "Zyxel" });
    assert.ok(String((r.values as Record<string, unknown>).engineNotes).toLowerCase().includes("proper noun"));
  });

  it("every suggestion set tells the user to test with a preview", () => {
    for (const targetTtsEngine of ["elevenlabs", "capcut", "tiktok", "generic"]) {
      const r = runTool({ ...base, targetTtsEngine });
      assert.ok(
        String((r.values as Record<string, unknown>).engineNotes).toLowerCase().includes("test"),
        targetTtsEngine
      );
    }
  });

  it("validation: empty problem word errors", () => {
    const r = runTool({ ...base, problemWord: "  " });
    assert.equal(r.ok, false);
  });

  it("validation: phrase longer than 4 words errors", () => {
    const r = runTool({ ...base, problemWord: "one two three four five" });
    assert.equal(r.ok, false);
  });

  it("validation: unknown engine errors", () => {
    const r = runTool({ ...base, targetTtsEngine: "playht" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).toLowerCase().includes("engine"));
  });

  it("deterministic: two runs produce identical output", () => {
    assert.deepEqual(runTool(base), runTool(base));
    assert.deepEqual(
      runTool({ ...base, problemWord: "blorptastic" }),
      runTool({ ...base, problemWord: "blorptastic" })
    );
  });

  it("ipaHint is labeled as simplified, not true IPA", () => {
    const r = runTool(base);
    assert.ok(String((r.values as Record<string, unknown>).ipaHint).includes("not true IPA"));
  });
});
