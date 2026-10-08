/**
 * index.ts — Tool Registry loader and query API.
 *
 * Framework-agnostic: pure functions only. The single I/O boundary is
 * loadRegistryFromFile(), which uses only the Node builtin `node:fs`
 * (no framework, no third-party deps). A future framework layer can call
 * buildRegistry() with JSON it loaded any other way (fetch, import, …).
 *
 * NOTE on imports: explicit ".ts" extensions are used so this module runs
 * unmodified under Node type-stripping (node >= 22.6) as well as under tsc
 * / bundlers.
 */

import { readFileSync } from "node:fs";
import type {
  CategorySlug,
  ToolDefinition,
  ToolStatus,
  ToolType,
} from "./types.ts";
import { CATEGORIES } from "./types.ts";

// ---------------------------------------------------------------------------
// Registry container
// ---------------------------------------------------------------------------

export interface ToolRegistry {
  /** All tools, normalized, in inventory order. */
  tools: ToolDefinition[];
  /** toolId -> tool */
  byId: Map<string, ToolDefinition>;
  /** global slug -> tool (slugs are globally unique by design) */
  bySlug: Map<string, ToolDefinition>;
  /** categorySlug -> tools in inventory order */
  byCategory: Map<CategorySlug, ToolDefinition[]>;
  /** toolType -> tools in inventory order */
  byType: Map<ToolType, ToolDefinition[]>;
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

/**
 * Normalize one raw inventory record into a ToolDefinition.
 * Fills collection-typed optional fields with [] so consumers never
 * null-check; leaves scalar optional fields undefined when absent.
 * Throws on non-object input.
 */
export function normalizeTool(raw: unknown): ToolDefinition {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("normalizeTool: expected a tool object");
  }
  const r = raw as Record<string, unknown>;
  const tool = r as unknown as ToolDefinition;

  return {
    ...tool,
    secondaryKeywords: asStringArray(r["secondaryKeywords"]),
    inputs: Array.isArray(r["inputs"]) ? (r["inputs"] as ToolDefinition["inputs"]) : [],
    outputs: Array.isArray(r["outputs"]) ? (r["outputs"] as ToolDefinition["outputs"]) : [],
    dataSources: Array.isArray(r["dataSources"]) ? (r["dataSources"] as ToolDefinition["dataSources"]) : [],
    assumptions: asStringArray(r["assumptions"]),
    relatedTools: asStringArray(r["relatedTools"]),
    tests: (r["tests"] as ToolDefinition["tests"]) ?? { unit: [], integration: [], e2e: [] },
    analytics: (r["analytics"] as ToolDefinition["analytics"]) ?? { events: [] },
    schema: (r["schema"] as ToolDefinition["schema"]) ?? { types: [] },
  };
}

/**
 * Build an in-memory registry from raw parsed-JSON tool records.
 * Pure function — no I/O. Normalizes every entry and builds lookup indexes.
 */
export function buildRegistry(rawTools: unknown[]): ToolRegistry {
  const tools = rawTools.map(normalizeTool);

  const byId = new Map<string, ToolDefinition>();
  const bySlug = new Map<string, ToolDefinition>();
  const byCategory = new Map<CategorySlug, ToolDefinition[]>();
  const byType = new Map<ToolType, ToolDefinition[]>();

  for (const c of CATEGORIES) byCategory.set(c.slug, []);

  for (const t of tools) {
    if (!byId.has(t.toolId)) byId.set(t.toolId, t);
    if (t.slug && !bySlug.has(t.slug)) bySlug.set(t.slug, t);
    const catBucket = byCategory.get(t.categorySlug as CategorySlug);
    if (catBucket) catBucket.push(t);
    else byCategory.set(t.categorySlug as CategorySlug, [t]);
    const typeBucket = byType.get(t.toolType as ToolType);
    if (typeBucket) typeBucket.push(t);
    else byType.set(t.toolType as ToolType, [t]);
  }

  return { tools, byId, bySlug, byCategory, byType };
}

/** Shape of data/tools-inventory.json. */
interface InventoryFile {
  total?: number;
  tools: unknown[];
}

/**
 * Load + build a registry from an inventory JSON file.
 * I/O boundary — the only function here that touches the filesystem.
 */
export function loadRegistryFromFile(filePath: string): ToolRegistry {
  const raw = readFileSync(filePath, "utf-8");
  let data: InventoryFile;
  try {
    data = JSON.parse(raw) as InventoryFile;
  } catch (err) {
    throw new Error(`loadRegistryFromFile: invalid JSON in ${filePath}: ${(err as Error).message}`);
  }
  if (!data || !Array.isArray(data.tools)) {
    throw new Error(`loadRegistryFromFile: ${filePath} must contain a top-level "tools" array`);
  }
  return buildRegistry(data.tools);
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch one tool by its stable toolId (e.g. "tool-001"). */
export function getTool(registry: ToolRegistry, toolId: string): ToolDefinition | undefined {
  return registry.byId.get(toolId);
}

/** Fetch one tool by its URL slug. */
export function getToolBySlug(registry: ToolRegistry, slug: string): ToolDefinition | undefined {
  return registry.bySlug.get(slug);
}

/** All tools in a category, in inventory order. */
export function getToolsByCategory(
  registry: ToolRegistry,
  categorySlug: CategorySlug,
): ToolDefinition[] {
  return registry.byCategory.get(categorySlug) ?? [];
}

/** All tools of one behavior archetype. */
export function getToolsByType(registry: ToolRegistry, toolType: ToolType): ToolDefinition[] {
  return registry.byType.get(toolType) ?? [];
}

/** All tools currently in a given lifecycle status. */
export function getToolsByStatus(registry: ToolRegistry, status: ToolStatus): ToolDefinition[] {
  return registry.tools.filter((t) => t.status === status);
}

/**
 * Resolve a tool's relatedTools ids to full definitions.
 * Dangling ids are skipped (the validator flags them as errors).
 */
export function getRelatedTools(registry: ToolRegistry, toolId: string): ToolDefinition[] {
  const tool = getTool(registry, toolId);
  if (!tool || !tool.relatedTools) return [];
  const out: ToolDefinition[] = [];
  for (const id of tool.relatedTools) {
    const rel = getTool(registry, id);
    if (rel && rel.toolId !== toolId && !out.includes(rel)) out.push(rel);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Client-side search
// ---------------------------------------------------------------------------

export interface SearchOptions {
  /** Max results. Default 20. */
  limit?: number;
}

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "of", "for", "to", "in", "on", "with", "free", "online",
]);

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function countHits(haystack: string, tokens: string[]): number {
  let n = 0;
  for (const tok of tokens) if (haystack.includes(tok)) n++;
  return n;
}

/**
 * Client-side full-registry search. Matches name, primary/secondary keywords,
 * category name and slug. Weighted scoring: name (5) > primaryKeyword (4) >
 * secondaryKeywords (3) > category (2) > slug (2) > description (1).
 * Pure function — runs in the browser with zero backend.
 */
export function searchTools(
  registry: ToolRegistry,
  query: string,
  options: SearchOptions = {},
): ToolDefinition[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const limit = options.limit ?? 20;
  const scored: Array<{ tool: ToolDefinition; score: number }> = [];

  for (const tool of registry.tools) {
    const name = tool.name.toLowerCase();
    const pk = (tool.primaryKeyword ?? "").toLowerCase();
    const sk = (tool.secondaryKeywords ?? []).join(" ").toLowerCase();
    const cat = (tool.category ?? "").toLowerCase();
    const slug = (tool.slug ?? "").toLowerCase().replace(/-/g, " ");
    const desc = (tool.description ?? "").toLowerCase();

    const score =
      countHits(name, tokens) * 5 +
      countHits(pk, tokens) * 4 +
      countHits(sk, tokens) * 3 +
      countHits(cat, tokens) * 2 +
      countHits(slug, tokens) * 2 +
      countHits(desc, tokens) * 1;

    if (score > 0) scored.push({ tool, score });
  }

  scored.sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));
  return scored.slice(0, limit).map((s) => s.tool);
}
