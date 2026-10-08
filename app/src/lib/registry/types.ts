/**
 * types.ts — Central Tool Registry type definitions.
 *
 * HusnainBlogger.com 500 Mini Tools platform.
 *
 * Framework-agnostic: pure TypeScript types only, no framework imports,
 * no Node imports. Safe to consume from any frontend framework, from
 * Node scripts, and from the MA2/MA3/MA4/MA5 pipelines.
 *
 * Two-tier model (see docs/architecture/TOOL_REGISTRY_SCHEMA.md):
 *   1. IDENTITY fields — required for every entry, including BACKLOG tools.
 *      The validator FAILS when these are missing.
 *   2. RELEASE fields — required before a tool may move to READY_FOR_RELEASE.
 *      Optional while a tool is in BACKLOG/PLANNED/IN_PROGRESS; the validator
 *      reports population coverage instead of failing.
 */

 // ---------------------------------------------------------------------------
 // String-literal unions
 // ---------------------------------------------------------------------------

/** The 11 locked categories (10 x 50 tools + AI tools). Slugs are URL segments. */
export type CategorySlug =
  | "blogging-seo"
  | "make-money"
  | "youtube"
  | "tiktok"
  | "instagram"
  | "video-editing"
  | "ai-workflows"
  | "pinterest-social"
  | "email-marketing"
  | "creator-business"
  | "ai-tools";

/** Tool behavior archetype. Drives template selection and QA checklists. */
export type ToolType =
  | "generator"
  | "planner"
  | "calculator"
  | "builder"
  | "tracker"
  | "checker"
  | "analyzer"
  | "scorer"
  | "formatter"
  | "converter"
  | "ai";

/** Lifecycle status. Canonical list lives in project-registry/PROJECT_REGISTRY.md. */
export type ToolStatus =
  | "BACKLOG"
  | "PLANNED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "READY_FOR_QA"
  | "QA_FAILED"
  | "READY_FOR_RELEASE"
  | "RELEASED"
  | "NEEDS_UPDATE"
  | "DEPRECATED";

/** SEO search intent for the tool's primary keyword. */
export type SearchIntent =
  | "informational"
  | "navigational"
  | "commercial-investigation"
  | "transactional";

/** Input control kinds supported by the client-side tool templates. */
export type InputControlType =
  | "text"
  | "number"
  | "select"
  | "textarea"
  | "boolean"
  | "date"
  | "url"
  | "file";

/** Output presentation kinds supported by the client-side tool templates. */
export type OutputKind =
  | "text"
  | "number"
  | "currency"
  | "percent"
  | "list"
  | "table"
  | "copy"
  | "download";

// ---------------------------------------------------------------------------
// Canonical category table (single source of truth for slug <-> name <-> code)
// ---------------------------------------------------------------------------

export interface CategoryInfo {
  slug: CategorySlug;
  /** Display name, e.g. "Blogging SEO & Content". Must match inventory exactly. */
  name: string;
  /** Single-letter code from the master plan (A-J). */
  code: string;
}

export const CATEGORIES: ReadonlyArray<CategoryInfo> = [
  { slug: "blogging-seo",    name: "Blogging SEO & Content",    code: "A" },
  { slug: "make-money",      name: "Make-Money & Affiliate",    code: "B" },
  { slug: "youtube",         name: "YouTube",                   code: "C" },
  { slug: "tiktok",          name: "TikTok",                    code: "D" },
  { slug: "instagram",       name: "Instagram",                 code: "E" },
  { slug: "video-editing",   name: "CapCut & Video Editing",    code: "F" },
  { slug: "ai-workflows",    name: "AI Workflow",               code: "G" },
  { slug: "pinterest-social", name: "Pinterest, X & Facebook",  code: "H" },
  { slug: "email-marketing",  name: "Email & Blog Marketing",    code: "I" },
  { slug: "creator-business", name: "Creator Business",          code: "J" },
  { slug: "ai-tools",         name: "AI Tools",                    code: "K" },
] as const;

export const TOOL_TYPES: ReadonlyArray<ToolType> = [
  "generator", "planner", "calculator", "builder", "tracker",
  "checker", "analyzer", "scorer", "formatter", "converter", "ai",
] as const;

export const TOOL_STATUSES: ReadonlyArray<ToolStatus> = [
  "BACKLOG", "PLANNED", "IN_PROGRESS", "BLOCKED", "READY_FOR_QA",
  "QA_FAILED", "READY_FOR_RELEASE", "RELEASED", "NEEDS_UPDATE", "DEPRECATED",
] as const;

export const SEARCH_INTENTS: ReadonlyArray<SearchIntent> = [
  "informational", "navigational", "commercial-investigation", "transactional",
] as const;

// ---------------------------------------------------------------------------
// Sub-objects
// ---------------------------------------------------------------------------

export interface ToolInput {
  /** Stable id, e.g. "monthly-searches". */
  id: string;
  /** Human label shown in the UI. */
  label: string;
  type: InputControlType;
  required: boolean;
  placeholder?: string;
  /** Allowed values when type === "select". */
  options?: string[];
  /**
   * File-input lane (type === "file", added 2026-10-01 for media tools).
   * The browser decodes the file client-side (Web Audio API / <video>+canvas)
   * and runTool receives a plain media descriptor object — never the File.
   */
  /** e.g. "audio/*", "video/*". */
  accept?: string;
  /** How the runtime decodes the chosen file. */
  mediaKind?: "audio" | "video" | "image";
  /** Max file size in MB (default 200). */
  maxFileMB?: number;
  /**
   * Video-frame capture only: id of the numeric input holding the capture
   * timestamp in seconds (e.g. "timestampSec").
   */
  frameAtInputId?: string;
  /**
   * Video-frame capture only: id of the select input holding the output size
   * ("original" | "1080p" | "720p").
   */
  frameSizeInputId?: string;
  /** Numeric bounds / regex / unit hint, e.g. { min: 0, unit: "USD" }. */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    unit?: string;
  };
}

export interface ToolOutput {
  /** Stable id, e.g. "estimated-revenue". */
  id: string;
  label: string;
  type: OutputKind;
  description?: string;
}

/**
 * Pointer into data/formulas/. The formula itself lives outside the registry
 * (owned by MA2); the registry only references it so formula updates can be
 * versioned independently of tool metadata.
 */
export interface FormulaRef {
  /** Formula id in data/formulas/, e.g. "adsense-revenue-v1". */
  formulaId: string;
  /** Formula version this tool was built/tested against. */
  version: string;
  /** Formula variables this tool consumes. */
  variables: string[];
}

export interface DataSource {
  name: string;
  url?: string;
  note?: string;
}

export interface SeoMetadata {
  /** <= 60 chars, primary keyword near the front. */
  title: string;
  /** 140-155 chars. */
  metaDescription: string;
  h1: string;
  /** Canonical URL path, e.g. "/tools/youtube-tag-extractor/". */
  canonicalPath: string;
  /** OG image path. Optional; falls back to category default. */
  ogImage?: string;
}

export interface SchemaOrg {
  /** Schema.org types emitted as JSON-LD, e.g. ["WebApplication", "FAQPage"]. */
  types: string[];
}

export interface ToolTests {
  /** Unit test file paths/names, e.g. ["adsense-revenue.test.ts"]. */
  unit: string[];
  integration: string[];
  e2e: string[];
}

export interface ToolAnalytics {
  /**
   * Event names this tool fires, drawn from the taxonomy in
   * docs/architecture/ANALYTICS_HOOKS.md. MA5 implements the transport.
   */
  events: string[];
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

/**
 * Minimal inventory entry — exactly what data/tools-inventory.json carries
 * today (plus the legacy numeric `id` / `categoryCode` passthrough fields).
 * Every field here is REQUIRED by the validator.
 */
export interface InventoryTool {
  id: number;
  toolId: string;
  name: string;
  category: string;
  categoryCode: string;
  categorySlug: CategorySlug;
  slug: string;
  toolType: ToolType;
  primaryKeyword: string;
  secondaryKeywords: string[];
  status: ToolStatus;
  version: string;
  /** Admin-controlled live ON/OFF switch. false = page not built (404). */
  enabled?: boolean;
  /** Admin SEO override — empty = auto-generated from name/keywords. */
  seoTitle?: string;
  seoDescription?: string;
  /** Admin indexing control — true = noindex, excluded from sitemap. */
  noindex?: boolean;
}

/**
 * Full tool definition. Identity fields are required; release fields are
 * required at the READY_FOR_RELEASE gate (see validateReleaseReadiness()).
 */
export interface ToolDefinition extends InventoryTool {
  // -- Release fields ------------------------------------------------------
  /** 1-2 sentence plain-English description of what the tool does. */
  description?: string;
  searchIntent?: SearchIntent;
  inputs?: ToolInput[];
  outputs?: ToolOutput[];
  formulaRef?: FormulaRef;
  dataSources?: DataSource[];
  /**
   * Documented assumptions/limitations, e.g. "Uses US average CPC; your
   * niche may differ." Shown to users and to QA.
   */
  assumptions?: string[];
  seo?: SeoMetadata;
  schema?: SchemaOrg;
  /** toolIds of related tools (same category or cross-category). */
  relatedTools?: string[];
  /** ISO-8601 date of last metadata/logic change, e.g. "2026-10-01". */
  lastUpdated?: string;
  tests?: ToolTests;
  analytics?: ToolAnalytics;
}

/** Fields that must be non-empty on every entry, whatever its status. */
export const REQUIRED_IDENTITY_FIELDS: ReadonlyArray<keyof InventoryTool> = [
  "toolId",
  "name",
  "category",
  "categorySlug",
  "slug",
  "toolType",
  "primaryKeyword",
  "status",
  "version",
] as const;

/**
 * Fields (dot-paths) that must be populated before a tool may be promoted
 * to READY_FOR_RELEASE. Checked by validateReleaseReadiness().
 */
export const RELEASE_REQUIRED_PATHS: ReadonlyArray<string> = [
  "description",
  "searchIntent",
  "outputs",
  "seo.title",
  "seo.metaDescription",
  "seo.h1",
  "seo.canonicalPath",
  "lastUpdated",
] as const;
