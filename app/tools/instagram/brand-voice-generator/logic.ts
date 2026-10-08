/**
 * Brand Voice Generator — pure logic.
 *
 * WHAT IT HONESTLY DOES:
 * Builds a brand-voice profile from 3-5 adjectives the user picks, a niche
 * name, and an optional example line. Everything comes from FIXED word
 * banks: per-adjective "do" and "don't" phrase banks and fixed sample-line
 * templates with the niche and adjectives slotted in.
 *
 * It is a client-side TEMPLATE ENGINE. It does NOT use AI, does not read
 * your captions, and does not analyze your writing style. The phrases are
 * curated one-liners picked deterministically — the same inputs always
 * produce the same profile.
 *
 * FIXED DATA (documented):
 * - ADJECTIVES: 8 checkbox adjectives (bold, friendly, playful,
 *   professional, honest, inspiring, witty, calm).
 * - DO_BANK / DONT_BANK: 4 phrases each per adjective (8 x 4 x 2 = 64).
 * - SAMPLE_TEMPLATES: 4 caption templates with {niche}/{adj} slots.
 * - Per adjective the tool picks 2 do-phrases and 2 don't-phrases via a
 *   deterministic hash of (adjectiveId + niche) — no randomness.
 *
 * Deterministic: same inputs -> identical profile, always.
 * Zero imports, zero DOM, zero network, zero Math.random.
 */

export interface AdjectiveSpec {
  id: string;
  label: string;
  doPhrases: ReadonlyArray<string>;
  dontPhrases: ReadonlyArray<string>;
}

export const MIN_ADJECTIVES = 3;
export const MAX_ADJECTIVES = 5;
export const MAX_NICHE_LENGTH = 120;
export const MAX_EXAMPLE_LENGTH = 500;

/**
 * The 8 adjectives with their fixed phrase banks.
 * Bank size: 8 adjectives x (4 do + 4 don't) = 64 phrases.
 */
export const ADJECTIVES: ReadonlyArray<AdjectiveSpec> = [
  {
    id: "adjBold",
    label: "Bold",
    doPhrases: ["Say the strong opinion, not the safe one.", "Use short, punchy sentences.", "Take a clear stance in the first line.", "Write like you mean every word."],
    dontPhrases: ["Don't water opinions down with maybe and sort of.", "Don't apologize before making a point.", "Don't hide the take behind fluff.", "Don't use passive, hedging language."],
  },
  {
    id: "adjFriendly",
    label: "Friendly",
    doPhrases: ["Write like you're texting a friend.", "Use warm, welcoming openers.", "Celebrate small wins with your readers.", "Ask genuine questions and mean them."],
    dontPhrases: ["Don't sound like a corporate press release.", "Don't talk down to beginners.", "Don't use cold, clinical language.", "Don't forget to say please and thank you."],
  },
  {
    id: "adjPlayful",
    label: "Playful",
    doPhrases: ["Use humor and playful wordplay.", "Drop in fun analogies and metaphors.", "Keep the energy light and upbeat.", "Use emojis sparingly but with intent."],
    dontPhrases: ["Don't be serious about everything.", "Don't use jokes that punch down.", "Don't force humor into sensitive topics.", "Don't let the playfulness bury the point."],
  },
  {
    id: "adjProfessional",
    label: "Professional",
    doPhrases: ["Use precise, confident language.", "Structure captions with a clear beginning, middle, end.", "Cite facts and keep claims verifiable.", "Keep tone consistent across every post."],
    dontPhrases: ["Don't use slang you wouldn't use with a client.", "Don't post half-checked facts.", "Don't ramble — respect the reader's time.", "Don't mix tones randomly post to post."],
  },
  {
    id: "adjHonest",
    label: "Honest",
    doPhrases: ["Share what didn't work, not just wins.", "Admit when you're learning alongside readers.", "Give the real numbers and the real story.", "Write the caption you'd want to read."],
    dontPhrases: ["Don't fake results you don't have.", "Don't hide the hard parts.", "Don't overpromise outcomes.", "Don't pretend mistakes never happened."],
  },
  {
    id: "adjInspiring",
    label: "Inspiring",
    doPhrases: ["End captions with a call to believe and act.", "Share transformation stories and lessons.", "Use uplifting, forward-looking language.", "Remind readers what they're capable of."],
    dontPhrases: ["Don't dwell on problems without hope.", "Don't use empty motivational clichés.", "Don't shame readers for where they are.", "Don't inspire without giving a next step."],
  },
  {
    id: "adjWitty",
    label: "Witty",
    doPhrases: ["Use clever one-liners and sharp observations.", "Play with expectations and twist clichés.", "Keep it smart — reward re-reads.", "Use dry humor where it fits."],
    dontPhrases: ["Don't be witty at someone else's expense.", "Don't be so clever the point gets lost.", "Don't use inside jokes no one gets.", "Don't sacrifice clarity for a punchline."],
  },
  {
    id: "adjCalm",
    label: "Calm",
    doPhrases: ["Use simple, unhurried sentences.", "Give readers space — white space, short paragraphs.", "Reassure without overpromising.", "Keep the tone steady, never frantic."],
    dontPhrases: ["Don't use hype or urgency tricks.", "Don't shout with caps and exclamation spam.", "Don't create anxiety to sell.", "Don't rush the reader to decide."],
  },
];

/**
 * Fixed sample-caption templates. {niche} and {a}/{b}/{c} are filled with
 * the user's niche and selected adjectives.
 * Bank size: 4 templates.
 */
export const SAMPLE_TEMPLATES: ReadonlyArray<string> = [
  "{niche} tips, delivered the {a} way — no fluff, just what actually works. 👇",
  "POV: {a} {niche} advice that skips the lecture and gets straight to the good part.",
  "Day 1 of making {niche} feel {b} and {c} instead of overwhelming. Save this. 📌",
  "Unpopular opinion about {niche}: {a} always beats perfect. Here's why. 👇",
];

/** Tiny deterministic string hash (djb2) — no randomness involved. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Pick 2 phrases from a 4-bank deterministically. Exported for tests. */
export function pickPhrases(bank: ReadonlyArray<string>, seed: string): string[] {
  const start = hashString(seed) % bank.length;
  return [bank[start], bank[(start + 1) % bank.length]];
}

/** Fill one sample template with niche + up to 3 adjective labels. */
export function fillTemplate(template: string, niche: string, adjectives: string[]): string {
  const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
  return template
    .replace("{niche}", niche)
    .replace("{a}", lower(adjectives[0] ?? "honest"))
    .replace("{b}", lower(adjectives[1] ?? adjectives[0] ?? "honest"))
    .replace("{c}", lower(adjectives[2] ?? adjectives[0] ?? "honest"));
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const selected = ADJECTIVES.filter((a) => values[a.id] === true);
  if (selected.length < MIN_ADJECTIVES || selected.length > MAX_ADJECTIVES) {
    return {
      ok: false,
      error: `Pick ${MIN_ADJECTIVES} to ${MAX_ADJECTIVES} adjectives to define your voice (you picked ${selected.length}).`,
    };
  }

  const rawNiche = values["niche"];
  if (typeof rawNiche !== "string" || rawNiche.trim().length === 0) {
    return { ok: false, error: "Please enter your niche (for example, \"budget travel\")." };
  }
  const niche = rawNiche.trim();
  if (niche.length > MAX_NICHE_LENGTH) {
    return { ok: false, error: `Your niche must be ${MAX_NICHE_LENGTH} characters or fewer.` };
  }

  const rawExample = values["exampleLine"];
  let exampleLine = "";
  if (typeof rawExample === "string" && rawExample.trim().length > 0) {
    exampleLine = rawExample.trim();
    if (exampleLine.length > MAX_EXAMPLE_LENGTH) {
      return { ok: false, error: `Your example line must be ${MAX_EXAMPLE_LENGTH} characters or fewer.` };
    }
  }

  const labels = selected.map((a) => a.label);
  const doPhrases: string[] = [];
  const dontPhrases: string[] = [];
  for (const adj of selected) {
    doPhrases.push(...pickPhrases(adj.doPhrases, adj.id + niche));
    dontPhrases.push(...pickPhrases(adj.dontPhrases, adj.id + niche));
  }
  const sampleLines = SAMPLE_TEMPLATES.map((t) => fillTemplate(t, niche, labels));

  const lines: string[] = [
    `BRAND VOICE PROFILE — ${niche}`,
    `Tone: ${labels.join(", ")}`,
    "",
    "DO:",
    ...doPhrases.map((p) => `- ${p}`),
    "",
    "DON'T:",
    ...dontPhrases.map((p) => `- ${p}`),
    "",
    "SAMPLE CAPTIONS:",
    ...sampleLines.map((p) => `- ${p}`),
  ];
  if (exampleLine.length > 0) {
    lines.push("", `YOUR EXAMPLE LINE (kept as-is):`, `- ${exampleLine}`);
  }

  return {
    ok: true,
    values: {
      doPhrases,
      dontPhrases,
      sampleLines,
      copyAll: lines.join("\n"),
    },
  };
}
