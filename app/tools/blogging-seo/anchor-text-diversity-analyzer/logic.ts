/**
 * Anchor Text Diversity Analyzer — pure logic (zero imports, zero network, zero DOM).
 *
 * HONESTY CONTRACT (see spec honestyNote): ratios and Shannon entropy are
 * computed exactly from the user's anchor list. The TYPE labels and risk
 * thresholds below are OUR OWN editorial heuristics — they are NOT
 * Google-published rules and must never be presented as such.
 *
 * Input format: one anchor per line, "anchor text | https://example.com/page"
 * (split on the LAST "|" so anchor text may contain pipes).
 *
 * Fixed content banks:
 *   - GENERIC_ANCHORS: 28 generic English anchor phrases ("click here", ...).
 * Fixed rules:
 *   - Normalization: lowercase, trim, collapse internal whitespace.
 *   - Type priority per anchor group: naked-url > generic > exact-match > partial.
 *     "exact-match" here means "the single most-used anchor text" (we have no
 *     target keyword input); it is labeled only when that text is used >= 2 times.
 *   - exactMatchRatio = share (%) of the largest anchor-text group.
 *   - entropy = Shannon entropy (bits) over normalized anchor-text groups.
 *   - Risk flags (editorial thresholds):
 *       exactMatchRatio >= 50        -> over-concentration
 *       entropy < 1.0                -> very low diversity
 *       naked-url share > 30%        -> naked-URL heavy
 *       generic share > 30%           -> generic heavy
 *       anchors.length === 1         -> single anchor, no diversity signal
 */

export const MAX_ANCHORS = 2000;
export const CONCENTRATION_THRESHOLD = 50;
export const LOW_ENTROPY_THRESHOLD = 1.0;
export const NAKED_SHARE_THRESHOLD = 30;
export const GENERIC_SHARE_THRESHOLD = 30;

/** 28 generic English anchor phrases — bank is English-only. */
const GENERIC_ANCHORS: ReadonlyArray<string> = [
  "click here",
  "read more",
  "learn more",
  "more info",
  "more information",
  "this article",
  "this post",
  "this page",
  "website",
  "site",
  "link",
  "here",
  "article",
  "post",
  "page",
  "source",
  "reference",
  "details",
  "info",
  "view",
  "visit",
  "check this out",
  "find out more",
  "discover more",
  "continue reading",
  "official website",
  "homepage",
  "webpage",
];
export const GENERIC_BANK_SIZE = GENERIC_ANCHORS.length;

const GENERIC_SET = new Set(GENERIC_ANCHORS);
const NAKED_RE = /^(https?:\/\/|www\.)\S+$/i;
const URL_RE = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface AnchorGroup {
  display: string;
  normalized: string;
  count: number;
  type: string;
}

function classifyAnchor(norm: string, isDominant: boolean): string {
  if (NAKED_RE.test(norm)) return "naked-url";
  if (GENERIC_SET.has(norm)) return "generic";
  if (isDominant) return "exact-match";
  return "partial";
}

/**
 * Tool logic slot. values: { anchors } — textarea, one "text | url" per line.
 * Returns { exactMatchRatio, entropy, distribution, riskFlags }.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please provide your inputs first." };
  }

  const raw = values["anchors"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return {
      ok: false,
      error: "Paste your anchors — one per line as: anchor text | https://example.com/page",
    };
  }

  const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length > MAX_ANCHORS) {
    return {
      ok: false,
      error: `Too many anchors: ${lines.length.toLocaleString("en-US")} lines (max ${MAX_ANCHORS.toLocaleString("en-US")}).`,
    };
  }

  interface Parsed {
    text: string;
    url: string;
    lineNo: number;
  }
  const parsed: Parsed[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const pipe = line.lastIndexOf("|");
    if (pipe === -1) {
      return {
        ok: false,
        error: `Line ${i + 1}: use the format "anchor text | https://example.com/page".`,
      };
    }
    const text = line.slice(0, pipe).trim();
    const url = line.slice(pipe + 1).trim();
    if (text.length === 0) {
      return { ok: false, error: `Line ${i + 1}: anchor text is empty.` };
    }
    if (!URL_RE.test(url)) {
      return {
        ok: false,
        error: `Line ${i + 1}: URL is not valid — it must start with http:// or https://.`,
      };
    }
    parsed.push({ text, url, lineNo: i + 1 });
  }

  const total = parsed.length;
  const groups = new Map<string, AnchorGroup>();
  for (const p of parsed) {
    const norm = normalize(p.text);
    const g = groups.get(norm);
    if (g) g.count++;
    else groups.set(norm, { display: p.text.trim(), normalized: norm, count: 1, type: "" });
  }

  const groupList = [...groups.values()];
  const maxCount = Math.max(...groupList.map((g) => g.count));
  const dominantNorms = new Set(
    groupList.filter((g) => g.count === maxCount).map((g) => g.normalized),
  );
  for (const g of groupList) {
    g.type = classifyAnchor(g.normalized, maxCount >= 2 && dominantNorms.has(g.normalized));
  }
  groupList.sort((a, b) => b.count - a.count || a.display.localeCompare(b.display));

  const exactMatchRatio = round1((maxCount / total) * 100);

  let entropy = 0;
  for (const g of groupList) {
    const p = g.count / total;
    entropy -= p * Math.log2(p);
  }
  entropy = round2(entropy);

  const nakedCount = groupList.filter((g) => g.type === "naked-url").reduce((s, g) => s + g.count, 0);
  const genericCount = groupList.filter((g) => g.type === "generic").reduce((s, g) => s + g.count, 0);
  const nakedShare = (nakedCount / total) * 100;
  const genericShare = (genericCount / total) * 100;

  const distribution = {
    columns: ["Anchor text", "Type", "Count", "Share %"],
    rows: groupList.map((g) => [
      g.display,
      g.type,
      String(g.count),
      round1((g.count / total) * 100).toFixed(1),
    ]),
  };

  const riskFlags: string[] = [];
  if (total === 1) {
    riskFlags.push("Only one anchor — diversity can't be measured. Add more anchors for a real signal.");
  }
  if (exactMatchRatio >= CONCENTRATION_THRESHOLD) {
    riskFlags.push(
      `Over-concentration: ${exactMatchRatio}% of anchors use identical text ("${groupList[0].display}") — diversify your anchor text.`,
    );
  }
  if (entropy < LOW_ENTROPY_THRESHOLD) {
    riskFlags.push(
      `Very low diversity: Shannon entropy is ${entropy} bits (under ${LOW_ENTROPY_THRESHOLD}). A natural profile spreads anchors across many phrases.`,
    );
  }
  if (nakedShare > NAKED_SHARE_THRESHOLD) {
    riskFlags.push(
      `Naked URLs make up ${round1(nakedShare)}% of anchors — balance them with descriptive anchor text.`,
    );
  }
  if (genericShare > GENERIC_SHARE_THRESHOLD) {
    riskFlags.push(
      `Generic phrases ("click here", "read more", …) make up ${round1(genericShare)}% — replace some with descriptive anchors.`,
    );
  }

  return {
    ok: true,
    values: {
      exactMatchRatio,
      entropy,
      distribution,
      riskFlags,
    },
  };
}
