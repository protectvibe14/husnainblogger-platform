/**
 * Launch Email Sequence Generator (tool-413) — pure logic, zero imports.
 *
 * FIXED TEMPLATE LIBRARY, NOT AI: every subject and body draft is assembled
 * from fixed template banks documented below. Selection is deterministic:
 * the same inputs always produce the same sequence (a char-code hash of the
 * inputs picks the bank index for each email slot). The UI must never claim
 * AI generation — copy must say "templates".
 *
 * Word banks (sizes documented for honest UI copy):
 *   SUBJECTS: 7 slots x 5 subjects = 35 subject templates
 *   BODIES:   7 slots x 4 body templates = 28 body templates
 *   TONES: 4 fixed tones (friendly, warm, professional, playful) — shared
 *   greeting/sign-off convention with the other sequence tools.
 *
 * Fixed 7-email launch arc (day offsets are relative to the launch date):
 *   slot 0: T-7 — Tease (pre-launch)
 *   slot 1: T-3 — Tease (pre-launch)
 *   slot 2: T-1 — Announce (pre-launch)
 *   slot 3: T+0 — Cart open (launch day)
 *   slot 4: T+2 — Social proof
 *   slot 5: T+5 — FAQ / objections
 *   slot 6: T+7 — Last call
 *
 * Input rules:
 *   - product, audience: required, non-empty after trim; max 100 Unicode
 *     code points ([...s].length, so emoji count as one); overlong input is
 *     truncated with a visible notice, never silently dropped.
 *   - launchDate: required, format YYYY-MM-DD, must be a real calendar date.
 *     Send dates are computed with UTC date arithmetic (no timezone drift).
 *   - tone: one of the 4 fixed tones (default friendly).
 *
 * Output sanitization: user text interpolated into templates is HTML-escaped.
 * The {{firstName}} placeholder is left in place with a documented fallback
 * ("there") — never rendered empty.
 */

export const TONES: readonly string[] = ["friendly", "warm", "professional", "playful"];
export const DEFAULT_TONE = "friendly";
export const MAX_INPUT_CHARS = 100;

/** Phase label of each email slot (fixed). */
export const SLOT_PHASES: readonly string[] = [
  "Tease (pre-launch)",
  "Tease (pre-launch)",
  "Announce (pre-launch)",
  "Cart open (launch day)",
  "Social proof",
  "FAQ / objections",
  "Last call",
];

/** Day offsets relative to launch day, matching SLOT_PHASES. */
export const SLOT_DAY_OFFSETS: readonly number[] = [-7, -3, -1, 0, 2, 5, 7];

/** 35 subject templates (7 slots x 5). Slots: {product}, {audience}. */
export const SUBJECTS: readonly (readonly string[])[] = [
  [
    "Something new is coming for {audience}",
    "We've been working on this for months…",
    "A sneak peek at {product}",
    "Mark your calendar: {launchDate}",
    "The {product} countdown starts now",
  ],
  [
    "{product}: 3 days to go",
    "What if {audience} could {benefit}?",
    "The wait is almost over",
    "Early access opens soon — are you in?",
    "One more hint about {product}",
  ],
  [
    "Tomorrow: {product} goes live",
    "24 hours until {product}",
    "Get ready — {product} launches tomorrow",
    "Your {product} reminder (1 day left)",
    "Almost time: {product} opens tomorrow",
  ],
  [
    "It's live: {product} is here!",
    "{product} doors are open",
    "Today's the day — {product} launches",
    "You asked for it: meet {product}",
    "{product} is finally available",
  ],
  [
    "What early buyers say about {product}",
    "Real results with {product} (48 hours in)",
    "Don't take our word for it",
    "{audience} are loving {product} — here's why",
    "The reviews are in: {product}",
  ],
  [
    "Still on the fence about {product}?",
    "{product}: your questions, answered",
    "Is {product} right for you?",
    "What {audience} ask before joining",
    "Honest answers about {product}",
  ],
  [
    "Last call: {product} closes tonight",
    "Final hours — {product}",
    "Don't miss out: {product} ends today",
    "{{firstName}}, this is your last chance",
    "Closing soon: {product}",
  ],
];

/** 28 body templates (7 slots x 4). Slots: {greeting}, {product}, {audience}, {launchDate}, {{firstName}}, {signoff}. */
export const BODIES: readonly (readonly string[])[] = [
  [
    "{greeting}\n\nI can't share details yet — but if you're {audience}, you'll want to see what we've been building.\n\nIt's called {product}, and it launches on {launchDate}. Watch your inbox: I'll share a sneak peek in a few days.\n\n{signoff}",
    "{greeting}\n\nBig news is coming. For months we've been building {product} specifically for {audience}.\n\nLaunch day is {launchDate}. I'll send you early details before anyone else — stay tuned.\n\n{signoff}",
    "{greeting}\n\nQuick heads-up: something new for {audience} is almost here.\n\n{product} launches {launchDate}. I'm telling my email list first, so you're in the right place. More soon.\n\n{signoff}",
    "{greeting}\n\nSave the date: {launchDate}. That's when {product} goes live.\n\nIf you're {audience}, this was made for you. I'll share exactly what it does — and why it matters — in my next email.\n\n{signoff}",
  ],
  [
    "{greeting}\n\nThree days until {product} launches. Here's the problem it solves for {audience}: [one-sentence problem].\n\nAnd here's the outcome: [one-sentence outcome]. Full reveal on {launchDate}.\n\n{signoff}",
    "{greeting}\n\nThe countdown is on — {product} opens in 3 days.\n\nWhat makes it different? It was designed with {audience} from day one, not adapted later. You'll see what I mean on {launchDate}.\n\n{signoff}",
    "{greeting}\n\nHint #2 about {product}: it takes [task] from hours to minutes.\n\nIf you're {audience}, you know how much that matters. Launch: {launchDate}. Almost there.\n\n{signoff}",
    "{greeting}\n\n3 days left. Let me answer the question I keep getting: \"Who is {product} for?\"\n\nIt's for {audience} who want [outcome] without [pain]. If that's you, {launchDate} is your day.\n\n{signoff}",
  ],
  [
    "{greeting}\n\nTomorrow's the day: {product} launches on {launchDate}.\n\nHere's your plan: open tomorrow's email, click through, and grab your spot early — [mention any early-bird perk].\n\n{signoff}",
    "{greeting}\n\n24-hour warning: {product} goes live tomorrow ({launchDate}).\n\n{audience} on this list get first access. Set a reminder — you won't want to miss the opening.\n\n{signoff}",
    "{greeting}\n\nOne more sleep until {product}. Quick recap of what's coming:\n\n• Built for {audience}\n• Launches {launchDate}\n• [Key benefit one]\n• [Key benefit two]\n\nSee you tomorrow.\n\n{signoff}",
    "{greeting}\n\nTomorrow, {product} becomes real. I've poured months into making this right for {audience}.\n\nDoors open {launchDate}. I'll email you the moment they're open.\n\n{signoff}",
  ],
  [
    "{greeting}\n\nIt's live! {product} is now available: [link].\n\nBuilt for {audience}, it helps you [outcome]. [Mention launch pricing or bonus, e.g. founding-member pricing ends in 7 days.]\n\n{signoff}",
    "{greeting}\n\nDoors are open: {product} has officially launched. Get it here: [link].\n\nIf you're {audience}, this is your moment. [Bonus details, e.g. the first 50 buyers get a bonus session.]\n\n{signoff}",
    "{greeting}\n\nToday's the day I stop teasing and start delivering: {product} is live: [link].\n\nQuick start: [one-sentence how to begin]. Questions? Just reply — I read every email.\n\n{signoff}",
    "{greeting}\n\n{product} is here! After months of work, it's finally available to {audience}: [link].\n\nTo celebrate launch week: [offer details]. This won't last — [deadline].\n\n{signoff}",
  ],
  [
    "{greeting}\n\n48 hours in, and {audience} are already seeing results with {product}.\n\n\"[Short testimonial or early result.]\" — [name, role]\n\nJoin them here: [link].\n\n{signoff}",
    "{greeting}\n\nDon't take my word for it — here's what early {product} buyers say:\n\n\"[Quote about the main benefit.]\" — [name]\n\n\"[Quote about ease or speed.]\" — [name]\n\nSee for yourself: [link].\n\n{signoff}",
    "{greeting}\n\nReal talk: I could list features all day, but results matter more.\n\nEarly {product} users report [specific outcome]. That's why I built it for {audience} in the first place: [link].\n\n{signoff}",
    "{greeting}\n\nThe reviews are coming in, and I'm genuinely proud:\n\n• [Result or rating one]\n• [Result or rating two]\n\n{product} is still available here: [link].\n\n{signoff}",
  ],
  [
    "{greeting}\n\nStill deciding on {product}? Here are honest answers to the top questions:\n\nQ: Is it right for beginners? A: Yes — {audience} of all levels use it.\n\nQ: How much time does it take? A: [honest answer].\n\nQ: What if it's not for me? A: [guarantee/refund details].\n\nGet it here: [link].\n\n{signoff}",
    "{greeting}\n\nLet's address the hesitation head-on. The three things {audience} ask before getting {product}:\n\n1. [Objection] → [honest answer]\n2. [Objection] → [honest answer]\n3. [Objection] → [honest answer]\n\nStill curious? [link].\n\n{signoff}",
    "{greeting}\n\nIs {product} right for you? It's a great fit if you're {audience} and you want [outcome].\n\nIt's NOT for you if [honest disqualifier]. I'd rather you skip it than buy wrong.\n\nIf it's a fit: [link].\n\n{signoff}",
    "{greeting}\n\nFAQ lightning round on {product}:\n\n• Price? [price]\n• Time needed? [time]\n• Guarantee? [guarantee]\n• Support? [support details]\n\nEverything else: just reply and ask. [link].\n\n{signoff}",
  ],
  [
    "{greeting}\n\nFinal call: {product} closes tonight.\n\nAfter today, [what changes: price goes up / doors close / bonus disappears]. If you've been waiting, this is the moment: [link].\n\n{signoff}",
    "{greeting}\n\nLast chance, {{firstName}}. {product} enrollment ends in hours.\n\nNo fake urgency — [plain explanation of why it closes]. Get in here: [link].\n\n{signoff}",
    "{greeting}\n\nThe window is closing on {product}. Here's what you get if you act today:\n\n• [Benefit one]\n• [Benefit two]\n• [Launch bonus, if any]\n\nAfter tonight: [what changes]. [link].\n\n{signoff}",
    "{greeting}\n\nI'll keep this short: {product} closes today.\n\nIf you're {audience} and you want [outcome], don't let this pass: [link].\n\nWhatever you decide — thanks for being here.\n\n{signoff}",
  ],
];

/** 12 greetings (4 tones x 3). */
export const GREETINGS: Record<string, readonly string[]> = {
  friendly: ["Hey {{firstName}},", "Hi {{firstName}} — big news!", "Hello {{firstName}},"],
  warm: ["A warm hello, {{firstName}},", "So glad you're here, {{firstName}},", "Welcome back, {{firstName}},"],
  professional: ["Hello {{firstName}},", "Dear {{firstName}},", "Good day {{firstName}},"],
  playful: ["Hey hey, {{firstName}}!", "Psst… {{firstName}}!", "Big news, {{firstName}}!"],
};

/** 8 sign-offs (4 tones x 2). */
export const SIGNOFFS: Record<string, readonly string[]> = {
  friendly: ["Cheers,\n[Your name]", "Talk soon,\n[Your name]"],
  warm: ["With excitement,\n[Your name]", "Warmly,\n[Your name]"],
  professional: ["Best regards,\n[Your name]", "Sincerely,\n[Your name]"],
  playful: ["Stay awesome,\n[Your name]", "Catch you at launch,\n[Your name]"],
};

// ---------------------------------------------------------------------------
// Helpers (pure, no imports)
// ---------------------------------------------------------------------------

function codePoints(s: string): number {
  return [...s].length;
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(bank: readonly T[], seed: number): T {
  return bank[((seed % bank.length) + bank.length) % bank.length];
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fill(
  template: string,
  slots: Record<string, string>,
): string {
  let out = template;
  for (const [key, value] of Object.entries(slots)) {
    out = out.split(`{${key}}`).join(value);
  }
  return out;
}

function requiredText(values: Record<string, unknown>, id: string, label: string): string {
  const raw = values[id];
  if (typeof raw !== "string" || raw.trim() === "") {
    throw new Error(`Please enter ${label}.`);
  }
  return raw.trim();
}

function truncateWithNotice(s: string, id: string, notices: string[]): string {
  if (codePoints(s) > MAX_INPUT_CHARS) {
    notices.push(
      `Note: ${id} was over ${MAX_INPUT_CHARS} characters, so it was shortened. The full text was not silently dropped — edit it down to what matters most.`,
    );
    return [...s].slice(0, MAX_INPUT_CHARS).join("");
  }
  return s;
}

/** Validate YYYY-MM-DD and confirm it is a real calendar date. */
function validatedDate(raw: unknown): { y: number; m: number; d: number } {
  if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new Error("Please enter a valid launch date (YYYY-MM-DD).");
  }
  const y = Number(raw.slice(0, 4));
  const m = Number(raw.slice(5, 7));
  const d = Number(raw.slice(8, 10));
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    throw new Error("Please enter a real calendar date for the launch (YYYY-MM-DD).");
  }
  return { y, m, d };
}

/** Add (possibly negative) days to a Y/M/D triple using UTC arithmetic. */
function addDays(y: number, m: number, d: number, offset: number): string {
  const dt = new Date(Date.UTC(y, m - 1, d + offset));
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

function formatOffset(offset: number): string {
  if (offset === 0) return "Launch day";
  return offset > 0 ? `T+${offset}` : `T${offset}`;
}

function validatedTone(raw: unknown): string {
  if (typeof raw === "undefined" || raw === null || raw === "") return DEFAULT_TONE;
  if (typeof raw !== "string" || !TONES.includes(raw)) {
    throw new Error(`Please choose a tone: ${TONES.join(", ")}.`);
  }
  return raw;
}

function findRepeatedWord(text: string): string | null {
  const m = text.match(/\b([A-Za-z]{3,})\s+\1\b/i);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const notices: string[] = [];
  let product: string;
  let audience: string;
  let launch: { y: number; m: number; d: number };
  let tone: string;
  try {
    product = requiredText(values, "product", "your product name");
    audience = requiredText(values, "audience", "your target audience");
    launch = validatedDate(values.launchDate);
    tone = validatedTone(values.tone);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }

  product = escapeHtml(truncateWithNotice(product, "product", notices));
  audience = escapeHtml(truncateWithNotice(audience, "audience", notices));
  const launchIso = `${launch.y}-${String(launch.m).padStart(2, "0")}-${String(launch.d).padStart(2, "0")}`;

  const seed = hashStr(`${product}|${audience}|${launchIso}|${tone}`);
  const greetings = GREETINGS[tone];
  const signoffs = SIGNOFFS[tone];

  const rows: string[][] = [];
  for (let i = 0; i < SLOT_PHASES.length; i++) {
    const offset = SLOT_DAY_OFFSETS[i];
    const sendDate = addDays(launch.y, launch.m, launch.d, offset);
    const slots = {
      greeting: pick(greetings, seed + i),
      product,
      audience,
      launchDate: launchIso,
      benefit: "[benefit]",
      signoff: pick(signoffs, seed + i * 5),
    };
    const subject = fill(pick(SUBJECTS[i], seed + i * 2), slots);
    const bodyDraft = fill(pick(BODIES[i], seed + i * 3), slots);
    const dup = findRepeatedWord(subject) ?? findRepeatedWord(bodyDraft);
    if (dup) {
      notices.push(
        `Note: the "${SLOT_PHASES[i]}" email draft contains a repeated word ("${dup} ${dup}") — review the copy before sending.`,
      );
    }
    rows.push([SLOT_PHASES[i], formatOffset(offset), sendDate, subject, bodyDraft]);
  }

  const valuesOut: Record<string, unknown> = {
    sequence: {
      columns: ["Phase", "Day offset", "Send date", "Subject", "Body draft"],
      rows,
    },
  };
  if (notices.length > 0) {
    valuesOut.notices = notices.join(" ");
  }
  return { ok: true, values: valuesOut };
}
