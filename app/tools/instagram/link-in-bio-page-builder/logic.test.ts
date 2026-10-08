import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runTool } from './logic.ts';

const twoItems = {
  items: [
    { label: 'My portfolio', url: 'https://example.com/portfolio' },
    { label: 'Book a call', url: 'https://calendly.com/me' },
  ],
};

test('happy path: 2 links → preview list, htmlDownload, copyEmbed', () => {
  const r = runTool(twoItems);
  assert.equal(r.ok, true);
  const v = r.values!;
  assert.deepEqual(v['preview'], [
    'My portfolio → https://example.com/portfolio',
    'Book a call → https://calendly.com/me',
  ]);
  const html = v['htmlDownload'] as string;
  assert.ok(html.startsWith('<!DOCTYPE html>'), 'download must be a full HTML document');
  assert.ok(html.includes('https://example.com/portfolio'));
  assert.ok(html.includes('target="_blank" rel="noopener"'), 'links open safely in a new tab');
  assert.equal(v['copyEmbed'], html, 'copy and download carry the same file');
});

test('single item builds fine', () => {
  const r = runTool({ items: [{ label: 'Only link', url: 'https://only.example' }] });
  assert.equal(r.ok, true);
  assert.equal((r.values!['preview'] as string[]).length, 1);
});

test('item order is preserved', () => {
  const r = runTool({
    items: [
      { label: 'C', url: 'https://c.example' },
      { label: 'A', url: 'https://a.example' },
      { label: 'B', url: 'https://b.example' },
    ],
  });
  const preview = r.values!['preview'] as string[];
  assert.ok(preview[0].startsWith('C') && preview[1].startsWith('A') && preview[2].startsWith('B'));
});

test('determinism: same items → identical HTML', () => {
  assert.deepEqual(runTool(twoItems), runTool(twoItems));
});

test('empty items array → error', () => {
  const r = runTool({ items: [] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /at least one/i);
});

test('items not an array → error', () => {
  const r = runTool({ items: 'nope' } as unknown as { items: [] });
  assert.equal(r.ok, false);
});

test('missing label → "Item 1" error', () => {
  const r = runTool({ items: [{ label: '', url: 'https://x.example' }] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Item 1/);
});

test('whitespace-only label → error', () => {
  const r = runTool({ items: [{ label: '   ', url: 'https://x.example' }] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Item 1/);
});

test('missing URL → "Item 1" error', () => {
  const r = runTool({ items: [{ label: 'Blog' }] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Item 1.*URL/i);
});

test('URL without scheme → "Item 2" error naming the item', () => {
  const r = runTool({
    items: [
      { label: 'Good', url: 'https://good.example' },
      { label: 'Bad', url: 'www.bad.example/page' },
    ],
  });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Item 2/);
  assert.match(r.error!, /URL/i);
});

test('javascript: URL rejected', () => {
  const r = runTool({ items: [{ label: 'X', url: 'javascript:alert(1)' }] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Item 1/);
});

test('URL with spaces rejected', () => {
  const r = runTool({ items: [{ label: 'X', url: 'https://bad url.example/x' }] });
  assert.equal(r.ok, false);
});

test('label HTML-escaped in export (XSS)', () => {
  const r = runTool({ items: [{ label: '<script>alert(1)</script>', url: 'https://x.example' }] });
  assert.equal(r.ok, true);
  const html = r.values!['htmlDownload'] as string;
  assert.ok(!html.includes('<script>alert(1)'), 'raw script tag must not appear');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
});

test('URL ampersand escaped', () => {
  const r = runTool({ items: [{ label: 'Search', url: 'https://x.example/?a=1&b=2' }] });
  assert.equal(r.ok, true);
  assert.ok((r.values!['htmlDownload'] as string).includes('a=1&amp;b=2'));
});

test('http:// (non-https) accepted, ftp:// rejected', () => {
  assert.equal(runTool({ items: [{ label: 'H', url: 'http://x.example' }] }).ok, true);
  assert.equal(runTool({ items: [{ label: 'F', url: 'ftp://x.example' }] }).ok, false);
});

test('duplicate URLs allowed', () => {
  const r = runTool({
    items: [
      { label: 'A', url: 'https://x.example' },
      { label: 'B', url: 'https://x.example' },
    ],
  });
  assert.equal(r.ok, true);
  assert.equal((r.values!['preview'] as string[]).length, 2);
});

test('labels are trimmed', () => {
  const r = runTool({ items: [{ label: '  Padded  ', url: 'https://x.example' }] });
  assert.equal(r.ok, true);
  assert.ok((r.values!['preview'] as string[])[0].startsWith('Padded →'));
});

test('non-object item → error', () => {
  const r = runTool({ items: [null] } as unknown as { items: [] });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Item 1/);
});

test('output ids are preview, htmlDownload, copyEmbed', () => {
  const v = runTool(twoItems).values!;
  assert.deepEqual(Object.keys(v).sort(), ['copyEmbed', 'htmlDownload', 'preview']);
});

test('export is a single self-contained file (inline CSS, no external refs)', () => {
  const html = runTool(twoItems).values!['htmlDownload'] as string;
  assert.ok(html.includes('<style>'), 'styles must be inline');
  assert.ok(!html.includes('src="http'), 'no external script/image references');
});
