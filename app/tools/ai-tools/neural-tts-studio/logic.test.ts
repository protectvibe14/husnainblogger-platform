/**
 * logic.test.ts — Neural TTS Studio (tool-507).
 *
 * node:test suite for validateInputs / getModelConfig / getDisclosures.
 * Run: node --test app/tools/ai-tools/neural-tts-studio/logic.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateInputs,
  getModelConfig,
  getDisclosures,
  isKnownVoice,
  KOKORO_VOICES,
  TEXT_MAX_CHARS,
  SPEED_MIN,
  SPEED_MAX,
} from './logic.ts';

test('accepts a valid input set', () => {
  const r = validateInputs({ text: 'Hello, this is a test.', voice: 'af_bella', speed: 1 });
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, []);
});

test('rejects empty or whitespace-only text', () => {
  for (const text of ['', '   ', '\n\t ']) {
    const r = validateInputs({ text, voice: 'af_sarah', speed: 1 });
    assert.equal(r.ok, false, 'expected failure for text=' + JSON.stringify(text));
    assert.match(r.errors.join(' '), /Enter some text/i);
  }
});

test('rejects text longer than the 5000-character cap', () => {
  const r = validateInputs({ text: 'a'.repeat(TEXT_MAX_CHARS + 1), voice: 'am_adam', speed: 1 });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /too long/i);
});

test('accepts text at exactly the cap', () => {
  const r = validateInputs({ text: 'a'.repeat(TEXT_MAX_CHARS), voice: 'am_adam', speed: 1 });
  assert.equal(r.ok, true);
});

test('rejects unknown voices and accepts every listed voice', () => {
  const bad = validateInputs({ text: 'Hi', voice: 'af_heart', speed: 1 });
  assert.equal(bad.ok, false);
  assert.match(bad.errors.join(' '), /voice/i);

  for (const v of KOKORO_VOICES) {
    const r = validateInputs({ text: 'Hi', voice: v.id, speed: 1 });
    assert.equal(r.ok, true, 'voice ' + v.id + ' should validate');
    assert.equal(isKnownVoice(v.id), true);
  }
});

test('voice list contains exactly the 10 verified IDs', () => {
  const ids = KOKORO_VOICES.map((v) => v.id).sort();
  assert.deepEqual(ids, [
    'af_bella',
    'af_nicole',
    'af_sarah',
    'af_sky',
    'am_adam',
    'am_michael',
    'bf_emma',
    'bf_isabella',
    'bm_george',
    'bm_lewis',
  ]);
});

test('rejects out-of-range and non-numeric speeds', () => {
  for (const speed of [0.4, 2.1, Number.NaN, 'fast', undefined, null]) {
    const r = validateInputs({ text: 'Hi', voice: 'bf_emma', speed });
    assert.equal(r.ok, false, 'expected failure for speed=' + String(speed));
  }
});

test('accepts speeds at the slider bounds', () => {
  assert.equal(validateInputs({ text: 'Hi', voice: 'bf_emma', speed: SPEED_MIN }).ok, true);
  assert.equal(validateInputs({ text: 'Hi', voice: 'bf_emma', speed: SPEED_MAX }).ok, true);
});

test('collects multiple errors at once', () => {
  const r = validateInputs({ text: '', voice: 'nope', speed: 99 });
  assert.equal(r.ok, false);
  assert.ok(r.errors.length >= 3);
});

test('getModelConfig returns the verified Kokoro model identity', () => {
  const cfg = getModelConfig();
  assert.equal(cfg.task, 'text-to-speech');
  assert.equal(cfg.modelId, 'onnx-community/Kokoro-82M-v1.0-ONNX');
  assert.equal(cfg.dtype, 'q8');
  assert.equal(cfg.sizeMb, 86);
  assert.match(cfg.license, /Apache-2\.0/);
});

test('getDisclosures mentions the one-time download and on-device processing', () => {
  const d = getDisclosures();
  assert.ok(d.length >= 3);
  assert.match(d.join(' '), /86 MB/);
  assert.match(d.join(' ').toLowerCase(), /on your device|locally/);
  assert.match(d.join(' ').toLowerCase(), /never uploaded|100%/);
});
