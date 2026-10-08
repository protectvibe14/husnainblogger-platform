import { test } from 'node:test';
import assert from 'node:assert';
import { runTool } from './logic.ts';

const GOALS = ['poll', 'qanda', 'behind-scenes', 'promo'];

test('happy path: poll goal returns 8 ideas', () => {
  const res = runTool({ goal: 'poll' });
  assert.equal(res.ok, true);
  const table = res.values?.storyIdeas as { columns: string[]; rows: string[][] };
  assert.equal(table.rows.length, 8);
});

test('all four goals return 8 ideas each', () => {
  for (const goal of GOALS) {
    const res = runTool({ goal });
    assert.equal(res.ok, true, goal);
    assert.equal((res.values?.storyIdeas as { columns: string[]; rows: string[][] }).rows.length, 8, goal);
  }
});

test('every idea has 3–5 frames and a sticker suggestion', () => {
  for (const goal of GOALS) {
    const res = runTool({ goal });
    const table = res.values?.storyIdeas as { columns: string[]; rows: string[][] };
    for (const row of table.rows) {
      assert.equal(row.length, 3, goal);
      assert.ok(row[0].trim().length > 0, 'concept non-empty');
      const frameCount = (row[1].match(/\d+\.\s/g) || []).length;
      assert.ok(frameCount >= 3 && frameCount <= 5, `goal ${goal}: ${frameCount} frames`);
      assert.ok(row[2].trim().length > 0, 'sticker non-empty');
    }
  }
});

test('poll ideas suggest the poll sticker', () => {
  const res = runTool({ goal: 'poll' });
  const table = res.values?.storyIdeas as { columns: string[]; rows: string[][] };
  assert.ok(table.rows.every((r) => r[2].toLowerCase().includes('poll')));
});

test('promo ideas suggest the link sticker', () => {
  const res = runTool({ goal: 'promo' });
  const table = res.values?.storyIdeas as { columns: string[]; rows: string[][] };
  assert.ok(table.rows.every((r) => r[2].toLowerCase().includes('link')));
});

test('qanda ideas suggest the question sticker', () => {
  const res = runTool({ goal: 'qanda' });
  const table = res.values?.storyIdeas as { columns: string[]; rows: string[][] };
  assert.ok(table.rows.every((r) => r[2].toLowerCase().includes('question')));
});

test('table columns are concept / frames / sticker', () => {
  const res = runTool({ goal: 'behind-scenes' });
  const table = res.values?.storyIdeas as { columns: string[]; rows: string[][] };
  assert.deepEqual(table.columns, ['Story concept', 'Frames (3–5 each)', 'Sticker suggestion']);
});

test('canvas note mentions 1080x1920', () => {
  const res = runTool({ goal: 'poll' });
  assert.ok(String(res.values?.canvasNote).includes('1080x1920'));
});

test('output ids match meta.ts outputs (storyIdeas, canvasNote)', () => {
  const res = runTool({ goal: 'promo' });
  assert.equal(res.ok, true);
  assert.deepEqual(Object.keys(res.values ?? {}).sort(), ['canvasNote', 'storyIdeas']);
});

test('concepts are unique within a goal', () => {
  for (const goal of GOALS) {
    const res = runTool({ goal });
    const table = res.values?.storyIdeas as { columns: string[]; rows: string[][] };
    const concepts = table.rows.map((r) => r[0]);
    assert.equal(new Set(concepts).size, 8, goal);
  }
});

test('validation error: missing goal', () => {
  const res = runTool({});
  assert.equal(res.ok, false);
  assert.ok(typeof res.error === 'string' && res.error.length > 0);
});

test('validation error: blank goal', () => {
  const res = runTool({ goal: '  ' });
  assert.equal(res.ok, false);
});

test('validation error: unknown goal', () => {
  const res = runTool({ goal: 'quiz' });
  assert.equal(res.ok, false);
  assert.ok(String(res.error).toLowerCase().includes('poll'));
});

test('validation error: goal with wrong case is rejected', () => {
  const res = runTool({ goal: 'Poll' });
  assert.equal(res.ok, false);
});

test('deterministic: same goal twice gives identical output', () => {
  const a = runTool({ goal: 'qanda' });
  const b = runTool({ goal: 'qanda' });
  assert.deepEqual(a, b);
});

test('error responses carry no values', () => {
  const res = runTool({ goal: 'nope' });
  assert.equal(res.ok, false);
  assert.equal(res.values, undefined);
});
