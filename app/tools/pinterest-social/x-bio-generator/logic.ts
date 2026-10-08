/**
 * tool-368 — X Bio Generator (generator)
 *
 * Pure client-side text generator. Fills 12 fixed bio templates with the
 * user's inputs and returns 8 deterministic variants. NOT AI: every bio
 * comes from a fixed template bank (documented below); the same inputs
 * always produce the same 8 bios.
 *
 * TEMPLATE BANK: 12 templates (pipe, sentence, emoji-lead, and
 * multi-line styles). A deterministic djb2 hash of the inputs picks the
 * rotation start so different people see a different slice of the bank —
 * still fully deterministic.
 *
 * X bio cap: every variant is enforced to ≤160 characters (code points).
 * Compression strategy when inputs are long: 1) the CTA is dropped,
 * 2) then the longest field is cut at a word boundary with an ellipsis.
 * Inputs longer than 160 chars are trimmed to 160 first, with a warning.
 *
 * A link-field reminder is always attached: put the URL in the profile's
 * website field, not in the bio text.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Bio character cap (code points), enforced on every variant. */
export const BIO_MAX_CHARS = 160;

/** Number of template banks below: 12 fixed templates. */
export type BioTemplate = (w: string, d: string, c: string) => string;

export const TEMPLATES: ReadonlyArray<BioTemplate> = [
  (w, d, c) => `${w} | ${d} | ${c}`,
  (w, d, c) => `I help ${d} — ${w}. ${c}`,
  (w, d, c) => `${w} 👇 ${d} | ${c}`,
  (w, d, c) => `✨ ${w} · ${d} · ${c}`,
  (w, d, c) => `${w}: I help with ${d}. ${c}`,
  (w, d, c) => `${d} | ${w} 🚀 ${c}`,
  (w, d, c) => `Helping ${d} | ${w} | ${c}`,
  (w, d, c) => `${w} — ${d}. 👇 ${c}`,
  (w, d, c) => `📍 ${w}\n${d}\n${c}`,
  (w, d, c) => `${w} | I do ${d} | ${c}`,
  (w, d, c) => `💡 ${d} tips daily | ${w} | ${c}`,
  (w, d, c) => `${w} · ${d} · ${c}`,
];

/** How many variants the tool returns (a rotated slice of the 12 templates). */
export const VARIANT_COUNT = 8;

/** Code-point length (emoji count as one character here). */
export function charLen(s: string): number {
  return [...s].length;
}

/** Deterministic djb2 hash over code points. */
export function hashStr(s: string): number {
  let h = 5381;
  for (const ch of s) {
    h = ((h << 5) + h + ch.codePointAt(0)!) >>> 0;
  }
  return h;
}

/** Clean up leftover separators when the CTA (or a field) is empty. */
function tidy(s: string): string {
  let out = s.replace(/[ \t]{2,}/g, ' ');
  out = out.replace(/(\|\s*){2,}/g, '| ');
  out = out.replace(/(·\s*){2,}/g, '· ');
  out = out.replace(/\n{2,}/g, '\n');
  out = out
    .split('\n')
    .map((line) => line.replace(/[\s|·—\-–👇✨🚀💡📍.]+$/u, '').trim())
    .filter((line) => line.length > 0)
    .join('\n');
  return out.trim();
}

/** Cut to the cap at a word boundary, appending an ellipsis. */
function hardFit(s: string): string {
  const cps = [...s];
  if (cps.length <= BIO_MAX_CHARS) return s;
  const head = cps.slice(0, BIO_MAX_CHARS - 1).join('');
  const lastSpace = head.lastIndexOf(' ');
  const cut = lastSpace > BIO_MAX_CHARS / 2 ? head.slice(0, lastSpace) : head;
  return cut + '…';
}

function buildVariant(tpl: BioTemplate, w: string, d: string, c: string): string {
  let s = tidy(tpl(w, d, c));
  if (charLen(s) > BIO_MAX_CHARS && c) {
    s = tidy(tpl(w, d, '')); // drop the CTA first
  }
  return hardFit(s);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function runTool(values: Record<string, unknown>): ToolResult {
  const rawW = values['whoYouAre'];
  const rawD = values['whatYouDo'];
  const rawC = values['cta'];
  if (typeof rawW !== 'string' && rawW !== undefined) {
    return { ok: false, error: 'Who you are must be text.' };
  }
  if (typeof rawD !== 'string' && rawD !== undefined) {
    return { ok: false, error: 'What you do must be text.' };
  }

  let w = asString(rawW);
  let d = asString(rawD);
  let c = asString(rawC);
  const notes: string[] = [];

  if (!w || !d) {
    return {
      ok: false,
      error: 'Tell us who you are and what you do — both fields are required.',
    };
  }

  const compress = (label: string, v: string): string => {
    if (charLen(v) > BIO_MAX_CHARS) {
      notes.push(
        label + ' was longer than 160 characters, so it was trimmed before generating.',
      );
      return hardFit(v);
    }
    return v;
  };
  w = compress('Who you are', w);
  d = compress('What you do', d);
  c = compress('Call to action', c);

  const start = hashStr(w + '|' + d + '|' + c) % TEMPLATES.length;
  const bios: string[] = [];
  for (let i = 0; i < VARIANT_COUNT; i++) {
    const tpl = TEMPLATES[(start + i) % TEMPLATES.length];
    bios.push(buildVariant(tpl, w, d, c));
  }

  notes.push(
    'Put your link in the profile website field, not in the bio — bio URLs eat into your 160 characters and are not clickable.',
  );

  return {
    ok: true,
    values: {
      bioVariants: bios,
      notes,
    },
  };
}
