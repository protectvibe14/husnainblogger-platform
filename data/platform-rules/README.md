# platform-rules registry — format & workflow README

**Registry owner (format/workflow):** MA5 — Freshness Registry Agent.
**Data owner (values):** MA2 (Tool Engineering).

> ⚠️ **PLACEHOLDER WARNING.** This registry ships EMPTY at Phase-0. No rule file
> under `data/platform-rules/` may contain real platform rates, fees, limits,
> or policies until MA2 verifies each value against the platform's own
> documentation. All examples in this README are **EXAMPLE — DO NOT SHIP** with
> deliberately absurd values. Any file containing `EXAMPLE` or `example.invalid`
> is unshippable and fails CI.

---

## 1. File layout

```
data/platform-rules/
├── README.md          ← this file
├── youtube.json       ← one file per platform; file name = platform key
├── tiktok.json
├── instagram.json
├── pinterest.json
├── etsy.json
├── fiverr.json
├── adsense.json
├── amazon.json
├── email-providers.json
└── tax-reporting.json
```

- **One JSON file per platform.** The file name (minus `.json`) is the `platform`
  key and must match the `platform` field of every rule inside it.
- Each file is a JSON object with exactly two top-level keys:
  - `platform`: string, the platform key.
  - `rules`: array of rule objects, each following the schema in §2.
- New platforms: MA2 creates `<platform>.json` with `"rules": []` and a
  `pending` note — never with guessed values.

## 2. Rule schema (same as the Freshness Registry spec)

Full specification: `docs/analytics/FRESHNESS_REGISTRY.md` §2.
Summary of exact fields:

| Field | Type | Required |
|---|---|---|
| `ruleId` | string, `<platform>-<slug>` kebab-case | ✅ |
| `platform` | string, matches file name | ✅ |
| `rule` | string, human-readable name | ✅ |
| `value` | number \| string \| object | ✅ |
| `valueUnit` | string (`percent`, `usd`, `count`, `bytes`, `ratio`, `text`, …) | ✅ |
| `source` | string, human-readable source name | ✅ |
| `sourceUrl` | string URL — platform's own docs page | ✅ (required when `status=verified`) |
| `effectiveDate` | string, ISO `YYYY-MM-DD` | ✅ |
| `lastVerified` | string, ISO `YYYY-MM-DD` | ✅ |
| `nextReview` | string, ISO `YYYY-MM-DD` | ✅ |
| `reviewCadence` | `monthly` \| `quarterly` \| `semiannual` \| `annual` | ✅ |
| `status` | `verified` \| `needs_review` \| `stale` \| `deprecated` | ✅ |
| `affectsTools` | array of `toolId` (`tool-NNN`) | ✅ |
| `notes` | string | optional |
| `history` | array of `{date, action, by, note}` | optional |

### EXAMPLE — DO NOT SHIP

```json
{
  "platform": "EXAMPLE-etsy",
  "rules": [
    {
      "ruleId": "EXAMPLE-etsy-transaction-fee",
      "platform": "EXAMPLE-etsy",
      "rule": "EXAMPLE — Transaction fee",
      "value": 999.99,
      "valueUnit": "percent",
      "source": "EXAMPLE — Etsy Seller Handbook, Fees section",
      "sourceUrl": "https://example.invalid/etsy/fees",
      "effectiveDate": "1900-01-01",
      "lastVerified": "1900-01-02",
      "nextReview": "1900-04-02",
      "reviewCadence": "quarterly",
      "status": "verified",
      "affectsTools": ["EXAMPLE-tool-042"],
      "notes": "EXAMPLE — deliberately absurd value. DO NOT SHIP.",
      "history": [
        { "date": "1900-01-02", "action": "created", "by": "MA5", "note": "EXAMPLE entry for schema demo" }
      ]
    }
  ]
}
```

## 3. Review workflow (summary)

Full spec: `docs/analytics/FRESHNESS_REGISTRY.md` §3–§6.

1. **Daily review job** (`freshness-review`) checks every rule's `nextReview`.
   `nextReview` passed + `status == verified` → auto-flag to `needs_review`
   (with a `history` entry). The job never writes `stale` or `deprecated`.
2. **Flagging pipeline:** `needs_review`/`stale`/`deprecated` rule → look up
   `affectsTools` → set those tools to `NEEDS_UPDATE` in
   `project-registry/PROJECT_REGISTRY.md` → tool pages show the honesty banner
   (assumptions + last-verified date + "estimate" labeling; banner never
   auto-hides uncertainty).
3. **Re-verification (MA2):** open `sourceUrl`, confirm the value, update
   `value`/`sourceUrl`/`effectiveDate`/`lastVerified`/`nextReview`, append a
   `history` entry with evidence. MA5 signs off the evidence fields, restores
   `verified`, clears tool flags, and the tool takes a version bump.
4. **Review cadences** (policy choices): fees → `quarterly`; policies →
   `semiannual`; volatile rates → `monthly`; stable facts → `annual`.

## 4. How MA2 adds or updates a rule (steps)

**Adding a new rule:**

1. Open `data/platform-rules/<platform>.json` (create it with `"rules": []` if new).
2. Add a rule object with ALL required fields from §2. Use the next
   `<platform>-<slug>` `ruleId`; keep it unique within the repo.
3. Set `status` to `needs_review` initially — a rule is NEVER born `verified`.
4. Verify: open the platform's own docs page, confirm the value, set
   `sourceUrl`, `lastVerified` (today), `nextReview` (`lastVerified` + cadence),
   and add a `history` entry `{ "action": "verified", "by": "MA2", "note": "…" }`.
5. Fill `affectsTools` with every `toolId` that consumes this rule
   (cross-check `data/tools-inventory.json`).
6. Request MA5 sign-off; MA5 flips `status` to `verified`.

**Updating an existing rule:**

1. Change `value` (and `effectiveDate` if the platform announced one).
2. Update `sourceUrl` if the docs page moved; set `lastVerified` to today;
   recompute `nextReview`.
3. Append `history`: `{ "action": "value_changed", "by": "MA2",
   "note": "old <x> → new <y>, per <source>" }`.
4. Set `status` to `verified` after MA5 sign-off; notify affected tool owners
   so they take the version bump and confirm outputs.

**Retiring a rule:** set `status` to `deprecated` with a `history` note citing
the platform's own announcement; keep the record (do not delete) for audit.

## 5. Validation rules (CI-checkable)

The CI freshness check MUST fail the build (or at minimum the registry check step) when:

- [ ] Any required field from §2 is missing.
- [ ] `status` is not one of `verified` / `needs_review` / `stale` / `deprecated`.
- [ ] `reviewCadence` is not one of `monthly` / `quarterly` / `semiannual` / `annual`.
- [ ] `status == "verified"` but `sourceUrl` is empty or not URL-shaped.
- [ ] `effectiveDate`, `lastVerified`, or `nextReview` is not a valid `YYYY-MM-DD`.
- [ ] `nextReview` is not strictly after `lastVerified`.
- [ ] `ruleId` does not match the `<platform>-<slug>` pattern, or `platform`
      does not match the file name.
- [ ] Any `toolId` in `affectsTools` does not exist in `data/tools-inventory.json`
      or does not match `tool-NNN` format.
- [ ] Any string field contains `EXAMPLE`, `example.invalid`, `TODO`,
      `FIXME`, `XXX`, `999.99`, or `1900-` — **placeholder leak = unshippable.**

## 6. PLACEHOLDER WARNING (read before writing any value)

- **Never invent a rate, fee, RPM, CPM, tax rate, policy, or limit.** If you don't
  have the platform's own documentation open in front of you, leave the rule
  `needs_review` with empty/placeholder fields — a flagged tool is honest, a
  guessed value is a lie on a published page.
- Example values in this README are deliberately absurd (`999.99`, year 1900,
  `example.invalid` URLs) so they can never be mistaken for real data.
- Real values are entered ONLY by MA2's verification process (see §4), with
  `sourceUrl` pointing at the platform's own docs — never a blog or aggregator.
- When in doubt, flag it. The honesty banner exists for exactly this case.
