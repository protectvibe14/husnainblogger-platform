import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runTool, escapeHtml, sanitizePhoneForTel, normalizeUrl, parseSocialLinks, urlLabel, MAX_NAME_CHARS } from './logic.ts';
import { outputs } from './meta.ts';

const FULL = {
  name: 'Amara Osei',
  title: 'Founder',
  company: 'Inbox Craft Co.',
  phone: '+1 (555) 123-4567',
  website: 'inboxcraft.co',
  socialLinks: 'LinkedIn: https://linkedin.com/in/amaraosei, https://x.com/amaraosei',
};

describe('email-signature-generator', () => {
  it('happy path: full inputs produce HTML and plain-text signatures', () => {
    const r = runTool(FULL);
    assert.equal(r.ok, true);
    const html = r.values?.signatureHTML as string;
    const text = r.values?.signatureText as string;
    assert.ok(html.includes('Amara Osei'));
    assert.ok(html.includes('<table'));
    assert.ok(text.includes('Amara Osei'));
    assert.ok(text.includes('Founder | Inbox Craft Co.'));
  });

  it('output ids match meta.ts outputs', () => {
    const r = runTool(FULL);
    assert.ok(r.ok && r.values);
    assert.deepEqual(Object.keys(r.values).sort(), outputs.map((o) => o.id).sort());
  });

  it('is deterministic: same inputs produce identical output', () => {
    assert.deepEqual(runTool(FULL), runTool(FULL));
  });

  it('minimal inputs (required only) still produce a signature', () => {
    const r = runTool({ name: 'Jo', title: 'Writer', company: 'Solo' });
    assert.equal(r.ok, true);
    const html = r.values?.signatureHTML as string;
    assert.ok(html.includes('Jo') && html.includes('Writer') && html.includes('Solo'));
  });

  it('rejects missing name', () => {
    const r = runTool({ title: 'Writer', company: 'Solo' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /name/i);
  });

  it('rejects missing title', () => {
    const r = runTool({ name: 'Jo', company: 'Solo' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /title/i);
  });

  it('rejects missing company', () => {
    const r = runTool({ name: 'Jo', title: 'Writer' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /company/i);
  });

  it('rejects whitespace-only required fields', () => {
    const r = runTool({ name: '   ', title: 'Writer', company: 'Solo' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /name/i);
  });

  it('rejects website containing spaces', () => {
    const r = runTool({ ...FULL, website: 'not a url' });
    assert.equal(r.ok, false);
    assert.match(r.error!, /URL/i);
  });

  it('HTML is client-safe: tables + inline styles only, no <style> or classes', () => {
    const r = runTool(FULL);
    assert.ok(r.ok && r.values);
    const html = r.values.signatureHTML as string;
    assert.ok(html.includes('<table'));
    assert.ok(html.includes('style="'));
    assert.ok(!/<style/i.test(html));
    assert.ok(!/class="/i.test(html));
    assert.ok(!/<script/i.test(html));
  });

  it('escapes HTML in user input', () => {
    const r = runTool({ name: '<img src=x>', title: 'Writer', company: 'Solo' });
    assert.ok(r.ok && r.values);
    assert.ok(!(r.values.signatureHTML as string).includes('<img src=x>'));
    assert.ok((r.values.signatureHTML as string).includes(escapeHtml('<img src=x>')));
  });

  it('phone becomes a tel: link with sanitized digits', () => {
    const r = runTool({ name: 'Jo', title: 'Writer', company: 'Solo', phone: '+1 (555) 123-4567' });
    assert.ok(r.ok && r.values);
    const html = r.values.signatureHTML as string;
    assert.ok(html.includes('href="tel:+15551234567"'));
    assert.ok((r.values.signatureText as string).includes('Phone: +1 (555) 123-4567'));
  });

  it('website without scheme gets https:// in href', () => {
    const r = runTool({ name: 'Jo', title: 'Writer', company: 'Solo', website: 'example.com' });
    assert.ok(r.ok && r.values);
    assert.ok((r.values.signatureHTML as string).includes('href="https://example.com"'));
  });

  it('website with scheme is kept as-is', () => {
    const r = runTool({ name: 'Jo', title: 'Writer', company: 'Solo', website: 'http://blog.example.com' });
    assert.ok(r.ok && r.values);
    assert.ok((r.values.signatureHTML as string).includes('href="http://blog.example.com"'));
  });

  it('parses "Label: URL" and bare-URL social entries', () => {
    const links = parseSocialLinks('LinkedIn: https://linkedin.com/in/jo, https://x.com/jo');
    assert.equal(links.length, 2);
    assert.equal(links[0].label, 'LinkedIn');
    assert.equal(links[0].url, 'https://linkedin.com/in/jo');
    assert.equal(links[1].label, 'x.com');
    assert.equal(links[1].url, 'https://x.com/jo');
  });

  it('truncates overlong input with a visible notice (comment + note line)', () => {
    const r = runTool({ name: 'Z'.repeat(MAX_NAME_CHARS + 5), title: 'Writer', company: 'Solo' });
    assert.ok(r.ok && r.values);
    assert.match(r.values.signatureHTML as string, /<!-- Signature notice:/);
    assert.match(r.values.signatureText as string, /\[Note:/);
  });

  it('measures length in Unicode code points', () => {
    const exact = '🎉'.repeat(MAX_NAME_CHARS);
    const r = runTool({ name: exact, title: 'Writer', company: 'Solo' });
    assert.ok(r.ok && r.values);
    assert.ok(!(r.values.signatureHTML as string).includes('Signature notice'));
    const over = '🎉'.repeat(MAX_NAME_CHARS + 1);
    const r2 = runTool({ name: over, title: 'Writer', company: 'Solo' });
    assert.ok(r2.ok && r2.values);
    assert.ok((r2.values.signatureHTML as string).includes('Signature notice'));
  });

  it('normalizeUrl and sanitizePhoneForTel helpers behave', () => {
    assert.equal(normalizeUrl('example.com'), 'https://example.com');
    assert.equal(normalizeUrl('HTTPS://Example.com'), 'HTTPS://Example.com');
    assert.equal(sanitizePhoneForTel('+1 (555) 123-4567'), '+15551234567');
    assert.equal(urlLabel('https://www.linkedin.com/in/jo'), 'linkedin.com');
  });

  it('empty social field produces no social row', () => {
    const r = runTool({ name: 'Jo', title: 'Writer', company: 'Solo', socialLinks: '  ' });
    assert.ok(r.ok && r.values);
    const text = r.values.signatureText as string;
    assert.equal(text.split('\n').length, 2);
  });

  it('non-string optional fields are ignored safely', () => {
    const r = runTool({ name: 'Jo', title: 'Writer', company: 'Solo', phone: 123 as unknown as string });
    assert.equal(r.ok, true);
  });
});
