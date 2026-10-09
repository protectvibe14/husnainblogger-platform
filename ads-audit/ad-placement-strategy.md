# Ad Placement Strategy — HusnainBlogger.com

> Site: Astro static (husnainblogger-platform). 12 slots in `data/ads-config.json`, all `enabled:false` today.
> AdSlot renders nothing when disabled/empty, injects pasted code via `set:html`, labels every unit "Advertisement".

## 1. Priority order — which slots to enable FIRST

| # | Slot | Why enable it first |
|---|------|---------------------|
| 1 | `tool-incontent` | Highest viewability: sits right below the tool output when the user is most engaged (they just got their result). In-article/native units here consistently earn the most per view. |
| 2 | `tool-sticky-mobile` | ~Majority of traffic is mobile; a 320x50 anchor unit is always in view. Highest impression volume on the whole site, near-zero content disruption. |
| 3 | `tool-top` | Above-the-fold banner, first thing ad buyers bid on — but see the tradeoff note in §3. Premium placement for brand campaigns. |
| 4 | `tool-bottom` | Catches the "scroll-through" user who used the tool and keeps reading (related tools, FAQ). Cheap UX cost, solid RPM on long pages. |

Everything else (hub-top/hub-bottom, tool-mid, sidebar ×2, blog-top/blog-bottom, sponsor) is Phase 2+.

## 2. Recommended ad sizes per slot

| Slot | Desktop | Mobile |
|------|---------|--------|
| `tool-top`, `tool-bottom`, `hub-top` | 970×250 (billboard) / 970×90 (leaderboard) | 320×100 (large mobile banner) |
| `hub-bottom` | Responsive display unit | Responsive |
| `tool-incontent` | Responsive in-article unit | Responsive in-article unit |
| `tool-mid` | Responsive | Responsive |
| `tool-sidebar-top` | 300×250 (medium rectangle) | — (desktop only) |
| `tool-sidebar-bottom` | 300×600 (half page, high CPM) | — (desktop only) |
| `tool-sticky-mobile` | — | 320×50 (anchor) |
| `blog-top`, `blog-bottom` | Responsive display / in-article | Responsive display / in-article |
| `tool-sponsor` | Sponsor card (direct deal, fixed price) | Sponsor card |

Rule of thumb: use **responsive** sizes everywhere you can — AdSense backfills the best-paying creative that fits. Fixed sizes (320×50, 300×250) only where the layout demands it (sidebar, sticky anchor).

## 3. Best practices

- **Max 3–4 ad units per tool page.** AdSense allows plenty, but beyond ~4 units on a tool page the UX collapses and viewability per unit drops — you earn less per ad, not more. Stick to: tool-incontent + tool-sticky-mobile + ONE of tool-top/tool-bottom, then evaluate.
- **`tool-top` tradeoff (flagged honestly):** it sits below the header but ABOVE the tool UI itself — the most valuable ad real estate on the page, but also the riskiest. A banner pushing the actual tool down even slightly will increase bounce on users who came for one thing (the tool). If bounce rises after enabling it, demote it: keep it on category pages (hub-top) where there's no tool to displace, and drop it from tool pages in favor of tool-incontent.
- **Keep sticky-mobile dismissible-friendly.** The anchor unit must never cover the tool's inputs or the bottom nav. If a 320×50 ever overlaps the tool CTA on small screens, shrink it or disable it — one accidental click costs more in user trust than the unit earns.
- **Auto ads vs manual placements:** enable the 3–4 manual slots first (you control exactly where money trades against UX). Turn on AdSense **Auto ads only after** the manual layout is stable — and then audit what Auto ads injects. On tool pages, Auto ads loves to shove in-article units between the tool UI and its result, which is exactly the spot you never want an ad. If it does that, restrict Auto ads formats (disable in-page auto-insert, keep anchor + vignette).
- **Policy:** never more than the reasonable density above; every unit is already labeled "Advertisement" in AdSlot.astro — do not remove that label. No ads on pages with no real content, no deceptive placement next to buttons, no refreshing units on a timer.

## 4. Rollout plan

**Phase 1 — Enable 2 slots, watch 7 days**
- Enable: `tool-incontent` + `tool-sticky-mobile`.
- Why these two: best revenue-per-UX-cost ratio, and they don't displace the tool UI. Cleanest A/B of "do ads hurt us."

**Phase 2 — Add the banners (if Phase 1 is clean)**
- Add: `tool-top` (or `hub-top` first if tool pages feel cramped) + `tool-bottom`.
- Re-check bounce rate and session duration after 3–4 days before keeping tool-top.

**Phase 3 — Fill the long tail**
- `tool-mid`, sidebar units, `hub-bottom`, blog slots (note: blog-top/blog-bottom exist in config but **no blog template renders AdSlot yet** — they need template wiring before enabling), `tool-sponsor` as direct-deal inventory.

**Metrics to watch (in order of importance)**
1. **Bounce rate per template** (tool pages, hub pages) — the canary. If it rises >3–5 pts after a slot goes live, that slot is costing more than it earns.
2. **RPM per slot** — enable what's above your site average, kill what's below half of it.
3. **CTR per slot** — sudden spikes = accidental clicks (bad placement), investigate before AdSense does.
4. **Session duration / pages per session** — confirms ads aren't killing the "use 3 more tools" loop that makes this site valuable.

## Appendix — slot inventory (post-fix)

12 slots in `data/ads-config.json` (Oct 9, 2026 fix: added `hub-top` + `hub-bottom`, which `[hub].astro` referenced but the config was missing — the component rendered nothing for them). All disabled, empty code. Blog slots and `tool-sponsor` are config-only today (no AdSlot/SponsorCard in their templates yet — see note in Phase 3).
