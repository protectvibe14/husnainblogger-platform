/**
 * tool-367 — Pinterest Link-in-Bio Page Builder (builder)
 *
 * Pure client-side static page builder. Takes the user's link items (plus a
 * brand name and theme, each filled once) and composes a single
 * self-contained HTML page (inline CSS, one tiny inline script to wire the
 * "Pin this page" button to the page's own URL — no external assets, no
 * network calls, offline-safe), returned for download/copy.
 *
 * NO HOSTING IS PROVIDED: the user downloads the file and uploads it to
 * their own hosting. Pinterest framing is built into the page itself:
 * a "Pin this page" CTA button (Pinterest share URL) plus a 2:3 hero slot
 * with guidance that Pinterest pins work best at a 2:3 ratio.
 *
 * Validation: every item needs a label (≤60 chars) and an http(s) URL.
 * Invalid items fail the whole build with an "Item N: ..." error so the
 * user can fix the exact row. URLs without a scheme get "https://" added
 * automatically (with a note). More than 20 links are capped at 20
 * (with a note). Every label and URL is HTML-escaped.
 *
 * Themes: light | dark | brand (fixed CSS each; unknown values fall back
 * to light with a note). Default: light.
 *
 * Deterministic: same items → identical HTML, always.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Max links per page (spec: cap at 20 with a note). */
export const MAX_LINKS = 20;

/** Max label length per spec. */
export const LABEL_MAX_CHARS = 60;

/** Allowed themes. */
export const THEMES: ReadonlyArray<string> = ['light', 'dark', 'brand'];

interface CleanItem {
  label: string;
  url: string;
}

const URL_RE = /^https?:\/\/[^\s<>"']+$/i;

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** A URL is usable if it already has an http(s) scheme, or becomes usable
 *  after adding "https://" (only when it looks like a bare domain/path). */
function normalizeUrl(raw: string): { url: string; autoPrefixed: boolean } | null {
  if (URL_RE.test(raw) && raw.length <= 2048) {
    return { url: raw, autoPrefixed: false };
  }
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s<>"']*)?$/i.test(raw) && raw.length <= 2048) {
    return { url: 'https://' + raw, autoPrefixed: true };
  }
  return null;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Fixed themes: { pageBackground, cardBackground, textColor, mutedColor, buttonBackground, buttonText, accent }. */
function themeCss(theme: string): string {
  if (theme === 'dark') {
    return (
      '    body { background: #0f0f14; color: #f5f5f7; }\n' +
      '    .card { background: #17171f; }\n' +
      '    h1 { color: #ffffff; }\n' +
      '    p.sub { color: #a1a1aa; }\n' +
      '    .link-btn { background: #23232e; color: #ffffff; border: 1px solid #34343f; }\n' +
      '    .link-btn:hover { background: #2c2c38; }\n' +
      '    .pin-btn { background: #E60023; color: #ffffff; }\n' +
      '    .pin-btn:hover { background: #c8001f; }\n' +
      '    .foot { color: #6b7280; }\n'
    );
  }
  if (theme === 'brand') {
    return (
      '    body { background: linear-gradient(160deg, #E60023 0%, #b3001b 60%, #7f0013 100%); color: #1f1f23; }\n' +
      '    .card { background: #ffffff; }\n' +
      '    h1 { color: #111111; }\n' +
      '    p.sub { color: #6b7280; }\n' +
      '    .link-btn { background: #fff1f2; color: #9f1239; border: 1px solid #fecdd3; }\n' +
      '    .link-btn:hover { background: #ffe4e6; }\n' +
      '    .pin-btn { background: #E60023; color: #ffffff; }\n' +
      '    .pin-btn:hover { background: #c8001f; }\n' +
      '    .foot { color: #9ca3af; }\n'
    );
  }
  // light (default)
  return (
    '    body { background: linear-gradient(160deg, #fef3f2 0%, #fee2e2 55%, #fecdd3 100%); color: #1f1f23; }\n' +
    '    .card { background: #ffffff; }\n' +
    '    h1 { color: #111111; }\n' +
    '    p.sub { color: #6b7280; }\n' +
    '    .link-btn { background: #f9fafb; color: #111827; border: 1px solid #e5e7eb; }\n' +
    '    .link-btn:hover { background: #fef2f2; border-color: #fecdd3; }\n' +
    '    .pin-btn { background: #E60023; color: #ffffff; }\n' +
    '    .pin-btn:hover { background: #c8001f; }\n' +
    '    .foot { color: #9ca3af; }\n'
  );
}

function buildHtml(brandName: string, theme: string, items: CleanItem[]): string {
  const buttons = items
    .map(
      (item) =>
        '      <a class="link-btn" href="' +
        escapeHtml(item.url) +
        '" target="_blank" rel="noopener">' +
        escapeHtml(item.label) +
        '</a>',
    )
    .join('\n');

  return (
    '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <title>' +
    escapeHtml(brandName) +
    '</title>\n' +
    '  <meta name="description" content="' +
    escapeHtml(brandName) +
    ' — all my links in one place.">\n' +
    '  <style>\n' +
    '    * { box-sizing: border-box; margin: 0; padding: 0; }\n' +
    '    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n' +
    '           min-height: 100vh; display: flex; justify-content: center; padding: 48px 16px; }\n' +
    '    .card { width: 100%; max-width: 420px; border-radius: 24px;\n' +
    '            padding: 36px 28px; box-shadow: 0 20px 60px rgba(0,0,0,.18); text-align: center; }\n' +
    '    .hero { width: 100%; aspect-ratio: 2 / 3; max-height: 260px; border-radius: 16px;\n' +
    '            border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center;\n' +
    '            color: #9ca3af; font-size: 13px; padding: 16px; margin-bottom: 20px; }\n' +
    '    h1 { font-size: 24px; margin-bottom: 6px; }\n' +
    '    p.sub { font-size: 14px; margin-bottom: 24px; }\n' +
    '    .link-btn { display: block; text-decoration: none; font-weight: 600; font-size: 16px;\n' +
    '                border-radius: 14px; padding: 14px 16px; margin-bottom: 12px;\n' +
    '                transition: transform .12s ease; }\n' +
    '    .link-btn:hover { transform: translateY(-1px); }\n' +
    '    .pin-btn { display: block; text-decoration: none; font-weight: 700; font-size: 16px;\n' +
    '               border-radius: 14px; padding: 14px 16px; margin: 8px 0 12px; cursor: pointer; }\n' +
    '    .foot { margin-top: 24px; font-size: 12px; }\n' +
    themeCss(theme) +
    '  </style>\n' +
    '</head>\n' +
    '<body>\n' +
    '  <main class="card">\n' +
    '    <div class="hero" aria-hidden="true">Your 2:3 brand image goes here — Pinterest pins work best at a 2:3 ratio.</div>\n' +
    '    <h1>' +
    escapeHtml(brandName) +
    '</h1>\n' +
    '    <p class="sub">Everything I share, in one place.</p>\n' +
    buttons +
    '\n' +
    '    <a class="pin-btn" id="pinBtn" href="#" target="_blank" rel="noopener">&#128204; Pin this page on Pinterest</a>\n' +
    '    <p class="sub">Save this page to a Pinterest board so followers can find every link from your pins.</p>\n' +
    '    <p class="foot">Made with the HusnainBlogger Pinterest Link-in-Bio Page Builder</p>\n' +
    '  </main>\n' +
    '  <script>\n' +
    '    // No external calls: just points the "Pin this page" button at this page\u2019s own URL.\n' +
    '    (function () {\n' +
    '      var btn = document.getElementById("pinBtn");\n' +
    '      var pageUrl = encodeURIComponent(window.location.href);\n' +
    '      var desc = encodeURIComponent(document.title);\n' +
    '      btn.href = "https://pinterest.com/pin/create/button/?url=" + pageUrl + "&description=" + desc;\n' +
    '    })();\n' +
    '  </script>\n' +
    '</body>\n' +
    '</html>\n'
  );
}

export function runTool(args: { items: Record<string, unknown>[] }): ToolResult {
  const items = args && Array.isArray(args.items) ? args.items : null;
  if (!items) {
    return { ok: false, error: 'No items were provided. Add at least one link.' };
  }
  if (items.length === 0) {
    return { ok: false, error: 'Add at least one link (a label and a URL) before building.' };
  }

  const notes: string[] = [];
  const usable = items.length > MAX_LINKS ? items.slice(0, MAX_LINKS) : items;
  if (items.length > MAX_LINKS) {
    notes.push(
      'Only the first ' + MAX_LINKS + ' links were used (' + items.length + ' were given).',
    );
  }

  let brandName = '';
  let theme = 'light';
  let themeFound = false;
  let themeWarned = false;
  const clean: CleanItem[] = [];

  for (let i = 0; i < usable.length; i++) {
    const n = i + 1;
    const raw = usable[i];
    if (!raw || typeof raw !== 'object') {
      return { ok: false, error: 'Item ' + n + ': entry is not valid. Check the label and URL.' };
    }
    const label = asString(raw['label']);
    const urlRaw = asString(raw['url']);
    const rowBrand = asString(raw['brandName']);
    const rowTheme = asString(raw['theme']).toLowerCase();

    if (!brandName && rowBrand) brandName = rowBrand;
    if (!themeFound && rowTheme) {
      if (THEMES.indexOf(rowTheme) !== -1) {
        theme = rowTheme;
        themeFound = true;
      } else if (!themeWarned) {
        themeWarned = true;
        notes.push(
          'Theme "' + rowTheme + '" is not supported — using "light" instead (choose light, dark, or brand).',
        );
      }
    }

    if (!label) {
      return { ok: false, error: 'Item ' + n + ': the link label is empty.' };
    }
    if (label.length > LABEL_MAX_CHARS) {
      return {
        ok: false,
        error: 'Item ' + n + ': the link label is longer than ' + LABEL_MAX_CHARS + ' characters.',
      };
    }
    if (!urlRaw) {
      return { ok: false, error: 'Item ' + n + ': the URL is empty.' };
    }
    const normalized = normalizeUrl(urlRaw);
    if (!normalized) {
      return {
        ok: false,
        error: 'Item ' + n + ': the URL is not a valid http(s) link.',
      };
    }
    if (normalized.autoPrefixed) {
      notes.push('Item ' + n + ': added "https://" to "' + urlRaw + '".');
    }
    clean.push({ label, url: normalized.url });
  }

  if (!brandName) {
    return {
      ok: false,
      error: 'The brand name is required — fill it once in the "Brand name (fill once)" field of any row.',
    };
  }

  const html = buildHtml(brandName, theme, clean);
  const preview = clean.map((item) => item.label + ' → ' + item.url);
  notes.push(
    'No hosting is provided: upload the downloaded file to your own hosting, then put that page URL in your Pinterest profile.',
  );

  return {
    ok: true,
    values: {
      preview,
      htmlFile: html,
      notes,
    },
  };
}
