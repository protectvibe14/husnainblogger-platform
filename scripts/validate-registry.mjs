#!/usr/bin/env node
/**
 * validate-registry.mjs — Zero-dependency Node CI gate for the tool registry.
 *
 * Loads data/tools-inventory.json and FAILS (non-zero exit) on:
 *   1. Duplicate toolId values
 *   2. Duplicate slug values
 *   3. Missing/empty required fields: toolId, name, slug, category,
 *      categorySlug, toolType, primaryKeyword, status, version
 *   4. Unknown toolType values
 *   5. MA3 SEO slug checks (docs/seo/URL_TAXONOMY.md §3.2):
 *      E4: slug longer than 60 chars
 *      E5: slug collides with a hub slug (<categorySlug>-tools) or bare categorySlug
 *      E6: slug contains a 4-digit year or numeric suffix (e.g. -2, -2024)
 *      E7: unknown categorySlug
 *   Warnings (non-failing): W1 duplicate primaryKeyword, W3 slug longer than
 *   40 chars. E3 ((categorySlug,slug) pair duplicates) is implied by the global
 *   slug-uniqueness check and is not repeated.
 *
 * NOTE (2026-10-01): E6 renames resolved by Lead — tool-276 -> b-roll-shot-list-generator,
 * tool-321 -> ai-content-pillars-planner (tool-412's -2 slug is DEPRECATED/retired and skipped).
 * URL-affecting checks skip DEPRECATED tombstones (they get no URL). Rename ownership:
 * MA2/MA3 — do NOT rename silently here; the failing gate is the forcing function.
 *
 * This is the fast pre-merge gate. The full validator (release-gate checks,
 * relatedTools cross-refs, semver, coverage) lives in
 * app/src/lib/registry/validate.ts — run it via:
 *   node app/src/lib/registry/validate.ts
 *
 * Exit codes: 0 = valid, 1 = validation errors, 2 = usage/file problem.
 * No dependencies — runs on any Node >= 16.
 *
 * Usage: node scripts/validate-registry.mjs [path/to/tools-inventory.json]
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED_FIELDS = [
  "toolId",
  "name",
  "slug",
  "category",
  "categorySlug",
  "toolType",
  "primaryKeyword",
  "status",
  "version",
];

const KNOWN_TOOL_TYPES = new Set([
  "generator",
  "planner",
  "calculator",
  "builder",
  "tracker",
  "checker",
  "analyzer",
  "scorer",
  "formatter",
  "converter",
  "ai",
]);

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// MA3 URL_TAXONOMY.md §3.2 — the 11 known category slugs (source: inventory).
const KNOWN_CATEGORY_SLUGS = new Set([
  "blogging-seo",
  "make-money",
  "youtube",
  "tiktok",
  "instagram",
  "video-editing",
  "ai-workflows",
  "pinterest-social",
  "email-marketing",
  "creator-business",
  "ai-tools",
]);

// E6: 4-digit year anywhere, or trailing numeric suffix like -2 / -2024.
const YEAR_RE = /(^|-)20\d{2}(-|$)/;
const NUMERIC_SUFFIX_RE = /-\d+$/;

function main() {
  const root = dirname(fileURLToPath(import.meta.url));
  const inventoryPath = process.argv[2]
    ? resolve(process.argv[2])
    : resolve(root, "..", "data", "tools-inventory.json");

  let data;
  try {
    data = JSON.parse(readFileSync(inventoryPath, "utf-8"));
  } catch (e) {
    console.error(`ERROR: cannot read/parse inventory file: ${inventoryPath}: ${e.message}`);
    return 2;
  }
  if (!data || !Array.isArray(data.tools)) {
    console.error(`ERROR: ${inventoryPath} must contain a top-level "tools" array`);
    return 2;
  }

  const errors = [];
  const warnings = [];
  const seenIds = new Map();
  const seenSlugs = new Map();
  const seenPrimaryKeywords = new Map();

  // Hub slugs + bare category slugs reserved by MA3's taxonomy (E5).
  const reservedSlugs = new Set();
  for (const c of KNOWN_CATEGORY_SLUGS) {
    reservedSlugs.add(c);
    reservedSlugs.add(`${c}-tools`);
  }

  data.tools.forEach((t, idx) => {
    const label = typeof t?.toolId === "string" && t.toolId ? t.toolId : `<index ${idx}>`;

    // 3. required fields
    for (const field of REQUIRED_FIELDS) {
      const v = t?.[field];
      if (v === undefined || v === null || (typeof v === "string" && !v.trim())) {
        errors.push(`${label}: missing/empty required field '${field}'`);
      }
    }

    // 1. duplicate toolIds
    if (typeof t?.toolId === "string" && t.toolId) {
      if (seenIds.has(t.toolId)) errors.push(`Duplicate toolId '${t.toolId}' (indexes ${seenIds.get(t.toolId)}, ${idx})`);
      else seenIds.set(t.toolId, idx);
    }

    // 2. duplicate slugs (+ format sanity)
    if (typeof t?.slug === "string" && t.slug) {
      if (seenSlugs.has(t.slug)) errors.push(`Duplicate slug '${t.slug}' (indexes ${seenSlugs.get(t.slug)}, ${idx})`);
      else seenSlugs.set(t.slug, idx);
      if (!SLUG_RE.test(t.slug)) errors.push(`${label}: invalid slug format '${t.slug}'`);
    }

    // 4. unknown toolType
    if (typeof t?.toolType === "string" && t.toolType && !KNOWN_TOOL_TYPES.has(t.toolType)) {
      errors.push(`${label}: unknown toolType '${t.toolType}'`);
    }

    // 5. MA3 slug checks (URL_TAXONOMY.md §3.2) — skip DEPRECATED tombstones (no URL)
    if (t?.status !== "DEPRECATED" && typeof t?.slug === "string" && t.slug) {
      if (t.slug.length > 60) errors.push(`${label}: E4 slug longer than 60 chars (${t.slug.length}): '${t.slug}'`);
      else if (t.slug.length > 40) warnings.push(`${label}: W3 slug longer than 40 chars (${t.slug.length}): '${t.slug}'`);
      if (reservedSlugs.has(t.slug)) errors.push(`${label}: E5 slug collides with a hub or bare-category path: '${t.slug}'`);
      if (YEAR_RE.test(t.slug) || NUMERIC_SUFFIX_RE.test(t.slug)) {
        errors.push(`${label}: E6 slug contains a year or numeric suffix: '${t.slug}' (rename required before launch)`);
      }
    }
    if (typeof t?.categorySlug === "string" && t.categorySlug && !KNOWN_CATEGORY_SLUGS.has(t.categorySlug)) {
      errors.push(`${label}: E7 unknown categorySlug '${t.categorySlug}'`);
    }
    if (t?.status !== "DEPRECATED" && typeof t?.primaryKeyword === "string" && t.primaryKeyword.trim()) {
      const key = t.primaryKeyword.trim().toLowerCase();
      if (seenPrimaryKeywords.has(key)) {
        warnings.push(`${label}: W1 duplicate primaryKeyword '${t.primaryKeyword}' (also ${seenPrimaryKeywords.get(key)})`);
      } else seenPrimaryKeywords.set(key, label);
    }
  });

  console.log(`Inventory: ${inventoryPath}`);
  console.log(`Tools scanned: ${data.tools.length}`);
  console.log(`Errors: ${errors.length}`);
  for (const e of errors.slice(0, 25)) console.log(`  [FAIL] ${e}`);
  if (errors.length > 25) console.log(`  ... and ${errors.length - 25} more`);
  console.log(`Warnings: ${warnings.length}`);
  for (const w of warnings.slice(0, 25)) console.log(`  [WARN] ${w}`);
  if (warnings.length > 25) console.log(`  ... and ${warnings.length - 25} more`);

  if (errors.length > 0) {
    console.log("RESULT: FAIL — registry validation failed.");
    return 1;
  }
  console.log("RESULT: PASS — registry is valid.");
  return 0;
}

process.exit(main());
