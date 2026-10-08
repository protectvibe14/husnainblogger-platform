import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. sourdough baking, home workouts, skincare',
    validation: { max: 100 },
  },
  {
    id: 'duetType',
    label: 'Duet type',
    type: 'select',
    required: true,
    options: ['react', 'reply', 'collab', 'challenge'],
  },
  {
    id: 'hasPartner',
    label: 'Do you already have a duet partner?',
    type: 'select',
    required: true,
    options: ['yes', 'no'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'duetIdeas', label: 'Duet video concept ideas', type: 'list' },
  { id: 'partnerGuidance', label: 'Partner guidance', type: 'text' },
];

const DESCRIPTION =
  'Generate free TikTok duet ideas for your niche — react, reply, collab, or challenge concepts with setup steps. No TikTok login needed. Try it now.';

export const content: ToolContent = {
  title: 'TikTok Duet Ideas Generator 2026 – Free | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Type your niche into the "Your niche" box — for example "sourdough baking".',
    'Pick a duet type: react (comment on a video), reply (answer a video), collab (coordinate with a partner), or challenge (start a duet chain).',
    'Answer whether you already have a duet partner — if you do not, you get guidance for dueting public videos.',
    'Run the generator to get 5 concept ideas, each with setup instructions, a hook tip, and a closing CTA.',
    'Take your favorite idea into the TikTok app and film the duet — this tool gives you the plan, TikTok does the filming.',
  ],
  methodology:
    'Each run draws from fixed template banks (4 duet types with 6 idea templates each, 8 hook lines, 6 CTA lines) using a deterministic hash of your niche and duet type, so identical inputs always return the same 5 ideas. There is no AI and no access to TikTok data — everything is assembled in your browser from these fixed, documented banks.',
  examples: [
    {
      title: 'Baking react duet',
      inputs: { niche: 'sourdough baking', duetType: 'react', hasPartner: 'no' },
      note: '5 reaction concepts tailored to baking, plus guidance for dueting public videos without a partner.',
    },
    {
      title: 'Fitness challenge duet',
      inputs: { niche: 'home workouts', duetType: 'challenge', hasPartner: 'yes' },
      note: '5 challenge concepts with partner-coordination tips for launching on two accounts at once.',
    },
    {
      title: 'Skincare collab duet',
      inputs: { niche: 'skincare', duetType: 'collab', hasPartner: 'yes' },
      note: '5 coordinated collab concepts, including side-by-side tutorials and versus formats.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok duet ideas?',
      answer:
        'The best duet ideas match your niche and a format viewers already recognize: reactions to viral claims, respectful replies to hot opinions, coordinated collabs with a partner, or challenges that invite followers to duet you back. This free tool generates 5 tailored concepts per run with setup steps and hooks.',
    },
    {
      question: 'Is there a free tiktok duet ideas?',
      answer:
        'Yes — this duet idea generator is completely free with no signup. It builds ideas from fixed templates in your browser, so there is no usage limit and no account needed.',
    },
    {
      question: 'How to use tiktok duet?',
      answer:
        'In the TikTok app, open a video whose creator allows duets, tap the Share arrow, then tap Duet. Film your side of the screen and post. If a video has duets disabled, the Duet button will not appear — this tool cannot enable duets on other people\'s videos.',
    },
    {
      question: 'How does a tiktok duet ideas work?',
      answer:
        'This tool takes your niche and chosen duet type (react, reply, collab, or challenge) and assembles 5 concept ideas from fixed template banks, each with setup instructions, a hook tip, and a call to action. It does not connect to TikTok — you still film and post the duet in the TikTok app.',
    },
    {
      question: 'How does the tiktok duet ideas work?',
      answer:
        'Enter your details using the inputs above and the tiktok duet ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok duet ideas free to use?',
      answer:
        'Yes - this tiktok duet ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok duet ideas?',
      answer:
        'A tiktok duet ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Ideas come from fixed template banks (4 duet types × 6 templates, 8 hooks, 6 CTAs) — they are starting points, not AI-generated or personalized to your audience.',
    'This tool has no access to TikTok: it cannot find videos to duet, check whether duets are enabled on a video, or name trending creators.',
    'The "no partner" guidance never names real creators; you still need the TikTok app to find and film duets.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Duet Ideas Generator 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/tiktok/tiktok-duet-idea-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'TikTok Tools',
          item: 'https://husnainblogger.com/tools/tiktok/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Duet Ideas Generator',
          item: 'https://husnainblogger.com/tools/tiktok/tiktok-duet-idea-generator/',
        },
      ],
    },
  ],
};
