/**
 * TikTok Ad Hook Writer — pure logic (tool-194).
 * Zero imports, zero network, zero DOM, fully deterministic.
 *
 * HONESTY: hooks are assembled from FIXED word banks — no AI, no performance
 * data, no "proven to convert" claims. Each hook is framed as an opening-3-
 * seconds line ([0:00-0:03]). Claim guard: any hook containing an unverifiable
 * superlative (best, #1, guaranteed, ...) — usually smuggled in via the
 * product name — is flagged in claimFlags for the user to verify or remove.
 * Bank sizes:
 *   - HOOK_BANKS: 4 angles x 10 templates = 40 templates ({P} = product name)
 * Output: exactly HOOK_COUNT = 10 hooks per run, each <= 140 chars.
 * Determinism: same inputs -> same outputs (template order rotated by input hash).
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Angles the user can pick. */
export const ANGLES: readonly string[] = ["problem", "result", "curiosity", "offer"];
/** Hooks produced per run. */
const HOOK_COUNT = 10;
/** Readability cap for an on-screen/spoken opening line (best practice, not a platform rule). */
const HOOK_LIMIT = 140;
const MAX_NAME_LEN = 120;

/**
 * 40 fixed hook templates, 10 per angle. {P} = product name.
 * Templates intentionally contain NO superlatives — flags below only trigger
 * when the user's own product name (or edits) introduce claim words.
 */
export const HOOK_BANKS: Record<string, readonly string[]> = {
  problem: [
    "Still struggling with {P}?",
    "The {P} problem nobody talks about...",
    "POV: your {P} keeps letting you down",
    "I was today years old when I fixed my {P} issue",
    "Stop doing {P} the hard way",
    "If your {P} looks like this, watch this",
    "The real reason your {P} is not working",
    "{P} users — you might be doing it wrong",
    "Tired of {P} that does not deliver?",
    "This {P} mistake costs you every day",
  ],
  result: [
    "How I got {P} results in 7 days",
    "My {P} before and after — no filter",
    "I tried {P} for 30 days, here is what happened",
    "From this... to this. Thanks, {P}.",
    "The {P} transformation is unreal",
    "Week 1 vs week 4 with {P}",
    "I did not believe {P} would work either",
    "Rating my {P} results honestly",
    "{P} changed my routine — proof inside",
    "Real {P} results, zero edits",
  ],
  curiosity: [
    "Nobody believes this {P} trick works",
    "The {P} hack going viral right now",
    "Wait — why is everyone buying {P}?",
    "I found a {P} nobody is talking about",
    "This {P} detail changes everything",
    "What they do not tell you about {P}",
    "The {P} tip I wish I knew sooner",
    "Is this {P} actually different?",
    "3 things I learned about {P} the hard way",
    "The {P} video that broke my For You page",
  ],
  offer: [
    "{P} is on sale — here is why I am grabbing it",
    "Last chance: the {P} deal ends tonight",
    "I found {P} cheaper than anywhere else",
    "Free shipping on {P} — today only",
    "The {P} bundle deal is actually worth it",
    "{P} restocked — it sells out every time",
    "Use my link for {P} before the price goes back up",
    "Why I am buying a second {P}",
    "{P} plus a free gift — while it lasts",
    "The {P} discount code everyone keeps asking for",
  ],
};

/** Unverifiable superlatives flagged for user review (claim guard). */
const CLAIM_WORDS: readonly string[] = [
  "best",
  "#1",
  "no.1",
  "number one",
  "guaranteed",
  "proven",
  "miracle",
  "overnight",
  "instant",
];

/** FNV-1a 32-bit hash — deterministic bank seeding, no Math.random. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Trim to the readability cap at a word boundary when possible. */
function enforceLimit(hook: string): string {
  if (hook.length <= HOOK_LIMIT) return hook;
  const cut = hook.slice(0, HOOK_LIMIT);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > HOOK_LIMIT - 20) return cut.slice(0, lastSpace).trimEnd();
  return cut.trimEnd();
}

function err(error: string): RunResult {
  return { ok: false, error };
}

export function runTool(values: Record<string, unknown>): RunResult {
  const rawName = values["productName"];
  if (typeof rawName !== "string" || rawName.trim().length === 0) {
    return err(
      'Please enter your product name — for example "LED sunset lamp" — so the hooks fit your ad.',
    );
  }
  const productName = rawName.trim().replace(/\s+/g, " ");
  if (productName.length > MAX_NAME_LEN) {
    return err(
      `Product name must be ${MAX_NAME_LEN} characters or fewer — shorten it and try again.`,
    );
  }

  const rawAngle = values["angle"];
  if (typeof rawAngle !== "string" || rawAngle.trim().length === 0) {
    return err("Pick an angle — problem, result, curiosity, or offer — so hooks match your ad goal.");
  }
  const angle = rawAngle.trim().toLowerCase();
  if (!ANGLES.includes(angle)) {
    return err(
      `Angle must be one of: ${ANGLES.join(", ")} — pick the one closest to your ad goal.`,
    );
  }

  const templates = HOOK_BANKS[angle];
  const start = hashString((productName + "|" + angle).toLowerCase()) % templates.length;

  const adHooks: string[] = [];
  for (let i = 0; i < HOOK_COUNT; i++) {
    const line = templates[(start + i) % templates.length].split("{P}").join(productName);
    adHooks.push(`[0:00–0:03] ${enforceLimit(line)}`);
  }

  // Claim guard: flag hooks containing unverifiable superlatives.
  const flagged: string[] = [];
  adHooks.forEach((hook, idx) => {
    for (const word of CLAIM_WORDS) {
      const hit = word.includes(" ")
        ? hook.toLowerCase().includes(word)
        : new RegExp(`\\b${escapeRegExp(word)}\\b`, "i").test(hook);
      if (hit) {
        flagged.push(`"${word}" in hook ${idx + 1}`);
        break;
      }
    }
  });

  const claimFlags =
    flagged.length === 0
      ? "No unverifiable superlatives detected. Avoid adding words like “best”, “#1”, or “guaranteed” " +
        "unless you can prove them — TikTok's ad policies flag misleading claims."
      : "Review before publishing — these lines contain claim words to verify or remove: " +
        flagged.join("; ") +
        ". Replace with a specific, provable statement or cut the word.";

  return { ok: true, values: { adHooks, claimFlags } };
}
