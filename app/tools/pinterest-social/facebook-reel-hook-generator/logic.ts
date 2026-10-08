/**
 * facebook-reel-hook-generator — logic.ts
 *
 * Fixed hook-template engine. NOT AI: hooks are assembled from a FIXED bank
 * of 16 hand-written hook templates with the user's topic slotted in.
 *
 * Fixed banks (documented for honesty):
 *   - HOOK_TEMPLATES: 16 hook-line templates (<= 11 base words each).
 *   - Topic is truncated to its first 4 words before substitution, so every
 *     emitted hook is guaranteed <= 15 words (11 + 4 = 15 max).
 *
 * Deterministic: hook order is a rotation of the bank keyed by a hash of the
 * topic, so the same topic always returns the same hooks in the same order.
 */

const HOOK_TEMPLATES: string[] = [
  'Stop doing {topic} wrong — do this instead',
  'The {topic} mistake almost everyone makes',
  '3 {topic} tips you need today',
  'POV: your {topic} finally works',
  "I tried {topic} for 30 days — here's what happened",
  'Why nobody talks about this {topic} trick',
  'Do this before your next {topic} attempt',
  '{topic} in 10 seconds — watch this',
  'Rating popular {topic} advice until one works',
  'What I wish I knew before starting {topic}',
  'The {topic} hack that saves you hours',
  'Unpopular {topic} opinion (but it\u2019s true)',
  'Nobody believes this {topic} result was real',
  'If you struggle with {topic}, watch this',
  'This {topic} tip changed everything for me',
  '5 {topic} mistakes — are you making #3?',
];

const FRAMING_NOTE =
  'Film vertical 9:16 (1080x1920). Put the hook on screen and say it in the ' +
  'first 2 seconds — Facebook viewers decide whether to keep watching almost ' +
  'immediately. Keep on-screen text in the center safe zone (top/bottom ~15% ' +
  'can be covered by UI), and film bright, close-up action so the hook reads ' +
  'on a small phone screen.';

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function wordCount(s: string): number {
  const parts = s.trim().split(/\s+/);
  return parts.filter(function (p) { return p.length > 0; }).length;
}

function shortTopic(topic: string): string {
  return topic.trim().split(/\s+/).filter(Boolean).slice(0, 4).join(' ');
}

function parseCount(raw: unknown): { ok: true; value: number } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === '') {
    return { ok: true, value: 5 };
  }
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { ok: false, error: 'Count must be a whole number between 1 and 10.' };
  }
  if (n < 1 || n > 10) {
    return { ok: false, error: 'Count must be between 1 and 10.' };
  }
  return { ok: true, value: n };
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const topicRaw = values['topic'];
  const topic = typeof topicRaw === 'string' ? topicRaw.trim() : '';
  if (topic.length === 0) {
    return { ok: false, error: 'Enter a topic first — e.g. "budget skincare" or "sourdough baking".' };
  }
  if (topic.length > 60) {
    return { ok: false, error: 'Topic must be 60 characters or fewer.' };
  }

  const countRes = parseCount(values['count']);
  if (!countRes.ok) {
    return { ok: false, error: countRes.error };
  }

  const topicShort = shortTopic(topic);
  const start = hashStr(topic) % HOOK_TEMPLATES.length;
  const hooks: string[] = [];
  for (let i = 0; i < countRes.value; i++) {
    const template = HOOK_TEMPLATES[(start + i) % HOOK_TEMPLATES.length] as string;
    const hook = template.split('{topic}').join(topicShort);
    // Safety net: if a long topic ever slipped through, drop trailing words.
    const words = hook.split(/\s+/).filter(Boolean);
    hooks.push(words.slice(0, 15).join(' '));
  }

  return {
    ok: true,
    values: {
      hooks: hooks,
      framingNote: FRAMING_NOTE,
    },
  };
}
