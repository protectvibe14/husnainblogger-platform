/**
 * Welcome Email Sequence Generator (tool-411) — pure logic, zero imports.
 *
 * FIXED TEMPLATE LIBRARY, NOT AI: every subject and body draft is assembled
 * from fixed template banks documented below. Selection is deterministic:
 * the same inputs always produce the same sequence (a char-code hash of the
 * inputs picks the bank index for each email slot). The UI must never claim
 * AI generation — copy must say "templates".
 *
 * Word banks (sizes documented for honest UI copy):
 *   SUBJECTS: 7 slots x 6 subjects = 42 subject templates
 *   BODIES:   7 slots x 4 body templates = 28 body templates
 *   GREETINGS: 4 tones x 3 greetings = 12 greetings
 *   SIGNOFFS:  4 tones x 2 sign-offs = 8 sign-offs
 *   TONES: 4 fixed tones (friendly, warm, professional, playful)
 *
 * Sequence plan (fixed, industry-standard welcome arc):
 *   slot 0: day 0  — deliver the lead magnet
 *   slot 1: day 1  — introduce the brand, set expectations
 *   slot 2: day 3  — deliver one quick win
 *   slot 3: day 5  — share social proof
 *   slot 4: day 7  — make a soft offer
 *   slot 5: day 10 — answer common questions
 *   slot 6: day 14 — recap value, invite a reply
 *
 * Input rules:
 *   - brand, leadMagnet: required, non-empty after trim; max 100 Unicode
 *     code points (measured with [...s].length so emoji count as one);
 *     overlong input is truncated with a visible notice, never silently.
 *   - emailCount: finite number, clamped to 3–7 (default 5).
 *   - tone: one of the 4 fixed tones (default friendly).
 *
 * Output sanitization: user text interpolated into templates is HTML-escaped.
 * The {{firstName}} placeholder is left in place with a documented fallback
 * ("there") — never rendered empty.
 */

export const TONES: readonly string[] = ["friendly", "warm", "professional", "playful"];
export const DEFAULT_TONE = "friendly";
export const DEFAULT_EMAIL_COUNT = 5;
export const MIN_EMAIL_COUNT = 3;
export const MAX_EMAIL_COUNT = 7;
export const MAX_INPUT_CHARS = 100;
export const FIRST_NAME_FALLBACK = "there";

/** Goal of each email slot in the welcome arc (fixed). */
export const SLOT_GOALS: readonly string[] = [
  "Deliver the lead magnet",
  "Introduce the brand and set expectations",
  "Deliver one quick win",
  "Share social proof",
  "Make a soft offer",
  "Answer common questions",
  "Recap value and invite a reply",
];

/** Day offsets matching SLOT_GOALS. */
export const SLOT_DAY_OFFSETS: readonly number[] = [0, 1, 3, 5, 7, 10, 14];

/** 42 subject templates (7 slots x 6). Slots: {brand}, {leadMagnet}. */
export const SUBJECTS: readonly (readonly string[])[] = [
  [
    "Your {leadMagnet} is here",
    "Welcome to {brand} — your {leadMagnet} inside",
    "Here it is: your {leadMagnet} from {brand}",
    "You asked, we delivered: {leadMagnet}",
    "{leadMagnet} + a quick hello from {brand}",
    "Welcome aboard! Grab your {leadMagnet}",
  ],
  [
    "The story behind {brand}",
    "Why {brand} exists (2-minute read)",
    "Quick intro: what to expect from us",
    "Hi, we're {brand} — here's our promise",
    "What {brand} is really about",
    "A little about us (and what's next for you)",
  ],
  [
    "One quick win you can use today",
    "Try this today: a 5-minute win",
    "Your first quick win from {brand}",
    "Small step, real result — start here",
    "Today's tip: simple and effective",
    "A 5-minute tactic worth trying",
  ],
  [
    "What others say about {brand}",
    "Real results from people like you",
    "Don't take our word for it",
    "Reader stories we love",
    "How others used {leadMagnet}",
    "{brand} in their words",
  ],
  [
    "Ready for the next step?",
    "When you're ready: how we can help",
    "A gentle nudge toward your goal",
    "Your next step (only if it fits)",
    "From free value to real results",
    "Curious what's possible? Start here",
  ],
  [
    "Questions? We have answers",
    "The questions everyone asks us",
    "Before you ask — read this",
    "Common questions, honest answers",
    "What new subscribers ask most",
    "Everything you're wondering, answered",
  ],
  [
    "Before you go: everything in one place",
    "Your {brand} starter recap",
    "Let's stay in touch — reply anytime",
    "One last thing (and a small ask)",
    "Recap: your first week with {brand}",
    "We'd love to hear from you",
  ],
];

/** 28 body templates (7 slots x 4). Slots: {greeting}, {brand}, {leadMagnet}, {{firstName}}, {signoff}. */
export const BODIES: readonly (readonly string[])[] = [
  [
    "{greeting}\n\nThanks for joining {brand}! As promised, here is your {leadMagnet}: [link].\n\nDownload it now, and keep an eye on your inbox — over the next few days I'll share the story behind {brand} and one quick win you can use right away.\n\n{signoff}",
    "{greeting}\n\nWelcome to {brand}. Your {leadMagnet} is ready: [link].\n\nI recommend starting with section one — it covers the fastest win. Reply to this email if anything is unclear; a real human reads every reply.\n\n{signoff}",
    "{greeting}\n\nYou made a great choice joining {brand}. Grab your {leadMagnet} here: [link].\n\nOver the next week, I'll send a few short emails: who we are, one tactic that works fast, and stories from readers like you. No fluff, ever.\n\n{signoff}",
    "{greeting}\n\nIt's official — you're in! Download your {leadMagnet}: [link].\n\nQuick tip: block 10 minutes today to go through it. Small action now beats perfect action later. More helpful emails are on the way.\n\n{signoff}",
  ],
  [
    "{greeting}\n\nQuick introduction: I'm with {brand}, and here's what we stand for — practical help, honest advice, and zero spam.\n\nHere's what to expect from these emails: one useful idea per email, sent a few times a week. If that's not for you, the unsubscribe link is at the bottom of every email — no hard feelings.\n\n{signoff}",
    "{greeting}\n\n{brand} started with a simple frustration: too much noise, not enough signal. So we built the resource we wished existed.\n\nYou'll hear from me regularly with what's working, what isn't, and the occasional behind-the-scenes look. Glad you're here.\n\n{signoff}",
    "{greeting}\n\nLet me set expectations: {brand} emails are short, practical, and written by a human. We send 2–3 per week.\n\nYour time matters, so every email ends with one clear takeaway. If an email ever wastes your time, hit reply and tell me — I read them all.\n\n{signoff}",
    "{greeting}\n\nA little about us: {brand} helps people get real results without the hype. No get-rich-quick promises, no jargon.\n\nOver the next few emails you'll get a quick win, real reader stories, and answers to the questions everyone asks. Let's get started.\n\n{signoff}",
  ],
  [
    "{greeting}\n\nTime for your first quick win. Open your {leadMagnet} and complete just the first exercise — it takes about five minutes.\n\nMost people skip this step and wonder why nothing changes. Don't be most people. Do the five minutes today, then reply and tell me how it went.\n\n{signoff}",
    "{greeting}\n\nHere's something you can use today: pick the single smallest action from your {leadMagnet} and do it before lunch.\n\nSmall wins compound. One tiny completed action builds more momentum than a perfect plan you never start.\n\n{signoff}",
    "{greeting}\n\nQuick win of the day: revisit your {leadMagnet} and highlight the one idea that surprised you most.\n\nThen apply it once — just once — this week. That single repetition is worth more than reading ten more guides.\n\n{signoff}",
    "{greeting}\n\nLet's make today count. From your {leadMagnet}, choose the tactic with the lowest effort and the clearest payoff.\n\nDo it today, note what happened, and keep that note. You'll be amazed how far one small test takes you.\n\n{signoff}",
  ],
  [
    "{greeting}\n\nDon't take our word for it — here's what readers of {brand} say:\n\n\"I finally understood what to do first. The {leadMagnet} alone was worth joining for.\" — a recent subscriber\n\nReal people, real progress. You're in good company.\n\n{signoff}",
    "{greeting}\n\nA quick story: one reader used the {leadMagnet} for two weeks and told us it changed how they approach their mornings.\n\nWe hear stories like this every week. Not magic — just clear steps, followed consistently. You're on the same path now.\n\n{signoff}",
    "{greeting}\n\nWhat do people like about {brand}? In their words: practical, no fluff, and \"the only newsletter I actually open.\"\n\nThat's the bar we hold ourselves to with every email we send you.\n\n{signoff}",
    "{greeting}\n\nProof, not promises: subscribers regularly tell us the {leadMagnet} was the most useful free resource they'd found all year.\n\nWe can't guarantee your results — nobody honest can — but we can promise useful, tested ideas in every email.\n\n{signoff}",
  ],
  [
    "{greeting}\n\nYou've got the {leadMagnet}, you know our story, and you've seen what's possible. If you want help going further, here's how {brand} can support you: [offer link].\n\nNo pressure — the free emails keep coming either way. This is only for when you're ready for the next step.\n\n{signoff}",
    "{greeting}\n\nQuick question: what's the one outcome you want most right now? Hit reply and tell me — I read every response.\n\nAnd if you'd like a shortcut, {brand} offers [offer]: [offer link]. It's the fastest path I know from where you are to where you want to be.\n\n{signoff}",
    "{greeting}\n\nFree resources take you far. Guided help takes you further, faster.\n\nIf you're ready, take a look at what {brand} offers: [offer link]. If not, no worries — keep enjoying the free emails. They'll keep being useful.\n\n{signoff}",
    "{greeting}\n\nA gentle nudge: the readers who get the best results combine the free {leadMagnet} with one focused next step.\n\nOurs is here if you want it: [offer link]. Either way, I'm glad you're here.\n\n{signoff}",
  ],
  [
    "{greeting}\n\nNew subscribers ask us the same questions, so here are honest answers:\n\nQ: How often will you email me? A: 2–3 times a week, always with something useful.\n\nQ: Is the {leadMagnet} really free? A: Yes — no catch, no credit card.\n\nQ: Can I reply? A: Please do. A human reads every reply.\n\n{signoff}",
    "{greeting}\n\nLet's clear up the common questions:\n\n\"Will you sell my email?\" Never. Your address stays with {brand}.\n\n\"What if the emails aren't for me?\" Unsubscribe anytime with one click — no guilt trip.\n\n\"Where do I start?\" With your {leadMagnet}: [link].\n\n{signoff}",
    "{greeting}\n\nFAQ time — the honest edition:\n\nQ: Do I need experience to benefit? A: No. Everything assumes you're starting fresh.\n\nQ: How much time does this take? A: Minutes per email. Small steps, consistently.\n\nQ: What makes {brand} different? A: We test everything before we teach it.\n\n{signoff}",
    "{greeting}\n\nYou asked, we answer:\n\nQ: Is there a catch with the free {leadMagnet}? A: None. It's our way of proving we're worth your inbox.\n\nQ: Can I share these emails? A: Absolutely — forwarding is the highest compliment.\n\nQ: What comes next? A: More quick wins, reader stories, and practical guides.\n\n{signoff}",
  ],
  [
    "{greeting}\n\nQuick recap of your first week with {brand}:\n\n1. Your {leadMagnet}: [link] (in case you missed it)\n2. Our story and what to expect\n3. One quick win you can use today\n4. Real reader results\n\nWhich email helped you most? Hit reply — your feedback shapes what we send next.\n\n{signoff}",
    "{greeting}\n\nBefore this welcome series ends, one small ask: reply with the #1 thing you want to achieve this month.\n\nYour answer helps me send you more of what actually matters. And your {leadMagnet} is always here if you need it: [link].\n\n{signoff}",
    "{greeting}\n\nThat's the welcome series — but it's not goodbye. You'll keep getting practical {brand} emails a few times a week.\n\nIf any email in this series helped you, forward it to someone who'd benefit. That's how {brand} grows: one helpful forward at a time.\n\n{signoff}",
    "{greeting}\n\nLast one in the welcome series. Here's everything in one place: your {leadMagnet} ([link]), our story, and the quick-win tactic.\n\nStick around — the best emails are still ahead. And remember: reply anytime. I mean it.\n\n{signoff}",
  ],
];

/** 12 greetings (4 tones x 3). {{firstName}} falls back to FIRST_NAME_FALLBACK. */
export const GREETINGS: Record<string, readonly string[]> = {
  friendly: ["Hey {{firstName}},", "Hi {{firstName}} — great to see you here!", "Hello {{firstName}},"],
  warm: ["Welcome in, {{firstName}},", "So glad you're here, {{firstName}},", "A warm hello, {{firstName}},"],
  professional: ["Hello {{firstName}},", "Dear {{firstName}},", "Good day {{firstName}},"],
  playful: ["Hey hey, {{firstName}}!", "Look who just joined — hi {{firstName}}!", "Well hello there, {{firstName}}!"],
};

/** 8 sign-offs (4 tones x 2). */
export const SIGNOFFS: Record<string, readonly string[]> = {
  friendly: ["Cheers,\nThe {brand} team", "Talk soon,\n{brand}"],
  warm: ["With gratitude,\nThe {brand} team", "Warmly,\n{brand}"],
  professional: ["Best regards,\nThe {brand} team", "Sincerely,\n{brand}"],
  playful: ["Stay awesome,\nTeam {brand}", "High fives,\nThe {brand} crew"],
};

// ---------------------------------------------------------------------------
// Helpers (pure, no imports)
// ---------------------------------------------------------------------------

/** Length in Unicode code points (emoji count as one). */
function codePoints(s: string): number {
  return [...s].length;
}

/** Deterministic char-code hash (FNV-1a style). Same input -> same output. */
function hashStr(s: string): number {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic bank pick. */
function pick<T>(bank: readonly T[], seed: number): T {
  return bank[((seed % bank.length) + bank.length) % bank.length];
}

/** Escape HTML special chars in user-supplied text. */
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Fill template slots. {{firstName}} is kept as a placeholder token. */
function fill(template: string, brand: string, leadMagnet: string, greeting: string, signoff: string): string {
  return template
    .split("{brand}")
    .join(brand)
    .split("{leadMagnet}")
    .join(leadMagnet)
    .split("{greeting}")
    .join(greeting)
    .split("{signoff}")
    .join(signoff);
}

function requiredText(values: Record<string, unknown>, id: string, label: string): string {
  const raw = values[id];
  if (typeof raw !== "string" || raw.trim() === "") {
    throw new Error(`Please enter ${label}.`);
  }
  return raw.trim();
}

function truncateWithNotice(
  s: string,
  id: string,
  notices: string[],
): string {
  if (codePoints(s) > MAX_INPUT_CHARS) {
    notices.push(
      `Note: ${id} was over ${MAX_INPUT_CHARS} characters, so it was shortened. The full text was not silently dropped — edit it down to what matters most.`,
    );
    return [...s].slice(0, MAX_INPUT_CHARS).join("");
  }
  return s;
}

function clampedCount(raw: unknown, notices: string[]): number {
  if (typeof raw === "undefined" || raw === null || raw === "") return DEFAULT_EMAIL_COUNT;
  const n = typeof raw === "string" ? Number(raw) : raw;
  if (typeof n !== "number" || Number.isNaN(n) || !Number.isFinite(n)) {
    throw new Error("Email count must be a number between 3 and 7.");
  }
  const rounded = Math.round(n);
  if (rounded < MIN_EMAIL_COUNT) {
    notices.push(`Note: email count was raised to the minimum of ${MIN_EMAIL_COUNT}.`);
    return MIN_EMAIL_COUNT;
  }
  if (rounded > MAX_EMAIL_COUNT) {
    notices.push(`Note: email count was lowered to the maximum of ${MAX_EMAIL_COUNT}.`);
    return MAX_EMAIL_COUNT;
  }
  return rounded;
}

function validatedTone(raw: unknown): string {
  if (typeof raw === "undefined" || raw === null || raw === "") return DEFAULT_TONE;
  if (typeof raw !== "string" || !TONES.includes(raw)) {
    throw new Error(`Please choose a tone: ${TONES.join(", ")}.`);
  }
  return raw;
}

/** Flag immediate repeated words (e.g. "the the") in generated copy. */
function findRepeatedWord(text: string): string | null {
  const m = text.match(/\b([A-Za-z]{3,})\s+\1\b/i);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface WelcomeEmail {
  dayOffset: number;
  goal: string;
  subject: string;
  bodyDraft: string;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const notices: string[] = [];
  let brand: string;
  let leadMagnet: string;
  let count: number;
  let tone: string;
  try {
    brand = requiredText(values, "brand", "your brand name");
    leadMagnet = requiredText(values, "leadMagnet", "your lead magnet (the freebie new subscribers get)");
    count = clampedCount(values.emailCount, notices);
    tone = validatedTone(values.tone);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }

  brand = escapeHtml(truncateWithNotice(brand, "brand", notices));
  leadMagnet = escapeHtml(truncateWithNotice(leadMagnet, "leadMagnet", notices));

  const seed = hashStr(`${brand}|${leadMagnet}|${tone}`);
  const greetings = GREETINGS[tone];
  const signoffs = SIGNOFFS[tone];

  const sequence: WelcomeEmail[] = [];
  for (let i = 0; i < count; i++) {
    const subject = fill(pick(SUBJECTS[i], seed + i * 2), brand, leadMagnet, "", "");
    const bodyDraft = fill(
      pick(BODIES[i], seed + i * 3),
      brand,
      leadMagnet,
      pick(greetings, seed + i),
      pick(signoffs, seed + i * 5),
    );
    const dup = findRepeatedWord(subject) ?? findRepeatedWord(bodyDraft);
    if (dup) {
      notices.push(
        `Note: email ${i + 1} draft contains a repeated word ("${dup} ${dup}") — review the copy before sending.`,
      );
    }
    sequence.push({
      dayOffset: SLOT_DAY_OFFSETS[i],
      goal: SLOT_GOALS[i],
      subject,
      bodyDraft,
    });
  }

  const valuesOut: Record<string, unknown> = {
    sequence: {
      columns: ["Day", "Goal", "Subject", "Body draft"],
      rows: sequence.map((e) => [String(e.dayOffset), e.goal, e.subject, e.bodyDraft]),
    },
  };
  if (notices.length > 0) {
    valuesOut.notices = notices.join(" ");
  }
  return { ok: true, values: valuesOut };
}
