/**
 * logic.test.ts — Passport/ID Photo Maker (tool-514).
 *
 * node:test suite. Run: node --test app/tools/ai-tools/passport-id-photo-maker/logic.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateInputs,
  getModelConfig,
  getDisclosures,
  getPhotoSize,
  getAllowedMimes,
  PHOTO_SIZES,
  MAX_FILE_MB,
  MAX_DIMENSION_PX,
} from './logic.ts';

const goodFile = {
  name: 'face.jpg',
  sizeBytes: 2 * 1024 * 1024,
  mimeType: 'image/jpeg',
  width: 1200,
  height: 1600,
};

test('accepts a valid portrait + each size', () => {
  for (const s of PHOTO_SIZES) {
    assert.equal(validateInputs({ file: goodFile, size: s.id }).ok, true, s.id);
  }
});

test('rejects a missing file', () => {
  const r = validateInputs({ size: 'us' });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /portrait photo/i);
});

test('rejects an invalid size', () => {
  for (const size of ['eu', '', undefined]) {
    const r = validateInputs({ file: goodFile, size });
    assert.equal(r.ok, false, 'size=' + String(size) + ' should fail');
    assert.match(r.errors.join(' '), /photo size/i);
  }
});

test('photo sizes match official dimensions at 300 dpi', () => {
  assert.deepEqual(getPhotoSize('us'), { id: 'us', label: 'US — 2×2 in (51×51 mm)', width: 600, height: 600 });
  assert.deepEqual(getPhotoSize('uk'), { id: 'uk', label: 'UK / Schengen — 35×45 mm', width: 413, height: 531 });
  assert.deepEqual(getPhotoSize('india'), { id: 'india', label: 'India — 51×51 mm', width: 602, height: 602 });
  assert.equal(getPhotoSize('xx'), null);
});

test('rejects unsupported mimes', () => {
  const r = validateInputs({ file: { ...goodFile, mimeType: 'image/gif' }, size: 'us' });
  assert.equal(r.ok, false);
});

test('accepts every allowed mime', () => {
  for (const mimeType of getAllowedMimes()) {
    assert.equal(validateInputs({ file: { ...goodFile, mimeType }, size: 'uk' }).ok, true);
  }
});

test('rejects files over 20 MB', () => {
  const r = validateInputs({
    file: { ...goodFile, sizeBytes: (MAX_FILE_MB + 1) * 1024 * 1024 },
    size: 'india',
  });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /too large/i);
});

test('rejects images beyond the dimension cap', () => {
  const r = validateInputs({
    file: { ...goodFile, width: MAX_DIMENSION_PX + 1, height: 100 },
    size: 'us',
  });
  assert.equal(r.ok, false);
});

test('getModelConfig returns the verified RMBG-1.4 identity', () => {
  const cfg = getModelConfig();
  assert.equal(cfg.task, 'image-segmentation');
  assert.equal(cfg.modelId, 'briaai/RMBG-1.4');
  assert.equal(cfg.sizeMb, 176);
  assert.match(cfg.license, /non-commercial/);
});

test('getDisclosures leads with the official-requirements warning', () => {
  const d = getDisclosures();
  assert.ok(d.length >= 3);
  assert.match(d[0], /official photo requirements/);
  assert.match(d.join(' '), /BRIA/);
});
