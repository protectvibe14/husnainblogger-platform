/**
 * Affiliate Disclosure Generator (tool-047) — pure logic (zero imports,
 * zero network, zero DOM).
 *
 * HONESTY CONTRACT: this tool assembles disclosure TEXT TEMPLATES from a
 * FIXED bank — nothing is written by AI and nothing is generated on the
 * fly. Disclosure requirements vary by country (e.g. the US FTC's Endorsement
 * Guides), and this tool provides template wording only: it is NOT legal
 * advice. Users must review the result against the rules in their own
 * jurisdiction.
 *
 * Fixed content bank: 12 disclosure templates =
 *   3 placements (top | inline | bottom)
 * x 2 tones (formal | casual)
 * x 2 variants (program names provided | generic, no names).
 * Documented as TEMPLATE_BANK_SIZE below. The {programs} slot is filled
 * with the user's program names; the {programList} slot is a comma-joined
 * list for the HTML variant. All other wording is fixed.
 *
 * HTML output: the chosen plain-text template escaped and wrapped in
 * <p class="affiliate-disclosure">…</p> — no other markup is produced.
 *
 * Deterministic: same inputs -> same disclosure text, always.
 */

export const TEMPLATE_BANK_SIZE = 12;

export const PLACEMENTS = ["top", "inline", "bottom"] as const;
export const TONES = ["formal", "casual"] as const;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** {programs} = quoted names joined with commas/"and"; HTML-safe via escaping. */
const TEMPLATES: Record<string, string> = {
  "formal|top|named":
    "AFFILIATE DISCLOSURE: Some links on this page are affiliate links to {programs}. If you purchase through them, I may earn a commission at no extra cost to you.",
  "formal|top|generic":
    "AFFILIATE DISCLOSURE: Some links on this page are affiliate links. If you purchase through them, I may earn a commission at no extra cost to you.",
  "formal|inline|named":
    "(This is an affiliate link to {programs} — I may earn a commission if you purchase, at no extra cost to you.)",
  "formal|inline|generic":
    "(Affiliate link — I may earn a commission if you purchase, at no extra cost to you.)",
  "formal|bottom|named":
    "Disclosure: This post contains affiliate links to {programs}. If you click through and make a purchase, I may receive a commission at no additional cost to you. Thank you for your support.",
  "formal|bottom|generic":
    "Disclosure: This post contains affiliate links. If you click through and make a purchase, I may receive a commission at no additional cost to you. Thank you for your support.",
  "casual|top|named":
    "Quick heads-up: some links here are affiliate links to {programs} — if you buy through them, I earn a small commission and it costs you nothing extra.",
  "casual|top|generic":
    "Quick heads-up: some links on this page are affiliate links — I may earn a small commission if you buy through them, at no extra cost to you.",
  "casual|inline|named":
    "(affiliate link to {programs} — I might earn a commission, no cost to you)",
  "casual|inline|generic":
    "(affiliate link — I might earn a commission, no cost to you)",
  "casual|bottom|named":
    "P.S. This post has affiliate links to {programs}. Buying through them supports my work at zero extra cost to you — thanks!",
  "casual|bottom|generic":
    "P.S. This post includes affiliate links. Buying through them supports my work at zero extra cost to you — thanks!",
};

export const LEGAL_NOTICE =
  "Disclosure requirements vary by country — for example, the US FTC requires affiliate disclosures to be clear and conspicuous, placed where readers will notice them. This tool provides template wording only; it is not legal advice. Review your disclosure against the rules in your jurisdiction, or consult a qualified professional.";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Parse program names from a textarea string (one per line or comma
 * separated) or a string array. Caps at MAX_PROGRAM_NAMES; extras are
 * dropped from the listing (reported via the caller).
 */
export const MAX_PROGRAM_NAMES = 10;

export function parseProgramNames(raw: unknown): string[] {
  let parts: string[];
  if (Array.isArray(raw)) {
    parts = raw.map((p) => clean(p));
  } else if (typeof raw === "string") {
    parts = raw.split(/[\n,;]+/).map((p) => p.trim());
  } else {
    return [];
  }
  const seen = new Set<string>();
  const names: string[] = [];
  for (const p of parts) {
    if (p.length === 0) continue;
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(p);
  }
  return names.slice(0, MAX_PROGRAM_NAMES);
}

/** Quote program names and join: "A", "A" and "B", "A", "B", and "C". */
export function formatProgramPhrase(names: string[]): string {
  const quoted = names.map((n) => `"${n}"`);
  if (quoted.length === 1) return quoted[0];
  if (quoted.length === 2) return `${quoted[0]} and ${quoted[1]}`;
  return `${quoted.slice(0, -1).join(", ")}, and ${quoted[quoted.length - 1]}`;
}

/** Escape & < > " for safe embedding inside the disclosure HTML. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Generator entry point. values:
 *   placement: "top" | "inline" | "bottom" (required)
 *   tone: "formal" | "casual" (optional, default "formal")
 *   programNames: textarea string or string[] (optional)
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "No input provided." };
  }
  const placement = clean(values.placement).toLowerCase();
  const toneRaw = clean(values.tone).toLowerCase();
  const tone = toneRaw.length === 0 ? "formal" : toneRaw;

  if (!(PLACEMENTS as readonly string[]).includes(placement)) {
    return {
      ok: false,
      error: `Choose where the disclosure appears: ${PLACEMENTS.join(", ")}.`,
    };
  }
  if (!(TONES as readonly string[]).includes(tone)) {
    return { ok: false, error: `Tone must be one of: ${TONES.join(", ")}.` };
  }

  const names = parseProgramNames(values.programNames);
  const variant = names.length > 0 ? "named" : "generic";
  const template = TEMPLATES[`${tone}|${placement}|${variant}`];
  const disclosureText =
    variant === "named" ? template.replace("{programs}", formatProgramPhrase(names)) : template;
  const disclosureHtml = `<p class="affiliate-disclosure">${escapeHtml(disclosureText)}</p>`;

  return {
    ok: true,
    values: {
      disclosureText,
      disclosureHtml,
      legalNotice: LEGAL_NOTICE,
    },
  };
}
