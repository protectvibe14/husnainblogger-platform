/**
 * tool-382 — X Banner Text Generator (generator)
 *
 * GENERATOR, NOT AI. Produces short banner text-copy options from FIXED
 * layout templates — 6 layout frames + 6 CTA one-liners. Placeholders
 * {tagline} / {offer} are filled with the user's text verbatim. This tool
 * outputs TEXT COPY ONLY; it does not render images (the user pairs the
 * copy with a designer or canvas tool).
 *
 * Fixed, documented rules:
 *   1. Every line is capped at MAX_LINE_CHARS (60) characters for legibility
 *      on a 1500×500 X banner. Longer lines are trimmed at a word boundary
 *      and end with an ellipsis — never cut mid-word.
 *   2. Layouts that need {offer} are skipped when no offer is given.
 *   3. CTA picks are deterministic: djb2(tagline + offer) selects the CTAs,
 *      so the same inputs always yield the same banner copy.
 *   4. safeZoneNote is a fixed string (static safe-zone guidance):
 *      on desktop the profile photo overlaps the bottom-left of the banner,
 *      so key words belong in the center-right safe area.
 *
 * No network, no DOM, no randomness, zero imports. Deterministic.
 */

export const MAX_LINE_CHARS = 60;

export interface BannerResult {
  bannerCopy: string[];
  safeZoneNote: string;
}

/** 6 fixed CTA one-liners (picked deterministically, never invented per-run). */
export const CTA_BANK: string[] = [
  'Follow for more',
  'New here? Follow along',
  'Join 1,000+ readers',
  'DM me to start',
  'Link below to begin',
  'Free guide in bio',
];

type Layout = (tagline: string, offer: string, cta: string) => string | null;

/**
 * 6 fixed layout frames. Frames returning null are skipped (e.g. when they
 * need an offer the user did not provide).
 */
const LAYOUTS: { label: string; needsOffer: boolean; build: Layout }[] = [
  { label: 'tagline-only', needsOffer: false, build: (t) => t },
  { label: 'tagline-offer', needsOffer: true, build: (t, o) => `${t} — ${o}` },
  { label: 'offer-tagline', needsOffer: true, build: (t, o) => `${o} | ${t}` },
  { label: 'tagline-cta', needsOffer: false, build: (t, _o, c) => `${t}: ${c}` },
  { label: 'offer-cta', needsOffer: true, build: (_t, o, c) => `${o} — ${c}` },
  { label: 'cta-tagline', needsOffer: false, build: (t, _o, c) => `${c} · ${t}` },
];

/**
 * Fixed safe-zone guidance (static, from X's documented banner layout).
 * Banner is 1500×500; the profile photo overlaps the bottom-left on desktop.
 */
export const SAFE_ZONE_NOTE =
  'Keep text center-right: X banners are 1500×500 and your profile photo ' +
  'overlaps the bottom-left on desktop, so keep key words in the center-right ' +
  'safe area (~1260×330 center) and every line at 60 characters or fewer for legibility.';

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Trim to maxLen at a word boundary, appending "…" when trimmed.
 * Never cuts mid-word; if no space fits, hard-truncates to maxLen - 1 + "…".
 */
export function trimToFit(line: string, maxLen: number): string {
  const s = line.trim().replace(/\s+/g, ' ');
  if (s.length <= maxLen) return s;
  const cut = s.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > 0) return cut.slice(0, lastSpace) + '…';
  return cut + '…';
}

export function generateBannerCopy(taglineRaw: unknown, offerRaw: unknown): BannerResult {
  const tagline = typeof taglineRaw === 'string' ? taglineRaw.trim().replace(/\s+/g, ' ') : '';
  if (tagline.length === 0) {
    throw new Error('Please enter your tagline (the main line for your banner).');
  }
  if (tagline.length > 200) {
    throw new Error('Tagline is too long — keep it under 200 characters; banners need short copy.');
  }
  const offer = typeof offerRaw === 'string' ? offerRaw.trim().replace(/\s+/g, ' ') : '';
  if (offer.length > 200) {
    throw new Error('Offer is too long — keep it under 200 characters.');
  }

  // Deterministic CTA selection: two distinct CTAs from the fixed bank.
  const hash = djb2(tagline.toLowerCase() + '|' + offer.toLowerCase());
  const ctaA = CTA_BANK[hash % CTA_BANK.length];
  const ctaB = CTA_BANK[(hash % CTA_BANK.length + 3) % CTA_BANK.length];

  const ctas = [ctaA, ctaB];
  const bannerCopy: string[] = [];
  let ctaIdx = 0;
  for (const layout of LAYOUTS) {
    if (layout.needsOffer && offer.length === 0) continue;
    const raw = layout.build(tagline, offer, ctas[ctaIdx % ctas.length]);
    ctaIdx++;
    if (raw === null) continue;
    bannerCopy.push(trimToFit(raw, MAX_LINE_CHARS));
  }

  return { bannerCopy, safeZoneNote: SAFE_ZONE_NOTE };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Platform entry point. values: { tagline: string, offer?: string }.
 * Returns { bannerCopy: string[], safeZoneNote: string }.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  try {
    const result = generateBannerCopy(values['tagline'], values['offer']);
    return {
      ok: true,
      values: {
        bannerCopy: result.bannerCopy,
        safeZoneNote: result.safeZoneNote,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid input.' };
  }
}
