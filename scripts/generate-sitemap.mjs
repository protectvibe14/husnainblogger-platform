#!/usr/bin/env node
/**
 * generate-sitemap.mjs — build-time sitemap generator (dependency-free).
 *
 * Implements docs/seo/SITEMAP.md:
 *   /sitemap.xml                  sitemap index
 *   /sitemaps/tools-<slug>.xml    one child per category (auto-split past 1,000 URLs)
 *   /sitemaps/static.xml          home, /tools/, 10 hubs, utility pages
 *
 * Rules:
 * - ONLY tools with status === 'BUILT' are emitted. DEPRECATED tools never
 *   enter the sitemap (they have no public URL). Note: the inventory uses
 *   'BUILT' (not 'RELEASED') for live tools — fixed 2026-10-09 after the
 *   generator silently emitted 0 tool URLs.
 * - lastmod honesty: per-tool `lastUpdated` field wins; otherwise the git
 *   commit date of data/tools-inventory.json is used as a COARSE fallback
 *   (documented below); otherwise lastmod is OMITTED. Never the run date.
 * - Priority tiers per SITEMAP.md §2: home 1.0 → hubs 0.8 → Tier-1 tools 0.7
 *   → standard tools 0.5 → legal/thin 0.3.
 * - Tier-1 is resolved from the registry by slug (see TIER1_CANDIDATES).
 *   Unresolved names WARN — the tool still ships at standard priority.
 * - Fails loudly (non-zero exit) on structural problems so sitemap and site
 *   can never drift silently.
 *
 * Output: app/public/sitemaps/*.xml + app/public/sitemap.xml
 * (Astro copies public/ → dist/ verbatim, so the sitemap ships with the
 * static build. For the A1 WP-subpath shape the index is served at
 * /tools/sitemap.xml; <loc> values are absolute so children resolve either way.
 * See docs/architecture/DEPLOYMENT.md §3.4.)
 *
 * Site + base are read from config/site.config.ts (regex-extracted, no TS
 * compile needed — this script stays dependency-free). CLI overrides:
 *   node scripts/generate-sitemap.mjs [--site https://…] [--base /tools] [--out app/public]
 *
 * Run: `npm run sitemap` (prebuild). CI: `node scripts/generate-sitemap.mjs --check`
 * verifies the committed sitemap matches the registry (drift = failure).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const INVENTORY = join(ROOT, 'data', 'tools-inventory.json');
const SITE_CONFIG = join(ROOT, 'config', 'site.config.ts');

// ── CLI ─────────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
    return acc;
  }, []),
);
const CHECK_MODE = args.check === 'true';
const OUT_DIR = resolve(ROOT, args.out ?? 'app/public');

// ── Site config (regex-extracted; keeps this script dependency-free) ─────────
function readSiteConfig() {
  const src = readFileSync(SITE_CONFIG, 'utf8');
  const site = src.match(/^\s*site:\s*['"]([^'"]+)['"]/m)?.[1];
  const base = src.match(/^\s*base:\s*['"]([^'"]*)['"]/m)?.[1];
  if (!site) throw new Error(`generate-sitemap: could not parse 'site' from ${SITE_CONFIG}`);
  return { site: args.site ?? site, base: args.base ?? base ?? '/' };
}
const { site: SITE, base: BASE } = readSiteConfig();
const basePrefix = BASE === '/' ? '' : BASE.replace(/\/$/, '');
/**
 * URL scheme (locked by MA1, 2026-10-01 — see docs/architecture/CROSS_MASTER_DECISIONS.md):
 * physical routes omit the `/tools` namespace; the deploy base (always '/tools')
 * supplies it at serve time. `abs()` prepends the base, so paths below are
 * PHYSICAL route paths. Mirrors config/site.config.ts (the TS original is
 * authoritative; this mirror exists because the script is dependency-free).
 */
const abs = (path) => `${SITE}${basePrefix}${path.startsWith('/') ? path : `/${path}`}`;

// ── Tier-1 (master plan, resolved by registry slug) ───────────────────────────
// Verified against data/tools-inventory.json on 2026-10-01. The three marked
// UNRESOLVED have no registry match (see Tier-1 resolution report in
// docs/architecture/SEO_INFRA.md §5) — MA3/MA1-Registry must reconcile the
// master-plan names with the inventory; until then they get standard priority.
const TIER1_CANDIDATES = [
  { plan: 'AdSense Revenue Calculator', slug: 'ad-revenue-network-comparison-tool' },
  { plan: 'YouTube Tag Extractor', slug: null }, // UNRESOLVED — no registry match
  { plan: 'TikTok Hashtag Generator', slug: 'tiktok-caption-hashtag-mixer' },
  { plan: 'Etsy Fee Calculator', slug: 'etsy-fee-calculator' },
  { plan: 'Fiverr Profit Calculator', slug: 'fiverr-profit-calculator' },
  { plan: 'Instagram Banned Hashtag Checker', slug: 'banned-hashtag-checker' },
  { plan: 'FAQ Schema Generator', slug: 'faq-schema-generator' },
  { plan: 'YouTube Thumbnail Downloader', slug: null }, // UNRESOLVED — no registry match
  { plan: 'Email Subject Line Tester', slug: 'email-subject-line-tester' },
  { plan: 'Freelance Invoice Generator', slug: 'freelance-invoice-generator' },
];

// ── lastmod honesty ──────────────────────────────────────────────────────────
/** Coarse fallback: last commit touching the inventory file. NOT per-tool truth. */
function inventoryGitDate() {
  try {
    const out = execSync('git log -1 --format=%cI -- data/tools-inventory.json', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    return out ? out.slice(0, 10) : null; // YYYY-MM-DD
  } catch {
    return null; // git unavailable (e.g. tarball build) → lastmod omitted, not faked
  }
}

function toolLastmod(tool, fallbackDate) {
  if (typeof tool.lastUpdated === 'string' && /^\d{4}-\d{2}-\d{2}/.test(tool.lastUpdated)) {
    return tool.lastUpdated.slice(0, 10);
  }
  return fallbackDate; // may be null → tag omitted
}

// ── XML ──────────────────────────────────────────────────────────────────────
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function urlset(urls) {
  const body = urls
    .map((u) => {
      const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : '';
      const changefreq = u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : '';
      const priority = u.priority != null ? `\n    <priority>${u.priority.toFixed(1)}</priority>` : '';
      return `  <url>\n    <loc>${esc(u.loc)}</loc>${lastmod}${changefreq}${priority}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function sitemapIndex(children) {
  const body = children
    .map((c) => `  <sitemap>\n    <loc>${esc(c.loc)}</loc>${c.lastmod ? `\n    <lastmod>${c.lastmod}</lastmod>` : ''}\n  </sitemap>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  const inventory = JSON.parse(readFileSync(INVENTORY, 'utf8'));
  const tools = inventory.tools ?? [];
  const warnings = [];
  const errors = [];

  const gitDate = inventoryGitDate();

  // Resolve Tier-1 against the registry.
  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  const tier1 = new Set();
  for (const c of TIER1_CANDIDATES) {
    if (!c.slug) {
      warnings.push(`Tier-1 "${c.plan}" has NO registry match — standard priority until MA3/MA1-Registry reconciles the name.`);
      continue;
    }
    if (!bySlug.has(c.slug)) {
      warnings.push(`Tier-1 slug "${c.slug}" (${c.plan}) not in registry — standard priority.`);
      continue;
    }
    tier1.add(c.slug);
  }

  // Tool URLs: BUILT only, excluding admin-disabled and noindex tools.
  const released = tools.filter((t) => t.status === 'BUILT' && t.enabled !== false && !t.noindex);
  const backlog = tools.length - released.length;
  if (released.length === 0) {
    warnings.push(`0 BUILT tools in registry (${backlog} non-BUILT) — tool sitemaps will be empty. This is correct pre-launch behavior.`);
  }

  const toolEntries = [];
  for (const t of released) {
    if (!t.slug || !t.categorySlug) {
      errors.push(`Tool ${t.toolId ?? t.id} missing slug/categorySlug — cannot build URL.`);
      continue;
    }
    toolEntries.push({
      loc: abs(`/${t.categorySlug}/${t.slug}/`),
      lastmod: toolLastmod(t, gitDate),
      changefreq: 'monthly',
      priority: tier1.has(t.slug) ? 0.7 : 0.5,
      categorySlug: t.categorySlug,
    });
  }

  // Utility pages derive from EXISTING top-level page files — never hardcoded,
  // so the sitemap can never list a page that doesn't exist. Excluded: dynamic
  // routes ([hub], [category]), the tools index (already listed), search
  // (noindex by policy), and 404.
  const PAGES_DIR = join(ROOT, 'app', 'src', 'pages');
  const EXCLUDE = new Set(['index.astro', '[hub].astro', 'search.astro', '404.astro']);
  let utilityPages = [];
  try {
    utilityPages = readdirSync(PAGES_DIR)
      .filter((f) => f.endsWith('.astro') && !EXCLUDE.has(f))
      .map((f) => f.replace(/\.astro$/, ''));
  } catch {
    utilityPages = []; // pages dir missing — sitemap still valid, just hubs + index
  }
  const categories = [...new Map(tools.map((t) => [t.categorySlug, t.category])).entries()];
  // Dedupe by loc (shape B: home and tools-index collapse to the same URL).
  const seen = new Set();
  // Full-site architecture (2026-10-06): homepage at /, tools+hubs keep the
  // /tools canonical prefix (served via vercel.json rewrites), utility pages
  // at root, blog posts at /blog/<slug>/ (separate child sitemap below).
  const siteRoot = (path) => `${SITE}${path.startsWith('/') ? path : `/${path}`}`;
  const staticEntries = [
    { loc: siteRoot('/'), changefreq: 'weekly', priority: 1.0 },
    ...categories.map(([slug]) => ({ loc: siteRoot(`/tools/${slug}-tools/`), changefreq: 'weekly', priority: 0.8 })),
    ...utilityPages.map((p) => ({ loc: siteRoot(`/${p}/`), changefreq: 'yearly', priority: 0.3 })),
  ].filter((e) => {
    if (seen.has(e.loc)) return false;
    seen.add(e.loc);
    return true;
  });

  // Blog child sitemap: every post in app/src/content/blog/*.md (non-draft).
  const BLOG_DIR = join(ROOT, 'app', 'src', 'content', 'blog');
  let blogEntries = [];
  try {
    blogEntries = readdirSync(BLOG_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const src = readFileSync(join(BLOG_DIR, f), 'utf8');
        const fm = src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
        const date = fm.match(/^date:\s*"?(\d{4}-\d{2}-\d{2})"?/m)?.[1] ?? null;
        const draft = /^draft:\s*true/m.test(fm);
        return { slug: f.replace(/\.md$/, ''), date, draft };
      })
      .filter((p) => !p.draft)
      .map((p) => ({
        loc: siteRoot(`/blog/${p.slug}/`),
        lastmod: p.date,
        changefreq: 'monthly',
        priority: 0.6,
      }));
  } catch {
    blogEntries = [];
  }

  // Children: one per category (auto-split past 1,000), plus static.xml.
  const children = [];
  const byCat = new Map();
  for (const e of toolEntries) {
    if (!byCat.has(e.categorySlug)) byCat.set(e.categorySlug, []);
    byCat.get(e.categorySlug).push(e);
  }
  for (const [cat, entries] of [...byCat.entries()].sort()) {
    const chunks = [];
    for (let i = 0; i < entries.length; i += 1000) chunks.push(entries.slice(i, i + 1000));
    chunks.forEach((chunk, i) => {
      const name = chunks.length === 1 ? `tools-${cat}.xml` : `tools-${cat}-${i + 1}.xml`;
      children.push({ name, entries: chunk });
    });
  }
  children.push({ name: 'static.xml', entries: staticEntries });
  if (blogEntries.length > 0) {
    children.push({ name: 'blog.xml', entries: blogEntries });
  }

  // Write.
  const sitemapsDir = join(OUT_DIR, 'sitemaps');
  mkdirSync(sitemapsDir, { recursive: true });
  const written = {};
  const indexChildren = [];
  for (const c of children) {
    const xml = urlset(c.entries);
    const maxLastmod = c.entries.map((e) => e.lastmod).filter(Boolean).sort().pop() ?? null;
    indexChildren.push({ loc: siteRoot(`/sitemaps/${c.name}`), lastmod: maxLastmod });
    if (!CHECK_MODE) {
      writeFileSync(join(sitemapsDir, c.name), xml);
    } else {
      written[c.name] = xml;
    }
  }
  const indexXml = sitemapIndex(indexChildren);
  if (!CHECK_MODE) {
    writeFileSync(join(OUT_DIR, 'sitemap.xml'), indexXml);
  }

  if (CHECK_MODE) {
    // Drift check: committed sitemap must match the registry-derived output.
    const drift = [];
    for (const c of children) {
      const p = join(sitemapsDir, c.name);
      if (!existsSync(p) || readFileSync(p, 'utf8') !== written[c.name]) drift.push(c.name);
    }
    const ip = join(OUT_DIR, 'sitemap.xml');
    if (!existsSync(ip) || readFileSync(ip, 'utf8') !== indexXml) drift.push('sitemap.xml');
    if (drift.length > 0) {
      console.error(`SITEMAP DRIFT: ${drift.join(', ')} do not match the registry. Run: node scripts/generate-sitemap.mjs`);
      process.exit(1);
    }
  }

  if (errors.length > 0) {
    for (const e of errors) console.error(`ERROR: ${e}`);
    process.exit(1);
  }
  for (const w of warnings) console.warn(`WARN: ${w}`);
  console.log(
    `sitemap: ${released.length} tool URLs + ${staticEntries.length} static URLs → ${children.length} child sitemaps + index (${abs('/sitemap.xml')})`,
  );
}

main();
