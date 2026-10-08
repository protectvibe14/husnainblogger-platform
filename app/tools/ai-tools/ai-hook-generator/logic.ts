/**
 * logic.ts — AI Hook Generator, Lane B.
 *
 * PURE module: zero imports. All browser/API plumbing lives here as data +
 * pure functions so it can be unit-tested with node --test (no network).
 *
 * The tool calls the provider the VISITOR chooses, with the VISITOR's key.
 * The key is sent only as an Authorization header (Groq/OpenRouter) or a
 * ?key= query parameter (Gemini) — never to our servers.
 */
export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/** Provider ids in priority order. */
export function getProviders(): string[] {
  return ['gemini', 'groq', 'openrouter'];
}

// ---------------------------------------------------------------------------
// Provider plumbing (pure). Shared spec across all Lane B tools.
// ---------------------------------------------------------------------------

/** Display names used in honest error messages. */
const PROVIDER_NAMES: Record<string, string> = {
  gemini: 'Google Gemini',
  groq: 'Groq',
  openrouter: 'OpenRouter',
  llm7: 'llm7.io',
};

export interface PromptParts {
  system: string;
  user: string;
  maxTokens?: number;
}

export interface BuiltRequest {
  url: string;
  method: 'POST';
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

interface ChatMessage {
  role: string;
  content: string;
}

/**
 * Build the exact fetch arguments for a provider.
 * The API key goes ONLY in the Authorization header (Groq/OpenRouter) or the
 * ?key= query parameter (Gemini). The llm7 lane is keyless and ignores it.
 */
export function buildRequest(
  providerId: string,
  apiKey: string,
  prompt: PromptParts,
): BuiltRequest {
  const maxTokens = prompt.maxTokens ?? 1024;
  const temperature = 0.7;
  const jsonHeaders: Record<string, string> = { 'Content-Type': 'application/json' };

  if (providerId === 'gemini') {
    return {
      url:
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' +
        encodeURIComponent(apiKey),
      method: 'POST',
      headers: jsonHeaders,
      body: {
        system_instruction: { parts: [{ text: prompt.system }] },
        contents: [{ role: 'user', parts: [{ text: prompt.user }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature },
      },
    };
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: prompt.system },
    { role: 'user', content: prompt.user },
  ];

  if (providerId === 'groq') {
    return {
      url: 'https://api.groq.com/openai/v1/chat/completions',
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: { model: 'llama-3.3-70b-versatile', messages, temperature, max_tokens: maxTokens },
    };
  }

  if (providerId === 'openrouter') {
    return {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://husnainblogger.com',
        'X-Title': 'HusnainBlogger AI Tools',
      },
      body: { model: 'google/gemini-2.5-flash', messages, temperature, max_tokens: maxTokens },
    };
  }

  if (providerId === 'llm7') {
    // Keyless lane: community-run demo (no SLA). No Authorization header.
    return {
      url: 'https://api.llm7.io/v1/chat/completions',
      method: 'POST',
      headers: jsonHeaders,
      body: { model: 'default', messages, temperature, max_tokens: maxTokens },
    };
  }

  throw new Error('Unknown provider: ' + providerId);
}

export type ParseKind =
  | 'unauthorized'
  | 'rate-limited'
  | 'billing'
  | 'bad-request'
  | 'server-error'
  | 'unknown';

export interface ParseResult {
  ok: boolean;
  kind?: ParseKind;
  message?: string;
  data?: { text: string };
}

function providerErrorDetail(json: unknown): string {
  if (json && typeof json === 'object') {
    const rec = json as Record<string, unknown>;
    const err = rec.error;
    if (typeof err === 'string' && err.trim()) return err.trim();
    if (err && typeof err === 'object') {
      const msg = (err as Record<string, unknown>).message;
      if (typeof msg === 'string' && msg.trim()) return msg.trim();
    }
  }
  return '';
}

function extractText(providerId: string, json: unknown): string {
  if (!json || typeof json !== 'object') return '';
  const rec = json as Record<string, unknown>;

  if (providerId === 'gemini') {
    const candidates = rec.candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
      const first = candidates[0] as Record<string, unknown>;
      const content = first.content as Record<string, unknown> | undefined;
      const parts = content ? content.parts : undefined;
      if (Array.isArray(parts)) {
        return parts
          .map((p) => {
            const t = (p as Record<string, unknown>).text;
            return typeof t === 'string' ? t : '';
          })
          .join('');
      }
    }
    return '';
  }

  // groq / openrouter / llm7 share the OpenAI chat-completions shape.
  const choices = rec.choices;
  if (Array.isArray(choices) && choices.length > 0) {
    const first = choices[0] as Record<string, unknown>;
    const message = first.message as Record<string, unknown> | undefined;
    const content = message ? message.content : undefined;
    return typeof content === 'string' ? content : '';
  }
  return '';
}

/** Normalize a provider HTTP response into an honest, user-safe outcome. */
export function parseResponse(providerId: string, status: number, json: unknown): ParseResult {
  const name = PROVIDER_NAMES[providerId] ?? providerId;

  if (status >= 200 && status < 300) {
    const text = extractText(providerId, json).trim();
    if (!text) {
      return {
        ok: false,
        kind: 'unknown',
        message: name + ' returned an empty response. Try again, or switch provider.',
      };
    }
    return { ok: true, data: { text } };
  }

  const detail = providerErrorDetail(json);
  const suffix = detail ? ' Provider said: "' + detail.slice(0, 200) + '"' : '';

  if (status === 401 || status === 403) {
    return {
      ok: false,
      kind: 'unauthorized',
      message:
        'Your ' +
        name +
        ' key was rejected (HTTP ' +
        status +
        '). Re-copy it from the provider dashboard and save it again.' +
        suffix,
    };
  }
  if (status === 402) {
    return {
      ok: false,
      kind: 'billing',
      message:
        'Your ' + name + ' account needs billing or credits (HTTP 402). Top up on the provider dashboard, then try again.' + suffix,
    };
  }
  if (status === 429) {
    return {
      ok: false,
      kind: 'rate-limited',
      message:
        'Rate limit reached on ' + name + ' (HTTP 429). Wait a minute and retry, or switch provider.' + suffix,
    };
  }
  if (status >= 500) {
    return {
      ok: false,
      kind: 'server-error',
      message:
        name + ' had a server error (HTTP ' + status + '). Nothing is wrong with your key — wait and retry.' + suffix,
    };
  }
  return {
    ok: false,
    kind: 'bad-request',
    message: 'The request to ' + name + ' failed (HTTP ' + status + ').' + suffix,
  };
}

export const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'twitter-x', 'linkedin'] as const;
export const COUNTS = ['5', '10', '15'] as const;

/** Validate raw client inputs. Returns every problem found. */
export function validateInputs(inputs: Record<string, string>): ValidationResult {
  const errors: string[] = [];

  const topic = (inputs.topic ?? '').trim();
  if (!topic) {
    errors.push('Describe your video or post topic.');
  } else if (topic.length < 10) {
    errors.push('Give a bit more detail — at least 10 characters for the topic.');
  }

  if (!(PLATFORMS as readonly string[]).includes((inputs.platform ?? '').trim())) {
    errors.push('Pick a platform.');
  }
  if (!(COUNTS as readonly string[]).includes((inputs.count ?? '').trim())) {
    errors.push('Pick how many hooks to generate (5, 10, or 15).');
  }

  return { ok: errors.length === 0, errors };
}

/** Build the system/user prompts from validated inputs. */
export function buildPrompts(inputs: Record<string, string>): PromptParts {

  const topic = (inputs.topic ?? '').trim();
  const platform = (inputs.platform ?? '').trim().replace(/-/g, ' ');
  const count = (inputs.count ?? '').trim();

  const system =
    'Write exactly ' + count + ' opening hooks for ' + platform + ' about the user\'s topic. ' +
    'Each hook must be one short line that stops the scroll — curiosity, a bold claim, or a relatable pain point. ' +
    'Number them 1 to ' + count + '. Do not invent statistics or quotes. Output only the numbered hooks.';
  return { system, user: 'Topic: ' + topic, maxTokens: 800 };

}

/** Tool-specific honesty disclosures (provider cost notes live in aiConfig). */
export function getDisclosures(): string[] {
  return [
    'Hooks are opening lines, not full scripts — pair them with content that delivers on the promise.',
    'Avoid publishing bold claims you cannot back up; the model does not invent statistics.',
    'Clickbait that misleads hurts retention — use hooks that match the actual content.',
  ];
}
