/**
 * Pinterest Content Calendar Generator — pure logic (tool-365). Zero imports,
 * zero network, zero DOM. (`Date` is a JS language global, not a node: import.)
 *
 * WHAT THIS IS: deterministic calendar assembly. For each week of the
 * requested month it schedules pinsPerWeek pins, spreading them evenly
 * across the week's days. Themes rotate through a fixed 10-theme bank;
 * pin types rotate standard -> idea -> video; seasonal events from a
 * compact in-repo dataset override every 4th pin in months that have one.
 * No AI, no trend data, no market data.
 *
 * THEME BANK: 10 hand-written templates ({niche} placeholder).
 * SEASONAL DATASET: compact subset of 12 events (the full 24-event
 * dataset lives in tool-363's logic). Reviewed 2026-09-30.
 *
 * Inputs: niche (string, required), yearMonth ("YYYY-MM", required),
 *         pinsPerWeek (int 1-21, default 5; >21 is capped at 21 with a note).
 * Edge cases: past month -> error; pin count = pinsPerWeek x weeks.
 * Deterministic: same inputs -> same outputs.
 */

export interface ThemeTemplate {
  theme: string;
  keywordSeed: string;
}

/** Fixed theme bank — 10 templates. Placeholder: {niche}. */
export const THEME_BANK: ThemeTemplate[] = [
  { theme: "{niche} beginner's guide", keywordSeed: "{niche} for beginners" },
  { theme: "{niche} mistakes to avoid", keywordSeed: "{niche} mistakes" },
  { theme: "{niche} tools and resources roundup", keywordSeed: "best {niche} tools" },
  { theme: "{niche} step-by-step tutorial", keywordSeed: "how to {niche}" },
  { theme: "{niche} inspiration gallery", keywordSeed: "{niche} ideas" },
  { theme: "{niche} checklist / printable", keywordSeed: "{niche} checklist" },
  { theme: "{niche} before-and-after", keywordSeed: "{niche} transformation" },
  { theme: "{niche} FAQ answered", keywordSeed: "{niche} faq" },
  { theme: "{niche} budget-friendly ideas", keywordSeed: "cheap {niche} ideas" },
  { theme: "{niche} trends to try this month", keywordSeed: "{niche} trends" },
];

export const THEME_BANK_SIZE = 10;

export interface SeasonalEntry {
  name: string;
  months: number[];
  angleTemplate: string;
  keywordSeeds: string;
}

/**
 * Compact seasonal subset — 12 events. Full 24-event dataset lives in
 * tool-363 (pinterest-seasonal-content-planner). Reviewed 2026-09-30.
 */
export const SEASONAL_SUBSET: SeasonalEntry[] = [
  { name: "New Year", months: [1], angleTemplate: "{niche} new-year reset guide", keywordSeeds: "new year {niche} goals" },
  { name: "Valentine's Day", months: [2], angleTemplate: "{niche} Valentine's gift ideas", keywordSeeds: "valentine's day {niche} gifts" },
  { name: "Easter", months: [4], angleTemplate: "{niche} Easter hosting ideas", keywordSeeds: "easter {niche} ideas" },
  { name: "Mother's Day", months: [5], angleTemplate: "{niche} Mother's Day gift guide", keywordSeeds: "mother's day {niche} gifts" },
  { name: "Father's Day", months: [6], angleTemplate: "{niche} Father's Day gift guide", keywordSeeds: "father's day {niche} gifts" },
  { name: "Summer Travel", months: [6, 7], angleTemplate: "{niche} summer travel guide", keywordSeeds: "summer {niche} travel" },
  { name: "4th of July", months: [7], angleTemplate: "{niche} 4th of July party ideas", keywordSeeds: "4th of july {niche}" },
  { name: "Back to School", months: [8], angleTemplate: "{niche} back-to-school guide", keywordSeeds: "back to school {niche}" },
  { name: "Halloween", months: [10], angleTemplate: "{niche} Halloween ideas", keywordSeeds: "halloween {niche}" },
  { name: "Thanksgiving", months: [11], angleTemplate: "{niche} Thanksgiving hosting guide", keywordSeeds: "thanksgiving {niche}" },
  { name: "Black Friday", months: [11], angleTemplate: "{niche} holiday deal guide", keywordSeeds: "black friday {niche} deals" },
  { name: "Christmas", months: [12], angleTemplate: "{niche} Christmas gift & decor guide", keywordSeeds: "christmas {niche} gifts" },
];

export const SEASONAL_SUBSET_SIZE = 12;

/** Pin types rotate in this fixed order. */
export const PIN_TYPE_ROTATION = ["standard", "idea", "video"];

/** Default and max pins per week. */
export const DEFAULT_PINS_PER_WEEK = 5;
export const MAX_PINS_PER_WEEK = 21;

/** Every Nth pin in a seasonal month is replaced by a seasonal angle. */
export const SEASONAL_EVERY_NTH = 4;

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function weekdayName(year: number, month: number, day: number): string {
  return WEEKDAYS[new Date(year, month - 1, day).getDay()];
}

function fill(template: string, niche: string): string {
  return template.split("{niche}").join(niche);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function parseYearMonth(v: unknown): { year: number; month: number } | null {
  if (typeof v !== "string") return null;
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(v.trim());
  if (!m) return null;
  return { year: parseInt(m[1], 10), month: parseInt(m[2], 10) };
}

export function isPastMonth(year: number, month: number): boolean {
  const now = new Date();
  return year * 12 + month < now.getFullYear() * 12 + (now.getMonth() + 1);
}

export interface CalendarValues {
  ok: boolean;
  values?: {
    calendar: { columns: string[]; rows: string[][] };
    pinCount: number;
    monthUsed: string;
    scheduleNote: string;
  };
  error?: string;
}

export function runTool(values: Record<string, unknown>): CalendarValues {
  const nicheRaw = values["niche"];
  if (!isNonEmptyString(nicheRaw)) {
    return { ok: false, error: "Please enter your niche (e.g. home decor, keto recipes)." };
  }
  const niche = nicheRaw.trim();

  const parsed = parseYearMonth(values["yearMonth"]);
  if (!parsed) {
    return { ok: false, error: "Please enter the month as YYYY-MM (e.g. 2026-11)." };
  }
  if (isPastMonth(parsed.year, parsed.month)) {
    return { ok: false, error: "That month is in the past — please pick the current or a future month." };
  }

  let pinsPerWeek = DEFAULT_PINS_PER_WEEK;
  let capped = false;
  let requested: number | null = null;
  const ppwRaw = values["pinsPerWeek"];
  if (ppwRaw !== undefined && ppwRaw !== null && ppwRaw !== "") {
    if (typeof ppwRaw !== "number" || Number.isNaN(ppwRaw) || !Number.isInteger(ppwRaw)) {
      return { ok: false, error: "Pins per week must be a whole number." };
    }
    if (ppwRaw < 1) {
      return { ok: false, error: "Pins per week must be at least 1." };
    }
    requested = ppwRaw;
    if (ppwRaw > MAX_PINS_PER_WEEK) {
      pinsPerWeek = MAX_PINS_PER_WEEK;
      capped = true;
    } else {
      pinsPerWeek = ppwRaw;
    }
  }

  const { year, month } = parsed;
  const totalDays = daysInMonth(year, month);
  const seasonal = SEASONAL_SUBSET.filter((e) => e.months.includes(month));

  const rows: string[][] = [];
  let pinIndex = 0;
  let seasonalIndex = 0;
  const weekCount = Math.ceil(totalDays / 7);

  for (let w = 0; w < weekCount; w++) {
    const weekStart = w * 7 + 1;
    const weekEnd = Math.min(weekStart + 6, totalDays);
    const daysInWeek = weekEnd - weekStart + 1;
    for (let i = 0; i < pinsPerWeek; i++) {
      const day = weekStart + Math.floor((i * daysInWeek) / pinsPerWeek);
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const label = `${dateStr} (${weekdayName(year, month, day)})`;

      let theme: string;
      let keywordSeed: string;
      if (seasonal.length > 0 && pinIndex % SEASONAL_EVERY_NTH === SEASONAL_EVERY_NTH - 1) {
        const ev = seasonal[seasonalIndex % seasonal.length];
        seasonalIndex++;
        theme = `[Seasonal: ${ev.name}] ${fill(ev.angleTemplate, niche)}`;
        keywordSeed = fill(ev.keywordSeeds, niche);
      } else {
        const t = THEME_BANK[pinIndex % THEME_BANK.length];
        theme = fill(t.theme, niche);
        keywordSeed = fill(t.keywordSeed, niche);
      }
      const pinType = PIN_TYPE_ROTATION[pinIndex % PIN_TYPE_ROTATION.length];
      rows.push([label, theme, pinType, keywordSeed]);
      pinIndex++;
    }
  }

  const monthUsed = `${year}-${String(month).padStart(2, "0")}`;
  const capNote = capped
    ? ` You asked for ${requested} pins/week, which was capped at ${MAX_PINS_PER_WEEK} (the maximum).`
    : "";
  const seasonalNote =
    seasonal.length > 0
      ? ` Seasonal events merged from the in-repo dataset (${SEASONAL_SUBSET_SIZE} events): ${seasonal.map((e) => e.name).join(", ")}.`
      : " No seasonal events in the dataset for this month — all pins use the theme rotation.";

  return {
    ok: true,
    values: {
      calendar: { columns: ["Date", "Theme", "Pin type", "Keyword seed"], rows },
      pinCount: rows.length,
      monthUsed,
      scheduleNote:
        `Calendar for ${monthUsed}: ${weekCount} week(s) x ${pinsPerWeek} pins/week = ${rows.length} pins. ` +
        `Themes rotate through a fixed ${THEME_BANK_SIZE}-theme bank; pin types rotate standard -> idea -> video.` +
        seasonalNote + capNote + " No AI involved.",
    },
  };
}
