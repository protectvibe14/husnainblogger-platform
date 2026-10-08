import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const asRec = (r: { ok: boolean; values?: Record<string, unknown>; error?: string }) =>
  r.values as Record<string, unknown>;

describe("green-screen-color-picker (tool-266)", () => {
  it("happy path (suggest): no green in subject -> broadcast green", () => {
    const r = runTool({ mode: "suggest", subjectColors: "#c85a3a, #f5f0e8, #2b3a55" });
    assert.equal(r.ok, true);
    const v = asRec(r);
    assert.ok(String(v.recommendedKeyColor).startsWith("#00B140"));
    assert.ok(String(v.hsvRange).includes("130°"));
    assert.ok(String(v.hsvRange).includes("154°"));
    assert.ok(Array.isArray(v.spillRiskNotes));
    assert.ok((v.spillRiskNotes as string[]).length >= 2);
  });

  it("suggest: greenish subject color -> blue screen recommended", () => {
    const r = runTool({ mode: "suggest", subjectColors: "#2e7d32, #c8a06a" });
    assert.equal(r.ok, true);
    const v = asRec(r);
    assert.ok(String(v.recommendedKeyColor).startsWith("#0000FF"));
    assert.ok(String(v.hsvRange).includes("228°"));
    assert.ok(String(v.hsvRange).includes("252°"));
    const notes = v.spillRiskNotes as string[];
    assert.ok(notes.some((n) => n.includes("blue screen")));
  });

  it("suggest: hue exactly at the green band edge (164.9°) -> blue", () => {
    const r = runTool({ mode: "suggest", subjectColors: "#00ffbf" });
    assert.ok(String(asRec(r).recommendedKeyColor).startsWith("#0000FF"));
  });

  it("suggest: comma-separated list is parsed", () => {
    const r = runTool({ mode: "suggest", subjectColors: "ff0000, 0000ff" });
    assert.equal(r.ok, true);
    assert.ok(String(asRec(r).recommendedKeyColor).startsWith("#00B140"));
  });

  it("suggest: newline-separated list is parsed", () => {
    const r = runTool({ mode: "suggest", subjectColors: "#ff0000\n#0000ff\n#ffffff" });
    assert.equal(r.ok, true);
  });

  it("suggest: hex without # is accepted", () => {
    const r = runTool({ mode: "suggest", subjectColors: "c85a3a" });
    assert.equal(r.ok, true);
  });

  it("suggest: array input is accepted", () => {
    const r = runTool({ mode: "suggest", subjectColors: ["#c85a3a", "#2e7d32"] });
    assert.ok(String(asRec(r).recommendedKeyColor).startsWith("#0000FF"));
  });

  it("suggest: skin-like tones produce a low-spill note", () => {
    const r = runTool({ mode: "suggest", subjectColors: "#c8a06a" });
    const notes = asRec(r).spillRiskNotes as string[];
    assert.ok(notes.some((n) => n.includes("skin")));
  });

  it("suggest: every result states it does not key video itself", () => {
    const r = runTool({ mode: "suggest", subjectColors: "#c85a3a" });
    const notes = asRec(r).spillRiskNotes as string[];
    assert.ok(notes.some((n) => n.includes("does not key video")));
  });

  it("happy path (analyze): #00b140 sample -> broadcast green", () => {
    const r = runTool({ mode: "analyze", sampleHex: "#00b140" });
    assert.equal(r.ok, true);
    const v = asRec(r);
    assert.ok(String(v.recommendedKeyColor).startsWith("#00B140"));
    assert.ok(String(v.hsvRange).includes("0.85"));
  });

  it("analyze: blue sample -> broadcast blue", () => {
    const r = runTool({ mode: "analyze", sampleHex: "#0000ff" });
    assert.ok(String(asRec(r).recommendedKeyColor).startsWith("#0000FF"));
  });

  it("analyze: near-gray sample warns keying will be hard", () => {
    const r = runTool({ mode: "analyze", sampleHex: "#808080" });
    assert.equal(r.ok, true);
    const notes = asRec(r).spillRiskNotes as string[];
    assert.ok(notes.some((n) => n.includes("near-gray")));
  });

  it("analyze: non-standard color gets the consider-standard-colors note", () => {
    const r = runTool({ mode: "analyze", sampleHex: "#ff00ff" });
    const notes = asRec(r).spillRiskNotes as string[];
    assert.ok(notes.some((n) => n.includes("Consider #00B140 or #0000FF")));
  });

  it("rejects invalid hex in subject colors", () => {
    const r = runTool({ mode: "suggest", subjectColors: "#c85a3a, notacolor" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("notacolor"));
  });

  it("rejects empty subject colors in suggest mode", () => {
    const r = runTool({ mode: "suggest", subjectColors: "   " });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("at least one"));
  });

  it("rejects missing subject colors in suggest mode", () => {
    assert.equal(runTool({ mode: "suggest" }).ok, false);
  });

  it("rejects invalid sampleHex in analyze mode", () => {
    const r = runTool({ mode: "analyze", sampleHex: "blue" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("#00b140"));
  });

  it("rejects missing mode", () => {
    assert.equal(runTool({ subjectColors: "#ff0000" }).ok, false);
  });

  it("rejects unknown mode", () => {
    const r = runTool({ mode: "pick", subjectColors: "#ff0000" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("suggest"));
  });

  it("output keys match meta.ts outputs", () => {
    const r = runTool({ mode: "suggest", subjectColors: "#c85a3a" });
    assert.deepEqual(Object.keys(asRec(r)).sort(), ["hsvRange", "recommendedKeyColor", "spillRiskNotes"]);
  });

  it("is deterministic", () => {
    const a = runTool({ mode: "suggest", subjectColors: "#2e7d32, #c8a06a" });
    const b = runTool({ mode: "suggest", subjectColors: "#2e7d32, #c8a06a" });
    assert.deepEqual(a, b);
    const c = runTool({ mode: "analyze", sampleHex: "#808080" });
    const d = runTool({ mode: "analyze", sampleHex: "#808080" });
    assert.deepEqual(c, d);
  });
});
