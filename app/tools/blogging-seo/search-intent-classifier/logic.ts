/**
 * Search Intent Classifier — pure logic (tool-002), zero imports, zero
 * network, zero DOM.
 *
 * HEURISTIC, NOT AI: classifies a keyword into one of five search-intent
 * buckets using hand-built English word/phrase banks. It does NOT consult
 * live SERPs, search volume, or any ML model. Results are a starting guess
 * for content planning, not a measurement of real searcher intent.
 *
 * Buckets: informational | navigational | commercial | transactional | unknown
 * (the standard four-way intent model used across SEO literature, plus
 * "unknown" for input with no detectable Latin-script content — e.g. pure
 * non-English script — where the English cue banks cannot apply).
 *
 * Tie-breaking: transactional > commercial > navigational > informational
 * (more specific purchase intent wins ties).
 *
 * Confidence is the share of matched signal weight captured by the winning
 * bucket (0..1). Confidence band: high (>=0.75), medium (>=0.40), low (<0.40).
 * "unknown" always reports confidence 0 / band "low".
 */

export type SearchIntent =
  | "informational"
  | "navigational"
  | "commercial"
  | "transactional"
  | "unknown";

/** Coarse confidence band derived from the 0..1 confidence ratio. */
export type ConfidenceBand = "high" | "medium" | "low";

export interface IntentResult {
  keyword: string;
  intent: SearchIntent;
  /** 0..1 — share of total signal weight captured by the winning bucket. */
  confidence: number;
  /** Coarse band: high (>=0.75), medium (>=0.40), low (<0.40). */
  confidenceBand: ConfidenceBand;
  /** Matched cue words/phrases grouped per bucket. */
  matchedSignals: Record<SearchIntent, string[]>;
  /** Always true — reminds consumers this is a heuristic. */
  isHeuristic: true;
  disclaimer: string;
}

export const DISCLAIMER =
  "Heuristic word-bank classification, not AI and not based on live SERP data. " +
  "Use as a planning starting point; verify against actual search results.";

interface BankEntry {
  intent: SearchIntent;
  /** Lowercase cue. Multi-word cues match as whole phrases. */
  cues: string[];
}

/** Ordered by tie-break priority (transactional first). */
const BANKS: BankEntry[] = [
  {
    intent: "transactional",
    cues: [
      "buy", "purchase", "order", "checkout", "add to cart", "for sale", "on sale",
      "discount", "coupon", "promo code", "deal", "deals", "cheap", "cheapest",
      "price", "pricing", "cost", "hire", "book now", "sign up", "signup",
      "subscribe", "free trial", "get started", "quote",
    ],
  },
  {
    intent: "commercial",
    cues: [
      "best", "top", "review", "reviews", "vs", "versus", "compare", "comparison",
      "alternative", "alternatives", "pros and cons", "worth it", "pricing",
      "which one", "best value", "ranked", "head to head",
    ],
  },
  {
    intent: "navigational",
    cues: [
      "login", "log in", "sign in", "sign-in", "official", "official site",
      "homepage", "website", "app", "download", "near me", "contact",
      "customer service", "support",
    ],
  },
  {
    intent: "informational",
    cues: [
      "how", "what", "why", "when", "where", "who", "guide", "tutorial",
      "tips", "learn", "meaning", "definition", "examples", "ideas",
      "explained", "beginner", "101", "facts about", "history of",
    ],
  },
];

/** Escape a string for safe use inside a RegExp. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Classify a single keyword. Throws for empty/non-string input; never throws
 * for any non-empty string (any script, any length).
 *
 * Non-English-script input with no Latin letters (e.g. pure Arabic, CJK)
 * classifies as "unknown" — the English cue banks cannot apply — instead of
 * silently defaulting to informational.
 */
export function classifyIntent(keyword: string): IntentResult {
  if (typeof keyword !== "string" || keyword.trim().length === 0) {
    throw new Error("keyword must be a non-empty string.");
  }
  const text = ` ${keyword.toLowerCase().trim()} `;

  const matchedSignals: Record<SearchIntent, string[]> = {
    informational: [],
    navigational: [],
    commercial: [],
    transactional: [],
    unknown: [],
  };

  const hasLatin = /[a-z]/.test(text);

  for (const bank of BANKS) {
    for (const cue of bank.cues) {
      // Whole-word / whole-phrase match on padded text.
      const re = new RegExp(`(^|\\W)${escapeRegExp(cue)}(\\W|$)`);
      if (re.test(text)) matchedSignals[bank.intent].push(cue);
    }
  }

  const scores: Record<SearchIntent, number> = {
    informational: matchedSignals.informational.length,
    navigational: matchedSignals.navigational.length,
    commercial: matchedSignals.commercial.length,
    transactional: matchedSignals.transactional.length,
    unknown: 0,
  };
  const total = scores.informational + scores.navigational + scores.commercial + scores.transactional;

  // BANKS order = tie-break priority. Default: informational when nothing
  // matches; "unknown" when there is no Latin-script content to evaluate.
  let intent: SearchIntent = "informational";
  if (!hasLatin) {
    intent = "unknown";
  } else {
    let best = 0;
    for (const bank of BANKS) {
      if (scores[bank.intent] > best) {
        best = scores[bank.intent];
        intent = bank.intent;
      }
    }
  }

  const confidence =
    intent === "unknown" || total === 0
      ? 0
      : Math.round((scores[intent] / total) * 100) / 100;
  const confidenceBand: ConfidenceBand =
    intent === "unknown" ? "low" : confidence >= 0.75 ? "high" : confidence >= 0.4 ? "medium" : "low";

  return {
    keyword: keyword.trim(),
    intent,
    confidence,
    confidenceBand,
    matchedSignals,
    isHeuristic: true,
    disclaimer: DISCLAIMER,
  };
}

/**
 * Classify a batch of keywords (e.g. from a pasted list). Skips blank lines.
 */
export function classifyBatch(keywords: string[]): IntentResult[] {
  if (!Array.isArray(keywords)) throw new Error("keywords must be an array of strings.");
  return keywords
    .filter((k) => typeof k === "string" && k.trim().length > 0)
    .map((k) => classifyIntent(k));
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.keyword: string, required, 1-150 chars after trimming.
 *
 * Output keys match the spec: intent (string), confidence (number 0..1),
 * matchedSignals (string[] of "bucket:cue" entries), isHeuristic (string —
 * the registry OutputKind has no boolean kind, so the heuristic flag is
 * rendered as text).
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values["keyword"];

  if (raw === undefined || raw === null || raw === "") {
    return { ok: false, error: "Please enter a keyword to classify." };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: "Keyword must be text." };
  }
  const keyword = raw.trim();
  if (keyword.length === 0) {
    return { ok: false, error: "Please enter a keyword to classify." };
  }
  if (keyword.length > 150) {
    return {
      ok: false,
      error: "Keyword must be 150 characters or fewer.",
    };
  }

  const r = classifyIntent(keyword);
  const matchedSignals: string[] = (
    Object.keys(r.matchedSignals) as SearchIntent[]
  ).flatMap((bucket) => r.matchedSignals[bucket].map((cue) => `${bucket}:${cue}`));

  return {
    ok: true,
    values: {
      intent: r.intent,
      confidence: r.confidence,
      matchedSignals,
      isHeuristic: "heuristic — word-bank rules, not AI or live SERP data",
    },
  };
}

/**
 * Render batch results as CSV (pure string — copy/download content).
 */
export function batchToCsv(results: IntentResult[]): string {
  const esc = (s: string): string => `"${s.replace(/"/g, '""')}"`;
  const lines = ["keyword,intent,confidence,matched_signals"];
  for (const r of results) {
    const signals = (Object.keys(r.matchedSignals) as SearchIntent[])
      .flatMap((k) => r.matchedSignals[k].map((c) => `${k}:${c}`))
      .join("; ");
    lines.push([esc(r.keyword), r.intent, String(r.confidence), esc(signals)].join(","));
  }
  return lines.join("\n");
}
