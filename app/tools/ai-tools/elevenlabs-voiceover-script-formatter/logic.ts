/**
 * ElevenLabs Voiceover Script Formatter — pure logic (tool-527), zero
 * imports, zero network, zero DOM.
 *
 * HONESTY CONTRACT: this is a deterministic text transformer. It does NOT
 * synthesize speech, does NOT call ElevenLabs, and no AI model is involved.
 * Break tags are suggestions you can edit; the duration is a rough estimate
 * (labels say so), not a prediction of any voice's actual pacing.
 *
 * Fixed rules (documented):
 *  - LONG_SENTENCE_CHARS = 180  -> sentence gets a <break time="0.5s"/>
 *  - Paragraph boundary        -> <break time="1.0s"/>
 *  - ALL-CAPS words (2+ letters) are flagged for review
 *  - Abbreviations matching PRONUNCIATION_HINTS get a say-as suggestion
 *  - Duration estimate = chars / CHARS_PER_MIN (850), labeled "estimate"
 */

/** Sentences at or above this length get a short pause suggestion. */
export const LONG_SENTENCE_CHARS = 180;
/** Characters per minute used for the duration estimate (labeled estimate). */
export const CHARS_PER_MIN = 850;
export const MAX_SCRIPT_LENGTH = 20000;

/** Fixed abbreviation -> suggested spoken form. */
export const PRONUNCIATION_HINTS: Record<string, string> = {
  AI: "A. I.",
  CEO: "C. E. O.",
  URL: "U. R. L.",
  API: "A. P. I.",
  FAQ: "F. A. Q.",
  SEO: "S. E. O.",
  TTS: "T. T. S.",
  ASAP: "A. S. A. P.",
  ETA: "E. T. A.",
  DIY: "D. I. Y.",
  GIF: "gif",
  JPEG: "J. peg",
  HTML: "H. T. M. L.",
  CSS: "C. S. S.",
};

export interface FormatResult {
  formattedScript: string;
  flags: string[];
  pronunciationHints: string[];
  estimatedDurationSec: number;
  estimatedDurationLabel: string;
  wordCount: number;
  charCount: number;
}

export function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "\n")
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function splitSentences(paragraph: string): string[] {
  return paragraph
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function findAllCapsWords(text: string): string[] {
  const matches = text.match(/\b[A-Z]{2,}\b/g) || [];
  return [...new Set(matches)];
}

export function findHintedAbbreviations(text: string): string[] {
  const words = new Set(text.match(/\b[A-Za-z][A-Za-z.]{1,}\b/g) || []);
  return Object.keys(PRONUNCIATION_HINTS).filter((abbr) =>
    [...words].some((w) => w.replace(/\./g, "") === abbr),
  );
}

/**
 * Deterministically format the script. Same input -> same output.
 */
export function formatScript(raw: string): FormatResult {
  const clean = stripHtml(raw);
  const paragraphs = clean.split("\n").filter((p) => p.trim().length > 0);

  const outParts: string[] = [];
  paragraphs.forEach((para, pi) => {
    const sentences = splitSentences(para);
    sentences.forEach((sentence, si) => {
      outParts.push(sentence);
      if (sentence.length >= LONG_SENTENCE_CHARS) {
        outParts.push('<break time="0.5s"/>');
      } else if (si < sentences.length - 1) {
        outParts.push(" ");
      }
    });
    if (pi < paragraphs.length - 1) {
      outParts.push('\n<break time="1.0s"/>\n');
    }
  });

  const formattedScript = outParts.join("").replace(/ {2,}/g, " ");

  const caps = findAllCapsWords(clean);
  const flags: string[] = caps.map(
    (w) => `ALL-CAPS word "${w}" — check how it should be spoken (spell out vs. word).`,
  );
  const bareAbbreviations = findAllCapsWords(clean).filter(
    (w) => !Object.prototype.hasOwnProperty.call(PRONUNCIATION_HINTS, w),
  );
  for (const w of bareAbbreviations) {
    if (!flags.some((f) => f.includes(`"${w}"`))) {
      flags.push(`Abbreviation "${w}" — consider a spelling-out hint.`);
    }
  }

  const pronunciationHints = findHintedAbbreviations(clean).map(
    (abbr) => `"${abbr}" → suggest speaking as "${PRONUNCIATION_HINTS[abbr]}".`,
  );

  const charCount = clean.replace(/\s/g, "").length;
  const estimatedDurationSec = Math.round((charCount / CHARS_PER_MIN) * 60);
  const mins = Math.floor(estimatedDurationSec / 60);
  const secs = estimatedDurationSec % 60;
  const estimatedDurationLabel =
    `${mins}m ${secs}s (estimate at ~${CHARS_PER_MIN} chars/min)`;

  return {
    formattedScript,
    flags,
    pronunciationHints,
    estimatedDurationSec,
    estimatedDurationLabel,
    wordCount: clean.split(/\s+/).filter((w) => w.length > 0).length,
    charCount,
  };
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.rawScript: string, required, 1-20000 chars after cleaning.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values["rawScript"];
  if (raw === undefined || raw === null || raw === "") {
    return { ok: false, error: "Please paste your script text." };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: "Script must be text." };
  }
  const clean = stripHtml(raw);
  if (clean.length === 0) {
    return { ok: false, error: "Please paste your script text." };
  }
  if (clean.length > MAX_SCRIPT_LENGTH) {
    return {
      ok: false,
      error: `Script must be ${MAX_SCRIPT_LENGTH} characters or fewer.`,
    };
  }

  const r = formatScript(raw);
  return {
    ok: true,
    values: {
      formattedScript: r.formattedScript,
      flags: r.flags,
      pronunciationHints: r.pronunciationHints,
      estimatedDuration: r.estimatedDurationLabel,
      estimatedDurationSec: r.estimatedDurationSec,
      wordCount: r.wordCount,
      charCount: r.charCount,
    },
  };
}
