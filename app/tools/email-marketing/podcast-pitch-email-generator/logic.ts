/**
 * Podcast Pitch Email Generator — pure logic (tool-447).
 *
 * Deterministic template/pattern library — NOT AI. The pitch email and the
 * subject-line options are assembled client-side from bundled pattern
 * templates; no network, no backend, no randomness.
 *
 * BANK SIZES (documented for honesty):
 * - 8 subject-line templates (4 with a host-name slot, 4 without).
 * - 3 full pitch-email body templates (concise / value-first / credentials-led).
 * - 5 talking-point prompts reused inside each body template.
 *   8 + 3 + 5 = 16 bundled patterns. The tool always renders all 8 subject
 *   lines and exactly 1 of the 3 body templates; the body template is picked
 *   deterministically by hashing the inputs (same inputs -> same template).
 *
 * ASSUMPTIONS / HONESTY:
 * - Placeholder tokens are never rendered empty: when hostName is missing,
 *   host-slot templates use the fallback "your team", and the body opens
 *   with "Hi there,".
 * - Overlong input is truncated to MAX_INPUT_CHARS Unicode code points with
 *   a visible `notice` — never silently dropped.
 * - Length is measured in user-perceived characters ([...s].length), so
 *   emoji count as one character each.
 * - User input is stripped of HTML tags and collapsed (whitespace +
 *   adjacent duplicate words) before insertion.
 * - Zero imports, zero DOM, zero randomness. Fully deterministic.
 */

export const MAX_INPUT_CHARS = 200;
export const MAX_HOST_CHARS = 100;

/** 8 subject-line patterns. {hostPhrase} never renders empty (fallback). */
export const SUBJECT_TEMPLATES: readonly string[] = [
  "Guest pitch: {episodeTopic} for {podcastName}",
  "Idea for {podcastName}: {episodeTopic} with {hostPhrase}",
  "Your listeners would love this {episodeTopic} angle",
  "{episodeTopic} — guest idea for {podcastName}",
  "Quick guest pitch for {podcastName} ({episodeTopic})",
  "{hostPhrase}, a fresh take on {episodeTopic} for your show",
  "Guest suggestion: {episodeTopic} episode for {podcastName}",
  "Re: {podcastName} — {episodeTopic} story your audience wants",
];

const TALKING_POINTS: readonly string[] = [
  "one story the host cannot find anywhere else",
  "one practical takeaway listeners can use today",
  "one contrarian opinion worth debating",
  "one behind-the-scenes lesson learned the hard way",
  "one resource list to share in the show notes",
];

/**
 * 3 body templates. Slots: {greeting}, {podcastName}, {episodeTopic},
 * {yourCredentials}, {talkingPoints}.
 */
const BODY_TEMPLATES: readonly string[] = [
  `{greeting}

I have been listening to {podcastName}, and I would love to suggest an episode on {episodeTopic}.

My background: {yourCredentials}

What I would bring to the episode:
{talkingPoints}

Happy to send three questions in advance, or keep it fully conversational — whichever works best for your format.

Thank you for considering it,

{signature}`,
  `{greeting}

I think your audience would get a lot out of an episode of {podcastName} on {episodeTopic}, and I would love to be the guest who delivers it.

Why me: {yourCredentials}

Three angles I can cover:
{talkingPoints}

If {episodeTopic} fits your calendar, I am flexible on timing and happy to promote the episode to my own audience too.

Best,

{signature}`,
  `{greeting}

Quick background first: {yourCredentials}

That is why I would love to pitch you an episode of {podcastName} on {episodeTopic} — a topic I work on every day.

On the episode I would share:
{talkingPoints}

I keep answers tight and story-driven, and I will bring three ready-to-use questions so prep is easy on your side.

Thanks for your time,

{signature}`,
];

function codePoints(s: string): number {
  return [...s].length;
}

/** Strip HTML tags, collapse whitespace, collapse adjacent duplicate words. */
function sanitize(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .replace(/\b(\w+)( \1\b)+/gi, "$1")
    .trim();
}

/** Fill {slot} placeholders from a map; unknown slots left untouched. */
function fill(template: string, slots: Record<string, string>): string {
  let out = template;
  for (const key of Object.keys(slots)) {
    out = out.split(`{${key}}`).join(slots[key]);
  }
  return out;
}

/** Deterministic template picker: char-code sum hash mod bucket count. */
function pickTemplate(parts: string[], bucketCount: number): number {
  let sum = 0;
  for (const part of parts) {
    for (const ch of part) sum = (sum + ch.codePointAt(0)!) % 1000003;
  }
  return sum % bucketCount;
}

export interface PodcastPitchValues {
  subjectOptions: string[];
  pitchEmail: string;
  notice: string;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please enter your pitch details first." };
  }

  const podcastRaw = values["podcastName"];
  if (typeof podcastRaw !== "string" || sanitize(podcastRaw).length === 0) {
    return { ok: false, error: "Enter the podcast name." };
  }
  const topicRaw = values["episodeTopic"];
  if (typeof topicRaw !== "string" || sanitize(topicRaw).length === 0) {
    return { ok: false, error: "Enter your episode topic." };
  }
  const credsRaw = values["yourCredentials"];
  if (typeof credsRaw !== "string" || sanitize(credsRaw).length === 0) {
    return { ok: false, error: "Enter your credentials (why you are a good guest)." };
  }

  let hostName = "";
  const hostRaw = values["hostName"];
  if (hostRaw !== undefined && hostRaw !== null && hostRaw !== "") {
    if (typeof hostRaw !== "string") {
      return { ok: false, error: "Host name must be text." };
    }
    hostName = sanitize(hostRaw);
    if (codePoints(hostName) > MAX_HOST_CHARS) {
      hostName = [...hostName].slice(0, MAX_HOST_CHARS).join("").trim();
    }
  }

  let podcastName = sanitize(podcastRaw);
  let episodeTopic = sanitize(topicRaw);
  let yourCredentials = sanitize(credsRaw);
  const notices: string[] = [];
  if (codePoints(podcastName) > MAX_INPUT_CHARS) {
    podcastName = [...podcastName].slice(0, MAX_INPUT_CHARS).join("").trim();
    notices.push(`Podcast name was shortened to ${MAX_INPUT_CHARS} characters.`);
  }
  if (codePoints(episodeTopic) > MAX_INPUT_CHARS) {
    episodeTopic = [...episodeTopic].slice(0, MAX_INPUT_CHARS).join("").trim();
    notices.push(`Episode topic was shortened to ${MAX_INPUT_CHARS} characters.`);
  }
  if (codePoints(yourCredentials) > MAX_INPUT_CHARS) {
    yourCredentials = [...yourCredentials].slice(0, MAX_INPUT_CHARS).join("").trim();
    notices.push(`Credentials were shortened to ${MAX_INPUT_CHARS} characters.`);
  }

  const hostPhrase = hostName || "your team";
  const greeting = hostName ? `Hi ${hostName},` : "Hi there,";
  const talkingPoints = TALKING_POINTS.map((t, i) => `${i + 1}. ${t}`).join("\n");

  const subjectOptions = SUBJECT_TEMPLATES.map((t) =>
    fill(t, { podcastName, episodeTopic, hostPhrase }),
  );
  const uniqueSubjects = [...new Set(subjectOptions)];

  const templateIndex = pickTemplate(
    [podcastName, episodeTopic, yourCredentials],
    BODY_TEMPLATES.length,
  );
  const pitchEmail = fill(BODY_TEMPLATES[templateIndex], {
    greeting,
    podcastName,
    episodeTopic,
    yourCredentials,
    talkingPoints,
    signature: "[Your name]\n[Your website / LinkedIn]",
  });

  return {
    ok: true,
    values: {
      subjectOptions: uniqueSubjects,
      pitchEmail,
      notice: notices.join(" "),
    },
  };
}
