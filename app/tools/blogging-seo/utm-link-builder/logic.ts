/**
 * UTM Link Builder (tool-046) — pure logic (zero imports, zero network, zero DOM).
 *
 * HONESTY CONTRACT: this tool VALIDATES base URLs and ASSEMBLES query
 * strings using the documented Google Analytics UTM parameter convention
 * (utm_source, utm_medium, utm_campaign, utm_term, utm_content). It is a
 * string builder with validation — it does not check whether the URL is
 * live, and it does not send or verify any tracking data.
 *
 * Fixed rules (documented here and surfaced in assumptions):
 * - baseUrl must be an absolute http(s) URL (WHATWG-parseable). Other
 *   schemes (javascript:, data:, ftp:) are rejected.
 * - utm_source and utm_medium are required, 1-100 chars each. utm_campaign
 *   is strongly recommended (warning when empty); utm_term / utm_content
 *   are optional, max 100 chars each.
 * - Values are encoded with encodeURIComponent (RFC 3986: space -> %20).
 * - Existing non-UTM query parameters are preserved EXACTLY as typed
 *   (never re-encoded); the URL fragment (#...) is preserved.
 * - Existing utm_* parameters are removed and overwritten; each overwrite
 *   is reported as a warning.
 * - Builder shape: runTool({ items }) validates every item first; the first
 *   invalid item fails the whole run with "Item N: <reason>".
 *
 * Deterministic: same items -> same URLs, always.
 */

export const MAX_PARAM_LENGTH = 100;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Build one tagged URL. Never throws for object input; reports via errors.
 * Throws an Error with the "Item N: ..." message when the item is invalid —
 * runTool catches it and returns { ok: false, error }.
 */
function buildOne(item: Record<string, unknown>, itemNo: number, warnings: string[]): string {
  const label = `Item ${itemNo}`;

  const baseUrl = clean(item.baseUrl);
  const source = clean(item.utmSource);
  const medium = clean(item.utmMedium);
  const campaign = clean(item.utmCampaign);
  const term = clean(item.utmTerm);
  const content = clean(item.utmContent);

  if (baseUrl.length === 0) throw new Error(`${label}: baseUrl is required.`);
  if (source.length === 0) throw new Error(`${label}: utm_source is required.`);
  if (medium.length === 0) throw new Error(`${label}: utm_medium is required.`);
  for (const [key, value] of [
    ["utm_source", source],
    ["utm_medium", medium],
    ["utm_campaign", campaign],
    ["utm_term", term],
    ["utm_content", content],
  ] as const) {
    if (value.length > MAX_PARAM_LENGTH) {
      throw new Error(`${label}: ${key} must be ${MAX_PARAM_LENGTH} characters or fewer.`);
    }
  }

  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error(`${label}: baseUrl is not a valid absolute URL.`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${label}: baseUrl must use http or https (got "${url.protocol}").`);
  }

  if (campaign.length === 0) {
    warnings.push(`${label}: utm_campaign is empty — adding it is strongly recommended for usable reports.`);
  }

  // Preserve existing non-UTM query pairs exactly as typed; drop utm_*.
  const kept: string[] = [];
  const overwritten = new Set<string>();
  const rawQuery = url.search.length > 0 ? url.search.slice(1) : "";
  if (rawQuery.length > 0) {
    for (const pair of rawQuery.split("&")) {
      if (pair.length === 0) continue;
      const eq = pair.indexOf("=");
      const keyRaw = eq === -1 ? pair : pair.slice(0, eq);
      let key = keyRaw;
      try {
        key = decodeURIComponent(keyRaw);
      } catch {
        key = keyRaw; // malformed encoding — keep the pair untouched.
      }
      if (key.toLowerCase().startsWith("utm_")) {
        overwritten.add(key);
        continue;
      }
      kept.push(pair);
    }
  }
  if (overwritten.size > 0) {
    warnings.push(`${label}: existing UTM parameter(s) overwritten: ${[...overwritten].join(", ")}.`);
  }

  const toApply: Array<[string, string]> = [
    ["utm_source", source],
    ["utm_medium", medium],
  ];
  if (campaign.length > 0) toApply.push(["utm_campaign", campaign]);
  if (term.length > 0) toApply.push(["utm_term", term]);
  if (content.length > 0) toApply.push(["utm_content", content]);

  const newPairs = toApply.map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
  const query = [...kept, ...newPairs].join("&");
  return `${url.protocol}//${url.host}${url.pathname}?${query}${url.hash}`;
}

/**
 * Builder entry point. `args.items` is one object per link to tag:
 * { baseUrl, utmSource, utmMedium, utmCampaign?, utmTerm?, utmContent? }.
 */
export function runTool(args: { items: Record<string, unknown>[] }): RunToolResult {
  if (!args || typeof args !== "object" || !Array.isArray(args.items)) {
    return { ok: false, error: "No items to build." };
  }
  if (args.items.length === 0) {
    return { ok: false, error: "Add at least one link to build." };
  }
  const lines: string[] = [];
  const warnings: string[] = [];
  try {
    args.items.forEach((raw, index) => {
      if (!raw || typeof raw !== "object") {
        throw new Error(`Item ${index + 1}: not an object.`);
      }
      lines.push(buildOne(raw as Record<string, unknown>, index + 1, warnings));
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
  return {
    ok: true,
    values: {
      lines,
      warnings,
      count: lines.length,
    },
  };
}
