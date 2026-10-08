/**
 * 30-Day Reels Challenge Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Builds a 30-day reels calendar from the user's content pillars and niche.
 * Prompts are assembled from FIXED template banks — no AI, no model output.
 * The user supplies 3-5 pillars; each day rotates the pillars in fixed order
 * while the prompt and format rotate deterministically.
 *
 * Fixed content banks (documented per the builder honesty contract):
 * - FORMATS: 6 fixed reel formats
 * - PROMPT_TEMPLATES: 6 formats x 5 hand-written prompt templates = 30 fixed
 *   templates, each with {{niche}} and {{pillar}} placeholders
 * Day d (1-based): format = FORMATS[(d-1) % 6],
 *   prompt = PROMPT_TEMPLATES[format][floor((d-1)/6) % 5],
 *   pillar = pillars[(d-1) % pillarCount]
 * All 30 prompts in a calendar are unique. Same inputs -> identical calendar.
 */

export const MIN_PILLARS = 3;
export const MAX_PILLARS = 5;
export const CHALLENGE_DAYS = 30;
export const MAX_PILLAR_LEN = 60;
export const MAX_NICHE_LEN = 60;

export const FORMATS = [
  "Talking head tip",
  "POV skit",
  "Step-by-step tutorial",
  "B-roll voiceover",
  "Before & after",
  "Myth vs fact",
] as const;

/** 6 formats x 5 fixed prompt templates = 30. */
const PROMPT_TEMPLATES: Record<(typeof FORMATS)[number], string[]> = {
  "Talking head tip": [
    "Talk to camera: share your #1 beginner tip for {{pillar}} in {{niche}}.",
    "Talk to camera: the biggest mistake people make with {{pillar}} in {{niche}} — and the fix.",
    "Talk to camera: answer the most common question you get about {{pillar}} in {{niche}}.",
    "Talk to camera: 3 things you wish you knew about {{pillar}} when you started in {{niche}}.",
    "Talk to camera: a hot take about {{pillar}} in {{niche}} — defend it in 30 seconds.",
  ],
  "POV skit": [
    "Film a POV skit: you before vs after learning {{pillar}} in {{niche}}.",
    "POV skit: what it feels like when {{pillar}} finally clicks in {{niche}}.",
    "POV skit: your audience's reaction when you explain {{pillar}} in {{niche}}.",
    "POV skit: day 1 vs day 30 of focusing on {{pillar}} in {{niche}}.",
    "POV skit: the face you make when someone ignores {{pillar}} in {{niche}}.",
  ],
  "Step-by-step tutorial": [
    "Tutorial: 3 steps to improve {{pillar}} in {{niche}} — show each step on screen.",
    "Tutorial: your exact routine for {{pillar}} in {{niche}}.",
    "Tutorial: how to do {{pillar}} in {{niche}} with zero budget.",
    "Tutorial: the 5-minute version of {{pillar}} for busy {{niche}} beginners.",
    "Tutorial: screen-record your process for {{pillar}} in {{niche}} and narrate it.",
  ],
  "B-roll voiceover": [
    "Film aesthetic B-roll, voiceover: why {{pillar}} matters in {{niche}}.",
    "B-roll voiceover: a day in your life working on {{pillar}} in {{niche}}.",
    "B-roll voiceover: tell the story of your first win with {{pillar}} in {{niche}}.",
    "B-roll voiceover: 5 signs you need to work on {{pillar}} in {{niche}}.",
    "B-roll voiceover: what a great {{pillar}} setup looks like in {{niche}}.",
  ],
  "Before & after": [
    "Before/after: show your {{pillar}} results in {{niche}} side by side.",
    "Before/after: your first attempt at {{pillar}} vs now in {{niche}}.",
    "Before/after: a follower's {{pillar}} transformation in {{niche}} (with their permission).",
    "Before/after: what {{pillar}} in {{niche}} looked like 1 year ago vs today.",
    "Before/after: the wrong way vs the right way to do {{pillar}} in {{niche}}.",
  ],
  "Myth vs fact": [
    "Myth vs fact: debunk the #1 myth about {{pillar}} in {{niche}}.",
    "Myth vs fact: 'You need talent for {{pillar}} in {{niche}}' — true or false?",
    "Myth vs fact: 3 myths about {{pillar}} in {{niche}}, busted in 30 seconds.",
    "Myth vs fact: the advice about {{pillar}} in {{niche}} you should ignore.",
    "Myth vs fact: what gurus get wrong about {{pillar}} in {{niche}}.",
  ],
};

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function parsePillars(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(/\r?\n|,/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function fill(template: string, niche: string, pillar: string): string {
  return template.split("{{niche}}").join(niche).split("{{pillar}}").join(pillar);
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const pillars = parsePillars(values["pillars"]);
  const nicheRaw = values["niche"];
  const niche = typeof nicheRaw === "string" ? nicheRaw.trim() : "";

  if (pillars.length < MIN_PILLARS || pillars.length > MAX_PILLARS) {
    return {
      ok: false,
      error: `Please enter ${MIN_PILLARS}–${MAX_PILLARS} content pillars (one per line or comma-separated). You entered ${pillars.length}.`,
    };
  }
  for (const p of pillars) {
    if (p.length > MAX_PILLAR_LEN) {
      return { ok: false, error: `Each pillar must be ${MAX_PILLAR_LEN} characters or less.` };
    }
  }
  if (new Set(pillars.map((p) => p.toLowerCase())).size !== pillars.length) {
    return { ok: false, error: "Your pillars must all be different — duplicates were found." };
  }
  if (!niche) {
    return { ok: false, error: "Please enter your niche." };
  }
  if (niche.length > MAX_NICHE_LEN) {
    return { ok: false, error: `Niche is too long (max ${MAX_NICHE_LEN} characters).` };
  }

  const rows: string[][] = [];
  for (let d = 1; d <= CHALLENGE_DAYS; d++) {
    const format = FORMATS[(d - 1) % FORMATS.length];
    const template = PROMPT_TEMPLATES[format][Math.floor((d - 1) / FORMATS.length) % PROMPT_TEMPLATES[format].length];
    const pillar = pillars[(d - 1) % pillars.length];
    rows.push([String(d), pillar, fill(template, niche, pillar), format]);
  }

  const csvLines = ["Day,Pillar,Prompt,Format", ...rows.map((r) => r.map(csvCell).join(","))];
  const exportCSV = csvLines.join("\n");

  return {
    ok: true,
    values: {
      calendar: { columns: ["Day", "Pillar", "Prompt", "Format"], rows },
      exportCSV,
    },
  };
}
