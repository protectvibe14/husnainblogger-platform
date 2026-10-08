/**
 * logic.test.ts — Read-Aloud TTS (tool-512).
 *
 * node:test suite. Run: node --test app/tools/ai-tools/read-aloud-tts-voice-browser/logic.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateInputs,
  getModelConfig,
  getDisclosures,
  MAX_TEXT_CHARS,
  RATE_MIN,
  RATE_MAX,
  PITCH_MIN,
  PITCH_MAX,
} from './logic.ts';

test('accepts valid text with rate and pitch', () => {
  assert.equal(validateInputs({ text: 'Hello world.', rate: 1, pitch: 1 }).ok, true);
});

test('accepts text alone (voice/rate/pitch are optional)', () => {
  assert.equal(validateInputs({ text: 'Hello.' }).ok, true);
});

test('rejects empty or blank text', () => {
  for (const text of ['', '   ']) {
    const r = validateInputs({ text });
    assert.equal(r.ok, false);
    assert.match(r.errors.join(' '), /Enter some text/i);
  }
});

test('rejects text over the cap', () => {
  const r = validateInputs({ text: 'x'.repeat(MAX_TEXT_CHARS + 1) });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /characters/);
});

test('accepts text at exactly the cap', () => {
  assert.equal(validateInputs({ text: 'x'.repeat(MAX_TEXT_CHARS) }).ok, true);
});

test('rejects out-of-range rate', () => {
  for (const rate of [RATE_MIN - 0.1, RATE_MAX + 0.1, Number.NaN, 'fast']) {
    const r = validateInputs({ text: 'Hi.', rate });
    assert.equal(r.ok, false, 'rate=' + String(rate) + ' should fail');
    assert.match(r.errors.join(' '), /Rate/);
  }
});

test('rejects out-of-range pitch', () => {
  for (const pitch of [PITCH_MIN - 0.1, PITCH_MAX + 0.1, Number.NaN]) {
    const r = validateInputs({ text: 'Hi.', pitch });
    assert.equal(r.ok, false, 'pitch=' + String(pitch) + ' should fail');
    assert.match(r.errors.join(' '), /Pitch/);
  }
});

test('accepts boundary rate and pitch values', () => {
  assert.equal(validateInputs({ text: 'Hi.', rate: RATE_MIN, pitch: PITCH_MIN }).ok, true);
  assert.equal(validateInputs({ text: 'Hi.', rate: RATE_MAX, pitch: PITCH_MAX }).ok, true);
});

test('getModelConfig is honest: no model, browser-native engine', () => {
  const cfg = getModelConfig();
  assert.equal(cfg.task, 'text-to-speech');
  assert.match(cfg.modelId, /browser-native/);
  assert.equal(cfg.sizeMb, 0);
  assert.match(cfg.license, /Device voices/);
});

test('getDisclosures covers device-varying voices', () => {
  const d = getDisclosures();
  assert.ok(d.length >= 2);
  assert.match(d.join(' ').toLowerCase(), /varies by operating system/);
});
