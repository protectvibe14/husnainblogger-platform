# Tool Templates — `app/src/templates/`

Owner: **MA1-Templates** · Status: Phase-0 · Framework: Astro 7, `output: 'static'`

One Astro component per `toolType` (10 total — the count is fixed by
ARCHITECTURE.md; an 11th needs an MA1 ADR). A tool page
(`src/pages/[category]/[tool].astro`) resolves its template from the
registry's `TEMPLATE_MAP` and renders it with `{ tool, content, relatedTools }`.
A tool built on a template implements **only** its unique logic (the
`TOOL LOGIC SLOT`); everything else — validation, errors, copy/download,
share links, analytics, focus management, live regions — is shared.

## Files

| File | Role |
|---|---|
| `types.ts` | Shared contracts: `ToolTemplatePropsV1`, `ToolContent`, `ToolRunFn`, `ToolRunResult`, per-template prop extensions |
| `_tool-runtime.ts` | Shared client wiring (vanilla TS, zero deps): schema building, validation UX, output rendering, copy/download/share/reset, focus, live-region announce, `requestConfirm`, `wireResultActions` |
| `_analytics.ts` | Analytics hooks: `trackEvent()` + delegated `data-analytics-event` clicks → `CustomEvent('hb:analytics')` for MA5's snippet |
| `ToolShell.astro` | Shared page shell: skip links, breadcrumbs, h1, value prop, tool-UI slot, how-to, methodology, examples, FAQ, related tools, JSON-LD, live regions |
| `CalculatorTemplate.astro` | Numeric inputs → result cards |
| `GeneratorTemplate.astro` | Seed inputs → copyable item list |
| `AnalyzerTemplate.astro` | Content in → metrics + findings table |
| `CheckerTemplate.astro` | Input → pass/warn/fail verdict table |
| `FormatterTemplate.astro` | Text in → transformed text out |
| `PlannerTemplate.astro` | Goal inputs → dated plan table |
| `BuilderTemplate.astro` | Dynamic item rows → composed output |
| `ConverterTemplate.astro` | Amount + from/to units → converted value (+ swap) |
| `ScorerTemplate.astro` | Checklist inputs → 0–100 score + band + tips |
| `TrackerTemplate.astro` | Stateful goal + entries, localStorage-persisted |

## Per-template prop contract

All templates accept the base props; extensions add **optional** fields only.

| Template | Base props | Extra props (all optional) |
|---|---|---|
| CalculatorTemplate | `tool: ToolDefinition`, `content: ToolContent`, `relatedTools?: ToolDefinition[]` | `heroOutputs?: string[]` — output ids emphasized as hero cards |
| GeneratorTemplate | same | `maxItems?: number` — UI cap on returned items (default 50) |
| AnalyzerTemplate | same | — |
| CheckerTemplate | same | — |
| FormatterTemplate | same | — |
| PlannerTemplate | same | — |
| BuilderTemplate | same | `itemFields?: BuilderField[]`, `minItems?: number` (1), `maxItems?: number` (30) |
| ConverterTemplate | same | `baseUnitLabel?: string` |
| ScorerTemplate | same | `bands?: ScorerBand[]` — `{min,max,label,tone,tip}` score bands |
| TrackerTemplate | same | `storageKey?: string` (default `hb:v1:tracker:<toolId>`), `unitLabel?: string` (default `USD`) |
| ToolShell | `tool`, `content`, `relatedTools?` | slots: `tool-ui` (required) |

`ToolContent` (MA3-authored): `title`, `description`, `howTo[]`,
`methodology?`, `examples?` (`{title, inputs, note?}`), `faqs[]`,
`assumptions?`, `jsonLd?[]`.

## The TOOL LOGIC SLOT

Each template's `<script>` contains a clearly-marked
`/* ===== TOOL LOGIC SLOT (DEMO — MA2: replace) ===== */` function with
signature `(values: ToolRunValues) => ToolRunResult | Promise<ToolRunResult>`,
where `values` are validated/sanitized inputs keyed by `ToolInput.id` and the
result is `{ ok, values?, error? }` with `values` keyed by `ToolOutput.id`.

**Current state: every template ships with tiny DEMO logic** (e.g. a tip
calculator, a title-idea generator, a case converter) that only understands
the template's `DEMO_INPUTS`. MA2 replaces the demo function with an adapter
over `app/tools/<category>/<slug>/logic.ts`. When a tool has no registry
inputs yet, the template renders `DEMO_INPUTS`/`DEMO_OUTPUTS` so the shell is
demonstrable; real `tool.inputs`/`tool.outputs` take precedence automatically.

## Dependencies (not yet landed — templates import, not duplicate)

- **Design System** (`app/src/components/ui/`): `Field`, `Button`,
  `Accordion` (+ `ConfirmDialog` contract for the tracker). Full required
  interfaces — including the `data-field*` DOM contract the runtime queries —
  are specified in `docs/architecture/TEMPLATES.md` § "Needed from Design
  System". Templates will not compile until these land; that is expected and
  tracked as a dependency, not a defect.
- **Registry codegen**: `TEMPLATE_MAP`, `ToolContent` merge, per-tool logic
  module path convention (`app/tools/<category>/<slug>/logic.ts`).
- **Analytics**: `docs/architecture/ANALYTICS_HOOKS.md` (MA5) — until it
  lands, `_analytics.ts` defines the proposed event taxonomy.

Full normative spec (slots, must/must-not for tool authors, analytics events,
a11y notes, decisions): [`docs/architecture/TEMPLATES.md`](../../docs/architecture/TEMPLATES.md).
