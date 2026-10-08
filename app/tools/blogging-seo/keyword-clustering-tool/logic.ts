/**
 * Keyword Clustering Tool — pure logic (tool-003), zero imports, zero
 * network, zero DOM.
 *
 * HONESTY CONTRACT: heuristic token-overlap grouping (stemmed-token Jaccard
 * similarity with greedy single-link clustering). Draft-level clustering —
 * NOT semantic embeddings, NOT an AI model, NOT based on search data.
 * Results are a starting draft a human should review.
 *
 * Pipeline: normalize -> dedupe -> tokenize+naive-stem -> greedy assign
 * (keywords sorted alphabetically; each keyword joins the first existing
 * cluster whose best member-similarity >= threshold, else starts a new one).
 * Deterministic: same inputs (same threshold) -> same clusters.
 */

export interface KeywordCluster {
  /** Representative label: the medoid (highest total similarity), tie -> first sorted. */
  label: string;
  keywords: string[];
  size: number;
}

export interface ClusterResult {
  /** Table payload: { columns, rows } for the template renderer. */
  clusters: { columns: string[]; rows: string[][] };
  /** Single-member leftovers, alphabetically sorted. */
  unclustered: string[];
  /** Number of clusters (groups of 2+). */
  clusterCount: number;
}

/** Default similarity threshold (spec: 0.1-0.9, default 0.35). */
export const DEFAULT_THRESHOLD = 0.35;

/** Naive English stemmer: strips a fixed suffix list with length guards.
 *  Documented limitation: crude, English-only; e.g. "press" -> "pres". */
function stem(token: string): string {
  if (token.length > 5 && token.endsWith("ing")) return token.slice(0, -3);
  if (token.length > 4 && token.endsWith("ies")) return token.slice(0, -3) + "y";
  if (token.length > 4 && token.endsWith("ed")) return token.slice(0, -2);
  if (token.length > 4 && token.endsWith("ly")) return token.slice(0, -2);
  if (token.length > 4 && token.endsWith("es")) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith("s")) return token.slice(0, -1);
  return token;
}

/** Tokenize: lowercase, keep unicode letters + digits, naive-stem each token. */
export function tokenize(keyword: string): string[] {
  const raw = keyword.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return raw.map(stem).filter((t) => t.length > 0);
}

/** Jaccard similarity of stemmed token sets (0..1). */
export function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** Parse raw input into a clean list: string (newline/comma separated) or string[]. */
export function parseKeywords(raw: unknown): string[] | null {
  let items: unknown[];
  if (typeof raw === "string") {
    items = raw.split(/[\n,;]+/);
  } else if (Array.isArray(raw)) {
    items = raw;
  } else {
    return null;
  }
  const cleaned: string[] = [];
  for (const it of items) {
    if (typeof it !== "string") return null;
    const t = it.trim();
    if (t.length > 0) cleaned.push(t);
  }
  return cleaned;
}

/** Case-insensitive dedupe, keeping the first-seen original form. */
export function dedupe(keywords: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of keywords) {
    const key = k.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(k);
    }
  }
  return out;
}

/**
 * Greedy single-link clustering over sorted unique keywords.
 * Returns groups (each an array of keyword strings).
 */
export function clusterKeywords(
  keywords: string[],
  threshold: number,
): string[][] {
  const sorted = [...keywords].sort((a, b) =>
    a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0,
  );
  const tokenCache = new Map<string, string[]>();
  const toks = (k: string): string[] => {
    let t = tokenCache.get(k);
    if (!t) {
      t = tokenize(k);
      tokenCache.set(k, t);
    }
    return t;
  };

  const groups: string[][] = [];
  for (const kw of sorted) {
    const kwToks = toks(kw);
    let placed = false;
    for (const g of groups) {
      let best = 0;
      for (const member of g) {
        const s = jaccard(kwToks, toks(member));
        if (s > best) best = s;
      }
      if (best >= threshold) {
        g.push(kw);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([kw]);
  }
  return groups;
}

/** Medoid label: member with highest total similarity to the others; tie -> first sorted. */
function medoidLabel(members: string[]): string {
  if (members.length === 1) return members[0];
  let bestLabel = members[0];
  let bestScore = -1;
  for (const m of members) {
    let score = 0;
    for (const o of members) {
      if (o !== m) score += jaccard(tokenize(m), tokenize(o));
    }
    if (score > bestScore) {
      bestScore = score;
      bestLabel = m;
    }
  }
  return bestLabel;
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.keywords: string[] (or textarea string), required, 2-500 unique items, each 1-150 chars.
 * values.similarityThreshold: number, optional, 0.1-0.9, default 0.35.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const parsed = parseKeywords(values["keywords"]);
  if (parsed === null) {
    return { ok: false, error: "Please paste or enter your keyword list." };
  }

  for (const k of parsed) {
    if (k.length > 150) {
      return {
        ok: false,
        error: "Each keyword must be 150 characters or fewer.",
      };
    }
  }

  const unique = dedupe(parsed);
  if (unique.length < 2) {
    return {
      ok: false,
      error: "Enter at least 2 unique keywords to cluster.",
    };
  }
  if (unique.length > 500) {
    return {
      ok: false,
      error: "Please enter no more than 500 unique keywords.",
    };
  }

  let threshold = DEFAULT_THRESHOLD;
  const rawT = values["similarityThreshold"];
  if (rawT !== undefined && rawT !== null && rawT !== "") {
    const t = typeof rawT === "string" ? Number(rawT) : rawT;
    if (typeof t !== "number" || !Number.isFinite(t)) {
      return { ok: false, error: "Similarity threshold must be a number." };
    }
    if (t < 0.1 || t > 0.9) {
      return {
        ok: false,
        error: "Similarity threshold must be between 0.1 and 0.9.",
      };
    }
    threshold = t;
  }

  const groups = clusterKeywords(unique, threshold);
  const clusters: KeywordCluster[] = [];
  const unclustered: string[] = [];
  for (const g of groups) {
    if (g.length >= 2) {
      clusters.push({ label: medoidLabel(g), keywords: g, size: g.length });
    } else {
      unclustered.push(g[0]);
    }
  }
  // Sort clusters by size desc, then label — deterministic presentation.
  clusters.sort((a, b) =>
    b.size - a.size || (a.label.toLowerCase() < b.label.toLowerCase() ? -1 : 1),
  );

  const result: ClusterResult = {
    clusters: {
      columns: ["Cluster", "Keywords", "Size"],
      rows: clusters.map((c) => [
        c.label,
        c.keywords.join(", "),
        String(c.size),
      ]),
    },
    unclustered,
    clusterCount: clusters.length,
  };

  return {
    ok: true,
    values: {
      clusters: result.clusters,
      unclustered: result.unclustered,
      clusterCount: result.clusterCount,
    },
  };
}
