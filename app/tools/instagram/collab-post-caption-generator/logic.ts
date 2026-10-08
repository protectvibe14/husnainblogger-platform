/**
 * tool-219 — Collab Post Caption Generator (generator).
 *
 * HONESTY: Fully client-side caption assembly from FIXED templates and
 * FIXED tone phrase banks. Never "AI". Includes an honest disclosure
 * reminder about #ad labeling and paid-partnership tagging.
 *
 * Word banks (documented sizes):
 *   TONES    — 4 tone keys × 3 fixed phrases each (12 phrases total)
 *   FORMULAS — 6 fixed caption formulas
 *
 * Pure TypeScript: zero imports, no DOM, no network, no Math.random.
 * Deterministic: same inputs -> same outputs, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const TONES: Readonly<Record<string, ReadonlyArray<string>>> = {
  friendly: [
    "So excited to team up",
    "Thrilled to partner",
    "Could not be happier to collaborate",
  ],
  professional: [
    "Proud to announce our collaboration",
    "Pleased to partner",
    "Delighted to work together",
  ],
  playful: [
    "Plot twist: we teamed up",
    "Two brands, one epic drop",
    "Guess who joined forces",
  ],
  bold: [
    "We did not come to play",
    "The collab you have been waiting for",
    "Big news, bigger energy",
  ],
};

const TONE_KEYS = ["friendly", "professional", "playful", "bold"] as const;

const FORMULAS: ReadonlyArray<(handle: string, campaign: string, opener: string) => string> = [
  (h, c, o) => `${o} with ${h}! Our ${c} is officially live — check both our pages for the details. #ad`,
  (h, c, o) => `${o}! ${h} x us: the ${c} collab is here. Tell us what you think below. #paidpartnership`,
  (h, c, o) => `It is official — ${o} with ${h} on ${c}. Everything you need to know is in our latest posts. #ad`,
  (h, c, o) => `${o} with ${h} ✨ ${c} starts today — follow both accounts so you do not miss a thing. #paidpartnership`,
  (h, c, o) => `Teaming up with ${h} for ${c}! ${o} — full details on both profiles. #ad`,
  (h, c, o) => `${o} — our ${c} collab with ${h} is live now. Save this post and share it with a friend. #paidpartnership`,
];

const DISCLOSURE_REMINDER =
  "Disclosure reminder: keep #ad or #paidpartnership near the start of the caption, and tag your partner as a paid partnership in Instagram's Advanced settings when the collab is paid or gifted. Disclosure rules vary by country — check your local requirements.";

function normalizeHandle(raw: string): string {
  const trimmed = raw.trim().replace(/^@+/, "");
  return "@" + trimmed;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const partnerHandle = String(values.partnerHandle ?? "").trim();
  if (partnerHandle === "") {
    return { ok: false, error: "Enter your partner's Instagram handle (e.g. @brandname)." };
  }
  const handleCore = partnerHandle.replace(/^@+/, "");
  if (!/^[A-Za-z0-9._]{1,30}$/.test(handleCore)) {
    return { ok: false, error: "That handle does not look like a valid Instagram handle." };
  }

  const campaign = String(values.campaign ?? "").trim();
  if (campaign === "") {
    return { ok: false, error: "Describe the campaign (e.g. \"summer skincare launch\")." };
  }

  const toneRaw = String(values.tone ?? "").trim().toLowerCase();
  const tone = (TONE_KEYS as ReadonlyArray<string>).includes(toneRaw) ? toneRaw : "friendly";

  const handle = normalizeHandle(partnerHandle);
  const phrases = TONES[tone];
  const seed = handleCore.length + campaign.length;

  const captions: string[] = [];
  for (let i = 0; i < 3; i++) {
    const formula = FORMULAS[(seed + i * 2) % FORMULAS.length];
    const opener = phrases[(seed + i) % phrases.length];
    captions.push(formula(handle, campaign, opener));
  }

  return {
    ok: true,
    values: { captions, disclosureReminder: DISCLOSURE_REMINDER },
  };
}
