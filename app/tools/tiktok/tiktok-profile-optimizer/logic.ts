/**
 * TikTok Profile Optimizer (tool-186) — pure checklist/template engine.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * HONESTY (per spec honestyNote): this tool assembles suggestions from FIXED
 * word banks and fixed checklists only. It cannot read a TikTok account and
 * cannot verify that any change will improve the profile. The 80-character
 * bio cap is a TikTok platform rule and is enforced on every generated bio.
 * The 24-character handle guidance is labeled guidance from a single
 * third-party source, not a platform rule. Notes about LIVE access and full
 * link-in-bio features (1,000-follower threshold) reflect TikTok's published
 * account rules; they are conditional guidance keyed to the optional
 * followerCount answer, not personalized verification.
 *
 * WORD BANKS (all fixed; sizes documented — picks are deterministic):
 *   BIO_TEMPLATES        12 — [NICHE] slot, all render <= 80 chars
 *   CTA_LINES             6 — call-to-action fragments used by templates
 *   NAME_FIELD_PATTERNS   6 — [NICHE]/[HANDLE] slots for the name field
 *   CHECKLIST_ITEMS      12 — fixed profile-optimization checklist
 *   LINK_SUGGESTIONS      6 — fixed link-in-bio suggestions
 *   TOTAL: 42 fixed strings.
 *
 * Deterministic: same inputs -> same outputs, always (FNV-1a hash pick,
 * index stepping for distinctness).
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** TikTok bio character limit (platform rule). Every bio option is capped here. */
export const MAX_BIO_CHARS = 80;
/** Handle guidance ceiling, labeled as single-source guidance in outputs. */
export const HANDLE_GUIDANCE_MAX = 24;
export const MAX_NICHE_LENGTH = 48;
export const MAX_CURRENT_BIO_LENGTH = 160;
export const MAX_HANDLE_LENGTH = 64;

/** FNV-1a 32-bit hash — deterministic pick without Math.random. */
export function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const BIO_TEMPLATES: readonly string[] = [
  '[NICHE] tips in 30 seconds. New videos daily ↓',
  'Helping you win at [NICHE] — tips daily 👇',
  'Your daily [NICHE] shortcut. Follow for more ↓',
  '[NICHE] secrets nobody tells you ⬇️ new posts daily',
  'I test [NICHE] so you don’t have to. Follow ↓',
  'Daily [NICHE] hacks | save this profile 📌',
  '[NICHE] made simple. 1 tip every day ↓',
  'From beginner to pro: [NICHE] tips daily 👇',
  '[NICHE] advice that actually works. Follow ↓',
  'Your [NICHE] coach on TikTok 📲 daily tips',
  '[NICHE] content, zero fluff. New videos daily ↓',
  'Learn [NICHE] the fun way 🎉 daily uploads',
];

export const CTA_LINES: readonly string[] = [
  'Follow for daily tips ↓',
  'New videos every day 👇',
  'Tap follow — you’ll thank me ↓',
  'Save this profile for later 📌',
  'Follow + turn on notifications 🔔',
  'Join the community below 👇',
];

export const NAME_FIELD_PATTERNS: readonly string[] = [
  '[NICHE] Tips | [HANDLE]',
  '[HANDLE] • [NICHE]',
  '[NICHE] Coach — [HANDLE]',
  'Daily [NICHE] | [HANDLE]',
  '[HANDLE] | [NICHE] Secrets',
  '[NICHE] Hacks & Tips',
];

export const CHECKLIST_ITEMS: readonly string[] = [
  'Switch to a free Creator or Business account (TikTok settings → Manage account) to unlock analytics.',
  'Use a clear profile photo: face or logo, high contrast, centered — readable at tiny sizes.',
  'Put your niche keyword in the NAME field (not just your name) so search can find you — see the name-field suggestions below.',
  'Keep your bio at or under 80 characters: one line for who it helps + what you post + a CTA (see bio options below).',
  'Pin your 3 best-performing videos to the top of your profile grid.',
  'Add one clear link in bio: your shop, newsletter, or a single landing page — not five links.',
  'Write 3–5 pinned-comment prompts into your posting routine so new visitors see engagement on your pinned videos.',
  'Post on a consistent schedule — profile visitors check whether an account is active before following.',
  'Organize evergreen videos into themed Playlists so visitors can binge one topic.',
  'Match your video cover text style across your grid for a tidy, recognizable profile.',
  'Check TikTok Analytics weekly (Followers → growth + video views) and change one thing at a time.',
  'This tool cannot verify profile changes from your analytics — treat every suggestion as a starting point and measure what actually moves followers.',
];

export const LINK_SUGGESTIONS: readonly string[] = [
  'Your own landing page: one page, one action (newsletter signup or product link) — beats a generic link tree.',
  'Email list signup: the only audience you fully own; offer a free [NICHE] starter guide as the incentive.',
  'Shop / affiliate storefront: pin it if you post product content in this niche.',
  'YouTube channel link: send TikTok viewers to long-form content for deeper trust.',
  'Discount or freebie page: a time-limited offer converts profile visitors better than a homepage.',
  'Collab / contact page: make it easy for brands to reach you once you grow.',
];

/** Trim a [NICHE]-filled template so it never exceeds the 80-char bio cap. */
function fitTo80(template: string, niche: string): string {
  const placeholder = '[NICHE]';
  const staticLen = template.length - placeholder.length;
  const room = MAX_BIO_CHARS - staticLen;
  let n = niche;
  if (n.length > room && room > 0) {
    n = n.slice(0, room - 1).trimEnd() + '…';
  } else if (room <= 0) {
    n = '';
  }
  const s = template.replace(placeholder, n);
  return s.length > MAX_BIO_CHARS ? s.slice(0, MAX_BIO_CHARS - 1) + '…' : s;
}

/** Pick n distinct indices into a bank deterministically from a hash. */
function pickDistinct(hash: number, bankSize: number, n: number): number[] {
  const out: number[] = [];
  let i = 0;
  while (out.length < n && i < bankSize * 4) {
    const idx = (hash + i * 5 + 3) % bankSize;
    if (!out.includes(idx)) out.push(idx);
    i++;
  }
  return out;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const rawNiche = values.niche;
  if (!isNonEmptyString(rawNiche)) {
    return { ok: false, error: 'Niche is required — tell the tool what your TikTok account is about (e.g. "skincare", "fitness").' };
  }
  const niche = rawNiche.trim();
  if (niche.length > MAX_NICHE_LENGTH) {
    return { ok: false, error: `Niche must be ${MAX_NICHE_LENGTH} characters or fewer so bio options fit the 80-character cap.` };
  }

  const rawBio = values.currentBio;
  let currentBio = '';
  if (rawBio !== undefined && rawBio !== null && rawBio !== '') {
    if (typeof rawBio !== 'string') {
      return { ok: false, error: 'Current bio must be text.' };
    }
    currentBio = rawBio.trim();
    if (currentBio.length > MAX_CURRENT_BIO_LENGTH) {
      return { ok: false, error: `Current bio must be ${MAX_CURRENT_BIO_LENGTH} characters or fewer.` };
    }
  }

  const rawHandle = values.handle;
  let handle = '';
  if (rawHandle !== undefined && rawHandle !== null && rawHandle !== '') {
    if (typeof rawHandle !== 'string') {
      return { ok: false, error: 'Handle must be text.' };
    }
    handle = rawHandle.trim().replace(/^@+/, '');
    if (handle.length > MAX_HANDLE_LENGTH) {
      return { ok: false, error: `Handle must be ${MAX_HANDLE_LENGTH} characters or fewer.` };
    }
  }

  const rawFollowers = values.followerCount;
  let followerCount = '';
  if (rawFollowers !== undefined && rawFollowers !== null && rawFollowers !== '') {
    if (rawFollowers !== 'under-1000' && rawFollowers !== '1000-plus') {
      return { ok: false, error: 'Follower count must be one of: "under-1000" or "1000-plus".' };
    }
    followerCount = rawFollowers;
  }

  const h = hashStr(niche.toLowerCase());

  // 3 bio options from the fixed template bank (all <= 80 chars).
  const bioIdx = pickDistinct(h, BIO_TEMPLATES.length, 3);
  const bioOptions = bioIdx.map((i) => fitTo80(BIO_TEMPLATES[i], niche));

  // Name-field suggestions from the fixed pattern bank.
  const displayHandle = handle || 'YourName';
  const nameIdx = pickDistinct(h >>> 3, NAME_FIELD_PATTERNS.length, 3);
  const nameFieldSuggestions = nameIdx.map((i) =>
    NAME_FIELD_PATTERNS[i].replace(/\[NICHE\]/g, niche).replace(/\[HANDLE\]/g, displayHandle),
  );

  // Checklist: fixed items + conditional notes.
  const checklist: string[] = [];
  if (currentBio) {
    if (currentBio.length > MAX_BIO_CHARS) {
      checklist.push(
        `Your current bio is ${currentBio.length} characters — over the 80-character TikTok limit. Shorten it to a who/what/why line plus one CTA (see bio options).`,
      );
    } else {
      checklist.push(
        `Your current bio is ${currentBio.length} characters (within the 80-character limit). Add a clear CTA line if it does not already have one.`,
      );
    }
  }
  for (const item of CHECKLIST_ITEMS) checklist.push(item);
  if (handle.length > HANDLE_GUIDANCE_MAX) {
    checklist.push(
      `Your handle "@${handle}" is ${handle.length} characters. One third-party source suggests keeping handles at ${HANDLE_GUIDANCE_MAX} characters or fewer for memorability — this is guidance, not a TikTok rule.`,
    );
  }
  if (followerCount === 'under-1000') {
    checklist.push(
      'Under 1,000 followers: per TikTok’s published rules, LIVE access and the full link-in-bio feature unlock at 1,000 followers — focus on content and a newsletter link until then.',
    );
  } else if (followerCount === '1000-plus') {
    checklist.push(
      'At 1,000+ followers you can use TikTok’s full link-in-bio feature — pick the one link that matches your goal (see suggestions below).',
    );
  }

  const linkSuggestions = LINK_SUGGESTIONS.map((s) => s.replace('[NICHE]', niche.toLowerCase()));

  return {
    ok: true,
    values: {
      bioOptions,
      nameFieldSuggestions,
      profileChecklist: checklist,
      linkSuggestions,
    },
  };
}
