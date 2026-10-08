import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-trend-adapter/';

const DESCRIPTION =
  'Adapt any trend to your niche with this free viral tiktok trends for my niche tool. Paste a trend name and type for niche-mapped video ideas. Try it now!';

export const inputs: ToolInput[] = [
  {
    id: 'trendName',
    label: 'Trend name or sound (paste it in)',
    type: 'text',
    required: true,
    placeholder: 'e.g. "demure" trend, a trending sound name — paste it, never ask what\'s trending',
    validation: { max: 120 },
  },
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. meal prep, real estate, fitness coaching',
    validation: { max: 80 },
  },
  {
    id: 'trendType',
    label: 'Trend type',
    type: 'select',
    required: true,
    options: ['sound', 'dance', 'meme', 'format'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'concepts',
    label: 'Niche-adapted video concepts',
    type: 'list',
    description: '4 video concepts that map your pasted trend onto your niche.',
  },
  {
    id: 'hooks',
    label: 'Opening hooks',
    type: 'list',
    description: '3 first-3-second hooks for the adapted videos.',
  },
  {
    id: 'shootingTips',
    label: 'Shooting tips',
    type: 'list',
    description: '3 practical filming tips for this trend type.',
  },
  {
    id: 'disclaimer',
    label: 'Honesty note',
    type: 'text',
    description: 'Reminder that the trend was pasted by you, not detected live.',
  },
];

export const content: ToolContent = {
  title: 'Viral TikTok Trends for My Niche 2026 | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Find a real trend yourself: open TikTok Discover or the TikTok Creative Center and copy a trend name or sound.',
    'Paste that trend into the "Trend name or sound" field — the tool never invents trending topics.',
    'Type your niche (e.g. meal prep) so every concept is mapped to your audience.',
    'Pick the trend type: sound, dance, meme, or format — each gets its own adaptation playbook.',
    'Run the tool and film one of the 4 niche-mapped concepts within 48 hours while the trend is fresh.',
  ],
  methodology:
    'The tool takes the trend name YOU paste in and maps it to your niche with fixed word banks — 32 concept templates (8 per trend type), 12 opening hooks, and 24 shooting tips — selected by a deterministic rotation seeded from your inputs. There is no live TikTok lookup, no AI, and no "trending now" detection.',
  examples: [
    {
      title: 'Meme trend for meal prep',
      inputs: { trendName: 'the demure trend', niche: 'meal prep', trendType: 'meme' },
      note: '4 meme concepts rewritten around meal-prep pain points, plus hooks and shooting tips.',
    },
    {
      title: 'Trending sound for fitness coaching',
      inputs: { trendName: 'original sound - sped up nightcall', niche: 'fitness coaching', trendType: 'sound' },
      note: 'Sound-specific concepts like before/after reveals timed to the audio drop.',
    },
  ],
  faqs: [
    {
      question: 'What is the best viral tiktok trends for my niche?',
      answer:
        'The best approach is manual: check TikTok Discover or the TikTok Creative Center for what is actually trending in your region, then paste a trend name into this free tool. It maps that real trend onto your niche with 4 adapted video concepts, 3 hooks, and shooting tips.',
    },
    {
      question: 'Is there a free viral tiktok trends for my niche?',
      answer:
        'Yes — this TikTok trend adapter is completely free with no signup. Paste any trend name or sound, pick its type, and get niche-mapped concepts instantly. It adapts trends you supply; it cannot detect live trends for you.',
    },
    {
      question: 'How to use viral tiktok trends for my niche?',
      answer:
        'Spot a trend in TikTok Discover, paste its name into the tool, choose whether it is a sound, dance, meme, or format, and enter your niche. You get 4 adapted concepts — film the strongest one within 48 hours, since trends decay fast.',
    },
    {
      question: 'How does the viral tiktok trends for my niche work?',
      answer:
        'Enter your details using the inputs above and the viral tiktok trends for my niche calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the viral tiktok trends for my niche free to use?',
      answer:
        'Yes - this viral tiktok trends for my niche is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a viral tiktok trends for my niche?',
      answer:
        'A viral tiktok trends for my niche is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the viral tiktok trends for my niche?',
      answer:
        'No account needed. Open the viral tiktok trends for my niche, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'This tool cannot read live TikTok trend data — it only adapts trends you paste in and never claims a trend is currently popular.',
    'Typing a question like "what\'s trending now" is refused on purpose; check TikTok Discover or the Creative Center for real trend data.',
    'Concepts are assembled from fixed template banks (32 concepts, 12 hooks, 24 tips), not written by AI.',
    'Trend timing matters more than the concept: the same adaptation filmed a week late usually flops.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Viral TikTok Trends for My Niche 2026 | HusnainBlogger',
      url: TOOL_URL,
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
          name: 'TikTok Trend Adapter',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
