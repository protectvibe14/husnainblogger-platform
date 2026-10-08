import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildSunoPrompt,
  sanitizeTheme,
  GENRES,
  MOODS,
  TEMPOS,
  VOCALS,
} from "./logic.ts";

const GOOD = {
  genre: "lofi",
  mood: "chill",
  tempo: "slow",
  vocals: "female-vocal",
  theme: "rainy sunday mornings",
};

describe("suno-music-prompt-builder", () => {
  it("happy path: style field combines all four fragments", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(
      v["styleField"],
      "lo-fi, laid-back and relaxed, slow tempo, female vocal",
    );
  });

  it("lyrics draft has the fixed verse/chorus/outro structure", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    const draft = (r.values as Record<string, unknown>)["lyricsDraft"] as string;
    assert.ok(draft.includes("[Verse 1]"));
    assert.ok(draft.includes("[Chorus]"));
    assert.ok(draft.includes("[Verse 2]"));
    assert.ok(draft.includes("[Outro]"));
    assert.ok(draft.includes("rainy sunday mornings"));
    assert.ok(!draft.includes("{theme}"));
  });

  it("instrumental option produces a no-vocals style field", () => {
    const r = runTool({ ...GOOD, vocals: "instrumental" });
    assert.equal(r.ok, true);
    assert.ok(
      ((r.values as Record<string, unknown>)["styleField"] as string).includes(
        "instrumental, no vocals",
      ),
    );
  });

  it("pasteNote explains this is text to paste into Suno", () => {
    const { pasteNote } = buildSunoPrompt("pop", "happy", "fast", "duet", "road trip");
    assert.ok(pasteNote.toLowerCase().includes("paste"));
    assert.ok(pasteNote.toLowerCase().includes("suno"));
  });

  it("every genre/mood/tempo/vocal key is accepted", () => {
    for (const g of Object.keys(GENRES))
      assert.equal(runTool({ ...GOOD, genre: g }).ok, true, g);
    for (const m of Object.keys(MOODS))
      assert.equal(runTool({ ...GOOD, mood: m }).ok, true, m);
    for (const t of Object.keys(TEMPOS))
      assert.equal(runTool({ ...GOOD, tempo: t }).ok, true, t);
    for (const v of Object.keys(VOCALS))
      assert.equal(runTool({ ...GOOD, vocals: v }).ok, true, v);
  });

  it("select keys are case/space-insensitive", () => {
    const r = runTool({ ...GOOD, genre: "  Lofi ", vocals: "DUET" });
    assert.equal(r.ok, true);
    assert.ok(
      ((r.values as Record<string, unknown>)["styleField"] as string).includes("duet"),
    );
  });

  it("determinism: same inputs twice -> identical output", () => {
    assert.deepEqual(runTool(GOOD), runTool(GOOD));
  });

  it("sanitizeTheme strips HTML and URLs", () => {
    assert.equal(sanitizeTheme("<b>road trip</b> http://x.com"), "road trip");
  });

  it("validation: invalid genre -> error", () => {
    const r = runTool({ ...GOOD, genre: "opera" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: invalid mood -> error", () => {
    assert.equal(runTool({ ...GOOD, mood: "sleepy" }).ok, false);
  });

  it("validation: invalid tempo -> error", () => {
    assert.equal(runTool({ ...GOOD, tempo: "allegro" }).ok, false);
  });

  it("validation: invalid vocals -> error", () => {
    assert.equal(runTool({ ...GOOD, vocals: "robot" }).ok, false);
  });

  it("validation: missing or empty theme -> error", () => {
    assert.equal(runTool({ genre: "pop", mood: "happy", tempo: "fast", vocals: "male-vocal" }).ok, false);
    assert.equal(runTool({ ...GOOD, theme: "" }).ok, false);
  });

  it("validation: theme too long -> error", () => {
    assert.equal(runTool({ ...GOOD, theme: "t".repeat(201) }).ok, false);
  });
});
