# STRUCTURE.md — HusnainBlogger App Folder Guide

> **Rule:** Kuch add/change karna ho to pehle ye file dekho. Har folder ka ek kaam hai.
> Last updated: 2026-10-07

## Quick map

| Kaam | Folder | File example |
|---|---|---|
| **Page shell (header/nav/footer/SEO)** | `src/layouts/BaseLayout.astro` | **SITE-WIDE chrome — yahi edit karo** |
| **Admin shell (sidebar)** | `src/layouts/AdminLayout.astro` | admin pages ka layout |
| Shared helpers (blog) | `src/lib/blog.ts` | `postSlug()`, `readingTime()` |
| Admin GitHub client | `src/lib/admin-github.ts` | `readFile()`, `writeFile()` |
| Admin config | `src/lib/admin-config.ts` | repo owner/name |
| Landing page (home) | `src/pages/index.astro` | composition only |
| Landing sections | `src/components/landing/` | `LandingHero.astro` |
| Tool pages | `src/pages/[category]/[tool].astro` | dispatches to template |
| Category hubs | `src/pages/[hub].astro` | category listing |
| Search page | `src/pages/search.astro` | search UI |
| Blog listing | `src/pages/blog/index.astro` | featured + grid |
| Blog article | `src/pages/blog/[slug].astro` | premium article |
| Blog card | `src/components/blog/BlogCard.astro` | article preview card |
| Blog content | `src/content/blog/*.md` | markdown posts |
| Admin pages | `src/pages/admin/` | `login.astro`, `index.astro` (dashboard), `blog/` (list/new/edit), `tools/index.astro`, `pages/` (list/edit), `media/index.astro`, `settings/index.astro` |
| Admin form components | `src/components/admin/` | `PostForm.astro` (shared blog post form) |
| Site settings | `data/site-settings.json` | contact email, site name, tagline — admin-editable |
| Legal page content | `data/pages/*.html` | privacy/terms/disclaimer/cookies HTML — admin-editable |
| Tool templates (14) | `src/templates/` | `GeneratorTemplate.astro` |
| Shared UI atoms | `src/components/ui/` | `Button.astro`, `Field.astro` |
| Individual tools | `app/tools/<category>/<slug>/` | `logic.ts`, `meta.ts` |
| Design tokens | `src/styles/tokens.css` | CSS variables |
| Luxury styles | `src/styles/luxury.css` | all visual design |
| Tool registry | `src/data/registry.generated.ts` | auto-generated, DO NOT EDIT |
| Tool inventory | `data/tools-inventory.json` | source of truth — admin-editable: `enabled` (ON/OFF), `seoTitle`, `seoDescription`, `noindex` |

## `src/layouts/` — shared shells (MODULAR BASE)

| File | Kaam |
|---|---|
| `BaseLayout.astro` | **Har public page isi ko use karta hai.** `<head>` SEO meta, site header (brand + nav), footer. Props: `title`, `description`, `canonical`, `robots`, `ogType`, `ogImage`, `activeNav`. Extra head tags → `slot="head"`. **Header/nav/footer change karna ho to SIRF ye file edit karo.** |
| `AdminLayout.astro` | **Har `/admin/*` page isi ko use karta hai.** Sidebar nav (Dashboard, Blog, Tools, Pages, Media, Settings), topbar, auth guard. Props: `title`, `section`. |

## `src/lib/` — shared helpers

| File | Kaam |
|---|---|
| `blog.ts` | `postSlug()`, `postUrl()`, `postAbsoluteUrl()`, `readingTime()`, `formatDate()`, `isoDate()`. Blog pages AUR admin dono yahi use karte hain. |
| `admin-config.ts` | GitHub repo owner/name/branch + content paths. |
| `admin-github.ts` | Browser-side GitHub Contents API client: `validateToken()`, `listDir()`, `readFile()`, `writeFile()`, `deleteFile()`. Token localStorage me, server ko kabhi nahi jata. |

## `src/pages/` — routes (URL → file)

| File | URL | Kaam |
|---|---|---|
| `index.astro` | `/tools/` | **Landing page.** Sirf composition — sections `components/landing/` se aate hain. Copy yahan nahi, components me hai. |
| `[hub].astro` | `/tools/<category>/` | Category hub: us category ke tools ka grid. |
| `[category]/[tool].astro` | `/tools/<cat>/<slug>/` | Tool page: ToolShell + template dispatch. Header/footer inline. |
| `search.astro` | `/tools/search/` | Search UI. |

**Change karna ho to:**
- Landing headline/copy → `src/components/landing/*.astro`
- Naya route → `src/pages/` me nayi `.astro` file
- Tool page layout → `src/templates/ToolShell.astro`

## `src/components/landing/` — landing sections

| File | Section | Props |
|---|---|---|
| `LandingHero.astro` | Hero: headline, CTAs, stats | `toolCount`, `categoryCount` |
| `CategoryShowcase.astro` | 11 category cards | `categories[]` |
| `ValueProps.astro` | "Why us" 4 cards | none (static copy) |
| `HowItWorks.astro` | 3-step strip | none (static copy) |
| `LandingFaq.astro` | FAQ + final CTA | none (static copy) |

**Rule:** Har section apni styling `<style>` me rakhta hai. Shared classes (`hb-btn`, `hb-tool-eyebrow`) `luxury.css` se aate hain.

## `src/components/ui/` — shared atoms

Primitives jo har jagah reuse hote hain. **Naya visual component yahan banao, page-specific nahi.**

| File | Kaam |
|---|---|
| `Button.astro` | Button primitive (primary/secondary/tertiary/danger) |
| `Card.astro` | Card container |
| `Field.astro` | Input + label + hint + error (form fields MUST use this) |
| `Select.astro`, `Textarea.astro` | Select/textarea variants |
| `Checkbox.astro`, `RadioGroup.astro` | Choice inputs |
| `Accordion.astro` | FAQ accordion. **Props: `{question, answerHtml}[]`** |
| `ResultPanel.astro` | Tool result display |
| `CopyButton.astro`, `DownloadButton.astro` | Result actions |
| `Breadcrumbs.astro` | Breadcrumb nav |
| `Badge.astro`, `Tabs.astro` | Small UI |
| `ErrorSummary.astro`, `ToolErrorBoundary.astro` | Error states |
| `ConfirmDialog.astro`, `SkipLink.astro` | A11y helpers |

## `src/templates/` — 14 tool templates

Har tool ek template use karta hai (tool ke `toolType` se dispatch hota hai).

| Template | Tool types | Example |
|---|---|---|
| `GeneratorTemplate.astro` | generator | hashtag generators |
| `CalculatorTemplate.astro` | calculator | revenue calculators |
| `AnalyzerTemplate.astro` | analyzer | title analyzers |
| `CheckerTemplate.astro` | checker | readability checkers |
| `ScorerTemplate.astro` | scorer | SEO scorers |
| `BuilderTemplate.astro` | builder | prompt builders |
| `PlannerTemplate.astro` | planner | content planners |
| `TrackerTemplate.astro` | tracker | habit trackers |
| `ConverterTemplate.astro` | converter | SRT→VTT |
| `FormatterTemplate.astro` | formatter | text formatters |
| `AiToolTemplate.astro` | ai (Lane B/D) | BYOK AI tools |
| `ToolShell.astro` | — | **Shared shell:** breadcrumbs, hero, FAQ, related tools. Sab templates iske andar render hote hain. |
| `FreshnessBanner.astro` | — | Data-freshness warning |
| `PlaceholderTemplate.astro` | — | Deprecated tools |

**Runtime files (haath mat lagao unless you know why):**
`_tool-runtime.ts` (form wiring), `_ai-runtime.ts` (BYOK key vault), `_analytics.ts`, `types.ts`

## `app/tools/<category>/<slug>/` — individual tools

Har tool = 4 files. **Naya tool banana ho to purane tool ka folder copy karo.**

| File | Kaam |
|---|---|
| `logic.ts` | Pure logic: `runTool(inputs)` → outputs. NO DOM, NO fetch (Lane B me provider call allowed). |
| `logic.test.ts` | Unit tests. Har logic branch ka test lazmi. |
| `meta.ts` | Inputs/outputs schema + page content (title, description, howTo, FAQs, JSON-LD) + `aiConfig` (AI tools ke liye). |
| `client.ts` | Client wiring (Lane B AI tools ke liye; Lane C me stub). |

**Naya tool add karne ke steps:**
1. `app/tools/<category>/<new-slug>/` banao, 4 files likho
2. `data/tools-inventory.json` me entry add karo (next free ID lo)
3. `node scripts/build-registry.mjs` chalao (registry regenerate)
4. `npx astro build` → naye pages banenge

## `src/styles/` — design system

| File | Kaam | Rule |
|---|---|---|
| `tokens.css` | **CSS variables ki single source.** Colors, spacing, fonts, radius, shadows. | Components me hard-coded color **mana hai** — sirf `var(--*)` use karo. |
| `luxury.css` | Saari visual styling. `@import "./tokens.css"` pehle line me. | Nayi styling yahan add karo, component `<style>` me nahi (page-specific exception: landing components). |
| `global.css` | Reset + focus + utilities. | Rarely touch. |

**Theme:** `:root` = light, `:root[data-theme="dark"]` = dark. Naya color add karna ho to dono me add karo.

## `src/lib/` — utilities

| Folder | Kaam |
|---|---|
| `a11y/` | Accessibility helpers (id generator) |
| `ai/` | AI provider definitions (Gemini/Groq/OpenRouter), BYOK types |
| `registry/` | Registry types + generated data access |
| `seo/` | SEO helpers (JSON-LD, meta) |
| `state/` | Client state helpers |
| `ui/` | Theme toggle, UI state |
| `validation/` | Input validation |

## `src/data/` — generated (DO NOT EDIT BY HAND)

| File | Kaam |
|---|---|
| `registry.generated.ts` | `build-registry.mjs` se banta hai. 576 tools ka data. |
| `slug-manifest.json` | Saare URLs ki list. |
| `link-map.json` | Related-tools links. |

**Regenerate:** `node scripts/build-registry.mjs`

## `data/` (repo root)

| File | Kaam |
|---|---|
| `tools-inventory.json` | **Source of truth.** Har tool ki entry: id, slug, category, keywords, status. Naya tool = yahan entry. |

## `config/`

| File | Kaam |
|---|---|
| `site.config.ts` | Site URL, base path (`/tools` LOCKED), hub URL builders. |

## Naming conventions

- Tool slug: `kebab-case`, category prefix nahi (e.g. `ai-hook-generator` nahi, `hook-generator`)
- Component: `PascalCase.astro`
- CSS classes: `hb-*` (shared), `landing-*` (landing only)
- CSS variables: `--color-*`, `--space-*`, `--text-*`, `--radius-*`, `--shadow-*`
