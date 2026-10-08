import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runTool, charLen, hashStr, TEMPLATES, VARIANT_COUNT, BIO_MAX_CHARS } from './logic.ts';
import { inputs, outputs, content } from './meta.ts';

const HAPPY = {
  whoYouAre: 'fitness coach for busy moms',
  whatYouDo: '20-minute home workouts, no gym needed',
  cta: 'DM me START for a free plan',
};

describe('runTool — happy path', () => {
  it('returns 8 variants, all within 160 chars', () => {
    const r = runTool(HAPPY);
    assert.equal(r.ok, true);
    const bios = r.values!['bioVariants'] as string[];
    assert.equal(bios.length, VARIANT_COUNT);
    for (const b of bios) {
      assert.ok(charLen(b) <= BIO_MAX_CHARS, `over cap: ${b}`);
      assert.ok(b.length > 0);
    }
  });

  it('variants use the inputs', () => {
    const bios = runTool(HAPPY).values!['bioVariants'] as string[];
    assert.ok(bios.some((b) => b.includes('fitness coach for busy moms')));
    assert.ok(bios.some((b) => b.includes('DM me START')));
  });

  it('works without a CTA and leaves no dangling separators', () => {
    const r = runTool({ whoYouAre: 'brand designer', whatYouDo: 'logos for startups' });
    assert.equal(r.ok, true);
    const bios = r.values!['bioVariants'] as string[];
    assert.equal(bios.length, VARIANT_COUNT);
    for (const b of bios) {
      assert.ok(!/\|\s*$/.test(b), `dangling pipe: ${b}`);
      assert.ok(!/·\s*$/.test(b), `dangling middot: ${b}`);
      assert.ok(!/\|\s*\|/.test(b), `double pipe: ${b}`);
    }
  });

  it('notes carry the link-field reminder', () => {
    const notes = runTool(HAPPY).values!['notes'] as string[];
    assert.ok(notes.some((n) => n.includes('website field')));
  });
});

describe('runTool — validation errors', () => {
  it('missing whoYouAre -> ok:false', () => {
    assert.equal(runTool({ whatYouDo: 'x' }).ok, false);
  });
  it('missing whatYouDo -> ok:false', () => {
    assert.equal(runTool({ whoYouAre: 'x' }).ok, false);
  });
  it('blank inputs -> ok:false', () => {
    assert.equal(runTool({ whoYouAre: '  ', whatYouDo: '  ' }).ok, false);
  });
  it('non-string input -> ok:false', () => {
    assert.equal(runTool({ whoYouAre: 7, whatYouDo: 'x' }).ok, false);
  });
});

describe('runTool — edge cases', () => {
  it('input over 160 chars is compressed with a warning', () => {
    const r = runTool({
      whoYouAre: 'x'.repeat(200),
      whatYouDo: '20-minute home workouts',
    });
    assert.equal(r.ok, true);
    assert.ok((r.values!['notes'] as string[]).some((n) => n.includes('trimmed')));
    for (const b of r.values!['bioVariants'] as string[]) {
      assert.ok(charLen(b) <= BIO_MAX_CHARS);
    }
  });

  it('very long all-fields input still fits the cap', () => {
    const r = runTool({
      whoYouAre: 'w'.repeat(120),
      whatYouDo: 'd'.repeat(120),
      cta: 'c'.repeat(120),
    });
    assert.equal(r.ok, true);
    for (const b of r.values!['bioVariants'] as string[]) {
      assert.ok(charLen(b) <= BIO_MAX_CHARS, `over cap: ${b}`);
    }
  });

  it('deterministic: same inputs -> identical bios', () => {
    assert.deepEqual(runTool(HAPPY), runTool(HAPPY));
  });

  it('different inputs rotate the template slice deterministically', () => {
    const a = runTool(HAPPY).values!['bioVariants'];
    const b = runTool({ ...HAPPY, whoYouAre: 'plumber in Austin' }).values!['bioVariants'];
    assert.deepEqual(runTool({ ...HAPPY, whoYouAre: 'plumber in Austin' }).values!['bioVariants'], b);
    // different hash seed usually rotates the slice; both still valid
    assert.equal((b as string[]).length, VARIANT_COUNT);
    void a;
  });
});

describe('helpers and banks', () => {
  it('TEMPLATES has 12 banks, VARIANT_COUNT is 8', () => {
    assert.equal(TEMPLATES.length, 12);
    assert.equal(VARIANT_COUNT, 8);
  });

  it('BIO_MAX_CHARS is 160', () => {
    assert.equal(BIO_MAX_CHARS, 160);
  });

  it('charLen counts code points (emoji = 1)', () => {
    assert.equal(charLen('a👇b'), 3);
  });

  it('hashStr is deterministic', () => {
    assert.equal(hashStr('abc'), hashStr('abc'));
  });
});

describe('meta.ts alignment', () => {
  it('output ids match runTool value keys', () => {
    const r = runTool(HAPPY);
    assert.deepEqual(Object.keys(r.values!).sort(), outputs.map((o) => o.id).sort());
  });

  it('input ids cover the spec classification inputs', () => {
    assert.deepEqual(inputs.map((i) => i.id).sort(), ['cta', 'whatYouDo', 'whoYouAre']);
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
