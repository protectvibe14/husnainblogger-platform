/**
 * Music Mood Matcher — pure logic (tool-137).
 *
 * DESCRIPTOR MAPPING, NOT A MUSIC PROVIDER: this module matches a mood +
 * video segment to royalty-free music CATEGORIES and library search terms.
 * It does not stream, download, license, or attach any audio file. Every
 * result carries a copyright-safe sourcing reminder.
 *
 * Static bank sizes (documented, fixed):
 *   - MOODS: 10 entries (energetic, calm, dramatic, uplifting, suspenseful,
 *     funny, emotional, inspirational, chill, intense). Each mood has:
 *     tempo label + BPM range, 3 genre descriptors, 3 instrumentation
 *     descriptors, 5 library search terms, 1 usage tip.
 *   - SEGMENTS: 6 entries (intro, main-content, transition, b-roll,
 *     explainer, outro). Each adds 1-2 placement notes.
 *
 * Deterministic: same (mood, segment) always returns the same brief.
 * Zero imports, zero DOM, zero network.
 */

/** Tempo descriptor for a mood: label + honest BPM range (guidance, not a rule). */
export interface MoodTempo {
  label: string;
  bpmRange: string;
}

export interface MoodProfile {
  id: string;
  label: string;
  tempo: MoodTempo;
  genres: string[];
  instruments: string[];
  searchTerms: string[];
  usageTip: string;
}

export interface SegmentProfile {
  id: string;
  label: string;
  placementNotes: string[];
}

export const MOODS: MoodProfile[] = [
  {
    id: "energetic",
    label: "Energetic",
    tempo: { label: "Upbeat, driving", bpmRange: "120–140 BPM" },
    genres: ["upbeat pop-rock", "funk", "EDM / dance"],
    instruments: ["electric guitar riffs", "punchy drums", "driving bass"],
    searchTerms: [
      "upbeat energetic background music royalty free",
      "driving pop rock instrumental",
      "funk upbeat no copyright music",
      "EDM energetic vlog background",
      "positive high energy corporate music",
    ],
    usageTip:
      "Keep energetic tracks under your voiceover — side-chain or duck the volume so speech stays clear.",
  },
  {
    id: "calm",
    label: "Calm",
    tempo: { label: "Slow, spacious", bpmRange: "60–80 BPM" },
    genres: ["ambient", "soft piano", "lo-fi chill"],
    instruments: ["soft piano", "ambient pads", "gentle guitar"],
    searchTerms: [
      "calm ambient background music royalty free",
      "soft piano background no copyright",
      "lo-fi chill study music",
      "peaceful ambient instrumental",
      "relaxing background music vlog",
    ],
    usageTip:
      "Calm music works best at low volume under narration; it should be felt more than heard.",
  },
  {
    id: "dramatic",
    label: "Dramatic",
    tempo: { label: "Building, tense", bpmRange: "90–120 BPM" },
    genres: ["cinematic orchestral", "epic trailer", "dark cinematic"],
    instruments: ["strings ensemble", "deep percussion", "brass swells"],
    searchTerms: [
      "dramatic cinematic background music royalty free",
      "epic orchestral no copyright",
      "dark cinematic tension music",
      "trailer epic instrumental royalty free",
      "building suspense cinematic music",
    ],
    usageTip:
      "Time dramatic swells to your reveal moment — a 1-second silence before the swell hits doubles the impact.",
  },
  {
    id: "uplifting",
    label: "Uplifting",
    tempo: { label: "Bright, forward-moving", bpmRange: "100–120 BPM" },
    genres: ["acoustic pop", "corporate motivational", "indie folk"],
    instruments: ["acoustic guitar", "handclaps", "bright piano"],
    searchTerms: [
      "uplifting background music royalty free",
      "acoustic inspirational no copyright",
      "corporate motivational upbeat music",
      "indie folk happy background",
      "feel good positive music vlog",
    ],
    usageTip:
      "Uplifting tracks pair well with success stories, reveals, and transformation montages.",
  },
  {
    id: "suspenseful",
    label: "Suspenseful",
    tempo: { label: "Uneasy, pulsing", bpmRange: "80–110 BPM" },
    genres: ["dark ambient", "tension beds", "horror atmospheric"],
    instruments: ["low drones", "pulsing synth", "subtle dissonant strings"],
    searchTerms: [
      "suspenseful background music royalty free",
      "dark ambient tension no copyright",
      "creepy atmospheric background",
      "mystery tension music instrumental",
      "horror suspense ambient bed",
    ],
    usageTip:
      "Suspense music is a seasoning, not a meal — use it in short bursts around reveals, then get out.",
  },
  {
    id: "funny",
    label: "Funny",
    tempo: { label: "Bouncy, playful", bpmRange: "110–130 BPM" },
    genres: ["comedy quirky", "vaudeville", "playful swing"],
    instruments: ["ukulele", "tuba stabs", "whistling"],
    searchTerms: [
      "funny background music royalty free",
      "quirky comedy no copyright music",
      "playful ukulele background",
      "vaudeville comedy instrumental",
      "silly bouncy background music",
    ],
    usageTip:
      "Comedy music telegraphs the joke — drop it out right before the punchline for maximum effect.",
  },
  {
    id: "emotional",
    label: "Emotional",
    tempo: { label: "Slow, expressive", bpmRange: "60–90 BPM" },
    genres: ["sad piano", "strings ballad", "post-rock ballad"],
    instruments: ["solo piano", "cello", "swelling strings"],
    searchTerms: [
      "emotional background music royalty free",
      "sad piano no copyright",
      "cinematic strings emotional",
      "heartfelt ballad instrumental",
      "touching background music vlog",
    ],
    usageTip:
      "Let emotional music carry pauses in your narration — silence plus strings is stronger than either alone.",
  },
  {
    id: "inspirational",
    label: "Inspirational",
    tempo: { label: "Rising, hopeful", bpmRange: "100–125 BPM" },
    genres: ["cinematic motivational", "epic uplifting", "anthemic pop"],
    instruments: ["piano arpeggios", "full strings", "epic drums"],
    searchTerms: [
      "inspirational background music royalty free",
      "motivational cinematic no copyright",
      "epic uplifting instrumental",
      "hopeful rising background music",
      "anthemic motivational music",
    ],
    usageTip:
      "Inspirational tracks work best when the music's build matches your story's arc — end on the climax, not the fade.",
  },
  {
    id: "chill",
    label: "Chill",
    tempo: { label: "Laid-back groove", bpmRange: "70–90 BPM" },
    genres: ["lo-fi hip-hop", "chillhop", "jazz bossa"],
    instruments: ["vinyl piano", "jazzy drums", "warm bass"],
    searchTerms: [
      "chill lo-fi background music royalty free",
      "chillhop beats no copyright",
      "lofi hip hop study beats",
      "jazz bossa background instrumental",
      "relaxed groove background music",
    ],
    usageTip:
      "Chill/lo-fi tracks loop cleanly — great for long talking-head segments, just watch for repetition fatigue past 5 minutes.",
  },
  {
    id: "intense",
    label: "Intense",
    tempo: { label: "Hard, aggressive", bpmRange: "130–160 BPM" },
    genres: ["phonk", "hard trap", "industrial rock"],
    instruments: ["distorted 808s", "aggressive synths", "double-kick drums"],
    searchTerms: [
      "intense background music royalty free",
      "phonk aggressive no copyright",
      "hard trap instrumental royalty free",
      "intense workout background music",
      "dark aggressive cinematic music",
    ],
    usageTip:
      "Intense music raises perceived pace — use it for montages and action beats, never under long explanations.",
  },
];

export const SEGMENTS: SegmentProfile[] = [
  {
    id: "intro",
    label: "Intro / hook (first 15s)",
    placementNotes: [
      "Pick a track whose hook lands within 2–3 seconds — long fades lose viewers.",
      "Consider a 3-second sting instead of a full song for fast hooks.",
    ],
  },
  {
    id: "main-content",
    label: "Main content / talking head",
    placementNotes: [
      "Choose a track with a steady loop and no sudden drops — it must sit under speech.",
      "Keep it at least 10 dB below your voiceover.",
    ],
  },
  {
    id: "transition",
    label: "Transition between sections",
    placementNotes: [
      "Short risers, whooshes, and 2–4 second stings work better than full tracks here.",
      "Match the transition mood to the NEXT section, not the one ending.",
    ],
  },
  {
    id: "b-roll",
    label: "B-roll montage",
    placementNotes: [
      "Montages carry music-forward mixes — let the beat lead and cut visuals on beat.",
      "Cut the montage on beat drops for a professional feel.",
    ],
  },
  {
    id: "explainer",
    label: "Tutorial / explainer walkthrough",
    placementNotes: [
      "Pick neutral, repetitive beds — novelty in the music distracts from instructions.",
      "Avoid lyrics anywhere near tutorial steps.",
    ],
  },
  {
    id: "outro",
    label: "Outro / call to action",
    placementNotes: [
      "The CTA needs a track that lifts, not one that fades — end on energy.",
      "Keep the last 5–20 seconds clear of talking over end-screen cards.",
    ],
  },
];

/** Honest sourcing reminder attached to every result. */
export const COPYRIGHT_REMINDER =
  "This tool suggests music categories and search terms only — it does not provide audio files or licenses. " +
  "Only use tracks you have licensed or that are explicitly royalty-free from sources like the YouTube Audio Library. " +
  "Never use commercial songs from the radio, movies, or other creators' videos without permission.";

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * runTool adapter (mountToolUI generator template).
 * Validates { mood, segment }; returns { musicBrief, searchTerms, copyrightReminder }.
 * Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Choose a mood and a video segment to get music suggestions." };
  }
  const moodRaw = values["mood"];
  const segmentRaw = values["segment"];

  const mood = MOODS.find((m) => m.id === moodRaw);
  if (typeof moodRaw !== "string" || !mood) {
    return {
      ok: false,
      error: `Mood is required. Choose one of: ${MOODS.map((m) => m.id).join(", ")}.`,
    };
  }
  const segment = SEGMENTS.find((s) => s.id === segmentRaw);
  if (typeof segmentRaw !== "string" || !segment) {
    return {
      ok: false,
      error: `Video segment is required. Choose one of: ${SEGMENTS.map((s) => s.id).join(", ")}.`,
    };
  }

  const briefLines = [
    `Music brief — ${mood.label} for your ${segment.label.toLowerCase()}:`,
    `Tempo: ${mood.tempo.label} (${mood.tempo.bpmRange}).`,
    `Genre directions: ${mood.genres.join(" · ")}.`,
    `Instrumentation to look for: ${mood.instruments.join(", ")}.`,
    `Tip: ${mood.usageTip}`,
    `Placement: ${segment.placementNotes.join(" ")}`,
    ``,
    `Copy any search term below into a royalty-free music library (e.g. the YouTube Audio Library) to find actual tracks.`,
  ];

  return {
    ok: true,
    values: {
      musicBrief: briefLines.join("\n"),
      searchTerms: [...mood.searchTerms],
      copyrightReminder: COPYRIGHT_REMINDER,
    },
  };
}
