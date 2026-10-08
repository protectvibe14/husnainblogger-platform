/**
 * logic.ts — SFX Cue Sheet Generator (tool-283)
 *
 * Pure, deterministic engine. ZERO imports.
 *
 * What this honestly is: a template engine, NOT audio software. It reads
 * your timeline beats (timestamps + action descriptions), matches each
 * action against a curated SFX bank of 24 sound types using fixed keyword
 * matching (most keyword hits wins; ties go to the earlier bank entry), assigns a rule-based volume in dB, and formats a readable cue
 * sheet. The tool produces NO audio files — searchTerms are keyword phrases
 * to search in free SFX libraries (Pixabay, Mixkit, YouTube Audio Library).
 * Volumes are mixing guidance estimates, not measured loudness.
 *
 * SFX BANK SIZE: 24 sound types (whoosh, impact, riser, pop, ding, click,
 *   footstep, door, applause, laugh, camera shutter, keyboard, ambient,
 *   drone, record scratch, cash register, alert, heartbeat, crowd cheer,
 *   splash, fire crackle, wind, beat drop, phone ring).
 *
 * TIMING RULE: beats closer than 300ms apart are flagged as "mud" — two
 * sounds that close together will blur into noise on most speakers.
 *
 * MOOD RULE: a mood word (calm/relaxing, energetic, funny, cinematic) shifts
 * volumes and prefers matching sound families. Mood words are simple
 * string matches, not sentiment analysis.
 *
 * Output is deterministic: same inputs always produce the same cue sheet.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

interface SfxEntry {
  sfxType: string;
  keywords: string[];
  searchTerms: string[];
  volumeDb: number;
}

const SFX_BANK: SfxEntry[] = [
  { sfxType: "Whoosh", keywords: ["whoosh", "swoosh", "swipe"], searchTerms: ["whoosh sound effect", "swoosh transition sfx"], volumeDb: -12 },
  { sfxType: "Impact Hit", keywords: ["hit", "punch", "slam", "crash", "smash"], searchTerms: ["impact hit sound effect", "cinematic hit sfx"], volumeDb: -6 },
  { sfxType: "Riser", keywords: ["riser", "build", "tension", "reveal"], searchTerms: ["riser sound effect", "tension build riser sfx"], volumeDb: -12 },
  { sfxType: "Pop", keywords: ["pop", "bounce", "bubble"], searchTerms: ["pop sound effect", "cartoon pop sfx"], volumeDb: -14 },
  { sfxType: "Ding / Bell", keywords: ["ding", "bell", "success", "correct"], searchTerms: ["ding sound effect", "bell notification sfx"], volumeDb: -14 },
  { sfxType: "Click / Tap", keywords: ["click", "tap", "button", "press"], searchTerms: ["ui click sound effect", "button tap sfx"], volumeDb: -16 },
  { sfxType: "Footsteps", keywords: ["footstep", "walk", "run", "step"], searchTerms: ["footsteps sound effect", "walking sfx"], volumeDb: -22 },
  { sfxType: "Door", keywords: ["door", "knock", "close door"], searchTerms: ["door close sound effect", "door knock sfx"], volumeDb: -10 },
  { sfxType: "Applause", keywords: ["applause", "clap", "ovation"], searchTerms: ["applause sound effect", "crowd clapping sfx"], volumeDb: -12 },
  { sfxType: "Laugh", keywords: ["laugh", "giggle", "chuckle"], searchTerms: ["laugh sound effect", "crowd laughing sfx"], volumeDb: -14 },
  { sfxType: "Camera Shutter", keywords: ["shutter", "photo", "snapshot", "picture"], searchTerms: ["camera shutter sound effect", "photo snap sfx"], volumeDb: -10 },
  { sfxType: "Keyboard Typing", keywords: ["type", "keyboard", "typing"], searchTerms: ["keyboard typing sound effect"], volumeDb: -20 },
  { sfxType: "Room Ambience", keywords: ["ambient", "ambience", "room", "background", "office"], searchTerms: ["room ambience sound effect", "quiet office background sfx"], volumeDb: -24 },
  { sfxType: "Drone Bed", keywords: ["drone", "bed", "underscore", "pad"], searchTerms: ["cinematic drone sound effect", "dark pad underscore sfx"], volumeDb: -24 },
  { sfxType: "Record Scratch", keywords: ["scratch", "record", "rewind"], searchTerms: ["record scratch sound effect"], volumeDb: -10 },
  { sfxType: "Cash Register", keywords: ["cash", "coin", "money", "cha-ching", "payment"], searchTerms: ["cash register sound effect", "coin cha-ching sfx"], volumeDb: -12 },
  { sfxType: "Alert", keywords: ["alert", "warning", "error", "buzz"], searchTerms: ["alert sound effect", "warning buzzer sfx"], volumeDb: -10 },
  { sfxType: "Heartbeat", keywords: ["heartbeat", "pulse", "suspense", "heart"], searchTerms: ["heartbeat sound effect", "suspense pulse sfx"], volumeDb: -16 },
  { sfxType: "Crowd Cheer", keywords: ["crowd", "cheer", "stadium", "fans"], searchTerms: ["crowd cheering sound effect", "stadium cheer sfx"], volumeDb: -12 },
  { sfxType: "Water Splash", keywords: ["splash", "water", "ocean"], searchTerms: ["water splash sound effect"], volumeDb: -12 },
  { sfxType: "Fire Crackle", keywords: ["fire", "flame", "crackle", "campfire"], searchTerms: ["fire crackling sound effect", "campfire sfx"], volumeDb: -20 },
  { sfxType: "Wind", keywords: ["wind", "breeze", "gust"], searchTerms: ["wind blowing sound effect"], volumeDb: -20 },
  { sfxType: "Beat Drop", keywords: ["drop", "bass drop", "edm"], searchTerms: ["bass drop sound effect", "edm drop sfx"], volumeDb: -8 },
  { sfxType: "Phone Ring", keywords: ["ring", "phone", "call"], searchTerms: ["phone ringing sound effect", "old telephone ring sfx"], volumeDb: -12 },
];

const FALLBACK: SfxEntry = {
  sfxType: "UI Tick",
  keywords: [],
  searchTerms: ["ui tick sound effect", "interface tick sfx"],
  volumeDb: -18,
};

interface Beat { timeMs: number; action: string; }

function parseBeats(v: unknown): Beat[] | string {
  let raw: unknown = v;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return "Could not read timeline beats — the textarea must contain a JSON array like [{\"timeMs\": 3000, \"action\": \"door opens\"}].";
    }
  }
  if (!Array.isArray(raw) || raw.length === 0) {
    return "Add at least 1 timeline beat: {\"timeMs\": 3000, \"action\": \"describe the moment\"}.";
  }
  const beats: Beat[] = [];
  for (let i = 0; i < raw.length; i++) {
    const b = raw[i] as Record<string, unknown>;
    const timeMs = Number(b.timeMs);
    const action = typeof b.action === "string" ? b.action.trim() : "";
    if (!Number.isFinite(timeMs) || timeMs < 0) return `Beat ${i + 1}: timeMs must be a number >= 0 (milliseconds).`;
    if (!action) return `Beat ${i + 1}: action must be a non-empty description.`;
    beats.push({ timeMs, action });
  }
  for (let i = 1; i < beats.length; i++) {
    if (beats[i].timeMs <= beats[i - 1].timeMs) {
      return `Timestamps must be in ascending order — beat ${i + 1} (${beats[i].timeMs}ms) is not after beat ${i} (${beats[i - 1].timeMs}ms).`;
    }
  }
  return beats;
}

function moodShift(mood: string): { volumeAdj: number; preferred: string[] } {
  const m = mood.toLowerCase();
  if (/calm|relax|soft|chill|sleep|meditat/.test(m)) return { volumeAdj: -6, preferred: ["Room Ambience", "Drone Bed", "Wind"] };
  if (/fun|funny|comedy|playful|cartoon/.test(m)) return { volumeAdj: 0, preferred: ["Pop", "Laugh", "Record Scratch", "Cash Register"] };
  if (/cinema|epic|dramatic|trailer/.test(m)) return { volumeAdj: 0, preferred: ["Riser", "Impact Hit", "Drone Bed", "Beat Drop"] };
  if (/energ|hype|party|sport/.test(m)) return { volumeAdj: 0, preferred: ["Impact Hit", "Crowd Cheer", "Beat Drop", "Applause"] };
  return { volumeAdj: 0, preferred: [] };
}

function matchSfx(action: string, moodPreferred: string[]): { entry: SfxEntry; matched: boolean } {
  const lower = action.toLowerCase();
  let best: SfxEntry | null = null;
  let bestHits = 0;
  for (const e of SFX_BANK) {
    const hits = e.keywords.filter((k) => lower.includes(k)).length;
    if (hits > bestHits) { bestHits = hits; best = e; }
  }
  if (best && bestHits > 0) return { entry: best, matched: true };
  // Mood fallback: pick the first bank entry from the preferred family list.
  for (const name of moodPreferred) {
    const e = SFX_BANK.find((x) => x.sfxType === name);
    if (e) return { entry: e, matched: true };
  }
  return { entry: FALLBACK, matched: false };
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  const mmm = String(Math.round(ms % 1000)).padStart(3, "0");
  return `${mm}:${ss}.${mmm}`;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const parsed = parseBeats(values.timelineBeats);
  if (typeof parsed === "string") return { ok: false, error: parsed };
  const beats = parsed;
  const mood = typeof values.mood === "string" ? values.mood.trim() : "";
  const { volumeAdj, preferred } = moodShift(mood);

  const warnings: string[] = [];
  for (let i = 1; i < beats.length; i++) {
    const gap = beats[i].timeMs - beats[i - 1].timeMs;
    if (gap < 300) {
      warnings.push(
        `Beats ${i} and ${i + 1} are only ${gap}ms apart — two SFX that close will blur into "mud" on most speakers. Space them out or drop one.`
      );
    }
  }

  const cues = beats.map((b, i) => {
    const { entry, matched } = matchSfx(b.action, preferred);
    let volumeDb = entry.volumeDb + volumeAdj;
    if (preferred.includes(entry.sfxType)) volumeDb = Math.min(-4, volumeDb + 3);
    volumeDb = Math.max(-30, Math.min(0, volumeDb));
    if (!matched) {
      warnings.push(
        `Beat ${i + 1} ("${b.action}"): no SFX type matched, so a generic UI Tick was assigned. Describe the moment more concretely (e.g. "door slams", "phone rings") for a better pick.`
      );
    }
    return {
      timeMs: b.timeMs,
      sfxType: entry.sfxType,
      searchTerms: entry.searchTerms,
      volumeDb,
    };
  });

  const lines: string[] = [
    "SFX CUE SHEET",
    "Generated by HusnainBlogger SFX Cue Sheet Generator.",
    "NOTE: This tool does NOT provide SFX audio files. Use the search terms below",
    "in a free library (Pixabay, Mixkit, YouTube Audio Library) and drop the",
    "files onto your timeline at the given timecodes. Volumes are mixing",
    "guidance estimates, not measured loudness.",
    "",
  ];
  for (const c of cues) {
    lines.push(
      `${formatTime(c.timeMs)}  ${c.sfxType}  ${c.volumeDb} dB`,
      `    search: ${c.searchTerms.map((t) => `"${t}"`).join(" / ")}`
    );
  }
  if (warnings.length > 0) {
    lines.push("", "MIX NOTES / WARNINGS:");
    for (const w of warnings) lines.push(`- ${w}`);
  }

  return { ok: true, values: { cues, cueSheetText: lines.join("\n"), warnings } };
}

// Exported for tests only (not used by the UI template).
export const SFX_BANK_SIZE = SFX_BANK.length;
