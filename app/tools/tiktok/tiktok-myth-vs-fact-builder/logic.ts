/**
 * tool-181 — TikTok Myth vs Fact Builder (template builder).
 *
 * Honesty: NOT AI. This tool assembles a "myth → reveal → fact" TikTok script
 * from FIXED template banks. The myth and fact text come from the USER —
 * the tool never invents, verifies, or corrects factual claims. Post only
 * claims you have verified yourself.
 *
 * Sensitive-claim handling: if any item's myth/fact text matches a
 * health, finance, or safety keyword, a VERIFY banner is prepended to the
 * script reminding the creator to check the claims against authoritative
 * sources before posting. The tool still never supplies facts of its own.
 *
 * Fixed banks (sizes documented for QA):
 * - HOOKS: 8 opening hook lines ("{myth}" slot)
 * - MYTH_SETUPS: 6 lines that restate the myth as viewers say it
 * - TRANSITIONS: 6 reveal transition lines
 * - FACT_FRAMES: 6 lines for delivering the user's fact
 * - CTAS: 6 closing CTA lines
 * - SENSITIVE_KEYWORDS: 30 keywords (17 health/safety, 13 finance)
 *
 * Deterministic: picks use a djb2 hash of each item's myth + fact, so the
 * same items always produce the same script.
 *
 * Builder contract: runTool({ items }) where each item is:
 *   { myth: string (required), fact: string (required), source: string (optional) }
 * Item count must be 1–5 (mythCount 1–5).
 *
 * Zero imports, zero network, zero DOM, no Math.random.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MIN_ITEMS = 1;
const MAX_ITEMS = 5;
const MAX_MYTH_LENGTH = 200;
const MAX_FACT_LENGTH = 400;
const MAX_SOURCE_LENGTH = 200;

const HOOKS: readonly string[] = [
  'Nobody wants to hear this, but "{myth}" is a myth.',
  'Stop believing this: "{myth}." Here is what is actually true.',
  'POV: everyone keeps repeating "{myth}" — and it is wrong.',
  '"{myth}" sounds true. It is not. Let me show you.',
  'I used to believe "{myth}" too. Then I checked.',
  'One of the biggest myths online: "{myth}." Time to fix it.',
  'If you believe "{myth}", watch until the end.',
  'Myth alert: "{myth}" keeps going viral, and it is misleading.',
];

const MYTH_SETUPS: readonly string[] = [
  'The myth, as people say it: "{myth}."',
  'Here is the claim doing the rounds: "{myth}."',
  'The internet keeps saying "{myth}" — here is the myth on screen.',
  'Repeat after me — the myth is: "{myth}."',
  'This is the version you have heard a hundred times: "{myth}."',
  'The myth in one line: "{myth}." Read it, remember it — now watch it fall.',
];

const TRANSITIONS: readonly string[] = [
  'Now — here is what is actually true.',
  'Reality check, coming in 3… 2… 1…',
  'And here is where the myth breaks down.',
  'Okay, truth time. No fluff.',
  'Here is the fact that replaces it.',
  'This is the part most videos skip.',
];

const FACT_FRAMES: readonly string[] = [
  'The fact: {fact}.',
  'What is actually true: {fact}.',
  'Verified fact: {fact}.',
  'The real answer: {fact}.',
  'Here is the fact, plain and simple: {fact}.',
  'Corrected version: {fact}.',
];

const CTAS: readonly string[] = [
  'What myth should I bust next? Comment it below.',
  'Share this with someone who still believes the myth.',
  'Follow for one myth busted every week.',
  'Save this before you forget the fact.',
  'Duet this with a myth you believed for years.',
  'Which side were you on — myth or fact? Tell me in the comments.',
];

const VERIFY_BANNER =
  'HONESTY NOTE: This video touches a health, finance, or safety topic. ' +
  'Verify every claim against an authoritative source (official guidelines, ' +
  'published research, or a qualified professional) before posting. This ' +
  'builder never invents facts and cannot verify them for you.';

/** Keywords that flag a health, finance, or safety claim. */
const SENSITIVE_KEYWORDS: readonly string[] = [
  // health / safety (17)
  'health', 'diet', 'vitamin', 'medicine', 'drug', 'cure', 'cancer',
  'weight', 'doctor', 'medical', 'therapy', 'supplement', 'pill',
  'sugar', 'cholesterol', 'heart', 'mental',
  // finance (13)
  'money', 'invest', 'stock', 'crypto', 'loan', 'debt', 'credit',
  'bank', 'income', 'tax', 'finance', 'trading', 'mortgage',
];

function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function fill(template: string, myth: string, fact: string): string {
  return template.split('{myth}').join(myth).split('{fact}').join(fact);
}

function hasSensitiveClaim(text: string): boolean {
  const lower = ' ' + text.toLowerCase() + ' ';
  for (const kw of SENSITIVE_KEYWORDS) {
    if (lower.indexOf(kw) >= 0) return true;
  }
  return false;
}

interface ValidatedItem {
  myth: string;
  fact: string;
  source: string;
}

function validateItem(item: unknown, index: number): ValidatedItem | string {
  const n = index + 1;
  if (item === null || typeof item !== 'object' || Array.isArray(item)) {
    return `Item ${n}: invalid item.`;
  }
  const rec = item as Record<string, unknown>;
  const mythRaw = rec.myth;
  if (typeof mythRaw !== 'string' || mythRaw.trim().length === 0) {
    return `Item ${n}: myth is required — write the claim as viewers say it.`;
  }
  const myth = mythRaw.trim();
  if (myth.length > MAX_MYTH_LENGTH) {
    return `Item ${n}: myth must be ${MAX_MYTH_LENGTH} characters or fewer (one-line claim).`;
  }
  const factRaw = rec.fact;
  if (typeof factRaw !== 'string' || factRaw.trim().length === 0) {
    return `Item ${n}: fact is required — write the verified correction yourself.`;
  }
  const fact = factRaw.trim();
  if (fact.length > MAX_FACT_LENGTH) {
    return `Item ${n}: fact must be ${MAX_FACT_LENGTH} characters or fewer.`;
  }
  const sourceRaw = rec.source;
  const source =
    typeof sourceRaw === 'string' ? sourceRaw.trim().slice(0, MAX_SOURCE_LENGTH) : '';
  return { myth, fact, source };
}

function buildBeats(item: ValidatedItem): string[] {
  const seed = hashString(item.myth + '|' + item.fact);
  const beats: string[] = [
    `HOOK: ${fill(HOOKS[seed % HOOKS.length], item.myth, item.fact)}`,
    `MYTH: ${fill(MYTH_SETUPS[(seed >>> 3) % MYTH_SETUPS.length], item.myth, item.fact)}`,
    `TRANSITION: ${TRANSITIONS[(seed >>> 6) % TRANSITIONS.length]}`,
    `FACT: ${fill(FACT_FRAMES[(seed >>> 9) % FACT_FRAMES.length], item.myth, item.fact)}`,
  ];
  if (item.source.length > 0) {
    beats.push(`SOURCE ON SCREEN: ${item.source}`);
  }
  beats.push(`CTA: ${CTAS[(seed >>> 12) % CTAS.length]}`);
  return beats;
}

export function runTool(args: { items: Record<string, unknown>[] }): RunResult {
  const items = args.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'Add at least one myth/fact pair to build a video.' };
  }
  if (items.length > MAX_ITEMS) {
    return {
      ok: false,
      error: `Max ${MAX_ITEMS} myth/fact pairs per run — you added ${items.length}.`,
    };
  }

  const beats: string[] = [];
  const scripts: string[] = [];
  let sensitive = false;

  for (let i = 0; i < items.length; i++) {
    const parsed = validateItem(items[i], i);
    if (typeof parsed === 'string') {
      return { ok: false, error: parsed };
    }
    const itemBeats = buildBeats(parsed);
    beats.push(`--- PAIR ${i + 1} ---`, ...itemBeats);
    scripts.push(`PAIR ${i + 1}\n` + itemBeats.join('\n'));
    if (hasSensitiveClaim(parsed.myth + ' ' + parsed.fact)) {
      sensitive = true;
    }
  }

  const scriptLines: string[] = [];
  if (sensitive) {
    scriptLines.push(VERIFY_BANNER, '');
  }
  scriptLines.push(scripts.join('\n\n'));

  return {
    ok: true,
    values: {
      script: scriptLines.join('\n'),
      beats,
    },
  };
}
