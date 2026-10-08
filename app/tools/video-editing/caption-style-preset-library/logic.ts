/**
 * Caption Style Preset Library (tool-262) — pure logic, zero imports,
 * zero network, zero DOM. Deterministic: same vibe + platform always
 * returns the same preset.
 *
 * Honesty: this is a STATIC CURATED CONTENT BANK, not computation and not
 * AI. Its value is curation: 5 hand-written caption styles with CapCut
 * rebuild instructions. Font names are real, free Google Fonts suggestions
 * (never misrepresented as built-in CapCut fonts); every preset ships
 * fallback fonts in case the suggested font is not on the user's device.
 *
 * === VIBE BANK (5 entries) ===
 *  bold, minimal, hormozi, karaoke, neon.
 * Each entry: { font, fallbackFonts[3], sizeGuidance, uppercase, stroke,
 *  shadow, bg, animation, colors{text, accent, bg}, keywordHighlight, note }.
 *
 * Platform (tiktok|reels|shorts) only changes placement/safe-zone guidance
 * and one CapCut step — the core style is identical across platforms.
 */

interface PresetColors {
  text: string;
  accent: string;
  bg: string;
}

interface CaptionPreset {
  vibe: string;
  font: string;
  fallbackFonts: string[];
  sizeGuidance: string;
  uppercase: boolean;
  stroke: string;
  shadow: string;
  bg: string;
  animation: string;
  colors: PresetColors;
  keywordHighlight: string;
  note: string;
}

const VIBES: Record<string, CaptionPreset> = {
  bold: {
    vibe: "bold",
    font: "Anton (free Google Font)",
    fallbackFonts: ["Archivo Black", "Arial Black", "sans-serif"],
    sizeGuidance: "Large: cap height ~8-10% of frame height, 2-4 words per line.",
    uppercase: true,
    stroke: "4-6px black stroke",
    shadow: "Hard offset shadow (4px down-right, black)",
    bg: "None — bare text with stroke",
    animation: "Pop-in per word (scale 60% to 100% with slight overshoot)",
    colors: { text: "#FFFFFF", accent: "#FACC15", bg: "transparent" },
    keywordHighlight: "Key words in yellow (#FACC15) on the same line",
    note: "Maximum-impact default for hooks and titles. Unknown vibes fall back to this preset.",
  },
  minimal: {
    vibe: "minimal",
    font: "Inter Medium (free Google Font)",
    fallbackFonts: ["Helvetica Neue", "Arial", "sans-serif"],
    sizeGuidance: "Medium: cap height ~5-6% of frame height, full sentences allowed.",
    uppercase: false,
    stroke: "None",
    shadow: "Soft drop shadow (0 4px 12px rgba(0,0,0,0.45))",
    bg: "Subtle rounded dark box (rgba(0,0,0,0.55), 12px radius)",
    animation: "Gentle fade per line (no scale)",
    colors: { text: "#FFFFFF", accent: "#FFFFFF", bg: "rgba(0,0,0,0.55)" },
    keywordHighlight: "Key words in bold weight, same color",
    note: "Calm, readable style for explainers and talking-head videos.",
  },
  hormozi: {
    vibe: "hormozi",
    font: "Archivo Black (free Google Font)",
    fallbackFonts: ["Anton", "Arial Black", "sans-serif"],
    sizeGuidance: "Large: cap height ~8-9% of frame height, 3-5 words per line.",
    uppercase: true,
    stroke: "3-4px black stroke",
    shadow: "None — the highlight boxes carry the contrast",
    bg: "Keyword highlight boxes: yellow (#FACC15) box behind key words, black text on the box",
    animation: "Word-by-word pop with keyword box reveal",
    colors: { text: "#FFFFFF", accent: "#FACC15", bg: "transparent" },
    keywordHighlight: "Money/number words get a yellow box with black text (the signature look)",
    note: "Business/education short-form style: white text, yellow keyword boxes, black outlines.",
  },
  karaoke: {
    vibe: "karaoke",
    font: "Poppins Bold (free Google Font)",
    fallbackFonts: ["Inter", "Arial", "sans-serif"],
    sizeGuidance: "Medium-large: cap height ~7-8% of frame height, 2-3 words per line.",
    uppercase: false,
    stroke: "None",
    shadow: "Soft shadow (0 3px 10px rgba(0,0,0,0.5))",
    bg: "None — bare text",
    animation: "Word-by-word highlight: active word turns accent color and scales to 110%",
    colors: { text: "#FFFFFF", accent: "#22D3EE", bg: "transparent" },
    keywordHighlight: "The currently spoken word is highlighted in cyan (#22D3EE)",
    note: "Needs word-level timing — use CapCut Auto captions, then recolor the active word per beat.",
  },
  neon: {
    vibe: "neon",
    font: "Bebas Neue (free Google Font)",
    fallbackFonts: ["Oswald", "Arial Narrow", "sans-serif"],
    sizeGuidance: "Large: cap height ~8-10% of frame height, short punchy lines.",
    uppercase: true,
    stroke: "None",
    shadow: "Neon glow: 0 0 18px accent color",
    bg: "Dark translucent box (rgba(5,10,20,0.6)) for glow contrast",
    animation: "Fade-in with glow pulse on the active word",
    colors: { text: "#E8FEFF", accent: "#22D3EE", bg: "rgba(5,10,20,0.6)" },
    keywordHighlight: "Hook words glow brighter in cyan (#22D3EE)",
    note: "Night/gaming aesthetic — needs a dark background behind the text to read well.",
  },
};

const VIBE_IDS: string[] = ["bold", "minimal", "hormozi", "karaoke", "neon"];
const PLATFORMS: string[] = ["tiktok", "reels", "shorts"];

function placementNote(platform: string): string {
  switch (platform) {
    case "tiktok":
      return "TikTok: keep captions in the middle 60% of the frame — the top (title/description) and bottom (UI buttons) zones get covered.";
    case "reels":
      return "Reels: center the captions slightly below middle — avoid the bottom 15% (caption text and UI) and the right edge (action buttons).";
    case "shorts":
      return "Shorts: keep captions in the middle 60% — the top (title) and bottom (progress bar and UI) zones get covered.";
    default:
      return "";
  }
}

function capcutStepsFor(preset: CaptionPreset, platform: string): string[] {
  return [
    "In CapCut, add your captions with Auto captions (Text > Auto captions) so every line is timed to the audio.",
    `Set the font to ${preset.font}. If it is not installed, use a fallback in this order: ${preset.fallbackFonts.join(" > ")}.`,
    `Size: ${preset.sizeGuidance}`,
    preset.uppercase
      ? "Turn on ALL CAPS for this style."
      : "Keep normal sentence case for this style.",
    `Stroke: ${preset.stroke}. Shadow: ${preset.shadow}. Background: ${preset.bg}.`,
    `Colors: main text ${preset.colors.text}, accent ${preset.colors.accent}. ${preset.keywordHighlight}.`,
    `Animation: ${preset.animation}. Apply via Animation > In on each caption group.`,
    placementNote(platform),
    "Preview on your phone at full screen — caption contrast that looks fine on desktop often fails over bright footage.",
  ];
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawVibe = values["vibe"];
  const vibeRaw =
    typeof rawVibe === "string" ? rawVibe.trim().toLowerCase() : "";
  const rawPlatform = values["platform"];
  const platform =
    typeof rawPlatform === "string" ? rawPlatform.trim().toLowerCase() : "";

  if (!PLATFORMS.includes(platform)) {
    return {
      ok: false,
      error: `Unknown platform "${typeof rawPlatform === "string" ? rawPlatform : ""}". Pick one of: ${PLATFORMS.join(", ")}.`,
    };
  }

  let vibe = vibeRaw;
  let defaulted = false;
  if (!VIBE_IDS.includes(vibeRaw)) {
    vibe = "bold";
    defaulted = true;
  }

  const base = VIBES[vibe] as CaptionPreset;
  const preset: CaptionPreset & { platform: string; fallbackNote?: string } = {
    ...base,
    colors: { ...base.colors },
    fallbackFonts: [...base.fallbackFonts],
    platform,
  };
  if (defaulted) {
    preset.fallbackNote = `Unknown vibe "${typeof rawVibe === "string" ? rawVibe : ""}" — defaulted to the "bold" preset.`;
  }

  const capcutSteps = capcutStepsFor(base, platform);

  return {
    ok: true,
    values: {
      preset: JSON.parse(JSON.stringify(preset)) as Record<string, unknown>,
      capcutSteps,
    },
  };
}
