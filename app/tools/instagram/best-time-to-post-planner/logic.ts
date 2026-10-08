/**
 * Best Time to Post Planner — pure logic (tool-244), zero imports, zero
 * network, zero DOM.
 *
 * RULE ENGINE, NOT LIVE DATA: suggests generic posting windows from fixed
 * region tables. This tool has NO access to Instagram Insights and cannot
 * know any account's real best time — every slot below is a generic
 * rule-of-thumb pattern, labeled as such. Times are expressed in the
 * audience's local time AND converted to the user's selected timezone
 * using fixed standard UTC offsets (daylight saving is ignored — see
 * assumptions).
 *
 * Region tables: 8 regions x 6 slots each = 48 slots. Slot patterns are
 * generic (lunch-break scroll, evening unwind, etc.), not measured data.
 *
 * Deterministic: same inputs -> same outputs, always.
 */

export const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type DayId = (typeof DAYS)[number];

export const REGIONS = [
  "North America",
  "Europe",
  "UK & Ireland",
  "Latin America",
  "Middle East",
  "Asia Pacific",
  "Africa",
  "Global / not sure",
] as const;

export type RegionId = (typeof REGIONS)[number];

/** Fixed select options for user timezone (standard UTC offsets). */
export const TIMEZONE_OPTIONS = [
  "UTC-8", "UTC-7", "UTC-6", "UTC-5", "UTC-4", "UTC-3",
  "UTC-2", "UTC-1", "UTC+0", "UTC+1", "UTC+2", "UTC+3",
  "UTC+4", "UTC+5", "UTC+6", "UTC+7", "UTC+8", "UTC+9",
  "UTC+10", "UTC+11", "UTC+12",
] as const;

/** Standard-time reference offset per region (hours from UTC). */
const REGION_OFFSETS: Record<RegionId, number> = {
  "North America": -5,
  "Europe": 1,
  "UK & Ireland": 0,
  "Latin America": -3,
  "Middle East": 3,
  "Asia Pacific": 8,
  "Africa": 1,
  "Global / not sure": 0,
};

export type SlotPattern = "lunch" | "morning" | "evening" | "generic";

interface RegionSlot {
  day: DayId;
  startHour: number; // audience-local, decimal hours
  endHour: number;   // audience-local, decimal hours
  pattern: Exclude<SlotPattern, "generic">;
}

const PATTERN_RATIONALES: Record<SlotPattern, string> = {
  lunch: "Lunch-break scroll — a commonly observed midday activity window.",
  morning: "Morning routine scroll — people often check phones before the workday.",
  evening: "Evening unwind — typically the highest leisure-screen-time window.",
  generic: "Generic midday slot — no region-specific pattern listed for this day; test it against your own Insights.",
};

/**
 * Generic slot tables per region — 6 slots each (48 total). These are
 * rules of thumb about typical daily routines, NOT measured audience
 * data for any account.
 */
const REGION_SLOTS: Record<RegionId, RegionSlot[]> = {
  "North America": [
    { day: "monday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "tuesday", startHour: 11, endHour: 13, pattern: "lunch" },
    { day: "wednesday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "thursday", startHour: 19, endHour: 21, pattern: "evening" },
    { day: "friday", startHour: 10, endHour: 12, pattern: "morning" },
    { day: "sunday", startHour: 19, endHour: 21, pattern: "evening" },
  ],
  "Europe": [
    { day: "monday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "tuesday", startHour: 9, endHour: 11, pattern: "morning" },
    { day: "wednesday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "thursday", startHour: 19, endHour: 21, pattern: "evening" },
    { day: "friday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "saturday", startHour: 10, endHour: 12, pattern: "morning" },
  ],
  "UK & Ireland": [
    { day: "monday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "tuesday", startHour: 18, endHour: 20, pattern: "evening" },
    { day: "wednesday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "thursday", startHour: 19, endHour: 21, pattern: "evening" },
    { day: "friday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "sunday", startHour: 18, endHour: 20, pattern: "evening" },
  ],
  "Latin America": [
    { day: "monday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "tuesday", startHour: 19, endHour: 21, pattern: "evening" },
    { day: "wednesday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "thursday", startHour: 19, endHour: 21, pattern: "evening" },
    { day: "friday", startHour: 18, endHour: 20, pattern: "evening" },
    { day: "saturday", startHour: 11, endHour: 13, pattern: "lunch" },
  ],
  "Middle East": [
    { day: "sunday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "monday", startHour: 19, endHour: 21, pattern: "evening" },
    { day: "tuesday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "wednesday", startHour: 19, endHour: 21, pattern: "evening" },
    { day: "thursday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "saturday", startHour: 18, endHour: 20, pattern: "evening" },
  ],
  "Asia Pacific": [
    { day: "monday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "tuesday", startHour: 19, endHour: 21, pattern: "evening" },
    { day: "wednesday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "thursday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "friday", startHour: 19, endHour: 21, pattern: "evening" },
    { day: "saturday", startHour: 10, endHour: 12, pattern: "morning" },
  ],
  "Africa": [
    { day: "monday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "tuesday", startHour: 19, endHour: 21, pattern: "evening" },
    { day: "wednesday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "thursday", startHour: 19, endHour: 21, pattern: "evening" },
    { day: "friday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "saturday", startHour: 10, endHour: 12, pattern: "morning" },
  ],
  "Global / not sure": [
    { day: "monday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "wednesday", startHour: 12, endHour: 13.5, pattern: "lunch" },
    { day: "thursday", startHour: 19, endHour: 21, pattern: "evening" },
    { day: "friday", startHour: 10, endHour: 12, pattern: "morning" },
    { day: "saturday", startHour: 10, endHour: 12, pattern: "morning" },
    { day: "sunday", startHour: 19, endHour: 21, pattern: "evening" },
  ],
};

export const BANK_SIZES = {
  regions: REGIONS.length,
  slotsPerRegion: REGION_SLOTS["North America"].length,
  totalSlots: REGIONS.length * REGION_SLOTS["North America"].length,
};

export interface PostingSlot {
  day: DayId;
  /** Window in the audience's local time, e.g. "12:00–13:30". */
  audienceWindow: string;
  /** Same window converted to the user's timezone, e.g. "09:00–10:30". */
  yourWindow: string;
  userTimezone: string;
  rationale: string;
  generic: boolean;
}

export interface PostingPlan {
  region: RegionId;
  userTimezone: string;
  days: DayId[];
  slots: PostingSlot[];
  disclaimer: string;
  /** Always true — reminds consumers these are generic rules, not data. */
  isTemplateBased: true;
}

export const DISCLAIMER =
  "Generic guidance only: this planner has no access to your Instagram Insights, so it cannot know your audience's real active hours. " +
  "Slots are rules of thumb in your audience's local time, converted to your selected timezone using fixed standard UTC offsets (daylight saving is ignored). " +
  "Always confirm with your own Insights data before fixing a schedule.";

export const ASSUMPTIONS: string[] = [
  "No live data: the tool cannot read your Instagram Insights and does not know when your followers are actually online.",
  "Times are generic daily-routine patterns, not measured engagement data for any region or account.",
  "Timezone conversion uses fixed standard UTC offsets and ignores daylight saving time — shift windows by an hour yourself when DST applies.",
];

const DAY_LABELS: Record<DayId, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

function formatHour(h: number): string {
  const wrapped = ((h % 24) + 24) % 24;
  const hh = Math.floor(wrapped);
  const mm = wrapped - hh >= 0.5 ? "30" : "00";
  return `${String(hh).padStart(2, "0")}:${mm}`;
}

function formatWindow(startHour: number, endHour: number): string {
  return `${formatHour(startHour)}–${formatHour(endHour)}`;
}

/** Shift a day by `delta` days (wraps the week). */
function shiftDay(day: DayId, delta: number): DayId {
  const i = DAYS.indexOf(day);
  return DAYS[((i + delta) % 7 + 7) % 7];
}

function isRegion(s: string): s is RegionId {
  return (REGIONS as readonly string[]).includes(s);
}

function parseUtcOffset(label: string): number | null {
  const m = /^UTC([+-])(\d{1,2})$/.exec(label.trim());
  if (!m) return null;
  const n = Number(m[2]);
  return m[1] === "+" ? n : -n;
}

export function dayEnabled(values: Record<string, unknown>, day: DayId): boolean {
  const raw = values[day];
  if (raw === undefined || raw === null) return true; // default: all days
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") return raw.trim().toLowerCase() === "true";
  return Boolean(raw);
}

/**
 * Build the posting plan. Throws on invalid input with human messages.
 */
export function planPostingTimes(
  regionRaw: unknown,
  timezoneRaw: unknown,
  values: Record<string, unknown>
): PostingPlan {
  if (typeof regionRaw !== "string" || regionRaw.trim().length === 0) {
    throw new Error("Please choose your audience region from the list.");
  }
  const region = regionRaw.trim();
  if (!isRegion(region)) {
    throw new Error(`Unknown region "${regionRaw}". Valid regions: ${REGIONS.join(", ")}.`);
  }

  if (typeof timezoneRaw !== "string" || timezoneRaw.trim().length === 0) {
    throw new Error("Please choose your timezone from the list.");
  }
  const userTimezone = timezoneRaw.trim();
  if (!(TIMEZONE_OPTIONS as readonly string[]).includes(userTimezone)) {
    throw new Error("Please choose a valid timezone from the list.");
  }
  const userOffset = parseUtcOffset(userTimezone) as number;
  const regionOffset = REGION_OFFSETS[region];
  const shift = userOffset - regionOffset;

  const days = DAYS.filter((d) => dayEnabled(values, d));
  if (days.length === 0) {
    throw new Error("Select at least one day you can post — all 7 days are off.");
  }

  const slots: PostingSlot[] = [];
  for (const day of days) {
    const regionSlots = REGION_SLOTS[region].filter((s) => s.day === day);
    if (regionSlots.length > 0) {
      for (const s of regionSlots) {
        const startShifted = s.startHour + shift;
        // If the converted start crosses midnight, move the day label.
        const dayDelta = startShifted < 0 ? -1 : startShifted >= 24 ? 1 : 0;
        slots.push({
          day: shiftDay(day, dayDelta),
          audienceWindow: formatWindow(s.startHour, s.endHour),
          yourWindow: formatWindow(s.startHour + shift, s.endHour + shift),
          userTimezone,
          rationale: PATTERN_RATIONALES[s.pattern],
          generic: false,
        });
      }
    } else {
      // No region-specific slot for this day: generic midday fallback.
      slots.push({
        day,
        audienceWindow: formatWindow(12, 13),
        yourWindow: formatWindow(12 + shift, 13 + shift),
        userTimezone,
        rationale: PATTERN_RATIONALES.generic,
        generic: true,
      });
    }
  }

  return {
    region,
    userTimezone,
    days,
    slots,
    disclaimer: DISCLAIMER,
    isTemplateBased: true,
  };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Platform entry point. values: { audienceRegion, userTimezone,
 * monday..sunday (booleans, optional — default true) }.
 * Returns { suggestedSlots: string[], disclaimerNoLiveData: string }.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  try {
    const plan = planPostingTimes(values["audienceRegion"], values["userTimezone"], values);
    return {
      ok: true,
      values: {
        suggestedSlots: plan.slots.map(
          (s) =>
            `${DAY_LABELS[s.day]} · audience ${s.audienceWindow} → your ${s.yourWindow} (${s.userTimezone}) — ${s.rationale}`
        ),
        disclaimerNoLiveData: plan.disclaimer,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
