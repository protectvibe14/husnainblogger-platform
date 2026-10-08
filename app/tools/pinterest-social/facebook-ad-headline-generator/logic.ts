/**
 * facebook-ad-headline-generator — logic.ts
 *
 * Fixed headline-template engine. NOT AI: headlines are assembled from a FIXED
 * bank of 18 hand-written copywriting templates (benefit-led formulas like
 * "benefit + time window", "product: benefit", "shortcut framing") with the
 * user's product and benefit slotted in.
 *
 * Fixed banks (documented for honesty):
 *   - HEADLINE_TEMPLATES: 18 templates (no filler openers like "Introducing…").
 *
 * Hard rules:
 *   - 40-character cap is STRICT: after substitution, every headline is cut
 *     at a word boundary to <= 40 chars (never emits over-cap copy, since ad
 *     delivery truncates beyond 40).
 *   - No performance claims are invented (no fake percentages, no "guaranteed").
 *   - No "AI generation" is claimed anywhere.
 *
 * Deterministic: template order rotates from a hash of product + benefit, so
 * the same inputs always return the same 10 headlines.
 */

const HEADLINE_TEMPLATES: string[] = [
  '{benefit} with {product}',
  'Get {benefit} Today',
  '{product}: {benefit} Fast',
  'Stop Guessing — {benefit}',
  'Your {benefit} Starts Here',
  '{benefit} in 7 Days',
  'Finally: {benefit} Made Easy',
  '{product} = {benefit}',
  'The Easy Way to {benefit}',
  'Real {benefit}, No Hype',
  'New: {product} for {benefit}',
  'Save Time, Get {benefit}',
  'The {benefit} Shortcut',
  'Love {product}? Get {benefit}',
  'Ready for {benefit}? Start Now',
  '{benefit} Made Simple',
  'Try {product} Today',
  'Your Shortcut to {benefit}',
];

const HEADLINE_COUNT = 10;
const HARD_CAP = 40;

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Cut a phrase to whole words, capped at maxChars. */
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

function fill(template: string, product: string, benefit: string): string {
  let out = template.split('{product}').join(product).split('{benefit}').join(benefit);
  out = out.replace(/\s+/g, ' ').trim();
  if (out.length <= HARD_CAP) return out;
  // Compress at a word boundary; never emit over-cap.
  const compressed = wordTrim(out, HARD_CAP);
  return compressed.length > 0 ? compressed : out.slice(0, HARD_CAP);
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const productRaw = values['product'];
  const benefitRaw = values['benefit'];
  const product = typeof productRaw === 'string' ? productRaw.trim() : '';
  const benefit = typeof benefitRaw === 'string' ? benefitRaw.trim() : '';

  if (product.length === 0) {
    return { ok: false, error: 'Enter your product name first — e.g. "Glow Serum".' };
  }
  if (product.length > 60) {
    return { ok: false, error: 'Product name must be 60 characters or fewer.' };
  }
  if (benefit.length === 0) {
    return { ok: false, error: 'Enter the main benefit — e.g. "clearer skin in weeks".' };
  }
  if (benefit.length > 80) {
    return { ok: false, error: 'Benefit must be 80 characters or fewer.' };
  }

  // Pre-trim inputs so short templates almost always fit without compression.
  const productShort = wordTrim(product, 18);
  const benefitShort = wordTrim(benefit, 24);

  const start = hashStr(product + '|' + benefit) % HEADLINE_TEMPLATES.length;
  const headlines: string[] = [];
  for (let i = 0; i < HEADLINE_COUNT; i++) {
    const template = HEADLINE_TEMPLATES[(start + i) % HEADLINE_TEMPLATES.length] as string;
    headlines.push(fill(template, productShort, benefitShort));
  }

  return {
    ok: true,
    values: { headlines: headlines },
  };
}
