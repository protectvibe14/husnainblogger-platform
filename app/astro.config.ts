/**
 * Astro config — static build (output: 'static'), zero backend.
 *
 * URL scheme (locked by MA1, 2026-10-01 — see docs/architecture/CROSS_MASTER_DECISIONS.md):
 * - Physical routes omit the `/tools` namespace (src/pages/[category]/[tool].astro …).
 * - `base: '/tools'` supplies the namespace at serve time:
 *     A1 (Hostinger): dist/* → public_html/tools/  →  /tools/<category>/<slug>/
 *     C1 (Vercel):     dist/* served under /tools/* via vercel.json rewrite.
 * - `trailingSlash: 'always'` enforces MA3's canonical shape (non-slash → slash
 *   301 is ALSO required at the host level — see docs/architecture/DEPLOYMENT.md).
 * - `site` is the production origin (non-www canonical; www → non-www 301 at host).
 */
import { defineConfig } from 'astro/config';
import { siteConfig } from '../config/site.config.js';

export default defineConfig({
  site: siteConfig.site,
  base: siteConfig.base,
  output: 'static',
  trailingSlash: 'always',
});
