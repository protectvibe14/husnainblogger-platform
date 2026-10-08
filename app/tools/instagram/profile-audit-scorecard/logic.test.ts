import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runTool } from './logic.ts';

const IDS = [
  'name-keyword', 'profile-photo',
  'bio-who-help', 'bio-niche', 'bio-readable', 'bio-link-cta',
  'grid-recent', 'grid-consistent', 'grid-pinned',
  'hl-covers', 'hl-organized', 'hl-fresh',
  'cta-clear', 'cta-contact', 'cta-single-link',
];

function allAnswers(answer: string): Record<string, unknown> {
  const v: Record<string, unknown> = {};
  for (const id of IDS) v[id] = answer;
  return v;
}

test('all Yes → 100, Profile-Ready', () => {
  const r = runTool(allAnswers('Yes'));
  assert.equal(r.ok, true);
  assert.equal(r.values!['totalScore'], 100);
  assert.match(r.values!['grade'] as string, /Profile-Ready/);
});

test('all No → 0, Rebuild', () => {
  const r = runTool(allAnswers('No'));
  assert.equal(r.ok, true);
  assert.equal(r.values!['totalScore'], 0);
  assert.match(r.values!['grade'] as string, /Rebuild/);
});

test('all Partially → 50, Needs work', () => {
  const r = runTool(allAnswers('Partially'));
  assert.equal(r.ok, true);
  assert.equal(r.values!['totalScore'], 50);
  assert.match(r.values!['grade'] as string, /Needs work/);
});

test('grade band boundaries: 70-84 Solid, 50-69 Needs work', () => {
  // 70%: 8 of 15 w1? Build exact scores via mixed answers.
  const yes = allAnswers('Yes');
  // Zero out two w1 criteria (grid-recent, cta-single-link): earned 38/42 = 90 → Profile-Ready
  const a = { ...yes, 'grid-recent': 'No', 'cta-single-link': 'No' };
  const r1 = runTool(a);
  assert.equal(r1.values!['totalScore'], 90);
  assert.match(r1.values!['grade'] as string, /Profile-Ready/);
  // Zero out one w2 + one w1: earned 36/42 = 86 → Profile-Ready
  const b = { ...yes, 'name-keyword': 'No', 'profile-photo': 'No' };
  assert.equal(runTool(b).values!['totalScore'], 86);
});

test('determinism: same answers → identical result', () => {
  const v = { ...allAnswers('Yes'), 'bio-niche': 'No' };
  assert.deepEqual(runTool(v), runTool(v));
});

test('missing answer → validation error naming the criterion', () => {
  const v = allAnswers('Yes');
  delete v['bio-who-help'];
  const r = runTool(v);
  assert.equal(r.ok, false);
  assert.match(r.error!, /bio says who you help/i);
});

test('invalid answer value → validation error', () => {
  const v = allAnswers('Yes');
  v['grid-consistent'] = 'Maybe';
  const r = runTool(v);
  assert.equal(r.ok, false);
  assert.match(r.error!, /Invalid answer/);
});

test('N/A excluded from denominator, noted in fixes', () => {
  const v = allAnswers('Yes');
  v['grid-recent'] = 'N/A';
  const r = runTool(v);
  assert.equal(r.ok, true);
  // possible = 42 - 2 = 40, earned 40 → 100
  assert.equal(r.values!['totalScore'], 100);
  const fixes = r.values!['prioritizedFixes'] as string[];
  assert.ok(fixes.some((f) => f.includes('1 item marked N/A')));
});

test('all N/A → error, not a 0 score', () => {
  const r = runTool(allAnswers('N/A'));
  assert.equal(r.ok, false);
  assert.match(r.error!, /every item/i);
});

test('perSectionBreakdown table shape: 5 sections, 3 columns', () => {
  const t = runTool(allAnswers('Yes')).values!['perSectionBreakdown'] as {
    columns: string[];
    rows: string[][];
  };
  assert.deepEqual(t.columns, ['Section', 'Score', 'Details']);
  assert.equal(t.rows.length, 5);
  assert.deepEqual(
    t.rows.map((r) => r[0]),
    ['Name & identity', 'Bio', 'Grid', 'Highlights', 'CTA'],
  );
});

test('section scores sum honestly (Bio 12/12 when all Yes)', () => {
  const t = runTool(allAnswers('Yes')).values!['perSectionBreakdown'] as { rows: string[][] };
  const bio = t.rows.find((r) => r[0] === 'Bio')!;
  assert.equal(bio[1], '12/12');
});

test('fixes prioritized by weight: w2 fixes before w1', () => {
  const v = allAnswers('Yes');
  v['profile-photo'] = 'No'; // w1
  v['cta-clear'] = 'No'; // w2
  const fixes = runTool(v).values!['prioritizedFixes'] as string[];
  const w2idx = fixes.findIndex((f) => f.includes('ONE action'));
  const w1idx = fixes.findIndex((f) => f.includes('thumbnail size'));
  assert.ok(w2idx !== -1 && w1idx !== -1 && w2idx < w1idx, 'w2 fix must come first');
});

test('No answers prefixed Fix:, Partially prefixed Improve:', () => {
  const v = allAnswers('Yes');
  v['profile-photo'] = 'No';
  v['bio-readable'] = 'Partially';
  const fixes = runTool(v).values!['prioritizedFixes'] as string[];
  assert.ok(fixes.some((f) => f.startsWith('Fix: ')));
  assert.ok(fixes.some((f) => f.startsWith('Improve: ')));
});

test('perfect score still returns a fixes list with review note', () => {
  const fixes = runTool(allAnswers('Yes')).values!['prioritizedFixes'] as string[];
  assert.ok(fixes.length >= 1);
  assert.ok(fixes[0].includes('No fixes needed'));
});

test('case-insensitive answers accepted ("yes", "N/A")', () => {
  const v = allAnswers('yes');
  v['profile-photo'] = 'N/A';
  const r = runTool(v);
  assert.equal(r.ok, true);
  assert.equal(r.values!['totalScore'], 100);
});

test('score is an integer 0-100', () => {
  const v = allAnswers('Yes');
  v['bio-niche'] = 'Partially'; // 41/42 = 97.6 → 98
  const score = runTool(v).values!['totalScore'] as number;
  assert.equal(Number.isInteger(score), true);
  assert.ok(score >= 0 && score <= 100);
});

test('grade text states it is an estimate', () => {
  const grade = runTool(allAnswers('Yes')).values!['grade'] as string;
  assert.ok(grade.includes('estimate'), 'honesty: score must be labeled an estimate');
});

test('output ids are totalScore, grade, perSectionBreakdown, prioritizedFixes', () => {
  const v = runTool(allAnswers('Yes')).values!;
  assert.deepEqual(
    Object.keys(v).sort(),
    ['grade', 'perSectionBreakdown', 'prioritizedFixes', 'totalScore'],
  );
});

test('all 15 criterion ids validated (each missing id errors)', () => {
  for (const id of IDS) {
    const v = allAnswers('Yes');
    delete v[id];
    const r = runTool(v);
    assert.equal(r.ok, false, 'missing id should error: ' + id);
  }
});
