/**
 * app/src/lib/seo/ — SEO infrastructure (builders, not content).
 * Owner: MA1-PerfSEO (builders) + MA3 (content inputs: titles, descriptions, FAQs).
 *
 * - urls.ts        Canonical URL construction ONLY. Nothing hardcodes a URL.
 * - meta.ts        <head> tags: title, description, canonical, robots, OG, Twitter.
 * - jsonld.ts      Schema.org builders per docs/seo/SCHEMA_STRATEGY.md matrix.
 * - breadcrumbs.ts Breadcrumb trails (visible + JSON-LD share one source).
 *
 * Keyword content lives with MA3 (app/src/content/, data/seo/). These modules
 * never invent copy: formulas implement docs/seo/METADATA_SCHEMA.md and
 * MA3-authored overrides always win.
 */
export * from './urls.js';
export * from './meta.js';
export * from './jsonld.js';
export * from './breadcrumbs.js';
