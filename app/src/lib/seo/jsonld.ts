/**
 * jsonld.ts — JSON-LD schema builders.
 *
 * Implements the page-type matrix in docs/seo/SCHEMA_STRATEGY.md.
 * LOCKED PRINCIPLE: schema only where genuinely applicable — every block must
 * describe content actually on the page. No fabricated reviews, ratings,
 * dates, or FAQ answers. Schema aids discovery; it does not guarantee rich
 * results or rankings.
 *
 * WHEN EACH BUILDER APPLIES (do not emit otherwise):
 * ──────────────────────────────────────────────────
 * buildWebPage            Tool page → ALWAYS (base type; pairs with SoftwareApplication or stands alone).
 * buildSoftwareApplication Tool page → ONLY when the tool is interactive
 *                          (input → process → output loop). MA2's classifier sets
 *                          `isInteractive`; static galleries/vaults/lists get WebPage only.
 * buildBreadcrumbList     Tool page + hub → ALWAYS (trail from breadcrumbs.ts).
 * buildFaqPage            Tool page → ONLY when the page renders visible FAQs and the
 *                          Q&A text passed here matches the visible text EXACTLY.
 * buildCollectionPage     Category hub → ALWAYS (with ItemList of the hub's tools).
 * buildWebSite            Homepage → ALWAYS (site-level; emitted once).
 * buildOrganization       Homepage → ALWAYS (site-level; sameAs = real profiles only).
 * SearchAction            Homepage → ONLY if site search exists with a real search URL
 *                          template (pass searchUrlTemplate). Never for a nonexistent search box.
 *
 * EXPLICITLY BANNED (per SCHEMA_STRATEGY): Review / AggregateRating (no real
 * reviews at launch), HowTo (a "how to use" blurb is not a tutorial), Article
 * on tool pages.
 *
 * Multiple types per page → ONE <script type="application/ld+json"> with a
 * @graph array (see renderJsonLd).
 */

import { siteConfig } from '../../../../../config/site.config.js';

export interface FaqEntry {
  question: string;
  answer: string; // must match the visible page text verbatim
}

export interface SoftwareAppInput {
  name: string;
  url: string; // canonical tool URL
  description: string;
  /** e.g. "Utilities" | "BusinessApplication" | "DeveloperApplication". MA3 maps per toolType; default below. */
  applicationCategory?: string;
  /** Platform rule: 100% client-side, free at launch. Pass false the day that stops being true. */
  isFree?: boolean;
}

/** Default schema.org applicationCategory per toolType (MA3 may override per tool). */
export const TOOLTYPE_CATEGORY: Record<string, string> = {
  generator: 'Utilities',
  calculator: 'BusinessApplication',
  checker: 'Utilities',
  analyzer: 'Utilities',
  scorer: 'Utilities',
  converter: 'Utilities',
  formatter: 'Utilities',
  tracker: 'Utilities',
  planner: 'BusinessApplication',
  builder: 'Utilities',
};

export function buildSoftwareApplication(input: SoftwareAppInput, toolType?: string): Record<string, unknown> {
  const node: Record<string, unknown> = {
    '@type': 'SoftwareApplication',
    name: input.name,
    url: input.url,
    applicationCategory: input.applicationCategory ?? (toolType ? TOOLTYPE_CATEGORY[toolType] : undefined) ?? 'Utilities',
    operatingSystem: 'Web',
    description: input.description,
    inLanguage: siteConfig.lang,
  };
  // "Free" is only claimed while genuinely free — zero-backend, no paywall at launch.
  if (input.isFree !== false) {
    node['offers'] = { '@type': 'Offer', price: '0', priceCurrency: siteConfig.currency };
  }
  return node;
}

export interface WebPageInput {
  url: string;
  name: string;
  description: string;
  /** 'WebPage' default; hubs pass 'CollectionPage'. */
  type?: 'WebPage' | 'CollectionPage';
}

export function buildWebPage(input: WebPageInput): Record<string, unknown> {
  return {
    '@type': input.type ?? 'WebPage',
    '@id': `${input.url}#webpage`,
    url: input.url,
    name: input.name,
    description: input.description,
    inLanguage: siteConfig.lang,
    isPartOf: { '@id': `${siteConfig.site}#website` },
  };
}

export interface Crumb {
  name: string;
  url?: string; // current page crumb has no url
}

export function buildBreadcrumbList(crumbs: Crumb[]): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => {
      const item: Record<string, unknown> = {
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
      };
      if (c.url) item['item'] = c.url;
      return item;
    }),
  };
}

export function buildFaqPage(faqs: FaqEntry[]): Record<string, unknown> | null {
  if (faqs.length === 0) return null; // no visible FAQs → no FAQPage block. Never decorative.
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function buildItemList(name: string, urls: string[]): Record<string, unknown> {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: urls.length,
    itemListElement: urls.map((u, i) => ({ '@type': 'ListItem', position: i + 1, url: u })),
  };
}

export interface SiteLevelInput {
  /** Only pass when site search EXISTS with a real URL template, e.g. "https://…/search?q={query}". */
  searchUrlTemplate?: string;
}

export function buildWebSite(input: SiteLevelInput = {}): Record<string, unknown> {
  const node: Record<string, unknown> = {
    '@type': 'WebSite',
    '@id': `${siteConfig.site}#website`,
    url: siteConfig.site,
    name: siteConfig.name,
    inLanguage: siteConfig.lang,
  };
  if (input.searchUrlTemplate) {
    node['potentialAction'] = {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: input.searchUrlTemplate },
      'query-input': 'required name=query',
    };
  }
  return node;
}

export function buildOrganization(): Record<string, unknown> {
  const org: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': `${siteConfig.site}#organization`,
    name: siteConfig.organization.legalName,
    url: siteConfig.site,
    logo: siteConfig.organization.logo.startsWith('http')
      ? siteConfig.organization.logo
      : `${siteConfig.site}${siteConfig.organization.logo}`,
  };
  // sameAs: real social profiles ONLY — empty array in config = omitted, never invented.
  if (siteConfig.organization.sameAs.length > 0) {
    org['sameAs'] = siteConfig.organization.sameAs;
  }
  return org;
}

/**
 * Render ONE <script type="application/ld+json"> block with a @graph array.
 * Null entries (e.g. FAQPage with no FAQs) are dropped. Callers compose the
 * per-page graph explicitly so "only applicable types" is enforced at the call
 * site, not hidden in a helper.
 */
export function renderJsonLd(nodes: Array<Record<string, unknown> | null>): string {
  const graph = nodes.filter((n): n is Record<string, unknown> => n !== null);
  if (graph.length === 0) return '';
  const payload = { '@context': 'https://schema.org', '@graph': graph };
  // JSON-LD must be safe inside <script>: escape the one sequence that can break out.
  const json = JSON.stringify(payload).replace(/<\/script/gi, '<\\/script');
  return `<script type="application/ld+json">${json}</script>`;
}
