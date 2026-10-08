import { test } from 'node:test';
import assert from 'node:assert';
import { runTool } from './logic.ts';

test('happy path: returns primaryText, description, headlineTip', () => {
  const res = runTool({ offer: '50% off our starter skincare kit', cta: 'Shop now' });
  assert.equal(res.ok, true);
  assert.ok(typeof res.values?.primaryText === 'string');
  assert.ok(typeof res.values?.description === 'string');
  assert.ok(typeof res.values?.headlineTip === 'string');
});

test('primaryText embeds the offer', () => {
  const res = runTool({ offer: '50% off our starter skincare kit', cta: 'Shop now' });
  assert.ok(String(res.values?.primaryText).includes('50% off our starter skincare kit'));
});

test('CTA appears within the first 125 characters of primaryText', () => {
  const res = runTool({ offer: '50% off our starter skincare kit', cta: 'Shop now' });
  assert.equal(res.ok, true);
  const text = String(res.values?.primaryText);
  const pos = text.indexOf('Shop now');
  assert.ok(pos >= 0 && pos < 125, `CTA at position ${pos}`);
});

test('CTA window holds with default CTA and long offer', () => {
  const res = runTool({ offer: 'x'.repeat(100) });
  assert.equal(res.ok, true);
  const text = String(res.values?.primaryText);
  assert.ok(text.indexOf('Learn more') >= 0 && text.indexOf('Learn more') < 125);
});

test('description is <= 30 chars (STRICT)', () => {
  const res = runTool({ offer: '50% off our starter skincare kit', cta: 'Shop now' });
  assert.equal(res.ok, true);
  const desc = String(res.values?.description);
  assert.ok(desc.length <= 30, `description too long: "${desc}" (${desc.length})`);
});

test('description cap holds with long offer and long CTA', () => {
  const res = runTool({ offer: 'x'.repeat(100), cta: 'Click here to get started today' });
  assert.equal(res.ok, true);
  assert.ok(String(res.values?.description).length <= 30);
});

test('description is non-empty', () => {
  const res = runTool({ offer: 'free trial', cta: 'Sign up' });
  assert.equal(res.ok, true);
  assert.ok(String(res.values?.description).trim().length > 0);
});

test('default CTA "Learn more" is used when cta omitted', () => {
  const res = runTool({ offer: 'free trial' });
  assert.equal(res.ok, true);
  assert.ok(String(res.values?.primaryText).includes('Learn more'));
});

test('default CTA used when cta is blank', () => {
  const res = runTool({ offer: 'free trial', cta: '   ' });
  assert.equal(res.ok, true);
  assert.ok(String(res.values?.primaryText).includes('Learn more'));
});

test('headlineTip cross-references the ad headline generator', () => {
  const res = runTool({ offer: 'free trial', cta: 'Sign up' });
  assert.equal(res.ok, true);
  const tip = String(res.values?.headlineTip);
  assert.ok(tip.includes('Facebook Ad Headline Generator'));
  assert.ok(tip.includes('40'));
});

test('output ids match meta.ts outputs (primaryText, description, headlineTip)', () => {
  const res = runTool({ offer: 'free trial', cta: 'Sign up' });
  assert.equal(res.ok, true);
  assert.deepEqual(Object.keys(res.values ?? {}).sort(), ['description', 'headlineTip', 'primaryText']);
});

test('no template placeholder leaks', () => {
  const res = runTool({ offer: 'free trial', cta: 'Sign up' });
  assert.equal(res.ok, true);
  const text = String(res.values?.primaryText) + String(res.values?.description);
  assert.ok(!text.includes('{cta}') && !text.includes('{offer}') && !text.includes('{detail}') && !text.includes('{offerShort}'));
});

test('validation error: missing offer', () => {
  const res = runTool({ cta: 'Shop now' });
  assert.equal(res.ok, false);
  assert.ok(typeof res.error === 'string' && res.error.length > 0);
});

test('validation error: blank offer', () => {
  const res = runTool({ offer: '   ' });
  assert.equal(res.ok, false);
});

test('validation error: offer over 100 chars', () => {
  const res = runTool({ offer: 'x'.repeat(101), cta: 'Shop now' });
  assert.equal(res.ok, false);
  assert.ok(typeof res.error === 'string' && res.error.length > 0);
});

test('validation error: cta over 60 chars', () => {
  const res = runTool({ offer: 'free trial', cta: 'x'.repeat(61) });
  assert.equal(res.ok, false);
  assert.ok(typeof res.error === 'string' && res.error.length > 0);
});

test('deterministic: same inputs give identical outputs', () => {
  const a = runTool({ offer: '50% off our starter kit', cta: 'Shop now' });
  const b = runTool({ offer: '50% off our starter kit', cta: 'Shop now' });
  assert.deepEqual(a, b);
});

test('different offers can produce different copy', () => {
  const a = runTool({ offer: 'free trial', cta: 'Sign up' });
  const b = runTool({ offer: '50% off annual plan', cta: 'Sign up' });
  assert.notDeepEqual(a.values, b.values);
});

test('error responses carry no values', () => {
  const res = runTool({ offer: '' });
  assert.equal(res.ok, false);
  assert.equal(res.values, undefined);
});
