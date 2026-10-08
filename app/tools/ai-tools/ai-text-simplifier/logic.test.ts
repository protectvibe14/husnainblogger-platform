/**
 * logic.test.ts — AI Text Simplifier. node:test, no network.
 * Mocks realistic provider JSON payloads (success + 401 + 429 + provider errors).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateInputs,
  getProviders,
  buildRequest,
  parseResponse,
  buildPrompts,
  getDisclosures,
} from './logic.ts';

// ---------------------------------------------------------------------------
// validateInputs
// ---------------------------------------------------------------------------
describe('validateInputs', () => {
  it('rejects an invalid option', () => {
    const r = validateInputs({ level: 'shakespearean', text: 'x'.repeat(100) });
    assert.equal(r.ok, false);
  });

  it('rejects missing text', () => {
    const r = validateInputs({ level: 'plain', text: '   ' });
    assert.equal(r.ok, false);
  });

  it('rejects text that is too short', () => {
    const r = validateInputs({ level: 'plain', text: 'Too short.' });
    assert.equal(r.ok, false);
  });

  it('rejects text over 8,000 characters', () => {
    const r = validateInputs({ level: 'plain', text: 'x'.repeat(8001) });
    assert.equal(r.ok, false);
    assert.match(r.errors.join(' '), /8,000/);
  });

  it('accepts valid inputs', () => {
    const r = validateInputs({ level: 'plain', text: 'x'.repeat(100) });
    assert.equal(r.ok, true);
  });
});

// ---------------------------------------------------------------------------
// getProviders
// ---------------------------------------------------------------------------
describe('getProviders', () => {
  it('returns the three key providers in priority order', () => {
    assert.deepEqual(getProviders(), ['gemini', 'groq', 'openrouter']);
  });
});

// ---------------------------------------------------------------------------
// buildPrompts
// ---------------------------------------------------------------------------
describe('buildPrompts', () => {
  it('builds system and user prompts', () => {
    const p = buildPrompts({ level: 'plain', text: 'Some input text here for testing purposes.' });
    assert.ok(p.system.length > 20);
    assert.ok(p.user.includes('Some input text'));
    assert.ok(typeof p.maxTokens === 'number' && p.maxTokens > 0);
  });

  it('never sends the key inside the prompt', () => {
    const p = buildPrompts({ level: 'plain', text: 'sk-test-key-should-not-appear' });
    assert.ok(!p.system.includes('sk-test'));
  });
});

// ---------------------------------------------------------------------------
// buildRequest
// ---------------------------------------------------------------------------
describe('buildRequest', () => {
  const prompt = { system: 'sys', user: 'usr', maxTokens: 100 };

  it('gemini puts the key in the query param, never in a header', () => {
    const r = buildRequest('gemini', 'KEY123', prompt);
    assert.ok(r.url.includes('key=KEY123'));
    assert.ok(!('Authorization' in r.headers));
    assert.equal(r.method, 'POST');
  });

  it('groq uses a Bearer Authorization header', () => {
    const r = buildRequest('groq', 'KEY123', prompt);
    assert.equal(r.headers['Authorization'], 'Bearer KEY123');
    assert.ok(!r.url.includes('KEY123'));
  });

  it('openrouter uses a Bearer Authorization header', () => {
    const r = buildRequest('openrouter', 'KEY123', prompt);
    assert.equal(r.headers['Authorization'], 'Bearer KEY123');
  });

  it('llm7 sends no key at all', () => {
    const r = buildRequest('llm7', '', prompt);
    assert.ok(!('Authorization' in r.headers));
    assert.ok(!r.url.includes('key='));
  });

  it('throws on unknown provider', () => {
    assert.throws(() => buildRequest('nope', 'k', prompt), /Unknown provider/);
  });
});

// ---------------------------------------------------------------------------
// parseResponse
// ---------------------------------------------------------------------------
describe('parseResponse', () => {
  it('parses a gemini success payload', () => {
    const json = { candidates: [{ content: { parts: [{ text: 'Hello world' }] } }] };
    const r = parseResponse('gemini', 200, json);
    assert.equal(r.ok, true);
    assert.equal(r.data?.text, 'Hello world');
  });

  it('parses an OpenAI-shape success payload', () => {
    const json = { choices: [{ message: { content: 'Done.' } }] };
    const r = parseResponse('groq', 200, json);
    assert.equal(r.ok, true);
    assert.equal(r.data?.text, 'Done.');
  });

  it('flags 401 as unauthorized with key guidance', () => {
    const r = parseResponse('groq', 401, { error: { message: 'bad key' } });
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'unauthorized');
    assert.match(r.message ?? '', /key/i);
  });

  it('flags 429 as rate-limited', () => {
    const r = parseResponse('gemini', 429, null);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'rate-limited');
  });

  it('flags 402 as billing', () => {
    const r = parseResponse('openrouter', 402, null);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'billing');
  });

  it('flags 500 as server-error', () => {
    const r = parseResponse('groq', 500, null);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'server-error');
  });

  it('rejects empty success text', () => {
    const r = parseResponse('groq', 200, { choices: [{ message: { content: '   ' } }] });
    assert.equal(r.ok, false);
  });
});

// ---------------------------------------------------------------------------
// getDisclosures
// ---------------------------------------------------------------------------
describe('getDisclosures', () => {
  it('returns honest, non-empty disclosures', () => {
    const d = getDisclosures();
    assert.ok(d.length >= 2);
    for (const s of d) assert.ok(s.length > 10);
  });
});
