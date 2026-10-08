/**
 * tool-384 — X Niche Positioning Generator (generator)
 *
 * GENERATOR, NOT AI. Produces 5 bio-ready positioning statements from a
 * FIXED frame bank — 10 statement frames with {niche} / {audience}
 * placeholders filled from the user's text verbatim. Each frame carries one
 * clear promise; frames are short enough for X's 160-character bio limit.
 *
 * Fixed, documented rules:
 *   1. 5 statements per run, picked deterministically: offset =
 *      djb2(niche + "|" + audience) mod 10, then 5 consecutive frames
 *      (wrapping). Same inputs -> same 5 statements, always.
 *   2. 160-char bio-fit enforced: any statement longer than BIO_LIMIT (160)
 *      is trimmed at a word boundary with "…" — this only triggers for
 *      unusually long niche/audience text since every frame is naturally
 *      short.
 *   3. {Niche} capitalizes the niche's first letter; {niche}/{audience}
 *      are used verbatim.
 *
 * No network, no DOM, no randomness, zero imports.
 */

export const BIO_LIMIT = 160;
export const STATEMENT_COUNT = 5;

/**
 * 10 fixed positioning frames. Each states ONE promise and reads naturally
 * as (or inside) an X profile bio.
 */
export const FRAMES: string[] = [
  'I help {audience} win at {niche} — no fluff, just what works.',
  '{Niche} for {audience}, explained simply. Follow for daily breakdowns.',
  'Helping {audience} master {niche} one post at a time.',
  'I turn {niche} into simple playbooks for {audience}.',
  '{audience}: stop guessing at {niche}. Start here.',
  'Daily {niche} tactics for {audience} who want real results.',
  'I make {niche} stupid-simple for {audience}.',
  'Your shortcut to {niche} — built for {audience}.',
  '{audience} doing {niche}: follow for the shortcuts I wish I had.',
  'No-guru {niche} advice for real {audience}.',
];

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function capitalizeFirst(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

function fill(template: string, niche: string, audience: string): string {
  return template
    .split('{niche}').join(niche)
    .split('{Niche}').join(capitalizeFirst(niche))
    .split('{audience}').join(audience);
}

/** Trim to BIO_LIMIT at a word boundary, appending "…" when trimmed. */
export function fitBio(line: string): string {
  const s = line.replace(/\s+/g, ' ').trim();
  if (s.length <= BIO_LIMIT) return s;
  const cut = s.slice(0, BIO_LIMIT - 1);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > 0) return cut.slice(0, lastSpace) + '…';
  return cut + '…';
}

export function generatePositioning(nicheRaw: unknown, audienceRaw: unknown): string[] {
  const niche = typeof nicheRaw === 'string' ? nicheRaw.replace(/\s+/g, ' ').trim() : '';
  if (niche.length === 0) {
    throw new Error('Please enter your niche (e.g. "email marketing").');
  }
  if (niche.length > 80) {
    throw new Error('Niche is too long — keep it under 80 characters so statements fit your bio.');
  }
  const audience = typeof audienceRaw === 'string' ? audienceRaw.replace(/\s+/g, ' ').trim() : '';
  if (audience.length === 0) {
    throw new Error('Please describe your audience (e.g. "busy founders").');
  }
  if (audience.length > 80) {
    throw new Error('Audience is too long — keep it under 80 characters so statements fit your bio.');
  }

  const offset = djb2(niche.toLowerCase() + '|' + audience.toLowerCase()) % FRAMES.length;
  const out: string[] = [];
  for (let i = 0; i < STATEMENT_COUNT; i++) {
    const frame = FRAMES[(offset + i) % FRAMES.length];
    out.push(fitBio(fill(frame, niche, audience)));
  }
  return out;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Platform entry point. values: { niche: string, audience: string }.
 * Returns { positioningStatements: string[] }.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  try {
    return {
      ok: true,
      values: { positioningStatements: generatePositioning(values['niche'], values['audience']) },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid input.' };
  }
}
