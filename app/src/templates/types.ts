/**
 * types.ts — shared prop contracts for the 10 tool templates.
 *
 * Owner: MA1-Templates. Version: ToolTemplatePropsV1 (see ARCHITECTURE.md §9 —
 * the props interface is versioned so future gating can wrap templates
 * without editing them).
 *
 * Framework-agnostic: pure TypeScript types only. Templates import the
 * registry types from app/src/lib/registry/types.ts (owned by MA1-Registry).
 */

import type {
  CategorySlug,
  ToolDefinition,
  ToolInput,
  ToolOutput,
  ToolType,
} from '../lib/registry/types.ts';

export type { ToolDefinition, ToolInput, ToolOutput, ToolType, CategorySlug };

// ---------------------------------------------------------------------------
// ToolContent — authored by MA3, merged at codegen time (ARCHITECTURE.md §3).
// Templates never fetch content; they receive it as a prop.
// ---------------------------------------------------------------------------

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolExample {
  /** Short label shown on the "try it" button, e.g. "Coffee shop". */
  title: string;
  /** Input id -> value. Values are primitives (url-state compatible). */
  inputs: Record<string, string | number | boolean>;
  note?: string;
}

export interface ToolContent {
  /** Page <title> source of truth (<=60 chars, primary keyword first). */
  title: string;
  /** 140-155 char meta description; also the on-page value prop. */
  description: string;
  /** Ordered how-to steps rendered under "How to use". */
  howTo: string[];
  /** How the tool computes its result (methodology section). Omit to hide. */
  methodology?: string;
  /** Try-it examples. Omit or empty to hide the section. */
  examples?: ToolExample[];
  /** Rendered as accordion FAQ + FAQPage JSON-LD. */
  faqs: ToolFaq[];
  /** Honest assumptions/limitations, surfaced in UI ("Good to know"). */
  assumptions?: string[];
  /**
   * Extra JSON-LD objects (MA3-authored) rendered verbatim as
   * <script type="application/ld+json">. The shell always adds FAQPage
   * from `faqs` automatically — do not duplicate it here.
   */
  jsonLd?: Record<string, unknown>[];
}

// ---------------------------------------------------------------------------
// FreshnessBanner — MA5 honesty contract (docs/analytics/FRESHNESS_REGISTRY.md §7).
// Content is supplied by MA2/MA5 and rendered VERBATIM: templates must not
// hard-code platform names, values, or dates. Rendered by ToolShell whenever
// freshnessState !== 'fresh' — the banner never auto-hides real uncertainty.
// ---------------------------------------------------------------------------

/**
 * Severity of a tool's rule-freshness state. `fresh` = every consumed rule
 * verified (the banner is not rendered); anything else renders the banner.
 */
export type FreshnessState = 'fresh' | 'needs_review' | 'stale' | 'deprecated';

/** The `sourceLink` slot: link to the rule's `sourceUrl` (platform's own docs). */
export interface FreshnessBannerSourceLink {
  /** Direct URL of the platform's own documentation page. */
  url: string;
  /** Link text, e.g. "Source: Etsy docs" — supplied by MA2, never hard-coded. */
  label: string;
}

/**
 * Props for `<FreshnessBanner>` — slot names VERBATIM from
 * FRESHNESS_REGISTRY.md §7. State-specific texts (`needsReviewText`,
 * `staleText`, `deprecatedText`) are shown only for their matching
 * `freshnessState`; the rest render for every non-fresh state.
 */
export interface FreshnessBannerProps {
  /** Plain-language list of the rule values the calculation used (MA2). */
  assumptions: string[];
  /** Max `lastVerified` across consumed rules, ISO `YYYY-MM-DD`. */
  lastVerified: string;
  /** Drives banner severity styling. */
  freshnessState: FreshnessState;
  /** Shown when `freshnessState === 'needs_review'`. */
  needsReviewText?: string;
  /** Shown when `freshnessState === 'stale'`. */
  staleText?: string;
  /** Shown when `freshnessState === 'deprecated'`. */
  deprecatedText?: string;
  /** Link to `sourceUrl` ("Source: {platform} docs"). */
  sourceLink: FreshnessBannerSourceLink;
}

// ---------------------------------------------------------------------------
// Template props (V1)
// ---------------------------------------------------------------------------

/**
 * Base props every template accepts. Template-specific extensions add
 * optional fields only — never remove or rename these.
 */
export interface ToolTemplatePropsV1 {
  /** Full registry record for the tool. */
  tool: ToolDefinition;
  /** MA3-authored page content. */
  content: ToolContent;
  /** Resolved related-tool records (registry.getRelatedTools). */
  relatedTools?: ToolDefinition[];
  /**
   * Rule-freshness honesty banner (MA5 FRESHNESS_REGISTRY.md §7).
   * Resolved by the page/codegen from the tool's consumed rules (MA2);
   * templates forward it to ToolShell unchanged. Omit for tools with no
   * data-dependent rules (or when every rule is `verified`).
   */
  freshness?: FreshnessBannerProps;
}

// ---------------------------------------------------------------------------
// Tool logic slot
// ---------------------------------------------------------------------------

/** Validated, sanitized input values keyed by ToolInput.id. */
export type ToolRunValues = Record<string, unknown>;

/**
 * Result of one tool run. `values` is keyed by ToolOutput.id and rendered
 * by the template's output renderer:
 *  - text/number/currency/percent -> single formatted value
 *  - list   -> string[] (rendered as a list, each item copyable)
 *  - table  -> { columns: string[]; rows: string[][] }
 *  - copy/download -> string (payload for the copy/download button)
 */
export interface ToolRunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  /** Friendly, user-facing error (no stack traces, no jargon). */
  error?: string;
}

/**
 * The TOOL LOGIC SLOT signature. MA2 implements this per tool (usually as a
 * thin adapter over app/tools/<category>/<slug>/logic.ts) and passes it to
 * the template's mount call. May be sync or async.
 */
export type ToolRunFn = (
  values: ToolRunValues,
) => ToolRunResult | Promise<ToolRunResult>;

// ---------------------------------------------------------------------------
// Template-specific prop extensions
// ---------------------------------------------------------------------------

/** CalculatorTemplate: which outputs render as hero result cards. */
export interface CalculatorTemplateProps extends ToolTemplatePropsV1 {
  /** Output ids to emphasize as large result cards. Defaults to all. */
  heroOutputs?: string[];
}

/** GeneratorTemplate: list-output rendering options. */
export interface GeneratorTemplateProps extends ToolTemplatePropsV1 {
  /** Max items the demo/real logic may return (UI cap). Default 50. */
  maxItems?: number;
}

/** ScorerTemplate: score band configuration. */
export interface ScorerBand {
  min: number;
  max: number;
  label: string;
  /** Decorative only — Badge always pairs label + icon (a11y 1.4.1). */
  tone: 'good' | 'ok' | 'poor';
  tip: string;
}
export interface ScorerTemplateProps extends ToolTemplatePropsV1 {
  bands?: ScorerBand[];
}

/** TrackerTemplate: persistence + goal configuration. */
export interface TrackerTemplateProps extends ToolTemplatePropsV1 {
  /** localStorage key. Default: `hb:v1:tracker:<toolId>`. */
  storageKey?: string;
  /** Label for the tracked unit, e.g. "USD saved". Shown in UI. */
  unitLabel?: string;
  /** Per-entry fields for log-type trackers. When present, the entry form
   *  renders these instead of the generic demo entry fields. */
  itemFields?: BuilderField[];
  /** 'checklist' | 'library' — renders a fixed item list with progress. */
  trackerMode?: 'checklist' | 'library';
  /** Fixed items for checklist/library modes. */
  trackerItems?: Array<{ id: string; label: string; detail?: string }>;
}

/** ConverterTemplate: unit sets for the from/to selects. */
export interface ConverterUnit {
  id: string;
  label: string;
  /** Factor relative to the base unit (demo logic uses base-unit math). */
  toBase: number;
}
export interface ConverterTemplateProps extends ToolTemplatePropsV1 {
  baseUnitLabel?: string;
}

/** BuilderTemplate: item-field configuration. */
export interface BuilderField {
  id: string;
  label: string;
  type: 'text' | 'url' | 'number' | 'date';
  required?: boolean;
  placeholder?: string;
}
export interface BuilderTemplateProps extends ToolTemplatePropsV1 {
  itemFields?: BuilderField[];
  minItems?: number;
  maxItems?: number;
}
