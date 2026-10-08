/**
 * TikTok UGC Script Builder (tool-190) — pure template-based script builder.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * HONESTY: scripts are assembled from FIXED template banks — hooks, demo
 * beats, testimonial lines, objection handlers, and CTAs. The tool does not
 * write copy from AI; it fills fixed templates deterministically per item.
 * It cannot test the product or verify claims: every claim in the final
 * video must be true. When an item is marked sponsored ("yes"), a fixed
 * #ad disclosure line is inserted — a template reminder, not legal advice.
 *
 * WORD BANKS (all fixed; sizes documented — picks are deterministic via hash):
 *   HOOKS            5 voices x 4 = 20 — [PRODUCT] slot, voice-specific tone
 *   DEMO_BEATS        8 — demo-action frames, [PRODUCT] slot
 *   TESTIMONIALS      6 — testimonial frames, [PRODUCT] slot
 *   OBJECTION_HANDLERS 6 — skeptic replies, [PRODUCT] slot
 *   CTAS              6 — call-to-action frames, [PRODUCT] slot
 *   DISCLOSURE        1 fixed — #ad disclosure line for sponsored items
 *   TOTAL: 47 fixed strings.
 *
 * Script shape by videoLength (fixed):
 *   15s -> hook, demo x1, cta
 *   30s -> hook, demo x2, testimonial, cta
 *   60s -> hook, demo x3, testimonial, objection, cta
 *
 * Deterministic: same items -> same scripts, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MAX_ITEMS = 10;
export const MAX_PRODUCT_NAME_LENGTH = 100;
export const VALID_LENGTHS: readonly string[] = ['15', '30', '60'];
export const VALID_VOICES: readonly string[] = ['friendly', 'funny', 'bold', 'luxury', 'professional'];

export const DISCLOSURE_LINE =
  'DISCLOSURE (keep this in your video): Paid partnership — this video is sponsored. #ad';

export const HOOKS: Record<string, readonly string[]> = {
  friendly: [
    'Okay, I need to tell you about [PRODUCT] because it genuinely surprised me.',
    'If you struggle with what [PRODUCT] fixes, just watch this.',
    'I was skeptical about [PRODUCT] too — here is my honest take.',
    'This is your sign to finally try [PRODUCT].',
  ],
  funny: [
    'Me before [PRODUCT]: a mess. Me after: also a mess, but a cute one.',
    '[PRODUCT] walked into my life like it pays rent here.',
    'Nobody: ... Absolutely nobody: ... Me: let me review [PRODUCT] at 2am.',
    'I bought [PRODUCT] as a joke. The joke is on me — it is great.',
  ],
  bold: [
    'Stop scrolling. [PRODUCT] is the real deal and I will prove it.',
    'I do not gatekeep: [PRODUCT] is worth every cent.',
    'Unpopular opinion: [PRODUCT] beats everything else I have tried.',
    '[PRODUCT] changed my routine. Here is the proof.',
  ],
  luxury: [
    'Some things are worth the ritual. [PRODUCT] is one of them.',
    'An honest look at [PRODUCT] — the detail is in the experience.',
    'Elevate the everyday: my [PRODUCT] routine, start to finish.',
    'Quality you can feel. [PRODUCT], reviewed properly.',
  ],
  professional: [
    'A practical review of [PRODUCT]: what works, what does not.',
    'I tested [PRODUCT] for two weeks. Here are the results.',
    'What to know before buying [PRODUCT] — an honest breakdown.',
    '[PRODUCT]: features, performance, and my verdict.',
  ],
};

export const DEMO_BEATS: readonly string[] = [
  'On-camera test: use [PRODUCT] exactly as directed and show the immediate result, no cuts.',
  'Close-up shot: hold [PRODUCT] to the camera and point out the detail most people miss.',
  'Real-life moment: film yourself using [PRODUCT] in your normal routine — messy is fine, real is better.',
  'Side-by-side: show the before on the left, [PRODUCT] in use on the right.',
  'Speed test: time how fast [PRODUCT] does the job, timer visible on screen.',
  'Texture/quality check: zoom in and describe honestly what [PRODUCT] feels, looks, or sounds like.',
  'Day-in-use montage: three quick clips of [PRODUCT] across your day.',
  'Stress test: push [PRODUCT] harder than normal use and show it holds up.',
];

export const TESTIMONIALS: readonly string[] = [
  'Testimonial beat: "I have used [PRODUCT] for two weeks and here is the honest difference it made for me."',
  'Testimonial beat: show a screenshot of a real message or review about [PRODUCT] — with permission.',
  'Testimonial beat: "My friend tried [PRODUCT] after seeing my video and texted me this." (show the text)',
  'Testimonial beat: film your genuine reaction using [PRODUCT] for the 10th time — familiarity reads as trust.',
  'Testimonial beat: "Three things I love about [PRODUCT], and one thing I would change."',
  'Testimonial beat: compare your week 1 vs week 3 experience with [PRODUCT], specific and honest.',
];

export const OBJECTION_HANDLERS: readonly string[] = [
  'Objection beat: "You might think [PRODUCT] is too pricey — here is what one use actually costs per day."',
  'Objection beat: address the top negative comment directly: "People ask if [PRODUCT] really works — watch this unedited clip."',
  'Objection beat: "Is [PRODUCT] right for beginners? Here is who I would NOT recommend it to."',
  'Objection beat: show the one flaw you found in [PRODUCT] — honesty sells harder than hype.',
  'Objection beat: "I compared [PRODUCT] to the cheaper option so you do not have to." (show both)',
  'Objection beat: answer "how long does it last?" with your real usage timeline for [PRODUCT].',
];

export const CTAS: readonly string[] = [
  'CTA: "Link is below if you want to try [PRODUCT] — and follow for more honest reviews."',
  'CTA: "Comment your questions about [PRODUCT] and I will answer every single one."',
  'CTA: "Save this video so you remember [PRODUCT] when you need it."',
  'CTA: "Tap the link to check [PRODUCT] out — grab it while the offer lasts."',
  'CTA: "Share this with someone who needs [PRODUCT] in their life."',
  'CTA: "Follow for part 2, where I test [PRODUCT] for a full month."',
];

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isSponsored(v: unknown): boolean {
  return typeof v === 'string' && v.trim().toLowerCase() === 'yes';
}

interface ScriptItem {
  productName: string;
  brandVoice: string;
  videoLength: '15' | '30' | '60';
  sponsored: boolean;
}

function buildScript(item: ScriptItem, index: number): string {
  const h = hashStr(item.productName.toLowerCase() + '|' + item.brandVoice + '|' + index);
  const fill = (s: string): string => s.replace(/\[PRODUCT\]/g, item.productName);
  const hooks = HOOKS[item.brandVoice];
  const lines: string[] = [];
  if (item.sponsored) lines.push(DISCLOSURE_LINE);
  lines.push(`HOOK (${item.videoLength}s, ${item.brandVoice} voice): ${fill(hooks[h % hooks.length])}`);
  const demoCount = item.videoLength === '15' ? 1 : item.videoLength === '30' ? 2 : 3;
  for (let d = 0; d < demoCount; d++) {
    lines.push(`DEMO BEAT ${d + 1}: ${fill(DEMO_BEATS[(h + d * 7) % DEMO_BEATS.length])}`);
  }
  if (item.videoLength !== '15') {
    lines.push(fill(TESTIMONIALS[(h >>> 4) % TESTIMONIALS.length]));
    if (item.videoLength === '60') {
      lines.push(fill(OBJECTION_HANDLERS[(h >>> 6) % OBJECTION_HANDLERS.length]));
    }
  }
  lines.push(fill(CTAS[(h >>> 8) % CTAS.length]));
  return `SCRIPT ${index + 1} — "${item.productName}" (${item.videoLength}s, ${item.brandVoice} voice)\n` + lines.join('\n');
}

export function runTool(args: { items: Record<string, unknown>[] }): RunResult {
  const items = args.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'Add at least one item (product) to build a UGC script.' };
  }
  if (items.length > MAX_ITEMS) {
    return { ok: false, error: `Too many items: maximum ${MAX_ITEMS} products per run.` };
  }

  const scripts: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const n = i + 1;
    const item = items[i];
    if (typeof item !== 'object' || item === null) {
      return { ok: false, error: `Item ${n}: item must be an object with productName, brandVoice, and videoLength.` };
    }

    const rawName = item.productName;
    if (!isNonEmptyString(rawName)) {
      return { ok: false, error: `Item ${n}: productName is required.` };
    }
    const productName = rawName.trim();
    if (productName.length > MAX_PRODUCT_NAME_LENGTH) {
      return { ok: false, error: `Item ${n}: productName must be ${MAX_PRODUCT_NAME_LENGTH} characters or fewer.` };
    }

    const rawVoice = item.brandVoice;
    if (!isNonEmptyString(rawVoice)) {
      return { ok: false, error: `Item ${n}: brandVoice is required (one of: friendly, funny, bold, luxury, professional).` };
    }
    const brandVoice = rawVoice.trim().toLowerCase();
    if (!VALID_VOICES.includes(brandVoice)) {
      return { ok: false, error: `Item ${n}: brandVoice must be one of: friendly, funny, bold, luxury, professional.` };
    }

    const rawLen = item.videoLength;
    let videoLength = '';
    if (typeof rawLen === 'number' && Number.isInteger(rawLen)) {
      videoLength = String(rawLen);
    } else if (isNonEmptyString(rawLen)) {
      videoLength = rawLen.trim();
    }
    if (!VALID_LENGTHS.includes(videoLength)) {
      return { ok: false, error: `Item ${n}: videoLength must be one of: 15, 30, 60.` };
    }

    scripts.push(
      buildScript({
        productName,
        brandVoice,
        videoLength: videoLength as '15' | '30' | '60',
        sponsored: isSponsored(item.isSponsored),
      }, i),
    );
  }

  return { ok: true, values: { scripts } };
}
