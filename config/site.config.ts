/**
 * site.config.ts — single source of truth for site identity, canonical URLs,
 * and deploy shape. Owned by MA1.
 *
 * This file is read at BUILD TIME only. The Astro app emits plain static
 * HTML, so nothing here is secret and nothing here may depend on runtime
 * environment. `seo.ts` (app/src/lib/seo/) builds every canonical URL from
 * `site` + `base` below — no page, template, or sitemap script may hardcode
 * an absolute URL. (ADR-007: deploy-shape agnostic.)
 *
 * Deploy shape (locked 2026-10-01 — see docs/architecture/CROSS_MASTER_DECISIONS.md):
 * `base` is ALWAYS '/tools' — the /tools namespace in canonical URLs comes from
 * the deploy base, never from route files. Only `site` switches shape:
 *   A1 (Hostinger): site: 'https://husnainblogger.com'              (dist/* → public_html/tools/)
 *   C1 (Vercel):    site: 'https://tools.husnainblogger.com'        (dist/* served under /tools/* via rewrite)
 *
 * Changing `site` re-points every canonical, sitemap <loc>, and JSON-LD url —
 * so a shape change cannot create duplicate-content chaos.
 */

export interface SiteConfig {
  /** Public brand name used in title tags and schema. */
  name: string;
  /** Canonical origin — protocol + host, NO trailing slash, NO path. */
  site: string;
  /** Deploy base path. LOCKED to '/tools' for both supported shapes (A1/C1). */
  base: string;
  /** <html lang> — locked: English-only audience (US/UK/CA/AU). */
  lang: 'en';
  /** Default currency for schema offers and formatting helpers. */
  currency: 'USD';
  /** theme-color meta + manifest. Single value site-wide (MA1-DesignSystem locks the hex). */
  themeColor: string;
  /** Default OG image (1200x630) used when a page has no per-page image. Must exist in app/public/. */
  defaultOgImage: string;
  /** Organization schema fields — fill with REAL values only; empty = omit from markup. */
  organization: {
    legalName: string;
    logo: string; // absolute path from base, e.g. '/images/logo.png'
    sameAs: string[]; // real social profiles only; [] = omitted
  };
  /** Contact/newsletter: zero-backend rule — hosted endpoint URL set at deploy time, or '' if undecided (open Q2). */
  contactEndpoint: string;
}

export const siteConfig: SiteConfig = {
  name: 'HusnainBlogger',
  // ⚠️ PLACEHOLDER pending Lead's hosting-shape decision (open Q1).
  // Subdomain shape: 'https://tools.husnainblogger.com' + base '/'
  // Subpath shape:   'https://husnainblogger.com'       + base '/tools'
  site: 'https://husnainblogger.com',
  base: '/tools',
  lang: 'en',
  currency: 'USD',
  themeColor: '#0f172a',
  defaultOgImage: '/images/og-default.png',
  organization: {
    legalName: 'HusnainBlogger',
    logo: '/images/logo.png',
    sameAs: [], // TODO(MA3): add real social profiles; empty array = no sameAs emitted
  },
  contactEndpoint: '', // TODO(Lead open Q2): third-party hosted endpoint or documented no-backend alternative
};

/**
 * URL SCHEME (locked by MA1, 2026-10-01 — see docs/architecture/CROSS_MASTER_DECISIONS.md):
 *
 * Physical Astro routes OMIT the `/tools` namespace:
 *   src/pages/[category]/[tool].astro  →  dist/<category>/<slug>/index.html
 *   src/pages/[hub].astro               →  dist/<categorySlug>-tools/index.html
 *   src/pages/index.astro               →  dist/index.html (the tools directory)
 *
 * The `/tools` namespace comes from the DEPLOY BASE, which is ALWAYS '/tools':
 *   A1 (Hostinger):  dist/* deployed to public_html/tools/  → served at /tools/…
 *   C1 (Vercel):     dist/* served under /tools/* via vercel.json rewrite (see DEPLOYMENT.md)
 *
 * So:  served URL  = base + physicalPath   (e.g. /tools/youtube/x/)
 *      canonical   = site + served URL      (e.g. https://husnainblogger.com/tools/youtube/x/)
 * This matches MA3's URL_TAXONOMY.md in every deploy shape, and makes a
 * `/tools/tools/…` doubling impossible. NEVER hardcode `/tools/…` paths in
 * pages/templates — always build them with the helpers below.
 */

/** Deploy base path. LOCKED to '/tools' for both shortlisted shapes (A1, C1). */
function deployBase(): string {
  return siteConfig.base.replace(/\/$/, '');
}

/** Served href for a physical route path (physical path starts with '/'). */
export function appPath(physicalPath: string): string {
  const clean = physicalPath.startsWith('/') ? physicalPath : `/${physicalPath}`;
  return `${deployBase()}${clean}`;
}

/** Absolute canonical URL for a physical route path. */
export function canonicalUrl(physicalPath: string): string {
  return `${siteConfig.site}${appPath(physicalPath)}`;
}

/** Physical path builders (no base, no host) — the single source of route shapes. */
export function toolPhysicalPath(t: { categorySlug: string; slug: string }): string {
  return `/${t.categorySlug}/${t.slug}/`;
}
export function hubPhysicalPath(categorySlug: string): string {
  return `/${categorySlug}-tools/`;
}

/** Served hrefs (base-aware, for <a href>). */
export function toolHref(t: { categorySlug: string; slug: string }): string {
  return appPath(toolPhysicalPath(t));
}
export function hubHref(categorySlug: string): string {
  return appPath(hubPhysicalPath(categorySlug));
}
export function toolsIndexHref(): string {
  return appPath('/');
}
