/**
 * breadcrumbs.ts — breadcrumb trail builder (visible crumbs + JSON-LD source).
 *
 * Single source of truth for the trail on every page. ToolPageLayout.astro
 * renders these visibly (current crumb = aria-current="page", no link) and
 * passes them to buildBreadcrumbList() in jsonld.ts — visible crumbs and
 * schema can never drift apart.
 *
 * Trails (docs/seo/METADATA_SCHEMA.md §5):
 *   tool page: Home > Tools > <Category> > <Tool name>
 *   hub:       Home > Tools > <Category>
 *   index:     Home > Tools
 */

import { hubUrl, siteHomeUrl, toolsIndexUrl } from './urls.js';
import type { Crumb } from './jsonld.js';

export interface BreadcrumbInput {
  kind: 'tool' | 'hub' | 'tools-index' | 'home';
  /** Human tool name (inventory `name`), e.g. "Banned Hashtag Checker". */
  toolName?: string;
  toolSlug?: string;
  /** Human category name (inventory `category`), e.g. "Instagram". Never the slug. */
  categoryName?: string;
  categorySlug?: string;
}

export function buildBreadcrumbs(input: BreadcrumbInput): Crumb[] {
  // "Home" is the brand homepage (siteHomeUrl), which differs from the app's
  // own root in the WP-subpath deploy shape — see urls.ts.
  const crumbs: Crumb[] = [{ name: 'Home', url: siteHomeUrl() }];

  if (input.kind === 'home') return [{ name: 'Home' }]; // homepage: no trail, single current crumb

  crumbs.push({ name: 'Tools', url: toolsIndexUrl() });

  if (input.kind === 'tools-index') {
    crumbs[crumbs.length - 1] = { name: 'Tools' }; // current: drop the link
    return crumbs;
  }

  if (!input.categorySlug || !input.categoryName) {
    throw new Error('buildBreadcrumbs: categorySlug and categoryName are required for hub/tool trails');
  }
  crumbs.push({ name: input.categoryName, url: hubUrl(input.categorySlug) });

  if (input.kind === 'hub') {
    crumbs[crumbs.length - 1] = { name: input.categoryName }; // current: drop the link
    return crumbs;
  }

  if (!input.toolSlug || !input.toolName) {
    throw new Error('buildBreadcrumbs: toolSlug and toolName are required for tool trails');
  }
  crumbs.push({ name: input.toolName }); // current page: no link, aria-current="page" in the template
  return crumbs;
}
