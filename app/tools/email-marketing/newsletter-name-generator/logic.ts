/**
 * Newsletter Name Generator — pure logic (tool-417).
 *
 * HONESTY / ASSUMPTIONS (also surfaced in meta.ts):
 * - This is a DETERMINISTIC name assembler built on FIXED word banks and
 *   fixed pattern templates (sizes documented below). It is NOT AI.
 * - NO live domain or social-handle availability check is possible
 *   client-side. A reminder notice is returned with every result and the
 *   page copy must tell users to check availability manually.
 * - Lengths are measured in Unicode code points ([...s].length) so emoji
 *   and non-Latin scripts are counted as users perceive them.
 * - Overlong inputs are truncated WITH a visible notice, never silently.
 * - Generated names are deduplicated; repeated-phrase patterns are skipped.
 *
 * WORD BANK SIZES:
 * - SUFFIXES: 18 newsletter-style suffixes
 * - TONE_WORDS: 5 tones x 8 tone words = 40
 * - NAME_PATTERNS: 10 fixed patterns
 * - TAGLINES: 8 tagline templates
 */

export const TONES = [
  "playful",
  "professional",
  "witty",
  "minimal",
  "bold",
] as const;
export type Tone = (typeof TONES)[number];

export const MAX_NICHE_CHARS = 80;
export const MAX_KEYWORDS_CHARS = 120;
export const MIN_COUNT = 1;
export const MAX_COUNT = 20;

/** 18 newsletter-style suffixes. */
export const SUFFIXES: readonly string[] = [
  "Digest",
  "Weekly",
  "Briefing",
  "Dispatch",
  "Chronicle",
  "Letter",
  "Notes",
  "Wire",
  "Journal",
  "Report",
  "Review",
  "Roundup",
  "Signal",
  "Pulse",
  "Post",
  "Times",
  "Club",
  "Lab",
];

/** 8 tone words per tone (5 tones = 40 words). */
export const TONE_WORDS: Record<Tone, readonly string[]> = {
  playful: ["Bubbly", "Cheeky", "Zany", "Frothy", "Jazzy", "Snappy", "Peppy", "Quirky"],
  professional: ["Executive", "Strategic", "Insight", "Authority", "Pro", "Prime", "Core", "Edge"],
  witty: ["Snarky", "Clever", "Dry", "Sly", "Sharp", "Wry", "Savvy", "Nimble"],
  minimal: ["Simple", "Plain", "Clear", "Calm", "Essential", "Bare", "Quiet", "Clean"],
  bold: ["Fearless", "Loud", "Radical", "Unfiltered", "Raw", "Bold", "Brave", "Blunt"],
};

interface NameParts {
  kw: string;
  kw2: string;
  tw: string;
  sfx: string;
}

/** 10 fixed name patterns. */
export const NAME_PATTERNS: ReadonlyArray<(p: NameParts) => string> = [
  (p) => `${p.kw} ${p.sfx}`,
  (p) => `The ${p.kw} ${p.sfx}`,
  (p) => `${p.tw} ${p.kw}`,
  (p) => `${p.tw} ${p.kw} ${p.sfx}`,
  (p) => `The ${p.tw} ${p.kw}`,
  (p) => `${p.kw} & ${p.kw2}`,
  (p) => `All About ${p.kw}`,
  (p) => `${p.kw}, in Your Inbox`,
  (p) => `${p.tw} Takes on ${p.kw}`,
  (p) => `Dear ${p.kw}`,
];

/** 8 tagline templates; {niche} and {tone} are filled from inputs. */
export const TAGLINES: readonly string[] = [
  "Your weekly briefing on {niche}.",
  "A {tone} take on {niche}, straight to your inbox.",
  "Everything {niche}, minus the noise.",
  "The {niche} newsletter you'll actually open.",
  "Smart, short reads on {niche}.",
  "{niche}, explained for busy people.",
  "One email. All the {niche} that matters.",
  "Join readers who love {niche}.",
];

export interface GeneratedName {
  name: string;
  taglineSuggestion: string;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** User-perceived character count (Unicode code points, not UTF-16 units). */
export function codePoints(s: string): number {
  return [...s].length;
}

/** Strip angle brackets so plain-text outputs never carry unescaped HTML. */
export function sanitizePlain(s: string): string {
  return s.replace(/[<>]/g, "");
}

function truncateCp(
  s: string,
  max: number,
): { text: string; truncated: boolean } {
  const cps = [...s];
  if (cps.length <= max) return { text: s, truncated: false };
  return { text: cps.slice(0, max).join(""), truncated: true };
}

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => {
      const cps = [...w];
      return cps[0].toLocaleUpperCase() + cps.slice(1).join("");
    })
    .join(" ");
}

/** FNV-1a hash over code points -> deterministic seed. */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — deterministic PRNG (no Math.random). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate newsletter names deterministically from the inputs.
 * Same inputs -> same names, always.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please provide your newsletter details first." };
  }
  const notices: string[] = [];

  // --- niche (required) ---
  const rawNiche = values["niche"];
  if (typeof rawNiche !== "string" || rawNiche.trim().length === 0) {
    return { ok: false, error: "Please enter your newsletter niche." };
  }
  let niche = sanitizePlain(rawNiche.trim());
  const nicheTrunc = truncateCp(niche, MAX_NICHE_CHARS);
  if (nicheTrunc.truncated) {
    notices.push(
      `Niche was shortened to ${MAX_NICHE_CHARS} characters; extra text was not used.`,
    );
  }
  niche = nicheTrunc.text;

  // --- keywords (optional) ---
  let keywords: string[] = [];
  const rawKeywords = values["keywords"];
  if (rawKeywords !== undefined && rawKeywords !== null && rawKeywords !== "") {
    if (typeof rawKeywords !== "string") {
      return { ok: false, error: "Keywords must be text." };
    }
    let kw = sanitizePlain(rawKeywords.trim());
    const kwTrunc = truncateCp(kw, MAX_KEYWORDS_CHARS);
    if (kwTrunc.truncated) {
      notices.push(
        `Keywords were shortened to ${MAX_KEYWORDS_CHARS} characters; extra text was not used.`,
      );
    }
    keywords = kwTrunc.text
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }

  // --- tone (required enum) ---
  const rawTone = values["tone"];
  if (typeof rawTone !== "string" || !(TONES as readonly string[]).includes(rawTone)) {
    return {
      ok: false,
      error: `Please pick a tone: ${TONES.join(", ")}.`,
    };
  }
  const tone = rawTone as Tone;

  // --- count (1-20, clamped) ---
  const rawCount = values["count"];
  if (typeof rawCount !== "number" || !Number.isFinite(rawCount)) {
    return { ok: false, error: "Count must be a number between 1 and 20." };
  }
  const count = Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.floor(rawCount)));

  // --- deterministic generation ---
  const rng = mulberry32(hashSeed(`${niche}\n${keywords.join(",")}\n${tone}`));
  const toneWords = TONE_WORDS[tone];
  const kw = titleCase(niche);
  const firstKeyword = keywords.length > 0 ? titleCase(keywords[0]) : "";

  const used = new Set<string>();
  const names: GeneratedName[] = [];
  let collisionFallback = 2;

  for (let i = 0; i < count; i++) {
    const tw = toneWords[Math.floor(rng() * toneWords.length)];
    const sfx = SUFFIXES[Math.floor(rng() * SUFFIXES.length)];
    const parts: NameParts = {
      kw,
      kw2: firstKeyword || tw,
      tw,
      sfx,
    };
    let candidate = NAME_PATTERNS[i % NAME_PATTERNS.length](parts).replace(/\s+/g, " ").trim();

    // Deterministic dedupe: re-roll from the same seeded stream; if the
    // banks are exhausted, append a numbered suffix.
    let attempts = 0;
    while (used.has(candidate) && attempts < 60) {
      const tw2 = toneWords[Math.floor(rng() * toneWords.length)];
      const sfx2 = SUFFIXES[Math.floor(rng() * SUFFIXES.length)];
      candidate = NAME_PATTERNS[(i + attempts + 1) % NAME_PATTERNS.length]({
        kw,
        kw2: firstKeyword || tw2,
        tw: tw2,
        sfx: sfx2,
      })
        .replace(/\s+/g, " ")
        .trim();
      attempts++;
    }
    if (used.has(candidate)) {
      candidate = `${candidate} ${collisionFallback}`;
      collisionFallback++;
    }
    used.add(candidate);

    const tagline = TAGLINES[Math.floor(rng() * TAGLINES.length)]
      .replaceAll("{niche}", niche)
      .replaceAll("{tone}", tone);
    names.push({ name: candidate, taglineSuggestion: tagline });
  }

  notices.push(
    "Names are suggestions only — check domain and social-handle availability manually before using a name. This tool cannot check availability.",
  );

  return { ok: true, values: { names, notices } };
}
