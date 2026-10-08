# Formula Registry — `data/formulas/`

One JSON record per calculator tool. The record is the **contract** between MA2 (who writes the formula) and MA4 (who verifies it) — see `docs/qa/FORMULA_VERIFICATION.md` for the full protocol.

## File naming

`data/formulas/<tool-slug>.v<N>.json`

- `<tool-slug>` matches the tool's `slug` in `data/tools-inventory.json` (e.g. `etsy-fee-calculator`).
- `v<N>` increments on **any** change: math, fee value, assumption, rounding rule, or source update.
- Never edit a verified record in place — create a new version. Git history is the audit trail.

## Status lifecycle

`draft` → (`verified` | `needs_review` | `verification_failed`)

- `verified` — passed the full MA4 pipeline; eligible for release QA.
- `needs_review` — math is sound but one or more values are `UNVERIFIED` or past review SLA; ships only with mandatory staleness/unverified UI labels.
- `verification_failed` — blocked from release (`QA_FAILED`); see the QA report.

## Rules for values

- Every number in `variables[].value` must carry a source (`source`, `sourceUrl`, `sourceDate`) and a `valueLabel` of exactly one of: `official/current`, `estimate`, `assumption`, `user-provided`.
- If no valid source exists, the value is the literal string `UNVERIFIED — replace with official source`. **Never invent a number.**
- `testCases[].expected` values are hand-computed by the verifier, never copied from tool output. Placeholders are allowed in examples but must be marked `PLACEHOLDER`.

## Example

`etsy-fee-calculator.v1.json` — annotated example record. All fee values are `UNVERIFIED` placeholders showing the required structure; none are real Etsy fees.
