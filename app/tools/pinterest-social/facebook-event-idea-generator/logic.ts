/**
 * facebook-event-idea-generator — logic.ts
 *
 * Fixed event-template engine. NOT AI: event ideas are assembled from a FIXED
 * bank of 8 hand-written event templates with the user's business type
 * slotted in, alternating online / in-person formats.
 *
 * Fixed banks (documented for honesty):
 *   - EVENT_TEMPLATES: 8 event templates, each { title, format, seed }.
 *   - Description seeds are kept under ~200 characters (Facebook allows far
 *     more, so they are safe seeds to expand on, not full descriptions).
 *
 * Cover-size honesty: sources conflict on the ideal Facebook event cover
 * size (1920x1005 is widely cited for desktop, but other sizes appear in
 * various guides). The coverNote says this plainly and advises checking the
 * live preview instead of claiming one verified size.
 */

interface EventTemplate {
  title: string;
  format: 'Online' | 'In-person';
  seed: string;
}

const EVENT_TEMPLATES: EventTemplate[] = [
  {
    title: '{business} Open House: Tour, Taste & Try',
    format: 'In-person',
    seed: 'Walk through everything we offer in one friendly evening. Live demos, free samples, and staff on hand to answer every question. Bring a friend — everyone is welcome.',
  },
  {
    title: 'Live Q&A: Ask Us Anything About {business}',
    format: 'Online',
    seed: 'Join us live and ask anything about what we do. We will answer questions in real time and share a few things most people never think to ask.',
  },
  {
    title: '{business} Workshop: Beginner Basics in 60 Minutes',
    format: 'In-person',
    seed: 'A hands-on one-hour workshop for total beginners. Leave with real skills you can use the same day. All materials included, no experience needed.',
  },
  {
    title: 'Virtual Demo Day: {business} in Action',
    format: 'Online',
    seed: 'Watch a live demo from your couch. We will show exactly how it works, answer questions in chat, and share a replay with everyone who registers.',
  },
  {
    title: '{business} Launch Night: First Looks & Giveaways',
    format: 'In-person',
    seed: 'Be the first to see what is new. Exclusive previews, free giveaways, and refreshments. RSVP required — seats are limited.',
  },
  {
    title: 'Free 20-Minute {business} Consultation Sprint',
    format: 'Online',
    seed: 'Book a free 20-minute video call with our team. Tell us your goal and we will map out your next three steps live on the call.',
  },
  {
    title: '{business} Community Meetup & Customer Stories',
    format: 'In-person',
    seed: 'Meet fellow customers, hear real stories from the community, and share your own. Casual, free, and a great way to connect locally.',
  },
  {
    title: 'Behind the Scenes Live: A Day at Our {business}',
    format: 'Online',
    seed: 'A live behind-the-scenes tour of how we work — no script, no filters. See the real process and ask the team anything in the comments.',
  },
];

const COVER_NOTE =
  'Event cover sizes are disputed across sources: 1920x1005 is widely cited ' +
  'for desktop, but Facebook crops differently on mobile and other sizes appear ' +
  'in various guides. Keep all key text centered in the middle band of the ' +
  'image and always check Facebook\u2019s live cover preview before publishing.';

function shortBusiness(business: string): string {
  return business.trim().split(/\s+/).filter(Boolean).slice(0, 5).join(' ');
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values['businessType'];
  const businessType = typeof raw === 'string' ? raw.trim() : '';
  if (businessType.length === 0) {
    return { ok: false, error: 'Enter your business type first — e.g. "coffee shop" or "fitness studio".' };
  }
  if (businessType.length > 60) {
    return { ok: false, error: 'Business type must be 60 characters or fewer.' };
  }

  const biz = shortBusiness(businessType);
  const rows: string[][] = EVENT_TEMPLATES.map(function (t) {
    return [
      t.title.split('{business}').join(biz),
      t.format,
      t.seed,
      COVER_NOTE,
    ];
  });

  return {
    ok: true,
    values: {
      eventIdeas: {
        columns: ['Event title', 'Format', 'Description seed', 'Cover note'],
        rows: rows,
      },
      coverGuidance: COVER_NOTE,
    },
  };
}
