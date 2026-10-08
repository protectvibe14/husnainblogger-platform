/**
 * logic.test.ts — AI Hook Generator. node:test, no network.
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
  const good = { topic: 'How I doubled my email list', platform: 'youtube', count: '10' };

  it('accepts valid inputs', () => {
    assert.equal(validateInputs(good).ok, true);
  });

  it('rejects a missing topic', () => {
    assert.equal(validateInputs({ ...good, topic: '' }).ok, false);
  });

  it('rejects a topic under 10 characters', () => {
    assert.equal(validateInputs({ ...good, topic: 'tiny' }).ok, false);
  });

  it('rejects an invalid platform', () => {
    assert.equal(validateInputs({ ...good, platform: 'fax' }).ok, false);
  });

  it('rejects an invalid count', () => {
    assert.equal(validateInputs({ ...good, count: '100' }).ok, false);
  });

  it('accepts all counts', () => {
    for (const count of ['5', '10', '15']) {
      assert.equal(validateInputs({ ...good, count }).ok, true, count);
    }
  });
});

// ---------------------------------------------------------------------------
// buildPrompts
// ---------------------------------------------------------------------------
describe('buildPrompts', () => {
  it('asks for exactly the chosen count, numbered', () => {
    const p = buildPrompts({ topic: 'Meal prep basics', platform: 'tiktok', count: '15' });
    assert.match(p.system, /exactly 15/);
    assert.match(p.system, /Number them 1 to 15/);
    assert.equal(p.maxTokens, 800);
  });

  it('names the platform', () => {
    const p = buildPrompts({ topic: 'Meal prep basics', platform: 'linkedin', count: '5' });
    assert.match(p.system, /linkedin/);
  });

  it('forbids inventing statistics or quotes', () => {
    const p = buildPrompts({ topic: 'Meal prep basics', platform: 'youtube', count: '5' });
    assert.match(p.system, /Do not invent statistics/);
  });
});

// ---------------------------------------------------------------------------
// getDisclosures
// ---------------------------------------------------------------------------
describe('getDisclosures', () => {
  it('warns against misleading clickbait', () => {
    const d = getDisclosures();
    assert.ok(d.some((x) => /mislead/i.test(x)));
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
// buildRequest — exact wire shape per provider
// ---------------------------------------------------------------------------
describe('buildRequest', () => {
  const prompt = { system: 'SYS', user: 'USER', maxTokens: 500 };

  it('gemini: exact URL with encoded key, method, headers, body shape', () => {
    const req = buildRequest('gemini', 'AB+CD/EF==', prompt);
    assert.equal(
      req.url,
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AB%2BCD%2FEF%3D%3D',
    );
    assert.equal(req.method, 'POST');
    assert.deepEqual(req.headers, { 'Content-Type': 'application/json' });
    assert.deepEqual(req.body, {
      system_instruction: { parts: [{ text: 'SYS' }] },
      contents: [{ role: 'user', parts: [{ text: 'USER' }] }],
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
    });
  });

  it('groq: bearer auth, model llama-3.3-70b-versatile, messages order', () => {
    const req = buildRequest('groq', 'gsk_test123', prompt);
    assert.equal(req.url, 'https://api.groq.com/openai/v1/chat/completions');
    assert.equal(req.method, 'POST');
    assert.deepEqual(req.headers, {
      Authorization: 'Bearer gsk_test123',
      'Content-Type': 'application/json',
    });
    const body = req.body as Record<string, unknown>;
    assert.equal(body.model, 'llama-3.3-70b-versatile');
    assert.equal(body.temperature, 0.7);
    assert.equal(body.max_tokens, 500);
    assert.deepEqual(body.messages, [
      { role: 'system', content: 'SYS' },
      { role: 'user', content: 'USER' },
    ]);
  });

  it('openrouter: bearer auth + HTTP-Referer + X-Title headers', () => {
    const req = buildRequest('openrouter', 'sk-or-test', prompt);
    assert.equal(req.url, 'https://openrouter.ai/api/v1/chat/completions');
    assert.equal(req.method, 'POST');
    assert.deepEqual(req.headers, {
      Authorization: 'Bearer sk-or-test',
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://husnainblogger.com',
      'X-Title': 'HusnainBlogger AI Tools',
    });
    const body = req.body as Record<string, unknown>;
    assert.equal(body.model, 'google/gemini-2.5-flash');
    assert.equal(body.max_tokens, 500);
  });

  it('llm7: keyless — no Authorization header, default model', () => {
    const req = buildRequest('llm7', '', prompt);
    assert.equal(req.url, 'https://api.llm7.io/v1/chat/completions');
    assert.equal(req.method, 'POST');
    assert.deepEqual(req.headers, { 'Content-Type': 'application/json' });
    assert.ok(!('Authorization' in req.headers));
    const body = req.body as Record<string, unknown>;
    assert.equal(body.model, 'default');
    assert.deepEqual(body.messages, [
      { role: 'system', content: 'SYS' },
      { role: 'user', content: 'USER' },
    ]);
  });

  it('throws on an unknown provider', () => {
    assert.throws(() => buildRequest('nope', 'k', prompt), /Unknown provider/);
  });

  it('defaults maxTokens when omitted', () => {
    const req = buildRequest('groq', 'k', { system: 's', user: 'u' });
    assert.equal((req.body as Record<string, unknown>).max_tokens, 1024);
  });
});

// ---------------------------------------------------------------------------
// parseResponse — mocked provider payloads
// ---------------------------------------------------------------------------
describe('parseResponse', () => {
  it('gemini success: joins candidate parts', () => {
    const json = {
      candidates: [
        {
          content: { parts: [{ text: 'Hello! ' }, { text: 'How can I help?' }], role: 'model' },
          finishReason: 'STOP',
        },
      ],
    };
    const r = parseResponse('gemini', 200, json);
    assert.equal(r.ok, true);
    assert.equal(r.data?.text, 'Hello! How can I help?');
  });

  it('groq success: reads choices[0].message.content', () => {
    const json = {
      id: 'chatcmpl-abc',
      choices: [{ index: 0, message: { role: 'assistant', content: 'Done.' }, finish_reason: 'stop' }],
    };
    const r = parseResponse('groq', 200, json);
    assert.equal(r.ok, true);
    assert.equal(r.data?.text, 'Done.');
  });

  it('openrouter success', () => {
    const json = {
      choices: [{ message: { role: 'assistant', content: 'Here you go.' } }],
    };
    const r = parseResponse('openrouter', 200, json);
    assert.equal(r.ok, true);
    assert.equal(r.data?.text, 'Here you go.');
  });

  it('llm7 success (OpenAI-compatible shape)', () => {
    const json = {
      choices: [{ message: { role: 'assistant', content: 'Demo reply.' } }],
    };
    const r = parseResponse('llm7', 200, json);
    assert.equal(r.ok, true);
    assert.equal(r.data?.text, 'Demo reply.');
  });

  it('empty success body becomes an honest failure, not a crash', () => {
    const r = parseResponse('gemini', 200, { candidates: [] });
    assert.equal(r.ok, false);
    assert.match(r.message ?? '', /empty response/);
  });

  it('null json on success is handled', () => {
    const r = parseResponse('groq', 200, null);
    assert.equal(r.ok, false);
  });

  it('401 maps to unauthorized and keeps the provider message', () => {
    const json = { error: { message: 'Invalid API key provided', code: 'invalid_api_key' } };
    const r = parseResponse('groq', 401, json);
    assert.equal(r.ok, false);
    assert.equal(r.kind, 'unauthorized');
    assert.match(r.message ?? '', /rejected/);
    assert.match(r.message ?? '', /Invalid API key provided/);
  });

  it('403 also maps to unauthorized', () => {
    const r = parseResponse('gemini', 403, { error: { message: 'Forbidden' } });
    assert.equal(r.kind, 'unauthorized');
  });

  it('429 maps to rate-limited', () => {
    const json = { error: { message: 'Rate limit reached for model' } };
    const r = parseResponse('openrouter', 429, json);
    assert.equal(r.kind, 'rate-limited');
    assert.match(r.message ?? '', /Rate limit/);
  });

  it('402 maps to billing', () => {
    const r = parseResponse('openrouter', 402, { error: { message: 'Insufficient credits' } });
    assert.equal(r.kind, 'billing');
    assert.match(r.message ?? '', /billing or credits/);
  });

  it('500 maps to server-error without blaming the key', () => {
    const r = parseResponse('gemini', 500, {});
    assert.equal(r.kind, 'server-error');
    assert.match(r.message ?? '', /Nothing is wrong with your key/);
  });

  it('gemini 400 INVALID_ARGUMENT surfaces the provider message', () => {
    const json = {
      error: {
        code: 400,
        message: 'API key not valid. Please pass a valid API key.',
        status: 'INVALID_ARGUMENT',
      },
    };
    const r = parseResponse('gemini', 400, json);
    assert.equal(r.kind, 'bad-request');
    assert.match(r.message ?? '', /API key not valid/);
  });

  it('string-shaped provider error is surfaced too', () => {
    const r = parseResponse('llm7', 400, { error: 'bad request: model not found' });
    assert.equal(r.kind, 'bad-request');
    assert.match(r.message ?? '', /model not found/);
  });
});
