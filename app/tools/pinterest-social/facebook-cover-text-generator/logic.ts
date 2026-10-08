/**
 * Facebook Cover Text Generator — pure logic (tool-399), zero imports, zero
 * network, zero DOM.
 *
 * FIXED COPY BANK, NOT AI: returns 5 hand-written cover copy lines with the
 * user's offer inserted. Every line stays at 12 words or fewer (readable at
 * cover scale) — the offer input is limited to 8 words to guarantee this.
 * Per cover type, a fixed safe-zone note is attached. This tool writes TEXT
 * COPY + layout guidance only; it does not render or design any image.
 *
 * Bank: 5 cover-copy templates. Safe-zone notes: 2 (page, group).
 *
 * Deterministic: same inputs -> same outputs, always.
 */

export type CoverType = "page" | "group";

export const COVER_TYPES: CoverType[] = ["page", "group"];
export const DEFAULT_COVER_TYPE: CoverType = "page";
export const MAX_OFFER_WORDS = 8;
export const MAX_COPY_WORDS = 12;
export const TEMPLATE_COUNT = 5;

/** Cover-copy templates — {offer} is the user's offer, inserted verbatim. */
const COVER_COPY_TEMPLATES: string[] = [
  "{offer} — starts now",
  "Big news: {offer}",
  "{offer} — limited time",
  "New here? Try {offer}",
  "{offer} — book today",
];

/** Fixed safe-zone guidance per cover type. */
export const SAFE_ZONE_NOTES: Record<CoverType, string> = {
  page:
    "Page cover (851 x 315 px): keep all text centered and clear of the edges — " +
    "the profile picture overlaps the lower-left and action buttons crop the " +
    "right side. This tool gives text copy only, no image design.",
  group:
    "Group cover (1640 x 856 px): keep all text in the central safe zone — " +
    "mobile crops the sides of the image. This tool gives text copy only, " +
    "no image design.",
};

function isCoverType(s: string): s is CoverType {
  return (COVER_TYPES as readonly string[]).includes(s);
}

function wordCount(s: string): number {
  return s.split(/\s+/).filter((w) => w.length > 0).length;
}

function render(template: string, offer: string): string {
  return template.split("{offer}").join(offer);
}

export interface GenerateCoverResult {
  copy: string[];
  coverType: CoverType;
  safeZoneNote: string;
}

/**
 * Generate cover copy for an offer. Throws on invalid input.
 */
export function generateCoverCopy(offer: string, coverType: string = DEFAULT_COVER_TYPE): GenerateCoverResult {
  if (typeof offer !== "string" || offer.trim().length === 0) {
    throw new Error("Offer is required — e.g. free first haircut, 20% off all plans.");
  }
  const cleanOffer = offer.trim();
  if (wordCount(cleanOffer) > MAX_OFFER_WORDS) {
    throw new Error(
      `Keep your offer under ${MAX_OFFER_WORDS + 1} words so the cover copy stays readable at cover scale.`
    );
  }

  const typeRaw = typeof coverType === "string" ? coverType.trim().toLowerCase() : "";
  const type: CoverType = typeRaw === "" ? DEFAULT_COVER_TYPE : (typeRaw as CoverType);
  if (!isCoverType(type)) {
    throw new Error(`Cover type must be one of: ${COVER_TYPES.join(", ")}.`);
  }

  const copy = COVER_COPY_TEMPLATES.map((t) => render(t, cleanOffer));
  return { copy, coverType: type, safeZoneNote: SAFE_ZONE_NOTES[type] };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Platform entry point (generator). values: { offer, coverType? }. */
export function runTool(values: Record<string, unknown>): RunToolResult {
  try {
    const offer = values["offer"];
    if (typeof offer !== "string" || offer.trim().length === 0) {
      return { ok: false, error: "Offer is required — e.g. free first haircut, 20% off all plans." };
    }
    const coverType = values["coverType"];
    const typeInput =
      coverType === undefined || coverType === null || coverType === ""
        ? DEFAULT_COVER_TYPE
        : coverType;
    if (typeof typeInput !== "string") {
      return { ok: false, error: `Cover type must be one of: ${COVER_TYPES.join(", ")}.` };
    }

    const result = generateCoverCopy(offer, typeInput);
    return {
      ok: true,
      values: {
        coverCopy: result.copy,
        safeZoneNote: result.safeZoneNote,
        count: result.copy.length,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
