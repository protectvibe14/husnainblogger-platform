/**
 * Ideogram Logo Prompt Builder — pure logic (tool-530), zero imports, zero
 * network, zero DOM.
 *
 * HONESTY CONTRACT: this builds PROMPT TEXT from fixed templates. It does
 * NOT generate logos, does NOT call Ideogram, and no AI model is involved.
 * Text rendering quality varies by image tool — the output says so plainly.
 *
 * Template banks (documented sizes):
 *  - STYLES: 5 entries -> style descriptor fragment
 *  - VARIATION_TEMPLATES: 3 entries -> one variation prompt each
 *  - NEGATIVE_PROMPT: 1 fixed line
 */

/** 5 styles -> descriptor fragment. */
export const STYLES: Record<string, string> = {
  minimalist: "minimalist flat vector logo, clean lines, generous negative space",
  mascot: "friendly mascot logo, bold cartoon shapes, cheerful expression",
  vintage: "vintage badge logo, retro typography, subtle distressed texture",
  geometric: "geometric abstract logo, sharp shapes, modern symmetry",
  wordmark: "elegant wordmark logo, custom lettering, refined spacing",
};

/** 3 fixed variation templates; "{prompt}" is the base logo prompt. */
export const VARIATION_TEMPLATES: string[] = [
  "{prompt}, icon only, no text, app-icon style",
  "{prompt}, monochrome black on white, single color version",
  "{prompt}, horizontal lockup, icon left of wordmark, wide composition",
];

/** One fixed negative-prompt line. */
export const NEGATIVE_PROMPT =
  "photorealistic, photo, 3d render, blurry, distorted text, misspelled words, watermark, busy background, cluttered";

export const MAX_FIELD_LENGTH = 100;

export interface LogoPromptResult {
  brandName: string;
  logoPrompt: string;
  negativePrompt: string;
  variations: string[];
}

export function cleanField(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\bwww\.\S+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateStyle(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(STYLES, key) ? key : null;
}

/**
 * Deterministically build the logo prompt and its 3 variations.
 * Same inputs -> same output.
 */
export function buildLogoPrompt(
  brandName: string,
  industry: string,
  styleKey: string,
  colors: string,
  tagline: string,
): LogoPromptResult {
  const taglinePart = tagline.length > 0 ? `, tagline "${tagline}"` : "";
  const logoPrompt =
    `Logo for "${brandName}", a ${industry} brand, ${STYLES[styleKey]}, ` +
    `color palette: ${colors}${taglinePart}, ` +
    `crisp legible text, professional branding, white background`;
  const variations = VARIATION_TEMPLATES.map((t) =>
    t.replace("{prompt}", logoPrompt),
  );
  return { brandName, logoPrompt, negativePrompt: NEGATIVE_PROMPT, variations };
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.brandName/values.industry/values.colors: strings, required,
 * 2-100 chars after cleaning. values.tagline: optional string.
 * values.style: one of STYLES keys.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const fields: Record<string, string> = {};
  for (const id of ["brandName", "industry", "colors"] as const) {
    const raw = values[id];
    if (typeof raw !== "string" || cleanField(raw).length < 2) {
      const labels: Record<string, string> = {
        brandName: "brand name",
        industry: "industry",
        colors: "colors",
      };
      return { ok: false, error: `Please enter the ${labels[id]} (2+ characters).` };
    }
    const cleaned = cleanField(raw);
    if (cleaned.length > MAX_FIELD_LENGTH) {
      return {
        ok: false,
        error: `Each field must be ${MAX_FIELD_LENGTH} characters or fewer.`,
      };
    }
    fields[id] = cleaned;
  }

  const rawTagline = values["tagline"];
  const tagline =
    typeof rawTagline === "string" ? cleanField(rawTagline).slice(0, MAX_FIELD_LENGTH) : "";

  const style = validateStyle(values["style"]);
  if (!style) {
    return {
      ok: false,
      error: `Style must be one of: ${Object.keys(STYLES).join(", ")}.`,
    };
  }

  const r = buildLogoPrompt(
    fields["brandName"],
    fields["industry"],
    style,
    fields["colors"],
    tagline,
  );
  return {
    ok: true,
    values: {
      logoPrompt: r.logoPrompt,
      negativePrompt: r.negativePrompt,
      variations: r.variations,
      note: "Paste into Ideogram — text rendering varies by tool; regenerate until the spelling is right.",
    },
  };
}
