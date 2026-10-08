/**
 * tool-182 — TikTok Before/After Planner (template planner).
 *
 * Honesty: NOT AI. This tool turns one transformation topic into a fixed
 * 7-shot before/after plan — shot list, transition point, caption, and CTA —
 * using FIXED template banks. It never invents results, timelines, or
 * "after" outcomes; the transformation is yours to film and yours to own.
 *
 * Anti-fake honesty note: every run emits a fixed honesty reminder against
 * faked or AI-generated before/afters (edge case from the spec).
 *
 * Fixed banks (sizes documented for QA):
 * - SHOT_PLAN: 7 fixed shot beats (before, process x2, halfway tease,
 *   transition, reveal, close-up, CTA frame) with a "{topic}" slot
 * - TRANSITIONS: 8 fixed transition ideas
 * - CAPTIONS: 6 fixed caption templates with a "{topic}" slot
 * - CTAS: 6 fixed closing CTA lines
 *
 * Deterministic: transition, caption, and CTA are picked by a djb2 hash of
 * the topic — the same topic always yields the same plan.
 *
 * Contract: runTool({ transformationTopic: string }).
 *
 * Zero imports, zero network, zero DOM, no Math.random.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_TOPIC_LENGTH = 150;

const HONESTY_NOTE =
  'Real footage only: film your own before and after in the same light, ' +
  'same angle, same lens. Never use doctored, AI-generated, or borrowed ' +
  'before/after images — faked transformations break viewer trust and can ' +
  'violate platform rules. This planner invents no results; only show ' +
  'outcomes you genuinely filmed.';

const SHOT_PLAN: readonly string[] = [
  'SHOT 1 — BEFORE (establishing): film the starting state of "{topic}" in good, even light. Hold 2–3 seconds, no filter.',
  'SHOT 2 — PROCESS (wide): film yourself working on "{topic}" — show the effort, not just the result.',
  'SHOT 3 — PROCESS (close-up): tight shot of the detail that changes during "{topic}". Texture sells it.',
  'SHOT 4 — HALFWAY TEASE: show a partial change of "{topic}", then cut before the full reveal. Keep viewers watching.',
  'SHOT 5 — TRANSITION: snap, hand-swipe, or outfit-whip into the after state of "{topic}".',
  'SHOT 6 — AFTER (reveal): hold the finished "{topic}" for 2–3 seconds. Same light and angle as SHOT 1 so the change is real.',
  'SHOT 7 — CTA FRAME: face to camera. Deliver the CTA line while the after result is on screen.',
];

const TRANSITIONS: readonly string[] = [
  'Hand swipe across the lens (classic before/after wipe).',
  'Snap your fingers — cut to the after on the snap sound.',
  'Spin the camera 180°; land the spin on the after shot.',
  'Drop an object toward the lens; lift it to reveal the after.',
  'Beat-drop cut: change on the bass hit of a trending sound.',
  'Zoom into a detail, zoom out on the transformed result.',
  'Clap once — hard cut on the clap to the after.',
  'Pull focus from blurry to sharp as the after is revealed.',
];

const CAPTIONS: readonly string[] = [
  'The {topic} transformation nobody asked for but everybody needed. Wait for the reveal.',
  'POV: you finally fixed your {topic}. Before vs after — which side are you?',
  'Day 1 vs now: my {topic} journey. Save this if you need the motivation.',
  'The {topic} glow-up is real. Same light, same angle, no filter.',
  'I cannot believe this {topic} before/after. Sound on for the process.',
  'From this… to THIS. My {topic} transformation, unedited.',
];

const CTAS: readonly string[] = [
  'Follow for the step-by-step of how I did this.',
  'Comment "HOW" and I will post the full process video.',
  'Save this for when you start your own transformation.',
  'Duet this with your own before/after — I will feature the best ones.',
  'Share this with someone who needs to see the result.',
  'Which part surprised you most? Tell me in the comments.',
];

function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function fill(template: string, topic: string): string {
  return template.split('{topic}').join(topic);
}

export function runTool(values: Record<string, unknown>): RunResult {
  const raw = values.transformationTopic;
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return {
      ok: false,
      error: 'Enter a transformation topic (e.g. "my messy desk setup").',
    };
  }
  const topic = raw.trim();
  if (topic.length > MAX_TOPIC_LENGTH) {
    return {
      ok: false,
      error: `Transformation topic must be ${MAX_TOPIC_LENGTH} characters or fewer.`,
    };
  }

  const seed = hashString(topic.toLowerCase());
  const shotList = SHOT_PLAN.map((s) => fill(s, topic));
  const transitionPoint = TRANSITIONS[seed % TRANSITIONS.length];
  const caption = fill(CAPTIONS[(seed >>> 4) % CAPTIONS.length], topic);
  const cta = CTAS[(seed >>> 8) % CTAS.length];

  return {
    ok: true,
    values: {
      shotList,
      transitionPoint,
      caption,
      cta,
      honestyNote: HONESTY_NOTE,
    },
  };
}
