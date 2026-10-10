import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const SLUG = 'creator-pitch-deck-outline-generator';
const CANONICAL = `https://husnainblogger.com/tools/creator-business/${SLUG}/`;
const NAME = 'Creator Pitch Deck Outline Generator';
const DESCRIPTION =
  'Generate a free creator pitch deck template outline — 8 proven slides from cover to contact, ready for your niche and audience stats. Create yours now.';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. fitness, skincare, tech',
    validation: { max: 60 },
  },
  {
    id: 'audienceSize',
    label: 'Audience size (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. 250K across Instagram and TikTok',
    validation: { max: 60 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'deckOutline', label: 'Pitch deck outline', type: 'copy' },
];

export const content: ToolContent = {
  title: 'Creator Pitch Deck Template',
  description: DESCRIPTION,
  howTo: [
    'Enter your niche, e.g. fitness, skincare, or tech.',
    'Optionally add your audience size in your own words.',
    'Click generate to get the 8-slide outline.',
    'Replace every [bracketed] placeholder with your real numbers and links.',
    'Copy the outline into your slide tool and design it in your style.',
  ],
  methodology:
    'This tool fills a fixed 8-section pitch-deck template (cover, about, audience, content, past work, packages, why-you, contact — 24 guidance bullets total) with your niche and audience size; everything else stays as [bracketed] placeholders for you to complete. It never invents follower counts, rates, or results — the outline is a template, not AI-written copy.',
  examples: [
    {
      title: 'Fitness creator with stats',
      inputs: { niche: 'fitness', audienceSize: '250K across Instagram and TikTok' },
      note: '8-slide outline with your niche and audience injected.',
    },
    {
      title: 'Skincare creator, no stats yet',
      inputs: { niche: 'skincare' },
      note: 'Placeholders kept for every stat you have not measured.',
    },
  ],
  faqs: [
    {
      question: 'What is the best creator pitch deck template?',
      answer:
        'The best pitch deck outline has 8 slides: cover, about, audience, content, past work, packages, why-you, and contact. This free generator produces that exact outline, personalized with your niche and audience size.',
    },
    {
      question: 'Is there a free creator pitch deck template?',
      answer:
        'Yes — this outline generator is free. Enter your niche and optional audience size and get the full 8-slide outline instantly, no sign-up needed.',
    },
    {
      question: 'How to use creator pitch deck?',
      answer:
        'Generate the outline, replace every [bracketed] placeholder with your real numbers and links, then paste it into your slide tool and design it in your brand style.',
    },
    {
      question: 'How does a creator pitch deck template work?',
      answer:
        'It fills a fixed 8-section template with your niche and audience size. All stats, rates, and results stay as placeholders — you fill them with real data from your analytics.',
    },
    {
      question: 'What is a creator pitch deck template?',
      answer:
        'A creator pitch deck template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This is a fixed template outline, not AI-written copy.',
    'The tool never invents stats, rates, or results — every placeholder must be filled with your real numbers.',
    'A convincing deck still needs your real analytics screenshots.',
  ],
  jsonLd: [],
};
