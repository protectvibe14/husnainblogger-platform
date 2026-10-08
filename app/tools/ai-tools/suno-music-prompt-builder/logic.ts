/**
 * Suno Music Prompt Builder — pure logic (tool-525), zero imports, zero
 * network, zero DOM.
 *
 * HONESTY CONTRACT: this builds PROMPT TEXT to paste into Suno. It does NOT
 * generate music, does NOT call Suno, and no AI model runs here. The lyrics
 * draft is a fixed template structure with your theme inserted — a starting
 * skeleton you must rewrite, not finished songwriting.
 *
 * Template banks (documented sizes):
 *  - GENRES: 12 entries  -> style-field genre fragment
 *  - MOODS: 8 entries    -> style-field mood fragment
 *  - TEMPOS: 3 entries   -> style-field tempo fragment
 *  - VOCALS: 5 entries   -> style-field vocal fragment
 *  - LYRIC_LINES: 8 per section template functions
 */

/** 12 genres -> style-field fragment. */
export const GENRES: Record<string, string> = {
  pop: "pop",
  rock: "rock",
  hiphop: "hip-hop",
  electronic: "electronic dance",
  lofi: "lo-fi",
  country: "country",
  jazz: "jazz",
  classical: "classical",
  rnb: "r&b",
  folk: "folk",
  metal: "metal",
  ambient: "ambient",
};

/** 8 moods -> style-field fragment. */
export const MOODS: Record<string, string> = {
  happy: "upbeat and joyful",
  sad: "melancholic and emotional",
  energetic: "high-energy and driving",
  chill: "laid-back and relaxed",
  romantic: "romantic and tender",
  dark: "dark and moody",
  hopeful: "hopeful and uplifting",
  nostalgic: "nostalgic and bittersweet",
};

/** 3 tempos -> style-field fragment. */
export const TEMPOS: Record<string, string> = {
  slow: "slow tempo",
  medium: "medium tempo",
  fast: "fast tempo",
};

/** 5 vocal options -> style-field fragment. */
export const VOCALS: Record<string, string> = {
  instrumental: "instrumental, no vocals",
  "female-vocal": "female vocal",
  "male-vocal": "male vocal",
  duet: "male and female duet vocals",
  choir: "choir vocals",
};

export const MAX_THEME_LENGTH = 200;

/** Fixed lyric-skeleton line templates; "{theme}" replaced with the theme. */
const VERSE_TEMPLATES: string[] = [
  "I woke up thinking about {theme}",
  "The morning light is falling on {theme}",
  "Every road I take keeps leading to {theme}",
  "I hold it close, this feeling of {theme}",
];

const CHORUS_TEMPLATES: string[] = [
  "{theme}, running through my mind",
  "{theme}, I can feel it every time",
  "Sing it louder: {theme}",
  "{theme} will carry me through the night",
];

export function sanitizeTheme(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\bwww\.\S+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateSelect(
  raw: unknown,
  allowed: Record<string, string>,
): string | null {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(allowed, key) ? key : null;
}

export interface SunoBuildResult {
  genre: string;
  mood: string;
  tempo: string;
  vocals: string;
  theme: string;
  styleField: string;
  lyricsDraft: string;
  pasteNote: string;
}

/**
 * Deterministically assemble the style field and the lyric skeleton.
 * Same inputs -> same output.
 */
export function buildSunoPrompt(
  genreKey: string,
  moodKey: string,
  tempoKey: string,
  vocalKey: string,
  theme: string,
): SunoBuildResult {
  const styleField = [
    GENRES[genreKey],
    MOODS[moodKey],
    TEMPOS[tempoKey],
    VOCALS[vocalKey],
  ].join(", ");

  const verse = (i: number): string =>
    VERSE_TEMPLATES[i % VERSE_TEMPLATES.length].replace("{theme}", theme);
  const chorus = (i: number): string =>
    CHORUS_TEMPLATES[i % CHORUS_TEMPLATES.length].replace("{theme}", theme);

  const lyricsDraft = [
    "[Verse 1]",
    verse(0),
    verse(1),
    "",
    "[Chorus]",
    chorus(0),
    chorus(1),
    "",
    "[Verse 2]",
    verse(2),
    verse(3),
    "",
    "[Chorus]",
    chorus(2),
    chorus(3),
    "",
    "[Outro]",
    chorus(0),
  ].join("\n");

  const pasteNote =
    "Paste the Style field into Suno's style box and the lyrics into its " +
    "lyrics box. The lyric lines are a rewrite-me skeleton, not finished songwriting.";

  return { genre: genreKey, mood: moodKey, tempo: tempoKey, vocals: vocalKey, theme, styleField, lyricsDraft, pasteNote };
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.genre/values.mood/values.tempo/values.vocals: select keys.
 * values.theme: string, required, 2-200 chars after sanitization.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const genre = validateSelect(values["genre"], GENRES);
  if (!genre) {
    return { ok: false, error: `Genre must be one of: ${Object.keys(GENRES).join(", ")}.` };
  }
  const mood = validateSelect(values["mood"], MOODS);
  if (!mood) {
    return { ok: false, error: `Mood must be one of: ${Object.keys(MOODS).join(", ")}.` };
  }
  const tempo = validateSelect(values["tempo"], TEMPOS);
  if (!tempo) {
    return { ok: false, error: `Tempo must be one of: ${Object.keys(TEMPOS).join(", ")}.` };
  }
  const vocals = validateSelect(values["vocals"], VOCALS);
  if (!vocals) {
    return { ok: false, error: `Vocals must be one of: ${Object.keys(VOCALS).join(", ")}.` };
  }

  const rawTheme = values["theme"];
  if (rawTheme === undefined || rawTheme === null || rawTheme === "") {
    return { ok: false, error: "Please enter a theme or lyrics topic." };
  }
  if (typeof rawTheme !== "string") {
    return { ok: false, error: "Theme must be text." };
  }
  const theme = sanitizeTheme(rawTheme);
  if (theme.length < 2) {
    return { ok: false, error: "Theme must be at least 2 characters long." };
  }
  if (theme.length > MAX_THEME_LENGTH) {
    return {
      ok: false,
      error: `Theme must be ${MAX_THEME_LENGTH} characters or fewer.`,
    };
  }

  const r = buildSunoPrompt(genre, mood, tempo, vocals, theme);
  return {
    ok: true,
    values: {
      styleField: r.styleField,
      lyricsDraft: r.lyricsDraft,
      pasteNote: r.pasteNote,
      genre: r.genre,
      mood: r.mood,
      tempo: r.tempo,
      vocals: r.vocals,
      theme: r.theme,
    },
  };
}
