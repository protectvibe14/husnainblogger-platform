/**
 * Email Signature Generator — pure logic (tool-438).
 *
 * PURE STRING TEMPLATING, NOT AI: the signature is rendered into ONE fixed,
 * email-client-safe layout (nested <table> + inline styles only — no external
 * CSS, no <style> blocks, no JavaScript) using the user's own inputs. There is
 * no live email-client preview; the output is copy-paste HTML plus a plain-
 * text twin. Deterministic: same inputs → identical output, always.
 *
 * Fixed style palette (documented for the honesty contract):
 * - 1 table layout template (accent bar + details column)
 * - Font stack: Arial, Helvetica, sans-serif (client-safe fallback)
 * - Accent color #2563eb, name #111111, body text #222222, muted #555555
 *
 * Edge-case handling:
 * - Lengths measured in Unicode code points ([...s].length): emoji / CJK / RTL
 *   count as one character each.
 * - Over-long inputs are TRUNCATED; the notice is appended as an HTML comment
 *   in signatureHTML and as a bracketed note line in signatureText — never
 *   silently dropped, never inside the signature body itself.
 * - All user text is HTML-escaped (content + attribute contexts).
 * - Website href gets an https:// scheme when missing; social entries are
 *   parsed as "Label: URL" or bare URLs, comma/newline separated.
 */

export const MAX_NAME_CHARS = 60;
export const MAX_TITLE_CHARS = 60;
export const MAX_COMPANY_CHARS = 60;
export const MAX_PHONE_CHARS = 30;
export const MAX_WEBSITE_CHARS = 120;
export const MAX_SOCIAL_CHARS = 300;

/** Unicode code-point length (emoji / CJK / RTL each count as 1). */
function cpLength(s: string): number {
  return [...s].length;
}

/** Truncate to max code points; returns [text, wasTruncated]. */
function truncateCp(s: string, max: number): [string, boolean] {
  const cps = [...s];
  if (cps.length <= max) return [s, false];
  return [cps.slice(0, max).join(''), true];
}

/** Escape text for HTML content AND attribute contexts. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Keep only digits and a leading + for tel: hrefs. */
export function sanitizePhoneForTel(phone: string): string {
  return phone.replace(/[^\d+]/g, '').replace(/\+(?=.*\+)/g, '');
}

/** Ensure an https:// scheme for link hrefs. */
export function normalizeUrl(raw: string): string {
  const t = raw.trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(t)) return t;
  return 'https://' + t;
}

/** Extract a readable label from a URL (host, without www). */
export function urlLabel(raw: string): string {
  const t = raw.trim();
  const m = t.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/([^/?#]+)/);
  const host = m ? m[1] : t.split(/[/?#]/)[0];
  return host.replace(/^www\./i, '');
}

export interface SocialLink {
  label: string;
  url: string;
}

/**
 * Parse the free-text social field: comma or newline separated entries,
 * each "Label: https://..." or a bare URL (label becomes the host).
 */
export function parseSocialLinks(raw: string): SocialLink[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((entry) => {
      // Bare URL: the entry itself starts with a scheme.
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(entry)) {
        return { label: urlLabel(entry), url: entry };
      }
      // "Label: URL" form — split at the first colon (a label, not a scheme).
      const colon = entry.indexOf(':');
      if (colon > 0) {
        const label = entry.slice(0, colon).trim();
        const rest = entry.slice(colon + 1).trim();
        if (rest && !/\s/.test(rest)) {
          return { label: label || urlLabel(rest), url: normalizeUrl(rest) };
        }
      }
      return { label: urlLabel(entry), url: normalizeUrl(entry) };
    })
    .filter((l) => l.url.replace(/^https?:\/\//, '').length > 0);
}

function nonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const { name, title, company, phone, website, socialLinks } = values;

  if (!nonEmptyString(name)) {
    return { ok: false, error: 'Please enter your name.' };
  }
  if (!nonEmptyString(title)) {
    return { ok: false, error: 'Please enter your job title.' };
  }
  if (!nonEmptyString(company)) {
    return { ok: false, error: 'Please enter your company.' };
  }
  if (nonEmptyString(website) && /\s/.test((website as string).trim())) {
    return { ok: false, error: 'The website does not look like a valid URL (no spaces allowed).' };
  }

  let n = (name as string).trim();
  let t = (title as string).trim();
  let c = (company as string).trim();
  let p = typeof phone === 'string' ? phone.trim() : '';
  let w = typeof website === 'string' ? website.trim() : '';
  let s = typeof socialLinks === 'string' ? socialLinks.trim() : '';
  const notices: string[] = [];

  const caps: Array<[string, string, number]> = [
    ['name', n, MAX_NAME_CHARS],
    ['title', t, MAX_TITLE_CHARS],
    ['company', c, MAX_COMPANY_CHARS],
    ['phone', p, MAX_PHONE_CHARS],
    ['website', w, MAX_WEBSITE_CHARS],
    ['social links', s, MAX_SOCIAL_CHARS],
  ];
  const truncated: Record<string, string> = { name: n, title: t, company: c, phone: p, website: w, social: s };
  for (const [field, value, max] of caps) {
    const [cut, was] = truncateCp(value, max);
    const key = field === 'social links' ? 'social' : field;
    truncated[key] = cut;
    if (was) notices.push(`'${field}' was truncated to ${max} characters.`);
  }
  n = truncated.name; t = truncated.title; c = truncated.company;
  p = truncated.phone; w = truncated.website; s = truncated.social;

  const escName = escapeHtml(n);
  const escTitle = escapeHtml(t);
  const escCompany = escapeHtml(c);
  const escPhone = escapeHtml(p);
  const escPhoneHref = escapeHtml(sanitizePhoneForTel(p));
  const escSite = escapeHtml(w);
  const escSiteHref = escapeHtml(normalizeUrl(w));
  const social = parseSocialLinks(s);

  // -- Contact row (HTML) -------------------------------------------------
  const contactCells: string[] = [];
  if (p) {
    const phoneHtml = escPhoneHref
      ? `<a href="tel:${escPhoneHref}" style="color:#2563eb;text-decoration:none;">${escPhone}</a>`
      : escPhone;
    contactCells.push(`<span style="color:#555555;">${phoneHtml}</span>`);
  }
  if (w) {
    contactCells.push(
      `<a href="${escSiteHref}" style="color:#2563eb;text-decoration:none;">${escSite}</a>`,
    );
  }
  const contactRow = contactCells.length
    ? `<tr><td style="padding:0 0 4px 0;font-size:13px;">${contactCells.join(' <span style="color:#999999;">&nbsp;|&nbsp;</span> ')}</td></tr>`
    : '';

  // -- Social row (HTML) --------------------------------------------------
  const socialRow = social.length
    ? `<tr><td style="padding:0;font-size:13px;">${social
        .map(
          (l) =>
            `<a href="${escapeHtml(l.url)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(l.label)}</a>`,
        )
        .join(' <span style="color:#999999;">&nbsp;|&nbsp;</span> ')}</td></tr>`
    : '';

  const signatureHTML =
    `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#222222;">` +
    `<tr><td style="padding:0 0 0 12px;border-left:3px solid #2563eb;">` +
    `<table cellpadding="0" cellspacing="0" border="0">` +
    `<tr><td style="padding:0 0 2px 0;font-size:16px;font-weight:bold;color:#111111;">${escName}</td></tr>` +
    `<tr><td style="padding:0 0 2px 0;color:#555555;">${escTitle}</td></tr>` +
    `<tr><td style="padding:0 0 6px 0;color:#555555;">${escCompany}</td></tr>` +
    contactRow +
    socialRow +
    `</table></td></tr></table>` +
    notices.map((x) => `<!-- Signature notice: ${escapeHtml(x)} -->`).join('');

  // -- Plain-text twin -----------------------------------------------------
  const textLines = [n, `${t} | ${c}`];
  const contactText: string[] = [];
  if (p) contactText.push(`Phone: ${p}`);
  if (w) contactText.push(`Web: ${w}`);
  if (contactText.length) textLines.push(contactText.join(' | '));
  if (social.length) {
    textLines.push(social.map((l) => `${l.label}: ${l.url}`).join(' | '));
  }
  const signatureText =
    textLines.join('\n') +
    notices.map((x) => `\n\n[Note: ${x}]`).join('');

  return { ok: true, values: { signatureHTML, signatureText } };
}
