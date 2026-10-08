import { test } from 'node:test';
import assert from 'node:assert';
import { runTool } from './logic.ts';

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter((p) => p.length > 0).length;
}

test('happy path: returns requested number of hooks for a topic', () => {
  const res = runTool({ topic: 'budget skincare', count: 5 });
  assert.equal(res.ok, true);
  assert.ok(Array.isArray(res.values?.hooks));
  assert.equal((res.values?.hooks as string[]).length, 5);
});

test('default count is 5 when omitted', () => {
  const res = runTool({ topic: 'sourdough baking' });
  assert.equal(res.ok, true);
  assert.equal((res.values?.hooks as string[]).length, 5);
});

test('hooks embed the topic', () => {
  const res = runTool({ topic: 'meal prep', count: 5 });
  assert.equal(res.ok, true);
  const hooks = res.values?.hooks as string[];
  assert.ok(hooks.some((h) => h.toLowerCase().includes('meal prep')));
});

test('every hook is 15 words or fewer', () => {
  const res = runTool({ topic: 'budget skincare for beginners', count: 10 });
  assert.equal(res.ok, true);
  for (const h of res.values?.hooks as string[]) {
    assert.ok(wordCount(h) <= 15, `over 15 words: "${h}"`);
  }
});

test('long topic is truncated so hooks stay within 15 words', () => {
  const res = runTool({
    topic: 'grow organic tomatoes on a tiny balcony garden',
    count: 10,
  });
  assert.equal(res.ok, true);
  for (const h of res.values?.hooks as string[]) {
    assert.ok(wordCount(h) <= 15, `over 15 words: "${h}"`);
  }
});

test('framing note mentions 9:16 vertical', () => {
  const res = runTool({ topic: 'yoga', count: 3 });
  assert.equal(res.ok, true);
  assert.ok(String(res.values?.framingNote).includes('9:16'));
});

test('output ids match meta.ts outputs (hooks, framingNote)', () => {
  const res = runTool({ topic: 'yoga', count: 3 });
  assert.equal(res.ok, true);
  assert.deepEqual(Object.keys(res.values ?? {}).sort(), ['framingNote', 'hooks']);
});

test('no hook is empty and no template placeholder leaks', () => {
  const res = runTool({ topic: 'crochet', count: 10 });
  assert.equal(res.ok, true);
  for (const h of res.values?.hooks as string[]) {
    assert.ok(h.trim().length > 0);
    assert.ok(!h.includes('{topic}'));
  }
});

test('validation error: missing topic', () => {
  const res = runTool({ count: 5 });
  assert.equal(res.ok, false);
  assert.ok(typeof res.error === 'string' && res.error.length > 0);
});

test('validation error: blank topic', () => {
  const res = runTool({ topic: '   ', count: 5 });
  assert.equal(res.ok, false);
  assert.ok(typeof res.error === 'string' && res.error.length > 0);
});

test('validation error: topic longer than 60 chars', () => {
  const res = runTool({ topic: 'x'.repeat(61), count: 5 });
  assert.equal(res.ok, false);
  assert.ok(typeof res.error === 'string' && res.error.length > 0);
});

test('validation error: count 0', () => {
  const res = runTool({ topic: 'yoga', count: 0 });
  assert.equal(res.ok, false);
});

test('validation error: count 11', () => {
  const res = runTool({ topic: 'yoga', count: 11 });
  assert.equal(res.ok, false);
});

test('validation error: non-integer count', () => {
  const res = runTool({ topic: 'yoga', count: 2.5 });
  assert.equal(res.ok, false);
});

test('validation error: non-numeric count string', () => {
  const res = runTool({ topic: 'yoga', count: 'abc' });
  assert.equal(res.ok, false);
});

test('count 1 returns exactly one hook', () => {
  const res = runTool({ topic: 'yoga', count: 1 });
  assert.equal(res.ok, true);
  assert.equal((res.values?.hooks as string[]).length, 1);
});

test('count 10 returns ten unique hooks', () => {
  const res = runTool({ topic: 'yoga', count: 10 });
  assert.equal(res.ok, true);
  const hooks = res.values?.hooks as string[];
  assert.equal(hooks.length, 10);
  assert.equal(new Set(hooks).size, 10);
});

test('deterministic: same inputs give identical outputs', () => {
  const a = runTool({ topic: 'budget skincare', count: 7 });
  const b = runTool({ topic: 'budget skincare', count: 7 });
  assert.deepEqual(a, b);
});

test('deterministic across case-insensitive same topic is not required; same string is stable', () => {
  const a = runTool({ topic: 'Meal Prep', count: 4 });
  const b = runTool({ topic: 'Meal Prep', count: 4 });
  assert.deepEqual(a.values, b.values);
});

test('error responses carry no values', () => {
  const res = runTool({ topic: '', count: 5 });
  assert.equal(res.ok, false);
  assert.equal(res.values, undefined);
});
