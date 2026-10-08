/**
 * tool-232 — Link in Bio Page Builder (builder)
 *
 * Pure client-side static page builder. Takes the user's link items and
 * composes a single self-contained HTML page (inline CSS, no external
 * assets), returned for copy/download. No hosting is provided — the user
 * uploads the downloaded file to their own hosting.
 *
 * Validation: every item needs a non-empty label and an http(s) URL.
 * Invalid items fail the whole build with an "Item N: ..." error so the
 * user can fix the exact row.
 *
 * Deterministic: same items → identical HTML, always.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const URL_RE = /^https?:\/\/[^\s<>"']+$/i;

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidUrl(url: string): boolean {
  if (!URL_RE.test(url)) return false;
  if (url.length > 2048) return false;
  return true;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Fixed, single theme — clean light card on a gradient, mobile-first. */
function buildHtml(items: { label: string; url: string }[]): string {
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
    '  <title>My Links</title>\n' +
    '  <meta name="description" content="My links — all in one place.">\n' +
    '  <style>\n' +
    '    * { box-sizing: border-box; margin: 0; padding: 0; }\n' +
    '    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n' +
    '           background: linear-gradient(160deg, #4f46e5 0%, #7c3aed 55%, #a21caf 100%);\n' +
    '           min-height: 100vh; display: flex; justify-content: center; padding: 48px 16px; color: #111827; }\n' +
    '    .card { width: 100%; max-width: 420px; background: #ffffff; border-radius: 24px;\n' +
    '            padding: 40px 28px; box-shadow: 0 20px 60px rgba(0,0,0,.25); text-align: center; }\n' +
    '    .avatar { width: 88px; height: 88px; border-radius: 50%; margin: 0 auto 16px;\n' +
    '              background: linear-gradient(135deg, #4f46e5, #a21caf);\n' +
    '              display: flex; align-items: center; justify-content: center;\n' +
    '              color: #fff; font-size: 40px; font-weight: 700; }\n' +
    '    h1 { font-size: 24px; margin-bottom: 6px; }\n' +
    '    p.sub { color: #6b7280; font-size: 14px; margin-bottom: 28px; }\n' +
    '    .link-btn { display: block; text-decoration: none; color: #111827; background: #f3f4f6;\n' +
    '                border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px 16px;\n' +
    '                margin-bottom: 12px; font-weight: 600; font-size: 16px;\n' +
    '                transition: transform .12s ease, background .12s ease; }\n' +
    '    .link-btn:hover { background: #eef2ff; transform: translateY(-1px); }\n' +
    '    .foot { margin-top: 24px; font-size: 12px; color: #9ca3af; }\n' +
    '  </style>\n' +
    '</head>\n' +
    '<body>\n' +
    '  <main class="card">\n' +
    '    <div class="avatar" aria-hidden="true">&#9733;</div>\n' +
    '    <h1>My Links</h1>\n' +
    '    <p class="sub">Everything I share, in one place.</p>\n' +
    buttons +
    '\n' +
    '    <p class="foot">Made with the HusnainBlogger Link in Bio Page Builder</p>\n' +
    '  </main>\n' +
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

  const clean: { label: string; url: string }[] = [];
  for (let i = 0; i < items.length; i++) {
    const n = i + 1;
    const raw = items[i];
    if (!raw || typeof raw !== 'object') {
      return { ok: false, error: 'Item ' + n + ': entry is not valid. Check the label and URL.' };
    }
    const label = asString(raw['label']);
    const url = asString(raw['url']);
    if (!label) {
      return { ok: false, error: 'Item ' + n + ': the link label is empty.' };
    }
    if (!url) {
      return { ok: false, error: 'Item ' + n + ': the URL is empty.' };
    }
    if (!isValidUrl(url)) {
      return {
        ok: false,
        error: 'Item ' + n + ': the URL is not a valid http(s) link.',
      };
    }
    clean.push({ label, url });
  }

  const html = buildHtml(clean);
  const preview = clean.map((item) => item.label + ' → ' + item.url);

  return {
    ok: true,
    values: {
      preview,
      htmlDownload: html,
      copyEmbed: html,
    },
  };
}
