import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runTool, htmlToText, wrapLine, decodeEntities, extractAttr, DEFAULT_LINE_WIDTH, MIN_LINE_WIDTH, MAX_LINE_WIDTH, MAX_INPUT_CHARS } from './logic.ts';
import { outputs } from './meta.ts';

const SAMPLE =
  '<h1>Weekly Update</h1><p>Hello <strong>friend</strong>, read our <a href="https://example.com/post">latest post</a>.</p><img alt="team photo" src="x.jpg">';

describe('plain-text-email-formatter', () => {
  it('happy path: converts HTML to plain text with stats', () => {
    const r = runTool({ richText: SAMPLE, lineWidth: 72, linkStyle: 'inline' });
    assert.equal(r.ok, true);
    const text = r.values?.plainText as string;
    assert.ok(text.includes('Weekly Update'));
    assert.ok(text.includes('latest post (https://example.com/post)'));
    assert.ok(text.includes('[Image: team photo]'));
    assert.match(r.values?.stats as string, /\d+ lines, \d+ characters/);
  });

  it('output ids match meta.ts outputs', () => {
    const r = runTool({ richText: '<p>hi</p>', linkStyle: 'inline' });
    assert.ok(r.ok && r.values);
    assert.deepEqual(Object.keys(r.values).sort(), outputs.map((o) => o.id).sort());
  });

  it('is deterministic: same inputs produce identical output', () => {
    const v = { richText: SAMPLE, lineWidth: 60, linkStyle: 'footnote' as const };
    assert.deepEqual(runTool(v), runTool(v));
  });

  it('rejects missing or whitespace-only richText', () => {
    assert.equal(runTool({ linkStyle: 'inline' }).ok, false);
    const r = runTool({ richText: '   ', linkStyle: 'inline' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /paste/i);
  });

  it('rejects invalid linkStyle', () => {
    const r = runTool({ richText: '<p>x</p>', linkStyle: 'sideways' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /link style/i);
  });

  it('rejects NaN / Infinity lineWidth', () => {
    assert.equal(runTool({ richText: '<p>x</p>', linkStyle: 'inline', lineWidth: NaN }).ok, false);
    assert.equal(runTool({ richText: '<p>x</p>', linkStyle: 'inline', lineWidth: Infinity }).ok, false);
  });

  it('clamps lineWidth to the documented 40–120 range', () => {
    const longWord = 'a'.repeat(150);
    const r = runTool({ richText: `<p>${longWord}</p>`, linkStyle: 'inline', lineWidth: 500 });
    assert.ok(r.ok && r.values);
    const lines = (r.values.plainText as string).split('\n');
    assert.ok(lines.every((l) => [...l].length <= MAX_LINE_WIDTH));
    const r2 = runTool({ richText: `<p>${longWord}</p>`, linkStyle: 'inline', lineWidth: 5 });
    assert.ok(r2.ok && r2.values);
    const low = (r2.values.plainText as string).split('\n');
    // Clamped up to 40: every line fits 40, but lines exceed 5 (no clamp would give ≤5).
    assert.ok(low.every((l) => [...l].length <= MIN_LINE_WIDTH));
    assert.ok(low.some((l) => [...l].length > 5));
  });

  it('defaults to 72 when lineWidth is omitted', () => {
    const line = 'word '.repeat(30).trim();
    const r = runTool({ richText: `<p>${line}</p>`, linkStyle: 'inline' });
    assert.ok(r.ok && r.values);
    assert.ok((r.values.plainText as string).split('\n').every((l) => [...l].length <= DEFAULT_LINE_WIDTH));
  });

  it('footnote style numbers links and appends a Links list', () => {
    const r = runTool({
      richText: '<p>See <a href="https://a.com">A</a> and <a href="https://b.com">B</a>.</p>',
      linkStyle: 'footnote',
    });
    assert.ok(r.ok && r.values);
    const text = r.values.plainText as string;
    assert.ok(text.includes('A [1]'));
    assert.ok(text.includes('B [2]'));
    assert.ok(text.includes('[1] https://a.com'));
    assert.ok(text.includes('[2] https://b.com'));
  });

  it('renders bare URL for links whose text equals the URL', () => {
    const t = htmlToText('<p><a href="https://a.com">https://a.com</a></p>', 'inline');
    assert.ok(!t.includes('(https://a.com)'));
    assert.ok(t.includes('https://a.com'));
  });

  it('image without alt falls back to [Image]', () => {
    const t = htmlToText('<p><img src="x.jpg"></p>', 'inline');
    assert.ok(t.includes('[Image]'));
  });

  it('removes script and style content entirely', () => {
    const t = htmlToText('<style>p{color:red}</style><p>Hi</p><script>alert(1)</script>', 'inline');
    assert.ok(!t.includes('color'));
    assert.ok(!t.includes('alert'));
    assert.ok(t.includes('Hi'));
  });

  it('decodes entities and preserves literal angle brackets', () => {
    const t = htmlToText('<p>Fish &amp; Chips &lt;3 &nbsp; done</p>', 'inline');
    assert.ok(t.includes('Fish & Chips <3'));
    assert.ok(!t.includes('&amp;'));
    assert.equal(decodeEntities('&lt;&#65;&#x42;&gt;'), '<AB>');
  });

  it('block tags and <br> become line breaks; <li> becomes bullets', () => {
    const t = htmlToText('<p>one</p><p>two</p><br>three<ul><li>item</li></ul>', 'inline');
    // Paragraphs are separated by a blank line (standard plain-text convention).
    assert.ok(t.includes('one\n\ntwo\n\nthree'));
    assert.ok(t.includes('- item'));
  });

  it('stats count lines and Unicode characters accurately', () => {
    const r = runTool({ richText: '<p>🎉 party</p>', linkStyle: 'inline' });
    assert.ok(r.ok && r.values);
    const text = r.values.plainText as string;
    const [lines, chars] = (r.values.stats as string).match(/\d+/g)!.map(Number);
    assert.equal(lines, text.split('\n').length);
    assert.equal(chars, [...text].length);
  });

  it('truncates overlong input with a visible notice', () => {
    const big = '<p>' + 'x'.repeat(MAX_INPUT_CHARS + 100) + '</p>';
    const r = runTool({ richText: big, linkStyle: 'inline' });
    assert.ok(r.ok && r.values);
    assert.match(r.values.plainText as string, new RegExp(`truncated to ${MAX_INPUT_CHARS} characters`));
  });

  it('wrapLine hard-breaks tokens longer than the width (code-point safe)', () => {
    const out = wrapLine('🎉'.repeat(80), 72);
    assert.ok(out.every((l) => [...l].length <= 72));
    assert.equal(out.join(''), '🎉'.repeat(80));
  });

  it('extractAttr handles quoted and unquoted values', () => {
    assert.equal(extractAttr('<a href="https://a.com">', 'href'), 'https://a.com');
    assert.equal(extractAttr("<a href='https://a.com'>", 'href'), 'https://a.com');
    assert.equal(extractAttr('<a href=https://a.com>', 'href'), 'https://a.com');
    assert.equal(extractAttr('<a>', 'href'), null);
  });

  it('plain text without HTML passes through unchanged', () => {
    const r = runTool({ richText: 'Just a plain line.', linkStyle: 'inline' });
    assert.ok(r.ok && r.values);
    assert.equal((r.values.plainText as string), 'Just a plain line.');
  });

  it('nested tags inside link text are flattened', () => {
    const t = htmlToText('<p><a href="https://a.com"><strong>Bold</strong> link</a></p>', 'inline');
    assert.ok(t.includes('Bold link (https://a.com)'));
  });
});
