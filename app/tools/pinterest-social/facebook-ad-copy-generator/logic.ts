/**
 * facebook-ad-copy-generator — logic.ts
 *
 * Fixed copy-template engine. NOT AI: ad copy is assembled from a FIXED bank
 * of 8 primary-text templates and 4 description templates with the user's
 * offer and CTA slotted in.
 *
 * Fixed banks (documented for honesty):
 *   - PRIMARY_TEMPLATES: 8 primary-text templates (CTA placed within the
 *     first 125 characters in every template).
 *   - DETAIL_BANK: 4 neutral closing sentences (no performance or business
 *     claims about the user's offer).
 *   - DESCRIPTION_TEMPLATES: 3 short description templates, each compressed
 *     at a word boundary to <= 30 characters.
 *
 * Hard rules:
 *   - The CTA always appears within the first 125 characters of primaryText
 *     (the visible window before "See more").
 *   - description is STRICTLY <= 30 chars.
 *   - No performance claims, invented stats, or delivery promises anywhere.
 *   - This tool writes copy only — it has no Ads Manager integration and
 *     places no ads (stated in UI copy/assumptions, not in code).
 *
 * Deterministic: template picks rotate from a hash of offer + cta, so the
 * same inputs always return the same copy.
 */

const PRIMARY_TEMPLATES: string[] = [
  '{cta}: {offer}. {detail}',
  'Tired of missing out? {cta} and see {offer}. {detail}',
  '{offer} — {cta} today. {detail}',
  "Here's the deal: {offer}. {cta} {detail}",
  'Ready for something better? {cta} for {offer}. {detail}',
  '{cta} now — {offer}. {detail}',
  "Don't wait. {cta}: {offer}. {detail}",
  'One click away: {offer}. {cta} {detail}',
];

const DETAIL_BANK: string[] = [
  'Full details on the next page.',
  "See what's included before you decide.",
  'Check it out and decide for yourself.',
  'Everything you need to know is inside.',
];

const DESCRIPTION_TEMPLATES: string[] = [
  '{cta}: {offerShort}',
  '{offerShort} — {cta}',
  'Get {offerShort} Now',
];

const HEADLINE_TIP =
  'Pair this with a benefit-led headline of 40 characters or fewer — ' +
  'try the Facebook Ad Headline Generator for headline ideas that match this copy.';

const DEFAULT_CTA = 'Learn more';
const DESC_CAP = 30;
const CTA_WINDOW = 125;

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function wordTrim(s: string, maxChars: number): string {
  const words = s.trim().split(/\s+/).filter(Boolean);
  const kept: string[] = [];
  let len = 0;
  for (const w of words) {
    const add = (kept.length === 0 ? 0 : 1) + w.length;
    if (len + add > maxChars) break;
    kept.push(w);
    len += add;
  }
  return kept.join(' ');
}

function fillTemplate(template: string, map: Record<string, string>): string {
  let out = template;
  for (const key of Object.keys(map)) {
    out = out.split('{' + key + '}').join(map[key] as string);
  }
  return out.replace(/\s+/g, ' ').trim();
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const offerRaw = values['offer'];
  const offer = typeof offerRaw === 'string' ? offerRaw.trim() : '';
  if (offer.length === 0) {
    return { ok: false, error: 'Describe your offer first — e.g. "50% off our starter skincare kit".' };
  }
  if (offer.length > 100) {
    return { ok: false, error: 'Offer must be 100 characters or fewer.' };
  }

  const ctaRaw = values['cta'];
  const cta = typeof ctaRaw === 'string' && ctaRaw.trim().length > 0
    ? ctaRaw.trim()
    : DEFAULT_CTA;
  if (cta.length > 60) {
    return { ok: false, error: 'CTA must be 60 characters or fewer.' };
  }

  const h = hashStr(offer + '|' + cta);
  const primaryTemplate = PRIMARY_TEMPLATES[h % PRIMARY_TEMPLATES.length] as string;
  const detail = DETAIL_BANK[h % DETAIL_BANK.length] as string;
  const primaryText = fillTemplate(primaryTemplate, { cta: cta, offer: offer, detail: detail });

  const descTemplate = DESCRIPTION_TEMPLATES[h % DESCRIPTION_TEMPLATES.length] as string;
  const offerShort = wordTrim(offer, 16);
  const description = wordTrim(
    fillTemplate(descTemplate, { cta: cta, offerShort: offerShort }),
    DESC_CAP,
  );

  return {
    ok: true,
    values: {
      primaryText: primaryText,
      description: description,
      headlineTip: HEADLINE_TIP,
    },
  };
}
