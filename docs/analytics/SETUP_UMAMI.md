# Umami Analytics — Setup Guide (owner)

**What:** Privacy-friendly, cookie-free analytics for all public pages
(tool pages, homepage, categories, blog, search). Free Umami Cloud Hobby
tier: 100K events/month, 1 website, 6-month history — plenty for a new site.

**What was added (code):**
- `app/src/layouts/BaseLayout.astro` — conditional `<script defer
  src="https://cloud.umami.is/script.js" data-website-id="…"
  data-do-not-track="true">` in `<head>`. BaseLayout wraps EVERY public
  page, so all 569 tools inherit tracking with zero per-page work.
- The script renders **only** when `PUBLIC_UMAMI_WEBSITE_ID` is set.
  Without it, pages ship with no analytics and make no tracking requests.
- `app/.env.example` — documents the variable.

**What the owner must do (one time, ~5 minutes):**

1. Sign up at https://cloud.umami.is (free).
2. Dashboard → Settings → Websites → **Add website**.
   - Name: `HusnainBlogger`
   - Domain: `husnainblogger.com` (bare hostname, no `https://` — must
     match the serving hostname exactly or events are silently rejected)
3. Click the website → **Tracking code** → copy the Website ID (a UUID)
   and confirm the script URL shown in *your* dashboard (use it verbatim).
4. Vercel dashboard → project `husnainblogger-platform` → Settings →
   Environment Variables → add `PUBLIC_UMAMI_WEBSITE_ID` = the UUID →
   **Redeploy** (env vars are baked in at build time).
5. Verify: visit 2–3 tool pages on the live site, then Umami dashboard →
   your website → **Realtime** — your visits appear within seconds.

**Privacy notes:**
- No cookies, no personal data, Do Not Track honored
  (`data-do-not-track="true"`). No cookie banner required for Umami alone.
- Recommended: add one line to the privacy policy disclosing
  "privacy-friendly analytics (Umami)".
- If Google Analytics 4 is added later (e.g. for AdSense revenue linking),
  a consent banner becomes mandatory — GA4 writes `_ga` cookies.

**Optional hardening (later):**
- Ad-blocker resilience: add a Vercel rewrite proxying
  `/stats/*` → `https://cloud.umami.is/*` and change the script `src`
  to `/stats/script.js` (documented by Umami).
- Exclude staging previews from data: add
  `data-domains="husnainblogger.com"` to the script tag (note: this also
  excludes Vercel preview URLs from tracking — remove it while verifying
  on a preview deployment).
