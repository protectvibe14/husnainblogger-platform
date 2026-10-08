/**
 * validate.ts — Full registry validator + self-test.
 *
 * Framework-agnostic, dependency-free. Uses only `node:fs` / `node:url` /
 * `node:path` builtins. Written with erasable-only TypeScript syntax
 * (interfaces + type annotations, no enums/namespaces) so it runs directly
 * under Node type-stripping:
 *
 *   node app/src/lib/registry/validate.ts [path/to/tools-inventory.json]
 *
 * Exit codes: 0 = valid, 1 = validation errors, 2 = usage/file problem.
 *
 * Two-tier model:
 *   ERRORS — identity fields missing/empty, duplicates, bad enums/slugs,
 *            dangling relatedTools, release-gate gaps. Block CI.
 *   WARNINGS — non-blocking anomalies (e.g. declared total mismatch).
 *   COVERAGE — population stats for optional release fields (informational;
 *              the inventory is intentionally minimal today).
 */

import { readFileSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { CategorySlug, ToolDefinition, ToolStatus, ToolType } from "./types.ts";
import {
  CATEGORIES,
  RELEASE_REQUIRED_PATHS,
  REQUIRED_IDENTITY_FIELDS,
  SEARCH_INTENTS,
  TOOL_STATUSES,
  TOOL_TYPES,
} from "./types.ts";
import { buildRegistry, normalizeTool } from "./index.ts";

// ---------------------------------------------------------------------------
// Report model
// ---------------------------------------------------------------------------

export type Severity = "error" | "warning";

export interface ValidationIssue {
  severity: Severity;
  code: string;
  toolId: string;
  field?: string;
  message: string;
}

export interface CoverageStat {
  field: string;
  populated: number;
  total: number;
}

export interface ValidationReport {
  toolsScanned: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  coverage: CoverageStat[];
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SEMVER_RE =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const TOOL_TYPE_SET = new Set<string>(TOOL_TYPES);
const STATUS_SET = new Set<string>(TOOL_STATUSES);
const INTENT_SET = new Set<string>(SEARCH_INTENTS);
const CATEGORY_BY_SLUG = new Map<string, { name: string; code: string }>(
  CATEGORIES.map((c) => [c.slug, { name: c.name, code: c.code }]),
);

/** Statuses at/after which the full release metadata must be present. */
const GATED_STATUSES: ReadonlySet<ToolStatus> = new Set<ToolStatus>([
  "READY_FOR_QA",
  "READY_FOR_RELEASE",
  "RELEASED",
]);

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function getPath(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const seg of path.split(".")) {
    if (typeof cur !== "object" || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

function isPopulated(obj: unknown, path: string): boolean {
  const v = getPath(obj, path);
  return isPopulatedValue(v);
}

/**
 * Deep "has real content" check. Plain objects (e.g. the normalized
 * {types: []} / {unit: [], integration: [], e2e: []} defaults) only count
 * as populated when at least one nested value is populated — otherwise
 * coverage stats would report 500/500 for fields nobody filled in yet.
 */
function isPopulatedValue(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.some(isPopulatedValue);
  if (typeof v === "object") return Object.values(v).some(isPopulatedValue);
  return true;
}

// ---------------------------------------------------------------------------
// Main validation
// ---------------------------------------------------------------------------

export function validateRegistry(rawTools: unknown[]): ValidationReport {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const err = (code: string, toolId: string, message: string, field?: string) =>
    errors.push({ severity: "error", code, toolId, field, message });
  const warn = (code: string, toolId: string, message: string, field?: string) =>
    warnings.push({ severity: "warning", code, toolId, field, message });

  // Normalize first so optional collections are always arrays.
  const tools: ToolDefinition[] = [];
  rawTools.forEach((raw, idx) => {
    try {
      tools.push(normalizeTool(raw));
    } catch (e) {
      err("E_NOT_AN_OBJECT", `<index ${idx}>`, `Entry is not a tool object: ${(e as Error).message}`);
    }
  });

  const seenIds = new Map<string, number>();
  const seenSlugs = new Map<string, number>();
  const knownIds = new Set<string>();

  tools.forEach((t, idx) => {
    const label = isNonEmptyString(t.toolId) ? t.toolId : `<index ${idx}>`;
    const rec = t as unknown as Record<string, unknown>;

    // -- 1. required identity fields -------------------------------------
    for (const field of REQUIRED_IDENTITY_FIELDS) {
      if (!isNonEmptyString(rec[field])) {
        err("E_REQUIRED_FIELD", label, `Missing or empty required field '${field}'.`, field);
      }
    }

    // -- 2. uniqueness ----------------------------------------------------
    if (isNonEmptyString(t.toolId)) {
      if (seenIds.has(t.toolId)) {
        err("E_DUP_TOOLID", label, `Duplicate toolId '${t.toolId}' (first seen at index ${seenIds.get(t.toolId)}).`, "toolId");
      } else {
        seenIds.set(t.toolId, idx);
        knownIds.add(t.toolId);
      }
    }
    if (isNonEmptyString(t.slug)) {
      if (seenSlugs.has(t.slug)) {
        err("E_DUP_SLUG", label, `Duplicate slug '${t.slug}' (first seen at index ${seenSlugs.get(t.slug)}). Slugs are globally unique by design.`, "slug");
      } else {
        seenSlugs.set(t.slug, idx);
      }
      if (!SLUG_RE.test(t.slug)) {
        err("E_BAD_SLUG_FORMAT", label, `Slug '${t.slug}' must be lowercase alphanumeric segments joined by hyphens.`, "slug");
      }
    }

    // -- 3. enums ----------------------------------------------------------
    if (isNonEmptyString(t.toolType) && !TOOL_TYPE_SET.has(t.toolType)) {
      err("E_UNKNOWN_TOOLTYPE", label, `Unknown toolType '${t.toolType}'. Expected one of: ${TOOL_TYPES.join(", ")}.`, "toolType");
    }
    if (isNonEmptyString(t.status) && !STATUS_SET.has(t.status)) {
      err("E_UNKNOWN_STATUS", label, `Unknown status '${t.status}'. Expected one of: ${TOOL_STATUSES.join(", ")}.`, "status");
    }
    if (isNonEmptyString(t.categorySlug)) {
      const cat = CATEGORY_BY_SLUG.get(t.categorySlug);
      if (!cat) {
        err("E_UNKNOWN_CATEGORY", label, `Unknown categorySlug '${t.categorySlug}'.`, "categorySlug");
      } else if (isNonEmptyString(t.category) && t.category !== cat.name) {
        err("E_CATEGORY_NAME_MISMATCH", label, `category '${t.category}' does not match canonical name '${cat.name}' for slug '${t.categorySlug}'.`, "category");
      }
    }

    // -- 4. version semver --------------------------------------------------
    if (isNonEmptyString(t.version) && !SEMVER_RE.test(t.version)) {
      err("E_BAD_VERSION", label, `version '${t.version}' is not valid semver (MAJOR.MINOR.PATCH).`, "version");
    }

    // -- 5. secondaryKeywords shape -----------------------------------------
    const sk = rec["secondaryKeywords"];
    if (sk !== undefined && (!Array.isArray(sk) || !sk.every((x) => typeof x === "string"))) {
      err("E_BAD_KEYWORDS", label, "secondaryKeywords must be an array of strings.", "secondaryKeywords");
    }

    // -- 6. relatedTools: shape now, dangling refs after full pass -----------
    const rel = rec["relatedTools"];
    if (rel !== undefined && (!Array.isArray(rel) || !rel.every((x) => typeof x === "string"))) {
      err("E_BAD_RELATED", label, "relatedTools must be an array of toolId strings.", "relatedTools");
    }
    if (t.searchIntent !== undefined && !INTENT_SET.has(t.searchIntent as string)) {
      err("E_UNKNOWN_INTENT", label, `Unknown searchIntent '${t.searchIntent}'. Expected one of: ${SEARCH_INTENTS.join(", ")}.`, "searchIntent");
    }
    if (t.lastUpdated !== undefined && !DATE_RE.test(t.lastUpdated)) {
      err("E_BAD_DATE", label, `lastUpdated '${t.lastUpdated}' must be ISO-8601 date (YYYY-MM-DD).`, "lastUpdated");
    }

    // -- 7. release gate ------------------------------------------------------
    if (isNonEmptyString(t.status) && GATED_STATUSES.has(t.status as ToolStatus)) {
      for (const path of RELEASE_REQUIRED_PATHS) {
        if (!isPopulated(t, path)) {
          err("E_RELEASE_GATE", label, `Status '${t.status}' requires populated field '${path}'.`, path);
        }
      }
    }
  });

  // -- 8. dangling relatedTools (needs the full id set) -----------------------
  for (const t of tools) {
    const label = isNonEmptyString(t.toolId) ? t.toolId : "<unknown>";
    for (const relId of t.relatedTools ?? []) {
      if (!knownIds.has(relId)) {
        err("E_DANGLING_RELATED", label, `relatedTools references unknown toolId '${relId}'.`, "relatedTools");
      } else if (relId === t.toolId) {
        err("E_SELF_RELATED", label, "relatedTools must not reference the tool itself.", "relatedTools");
      }
    }
  }

  // -- coverage of optional release fields (informational) --------------------
  const coverageFields = [
    "description",
    "searchIntent",
    "inputs",
    "outputs",
    "formulaRef",
    "dataSources",
    "assumptions",
    "seo",
    "schema",
    "relatedTools",
    "lastUpdated",
    "tests",
    "analytics",
  ];
  const coverage: CoverageStat[] = coverageFields.map((field) => ({
    field,
    populated: tools.filter((t) => isPopulated(t, field)).length,
    total: tools.length,
  }));

  return { toolsScanned: tools.length, errors, warnings, coverage };
}

// ---------------------------------------------------------------------------
// Self-test: validates the real inventory and reports pass/fail counts.
// ---------------------------------------------------------------------------

export interface SelfTestResult {
  inventoryPath: string;
  report: ValidationReport;
  passed: boolean;
}

export function runSelfTest(inventoryPath?: string): SelfTestResult {
  const here = dirname(fileURLToPath(import.meta.url));
  const resolved =
    inventoryPath ?? resolve(here, "..", "..", "..", "..", "data", "tools-inventory.json");

  let data: { total?: number; tools?: unknown[] };
  try {
    data = JSON.parse(readFileSync(resolved, "utf-8")) as { total?: number; tools?: unknown[] };
  } catch (e) {
    console.error(`ERROR: cannot read/parse inventory: ${resolved}: ${(e as Error).message}`);
    process.exit(2);
  }
  if (!data || !Array.isArray(data.tools)) {
    console.error(`ERROR: ${resolved} must contain a top-level "tools" array`);
    process.exit(2);
  }

  const report = validateRegistry(data.tools);
  const passed = report.errors.length === 0;

  console.log("== Tool Registry self-test ==");
  console.log(`Inventory : ${resolved}`);
  console.log(`Declared total: ${data.total ?? "(none)"} | Tools scanned: ${report.toolsScanned}`);
  if (data.total !== undefined && data.total !== report.toolsScanned) {
    report.warnings.push({
      severity: "warning",
      code: "W_TOTAL_MISMATCH",
      toolId: "<registry>",
      message: `Declared total (${data.total}) != actual tool count (${report.toolsScanned}).`,
    });
  }
  console.log(`Errors    : ${report.errors.length}`);
  console.log(`Warnings  : ${report.warnings.length}`);
  for (const w of report.warnings) console.log(`  [WARN] [${w.code}] ${w.toolId}: ${w.message}`);
  const shown = report.errors.slice(0, 25);
  for (const e of shown) console.log(`  [FAIL] [${e.code}] ${e.toolId}: ${e.message}`);
  if (report.errors.length > shown.length) {
    console.log(`  ... and ${report.errors.length - shown.length} more errors`);
  }
  console.log("-- optional-field coverage (informational; inventory is minimal by design) --");
  for (const c of report.coverage) {
    console.log(`  ${c.field.padEnd(16)} ${c.populated}/${c.total}`);
  }
  console.log(passed ? "RESULT: PASS — registry is valid." : "RESULT: FAIL — registry has errors.");
  return { inventoryPath: resolved, report, passed };
}

// Run the self-test when executed directly: `node validate.ts [inventory.json]`
const invokedAs = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedAs && import.meta.url === invokedAs) {
  const result = runSelfTest(process.argv[2]);
  process.exit(result.passed ? 0 : 1);
}
