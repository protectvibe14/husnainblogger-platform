/**
 * urls.ts — the ONLY place page URLs are constructed.
 *
 * URL scheme (locked by MA1, 2026-10-01 — see docs/architecture/CROSS_MASTER_DECISIONS.md):
 * physical Astro routes omit the `/tools` namespace; the namespace comes from
 * the deploy base (always '/tools'). So:
 *   tool page:  https://husnainblogger.com/tools/<category>/<slug>/
 *   hub:        https://husnainblogger.com/tools/<category>-tools/
 *   tools home: https://husnainblogger.com/tools/
 * This matches MA3's URL_TAXONOMY.md in every deploy shape (A1/C1).
 * No template, page, sitemap script, or JSON-LD builder may hardcode a URL.
 */

import {
  siteConfig,
  appPath,
  canonicalUrl,
  toolPhysicalPath,
  hubPhysicalPath,
} from '../../../../../config/site.config.js';

/** Re-exported for convenience; absolute canonical URL for a physical route path. */
export function canonical(physicalPath: string): string {
  return canonicalUrl(physicalPath);
}

/** Tool page canonical URL: /tools/<categorySlug>/<toolSlug>/ (trailing slash always). */
export function toolUrl(categorySlug: string, toolSlug: string): string {
  return canonicalUrl(toolPhysicalPath({ categorySlug, slug: toolSlug }));
}

/** Category hub canonical URL (MA3 taxonomy shape): /tools/<categorySlug>-tools/ */
export function hubUrl(categorySlug: string): string {
  return canonicalUrl(hubPhysicalPath(categorySlug));
}

/** Served href (base-aware, for <a href>) for a physical route path. */
export function href(physicalPath: string): string {
  return appPath(physicalPath);
}

/** All-tools index canonical URL: /tools/ */
export function toolsIndexUrl(): string {
  return canonicalUrl('/');
}

/** Homepage URL of the app (the tools directory under /tools/). */
export function homeUrl(): string {
  return toolsIndexUrl();
}

/**
 * Brand "Home" for breadcrumbs / schema — the site's true homepage, which may
 * live OUTSIDE the app (WordPress owns husnainblogger.com/ in the A1 shape).
 */
export function siteHomeUrl(): string {
  return `${siteConfig.site}/`;
}

/** Strip query strings / fragments: the canonical is ALWAYS the clean URL. */
export function cleanCanonical(raw: string): string {
  return raw.split(/[?#]/)[0] as string;
}
