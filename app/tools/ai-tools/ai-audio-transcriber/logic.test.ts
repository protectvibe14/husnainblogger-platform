/**
 * logic.test.ts — AI Audio Transcriber (tool-510).
 *
 * node:test suite. Run: node --test app/tools/ai-tools/ai-audio-transcriber/logic.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateInputs,
  getModelConfig,
  getDisclosures,
  getModelOption,
  getAllowedMimes,
  MODEL_OPTIONS,
  MAX_FILE_MB,
} from './logic.ts';

const goodFile = { name: 'note.mp3', sizeBytes: 5 * 1024 * 1024, mimeType: 'audio/mpeg' };

test('accepts a valid audio + tiny model', () => {
  assert.equal(validateInputs({ file: goodFile, model: 'tiny' }).ok, true);
});

test('accepts a valid audio + base model', () => {
  assert.equal(validateInputs({ file: goodFile, model: 'base' }).ok, true);
});

test('rejects a missing file', () => {
  const r = validateInputs({ model: 'tiny' });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /Choose an audio/i);
});

test('rejects an invalid model choice', () => {
  for (const model of ['large', '', undefined, 1]) {
    const r = validateInputs({ file: goodFile, model });
    assert.equal(r.ok, false, 'model=' + String(model) + ' should fail');
    assert.match(r.errors.join(' '), /Tiny or Base/);
  }
});

test('rejects non-audio mimes', () => {
  for (const mimeType of ['video/mp4', 'application/pdf', 'image/jpeg', '']) {
    const r = validateInputs({ file: { ...goodFile, mimeType }, model: 'tiny' });
    assert.equal(r.ok, false, mimeType + ' should fail');
  }
});

test('accepts every allowed mime', () => {
  for (const mimeType of getAllowedMimes()) {
    assert.equal(validateInputs({ file: { ...goodFile, mimeType }, model: 'tiny' }).ok, true);
  }
});

test('rejects files over 25 MB', () => {
  const r = validateInputs({
    file: { ...goodFile, sizeBytes: (MAX_FILE_MB + 1) * 1024 * 1024 },
    model: 'tiny',
  });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /too large/i);
});

test('accepts a file at exactly the cap', () => {
  assert.equal(
    validateInputs({ file: { ...goodFile, sizeBytes: MAX_FILE_MB * 1024 * 1024 }, model: 'base' }).ok,
    true,
  );
});

test('getModelOption resolves the verified Whisper model ids', () => {
  assert.equal(getModelOption('tiny')?.modelId, 'Xenova/whisper-tiny');
  assert.equal(getModelOption('base')?.modelId, 'Xenova/whisper-base');
  assert.equal(getModelOption('small'), null);
  assert.equal(MODEL_OPTIONS.length, 2);
});

test('getModelConfig returns tiny as the default with verified identity', () => {
  const cfg = getModelConfig();
  assert.equal(cfg.task, 'automatic-speech-recognition');
  assert.equal(cfg.modelId, 'Xenova/whisper-tiny');
  assert.equal(cfg.sizeMb, 39);
  assert.match(cfg.license, /Apache-2\.0/);
});

test('getDisclosures covers on-device processing and accuracy limits', () => {
  const d = getDisclosures();
  assert.ok(d.length >= 3);
  assert.match(d.join(' ').toLowerCase(), /never leaves your browser/);
  assert.match(d.join(' ').toLowerCase(), /struggle|accent/i);
});
