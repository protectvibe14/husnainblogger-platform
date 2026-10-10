import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/dm-collab-pitch-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'brand',
    label: 'Brand name',
    type: 'text',
    required: true,
    placeholder: 'e.g. GlowCo',
  },
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. skincare, home fitness, budget travel',
  },
  {
    id: 'followerCount',
    label: 'Your follower count',
    type: 'number',
    required: true,
    placeholder: 'e.g. 12500 (your own number — never verified)',
    validation: { min: 0 },
  },
  {
    id: 'deliverable',
    label: 'What you offer',
    type: 'select',
    required: true,
    options: ['reel', 'carousel', 'story', 'ugc', 'review'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'pitch',
    label: 'Pitch message',
    type: 'text',
    description:
    'Free brand pitch dm template 2026: Multi-paragraph DM pitch assembled from the pitch template. free.',
  },
  {
    id: 'subjectLines',
    label: 'Subject line options',
    type: 'list',
    description:
    'Six subject-line options for your pitch.',
  },
  {
    id: 'copyAll',
    label: 'Copy pitch + subject lines',
    type: 'copy',
    description:
    'The full pitch plus subject lines as plain text.',
  },
];

export const content: ToolContent = {
  title: 'Brand Pitch DM Template',
  description:
    'Pitch brands with a proven brand pitch DM template. Enter the brand, your niche, and deliverable — get a ready-to-send pitch free.',
  howTo: [
    'Enter the "Brand name" you want to pitch and "Your niche".',
    'Add "Your follower count" — your own number, used for phrasing only and never verified.',
    'Choose "What you offer": a Reel, carousel, Story series, UGC video, or product review.',
    'Copy the "Pitch message", personalize the opening with a genuine compliment about the brand.',
    'Pick a subject line, paste, and send — then follow up once after 5–7 days.',
  ],
  methodology:
    'This tool assembles your pitch from fixed hand-written sections (opener, intro with follower-count phrasing, deliverable line, value bullets, closer) plus 6 subject-line templates. A follower count of 0 uses "growing account" phrasing; other counts are formatted compactly (12,500 → 12.5K). Nothing is written by AI, and your follower count is never verified — the tool cannot check real Instagram numbers.',
  examples: [
    {
      title: 'Reel pitch to GlowCo',
      inputs: { brand: 'GlowCo', niche: 'skincare', followerCount: 12500, deliverable: 'reel' },
      note: 'A Reel pitch mentioning 12.5K followers with six subject lines.',
    },
    {
      title: 'UGC pitch as a growing account',
      inputs: { brand: 'FitFuel', niche: 'home fitness', followerCount: 0, deliverable: 'ugc' },
      note: 'Uses the "growing account" phrasing variant instead of a number.',
    },
    {
      title: 'Review pitch to a travel brand',
      inputs: { brand: 'WanderGear', niche: 'budget travel', followerCount: 8200, deliverable: 'review' },
      note: 'A product-review pitch formatted for an 8.2K audience.',
    },
  ],
  faqs: [
    {
      question: 'What is the best brand pitch dm template?',
      answer:
        'The best brand pitch DM template is short and specific: who you are and your niche, what you offer the brand, what the brand gets, and one low-pressure question. This free generator builds that exact structure from your brand, niche, deliverable, and follower count.',
    },
    {
      question: 'Is there a free brand pitch dm template?',
      answer:
        'Yes — this DM collab pitch generator is completely free with no signup. You can generate pitches for all 5 deliverable types with 6 subject-line options each, as many times as you like.',
    },
    {
      question: 'How to use brand pitch dm?',
      answer:
        'Enter the brand name, your niche, your follower count, and what you offer. Copy the generated pitch, personalize the opening line with something genuine about the brand, and send it — one polite follow-up after 5–7 days is fine.',
    },
    {
      question: 'What is a brand pitch dm template?',
      answer:
        'A brand pitch dm template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the brand pitch dm template?',
      answer:
        'No account needed. Open the brand pitch dm template, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'Can I customize the generated brand pitch dm template?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
    {
      question: 'What makes a good brand pitch dm template?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
  ],
  assumptions: [
    'Pitches are assembled from fixed templates — personalize before sending; identical pitches sent at scale look like spam.',
    'The follower count you enter is never verified; never inflate it, since brands can check.',
    'A pitch template cannot guarantee replies; targeting the right brands matters more.',
  ],
  jsonLd: [],
};
