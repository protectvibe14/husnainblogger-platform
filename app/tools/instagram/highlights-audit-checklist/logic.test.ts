import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runTool } from './logic.ts';

const IDS = [
  'hl-start-here', 'hl-testimonials', 'hl-offers', 'hl-faq', 'hl-covers',
  'hl-names', 'hl-content', 'hl-fresh', 'hl-count', 'hl-no-broken',
];

function allAnswers(answer: string): Record<string, unknown> {
  const v: Record<string, unknown> = {};
  for (const id of IDS) v[id] = answer;
  return v;
}

test('all Yes → 100, no missing elements', () => {
  const r = runTool(allAnswers('Yes'));
  assert.equal(r.ok, true);
  assert.equal(r.values!['score'], 100);
  assert.deepEqual(r.values!['missingElements'], []);
});

test('all No → 0, all 10 elements missing', () => {
  const r = runTool(allAnswers('No'));
  assert.equal(r.ok, true);
  assert.equal(r.values!['score'], 0);
  assert.equal((r.values!['missingElements'] as string[]).length, 10);
});

test('partial score math: one No on w2 → 24/28 = 86', () => {
  const v = allAnswers('Yes');
  v['hl-start-here'] = 'No'; // w2: earned 24 of 28
  const r = runTool(v);
  assert.equal(r.ok, true);
  assert.equal(r.values!['score'], 86);
});

test('N/A excluded from denominator, noted in fixList', () => {
  const v = allAnswers('Yes');
  v['hl-faq'] = 'N/A'; // w1: possible 26, earned 26 → 100
  const r = runTool(v);
  assert.equal(r.ok, true);
  assert.equal(r.values!['score'], 100);
  const fixes = r.values!['fixList'] as string[];
  assert.ok(fixes.some((f) => f.includes('1 item marked N/A')));
});

test('all N/A → error, not a score', () => {
  const r = runTool(allAnswers('N/A'));
  assert.equal(r.ok, false);
  assert.match(r.error!, /every item/i);
});

test('determinism: same answers → identical result', () => {
  const v = { ...allAnswers('Yes'), 'hl-covers': 'No' };
  assert.deepEqual(runTool(v), runTool(v));
});

test('missing answer → validation error naming the question', () => {
  const v = allAnswers('Yes');
  delete v['hl-offers'];
  const r = runTool(v);
  assert.equal(r.ok, false);
  assert.match(r.error!, /offers/i);
});

test('invalid answer value → validation error', () => {
  const v = allAnswers('Yes');
  v['hl-names'] = 'Maybe';
  const r = runTool(v);
  assert.equal(r.ok, false);
  assert.match(r.error!, /Invalid answer/);
});

test('"Partially" is NOT a valid answer for this tool', () => {
  const v = allAnswers('Yes');
  v['hl-names'] = 'Partially';
  const r = runTool(v);
  assert.equal(r.ok, false, 'only Yes/No/N/A are allowed');
});

test('missingElements names the absent element', () => {
  const v = allAnswers('Yes');
  v['hl-testimonials'] = 'No';
  const missing = runTool(v).values!['missingElements'] as string[];
  assert.deepEqual(missing, ['Testimonials / reviews highlight']);
});

test('fixList ordered by weight: w2 fixes before w1', () => {
  const v = allAnswers('Yes');
  v['hl-names'] = 'No'; // w1
  v['hl-offers'] = 'No'; // w2
  const fixes = runTool(v).values!['fixList'] as string[];
  const w2idx = fixes.findIndex((f) => f.includes('what you sell'));
  const w1idx = fixes.findIndex((f) => f.includes('plain words'));
  assert.ok(w2idx !== -1 && w1idx !== -1 && w2idx < w1idx);
});

test('perfect audit returns a maintenance note in fixList', () => {
  const fixes = runTool(allAnswers('Yes')).values!['fixList'] as string[];
  assert.ok(fixes.length >= 1);
  assert.ok(fixes[0].includes('review them quarterly'));
});

test('case-insensitive answers accepted ("yes", "n/a")', () => {
  const v = allAnswers('yes');
  v['hl-count'] = 'n/a';
  const r = runTool(v);
  assert.equal(r.ok, true);
  assert.equal(r.values!['score'], 100);
});

test('score is an integer 0-100', () => {
  const v = allAnswers('Yes');
  v['hl-content'] = 'No'; // w1: 26/28 = 92.86 → 93
  const score = runTool(v).values!['score'] as number;
  assert.equal(score, 93);
  assert.ok(Number.isInteger(score) && score >= 0 && score <= 100);
});

test('fix tips are concrete (mention a specific action)', () => {
  const fixes = runTool(allAnswers('No')).values!['fixList'] as string[];
  assert.equal(fixes.length, 10);
  for (const tip of fixes) {
    assert.ok(tip.length > 30, 'tips must be actionable, not one-liners');
  }
});

test('output ids are score, missingElements, fixList', () => {
  const v = runTool(allAnswers('Yes')).values!;
  assert.deepEqual(Object.keys(v).sort(), ['fixList', 'missingElements', 'score']);
});

test('every missing criterion id errors when omitted', () => {
  for (const id of IDS) {
    const v = allAnswers('Yes');
    delete v[id];
    assert.equal(runTool(v).ok, false, 'missing id should error: ' + id);
  }
});
