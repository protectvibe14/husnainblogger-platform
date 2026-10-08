import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runTool, MAX_LINKS, LABEL_MAX_CHARS, THEMES } from './logic.ts';
import { inputs, itemFields, outputs, content } from './meta.ts';

const item = (label: string, url: string, extra: Record<string, unknown> = {}) => ({
  label,
  url,
  ...extra,
});
const HAPPY = {
  items: [
    item('My portfolio', 'https://example.com/portfolio', { brandName: 'Cozy Studio' }),
    item('Book a call', 'https://calendly.com/me'),
  ],
};

describe('runTool — happy path', () => {
  it('builds preview list, htmlFile download, and notes', () => {
    const r = runTool(HAPPY);
    assert.equal(r.ok, true);
    const v = r.values!;
    assert.deepEqual(v['preview'], [
      'My portfolio → https://example.com/portfolio',
      'Book a call → https://calendly.com/me',
    ]);
    const html = v['htmlFile'] as string;
    assert.ok(html.startsWith('<!DOCTYPE html>'));
    assert.ok(html.includes('<title>Cozy Studio</title>'));
    assert.ok(html.includes('Pin this page on Pinterest'));
    assert.ok(html.includes('2:3'), '2:3 hero guidance must be in the page');
    assert.ok(html.includes('target="_blank" rel="noopener"'));
    assert.ok(!/<script src=/.test(html), 'no external scripts');
    assert.ok(!/<link /.test(html), 'no external stylesheets');
    const notes = v['notes'] as string[];
    assert.ok(notes.some((n) => n.includes('No hosting is provided')));
  });

  it('single item builds fine', () => {
    const r = runTool({ items: [item('Only', 'https://only.example', { brandName: 'Solo' })] });
    assert.equal(r.ok, true);
    assert.equal((r.values!['preview'] as string[]).length, 1);
  });

  it('brand name can be filled on any row (fill once)', () => {
    const r = runTool({
      items: [item('A', 'https://a.example'), item('B', 'https://b.example', { brandName: 'Later Row' })],
    });
    assert.equal(r.ok, true);
    assert.ok((r.values!['htmlFile'] as string).includes('<title>Later Row</title>'));
  });
});

describe('runTool — validation errors', () => {
  it('no items array -> ok:false', () => {
    assert.equal(runTool({} as never).ok, false);
    assert.equal(runTool({ items: 'x' } as never).ok, false);
  });
  it('empty items -> ok:false', () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
  });
  it('missing brandName -> ok:false', () => {
    const r = runTool({ items: [item('A', 'https://a.example')] });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes('brand name'));
  });
  it('Item 2 with empty label -> numbered error', () => {
    const r = runTool({
      items: [item('A', 'https://a.example', { brandName: 'B' }), item('', 'https://b.example')],
    });
    assert.equal(r.ok, false);
    assert.ok(r.error!.startsWith('Item 2:'));
  });
  it('label longer than 60 chars -> error', () => {
    const r = runTool({
      items: [item('x'.repeat(LABEL_MAX_CHARS + 1), 'https://a.example', { brandName: 'B' })],
    });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes('60'));
  });
  it('empty URL -> error', () => {
    const r = runTool({ items: [item('A', '', { brandName: 'B' })] });
    assert.equal(r.ok, false);
    assert.ok(r.error!.startsWith('Item 1:'));
  });
  it('bad URL -> error', () => {
    const r = runTool({ items: [item('A', 'not a url', { brandName: 'B' })] });
    assert.equal(r.ok, false);
  });
  it('javascript: URL rejected', () => {
    const r = runTool({ items: [item('A', 'javascript:alert(1)', { brandName: 'B' })] });
    assert.equal(r.ok, false);
  });
  it('non-object item -> error', () => {
    const r = runTool({ items: [null as never] });
    assert.equal(r.ok, false);
    assert.ok(r.error!.startsWith('Item 1:'));
  });
});

describe('runTool — edge cases', () => {
  it('URL without scheme gets https:// with a note', () => {
    const r = runTool({ items: [item('A', 'example.com/page', { brandName: 'B' })] });
    assert.equal(r.ok, true);
    assert.deepEqual(r.values!['preview'], ['A → https://example.com/page']);
    assert.ok((r.values!['notes'] as string[]).some((n) => n.includes('https://')));
  });

  it('more than 20 links -> capped at 20 with a note', () => {
    const items = Array.from({ length: 22 }, (_, i) =>
      item('L' + (i + 1), 'https://example.com/' + (i + 1), i === 0 ? { brandName: 'B' } : {}),
    );
    const r = runTool({ items });
    assert.equal(r.ok, true);
    assert.equal((r.values!['preview'] as string[]).length, MAX_LINKS);
    assert.ok((r.values!['notes'] as string[]).some((n) => n.includes('first 20')));
  });

  it('exactly 20 links -> no cap note', () => {
    const items = Array.from({ length: 20 }, (_, i) =>
      item('L' + (i + 1), 'https://example.com/' + (i + 1), i === 0 ? { brandName: 'B' } : {}),
    );
    const r = runTool({ items });
    assert.equal(r.ok, true);
    assert.ok(!(r.values!['notes'] as string[]).some((n) => n.includes('first 20')));
  });

  it('dark theme is applied; unknown theme falls back to light with note', () => {
    const dark = runTool({ items: [item('A', 'https://a.example', { brandName: 'B', theme: 'dark' })] });
    assert.ok((dark.values!['htmlFile'] as string).includes('#0f0f14'));
    const weird = runTool({ items: [item('A', 'https://a.example', { brandName: 'B', theme: 'neon' })] });
    assert.equal(weird.ok, true);
    assert.ok((weird.values!['notes'] as string[]).some((n) => n.includes('not supported')));
  });

  it('brand theme is applied', () => {
    const r = runTool({ items: [item('A', 'https://a.example', { brandName: 'B', theme: 'brand' })] });
    assert.ok((r.values!['htmlFile'] as string).includes('#E60023'));
  });

  it('HTML is escaped everywhere', () => {
    const r = runTool({
      items: [
        item('<script>alert("x")</script>', 'https://a.example', { brandName: 'B & "Co"' }),
      ],
    });
    assert.equal(r.ok, true);
    const html = r.values!['htmlFile'] as string;
    assert.ok(!html.includes('<script>alert'));
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok(html.includes('B &amp; &quot;Co&quot;'));
  });

  it('deterministic: same items -> identical HTML', () => {
    assert.deepEqual(runTool(HAPPY), runTool(HAPPY));
  });
});

describe('contract', () => {
  it('MAX_LINKS is 20 and THEMES are light/dark/brand', () => {
    assert.equal(MAX_LINKS, 20);
    assert.deepEqual([...THEMES].sort(), ['brand', 'dark', 'light']);
  });
});

describe('meta.ts alignment', () => {
  it('builder has empty inputs and label/url/brandName/theme itemFields', () => {
    assert.deepEqual(inputs, []);
    const ids = itemFields.map((f) => f.id).sort();
    assert.deepEqual(ids, ['brandName', 'label', 'theme', 'url']);
    assert.ok(itemFields.find((f) => f.id === 'label')!.required);
    assert.ok(itemFields.find((f) => f.id === 'url')!.required);
  });

  it('output ids match runTool value keys', () => {
    const r = runTool(HAPPY);
    assert.deepEqual(Object.keys(r.values!).sort(), outputs.map((o) => o.id).sort());
  });

  it('title <=60 chars, description 140-160 chars, no examples for builder', () => {
    assert.ok(content.title.length <= 60, `title ${content.title.length}`);
    assert.ok(
      content.description.length >= 140 && content.description.length <= 160,
      `description ${content.description.length}`,
    );
    assert.equal(content.examples, undefined);
    assert.equal(content.faqs.length, 4);
  });

  it('jsonLd has SoftwareApplication + BreadcrumbList, never FAQPage', () => {
    const types = (content.jsonLd as Array<{ '@type': string }>).map((j) => j['@type']);
    assert.deepEqual(types.sort(), ['BreadcrumbList', 'SoftwareApplication']);
  });
});
