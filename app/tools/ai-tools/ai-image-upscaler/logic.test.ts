/**
 * logic.test.ts — AI Image Upscaler (tool-509).
 *
 * node:test suite. Run: node --test app/tools/ai-tools/ai-image-upscaler/logic.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateInputs,
  getModelConfig,
  getDisclosures,
  getScaleOption,
  getAllowedMimes,
  SCALE_OPTIONS,
  MAX_FILE_MB,
  MAX_DIMENSION_PX,
} from './logic.ts';

const goodFile = {
  name: 'photo.jpg',
  sizeBytes: 1 * 1024 * 1024,
  mimeType: 'image/jpeg',
  width: 800,
  height: 600,
};

test('accepts a valid image + 2x', () => {
  assert.equal(validateInputs({ file: goodFile, scale: '2x' }).ok, true);
});

test('accepts a valid image + 4x', () => {
  assert.equal(validateInputs({ file: goodFile, scale: '4x' }).ok, true);
});

test('rejects a missing file', () => {
  const r = validateInputs({ scale: '4x' });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /Choose an image/i);
});

test('rejects an invalid scale', () => {
  for (const scale of ['8x', '', undefined, 4]) {
    const r = validateInputs({ file: goodFile, scale });
    assert.equal(r.ok, false, 'scale=' + String(scale) + ' should fail');
    assert.match(r.errors.join(' '), /2x or 4x/);
  }
});

test('rejects unsupported mimes', () => {
  for (const mimeType of ['image/gif', 'image/bmp', 'application/pdf']) {
    const r = validateInputs({ file: { ...goodFile, mimeType }, scale: '4x' });
    assert.equal(r.ok, false, mimeType + ' should fail');
  }
});

test('accepts every allowed mime', () => {
  for (const mimeType of getAllowedMimes()) {
    assert.equal(validateInputs({ file: { ...goodFile, mimeType }, scale: '2x' }).ok, true);
  }
});

test('rejects files over 20 MB', () => {
  const r = validateInputs({
    file: { ...goodFile, sizeBytes: (MAX_FILE_MB + 1) * 1024 * 1024 },
    scale: '4x',
  });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /too large/i);
});

test('rejects images over 1024 px per side', () => {
  const r = validateInputs({ file: { ...goodFile, width: 2048, height: 1024 }, scale: '4x' });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /1024/);
});

test('rejects tiny images', () => {
  const r = validateInputs({ file: { ...goodFile, width: 8, height: 8 }, scale: '2x' });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /too small/i);
});

test('getScaleOption resolves the verified model ids', () => {
  const x2 = getScaleOption('2x');
  const x4 = getScaleOption('4x');
  assert.equal(x2?.modelId, 'Xenova/swin2SR-classical-sr-x2-64');
  assert.equal(x4?.modelId, 'Xenova/swin2SR-classical-sr-x4-64');
  assert.equal(getScaleOption('3x'), null);
  assert.equal(SCALE_OPTIONS.length, 2);
});

test('getModelConfig returns the 4x default with verified identity', () => {
  const cfg = getModelConfig();
  assert.equal(cfg.task, 'image-to-image');
  assert.equal(cfg.modelId, 'Xenova/swin2SR-classical-sr-x4-64');
  assert.equal(cfg.dtype, 'fp32');
  assert.equal(cfg.sizeMb, 53);
  assert.match(cfg.license, /Apache-2\.0/);
});

test('getDisclosures states the input cap and on-device processing', () => {
  const d = getDisclosures();
  assert.ok(d.length >= 3);
  assert.match(d.join(' '), /1024/);
  assert.match(d.join(' ').toLowerCase(), /never leaves your browser/);
});
