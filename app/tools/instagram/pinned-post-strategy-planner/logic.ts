/**
 * tool-234 — Pinned Post Strategy Planner (planner)
 *
 * Pure client-side planner for Instagram's 3 pinned slots. Picks one of 5
 * fixed goal strategies (bank: 5 strategies × 3 slot templates = 15 slot
 * templates, each with fixed post ideas) and fills it in with the user's
 * goal and offers. It does not pin posts — there is no Instagram API.
 *
 * Deterministic: same goal + offers → identical plan, always.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const GOALS = [
  'Get more followers',
  'Drive sales',
  'Book more clients',
  'Build authority',
  'Promote a launch',
] as const;
type Goal = (typeof GOALS)[number];

interface Slot {
  title: string;
  purpose: string;
  ideas: string[];
}

interface Strategy {
  slot1: Slot;
  slot2: Slot;
  slot3: Slot;
  rationale: string;
}

/** 5 fixed strategies, 3 slot templates each (15 total). */
const STRATEGIES: Record<Goal, Strategy> = {
  'Get more followers': {
    slot1: {
      title: 'Start-here intro post',
      purpose: 'Tell new visitors who you are and why to follow in one glance.',
      ideas: [
        'A carousel: "5 things I wish I knew when I started" in your niche.',
        'A talking-head reel introducing you, your niche, and your promise.',
      ],
    },
    slot2: {
      title: 'Your best-performing post',
      purpose: 'Pin the post with the most saves/shares — it already converts visitors.',
      ideas: [
        'Your highest-saved carousel or reel, even if it is a few months old.',
        'If nothing stands out, pin the post that best represents your niche.',
      ],
    },
    slot3: {
      title: '"Follow for" promise post',
      purpose: 'Set the expectation of what followers get — the follow-back incentive.',
      ideas: [
        'A carousel: "Follow for daily [niche] tips" with 3 quick wins inside.',
        'A reel ending with a clear "follow for more" call to action.',
      ],
    },
    rationale:
      'New visitors decide in seconds. The intro explains you, the best post proves value, and the promise post gives them a reason to hit follow — covering identity, proof, and incentive in that order.',
  },
  'Drive sales': {
    slot1: {
      title: 'Offer intro post',
      purpose: 'Introduce your main product or service to cold visitors.',
      ideas: [
        'A carousel: what the offer is, who it is for, and what is inside.',
        'A reel demoing the product or the transformation it creates.',
      ],
    },
    slot2: {
      title: 'Proof / results post',
      purpose: 'Overcome skepticism with real outcomes before you ask for the sale.',
      ideas: [
        'Before/after results from a real customer.',
        'A testimonial carousel with screenshots of kind words.',
      ],
    },
    slot3: {
      title: 'Offer CTA post',
      purpose: 'Give the ready-to-buy visitor a frictionless path to purchase.',
      ideas: [
        'A post with the offer name, price anchor, and "link in bio" CTA.',
        'A limited bonus or deadline post to create urgency.',
      ],
    },
    rationale:
      'Buyers move through awareness → trust → action. The offer intro educates, the proof post builds trust, and the CTA post converts the warmest visitors who land ready to buy.',
  },
  'Book more clients': {
    slot1: {
      title: 'Who-I-help post',
      purpose: 'Speak directly to your ideal client so they self-identify.',
      ideas: [
        'A carousel: "I help [who] get [result] without [pain]."',
        'A reel telling your own story and how it led to this service.',
      ],
    },
    slot2: {
      title: 'Client testimonial post',
      purpose: 'Show a real client win — the fastest trust builder for services.',
      ideas: [
        'A testimonial carousel with the client\u2019s words and results.',
        'A case-study reel: problem → process → outcome.',
      ],
    },
    slot3: {
      title: 'Booking CTA post',
      purpose: 'Make the next step obvious: how to start working with you.',
      ideas: [
        'A post: what happens on the first call + "DM me START" CTA.',
        'A "how to work with me" carousel with packages and process.',
      ],
    },
    rationale:
      'Service buyers need relevance, trust, and an easy first step. The who-I-help post filters in the right people, the testimonial proves you deliver, and the booking CTA removes friction to start.',
  },
  'Build authority': {
    slot1: {
      title: 'Flagship framework post',
      purpose: 'Showcase your signature method or point of view.',
      ideas: [
        'A carousel teaching your 3–5 step framework in plain language.',
        'A reel explaining the one idea you are known for.',
      ],
    },
    slot2: {
      title: 'Contrarian opinion post',
      purpose: 'Challenge a common belief in your niche — authority loves a stance.',
      ideas: [
        'A post: "Popular advice says X. Here is why Y works better."',
        'A reel debunking a myth with your own experience as evidence.',
      ],
    },
    slot3: {
      title: 'Deep-dive carousel',
      purpose: 'Prove depth with your most valuable free teaching.',
      ideas: [
        'A 10-slide educational carousel — your most-saved topic.',
        'A myth-busting series post that invites debate in the comments.',
      ],
    },
    rationale:
      'Authority is built on a clear point of view plus demonstrated depth. The framework shows your method, the contrarian post shows your spine, and the deep-dive proves you know more than the average creator.',
  },
  'Promote a launch': {
    slot1: {
      title: 'Launch announcement post',
      purpose: 'State the launch, the date, and the core promise loudly.',
      ideas: [
        'An announcement reel: what is launching, when, and who it is for.',
        'A carousel: the offer, the transformation, and the launch date.',
      ],
    },
    slot2: {
      title: 'Behind-the-scenes post',
      purpose: 'Build anticipation with the making-of story.',
      ideas: [
        'Stories-style reel: building the offer, the messy middle.',
        'A carousel sharing your why — why this launch exists.',
      ],
    },
    slot3: {
      title: 'Bonus / urgency post',
      purpose: 'Push fence-sitters over the line with a deadline.',
      ideas: [
        'A post with the fast-action bonus and the cart-close date.',
        'A countdown reminder with the exact CTA (link in bio / DM keyword).',
      ],
    },
    rationale:
      'Launches need attention, anticipation, and urgency. The announcement captures attention, the behind-the-scenes builds emotional buy-in, and the urgency post converts the warm audience before doors close.',
  },
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function renderSlot(slotNo: number, slot: Slot): string {
  const ideas = slot.ideas.map((idea, i) => '   ' + (i + 1) + '. ' + idea).join('\n');
  return (
    'Slot ' + slotNo + ' — ' + slot.title + '\n' +
    '  Purpose: ' + slot.purpose + '\n' +
    '  Post ideas:\n' + ideas
  );
}

export function runTool(values: Record<string, unknown>): ToolResult {
  const goal = asString(values['goal']);
  const offersRaw = asString(values['offers']);

  if (!goal) {
    return { ok: false, error: 'Please choose your goal.' };
  }
  if (!GOALS.includes(goal as Goal)) {
    return { ok: false, error: 'Goal must be one of: ' + GOALS.join(', ') + '.' };
  }

  const strategy = STRATEGIES[goal as Goal];
  const offers = offersRaw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Fold the user's first offer into slot 3's ideas when provided.
  const slot3: Slot =
    offers.length > 0
      ? {
          title: strategy.slot3.title,
          purpose: strategy.slot3.purpose,
          ideas: ['Feature "' + offers[0] + '" directly in this pin.', ...strategy.slot3.ideas],
        }
      : strategy.slot3;

  const pinnedPlan = [
    renderSlot(1, strategy.slot1),
    renderSlot(2, strategy.slot2),
    renderSlot(3, slot3),
    'Why this works: ' + strategy.rationale,
  ];

  const copyAll =
    'Pinned post plan — goal: ' + goal + '\n' +
    (offers.length > 0 ? 'Offers: ' + offers.join(' · ') + '\n' : '') +
    '\n' +
    pinnedPlan.join('\n\n') +
    '\n\nNote: this tool plans your strategy only — it cannot pin posts for you. Pin them manually in the Instagram app (tap the ••• on a post → Pin to your profile).';

  return {
    ok: true,
    values: {
      pinnedPlan,
      copyAll,
    },
  };
}
