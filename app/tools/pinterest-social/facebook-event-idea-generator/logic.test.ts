import { test } from 'node:test';
import assert from 'node:assert';
import { runTool } from './logic.ts';

test('happy path: returns 8 event ideas', () => {
  const res = runTool({ businessType: 'coffee shop' });
  assert.equal(res.ok, true);
  const table = res.values?.eventIdeas as { columns: string[]; rows: string[][] };
  assert.equal(table.rows.length, 8);
});

test('table columns are title / format / description seed / cover note', () => {
  const res = runTool({ businessType: 'coffee shop' });
  const table = res.values?.eventIdeas as { columns: string[]; rows: string[][] };
  assert.deepEqual(table.columns, ['Event title', 'Format', 'Description seed', 'Cover note']);
});

test('event titles embed the business type', () => {
  const res = runTool({ businessType: 'coffee shop' });
  const table = res.values?.eventIdeas as { columns: string[]; rows: string[][] };
  assert.ok(table.rows.every((r) => r[0].toLowerCase().includes('coffee shop')));
});

test('formats alternate online / in-person', () => {
  const res = runTool({ businessType: 'bakery' });
  const table = res.values?.eventIdeas as { columns: string[]; rows: string[][] };
  const formats = table.rows.map((r) => r[1]);
  assert.ok(formats.includes('Online'));
  assert.ok(formats.includes('In-person'));
  assert.ok(formats.every((f) => f === 'Online' || f === 'In-person'));
});

test('no template placeholder leaks', () => {
  const res = runTool({ businessType: 'gym' });
  const table = res.values?.eventIdeas as { columns: string[]; rows: string[][] };
  for (const row of table.rows) {
    assert.ok(!row[0].includes('{business}'));
    assert.ok(row[0].trim().length > 0);
    assert.ok(row[2].trim().length > 0);
  }
});

test('description seeds are concise (<= 200 chars)', () => {
  const res = runTool({ businessType: 'pet grooming' });
  const table = res.values?.eventIdeas as { columns: string[]; rows: string[][] };
  for (const row of table.rows) {
    assert.ok(row[2].length <= 200, `seed too long: ${row[2].length}`);
  }
});

test('cover note flags the conflicting size sources honestly', () => {
  const res = runTool({ businessType: 'salon' });
  const table = res.values?.eventIdeas as { columns: string[]; rows: string[][] };
  assert.ok(table.rows[0][3].toLowerCase().includes('disputed'));
  assert.ok(table.rows[0][3].includes('1920x1005'));
});

test('coverGuidance output matches the per-row cover note', () => {
  const res = runTool({ businessType: 'salon' });
  assert.equal(res.ok, true);
  assert.equal(String(res.values?.coverGuidance), (res.values?.eventIdeas as { rows: string[][] }).rows[0][3]);
});

test('output ids match meta.ts outputs (eventIdeas, coverGuidance)', () => {
  const res = runTool({ businessType: 'salon' });
  assert.equal(res.ok, true);
  assert.deepEqual(Object.keys(res.values ?? {}).sort(), ['coverGuidance', 'eventIdeas']);
});

test('titles are unique across the 8 ideas', () => {
  const res = runTool({ businessType: 'salon' });
  const table = res.values?.eventIdeas as { columns: string[]; rows: string[][] };
  assert.equal(new Set(table.rows.map((r) => r[0])).size, 8);
});

test('long business type is truncated to 5 words', () => {
  const res = runTool({ businessType: 'small family owned organic bakery downtown' });
  assert.equal(res.ok, true);
  const table = res.values?.eventIdeas as { columns: string[]; rows: string[][] };
  assert.ok(table.rows[0][0].toLowerCase().includes('small family owned organic bakery'));
});

test('validation error: missing businessType', () => {
  const res = runTool({});
  assert.equal(res.ok, false);
  assert.ok(typeof res.error === 'string' && res.error.length > 0);
});

test('validation error: blank businessType', () => {
  const res = runTool({ businessType: '   ' });
  assert.equal(res.ok, false);
});

test('validation error: businessType over 60 chars', () => {
  const res = runTool({ businessType: 'x'.repeat(61) });
  assert.equal(res.ok, false);
  assert.ok(typeof res.error === 'string' && res.error.length > 0);
});

test('deterministic: same inputs give identical outputs', () => {
  const a = runTool({ businessType: 'coffee shop' });
  const b = runTool({ businessType: 'coffee shop' });
  assert.deepEqual(a, b);
});

test('error responses carry no values', () => {
  const res = runTool({ businessType: '' });
  assert.equal(res.ok, false);
  assert.equal(res.values, undefined);
});
