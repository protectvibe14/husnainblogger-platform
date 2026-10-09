# Ad-Code Trust Model — HusnainBlogger Platform

## Who can change ad code
Anyone holding a repo-scoped GitHub fine-grained PAT. The admin panel
(`app/src/pages/admin/ads/`) writes ad code to `data/ads-config.json` and
commits it to git through the GitHub Contents API using that token.
Each change is a commit — full history in git.

## What ad code can do
Ad code is injected into public pages via `set:html` in
`app/src/components/ads/AdSlot.astro`. **It executes with full page
privileges**: it can read the DOM, run arbitrary scripts, and exfiltrate data.
Treat pasting ad code with the same care as shipping code to production.

## Build-time guard: `scripts/validate-ads.mjs`
Runs in `prebuild` (see `app/package.json`) before every Astro build. For each
slot with `enabled: true` and non-empty `code` it FAILS the build on:
- Remote `<script>` / `<iframe>` / `<img>` / `<link>` `src`/`href` URLs whose
  hostname is not on the ad-network allowlist
  (`pagead2.googlesyndication.com`, `*.googlesyndication.com`,
  `*.googleadservices.com`, `*.doubleclick.net`, `*.amazon-adsystem.com`,
  `*.media.net`, `*.quantserve.com`).
- `javascript:` URIs anywhere.
- Inline event-handler attributes (`onload=`, `onclick=`, `onerror=`, …).
- `<object>`, `<embed>`, `<form>` tags.

Disabled or empty slots are skipped. This catches malicious ad snippets
(accidental or otherwise) before they can ship.

## Recommendations
1. Paste ad code **only from the ad network's official dashboard**
   (AdSense, Media.net, Amazon Publisher Services, …) — never from email,
   chat, or third-party "ad code generator" sites.
2. Use a **dedicated AdSense/account** for the site; keep the account with the
   least privilege needed for ad serving.
3. **Revoke the GitHub PAT immediately** if the admin device is lost, stolen,
   or you suspect the token was exposed. Rotate it periodically.
4. Review `data/ads-config.json` diffs in git before pulling changes onto
   production — the git history is the audit trail.

## Admin auth note
The admin panel is a static site; its auth guard is client-side only
(see `app/src/lib/admin-auth.ts`). That is acceptable here because the served
HTML contains no secrets: the GitHub PAT is entered in the browser and stored
in `localStorage` — **it never leaves the admin's browser** and is never baked
into any built page. An attacker viewing the deployed admin pages learns
nothing of value; write access still requires the PAT.
