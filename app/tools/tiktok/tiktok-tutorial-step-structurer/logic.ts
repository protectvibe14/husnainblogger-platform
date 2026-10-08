/**
 * TikTok Tutorial Step Structurer (tool-167) — pure template generator.
 *
 * Honesty: this is NOT AI. It structures a tutorial outline from FIXED
 * template banks, picking entries deterministically from the user's inputs.
 * It cannot research the topic or verify that the steps are factually
 * correct for the user's subject — the creator must supply accurate content.
 *
 * Fixed banks (sizes documented for QA):
 * - HOOKS: 8 tutorial opening lines
 * - STEP_ACTIONS: 12 step action templates
 * - ON_SCREEN_LINES: 12 short on-screen text lines (each <= 140 chars)
 * - RECAP_CTAS: 6 recap/CTA closing lines
 * - PREREQ_LINES: 4 prerequisite beat lines (added for advanced topics)
 *
 * Advanced-topic rule: if tutorialTopic contains an advanced keyword
 * (advanced, expert, pro, masterclass, deep dive, complicated), a
 * PREREQUISITE beat is prepended and level is reported as "advanced".
 *
 * Zero imports, zero network, zero DOM, no randomness. Same inputs always
 * produce the same structure (djb2 hash seed).
 */

export type TutorialResult =
  | { ok: true; values: Record<string, string | string[]> }
  | { ok: false; error: string };

const HOOKS: string[] = [
  'Stop scrolling — I am going to teach you {topic} in under 60 seconds.',
  'Here is the {topic} tutorial nobody asked for but everybody needs.',
  'POV: you finally learn {topic} the easy way. Watch this.',
  '{topic}, broken down so simply you cannot mess it up.',
  'I wish someone showed me {topic} like this when I started.',
  'The only {topic} tutorial you need — save this.',
  '{topic} in 5 steps or less. Let us go.',
  'Nobody explains {topic} this clearly. Here we go.',
];

const STEP_ACTIONS: string[] = [
  "Show the starting point or setup on camera",
  "Demonstrate the very first move, slowly",
  "Zoom in on the key detail viewers usually miss",
  "Do the main action at full speed once",
  "Repeat the action while narrating what your hands are doing",
  "Show the most common mistake and how to avoid it",
  "Share a shortcut or pro tip for this part",
  "Do a mid-way check so viewers can follow along",
  "Show an alternate method for the same result",
  "Speed up through the repetitive part with a jump cut",
  "Show the finished result up close",
  "Recap the one thing viewers must remember",
];

const ON_SCREEN_LINES: string[] = [
  "Step 1: watch closely",
  "Here is the setup",
  "Do exactly this",
  "Slow it down",
  "Key detail here",
  "Full speed now",
  "Copy my hands",
  "Avoid this mistake",
  "Pro tip: pause here",
  "You are halfway",
  "Try it your way",
  "Final result",
];

const RECAP_CTAS: string[] = [
  "Recap: follow the steps in order and you have got it. Save this and try it today.",
  "That is {topic}, done. Comment which step tripped you up and I will reply.",
  "Quick recap on screen now — screenshot it, then follow for part 2.",
  "You just learned {topic}. Duet this with your attempt.",
  "Recap done. Like if this finally made {topic} click for you.",
  "That is the whole tutorial. Share it with someone learning {topic}.",
];

const PREREQ_LINES: string[] = [
  "You should already know the basics",
  "This assumes you have done the beginner version",
  "Familiarity with the core tools is expected",
  "Not your first time? Good — we are skipping the basics",
];

/** Keywords that mark a topic as advanced. */
export const ADVANCED_KEYWORDS: RegExp =
  /\b(advanced|expert|pro|masterclass|deep[-\s]?dive|complicated)\b/i;

/** Deterministic 32-bit hash of a string (djb2). */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function fill(template: string, topic: string): string {
  return template.split("{topic}").join(topic);
}

function coerceStepCount(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isInteger(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "" && Number.isInteger(Number(raw))) {
    return Number(raw);
  }
  return null;
}

export function runTool(values: Record<string, unknown>): TutorialResult {
  const topicRaw = values.tutorialTopic;
  if (typeof topicRaw !== "string" || topicRaw.trim().length === 0) {
    return { ok: false, error: "Enter a tutorial topic (e.g. 'tie a tie')." };
  }
  const topic = topicRaw.trim();
  if (topic.length > 200) {
    return { ok: false, error: "Tutorial topic must be 200 characters or fewer." };
  }

  const stepCount = coerceStepCount(values.stepCount);
  if (stepCount === null) {
    return { ok: false, error: "Step count must be a whole number." };
  }
  if (stepCount < 2 || stepCount > 12) {
    return { ok: false, error: "Step count must be between 2 and 12." };
  }

  const seed = hashString(`${topic}|${stepCount}`);
  const advanced = ADVANCED_KEYWORDS.test(topic);
  const steps: string[] = [];

  if (advanced) {
    const prereq = PREREQ_LINES[seed % PREREQ_LINES.length];
    steps.push(
      `PREREQUISITE — ${prereq}: tell viewers what they should already know before this tutorial.`
    );
  }

  const actionOffset = seed % STEP_ACTIONS.length;
  const lineOffset = (seed >>> 5) % ON_SCREEN_LINES.length;
  for (let i = 0; i < stepCount; i++) {
    const action = STEP_ACTIONS[(actionOffset + i) % STEP_ACTIONS.length];
    const line = ON_SCREEN_LINES[(lineOffset + i) % ON_SCREEN_LINES.length];
    steps.push(`Step ${i + 1}: ${action} — on-screen text: "${line}"`);
  }

  return {
    ok: true,
    values: {
      hook: fill(HOOKS[seed % HOOKS.length], topic),
      level: advanced ? "advanced" : "beginner-friendly",
      steps,
      recapCta: fill(RECAP_CTAS[(seed >>> 3) % RECAP_CTAS.length], topic),
    },
  };
}
