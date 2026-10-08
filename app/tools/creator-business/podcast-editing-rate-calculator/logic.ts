/**
 * Podcast Editing Rate Calculator — pure logic (tool-475).
 *
 * ZERO imports, zero network, zero DOM. Deterministic arithmetic only.
 *
 * Distinct from tool-082 (Podcast Sponsorship Rate Calculator), which prices
 * ad slots — this tool prices editing LABOR only.
 *
 * HONESTY: every number is USER-PROVIDED. The editing-hours-per-finished-hour
 * multiplier, the hourly rate, and every add-on price are yours — the tool
 * knows no market rates, no "typical" podcast editing prices, and no platform
 * averages. Results are ESTIMATES from your own inputs:
 *
 *   editHours              = (episodeMinutes / 60) * editMultiplier
 *   laborCost              = editHours * hourlyRate
 *   addOnTotal             = sum of the add-on prices the user entered
 *                            (0 = that add-on is not included)
 *   perEpisodePrice        = laborCost + addOnTotal
 *   monthlyRetainerEstimate = perEpisodePrice * episodesPerMonth
 *
 * Money values round to the nearest cent (half-up).
 */

const ADD_ONS = [
  { key: "addOnShowNotesPrice", label: "Show notes" },
  { key: "addOnAudiogramPrice", label: "Audiogram" },
  { key: "addOnChaptersPrice", label: "Chapters" },
] as const;

/** Round to the nearest cent, half-up. */
function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseNumber(
  name: string,
  value: unknown,
  opts: { min: number; minExclusive?: boolean }
): { ok: true; value: number } | { ok: false; error: string } {
  if (value === undefined || value === null) {
    return { ok: false, error: `${name} is required.` };
  }
  let n: number;
  if (typeof value === "number") {
    n = value;
  } else if (typeof value === "string") {
    if (value.trim() === "") {
      return { ok: false, error: `${name} is required.` };
    }
    n = Number(value.trim());
  } else {
    return { ok: false, error: `${name} must be a number (got ${typeof value}).` };
  }
  if (Number.isNaN(n) || !Number.isFinite(n)) {
    return { ok: false, error: `${name} must be a finite number.` };
  }
  if (opts.minExclusive ? n <= opts.min : n < opts.min) {
    return {
      ok: false,
      error: `${name} must be ${opts.minExclusive ? "greater than" : "at least"} ${opts.min}.`,
    };
  }
  return { ok: true, value: n };
}

export interface PodcastEditingValues {
  /** Per-episode price, rounded to cents (ESTIMATE). */
  perEpisodePrice: number;
  /** Retainer estimate: perEpisodePrice × episodesPerMonth (ESTIMATE). */
  monthlyRetainerEstimate: number;
  /** Add-ons included (price > 0), for transparency. */
  addOnsIncluded: Array<{ label: string; price: number }>;
}

export interface PodcastEditingResult {
  ok: boolean;
  values?: PodcastEditingValues;
  error?: string;
}

/**
 * Calculate podcast editing pricing from the user's own inputs.
 *
 * Expected keys in `values`:
 *   episodeMinutes (number > 0), editMultiplier (number >= 0),
 *   hourlyRate (number >= 0), episodesPerMonth (number >= 0),
 *   addOnShowNotesPrice / addOnAudiogramPrice / addOnChaptersPrice
 *   (number >= 0; 0 means the add-on is not included).
 */
export function runTool(values: Record<string, unknown>): PodcastEditingResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Input must be an object." };
  }

  const minutes = parseNumber("episodeMinutes", values.episodeMinutes, {
    min: 0,
    minExclusive: true,
  });
  if (!minutes.ok) return { ok: false, error: minutes.error };

  const multiplier = parseNumber("editMultiplier", values.editMultiplier, { min: 0 });
  if (!multiplier.ok) return { ok: false, error: multiplier.error };

  const rate = parseNumber("hourlyRate", values.hourlyRate, { min: 0 });
  if (!rate.ok) return { ok: false, error: rate.error };

  const episodes = parseNumber("episodesPerMonth", values.episodesPerMonth, { min: 0 });
  if (!episodes.ok) return { ok: false, error: episodes.error };

  const addOnsIncluded: Array<{ label: string; price: number }> = [];
  let addOnTotal = 0;
  for (const addOn of ADD_ONS) {
    const p = parseNumber(addOn.key, values[addOn.key], { min: 0 });
    if (!p.ok) return { ok: false, error: p.error };
    const price = roundToCents(p.value);
    if (price > 0) {
      addOnsIncluded.push({ label: addOn.label, price });
      addOnTotal += price;
    }
  }

  const editHours = (minutes.value / 60) * multiplier.value;
  const laborCost = editHours * rate.value;
  const perEpisodePrice = roundToCents(laborCost + addOnTotal);
  const monthlyRetainerEstimate = roundToCents(perEpisodePrice * episodes.value);

  return {
    ok: true,
    values: { perEpisodePrice, monthlyRetainerEstimate, addOnsIncluded },
  };
}
