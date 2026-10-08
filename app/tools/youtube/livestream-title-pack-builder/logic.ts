/**
 * Livestream Title Pack Builder (tool-126) — pure logic, zero imports, zero
 * network, zero DOM, no Math.random.
 *
 * TEMPLATE PACKS, NOT AI. For each item (stream topic + stream type) the
 * tool fills the topic into fixed title templates across the three stream
 * phases — announcement (pre-live), live, replay — plus one fixed
 * description snippet per item. Nothing is written by a language model;
 * the creator picks the variant that fits their stream.
 *
 * Pack per item (6 titles + 1 description):
 *   [Announcement] x2, [Live] x2, [Replay] x2, description snippet.
 * Every generated title is validated to be <= 100 characters (YouTube's
 * title limit); over-long topics fail with a per-item error telling the
 * creator to shorten the topic.
 *
 * Stream types (fixed list, matched case-insensitively with a few aliases):
 *   q&a, gaming, talk, tutorial.
 * Deterministic: same items -> same packs, always.
 */

/** Canonical stream types. */
export const STREAM_TYPES = ["q&a", "gaming", "talk", "tutorial"] as const;

export type StreamType = (typeof STREAM_TYPES)[number];

/** Display labels per type. */
export const TYPE_LABELS: Record<StreamType, string> = {
  "q&a": "Q&A",
  gaming: "Gaming",
  talk: "Talk",
  tutorial: "Tutorial",
};

/** Lowercase aliases accepted for each type. */
const TYPE_ALIASES: Record<StreamType, string[]> = {
  "q&a": ["q&a", "q and a", "qa", "qna", "ama"],
  gaming: ["gaming", "game", "games", "gamer"],
  talk: ["talk", "talking", "chat", "podcast", "discussion"],
  tutorial: ["tutorial", "how to", "howto", "guide", "walkthrough"],
};

/** "What to expect" line per type, used in the description snippet. */
const EXPECT_LINES: Record<StreamType, string> = {
  "q&a": "your questions answered live",
  gaming: "gameplay, tips, and chat play-alongs",
  talk: "an open conversation with the community",
  tutorial: "a step-by-step walkthrough you can follow along",
};

/** Hashtag fragment per type (lowercase, no spaces). */
const HASHTAGS: Record<StreamType, string> = {
  "q&a": "qa",
  gaming: "gaming",
  talk: "talk",
  tutorial: "tutorial",
};

/** YouTube title limit in characters (code points). */
export const MAX_TITLE_CHARS = 100;

export interface StreamItem {
  topic: string;
  streamType: string;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Code-point length (emoji count as one character). */
function charLen(s: string): number {
  return [...s].length;
}

/** Normalize a raw stream-type string to a canonical type, or null. */
export function normalizeStreamType(raw: unknown): StreamType | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim().toLowerCase().replace(/\s+/g, " ");
  for (const type of STREAM_TYPES) {
    if (TYPE_ALIASES[type].includes(t)) return type;
  }
  return null;
}

/**
 * Build the title pack for one validated item. Exported for tests.
 * Throws when a generated title would exceed MAX_TITLE_CHARS.
 */
export function buildPack(topic: string, type: StreamType): {
  titles: string[];
  description: string;
} {
  const label = TYPE_LABELS[type];
  const lower = label.toLowerCase();
  const titles = [
    `[Announcement] 🔴 Going LIVE soon: ${topic} | ${label} stream`,
    `[Announcement] Don't miss it: ${topic} — ${lower} stream starting soon`,
    `[Live] ${topic} — LIVE NOW (${label})`,
    `[Live] 🔴 LIVE: ${topic} | ${label} — join the chat`,
    `[Replay] ${topic} (${label} replay)`,
    `[Replay] Missed it? ${topic} — full ${lower} replay`,
  ];
  for (const t of titles) {
    if (charLen(t) > MAX_TITLE_CHARS) {
      throw new Error(
        `topic too long — the "${t.slice(0, 40)}…" title would exceed ${MAX_TITLE_CHARS} characters. Shorten the topic.`,
      );
    }
  }
  const description =
    `We're live: ${topic}! Drop your questions in the chat 👇\n\n` +
    `What to expect: ${EXPECT_LINES[type]}.\n\n` +
    `#livestream #${HASHTAGS[type]} #youtube`;
  return { titles, description };
}

/**
 * runTool — builder dispatch shape.
 * args in:  { items: [{ topic, streamType }] }
 * values out: { titles, descriptions, count }
 */
export function runTool(args: { items: Record<string, unknown>[] }): RunToolResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Add at least one stream (topic + stream type)." };
  }

  const titles: string[] = [];
  const descriptions: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const n = i + 1;
    const raw = items[i];
    if (!raw || typeof raw !== "object") {
      return { ok: false, error: `Item ${n}: missing stream details.` };
    }
    const topic = typeof raw["topic"] === "string" ? raw["topic"].trim() : "";
    if (!topic) {
      return { ok: false, error: `Item ${n}: enter a stream topic.` };
    }
    const type = normalizeStreamType(raw["streamType"]);
    if (!type) {
      return {
        ok: false,
        error: `Item ${n}: stream type must be one of Q&A, gaming, talk, tutorial.`,
      };
    }
    let pack: { titles: string[]; description: string };
    try {
      pack = buildPack(topic, type);
    } catch (e) {
      return { ok: false, error: `Item ${n}: ${(e as Error).message}` };
    }
    titles.push(`— ${topic} (${TYPE_LABELS[type]}) —`, ...pack.titles);
    descriptions.push(`— ${topic} (${TYPE_LABELS[type]}) —`, pack.description);
  }

  return {
    ok: true,
    values: { titles, descriptions, count: items.length },
  };
}
