/**
 * Aesthetic Feed Theme Planner — pure logic (tool-207), zero imports, zero
 * network, zero DOM, no Math.random.
 *
 * CURATED GUIDANCE, NOT AI: every theme's palette, mood, do/don't lists,
 * posting rhythm and sample 3x3 grid pattern is hand-written in the
 * THEME_BANK below and returned verbatim. Nothing is fetched, nothing is
 * generated, nothing is personalized by a model. Unknown themes fall back to
 * "minimal" and say so (spec edge case: "unknown theme -> default + note").
 *
 * Bank size: 5 themes × (6 palette hex + 6 do + 6 don't + 1 rhythm + 9 grid
 * cells) = 5 palettes of 6, 30 do's, 30 don't's, 5 rhythms, 45 grid cells.
 *
 * The niche input is optional and only shapes the closing tip in the plan
 * summary — it never changes the curated bank content.
 */

export type FeedTheme = "minimal" | "bold" | "pastel" | "moody" | "editorial";

/** The five curated themes, in canonical order. */
export const FEED_THEMES: FeedTheme[] = ["minimal", "bold", "pastel", "moody", "editorial"];

export interface ThemeBankEntry {
  palette: string[];
  mood: string;
  doList: string[];
  dontList: string[];
  postingRhythm: string;
  /** 9 cells: row-major 3x3 sample pattern. */
  sampleGrid: string[];
}

const THEME_BANK: Record<FeedTheme, ThemeBankEntry> = {
  minimal: {
    palette: ["#FFFFFF", "#F5F5F4", "#D6D3D1", "#A8A29E", "#57534E", "#1C1917"],
    mood: "Clean, airy, gallery-like — mostly white/neutral with one dark accent.",
    doList: [
      "Keep 70%+ of every photo white or light-neutral background.",
      "Use one dark accent color at most for text and frames.",
      "Leave generous negative space around subjects.",
      "Shoot in soft, even daylight for consistent tones.",
      "Batch-edit with the same preset so whites match.",
      "Use a single sans-serif font for all on-image text.",
    ],
    dontList: [
      "Don't mix warm and cool white balances in one row.",
      "Don't use more than two accent colors per post.",
      "Don't crop busy, colorful backgrounds into a minimal grid.",
      "Don't overlay busy text on the image — caption instead.",
      "Don't alternate dark and light rows; it breaks the airy feel.",
      "Don't skip the dark accent entirely — pure white grids look washed out.",
    ],
    postingRhythm: "3 posts per week, one per row position — alternating photo / quote / photo keeps the grid airy without effort.",
    sampleGrid: [
      "R1C1 — airy product photo on white",
      "R1C2 — dark-accent text quote",
      "R1C3 — lifestyle photo, soft daylight",
      "R2C1 — dark-accent text quote",
      "R2C2 — close-up detail, neutral tones",
      "R2C3 — dark-accent text quote",
      "R3C1 — airy product photo on white",
      "R3C2 — behind-the-scenes, bright",
      "R3C3 — lifestyle photo, soft daylight",
    ],
  },
  bold: {
    palette: ["#FF3B30", "#FF9500", "#FFCC00", "#111111", "#FFFFFF", "#7D2AE8"],
    mood: "High-contrast, saturated, loud — colors pop off the screen.",
    doList: [
      "Push saturation +15–25 so colors read as bold on phones.",
      "Use black or white text with a heavy drop shadow on covers.",
      "Repeat one signature color in every row for identity.",
      "Design covers at full bleed — no thin white borders.",
      "Pair bold colors with 3–5 word headlines.",
      "Keep faces/emotions big in the frame — energy sells bold.",
    ],
    dontList: [
      "Don't use pastel washes — they mute the bold signal.",
      "Don't place small thin text on saturated backgrounds.",
      "Don't mix neon and earth tones in the same row.",
      "Don't use low-contrast color pairs (e.g. red on orange).",
      "Don't post unedited phone snaps — bold needs intentional grading.",
      "Don't change your signature color mid-month.",
    ],
    postingRhythm: "4–5 posts per week — bold feeds survive on volume; pin your best cover to the top-left of the grid.",
    sampleGrid: [
      "R1C1 — saturated hero photo, signature red",
      "R1C2 — bold cover: 3-word headline, black bg",
      "R1C3 — high-contrast lifestyle shot",
      "R2C1 — bold cover: stat or number, purple bg",
      "R2C2 — saturated product flat-lay",
      "R2C3 — bold cover: question hook, orange bg",
      "R3C1 — high-energy portrait",
      "R3C2 — bold cover: CTA slide, yellow bg",
      "R3C3 — saturated behind-the-scenes",
    ],
  },
  pastel: {
    palette: ["#F9D5D3", "#FDE8D8", "#E3EEDD", "#DDE7F5", "#F5E6F0", "#6B5B73"],
    mood: "Soft, dreamy, friendly — muted tints, never harsh.",
    doList: [
      "Shoot in open shade or golden hour for soft light.",
      "Add a warm tint (+5 to +10 temperature) in edits.",
      "Use rounded corners and soft shadows in graphics.",
      "Keep text lowercase and light-weight for the dreamy feel.",
      "Repeat blush pink or lavender as the anchor tint.",
      "Use film-grain or soft-blur textures sparingly.",
    ],
    dontList: [
      "Don't use pure black — use the dark mauve (#6B5B73) instead.",
      "Don't post harsh midday shadows; they break the softness.",
      "Don't mix neon accents into a pastel grid.",
      "Don't use all-caps bold headlines.",
      "Don't over-sharpen — softness is the point.",
      "Don't let one row drift into saturated colors.",
    ],
    postingRhythm: "3–4 posts per week — pastels fade fast in memory, so consistency beats volume.",
    sampleGrid: [
      "R1C1 — blush-pink lifestyle photo",
      "R1C2 — lavender quote card, lowercase text",
      "R1C3 — cream-toned product photo",
      "R2C1 — sage-green flat-lay",
      "R2C2 — dreamy portrait, golden hour",
      "R2C3 — powder-blue quote card",
      "R3C1 — peach-toned detail shot",
      "R3C2 — lavender lifestyle photo",
      "R3C3 — blush-pink quote card",
    ],
  },
  moody: {
    palette: ["#0E0E11", "#1F1F24", "#3A3A42", "#8B7E74", "#C9BFA6", "#E8E4DA"],
    mood: "Dark, cinematic, dramatic — shadows dominate, highlights are rare.",
    doList: [
      "Underexpose by 0.5–1 stop for rich shadows.",
      "Grade toward warm browns or cool teals, not both.",
      "Use rim light or window light for subject separation.",
      "Design graphics on near-black (#0E0E11) backgrounds.",
      "Keep highlights under 20% of the frame.",
      "Use serif or condensed fonts for the cinematic feel.",
    ],
    dontList: [
      "Don't shoot in bright flat daylight.",
      "Don't use pure white backgrounds in a moody grid.",
      "Don't mix warm and cool grades in the same row.",
      "Don't lift shadows to gray — crushed blacks are the look.",
      "Don't use playful rounded fonts.",
      "Don't post overexposed skies; recover or replace them.",
    ],
    postingRhythm: "2–3 posts per week — moody feeds are about scarcity and craft; one strong row beats daily filler.",
    sampleGrid: [
      "R1C1 — dark cinematic portrait, rim light",
      "R1C2 — near-black quote card, serif type",
      "R1C3 — low-key product shot",
      "R2C1 — near-black detail texture",
      "R2C2 — dramatic landscape/architecture",
      "R2C3 — near-black quote card, serif type",
      "R3C1 — low-key lifestyle moment",
      "R3C2 — dark still-life",
      "R3C3 — near-black quote card, serif type",
    ],
  },
  editorial: {
    palette: ["#F4F1EA", "#111111", "#B3261E", "#2F4B7C", "#C8A96A", "#7A7A7A"],
    mood: "Magazine-like, structured — strong type, clear grids, one print red.",
    doList: [
      "Design every post like a magazine spread: headline, subhead, image.",
      "Use a strict 2-font system (one serif display, one grotesque body).",
      "Anchor the grid with the print red (#B3261E) for key headlines.",
      "Leave print-style margins — nothing touches the edge.",
      "Number your series posts like magazine issues (#01, #02).",
      "Keep captions long-form and column-like, mirroring the design.",
    ],
    dontList: [
      "Don't use more than two fonts anywhere.",
      "Don't center-align everything — editorial uses left-aligned type.",
      "Don't mix illustration styles; pick one.",
      "Don't use drop shadows or gradients on text.",
      "Don't break the margin system for one-off posts.",
      "Don't use the print red for decoration — reserve it for headlines.",
    ],
    postingRhythm: "2 posts per week plus one pinned 'issue' — editorial feeds read as curated, not constant.",
    sampleGrid: [
      "R1C1 — cover: serif headline, print red kicker",
      "R1C2 — full-bleed editorial photo",
      "R1C3 — text spread: body copy on cream",
      "R2C1 — full-bleed editorial photo",
      "R2C2 — cover: numbered issue headline",
      "R2C3 — full-bleed editorial photo",
      "R3C1 — text spread: pull-quote, large serif",
      "R3C2 — full-bleed detail crop",
      "R3C3 — cover: CTA headline, print red",
    ],
  },
};

/** Documented bank sizes — used in tests and surfaced honestly in output. */
export const BANK_SIZES = {
  themes: FEED_THEMES.length,
  palettePerTheme: THEME_BANK.minimal.palette.length,
  doPerTheme: THEME_BANK.minimal.doList.length,
  dontPerTheme: THEME_BANK.minimal.dontList.length,
  gridCells: THEME_BANK.minimal.sampleGrid.length,
};

export interface ThemePlanResult {
  theme: FeedTheme;
  usedDefault: boolean;
  requestedTheme: string;
  entry: ThemeBankEntry;
  planSummary: string;
}

function isFeedTheme(s: string): s is FeedTheme {
  return (FEED_THEMES as string[]).includes(s);
}

export function planTheme(themeRaw: unknown, nicheRaw: unknown): ThemePlanResult {
  const requested = typeof themeRaw === "string" ? themeRaw.trim().toLowerCase() : "";
  const theme: FeedTheme = isFeedTheme(requested) ? requested : "minimal";
  const usedDefault = !isFeedTheme(requested);
  const entry = THEME_BANK[theme];
  const niche = typeof nicheRaw === "string" ? nicheRaw.trim() : "";

  const lines = [
    `Theme: ${theme} (${entry.mood})`,
    `Palette: ${entry.palette.join(", ")}`,
    `Posting rhythm: ${entry.postingRhythm}`,
    niche
      ? `Niche tip: shoot your ${niche} content in the same light and edit with one preset, so every ${niche} post lands inside the ${theme} mood.`
      : "Niche tip: none provided — add your niche to get a tailored shooting tip.",
    "Honesty: every palette, do/don't and grid pattern above is hand-curated guidance, not AI analysis.",
  ];
  if (usedDefault) {
    lines.unshift(
      `Note: "${requested || "(blank)"}" is not one of ${FEED_THEMES.join(", ")} — defaulted to "minimal".`,
    );
  }
  return { theme, usedDefault, requestedTheme: requested, entry, planSummary: lines.join("\n") };
}

/** Template entry point. values.theme: select value; values.niche: optional text. */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const themeRaw = values.theme;
  if (themeRaw === undefined || themeRaw === null || String(themeRaw).trim() === "") {
    return { ok: false, error: "Theme is required — pick one: minimal, bold, pastel, moody, editorial." };
  }
  const result = planTheme(themeRaw, values.niche);
  const entry = result.entry;
  return {
    ok: true,
    values: {
      palette: entry.palette.slice(),
      doList: entry.doList.slice(),
      dontList: entry.dontList.slice(),
      postingRhythm: entry.postingRhythm,
      sampleGrid: entry.sampleGrid.map((cell, i) => {
        const label = `Row ${Math.floor(i / 3) + 1}, Col ${(i % 3) + 1}`;
        return `${label}: ${cell}`;
      }),
      themeNote: result.planSummary,
    },
  };
}
