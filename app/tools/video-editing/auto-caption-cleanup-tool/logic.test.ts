import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = {
  rawCaptionText: "um hello world , this is uh a test",
  fixCaps: true,
  fixPunct: true,
  removeFillers: true,
  maxCharsPerLine: 42,
};

describe("auto-caption-cleanup-tool (tool-254)", () => {
  it("happy path: fillers removed, caps fixed, punctuation spaced", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.cleanedText, "Hello world, this is a test.");
    assert.equal(v.fillerCountRemoved, 2);
    const types = (v.changes as { type: string }[]).map((c) => c.type);
    assert.ok(types.includes("filler"));
    assert.ok(types.includes("caps"));
  });

  it("output keys match meta.ts outputs", () => {
    const r = runTool(base);
    assert.deepEqual(Object.keys(r.values as object).sort(), [
      "changes",
      "cleanedText",
      "fillerCountRemoved",
    ]);
  });

  it("change entries carry type, before, and after", () => {
    const r = runTool(base);
    const changes = (r.values as Record<string, unknown>).changes as Record<string, unknown>[];
    assert.ok(changes.length > 0);
    for (const c of changes) {
      assert.equal(typeof c.type, "string");
      assert.equal(typeof c.before, "string");
      assert.equal(typeof c.after, "string");
    }
  });

  it("SRT input: indices and timestamps stripped, cue text kept", () => {
    const srt = "1\n00:00:01,000 --> 00:00:03,000\nhello um world\n\n2\n00:00:04,000 --> 00:00:06,000\nsecond line here";
    const r = runTool({ ...base, rawCaptionText: srt });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok(!String(v.cleanedText).includes("00:00"));
    assert.ok(String(v.cleanedText).includes("Hello world"));
    assert.equal(v.fillerCountRemoved, 1);
  });

  it("VTT input: header and cue settings stripped", () => {
    const vtt = "WEBVTT\n\n00:00.000 --> 00:02.000 align:start position:0%\nuh first cue\n\n00:03.000 --> 00:05.000\nsecond cue";
    const r = runTool({ ...base, rawCaptionText: vtt });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok(!String(v.cleanedText).includes("WEBVTT"));
    assert.ok(!String(v.cleanedText).includes("align:start"));
    assert.equal(v.fillerCountRemoved, 1);
  });

  it("already-clean text returns unchanged with zero changes", () => {
    const r = runTool({ ...base, rawCaptionText: "This is already clean." });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v.cleanedText, "This is already clean.");
    assert.deepEqual(v.changes, []);
    assert.equal(v.fillerCountRemoved, 0);
  });

  it("ALL-CAPS shouting line is preserved intentionally", () => {
    const r = runTool({ ...base, rawCaptionText: "NEVER DO THIS AGAIN" });
    assert.equal(r.ok, true);
    assert.ok(String((r.values as Record<string, unknown>).cleanedText).includes("NEVER DO THIS AGAIN"));
  });

  it("non-Latin line is left completely untouched", () => {
    const jp = "これはテストです";
    const r = runTool({ ...base, rawCaptionText: jp });
    assert.equal(r.ok, true);
    assert.equal((r.values as Record<string, unknown>).cleanedText, jp);
    assert.equal((r.values as Record<string, unknown>).fillerCountRemoved, 0);
  });

  it("long line is wrapped at maxCharsPerLine with a wrap change", () => {
    const r = runTool({
      ...base,
      rawCaptionText: "this is a fairly long caption line that definitely exceeds twenty characters",
      maxCharsPerLine: 20,
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const lines = String(v.cleanedText).split("\n");
    assert.ok(lines.length > 1);
    assert.ok(lines.every((l) => l.length <= 20));
    assert.ok((v.changes as { type: string }[]).some((c) => c.type === "wrap"));
  });

  it("single word longer than max is hard-broken with a warning entry", () => {
    const r = runTool({ ...base, rawCaptionText: "pneumonoultramicroscopicsilicovolcanoconiosis", maxCharsPerLine: 20 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok((v.changes as { type: string }[]).some((c) => c.type === "hard-break"));
    assert.ok(String(v.cleanedText).split("\n").every((l) => l.length <= 20));
  });

  it("punctuation spacing and repeats are fixed", () => {
    const r = runTool({ ...base, rawCaptionText: "hello , world !!", removeFillers: false });
    assert.ok(String((r.values as Record<string, unknown>).cleanedText).includes("Hello, world!"));
  });

  it("options can be disabled: fillers kept when removeFillers is false", () => {
    const r = runTool({ ...base, rawCaptionText: "um short line", removeFillers: false, fixCaps: false, fixPunct: false });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.ok(String(v.cleanedText).includes("um"));
    assert.equal(v.fillerCountRemoved, 0);
    assert.deepEqual(v.changes, []);
  });

  it("validation: empty input errors", () => {
    const r = runTool({ ...base, rawCaptionText: "   " });
    assert.equal(r.ok, false);
  });

  it("validation: maxCharsPerLine outside 10-80 or non-numeric errors", () => {
    for (const maxCharsPerLine of [5, 100, "wide"]) {
      const r = runTool({ ...base, maxCharsPerLine });
      assert.equal(r.ok, false, String(maxCharsPerLine));
    }
  });

  it("validation: maxCharsPerLine defaults to 42 when omitted", () => {
    const { maxCharsPerLine, ...rest } = base;
    const r = runTool(rest);
    assert.equal(r.ok, true);
    assert.ok(String((r.values as Record<string, unknown>).cleanedText).length > 0);
  });

  it("deterministic: two runs produce identical output", () => {
    assert.deepEqual(runTool(base), runTool(base));
  });
});
