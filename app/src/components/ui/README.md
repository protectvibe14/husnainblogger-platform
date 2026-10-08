# UI Components — `app/src/components/ui/`

Owner: **MA1-DesignSystem**. One implementation per primitive, ever. If a
template needs a behavior not listed here, file it with MA1-DesignSystem —
do NOT build a local copy (no-duplicate rule, enforced — see
`docs/architecture/DESIGN_SYSTEM.md`).

All components: Astro, zero-JS-by-default, token-driven (no hard-coded
colors/spacing). Interactive behaviors are colocated `<script>` blocks that
wire via `data-*` attributes (idempotent, multi-instance safe) plus
framework-agnostic helpers in `app/src/lib/ui/` and `app/src/lib/a11y/`.

## Catalog

### Form primitives (R3: raw `<input>` in templates is a lint error)

| Component | Props | Notes |
|---|---|---|
| `Field` | `name*`, `label*`, `type?` (text/number/email/url/tel/search/password/date), `id?`, `value?`, `hint?`, `error?`, `required?`, `optionalMark?` (default true), `autocomplete?`, `inputmode?`, `min/max/step?`, `pattern?`, `minlength/maxlength?`, `placeholder?` (hint-only), `describedBy?`, `disabled?`, `readonly?` | Label + hint + error wiring automatic. `error` set ⇒ `aria-invalid` + error block. |
| `Textarea` | `name*`, `label*`, `rows?` (4), + same hint/error/required set as Field | `resize: vertical`. |
| `Select` | `name*`, `label*`, `options*` (`{value, label, disabled?}[]`), `value?`, `placeholderOption?` (empty-value prompt), + hint/error/required set | Native `<select>` only — no custom listbox on this platform. Changing selection never auto-submits. |
| `Checkbox` | `name*`, `label*`, `checked?`, `value?` ("on"), + hint/error | Single checkbox. Groups: wrap in native `<fieldset><legend>` in the template. No switch variant exists (by design). |
| `RadioGroup` | `name*`, `legend*`, `options*` (`{value, label, hint?, disabled?}[]`), `value?`, `hint?`, `error?`, `required?` | Renders `<fieldset><legend>`; error described on the group. |

### Buttons

| Component | Props | Notes |
|---|---|---|
| `Button` | `variant?` (primary/secondary/tertiary/danger), `type?`, `href?` (renders `<a>`), `disabled?`, `ariaDisabled?` (preferred + visible reason), `ariaLabel?` (must start with visible text) | Slot = visible label. 44px min hit area. |
| `CopyButton` | **`what*`** (e.g. `"keyword list"`), `value?` or `targetId?`, `variant?` | Accessible name = `Copy {what} to clipboard`. Success ⇒ "Copied ✓" + polite announcement; failure ⇒ assertive "Copy failed — select the text and press Ctrl+C" + auto-select. Throws at build if `what` is missing. |
| `DownloadButton` | `label*` (names the format, e.g. `"Download CSV"`), `filename*`, `value?` or `targetId?`, `mime?`, `variant?` | Blob download, zero backend. Announces "Download started" (polite). |

### Content & navigation

| Component | Props | Notes |
|---|---|---|
| `Card` | `heading*`, `level?` (2/3/4, default 3), `href?`, `linkLabel?` | Static by default. `href` ⇒ exactly one stretched link from the heading (accessible name = heading). |
| `Badge` | `label*`, `tone*` (success/warning/error/info/neutral) | Icon + visible text always; color never alone (R9). Throws if `label` empty. |
| `Accordion` | `items*` (`{question, answerHtml, open?}[]`), `label?` | Button-per-header, Up/Down/Home/End between headers, multi-open. `answerHtml` is MA3-authored HTML. |
| `Tabs` | `tabs*` (`{id, label, panelHtml}[]`), `label*` | Automatic activation (selection follows focus); arrows/Home/End; panels stay in DOM. Not for primary tool workflows. |
| `Breadcrumbs` | `items*` (`{label, href?}[]`), `label?` | `aria-current="page"` on the last item; separators are CSS. |
| `SkipLink` | `mainId?` ("main-content"), `toolId?`, `toolLabel?` | Render first in `<body>`. |

### Tool-page machinery

| Component | Props | Notes |
|---|---|---|
| `ResultPanel` | `title*` (h2), `emptyText*`, `loadingText?`, `errorText?`, `id?` | States via `data-state` (empty/loading/ready/error). Island calls `resultsReady(panel)` from `lib/ui/result-panel.ts` ⇒ focus to heading + polite announcement. |
| `ErrorSummary` | `errors?` (`{fieldId, label, message}[]`), `id?` | `role="alert"`. Dynamic use: render empty (hidden), then `showErrorSummary(el, errors)` from `lib/ui/error-summary.ts` populates + focuses. ≥2 fields only; single-field ⇒ inline error + focus. |
| `ConfirmDialog` | `id?`, `title*`, `message*`, `confirmLabel?`, `cancelLabel?`, `tone?` (default/danger) | Native `<dialog>`. Open ONLY via `openConfirmDialog(id)` (`lib/ui/confirm-dialog.ts`) ⇒ `Promise<boolean>`, focus restored. Templates never build their own dialogs (R12). |
| `ToolErrorBoundary` | `island*`, `reportUrl?`, `message?` | Wraps every island. Catches `hb:island-error` + window errors; shows `role="alert"` fallback, **preserves inputs**, Retry runs `onIslandRetry(island, fn)` handlers. |

## Shared helpers

- `app/src/lib/a11y/announce.ts` — `announce.polite(msg)` / `announce.assertive(msg)` / `initAnnouncer()`. The ONLY live-region API. No inline `aria-live` in tool code (lint error).
- `app/src/lib/a11y/contrast.ts` — canonical WCAG contrast math (`contrastRatio`, `checkPair`).
- `app/src/lib/a11y/ids.ts` — `nextId(prefix)` per-instance id namespacing (R4). Astro-side only.
- `app/src/lib/ui/{result-panel,error-summary,confirm-dialog,error-boundary,theme}.ts` — behavior contracts above.

## What was deliberately omitted (Phase-0)

- `Pagination` — a category-hub concern (50 tools per hub), not a tool-template primitive. If hubs need it, MA1-DesignSystem adds it once.
- `Modal` (generic) — `ConfirmDialog` covers the only justified dialog; general modals need an MA1 ADR.
- `Tooltip/Popover` — no template justified one; click-to-open disclosure = `Accordion`.
- `Switch`, `Slider`, `StarRating`, `DatePicker` — build from primitives (`Checkbox`, `Field type="date"`, native range); custom widgets get an MA1 ADR + keyboard spec first (R10).
- `Toast` system — the shared polite/assertive live regions ARE the toast system (R5).
- `Table/DataTable` — templates use native `<table>` with `<caption>`/`<th scope>`; a wrapper adds nothing.
- `Spinner` standalone — loading state lives inside `ResultPanel`; inline spinners reuse the global `.hb-spinner` class if ever needed.
