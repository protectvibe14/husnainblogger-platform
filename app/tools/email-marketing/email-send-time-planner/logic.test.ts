import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runTool, planSlots, isValidTimezone, tzOffsetMinutes, formatTime, BANDS, REF_EPOCH_MS } from './logic.ts';
import { outputs } from './meta.ts';

const GOOD = {
  audienceTimezone: 'Europe/London',
  senderTimezone: 'America/New_York',
  cadence: 'weekly',
};

describe('email-send-time-planner', () => {
  it('happy path: weekly cadence returns 4 slots plus the guidance note', () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.equal((r.values?.sendSlots as string[]).length, 4);
    assert.equal(typeof r.values?.bestBandNote, 'string');
    assert.ok((r.values?.bestBandNote as string).length > 50);
  });

  it('output ids match meta.ts outputs', () => {
    const r = runTool(GOOD);
    assert.ok(r.ok && r.values);
    assert.deepEqual(Object.keys(r.values).sort(), outputs.map((o) => o.id).sort());
  });

  it('is deterministic: same inputs produce identical output', () => {
    assert.deepEqual(runTool(GOOD), runTool(GOOD));
  });

  it('rejects an unrecognized audience timezone', () => {
    const r = runTool({ ...GOOD, audienceTimezone: 'Mars/Olympus' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /timezone/i);
  });

  it('rejects an unrecognized sender timezone', () => {
    const r = runTool({ ...GOOD, senderTimezone: 'Not/AZone' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /timezone/i);
  });

  it('rejects missing or whitespace-only timezones', () => {
    assert.equal(runTool({ ...GOOD, audienceTimezone: '   ' }).ok, false);
    assert.equal(runTool({ senderTimezone: 'UTC', cadence: 'weekly' }).ok, false);
  });

  it('rejects invalid cadence', () => {
    const r = runTool({ ...GOOD, cadence: 'daily' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /cadence/i);
  });

  it('biweekly returns 3 slots labeled Week 1/3/5', () => {
    const r = runTool({ ...GOOD, cadence: 'biweekly' });
    assert.ok(r.ok && r.values);
    const slots = r.values.sendSlots as string[];
    assert.equal(slots.length, 3);
    assert.ok(slots[0].startsWith('Week 1'));
    assert.ok(slots[1].startsWith('Week 3'));
    assert.ok(slots[2].startsWith('Week 5'));
  });

  it('monthly returns 3 slots labeled Month 1/2/3', () => {
    const r = runTool({ ...GOOD, cadence: 'monthly' });
    assert.ok(r.ok && r.values);
    const slots = r.values.sendSlots as string[];
    assert.equal(slots.length, 3);
    assert.ok(slots[0].startsWith('Month 1'));
    assert.ok(slots[2].startsWith('Month 3'));
  });

  it('converts correctly: NY sender → London audience, morning band', () => {
    // 2026-10-01 ref: London = UTC+1, New York = UTC−4 → 5h apart.
    const r = runTool(GOOD);
    assert.ok(r.ok && r.values);
    const slot = (r.values.sendSlots as string[])[0];
    assert.ok(slot.includes('Tue 4:00 AM (America/New_York)'), slot);
    assert.ok(slot.includes('Tue 9:00 AM (Europe/London)'), slot);
  });

  it('same timezone on both sides → identical local times', () => {
    const r = runTool({ audienceTimezone: 'Asia/Dubai', senderTimezone: 'Asia/Dubai', cadence: 'weekly' });
    assert.ok(r.ok && r.values);
    const slot = (r.values.sendSlots as string[])[0];
    assert.ok(slot.includes('Tue 9:00 AM (Asia/Dubai) → Tue 9:00 AM (Asia/Dubai)'), slot);
  });

  it('rolls the sender day over when conversion crosses midnight', () => {
    // Auckland (UTC+13 at ref) → New York: audience Tue 9:00 AM = sender Wed 2:00 AM.
    const r = runTool({ audienceTimezone: 'America/New_York', senderTimezone: 'Pacific/Auckland', cadence: 'weekly' });
    assert.ok(r.ok && r.values);
    const slot = (r.values.sendSlots as string[])[0];
    assert.ok(slot.includes('Wed 2:00 AM (Pacific/Auckland)'), slot);
    assert.ok(slot.includes('Tue 9:00 AM (America/New_York)'), slot);
  });

  it('every slot labels its band as general guidance', () => {
    for (const cadence of ['weekly', 'biweekly', 'monthly']) {
      const r = runTool({ ...GOOD, cadence });
      assert.ok(r.ok && r.values);
      for (const s of r.values.sendSlots as string[]) {
        assert.ok(s.includes('general guidance'), `missing guidance label in: ${s}`);
      }
    }
  });

  it('the note disclaims verified open-rate facts', () => {
    const r = runTool(GOOD);
    assert.ok(r.ok && r.values);
    assert.match(r.values.bestBandNote as string, /not verified open-rate facts/i);
  });

  it('never presents open-rate percentages anywhere', () => {
    const r = runTool(GOOD);
    assert.ok(r.ok && r.values);
    const all = (r.values.sendSlots as string[]).join(' ') + (r.values.bestBandNote as string);
    assert.ok(!/\d+\s*%/.test(all), 'percentage found in output');
  });

  it('rotates all four bands across the weekly plan', () => {
    const slots = planSlots('Europe/London', 'America/New_York', 'weekly');
    assert.equal(slots.length, 4);
    assert.deepEqual(slots.map((s) => s.band.id), BANDS.map((b) => b.id));
  });

  it('isValidTimezone accepts IANA names and rejects garbage', () => {
    assert.equal(isValidTimezone('America/New_York'), true);
    assert.equal(isValidTimezone('UTC'), true);
    assert.equal(isValidTimezone('Mars/Olympus'), false);
    assert.equal(isValidTimezone(''), false);
  });

  it('tzOffsetMinutes matches known offsets at the fixed reference', () => {
    assert.equal(tzOffsetMinutes('Europe/London', REF_EPOCH_MS), 60);
    assert.equal(tzOffsetMinutes('America/New_York', REF_EPOCH_MS), -240);
    assert.equal(tzOffsetMinutes('Asia/Karachi', REF_EPOCH_MS), 300);
  });

  it('formatTime renders 12-hour clock correctly', () => {
    assert.equal(formatTime(0), '12:00 AM');
    assert.equal(formatTime(540), '9:00 AM');
    assert.equal(formatTime(720), '12:00 PM');
    assert.equal(formatTime(1080), '6:00 PM');
  });

  it('trims whitespace around timezone names', () => {
    const r = runTool({ ...GOOD, audienceTimezone: '  Europe/London  ' });
    assert.equal(r.ok, true);
  });
});
