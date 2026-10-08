/**
 * template-map.ts — toolType → template component dispatch table.
 *
 * SINGLE SOURCE OF TRUTH for template dispatch. The tool page
 * (app/src/pages/tools/[category]/[tool].astro) resolves its template from
 * here — never by hardcoding, never by convention-based file lookup.
 *
 * Current state (Phase-0): MA1-Templates has not delivered the 10 real
 * templates yet, so every toolType maps to PlaceholderTemplate
 * (app/src/templates/PlaceholderTemplate.astro), which renders an obvious
 * "template pending" banner. When a real template lands, swap its entry here
 * — one line per template, no router or page changes.
 *
 * NOTE on ARCHITECTURE.md §3: it describes TEMPLATE_MAP as part of
 * registry.generated.ts. Deliberate deviation (MA1-Registry decision):
 * the map lives here as hand-maintained source so codegen stays free of
 * .astro imports (which would break MA4's pure-node tests of the generated
 * registry). No duplication — the generated file does not repeat the map.
 */

import type { ToolType } from "./types.ts";
import type { ToolDefinition } from "./types.ts";
// Prop/content contracts are owned by MA1-Templates — reuse, don't redefine.
import type {
  ToolContent,
  ToolTemplatePropsV1,
} from "../../templates/types.ts";

export type { ToolContent, ToolTemplatePropsV1 };

/** Alias matching the ARCHITECTURE.md / FOLDER_STRUCTURE.md naming. */
export type ToolRecord = ToolDefinition;

/**
 * Minimal structural type for a template component. Tightened by
 * MA1-Templates when the real .astro templates land (they will type their
 * props as ToolTemplatePropsV1).
 */
export type ToolTemplateComponent = unknown;

// Batch-1 pilot (2026-10-01): the 10 real MA1 templates have landed —
// dispatch to them. PlaceholderTemplate is kept for unknown future types only.
import GeneratorTemplate from "../../templates/GeneratorTemplate.astro";
import PlannerTemplate from "../../templates/PlannerTemplate.astro";
import CalculatorTemplate from "../../templates/CalculatorTemplate.astro";
import BuilderTemplate from "../../templates/BuilderTemplate.astro";
import TrackerTemplate from "../../templates/TrackerTemplate.astro";
import CheckerTemplate from "../../templates/CheckerTemplate.astro";
import AnalyzerTemplate from "../../templates/AnalyzerTemplate.astro";
import ScorerTemplate from "../../templates/ScorerTemplate.astro";
import FormatterTemplate from "../../templates/FormatterTemplate.astro";
import ConverterTemplate from "../../templates/ConverterTemplate.astro";
import AiToolTemplate from "../../templates/AiToolTemplate.astro";

export const TEMPLATE_MAP: Record<ToolType, ToolTemplateComponent> = {
  generator: GeneratorTemplate,
  planner: PlannerTemplate,
  calculator: CalculatorTemplate,
  builder: BuilderTemplate,
  tracker: TrackerTemplate,
  checker: CheckerTemplate,
  analyzer: AnalyzerTemplate,
  scorer: ScorerTemplate,
  formatter: FormatterTemplate,
  converter: ConverterTemplate,
  ai: AiToolTemplate,
};

/** True while every entry still points at the placeholder. */
export function isPlaceholderMap(): boolean {
  return false; // real templates wired since Batch-1 pilot (2026-10-01)
}
