/**
 * UGC Portfolio Page Builder — tool-502 pure logic.
 * Zero imports. Zero network. Zero DOM. No Math.random. Deterministic:
 * identical items always produce the identical data object.
 *
 * ENGINE (honest): structured data assembly — NOT AI, NOT HTML.
 * The Builder UI calls runTool({ items }); each item describes one
 * portfolio entry: { creatorName, niche, sampleUrl?, sampleCaption? }.
 * Output is a PURE DATA OBJECT (portfolioData) — never rendered HTML.
 * The app shell renders this data; user text stays inside strings, so
 * no markup is ever generated here (see methodology in meta.ts).
 *
 * Validation (per item, errors name the item number):
 *   creatorName  — required, non-empty, max 80 chars; must be identical
 *                  (after trimming) across all items
 *   niche        — required, non-empty; unique niches across items (case-
 *                  insensitive dedupe, first casing kept); 1–10 max
 *   sampleUrl    — optional; when given must start with http:// or https://
 *   sampleCaption— optional text, max 300 chars
 */

export interface UgcPortfolioItem {
  creatorName: unknown;
  niche: unknown;
  sampleUrl?: unknown;
  sampleCaption?: unknown;
}

export interface UgcPortfolioResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export interface PortfolioSample {
  niche: string;
  url: string;
  caption: string;
}

export interface PortfolioData {
  creator: { name: string };
  niches: string[];
  samples: PortfolioSample[];
  counts: { niches: number; samples: number };
}

const MAX_NAME = 80;
const MAX_CAPTION = 300;
const MAX_NICHES = 10;

function parseItem(raw: unknown, index: number): {
  creatorName: string;
  niche: string;
  url: string | null;
  caption: string;
} | { error: string } {
  const label = `Item ${index + 1}`;
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { error: `${label}: each item must be an object.` };
  }
  const item = raw as Record<string, unknown>;

  const nameRaw = item["creatorName"];
  if (typeof nameRaw !== "string" || nameRaw.trim().length === 0) {
    return { error: `${label}: creator name is required.` };
  }
  const creatorName = nameRaw.trim();
  if (creatorName.length > MAX_NAME) {
    return {
      error: `${label}: creator name must be ${MAX_NAME} characters or fewer.`,
    };
  }

  const nicheRaw = item["niche"];
  if (typeof nicheRaw !== "string" || nicheRaw.trim().length === 0) {
    return { error: `${label}: niche is required.` };
  }
  const niche = nicheRaw.trim();

  let url: string | null = null;
  const urlRaw = item["sampleUrl"];
  if (urlRaw !== undefined && urlRaw !== null && String(urlRaw).trim().length > 0) {
    if (typeof urlRaw !== "string") {
      return { error: `${label}: sample link must be a URL.` };
    }
    const trimmed = urlRaw.trim();
    if (!/^https?:\/\/.+\..+/.test(trimmed)) {
      return {
        error: `${label}: sample link must be a valid URL starting with http:// or https://.`,
      };
    }
    url = trimmed;
  }

  let caption = "";
  const captionRaw = item["sampleCaption"];
  if (captionRaw !== undefined && captionRaw !== null && String(captionRaw).trim().length > 0) {
    if (typeof captionRaw !== "string") {
      return { error: `${label}: sample caption must be text.` };
    }
    if (captionRaw.trim().length > MAX_CAPTION) {
      return {
        error: `${label}: sample caption must be ${MAX_CAPTION} characters or fewer.`,
      };
    }
    caption = captionRaw.trim();
  }

  return { creatorName, niche, url, caption };
}

export function runTool(args: { items: unknown }): UgcPortfolioResult {
  const items = (args as { items?: unknown }).items;

  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Add at least one portfolio entry to build the portfolio." };
  }

  const parsed: { creatorName: string; niche: string; url: string | null; caption: string }[] = [];
  for (let i = 0; i < items.length; i++) {
    const p = parseItem(items[i], i);
    if ("error" in p) return { ok: false, error: p.error };
    parsed.push(p);
  }

  const creatorName = parsed[0].creatorName;
  for (let i = 1; i < parsed.length; i++) {
    if (parsed[i].creatorName !== creatorName) {
      return {
        ok: false,
        error: `Item ${i + 1}: creator name must match the name used in item 1 ("${creatorName}").`,
      };
    }
  }

  const seen = new Map<string, string>();
  for (const p of parsed) {
    const key = p.niche.toLowerCase();
    if (!seen.has(key)) seen.set(key, p.niche);
  }
  if (seen.size > MAX_NICHES) {
    return {
      ok: false,
      error: `Too many niches: use at most ${MAX_NICHES} unique niches.`,
    };
  }

  const samples: PortfolioSample[] = [];
  for (const p of parsed) {
    if (p.url) samples.push({ niche: p.niche, url: p.url, caption: p.caption });
  }

  const portfolioData: PortfolioData = {
    creator: { name: creatorName },
    niches: [...seen.values()],
    samples,
    counts: { niches: seen.size, samples: samples.length },
  };

  return { ok: true, values: { portfolioData } };
}
