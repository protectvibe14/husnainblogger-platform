/**
 * logic.test.ts — AI Background Remover (tool-508).
 *
 * node:test suite. Run: node --test app/tools/ai-tools/ai-background-remover/logic.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateInputs,
  getModelConfig,
  getDisclosures,
  getAllowedMimes,
  MAX_FILE_MB,
  MAX_DIMENSION_PX,
} from './logic.ts';

const goodFile = {
  name: 'photo.jpg',
  sizeBytes: 2 * 1024 * 1024,
  mimeType: 'image/jpeg',
  width: 1600,
  height: 1200,
};

test('accepts a valid image descriptor', () => {
  const r = validateInputs({ file: goodFile });
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, []);
});

test('accepts every allowed mime type', () => {
  for (const mimeType of getAllowedMimes()) {
    const r = validateInputs({ file: { ...goodFile, mimeType } });
    assert.equal(r.ok, true, mimeType + ' should validate');
  }
});

test('rejects a missing file', () => {
  const r = validateInputs({});
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /Choose an image/i);
});

test('rejects unsupported file types', () => {
  for (const mimeType of ['image/bmp', 'application/pdf', 'video/mp4', '']) {
    const r = validateInputs({ file: { ...goodFile, mimeType } });
    assert.equal(r.ok, false, mimeType + ' should fail');
    assert.match(r.errors.join(' '), /not supported/i);
  }
});

test('rejects files over the 20 MB cap', () => {
  const r = validateInputs({ file: { ...goodFile, sizeBytes: (MAX_FILE_MB + 1) * 1024 * 1024 } });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /too large/i);
});

test('accepts a file at exactly the cap', () => {
  const r = validateInputs({ file: { ...goodFile, sizeBytes: MAX_FILE_MB * 1024 * 1024 } });
  assert.equal(r.ok, true);
});

test('rejects images beyond the dimension cap', () => {
  const r = validateInputs({ file: { ...goodFile, width: MAX_DIMENSION_PX + 1, height: 100 } });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /resize/i);
});

test('works when dimensions are unknown', () => {
  const { width, height, ...rest } = goodFile;
  void width;
  void height;
  const r = validateInputs({ file: rest });
  assert.equal(r.ok, true);
});

test('rejects unreadable file sizes', () => {
  const r = validateInputs({ file: { ...goodFile, sizeBytes: Number.NaN } });
  assert.equal(r.ok, false);
});

test('getModelConfig returns the verified RMBG-1.4 identity', () => {
  const cfg = getModelConfig();
  assert.equal(cfg.task, 'image-segmentation');
  assert.equal(cfg.modelId, 'briaai/RMBG-1.4');
  assert.equal(cfg.sizeMb, 176);
  assert.match(cfg.license, /non-commercial/);
});

test('getDisclosures carries the BRIA commercial-use note', () => {
  const d = getDisclosures();
  assert.ok(d.length >= 3);
  assert.match(d.join(' '), /BRIA/);
  assert.match(d.join(' '), /commercial/);
});
