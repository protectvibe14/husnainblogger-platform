import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, SFX_BANK_SIZE } from "./logic.ts";

const base = {
  timelineBeats: [
    { timeMs: 2000, action: "door slams shut" },
    { timeMs: 8000, action: "phone rings" },
    { timeMs: 15000, action: "crowd cheers" },
  ],
  mood: "energetic",
};

describe("sfx-cue-sheet-generator", () => {
  it("happy path: cues with timeMs, sfxType, searchTerms, volumeDb + cueSheetText + warnings", () => {
    const r = runTool({ ...base });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const cues = v.cues as { timeMs: number; sfxType: string; searchTerms: string[]; volumeDb: number }[];
    assert.equal(cues.length, 3);
    for (const c of cues) {
      assert.ok(c.timeMs >= 0);
      assert.ok(c.sfxType.length > 0);
      assert.ok(c.searchTerms.length > 0 && c.searchTerms.every((t) => t.length > 0));
      assert.ok(c.volumeDb <= 0 && c.volumeDb >= -30, `volumeDb in [-30, 0], got ${c.volumeDb}`);
    }
    assert.ok((v.cueSheetText as string).includes("SFX CUE SHEET"));
    assert.ok(Array.isArray(v.warnings));
  });

  it("keyword matching: door knock -> Door", () => {
    const r = runTool({ timelineBeats: [{ timeMs: 1000, action: "someone knocks on the door" }], mood: "" });
    const cue = (r.values as Record<string, unknown>).cues as { sfxType: string }[];
    assert.equal(cue[0].sfxType, "Door");
  });

  it("keyword matching: cash -> Cash Register", () => {
    const r = runTool({ timelineBeats: [{ timeMs: 500, action: "money flies in, cha-ching" }], mood: "" });
    const cue = (r.values as Record<string, unknown>).cues as { sfxType: string }[];
    assert.equal(cue[0].sfxType, "Cash Register");
  });

  it("unmatched action -> UI Tick fallback with a warning", () => {
    const r = runTool({ timelineBeats: [{ timeMs: 1000, action: "zebra" }], mood: "" });
    const v = r.values as Record<string, unknown>;
    const cue = v.cues as { sfxType: string }[];
    assert.equal(cue[0].sfxType, "UI Tick");
    assert.ok((v.warnings as string[]).some((w) => w.includes("no SFX type matched")));
  });

  it("dense beats (<300ms apart) warn about mud", () => {
    const r = runTool({
      timelineBeats: [
        { timeMs: 1000, action: "door slams" },
        { timeMs: 1200, action: "phone rings" },
      ],
      mood: "",
    });
    assert.equal(r.ok, true);
    const warnings = (r.values as Record<string, unknown>).warnings as string[];
    assert.ok(warnings.some((w) => w.includes("mud")), `got: ${JSON.stringify(warnings)}`);
  });

  it("exactly 300ms apart does NOT warn", () => {
    const r = runTool({
      timelineBeats: [
        { timeMs: 1000, action: "door slams" },
        { timeMs: 1300, action: "phone rings" },
      ],
      mood: "",
    });
    const warnings = (r.values as Record<string, unknown>).warnings as string[];
    assert.ok(!warnings.some((w) => w.includes("mud")));
  });

  it("calm mood lowers volumes by 6 dB vs neutral", () => {
    const mk = (mood: string) =>
      runTool({ timelineBeats: [{ timeMs: 1000, action: "phone rings" }], mood });
    const calmDb = (mk("calm").values as Record<string, unknown>).cues as { volumeDb: number }[];
    const neutralDb = (mk("").values as Record<string, unknown>).cues as { volumeDb: number }[];
    assert.equal(calmDb[0].volumeDb, neutralDb[0].volumeDb - 6);
  });

  it("accepts beats as a JSON string", () => {
    const r = runTool({ timelineBeats: JSON.stringify(base.timelineBeats), mood: "energetic" });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).cues as unknown[]).length, 3);
  });

  it("rejects empty beats array", () => {
    const r = runTool({ timelineBeats: [], mood: "" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /at least 1/i);
  });

  it("rejects invalid JSON string", () => {
    const r = runTool({ timelineBeats: "not json", mood: "" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /JSON/i);
  });

  it("rejects non-ascending timestamps", () => {
    const r = runTool({
      timelineBeats: [
        { timeMs: 5000, action: "door slams" },
        { timeMs: 2000, action: "phone rings" },
      ],
      mood: "",
    });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /ascending/i);
  });

  it("rejects equal timestamps", () => {
    const r = runTool({
      timelineBeats: [
        { timeMs: 2000, action: "door slams" },
        { timeMs: 2000, action: "phone rings" },
      ],
      mood: "",
    });
    assert.equal(r.ok, false);
  });

  it("rejects negative timeMs", () => {
    const r = runTool({ timelineBeats: [{ timeMs: -100, action: "door slams" }], mood: "" });
    assert.equal(r.ok, false);
  });

  it("rejects empty action", () => {
    const r = runTool({ timelineBeats: [{ timeMs: 1000, action: "   " }], mood: "" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /action/i);
  });

  it("cueSheetText includes timecodes and the no-files disclaimer", () => {
    const r = runTool({ ...base });
    const text = (r.values as Record<string, unknown>).cueSheetText as string;
    assert.ok(text.includes("00:02.000"));
    assert.ok(text.includes("does NOT provide SFX audio files"));
    assert.ok(text.includes("dB"));
  });

  it("funny mood prefers pop family for unmatched actions", () => {
    const r = runTool({ timelineBeats: [{ timeMs: 1000, action: "zebra" }], mood: "funny comedy" });
    const cue = (r.values as Record<string, unknown>).cues as { sfxType: string }[];
    assert.equal(cue[0].sfxType, "Pop");
  });

  it("determinism: two runs identical", () => {
    assert.equal(JSON.stringify(runTool({ ...base })), JSON.stringify(runTool({ ...base })));
  });

  it("bank size documented: 24 sound types", () => {
    assert.equal(SFX_BANK_SIZE, 24);
  });
});
