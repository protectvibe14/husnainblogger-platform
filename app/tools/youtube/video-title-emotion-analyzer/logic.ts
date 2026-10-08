/**
 * Video Title Emotion Analyzer — lexicon-based word matching (NOT AI, NOT
 * sentiment analysis, NOT a predictor of viewer emotion or click-through).
 *
 * The engine matches the title against a FIXED English word list and reports
 * per-emotion hit counts plus a dominant emotion. It is a labeled heuristic:
 * word presence is not proof of emotional impact.
 *
 * Fixed lexicon (documented sizes — 103 words total, 6 categories):
 * - curiosity: 21 words
 * - power: 17 words
 * - urgency: 15 words
 * - fear: 18 words
 * - joy: 16 words
 * - trust: 16 words
 *
 * Matching rules (deterministic):
 * - Case-insensitive, word-boundary matching (\b).
 * - Longer entries are checked before shorter ones and consumed, so
 *   "beginner-friendly" counts once (it does not also count "beginner").
 * - A word counts once per category even if it appears multiple times.
 * - Dominant emotion = highest hit count; ties break toward the earlier
 *   category in EMOTION_ORDER; zero hits everywhere = "neutral".
 *
 * Pure: no imports, no DOM, no network, no randomness.
 */

const EMOTION_ORDER = ["curiosity", "power", "urgency", "fear", "joy", "trust"] as const;
type Emotion = (typeof EMOTION_ORDER)[number];

const LEXICON: Record<Emotion, readonly string[]> = {
  curiosity: [
    "secret", "secrets", "hidden", "mystery", "revealed", "reveal", "truth",
    "why", "what", "how", "shocking", "unbelievable", "bizarre", "strange",
    "unknown", "expose", "exposed", "finally", "nobody", "never", "behind",
  ],
  power: [
    "best", "ultimate", "pro", "master", "dominate", "powerful", "proven",
    "guaranteed", "insane", "epic", "massive", "elite", "top", "destroy",
    "crushing", "unstoppable", "conquer",
  ],
  urgency: [
    "now", "today", "hurry", "fast", "quick", "instant", "immediately",
    "limited", "deadline", "before", "ending", "expires", "last chance",
    "don't miss", "asap",
  ],
  fear: [
    "mistake", "mistakes", "warning", "danger", "dangerous", "fail", "failure",
    "avoid", "scam", "risk", "risky", "lose", "losing", "broke", "disaster",
    "nightmare", "trap", "worst",
  ],
  joy: [
    "amazing", "awesome", "happy", "love", "fun", "incredible", "beautiful",
    "stunning", "win", "winning", "celebrate", "free", "easy", "success",
    "dream", "perfect",
  ],
  trust: [
    "honest", "real", "true", "official", "expert", "guide", "tutorial",
    "review", "tested", "verified", "science", "data", "evidence",
    "step-by-step", "beginner", "beginner-friendly",
  ],
};

const TITLE_MAX_LENGTH = 200;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface EmotionResult {
  hits: string[];
  count: number;
}

/** Match a title against the lexicon; returns per-emotion matched words. */
function analyzeTitle(title: string): Record<Emotion, EmotionResult> {
  let working = title.toLowerCase();
  const out = {} as Record<Emotion, EmotionResult>;

  for (const emotion of EMOTION_ORDER) {
    const hits: string[] = [];
    // Longer entries first so multi-word/subsumed entries consume their text.
    const words = [...LEXICON[emotion]].sort((a, b) => b.length - a.length);
    for (const word of words) {
      const re = new RegExp(`\\b${escapeRegExp(word)}\\b`);
      if (re.test(working)) {
        hits.push(word);
        working = working.replace(re, " ".repeat(word.length));
      }
    }
    // Restore lexicon order in the reported hits for determinism.
    hits.sort((a, b) => LEXICON[emotion].indexOf(a) - LEXICON[emotion].indexOf(b));
    out[emotion] = { hits, count: hits.length };
  }
  return out;
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  const raw = values["videoTitle"];

  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { ok: false, error: "Enter a video title to analyze first." };
  }
  const title = raw.trim();
  if (title.length > TITLE_MAX_LENGTH) {
    return {
      ok: false,
      error: `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`,
    };
  }

  const results = analyzeTitle(title);
  const totalHits = EMOTION_ORDER.reduce((n, e) => n + results[e].count, 0);

  let dominant: string = "neutral";
  let best = 0;
  for (const emotion of EMOTION_ORDER) {
    if (results[emotion].count > best) {
      best = results[emotion].count;
      dominant = emotion;
    }
  }

  const emotionProfile: string[] = EMOTION_ORDER.map((emotion) => {
    const r = results[emotion];
    return r.count > 0
      ? `${emotion}: ${r.count} (${r.hits.join(", ")})`
      : `${emotion}: 0`;
  });

  // Suggestions: for weak profiles (<2 total hits), offer one fixed word from
  // up to 3 emotion categories that had no hits — deterministic, from the bank.
  const suggestions: string[] = [];
  if (totalHits < 2) {
    for (const emotion of EMOTION_ORDER) {
      if (suggestions.length >= 3) break;
      if (results[emotion].count === 0) {
        suggestions.push(
          `Add ${emotion}: try a word like “${LEXICON[emotion][0]}” in your title.`,
        );
      }
    }
  }

  return {
    ok: true,
    values: {
      emotionProfile,
      dominantEmotion: dominant,
      suggestions,
      note:
        "Heuristic only: matches your title against a fixed 103-word English list. " +
        "It is not AI, not sentiment analysis, and does not predict how viewers will feel or click.",
    },
  };
}
