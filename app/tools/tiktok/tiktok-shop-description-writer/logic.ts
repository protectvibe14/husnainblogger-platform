/**
 * TikTok Shop Description Writer — pure logic (tool-192).
 * Zero imports, zero network, zero DOM, fully deterministic.
 *
 * HONESTY: descriptions are assembled from FIXED templates — no AI, no
 * invented specs, prices, or contents. Specs and "what's in the box" are
 * emitted as clearly-labeled [bracketed] placeholders the seller MUST replace
 * with real supplier info before publishing. Policy reminders reference
 * published TikTok Shop guidance (counterfeit / unauthorized brand use).
 * Bank sizes:
 *   - HOOK_TEMPLATES: 6 (opening hook lines, {P} = product name)
 *   - IP_TERMS: 58 (common brand names + counterfeit terms, reminder list only)
 * Output: one structured description (<= 10000 chars per Shop guideline).
 * Determinism: same inputs -> same outputs (hook chosen by input hash).
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Shop description guideline cap (platform rule). */
const DESCRIPTION_LIMIT = 10000;
const MAX_NAME_LEN = 150;
const MAX_FEATURES = 25;
const MAX_FEATURE_LEN = 200;
const MAX_RAW_FEATURES_LEN = 5000;

/** 6 fixed opening-hook templates. {P} = product name. */
export const HOOK_TEMPLATES: readonly string[] = [
  "If you love {P}, this one is worth a look.",
  "Meet the {P} — made for everyday use.",
  "Looking for {P}? Here is what you get.",
  "The {P}, explained in plain words.",
  "Everything you need to know about the {P}.",
  "Say hello to the {P} — details below.",
];

/**
 * 58 common brand names + counterfeit terms used for a reminder scan.
 * NOT exhaustive and NOT legal advice — a keyword reminder only.
 */
export const IP_TERMS: readonly string[] = [
  "nike", "adidas", "jordan", "yeezy", "puma", "reebok", "new balance",
  "vans", "converse", "asics", "under armour",
  "gucci", "louis vuitton", "chanel", "dior", "prada", "hermes",
  "balenciaga", "fendi", "versace", "burberry", "givenchy", "valentino",
  "off-white", "supreme", "ralph lauren", "tommy hilfiger", "calvin klein",
  "lacoste", "zara", "h&m", "shein", "levi",
  "rolex", "cartier", "apple", "samsung", "sony", "dyson", "lego",
  "the north face", "patagonia", "lululemon", "ikea", "kitchenaid",
  "ninja", "instant pot", "keurig", "nespresso",
  "dupe", "dupes", "replica", "replicas", "knockoff", "knock-off",
  "1:1", "mirror quality", "unauthorized authentic",
];

/** FNV-1a 32-bit hash — deterministic bank seeding, no Math.random. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split raw feature text on newlines/semicolons, trim, drop empties. */
function parseFeatures(raw: string): string[] {
  const out: string[] = [];
  for (const part of raw.split(/[\n;]+/)) {
    const f = part.trim().replace(/\s+/g, " ");
    if (f.length > 0) out.push(f);
  }
  return out;
}

/** Find IP_TERMS in text: word-boundary for single words, substring for phrases. */
function findIpTerms(text: string): string[] {
  const lowered = text.toLowerCase();
  const found: string[] = [];
  for (const term of IP_TERMS) {
    const t = term.toLowerCase();
    const hit = t.includes(" ")
      ? lowered.includes(t)
      : new RegExp(`\\b${escapeRegExp(t)}\\b`).test(lowered);
    if (hit) found.push(term);
  }
  return found;
}

/** Draft keyword line from feature words (4+ chars), deduped, first 20. */
function draftKeywords(features: string[]): string {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const f of features) {
    for (const w of f.toLowerCase().split(/[^a-z0-9'-]+/)) {
      if (w.length >= 4 && !seen.has(w)) {
        seen.add(w);
        words.push(w);
      }
      if (words.length >= 20) break;
    }
    if (words.length >= 20) break;
  }
  return words.join(", ");
}

function err(error: string): RunResult {
  return { ok: false, error };
}

export function runTool(values: Record<string, unknown>): RunResult {
  const rawName = values["productName"];
  if (typeof rawName !== "string" || rawName.trim().length === 0) {
    return err(
      'Please enter your product name — for example "ceramic pour-over coffee set" — so the description fits your listing.',
    );
  }
  const productName = rawName.trim().replace(/\s+/g, " ");
  if (productName.length > MAX_NAME_LEN) {
    return err(
      `Product name must be ${MAX_NAME_LEN} characters or fewer — shorten it and try again.`,
    );
  }

  const rawFeatures = values["features"];
  if (typeof rawFeatures !== "string" || rawFeatures.trim().length === 0) {
    return err(
      "List at least one feature — one per line, for example \"Holds 1 liter\" on its own line.",
    );
  }
  if (rawFeatures.length > MAX_RAW_FEATURES_LEN) {
    return err(
      `Feature text must be ${MAX_RAW_FEATURES_LEN} characters or fewer — trim the list and try again.`,
    );
  }
  const parsed = parseFeatures(rawFeatures);
  if (parsed.length === 0) {
    return err("No usable features found — list at least one feature, one per line.");
  }
  const features = parsed
    .slice(0, MAX_FEATURES)
    .map((f) => (f.length > MAX_FEATURE_LEN ? f.slice(0, MAX_FEATURE_LEN).trimEnd() : f));

  const hook = HOOK_TEMPLATES[hashString(productName.toLowerCase()) % HOOK_TEMPLATES.length].split("{P}").join(productName);

  const benefits = features.map((f) => `• ${f}`).join("\n");

  const description =
    `${hook}\n\n` +
    `${productName} — why you will like it:\n${benefits}\n\n` +
    `Details (REPLACE these placeholders with your real supplier info before publishing):\n` +
    `- Material / size / weight: [add the real specs here]\n` +
    `- Care instructions: [add here]\n` +
    `- Compatibility / variants: [add if relevant]\n\n` +
    `What's in the box (REPLACE with exactly what ships — item names and quantities):\n` +
    `[List every item in the box. Do not publish this placeholder.]\n\n` +
    `Keywords (draft from your feature text — edit freely):\n` +
    `${draftKeywords(features)}`;

  if (description.length > DESCRIPTION_LIMIT) {
    return err(
      `Description exceeded the ${DESCRIPTION_LIMIT}-character Shop guideline — shorten your feature list and try again.`,
    );
  }

  const ipHits = findIpTerms(productName + "\n" + features.join("\n"));
  const policyNote =
    ipHits.length === 0
      ? "No brand/IP-sensitive terms detected in your text. This is a keyword reminder scan, not a legal check — always verify trademarks yourself before publishing."
      : `Heads-up: your text mentions possible brand/IP terms: ${ipHits.join(", ")}. ` +
        "TikTok Shop's published policies prohibit counterfeit and unauthorized brand use — " +
        "remove or rephrase these, and never list dupes or replicas as genuine. " +
        "This reminder is general information, not legal advice.";

  return { ok: true, values: { description, policyNote } };
}
