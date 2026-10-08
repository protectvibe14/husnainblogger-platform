/**
 * TikTok Live Title Generator — pure logic (tool-158).
 * Zero imports, zero network, zero DOM, fully deterministic.
 *
 * HONESTY: titles are assembled from FIXED word banks — no AI, no TikTok data.
 * LIMIT HONESTY: TikTok does NOT publish an official LIVE title character
 * limit. Every title is capped at a CONSERVATIVE 60 characters (labeled as
 * best practice, not as a platform rule) — enforced by `enforceLimit`.
 * Bank sizes:
 *   - PREFIXES: 6
 *   - HOOKS: 10
 *   - TITLE_PATTERNS: 2 (with / without niche)
 * Output count: exactly 8 titles per run (TITLE_COUNT).
 * Determinism: same inputs -> same outputs (combo index = hash of inputs).
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_TOPIC_LEN = 80;
const MAX_NICHE_LEN = 60;
/** Conservative cap — NOT a TikTok-published limit (see header). */
const TITLE_LIMIT = 60;
const TITLE_COUNT = 8;

/** FNV-1a 32-bit hash — deterministic bank seeding, no Math.random. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const PREFIXES: readonly string[] = [
  "LIVE:",
  "Going LIVE:",
  "LIVE NOW:",
  "Join me LIVE:",
  "Streaming:",
  "LIVE Q&A:",
];

const HOOKS: readonly string[] = [
  "ask me anything",
  "your questions answered live",
  "watch me do it live",
  "come hang out",
  "free tips inside",
  "you do not want to miss this",
  "bring your questions",
  "live demo happening now",
  "unfiltered and unscripted",
  "first 50 viewers get a shoutout",
];

/** Enforce the conservative 60-char cap without cutting mid-word when possible. */
function enforceLimit(title: string): string {
  if (title.length <= TITLE_LIMIT) return title;
  const cut = title.slice(0, TITLE_LIMIT);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > TITLE_LIMIT - 15) return cut.slice(0, lastSpace);
  return cut;
}

export const LIMIT_NOTE =
  "Honesty label: TikTok does not publish an official LIVE title character limit, so these titles are capped at 60 characters as a conservative best practice — not as a platform rule. Front-load the hook: the first 25-30 characters are what viewers see while scrolling.";

export function runTool(values: Record<string, unknown>): RunResult {
  const rawTopic = values["liveTopic"];
  if (typeof rawTopic !== "string" || rawTopic.trim().length === 0) {
    return {
      ok: false,
      error: 'Please enter your LIVE topic — for example "weeknight meal prep" — so the titles fit your stream.',
    };
  }
  const liveTopic = rawTopic.trim();
  if (liveTopic.length > MAX_TOPIC_LEN) {
    return { ok: false, error: "LIVE topic must be 80 characters or fewer — shorten it and try again." };
  }

  let niche = "";
  const rawNiche = values["niche"];
  if (rawNiche !== undefined && rawNiche !== null && String(rawNiche).trim().length > 0) {
    niche = String(rawNiche).trim();
    if (niche.length > MAX_NICHE_LEN) {
      return { ok: false, error: "Niche must be 60 characters or fewer — shorten it and try again." };
    }
  }

  const seed = hashString((niche + "|" + liveTopic).toLowerCase());
  const comboSpace = PREFIXES.length * HOOKS.length; // 60 unique combos

  const liveTitles: string[] = [];
  let i = 0;
  let guard = 0;
  while (liveTitles.length < TITLE_COUNT && guard < 200) {
    const combo = (seed + i) % comboSpace;
    const prefix = PREFIXES[combo % PREFIXES.length];
    const hook = HOOKS[Math.floor(combo / PREFIXES.length) % HOOKS.length];
    const raw =
      niche.length > 0
        ? `${prefix} ${niche}: ${liveTopic} — ${hook}`
        : `${prefix} ${liveTopic} — ${hook}`;
    const title = enforceLimit(raw);
    if (!liveTitles.includes(title)) liveTitles.push(title);
    i++;
    guard++;
  }

  return { ok: true, values: { liveTitles, limitNote: LIMIT_NOTE } };
}
