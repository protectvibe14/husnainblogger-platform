import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your TikTok niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. skincare, fitness, personal finance',
    validation: { max: 48 },
  },
  {
    id: 'currentBio',
    label: 'Current bio (optional)',
    type: 'text',
    required: false,
    placeholder: 'Paste your current TikTok bio to get a review',
    validation: { max: 160 },
  },
  {
    id: 'handle',
    label: 'TikTok handle (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. glowwithsam (no @ needed)',
    validation: { max: 64 },
  },
  {
    id: 'followerCount',
    label: 'Follower count (optional)',
    type: 'select',
    required: false,
    options: ['under-1000', '1000-plus'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'bioOptions', label: 'Bio options (≤80 characters)', type: 'list' },
  { id: 'nameFieldSuggestions', label: 'Name-field keyword suggestions', type: 'list' },
  { id: 'profileChecklist', label: 'Profile optimization checklist', type: 'list' },
  { id: 'linkSuggestions', label: 'Link-in-bio suggestions', type: 'list' },
];

export const content: ToolContent = {
  title: 'Optimize TikTok Profile 2026 – Free Tool | HusnainBlogger',
  description:
    'Free optimize tiktok profile 2026: build an optimized TikTok profile from templates: 80-character bio options, name-field. Fast, private, no signup - try it!',
  howTo: [
    'Enter your niche (e.g. skincare) — every bio and suggestion is built around it.',
    'Optionally paste your currentBio to get a length review against the 80-character cap.',
    'Optionally add your handle and followerCount to unlock handle guidance and 1,000-follower feature notes.',
    'Generate to get 3 bio options (each ≤80 characters), 3 name-field keyword lines, a profile checklist, and link-in-bio suggestions.',
    'Apply the checklist changes, then watch TikTok Analytics for a few weeks to see what actually moves followers.',
  ],
  methodology:
    'The tool picks 3 bio templates and 3 name-field patterns from fixed banks (12 bio templates, 6 name patterns, 12 checklist items, 6 CTA lines, 6 link suggestions) using a deterministic hash of your niche, fills the [NICHE]/[HANDLE] slots, and trims any bio over the 80-character platform cap. A fixed checklist is returned with conditional notes for your follower count and handle length. No AI is used and the tool cannot read your TikTok account.',
  examples: [
    {
      title: 'Skincare creator',
      inputs: { niche: 'skincare', currentBio: 'i post about skin', handle: 'glowwithsam', followerCount: 'under-1000' },
      note: 'Gets 3 bio options under 80 characters, name-field lines with the handle, a checklist with a LIVE/link limitation note, and link suggestions.',
    },
    {
      title: 'Fitness coach, 1,000+ followers',
      inputs: { niche: 'home workouts', followerCount: '1000-plus' },
      note: 'Gets bio options plus a note to use TikTok’s full link-in-bio feature.',
    },
  ],
  faqs: [
    {
      question: 'What is the best way to optimize a TikTok profile?',
      answer:
        'A strong profile has a clear photo, a niche keyword in the name field, a bio of 80 characters or fewer with a CTA, 3 pinned best videos, and one clear link. This tool generates those elements from fixed templates — then you measure real follower growth in TikTok Analytics.',
    },
    {
      question: 'Is there a free TikTok profile optimizer?',
      answer:
        'Yes — this tool is free and runs entirely in your browser. It produces bio options, name-field keyword ideas, a checklist, and link suggestions with no signup.',
    },
    {
      question: 'How do I use the profile optimizer?',
      answer:
        'Enter your niche, optionally add your current bio and handle, and generate. Pick one bio option, apply the checklist items, and track follower changes in TikTok Analytics over a few weeks — the tool itself cannot verify what improves your profile.',
    },
    {
      question: 'How does the optimize tiktok profile work?',
      answer:
        'Enter your details using the inputs above and the optimize tiktok profile calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the optimize tiktok profile free to use?',
      answer:
        'Yes - this optimize tiktok profile is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an optimize tiktok profile?',
      answer:
        'An optimize tiktok profile is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the optimize tiktok profile?',
      answer:
        'No account needed. Open the optimize tiktok profile, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Template-based, not AI: suggestions come from fixed word banks and cannot verify what will improve your profile.',
    'The 80-character bio cap is a TikTok platform rule; the ≤24-character handle note is guidance from a single third-party source, labeled as such.',
    'Notes about LIVE access and full link-in-bio features reflect TikTok’s published 1,000-follower rule and may change.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Optimize TikTok Profile 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/tiktok/tiktok-profile-optimizer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free optimize tiktok profile 2026: build an optimized TikTok profile from templates: 80-character bio options, name-field. Fast, private, no signup - try it!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        { '@type': 'ListItem', position: 3, name: 'TikTok Tools', item: 'https://husnainblogger.com/tools/tiktok/' },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Profile Optimizer',
          item: 'https://husnainblogger.com/tools/tiktok/tiktok-profile-optimizer/',
        },
      ],
    },
  ],
};
