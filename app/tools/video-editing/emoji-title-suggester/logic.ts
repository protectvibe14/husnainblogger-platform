/**
 * Emoji Title Suggester — pure logic (zero imports, zero network, zero DOM).
 *
 * HONESTY: keyword->emoji mapping bank + placement rules. No AI — the tool
 * scans the title for fixed keyword lists, attaches the bank's emojis, and
 * fills any remaining slots from a fixed per-tone default set. Placement is
 * a fixed 3-variant rule (front / end / split). Emoji are real Unicode
 * emoji; rendering varies by OS/device, which the renderingNote says.
 *
 * Fixed content banks (documented per the builder honesty contract):
 * - KEYWORD_EMOJI: 16 keyword categories x 4 emojis each = 64 entries.
 *   Keywords are matched case-insensitively against the title, in bank
 *   order; matches are deduplicated deterministically.
 * - TONE_DEFAULTS: 3 tones (hype | calm | funny) x 5 emojis each = 15 entries.
 * - Total bank: 79 emoji entries (some overlap across categories, e.g. the
 *   fire emoji appears in both hype and fitness lists).
 * - PLACEMENTS: 3 fixed variants — "front" (all emojis first), "end" (all
 *   emojis last), "split" (first half front, rest end).
 *
 * Unicode-aware counting: ZWJ sequences (e.g. family or profession emoji
 * joined with U+200D) are counted as ONE emoji via the regex
 * /\p{Extended_Pictographic}(\u200D\p{Extended_Pictographic})*\/gu.
 * Emoji already present in the user's title count toward maxEmojis, so the
 * tool never exceeds the limit. Emoji-only titles are impossible because
 * titleText must be non-empty text (validation rejects blank input).
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export interface KeywordCategory {
  keywords: string[];
  emojis: string[];
}

const VALID_TONES = ["hype", "calm", "funny"];
const MAX_TITLE_CHARS = 120;
const MIN_EMOJIS = 1;
const MAX_EMOJIS = 5;
const DEFAULT_MAX_EMOJIS = 3;

/** Counts one emoji per match; ZWJ sequences count as a single emoji. */
const EMOJI_RE = /\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*/gu;

export function countEmojis(s: string): number {
  const m = s.match(EMOJI_RE);
  return m ? m.length : 0;
}

/** 16 keyword categories x 4 emojis. */
export const KEYWORD_EMOJI: KeywordCategory[] = [
  { keywords: ["money", "cash", "profit", "revenue", "income", "rich", "million", "dollar", "salary", "pay"], emojis: ["\u{1F4B0}", "\u{1F4B5}", "\u{1F4B8}", "\u{1F911}"] },
  { keywords: ["ai", "robot", "tech", "app", "software", "automation", "chatgpt", "artificial"], emojis: ["\u{1F916}", "\u{1F4BB}", "\u{1F680}", "\u26A1"] },
  { keywords: ["insane", "crazy", "epic", "viral", "best", "amazing", "shocking", "unbelievable"], emojis: ["\u{1F525}", "\u{1F4AF}", "\u{1F64C}", "\u2728"] },
  { keywords: ["food", "recipe", "cooking", "eat", "pizza", "burger", "snack", "restaurant"], emojis: ["\u{1F355}", "\u{1F354}", "\u{1F369}", "\u{1F60B}"] },
  { keywords: ["travel", "trip", "vacation", "beach", "flight", "destination", "hotel"], emojis: ["\u2708\uFE0F", "\u{1F3DD}\uFE0F", "\u{1F5FA}\uFE0F", "\u{1F4F8}"] },
  { keywords: ["fitness", "workout", "gym", "muscle", "exercise", "weight", "diet"], emojis: ["\u{1F4AA}", "\u{1F3CB}\uFE0F", "\u{1F3C3}", "\u{1F525}"] },
  { keywords: ["music", "song", "beat", "playlist", "dj", "remix", "album"], emojis: ["\u{1F3B5}", "\u{1F3A7}", "\u{1F3A4}", "\u{1F3B6}"] },
  { keywords: ["game", "gaming", "gamer", "fortnite", "minecraft", "ps5", "xbox"], emojis: ["\u{1F3AE}", "\u{1F579}\uFE0F", "\u{1F47E}", "\u{1F3C6}"] },
  { keywords: ["makeup", "beauty", "skincare", "fashion", "style", "outfit"], emojis: ["\u{1F484}", "\u{1F485}", "\u2728", "\u{1F48B}"] },
  { keywords: ["learn", "study", "school", "tutorial", "guide", "tips", "how"], emojis: ["\u{1F4DA}", "\u{1F393}", "\u{1F9E0}", "\u{1F4A1}"] },
  { keywords: ["business", "startup", "entrepreneur", "marketing", "sales", "growth"], emojis: ["\u{1F4C8}", "\u{1F4BC}", "\u{1F4CA}", "\u{1F91D}"] },
  { keywords: ["car", "auto", "vehicle", "driving", "tesla", "engine"], emojis: ["\u{1F697}", "\u{1F3CE}\uFE0F", "\u{1F527}", "\u26FD"] },
  { keywords: ["home", "house", "real", "estate", "interior", "apartment"], emojis: ["\u{1F3E0}", "\u{1F6CB}\uFE0F", "\u{1F3E1}", "\u{1F511}"] },
  { keywords: ["love", "dating", "relationship", "wedding", "couple", "romantic"], emojis: ["\u2764\uFE0F", "\u{1F495}", "\u{1F60D}", "\u{1F491}"] },
  { keywords: ["photo", "camera", "video", "vlog", "youtube", "tiktok", "reel"], emojis: ["\u{1F4F7}", "\u{1F933}", "\u{1F3A5}", "\u{1F4F1}"] },
  { keywords: ["mistake", "warning", "avoid", "scam", "fail", "stop", "never"], emojis: ["\u26A0\uFE0F", "\u{1F6AB}", "\u274C", "\u{1F631}"] },
];

/** 3 tones x 5 default emojis. */
export const TONE_DEFAULTS: Record<string, string[]> = {
  hype: ["\u{1F525}", "\u{1F680}", "\u{1F4AF}", "\u{1F92F}", "\u26A1"],
  calm: ["\u2728", "\u{1F331}", "\u{1F343}", "\u{1F4A7}", "\u{1F319}"],
  funny: ["\u{1F602}", "\u{1F923}", "\u{1F61C}", "\u{1F643}", "\u{1F480}"],
};

export const PLACEMENTS = ["front", "end", "split"] as const;

function coerceInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isInteger(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isInteger(n)) return n;
  }
  return null;
}

/** Pick emojis for the title: keyword matches first (bank order), then tone defaults. */
export function pickEmojis(titleText: string, tone: string, maxEmojis: number): string[] {
  const lower = titleText.toLowerCase();
  const picked: string[] = [];
  for (const cat of KEYWORD_EMOJI) {
    if (picked.length >= maxEmojis) break;
    if (cat.keywords.some((k) => lower.includes(k))) {
      for (const e of cat.emojis) {
        if (picked.length >= maxEmojis) break;
        if (picked.indexOf(e) === -1) picked.push(e);
      }
    }
  }
  for (const e of TONE_DEFAULTS[tone]) {
    if (picked.length >= maxEmojis) break;
    if (picked.indexOf(e) === -1) picked.push(e);
  }
  return picked;
}

export function applyPlacement(titleText: string, emojis: string[], placement: "front" | "end" | "split"): string {
  const run = emojis.join("");
  if (placement === "front") return `${run} ${titleText}`;
  if (placement === "end") return `${titleText} ${run}`;
  const half = Math.ceil(emojis.length / 2);
  const front = emojis.slice(0, half).join("");
  const back = emojis.slice(half).join("");
  return `${front} ${titleText} ${back}`;
}

export function runTool(values: Record<string, unknown>): ToolResult {
  const titleRaw = values["titleText"];
  const tone = values["tone"];

  if (typeof titleRaw !== "string" || titleRaw.trim() === "") {
    return { ok: false, error: "Please enter your video title text." };
  }
  const titleText = titleRaw.trim();
  if (titleText.length > MAX_TITLE_CHARS) {
    return { ok: false, error: `Title text must be ${MAX_TITLE_CHARS} characters or fewer.` };
  }
  if (typeof tone !== "string" || VALID_TONES.indexOf(tone) === -1) {
    return { ok: false, error: "Please choose a tone: hype, calm, or funny." };
  }

  let maxEmojis = DEFAULT_MAX_EMOJIS;
  if (values["maxEmojis"] !== undefined && values["maxEmojis"] !== null && values["maxEmojis"] !== "") {
    const n = coerceInt(values["maxEmojis"]);
    if (n === null) {
      return { ok: false, error: "Max emojis must be a whole number." };
    }
    if (n < MIN_EMOJIS || n > MAX_EMOJIS) {
      return { ok: false, error: `Max emojis must be between ${MIN_EMOJIS} and ${MAX_EMOJIS}.` };
    }
    maxEmojis = n;
  }

  // Emoji already in the title count toward the limit (Unicode-aware, ZWJ = one).
  const existingCount = countEmojis(titleText);
  const slotsLeft = Math.max(0, maxEmojis - existingCount);
  const picked = pickEmojis(titleText, tone, slotsLeft);

  const suggestions: string[] = (PLACEMENTS as readonly string[]).map((placement) => {
    const title = applyPlacement(titleText, picked, placement as "front" | "end" | "split");
    return `"${title}" — emojis: ${picked.length > 0 ? picked.join(" ") : "(none — title already at the limit)"} — placement: ${placement}`;
  });

  return {
    ok: true,
    values: {
      suggestions,
      renderingNote:
        "Emoji designs vary by device and platform (Apple, Google, Samsung render the same codepoint differently), so always preview your title on a phone. ZWJ sequences (e.g. family or profession emoji) are counted as one emoji here. Emoji never replace keywords — search still reads the text, so keep your main keyword in words.",
    },
  };
}
