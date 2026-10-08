#!/usr/bin/env node
/**
 * build-registry.mjs — codegen: data/tools-inventory.json → typed artifacts.
 *
 * Reads  : <root>/data/tools-inventory.json  (SOURCE OF TRUTH — never written)
 * Writes : <root>/app/src/data/registry.generated.ts  (typed ToolRecord[] + lookup maps + hash)
 *          <root>/app/src/data/slug-manifest.json     (slug → canonical URL, for MA3 sitemap/link-map)
 *
 * The generated TS file carries the sha256 of the inventory it was built
 * from as REGISTRY_HASH. `astro build` (via `prebuild`) runs this script
 * with --check and refuses to build on a stale hash — inventory edits can
 * never silently diverge from the pages.
 *
 * Usage:
 *   node scripts/build-registry.mjs            regenerate artifacts
 *   node scripts/build-registry.mjs --check    exit 1 if artifacts missing or hash-stale
 *
 * No dependencies — Node >= 16. Canonical URLs use trailingSlash:'always'
 * (/tools/<category>/<slug>/) per ARCHITECTURE.md §4.
 */

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INVENTORY_PATH = resolve(ROOT, "data", "tools-inventory.json");
const OUT_DIR = resolve(ROOT, "app", "src", "data");
const GENERATED_PATH = resolve(OUT_DIR, "registry.generated.ts");
const MANIFEST_PATH = resolve(OUT_DIR, "slug-manifest.json");
const LINKMAP_SRC = resolve(ROOT, "data", "link-map.json");
const LINKMAP_DST = resolve(OUT_DIR, "link-map.json");

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function sha256Hex(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function loadInventory() {
  let raw;
  try {
    raw = readFileSync(INVENTORY_PATH);
  } catch (e) {
    console.error(`ERROR: cannot read inventory: ${INVENTORY_PATH}: ${e.message}`);
    process.exit(2);
  }
  const hash = sha256Hex(raw);
  let data;
  try {
    data = JSON.parse(raw.toString("utf-8"));
  } catch (e) {
    console.error(`ERROR: inventory is not valid JSON: ${e.message}`);
    process.exit(2);
  }
  if (!data || !Array.isArray(data.tools)) {
    console.error(`ERROR: inventory must contain a top-level "tools" array`);
    process.exit(2);
  }
  return { tools: data.tools, hash };
}

/** Minimal fail-fast sanity (the full gate is scripts/validate-registry.mjs). */
function sanityCheck(tools) {
  const problems = [];
  const seenIds = new Set();
  const seenSlugs = new Set();
  tools.forEach((t, i) => {
    const label = t?.toolId ?? `<index ${i}>`;
    if (typeof t?.toolId !== "string" || !t.toolId) problems.push(`${label}: missing toolId`);
    else if (seenIds.has(t.toolId)) problems.push(`duplicate toolId '${t.toolId}'`);
    else seenIds.add(t.toolId);
    if (typeof t?.slug !== "string" || !SLUG_RE.test(t.slug || "")) problems.push(`${label}: bad slug`);
    else if (seenSlugs.has(t.slug)) problems.push(`duplicate slug '${t.slug}'`);
    else seenSlugs.add(t.slug);
    if (typeof t?.categorySlug !== "string" || !t.categorySlug) problems.push(`${label}: missing categorySlug`);
  });
  if (problems.length > 0) {
    console.error("ERROR: inventory sanity check failed (run scripts/validate-registry.mjs for detail):");
    for (const p of problems.slice(0, 20)) console.error(`  - ${p}`);
    process.exit(1);
  }
}

function canonicalUrl(t) {
  return `/tools/${t.categorySlug}/${t.slug}/`;
}

function renderGeneratedTs(tools, hash, generatedAt) {
  const header = `// GENERATED — DO NOT EDIT.
// Built by scripts/build-registry.mjs from data/tools-inventory.json
// source sha256: ${hash}
// generated (UTC): ${generatedAt}
// Regenerate: npm run codegen   (from app/)
//
import type { CategorySlug, ToolDefinition } from "../lib/registry/types.ts";

/** Alias matching the ARCHITECTURE.md / FOLDER_STRUCTURE.md naming. */
export type ToolRecord = ToolDefinition;

/** sha256 of the inventory this file was generated from. */
export const REGISTRY_HASH = "${hash}";
export const GENERATED_AT = "${generatedAt}";
export const TOOL_COUNT = ${tools.length};

/** All tools in inventory order. */
export const tools: ToolRecord[] = ${JSON.stringify(tools, null, 2)};

/** toolId -> tool */
export const byId: Record<string, ToolRecord> = Object.fromEntries(tools.map((t) => [t.toolId, t]));

/** global slug -> tool (slugs are globally unique by design) */
export const bySlug: Record<string, ToolRecord> = Object.fromEntries(tools.map((t) => [t.slug, t]));

/** categorySlug -> tools in inventory order */
export const byCategory: Record<CategorySlug, ToolRecord[]> = tools.reduce(
  (acc, t) => {
    (acc[t.categorySlug] ??= []).push(t);
    return acc;
  },
  {} as Record<CategorySlug, ToolRecord[]>,
);

/**
 * Canonical URL for a tool (trailingSlash:'always' per ARCHITECTURE.md §4).
 */
export function toolUrl(t: Pick<ToolRecord, "categorySlug" | "slug">): string {
  return \`/tools/\${t.categorySlug}/\${t.slug}/\`;
}

/**
 * Category hub URL (MA3 taxonomy shape, locked 2026-10-01).
 * NOTE: this is the LOGICAL canonical path. The served href under base='/tools'
 * is identical by construction (see config/site.config.ts URL SCHEME).
 */
export function hubUrl(categorySlug: string): string {
  return \`/tools/\${categorySlug}-tools/\`;
}
`;
  return header;
}

function readEmittedHash() {
  if (!existsSync(GENERATED_PATH)) return null;
  const m = readFileSync(GENERATED_PATH, "utf-8").match(/source sha256: ([0-9a-f]{64})/);
  return m ? m[1] : null;
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const { tools, hash } = loadInventory();
  sanityCheck(tools);

  if (checkOnly) {
    const emitted = readEmittedHash();
    if (emitted === null) {
      console.error(`STALE: ${GENERATED_PATH} does not exist. Run: node scripts/build-registry.mjs`);
      process.exit(1);
    }
    if (emitted !== hash) {
      console.error(
        `STALE: registry.generated.ts was built from a different inventory (hash ${emitted.slice(0, 12)}… vs current ${hash.slice(0, 12)}…). Run: node scripts/build-registry.mjs`,
      );
      process.exit(1);
    }
    if (!existsSync(LINKMAP_DST) || sha256Hex(readFileSync(LINKMAP_DST)) !== sha256Hex(readFileSync(LINKMAP_SRC))) {
      console.error(`STALE: ${LINKMAP_DST} is missing or differs from data/link-map.json. Run: node scripts/build-registry.mjs`);
      process.exit(1);
    }
    console.log(`OK: registry.generated.ts is fresh (sha256 ${hash.slice(0, 12)}…, ${tools.length} tools).`);
    return;
  }

  const generatedAt = new Date().toISOString();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(GENERATED_PATH, renderGeneratedTs(tools, hash, generatedAt), "utf-8");

  const manifest = {
    generatedAt,
    inventoryHash: hash,
    base: "/tools/",
    trailingSlash: "always",
    urls: tools.map((t) => ({
      toolId: t.toolId,
      categorySlug: t.categorySlug,
      slug: t.slug,
      url: canonicalUrl(t),
    })),
    hubs: [...new Set(tools.map((t) => t.categorySlug))].map((categorySlug) => ({
      categorySlug,
      url: `/tools/${categorySlug}-tools/`,
    })),
  };
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf-8");

  // Sync link-map.json into the app so pages can import it at build time
  // (Vite cannot import above the app root).
  writeFileSync(LINKMAP_DST, readFileSync(LINKMAP_SRC));

  console.log(`Wrote ${GENERATED_PATH} (${tools.length} tools, sha256 ${hash.slice(0, 12)}…)`);
  console.log(`Wrote ${MANIFEST_PATH} (${manifest.urls.length} urls)`);
  console.log(`Synced ${LINKMAP_DST}`);
}

main();
