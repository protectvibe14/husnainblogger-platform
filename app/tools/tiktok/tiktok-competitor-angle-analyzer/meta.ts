import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'pastedCompetitorPost',
    label: 'Competitor post text (paste caption or transcript)',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the full caption or transcript of a competitor’s TikTok post here (min 30 characters). This tool cannot fetch accounts — no @handles or links.',
    validation: { min: 30, max: 5000 },
  },
  {
    id: 'niche',
    label: 'Your niche (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. skincare',
    validation: { max: 48 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'hookType', label: 'Detected hook type', type: 'text' },
  { id: 'contentAngle', label: 'Detected content angle', type: 'text' },
  { id: 'ctaDetected', label: 'CTA detection', type: 'text' },
  { id: 'gaps', label: 'Gaps and opportunities', type: 'list' },
];

export const content: ToolContent = {
  title: 'TikTok Competitor Analysis 2026 – Free | HusnainBlogger',
  description:
    'Run a free TikTok competitor analysis on pasted captions: detect the hook type, content angle, and CTA, then get 6 gap ideas. Paste text only — try it now.',
  howTo: [
    'Copy a competitor’s TikTok caption or transcript and paste it into pastedCompetitorPost (minimum 30 characters).',
    'Do not paste @handles or video links — this tool cannot look up TikTok accounts or fetch posts.',
    'Optionally enter your niche so the gap ideas are written for your audience.',
    'Generate to get the detected hook type (from a fixed 10-type taxonomy), content angle (from 6 angles), CTA detection, and 6 gap ideas.',
    'Pick one gap idea and make your version of the topic in a different angle or format.',
  ],
  methodology:
    'The tool counts keyword signals from fixed taxonomies (10 hook types, 6 content angles, 10 CTA keywords) in your pasted text; the highest-scoring type wins, with ties resolved by fixed taxonomy order. Six gaps are assembled from a fixed bank of 12 opportunity prompts, favoring the two weakest-scoring angles and whether a CTA was found. No AI is used and no TikTok data is fetched — everything comes from the text you paste.',
  examples: [
    {
      title: 'Editing tutorial competitor',
      inputs: {
        pastedCompetitorPost:
          'How to edit your TikTok videos step by step. In this tutorial I will show you exactly how to cut clips and add captions. Follow along with this beginner guide and let me show you each step.',
        niche: 'video editing',
      },
      note: 'Detects a Tutorial Hook with an Educational angle, flags any CTA keywords, and returns 6 gap ideas such as underserved angles and proof moments.',
    },
    {
      title: 'Storytime competitor',
      inputs: {
        pastedCompetitorPost:
          'Storytime: last year when I started my business, my boss told me I would fail. True story — here is what happened when I launched anyway. Comment if you have been through this too.',
      },
      note: 'Detects a Story Opening hook, an Inspirational angle, and the comment CTA.',
    },
  ],
  faqs: [
    {
      question: 'What is the best TikTok competitor analysis?',
      answer:
        'The best analysis breaks a competitor’s post into hook type, content angle, CTA, and the gaps they leave — then you fill a gap. This tool does that from pasted captions using fixed taxonomies: 10 hook types, 6 content angles, and 10 CTA keywords.',
    },
    {
      question: 'Is there a free TikTok competitor analysis?',
      answer:
        'Yes — this tool is free and runs entirely in your browser. Paste a competitor’s caption or transcript and get the angle breakdown plus 6 gap ideas with no signup.',
    },
    {
      question: 'How do I use the competitor analyzer?',
      answer:
        'Paste the competitor’s caption or transcript text (not their @handle — the tool cannot fetch accounts), optionally add your niche, and generate. Use one of the 6 gap ideas to make a differentiated version of the same topic.',
    },
    {
      question: 'How does the tiktok competitor analysis work?',
      answer:
        'Enter your details using the inputs above and the tiktok competitor analysis calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok competitor analysis free to use?',
      answer:
        'Yes - this tiktok competitor analysis is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok competitor analysis?',
      answer:
        'A tiktok competitor analysis is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok competitor analysis?',
      answer:
        'No account needed. Open the tiktok competitor analysis, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Manual paste only: the tool cannot look up TikTok accounts, fetch posts, or see real competitor data — analysis is limited to what you paste.',
    'Hook and angle detection is keyword-based scoring, not AI understanding; ambiguous captions may be classified into the closest fixed type.',
    'Gap ideas are fixed opportunity prompts, not personalized strategy; verify them against your own niche.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Competitor Analysis 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/tiktok/tiktok-competitor-angle-analyzer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Run a free TikTok competitor analysis on pasted captions: detect the hook type, content angle, and CTA, then get 6 gap ideas. Paste text only — try it now.',
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
          name: 'TikTok Competitor Angle Analyzer',
          item: 'https://husnainblogger.com/tools/tiktok/tiktok-competitor-angle-analyzer/',
        },
      ],
    },
  ],
};
