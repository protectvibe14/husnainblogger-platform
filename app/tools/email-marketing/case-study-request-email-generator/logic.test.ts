import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runTool, hashInputs, SUBJECT_TEMPLATES, OPENERS, ASK_FRAMINGS, METRIC_LINES, EASE_LINES, CLOSERS, SIGNOFFS, MAX_CLIENT_NAME_CHARS, MAX_RESULT_METRIC_CHARS, escapeHtml } from './logic.ts';
import { outputs } from './meta.ts';

const GOOD = {
  clientName: 'Sarah Chen',
  resultMetric: 'doubled email signups in 60 days',
  format: 'written',
  tone: 'friendly',
};

describe('case-study-request-email-generator', () => {
  it('happy path: returns ok with subjectOptions and bodyDraft', () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.ok(Array.isArray(r.values?.subjectOptions));
    assert.equal((r.values?.subjectOptions as string[]).length, 5);
    assert.equal(typeof r.values?.bodyDraft, 'string');
  });

  it('output ids match meta.ts outputs', () => {
    const r = runTool(GOOD);
    assert.ok(r.ok && r.values);
    const got = Object.keys(r.values).sort();
    const want = outputs.map((o) => o.id).sort();
    assert.deepEqual(got, want);
  });

  it('is deterministic: same inputs produce identical output', () => {
    const a = runTool(GOOD);
    const b = runTool(GOOD);
    assert.deepEqual(a, b);
  });

  it('hashInputs is stable and numeric', () => {
    const h1 = hashInputs('A', 'B', 'written', 'friendly');
    const h2 = hashInputs('A', 'B', 'written', 'friendly');
    assert.equal(h1, h2);
    assert.ok(Number.isInteger(h1) && h1 >= 0);
  });

  it('different inputs change the draft (hash sensitivity)', () => {
    const a = runTool(GOOD)!.values!.bodyDraft as string;
    const b = runTool({ ...GOOD, clientName: 'Marco Polo' })!.values!.bodyDraft as string;
    assert.notEqual(a, b);
  });

  it('rejects missing clientName', () => {
    const r = runTool({ ...GOOD, clientName: undefined });
    assert.equal(r.ok, false);
    assert.match(r.error!, /client name/i);
  });

  it('rejects whitespace-only clientName', () => {
    const r = runTool({ ...GOOD, clientName: '   ' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /client name/i);
  });

  it('rejects missing resultMetric', () => {
    const r = runTool({ ...GOOD, resultMetric: '' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /result metric/i);
  });

  it('rejects invalid format', () => {
    const r = runTool({ ...GOOD, format: 'podcast' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /format/i);
  });

  it('rejects invalid tone', () => {
    const r = runTool({ ...GOOD, tone: 'sassy' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /tone/i);
  });

  it('rejects non-string clientName (number)', () => {
    const r = runTool({ ...GOOD, clientName: 42 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /client name/i);
  });

  it('video format draft mentions video-specific terms', () => {
    const r = runTool({ ...GOOD, format: 'video' });
    assert.ok(r.ok && r.values);
    assert.match(r.values.bodyDraft as string, /video/i);
  });

  it('quote format draft asks for a quote', () => {
    const r = runTool({ ...GOOD, format: 'quote' });
    assert.ok(r.ok && r.values);
    assert.match(r.values.bodyDraft as string, /quote/i);
  });

  it('each tone produces a draft with the client name and metric', () => {
    for (const tone of ['formal', 'friendly', 'casual']) {
      const r = runTool({ ...GOOD, tone });
      assert.ok(r.ok && r.values);
      const body = r.values.bodyDraft as string;
      assert.ok(body.includes('Sarah Chen'), `tone=${tone} missing name`);
      assert.ok(body.includes('doubled email signups in 60 days'), `tone=${tone} missing metric`);
    }
  });

  it('5 subject lines are unique and non-empty', () => {
    const r = runTool(GOOD);
    assert.ok(r.ok && r.values);
    const subs = r.values.subjectOptions as string[];
    assert.equal(new Set(subs).size, 5);
    for (const s of subs) assert.ok(s.trim().length > 0);
  });

  it('no placeholder tokens leak into output', () => {
    const r = runTool(GOOD);
    assert.ok(r.ok && r.values);
    const all = (r.values.subjectOptions as string[]).join(' ') + (r.values.bodyDraft as string);
    assert.ok(!/\{\w+\}/.test(all), 'unfilled placeholder found');
  });

  it('truncates overlong client name with a visible notice', () => {
    const long = 'X'.repeat(MAX_CLIENT_NAME_CHARS + 10);
    const r = runTool({ ...GOOD, clientName: long });
    assert.ok(r.ok && r.values);
    assert.match(r.values.bodyDraft as string, new RegExp(`truncated to ${MAX_CLIENT_NAME_CHARS} characters`));
  });

  it('truncates overlong result metric with a visible notice', () => {
    const long = 'Y'.repeat(MAX_RESULT_METRIC_CHARS + 5);
    const r = runTool({ ...GOOD, resultMetric: long });
    assert.ok(r.ok && r.values);
    assert.match(r.values.bodyDraft as string, new RegExp(`truncated to ${MAX_RESULT_METRIC_CHARS} characters`));
  });

  it('measures length in Unicode code points, not UTF-16 units', () => {
    // 61 emoji = 61 code points but 122 UTF-16 units → must be truncated.
    const emoji = '🎉'.repeat(MAX_CLIENT_NAME_CHARS + 1);
    const r = runTool({ ...GOOD, clientName: emoji });
    assert.ok(r.ok && r.values);
    assert.match(r.values.bodyDraft as string, /truncated/);
    // 60 emoji = exactly at cap → no truncation.
    const exact = '🎉'.repeat(MAX_CLIENT_NAME_CHARS);
    const r2 = runTool({ ...GOOD, clientName: exact });
    assert.ok(r2.ok && r2.values);
    assert.ok(!/truncated/.test(r2.values.bodyDraft as string));
  });

  it('escapes HTML in user input', () => {
    const r = runTool({ ...GOOD, clientName: '<b>Alice</b>' });
    assert.ok(r.ok && r.values);
    const all = (r.values.subjectOptions as string[]).join(' ') + (r.values.bodyDraft as string);
    assert.ok(!all.includes('<b>Alice</b>'));
    assert.ok(all.includes(escapeHtml('<b>Alice</b>')));
  });

  it('documented bank sizes are accurate', () => {
    assert.equal(SUBJECT_TEMPLATES.length, 10);
    assert.equal(Object.keys(OPENERS).length, 3);
    assert.ok(Object.values(OPENERS).every((b) => b.length === 2));
    assert.equal(Object.keys(ASK_FRAMINGS).length, 3);
    assert.ok(Object.values(ASK_FRAMINGS).every((b) => b.length === 4));
    assert.equal(METRIC_LINES.length, 5);
    assert.equal(EASE_LINES.length, 5);
    assert.equal(CLOSERS.formal.length, 2);
    assert.equal(SIGNOFFS.length, 4);
  });

  it('all banks are non-empty strings', () => {
    const all = [
      ...SUBJECT_TEMPLATES,
      ...Object.values(OPENERS).flat(),
      ...Object.values(ASK_FRAMINGS).flat(),
      ...METRIC_LINES,
      ...EASE_LINES,
      ...Object.values(CLOSERS).flat(),
      ...SIGNOFFS,
    ];
    assert.ok(all.length > 0);
    for (const s of all) assert.ok(s.trim().length > 0);
  });

  it('repeated-word scan does not false-positive on normal drafts', () => {
    const r = runTool(GOOD);
    assert.ok(r.ok && r.values);
    assert.ok(!/repeated-word pattern/.test(r.values.bodyDraft as string));
  });
});
