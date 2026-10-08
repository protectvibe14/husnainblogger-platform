/**
 * Email Send-Time Planner — pure logic (tool-440).
 *
 * HONESTY-CRITICAL: the "best time" bands below are COMMONLY-CITED GENERAL
 * GUIDANCE, not verified open-rate facts. The tool never presents specific
 * open-rate percentages and never claims research-backed optimal times.
 * Every band is labeled "general guidance" in the outputs, the methodology,
 * the assumptions, and the FAQs. What the tool DOES compute honestly is
 * timezone conversion — pure date math via the runtime's Intl API (no
 * network, no DOM).
 *
 * Fixed, documented rule set:
 * - 4 audience-local time bands (guidance only): morning 8–10 AM, midday
 *   11 AM–1 PM, afternoon 2–4 PM, early evening 5–7 PM.
 * - Send days rotate Tue → Wed → Thu (commonly-cited guidance, labeled).
 * - Slot counts by cadence: weekly → 4 slots (Week 1–4); biweekly → 3 slots
 *   (Week 1, 3, 5); monthly → 3 slots (Month 1, 2, 3).
 * - Timezone offsets are computed for ONE FIXED reference instant
 *   (2026-10-01T12:00:00Z) so the tool is deterministic; daylight-saving
 *   shifts can move real conversions by an hour — the outputs say so.
 *
 * Deterministic: same inputs → identical output, always. No Math.random,
 * no Date.now, no network.
 */

export const CADENCES = ['weekly', 'biweekly', 'monthly'] as const;

/** Fixed reference instant for offset math (deterministic; DST caveat labeled). */
export const REF_EPOCH_MS = Date.UTC(2026, 9, 1, 12, 0, 0);
export const REF_DATE_LABEL = '2026-10-01';

/** 4 time bands — commonly-cited GENERAL GUIDANCE, not measured facts. */
export const BANDS = [
  { id: 'morning', label: 'Morning', window: '8–10 AM', anchorMin: 9 * 60 },
  { id: 'midday', label: 'Midday', window: '11 AM–1 PM', anchorMin: 12 * 60 },
  { id: 'afternoon', label: 'Afternoon', window: '2–4 PM', anchorMin: 15 * 60 },
  { id: 'early-evening', label: 'Early evening', window: '5–7 PM', anchorMin: 18 * 60 },
] as const;

/** Send-day rotation — commonly-cited guidance, labeled as such. */
export const SEND_DAYS = ['Tue', 'Wed', 'Thu'] as const;

const WEEK_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function shiftDay(day: string, delta: number): string {
  const i = WEEK_ORDER.indexOf(day as (typeof WEEK_ORDER)[number]);
  return WEEK_ORDER[(i + delta + 7) % 7];
}

/** Minutes → "h:MM AM/PM". */
export function formatTime(mins: number): string {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** True when the runtime accepts the IANA zone name. */
export function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Offset of `tz` from UTC in minutes, at the fixed reference instant.
 * Pure Intl math — no network.
 */
export function tzOffsetMinutes(tz: string, epochMs: number): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = dtf.formatToParts(new Date(epochMs));
  const get = (t: string): number => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const asUTC = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour') % 24,
    get('minute'),
    get('second'),
  );
  return Math.round((asUTC - epochMs) / 60000);
}

export interface SendSlot {
  periodLabel: string;
  day: string;
  senderLocal: string;
  senderTz: string;
  audienceLocal: string;
  audienceTz: string;
  band: (typeof BANDS)[number];
}

/** Build the deterministic slot plan. */
export function planSlots(
  audienceTz: string,
  senderTz: string,
  cadence: 'weekly' | 'biweekly' | 'monthly',
): SendSlot[] {
  const periodLabels =
    cadence === 'weekly'
      ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      : cadence === 'biweekly'
        ? ['Week 1', 'Week 3', 'Week 5']
        : ['Month 1', 'Month 2', 'Month 3'];

  const offsetA = tzOffsetMinutes(audienceTz, REF_EPOCH_MS);
  const offsetS = tzOffsetMinutes(senderTz, REF_EPOCH_MS);
  const diff = offsetA - offsetS; // minutes to ADD to sender-local to get audience-local

  return periodLabels.map((periodLabel, i) => {
    const band = BANDS[i % BANDS.length];
    const day = SEND_DAYS[i % SEND_DAYS.length];
    // Audience-local anchor → sender-local minutes.
    let senderMin = band.anchorMin - diff;
    let senderDay: string = day;
    if (senderMin < 0) {
      senderMin += 1440;
      senderDay = shiftDay(day, -1);
    } else if (senderMin >= 1440) {
      senderMin -= 1440;
      senderDay = shiftDay(day, 1);
    }
    return {
      periodLabel,
      day,
      senderLocal: `${senderDay} ${formatTime(senderMin)}`,
      senderTz,
      audienceLocal: `${day} ${formatTime(band.anchorMin)}`,
      audienceTz,
      band,
    };
  });
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const { audienceTimezone, senderTimezone, cadence } = values;

  if (typeof audienceTimezone !== 'string' || audienceTimezone.trim().length === 0) {
    return { ok: false, error: 'Please enter the audience timezone (IANA name, e.g. America/New_York).' };
  }
  if (typeof senderTimezone !== 'string' || senderTimezone.trim().length === 0) {
    return { ok: false, error: 'Please enter your (sender) timezone (IANA name, e.g. Europe/London).' };
  }
  const aTz = audienceTimezone.trim();
  const sTz = senderTimezone.trim();
  if (!isValidTimezone(aTz)) {
    return { ok: false, error: `"${aTz}" is not a recognized IANA timezone name.` };
  }
  if (!isValidTimezone(sTz)) {
    return { ok: false, error: `"${sTz}" is not a recognized IANA timezone name.` };
  }
  if (typeof cadence !== 'string' || !(CADENCES as readonly string[]).includes(cadence)) {
    return { ok: false, error: 'Please choose a cadence: weekly, biweekly, or monthly.' };
  }

  const slots = planSlots(aTz, sTz, cadence as 'weekly' | 'biweekly' | 'monthly');
  const sendSlots = slots.map(
    (s) =>
      `${s.periodLabel} — ${s.senderLocal} (${s.senderTz}) → ${s.audienceLocal} (${s.audienceTz}) · ` +
      `${s.band.label} band (${s.band.window} audience-local, general guidance)`,
  );

  const bestBandNote =
    `These time bands are commonly-cited general guidance — not verified open-rate facts for your audience. ` +
    `Your own list's past open data beats any general band, so test and adjust. ` +
    `Conversions use the offset between ${sTz} and ${aTz} as of ${REF_DATE_LABEL} (a fixed reference for consistency); ` +
    `daylight-saving changes can shift real send times by an hour, so double-check for your actual send date.`;

  return { ok: true, values: { sendSlots, bestBandNote } };
}
