/**
 * Font Pairing Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * HONESTY: curated pairing bank + contrast guidance. No AI, no live font
 * preview — the tool returns fixed, hand-picked heading/body font pairs for
 * the chosen mood and use case. Every font named is a real, widely available
 * font (common system fonts and well-known Google Fonts); no font names are
 * invented. The Google Fonts links are informational search links — font
 * availability varies by device, so every pairing also carries a system
 * fallback stack.
 *
 * Fixed content banks (documented per the builder honesty contract):
 * - PAIR_BANK: 4 moods (bold | elegant | playful | techy) x 3 use cases
 *   (captions | titles | lower-thirds) x 2 pairs each = 24 curated pairs.
 * - DISPLAY_FONTS: 10 fixed display/headline fonts. Rule enforced by design
 *   and by test: no pair contains two display fonts (one display headline
 *   font + one readable body font per pair).
 * - FALLBACK_STACKS: 3 fixed fallback stacks (sans | serif | mono) appended
 *   to every pairing so the combination degrades gracefully on any device.
 * - CONTRAST_NOTES: 3 fixed use-case notes (one per use case).
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export interface FontPair {
  headingFont: string;
  bodyFont: string;
  why: string;
  googleFontsLink: string;
}

const VALID_MOODS = ["bold", "elegant", "playful", "techy"];
const VALID_USES = ["captions", "titles", "lower-thirds"];

/**
 * Display/headline fonts used in the bank. The enforced rule: a pair never
 * contains two of these — each pair is one display font + one readable font.
 */
export const DISPLAY_FONTS: string[] = [
  "Anton",
  "Archivo Black",
  "Bebas Neue",
  "Impact",
  "Arial Black",
  "Oswald",
  "Pacifico",
  "Lobster",
  "Playfair Display",
  "Orbitron",
];

export const FALLBACK_STACKS: Record<string, string> = {
  sans: "Arial, Helvetica, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', Courier, monospace",
};

function link(font: string): string {
  return "https://fonts.google.com/?query=" + font.split(" ").join("+");
}

function pair(headingFont: string, bodyFont: string, fallback: string, why: string): FontPair {
  return {
    headingFont: headingFont + " (fallback: " + FALLBACK_STACKS[fallback] + ")",
    bodyFont: bodyFont + " (fallback: " + FALLBACK_STACKS[fallback] + ")",
    why,
    googleFontsLink: link(headingFont) + " and " + link(bodyFont),
  };
}

/** 24 curated pairs: 4 moods x 3 use cases x 2 pairs. */
const PAIR_BANK: Record<string, Record<string, FontPair[]>> = {
  bold: {
    captions: [
      pair("Anton", "Inter", "sans", "Anton's heavy condensed caps punch through busy footage; Inter stays legible at small caption sizes."),
      pair("Archivo Black", "Open Sans", "sans", "Archivo Black reads like a headline even at caption scale; Open Sans keeps longer lines readable."),
    ],
    titles: [
      pair("Bebas Neue", "Montserrat", "sans", "Bebas Neue is the classic bold YouTube title font; Montserrat supports it without competing."),
      pair("Impact", "Arial", "sans", "Impact is on virtually every device, so titles render the same everywhere; Arial is its quiet partner."),
    ],
    "lower-thirds": [
      pair("Oswald", "Inter", "sans", "Oswald names look authoritative in a lower third; Inter handles the subtitle line cleanly."),
      pair("Archivo Black", "Roboto", "sans", "A strong name treatment with Roboto underneath — bold but still broadcast-safe."),
    ],
  },
  elegant: {
    captions: [
      pair("Playfair Display", "Lato", "sans", "Playfair's high-contrast serifs feel premium; Lato keeps captions light and readable."),
      pair("Merriweather", "Source Sans 3", "sans", "A softer editorial pairing for lifestyle and documentary-style captions."),
    ],
    titles: [
      pair("Playfair Display", "Montserrat", "sans", "The go-to elegant title combo: dramatic serif headline, geometric sans support."),
      pair("Cormorant Garamond", "Raleway", "serif", "Delicate and fashion-forward — best for beauty, wedding, and luxury topics."),
    ],
    "lower-thirds": [
      pair("Raleway", "Lato", "sans", "Light, airy, professional — a lower third that whispers instead of shouts."),
      pair("Playfair Display", "Inter", "sans", "Serif name with a neutral sans detail line; classic interview framing."),
    ],
  },
  playful: {
    captions: [
      pair("Quicksand", "Nunito", "sans", "Rounded and friendly — both stay readable at caption sizes without looking childish."),
      pair("Poppins", "Quicksand", "sans", "Poppins brings energy to short punchy captions; Quicksand softens the longer lines."),
    ],
    titles: [
      pair("Pacifico", "Nunito", "sans", "Pacifico's script makes titles feel hand-made; Nunito keeps it from getting messy."),
      pair("Lobster", "Open Sans", "sans", "Retro script energy for food, travel, and vlog titles with a clean readable partner."),
    ],
    "lower-thirds": [
      pair("Nunito", "Open Sans", "sans", "Warm and approachable name treatment that works on family and lifestyle channels."),
      pair("Quicksand", "Lato", "sans", "Light rounded headline with a neutral body — playful without hurting readability."),
    ],
  },
  techy: {
    captions: [
      pair("Orbitron", "Inter", "sans", "Orbitron screams tech and gaming; Inter keeps the actual words easy to read fast."),
      pair("Roboto", "Roboto Mono", "mono", "A clean system-feel pairing — Roboto Mono adds the terminal/code flavor for dev content."),
    ],
    titles: [
      pair("Montserrat", "Open Sans", "sans", "Modern startup-style titles: confident geometric headline, neutral support text."),
      pair("Bebas Neue", "Roboto", "sans", "Tall condensed caps for AI and gadget titles with Roboto for the details."),
    ],
    "lower-thirds": [
      pair("Inter", "Roboto", "sans", "Neutral and corporate — the safe choice for B2B and SaaS talking-head videos."),
      pair("DM Sans", "Inter", "sans", "Geometric and current; works for product demos and explainer lower thirds."),
    ],
  },
};

const CONTRAST_NOTES: Record<string, string> = {
  captions:
    "Contrast note for captions: captions sit on moving video, so color alone is never enough — use white or yellow text with a dark stroke or drop shadow, and sanity-check on your brightest scene.",
  titles:
    "Contrast note for titles: titles are large display text — keep the heading font heavy and test it against the actual thumbnail background, not a white canvas.",
  "lower-thirds":
    "Contrast note for lower-thirds: lower-thirds overlay the lower video frame — put the name on a semi-opaque dark bar or add a text stroke so it reads over any footage.",
};

export function runTool(values: Record<string, unknown>): ToolResult {
  const mood = values["mood"];
  const useCase = values["useCase"];

  if (typeof mood !== "string" || VALID_MOODS.indexOf(mood) === -1) {
    return { ok: false, error: "Please choose a mood: bold, elegant, playful, or techy." };
  }
  if (typeof useCase !== "string" || VALID_USES.indexOf(useCase) === -1) {
    return { ok: false, error: "Please choose a use case: captions, titles, or lower-thirds." };
  }

  const pairs = PAIR_BANK[mood][useCase];
  const pairings: string[] = pairs.map(
    (p) =>
      `Heading: ${p.headingFont} + Body: ${p.bodyFont} — ${p.why} Fonts: ${p.googleFontsLink}`,
  );

  return {
    ok: true,
    values: {
      pairings,
      contrastNote: CONTRAST_NOTES[useCase],
    },
  };
}
