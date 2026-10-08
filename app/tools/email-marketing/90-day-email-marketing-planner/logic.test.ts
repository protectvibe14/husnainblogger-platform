import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runTool, buildPlan, parseISODate, isoOf, dateLabel, GOAL_MIXES, MIX_PATTERNS, SEND_WEEKDAYS, PILLAR_TOPICS, SLOT_TYPES, PLAN_DAYS } from './logic.ts';
import { outputs } from './meta.ts';

const MIX = 'Nurture 60% / Promo 20% / Content 20%';
const START = '2026-10-06'; // a Tuesday

describe('90-day-email-marketing-planner', () => {
  it('happy path: 2/week from a Tuesday yields 26 sends, first row correct', () => {
    const r = runTool({ startDate: START, emailsPerWeek: 2, goalMix: MIX });
    assert.equal(r.ok, true);
    const cal = r.values?.calendar as { columns: string[]; rows: string[][] };
    assert.equal(cal.rows.length, 26);
    assert.equal(cal.rows[0][0], '2026-10-06 (Tue)');
    assert.equal(cal.rows[0][1], 'Nurture email');
  });

  it('output ids match meta.ts outputs', () => {
    const r = runTool({ startDate: START, emailsPerWeek: 2, goalMix: MIX });
    assert.ok(r.ok && r.values);
    assert.deepEqual(Object.keys(r.values).sort(), outputs.map((o) => o.id).sort());
  });

  it('is deterministic: same inputs produce identical output', () => {
    const v = { startDate: START, emailsPerWeek: 3, goalMix: MIX, blackoutDates: '2026-12-25' };
    assert.deepEqual(runTool(v), runTool(v));
  });

  it('rejects missing, malformed, or impossible start dates', () => {
    assert.equal(runTool({ emailsPerWeek: 2, goalMix: MIX }).ok, false);
    const bad = runTool({ startDate: 'not-a-date', emailsPerWeek: 2, goalMix: MIX });
    assert.equal(bad.ok, false);
    assert.match(bad.error!, /valid/i);
    const impossible = runTool({ startDate: '2026-02-30', emailsPerWeek: 2, goalMix: MIX });
    assert.equal(impossible.ok, false);
  });

  it('rejects out-of-range, fractional, or non-finite emailsPerWeek', () => {
    for (const n of [0, 8, 2.5, NaN, Infinity]) {
      const r = runTool({ startDate: START, emailsPerWeek: n, goalMix: MIX });
      assert.equal(r.ok, false, `expected rejection for ${n}`);
    }
  });

  it('rejects unknown goalMix', () => {
    const r = runTool({ startDate: START, emailsPerWeek: 2, goalMix: 'Nurture 100%' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /goal mix/i);
  });

  it('rejects malformed blackout dates with the line number', () => {
    const r = runTool({ startDate: START, emailsPerWeek: 2, goalMix: MIX, blackoutDates: '2026-12-25\nnope' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /line 2/);
  });

  it('skips blackout send dates and reports them in totals', () => {
    const r = runTool({ startDate: START, emailsPerWeek: 2, goalMix: MIX, blackoutDates: '2026-10-06' });
    assert.ok(r.ok && r.values);
    const cal = r.values.calendar as { rows: string[][] };
    assert.equal(cal.rows.length, 25);
    assert.ok(!cal.rows.some((row) => row[0].startsWith('2026-10-06')));
    assert.match(r.values.totals as string, /1 send date skipped \(blackout\)/);
  });

  it('1 email/week lands only on Tuesdays', () => {
    const r = runTool({ startDate: START, emailsPerWeek: 1, goalMix: MIX });
    assert.ok(r.ok && r.values);
    const cal = r.values.calendar as { rows: string[][] };
    assert.equal(cal.rows.length, 13);
    assert.ok(cal.rows.every((row) => row[0].endsWith('(Tue)')));
  });

  it('7 emails/week fills all 90 days', () => {
    const r = runTool({ startDate: START, emailsPerWeek: 7, goalMix: MIX });
    assert.ok(r.ok && r.values);
    assert.equal((r.values.calendar as { rows: string[][] }).rows.length, 90);
  });

  it('milestones land on day 30 / 60 / 90 with correct dates', () => {
    const r = runTool({ startDate: START, emailsPerWeek: 2, goalMix: MIX });
    assert.ok(r.ok && r.values);
    const ms = r.values.milestones as string[];
    assert.equal(ms.length, 4);
    assert.ok(ms[0].includes('2026-10-06'), ms[0]);
    assert.ok(ms[1].includes('2026-11-04'), ms[1]);
    assert.ok(ms[2].includes('2026-12-04'), ms[2]);
    assert.ok(ms[3].includes('2027-01-03'), ms[3]);
  });

  it('calendar is a table with the documented columns', () => {
    const r = runTool({ startDate: START, emailsPerWeek: 2, goalMix: MIX });
    assert.ok(r.ok && r.values);
    const cal = r.values.calendar as { columns: string[]; rows: string[][] };
    assert.deepEqual(cal.columns, ['Date', 'Type', 'Content pillar']);
    assert.ok(cal.rows.every((row) => row.length === 3));
  });

  it('slot types come only from the fixed set and topics cycle', () => {
    const r = runTool({ startDate: START, emailsPerWeek: 2, goalMix: MIX });
    assert.ok(r.ok && r.values);
    const cal = r.values.calendar as { rows: string[][] };
    const types = new Set(Object.values(SLOT_TYPES));
    assert.ok(cal.rows.every((row) => types.has(row[1])));
    // First two nurture rows use different cycled topics.
    const nurtures = cal.rows.filter((row) => row[1] === 'Nurture email');
    assert.ok(nurtures.length >= 2);
    assert.notEqual(nurtures[0][2], nurtures[1][2]);
  });

  it('totals summarize counts per pillar', () => {
    const r = runTool({ startDate: START, emailsPerWeek: 2, goalMix: MIX });
    assert.ok(r.ok && r.values);
    assert.match(r.values.totals as string, /26 emails planned over 90 days: nurture 16 \/ promo 5 \/ content 5/);
  });

  it('blackout dates outside the window change nothing', () => {
    const plain = runTool({ startDate: START, emailsPerWeek: 2, goalMix: MIX });
    const withBlackout = runTool({ startDate: START, emailsPerWeek: 2, goalMix: MIX, blackoutDates: '2030-01-01' });
    assert.deepEqual(plain, withBlackout);
  });

  it('trims whitespace around inputs', () => {
    const r = runTool({ startDate: '  2026-10-06  ', emailsPerWeek: 1, goalMix: MIX });
    assert.equal(r.ok, true);
  });

  it('no send falls outside the 90-day window', () => {
    const r = runTool({ startDate: START, emailsPerWeek: 7, goalMix: MIX });
    assert.ok(r.ok && r.values);
    const cal = r.values.calendar as { rows: string[][] };
    const last = cal.rows[cal.rows.length - 1][0].slice(0, 10);
    assert.ok(last <= '2027-01-03', last);
  });

  it('documented rule constants are internally consistent', () => {
    assert.equal(PLAN_DAYS, 90);
    assert.equal(Object.keys(GOAL_MIXES).length, 5);
    for (const [mix, pct] of Object.entries(GOAL_MIXES)) {
      assert.equal(pct.nurture + pct.promo + pct.content, 100, mix);
      const pattern = MIX_PATTERNS[mix];
      assert.equal(pattern.length, 10, mix);
      const count = (pl: string) => pattern.filter((p) => p === pl).length;
      assert.equal(count('nurture'), pct.nurture / 10, mix);
      assert.equal(count('promo'), pct.promo / 10, mix);
      assert.equal(count('content'), pct.content / 10, mix);
    }
    for (let n = 1; n <= 7; n++) assert.equal(SEND_WEEKDAYS[n].length, n);
    assert.ok(Object.values(PILLAR_TOPICS).every((t) => t.length === 6));
  });

  it('parseISODate / isoOf / dateLabel helpers behave', () => {
    assert.equal(parseISODate('2026-13-01'), null);
    assert.equal(parseISODate('2026-10-6'), null);
    const d = parseISODate('2026-10-06');
    assert.ok(d);
    assert.equal(isoOf(new Date(Date.UTC(2026, 9, 6))), '2026-10-06');
    assert.equal(dateLabel(new Date(Date.UTC(2026, 9, 6))), '2026-10-06 (Tue)');
  });

  it('buildPlan milestone cumulative counts never exceed totals', () => {
    const start = parseISODate(START)!;
    const plan = buildPlan(start, 2, MIX, new Set());
    const total = Number((/(\d+) emails planned/.exec(plan.totals) || [])[1]);
    const last = plan.milestones[3];
    const sent = Number((/(\d+) emails sent/.exec(last) || [])[1]);
    assert.equal(total, sent);
  });
});
