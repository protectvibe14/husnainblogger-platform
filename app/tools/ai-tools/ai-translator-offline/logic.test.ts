/**
 * logic.test.ts — AI Translator (offline) (tool-511).
 *
 * node:test suite. Run: node --test app/tools/ai-tools/ai-translator-offline/logic.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateInputs,
  getModelConfig,
  getDisclosures,
  getPair,
  chunkText,
  LANG_PAIRS,
  MAX_TEXT_CHARS,
  CHUNK_CHARS,
} from './logic.ts';

test('ships exactly the 18 verified pairs', () => {
  assert.equal(LANG_PAIRS.length, 18);
});

test('all pair model ids follow the verified Xenova opus-mt pattern', () => {
  for (const p of LANG_PAIRS) {
    assert.match(p.modelId, /^Xenova\/opus-mt-[a-z]{2}-[a-z]{2}$/, p.id);
    assert.equal(p.id, p.fromCode + '-' + p.toCode);
  }
});

test('covers the 9 verified language families both directions', () => {
  const langs = new Set<string>();
  for (const p of LANG_PAIRS) {
    langs.add(p.fromCode === 'en' ? p.toCode : p.fromCode);
  }
  assert.deepEqual([...langs].sort(), ['ar', 'de', 'es', 'fr', 'hi', 'it', 'nl', 'ru', 'zh']);
});

test('does not ship unverified pairs (pt, ur)', () => {
  for (const p of LANG_PAIRS) {
    assert.ok(!['pt', 'ur'].includes(p.fromCode), p.id);
    assert.ok(!['pt', 'ur'].includes(p.toCode), p.id);
  }
});

test('getPair resolves by id and nulls unknown ids', () => {
  assert.equal(getPair('en-es')?.modelId, 'Xenova/opus-mt-en-es');
  assert.equal(getPair('zh-en')?.modelId, 'Xenova/opus-mt-zh-en');
  assert.equal(getPair('en-pt'), null);
  assert.equal(getPair(''), null);
  assert.equal(getPair(undefined), null);
});

test('accepts valid text + pair', () => {
  assert.equal(validateInputs({ text: 'Hello world.', pair: 'en-es' }).ok, true);
});

test('rejects empty or whitespace-only text', () => {
  for (const text of ['', '   ', '\n\t ']) {
    const r = validateInputs({ text, pair: 'en-es' });
    assert.equal(r.ok, false);
    assert.match(r.errors.join(' '), /Enter some text/i);
  }
});

test('rejects text over the cap', () => {
  const r = validateInputs({ text: 'x'.repeat(MAX_TEXT_CHARS + 1), pair: 'en-es' });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /characters/);
});

test('accepts text at exactly the cap', () => {
  assert.equal(validateInputs({ text: 'x'.repeat(MAX_TEXT_CHARS), pair: 'en-es' }).ok, true);
});

test('rejects an invalid pair', () => {
  const r = validateInputs({ text: 'Hello.', pair: 'en-pt' });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /language pair/i);
});

test('chunkText returns [] for blank input', () => {
  assert.deepEqual(chunkText('', CHUNK_CHARS), []);
  assert.deepEqual(chunkText('   ', CHUNK_CHARS), []);
});

test('chunkText keeps short text as one chunk', () => {
  const c = chunkText('Hello world. How are you?', CHUNK_CHARS);
  assert.deepEqual(c, ['Hello world. How are you?']);
});

test('chunkText respects the max size and keeps sentence order', () => {
  const text = Array.from({ length: 20 }, (_, i) => 'Sentence number ' + (i + 1) + ' is here.').join(' ');
  const chunks = chunkText(text, 60);
  assert.ok(chunks.length > 1);
  for (const c of chunks) assert.ok(c.length <= 60, c);
  assert.equal(chunks.join(' '), text.replace(/\s+/g, ' ').trim());
});

test('chunkText hard-cuts a single long token', () => {
  const token = 'a'.repeat(130);
  const chunks = chunkText(token, 50);
  assert.ok(chunks.every((c) => c.length <= 50));
  assert.equal(chunks.join(''), token);
});

test('getModelConfig returns the default en-es pair with verified identity', () => {
  const cfg = getModelConfig();
  assert.equal(cfg.task, 'translation');
  assert.equal(cfg.modelId, 'Xenova/opus-mt-en-es');
  assert.match(cfg.license, /CC-BY/);
});

test('getDisclosures covers downloads, quality and privacy', () => {
  const d = getDisclosures();
  assert.ok(d.length >= 3);
  assert.match(d.join(' ').toLowerCase(), /machine-quality/);
  assert.match(d.join(' ').toLowerCase(), /never leaves your browser/);
});
