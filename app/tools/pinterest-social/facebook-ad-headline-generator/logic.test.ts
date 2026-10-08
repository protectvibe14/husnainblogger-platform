import { test } from 'node:test';
import assert from 'node:assert';
import { runTool } from './logic.ts';

test('happy path: returns 10 headlines', () => {
  const res = runTool({ product: 'Glow Serum', benefit: 'clearer skin' });
  assert.equal(res.ok, true);
  assert.equal((res.values?.headlines as string[]).length, 10);
});

test('STRICT: every headline is <= 40 chars', () => {
  const res = runTool({ product: 'Glow Serum', benefit: 'clearer skin' });
  assert.equal(res.ok, true);
  for (const h of res.values?.headlines as string[]) {
    assert.ok(h.length <= 40, `over 40 chars: "${h}" (${h.length})`);
  }
});

test('STRICT: 40-char cap holds with long inputs', () => {
  const res = runTool({
    product: 'Ultra Premium Organic Vitamin C Brightening Face Serum Extra',
    benefit: 'visibly brighter and more even looking skin tone every day',
  });
  assert.equal(res.ok, true);
  for (const h of res.values?.headlines as string[]) {
    assert.ok(h.length <= 40, `over 40 chars: "${h}" (${h.length})`);
  }
});

test('headlines are benefit-led (benefit words appear)', () => {
  const res = runTool({ product: 'Glow Serum', benefit: 'clearer skin' });
  assert.equal(res.ok, true);
  const headlines = res.values?.headlines as string[];
  assert.ok(headlines.some((h) => h.toLowerCase().includes('clearer skin')));
});

test('headlines embed the product name', () => {
  const res = runTool({ product: 'Glow Serum', benefit: 'clearer skin' });
  assert.equal(res.ok, true);
  const headlines = res.values?.headlines as string[];
  assert.ok(headlines.some((h) => h.includes('Glow Serum')));
});

test('no filler openers like "Introducing"', () => {
  const res = runTool({ product: 'Glow Serum', benefit: 'clearer skin' });
  assert.equal(res.ok, true);
  for (const h of res.values?.headlines as string[]) {
    assert.ok(!/^introducing/i.test(h), `filler opener: "${h}"`);
  }
});

test('no headline is empty or placeholder-leaking', () => {
  const res = runTool({ product: 'Glow Serum', benefit: 'clearer skin' });
  assert.equal(res.ok, true);
  for (const h of res.values?.headlines as string[]) {
    assert.ok(h.trim().length > 0);
    assert.ok(!h.includes('{product}') && !h.includes('{benefit}'));
  }
});

test('headlines are unique', () => {
  const res = runTool({ product: 'Glow Serum', benefit: 'clearer skin' });
  assert.equal(res.ok, true);
  const headlines = res.values?.headlines as string[];
  assert.equal(new Set(headlines).size, headlines.length);
});

test('output ids match meta.ts outputs (headlines)', () => {
  const res = runTool({ product: 'Glow Serum', benefit: 'clearer skin' });
  assert.equal(res.ok, true);
  assert.deepEqual(Object.keys(res.values ?? {}), ['headlines']);
});

test('validation error: missing product', () => {
  const res = runTool({ benefit: 'clearer skin' });
  assert.equal(res.ok, false);
  assert.ok(typeof res.error === 'string' && res.error.length > 0);
});

test('validation error: blank product', () => {
  const res = runTool({ product: '  ', benefit: 'clearer skin' });
  assert.equal(res.ok, false);
});

test('validation error: product over 60 chars', () => {
  const res = runTool({ product: 'x'.repeat(61), benefit: 'clearer skin' });
  assert.equal(res.ok, false);
});

test('validation error: missing benefit', () => {
  const res = runTool({ product: 'Glow Serum' });
  assert.equal(res.ok, false);
  assert.ok(typeof res.error === 'string' && res.error.length > 0);
});

test('validation error: blank benefit', () => {
  const res = runTool({ product: 'Glow Serum', benefit: '   ' });
  assert.equal(res.ok, false);
});

test('validation error: benefit over 80 chars', () => {
  const res = runTool({ product: 'Glow Serum', benefit: 'x'.repeat(81) });
  assert.equal(res.ok, false);
});

test('deterministic: same inputs give identical outputs', () => {
  const a = runTool({ product: 'Glow Serum', benefit: 'clearer skin' });
  const b = runTool({ product: 'Glow Serum', benefit: 'clearer skin' });
  assert.deepEqual(a, b);
});

test('different benefits rotate headline order', () => {
  const a = runTool({ product: 'Glow Serum', benefit: 'clearer skin' });
  const b = runTool({ product: 'Glow Serum', benefit: 'fewer wrinkles' });
  assert.notDeepEqual(a.values, b.values);
});

test('error responses carry no values', () => {
  const res = runTool({ product: '', benefit: 'clearer skin' });
  assert.equal(res.ok, false);
  assert.equal(res.values, undefined);
});
