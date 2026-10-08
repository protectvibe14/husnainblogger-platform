/**
 * Newsletter Sponsorship Pitch Generator — pure logic (tool-419).
 *
 * HONESTY / ASSUMPTIONS (also surfaced in meta.ts):
 * - This pitches YOUR newsletter's ad slots TO sponsors (outreach to sell
 *   your own inventory). It is distinct from tool-436, the general
 *   "Sponsorship Pitch Email Generator" for asking a brand to sponsor you.
 * - The pitch email and rate-card snippet are assembled from ONE fixed
 *   email template + ONE fixed rate-card template filled with the stats
 *   YOU provide. It is NOT AI writing.
 * - The tool NEVER invents prices: rate-card lines carry a [YOUR RATE]
 *   placeholder you must fill in, plus [Brand], [First Name], and
 *   [Your Name] placeholders.
 * - Lengths are measured in Unicode code points ([...s].length).
 * - Overlong inputs are truncated WITH a visible notice, never silently.
 *
 * TEMPLATE LIBRARY SIZES:
 * - PITCH_TEMPLATE: 1 fixed email template
 * - RATE_CARD_TEMPLATE: 1 fixed rate-card template
 * - AD_FORMATS: 6 recognized ad formats
 */

export const MAX_NAME_CHARS = 120;
export const MAX_AUDIENCE_CHARS = 200;
export const MAX_SUBSCRIBERS = 1_000_000_000;

/**
 * The 6 ad formats this tool recognizes. Unknown formats are rejected
 * with an error listing these valid options.
 */
export const AD_FORMATS: readonly string[] = [
  "Classified ad",
  "Dedicated email",
  "Sponsored section",
  "Header banner",
  "Footer banner",
  "Primary sponsorship",
];

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

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function truncateCp(
  s: string,
  max: number,
): { text: string; truncated: boolean } {
  const cps = [...s];
  if (cps.length <= max) return { text: s, truncated: false };
  return { text: cps.slice(0, max).join(""), truncated: true };
}

/**
 * Parse the comma-separated ad formats input, validating each entry
 * against AD_FORMATS (case-insensitive). Throws on invalid entries.
 */
export function parseAdFormats(raw: string): string[] {
  const entries = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (entries.length === 0) {
    throw new Error("Please list at least one ad format.");
  }
  const picked: string[] = [];
  for (const entry of entries) {
    const match = AD_FORMATS.find(
      (f) => f.toLowerCase() === entry.toLowerCase(),
    );
    if (!match) {
      throw new Error(
        `Unknown ad format "${entry}". Valid formats: ${AD_FORMATS.join(", ")}.`,
      );
    }
    if (!picked.includes(match)) picked.push(match);
  }
  return picked;
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please provide your newsletter details first." };
  }
  const notices: string[] = [];

  // --- newsletterName (required) ---
  const rawName = values["newsletterName"];
  if (typeof rawName !== "string" || rawName.trim().length === 0) {
    return { ok: false, error: "Please enter your newsletter's name." };
  }
  let name = sanitizePlain(rawName.trim());
  const nameTrunc = truncateCp(name, MAX_NAME_CHARS);
  if (nameTrunc.truncated) {
    notices.push(
      `Newsletter name was shortened to ${MAX_NAME_CHARS} characters; extra text was not used.`,
    );
  }
  name = nameTrunc.text;

  // --- subscribers (required, whole number >= 1) ---
  const rawSubs = values["subscribers"];
  if (typeof rawSubs !== "number" || !Number.isFinite(rawSubs)) {
    return { ok: false, error: "Subscriber count must be a number." };
  }
  if (!Number.isInteger(rawSubs) || rawSubs < 1) {
    return {
      ok: false,
      error: "Subscriber count must be a whole number of at least 1.",
    };
  }
  if (rawSubs > MAX_SUBSCRIBERS) {
    return {
      ok: false,
      error: `Subscriber count looks unrealistic (max ${formatNumber(MAX_SUBSCRIBERS)}).`,
    };
  }
  const subscribers = rawSubs;

  // --- openRate (optional %, 0-100) ---
  let openRate: number | null = null;
  const rawOpen = values["openRate"];
  if (rawOpen !== undefined && rawOpen !== null && rawOpen !== "") {
    if (typeof rawOpen !== "number" || !Number.isFinite(rawOpen)) {
      return { ok: false, error: "Open rate must be a number." };
    }
    if (rawOpen < 0 || rawOpen > 100) {
      return { ok: false, error: "Open rate must be between 0 and 100." };
    }
    openRate = rawOpen;
  }

  // --- audience (required) ---
  const rawAudience = values["audience"];
  if (typeof rawAudience !== "string" || rawAudience.trim().length === 0) {
    return { ok: false, error: "Please describe your newsletter's audience." };
  }
  let audience = sanitizePlain(rawAudience.trim());
  const audTrunc = truncateCp(audience, MAX_AUDIENCE_CHARS);
  if (audTrunc.truncated) {
    notices.push(
      `Audience description was shortened to ${MAX_AUDIENCE_CHARS} characters; extra text was not used.`,
    );
  }
  audience = audTrunc.text;

  // --- adFormats (required, validated against AD_FORMATS) ---
  const rawFormats = values["adFormats"];
  if (typeof rawFormats !== "string" || rawFormats.trim().length === 0) {
    return { ok: false, error: "Please list the ad formats you sell." };
  }
  let formats: string[];
  try {
    formats = parseAdFormats(rawFormats);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid ad formats." };
  }

  // --- assemble the fixed templates ---
  const openClause =
    openRate === null
      ? ""
      : ` and a ${openRate}% open rate (about ${formatNumber(
          Math.round((subscribers * openRate) / 100),
        )} readers open each issue)`;

  const formatBullets = formats
    .map((f) => `• ${f} — [YOUR RATE] per issue`)
    .join("\n");

  const pitchEmail = [
    `Subject: Partnership idea: ${name} × [Brand]`,
    "",
    "Hi [First Name],",
    "",
    `I run ${name} — a newsletter for ${audience} with ${formatNumber(subscribers)} subscribers${openClause}.`,
    "",
    "I'm opening a limited number of ad slots in upcoming issues, and I think your brand would be a strong fit:",
    "",
    formatBullets,
    "",
    "If you're interested, reply to this email and I'll send over the media kit with rates and available dates.",
    "",
    "Best,",
    "[Your Name]",
    name,
  ].join("\n");

  const rateCardSnippet = [
    `${name} — Ad Rate Card (example layout; replace [YOUR RATE] with your prices)`,
    "",
    ...formats.map((f) => `• ${f}: [YOUR RATE] per issue`),
    "",
    `Audience: ${audience} | Subscribers: ${formatNumber(subscribers)}${
      openRate === null ? "" : ` | Open rate: ${openRate}%`
    }`,
  ].join("\n");

  return {
    ok: true,
    values: { pitchEmail, rateCardSnippet, notices },
  };
}
