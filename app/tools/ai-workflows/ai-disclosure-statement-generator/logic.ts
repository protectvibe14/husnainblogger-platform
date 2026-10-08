/**
 * AI Disclosure Statement Generator (tool-326) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is a TEMPLATE FILLER, not a lawyer and not AI. It fills
 * fixed disclosure-statement templates with the usage type you select.
 * These are templates only — they are NOT legal advice, and you should
 * have a human (or a lawyer) review the final wording before publishing.
 *
 * Word banks (all fixed, documented here):
 *   - USAGE_TYPES: 4 entries (text, image, video, voice)
 *   - PLACEMENTS: 3 entries (caption, description, footer)
 *   - STATEMENT_BANK: 4 usage types x 4 variants = 16 fixed statements.
 *     Variants per usage type: short, standard, detailed, friendly.
 *   - PLACEMENT_MAP: 3 entries mapping placement -> recommended variant
 *     (caption -> short, description -> detailed, footer -> standard)
 *     + 3 fixed placement tips.
 *
 * Generator contract: runTool(values) -> { ok, values, error }.
 * values in  = { usageType, placement }
 * values out = { variants, recommended, placementTip }
 * Output ids match meta.ts outputs.
 *
 * Edge cases from the spec: none.
 */

export interface DisclosureValues {
  /** All 4 statement variants for the usage type, each labeled. */
  variants: string[];
  /** The recommended statement for the chosen placement. */
  recommended: string;
  /** A fixed placement tip for where to put the disclosure. */
  placementTip: string;
}

export interface DisclosureResult {
  ok: boolean;
  values?: DisclosureValues;
  error?: string;
}

export const USAGE_TYPES: string[] = ["text", "image", "video", "voice"];
export const PLACEMENTS: string[] = ["caption", "description", "footer"];

const USAGE_LABELS: Record<string, string> = {
  text: "text",
  image: "images",
  video: "video",
  voice: "voice/audio",
};

/** 16 fixed statements: 4 usage types x 4 variants. */
const STATEMENT_BANK: Record<string, Record<string, string>> = {
  text: {
    short: "This post was written with the help of AI tools.",
    standard:
      "This content was created with the assistance of AI tools. All facts and claims were reviewed by a human before publishing.",
    detailed:
      "Disclosure: portions of this text were drafted or edited with the assistance of generative AI tools. A human author reviewed, verified, and takes responsibility for the final content.",
    friendly:
      "A quick note for transparency: I used AI tools to help draft and polish this post, but every word was reviewed and approved by me.",
  },
  image: {
    short: "This image was generated with AI tools.",
    standard:
      "This image was created or edited with the assistance of AI image tools. It is illustrative and may not depict real people, places, or events.",
    detailed:
      "Disclosure: this image was generated or substantially edited using generative AI image tools. It is an illustration created for this content and should not be taken as a photograph of a real scene.",
    friendly:
      "Transparency note: the artwork here was made with AI image tools. It is an illustration, not a real photo.",
  },
  video: {
    short: "This video was created with the help of AI tools.",
    standard:
      "This video was produced with the assistance of AI tools (scripting, voiceover, and/or visuals). A human reviewed the final cut before publishing.",
    detailed:
      "Disclosure: this video uses AI-generated elements, which may include the script, voiceover, and/or visuals. A human creator supervised production, reviewed the final video, and takes responsibility for it.",
    friendly:
      "Behind the scenes: I used AI tools to help create this video — but a real human (me) supervised, reviewed, and approved the final result.",
  },
  voice: {
    short: "The voice in this content is AI-generated.",
    standard:
      "The voiceover in this content was generated with AI voice tools. The script and message were written and reviewed by a human.",
    detailed:
      "Disclosure: the narration you hear was created using AI voice-synthesis tools. The script was written and fact-checked by a human, who takes responsibility for the message.",
    friendly:
      "Heads up: the voice you hear is AI-generated. The words and ideas behind it are human-written and reviewed.",
  },
};

/** Which variant fits each placement best. */
const PLACEMENT_MAP: Record<string, string> = {
  caption: "short",
  description: "detailed",
  footer: "standard",
};

const PLACEMENT_TIPS: Record<string, string> = {
  caption:
    "Put the short variant at the start of your caption so it is visible without tapping 'more'.",
  description:
    "Put the detailed variant near the top of your description so viewers see it without scrolling.",
  footer:
    "Put the standard variant in the footer or end credits so it is present but unobtrusive.",
};

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

const USAGE_EXAMPLE = USAGE_TYPES.join(", ");
const PLACEMENT_EXAMPLE = PLACEMENTS.join(", ");

/**
 * Fill the fixed disclosure templates for the chosen usage type and
 * placement. Deterministic: same inputs always produce the same statements.
 */
export function runTool(values: Record<string, unknown>): DisclosureResult {
  const usageType = getString(values?.usageType);
  const placement = getString(values?.placement);

  if (!usageType) {
    return { ok: false, error: "Choose a usage type: " + USAGE_EXAMPLE + "." };
  }
  if (USAGE_TYPES.indexOf(usageType) === -1) {
    return {
      ok: false,
      error: "Unknown usage type. Choose one of: " + USAGE_EXAMPLE + ".",
    };
  }
  if (!placement) {
    return { ok: false, error: "Choose a placement: " + PLACEMENT_EXAMPLE + "." };
  }
  if (PLACEMENTS.indexOf(placement) === -1) {
    return {
      ok: false,
      error: "Unknown placement. Choose one of: " + PLACEMENT_EXAMPLE + ".",
    };
  }

  const bank = STATEMENT_BANK[usageType];
  const variantKeys = ["short", "standard", "detailed", "friendly"];
  const labelOf = (key: string): string =>
    key.charAt(0).toUpperCase() + key.slice(1);
  const variants = variantKeys.map(
    (key) => labelOf(key) + ": " + bank[key],
  );

  const recommendedKey = PLACEMENT_MAP[placement];
  const recommended = bank[recommendedKey];
  const usageLabel = USAGE_LABELS[usageType];
  const placementTip =
    PLACEMENT_TIPS[placement] +
    " Templates are a starting point — have a human review the wording before you publish.";

  const recommendedWithNote =
    "Recommended " +
    labelOf(recommendedKey) +
    " variant for " +
    usageLabel +
    " in the " +
    placement +
    ": " +
    recommended;

  return {
    ok: true,
    values: {
      variants,
      recommended: recommendedWithNote,
      placementTip,
    },
  };
}
