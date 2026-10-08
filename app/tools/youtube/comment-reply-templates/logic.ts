/**
 * Comment Reply Templates — pure logic (tool-129), zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is a FIXED TEMPLATE LIBRARY, not AI. It returns
 * copy-paste reply drafts from 30 hand-written templates bundled in this
 * file. It cannot auto-reply to YouTube comments (no YouTube API — and
 * automated replies risk violating YouTube's spam policies). The creator
 * copies the reply and posts it manually.
 *
 * Bank sizes:
 *   5 comment types x 3 tones x 2 templates = 30 templates total.
 *   Comment types: thank-you, question, criticism, collaboration,
 *   spam-adjacent.
 *   Tones: warm, professional, playful.
 *
 * Placeholders used in every template: [Commenter], [Your Name], and
 * [your email] (collaboration type only). The tool does not fill them in
 * for you — you replace them when you paste.
 *
 * Deterministic: same comment type + tone -> same templates, always.
 */

export const COMMENT_TYPES = [
  'thank-you',
  'question',
  'criticism',
  'collaboration',
  'spam-adjacent',
] as const;
export type CommentTypeId = (typeof COMMENT_TYPES)[number];

export const TONES = ['warm', 'professional', 'playful'] as const;
export type ToneId = (typeof TONES)[number];

export const TEMPLATES_PER_COMBO = 2;
export const TOTAL_TEMPLATES = 30;

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const BANK: Record<CommentTypeId, Record<ToneId, string[]>> = {
  'thank-you': {
    warm: [
      'Thank you so much, [Commenter]! Comments like this are exactly why I keep making videos. — [Your Name]',
      'This made my day, [Commenter]! Really glad you enjoyed it — more coming soon. — [Your Name]',
    ],
    professional: [
      'Thank you for watching, [Commenter]. I appreciate you taking the time to leave a comment. — [Your Name]',
      'Glad you found it helpful, [Commenter]. Thanks for being part of this community. — [Your Name]',
    ],
    playful: [
      'Ayy, [Commenter]! You just earned yourself a virtual high-five. Thanks for watching! — [Your Name]',
      'Stop it, you are making me blush, [Commenter]! Thanks for the love — see you in the next one. — [Your Name]',
    ],
  },
  question: {
    warm: [
      'Great question, [Commenter]! Short answer: [your answer]. I will cover this in more detail in an upcoming video — stay tuned! — [Your Name]',
      'Love that you asked this, [Commenter]. Quick take: [your answer]. Want a full breakdown? Let me know! — [Your Name]',
    ],
    professional: [
      'Thanks for the question, [Commenter]. [Your answer]. I have linked a resource in the description that goes deeper. — [Your Name]',
      'Good question, [Commenter]. The short version: [your answer]. Feel free to ask a follow-up if anything is unclear. — [Your Name]',
    ],
    playful: [
      'Ooh, hitting me with the hard questions, [Commenter]! Quick take: [your answer] — full rant in the next video. — [Your Name]',
      'Plot twist: [Commenter] asked the exact question I was hoping for. [Your answer] — more on this soon! — [Your Name]',
    ],
  },
  criticism: {
    warm: [
      'I hear you, [Commenter], and I appreciate the honest feedback. I will keep this in mind for the next video. — [Your Name]',
      'Fair point, [Commenter]. I am always trying to improve — thanks for telling me straight. — [Your Name]',
    ],
    professional: [
      'Thank you for the feedback, [Commenter]. I will take this into account going forward. — [Your Name]',
      'Noted, [Commenter]. Constructive criticism like this helps the channel improve — I appreciate it. — [Your Name]',
    ],
    playful: [
      'Ouch, straight for the jugular, [Commenter]! But fair — I will do better next time. Thanks for keeping me honest. — [Your Name]',
      'Noted and logged, [Commenter]! My improvement arc starts now. Thanks for the nudge. — [Your Name]',
    ],
  },
  collaboration: {
    warm: [
      'Thanks for reaching out, [Commenter]! I would love to hear more — could you email me the details at [your email]? — [Your Name]',
      'Appreciate the offer, [Commenter]! Send me the details via email ([your email]) and I will take a look. — [Your Name]',
    ],
    professional: [
      'Thank you for your interest in collaborating, [Commenter]. Please send a brief proposal to [your email] and I will review it. — [Your Name]',
      'I appreciate you getting in touch, [Commenter]. For collaboration inquiries, please email [your email] with the details. — [Your Name]',
    ],
    playful: [
      'A collab? I am intrigued, [Commenter]! Send the details to my email ([your email]) and let us talk. — [Your Name]',
      'You had me at hello, [Commenter]! Send the plan to [your email] and let us see if we vibe. — [Your Name]',
    ],
  },
  'spam-adjacent': {
    warm: [
      'Hey [Commenter], I appreciate the enthusiasm! Just a heads-up — promo comments get removed here, but I would love to hear your thoughts on the video itself. — [Your Name]',
      'Thanks for stopping by, [Commenter]! I keep this comment section promo-free so everyone can chat — hope you understand. — [Your Name]',
    ],
    professional: [
      'Hello [Commenter]. Promotional comments are removed from this channel per our comment policy. You are welcome to join the discussion about the video. — [Your Name]',
      'Thanks for commenting, [Commenter]. This channel does not allow promotional links — please keep comments on-topic. — [Your Name]',
    ],
    playful: [
      'Whoa there, [Commenter]! This is a promo-free zone — but stick around and join the actual conversation, it is way more fun. — [Your Name]',
      'Nice try, [Commenter]! Promo comments get the boot, but genuine comments get my heart. Your call! — [Your Name]',
    ],
  },
};

function asText(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export function runTool(values: Record<string, unknown>): RunResult {
  const commentTypeRaw = asText(values['commentType']).toLowerCase();
  if (!commentTypeRaw) {
    return { ok: false, error: 'Choose a comment type.' };
  }
  if (!(COMMENT_TYPES as readonly string[]).includes(commentTypeRaw)) {
    return { ok: false, error: `Comment type must be one of: ${COMMENT_TYPES.join(', ')}.` };
  }
  const commentType = commentTypeRaw as CommentTypeId;

  const toneRaw = asText(values['tone']).toLowerCase();
  if (!toneRaw) return { ok: false, error: 'Choose a tone: warm, professional or playful.' };
  if (!(TONES as readonly string[]).includes(toneRaw)) {
    return { ok: false, error: `Tone must be one of: ${TONES.join(', ')}.` };
  }
  const tone = toneRaw as ToneId;

  const replies = BANK[commentType][tone];

  return {
    ok: true,
    values: {
      replies: replies.map((r, i) => `Template ${i + 1}: ${r}`),
      note:
        `Fixed template bank: ${TOTAL_TEMPLATES} templates ` +
        `(${COMMENT_TYPES.length} comment types x ${TONES.length} tones x ${TEMPLATES_PER_COMBO} each). ` +
        'Replace [Commenter], [Your Name] and [your email] when you paste. ' +
        'Copy-paste drafts only — this tool cannot auto-reply to YouTube comments.',
    },
  };
}

/** Exposed for tests: bank size bookkeeping. */
export function bankSize(): number {
  let n = 0;
  for (const t of COMMENT_TYPES) for (const tone of TONES) n += BANK[t][tone].length;
  return n;
}
