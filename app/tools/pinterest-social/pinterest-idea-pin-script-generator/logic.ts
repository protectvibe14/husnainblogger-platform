/**
 * Pinterest Idea Pin Script Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Assembles a page-by-page idea pin script (visual direction, on-screen text,
 * caption line per page) from FIXED sentence/template banks — no AI, no model
 * output. {topic} is filled in from the user's input.
 *
 * Honesty contract: idea pins carry no outbound link and the tool uses a
 * 20-page working cap. Both are treated as static platform facts (see the
 * spec honestyNote), surfaced in the `warning` output — not invented data.
 *
 * Fixed content banks (documented per the builder honesty contract):
 * - HOOK_TEXTS: 10 on-screen hook lines
 * - HOOK_VISUALS: 8 hook visual directions
 * - HOOK_CAPTIONS: 6 page-1 caption lines
 * - STEP_VISUALS: 10 step visual directions
 * - STEP_TEXTS: 10 step on-screen text templates (each uses {topic})
 * - STEP_CAPTIONS: 8 step caption lines
 * - CTA_TEXTS: 8 closing on-screen text templates (each uses {topic})
 * - CTA_VISUALS: 6 closing visual directions
 * - CTA_CAPTIONS: 6 closing caption lines
 * Total fixed strings: 10 + 8 + 6 + 10 + 10 + 8 + 8 + 6 + 6 = 72
 *
 * Deterministic: every pick is (hash(topic) + pageIndex) % bankLen —
 * same topic + pageCount always yields the identical script. No Math.random.
 *
 * Readability caps: on-screen text <= 90 chars (9:16 screen), caption <= 220.
 */

export const MAX_TOPIC_LEN = 120;
export const MAX_PAGES = 20;
export const DEFAULT_PAGES = 5;
export const MAX_ONSCREEN_CHARS = 90;
export const MAX_CAPTION_CHARS = 220;

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Simple deterministic string hash (non-negative 32-bit). */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function fill(template: string, topic: string): string {
  return template.split("{topic}").join(topic);
}

function cap(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

const HOOK_TEXTS: string[] = [
  "You need to see this {topic} trick",
  "POV: you finally nailed {topic}",
  "{topic} — but make it effortless",
  "Stop doing {topic} the hard way",
  "This {topic} hack changed everything",
  "I wish I knew this {topic} sooner",
  "The {topic} shortcut nobody shares",
  "Watch me do {topic} in minutes",
  "Your {topic} glow-up starts here",
  "{topic}: beginner to pro in 1 pin",
];

const HOOK_VISUALS: string[] = [
  "Close-up of hands mid-action, bright natural light, vertical 9:16 framing",
  "Before/after split on screen, creator pointing at the better half",
  "Overhead flat-lay of all materials laid out neatly before starting",
  "Creator looking at camera with a surprised expression, bold hook text overlay",
  "Quick montage of the finished result from three angles",
  "POV shot: phone in one hand, doing the thing with the other",
  "Zoom-in on the finished result with a satisfying reveal",
  "Creator shakes head 'no' at the common mistake, then smiles at the fix",
];

const HOOK_CAPTIONS: string[] = [
  "Save this {topic} trick for later — you will want it.",
  "Full {topic} walkthrough in this pin. Follow for part 2.",
  "Tried this {topic} hack? Tell me how it went.",
  "Save + share with someone who needs this {topic} tip.",
  "Which {topic} step do you struggle with most? Comment below.",
  "Follow for more {topic} ideas every week.",
];

const STEP_VISUALS: string[] = [
  "Step-by-step close-up, one action per clip, on-screen step number",
  "Overhead shot showing exactly where each item goes",
  "Side-by-side: wrong way vs right way, clearly labeled",
  "Hands-only demo with text callouts naming each move",
  "Timelapse of the process with pause points on key moments",
  "Creator voiceover-style talking head explaining while showing the step",
  "Freeze-frame on the finished step with a checkmark overlay",
  "Close-up texture/detail shot so viewers see exactly what 'done' looks like",
  "Split screen: supply list on one side, action on the other",
  "Real-time demo at normal speed — no cuts, full transparency",
];

const STEP_TEXTS: string[] = [
  "Step {n}: set up your {topic} station",
  "Step {n}: the {topic} base layer",
  "Step {n}: add the {topic} detail",
  "Step {n}: the {topic} technique",
  "Step {n}: refine your {topic}",
  "Step {n}: the {topic} finishing touch",
  "Step {n}: check your {topic} progress",
  "Step {n}: the {topic} pro move",
  "Step {n}: customize your {topic}",
  "Step {n}: lock in your {topic} result",
];

const STEP_CAPTIONS: string[] = [
  "Take your time on this {topic} step — it sets up everything after it.",
  "Screenshot this {topic} step so you can follow along later.",
  "This is the {topic} step most people rush. Slow down here.",
  "Pause and replay this {topic} part until it clicks.",
  "Small detail, big difference for your {topic} result.",
  "Save this pin so you do not lose this {topic} step.",
  "Comment if this {topic} step was new to you.",
  "Almost there — your {topic} is coming together.",
];

const CTA_TEXTS: string[] = [
  "Save this {topic} guide now",
  "Your turn: try this {topic}",
  "Follow for daily {topic} ideas",
  "Share this {topic} with a friend",
  "Comment your {topic} result",
  "Save + follow for more {topic}",
  "Which {topic} next? Comment!",
  "Start your {topic} today",
];

const CTA_VISUALS: string[] = [
  "Creator holds up the finished result, big smile, end card with follow button",
  "Montage recap of every step in 3 seconds, 'Save this pin' text overlay",
  "Before/after reveal one more time with a 'You did it' message",
  "Creator points up to the follow button area, friendly wave",
  "Flat-lay of the finished result with 'Save for later' text overlay",
  "Quick blooper or behind-the-scenes clip for a human, friendly ending",
];

const CTA_CAPTIONS: string[] = [
  "Saved? Now go make your own {topic} — and tag me in the result.",
  "Follow for a new {topic} idea every single day.",
  "Share this {topic} pin with someone who would love it.",
  "Comment DONE when you try this {topic}.",
  "Save this {topic} guide — future you says thanks.",
  "More {topic} ideas on my profile. Go explore.",
];

/** Heuristic: topic text that implies the viewer must leave Pinterest. */
const OUTBOUND_HINT = /\b(link|url|website|blog post|shop now|buy now|link in bio|click the link|discount code)\b/i;

function parsePageCount(raw: unknown): { pages: number; clamped: boolean } | { error: string } {
  if (raw === undefined || raw === null || raw === "") {
    return { pages: DEFAULT_PAGES, clamped: false };
  }
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { error: "Page count must be a whole number between 1 and 20." };
  }
  if (n < 1) {
    return { error: "Page count must be at least 1." };
  }
  if (n > MAX_PAGES) {
    return { pages: MAX_PAGES, clamped: true };
  }
  return { pages: n, clamped: false };
}

export function runTool(values: Record<string, unknown>): RunResult {
  const topicRaw = values["topic"];
  const topic = typeof topicRaw === "string" ? topicRaw.trim() : "";
  if (!topic) {
    return { ok: false, error: "Please enter a topic for your idea pin." };
  }
  if (topic.length > MAX_TOPIC_LEN) {
    return { ok: false, error: `Topic is too long (max ${MAX_TOPIC_LEN} characters).` };
  }

  const parsed = parsePageCount(values["pageCount"]);
  if ("error" in parsed) {
    return { ok: false, error: parsed.error };
  }
  const { pages, clamped } = parsed;

  const h = hashStr(topic.toLowerCase());
  const pick = <T>(bank: T[], pageIndex: number): T => bank[(h + pageIndex) % bank.length];

  const rows: string[][] = [];
  for (let i = 0; i < pages; i++) {
    const pageNumber = i + 1;
    let onScreen: string;
    let visual: string;
    let caption: string;
    if (pageNumber === 1) {
      onScreen = fill(pick(HOOK_TEXTS, i), topic);
      visual = pick(HOOK_VISUALS, i);
      caption = fill(pick(HOOK_CAPTIONS, i), topic);
    } else if (pageNumber === pages) {
      onScreen = fill(pick(CTA_TEXTS, i), topic);
      visual = pick(CTA_VISUALS, i);
      caption = fill(pick(CTA_CAPTIONS, i), topic);
    } else {
      const stepNo = pageNumber - 1;
      onScreen = fill(pick(STEP_TEXTS, i), topic).split("{n}").join(String(stepNo));
      visual = pick(STEP_VISUALS, i);
      caption = fill(pick(STEP_CAPTIONS, i), topic);
    }
    rows.push([
      String(pageNumber),
      cap(visual, MAX_CAPTION_CHARS),
      cap(onScreen, MAX_ONSCREEN_CHARS),
      cap(caption, MAX_CAPTION_CHARS),
    ]);
  }

  const warnings: string[] = [];
  if (clamped) {
    warnings.push(
      `Page count was clamped to ${MAX_PAGES} — this tool caps scripts at ${MAX_PAGES} pages.`,
    );
  }
  if (OUTBOUND_HINT.test(topic)) {
    warnings.push(
      "Heads up: idea pins carry no outbound link, so keep viewers on Pinterest — end with a save, share, or follow prompt instead of a link CTA.",
    );
  }

  return {
    ok: true,
    values: {
      scriptPages: {
        columns: ["Page", "Visual direction", "On-screen text", "Caption line"],
        rows,
      },
      warning: warnings.join(" "),
    },
  };
}
