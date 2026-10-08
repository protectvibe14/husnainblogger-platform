/**
 * TikTok Script Structurer (tool-151) — pure beat-sheet engine.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * HONESTY: Pure template/beat-sheet engine — it fits a script structure to a
 * target duration from FIXED word banks and fixed timing rules. No AI, no
 * generation, no TikTok platform data, no audience insight. It does not know
 * your account or the TikTok algorithm.
 *
 * TIMING RULE (estimate, labeled as such everywhere it appears):
 *   SPEAKING_WPM = 150 — a standard narration estimate. Every beat shows an
 *   approximate word count derived from its seconds; these are pacing
 *   guides, not promises.
 *
 * WORD BANKS (all fixed; sizes documented — picks are deterministic):
 *   GENERIC_HOOKS   12 — niche-neutral scroll-stoppers, [TOPIC] slot
 *   NICHE_HOOKS      8 niches x 4 hooks = 32 — matched when `niche` names a
 *                    known niche; falls back to GENERIC_HOOKS otherwise
 *   SETUP_LINES      8 — context-setting lines
 *   VALUE_BEATS     10 — value-delivery frames, [TOPIC] slot
 *   REHOOKS          6 — mid-video attention resets for long videos
 *   TWISTS           6 — reveal/payoff frames
 *   CTAS             8 — calls to action
 *   TOTAL: 82 fixed sentence frames.
 *
 * Beat plan by duration (fitted to targetDurationSec):
 *   <= 15s  -> hook, value, cta                      (3 beats)
 *   <= 30s  -> hook, setup, value, value, cta        (5 beats)
 *   <= 60s  -> hook, setup, value x3, twist, cta     (7 beats)
 *   <= 600s -> hook, setup, value x2, rehook, value x2, twist, cta (9 beats)
 *
 * Deterministic: same inputs -> same outputs, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Standard narration estimate (words per minute) — an estimate, not a fact. */
export const SPEAKING_WPM = 150;

/** Hard ceiling: the standard TikTok upload ceiling (seconds). */
export const MAX_DURATION_SEC = 600;

export const MIN_DURATION_SEC = 3;
export const MAX_TOPIC_LENGTH = 200;
export const MAX_NICHE_LENGTH = 60;

// ---------------------------------------------------------------------------
// Word banks (fixed)
// ---------------------------------------------------------------------------

export const GENERIC_HOOKS: readonly string[] = [
  "Stop scrolling — this [TOPIC] trick takes 30 seconds to learn.",
  "Nobody talks about this [TOPIC] shortcut.",
  "I wasted a year on [TOPIC] until I found this.",
  "The [TOPIC] mistake almost everyone makes on day one.",
  "Watch this before you try [TOPIC] again.",
  "This [TOPIC] hack broke my group chat.",
  "POV: you finally get [TOPIC] right on the first try.",
  "3 seconds — that's all this [TOPIC] tip needs.",
  "I tested 10 [TOPIC] methods so you don't have to.",
  "If [TOPIC] feels hard, you're missing this one step.",
  "The internet lied to you about [TOPIC].",
  "Save this [TOPIC] video — you'll need it later.",
];

export const NICHE_HOOKS: Record<string, readonly string[]> = {
  fitness: [
    "This 60-second [TOPIC] move burns more than you think.",
    "Trainers don't want you to know this [TOPIC] shortcut.",
    "I fixed my [TOPIC] form with this one cue.",
    "Stop doing [TOPIC] wrong — here's the fix.",
  ],
  food: [
    "This [TOPIC] recipe has 3 ingredients and zero regrets.",
    "The [TOPIC] trick restaurants hope you never learn.",
    "I made [TOPIC] in 10 minutes and it slaps.",
    "Rating this [TOPIC] hack: 10/10, no notes.",
  ],
  beauty: [
    "This [TOPIC] routine costs less than your coffee.",
    "The [TOPIC] step you're definitely skipping.",
    "Dermatologists quietly approve this [TOPIC] trick.",
    "Before/after: this [TOPIC] method actually works.",
  ],
  finance: [
    "This [TOPIC] habit quietly saves hundreds a year.",
    "Nobody teaches this [TOPIC] rule in school.",
    "I wish someone told me this [TOPIC] truth at 20.",
    "The [TOPIC] mistake keeping you broke.",
  ],
  tech: [
    "This hidden [TOPIC] feature changes everything.",
    "Your [TOPIC] setup is missing this one toggle.",
    "I automated [TOPIC] in 5 minutes — here's how.",
    "Stop paying for [TOPIC] when this free trick exists.",
  ],
  education: [
    "Study [TOPIC] in half the time with this method.",
    "The [TOPIC] memory trick toppers actually use.",
    "I learned [TOPIC] in a week — no cramming.",
    "This [TOPIC] note-taking system is elite.",
  ],
  business: [
    "This [TOPIC] strategy got my first 100 customers.",
    "Small businesses sleep on this [TOPIC] move.",
    "I doubled revenue with this [TOPIC] tweak.",
    "The [TOPIC] playbook nobody shares for free.",
  ],
  travel: [
    "This [TOPIC] hack cut my trip cost in half.",
    "The [TOPIC] mistake tourists make every time.",
    "Hidden [TOPIC] spots locals actually love.",
    "I planned this [TOPIC] trip in one evening.",
  ],
};

const SETUP_LINES: readonly string[] = [
  "Here's the context you need in one breath.",
  "Quick background so this actually makes sense.",
  "Let me set this up — 10 seconds, promise.",
  "Before the trick, here's why it works.",
  "You need this one fact first.",
  "Here's what I tried before finding the real answer.",
  "Let me show you the starting point.",
  "One quick detail, then we go.",
];

const VALUE_BEATS: readonly string[] = [
  "Step one of [TOPIC]: do the simplest version first.",
  "Here's the core [TOPIC] move — watch closely.",
  "The part everyone skips in [TOPIC]: slow down here.",
  "Pro tip for [TOPIC]: repeat this twice, not ten times.",
  "This [TOPIC] detail is where the magic happens.",
  "Checklist moment: pause and copy this [TOPIC] step.",
  "The [TOPIC] shortcut is just this one adjustment.",
  "Common fail point in [TOPIC] — and the 5-second fix.",
  "Here's the [TOPIC] result you should expect.",
  "Final [TOPIC] check: if this looks right, you're done.",
];

const REHOOKS: readonly string[] = [
  "Still here? The best part is next.",
  "Quick reset — here's where we're headed.",
  "Don't click away — the payoff lands in 10 seconds.",
  "Halfway there, and it gets easier from here.",
  "Stay with me — this next bit saves you hours.",
  "Plot twist incoming. Keep watching.",
];

const TWISTS: readonly string[] = [
  "The twist: [TOPIC] works even better backwards.",
  "Surprise — the 'hard' way was the shortcut all along.",
  "Here's what nobody tells you about [TOPIC] results.",
  "The real win from [TOPIC] isn't what you think.",
  "One more thing about [TOPIC] that changes the game.",
  "And that's why [TOPIC] beats every alternative.",
];

const CTAS: readonly string[] = [
  "Follow for part 2 — it drops tomorrow.",
  "Comment your result and I'll reply to the first 50.",
  "Save this so you don't lose the steps.",
  "Share this with someone who needs [TOPIC] help.",
  "Like if this saved you time — more [TOPIC] coming.",
  "Try it and duet me with your attempt.",
  "Bookmark this [TOPIC] guide for later.",
  "Follow — I post one [TOPIC] shortcut every day.",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type BeatKind = "hook" | "setup" | "value" | "rehook" | "twist" | "cta";

const BEAT_LABELS: Record<BeatKind, string> = {
  hook: "HOOK",
  setup: "SETUP",
  value: "VALUE",
  rehook: "RE-HOOK",
  twist: "TWIST",
  cta: "CTA",
};

/** djb2 — deterministic pick index from any seed string. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick(bank: readonly string[], seed: string, salt: string): string {
  return bank[hashString(seed + "|" + salt) % bank.length];
}

function fillSlots(line: string, topic: string, niche: string): string {
  return line
    .split("[TOPIC]")
    .join(topic)
    .split("[NICHE]")
    .join(niche === "" ? "your niche" : niche);
}

function beatKindsFor(durationSec: number): BeatKind[] {
  if (durationSec <= 15)
    return ["hook", "value", "cta"];
  if (durationSec <= 30)
    return ["hook", "setup", "value", "value", "cta"];
  if (durationSec <= 60)
    return ["hook", "setup", "value", "value", "value", "twist", "cta"];
  return [
    "hook",
    "setup",
    "value",
    "value",
    "rehook",
    "value",
    "value",
    "twist",
    "cta",
  ];
}

/** Resolve the niche bank: substring match on known niche keys, else generic. */
function hooksForNiche(niche: string): readonly string[] {
  const n = niche.trim().toLowerCase();
  for (const key of Object.keys(NICHE_HOOKS)) {
    if (n.includes(key)) return NICHE_HOOKS[key];
  }
  return GENERIC_HOOKS;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const t = value.trim();
    if (t === "") return null;
    const n = Number(t);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

interface Beat {
  kind: BeatKind;
  startSec: number;
  endSec: number;
  words: number;
  line: string;
}

export function runTool(values: Record<string, unknown>): RunResult {
  // --- validate topic ---
  const topicRaw = values.topic;
  if (typeof topicRaw !== "string" || topicRaw.trim() === "") {
    return {
      ok: false,
      error: "Enter a topic for your video (e.g. \"meal prep for beginners\").",
    };
  }
  const topic = topicRaw.trim();
  if (topic.length > MAX_TOPIC_LENGTH) {
    return {
      ok: false,
      error: `Topic is too long — keep it under ${MAX_TOPIC_LENGTH} characters.`,
    };
  }

  // --- validate niche (optional) ---
  const nicheRaw = values.niche;
  let niche = "";
  if (nicheRaw !== undefined && nicheRaw !== null && String(nicheRaw).trim() !== "") {
    if (typeof nicheRaw !== "string") {
      return { ok: false, error: "Niche must be text." };
    }
    niche = nicheRaw.trim();
    if (niche.length > MAX_NICHE_LENGTH) {
      return {
        ok: false,
        error: `Niche is too long — keep it under ${MAX_NICHE_LENGTH} characters.`,
      };
    }
  }

  // --- validate duration ---
  const durationRaw = asNumber(values.targetDurationSec);
  if (durationRaw === null) {
    return {
      ok: false,
      error: `Target duration is required — enter a number of seconds between ${MIN_DURATION_SEC} and ${MAX_DURATION_SEC}.`,
    };
  }
  let durationSec = Math.floor(durationRaw);
  const warnings: string[] = [];
  if (durationSec < MIN_DURATION_SEC) {
    return {
      ok: false,
      error: `Target duration must be at least ${MIN_DURATION_SEC} seconds.`,
    };
  }
  if (durationSec > MAX_DURATION_SEC) {
    durationSec = MAX_DURATION_SEC;
    warnings.push(
      "Planned duration was capped at 600 seconds (10 minutes) — the standard TikTok upload ceiling. " +
        "Longer uploads need special account eligibility; check the TikTok app for your account."
    );
  }

  // --- build the beat sheet ---
  const kinds = beatKindsFor(durationSec);
  const hookSec = Math.min(3, Math.max(2, Math.round(durationSec * 0.12)));
  const ctaSec = Math.min(5, Math.max(2, Math.round(durationSec * 0.1)));
  const middleCount = kinds.length - 2;
  const middleSec = middleCount > 0 ? (durationSec - hookSec - ctaSec) / middleCount : 0;

  const seed = topic + "|" + niche.toLowerCase();
  const hookBank = hooksForNiche(niche);

  const beats: Beat[] = [];
  let cursor = 0;
  kinds.forEach((kind, i) => {
    const secs =
      kind === "hook" ? hookSec : kind === "cta" ? ctaSec : middleSec;
    const startSec = Math.round(cursor);
    const endSec = Math.round(cursor + secs);
    cursor += secs;
    const words = Math.max(2, Math.round(secs * (SPEAKING_WPM / 60)));
    let line: string;
    switch (kind) {
      case "hook":
        line = pick(hookBank, seed, "hook");
        break;
      case "setup":
        line = pick(SETUP_LINES, seed, "setup" + i);
        break;
      case "value":
        line = pick(VALUE_BEATS, seed, "value" + i);
        break;
      case "rehook":
        line = pick(REHOOKS, seed, "rehook" + i);
        break;
      case "twist":
        line = pick(TWISTS, seed, "twist" + i);
        break;
      case "cta":
        line = pick(CTAS, seed, "cta");
        break;
    }
    beats.push({ kind, startSec, endSec, words, line: fillSlots(line, topic, niche) });
  });

  const totalWords = beats.reduce((s, b) => s + b.words, 0);

  const beatLines = beats.map(
    (b) =>
      `${b.startSec}\u2013${b.endSec}s \u00b7 ${BEAT_LABELS[b.kind]} (\u2248${b.words} words): ${b.line}`
  );

  const fullScriptLines: string[] = [
    `TIKTOK BEAT SHEET \u2014 "${topic}" (${durationSec}s${niche ? ", " + niche : ""})`,
    "",
  ];
  beats.forEach((b, i) => {
    fullScriptLines.push(
      `${i + 1}. ${b.startSec}\u2013${b.endSec}s \u00b7 ${BEAT_LABELS[b.kind]} (\u2248${b.words} words)`
    );
    fullScriptLines.push(`   ${b.line}`);
  });
  fullScriptLines.push("");
  fullScriptLines.push(
    "Word counts are pacing estimates at ~150 spoken words per minute."
  );

  let timingNote =
    `Planned for ${durationSec}s across ${kinds.length} beats \u2014 about ${totalWords} spoken words ` +
    `(estimate at ${SPEAKING_WPM} words per minute). Scripts are assembled from 82 fixed ` +
    `template frames; no AI involved.`;
  if (warnings.length > 0) timingNote += " " + warnings.join(" ");

  return {
    ok: true,
    values: {
      fullScript: fullScriptLines.join("\n"),
      beats: beatLines,
      timingNote,
    },
  };
}
