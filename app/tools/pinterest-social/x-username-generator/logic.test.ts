import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runTool, HANDLE_MAX_CHARS, SHORT_MAX_CHARS, STYLES } from './logic.ts';
import { inputs, outputs, content } from './meta.ts';

const HANDLE_RE = /^[a-z0-9_]+$/;

function checkHandles(handles: string[], cap: number): void {
  assert.equal(handles.length, 10);
  assert.equal(new Set(handles).size, handles.length, 'handles must be unique');
  for (const h of handles) {
    assert.ok(h.length > 0 && h.length <= cap, `length: ${h}`);
    assert.ok(HANDLE_RE.test(h), `charset: ${h}`);
    assert.ok(!/^[0-9_]/.test(h), `leading digit/underscore: ${h}`);
    assert.ok(!h.includes(' '), `space: ${h}`);
  }
}

describe('runTool — happy path', () => {
  it('professional style returns 10 valid handles', () => {
    const r = runTool({ baseName: 'OptiOfficial', style: 'professional' });
    assert.equal(r.ok, true);
    checkHandles(r.values!['handles'] as string[], HANDLE_MAX_CHARS);
  });

  it('keyword style returns 10 valid handles', () => {
    const r = runTool({ baseName: 'cozy kitchen', style: 'keyword' });
    assert.equal(r.ok, true);
    checkHandles(r.values!['handles'] as string[], HANDLE_MAX_CHARS);
  });

  it('short style returns 10 handles of 8 chars or fewer', () => {
    const r = runTool({ baseName: 'Husnain Creates', style: 'short' });
    assert.equal(r.ok, true);
    checkHandles(r.values!['handles'] as string[], SHORT_MAX_CHARS);
  });

  it('default style is professional when omitted', () => {
    const a = runTool({ baseName: 'OptiOfficial' });
    const b = runTool({ baseName: 'OptiOfficial', style: 'professional' });
    assert.deepEqual(a.values!['handles'], b.values!['handles']);
  });

  it('notes carry the availability reminder', () => {
    const notes = runTool({ baseName: 'x' }).values!['notes'] as string[];
    assert.ok(notes.some((n) => n.includes('Availability must be checked on X')));
  });
});

describe('runTool — validation errors', () => {
  it('missing baseName -> ok:false', () => {
    assert.equal(runTool({}).ok, false);
  });
  it('blank baseName -> ok:false', () => {
    assert.equal(runTool({ baseName: '   ' }).ok, false);
  });
  it('symbols-only baseName -> ok:false', () => {
    const r = runTool({ baseName: '!!! ###' });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes('letter or number'));
  });
  it('non-string baseName -> ok:false', () => {
    assert.equal(runTool({ baseName: 123 }).ok, false);
  });
});

describe('runTool — edge cases', () => {
  it('spaces and symbols are sanitized', () => {
    const r = runTool({ baseName: 'Cozy-Kitchen! 2026', style: 'keyword' });
    assert.equal(r.ok, true);
    const handles = r.values!['handles'] as string[];
    assert.ok(handles.every((h) => HANDLE_RE.test(h) && !h.includes(' ')));
    assert.ok(handles[0].startsWith('cozykitchen2026'));
  });

  it('base starting with a digit never yields a leading-digit handle', () => {
    const r = runTool({ baseName: '2fast fitness', style: 'professional' });
    assert.equal(r.ok, true);
    for (const h of r.values!['handles'] as string[]) {
      assert.ok(!/^[0-9]/.test(h), h);
    }
  });

  it('overlong base is truncated with a note', () => {
    const r = runTool({ baseName: 'averylongbrandnameindeed', style: 'professional' });
    assert.equal(r.ok, true);
    for (const h of r.values!['handles'] as string[]) {
      assert.ok(h.length <= HANDLE_MAX_CHARS);
    }
    assert.ok((r.values!['notes'] as string[]).some((n) => n.includes('shortened')));
  });

  it('tiny base still yields 10 unique handles (numeric padding)', () => {
    const r = runTool({ baseName: 'ab', style: 'short' });
    assert.equal(r.ok, true);
    checkHandles(r.values!['handles'] as string[], SHORT_MAX_CHARS);
  });

  it('unknown style falls back to professional with a note', () => {
    const r = runTool({ baseName: 'OptiOfficial', style: 'fancy' });
    assert.equal(r.ok, true);
    const prof = runTool({ baseName: 'OptiOfficial', style: 'professional' });
    assert.deepEqual(r.values!['handles'], prof.values!['handles']);
    assert.ok((r.values!['notes'] as string[]).some((n) => n.includes('not supported')));
  });

  it('deterministic: same inputs -> identical handles', () => {
    const in_ = { baseName: 'Cozy Kitchen', style: 'keyword' };
    assert.deepEqual(runTool(in_), runTool(in_));
  });
});

describe('contract', () => {
  it('HANDLE_MAX_CHARS is 15, SHORT_MAX_CHARS is 8', () => {
    assert.equal(HANDLE_MAX_CHARS, 15);
    assert.equal(SHORT_MAX_CHARS, 8);
  });

  it('STYLES are short/professional/keyword', () => {
    assert.deepEqual([...STYLES].sort(), ['keyword', 'professional', 'short']);
  });
});

describe('meta.ts alignment', () => {
  it('output ids match runTool value keys', () => {
    const r = runTool({ baseName: 'x' });
    assert.deepEqual(Object.keys(r.values!).sort(), outputs.map((o) => o.id).sort());
  });

  it('input ids cover baseName and style', () => {
    assert.deepEqual(inputs.map((i) => i.id).sort(), ['baseName', 'style']);
    const style = inputs.find((i) => i.id === 'style')!;
    assert.deepEqual(style.options, ['short', 'professional', 'keyword']);
  });

  it('title <=60, description 140-160, 2-3 examples, 4 faqs', () => {
    assert.ok(content.title.length <= 60, `title ${content.title.length}`);
    assert.ok(
      content.description.length >= 140 && content.description.length <= 160,
      `description ${content.description.length}`,
    );
    assert.ok(content.examples!.length >= 2 && content.examples!.length <= 3);
    assert.equal(content.faqs.length, 4);
  });

  it('jsonLd has SoftwareApplication + BreadcrumbList, never FAQPage', () => {
    const types = (content.jsonLd as Array<{ '@type': string }>).map((j) => j['@type']);
    assert.deepEqual(types.sort(), ['BreadcrumbList', 'SoftwareApplication']);
  });
});
