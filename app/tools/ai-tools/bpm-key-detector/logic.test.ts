import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getModelConfig,
  getDisclosures,
  validateInputs,
  autocorrBpm,
  detectKey,
  HEADLINE,
  NOTE_NAMES,
  MAX_FILE_MB,
} from "./logic.ts";

/** Synthetic onset envelope: impulses at `bpm`, envRate frames/sec. */
function synthEnvelope(bpm: number, envRate: number, seconds: number): number[] {
  const n = Math.floor(envRate * seconds);
  const period = (60 / bpm) * envRate;
  const env: number[] = [];
  for (let i = 0; i < n; i++) {
    const phase = i % period;
    env.push(phase < 1 ? 1 : 0.05);
  }
  return env;
}

describe("bpm-key-detector logic", () => {
  it("getModelConfig returns null — DSP only, no model", () => {
    assert.equal(getModelConfig(), null);
  });

  it("disclosures are honest (±3% BPM, best-guess key, no upload)", () => {
    const d = getDisclosures().join(" ");
    assert.ok(d.includes("No AI model"));
    assert.ok(d.includes("±3%"));
    assert.ok(d.includes("best guess"));
    assert.ok(d.includes("never uploaded"));
  });

  it("headline is not hype", () => {
    assert.ok(!/ai-powered/i.test(HEADLINE));
  });

  it("autocorrBpm recovers 120 BPM from a synthetic envelope", () => {
    const est = autocorrBpm(synthEnvelope(120, 100, 10), 100)!;
    assert.ok(est, "expected an estimate");
    assert.ok(Math.abs(est.bpm - 120) < 3.6, `got ${est.bpm}`);
    assert.ok(est.confidence > 0.3, `confidence ${est.confidence}`);
  });

  it("autocorrBpm recovers 90 BPM from a synthetic envelope", () => {
    const est = autocorrBpm(synthEnvelope(90, 100, 12), 100)!;
    assert.ok(Math.abs(est.bpm - 90) < 2.7, `got ${est.bpm}`);
  });

  it("autocorrBpm returns null for flat/degenerate envelopes", () => {
    assert.equal(autocorrBpm(new Array(500).fill(0.5), 100), null);
    assert.equal(autocorrBpm([], 100), null);
    assert.equal(autocorrBpm([1, 2], 100), null);
  });

  it("detectKey finds C major from a C-major-weighted chroma", () => {
    const chroma = [1, 0, 0.8, 0, 0.9, 0.7, 0, 1, 0, 0.8, 0, 0.6];
    const est = detectKey(chroma)!;
    assert.equal(est.key, "C major");
    assert.ok(est.correlation > 0.5);
  });

  it("detectKey finds A minor from an A-minor-weighted chroma", () => {
    // A minor tonic triad (A-C-E) dominant.
    const chroma = [0.9, 0, 0.2, 0, 0.9, 0.3, 0, 0.2, 0, 1, 0, 0.2];
    const est = detectKey(chroma)!;
    assert.equal(est.key, "A minor");
  });

  it("detectKey returns null for bad input", () => {
    assert.equal(detectKey(new Array(12).fill(0)), null);
    assert.equal(detectKey([1, 2, 3]), null);
  });

  it("NOTE_NAMES covers all 12 pitch classes", () => {
    assert.equal(NOTE_NAMES.length, 12);
    assert.equal(NOTE_NAMES[0], "C");
    assert.equal(NOTE_NAMES[9], "A");
  });

  it("validateInputs: happy path + failures", () => {
    assert.deepEqual(validateInputs({ fileName: "track.mp3", fileSizeMb: 8 }), { ok: true });
    assert.equal(validateInputs({}).ok, false);
    assert.equal(
      validateInputs({ fileName: "t.mp3", fileSizeMb: MAX_FILE_MB + 1 }).ok,
      false,
    );
  });

  it("determinism", () => {
    const env = synthEnvelope(120, 100, 10);
    assert.deepEqual(autocorrBpm(env, 100), autocorrBpm(env, 100));
    const chroma = [1, 0, 0.8, 0, 0.9, 0.7, 0, 1, 0, 0.8, 0, 0.6];
    assert.deepEqual(detectKey(chroma), detectKey(chroma));
  });
});
