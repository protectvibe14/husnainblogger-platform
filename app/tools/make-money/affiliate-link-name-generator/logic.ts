/**
 * Affiliate Link Name Generator — pure logic (tool-506).
 *
 * FIXED BANKS (documented sizes):
 * - SUFFIX_BANK: 24 fixed slug fragments appended to the base slug.
 * - Fallback: numbered variants (base-2, base-3, ...) when the request
 *   exceeds 1 + 24 variants. No randomness anywhere.
 *
 * ENGINE RULES (deterministic, fixed):
 *  1. base = slugify(productName): lowercase; every run of non [a-z0-9]
 *     chars becomes a single hyphen; leading/trailing hyphens trimmed;
 *     result truncated to MAX_BASE_LENGTH (40) chars with any trailing
 *     hyphen removed after the cut.
 *  2. If base is empty (e.g. punctuation-only input) -> error: there is
 *     nothing slug-safe to build from.
 *  3. variants = [base, base+SUFFIX_BANK[0], ...] then base-2, base-3, ...
 *     until `count` names exist; duplicates are removed within the batch.
 *  4. Output charset is strictly [a-z0-9-] (slug-safe for cloaking plugins
 *     such as Pretty Links).
 *
 * HONESTY: a pure naming/slugging utility from the user's own input. It
 * checks no domain or link availability, talks to no platform, and never
 * claims AI. Generated names do not cloak anything by themselves — they are
 * suggestions to paste into the user's own link-cloaking setup.
 *
 * DETERMINISM: same inputs -> identical outputs (no randomness, no clock).
 * ZERO IMPORTS: no node:, no DOM, no network, no Math.random.
 */

export const SUFFIX_BANK = [
  "-deal",
  "-deals",
  "-offer",
  "-offers",
  "-discount",
  "-bonus",
  "-review",
  "-reviews",
  "-guide",
  "-get",
  "-buy",
  "-try",
  "-start",
  "-join",
  "-save",
  "-promo",
  "-coupon",
  "-special",
  "-link",
  "-go",
  "-shop",
  "-best",
  "-top",
  "-pro",
] as const;

export const MAX_BASE_LENGTH = 40;
export const DEFAULT_COUNT = 10;
export const MAX_COUNT = 50;
export const MAX_PRODUCT_NAME_LENGTH = 100;

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

export function slugify(raw: string): string {
  let s = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  s = s.replace(/^-+|-+$/g, "");
  if (s.length > MAX_BASE_LENGTH) {
    s = s.slice(0, MAX_BASE_LENGTH).replace(/-+$/g, "");
  }
  return s;
}

/**
 * runTool({ productName, count? })
 *
 * productName: string, required — non-empty after trimming, max 100 chars.
 * count: number, optional — whole number 1-50, defaults to 10. An empty
 *   input ("", null, undefined) is treated as "not provided".
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!isPlainRecord(values)) {
    return fail("Input must be an object with your values.");
  }

  const rawName = values.productName;
  if (typeof rawName !== "string") {
    return fail("Enter a product name to generate link names.");
  }
  const productName = rawName.trim();
  if (productName === "") {
    return fail("Enter a product name to generate link names.");
  }
  if (productName.length > MAX_PRODUCT_NAME_LENGTH) {
    return fail(
      `Product name must be ${MAX_PRODUCT_NAME_LENGTH} characters or fewer.`,
    );
  }

  const base = slugify(productName);
  if (base === "") {
    return fail(
      "We could not build a link name from that text — use letters or numbers in the product name.",
    );
  }

  let count = DEFAULT_COUNT;
  const rawCount = values.count;
  if (rawCount !== undefined && rawCount !== null && rawCount !== "") {
    if (
      typeof rawCount !== "number" ||
      Number.isNaN(rawCount) ||
      !Number.isInteger(rawCount)
    ) {
      return fail("Count must be a whole number between 1 and 50.");
    }
    if (rawCount < 1 || rawCount > MAX_COUNT) {
      return fail("Count must be a whole number between 1 and 50.");
    }
    count = rawCount;
  }

  const seen = new Set<string>();
  const slugs: string[] = [];
  const push = (slug: string): void => {
    if (!seen.has(slug)) {
      seen.add(slug);
      slugs.push(slug);
    }
  };

  push(base);
  for (const suffix of SUFFIX_BANK) {
    if (slugs.length >= count) break;
    push(base + suffix);
  }
  let n = 2;
  while (slugs.length < count) {
    push(`${base}-${n}`);
    n += 1;
  }

  return { ok: true, values: { slugs } };
}
