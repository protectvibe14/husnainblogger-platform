/**
 * Channel About Page Generator — pure template assembly (NOT AI).
 *
 * The engine fills a fixed 5-section channel-description template
 * (welcome / what-you-get / schedule / call-to-action / contact) with the
 * user's keyword slots. The only variation is the call-to-action line, which
 * is picked deterministically from CTA_LINES by hashing the channel name —
 * same inputs always produce the same output.
 *
 * Fixed content banks (documented sizes):
 * - CTA_LINES: 4 fixed call-to-action templates, each with a {niche} slot.
 *
 * Honesty notes:
 * - Output is capped at ABOUT_CHAR_LIMIT (1000) characters, matching
 *   YouTube's channel description limit (verified from a secondary source —
 *   re-check in YouTube Studio if YouTube changes it).
 * - This tool does not write copy for you creatively; it assembles a
 *   structured template. Edit the result in your own voice before pasting.
 *
 * Pure: no imports, no DOM, no network, no randomness.
 */

const ABOUT_CHAR_LIMIT = 1000;

/** 4 fixed call-to-action templates; {niche} is replaced at assembly time. */
const CTA_LINES: readonly string[] = [
  "If you love {niche}, subscribe and never miss a new upload.",
  "Hit subscribe to join our {niche} community — new videos are on the way.",
  "Subscribe and turn on the bell so you never miss a {niche} video.",
  "Like what you see? Subscribe for more {niche} on every upload day.",
];

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** Deterministic pick: char-code sum hash of a seed string, mod bank size. */
function pickIndex(seed: string, size: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) % 1000003;
  return h % size;
}

function assembleAbout(
  channelName: string,
  niche: string,
  schedule: string,
  contactEmail: string | null,
): string {
  const name = channelName.trim();
  const topic = niche.trim();
  const plan = schedule.trim();
  const cta = CTA_LINES[pickIndex(name + topic, CTA_LINES.length)].replaceAll(
    "{niche}",
    topic,
  );
  const contactLine = contactEmail
    ? `For business inquiries: ${contactEmail.trim()}`
    : "For business inquiries: reach out via the email listed on this channel.";

  const text =
    `Welcome to ${name}!\n\n` +
    `${name} is your home for ${topic} — practical videos that help you learn, improve, and stay inspired.\n\n` +
    `On this channel you will find ${topic} tutorials, step-by-step ${topic} guides, and ${topic} tips and tricks you can use right away.\n\n` +
    `Upload schedule: ${plan}.\n\n` +
    `${cta}\n\n` +
    contactLine;

  if (text.length <= ABOUT_CHAR_LIMIT) return text;
  // Safety cap: hard-truncate at a word boundary, never mid-word, with ellipsis.
  const cut = text.slice(0, ABOUT_CHAR_LIMIT - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  const channelName = values["channelName"];
  const niche = values["niche"];
  const uploadSchedule = values["uploadSchedule"];
  const contactEmail = values["contactEmail"];

  if (!isNonEmptyString(channelName))
    return { ok: false, error: "Enter your channel name first." };
  if (channelName.trim().length > 100)
    return { ok: false, error: "Channel name must be 100 characters or fewer." };
  if (!isNonEmptyString(niche))
    return { ok: false, error: "Enter your channel niche or topic first." };
  if (niche.trim().length > 60)
    return { ok: false, error: "Niche must be 60 characters or fewer." };
  if (!isNonEmptyString(uploadSchedule))
    return {
      ok: false,
      error: "Describe your upload schedule (e.g. New videos every Tuesday).",
    };
  if (uploadSchedule.trim().length > 80)
    return { ok: false, error: "Upload schedule must be 80 characters or fewer." };

  let email: string | null = null;
  if (contactEmail !== undefined && contactEmail !== null && String(contactEmail).trim() !== "") {
    if (typeof contactEmail !== "string")
      return { ok: false, error: "Contact email must be text." };
    const trimmed = contactEmail.trim();
    if (trimmed.length > 254)
      return { ok: false, error: "Contact email must be 254 characters or fewer." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      return { ok: false, error: "That contact email does not look valid." };
    email = trimmed;
  }

  const aboutPage = assembleAbout(channelName, niche, uploadSchedule, email);
  return {
    ok: true,
    values: { aboutPage, charCount: aboutPage.length },
  };
}
