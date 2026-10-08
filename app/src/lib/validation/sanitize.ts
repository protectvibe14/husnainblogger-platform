/**
 * validation/sanitize.ts
 *
 * Framework-agnostic, dependency-free input sanitization helpers.
 *
 * Sanitization policy (see docs/architecture/VALIDATION.md):
 *  1. Sanitize on INPUT  — trim, normalize whitespace/unicode, and strip
 *     markup for plain-text fields before validation/storage.
 *  2. Escape on OUTPUT   — ALWAYS escapeHtml() anything user-supplied
 *     before inserting it into HTML/DOM.
 *  3. Never execute user input (no eval, no new Function, no innerHTML
 *     with raw user strings).
 *
 * LIMITATION (honest): stripHtml() is regex-based. It is safe for
 * plain-text display contexts, but it is not a replacement for a real
 * HTML parser (e.g. DOMPurify) if a tool ever needs to render rich HTML.
 * No tool in the 500-tool inventory needs rich HTML, so this is sufficient.
 */

export interface SanitizeTextOptions {
  /** Strip HTML tags (default true). */
  stripTags?: boolean;
  /** Collapse all whitespace runs to single spaces (default true). */
  collapseWhitespace?: boolean;
  /** Unicode-normalize to NFC (default true). */
  normalizeUnicode?: boolean;
  /** Hard cap on output length; truncates (default: no cap). */
  maxLength?: number;
}

/** Remove leading/trailing whitespace (including unicode spaces). */
export function trim(value: string): string {
  return value.trim();
}

/** Unicode-normalize to NFC so visually identical input compares equal. */
export function normalizeUnicode(value: string): string {
  return value.normalize('NFC');
}

/** Collapse every run of whitespace (spaces, tabs, newlines) to one space. */
export function normalizeWhitespace(value: string): string {
  // Collapse horizontal whitespace runs to a single space, but PRESERVE
  // newlines — textarea inputs (one item per line) depend on them.
  return value
    .replace(/[ \t\f\v\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
}

/**
 * Escape the five HTML-significant characters so a string is safe to
 * insert into HTML text content or double-quoted attribute values.
 * This is the OUTPUT-side guard — use it every time user data hits the DOM.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Remove HTML markup from a string, for plain-text contexts.
 *
 * Steps:
 *  1. Remove <script>…</script> and <style>…</style> blocks entirely
 *     (including their content).
 *  2. Remove HTML comments.
 *  3. Remove all remaining tags.
 *
 * What it does NOT do: decode entities, validate URLs, or make rich HTML
 * safe. Pair with escapeHtml() before DOM insertion.
 */
export function stripHtml(value: string): string {
  let out = value;
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '');
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  out = out.replace(/<[^>]*>/g, '');
  return out;
}

/**
 * Full plain-text pipeline: normalize unicode → strip tags (optional) →
 * collapse whitespace → trim → optional length cap.
 * Idempotent: running it twice gives the same result.
 */
export function sanitizeText(
  value: string,
  options: SanitizeTextOptions = {}
): string {
  const {
    stripTags = true,
    collapseWhitespace = true,
    normalizeUnicode: doNormalize = true,
    maxLength,
  } = options;

  let out = value;
  if (doNormalize) out = normalizeUnicode(out);
  if (stripTags) out = stripHtml(out);
  if (collapseWhitespace) out = normalizeWhitespace(out);
  out = out.trim();
  if (typeof maxLength === 'number' && maxLength >= 0) {
    out = [...out].slice(0, maxLength).join('');
  }
  return out;
}

/**
 * Sanitize a URL string for use in href/src attributes.
 * Returns the trimmed URL only if it uses http(s); otherwise null.
 * Use this instead of trusting user-supplied links.
 */
export function sanitizeUrl(value: string): string | null {
  const trimmed = value.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
}
