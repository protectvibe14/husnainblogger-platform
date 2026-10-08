/**
 * tool-369 — X Username Generator (generator)
 *
 * Pure client-side combinatorial handle generator. Sanitizes the user's
 * base name and combines it with fixed affix banks per style. NOT AI.
 *
 * FIXED BANKS (documented sizes):
 *   short style        → 10 candidate shapes (truncated to ≤8 chars)
 *   professional style → 8 suffixes + 4 prefixes
 *   keyword style      → 10 keyword suffixes
 *
 * Conservative handle rules (documented, not claimed as "current official"
 * X policy): ≤15 characters, only letters/numbers/underscore, no spaces,
 * never starts with a digit (an "x" is prepended instead). Overlong bases
 * are truncated from the end. Handles are lowercased.
 *
 * HONESTY: availability checking is explicitly out of scope — a note
 * always tells the user to check availability on X itself.
 *
 * Deterministic: same inputs → identical handle list, always.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Conservative handle cap used everywhere. */
export const HANDLE_MAX_CHARS = 15;

/** Target cap for the "short" style. */
export const SHORT_MAX_CHARS = 8;

/** Styles the generator supports. */
export const STYLES: ReadonlyArray<string> = ['short', 'professional', 'keyword'];

/** Bank: 8 professional suffixes. */
const PROFESSIONAL_SUFFIXES: ReadonlyArray<string> = [
  '', '_pro', '_hq', '_daily', '_tips', '_coach', '_media', '_lab',
];

/** Bank: 4 professional prefixes. */
const PROFESSIONAL_PREFIXES: ReadonlyArray<string> = ['the', 'real', 'ask', 'get'];

/** Bank: 10 keyword suffixes. */
const KEYWORD_SUFFIXES: ReadonlyArray<string> = [
  'tips', 'daily', 'hq', 'labs', 'pro', 'hub', 'life', 'coach', 'media', 'guide',
];

/** Bank: 10 short-style candidate shapes (functions of the base). */
function shortCandidates(base: string): string[] {
  const t = (n: number): string => base.slice(0, Math.max(1, n));
  return [
    t(8),
    t(7) + 'x',
    t(6) + 'hq',
    'the' + t(5),
    t(6) + 'io',
    t(6) + 'tv',
    'x' + t(7),
    'ask' + t(5),
    t(5) + '_hq',
    t(4) + 'daily',
  ];
}

function professionalCandidates(base: string): string[] {
  const out: string[] = [];
  for (const s of PROFESSIONAL_SUFFIXES) out.push(base + s);
  for (const p of PROFESSIONAL_PREFIXES) out.push(p + '_' + base);
  return out;
}

function keywordCandidates(base: string): string[] {
  return KEYWORD_SUFFIXES.map((s) => base + s);
}

/** Keep only [a-z0-9_], lowercased. */
function sanitize(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_');
}

/** Enforce the conservative handle rules on one candidate. */
function normalize(candidate: string, cap: number): string {
  let h = candidate;
  if (/^[0-9]/.test(h)) h = 'x' + h; // never start with a digit
  h = h.replace(/^_+/, ''); // never start with an underscore either
  if (h.length > cap) h = h.slice(0, cap);
  return h;
}

function buildHandles(base: string, style: string): string[] {
  const cap = style === 'short' ? SHORT_MAX_CHARS : HANDLE_MAX_CHARS;
  const raw =
    style === 'short'
      ? shortCandidates(base)
      : style === 'keyword'
        ? keywordCandidates(base)
        : professionalCandidates(base);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of raw) {
    const h = normalize(c, cap);
    if (h && !seen.has(h)) {
      seen.add(h);
      out.push(h);
    }
  }
  // Deterministic padding with numeric suffixes if a tiny base deduped hard.
  let n = 1;
  while (out.length < 10 && n < 100) {
    const h = normalize(base + n, cap);
    if (h && !seen.has(h)) {
      seen.add(h);
      out.push(h);
    }
    n++;
  }
  return out.slice(0, 10);
}

export function runTool(values: Record<string, unknown>): ToolResult {
  const rawBase = values['baseName'];
  const rawStyle = values['style'];

  if (typeof rawBase !== 'string' || !rawBase.trim()) {
    return { ok: false, error: 'Enter a base name to build username ideas from.' };
  }
  const base = sanitize(rawBase.trim());
  if (!base) {
    return {
      ok: false,
      error: 'The base name must contain at least one letter or number.',
    };
  }
  if (base.replace(/_/g, '').length === 0) {
    return {
      ok: false,
      error: 'The base name must contain at least one letter or number.',
    };
  }

  let style = typeof rawStyle === 'string' ? rawStyle.trim().toLowerCase() : '';
  const notes: string[] = [];
  if (STYLES.indexOf(style) === -1) {
    if (style) {
      notes.push('Style "' + style + '" is not supported — using "professional" instead.');
    }
    style = 'professional';
  }

  const baseTruncated = base.length > HANDLE_MAX_CHARS;
  const handles = buildHandles(base, style);

  if (baseTruncated) {
    notes.push(
      'The base name was longer than 15 characters, so handles were shortened to fit the limit.',
    );
  }
  notes.push(
    'Availability must be checked on X itself — these handles are generated, not reserved, and popular ones may already be taken.',
  );

  return {
    ok: true,
    values: {
      handles,
      notes,
    },
  };
}
