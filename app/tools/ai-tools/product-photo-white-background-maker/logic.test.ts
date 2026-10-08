/**
 * logic.test.ts — Product Photo White Background Maker (tool-513).
 *
 * node:test suite. Run: node --test app/tools/ai-tools/product-photo-white-background-maker/logic.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateInputs,
  getModelConfig,
  getDisclosures,
  getOutputFormat,
  getAllowedMimes,
  MAX_FILE_MB,
  MAX_DIMENSION_PX,
  OUTPUT_PX,
} from './logic.ts';

const goodFile = {
  name: 'shoe.jpg',
  sizeBytes: 3 * 1024 * 1024,
  mimeType: 'image/jpeg',
  width: 2000,
  height: 1500,
};

test('accepts a valid photo + jpg', () => {
  assert.equal(validateInputs({ file: goodFile, format: 'jpg' }).ok, true);
});

test('accepts a valid photo + png', () => {
  assert.equal(validateInputs({ file: goodFile, format: 'png' }).ok, true);
});

test('rejects a missing file', () => {
  const r = validateInputs({ format: 'jpg' });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /product photo/i);
});

test('rejects an invalid format', () => {
  for (const format of ['webp', '', undefined]) {
    const r = validateInputs({ file: goodFile, format });
    assert.equal(r.ok, false, 'format=' + String(format) + ' should fail');
    assert.match(r.errors.join(' '), /format/i);
  }
});

test('getOutputFormat resolves and nulls', () => {
  assert.equal(getOutputFormat('jpg'), 'jpg');
  assert.equal(getOutputFormat('png'), 'png');
  assert.equal(getOutputFormat('gif'), null);
  assert.equal(getOutputFormat(undefined), null);
});

test('rejects unsupported mimes', () => {
  const r = validateInputs({ file: { ...goodFile, mimeType: 'image/bmp' }, format: 'jpg' });
  assert.equal(r.ok, false);
});

test('accepts every allowed mime', () => {
  for (const mimeType of getAllowedMimes()) {
    assert.equal(validateInputs({ file: { ...goodFile, mimeType }, format: 'png' }).ok, true);
  }
});

test('rejects files over 20 MB', () => {
  const r = validateInputs({
    file: { ...goodFile, sizeBytes: (MAX_FILE_MB + 1) * 1024 * 1024 },
    format: 'jpg',
  });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /too large/i);
});

test('rejects images beyond the dimension cap', () => {
  const r = validateInputs({
    file: { ...goodFile, width: MAX_DIMENSION_PX + 1, height: 100 },
    format: 'jpg',
  });
  assert.equal(r.ok, false);
});

test('output canvas is the fixed 2000 px square', () => {
  assert.equal(OUTPUT_PX, 2000);
});

test('getModelConfig returns the verified RMBG-1.4 identity', () => {
  const cfg = getModelConfig();
  assert.equal(cfg.task, 'image-segmentation');
  assert.equal(cfg.modelId, 'briaai/RMBG-1.4');
  assert.equal(cfg.sizeMb, 176);
  assert.match(cfg.license, /non-commercial/);
});

test('getDisclosures carries the BRIA commercial note and output size', () => {
  const d = getDisclosures();
  assert.ok(d.length >= 3);
  assert.match(d.join(' '), /BRIA/);
  assert.match(d.join(' '), /2000×2000/);
});
