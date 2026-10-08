/**
 * lib/blog.ts — shared blog helpers.
 * Owner: Blog.
 *
 * Single source of truth for: post slugs, reading time, date formatting.
 * Pages and the admin panel MUST use these instead of re-implementing.
 */

/** Post slug from an Astro content-collection entry. */
export function postSlug(p: { slug?: string; id: string }): string {
  return p.slug ?? p.id.replace(/\.md$/, "").split("/").pop() ?? p.id;
}

/** Post URL path (trailing slash). */
export function postUrl(p: { slug?: string; id: string }): string {
  return `/blog/${postSlug(p)}/`;
}

/** Absolute post URL for canonical / sitemap / OG. */
export function postAbsoluteUrl(
  p: { slug?: string; id: string },
  site = "https://husnainblogger.com",
): string {
  return `${site}${postUrl(p)}`;
}

/** Reading time in minutes from markdown body (200 wpm, min 1). */
export function readingTime(body: string | undefined): number {
  const words = (body ?? "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** "October 22, 2024" — en-US long date. */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** "2024-10-22" — for <time datetime>. */
export function isoDate(date: string | Date): string {
  return new Date(date).toISOString().slice(0, 10);
}
