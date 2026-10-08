/**
 * TikTok Cover Text Idea Generator — pure logic (tool-174). Zero imports,
 * zero network, zero DOM, zero randomness.
 *
 * WORD BANK ENGINE (text templates; does NOT render covers):
 *   - COVER_BANK: 20 hand-written cover/thumbnail text templates with a
 *     {topic} placeholder. The topic is inserted in UPPERCASE (cover text
 *     is big bold text).
 *   - Every cover line is guaranteed <= 25 characters (cover readability
 *     guidance): if the topic is too long to fit, it is trimmed at a word
 *     boundary so the guarantee always holds.
 *   - Clickbait check (spec edge case): templates flagged `clickbait: true`
 *     get an `honestAlt` suggestion; the output marks the line and offers
 *     the honest variant in the copy-all text.
 *   - Selection is deterministic: a djb2 hash of the (lowercased, trimmed)
 *     topic picks the starting offset; 8 templates are taken in bank order.
 *   - This tool NEVER renders covers and NEVER claims AI.
 */

/** Cover readability guidance: keep cover lines at or under this many characters. */
export const COVER_MAX_CHARS = 25;

export interface CoverTemplate {
  /** Template with a {topic} placeholder. */
  template: string;
  /** True when the template is clickbait-adjacent and needs an honest alternative. */
  clickbait: boolean;
  /** Honest alternative for clickbait templates (also <= 25 chars when filled). */
  honestAlt?: string;
}

/**
 * 20-entry static cover-text bank. Templates containing hype words
 * (secret, never, shocking, ...) are flagged clickbait with an honest
 * alternative — the tool suggests honesty instead of tricking the viewer.
 */
export const COVER_BANK: CoverTemplate[] = [
  { template: "{T} IN 60 SECONDS", clickbait: false },
  { template: "{T} FOR BEGINNERS", clickbait: false },
  { template: "3 {T} MISTAKES", clickbait: false },
  { template: "I TRIED {T} FOR 30 DAYS", clickbait: false },
  { template: "{T} CHEAT SHEET", clickbait: false },
  { template: "STOP DOING {T} WRONG", clickbait: false },
  { template: "{T} STEP BY STEP", clickbait: false },
  { template: "THE {T} SECRET THEY HIDE", clickbait: true, honestAlt: "{T} TIP THAT HELPED ME" },
  { template: "BEST {T} UNDER $20", clickbait: false },
  { template: "{T}: BEFORE VS AFTER", clickbait: false },
  { template: "THE {T} TRICK YOU MISSED", clickbait: true, honestAlt: "A {T} TRICK WORTH TRYING" },
  { template: "{T} IN 3 STEPS", clickbait: false },
  { template: "SHOCKING {T} RESULTS", clickbait: true, honestAlt: "MY REAL {T} RESULTS" },
  { template: "WHY {T} FAILS", clickbait: false },
  { template: "{T} MYTHS BUSTED", clickbait: false },
  { template: "UNPOPULAR {T} OPINION", clickbait: true, honestAlt: "MY HONEST {T} TAKE" },
  { template: "{T} ON A BUDGET", clickbait: false },
  { template: "EASY {T} WIN", clickbait: false },
  { template: "{T} QUESTIONS ANSWERED", clickbait: false },
  { template: "DO THIS {T} DAILY", clickbait: false },
];

/** Number of templates in the static bank (documented for QA). */
export const BANK_SIZE = COVER_BANK.length; // 20

/** Cover ideas returned per run. */
export const IDEAS_COUNT = 8;

/** Marker appended in the copy-all text for clickbait-flagged lines. */
export const CLICKBAIT_NOTE = "honest version";

/** djb2 string hash — deterministic rotation offset. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/**
 * Fill a template with the (uppercased) topic. If the filled line would
 * exceed COVER_MAX_CHARS, the topic is trimmed at a word boundary first so
 * the 25-char guarantee always holds.
 */
export function fillCover(template: string, topic: string): string {
  const upper = topic.toUpperCase();
  const filled = template.replace(/\{T\}/g, upper);
  if (filled.length <= COVER_MAX_CHARS) return filled;
  const overBy = filled.length - COVER_MAX_CHARS;
  const trimmed = upper
    .slice(0, Math.max(1, upper.length - overBy))
    .replace(/[\s\-–—]+[^\s\-–—]*$/, "");
  let result = template.replace(/\{T\}/g, trimmed.length > 0 ? trimmed : upper.slice(0, 1));
  // Belt-and-braces: if the template's fixed text alone exceeds the limit,
  // trim the whole line at a word boundary so the guarantee always holds.
  if (result.length > COVER_MAX_CHARS) {
    result = result.slice(0, COVER_MAX_CHARS).replace(/[\s\-–—]+[^\s\-–—]*$/, "");
    if (result.length === 0) result = filled.slice(0, COVER_MAX_CHARS);
  }
  return result;
}

export interface CoverResult {
  ok: boolean;
  values?: { covers: string[]; copyAll: string };
  error?: string;
}

/**
 * Generate cover text ideas for a video topic. Same topic always returns
 * the same 8 ideas.
 */
export function runTool(values: Record<string, unknown>): CoverResult {
  const rawTopic = values["videoTopic"];
  if (typeof rawTopic !== "string" || rawTopic.trim().length === 0) {
    return { ok: false, error: "Please enter your video topic first." };
  }
  const videoTopic = rawTopic.trim();
  if (videoTopic.length > 60) {
    return { ok: false, error: "The video topic is too long — keep it under 60 characters." };
  }

  const offset = hashString(videoTopic.toLowerCase()) % BANK_SIZE;
  const covers: string[] = [];
  const copyLines: string[] = [];

  for (let i = 0; i < IDEAS_COUNT; i++) {
    const entry = COVER_BANK[(offset + i) % BANK_SIZE];
    const line = fillCover(entry.template, videoTopic);
    covers.push(line);
    if (entry.clickbait && entry.honestAlt) {
      const alt = fillCover(entry.honestAlt, videoTopic);
      copyLines.push(`${line} — ${CLICKBAIT_NOTE}: ${alt}`);
    } else {
      copyLines.push(line);
    }
  }

  return {
    ok: true,
    values: {
      covers,
      copyAll: copyLines.join("\n"),
    },
  };
}
