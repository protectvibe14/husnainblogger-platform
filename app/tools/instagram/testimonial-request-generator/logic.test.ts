import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runTool } from './logic.ts';

const base = {
  clientName: 'Ayesha Khan',
  project: 'Instagram growth audit',
  channel: 'Direct message (DM)',
};

test('happy path returns requestScript, questionPrompts (6), thankYouNote', () => {
  const r = runTool(base);
  assert.equal(r.ok, true);
  const v = r.values!;
  assert.equal(typeof v['requestScript'], 'string');
  assert.ok((v['requestScript'] as string).includes('Ayesha Khan'));
  assert.ok((v['requestScript'] as string).includes('Instagram growth audit'));
  assert.equal((v['questionPrompts'] as string[]).length, 6);
  assert.equal(typeof v['thankYouNote'], 'string');
  assert.ok((v['thankYouNote'] as string).includes('Ayesha Khan'));
});

test('email channel includes a subject line and numbered questions', () => {
  const r = runTool({ ...base, channel: 'Email' });
  assert.equal(r.ok, true);
  const script = r.values!['requestScript'] as string;
  assert.ok(script.startsWith('Subject:'), 'email script must include a subject line');
  assert.ok(script.includes('1. What problem'), 'email script must embed numbered questions');
});

test('in-person channel returns talking points', () => {
  const r = runTool({ ...base, channel: 'In person' });
  assert.equal(r.ok, true);
  assert.ok((r.values!['requestScript'] as string).includes('Talking points'));
});

test('determinism: same inputs → identical outputs', () => {
  const a = runTool(base);
  const b = runTool(base);
  assert.deepEqual(a, b);
});

test('different client changes the selected template (variety, not always first)', () => {
  const scripts = new Set<string>();
  const names = ['Sara', 'Danish', 'Meera', 'Omar', 'Lina', 'Fahad', 'Nadia', 'Ravi', 'Zara', 'Ali'];
  for (const n of names) {
    const r = runTool({ ...base, clientName: n });
    scripts.add(r.values!['requestScript'] as string);
  }
  assert.ok(scripts.size > 1, 'bank picks should vary across clients');
});

test('missing clientName → validation error', () => {
  const r = runTool({ ...base, clientName: '' });
  assert.equal(r.ok, false);
  assert.match(r.error!, /name/i);
});

test('missing project → validation error', () => {
  const r = runTool({ ...base, project: '   ' });
  assert.equal(r.ok, false);
  assert.match(r.error!, /project/i);
});

test('missing channel → validation error', () => {
  const r = runTool({ ...base, channel: '' });
  assert.equal(r.ok, false);
  assert.match(r.error!, /channel/i);
});

test('invalid channel → validation error', () => {
  const r = runTool({ ...base, channel: 'Smoke signals' });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Direct message/);
});

test('non-string inputs treated as missing', () => {
  const r = runTool({ clientName: 42, project: 'x', channel: 'Email' });
  assert.equal(r.ok, false);
});

test('question prompts all filled with client context', () => {
  const r = runTool(base);
  const prompts = r.values!['questionPrompts'] as string[];
  for (const p of prompts) {
    assert.ok(p.length > 10, 'no empty/whitespace prompt');
    assert.ok(!p.includes('{clientName}') && !p.includes('{project}'), 'no unfilled placeholders');
  }
});

test('no unfilled placeholders in script or thank-you note', () => {
  for (const channel of ['Direct message (DM)', 'Email', 'In person']) {
    const r = runTool({ ...base, channel });
    assert.equal(r.ok, true);
    const text = (r.values!['requestScript'] as string) + (r.values!['thankYouNote'] as string);
    assert.ok(!text.includes('{clientName}') && !text.includes('{project}') && !text.includes('{questions}'), 'channel=' + channel);
  }
});

test('email subject never empty line', () => {
  const r = runTool({ ...base, channel: 'Email' });
  const firstLine = (r.values!['requestScript'] as string).split('\n')[0];
  assert.ok(firstLine.length > 'Subject: '.length, 'subject line has content');
});

test('whitespace-only inputs rejected, trimmed inputs accepted', () => {
  const r = runTool({ clientName: '  Sara  ', project: '  Rebrand  ', channel: 'Email' });
  assert.equal(r.ok, true);
  assert.ok((r.values!['requestScript'] as string).includes('Sara'));
  assert.ok(!(r.values!['requestScript'] as string).includes('  Sara  '));
});

test('bank sizes as documented: 12 scripts, 6 prompts, 3 notes', () => {
  // 4 templates × 3 channels = 12 unique script shapes possible.
  const channels = ['Direct message (DM)', 'Email', 'In person'];
  const prompts = runTool(base).values!['questionPrompts'] as string[];
  assert.equal(prompts.length, 6);
  const emailScripts = new Set<string>();
  for (let i = 0; i < 40; i++) {
    const script = (runTool({ ...base, clientName: 'Client ' + i, channel: 'Email' }).values!['requestScript'] as string).split('Client ' + i).join('Client');
    emailScripts.add(script);
  }
  assert.ok(emailScripts.size === 4, 'email channel must expose exactly 4 script templates');
  const thanks = new Set<string>();
  for (let i = 0; i < 40; i++) {
    const note = (runTool({ ...base, clientName: 'Client ' + i }).values!['thankYouNote'] as string).split('Client ' + i).join('Client');
    thanks.add(note);
  }
  assert.ok(thanks.size === 3, 'thank-you bank must expose exactly 3 templates');
  assert.equal(channels.length, 3);
});

test('output ids are requestScript, questionPrompts, thankYouNote', () => {
  const v = runTool(base).values!;
  assert.deepEqual(Object.keys(v).sort(), ['questionPrompts', 'requestScript', 'thankYouNote']);
});

test('result has no error field on success', () => {
  const r = runTool(base);
  assert.equal(r.error, undefined);
});
