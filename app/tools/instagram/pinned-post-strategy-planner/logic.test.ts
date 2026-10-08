import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runTool } from './logic.ts';

const GOALS = [
  'Get more followers',
  'Drive sales',
  'Book more clients',
  'Build authority',
  'Promote a launch',
];

test('Get more followers → 3 slots + rationale', () => {
  const r = runTool({ goal: 'Get more followers', offers: '' });
  assert.equal(r.ok, true);
  const plan = r.values!['pinnedPlan'] as string[];
  assert.equal(plan.length, 4);
  assert.ok(plan[0].startsWith('Slot 1 —'));
  assert.ok(plan[3].startsWith('Why this works:'));
});

test('Drive sales → sales-specific slots', () => {
  const plan = (runTool({ goal: 'Drive sales' }).values!['pinnedPlan'] as string[]).join(' ');
  assert.ok(plan.includes('Offer intro'));
  assert.ok(plan.includes('Proof'));
});

test('Book more clients → client-specific slots', () => {
  const plan = (runTool({ goal: 'Book more clients' }).values!['pinnedPlan'] as string[]).join(' ');
  assert.ok(plan.includes('Who-I-help'));
  assert.ok(plan.includes('testimonial'));
});

test('Build authority → authority-specific slots', () => {
  const plan = (runTool({ goal: 'Build authority' }).values!['pinnedPlan'] as string[]).join(' ');
  assert.ok(plan.includes('Flagship framework'));
  assert.ok(plan.includes('Contrarian'));
});

test('Promote a launch → launch-specific slots', () => {
  const plan = (runTool({ goal: 'Promote a launch' }).values!['pinnedPlan'] as string[]).join(' ');
  assert.ok(plan.includes('Launch announcement'));
  assert.ok(plan.includes('urgency'));
});

test('missing goal → validation error', () => {
  const r = runTool({ goal: '' });
  assert.equal(r.ok, false);
  assert.match(r.error!, /goal/i);
});

test('whitespace goal → validation error', () => {
  assert.equal(runTool({ goal: '   ' }).ok, false);
});

test('invalid goal → validation error listing options', () => {
  const r = runTool({ goal: 'World domination' });
  assert.equal(r.ok, false);
  assert.ok(r.error!.includes('Get more followers'));
});

test('first offer folded into slot 3', () => {
  const r = runTool({ goal: 'Drive sales', offers: '1:1 coaching program' });
  assert.equal(r.ok, true);
  const plan = r.values!['pinnedPlan'] as string[];
  assert.ok(plan[2].includes('1:1 coaching program'), 'slot 3 must mention the offer');
});

test('multi-line offers: only the first is folded in', () => {
  const r = runTool({ goal: 'Book more clients', offers: 'Brand audit\nContent retainer\n  \nVIP day' });
  const plan = r.values!['pinnedPlan'] as string[];
  assert.ok(plan[2].includes('Brand audit'));
  assert.ok(!plan[2].includes('VIP day'), 'later offers stay out of slot 3');
  assert.ok((r.values!['copyAll'] as string).includes('VIP day'), 'copyAll lists all offers');
});

test('empty offers → generic slot 3', () => {
  const r = runTool({ goal: 'Promote a launch', offers: '   ' });
  assert.equal(r.ok, true);
  assert.ok(!(r.values!['pinnedPlan'] as string[])[2].includes('Feature "'));
});

test('non-string offers treated as empty', () => {
  const r = runTool({ goal: 'Build authority', offers: 123 });
  assert.equal(r.ok, true);
});

test('determinism: same inputs → identical plan', () => {
  const v = { goal: 'Get more followers', offers: 'Newsletter' };
  assert.deepEqual(runTool(v), runTool(v));
});

test('each slot has purpose + numbered ideas', () => {
  for (const goal of GOALS) {
    const plan = runTool({ goal }).values!['pinnedPlan'] as string[];
    for (let s = 0; s < 3; s++) {
      assert.ok(plan[s].includes('Purpose:'), goal + ' slot ' + (s + 1));
      assert.ok(plan[s].includes('1. '), goal + ' slot ' + (s + 1) + ' must have numbered ideas');
    }
  }
});

test('copyAll contains goal, all slots, rationale, and no-API honesty note', () => {
  const r = runTool({ goal: 'Drive sales', offers: 'Ebook' });
  const copy = r.values!['copyAll'] as string;
  assert.ok(copy.includes('Drive sales'));
  assert.ok(copy.includes('Slot 1') && copy.includes('Slot 2') && copy.includes('Slot 3'));
  assert.ok(copy.includes('Why this works:'));
  assert.ok(copy.includes('cannot pin posts for you'), 'must be honest about no API pinning');
});

test('no unfilled placeholders anywhere', () => {
  for (const goal of GOALS) {
    const text = ((runTool({ goal, offers: 'My offer' }).values!['pinnedPlan'] as string[]).join(' ') + (runTool({ goal }).values!['copyAll'] as string));
    assert.ok(!text.includes('{') || text.includes('{who}'), 'unexpected placeholder in ' + goal);
  }
});

test('output ids are pinnedPlan, copyAll', () => {
  const v = runTool({ goal: 'Build authority' }).values!;
  assert.deepEqual(Object.keys(v).sort(), ['copyAll', 'pinnedPlan']);
});

test('different goals produce different plans', () => {
  const plans = new Set(GOALS.map((g) => JSON.stringify(runTool({ goal: g }).values!['pinnedPlan'])));
  assert.equal(plans.size, GOALS.length);
});
