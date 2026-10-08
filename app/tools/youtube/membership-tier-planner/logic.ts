/**
 * Membership Tier Planner — pure logic (tool-131), zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is a pricing WORKSHEET, not a revenue predictor. Member
 * counts are the user's own guesses — the tool multiplies them; it cannot
 * know how many members you will actually get.
 *
 * Formula: estimated creator payout per tier = members x price x 0.70.
 * The 70% creator share reflects YouTube's channel membership revenue
 * split policy (platform policy, verified via secondary source — YouTube
 * keeps ~30%). It is labeled as an estimate everywhere.
 *
 * Rules: YouTube allows up to 6 membership levels (verified platform
 * limit) — tierCount is clamped to 1-6. Perk suggestions come from a fixed
 * bank of 12 perks with minimum-price thresholds; they are suggestions
 * from bundled data, not guarantees.
 *
 * Perk bank: 12 perks, each with a fromPrice (USD) threshold. A tier
 * priced at P suggests every perk whose fromPrice <= P.
 *
 * Deterministic: same inputs -> same outputs, always. Money is rounded
 * to whole cents.
 */

export const MIN_TIERS = 1;
export const MAX_TIERS = 6;
/** YouTube channel-membership creator revenue share (platform policy). */
export const CREATOR_SHARE = 0.7;

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

interface Perk {
  perk: string;
  fromPrice: number;
}

/** 12 bundled perk suggestions with minimum-price thresholds (USD). */
const PERK_BANK: Perk[] = [
  { perk: 'Loyalty badges next to your name in comments and live chat', fromPrice: 0.99 },
  { perk: 'Custom emoji pack for live chat and comments', fromPrice: 0.99 },
  { perk: 'Members-only community posts', fromPrice: 1.99 },
  { perk: 'Early access to new videos', fromPrice: 2.99 },
  { perk: 'Members-only live stream each month', fromPrice: 4.99 },
  { perk: 'Behind-the-scenes content', fromPrice: 4.99 },
  { perk: 'Your name in the video credits', fromPrice: 9.99 },
  { perk: 'Vote on upcoming video topics', fromPrice: 9.99 },
  { perk: 'Monthly group hangout / Q&A call', fromPrice: 14.99 },
  { perk: 'Quarterly one-on-one feedback session', fromPrice: 24.99 },
  { perk: 'Exclusive merch discount', fromPrice: 24.99 },
  { perk: 'Personalized shoutout video', fromPrice: 49.99 },
];

function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}

function asText(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function parseTierCount(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

function parsePrice(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n)) return null;
  return n;
}

function parseMembers(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const tierCount = parseTierCount(values['tierCount']);
  if (tierCount === null) return { ok: false, error: 'Enter the number of tiers (1-6).' };
  if (tierCount < MIN_TIERS || tierCount > MAX_TIERS) {
    return { ok: false, error: `YouTube allows ${MIN_TIERS} to ${MAX_TIERS} membership levels.` };
  }

  interface Tier {
    name: string;
    price: number;
    members: number;
    payout: number;
    perks: string[];
  }
  const tiers: Tier[] = [];

  for (let i = 1; i <= tierCount; i++) {
    const name = asText(values[`tier${i}Name`]);
    if (!name) return { ok: false, error: `Tier ${i}: name is required.` };
    if (name.length > 60) return { ok: false, error: `Tier ${i}: name must be 60 characters or fewer.` };

    const price = parsePrice(values[`tier${i}Price`]);
    if (price === null) return { ok: false, error: `Tier ${i}: price is required.` };
    if (price <= 0) return { ok: false, error: `Tier ${i}: price must be greater than 0.` };
    if (price > 100000) return { ok: false, error: `Tier ${i}: price looks unrealistic — keep it under $100,000.` };

    const members = parseMembers(values[`tier${i}Members`]);
    if (members === null) return { ok: false, error: `Tier ${i}: estimated members is required.` };
    if (members < 0) return { ok: false, error: `Tier ${i}: estimated members cannot be negative.` };

    const payout = roundCents(members * price * CREATOR_SHARE);
    const perks = PERK_BANK.filter((p) => p.fromPrice <= price).map((p) => p.perk);
    tiers.push({ name, price: roundCents(price), members, payout, perks });
  }

  const totalRevenue = roundCents(tiers.reduce((sum, t) => sum + t.payout, 0));

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const table = {
    columns: ['Tier', 'Price / month', 'Est. members', 'Est. creator payout / month'],
    rows: tiers.map((t) => [t.name, fmt(t.price), String(t.members), fmt(t.payout)]),
  };

  const perkChecklist = tiers.map(
    (t) =>
      `${t.name} (${fmt(t.price)}): suggested perks — ` +
      (t.perks.length > 0 ? t.perks.join('; ') : '(no bundled perks fit this price)'),
  );

  return {
    ok: true,
    values: {
      tiers: table,
      perkChecklist,
      totalRevenue,
    },
  };
}

/** Exposed for tests: bookkeeping. */
export const PERK_COUNT = PERK_BANK.length;
export function perksForPrice(price: number): string[] {
  return PERK_BANK.filter((p) => p.fromPrice <= price).map((p) => p.perk);
}
