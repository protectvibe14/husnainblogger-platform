/**
 * Giveaway Winner Picker — pure logic (tool-130), zero imports,
 * zero network, zero DOM.
 *
 * HONESTY:
 * - Entries are PASTED MANUALLY (one per line). This tool cannot pull
 *   comments or entries from YouTube — there is no YouTube API integration.
 * - The draw is a SEEDED, DETERMINISTIC random pick over the entered
 *   entries. Provide a seed (any text, e.g. "episode-42") to make the draw
 *   reproducible and auditable; leave it blank and a seed is derived from
 *   the entries themselves. Same entries + same seed -> same winners, always.
 * - No Math.random is used anywhere; randomness comes from a mulberry32
 *   PRNG seeded by an FNV-1a hash of the seed string. It is a fair uniform
 *   shuffle of the entry list — suitable for casual giveaways, NOT for
 *   regulated lotteries.
 * - The tool embeds a contest-policy compliance checklist in its output,
 *   but it does NOT make a giveaway compliant by itself: the creator is
 *   responsible for official rules and legal compliance.
 */

export const MIN_ENTRIES = 2;
export const MAX_ENTRIES = 5000;

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** FNV-1a 32-bit hash — deterministic string -> uint32 seed. */
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — small seeded PRNG. Deterministic for a given seed. */
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

/** Fisher-Yates shuffle using the seeded PRNG (does not mutate input). */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = items.slice();
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function asText(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function parseWinnerCount(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return 1;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

const COMPLIANCE: string[] = [
  'Publish official rules for your giveaway (who can enter, entry period, prize, how winners are picked) — YouTube requires written rules.',
  'You, the creator, are responsible for running the giveaway fairly and legally — this tool does not make your giveaway compliant.',
  'State clearly that the giveaway is not sponsored, endorsed, or administered by YouTube.',
  'Check your local laws: some regions regulate giveaways, sweepstakes and lotteries strictly.',
  'This tool performs a casual, client-side random draw — it is not suitable for regulated lotteries or high-stakes contests.',
];

export function runTool(values: Record<string, unknown>): RunResult {
  const rawEntries = asText(values['entries']);
  if (!rawEntries) {
    return { ok: false, error: 'Paste your entries, one per line.' };
  }

  const dedupe = values['dedupe'] === undefined || values['dedupe'] === null
    ? true
    : values['dedupe'] === true || String(values['dedupe']).toLowerCase() === 'true';

  const rawLines = rawEntries.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const entries: string[] = [];
  if (dedupe) {
    const seen = new Set<string>();
    for (const line of rawLines) {
      const key = line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        entries.push(line);
      }
    }
  } else {
    entries.push(...rawLines);
  }

  if (entries.length > MAX_ENTRIES) {
    return { ok: false, error: `Too many entries: the picker handles up to ${MAX_ENTRIES} per draw.` };
  }
  if (entries.length < MIN_ENTRIES) {
    return { ok: false, error: `Add at least ${MIN_ENTRIES} entries to run a draw.` };
  }

  const winnerCount = parseWinnerCount(values['winnerCount']);
  if (winnerCount === null) return { ok: false, error: 'Winner count must be a whole number.' };
  if (winnerCount < 1) return { ok: false, error: 'Winner count must be at least 1.' };
  if (winnerCount > entries.length) {
    return {
      ok: false,
      error: `Winner count (${winnerCount}) cannot exceed the number of entries (${entries.length}).`,
    };
  }

  const seedText = asText(values['seed']);
  const effectiveSeed = seedText || entries.join('\n');
  const seedNum = fnv1a(effectiveSeed);

  const shuffled = seededShuffle(entries, seedNum);
  const winners = shuffled.slice(0, winnerCount);

  const audit = entries.map((e) => `Entry: ${e}`);

  const summary =
    `Drew ${winnerCount} winner${winnerCount === 1 ? '' : 's'} from ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}` +
    (dedupe ? ' (duplicates removed)' : ' (duplicates kept)') +
    `. Seed: "${seedText || '(auto-derived from entries)'}".`;

  return {
    ok: true,
    values: {
      winners: winners.map((w, i) => `Winner ${i + 1}: ${w}`),
      audit,
      compliance: COMPLIANCE.slice(),
      summary,
    },
  };
}
