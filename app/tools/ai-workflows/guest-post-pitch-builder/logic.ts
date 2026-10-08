/**
 * Guest Post Pitch Builder (tool-328) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is a TEMPLATE FILLER, not an AI copywriter. It fills one
 * fixed pitch-email template and 5 fixed subject-line templates with the
 * details you enter (blog name, topic idea, credentials). Personalization
 * beyond the slots — referencing the blog's recent posts, the editor's
 * name, tone — is the user's job.
 *
 * Fixed banks (documented here):
 *   - EMAIL_TEMPLATE: 1 fixed pitch-email template with 3 slots
 *     ({BLOG_NAME}, {TOPIC_IDEA}, {CREDENTIALS_LINE})
 *   - SUBJECT_BANK: 5 fixed subject-line templates with {BLOG_NAME} /
 *     {TOPIC_IDEA} slots
 *
 * Builder contract: runTool({ items }) -> { ok, values, error }.
 * values out = { pitchEmail, subjectLines }
 *   - pitchEmail:   copy-ready email body (all items, separated)
 *   - subjectLines: list — 5 subject-line variants per item
 * Output ids match meta.ts outputs.
 *
 * Item shape (one repeatable row in the UI):
 *   - blogName (required)
 *   - topicIdea (required)
 *   - credentials (optional; falls back to a neutral line)
 *
 * Edge cases from the spec: none.
 * Validation from the spec: blogName and topicIdea required.
 * Spec cap: at most 10 pitches per run (UI sanity bound).
 */

export interface PitchItem {
  blogName?: string;
  topicIdea?: string;
  credentials?: string;
}

export interface PitchValues {
  /** Full pitch email body, copy-ready. */
  pitchEmail: string;
  /** 5 subject-line variants per item, each labeled with the blog name. */
  subjectLines: string[];
}

export interface PitchResult {
  ok: boolean;
  values?: PitchValues;
  error?: string;
}

/** Spec cap: at most 10 pitches per run. */
export const MAX_PITCHES = 10;

const CREDENTIALS_FALLBACK =
  "I write about this topic regularly and would love to contribute something genuinely useful for your readers.";

/** 1 fixed email template. Slots: {BLOG_NAME}, {TOPIC_IDEA}, {CREDENTIALS_LINE}. */
const EMAIL_TEMPLATE =
  "Subject: {SUBJECT}\n" +
  "\n" +
  "Hi {BLOG_NAME} team,\n" +
  "\n" +
  "I've been following {BLOG_NAME} for a while and really enjoyed your recent posts. " +
  "I have a guest post idea I think your readers would love:\n" +
  "\n" +
  'Proposed topic: "{TOPIC_IDEA}"\n' +
  "\n" +
  "It would be an original, practical piece — no recycled content — written in a style that fits your blog. " +
  "Happy to adjust the angle or share a short outline first.\n" +
  "\n" +
  "{CREDENTIALS_LINE}\n" +
  "\n" +
  "Would this be a good fit? I can have a draft ready within a week.\n" +
  "\n" +
  "Thanks for considering it,\n" +
  "[Your Name]\n" +
  "[Your website / portfolio link]";

/** 5 fixed subject-line templates. Slots: {BLOG_NAME}, {TOPIC_IDEA}. */
const SUBJECT_BANK: string[] = [
  'Guest post idea for {BLOG_NAME}: "{TOPIC_IDEA}"',
  'Pitch: "{TOPIC_IDEA}" — a fit for {BLOG_NAME}?',
  "Contributing writer pitch for {BLOG_NAME}",
  'A guest post your readers might love: "{TOPIC_IDEA}"',
  "Quick pitch: original post idea for {BLOG_NAME}",
];

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function fill(template: string, slots: Record<string, string>): string {
  let out = template;
  for (const key of Object.keys(slots)) {
    out = out.split("{" + key + "}").join(slots[key]);
  }
  return out;
}

/**
 * Fill the fixed pitch templates with the user's details. Deterministic:
 * same items always produce the same email and subject lines.
 */
export function runTool(args: { items: unknown[] }): PitchResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Add at least one pitch to build." };
  }
  if (items.length > MAX_PITCHES) {
    return {
      ok: false,
      error: `Too many pitches: the builder accepts at most ${MAX_PITCHES} pitches per run.`,
    };
  }

  const emails: string[] = [];
  const subjectLines: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const n = i + 1;
    const row = items[i];
    if (typeof row !== "object" || row === null) {
      return { ok: false, error: `Item ${n}: each row must be a set of fields.` };
    }
    const item = row as PitchItem;
    const blogName = clean(item.blogName);
    const topicIdea = clean(item.topicIdea);
    const credentials = clean(item.credentials);

    if (!blogName) {
      return { ok: false, error: `Item ${n}: Blog name is required.` };
    }
    if (!topicIdea) {
      return { ok: false, error: `Item ${n}: Topic idea is required.` };
    }

    const label = items.length > 1 ? ` (pitch ${n} of ${items.length})` : "";
    const subjects = SUBJECT_BANK.map((s) =>
      fill(s, { BLOG_NAME: blogName, TOPIC_IDEA: topicIdea }),
    );
    for (const s of subjects) {
      subjectLines.push((items.length > 1 ? `[${blogName}] ` : "") + s);
    }

    const credentialsLine = credentials
      ? `A bit about me: ${credentials}`
      : CREDENTIALS_FALLBACK;

    const email = fill(EMAIL_TEMPLATE, {
      BLOG_NAME: blogName,
      TOPIC_IDEA: topicIdea,
      CREDENTIALS_LINE: credentialsLine,
      SUBJECT: subjects[0],
    });

    emails.push(email + (label ? `\n\n— pitch ${n} of ${items.length}` : ""));
  }

  return {
    ok: true,
    values: {
      pitchEmail: emails.join("\n\n" + "=".repeat(40) + "\n\n"),
      subjectLines,
    },
  };
}
