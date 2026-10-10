import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. vegan baking, gym workouts, travel',
    validation: { max: 60 },
  },
  {
    id: 'captionTopic',
    label: 'Caption topic (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. overnight oats — used when you leave your caption blank',
    validation: { max: 120 },
  },
  {
    id: 'baseCaption',
    label: 'Your caption (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'Paste your own caption here — the mixes are appended below it',
    validation: { max: 2000 },
  },
  {
    id: 'trendingHashtags',
    label: 'Trending hashtags you found (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'Paste hashtags you spotted trending, e.g. #summerdrop — only these are used',
    validation: { max: 500 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'nicheMix', label: 'Niche hashtag mix', type: 'list' },
  { id: 'broadMix', label: 'Broad hashtag mix', type: 'list' },
  { id: 'communityMix', label: 'Community hashtag mix', type: 'list' },
  { id: 'trendingPicks', label: 'Your trending picks', type: 'list' },
  { id: 'combinedCaption', label: 'Combined caption (within 2,200 chars)', type: 'copy' },
  { id: 'charCount', label: 'Total characters', type: 'number' },
];

const DESCRIPTION =
  'Build a TikTok caption hashtag mixer for any niche — niche, broad, and community mixes sized to fit the 2,200-character limit. Free. Mix your caption now.';

export const content: ToolContent = {
  title: 'TikTok Caption Hashtag Mixer',
  description: DESCRIPTION,
  howTo: [
    'Type your niche — for example "vegan baking" — and the tool picks a matching hashtag bank (12 categories, plus a generic fallback).',
    'Optional: add a caption topic and the tool drafts a caption hook for you, or paste your own caption instead.',
    'Optional: paste trending hashtags you spotted yourself — only these pasted tags are ever used as "trending"; the tool never invents them.',
    'Run the mixer to get three organized mixes (niche, broad, community) plus a combined caption kept inside the 2,200-character limit.',
    'Copy the combined caption into TikTok, then double-check each hashtag in the app — the tool cannot verify live popularity or banned status.',
  ],
  methodology:
    'The mixer matches your niche against 12 fixed hashtag categories (10 tags each) by keyword, falls back to a generic bank for unmatched niches, and deterministically rotates each bank by a hash of your niche to produce a 6-tag niche mix, a 4-tag broad mix, and a 4-tag community mix. Pasted trending tags are kept verbatim (capped at 10, deduped) and never invented. The combined caption is kept inside the 2,200-character envelope: broad, community, then niche tags are trimmed first while your pasted trending tags are always kept. There is no AI and no TikTok access — hashtag popularity and banned status cannot be checked by this tool.',
  examples: [
    {
      title: 'Vegan baking caption mix',
      inputs: { niche: 'vegan baking', captionTopic: 'overnight oats' },
      note: 'Drafted hook about overnight oats plus 6 food-niche, 4 broad, and 4 community hashtags.',
    },
    {
      title: 'Fitness caption with your own words',
      inputs: { niche: 'gym workouts', baseCaption: 'Leg day done. See you tomorrow.' },
      note: 'Your caption kept verbatim, fitness hashtag mixes appended within the 2,200-char limit.',
    },
    {
      title: 'Travel mix with trending picks',
      inputs: { niche: 'travel', trendingHashtags: '#summerdrop #mytravelgoal' },
      note: 'Your two pasted trending tags used exactly as pasted — the tool invents no others.',
    },
  ],
  faqs: [
    {
      question: 'what is the best tiktok caption hashtag mixer?',
      answer:
        'The best mixer organizes hashtags by job: niche tags to reach your audience, broad tags for discovery, and community tags to join conversations — all sized to fit TikTok\'s 2,200-character caption limit. This free mixer builds exactly those three mixes from fixed hashtag banks, plus a combined caption you can copy straight into TikTok.',
    },
    {
      question: 'is there a free tiktok caption hashtag mixer?',
      answer:
        'Yes — this caption hashtag mixer is completely free with no signup. It assembles the mixes from bundled word banks in your browser, so there is no usage limit.',
    },
    {
      question: 'how to use tiktok caption hashtag ideas?',
      answer:
        'Enter your niche, optionally add a caption topic or paste your own caption, and optionally paste trending hashtags you found yourself. The tool outputs niche, broad, and community mixes plus a combined caption. Always re-check hashtags in the TikTok app before posting — this tool cannot verify live popularity or banned status.',
    },
    {
      question: 'how does a tiktok caption hashtag mixer work?',
      answer:
        'Type your niche and the tool deterministically picks 6 niche hashtags, 4 broad ones, and 4 community ones from fixed banks, uses any trending tags you pasted (never invented ones), and merges everything with your caption into a combined caption kept inside the 2,200-character limit. Same inputs always produce the same mixes.',
    },
    {
      question: 'How does the tiktok caption hashtag mixer work?',
      answer:
        'Enter your details using the inputs above and the tiktok caption hashtag mixer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok caption hashtag mixer free to use?',
      answer:
        'Yes - this tiktok caption hashtag mixer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok caption hashtag mixer?',
      answer:
        'A tiktok caption hashtag mixer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Hashtags come from fixed bundled banks — the tool cannot check live hashtag popularity, reach, or banned status on TikTok; verify in the TikTok app.',
    'Trending hashtags are used only from your pasted list; the tool never invents or predicts trending tags.',
    'No reach, view, or virality claims are made — the mixes are organizational suggestions only.',
    'The 2,200-character envelope is a conservative caption limit; hashtags are trimmed automatically when a long caption would exceed it.',
  ],
  jsonLd: [],
};
