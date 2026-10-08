/**
 * Plain-Text Email Formatter — pure logic (tool-439).
 *
 * DETERMINISTIC TEXT TRANSFORMATION, NOT A RENDERER: converts pasted HTML
 * into a linearized plain-text email version. It does NOT preview how any
 * email client will render the message — rendering fidelity is never claimed.
 * No network, no DOM parsing (regex-based, deterministic).
 *
 * Transformation rules (fixed, documented for the honesty contract):
 * 1. <script> and <style> blocks are removed entirely (their content is not
 *    part of the message).
 * 2. Block tags (p, div, h1–h6, blockquote, section, …) and <br>/<hr> become
 *    line breaks; <li> becomes a "- " bullet line.
 * 3. Links: linkStyle "inline"  → `text (url)`; "footnote" → `text [n]` with a
 *    numbered "Links:" list appended. A link whose text equals its URL is
 *    rendered as the bare URL.
 * 4. Images: <img alt="…"> → `[Image: alt text]`; missing alt → `[Image]`.
 * 5. HTML entities are decoded (&amp; &lt; &gt; &quot; &#39; &nbsp; + numeric).
 * 6. Lines are wrapped at lineWidth (default 72, clamped to 40–120) measured
 *    in Unicode code points; tokens longer than the width are hard-broken.
 *
 * Edge-case handling:
 * - Lengths measured in Unicode code points ([...s].length).
 * - Input over MAX_INPUT_CHARS code points is truncated with a visible notice
 *   appended to the output (never silently dropped).
 * - Output is plain text only; stray "<"/">" from literal text survive
 *   (only well-formed tags are stripped).
 */

export const DEFAULT_LINE_WIDTH = 72;
export const MIN_LINE_WIDTH = 40;
export const MAX_LINE_WIDTH = 120;
export const MAX_INPUT_CHARS = 50000;

export const LINK_STYLES = ['inline', 'footnote'] as const;

/** Unicode code-point length (emoji / CJK / RTL each count as 1). */
function cpLength(s: string): number {
  return [...s].length;
}

/** Extract a quoted/unquoted attribute value from a tag string. */
export function extractAttr(tag: string, name: string): string | null {
  const m = tag.match(
    new RegExp(name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'),
  );
  if (!m) return null;
  return m[1] ?? m[2] ?? m[3];
}

/** Decode common HTML entities; &amp; decoded last to avoid double-decoding. */
export function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_m, n: string) =>
      String.fromCodePoint(Math.min(Number(n) || 0xfffd, 0x10ffff)),
    )
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, n: string) =>
      String.fromCodePoint(Math.min(parseInt(n, 16) || 0xfffd, 0x10ffff)),
    )
    .replace(/&amp;/gi, '&');
}

/** Wrap one line at `width` code points; over-long tokens are hard-broken. */
export function wrapLine(line: string, width: number): string[] {
  const words = line.split(' ').filter((w) => w.length > 0);
  if (words.length === 0) return [''];
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    if (cpLength(w) > width) {
      if (cur) {
        out.push(cur);
        cur = '';
      }
      const cps = [...w];
      for (let i = 0; i < cps.length; i += width) {
        out.push(cps.slice(i, i + width).join(''));
      }
      continue;
    }
    const cand = cur ? cur + ' ' + w : w;
    if (cpLength(cand) <= width) {
      cur = cand;
    } else {
      out.push(cur);
      cur = w;
    }
  }
  if (cur) out.push(cur);
  return out;
}

/** Core HTML → text linearization. */
export function htmlToText(html: string, linkStyle: 'inline' | 'footnote'): string {
  let s = html;
  // 1. Drop script/style content entirely.
  s = s.replace(/<script[\s\S]*?<\/script\s*>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style\s*>/gi, '');
  // 2. Images → alt fallback.
  s = s.replace(/<img\b[^>]*>/gi, (tag) => {
    const alt = extractAttr(tag, 'alt');
    return alt && alt.trim() ? `[Image: ${alt.trim()}]` : '[Image]';
  });
  // 3. Links.
  const footnotes: string[] = [];
  s = s.replace(/<a\b[^>]*>[\s\S]*?<\/a\s*>/gi, (full) => {
    const openTag = (full.match(/^<a\b[^>]*>/i) || [''])[0];
    const href = extractAttr(openTag, 'href');
    const innerText = full
      .replace(/^<a\b[^>]*>/i, '')
      .replace(/<\/a\s*>$/i, '')
      .replace(/<[^>]*>/g, '')
      .trim();
    if (!href || !href.trim()) return innerText;
    const url = href.trim();
    if (!innerText || innerText === url) return url;
    if (linkStyle === 'inline') return `${innerText} (${url})`;
    footnotes.push(url);
    return `${innerText} [${footnotes.length}]`;
  });
  // 4. Block structure → line breaks.
  s = s.replace(/<(br|hr)\b[^>]*>/gi, '\n');
  s = s.replace(/<li\b[^>]*>/gi, '\n- ');
  s = s.replace(/<\/(li|p|div|h[1-6]|tr|table|thead|tbody|blockquote|section|article|header|footer)\b[^>]*>/gi, '\n');
  s = s.replace(/<(p|div|h[1-6]|tr|blockquote|section|article|header|footer)\b[^>]*>/gi, '\n');
  // 5. Strip remaining tags, decode entities, normalize whitespace.
  s = s.replace(/<[^>]*>/g, '');
  s = decodeEntities(s);
  const rawLines = s.split('\n').map((l) => l.replace(/[ \t\f\v\u00a0]+/g, ' ').trim());
  // Collapse runs of blank lines to one; drop leading/trailing blanks.
  const collapsed: string[] = [];
  for (const l of rawLines) {
    if (l === '' && collapsed[collapsed.length - 1] === '') continue;
    collapsed.push(l);
  }
  while (collapsed[0] === '') collapsed.shift();
  while (collapsed[collapsed.length - 1] === '') collapsed.pop();
  // 6. Footnotes.
  if (footnotes.length > 0) {
    collapsed.push('', 'Links:');
    footnotes.forEach((u, i) => collapsed.push(`[${i + 1}] ${u}`));
  }
  return collapsed.join('\n');
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const { richText, lineWidth, linkStyle } = values;

  if (typeof richText !== 'string' || richText.trim().length === 0) {
    return { ok: false, error: 'Please paste the HTML email content to convert.' };
  }
  if (typeof linkStyle !== 'string' || !(LINK_STYLES as readonly string[]).includes(linkStyle)) {
    return { ok: false, error: 'Please choose a link style: inline or footnote.' };
  }

  let width = DEFAULT_LINE_WIDTH;
  if (lineWidth !== undefined && lineWidth !== null && lineWidth !== '') {
    if (typeof lineWidth !== 'number' || !Number.isFinite(lineWidth)) {
      return { ok: false, error: 'Line width must be a number.' };
    }
    width = Math.min(MAX_LINE_WIDTH, Math.max(MIN_LINE_WIDTH, Math.round(lineWidth)));
  }

  let input = richText;
  const notices: string[] = [];
  if (cpLength(input) > MAX_INPUT_CHARS) {
    input = [...input].slice(0, MAX_INPUT_CHARS).join('');
    notices.push(`Input was truncated to ${MAX_INPUT_CHARS} characters.`);
  }

  const linear = htmlToText(input, linkStyle as 'inline' | 'footnote');
  const wrapped = linear.split('\n').flatMap((l) => wrapLine(l, width));
  let plainText = wrapped.join('\n');
  for (const n of notices) plainText += `\n\n[Note: ${n}]`;

  const stats = `${plainText.split('\n').length} lines, ${cpLength(plainText)} characters`;
  return { ok: true, values: { plainText, stats } };
}
